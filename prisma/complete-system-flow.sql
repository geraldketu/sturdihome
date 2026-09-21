-- Additive project lifecycle migration. Apply after review and backup.
BEGIN;

ALTER TABLE "VendorProfile" ADD COLUMN IF NOT EXISTS "maxActiveJobs" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "VendorProfile" ADD COLUMN IF NOT EXISTS "availabilityStatus" TEXT NOT NULL DEFAULT 'AVAILABLE';
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "workflowStatus" TEXT NOT NULL DEFAULT 'ESTIMATE_SUBMITTED';
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "vendorResponse" TEXT;
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "vendorResponseAt" TIMESTAMP(3);
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "siteVisitScheduledFor" TIMESTAMP(3);
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "siteVisitCompletedAt" TIMESTAMP(3);
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "finalQuoteSubmittedAt" TIMESTAMP(3);
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "quoteAcceptedAt" TIMESTAMP(3);
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "quoteAcceptedBy" TEXT;
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "finalQuoteTotalCents" INTEGER;
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "completedBy" TEXT;
ALTER TABLE "FinancingRequest" ADD COLUMN IF NOT EXISTS "serviceRequestId" TEXT;
ALTER TABLE "FinancingRequest" ADD COLUMN IF NOT EXISTS "lenderStatus" TEXT NOT NULL DEFAULT 'RECEIVED';
ALTER TABLE "FinancingRequest" ADD COLUMN IF NOT EXISTS "financedLineItems" JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS "FinancingRequest_serviceRequestId_key" ON "FinancingRequest"("serviceRequestId");

CREATE TABLE IF NOT EXISTS "QuoteLineItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "serviceRequestId" TEXT NOT NULL REFERENCES "ServiceRequest"("id") ON DELETE CASCADE,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "QuoteLineItem_serviceRequestId_createdAt_idx" ON "QuoteLineItem"("serviceRequestId", "createdAt");

CREATE TABLE IF NOT EXISTS "ChangeOrder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "serviceRequestId" TEXT NOT NULL REFERENCES "ServiceRequest"("id") ON DELETE CASCADE,
  "originalAmountCents" INTEGER NOT NULL,
  "requestedAmountCents" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING_HOMEOWNER',
  "approvedAt" TIMESTAMP(3),
  "approvedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ChangeOrder_serviceRequestId_createdAt_idx" ON "ChangeOrder"("serviceRequestId", "createdAt");

CREATE TABLE IF NOT EXISTS "ServiceRequestAudit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "serviceRequestId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "previousStatus" TEXT,
  "newStatus" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ServiceRequestAudit_serviceRequestId_createdAt_idx" ON "ServiceRequestAudit"("serviceRequestId", "createdAt");

ALTER TABLE "FinancingRequest" ADD CONSTRAINT "FinancingRequest_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL;
COMMIT;