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
  const parsedId = parseInt(id_kegiatan) || 0;

  if (!parsedId) {
    return { error: "ID kegiatan tidak valid." };
  }

  // 1. Cek apakah user sudah pernah submit kegiatan ini (Mencegah duplikasi data saat input bersamaan)
  const { data: existing } = await supabase
    .from("user_kegiatan")
    .select("id, status_validasi")
    .eq("id_user", user.id)
    .eq("id_kegiatan", parsedId)
    .maybeSingle();

  if (existing) {
    return { error: "Anda sudah melakukan konfirmasi kehadiran untuk kegiatan ini." };
  }

  // 2. Simpan ke Database
  const { error: dbError } = await supabase
    .from("user_kegiatan")
    .insert({
      id_user: user.id,
      id_kegiatan: parsedId,
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
      .select("id_kegiatan, kegiatan(bobot_skor)")
      .eq("id", id)
      .single();
    
    if ((participation as any)?.kegiatan?.bobot_skor) {
      scoreToAward = (participation as any).kegiatan.bobot_skor;
    } else if (participation?.id_kegiatan) {
      const { data: keg } = await supabase
        .from("kegiatan")
        .select("bobot_skor")
        .eq("id", participation.id_kegiatan)
        .single();
      scoreToAward = keg?.bobot_skor || 10;
    }
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
  revalidatePath("/admin/kegiatan");
  revalidatePath("/user"); // Untuk update leaderboard
  return { success: `Partisipasi berhasil di-${status}!` };
}
