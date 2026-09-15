import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submission } from "@/lib/schema";
import { normalizeInput } from "@/lib/normalize";
import { apiError, readBody, requireEnv } from "@/lib/errors";
import { sessionView } from "@/lib/sessions";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { friendPair } from "@/lib/social";
import { AppError } from "@/lib/errors";
import { randomBytes } from "node:crypto";
import { creatorCookie, hashCreatorSecret } from "@/lib/creator-proof";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const input = submission.extend({ friendUsername: z.string().regex(/^[a-z0-9_]{3,24}$/).optional() }).parse(await readBody(request));
    const user = await currentUser();
    let invitedUserId: string | undefined;
    if (input.friendUsername) {
      if (!user) throw new AppError("Sign in before sending a direct vibe invite.", 401);
      const friend = await db.user.findUnique({ where: { username: input.friendUsername } });
      const connection = friend && await db.friendship.findUnique({ where: { pairKey: friendPair(user.id, friend.id) } });
      if (!friend || !connection?.accepted) throw new AppError("Add this person as a friend first.", 403);
      invitedUserId = friend.id;
    }
    requireEnv("DATABASE_URL");
    requireEnv("GROQ_API_KEY");
    const list = await normalizeInput(input.type, input.value);
    const creatorSecret = randomBytes(32).toString("hex");
    const s = await db.session.create({
      data: {
        personAName: input.name,
        personAInputType: input.type,
        personANormalizedList: list,
        ownerId: user?.id,
        invitedUserId,
        creatorSecretHash: hashCreatorSecret(creatorSecret),
      },
    });
    const response = NextResponse.json(sessionView(s, user?.id), { status: 201 });
    response.cookies.set(creatorCookie(s.id), creatorSecret, { httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "lax", path: "/api/push-tokens", maxAge: 7 * 86400 });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
