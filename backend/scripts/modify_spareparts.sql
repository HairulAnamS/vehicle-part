-- Script untuk memodifikasi tabel Spareparts

-- Tambahkan kolom type
ALTER TABLE "Spareparts" ADD COLUMN IF NOT EXISTS "type" VARCHAR(255) DEFAULT 'All';

-- Hapus kolom replacement_km (karena akan dipindah ke tabel VehicleSpareparts)
ALTER TABLE "Spareparts" DROP COLUMN IF EXISTS "replacement_km";
