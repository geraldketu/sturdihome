-- Additive Admin seasonal media library.
CREATE TABLE IF NOT EXISTS "SeasonalEffect" (
  "id" TEXT NOT NULL,
  "storageUserId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "byteSize" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "SeasonalEffect_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SeasonalEffect_active_deletedAt_createdAt_idx" ON "SeasonalEffect" ("active", "deletedAt", "createdAt");