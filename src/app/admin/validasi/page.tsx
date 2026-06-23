"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, User, Activity, Trophy, Medal, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { validatePartisipasi } from "@/actions/partisipasi";

const NU_DARK  = "#0d3320";
const NU_GREEN = "#1f9a5e";
const NU_GOLD  = "#f4c430";

export default function AdminValidationPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [validatingId, setValidatingId] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => { 
    fetchSubmissions();
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from("view_leaderboard")
      .select("*")
      .order("total_skor", { ascending: false });
    if (data) setLeaderboard(data);
  }

  async function fetchSubmissions() {
    setLoading(true);
    // Mengembalikan join tabel karena schema database sudah kita perbaiki
    const { data, error } = await supabase
      .from("user_kegiatan")
      .select(`
        *,
        profiles(nama_lengkap),
        kegiatan(nama_kegiatan, bobot_skor)
      `)
      .eq("status_validasi", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch Error:", error.message);
    }
    
    setSubmissions(data || []);
    setLoading(false);
  }

  async function handleAction(id: number, status: "approved" | "rejected") {
    setValidatingId(id);
    const result = await validatePartisipasi(id, status);
    if (result.success) {
      setSubmissions(prev => prev.filter(s => s.id !== id));
      fetchLeaderboard();
    }
    else alert(result.error);
    setValidatingId(null);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="p-7 rounded-3xl text-white"
        style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`, boxShadow: "0 8px 32px rgba(31,154,94,0.2)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#80e5b0" }}>✦ Panel Admin</p>
        <h1 className="font-bebas text-4xl tracking-tight leading-none">Reward Anggota</h1>
        <p className="text-white/55 mt-1.5 text-sm max-w-lg">
          Berikan reward dan poin kepada anggota dengan memvalidasi bukti keikutsertaan kegiatan mereka.
        </p>
        {submissions.length > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
            style={{ background: "rgba(244,196,48,0.2)", color: NU_GOLD, border: "1px solid rgba(244,196,48,0.3)" }}>
            {submissions.length} pengajuan menunggu validasi
          </div>
        )}
      </motion.div>

      {loading ? (
        <div className="p-20 flex justify-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin"
            style={{ borderColor: "rgba(31,154,94,0.15)", borderTopColor: NU_GREEN }} />
        </div>
      ) : submissions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="p-20 text-center rounded-3xl bg-white"
          style={{ border: "1px solid rgba(31,154,94,0.1)" }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(31,154,94,0.08)" }}>
            <Check size={36} style={{ color: NU_GREEN }} />
          </div>
          <h3 className="font-bebas text-3xl" style={{ color: NU_DARK }}>Semua Sudah Divalidasi!</h3>
          <p className="mt-2 max-w-xs mx-auto text-sm" style={{ color: "#64748b" }}>
            Tidak ada bukti kegiatan yang menunggu validasi saat ini.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {submissions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-3xl overflow-hidden flex flex-col"
                style={{ border: "1px solid rgba(31,154,94,0.1)", boxShadow: "0 4px 20px rgba(13,31,20,0.06)" }}
              >
                {/* Content */}
                <div className="p-7 flex-1 flex flex-col gap-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${NU_GREEN}, #145c38)` }}>
                        {s.profiles?.nama_lengkap?.[0] || "A"}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#94a3b8" }}>Anggota</p>
                        <p className="font-bold text-base" style={{ color: NU_DARK }}>{s.profiles?.nama_lengkap}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(244,196,48,0.12)", color: "#7a4f00", border: "1px solid rgba(244,196,48,0.3)" }}>
                      +{s.kegiatan?.bobot_skor || 0} Poin
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl" style={{ background: "rgba(31,154,94,0.04)", border: "1px solid rgba(31,154,94,0.08)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#94a3b8" }}>Kegiatan</p>
                    <div className="flex items-center gap-2">
                      <Activity size={16} style={{ color: NU_GREEN }} />
                      <p className="font-bold text-sm" style={{ color: "#374151" }}>{s.kegiatan?.nama_kegiatan}</p>
                    </div>
                    <p className="text-[10px] mt-1.5 flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
                      <Clock size={12} /> Diajukan pada {new Date(s.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-auto">
                    <button
                      disabled={validatingId === s.id}
                      onClick={() => handleAction(s.id, "approved")}
                      className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-40"
                      style={{ background: `linear-gradient(135deg, ${NU_GREEN}, #145c38)`, color: "white",
                        boxShadow: "0 4px 16px rgba(31,154,94,0.3)" }}
                    >
                      <Check size={17} />
                      {validatingId === s.id ? "Memproses..." : "Approve"}
                    </button>
                    <button
                      disabled={validatingId === s.id}
                      onClick={() => handleAction(s.id, "rejected")}
                      className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-red-50 disabled:opacity-40"
                      style={{ background: "white", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}
                    >
                      <X size={17} /> Tolak
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Leaderboard Summary for Admin */}
      <div className="mt-12 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy size={22} style={{ color: NU_GOLD }} />
          <h2 className="font-bebas text-3xl" style={{ color: NU_DARK }}>Papan Peringkat Anggota</h2>
        </div>
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100">
          <table className="w-full text-left">
            <thead style={{ background: "rgba(31,154,94,0.03)" }}>
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rank</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Nama Lengkap</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Username</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Total Skor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaderboard.map((u, i) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ 
                        background: i === 0 ? NU_GOLD : i === 1 ? "#e2e8f0" : i === 2 ? "#fed7aa" : "rgba(31,154,94,0.05)",
                        color: i === 0 ? NU_DARK : "#64748b"
                      }}>
                      {i + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm text-slate-700">{u.nama_lengkap}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{u.username}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bebas text-xl" style={{ color: NU_GREEN }}>{u.total_skor || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.total_skor >= 70 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter"
                        style={{ background: "rgba(31,154,94,0.1)", color: NU_GREEN }}>
                        <Medal size={12} /> Anggota Terbest
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Belum Mencapai Target</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboard.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-400">Belum ada data anggota.</div>
          )}
        </div>
      </div>
    </div>
  );
}
