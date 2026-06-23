-- SQL Schema untuk SiArsip Sidorejo - FULL SUPABASE NATIVE (Final Version)
-- Salin dan tempel (Paste) kode ini di SQL Editor dashboard Supabase Anda.

--------------------------------------------------------------------------------
-- 0. CLEANUP (Hanya jika ingin reset data)
--------------------------------------------------------------------------------
-- DROP VIEW IF EXISTS public.view_leaderboard CASCADE;
-- DROP TABLE IF EXISTS public.user_kegiatan CASCADE;
-- DROP TABLE IF EXISTS public.kegiatan CASCADE;
-- DROP TABLE IF EXISTS public.surat CASCADE;
-- DROP TABLE IF EXISTS public.inventaris CASCADE;
-- DROP TABLE IF EXISTS public.data_pengurus CASCADE; -- Tabel pengganti pengurus_ranting
-- DROP TABLE IF EXISTS public.profiles CASCADE;

--------------------------------------------------------------------------------
-- 1. TABEL PROFIL (Link ke auth.users)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  nama_lengkap TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 2. TABEL DATA PENGURUS (Dulu: pengurus_ranting)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.data_pengurus (
  id SERIAL PRIMARY KEY,
  nama_lengkap TEXT NOT NULL,
  jabatan TEXT NOT NULL,
  alamat TEXT,
  nomor_telepon TEXT,
  tanggal_bergabung DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 3. TABEL INVENTARIS BARANG
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventaris (
  id SERIAL PRIMARY KEY,
  nama_barang TEXT NOT NULL,
  jumlah INTEGER NOT NULL DEFAULT 0,
  kondisi TEXT NOT NULL CHECK (kondisi IN ('Baik', 'Rusak Ringan', 'Rusak Berat')),
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 4. TABEL SURAT (Storage & Digital Signature)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.surat (
  id SERIAL PRIMARY KEY,
  id_user UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  jenis_surat TEXT NOT NULL CHECK (jenis_surat IN ('masuk_scan', 'keluar_otomatis')),
  nomor_surat TEXT,
  perihal TEXT NOT NULL,
  tanggal_surat DATE NOT NULL,
  storage_path TEXT, -- Path file di storage bucket 'archives'
  status_digital_signature BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 5. TABEL KEGIATAN (Master)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kegiatan (
  id SERIAL PRIMARY KEY,
  nama_kegiatan TEXT NOT NULL,
  tanggal_kegiatan DATE NOT NULL,
  deskripsi TEXT,
  bobot_skor INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 6. TABEL USER KEGIATAN (Gamifikasi)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_kegiatan (
  id SERIAL PRIMARY KEY,
  id_user UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  id_kegiatan INTEGER REFERENCES public.kegiatan(id) ON DELETE CASCADE,
  bukti_storage_path TEXT, -- Path file di storage bucket 'evidence'
  status_validasi TEXT DEFAULT 'pending' CHECK (status_validasi IN ('pending', 'approved', 'rejected')),
  skor_didapat INTEGER DEFAULT 0, -- Diisi admin saat validasi
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

--------------------------------------------------------------------------------
-- 7. VIEW LEADERBOARD (Otomatis & Real-time)
--------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.view_leaderboard AS
SELECT 
    p.id, 
    p.nama_lengkap, 
    p.username,
    COALESCE(SUM(uk.skor_didapat), 0) AS total_skor
FROM 
    public.profiles p
LEFT JOIN 
    public.user_kegiatan uk ON p.id = uk.id_user AND uk.status_validasi = 'approved'
GROUP BY 
    p.id, p.nama_lengkap, p.username
ORDER BY 
    total_skor DESC;

--------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS)
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_pengurus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_kegiatan ENABLE ROW LEVEL SECURITY;

-- Kebijakan Profil
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Kebijakan Data Pengurus (Read All, Write Admin)
CREATE POLICY "Viewable by authenticated users" ON public.data_pengurus FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage by admins only" ON public.data_pengurus FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Kebijakan Inventaris (Read All, Write Admin)
CREATE POLICY "Viewable by authenticated users" ON public.inventaris FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage by admins only" ON public.inventaris FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Kebijakan Surat (Own or Admin)
CREATE POLICY "Viewable by owner or admin" ON public.surat FOR SELECT TO authenticated 
  USING (auth.uid() = id_user OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Manage by admins only" ON public.surat FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

--------------------------------------------------------------------------------
-- 9. TRIGGER OTOMATIS PROFIL (Sync Auth -> Profile)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, nama_lengkap, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    COALESCE(new.raw_user_meta_data->>'nama_lengkap', 'Anggota Baru'), 
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

--------------------------------------------------------------------------------
-- 10. INISIALISASI STORAGE BUCKETS
--------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('archives', 'archives', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
