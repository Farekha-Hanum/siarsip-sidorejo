"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Upload, 
  FileSearch, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Save,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import { performOCR, extractSuratData } from "@/lib/ocr-utils";
import { uploadScannedSurat } from "@/actions/surat";
import { useRouter } from "next/navigation";

export default function ScannerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Upload, 2: Review/Save
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState({
    nomor_surat: "",
    tanggal_surat: "",
    perihal: "",
    nama_pengirim: "",
    jenis_surat: "Surat Masuk"
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setLoading(true);
    setStatus("Menganalisis teks (OCR)...");
    setError(null);

    try {
      const text = await performOCR(file);
      const data = extractSuratData(text);
      setExtractedData(data);
      setStep(2);
    } catch (err) {
      setError("Gagal membaca teks dari gambar. Pastikan gambar cukup terang dan jelas.");
    } finally {
      setLoading(false);
      setStatus(null);
    }
  }

  async function handleSave(formData: FormData) {
    if (!selectedFile) return;
    
    setLoading(true);
    setStatus("Menyimpan ke arsip...");
    
    // Tambahkan file ke FormData secara manual jika belum ada
    formData.append("file", selectedFile);

    const result = await uploadScannedSurat(formData);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setStep(3); // Success
      const targetOrg = formData.get("kategori_dashboard") as string;
      setTimeout(() => router.push(`/admin/surat-digital/${targetOrg}`), 2000);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
         <div className="relative z-10">
          <h1 className="text-4xl font-bebas text-slate-800 tracking-tight">Scanner Surat Masuk</h1>
          <p className="text-slate-500 mt-2 max-w-xl">
            Digitalkan surat fisik dengan teknologi OCR. Sistem akan otomatis mendeteksi Nomor Surat, Tanggal, dan Pengirim.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FileSearch size={120} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border-4 border-dashed border-slate-200 hover:border-blue-400 transition-all cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              capture="environment"
              onChange={handleFileChange} 
            />
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Camera size={40} />
            </div>
            <h2 className="text-2xl font-bebas text-slate-800">Ambil Foto atau Pilih Gambar</h2>
            <p className="text-slate-500 mt-2 text-center max-w-sm">
              Klik untuk membuka kamera atau pilih file dari galeri. Pastikan tulisan surat terlihat tajam.
            </p>
            
            {loading && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-2xl z-20">
                <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                <p className="font-bold text-slate-800">{status}</p>
                <p className="text-sm text-slate-500 mt-1 italic tracking-wide">Biasanya membutuhkan waktu 10-20 detik...</p>
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Image Preview */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center min-h-[400px] relative border-4 border-white shadow-xl">
              {imagePreview && (
                <img src={imagePreview} alt="Scan Preview" className="max-w-full max-h-full object-contain" />
              )}
               <button 
                onClick={() => setStep(1)}
                className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/30"
              >
                <RefreshCw size={16} /> Scan Ulang
              </button>
            </div>

            {/* Verification Form */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-xl font-bebas text-slate-800">Verifikasi Hasil Scan</h3>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">OCR Selesai</span>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form action={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nomor Surat</label>
                  <input 
                    name="nomor_surat" 
                    defaultValue={extractedData.nomor_surat} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tanggal Surat</label>
                  <input 
                    name="tanggal_surat" 
                    type="text"
                    placeholder="Contoh: 12 April 2024"
                    defaultValue={extractedData.tanggal_surat} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Pengirim</label>
                  <input 
                    name="nama_pengirim" 
                    defaultValue={extractedData.nama_pengirim} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Perihal</label>
                  <textarea 
                    name="perihal" 
                    rows={2}
                    defaultValue={extractedData.perihal} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Jenis Surat</label>
                  <select 
                    name="jenis_surat" 
                    defaultValue={extractedData.jenis_surat}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option>Surat Masuk</option>
                    <option>Surat Undangan</option>
                    <option>Surat Edaran</option>
                    <option>Surat Keterangan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kategori Dashboard (Arsip)</label>
                  <select 
                    name="kategori_dashboard" 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="ipnu">IPNU</option>
                    <option value="ippnu">IPPNU</option>
                    <option value="gabungan">Gabungan</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:bg-slate-300"
                  >
                    <Save size={20} /> {loading ? "Menyimpan..." : "Simpan ke Arsip Digital"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-20 rounded-3xl border border-slate-100 shadow-xl flex flex-col items-center text-center gap-6"
          >
            <CheckCircle2 size={80} className="text-green-500" />
            <div>
              <h2 className="text-4xl font-bebas text-slate-800">Berhasil Disimpan!</h2>
              <p className="text-slate-500 mt-2">Data surat telah masuk ke dalam arsip digital dan siap dikelola.</p>
            </div>
            <button 
              onClick={() => setStep(1)}
              className="text-blue-600 font-bold hover:underline flex items-center gap-2"
            >
              Scan Surat Lainnya <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
