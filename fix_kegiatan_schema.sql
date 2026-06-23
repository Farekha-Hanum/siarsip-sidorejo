-- ====================================================================================
-- PERBAIKAN SCHEMA KEGIATAN & PARTISIPASI
-- Jalankan ini di SQL Editor Supabase untuk memperbaiki error 'bukti_storage_path' column not found.
-- ====================================================================================

-- 1. Pastikan tabel user_kegiatan memiliki kolom yang dibutuhkan
DO $$ 
BEGIN 
    -- Tambah bukti_storage_path
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_kegiatan' AND column_name='bukti_storage_path') THEN
        ALTER TABLE public.user_kegiatan ADD COLUMN bukti_storage_path TEXT;
    END IF;

    -- Tambah status_validasi
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_kegiatan' AND column_name='status_validasi') THEN
        ALTER TABLE public.user_kegiatan ADD COLUMN status_validasi TEXT DEFAULT 'pending';
    END IF;

    -- Tambah skor_didapat
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_kegiatan' AND column_name='skor_didapat') THEN
        ALTER TABLE public.user_kegiatan ADD COLUMN skor_didapat INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Pastikan tabel kegiatan memiliki bobot_skor
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kegiatan' AND column_name='bobot_skor') THEN
        ALTER TABLE public.kegiatan ADD COLUMN bobot_skor INTEGER DEFAULT 10;
    END IF;
END $$;

-- 3. Kebijakan RLS agar user bisa insert data partisipasi
ALTER TABLE public.user_kegiatan ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to insert their own participation" ON public.user_kegiatan;
CREATE POLICY "Allow users to insert their own participation" 
ON public.user_kegiatan FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id_user);

DROP POLICY IF EXISTS "Allow users to view their own participation" ON public.user_kegiatan;
CREATE POLICY "Allow users to view their own participation" 
ON public.user_kegiatan FOR SELECT TO authenticated 
USING (true); -- Biarkan admin juga bisa melihat

DROP POLICY IF EXISTS "Allow admin to update participation" ON public.user_kegiatan;
CREATE POLICY "Allow admin to update participation" 
ON public.user_kegiatan FOR UPDATE TO authenticated 
USING (true)
WITH CHECK (true);
