-- ====================================================================================
-- GRANT AKSES API - SIARSIP SIDOREJO
-- ====================================================================================
-- Jalankan file ini di: Supabase Dashboard → SQL Editor → Run
--
-- KAPAN PERLU DIJALANKAN?
--   ✅ Sekarang, untuk memastikan project yang sudah berjalan tetap aman
--   ✅ Setiap kali membuat tabel baru setelah 30 Oktober 2026
--   ✅ Setelah reset project / buat project baru
-- ====================================================================================

-- -----------------------------------------------------------------------------------
-- 1. GRANT untuk role 'authenticated' (user yang sudah login)
-- -----------------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_pengurus TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventaris TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.surat TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kegiatan TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_kegiatan TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT SELECT ON public.view_leaderboard TO authenticated;

-- -----------------------------------------------------------------------------------
-- 2. GRANT untuk role 'service_role' (backend / fungsi server)
-- -----------------------------------------------------------------------------------
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.data_pengurus TO service_role;
GRANT ALL ON public.inventaris TO service_role;
GRANT ALL ON public.surat TO service_role;
GRANT ALL ON public.kegiatan TO service_role;
GRANT ALL ON public.user_kegiatan TO service_role;
GRANT ALL ON public.settings TO service_role;
GRANT SELECT ON public.view_leaderboard TO service_role;

-- -----------------------------------------------------------------------------------
-- 3. GRANT untuk sequences (agar INSERT dengan ID otomatis/SERIAL bisa berjalan)
-- -----------------------------------------------------------------------------------
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ====================================================================================
-- Selesai! Jika berhasil, tidak ada error yang muncul.
-- ====================================================================================
