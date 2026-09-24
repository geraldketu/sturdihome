-- Additive Brixy purchase ledger. Apply through the normal development/staging migration workflow before enabling paid access.
CREATE TABLE IF NOT EXISTS "CharacterPurchase" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "checkoutSessionId" TEXT NOT NULL,
  "paymentIntentId" TEXT,
  "plan" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "seconds" INTEGER NOT NULL,
  "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CharacterPurchase_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CharacterPurchase_checkoutSessionId_key" UNIQUE ("checkoutSessionId"),
  CONSTRAINT "CharacterPurchase_paymentIntentId_key" UNIQUE ("paymentIntentId"),
  CONSTRAINT "CharacterPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "CharacterPurchase_userId_purchasedAt_idx" ON "CharacterPurchase" ("userId", "purchasedAt");