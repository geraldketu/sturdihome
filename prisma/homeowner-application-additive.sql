-- Additive homeowner application fields. Apply through the normal migration workflow.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "propertyAddress" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "propertyCity" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "propertyState" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "propertyZip" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3);