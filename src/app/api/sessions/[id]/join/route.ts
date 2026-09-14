import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { submission } from "@/lib/schema";
import { normalizeInput } from "@/lib/normalize";
import { apiError, AppError, readBody } from "@/lib/errors";
import { generate } from "@/lib/sessions";
import { currentUser } from "@/lib/auth";
import { assertSessionAccess } from "@/lib/social";
export const maxDuration = 60;
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = z
      .string()
      .uuid()
      .parse((await params).id);
    const input = submission.parse(await readBody(request));
    const s = await db.session.findUnique({ where: { id } });
    if (!s)
      throw new AppError("Session not found. Start a fresh mixtape.", 404);
    const user = await currentUser();
    assertSessionAccess(s, user?.id);
    if (s.invitedUserId && user?.id !== s.invitedUserId) throw new AppError("This seat is reserved for your invited friend.", 403);
    if (s.personBName)
      throw new AppError(
        "Both seats are taken. Refresh to see the result.",
        409,
      );
    const list = await normalizeInput(input.type, input.value);
    const joined = await db.session.updateMany({
      where: { id, personBName: null },
      data: {
        personBName: input.name,
        personBInputType: input.type,
        personBNormalizedList: list,
        participantBId: user?.id !== s.ownerId ? user?.id : null,
      },
    });
    if (!joined.count)
      throw new AppError(
        "Someone just joined this session. Refresh to check.",
        409,
      );
    return NextResponse.json(await generate(id));
  } catch (error) {
    return apiError(error);
  }
}
