import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { requireEnv } from "@/lib/errors";
import { saveYouTubeConnection, youtubeOAuth, youtubeScope, youtubeStateCookie, youtubeReturnPath } from "@/lib/youtube-account";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let returnPath = "/session/new";
  let connected = false;
  try {
    const jar = await cookies();
    const raw = jar.get(youtubeStateCookie)?.value;
    jar.delete(youtubeStateCookie);
    const state = z.object({ state: z.string(), verifier: z.string(), userId: z.string(), returnPath: z.string() })
      .parse(await decode({ token: raw, secret: requireEnv("NEXTAUTH_SECRET") }));
    const user = await currentUser();
    if (!user || user.id !== state.userId || state.state !== url.searchParams.get("state")) throw new Error("Invalid state");
    returnPath = youtubeReturnPath(state.returnPath);
    const code = url.searchParams.get("code");
    if (!code || url.searchParams.has("error")) throw new Error("Permission declined");
    const client = youtubeOAuth(url.origin);
    const { tokens } = await client.getToken({ code, codeVerifier: state.verifier });
    if (!tokens.access_token || !tokens.id_token) throw new Error("Missing token");
    const identity = (await client.verifyIdToken({ idToken: tokens.id_token, audience: requireEnv("GOOGLE_CLIENT_ID") })).getPayload();
    const info = await client.getTokenInfo(tokens.access_token);
    if (identity?.sub !== user.googleId || !info.scopes.includes(youtubeScope)) throw new Error("Wrong account or scope");
    await saveYouTubeConnection({ userId: user.id, accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || undefined, expiresAt: tokens.expiry_date || info.expiry_date }, url.protocol === "https:");
    connected = true;
  } catch { /* Declined, expired and failed connections preserve the playlist-link alternative. */ }
  const destination = new URL(returnPath, url.origin);
  destination.searchParams.set("youtube", connected ? "connected" : "failed");
  return NextResponse.redirect(destination);
}
