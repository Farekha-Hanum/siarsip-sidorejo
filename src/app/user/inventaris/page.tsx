"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Search, Info, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";

const NU_DARK  = "#0d3320";
const NU_GREEN = "#1f9a5e";

const conditionMap: Record<string, { bg: string; color: string; border: string }> = {
  "Baik":         { bg: "rgba(31,154,94,0.1)",   color: "#145c38", border: "rgba(31,154,94,0.25)" },
  "Rusak Ringan": { bg: "rgba(244,196,48,0.1)",  color: "#7a4f00", border: "rgba(244,196,48,0.3)" },
  "Rusak Berat":  { bg: "rgba(220,38,38,0.1)",   color: "#991b1b", border: "rgba(220,38,38,0.25)" },
};

export default function UserInventarisPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("inventaris").select("*").order("nama_barang", { ascending: true });
      if (data) setItems(data);
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter(i => !search || i.nama_barang?.toLowerCase().includes(search.toLowerCase()));

  function handleExportExcel() {
    if (filtered.length === 0) return alert("Tidak ada data untuk diekspor");
    
    const exportData = filtered.map(item => ({
      "Nama Barang": item.nama_barang,
      "Jumlah (Unit)": item.jumlah,
      "Kondisi": item.kondisi,
      "Keterangan": item.keterangan || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventaris");
    XLSX.writeFile(workbook, `Inventaris_IPNU_IPPNU_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="p-7 rounded-3xl text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`, boxShadow: "0 8px 32px rgba(31,154,94,0.2)" }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white"><Package size={140} /></div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#80e5b0" }}>✦ Portal Anggota</p>
          <h1 className="font-bebas text-4xl tracking-tight leading-none">Inventaris Ranting</h1>
          <p className="text-white/55 mt-1.5 text-sm">Daftar aset dan perlengkapan milik ranting IPNU-IPPNU Sidorejo.</p>
        </div>
      </motion.div>

      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "#94a3b8" }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama barang..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none text-sm font-medium transition-all"
            style={{ background: "white", border: "1px solid rgba(31,154,94,0.12)", color: NU_DARK }}
            onFocus={(e) => { e.target.style.border = `1px solid ${NU_GREEN}`; e.target.style.boxShadow = "0 0 0 3px rgba(31,154,94,0.08)"; }}
            onBlur={(e) => { e.target.style.border = "1px solid rgba(31,154,94,0.12)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md hover:scale-105 flex-shrink-0"
          style={{ background: "white", color: NU_GREEN, border: "1px solid rgba(31,154,94,0.2)" }}
        >
          <Download size={18} /> Export Excel
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: "rgba(31,154,94,0.06)" }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-3xl bg-white"
            style={{ border: "1px solid rgba(31,154,94,0.1)" }}>
            <Package size={48} className="mx-auto mb-3 opacity-20" style={{ color: NU_GREEN }} />
            <p className="font-bebas text-xl" style={{ color: NU_DARK }}>
              {search ? "Barang Tidak Ditemukan" : "Belum Ada Data Inventaris"}
            </p>
          </div>
        ) : (
          filtered.map((item, i) => {
            const cs = conditionMap[item.kondisi] || { bg: "rgba(148,163,184,0.1)", color: "#475569", border: "rgba(148,163,184,0.2)" };
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-2xl flex flex-col justify-between cursor-default"
                style={{ border: "1px solid rgba(31,154,94,0.1)", boxShadow: "0 2px 14px rgba(13,31,20,0.06)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base leading-tight" style={{ color: NU_DARK }}>{item.nama_barang}</h3>
                    <p className="text-sm font-medium mt-1" style={{ color: "#64748b" }}>{item.jumlah} Unit Tersedia</p>
                  </div>
                  <div className="p-2.5 rounded-xl flex-shrink-0 transition-transform"
                    style={{ background: cs.bg }}>
                    <Package size={20} style={{ color: cs.color }} />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                    {item.kondisi}
                  </span>
                  {item.keterangan && (
                    <div className="group relative">
                      <Info size={16} style={{ color: "#94a3b8" }} className="cursor-help" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2.5 rounded-xl text-[11px] leading-relaxed
                        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl"
                        style={{ background: NU_DARK, color: "rgba(255,255,255,0.85)" }}>
                        {item.keterangan}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
