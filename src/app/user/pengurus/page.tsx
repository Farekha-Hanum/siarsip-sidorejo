"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Phone, MapPin, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NU_DARK  = "#0d3320";
const NU_GREEN = "#1f9a5e";

export default function UserPengurusPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("data_pengurus").select("*").order("nama_lengkap", { ascending: true });
      if (data) setMembers(data);
      setLoading(false);
    })();
  }, []);

  const filtered = members.filter(m =>
    !search ||
    m.nama_lengkap?.toLowerCase().includes(search.toLowerCase()) ||
    m.jabatan?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="p-7 rounded-3xl text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NU_DARK}, ${NU_GREEN})`, boxShadow: "0 8px 32px rgba(31,154,94,0.2)" }}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white"><Users size={140} /></div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#80e5b0" }}>✦ Portal Anggota</p>
          <h1 className="font-bebas text-4xl tracking-tight leading-none">Direktori Pengurus</h1>
          <p className="text-white/55 mt-1.5 text-sm">
            Daftar fungsionaris dan struktur organisasi ranting IPNU-IPPNU Sidorejo.
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "#94a3b8" }} />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau jabatan pengurus..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none text-sm font-medium transition-all"
          style={{ background: "white", border: "1px solid rgba(31,154,94,0.12)", color: NU_DARK }}
          onFocus={(e) => { e.target.style.border = `1px solid ${NU_GREEN}`; e.target.style.boxShadow = "0 0 0 3px rgba(31,154,94,0.08)"; }}
          onBlur={(e) => { e.target.style.border = "1px solid rgba(31,154,94,0.12)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: "rgba(31,154,94,0.06)" }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-3xl bg-white"
            style={{ border: "1px solid rgba(31,154,94,0.1)" }}>
            <Users size={48} className="mx-auto mb-3 opacity-20" style={{ color: NU_GREEN }} />
            <p className="font-bebas text-xl" style={{ color: NU_DARK }}>
              {search ? "Pengurus Tidak Ditemukan" : "Belum Ada Data Pengurus"}
            </p>
          </div>
        ) : (
          filtered.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-2xl flex flex-col relative overflow-hidden group cursor-default"
              style={{ border: "1px solid rgba(31,154,94,0.1)", boxShadow: "0 2px 14px rgba(13,31,20,0.06)" }}
            >
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${NU_GREEN}, #145c38)` }}>
                  {m.nama_lengkap?.[0] || "?"}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base leading-tight truncate" style={{ color: NU_DARK }}>
                    {m.nama_lengkap}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
                      style={{ background: "rgba(31,154,94,0.1)", color: NU_GREEN, border: "1px solid rgba(31,154,94,0.2)" }}>
                      {m.jabatan}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200">
                      NIA: {m.nia || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-auto">
                <div className="flex items-center gap-2 text-sm" style={{ color: "#475569" }}>
                  <Phone size={13} style={{ color: "#94a3b8" }} />
                  <span>{m.nomor_telepon || "—"}</span>
                </div>
                <div className="flex items-start gap-2 text-sm" style={{ color: "#64748b" }}>
                  <MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#94a3b8" }} />
                  <span className="line-clamp-1">{m.alamat || "—"}</span>
                </div>
              </div>

              {/* BG decoration */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity text-[#0d3320]">
                <Users size={90} />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
