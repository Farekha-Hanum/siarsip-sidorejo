-- ====================================================================================
-- MIGRASI DATA ARSIP (SINKRONISASI KATEGORI)
-- Jalankan ini jika ada surat yang sudah dibuat tapi tidak muncul di fitur Arsip.
-- Skrip ini akan memberikan kategori 'gabungan' pada surat-surat lama yang belum memiliki kategori.
-- ====================================================================================

-- 1. Berikan kategori 'gabungan' pada semua surat yang kategori_dashboard-nya masih NULL
UPDATE public.surat 
SET kategori_dashboard = 'gabungan' 
WHERE kategori_dashboard IS NULL OR kategori_dashboard = '';

-- 2. Pastikan jenis_surat konsisten (Penting untuk Filter Tab)
-- Jika ada surat digital yang jenisnya 'digital', ubah ke 'keluar_otomatis' agar muncul di Tab Keluar
UPDATE public.surat 
SET jenis_surat = 'keluar_otomatis' 
WHERE jenis_surat = 'digital';

-- 3. Verifikasi Jumlah Data (Output di Console Supabase)
-- SELECT kategori_dashboard, count(*) FROM public.surat GROUP BY kategori_dashboard;
