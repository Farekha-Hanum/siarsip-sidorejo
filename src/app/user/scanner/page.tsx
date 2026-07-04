"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  FileSearch, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Save,
  ArrowRight
} from "lucide-react";
import { performOCR, extractSuratData } from "@/lib/ocr-utils";
import { uploadScannedSurat } from "@/actions/surat";
import { useRouter } from "next/navigation";

const NU_GREEN = "#1f9a5e";
const NU_DARK  = "#0d3320";

export default function UserScannerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Upload, 2: Review/Save, 3: Success
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
    
    formData.append("file", selectedFile);

    const result = await uploadScannedSurat(formData);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setStep(3); // Success
      const targetOrg = formData.get("kategori_dashboard") as string;
      setTimeout(() => router.push(`/user/surat-digital/${targetOrg}`), 2000);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
         <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1f9a5e]">Fitur Digitalisasi</span>
          </div>
          <h1 className="text-5xl font-bebas text-slate-800 tracking-tight">Scanner Surat Otomatis</h1>
          <p className="text-slate-500 mt-2 max-w-xl text-sm">
            Gunakan kamera HP Anda untuk memindai surat fisik. Sistem akan otomatis mengisi data surat ke arsip digital.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
          <FileSearch size={160} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center p-16 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 hover:border-[#1f9a5e] transition-all cursor-pointer group relative overflow-hidden"
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
            <div className="w-24 h-24 bg-[#f0faf4] text-[#1f9a5e] rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
              <Camera size={44} />
            </div>
            <h2 className="text-3xl font-bebas text-slate-800">Mulai Memindai Surat</h2>
            <p className="text-slate-400 mt-2 text-center max-w-sm text-sm font-medium">
              Klik untuk mengambil foto surat masuk. Pastikan posisi kamera tegak lurus dan pencahayaan terang.
            </p>
            
            {loading && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-2xl z-20">
                <div className="w-20 h-20 relative mb-6">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-[#1f9a5e] border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={24} className="text-[#1f9a5e] animate-pulse" />
                  </div>
                </div>
                <p className="font-bebas text-2xl text-slate-800">{status}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Kecerdasan Buatan Sedang Bekerja...</p>
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
            <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden flex items-center justify-center min-h-[500px] relative border-8 border-white shadow-2xl">
              {imagePreview && (
                <img src={imagePreview} alt="Scan Preview" className="max-w-full max-h-full object-contain" />
              )}
               <button 
                onClick={() => setStep(1)}
                className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-white/30 transition-all"
              >
                <RefreshCw size={16} /> Scan Ulang
              </button>
            </div>

            {/* Verification Form */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div>
                  <h3 className="text-2xl font-bebas text-slate-800 tracking-tight">Verifikasi Hasil Scan</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pastikan data di bawah ini sudah sesuai dengan isi surat.</p>
                </div>
                <span className="bg-[#f0faf4] text-[#1f9a5e] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-[#1f9a5e]/10">AI Active</span>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-100">
                  <AlertCircle size={20} />
                  <span className="text-xs font-bold">{error}</span>
                </div>
              )}

              <form action={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Surat</label>
                    <input 
                      name="nomor_surat" 
                      defaultValue={extractedData.nomor_surat} 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#1f9a5e] text-sm font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Surat</label>
                    <input 
                      name="tanggal_surat" 
                      type="text"
                      placeholder="Contoh: 12 April 2024"
                      defaultValue={extractedData.tanggal_surat} 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#1f9a5e] text-sm font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Pengirim</label>
                  <input 
                    name="nama_pengirim" 
                    defaultValue={extractedData.nama_pengirim} 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#1f9a5e] text-sm font-bold text-slate-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perihal</label>
                  <textarea 
                    name="perihal" 
                    rows={2}
                    defaultValue={extractedData.perihal} 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#1f9a5e] text-sm font-bold text-slate-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Surat</label>
                    <select 
                      name="jenis_surat" 
                      defaultValue={extractedData.jenis_surat}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold text-slate-700"
                    >
                      <option>Surat Masuk</option>
                      <option>Surat Undangan</option>
                      <option>Surat Edaran</option>
                      <option>Surat Keterangan</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Arsip</label>
                    <select 
                      name="kategori_dashboard" 
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold text-slate-700"
                    >
                      <option value="ipnu">IPNU</option>
                      <option value="ippnu">IPPNU</option>
                      <option value="gabungan">Gabungan</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 shadow-2xl transition-all disabled:opacity-50"
                    style={{ 
                      background: `linear-gradient(135deg, ${NU_GREEN}, #145c38)`, 
                      color: "white",
                      boxShadow: "0 10px 30px rgba(31,154,94,0.3)"
                    }}
                  >
                    <Save size={20} /> {loading ? "Menyimpan..." : "SIMPAN KE ARSIP DIGITAL"}
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
            className="bg-white p-24 rounded-[3rem] border border-slate-100 shadow-2xl flex flex-col items-center text-center gap-8"
          >
            <div className="w-24 h-24 rounded-[2.5rem] bg-[#f0faf4] flex items-center justify-center text-[#1f9a5e] shadow-xl ring-8 ring-[#f0faf4]">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h2 className="text-5xl font-bebas text-slate-800 tracking-tight">Berhasil Disimpan!</h2>
              <p className="text-slate-400 mt-2 text-sm font-medium">Data surat telah berhasil didigitalkan dan masuk ke arsip ranting.</p>
            </div>
            <button 
              onClick={() => setStep(1)}
              className="px-8 py-4 bg-[#f0faf4] text-[#1f9a5e] rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-[#1f9a5e] hover:text-white transition-all shadow-md"
            >
              Scan Surat Lainnya <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
