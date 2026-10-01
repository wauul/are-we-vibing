import { cookies } from "next/headers";
import { decode, encode } from "next-auth/jwt";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { currentUser } from "./auth";
import { AppError, requireEnv } from "./errors";

export const youtubeScope = "https://www.googleapis.com/auth/youtube.readonly";
export const youtubeCookie = "vibing-youtube";
export const youtubeStateCookie = "vibing-youtube-state";
export function youtubeReturnPath(value: string): string {
  if (!value.startsWith("/session/")) throw new AppError("Open a session to connect YouTube.");
  const url = new URL(value, "https://app.invalid");
  if (url.origin !== "https://app.invalid" || !/^\/session\/(?:new|[\w-]+)$/.test(url.pathname)) throw new AppError("Open a session to connect YouTube.");
  const friend = url.searchParams.get("friend");
  return url.pathname + (url.pathname === "/session/new" && friend && /^[a-z0-9_]{3,24}$/.test(friend) ? `?friend=${friend}` : "");
}
const connectionSchema = z.object({ userId: z.string(), accessToken: z.string(), refreshToken: z.string().optional(), expiresAt: z.number() });
export type YouTubeConnection = z.infer<typeof connectionSchema>;
export function youtubeOAuth(origin: string) {
  return new OAuth2Client(requireEnv("GOOGLE_CLIENT_ID"), requireEnv("GOOGLE_CLIENT_SECRET"), `${origin}/api/youtube/callback`);
}
export async function saveYouTubeConnection(connection: YouTubeConnection, secure: boolean) {
  // Provider credentials are encrypted in an HttpOnly cookie, never in the client session.
  const value = await encode({ secret: requireEnv("NEXTAUTH_SECRET"), token: connection, maxAge: 7 * 86400 });
  (await cookies()).set(youtubeCookie, value, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 7 * 86400 });
}
export async function youTubeAccessToken(): Promise<string | null> {
  const user = await currentUser();
  if (!user) return null;
  const raw = (await cookies()).get(youtubeCookie)?.value;
  if (!raw) return null;
  let decoded;
  try { decoded = await decode({ token: raw, secret: requireEnv("NEXTAUTH_SECRET") }); } catch { return null; }
  const parsed = connectionSchema.safeParse(decoded);
  if (!parsed.success || parsed.data.userId !== user.id) return null;
  const connection = parsed.data;
  if (connection.expiresAt > Date.now() + 60000) return connection.accessToken;
  if (!connection.refreshToken) return null;
  try {
    const client = new OAuth2Client(requireEnv("GOOGLE_CLIENT_ID"), requireEnv("GOOGLE_CLIENT_SECRET"));
    client.setCredentials({ refresh_token: connection.refreshToken });
    const { token } = await client.getAccessToken();
    return token || null;
  } catch { return null; }
}
export const youtubePlaylistsSchema = z.object({
  nextPageToken: z.string().optional(),
  items: z.array(z.object({ id: z.string().regex(/^[\w-]{10,100}$/), snippet: z.object({ title: z.string() }),
    status: z.object({ privacyStatus: z.string() }).optional(), contentDetails: z.object({ itemCount: z.number() }) })),
});
export async function listYouTubePlaylists(accessToken: string, pageToken?: string) {
  const params = new URLSearchParams({ part: "snippet,contentDetails,status", mine: "true", maxResults: "50", ...(pageToken ? { pageToken } : {}) });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/playlists?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (response.status === 401) throw new AppError("Reconnect YouTube to see your playlists.", 401);
  if (!response.ok) throw new AppError("YouTube playlists are unavailable. Try again or paste a public playlist link.", 422);
  const data = youtubePlaylistsSchema.parse(await response.json());
  return { playlists: data.items.map(item => ({ id: item.id, title: item.snippet.title,
    count: item.contentDetails.itemCount, privacy: item.status?.privacyStatus || "public" })), nextPageToken: data.nextPageToken };
}
