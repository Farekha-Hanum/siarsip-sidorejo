-- ====================================================================================
-- PERBAIKAN TOTAL LEADERBOARD & VALIDASI (VERSI 2)
-- Jalankan ini di SQL Editor Supabase.
-- ====================================================================================

-- 1. Tambah kolom organisasi ke profiles jika belum ada (Mencegah Error)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='organisasi') THEN
        ALTER TABLE public.profiles ADD COLUMN organisasi TEXT;
    END IF;
END $$;

-- 2. Hapus dan Buat Ulang View Leaderboard agar lebih akurat
DROP VIEW IF EXISTS public.view_leaderboard;
CREATE VIEW public.view_leaderboard WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.nama_lengkap,
    p.username,
    p.organisasi,
    COALESCE(SUM(uk.skor_didapat), 0) as total_skor
FROM 
    public.profiles p
LEFT JOIN 
    public.user_kegiatan uk ON p.id = uk.id_user AND uk.status_validasi = 'approved'
GROUP BY 
    p.id, p.nama_lengkap, p.username, p.organisasi;

-- 3. Matikan sementara RLS pada tabel krusial
ALTER TABLE public.user_kegiatan DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kegiatan DISABLE ROW LEVEL SECURITY;

-- 4. Aktifkan kembali dengan kebijakan publik untuk pengguna login
ALTER TABLE public.user_kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kegiatan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.user_kegiatan;
CREATE POLICY "Authenticated users can do everything" ON public.user_kegiatan FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.profiles;
CREATE POLICY "Authenticated users can do everything" ON public.profiles FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can do everything" ON public.kegiatan;
CREATE POLICY "Authenticated users can do everything" ON public.kegiatan FOR ALL TO authenticated USING (true);
