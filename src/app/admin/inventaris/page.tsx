"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Package, X, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upsertInventaris, deleteInventaris } from "@/actions/inventaris";
import * as XLSX from "xlsx";

const NU_DARK  = "#0d3320";
const NU_GREEN = "#1f9a5e";
const NU_GOLD  = "#f4c430";

const getConditionStyle = (cond: string) => {
  switch (cond) {
    case "Baik":        return { bg: "rgba(31,154,94,0.1)",   color: "#145c38", border: "rgba(31,154,94,0.25)" };
    case "Rusak Ringan": return { bg: "rgba(244,196,48,0.1)", color: "#7a4f00", border: "rgba(244,196,48,0.3)" };
    case "Rusak Berat":  return { bg: "rgba(220,38,38,0.1)",  color: "#991b1b", border: "rgba(220,38,38,0.25)" };
    default:            return { bg: "rgba(148,163,184,0.1)", color: "#475569", border: "rgba(148,163,184,0.2)" };
  }
};

const inputCls = "w-full px-4 py-3 rounded-xl outline-none font-sans transition-all text-sm";
const inputStyle: React.CSSProperties = {
  background: "rgba(240,250,244,0.8)",
  border: "1px solid rgba(31,154,94,0.15)",
  color: NU_DARK,
};

export default function AdminInventarisPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase.from("inventaris").select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    const result = await upsertInventaris(new FormData(e.currentTarget));
    setFormLoading(false);
    if (result.success) { setShowModal(false); setEditingItem(null); fetchItems(); }
    else alert(result.error);
  }

  async function handleDelete(id: number) {
    if (confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
      await deleteInventaris(id);
      fetchItems();
    }
  }

  function handleExportExcel() {
    if (items.length === 0) return alert("Tidak ada data untuk diekspor");
    
    const exportData = items.map(item => ({
      "Nama Barang": item.nama_barang,
      "Jumlah (Unit)": item.jumlah,
      "Kondisi": item.kondisi,
      "Keterangan": item.keterangan || "-",
      "Ditambahkan Pada": item.created_at ? (() => { try { const d = new Date(item.created_at); return isNaN(d.getTime()) ? "-" : d.toLocaleString("id-ID"); } catch { return "-"; } })() : "-"
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
        className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-7 rounded-3xl text-white"
        style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`, boxShadow: "0 8px 32px rgba(31,154,94,0.2)" }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#80e5b0" }}>✦ SIMPEL NU</p>
          <h1 className="font-bebas text-4xl tracking-tight leading-none">Manajemen Inventaris</h1>
          <p className="text-white/55 mt-1.5 text-sm">Pantau dan kelola aset organisasi ranting IPNU-IPPNU Sidorejo.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-xl flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <Download size={18} /> Export Excel
          </button>
          <button
            onClick={() => { setEditingItem(null); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-xl flex-shrink-0"
            style={{ background: NU_GOLD, color: NU_DARK, boxShadow: "0 6px 20px rgba(244,196,48,0.4)" }}
          >
            <Plus size={18} /> Tambah Barang
          </button>
        </div>
      </motion.div>

      {/* Table */}
      <div className="bg-white rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(31,154,94,0.1)", boxShadow: "0 2px 20px rgba(13,31,20,0.06)" }}>
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="w-10 h-10 border-4 rounded-full animate-spin"
              style={{ borderColor: "rgba(31,154,94,0.15)", borderTopColor: NU_GREEN }} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-4" style={{ color: "#94a3b8" }}>
            <Package size={64} className="opacity-20" />
            <p className="font-bebas text-xl">Belum Ada Data Inventaris</p>
            <p className="text-sm">Klik tombol Tambah Barang untuk menambahkan aset pertama.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-bold tracking-widest"
                  style={{ background: "rgba(240,250,244,0.7)", color: "#64748b", borderBottom: "1px solid rgba(31,154,94,0.08)" }}>
                  <th className="px-7 py-4">Nama Barang</th>
                  <th className="px-7 py-4">Jumlah</th>
                  <th className="px-7 py-4">Kondisi</th>
                  <th className="px-7 py-4">Keterangan</th>
                  <th className="px-7 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const cs = getConditionStyle(item.kondisi);
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(31,154,94,0.05)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(240,250,244,0.6)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <td className="px-7 py-5 font-bold" style={{ color: NU_DARK }}>{item.nama_barang}</td>
                      <td className="px-7 py-5 font-medium" style={{ color: "#475569" }}>{item.jumlah} Unit</td>
                      <td className="px-7 py-5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                          {item.kondisi}
                        </span>
                      </td>
                      <td className="px-7 py-5 text-sm italic" style={{ color: "#64748b" }}>{item.keterangan || "—"}</td>
                      <td className="px-7 py-5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => { setEditingItem(item); setShowModal(true); }}
                            className="p-2 rounded-lg transition-all"
                            style={{ color: "#94a3b8" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(31,154,94,0.08)"; (e.currentTarget as HTMLElement).style.color = NU_GREEN; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
                            <Edit2 size={17} />
                          </button>
                          <button onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg transition-all"
                            style={{ color: "#94a3b8" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.08)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
                            <Trash2 size={17} />
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" style={{ background: "rgba(13,31,20,0.55)", backdropFilter: "blur(6px)" }}
              onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
              style={{ border: "1px solid rgba(31,154,94,0.15)" }}
            >
              {/* Modal Header */}
              <div className="px-7 py-5 flex justify-between items-center"
                style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})` }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#80e5b0" }}>
                    {editingItem ? "Edit Data" : "Tambah Baru"}
                  </p>
                  <h2 className="font-bebas text-2xl text-white tracking-tight">
                    {editingItem ? "Edit Barang" : "Tambah Barang Baru"}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl transition-all hover:bg-white/10 text-white/70 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-7 space-y-5">
                <input type="hidden" name="id" value={editingItem?.id || ""} />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Nama Barang</label>
                  <input name="nama_barang" defaultValue={editingItem?.nama_barang || ""} required
                    className={inputCls} style={inputStyle}
                    onFocus={(e) => { e.target.style.border = `1px solid ${NU_GREEN}`; e.target.style.boxShadow = "0 0 0 3px rgba(31,154,94,0.1)"; }}
                    onBlur={(e) => { e.target.style.border = "1px solid rgba(31,154,94,0.15)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Jumlah (Unit)</label>
                    <input name="jumlah" type="number" defaultValue={editingItem?.jumlah || 1} min="1" required
                      className={inputCls} style={inputStyle}
                      onFocus={(e) => { e.target.style.border = `1px solid ${NU_GREEN}`; e.target.style.boxShadow = "0 0 0 3px rgba(31,154,94,0.1)"; }}
                      onBlur={(e) => { e.target.style.border = "1px solid rgba(31,154,94,0.15)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Kondisi</label>
                    <select name="kondisi" defaultValue={editingItem?.kondisi || "Baik"}
                      className={inputCls} style={inputStyle}
                      onFocus={(e) => { e.target.style.border = `1px solid ${NU_GREEN}`; }}
                      onBlur={(e) => { e.target.style.border = "1px solid rgba(31,154,94,0.15)"; }}
                    >
                      <option>Baik</option>
                      <option>Rusak Ringan</option>
                      <option>Rusak Berat</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Keterangan (Opsional)</label>
                  <textarea name="keterangan" defaultValue={editingItem?.keterangan || ""} rows={3}
                    className={`${inputCls} resize-none`} style={inputStyle}
                    onFocus={(e) => { e.target.style.border = `1px solid ${NU_GREEN}`; e.target.style.boxShadow = "0 0 0 3px rgba(31,154,94,0.1)"; }}
                    onBlur={(e) => { e.target.style.border = "1px solid rgba(31,154,94,0.15)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>

                <button disabled={formLoading} type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:scale-105"
                  style={{
                    background: formLoading ? "rgba(244,196,48,0.4)" : `linear-gradient(135deg, ${NU_GOLD}, #f7d45e)`,
                    color: NU_DARK,
                    boxShadow: "0 6px 20px rgba(244,196,48,0.3)",
                  }}
                >
                  {formLoading ? "Menyimpan..." : editingItem ? "Update Barang" : "Simpan Barang"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
