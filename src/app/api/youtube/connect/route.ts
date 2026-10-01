import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { apiError, AppError, readBody, requireEnv } from "@/lib/errors";
import { saveYouTubeConnection, youtubeCookie, youtubeOAuth, youtubeScope, youtubeStateCookie, youtubeReturnPath } from "@/lib/youtube-account";

const inputSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("begin"), returnPath: z.string().max(300) }),
  z.object({ action: z.literal("native"), accessToken: z.string().min(20).max(4096) }),
  z.object({ action: z.literal("disconnect") }),
]);
export async function POST(request: Request) {
  try {
    const input = inputSchema.parse(await readBody(request));
    const user = await requireUser();
    const origin = new URL(request.url).origin;
    const secure = origin.startsWith("https:");
    if (input.action === "disconnect") {
      (await cookies()).delete(youtubeCookie);
      return NextResponse.json({ ok: true });
    }
    if (input.action === "native") {
      const client = youtubeOAuth(origin);
      const info = await client.getTokenInfo(input.accessToken);
      if (info.aud !== requireEnv("GOOGLE_CLIENT_ID") || info.sub !== user.googleId || !info.scopes.includes(youtubeScope)) {
        throw new AppError("Connect YouTube using the same Google account you signed in with.", 403);
      }
      await saveYouTubeConnection({ userId: user.id, accessToken: input.accessToken, expiresAt: info.expiry_date }, secure);
      return NextResponse.json({ ok: true });
    }
    const returnPath = youtubeReturnPath(input.returnPath);
    const state = randomBytes(32).toString("base64url");
    const verifier = randomBytes(32).toString("base64url");
    const { createHash } = await import("node:crypto");
    const value = await encode({ secret: requireEnv("NEXTAUTH_SECRET"), maxAge: 600,
      token: { state, verifier, userId: user.id, returnPath } });
    (await cookies()).set(youtubeStateCookie, value, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 600 });
    const url = youtubeOAuth(origin).generateAuthUrl({ scope: ["openid", "email", youtubeScope], state,
      access_type: "offline", prompt: "consent select_account", login_hint: user.googleId,
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      code_challenge_method: "S256" as import("google-auth-library").CodeChallengeMethod,
    });
    return NextResponse.json({ url });
  } catch (error) { return apiError(error); }
}
