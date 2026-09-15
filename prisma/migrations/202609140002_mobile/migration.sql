ALTER TABLE "Session" ADD COLUMN "playlistJson" JSONB,
ADD COLUMN "deviceToken" TEXT,
ADD COLUMN "creatorSecretHash" TEXT,
ADD COLUMN "pushSentAt" TIMESTAMP(3);
CREATE TABLE "NativeLogin" (
  "id" TEXT NOT NULL,
  "challenge" TEXT NOT NULL,
  "userId" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  CONSTRAINT "NativeLogin_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "NativeLogin_expiresAt_idx" ON "NativeLogin"("expiresAt");
