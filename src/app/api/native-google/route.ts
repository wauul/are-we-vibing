import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, AppError, readBody, requireEnv } from "@/lib/errors";

const google = new OAuth2Client();
export const maxDuration = 30;
export async function POST(request: Request) {
  try {
    const input = z.discriminatedUnion("action", [
      z.object({ action: z.literal("begin") }),
      z.object({ action: z.literal("finish"), id: z.string().uuid(), idToken: z.string().min(100).max(10000) }),
    ]).parse(await readBody(request));
    const clientId = requireEnv("GOOGLE_CLIENT_ID");
    const now = new Date();
    if (input.action === "begin") {
      await db.nativeLogin.deleteMany({ where: { expiresAt: { lt: now } } });
      const nonce = randomBytes(32).toString("base64url");
      const challenge = await db.nativeLogin.create({ data: { challenge: nonce, expiresAt: new Date(Date.now() + 5 * 60000) } });
      return NextResponse.json({ id: challenge.id, nonce, clientId }, { headers: { "Cache-Control": "no-store" } });
    }
    // Google verifies signature, issuer, audience and expiry. Never trust a client-decoded profile.
    let payload;
    try { payload = (await google.verifyIdToken({ idToken: input.idToken, audience: clientId })).getPayload(); }
    catch { throw new AppError("Google could not verify this sign-in. Please try again.", 401); }
    if (!payload?.sub || payload.email_verified !== true) throw new AppError("A verified Google account is required.", 401);
    const nonce = (payload as typeof payload & { nonce?: string }).nonce;
    if (!nonce) throw new AppError("This sign-in is missing its security check. Try again.", 401);
    const identity = payload;
    const secret = requireEnv("NEXTAUTH_SECRET");
    const user = await db.$transaction(async tx => {
      // The ID token is bound to one short-lived attempt and cannot be replayed.
      const consumed = await tx.nativeLogin.updateMany({ where: { id: input.id, challenge: nonce, consumedAt: null, expiresAt: { gt: now } }, data: { consumedAt: now } });
      if (!consumed.count) throw new AppError("This sign-in expired or was already used. Try again.", 403);
      const account = await tx.user.upsert({ where: { googleId: identity.sub }, update: {}, create: { googleId: identity.sub, name: (identity.name || "Music lover").slice(0, 40), username: `dj_${randomBytes(6).toString("hex")}` } });
      await tx.nativeLogin.update({ where: { id: input.id }, data: { userId: account.id } });
      return account;
    });
    const token = await encode({ secret, token: { userId: user.id, name: user.name, sub: user.id }, maxAge: 7 * 86400 });
    const response = NextResponse.json({ ok: true });
    const secure = new URL(request.url).protocol === "https:";
    response.cookies.set(secure ? "__Secure-next-auth.session-token" : "next-auth.session-token", token, { secure, httpOnly: true, sameSite: "lax", path: "/", maxAge: 7 * 86400 });
    return response;
  } catch (error) { return apiError(error); }
}
