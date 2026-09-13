CREATE TYPE "InputType" AS ENUM ('SPOTIFY', 'YOUTUBE', 'MANUAL');
CREATE TABLE "Session" (
 "id" TEXT NOT NULL,
 "personAName" TEXT NOT NULL,
 "personAInputType" "InputType" NOT NULL,
 "personANormalizedList" JSONB NOT NULL,
 "personBName" TEXT,
 "personBInputType" "InputType",
 "personBNormalizedList" JSONB,
 "resultJson" JSONB,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "generationStartedAt" TIMESTAMP(3),
 "generationAttempts" INTEGER NOT NULL DEFAULT 0,
 CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
