"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertPengurus(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk mengelola data pengurus." };
  }

  const role = user?.user_metadata?.role;
  if (role !== "admin") {
    return { error: "Hanya admin yang dapat mengelola data pengurus." };
  }

  const id = formData.get("id") as string;
  const nia = formData.get("nia") as string;
  const nama_lengkap = formData.get("nama_lengkap") as string;
  const jabatan = formData.get("jabatan") as string;
  const alamat = formData.get("alamat") as string;
  const nomor_telepon = formData.get("nomor_telepon") as string;
  const tanggal_bergabung = formData.get("tanggal_bergabung") as string;
  const organisasi = formData.get("organisasi") as string;

  const dataToSave = {
    nia,
    nama_lengkap,
    jabatan,
    alamat,
    nomor_telepon,
    tanggal_bergabung: tanggal_bergabung || null,
    organisasi: organisasi || 'IPNU',
  };

  if (id) {
    // Update
    const { error } = await supabase
      .from("data_pengurus")
      .update(dataToSave)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    // Create
    const { error } = await supabase
      .from("data_pengurus")
      .insert(dataToSave);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/pengurus");
  revalidatePath("/user/pengurus");
  return { success: "Data pengurus berhasil disimpan!" };
}

export async function deletePengurus(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login." };
  }

  const role = user?.user_metadata?.role;
  if (role !== "admin") {
    return { error: "Hanya admin yang dapat menghapus data pengurus." };
  }

  const { error } = await supabase
    .from("data_pengurus")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/pengurus");
  revalidatePath("/user/pengurus");
  return { success: "Data pengurus berhasil dihapus!" };
}
