import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiError, AppError, readBody, requireEnv } from "@/lib/errors";
import { createHash } from "node:crypto";
const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("begin"), challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }),
  z.object({ action: z.literal("approve"), id: z.string().uuid() }),
  z.object({ action: z.literal("exchange"), id: z.string().uuid(), verifier: z.string().regex(/^[a-f0-9]{64}$/) }),
]);
export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await readBody(request));
    const now = new Date();
    if (input.action === "begin") {
      await db.nativeLogin.deleteMany({ where: { expiresAt: { lt: now } } });
      const pending = await db.nativeLogin.create({ data: { challenge: input.challenge, expiresAt: new Date(Date.now() + 5 * 60000) } });
      return NextResponse.json({ id: pending.id });
    }
    if (input.action === "approve") {
      const user = await requireUser();
      const approved = await db.nativeLogin.updateMany({ where: { id: input.id, userId: null, consumedAt: null, expiresAt: { gt: now } }, data: { userId: user.id } });
      if (!approved.count) throw new AppError("This sign-in link expired or was already used. Start again in the app.", 409);
      return NextResponse.json({ url: `arewevibing://auth?loginId=${input.id}` });
    }
    const secret = requireEnv("NEXTAUTH_SECRET");
    const challenge = createHash("sha256").update(input.verifier).digest("base64url");
    // Atomically consume inside a transaction: knowing the URL cannot redeem the session.
    const user = await db.$transaction(async tx => {
      const pending = await tx.nativeLogin.findUnique({ where: { id: input.id } });
      if (!pending?.userId) throw new AppError("Complete Google sign-in first.", 401);
      const consumed = await tx.nativeLogin.updateMany({ where: { id: input.id, challenge, consumedAt: null, expiresAt: { gt: now } }, data: { consumedAt: now } });
      if (!consumed.count) throw new AppError("This sign-in link expired or was already used.", 403);
      return tx.user.findUniqueOrThrow({ where: { id: pending.userId } });
    });
    const token = await encode({ secret, token: { userId: user.id, name: user.name, sub: user.id }, maxAge: 7 * 86400 });
    const response = NextResponse.json({ ok: true });
    const secure = new URL(request.url).protocol === "https:";
    response.cookies.set(secure ? "__Secure-next-auth.session-token" : "next-auth.session-token", token, { secure, httpOnly: true, sameSite: "lax", path: "/", maxAge: 7 * 86400 });
    return response;
  } catch (error) { return apiError(error); }
}
