BEGIN;
CREATE TABLE IF NOT EXISTS "BixyRefundAudit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "adminId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "paymentIntentId" TEXT NOT NULL,
  "stripeRefundId" TEXT UNIQUE,
  "plan" TEXT,
  "originalAmountCents" INTEGER NOT NULL,
  "refundPercentage" INTEGER NOT NULL,
  "refundAmountCents" INTEGER NOT NULL,
  "remainingCents" INTEGER,
  "status" TEXT NOT NULL,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "BixyRefundAudit_paymentIntentId_createdAt_idx" ON "BixyRefundAudit"("paymentIntentId", "createdAt");
CREATE INDEX IF NOT EXISTS "BixyRefundAudit_userId_createdAt_idx" ON "BixyRefundAudit"("userId", "createdAt");
COMMIT;