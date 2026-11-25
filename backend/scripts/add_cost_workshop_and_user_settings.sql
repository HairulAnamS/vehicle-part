-- Script migrasi untuk fitur biaya, bengkel, dan pengaturan user
ALTER TABLE "Replacements" ADD COLUMN IF NOT EXISTS "cost" INTEGER DEFAULT 0;
ALTER TABLE "Replacements" ADD COLUMN IF NOT EXISTS "workshop_name" VARCHAR(255);

ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "email_reminder_enabled" BOOLEAN DEFAULT true;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "warning_km_threshold" INTEGER DEFAULT 500;
