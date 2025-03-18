/*
  Warnings:

  - The primary key for the `_EntryCategories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_EntryCategories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_EntryCategories" DROP CONSTRAINT "_EntryCategories_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_EntryCategories_AB_unique" ON "_EntryCategories"("A", "B");

-- CreateIndex
CREATE INDEX "entry_metadata_wordCount_idx" ON "entry_metadata"("wordCount");

-- CreateIndex
CREATE INDEX "entry_metadata_readingTime_idx" ON "entry_metadata"("readingTime");

-- CreateIndex
CREATE INDEX "entry_metadata_createdAt_idx" ON "entry_metadata"("createdAt");

-- CreateIndex
CREATE INDEX "journal_entries_userId_createdAt_idx" ON "journal_entries"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "journal_entries_title_idx" ON "journal_entries"("title");

-- CreateIndex
CREATE INDEX "journal_entries_content_idx" ON "journal_entries"("content");

-- CreateIndex
CREATE INDEX "journal_entries_userId_isPublic_idx" ON "journal_entries"("userId", "isPublic");
