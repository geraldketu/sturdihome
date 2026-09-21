BEGIN;
CREATE TABLE IF NOT EXISTS "BixyConfigAudit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "settingsId" TEXT NOT NULL REFERENCES "BixySettings"("id") ON DELETE CASCADE,
  "adminId" TEXT NOT NULL,
  "changedKeys" TEXT[] NOT NULL,
  "beforeJson" JSONB NOT NULL,
  "afterJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "BixyConfigAudit_settingsId_createdAt_idx" ON "BixyConfigAudit"("settingsId", "createdAt");
CREATE INDEX IF NOT EXISTS "BixyConfigAudit_adminId_createdAt_idx" ON "BixyConfigAudit"("adminId", "createdAt");
COMMIT;
