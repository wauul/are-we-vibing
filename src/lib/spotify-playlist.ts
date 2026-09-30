import { z } from "zod";
import { AppError } from "./errors";

export const SPOTIFY_TRACK_LIMIT = 20;
const MAX_EMBED_BYTES = 2 * 1024 * 1024;
const unavailable = "We could not read this Spotify playlist. Make sure it is public, or use My picks instead.";

const embedSchema = z.object({
  props: z.object({
    pageProps: z.object({
      state: z.object({
        data: z.object({
          entity: z.object({
            id: z.string(),
            type: z.literal("playlist"),
            trackList: z.array(z.unknown()),
          }),
        }),
      }),
    }),
  }),
});
const trackSchema = z.object({
  uri: z.string().regex(/^spotify:track:[A-Za-z0-9]{22}$/),
  title: z.string().trim().min(1),
  subtitle: z.string().trim().min(1),
});

/** Read only the embed's structured playlist payload; never execute page scripts. */
export function parseSpotifyEmbed(html: string, expectedId: string): string[] {
  const scripts = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi);
  let payload: unknown;
  for (const [, attributes, body] of scripts) {
    if (!/(?:^|\s)id\s*=\s*(["'])__NEXT_DATA__\1/i.test(attributes)) continue;
    try {
      payload = JSON.parse(body);
    } catch {
      throw new AppError(unavailable, 422);
    }
    break;
  }
  const parsed = embedSchema.safeParse(payload);
  if (!parsed.success || parsed.data.props.pageProps.state.data.entity.id !== expectedId) {
    throw new AppError(unavailable, 422);
  }
  const seen = new Set<string>();
  const labels = new Set<string>();
  const tracks: string[] = [];
  for (const item of parsed.data.props.pageProps.state.data.entity.trackList) {
    const track = trackSchema.safeParse(item);
    if (!track.success || seen.has(track.data.uri)) continue;
    seen.add(track.data.uri);
    const label = `${track.data.subtitle} — ${track.data.title}`.slice(0, 250);
    if (labels.has(label)) continue;
    labels.add(label);
    tracks.push(label);
    if (tracks.length === SPOTIFY_TRACK_LIMIT) break;
  }
  if (!tracks.length) throw new AppError(unavailable, 422);
  return tracks;
}

/** Anonymous, bounded public embed lookup. No account cookies, tokens or API key. */
export async function readSpotifyPlaylist(id: string): Promise<string[]> {
  if (!/^[A-Za-z0-9]{22}$/.test(id)) throw new AppError(unavailable, 422);
  try {
    const response = await fetch(`https://open.spotify.com/embed/playlist/${id}`, {
      headers: { Accept: "text/html" },
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (response.status === 429) {
      throw new AppError("Spotify is busy. Wait a minute and try again, or use My picks.", 422);
    }
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
      throw new AppError(unavailable, 422);
    }
    if (Number(response.headers.get("content-length")) > MAX_EMBED_BYTES || !response.body) {
      await response.body?.cancel();
      throw new AppError(unavailable, 422);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_EMBED_BYTES) {
          await reader.cancel();
          throw new AppError(unavailable, 422);
        }
        html += decoder.decode(value, { stream: true });
      }
      html += decoder.decode();
    } finally {
      reader.releaseLock();
    }
    return parseSpotifyEmbed(html, id);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(unavailable, 422);
  }
}
