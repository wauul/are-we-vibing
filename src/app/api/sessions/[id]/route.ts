import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiError, AppError } from "@/lib/errors";
import { sessionView } from "@/lib/sessions";
import { currentUser } from "@/lib/auth";
import { assertSessionAccess } from "@/lib/social";
export const dynamic = "force-dynamic";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = z
      .string()
      .uuid()
      .parse((await params).id);
    const s = await db.session.findUnique({ where: { id } });
    if (!s)
      throw new AppError("This session wandered off. Start a new one?", 404);
    const user = await currentUser();
    assertSessionAccess(s, user?.id);
    return NextResponse.json(sessionView(s, user?.id), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
