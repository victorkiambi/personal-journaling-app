-- AlterTable
ALTER TABLE "EntryMetadata" ADD COLUMN     "mood" TEXT,
ADD COLUMN     "sentimentMagnitude" DOUBLE PRECISION,
ADD COLUMN     "sentimentScore" DOUBLE PRECISION,
ALTER COLUMN "wordCount" SET DEFAULT 0,
ALTER COLUMN "readingTime" SET DEFAULT 0;
