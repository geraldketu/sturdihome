CREATE TABLE IF NOT EXISTS "VendorReferral" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "vendorUserId" TEXT NOT NULL,
  "customerId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acceptedAt" TIMESTAMP(3),
  CONSTRAINT "VendorReferral_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "VendorReferral_code_key" UNIQUE ("code"),
  CONSTRAINT "VendorReferral_customerId_key" UNIQUE ("customerId"),
  CONSTRAINT "VendorReferral_vendorUserId_fkey" FOREIGN KEY ("vendorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "VendorReferral_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "VendorReferral_vendorUserId_createdAt_idx" ON "VendorReferral"("vendorUserId", "createdAt");