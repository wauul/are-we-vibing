import { z } from "zod";
import type { InputType } from "./schema";
import { AppError, requireEnv } from "./errors";
import { readSpotifyPlaylist } from "./spotify-playlist";
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
      /^\/(?:intl-[a-z]+\/|embed\/)?playlist\/([A-Za-z0-9]{22})\/?$/,
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
        ? "The music provider is busy. Wait a minute and try again."
        : "We could not read that playlist. It may be private, unavailable, or restricted by the provider. Try manual entry.",
      422,
    );
  return response.json();
}
/** All sources become plain strings. Provider hosts are fixed: pasted URLs are never fetched.
 * Spotify and YouTube are capped at 20 tracks, manual input at 15 to bound AI usage. */
export async function normalizeInput(
  type: InputType,
  value: string,
  youtubeAccessToken?: string | null,
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
      ...(youtubeAccessToken ? {} : { key: requireEnv("YOUTUBE_API_KEY") }),
    }).toString();
    const data = z
      .object({
        items: z.array(z.object({ snippet: z.object({ title: z.string() }) })),
      })
      .parse(await requestJson(url.toString(), youtubeAccessToken ? { headers: { Authorization: `Bearer ${youtubeAccessToken}` } } : undefined));
    tracks = data.items
      .map((i) => i.snippet.title)
      .filter((t) => !["Private video", "Deleted video"].includes(t));
  } else {
    const id = playlistId(type, value);
    tracks = await readSpotifyPlaylist(id);
  }
  if (!tracks.length)
    throw new AppError(
      "No available songs were found. Try another playlist or enter your picks.",
    );
  return tracks.map((t) => t.slice(0, 250));
}
