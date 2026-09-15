import { after, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { apiError, AppError, readBody } from "@/lib/errors";
import { creatorCookie, hasCreatorProof } from "@/lib/creator-proof";
import { notifyCreator, pushConfigured } from "@/lib/push";
export async function POST(request: Request) {
  try {
    const { sessionId, token } = z.object({ sessionId: z.string().uuid(), token: z.string().min(20).max(4096).nullable() }).parse(await readBody(request));
    const s = await db.session.findUnique({ where: { id: sessionId } });
    if (!s) throw new AppError("Session not found.", 404);
    const user = await currentUser();
    const proof = (await cookies()).get(creatorCookie(sessionId))?.value;
    // A public invite URL or localStorage creator flag is not authorization to overwrite a token.
    if (!(user && s.ownerId === user.id) && !hasCreatorProof(s.creatorSecretHash, proof))
      throw new AppError("Only the session creator can enable these notifications.", 403);
    if (token && !pushConfigured()) return NextResponse.json({ enabled: false });
    await db.session.update({ where: { id: sessionId }, data: { deviceToken: token } });
    // Covers a friend finishing while Android's registration was still in flight.
    if (token) after(() => notifyCreator(sessionId).catch(() => console.warn("Optional notification unavailable")));
    return NextResponse.json({ enabled: Boolean(token) });
  } catch (error) { return apiError(error); }
}
