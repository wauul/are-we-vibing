import { z } from "zod";
import type { InputType } from "./schema";
import { AppError, requireEnv } from "./errors";
let token: { value: string; expires: number } | undefined;
export function playlistId(type: "SPOTIFY" | "YOUTUBE", value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AppError("Paste the full playlist link, including https://.");
  }
  if (url.protocol !== "https:")
    throw new AppError("Use an https playlist link.");
  if (type === "SPOTIFY" && url.hostname === "open.spotify.com") {
    const id = url.pathname.match(
      /^\/(?:intl-[a-z]+\/)?playlist\/([A-Za-z0-9]{22})\/?$/,
    )?.[1];
    if (id) return id;
  }
  if (
    type === "YOUTUBE" &&
    [
      "youtube.com",
      "www.youtube.com",
      "music.youtube.com",
      "m.youtube.com",
      "youtu.be",
    ].includes(url.hostname)
  ) {
    const id = url.searchParams.get("list");
    if (id && /^[\w-]{10,100}$/.test(id)) return id;
  }
  throw new AppError(
    "That link is not a playlist. Grab its share link and try again.",
  );
}
async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok)
    throw new AppError(
      response.status === 429
        ? "Too many records spinning. Give it a minute and retry."
        : "We could not read that playlist. It may be private, unavailable, or restricted by the provider. Try manual entry.",
      422,
    );
  return response.json();
}
/** All sources become plain strings. Provider hosts are fixed: pasted URLs are never fetched.
 * Spotify is capped at 100 tracks, YouTube at 20, and manual input at 15 to bound AI usage.
 * Spotify development-mode access may reject Client Credentials; never pretend it imported. */
export async function normalizeInput(
  type: InputType,
  value: string,
): Promise<string[]> {
  let tracks: string[];
  if (type === "MANUAL")
    tracks = value
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 15);
  else if (type === "YOUTUBE") {
    const id = playlistId(type, value);
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.search = new URLSearchParams({
      part: "snippet",
      playlistId: id,
      maxResults: "20",
      key: requireEnv("YOUTUBE_API_KEY"),
    }).toString();
    const data = z
      .object({
        items: z.array(z.object({ snippet: z.object({ title: z.string() }) })),
      })
      .parse(await requestJson(url.toString()));
    tracks = data.items
      .map((i) => i.snippet.title)
      .filter((t) => !["Private video", "Deleted video"].includes(t));
  } else {
    const id = playlistId(type, value);
    if (!token || token.expires < Date.now()) {
      const auth = Buffer.from(
        `${requireEnv("SPOTIFY_CLIENT_ID")}:${requireEnv("SPOTIFY_CLIENT_SECRET")}`,
      ).toString("base64");
      const data = z
        .object({ access_token: z.string(), expires_in: z.number() })
        .parse(
          await requestJson("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
          }),
        );
      token = {
        value: data.access_token,
        expires: Date.now() + (data.expires_in - 60) * 1000,
      };
    }
    const data = z
      .object({
        items: z.array(
          z.object({
            track: z
              .object({
                name: z.string(),
                artists: z.array(z.object({ name: z.string() })),
              })
              .nullable(),
          }),
        ),
      })
      .parse(
        await requestJson(
          `https://api.spotify.com/v1/playlists/${id}/tracks?limit=100`,
          { headers: { Authorization: `Bearer ${token.value}` } },
        ),
      );
    tracks = data.items.flatMap(({ track }) =>
      track
        ? [`${track.artists.map((a) => a.name).join(", ")} — ${track.name}`]
        : [],
    );
  }
  if (!tracks.length)
    throw new AppError(
      "This playlist is giving us silence. Add some songs and try again.",
    );
  return tracks.map((t) => t.slice(0, 250));
}
