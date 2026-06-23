-- ====================================================================================
-- PERBAIKAN FOREIGN KEY & PROFIL USER
-- Jalankan ini jika muncul error "violates foreign key constraint user_kegiatan_id_user_fkey".
-- ====================================================================================

-- 1. Hapus foreign key yang bermasalah (jika ada)
ALTER TABLE IF EXISTS public.user_kegiatan 
DROP CONSTRAINT IF EXISTS user_kegiatan_id_user_fkey;

-- 2. Buat ulang foreign key agar merujuk langsung ke auth.users (Tabel Utama Supabase Auth)
-- Ini memastikan bahwa setiap user yang login bisa menginput kegiatan tanpa hambatan profil.
ALTER TABLE public.user_kegiatan 
ADD CONSTRAINT user_kegiatan_id_user_fkey 
FOREIGN KEY (id_user) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Pastikan kolom id_user memiliki tipe data UUID (sesuai dengan auth.users)
-- Jalankan ini HANYA jika kolom id_user saat ini bukan UUID.
-- ALTER TABLE public.user_kegiatan ALTER COLUMN id_user TYPE UUID USING id_user::uuid;

-- 4. Sinkronisasi Profil (Opsional tapi disarankan)
-- Memastikan semua user di auth.users memiliki entry di public.profiles agar nama muncul di leaderboard.
INSERT INTO public.profiles (id, username, nama_lengkap, role)
SELECT id, email, email, 'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
