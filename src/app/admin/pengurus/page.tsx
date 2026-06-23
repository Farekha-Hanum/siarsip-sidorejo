"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, Edit2, Trash2, Users, X,
  Phone, MapPin, Calendar, CheckCircle2, FileSpreadsheet
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upsertPengurus, deletePengurus } from "@/actions/pengurus";

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
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "IPNU" | "IPPNU">("ALL");
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
    if (result.success) { setShowModal(false); setEditingMember(null); fetchMembers(); }
    else alert(result.error);
  }

  async function handleDelete(id: number) {
    if (confirm("Apakah Anda yakin ingin menghapus data pengurus ini?")) {
      await deletePengurus(id);
      fetchMembers();
    }
  }

  const filteredMembers = members.filter(m => {
    if (activeFilter === "ALL") return true;
    return (m.organisasi || "IPNU") === activeFilter;
  });

  function exportToExcel() {
    const headers = ["No", "NIA", "Nama Lengkap", "Jabatan", "Organisasi", "Kontak", "Alamat"];
    const rows = filteredMembers.map((m, i) => [
      i + 1, 
      m.nia || "-", 
      m.nama_lengkap || "-", 
      m.jabatan || "-", 
      m.organisasi || "IPNU", 
      m.nomor_telepon || "-", 
      m.alamat || "-"
    ]);
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data_pengurus_${activeFilter}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-7 rounded-3xl text-white overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`, boxShadow: "0 8px 32px rgba(31,154,94,0.2)" }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none">
          <Users size={140} />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#80e5b0" }}>✦ SIMPEL NU</p>
          <h1 className="font-bebas text-4xl tracking-tight leading-none">Database Data Pengurus</h1>
          <p className="text-white/55 mt-1.5 text-sm max-w-lg">Kelola biodata, jabatan, dan riwayat bergabung seluruh fungsionaris IPNU-IPPNU Sidorejo.</p>
        </div>
        <div className="flex gap-2 relative z-10">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-xl bg-white/10 text-white border border-white/20"
          >
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button
            onClick={() => { setEditingMember(null); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-xl"
            style={{ background: NU_GOLD, color: NU_DARK, boxShadow: "0 6px 20px rgba(244,196,48,0.4)" }}
          >
            <UserPlus size={18} /> Tambah Pengurus
          </button>
        </div>
      </motion.div>

      {/* Tabs Filter */}
      <div className="flex p-1.5 bg-white rounded-2xl w-fit" style={{ border: "1px solid rgba(31,154,94,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        {["ALL", "IPNU", "IPPNU"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab as any)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === tab 
                ? "bg-[#1f9a5e] text-white shadow-lg shadow-[#1f9a5e]/20" 
                : "text-[#64748b] hover:bg-[#f0faf4] hover:text-[#1f9a5e]"
            }`}
          >
            {tab === "ALL" ? "Semua Anggota" : tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(31,154,94,0.1)", boxShadow: "0 2px 20px rgba(13,31,20,0.06)" }}>
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="w-10 h-10 border-4 rounded-full animate-spin"
              style={{ borderColor: "rgba(31,154,94,0.15)", borderTopColor: NU_GREEN }} />
          </div>
        ) : members.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-4" style={{ color: "#94a3b8" }}>
            <Users size={64} className="opacity-20" />
            <p className="font-bebas text-xl">Belum Ada Data Pengurus</p>
            <p className="text-sm">Klik tombol Tambah Pengurus untuk mendaftar fungsionaris pertama.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-bold tracking-widest"
                  style={{ background: "rgba(240,250,244,0.7)", color: "#64748b", borderBottom: "1px solid rgba(31,154,94,0.08)" }}>
                  <th className="px-7 py-4">Nama &amp; Jabatan</th>
                  <th className="px-7 py-4">Organisasi</th>
                  <th className="px-7 py-4">Kontak &amp; Alamat</th>
                  <th className="px-7 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m, i) => (
                  <motion.tr
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="transition-colors group"
                    style={{ borderBottom: "1px solid rgba(31,154,94,0.05)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(240,250,244,0.6)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                           style={{ background: m.organisasi === 'IPNU' ? '#145c38' : '#1f9a5e' }}>
                           {m.nama_lengkap?.[0] || 'A'}
                         </div>
                         <div>
                            <p className="font-bold text-sm" style={{ color: NU_DARK }}>{m.nama_lengkap}</p>
                            <p className="text-[10px] text-gray-400 font-mono">NIA: {m.nia || '—'}</p>
                         </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mt-1"
                        style={{ background: "rgba(31,154,94,0.1)", color: NU_GREEN, border: "1px solid rgba(31,154,94,0.2)" }}>
                        {m.jabatan}
                      </span>
                    </td>
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-2">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                           m.organisasi === 'IPPNU' ? 'bg-[#fdf2f8] text-[#be185d] border-[#fbcfe8]' : 'bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]'
                         }`} style={{ border: "1px solid" }}>
                          {m.organisasi || 'IPNU'}
                        </span>
                      </div>
                    </td>
                    <td className="px-7 py-5 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm" style={{ color: "#475569" }}>
                        <Phone size={13} style={{ color: "#94a3b8" }} /> {m.nomor_telepon || "—"}
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                        <MapPin size={13} style={{ color: "#94a3b8" }} /> {m.alamat || "—"}
                      </div>
                    </td>
                    <td className="px-7 py-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => { setEditingMember(m); setShowModal(true); }}
                          className="p-2 rounded-lg transition-all" style={{ color: "#94a3b8" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(31,154,94,0.08)"; (e.currentTarget as HTMLElement).style.color = NU_GREEN; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
                          <Edit2 size={17} />
                        </button>
                        <button onClick={() => handleDelete(m.id)}
                          className="p-2 rounded-lg transition-all" style={{ color: "#94a3b8" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.08)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ border: "1px solid rgba(31,154,94,0.15)" }}
            >
              {/* Modal Header */}
              <div className="px-8 py-6 flex justify-between items-start sticky top-0 z-10"
                style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})` }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#80e5b0" }}>
                    {editingMember ? "Edit Data" : "Tambah Baru"}
                  </p>
                  <h2 className="font-bebas text-3xl text-white tracking-tight">
                    {editingMember ? "Edit Data Pengurus" : "Tambah Pengurus Baru"}
                  </h2>
                  <p className="text-white/45 text-xs mt-1">Lengkapi informasi sesuai KTP atau kartu anggota.</p>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl transition-all hover:bg-white/10 text-white/60 hover:text-white mt-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                <input type="hidden" name="id" value={editingMember?.id || ""} />

                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>NIA (Nomor Induk)</label>
                    <input name="nia" defaultValue={editingMember?.nia || ""} placeholder="Contoh: 11.23.001"
                      className={inputCls} style={inputStyle} {...focusFns} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Nama Lengkap</label>
                    <input name="nama_lengkap" defaultValue={editingMember?.nama_lengkap || ""} required
                      className={inputCls} style={inputStyle} {...focusFns} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Jabatan</label>
                  <input name="jabatan" defaultValue={editingMember?.jabatan || ""} required
                    placeholder="Contoh: Sekretaris"
                    className={inputCls} style={inputStyle} {...focusFns} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Nomor Telepon (WA)</label>
                  <input name="nomor_telepon" defaultValue={editingMember?.nomor_telepon || ""}
                    placeholder="0812xxxx"
                    className={inputCls} style={inputStyle} {...focusFns} />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Alamat Lengkap</label>
                  <input name="alamat" defaultValue={editingMember?.alamat || ""}
                    placeholder="Jl. Contoh No. 1, Sidorejo"
                    className={inputCls} style={inputStyle} {...focusFns} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Organisasi</label>
                  <select name="organisasi" defaultValue={editingMember?.organisasi || "IPNU"} required
                    className={inputCls} style={inputStyle} {...focusFns}>
                    <option value="IPNU">IPNU</option>
                    <option value="IPPNU">IPPNU</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>Tanggal Bergabung</label>
                  <input name="tanggal_bergabung" type="date" defaultValue={editingMember?.tanggal_bergabung || ""}
                    className={inputCls} style={inputStyle} {...focusFns} />
                </div>

                <div className="flex items-end">
                  <button disabled={formLoading} type="submit"
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg"
                    style={{
                      background: formLoading ? "rgba(244,196,48,0.4)" : `linear-gradient(135deg, ${NU_GOLD}, #f7d45e)`,
                      color: NU_DARK,
                      boxShadow: "0 6px 20px rgba(244,196,48,0.3)",
                    }}>
                    {formLoading ? "Memproses..." : editingMember ? "Simpan Perubahan" : "Simpan Data"}
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
