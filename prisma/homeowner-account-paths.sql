-- Additive homeowner account-path migration. Run before deploying this code.
BEGIN;

CREATE TYPE "HomeownerAccountType" AS ENUM ('VERIFIED_HOMEOWNER', 'SERVICE_ONLY');

ALTER TABLE "User"
  ADD COLUMN "homeownerAccountType" "HomeownerAccountType" NOT NULL DEFAULT 'VERIFIED_HOMEOWNER',
  ADD COLUMN "homeownerVerificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED';

ALTER TABLE "Document" ADD COLUMN "documentType" TEXT;

COMMIT;