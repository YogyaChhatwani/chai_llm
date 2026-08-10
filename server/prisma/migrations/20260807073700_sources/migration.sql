-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('YOUTUBE', 'WEBSITE', 'PDF', 'TEXT', 'MARKDOWN');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "defaultModel" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "url" TEXT,
    "title" TEXT,
    "description" TEXT,
    "status" "SourceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_chunk" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_chunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workspace_userId_idx" ON "workspace"("userId");

-- CreateIndex
CREATE INDEX "source_workspaceId_idx" ON "source"("workspaceId");

-- CreateIndex
CREATE INDEX "source_workspaceId_type_idx" ON "source"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "source_workspaceId_status_idx" ON "source"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "source_chunk_sourceId_idx" ON "source_chunk"("sourceId");

-- CreateIndex
CREATE INDEX "source_chunk_sourceId_tokenCount_idx" ON "source_chunk"("sourceId", "tokenCount");

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source" ADD CONSTRAINT "source_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_chunk" ADD CONSTRAINT "source_chunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
