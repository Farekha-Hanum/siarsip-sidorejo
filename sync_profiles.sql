-- 1. Menyisipkan profil yang hilang dari auth.users ke public.profiles
INSERT INTO public.profiles (id, username, nama_lengkap, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)), 
  COALESCE(raw_user_meta_data->>'nama_lengkap', 'Anggota Baru'), 
  COALESCE(raw_user_meta_data->>'role', 'user')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
