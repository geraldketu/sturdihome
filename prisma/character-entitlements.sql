CREATE TABLE IF NOT EXISTS "CharacterEntitlement" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "freeSecondsRemaining" INTEGER NOT NULL DEFAULT 60,
  "paidSecondsRemaining" INTEGER NOT NULL DEFAULT 0,
  "plan" TEXT,
  "purchasedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'FREE',
  "stripeCheckoutSessionId" TEXT,
  "stripePaymentIntentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CharacterEntitlement_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CharacterEntitlement_userId_key" UNIQUE ("userId"),
  CONSTRAINT "CharacterEntitlement_stripeCheckoutSessionId_key" UNIQUE ("stripeCheckoutSessionId"),
  CONSTRAINT "CharacterEntitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "CharacterUsage" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "character" TEXT NOT NULL,
  "seconds" INTEGER NOT NULL,
  "source" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CharacterUsage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CharacterUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "CharacterUsage_userId_createdAt_idx" ON "CharacterUsage"("userId", "createdAt");
