"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Edit2, Trash2, Users, X,
  Phone, MapPin, Calendar, CheckCircle2, FileSpreadsheet, Search
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upsertPengurus, deletePengurus } from "@/actions/pengurus";
import { exportPengurusToExcel, PengurusItem } from "@/lib/exportPengurusExcel";

const NU_DARK  = "#0d3320";
const NU_GREEN = "#1f9a5e";
const NU_GOLD  = "#f4c430";

const inputCls = "w-full px-5 py-3.5 rounded-xl outline-none font-sans text-sm transition-all";
const inputStyle: React.CSSProperties = {
  background: "rgba(240,250,244,0.8)",
  border: "1px solid rgba(31,154,94,0.15)",
  color: NU_DARK,
};
const focusFns = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.border = `1px solid ${NU_GREEN}`;
    e.target.style.boxShadow = "0 0 0 3px rgba(31,154,94,0.1)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.border = "1px solid rgba(31,154,94,0.15)";
    e.target.style.boxShadow = "none";
  },
};

export default function AdminPengurusPage() {
  const [members, setMembers] = useState<PengurusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<PengurusItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"IPNU" | "IPPNU" | "ALL">("IPNU");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedOrgInForm, setSelectedOrgInForm] = useState<"IPNU" | "IPPNU">("IPNU");

  const supabase = createClient();

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    setLoading(true);
    const { data } = await supabase.from("data_pengurus").select("*").order("nama_lengkap", { ascending: true });
    if (data) setMembers(data);
    setLoading(false);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    const result = await upsertPengurus(new FormData(e.currentTarget));
    setFormLoading(false);
    if (result.success) {
      setShowModal(false);
      setEditingMember(null);
      fetchMembers();
    } else {
      alert(result.error);
    }
  }

  async function handleDelete(id: number) {
    if (confirm("Apakah Anda yakin ingin menghapus data pengurus ini?")) {
      await deletePengurus(id);
      fetchMembers();
    }
  }

  function handleOpenCreateModal() {
    setEditingMember(null);
    // Jika sedang di tab IPPNU, otomatis pilihkan IPPNU; selain itu IPNU
    setSelectedOrgInForm(activeTab === "IPPNU" ? "IPPNU" : "IPNU");
    setShowModal(true);
  }

  function handleOpenEditModal(m: PengurusItem) {
    setEditingMember(m);
    setSelectedOrgInForm((m.organisasi || "IPNU").toUpperCase() === "IPPNU" ? "IPPNU" : "IPNU");
    setShowModal(true);
  }

  function handleExportExcel() {
    try {
      setIsExporting(true);
      exportPengurusToExcel(members);
    } catch (err: unknown) {
      console.error("Export error:", err);
      const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan";
      alert("Gagal mengekspor file Excel: " + errMsg);
    } finally {
      setIsExporting(false);
    }
  }

  // Hitung jumlah pengurus masing-masing
  const countIpnu = members.filter(m => (m.organisasi || "IPNU").toUpperCase() === "IPNU").length;
  const countIppnu = members.filter(m => (m.organisasi || "").toUpperCase() === "IPPNU").length;
  const countTotal = members.length;

  // Filter daftar anggota berdasarkan tab aktif dan pencarian
  const filteredMembers = members.filter(m => {
    const org = (m.organisasi || "IPNU").toUpperCase();
    if (activeTab === "IPNU" && org !== "IPNU") return false;
    if (activeTab === "IPPNU" && org !== "IPPNU") return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchNama = m.nama_lengkap?.toLowerCase().includes(q);
      const matchJabatan = m.jabatan?.toLowerCase().includes(q);
      const matchNia = m.nia?.toLowerCase().includes(q);
      const matchAlamat = m.alamat?.toLowerCase().includes(q);
      return matchNama || matchJabatan || matchNia || matchAlamat;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-7 rounded-3xl text-white overflow-hidden relative shadow-lg"
        style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`, boxShadow: "0 8px 32px rgba(31,154,94,0.2)" }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none">
          <Users size={140} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/15 text-[#80e5b0]">
              ✦ SIMPEL NU
            </span>
            <span className="text-[10px] font-semibold text-emerald-200">
              PR IPNU-IPPNU Sidorejo
            </span>
          </div>
          <h1 className="font-extrabold text-2xl md:text-3xl tracking-wide leading-snug">Database Data Pengurus</h1>
          <p className="text-white/80 mt-2 text-sm max-w-xl leading-relaxed tracking-wide">
            Kelola data fungsionaris IPNU &amp; IPPNU secara terpisah dengan pembagian struktur organisasi dan ekspor Excel multi-sheet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {/* Tombol Export Excel */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting || members.length === 0}
            title="Download Excel dengan Sheet IPNU dan Sheet IPPNU terpisah"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-400/30 disabled:opacity-50"
          >
            <FileSpreadsheet size={18} className="text-emerald-200" />
            <span>{isExporting ? "Mengekspor..." : "Export Excel (.xlsx)"}</span>
          </button>

          {/* Tombol Tambah Pengurus */}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.98] shadow-xl"
            style={{ background: NU_GOLD, color: NU_DARK, boxShadow: "0 6px 20px rgba(244,196,48,0.4)" }}
          >
            <UserPlus size={18} />
            <span>Tambah Pengurus</span>
          </button>
        </div>
      </motion.div>

      {/* Ringkasan & Quick Stats (Klik untuk langsung ganti tab) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Kartu IPNU */}
        <div
          onClick={() => setActiveTab("IPNU")}
          className={`cursor-pointer p-4 rounded-2xl transition-all border ${
            activeTab === "IPNU"
              ? "bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Pengurus IPNU
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white">
              {countIpnu} Orang
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Fungsionaris Pelajar Putra</p>
        </div>

        {/* Kartu IPPNU */}
        <div
          onClick={() => setActiveTab("IPPNU")}
          className={`cursor-pointer p-4 rounded-2xl transition-all border ${
            activeTab === "IPPNU"
              ? "bg-pink-50/90 border-pink-500 shadow-md ring-2 ring-pink-500/20"
              : "bg-white border-slate-200/80 hover:border-pink-300 hover:bg-pink-50/40 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-800">
              Pengurus IPPNU
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-pink-600 text-white">
              {countIppnu} Orang
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Fungsionaris Pelajar Putri</p>
        </div>

        {/* Kartu Total Semua */}
        <div
          onClick={() => setActiveTab("ALL")}
          className={`cursor-pointer p-4 rounded-2xl transition-all border ${
            activeTab === "ALL"
              ? "bg-slate-100 border-slate-700 shadow-md ring-2 ring-slate-400/20"
              : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Total Fungsionaris
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-800 text-white">
              {countTotal} Orang
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Gabungan IPNU &amp; IPPNU</p>
        </div>
      </div>

      {/* Tabs Navigasi Pemisah & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-emerald-900/10 w-fit">
          <button
            onClick={() => setActiveTab("IPNU")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "IPNU"
                ? "bg-[#145c38] text-white shadow-md shadow-emerald-900/20"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>IPNU</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
              {countIpnu}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("IPPNU")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "IPPNU"
                ? "bg-pink-700 text-white shadow-md shadow-pink-900/20"
                : "text-slate-600 hover:bg-pink-50 hover:text-pink-800"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-pink-300 inline-block" />
            <span>IPPNU</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
              {countIppnu}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ALL"
                ? "bg-slate-800 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <span>Semua Data</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white">
              {countTotal}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari nama, jabatan, atau NIA ${activeTab === "ALL" ? "pengurus" : activeTab}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-xs font-medium bg-white border border-emerald-900/10 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data Pengurus */}
      <div className="bg-white rounded-3xl overflow-hidden border border-emerald-900/10 shadow-sm">
        {/* Banner Keterangan Tab Aktif */}
        <div className={`px-7 py-3 border-b flex items-center justify-between text-xs font-bold ${
          activeTab === "IPNU"
            ? "bg-emerald-50/70 border-emerald-100 text-emerald-900"
            : activeTab === "IPPNU"
            ? "bg-pink-50/70 border-pink-100 text-pink-900"
            : "bg-slate-50 border-slate-200 text-slate-800"
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{
              background: activeTab === "IPNU" ? "#145c38" : activeTab === "IPPNU" ? "#be185d" : "#334155"
            }} />
            <span>
              {activeTab === "IPNU" && "Daftar Pengurus IPNU Sidorejo (Pelajar Putra)"}
              {activeTab === "IPPNU" && "Daftar Pengurus IPPNU Sidorejo (Pelajar Putri)"}
              {activeTab === "ALL" && "Daftar Seluruh Pengurus Gabungan (IPNU & IPPNU)"}
            </span>
          </div>
          <span className="font-normal text-slate-500">
            Menampilkan {filteredMembers.length} fungsionaris
          </span>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 rounded-full animate-spin"
              style={{ borderColor: "rgba(31,154,94,0.15)", borderTopColor: NU_GREEN }} />
            <p className="text-xs text-slate-400">Memuat data pengurus...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center gap-3 text-slate-400">
            <Users size={56} className="opacity-20" />
            <p className="font-bold text-xl text-slate-800">
              {searchQuery ? "Tidak Ada Hasil Pencarian" : `Belum Ada Data Pengurus ${activeTab === "ALL" ? "" : activeTab}`}
            </p>
            <p className="text-xs max-w-sm text-slate-500">
              {searchQuery
                ? `Tidak ditemukan pengurus dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : `Klik tombol "Tambah Pengurus" di atas untuk mendaftarkan fungsionaris ${activeTab === "ALL" ? "" : activeTab} pertama.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-bold tracking-widest bg-slate-50/80 text-slate-500 border-b border-slate-200/80">
                  <th className="px-6 py-4 w-12 text-center">No</th>
                  <th className="px-6 py-4">Fungsionaris &amp; NIA</th>
                  <th className="px-6 py-4">Jabatan</th>
                  <th className="px-6 py-4">Organisasi</th>
                  <th className="px-6 py-4">Kontak &amp; Alamat</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m, i) => {
                  const isIppnu = (m.organisasi || "").toUpperCase() === "IPPNU";
                  const cleanPhone = m.nomor_telepon?.replace(/[^0-9]/g, "") || "";
                  const waPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
                  return (
                    <motion.tr
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="px-6 py-4 text-center text-xs font-mono text-slate-400">
                        {i + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shadow-sm flex-shrink-0"
                            style={{
                              background: isIppnu
                                ? "linear-gradient(135deg, #db2777, #9d174d)"
                                : "linear-gradient(135deg, #1f9a5e, #145c38)"
                            }}
                          >
                            {m.nama_lengkap?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors tracking-wide">
                              {m.nama_lengkap}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 tracking-wide">
                              <span>NIA:</span>
                              <span className="font-semibold text-slate-600 tracking-wider">{m.nia || "—"}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border tracking-wide ${
                          isIppnu
                            ? "bg-pink-50 text-pink-700 border-pink-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}>
                          {m.jabatan}
                        </span>
                        {m.tanggal_bergabung && (
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 tracking-wide">
                            <Calendar size={11} /> {m.tanggal_bergabung}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
                          isIppnu
                            ? "bg-pink-100 text-pink-800 border-pink-300"
                            : "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}>
                          {isIppnu ? "IPPNU" : "IPNU"}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <Phone size={13} className="text-slate-400" />
                          <span className="font-medium">{m.nomor_telepon || "—"}</span>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${waPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline inline-flex items-center gap-0.5 ml-1"
                              title={`Kirim pesan WhatsApp ke ${m.nama_lengkap}`}
                            >
                              Chat WA ↗
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-xs">{m.alamat || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(m)}
                            title="Edit data pengurus"
                            className="p-2 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            title="Hapus data pengurus"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Tambah / Edit Pengurus */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto border border-emerald-900/10"
            >
              {/* Modal Header */}
              <div
                className="px-8 py-6 flex justify-between items-start sticky top-0 z-10 text-white"
                style={{
                  background: selectedOrgInForm === "IPPNU"
                    ? "linear-gradient(135deg, #831843, #be185d)"
                    : `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`
                }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {editingMember ? "Edit Data" : "Tambah Baru"}
                    </span>
                    <span className="text-xs font-semibold text-white/80">
                      Organisasi: {selectedOrgInForm}
                    </span>
                  </div>
                  <h2 className="font-bold text-2xl tracking-tight">
                    {editingMember ? `Edit Pengurus ${selectedOrgInForm}` : `Tambah Pengurus ${selectedOrgInForm} Baru`}
                  </h2>
                  <p className="text-white/70 text-xs mt-1">Lengkapi informasi biodata fungsionaris secara akurat.</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl transition-all hover:bg-white/10 text-white/70 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-8 space-y-5">
                <input type="hidden" name="id" value={editingMember?.id || ""} />

                {/* Pemilihan Organisasi (IPNU vs IPPNU) yang sangat jelas */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                    Pilih Organisasi (IPNU / IPPNU)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedOrgInForm === "IPNU"
                          ? "border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="organisasi"
                          value="IPNU"
                          checked={selectedOrgInForm === "IPNU"}
                          onChange={() => setSelectedOrgInForm("IPNU")}
                          className="accent-emerald-600"
                        />
                        <div>
                          <p className="font-bold text-sm">IPNU</p>
                          <p className="text-[10px] text-slate-500">Pelajar Putra</p>
                        </div>
                      </div>
                      {selectedOrgInForm === "IPNU" && (
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      )}
                    </label>

                    <label
                      className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedOrgInForm === "IPPNU"
                          ? "border-pink-600 bg-pink-50/70 text-pink-900 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="organisasi"
                          value="IPPNU"
                          checked={selectedOrgInForm === "IPPNU"}
                          onChange={() => setSelectedOrgInForm("IPPNU")}
                          className="accent-pink-600"
                        />
                        <div>
                          <p className="font-bold text-sm">IPPNU</p>
                          <p className="text-[10px] text-slate-500">Pelajar Putri</p>
                        </div>
                      </div>
                      {selectedOrgInForm === "IPPNU" && (
                        <CheckCircle2 size={18} className="text-pink-600" />
                      )}
                    </label>
                  </div>
                </div>

                {/* NIA & Nama Lengkap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      NIA (Nomor Induk Anggota)
                    </label>
                    <input
                      name="nia"
                      defaultValue={editingMember?.nia || ""}
                      placeholder="Contoh: 11.23.001"
                      className={inputCls}
                      style={inputStyle}
                      {...focusFns}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="nama_lengkap"
                      defaultValue={editingMember?.nama_lengkap || ""}
                      required
                      placeholder="Nama lengkap pengurus"
                      className={inputCls}
                      style={inputStyle}
                      {...focusFns}
                    />
                  </div>
                </div>

                {/* Jabatan & Nomor Telepon */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      Jabatan <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="jabatan"
                      defaultValue={editingMember?.jabatan || ""}
                      required
                      placeholder={selectedOrgInForm === "IPNU" ? "Contoh: Ketua IPNU, Sekretaris..." : "Contoh: Ketua IPPNU, Bendahara..."}
                      className={inputCls}
                      style={inputStyle}
                      {...focusFns}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      name="nomor_telepon"
                      defaultValue={editingMember?.nomor_telepon || ""}
                      placeholder="0812xxxx"
                      className={inputCls}
                      style={inputStyle}
                      {...focusFns}
                    />
                  </div>
                </div>

                {/* Alamat */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                    Alamat Lengkap
                  </label>
                  <input
                    name="alamat"
                    defaultValue={editingMember?.alamat || ""}
                    placeholder="Contoh: Jl. Kenanga No. 12, Sidorejo"
                    className={inputCls}
                    style={inputStyle}
                    {...focusFns}
                  />
                </div>

                {/* Tanggal Bergabung */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-600">
                    Tanggal Bergabung / Dilantik
                  </label>
                  <input
                    name="tanggal_bergabung"
                    type="date"
                    defaultValue={editingMember?.tanggal_bergabung || ""}
                    className={inputCls}
                    style={inputStyle}
                    {...focusFns}
                  />
                </div>

                {/* Tombol Simpan */}
                <div className="pt-2">
                  <button
                    disabled={formLoading}
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-60"
                    style={{
                      background: formLoading
                        ? "rgba(244,196,48,0.4)"
                        : `linear-gradient(135deg, ${NU_GOLD}, #f7d45e)`,
                      color: NU_DARK,
                      boxShadow: "0 6px 20px rgba(244,196,48,0.3)",
                    }}
                  >
                    {formLoading ? "Menyimpan Data..." : editingMember ? "Simpan Perubahan Pengurus" : `Simpan Data Pengurus ${selectedOrgInForm}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
