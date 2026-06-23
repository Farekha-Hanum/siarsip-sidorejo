"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, 
  Calendar, 
  Award, 
  X, 
  Clock, 
  Check, 
  AlertCircle,
  Zap,
  TrendingUp,
  Target
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitKehadiran } from "@/actions/partisipasi";

const NU_DARK  = "#0d3320";
const NU_GREEN = "#1f9a5e";
const NU_GOLD  = "#f4c430";

export default function UserKegiatanPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [userParticipations, setUserParticipations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKegiatan, setSelectedKegiatan] = useState<any>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [totalSkor, setTotalSkor] = useState(0);
  const supabase = createClient();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: acts } = await supabase.from("kegiatan").select("*").order("tanggal_kegiatan", { ascending: false });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: parts } = await supabase.from("user_kegiatan").select("*").eq("id_user", user.id);
      setUserParticipations(parts || []);

      // Calculate total approved score
      const { data: leaderboard } = await supabase.from("view_leaderboard").select("total_skor").eq("id", user.id).single();
      if (leaderboard) setTotalSkor(leaderboard.total_skor || 0);
    }
    setActivities(acts || []);
    setLoading(false);
  }

  const getParticipationStatus = (kegiatanId: number) =>
    userParticipations.find(p => p.id_kegiatan === kegiatanId);

  async function handleConfirmAttendance(kegiatanId: number, isPresent: boolean) {
    if (!isPresent) {
      setSelectedKegiatan(null);
      return;
    }
    setConfirmLoading(true);
    const formData = new FormData();
    formData.append("id_kegiatan", kegiatanId.toString());
    
    const result = await submitKehadiran(formData);
    setConfirmLoading(false);
    if (result.success) {
      setConfirmSuccess(true);
      fetchData();
      setTimeout(() => { setSelectedKegiatan(null); setConfirmSuccess(false); }, 1500);
    } else {
      alert(result.error);
    }
  }

  const progress = Math.min((totalSkor / 70) * 100, 100);

  return (
    <div className="space-y-8 pb-12">
      {/* ===== HEADER SECTION WITH DIAGRAM ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="p-8 md:p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})` }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white"><TrendingUp size={200} /></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 text-[#80e5b0]">✦ Laporan Keaktifan Anggota</p>
            <h1 className="font-bebas text-5xl md:text-6xl tracking-tight leading-none mb-4">Input Kegiatan</h1>
            <p className="text-white/60 text-sm max-w-sm mb-6 leading-relaxed">
              Konfirmasi kehadiran Anda pada setiap kegiatan ranting untuk mengumpulkan poin. 
              Poin ini digunakan sebagai syarat mendapatkan sertifikat **Anggota Terbest**.
            </p>
            
            <div className="flex gap-3">
              <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2">
                <Zap size={16} className="text-[#f4c430]" />
                <span className="text-xs font-bold text-white">{totalSkor} Poin Terkumpul</span>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2">
                <Target size={16} className="text-[#f4c430]" />
                <span className="text-xs font-bold text-white">Target 70 Poin</span>
              </div>
            </div>
          </div>

          {/* Mini Radial Gauge Diagram */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <motion.circle 
                  cx="50" cy="50" r="44" fill="none" stroke="#f4c430" strokeWidth="8" 
                  strokeDasharray="276"
                  initial={{ strokeDashoffset: 276 }}
                  animate={{ strokeDashoffset: 276 - (276 * progress / 100) }}
                  transition={{ duration: 1.5 }}
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-bebas text-4xl leading-none">{Math.round(progress)}%</p>
                <p className="text-[8px] font-black opacity-60 uppercase tracking-widest mt-1">Goal</p>
              </div>
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#f4c430]">Progres Terbest</p>
          </div>
        </div>
      </motion.div>

      {/* ===== ACTIVITY LIST ===== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bebas text-2xl text-slate-400 tracking-widest">RIWAYAT KEGIATAN</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{activities.length} Total</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-28 rounded-3xl animate-pulse bg-slate-100" />
            ))
          ) : activities.map((k, i) => {
            const part = getParticipationStatus(k.id);
            return (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-[2rem] flex items-center justify-between group border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-[#f0faf4] group-hover:scale-110">
                    <Calendar size={24} style={{ color: NU_GREEN }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-700">{k.nama_kegiatan}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <Clock size={12} />
                        {new Date(k.tanggal_kegiatan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[#fdf8e6] text-[#7a4f00] border border-[#f4c430]/10">
                        +{k.bobot_skor} POIN
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {part ? (
                    part.status_validasi === "approved" ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-black px-4 py-2 rounded-xl bg-[#f0faf4] text-[#1f9a5e] border border-[#1f9a5e]/10">
                        <CheckCircle2 size={14} /> TERVERIFIKASI
                      </span>
                    ) : part.status_validasi === "pending" ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-black px-4 py-2 rounded-xl bg-[#fdf8e6] text-[#7a4f00] border border-[#f4c430]/10 animate-pulse">
                        <Clock size={14} /> MENUNGGU
                      </span>
                    ) : (
                      <button onClick={() => setSelectedKegiatan(k)}
                        className="text-[11px] font-black px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                        DITOLAK / ULANG
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => setSelectedKegiatan(k)}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black transition-all hover:scale-105 bg-[#1f9a5e] text-white shadow-lg shadow-[#1f9a5e]/20"
                    >
                      KONFIRMASI HADIR
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedKegiatan && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]" style={{ background: "rgba(13,31,20,0.6)", backdropFilter: "blur(8px)" }}
              onClick={() => !confirmLoading && setSelectedKegiatan(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[3rem] shadow-2xl z-[110] overflow-hidden"
              style={{ border: "1px solid rgba(31,154,94,0.1)" }}
            >
              {/* Modal header */}
              <div className="px-8 py-6 flex justify-between items-center"
                style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})` }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#80e5b0]">Konfirmasi Kehadiran</p>
                  <h2 className="font-bebas text-3xl text-white tracking-tight">Klaim Poin Kegiatan</h2>
                </div>
                <button onClick={() => setSelectedKegiatan(null)}
                  className="p-2 rounded-xl bg-white/10 text-white/70 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>

              {confirmSuccess ? (
                <div className="p-16 text-center flex flex-col items-center gap-5">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-[#f0faf4] flex items-center justify-center text-[#1f9a5e] shadow-xl">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <p className="font-bebas text-3xl text-slate-800">Berhasil Terkirim!</p>
                    <p className="text-sm text-slate-500 mt-1">Status kehadiran Anda akan segera diverifikasi oleh admin.</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 space-y-6">
                  <div className="p-6 rounded-[2rem] text-center bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nama Kegiatan</p>
                    <h3 className="font-bold text-xl text-slate-700">{selectedKegiatan.nama_kegiatan}</h3>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black bg-[#fdf8e6] text-[#7a4f00] border border-[#f4c430]/10">
                      <Award size={16} /> +{selectedKegiatan.bobot_skor} POIN TERBEST
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      disabled={confirmLoading}
                      onClick={() => handleConfirmAttendance(selectedKegiatan.id, true)}
                      className="py-5 rounded-[2rem] font-black text-sm flex flex-col items-center gap-2 transition-all hover:scale-105 shadow-xl shadow-[#1f9a5e]/20"
                      style={{ background: `linear-gradient(135deg, ${NU_GREEN}, #145c38)`, color: "white" }}
                    >
                      <Check size={28} />
                      {confirmLoading ? "MENGIRIM..." : "SAYA HADIR"}
                    </button>
                    <button
                      disabled={confirmLoading}
                      onClick={() => handleConfirmAttendance(selectedKegiatan.id, false)}
                      className="py-5 rounded-[2rem] font-black text-sm flex flex-col items-center gap-2 transition-all bg-white text-slate-400 border border-slate-100 shadow-sm hover:bg-slate-50"
                    >
                      <X size={28} />
                      BATALKAN
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-center text-slate-400 italic">
                    *Pastikan Anda benar-benar hadir untuk menjaga integritas poin.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
