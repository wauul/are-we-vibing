import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { authAvailable, currentUser, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, readBody, AppError } from "@/lib/errors";
import { profileInput } from "@/lib/social";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await currentUser();
    return NextResponse.json({ authAvailable, user: user ? { id: user.id, name: user.name, username: user.username } : null }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    const body = profileInput.parse(await readBody(request));
    const user = await requireUser();
    const updated = await db.user.update({ where: { id: user.id }, data: body, select: { id: true, name: true, username: true } });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError(new AppError("That username already has a DJ. Try another one.", 409));
    return apiError(error);
  }
}
