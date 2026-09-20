-- Reviewed additive schema change. Do not run against production until release approval.
-- Existing data, partner profiles, requests and assignments are untouched.
CREATE TABLE "MarketplaceListing" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "services" TEXT NOT NULL,
  "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "areas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "website" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "logo" TEXT NOT NULL DEFAULT '',
  "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "published" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketplaceListing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "MarketplaceListing_kind_check" CHECK ("kind" IN ('vendor', 'financing'))
);
CREATE UNIQUE INDEX "MarketplaceListing_ownerId_key" ON "MarketplaceListing"("ownerId");
