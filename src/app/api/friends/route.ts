import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, AppError, readBody } from "@/lib/errors";
import { friendPair } from "@/lib/social";
const publicProfile = { id: true, name: true, username: true } as const;
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await requireUser();
    const connections = await db.friendship.findMany({ where: { OR: [{ senderId: user.id }, { recipientId: user.id }] }, include: { sender: { select: publicProfile }, recipient: { select: publicProfile } }, orderBy: { createdAt: "desc" }, take: 200 });
    const sessions = await db.session.findMany({ where: { OR: [{ ownerId: user.id }, { participantBId: user.id }, { invitedUserId: user.id }] }, select: { id: true, personAName: true, personBName: true, ownerId: true, invitedUserId: true, resultJson: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 30 });
    return NextResponse.json({
      connections: connections.map(c => ({ id: c.id, accepted: c.accepted, incoming: c.recipientId === user.id, person: c.senderId === user.id ? c.recipient : c.sender })),
      sessions: sessions.map(s => ({ id: s.id, personAName: s.personAName, personBName: s.personBName, ready: Boolean(s.resultJson), incoming: s.invitedUserId === user.id && !s.personBName, createdAt: s.createdAt })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    const body = z.discriminatedUnion("action", [
      z.object({ action: z.literal("add"), username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/) }),
      z.object({ action: z.enum(["accept", "remove"]), id: z.string().uuid() }),
    ]).parse(await readBody(request));
    const user = await requireUser();
    if (body.action === "add") {
      const target = await db.user.findUnique({ where: { username: body.username } });
      if (!target) throw new AppError("No DJ with that username yet. Ask your friend to sign in and share their username.", 404);
      if (target.id === user.id) throw new AppError("Your own biggest fan? Add a friend's username instead.");
      await db.friendship.create({ data: { senderId: user.id, recipientId: target.id, pairKey: friendPair(user.id, target.id) } });
    } else {
      const match = await db.friendship.findUnique({ where: { id: body.id } });
      if (!match || ![match.senderId, match.recipientId].includes(user.id)) throw new AppError("Friend request not found.", 404);
      if (body.action === "accept") {
        if (match.recipientId !== user.id) throw new AppError("Only your friend can accept this request.", 403);
        await db.friendship.update({ where: { id: match.id }, data: { accepted: true } });
      } else await db.friendship.delete({ where: { id: match.id } });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError(new AppError("You’re already connected or a request is pending.", 409));
    return apiError(error);
  }
}
