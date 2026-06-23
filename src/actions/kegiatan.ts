"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertKegiatan(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk mengelola kegiatan." };
  }

  const id = formData.get("id") as string;
  const nama_kegiatan = formData.get("nama_kegiatan") as string;
  const tanggal_kegiatan = formData.get("tanggal_kegiatan") as string;
  const deskripsi = formData.get("deskripsi") as string;
  const bobot_skor = parseInt(formData.get("bobot_skor") as string) || 0;

  const dataToSave = {
    nama_kegiatan,
    tanggal_kegiatan,
    deskripsi,
    bobot_skor,
  };

  if (id) {
    // Update
    const { error } = await supabase
      .from("kegiatan")
      .update(dataToSave)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    // Create
    const { error } = await supabase
      .from("kegiatan")
      .insert(dataToSave);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/kegiatan");
  revalidatePath("/user/kegiatan");
  return { success: "Kegiatan berhasil disimpan!" };
}

export async function deleteKegiatan(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login." };
  }

  const { error } = await supabase
    .from("kegiatan")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/kegiatan");
  revalidatePath("/user/kegiatan");
  return { success: "Kegiatan berhasil dihapus!" };
}
