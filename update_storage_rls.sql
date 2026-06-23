-- ====================================================================================
-- PERBAIKAN RLS (ROW-LEVEL SECURITY) UNTUK SUPABASE STORAGE BUCKETS
-- Salin dan tempel (Paste) seluruh kode ini ke dalam menu "SQL Editor" di Dashboard Supabase Anda,
-- kemudian klik tombol "Run" untuk memperbaiki error saat upload file/scan.
-- ====================================================================================

-- (Tabel storage.objects adalah bawaan Supabase, RLS sudah otomatis aktif)
-- ---------------------------------------------------------
-- 1. KEBIJAKAN BUCKET 'archives' (Untuk Arsip & Scan Surat)
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated uploads to archives" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to archives"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'archives');

DROP POLICY IF EXISTS "Allow authenticated viewing of archives" ON storage.objects;
CREATE POLICY "Allow authenticated viewing of archives"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'archives');

DROP POLICY IF EXISTS "Allow authenticated update of archives" ON storage.objects;
CREATE POLICY "Allow authenticated update of archives"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'archives');

DROP POLICY IF EXISTS "Allow authenticated deletion of archives" ON storage.objects;
CREATE POLICY "Allow authenticated deletion of archives"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'archives');

-- ---------------------------------------------------------
-- 2. KEBIJAKAN BUCKET 'evidence' (Untuk Bukti Kegiatan)
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated uploads to evidence" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to evidence"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'evidence');

DROP POLICY IF EXISTS "Allow authenticated viewing of evidence" ON storage.objects;
CREATE POLICY "Allow authenticated viewing of evidence"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'evidence');

-- ---------------------------------------------------------
-- 3. KEBIJAKAN BUCKET 'avatars' (Untuk Foto Profil Publik)
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Allow public viewing of avatars" ON storage.objects;
CREATE POLICY "Allow public viewing of avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Allow authenticated uploads to avatars" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');
