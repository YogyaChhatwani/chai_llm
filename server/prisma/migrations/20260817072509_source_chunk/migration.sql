/*
  Warnings:

  - Added the required column `index` to the `source_chunk` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "source_chunk_sourceId_tokenCount_idx";

-- AlterTable
ALTER TABLE "source_chunk" ADD COLUMN     "index" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "source_chunk_sourceId_index_idx" ON "source_chunk"("sourceId", "index");
