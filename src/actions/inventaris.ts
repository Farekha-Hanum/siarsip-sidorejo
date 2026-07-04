"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertInventaris(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk mengelola inventaris." };
  }

  const role = user?.user_metadata?.role;
  if (role !== "admin") {
    return { error: "Hanya admin yang dapat mengelola inventaris." };
  }

  const id = formData.get("id") as string;
  const nama_barang = formData.get("nama_barang") as string;
  const jumlah = parseInt(formData.get("jumlah") as string) || 0;
  const kondisi = formData.get("kondisi") as string;
  const keterangan = formData.get("keterangan") as string;

  const dataToSave = {
    nama_barang,
    jumlah,
    kondisi,
    keterangan,
  };

  if (id) {
    // Update
    const { error } = await supabase
      .from("inventaris")
      .update(dataToSave)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    // Create
    const { error } = await supabase
      .from("inventaris")
      .insert(dataToSave);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/inventaris");
  revalidatePath("/user/inventaris");
  return { success: "Data inventaris berhasil disimpan!" };
}

export async function deleteInventaris(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login." };
  }

  const role = user?.user_metadata?.role;
  if (role !== "admin") {
    return { error: "Hanya admin yang dapat menghapus inventaris." };
  }

  const { error } = await supabase
    .from("inventaris")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/inventaris");
  revalidatePath("/user/inventaris");
  return { success: "Barang berhasil dihapus!" };
}
