-- Additive seasonal experience settings migration. Apply before deploying this feature.
BEGIN;

CREATE TABLE IF NOT EXISTS "SiteExperienceSettings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "weatherEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "seasonalEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "holidayEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "effectsDisabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "previewTheme" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "SiteExperienceSettings" ("id") VALUES ('default') ON CONFLICT ("id") DO NOTHING;

COMMIT;