"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Calendar, Award, X, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upsertKegiatan, deleteKegiatan } from "@/actions/kegiatan";

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
  onFocus: (e: React.FocusEvent<any>) => { e.target.style.border = `1px solid ${NU_GREEN}`; e.target.style.boxShadow = "0 0 0 3px rgba(31,154,94,0.1)"; },
  onBlur: (e: React.FocusEvent<any>) => { e.target.style.border = "1px solid rgba(31,154,94,0.15)"; e.target.style.boxShadow = "none"; },
};

export default function AdminKegiatanPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => { fetchActivities(); }, []);

  async function fetchActivities() {
    setLoading(true);
    const { data } = await supabase.from("kegiatan").select("*").order("tanggal_kegiatan", { ascending: false });
    if (data) setActivities(data);
    setLoading(false);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);
    const result = await upsertKegiatan(new FormData(e.currentTarget));
    setFormLoading(false);
    if (result.success) { setShowModal(false); setEditingActivity(null); fetchActivities(); }
    else alert(result.error);
  }

  async function handleDelete(id: number) {
    if (confirm("Hapus kegiatan ini? Semua partisipasi terkait juga akan terhapus.")) {
      await deleteKegiatan(id);
      fetchActivities();
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-7 rounded-3xl text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`, boxShadow: "0 8px 32px rgba(31,154,94,0.2)" }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white"><Calendar size={140} /></div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#80e5b0" }}>✦ SIMPEL NU</p>
          <h1 className="font-bebas text-4xl tracking-tight leading-none">Daftar Kegiatan</h1>
          <p className="text-white/55 mt-1.5 text-sm">Buat dan kelola daftar kegiatan organisasi serta tentukan bobot skor partisipasi anggota.</p>
        </div>
        <button
          onClick={() => { setEditingActivity(null); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-xl flex-shrink-0 relative z-10"
          style={{ background: NU_GOLD, color: NU_DARK, boxShadow: "0 6px 20px rgba(244,196,48,0.4)" }}
        >
          <Plus size={18} /> Tambah Kegiatan
        </button>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-48 rounded-3xl animate-pulse" style={{ background: "rgba(31,154,94,0.06)" }} />
          ))
        ) : activities.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-3xl bg-white" style={{ border: "1px solid rgba(31,154,94,0.1)" }}>
            <FileText size={48} className="mx-auto mb-3 opacity-20" style={{ color: NU_GREEN }} />
            <p className="font-bebas text-xl" style={{ color: NU_DARK }}>Belum Ada Kegiatan</p>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>Tambahkan kegiatan pertama untuk mulai memberikan poin kepada anggota.</p>
          </div>
        ) : (
          activities.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-3xl flex flex-col justify-between group cursor-default"
              style={{ border: "1px solid rgba(31,154,94,0.1)", boxShadow: "0 2px 16px rgba(13,31,20,0.06)" }}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: "rgba(31,154,94,0.1)" }}>
                    <Calendar size={22} style={{ color: NU_GREEN }} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingActivity(k); setShowModal(true); }}
                      className="p-2 rounded-lg transition-all" style={{ color: "#94a3b8" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(31,154,94,0.08)"; (e.currentTarget as HTMLElement).style.color = NU_GREEN; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(k.id)}
                      className="p-2 rounded-lg transition-all" style={{ color: "#94a3b8" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.08)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-base leading-tight mb-2 line-clamp-1" style={{ color: NU_DARK }}>{k.nama_kegiatan}</h3>
                <p className="text-sm line-clamp-2" style={{ color: "#64748b" }}>{k.deskripsi || "Tidak ada deskripsi."}</p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4" style={{ borderTop: "1px solid rgba(31,154,94,0.08)" }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Tanggal</span>
                  <p className="text-xs font-bold mt-0.5" style={{ color: "#475569" }}>
                    {(k.tanggal_kegiatan ? (() => { try { const d = new Date(k.tanggal_kegiatan); return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("id-ID", { day: "numeric", month: "long" }); } catch { return "-"; } })() : "-")}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm"
                  style={{ background: "rgba(244,196,48,0.12)", color: "#7a4f00", border: "1px solid rgba(244,196,48,0.3)" }}>
                  <Award size={14} />
                  {k.bobot_skor} Poin
                </div>
              </div>
            </motion.div>
          ))
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
              <div className="px-7 py-5 flex justify-between items-center"
                style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})` }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#80e5b0" }}>
                    {editingActivity ? "Edit" : "Tambah Baru"}
                  </p>
                  <h2 className="font-bebas text-2xl text-white tracking-tight">
                    {editingActivity ? "Edit Kegiatan" : "Buat Kegiatan Baru"}
                  </h2>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl transition-all hover:bg-white/10 text-white/70 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-7 space-y-5">
                <input type="hidden" name="id" value={editingActivity?.id || ""} />
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Nama Kegiatan</label>
                  <input name="nama_kegiatan" defaultValue={editingActivity?.nama_kegiatan || ""} required
                    className={inputCls} style={inputStyle} {...focusFns} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Tanggal</label>
                    <input name="tanggal_kegiatan" type="date" defaultValue={editingActivity?.tanggal_kegiatan || ""} required
                      className={inputCls} style={inputStyle} {...focusFns} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Bobot Skor</label>
                    <input name="bobot_skor" type="number" defaultValue={editingActivity?.bobot_skor || 10} required
                      className={inputCls} style={inputStyle} {...focusFns} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Deskripsi</label>
                  <textarea name="deskripsi" defaultValue={editingActivity?.deskripsi || ""} rows={3}
                    className={`${inputCls} resize-none`} style={inputStyle} {...focusFns} />
                </div>
                <button disabled={formLoading} type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg"
                  style={{ background: formLoading ? "rgba(244,196,48,0.4)" : `linear-gradient(135deg, ${NU_GOLD}, #f7d45e)`,
                    color: NU_DARK, boxShadow: "0 6px 20px rgba(244,196,48,0.3)" }}>
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
