-- ====================================================================================
-- PEMBARUAN TABEL DATA_PENGURUS (NIA & ORGANISASI)
-- Salin dan tempel (Paste) seluruh kode ini ke dalam menu "SQL Editor" di Dashboard Supabase Anda,
-- kemudian klik tombol "Run" untuk memperbaiki error 'nia' column not found.
-- ====================================================================================

-- 1. Tambah kolom nia (Nomor Induk Anggota) jika belum ada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='data_pengurus' AND column_name='nia') THEN
        ALTER TABLE public.data_pengurus ADD COLUMN nia TEXT;
    END IF;
END $$;

-- 2. Tambah kolom organisasi (IPNU/IPPNU) jika belum ada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='data_pengurus' AND column_name='organisasi') THEN
        ALTER TABLE public.data_pengurus ADD COLUMN organisasi TEXT DEFAULT 'IPNU';
    END IF;
END $$;

-- 3. Tambah kolom tanggal_bergabung jika belum ada
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='data_pengurus' AND column_name='tanggal_bergabung') THEN
        ALTER TABLE public.data_pengurus ADD COLUMN tanggal_bergabung DATE;
    END IF;
END $$;

-- 4. Pastikan RLS aktif untuk tabel ini
ALTER TABLE public.data_pengurus ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan RLS agar data dapat dibaca oleh semua pengguna terautentikasi
DROP POLICY IF EXISTS "Allow authenticated read data_pengurus" ON public.data_pengurus;
CREATE POLICY "Allow authenticated read data_pengurus" 
ON public.data_pengurus FOR SELECT TO authenticated 
USING (true);

-- 6. Kebijakan RLS agar data dapat dikelola (Insert/Update/Delete) oleh pengguna terautentikasi
DROP POLICY IF EXISTS "Allow authenticated manage data_pengurus" ON public.data_pengurus;
CREATE POLICY "Allow authenticated manage data_pengurus" 
ON public.data_pengurus FOR ALL TO authenticated 
USING (true)
WITH CHECK (true);
