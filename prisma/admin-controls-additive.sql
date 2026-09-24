-- Additive admin controls. Apply with Prisma migrate/db push in each environment.
ALTER TABLE "SiteExperienceSettings" ADD COLUMN IF NOT EXISTS "activeTheme" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "reviewNote" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "deletedBy" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3);
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "adminNote" TEXT;
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "adminUpdatedAt" TIMESTAMP(3);
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "adminUpdatedBy" TEXT;
CREATE INDEX IF NOT EXISTS "Document_userId_reviewStatus_idx" ON "Document" ("userId", "reviewStatus");
CREATE TABLE IF NOT EXISTS "UserPageVisibility" (
	"id" TEXT NOT NULL,
	"userId" TEXT NOT NULL,
	"pageKey" TEXT NOT NULL,
	"removedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"removedBy" TEXT NOT NULL,
	CONSTRAINT "UserPageVisibility_pkey" PRIMARY KEY ("id"),
	CONSTRAINT "UserPageVisibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT "UserPageVisibility_userId_pageKey_key" UNIQUE ("userId", "pageKey")
);
CREATE INDEX IF NOT EXISTS "UserPageVisibility_pageKey_removedAt_idx" ON "UserPageVisibility" ("pageKey", "removedAt");