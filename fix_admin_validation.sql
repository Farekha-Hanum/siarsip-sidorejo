-- 1. Berikan izin kepada semua pengguna terautentikasi (termasuk Admin) untuk melihat profil
-- Ini penting agar Admin bisa melihat SIAPA yang mengirimkan konfirmasi.
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated 
USING (true);

-- 2. Pastikan kebijakan RLS pada user_kegiatan benar-benar terbuka untuk Admin
DROP POLICY IF EXISTS "Admin can view all participations" ON public.user_kegiatan;
CREATE POLICY "Admin can view all participations" 
ON public.user_kegiatan FOR SELECT TO authenticated 
USING (true);

-- 3. Sinkronisasi ulang profil untuk memastikan tidak ada data yang 'nyangkut'
INSERT INTO public.profiles (id, username, nama_lengkap, role)
SELECT id, email, email, 'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
