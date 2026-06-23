--------------------------------------------------------------------------------
-- 1. UPDATE TABEL PROFILES (Assigned Dashboard)
--------------------------------------------------------------------------------
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assigned_dashboard TEXT DEFAULT 'all' 
CHECK (assigned_dashboard IN ('ipnu', 'ippnu', 'gabungan', 'all'));

--------------------------------------------------------------------------------
-- 2. UPDATE TABEL SURAT (Kategori & Metadata)
--------------------------------------------------------------------------------
ALTER TABLE public.surat 
ADD COLUMN IF NOT EXISTS kategori_dashboard TEXT CHECK (kategori_dashboard IN ('ipnu', 'ippnu', 'gabungan')),
ADD COLUMN IF NOT EXISTS sub_kategori TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

--------------------------------------------------------------------------------
-- 3. TABEL SETTINGS (Konfigurasi Nomor Surat)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  org_type TEXT UNIQUE NOT NULL CHECK (org_type IN ('ipnu', 'ippnu', 'gabungan')),
  wilayah_pimpinan TEXT DEFAULT 'PR',
  periode TEXT DEFAULT 'XXIV',
  kode_organisasi TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inisialisasi Settings Bawaan
INSERT INTO public.settings (org_type, wilayah_pimpinan, periode, kode_organisasi)
VALUES 
  ('ipnu', 'PR', 'XXIV', '7354'),
  ('ippnu', 'PR', 'XXIV', '7455'),
  ('gabungan', 'PR', 'XXIV', NULL)
ON CONFLICT (org_type) DO NOTHING;

--------------------------------------------------------------------------------
-- 4. RLS UNTUK SETTINGS
--------------------------------------------------------------------------------
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Settings are viewable by authenticated users" ON public.settings;
CREATE POLICY "Settings are viewable by authenticated users" 
ON public.settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Settings are manageable by admins only" ON public.settings;
CREATE POLICY "Settings are manageable by admins only" 
ON public.settings FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

--------------------------------------------------------------------------------
-- 5. UPDATE RLS SURAT (User bisa INSERT, Admin bisa lihat semua)
--------------------------------------------------------------------------------
-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Users can insert surat" ON public.surat;
DROP POLICY IF EXISTS "Viewable by owner or admin" ON public.surat;

-- Semua user bisa insert surat
CREATE POLICY "Users can insert surat" 
ON public.surat FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id_user);

-- Admin bisa lihat semua, user hanya bisa lihat miliknya sendiri
CREATE POLICY "Viewable by owner or admin" 
ON public.surat FOR SELECT TO authenticated 
USING (
  auth.uid() = id_user 
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
