"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateLetterNumber } from "@/lib/numbering";

/**
 * Save a new letter to the database with auto-numbering.
 */
export async function saveLetter(payload: {
  nomor_surat: string;
  perihal: string;
  jenis_surat: string;
  tanggal_surat: string;
  kategori_dashboard: string;
  metadata?: Record<string, any>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk membuat surat." };
  }

  const role = user?.user_metadata?.role;
  if (role !== "admin") {
    return { error: "Hanya admin yang dapat membuat surat." };
  }

  // Save to database
  const { error: dbError } = await supabase.from("surat").insert({
    id_user: user.id,
    jenis_surat: payload.jenis_surat || "keluar_otomatis",
    nomor_surat: payload.nomor_surat,
    perihal: payload.perihal,
    tanggal_surat: payload.tanggal_surat,
    kategori_dashboard: payload.kategori_dashboard,
    sub_kategori: "surat-digital",
    metadata: payload.metadata || {},
  });

  if (dbError) {
    return { error: `Gagal menyimpan surat: ${dbError.message}` };
  }

  revalidatePath("/", "layout");
  return { success: "Surat berhasil dibuat dan diarsipkan!", nomorSurat: payload.nomor_surat };
}

/**
 * Fetch letters for a specific org dashboard (admin-only archive view).
 */
export async function getLettersByOrg(org: string, category?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("surat")
    .select("*, profiles(nama_lengkap)")
    .eq("kategori_dashboard", org)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("sub_kategori", category);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: [] };
  }

  return { data: data || [] };
}
