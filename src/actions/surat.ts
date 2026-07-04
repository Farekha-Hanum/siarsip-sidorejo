"use server";

import { createClient } from "@/lib/supabase/server";
import { generateOfficialLetter } from "@/lib/pdf-utils";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

/**
 * Helper to convert Indonesian date strings (e.g. "5 Desember 2024") 
 * into ISO format (YYYY-MM-DD) for PostgreSQL.
 */
function parseIndonesianDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  const months: Record<string, string> = {
    januari: "01", februari: "02", maret: "03", april: "04", mei: "05", juni: "06",
    juli: "07", agustus: "08", september: "09", oktober: "10", november: "11", desember: "12",
    jan: "01", feb: "02", mar: "03", apr: "04", jun: "06", jul: "07", agt: "08", agu: "08", sep: "09", okt: "10", nov: "11", des: "12"
  };

  const cleanStr = dateStr.toLowerCase().replace(/,/g, '').trim();
  const parts = cleanStr.split(/\s+/);
  
  let day = "", month = "", year = "";

  for (const part of parts) {
    if (/^\d{1,2}$/.test(part) && !day) {
      day = part.padStart(2, '0');
    } else if (months[part]) {
      month = months[part];
    } else if (/^\d{4}$/.test(part)) {
      year = part;
    }
  }

  if (day && month && year) {
    return `${year}-${month}-${day}`;
  }

  // Fallback if parsing fails
  return new Date().toISOString().split('T')[0];
}

type EditableLetterPayload = {
  nomorSurat: string;
  perihal: string;
  nama: string;
  nik: string;
  keperluan: string;
  tanggal: string;
  signatureBase64?: string;
};

async function getKopSuratBuffer() {
  const candidateFiles = ["kop-surat.png", "kop-surat.png.jpeg", "kop-surat.jpeg", "kop-surat.jpg"];

  for (const fileName of candidateFiles) {
    try {
      const kopPath = path.join(process.cwd(), "public", fileName);
      const buffer = await fs.readFile(kopPath);
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } catch {
      // Try next candidate
    }
  }

  console.warn("Kop surat tidak ditemukan di folder public. Melanjutkan tanpa kop.");
  return undefined;
}

async function generateAndUploadOfficialPdf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: EditableLetterPayload,
  previousPath?: string | null
) {
  const kopBuffer = await getKopSuratBuffer();

  const pdfBytes = await generateOfficialLetter(
    {
      nomorSurat: payload.nomorSurat,
      perihal: payload.perihal,
      nama: payload.nama,
      nik: payload.nik,
      keperluan: payload.keperluan,
      tanggal: payload.tanggal,
      signatureBase64: payload.signatureBase64 || "",
    },
    kopBuffer
  );

  const fileName = `surat_${Date.now()}.pdf`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("archives")
    .upload(fileName, pdfBytes, {
      contentType: "application/pdf",
    });

  if (uploadError) {
    return { error: `Gagal upload PDF: ${uploadError.message}` };
  }

  if (previousPath) {
    await supabase.storage.from("archives").remove([previousPath]);
  }

  return { path: uploadData.path };
}

export async function createOfficialLetter(formData: FormData, signatureData: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk membuat surat." };
  }

  const nomorSurat = formData.get("nomor_surat") as string;
  const perihal = formData.get("perihal") as string;
  const nama = formData.get("nama") as string;
  const nik = formData.get("nik") as string;
  const keperluan = formData.get("keperluan") as string;
  const tanggal = formData.get("tanggal") as string;

  const uploadResult = await generateAndUploadOfficialPdf(
    supabase,
    {
      nomorSurat,
      perihal,
      nama,
      nik,
      keperluan,
      tanggal,
      signatureBase64: signatureData,
    }
  );

  if (uploadResult.error) {
    return uploadResult;
  }

  const kategoriDashboard = (formData.get("kategori_dashboard") as string) || "gabungan";

  // 4. Save to Database
  const { error: dbError } = await supabase
    .from("surat")
    .insert({
      id_user: user.id,
      jenis_surat: "keluar_otomatis",
      nomor_surat: nomorSurat,
      perihal: perihal,
      tanggal_surat: tanggal,
      storage_path: uploadResult.path,
      status_digital_signature: !!signatureData,
      kategori_dashboard: kategoriDashboard,
    });

  if (dbError) {
    return { error: `Gagal simpan data surat ke database: ${dbError.message}` };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/surat-digital", "layout");
  revalidatePath("/user/surat-digital", "layout");
  
  return { success: "Surat berhasil dibuat dan disimpan!" };
}

export async function getSignedUrl(path: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk mengakses file." };
  }

  const { data, error } = await supabase.storage
    .from("archives")
    .createSignedUrl(path, 60); // 1 minute expiry

  if (error) {
    return { error: error.message };
  }

  return { url: data.signedUrl };
}

export async function uploadScannedSurat(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk mengunggah surat." };
  }

  const file = formData.get("file") as File;
  const nomorSurat = formData.get("nomor_surat") as string;
  const perihal = formData.get("perihal") as string;
  const jenisSurat = formData.get("jenis_surat") as string;
  const pengirim = formData.get("nama_pengirim") as string;
  const tanggal = formData.get("tanggal_surat") as string;

  if (!file) {
    return { error: "File gambar tidak ditemukan." };
  }

  // 1. Upload ke Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `scan_${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("archives")
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (uploadError) {
    return { error: `Gagal upload gambar: ${uploadError.message}` };
  }

  const kategoriDashboard = (formData.get("kategori_dashboard") as string) || "gabungan";

  // 2. Simpan ke Database
  const { error: dbError } = await supabase
    .from("surat")
    .insert({
      id_user: user.id,
      jenis_surat: "masuk_scan",
      nomor_surat: nomorSurat || "TANPA NOMOR",
      perihal: `[${jenisSurat || 'Surat'}] ${perihal || 'Tanpa Perihal'}`,
      tanggal_surat: parseIndonesianDate(tanggal),
      storage_path: uploadData.path,
      kategori_dashboard: kategoriDashboard,
      metadata: {
        original_date: tanggal,
        sender: pengirim
      }
    });

  if (dbError) {
    return { error: `Gagal simpan ke database: ${dbError.message}` };
  }

  // Revalidasi menyeluruh agar muncul di admin & user secara instan
  revalidatePath("/", "layout");
  revalidatePath("/admin/surat-digital", "layout");
  revalidatePath("/user/surat-digital", "layout");
  
  return { success: "Surat berhasil discan dan disimpan!" };
}

export async function updateSuratMetadata(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk memperbarui surat." };
  }

  const role = user?.user_metadata?.role;
  if (role !== "admin") {
    return { error: "Hanya admin yang dapat memperbarui surat." };
  }

  const suratId = Number(formData.get("id"));
  const nomorSurat = (formData.get("nomor_surat") as string) || null;
  const perihal = formData.get("perihal") as string;
  const tanggalSurat = formData.get("tanggal_surat") as string;

  if (!suratId || !perihal || !tanggalSurat) {
    return { error: "Data surat tidak lengkap." };
  }

  const { error } = await supabase
    .from("surat")
    .update({
      nomor_surat: nomorSurat,
      perihal,
      tanggal_surat: tanggalSurat,
    })
    .eq("id", suratId);

  if (error) {
    return { error: `Gagal memperbarui surat: ${error.message}` };
  }

  revalidatePath("/admin/surat-digital", "layout");
  revalidatePath("/user/surat-digital", "layout");
  return { success: "Data surat berhasil diperbarui." };
}

export async function deleteSurat(suratId: number, storagePath?: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk menghapus surat." };
  }

  const role = user?.user_metadata?.role;
  if (role !== "admin") {
    return { error: "Hanya admin yang dapat menghapus surat." };
  }

  const { error: dbError } = await supabase
    .from("surat")
    .delete()
    .eq("id", suratId);

  if (dbError) {
    return { error: `Gagal menghapus data surat: ${dbError.message}` };
  }

  if (storagePath) {
    await supabase.storage.from("archives").remove([storagePath]);
  }

  revalidatePath("/admin/surat-digital", "layout");
  revalidatePath("/user/surat-digital", "layout");
  return { success: "Surat berhasil dihapus." };
}

export async function regenerateOfficialLetterPdf(formData: FormData, signatureData: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk memperbarui PDF surat." };
  }

  const role = user?.user_metadata?.role;
  if (role !== "admin") {
    return { error: "Hanya admin yang dapat memperbarui PDF surat." };
  }

  const suratId = Number(formData.get("id"));
  const nomorSurat = formData.get("nomor_surat") as string;
  const perihal = formData.get("perihal") as string;
  const nama = formData.get("nama") as string;
  const nik = formData.get("nik") as string;
  const keperluan = formData.get("keperluan") as string;
  const tanggal = formData.get("tanggal") as string;

  if (!suratId || !nomorSurat || !perihal || !nama || !nik || !keperluan || !tanggal) {
    return { error: "Data untuk regenerasi surat tidak lengkap." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("surat")
    .select("storage_path, jenis_surat")
    .eq("id", suratId)
    .single();

  if (fetchError || !existing) {
    return { error: "Surat tidak ditemukan." };
  }

  if (existing.jenis_surat !== "keluar_otomatis") {
    return { error: "Hanya surat keluar otomatis yang dapat diregenerasi menjadi PDF." };
  }

  const uploadResult = await generateAndUploadOfficialPdf(
    supabase,
    {
      nomorSurat,
      perihal,
      nama,
      nik,
      keperluan,
      tanggal,
      signatureBase64: signatureData,
    },
    existing.storage_path
  );

  if (uploadResult.error) {
    return uploadResult;
  }

  const { error: updateError } = await supabase
    .from("surat")
    .update({
      nomor_surat: nomorSurat,
      perihal,
      tanggal_surat: tanggal,
      storage_path: uploadResult.path,
      status_digital_signature: !!signatureData,
    })
    .eq("id", suratId);

  if (updateError) {
    return { error: `Gagal memperbarui data surat: ${updateError.message}` };
  }

  revalidatePath("/admin/surat-digital", "layout");
  revalidatePath("/user/surat-digital", "layout");
  return { success: "PDF surat berhasil diperbarui." };
}
