-- ====================================================================================
-- PERBAIKAN RLS (ROW-LEVEL SECURITY) UNTUK TABEL KEGIATAN & PARTISIPASI
-- Salin dan tempel (Paste) seluruh kode ini ke dalam menu "SQL Editor" di Dashboard Supabase Anda,
-- kemudian klik tombol "Run" untuk memperbaiki fitur input kegiatan.
-- ====================================================================================

---------------------------------------------------------
-- 1. KEBIJAKAN TABEL 'kegiatan' (Master Data Kegiatan)
---------------------------------------------------------
-- Izinkan semua user yang login untuk melihat daftar kegiatan
DROP POLICY IF EXISTS "Activities are viewable by authenticated users" ON public.kegiatan;
CREATE POLICY "Activities are viewable by authenticated users" 
ON public.kegiatan FOR SELECT TO authenticated USING (true);

-- Hanya Admin yang boleh menambah, mengubah, atau menghapus kegiatan
DROP POLICY IF EXISTS "Activities are manageable by admins only" ON public.kegiatan;
CREATE POLICY "Activities are manageable by admins only" 
ON public.kegiatan FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


---------------------------------------------------------
-- 2. KEBIJAKAN TABEL 'user_kegiatan' (Partisipasi Anggota)
---------------------------------------------------------
-- User bisa melihat partisipasi mereka sendiri, Admin bisa melihat semua
DROP POLICY IF EXISTS "Users can view own participation or admin all" ON public.user_kegiatan;
CREATE POLICY "Users can view own participation or admin all" 
ON public.user_kegiatan FOR SELECT TO authenticated 
USING (
  auth.uid() = id_user 
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- User bisa mengirim bukti partisipasi (Insert)
DROP POLICY IF EXISTS "Users can submit participation" ON public.user_kegiatan;
CREATE POLICY "Users can submit participation" 
ON public.user_kegiatan FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id_user);

-- Hanya Admin yang bisa memvalidasi (Update status & skor)
DROP POLICY IF EXISTS "Only admins can validate participation" ON public.user_kegiatan;
CREATE POLICY "Only admins can validate participation" 
ON public.user_kegiatan FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Hanya Admin yang bisa menghapus data partisipasi
DROP POLICY IF EXISTS "Only admins can delete participation" ON public.user_kegiatan;
CREATE POLICY "Only admins can delete participation" 
ON public.user_kegiatan FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
