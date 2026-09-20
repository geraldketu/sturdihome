-- Additive Task 12 migration. Apply after backup and deployment approval.
BEGIN;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE';

CREATE TABLE IF NOT EXISTS "AdminAccountActionAudit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "adminId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AdminAccountActionAudit_userId_createdAt_idx"
  ON "AdminAccountActionAudit" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "AdminAccountActionAudit_adminId_createdAt_idx"
  ON "AdminAccountActionAudit" ("adminId", "createdAt");

COMMIT;