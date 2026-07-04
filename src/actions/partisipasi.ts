"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitKehadiran(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk melakukan konfirmasi." };
  }

  const id_kegiatan = formData.get("id_kegiatan") as string;

  // 2. Simpan ke Database
  const { error: dbError } = await supabase
    .from("user_kegiatan")
    .insert({
      id_user: user.id,
      id_kegiatan: parseInt(id_kegiatan) || 0,
      bukti_storage_path: null,
      status_validasi: "pending",
      skor_didapat: 0,
    });

  if (dbError) {
    return { error: `Gagal simpan partisipasi: ${dbError.message}` };
  }

  revalidatePath("/user/kegiatan");
  revalidatePath("/admin/validasi");
  return { success: "Konfirmasi kehadiran berhasil dikirim! Menunggu validasi admin." };
}

export async function validatePartisipasi(id: number, status: "approved" | "rejected") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const role = user?.user_metadata?.role;
  if (role !== "admin") {
    return { error: "Hanya admin yang dapat memvalidasi partisipasi." };
  }

  // Ambil bobot skor dari kegiatan terkait jika disetujui
  let scoreToAward = 0;
  if (status === "approved") {
    const { data: participation } = await supabase
      .from("user_kegiatan")
      .select("kegiatan_id, kegiatan:kegiatan_id(bobot_skor)")
      .eq("id", id)
      .single();
    
    scoreToAward = (participation as { kegiatan?: { bobot_skor?: number } } | null)?.kegiatan?.bobot_skor || 0;
  }

  const { error } = await supabase
    .from("user_kegiatan")
    .update({
      status_validasi: status,
      skor_didapat: scoreToAward,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/validasi");
  revalidatePath("/user"); // Untuk update leaderboard
  return { success: `Partisipasi berhasil di-${status}!` };
}
