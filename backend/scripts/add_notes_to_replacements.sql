-- Script untuk menambahkan kolom notes ke tabel Replacements
ALTER TABLE "Replacements" ADD COLUMN IF NOT EXISTS "notes" TEXT;
