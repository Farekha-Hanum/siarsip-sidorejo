"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Award,
  X,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Check,
  TrendingUp,
  Percent,
  FileSpreadsheet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upsertKegiatan, deleteKegiatan } from "@/actions/kegiatan";
import { validatePartisipasi } from "@/actions/partisipasi";
import {
  exportPesertaKegiatanToExcel,
  exportSemuaKegiatanToExcel,
} from "@/lib/exportKegiatanExcel";

const NU_DARK  = "#0d3320";
const NU_GREEN = "#1f9a5e";
const NU_GOLD  = "#f4c430";

const inputCls = "w-full px-4 py-3 rounded-xl outline-none font-sans text-sm transition-all";
const inputStyle: React.CSSProperties = {
  background: "rgba(240,250,244,0.8)",
  border: "1px solid rgba(31,154,94,0.15)",
  color: NU_DARK,
};
const focusFns = {
  onFocus: (e: React.FocusEvent<any>) => {
    e.target.style.border = `1px solid ${NU_GREEN}`;
    e.target.style.boxShadow = "0 0 0 3px rgba(31,154,94,0.1)";
  },
  onBlur: (e: React.FocusEvent<any>) => {
    e.target.style.border = "1px solid rgba(31,154,94,0.15)";
    e.target.style.boxShadow = "none";
  },
};

export default function AdminKegiatanPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [profilesMap, setProfilesMap] = useState<Map<string, any>>(new Map());
  const [totalAnggota, setTotalAnggota] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Modal Buat/Edit Kegiatan
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Modal Detail & Peserta
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [validatingId, setValidatingId] = useState<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);

    // 1. Ambil kegiatan
    const { data: actData } = await supabase
      .from("kegiatan")
      .select("*")
      .order("tanggal_kegiatan", { ascending: false });

    // 2. Ambil partisipasi user_kegiatan
    const { data: partData } = await supabase
      .from("user_kegiatan")
      .select("id, id_kegiatan, id_user, status_validasi, skor_didapat, created_at")
      .order("created_at", { ascending: false });

    // 3. Ambil data profil anggota
    const { data: profData } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, username, organisasi, role");

    if (actData) setActivities(actData);
    if (partData) setParticipations(partData);

    if (profData) {
      const map = new Map<string, any>();
      (profData as any[]).forEach((p: any) => map.set(p.id, p));
      setProfilesMap(map);

      // Hitung total anggota yang berstatus user / anggota ranting
      const members = (profData as any[]).filter((p: any) => p.role === "user" || !p.role);
      setTotalAnggota(members.length > 0 ? members.length : profData.length || 1);
    }

    setLoading(false);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    const result = await upsertKegiatan(new FormData(e.currentTarget));
    setFormLoading(false);
    if (result.success) {
      setShowModal(false);
      setEditingActivity(null);
      loadAllData();
    } else {
      alert(result.error);
    }
  }

  async function handleDelete(id: number) {
    if (confirm("Hapus kegiatan ini? Semua partisipasi terkait juga akan terhapus.")) {
      await deleteKegiatan(id);
      loadAllData();
      if (selectedActivity?.id === id) {
        setShowDetailModal(false);
        setSelectedActivity(null);
      }
    }
  }

  async function handleValidation(id: number, status: "approved" | "rejected") {
    setValidatingId(id);
    const result = await validatePartisipasi(id, status);
    if (result.success) {
      // Perbarui local state partisipasi
      setParticipations((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status_validasi: status,
                skor_didapat: status === "approved" ? selectedActivity?.bobot_skor || 10 : 0,
              }
            : item
        )
      );
    } else {
      alert(result.error);
    }
    setValidatingId(null);
  }

  // Hitung ringkasan per kegiatan
  const getActivityStats = (activityId: number) => {
    const parts = participations.filter((p) => p.id_kegiatan === activityId);
    const approved = parts.filter((p) => p.status_validasi === "approved");
    const pending = parts.filter((p) => p.status_validasi === "pending");
    const rejected = parts.filter((p) => p.status_validasi === "rejected");

    // Persentase partisipasi ranting = (approved / totalAnggota) * 100
    const partisipasiPersen = Math.min(
      100,
      Math.round((approved.length / (totalAnggota || 1)) * 100)
    );

    // Rasio validasi / keberhasilan pengajuan = (approved / total parts) * 100
    const rasioKeberhasilan =
      parts.length > 0 ? Math.round((approved.length / parts.length) * 100) : 0;

    return {
      total: parts.length,
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      partisipasiPersen,
      rasioKeberhasilan,
    };
  };

  // Daftar peserta untuk modal yang sedang aktif
  const currentParticipants = useMemo(() => {
    if (!selectedActivity) return [];
    let list = participations.filter((p) => p.id_kegiatan === selectedActivity.id);

    if (filterStatus !== "all") {
      list = list.filter((p) => p.status_validasi === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => {
        const prof = profilesMap.get(p.id_user);
        const name = (prof?.nama_lengkap || "").toLowerCase();
        const username = (prof?.username || "").toLowerCase();
        return name.includes(q) || username.includes(q);
      });
    }

    return list;
  }, [selectedActivity, participations, filterStatus, searchQuery, profilesMap]);

  const selectedStats = selectedActivity ? getActivityStats(selectedActivity.id) : null;

  const handleExportAll = () => {
    if (activities.length === 0) {
      alert("Belum ada data kegiatan untuk diekspor.");
      return;
    }
    const enrichedParts = participations.map((p) => {
      const prof = profilesMap.get(p.id_user);
      return {
        ...p,
        nama_lengkap: prof?.nama_lengkap || "Anggota",
        username: prof?.username || "-",
        organisasi: prof?.organisasi || "IPNU/IPPNU",
      };
    });
    exportSemuaKegiatanToExcel(activities, enrichedParts, totalAnggota);
  };

  const handleExportSingle = () => {
    if (!selectedActivity || !selectedStats) return;
    const enrichedParts = participations
      .filter((p) => p.id_kegiatan === selectedActivity.id)
      .map((p) => {
        const prof = profilesMap.get(p.id_user);
        return {
          ...p,
          nama_lengkap: prof?.nama_lengkap || "Anggota",
          username: prof?.username || "-",
          organisasi: prof?.organisasi || "IPNU/IPPNU",
        };
      });
    exportPesertaKegiatanToExcel(selectedActivity, enrichedParts, {
      ...selectedStats,
      totalAnggota,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-7 rounded-3xl text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`,
          boxShadow: "0 8px 32px rgba(31,154,94,0.2)",
        }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white">
          <Calendar size={140} />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#80e5b0" }}>
            ✦ SIMPEL NU
          </p>
          <h1 className="font-extrabold text-2xl md:text-3xl tracking-tight leading-snug">
            Daftar Kegiatan &amp; Partisipasi
          </h1>
          <p className="text-white/70 mt-1.5 text-sm max-w-xl">
            Pantau daftar peserta kehadiran anggota, persentase keberhasilan kegiatan, serta bobot skor partisipasi IPNU-IPPNU Sidorejo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:bg-white/20 border border-white/30 text-white cursor-pointer shadow-sm"
            title="Ekspor seluruh kegiatan & rekap kehadiran peserta ke Excel"
          >
            <FileSpreadsheet size={18} /> Ekspor Rekap (.xlsx)
          </button>
          <button
            onClick={() => {
              setEditingActivity(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-xl flex-shrink-0 cursor-pointer"
            style={{ background: NU_GOLD, color: NU_DARK, boxShadow: "0 6px 20px rgba(244,196,48,0.4)" }}
          >
            <Plus size={18} /> Tambah Kegiatan Baru
          </button>
        </div>
      </motion.div>

      {/* Cards Grid Kegiatan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-64 rounded-3xl animate-pulse" style={{ background: "rgba(31,154,94,0.06)" }} />
            ))
        ) : activities.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-3xl bg-white" style={{ border: "1px solid rgba(31,154,94,0.1)" }}>
            <FileText size={48} className="mx-auto mb-3 opacity-20" style={{ color: NU_GREEN }} />
            <p className="font-bold text-xl" style={{ color: NU_DARK }}>
              Belum Ada Kegiatan
            </p>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              Tambahkan kegiatan pertama untuk mulai memantau partisipasi anggota.
            </p>
          </div>
        ) : (
          activities.map((k, i) => {
            const stats = getActivityStats(k.id);

            return (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-3xl flex flex-col justify-between group"
                style={{
                  border: "1px solid rgba(31,154,94,0.12)",
                  boxShadow: "0 4px 20px rgba(13,31,20,0.05)",
                }}
              >
                <div>
                  {/* Top Bar Card */}
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ background: "rgba(31,154,94,0.1)" }}
                    >
                      <Calendar size={22} style={{ color: NU_GREEN }} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingActivity(k);
                          setShowModal(true);
                        }}
                        className="p-2 rounded-lg transition-all cursor-pointer"
                        style={{ color: "#94a3b8" }}
                        title="Edit Kegiatan"
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(31,154,94,0.08)";
                          (e.currentTarget as HTMLElement).style.color = NU_GREEN;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "";
                          (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="p-2 rounded-lg transition-all cursor-pointer"
                        style={{ color: "#94a3b8" }}
                        title="Hapus Kegiatan"
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.08)";
                          (e.currentTarget as HTMLElement).style.color = "#ef4444";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "";
                          (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-base leading-tight mb-1.5 line-clamp-1" style={{ color: NU_DARK }}>
                    {k.nama_kegiatan}
                  </h3>
                  <p className="text-xs line-clamp-2" style={{ color: "#64748b" }}>
                    {k.deskripsi || "Tidak ada deskripsi."}
                  </p>

                  {/* Ringkasan Metrik & Persentase */}
                  <div className="mt-4 p-3.5 rounded-2xl space-y-2.5" style={{ background: "rgba(31,154,94,0.04)", border: "1px solid rgba(31,154,94,0.08)" }}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                        <TrendingUp size={14} style={{ color: NU_GREEN }} /> Tingkat Partisipasi
                      </span>
                      <span className="font-extrabold text-sm" style={{ color: stats.partisipasiPersen > 50 ? NU_GREEN : "#d97706" }}>
                        {stats.partisipasiPersen}%
                      </span>
                    </div>

                    {/* Progress Bar Persentase */}
                    <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(5, stats.partisipasiPersen)}%`,
                          background: `linear-gradient(90deg, ${NU_GREEN}, #27b870)`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                      <span>
                        <strong className="text-slate-800">{stats.approved}</strong> Hadir Disetujui
                      </span>
                      {stats.pending > 0 && (
                        <span className="text-amber-600 font-bold">
                          • {stats.pending} Menunggu
                        </span>
                      )}
                      <span>
                        Rasio Valid: <strong className="text-slate-800">{stats.rasioKeberhasilan}%</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Tanggal, Poin, & Tombol Detail */}
                <div className="pt-4 mt-4 space-y-3" style={{ borderTop: "1px solid rgba(31,154,94,0.08)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tanggal</span>
                      <p className="text-xs font-bold mt-0.5 text-slate-700">
                        {k.tanggal_kegiatan
                          ? (() => {
                              try {
                                const d = new Date(k.tanggal_kegiatan);
                                return isNaN(d.getTime())
                                  ? "-"
                                  : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
                              } catch {
                                return "-";
                              }
                            })()
                          : "-"}
                      </p>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs"
                      style={{ background: "rgba(244,196,48,0.15)", color: "#7a4f00", border: "1px solid rgba(244,196,48,0.3)" }}
                    >
                      <Award size={13} />
                      +{k.bobot_skor} Poin
                    </div>
                  </div>

                  {/* Tombol Lihat Peserta & Statistik */}
                  <button
                    onClick={() => {
                      setSelectedActivity(k);
                      setFilterStatus("all");
                      setSearchQuery("");
                      setShowDetailModal(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`,
                      color: "white",
                    }}
                  >
                    <Users size={15} />
                    <span>Lihat Daftar Peserta ({stats.total})</span>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: DETAIL KEGIATAN, PERSENTASE & DAFTAR PESERTA                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showDetailModal && selectedActivity && selectedStats && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(13,31,20,0.6)", backdropFilter: "blur(6px)" }}
              onClick={() => setShowDetailModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
              style={{ border: "1px solid rgba(31,154,94,0.15)" }}
            >
              {/* Modal Header */}
              <div
                className="px-7 py-5 flex justify-between items-center flex-shrink-0 text-white"
                style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})` }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-[#80e5b0]">
                      Statistik &amp; Kehadiran
                    </span>
                    <span className="text-xs font-bold text-amber-300">+{selectedActivity.bobot_skor} Poin</span>
                  </div>
                  <h2 className="font-extrabold text-xl md:text-2xl mt-1 tracking-tight">{selectedActivity.nama_kegiatan}</h2>
                  <p className="text-xs text-white/70 mt-0.5 flex items-center gap-1.5">
                    <Calendar size={13} />
                    {selectedActivity.tanggal_kegiatan
                      ? (() => {
                          try {
                            const d = new Date(selectedActivity.tanggal_kegiatan);
                            return isNaN(d.getTime())
                              ? "-"
                              : d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
                          } catch {
                            return "-";
                          }
                        })()
                      : "-"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportSingle}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
                    title="Ekspor daftar peserta ini ke format Excel (.xlsx)"
                  >
                    <FileSpreadsheet size={14} /> Ekspor Excel
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 rounded-xl transition-all hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Modal Content Scrollable */}
              <div className="p-6 md:p-7 overflow-y-auto space-y-6 flex-1">
                {/* 1. KOTAK PERSENTASE & STATISTIK KEBERHASILAN */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    className="p-4 rounded-2xl border"
                    style={{ background: "rgba(31,154,94,0.05)", borderColor: "rgba(31,154,94,0.2)" }}
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Hadir Disetujui</span>
                      <CheckCircle2 size={16} style={{ color: NU_GREEN }} />
                    </div>
                    <p className="font-extrabold text-2xl" style={{ color: NU_DARK }}>
                      {selectedStats.approved}
                    </p>
                    <span className="text-[10px] text-slate-400">dari total {totalAnggota} anggota</span>
                  </div>

                  <div
                    className="p-4 rounded-2xl border"
                    style={{ background: "rgba(244,196,48,0.08)", borderColor: "rgba(244,196,48,0.25)" }}
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Menunggu</span>
                      <Clock size={16} style={{ color: "#d97706" }} />
                    </div>
                    <p className="font-extrabold text-2xl text-amber-600">{selectedStats.pending}</p>
                    <span className="text-[10px] text-slate-400">butuh verifikasi</span>
                  </div>

                  <div
                    className="p-4 rounded-2xl border"
                    style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.2)" }}
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Ditolak</span>
                      <XCircle size={16} className="text-red-500" />
                    </div>
                    <p className="font-extrabold text-2xl text-red-600">{selectedStats.rejected}</p>
                    <span className="text-[10px] text-slate-400">tidak valid</span>
                  </div>

                  <div
                    className="p-4 rounded-2xl border text-white"
                    style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`, borderColor: "transparent" }}
                  >
                    <div className="flex items-center justify-between text-white/80 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Partisipasi</span>
                      <Percent size={16} style={{ color: NU_GOLD }} />
                    </div>
                    <p className="font-extrabold text-2xl" style={{ color: NU_GOLD }}>
                      {selectedStats.partisipasiPersen}%
                    </p>
                    <span className="text-[10px] text-white/70">tingkat kehadiran</span>
                  </div>
                </div>

                {/* Banner Bar Keberhasilan & Rasio Validasi */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Persentase Keberhasilan Konfirmasi (Rasio Valid):</span>
                    <span className="font-extrabold text-sm" style={{ color: NU_GREEN }}>
                      {selectedStats.rasioKeberhasilan}% disetujui
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(5, selectedStats.rasioKeberhasilan)}%`,
                        background: `linear-gradient(90deg, ${NU_GREEN}, #145c38)`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    *Tingkat partisipasi dihitung dari perbandingan peserta yang disetujui hadir ({selectedStats.approved}) terhadap total {totalAnggota} anggota IPNU-IPPNU Sidorejo yang terdaftar di sistem.
                  </p>
                </div>

                {/* 2. DAFTAR PESERTA DENGAN PENCARIAN & FILTER */}
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                      <Users size={18} style={{ color: NU_GREEN }} />
                      Daftar Anggota yang Mengikuti ({currentParticipants.length})
                    </h3>

                    {/* Filter Status Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                      <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          filterStatus === "all" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Semua ({selectedStats.total})
                      </button>
                      <button
                        onClick={() => setFilterStatus("approved")}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          filterStatus === "approved" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-emerald-700"
                        }`}
                      >
                        Hadir ({selectedStats.approved})
                      </button>
                      <button
                        onClick={() => setFilterStatus("pending")}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          filterStatus === "pending" ? "bg-amber-500 text-white shadow-xs" : "text-slate-500 hover:text-amber-700"
                        }`}
                      >
                        Menunggu ({selectedStats.pending})
                      </button>
                      <button
                        onClick={() => setFilterStatus("rejected")}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          filterStatus === "rejected" ? "bg-red-500 text-white shadow-xs" : "text-slate-500 hover:text-red-700"
                        }`}
                      >
                        Ditolak ({selectedStats.rejected})
                      </button>
                    </div>
                  </div>

                  {/* Search Bar Input */}
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama peserta atau username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-700"
                    />
                  </div>

                  {/* Tabel Peserta */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Nama Anggota</th>
                            <th className="px-4 py-3">Organisasi</th>
                            <th className="px-4 py-3">Waktu Konfirmasi</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentParticipants.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-10 text-center text-slate-400">
                                <Users size={28} className="mx-auto mb-2 opacity-30" />
                                Tidak ada peserta yang ditemukan.
                              </td>
                            </tr>
                          ) : (
                            currentParticipants.map((part) => {
                              const profile = profilesMap.get(part.id_user);
                              const org = profile?.organisasi?.toUpperCase() || "IPNU/IPPNU";

                              return (
                                <tr key={part.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                      <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-xs flex-shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${NU_GREEN}, ${NU_DARK})` }}
                                      >
                                        {(profile?.nama_lengkap || "A")[0]}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-800">{profile?.nama_lengkap || "Anggota"}</p>
                                        <p className="text-[10px] text-slate-400">{profile?.username || "-"}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                        org.includes("IPPNU")
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-teal-100 text-teal-800"
                                      }`}
                                    >
                                      {org}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                                    {part.created_at
                                      ? (() => {
                                          try {
                                            const d = new Date(part.created_at);
                                            return isNaN(d.getTime())
                                              ? "-"
                                              : d.toLocaleDateString("id-ID", {
                                                  day: "numeric",
                                                  month: "short",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                });
                                          } catch {
                                            return "-";
                                          }
                                        })()
                                      : "-"}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {part.status_validasi === "approved" ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        <CheckCircle2 size={12} /> Hadir (+{part.skor_didapat || selectedActivity.bobot_skor} Poin)
                                      </span>
                                    ) : part.status_validasi === "pending" ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                        <Clock size={12} /> Menunggu
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                                        <XCircle size={12} /> Ditolak
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {part.status_validasi === "pending" ? (
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          disabled={validatingId === part.id}
                                          onClick={() => handleValidation(part.id, "approved")}
                                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
                                          title="Setujui Kehadiran"
                                        >
                                          <Check size={12} />
                                          {validatingId === part.id ? "..." : "Approve"}
                                        </button>
                                        <button
                                          disabled={validatingId === part.id}
                                          onClick={() => handleValidation(part.id, "rejected")}
                                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                          title="Tolak Kehadiran"
                                        >
                                          <X size={12} />
                                          {validatingId === part.id ? "..." : "Tolak"}
                                        </button>
                                      </div>
                                    ) : part.status_validasi === "approved" ? (
                                      <button
                                        disabled={validatingId === part.id}
                                        onClick={() => handleValidation(part.id, "rejected")}
                                        className="text-[10px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                        title="Ubah menjadi ditolak"
                                      >
                                        Batalkan
                                      </button>
                                    ) : (
                                      <button
                                        disabled={validatingId === part.id}
                                        onClick={() => handleValidation(part.id, "approved")}
                                        className="text-[10px] text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                        title="Ubah menjadi disetujui"
                                      >
                                        Setujui
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-7 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <span className="text-xs text-slate-500">
                  Total Terdaftar: <strong>{selectedStats.total} orang</strong> ({selectedStats.approved} Disetujui)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportSingle}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all cursor-pointer shadow-xs"
                    title="Ekspor daftar peserta kegiatan ini ke format Excel (.xlsx)"
                  >
                    <FileSpreadsheet size={15} /> Unduh Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: TAMBAH / EDIT KEGIATAN BARU                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(13,31,20,0.55)", backdropFilter: "blur(6px)" }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
              style={{ border: "1px solid rgba(31,154,94,0.15)" }}
            >
              <div
                className="px-7 py-5 flex justify-between items-center"
                style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})` }}
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#80e5b0" }}>
                    {editingActivity ? "Edit" : "Tambah Baru"}
                  </p>
                  <h2 className="font-bold text-xl text-white tracking-tight">
                    {editingActivity ? "Edit Kegiatan" : "Buat Kegiatan Baru"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl transition-all hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-7 space-y-5">
                <input type="hidden" name="id" value={editingActivity?.id || ""} />
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
                    Nama Kegiatan
                  </label>
                  <input
                    name="nama_kegiatan"
                    defaultValue={editingActivity?.nama_kegiatan || ""}
                    required
                    placeholder="Contoh: Makesta Ranting Sidorejo"
                    className={inputCls}
                    style={inputStyle}
                    {...focusFns}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
                      Tanggal
                    </label>
                    <input
                      name="tanggal_kegiatan"
                      type="date"
                      defaultValue={editingActivity?.tanggal_kegiatan || ""}
                      required
                      className={inputCls}
                      style={inputStyle}
                      {...focusFns}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
                      Bobot Skor
                    </label>
                    <input
                      name="bobot_skor"
                      type="number"
                      defaultValue={editingActivity?.bobot_skor || 10}
                      required
                      className={inputCls}
                      style={inputStyle}
                      {...focusFns}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    defaultValue={editingActivity?.deskripsi || ""}
                    rows={3}
                    placeholder="Tuliskan tujuan dan gambaran singkat kegiatan..."
                    className={`${inputCls} resize-none`}
                    style={inputStyle}
                    {...focusFns}
                  />
                </div>
                <button
                  disabled={formLoading}
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg cursor-pointer"
                  style={{
                    background: formLoading
                      ? "rgba(244,196,48,0.4)"
                      : `linear-gradient(135deg, ${NU_GOLD}, #f7d45e)`,
                    color: NU_DARK,
                    boxShadow: "0 6px 20px rgba(244,196,48,0.3)",
                  }}
                >
                  {formLoading ? "Menyimpan..." : "Simpan Kegiatan"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
