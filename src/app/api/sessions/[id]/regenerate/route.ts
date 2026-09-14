import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, readBody } from "@/lib/errors";
import { generate } from "@/lib/sessions";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { assertSessionAccess } from "@/lib/social";
import { AppError } from "@/lib/errors";
export const maxDuration = 60;
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await readBody(request);
    const id = z.string().uuid().parse((await params).id);
    const session = await db.session.findUnique({ where: { id } });
    if (!session) throw new AppError("Session not found.", 404);
    assertSessionAccess(session, (await currentUser())?.id);
    return NextResponse.json(
      await generate(id),
    );
  } catch (error) {
    return apiError(error);
  }
}
