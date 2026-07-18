-- Aktifkan ekstensi pg_cron jika belum ada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Jadwalkan job untuk update current_km dengan km_harian
-- Berjalan setiap hari pada pukul 00:00 (tengah malam)
SELECT cron.schedule('update_vehicle_km_daily', '0 0 * * *', $$
  UPDATE "Vehicles"
  SET current_km = current_km + (km_harian * (CURRENT_DATE - DATE(last_update_current_km)))
  WHERE DATE(last_update_current_km) < CURRENT_DATE AND km_harian > 0;
$$);

-- Referensi:
-- Untuk melihat daftar cron jobs:
-- SELECT * FROM cron.job;
--
-- Untuk menghapus job:
-- SELECT cron.unschedule('update_vehicle_km_daily');
