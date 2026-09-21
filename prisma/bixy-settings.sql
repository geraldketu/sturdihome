BEGIN;
CREATE TABLE IF NOT EXISTS "BixySettings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "showOnPages" TEXT[] NOT NULL DEFAULT ARRAY['*']::TEXT[],
  "maintenanceMode" BOOLEAN NOT NULL DEFAULT FALSE,
  "maintenanceMessage" TEXT NOT NULL DEFAULT 'Bixy is taking a short break. Please use the SturdiHome navigation for help.',
  "voiceOutputEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "voiceInputEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "typedChatEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "animationMode" TEXT NOT NULL DEFAULT 'basic',
  "mouthAnimationEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "guidanceEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "pageHelpEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "sessionPersistence" BOOLEAN NOT NULL DEFAULT TRUE,
  "freePreviewSeconds" INTEGER NOT NULL DEFAULT 60,
  "paidAccessEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "pricingJson" JSONB NOT NULL,
  "greeting" TEXT NOT NULL DEFAULT 'Well hello there. I am Bixy, your dependable SturdiHome guide.',
  "fallbackMessage" TEXT NOT NULL DEFAULT 'I do not have that information. Please use the SturdiHome navigation or contact the SturdiHome team for help.',
  "personalityText" TEXT NOT NULL DEFAULT 'You are Bixy, a male older-man SturdiHome guide. Always use he/him pronouns. Speak warmly, confidently, naturally, and with family-friendly humor.',
  "allowedDestinations" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "BixySettings" ("id", "pricingJson", "allowedDestinations") VALUES ('default', '[{"id":"character-5m","label":"5 minutes","amountCents":199,"enabled":false},{"id":"character-10m","label":"10 minutes","amountCents":299,"enabled":false},{"id":"character-30m","label":"30 minutes","amountCents":399,"enabled":false},{"id":"character-monthly-60m","label":"Monthly 60 minutes","amountCents":999,"enabled":false},{"id":"character-monthly-unlimited","label":"Monthly unlimited","amountCents":1999,"enabled":false}]'::jsonb, '["/","/services","/marketplace/vendors","/marketplace/financing","/member","/member/service-request","/member/financing-request","/member/appointments","/member/documents","/vendor","/vendor/leads","/financing","/financing/referrals","/how-it-works","/join-network"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
CREATE TABLE IF NOT EXISTS "BixyConfigAudit" ("id" TEXT NOT NULL PRIMARY KEY, "settingsId" TEXT NOT NULL REFERENCES "BixySettings"("id") ON DELETE CASCADE, "adminId" TEXT NOT NULL, "changedKeys" TEXT[] NOT NULL, "beforeJson" JSONB NOT NULL, "afterJson" JSONB NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS "BixyConfigAudit_settingsId_createdAt_idx" ON "BixyConfigAudit"("settingsId", "createdAt");
CREATE INDEX IF NOT EXISTS "BixyConfigAudit_adminId_createdAt_idx" ON "BixyConfigAudit"("adminId", "createdAt");
COMMIT;