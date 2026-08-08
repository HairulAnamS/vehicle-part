-- Script untuk menambahkan kolom is_admin ke tabel Users
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN DEFAULT false;
