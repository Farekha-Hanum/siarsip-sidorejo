"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Phone, MapPin, Search, Calendar, FileSpreadsheet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { exportPengurusToExcel, PengurusItem } from "@/lib/exportPengurusExcel";

const NU_DARK  = "#0d3320";
const NU_GREEN = "#1f9a5e";

export default function UserPengurusPage() {
  const [members, setMembers] = useState<PengurusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"IPNU" | "IPPNU" | "ALL">("IPNU");
  const [isExporting, setIsExporting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("data_pengurus")
        .select("*")
        .order("nama_lengkap", { ascending: true });
      if (data) setMembers(data);
      setLoading(false);
    })();
  }, []);

  const countIpnu = members.filter(
    (m) => (m.organisasi || "IPNU").toUpperCase() === "IPNU"
  ).length;
  const countIppnu = members.filter(
    (m) => (m.organisasi || "").toUpperCase() === "IPPNU"
  ).length;
  const countTotal = members.length;

  const filtered = members.filter((m) => {
    const org = (m.organisasi || "IPNU").toUpperCase();
    if (activeTab === "IPNU" && org !== "IPNU") return false;
    if (activeTab === "IPPNU" && org !== "IPPNU") return false;

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      return (
        m.nama_lengkap?.toLowerCase().includes(q) ||
        m.jabatan?.toLowerCase().includes(q) ||
        m.nia?.toLowerCase().includes(q) ||
        m.alamat?.toLowerCase().includes(q)
      );
    }
    return true;
  });

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-7 rounded-3xl text-white relative overflow-hidden shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`,
          boxShadow: "0 8px 32px rgba(31,154,94,0.2)",
        }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white">
          <Users size={140} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/15 text-[#80e5b0]">
              ✦ Portal Anggota
            </span>
            <span className="text-[10px] font-semibold text-emerald-200">
              PR IPNU-IPPNU Sidorejo
            </span>
          </div>
          <h1 className="font-extrabold text-2xl md:text-3xl tracking-wide leading-snug">Direktori Pengurus</h1>
          <p className="text-white/80 mt-2 text-sm max-w-xl leading-relaxed tracking-wide">
            Daftar fungsionaris dan struktur kepengurusan PR IPNU &amp; IPPNU Sidorejo. Tersedia pemisahan data per organisasi serta unduh Excel multi-sheet.
          </p>
        </div>

        <div className="relative z-10">
          <button
            onClick={handleExportExcel}
            disabled={isExporting || members.length === 0}
            title="Download file Excel (.xlsx) dengan Sheet IPNU dan IPPNU terpisah"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg bg-white/10 hover:bg-white/20 text-white border border-white/25 disabled:opacity-50"
          >
            <FileSpreadsheet size={18} className="text-emerald-300" />
            <span>{isExporting ? "Mengekspor..." : "Export Excel (.xlsx)"}</span>
          </button>
        </div>
      </motion.div>

      {/* Tabs Filter Organisasi & Pencarian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
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
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
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
            <span>Semua</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
              {countTotal}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Cari nama, jabatan, atau NIA ${activeTab === "ALL" ? "pengurus" : activeTab}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-xs font-medium bg-white border border-emerald-900/10 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all text-slate-800 shadow-sm"
          />
        </div>
      </div>

      {/* Grid Kartu Pengurus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl animate-pulse bg-emerald-50/50 border border-emerald-900/5"
              />
            ))
        ) : filtered.length === 0 ? (
          <div
            className="col-span-full py-16 text-center rounded-3xl bg-white border border-emerald-900/10 shadow-sm"
          >
            <Users size={48} className="mx-auto mb-3 opacity-20 text-emerald-800" />
            <p className="font-bold text-xl text-slate-800">
              {search ? "Pengurus Tidak Ditemukan" : `Belum Ada Data Pengurus ${activeTab === "ALL" ? "" : activeTab}`}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search
                ? `Tidak ada pengurus yang cocok dengan kata pencarian "${search}".`
                : `Daftar pengurus ${activeTab === "ALL" ? "" : activeTab} belum tersedia.`}
            </p>
          </div>
        ) : (
          filtered.map((m, i) => {
            const isIppnu = (m.organisasi || "").toUpperCase() === "IPPNU";
            const cleanPhone = m.nomor_telepon?.replace(/[^0-9]/g, "") || "";
            const waPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -3 }}
                className="bg-white p-6 rounded-2xl flex flex-col relative overflow-hidden group cursor-default border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
              >
                {/* Header Card: Avatar & Nama */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-sm flex-shrink-0"
                    style={{
                      background: isIppnu
                        ? "linear-gradient(135deg, #db2777, #9d174d)"
                        : "linear-gradient(135deg, #1f9a5e, #145c38)",
                    }}
                  >
                    {m.nama_lengkap?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-slate-900 leading-snug truncate group-hover:text-emerald-800 transition-colors tracking-wide">
                      {m.nama_lengkap}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${
                          isIppnu
                            ? "bg-pink-50 text-pink-700 border-pink-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {m.organisasi || "IPNU"}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 tracking-wide">
                        {m.jabatan}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Detail */}
                <div className="space-y-2 mt-auto pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-mono text-[11px] tracking-wide">
                    <span>NIA:</span>
                    <span className="font-semibold text-slate-700 tracking-wider">{m.nia || "—"}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" />
                      <span>{m.nomor_telepon || "—"}</span>
                    </div>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                      >
                        Chat WA ↗
                      </a>
                    )}
                  </div>

                  <div className="flex items-start gap-1.5 text-slate-500">
                    <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{m.alamat || "—"}</span>
                  </div>

                  {m.tanggal_bergabung && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Calendar size={12} className="text-slate-400" />
                      <span>Bergabung: {m.tanggal_bergabung}</span>
                    </div>
                  )}
                </div>

                {/* Background watermarked logo */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity text-slate-900 pointer-events-none">
                  <Users size={80} />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
