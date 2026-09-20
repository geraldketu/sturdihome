BEGIN;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "financingAccessStatus" TEXT NOT NULL DEFAULT 'ACTIVE';
CREATE TABLE IF NOT EXISTS "MemberStandingAcceptance" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "version" TEXT NOT NULL,
  "effectiveDate" TIMESTAMP(3) NOT NULL,
  "documentIdentifier" TEXT NOT NULL,
  "fullLegalName" TEXT NOT NULL,
  "electronicSignature" TEXT NOT NULL,
  "signedCopyContent" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId", "version")
);
CREATE INDEX IF NOT EXISTS "MemberStandingAcceptance_userId_acceptedAt_idx" ON "MemberStandingAcceptance"("userId", "acceptedAt");
CREATE TABLE IF NOT EXISTS "FinancePartnerReportingAcceptance" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "version" TEXT NOT NULL,
  "documentIdentifier" TEXT NOT NULL,
  "fullLegalName" TEXT NOT NULL,
  "electronicSignature" TEXT NOT NULL,
  "signedCopyContent" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId", "version")
);
CREATE TABLE IF NOT EXISTS "FinancingStatusReport" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "financePartnerUserId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "financePartnerProfileId" TEXT NOT NULL REFERENCES "FinancingPartnerProfile"("id") ON DELETE RESTRICT,
  "memberId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "financingRequestId" TEXT NOT NULL REFERENCES "FinancingRequest"("id") ON DELETE RESTRICT,
  "status" TEXT NOT NULL,
  "relationshipReference" TEXT,
  "authorizationConfirmed" BOOLEAN NOT NULL,
  "accuracyConfirmed" BOOLEAN NOT NULL,
  "ownRelationshipConfirmed" BOOLEAN NOT NULL,
  "noCollectionConfirmed" BOOLEAN NOT NULL,
  "updateCommitmentConfirmed" BOOLEAN NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3)
);
CREATE INDEX IF NOT EXISTS "FinancingStatusReport_memberId_active_createdAt_idx" ON "FinancingStatusReport"("memberId", "active", "createdAt");
CREATE INDEX IF NOT EXISTS "FinancingStatusReport_financePartnerUserId_createdAt_idx" ON "FinancingStatusReport"("financePartnerUserId", "createdAt");
CREATE TABLE IF NOT EXISTS "FinancingStatusDispute" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reportId" TEXT NOT NULL REFERENCES "FinancingStatusReport"("id") ON DELETE CASCADE,
  "memberId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "response" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "adminNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "FinancingStatusAudit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reportId" TEXT NOT NULL REFERENCES "FinancingStatusReport"("id") ON DELETE CASCADE,
  "actorUserId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "UserNotification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "reportId" TEXT REFERENCES "FinancingStatusReport"("id") ON DELETE SET NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "UserNotification_userId_createdAt_idx" ON "UserNotification"("userId", "createdAt");
CREATE TABLE IF NOT EXISTS "AccountCancellationAudit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "actorUserId" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AccountCancellationAudit_userId_createdAt_idx" ON "AccountCancellationAudit"("userId", "createdAt");
COMMIT;
