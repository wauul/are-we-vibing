import { Prisma, type Session } from "@prisma/client";
import { db } from "./db";
import { analyze } from "./ai";
import { AppError } from "./errors";
import { storedResultSchema, playlistTrackSchema, type SessionView } from "./schema";
import { findSharedPlaylist } from "./youtube-playlist";
import { notifyCreator } from "./push";
import { after } from "next/server";
export function sessionView(s: Session, viewerId?: string): SessionView {
  const matching =
    s.generationStartedAt &&
    Date.now() - s.generationStartedAt.getTime() < 60000;
  return {
    id: s.id,
    personAName: s.personAName,
    personAInputType: s.personAInputType,
    personBName: s.personBName,
    personBInputType: s.personBInputType,
    resultJson: s.resultJson ? storedResultSchema.parse(s.resultJson) : null,
    playlist: playlistTrackSchema.array().max(10).safeParse(s.playlistJson).data || [],
    generationAttempts: s.generationAttempts,
    isOwner: Boolean(viewerId && s.ownerId === viewerId),
    isDirect: Boolean(s.invitedUserId),
    status: s.resultJson
      ? "ready"
      : matching
        ? "matching"
        : s.personBName
          ? "retry"
          : "waiting",
  };
}
export async function generate(id: string) {
  const now = new Date();
  // Database compare-and-set provides a cross-instance lease; a crashed request expires.
  const claim = await db.session.updateMany({
    where: {
      id,
      personBName: { not: null },
      resultJson: { equals: Prisma.DbNull },
      generationAttempts: { lt: 5 },
      OR: [
        { generationStartedAt: null },
        { generationStartedAt: { lt: new Date(Date.now() - 60000) } },
      ],
    },
    data: { generationStartedAt: now, generationAttempts: { increment: 1 } },
  });
  if (!claim.count)
    throw new AppError(
      "Already mixing, already finished, or out of retries. Refresh to check.",
      409,
    );
  try {
    const s = await db.session.findUniqueOrThrow({ where: { id } });
    const result = await analyze(
      s.personANormalizedList as string[],
      s.personBNormalizedList as string[],
    );
    const playlist = await findSharedPlaylist(result.recommendations);
    const saved = await db.session.updateMany({
      where: { id, generationStartedAt: now },
      data: { resultJson: result, playlistJson: playlist, generationStartedAt: null },
    });
    if (saved.count) after(() => notifyCreator(id).catch(() => console.warn("Optional notification unavailable")));
  } catch (error) {
    await db.session.updateMany({
      where: { id, generationStartedAt: now },
      data: { generationStartedAt: null },
    });
    throw error;
  }
  return sessionView(await db.session.findUniqueOrThrow({ where: { id } }));
}
