"use server";

import { createClient } from "@/lib/supabase/server";
import { toRoman, getLetterCategory, getOrgConfig } from "@/lib/org-config";

/**
 * Generate the next sequential letter number for a given org + category.
 * Format: [NO]/[WILAYAH]/[KODE_KATEGORI]/[KODE_ORG]/[PERIODE]/[BULAN_ROMAN]/[TAHUN]
 * Example: 001/PR/SM/7455/XXIV/XI/2026
 */
function formatLetterNumber(
  seq: number,
  wilayah: string,
  category: { kode: string },
  kodeOrg: string,
  periode: string
): string {
  const seqStr = String(seq).padStart(3, "0");
  const now = new Date();
  const bulanRoman = toRoman(now.getMonth() + 1);
  const tahun = now.getFullYear();
  return `${seqStr}/${wilayah}/${category.kode}/${kodeOrg}/${periode}/${bulanRoman}/${tahun}`;
}

export async function generateLetterNumber(
  org: string,
  categorySlug: string
): Promise<{ number: string; error?: string }> {
  const supabase = await createClient();

  const config = getOrgConfig(org);
  const category = getLetterCategory(org, categorySlug);

  if (!config || !category) {
    return { number: "", error: "Konfigurasi organisasi atau kategori tidak ditemukan." };
  }

  // Get settings from database (wilayah & periode)
  let wilayah = "PR";
  let periode = "XXIV";

  const { data: settings } = await supabase
    .from("settings")
    .select("wilayah_pimpinan, periode")
    .eq("org_type", org)
    .single();

  if (settings) {
    wilayah = settings.wilayah_pimpinan || wilayah;
    periode = settings.periode || periode;
  }

  const kodeOrg = config.kodeOrganisasi || "IPNU-IPPNU";

  // Retry loop to handle race condition
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { count, error } = await supabase
      .from("surat")
      .select("id", { count: "exact", head: true })
      .eq("kategori_dashboard", org)
      .eq("sub_kategori", categorySlug);

    if (error) {
      return { number: "", error: `Gagal menghitung nomor surat: ${error.message}` };
    }

    const nextSeq = (count || 0) + 1;
    const nomorSurat = formatLetterNumber(nextSeq, wilayah, category, kodeOrg, periode);

    // Verify the number doesn't already exist (mitigates race condition)
    const { data: existing } = await supabase
      .from("surat")
      .select("id")
      .eq("nomor_surat", nomorSurat)
      .maybeSingle();

    if (!existing) {
      return { number: nomorSurat };
    }
  }

  // Fallback: if all attempts fail, use timestamp-based number
  const fallbackSeq = String(Date.now()).slice(-5);
  const now = new Date();
  const bulanRoman = toRoman(now.getMonth() + 1);
  const tahun = now.getFullYear();
  const nomorSurat = `${fallbackSeq}/${wilayah}/${category.kode}/${kodeOrg}/${periode}/${bulanRoman}/${tahun}`;

  return { number: nomorSurat };
}
