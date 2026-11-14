-- CreateEnum
CREATE TYPE "VideoSource" AS ENUM ('TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'UPLOAD');

-- AlterTable
-- Convert in place (keeps existing rows): SocialPlatform values are a subset of VideoSource.
ALTER TABLE "SocialVideo" ADD COLUMN     "contentType" VARCHAR(40),
ADD COLUMN     "sizeBytes" INTEGER,
ALTER COLUMN "platform" SET DATA TYPE "VideoSource" USING ("platform"::text::"VideoSource"),
ALTER COLUMN "externalId" SET DATA TYPE VARCHAR(160);
DROP INDEX IF EXISTS "SocialVideo_platform_externalId_productId_key";

-- CreateTable
CREATE TABLE "ProgressEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "takenAt" DATE NOT NULL,
    "photoKey" VARCHAR(160) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "note" VARCHAR(500),
    "hydration" INTEGER,
    "definition" INTEGER,
    "breakage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgressEntry_photoKey_key" ON "ProgressEntry"("photoKey");

-- CreateIndex
CREATE INDEX "ProgressEntry_userId_takenAt_idx" ON "ProgressEntry"("userId", "takenAt");

-- CreateIndex
CREATE INDEX "SocialVideo_moderation_createdAt_idx" ON "SocialVideo"("moderation", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialVideo_platform_externalId_productId_key" ON "SocialVideo"("platform", "externalId", "productId");

-- AddForeignKey
ALTER TABLE "ProgressEntry" ADD CONSTRAINT "ProgressEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Defense-in-depth constraints ───────────────────────────────────────────
ALTER TABLE "ProgressEntry" ADD CONSTRAINT "ProgressEntry_ratings_range" CHECK (
  ("hydration" IS NULL OR "hydration" BETWEEN 1 AND 5) AND
  ("definition" IS NULL OR "definition" BETWEEN 1 AND 5) AND
  ("breakage" IS NULL OR "breakage" BETWEEN 1 AND 5));
ALTER TABLE "ProgressEntry" ADD CONSTRAINT "ProgressEntry_dims_pos" CHECK ("width" > 0 AND "height" > 0);
ALTER TABLE "SocialVideo" ADD CONSTRAINT "SocialVideo_size_pos" CHECK ("sizeBytes" IS NULL OR "sizeBytes" > 0);
