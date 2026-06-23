import { createWorker } from "tesseract.js";

export async function performOCR(imageFile: File | string, onProgress?: (progress: number) => void) {
  const worker = await createWorker("ind+eng");
  
  try {
    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error("OCR Error:", error);
    await worker.terminate();
    throw error;
  }
}

export function extractSuratData(text: string) {
  // Regex patterns (Case Insensitive)
  const patterns = {
    nomor: /Nomor\s*:\s*([^\n\r]+)/i,
    tanggal: /(\d{1,2}\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+\d{4})/i,
    perihal: /Perihal\s*:\s*([^\n\r]+)/i,
    pengirim: /Pengirim\s*:\s*([^\n\r]+)/i,
    // Jenis surat biasanya dideteksi dari judul atau sapaan
    jenis: /(Surat Undangan|Surat Edaran|Surat Keterangan|Surat Masuk)/i,
  };

  const results = {
    nomor_surat: text.match(patterns.nomor)?.[1]?.trim() || "",
    tanggal_surat: text.match(patterns.tanggal)?.[1]?.trim() || "",
    perihal: text.match(patterns.perihal)?.[1]?.trim() || "",
    nama_pengirim: text.match(patterns.pengirim)?.[1]?.trim() || "",
    jenis_surat: text.match(patterns.jenis)?.[1]?.trim() || "Surat Masuk",
  };

  return results;
}
