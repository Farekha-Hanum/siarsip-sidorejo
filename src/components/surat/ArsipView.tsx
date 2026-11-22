"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive, FileText, Download, Calendar, Search,
  FileSearch, Star, FileSpreadsheet, PlusCircle, X, RefreshCw,
  ExternalLink, ZoomIn, Eye, Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { ORG_CONFIGS, type OrgType } from "@/lib/org-config";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

export default function ArsipView({ org }: { org: string }) {
  const config = ORG_CONFIGS[org as OrgType];
  const pathname = usePathname();
  const basePath = pathname.startsWith("/admin") ? "/admin" : "/user";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rxbymwkadxzqckjufjbr.supabase.co";
  const getFileUrl = (letter: any): string | null => {
    if (!letter) return null;
    if (letter.file_url) return letter.file_url;
    if (letter.storage_path) {
      return `${supabaseUrl}/storage/v1/object/public/archives/${letter.storage_path}`;
    }
    return null;
  };

  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("semua"); // semua, masuk, keluar
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      if (!cancelled) setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role || "user";
      setIsAdmin(role === "admin");

      let query = supabase
        .from("surat")
        .select("*")
        .order("created_at", { ascending: false });

      // Jika org adalah 'gabungan', kita tampilkan yang kategori_dashboard-nya 'gabungan' ATAU NULL
      if (org === "gabungan") {
        query = query.or("kategori_dashboard.eq.gabungan,kategori_dashboard.is.null");
      } else if (org !== "all") {
        query = query.eq("kategori_dashboard", org);
      }

      const { data } = await query;
      if (!cancelled) {
        if (data) setLetters(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [org, refreshTrigger]);

  // Lock body scroll and support Esc key when modal or lightbox is open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (lightboxUrl) {
          setLightboxUrl(null);
        } else if (selectedLetter) {
          setSelectedLetter(null);
        }
      }
    }
    if (lightboxUrl || selectedLetter) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxUrl, selectedLetter]);

  if (!config) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md text-center">
        <h1 className="font-bold text-2xl text-slate-800 mb-2">Organisasi Tidak Ditemukan</h1>
        <p className="text-slate-500">Organisasi "{org}" tidak dikenal. Periksa URL atau pilih organisasi yang valid.</p>
      </div>
    </div>;
  }

  if (isAdmin === false && basePath === "/user" && org === "all") {
     // Optional: allow users to see their own org archive? 
     // For now follow existing logic but refined.
  }

  const filtered = letters.filter((s) => {
    const matchSearch =
      !search ||
      s.nomor_surat?.toLowerCase().includes(search.toLowerCase()) ||
      s.perihal?.toLowerCase().includes(search.toLowerCase());
    
    const matchesTab = 
      activeTab === "semua" ? true :
      activeTab === "masuk" ? s.jenis_surat === "masuk_scan" :
      activeTab === "keluar" ? s.jenis_surat === "keluar_otomatis" : true;

    return matchSearch && matchesTab;
  });

  function handleDownloadPdf(letter: any) {
    const meta = letter.metadata;
    const isIPNU = letter.kategori_dashboard === "ipnu" || letter.kategori_dashboard === "gabungan";
    const font = isIPNU ? "Arial, sans-serif" : "'Times New Roman', Times, serif";
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Izinkan popup untuk mendownload PDF. Periksa pengaturan popup blocker browser Anda.");
      return;
    }

    const html = `
      <html>
      <head>
        <title>${letter.nomor_surat}</title>
        <style>
          body { font-family: ${font}; padding: 40px; }
          .header { text-align: right; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .ttd { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
          .f { position: fixed; bottom: 30px; left: 0; right: 0; text-align: center; color: #4dcf8f; font-weight: bold; }
          .n { font-weight: bold; text-decoration: underline; text-transform: uppercase; margin-top: 60px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color:#4dcf8f; margin:0; font-size:16pt;">${meta?.kop?.tingkat || ""}</h1>
          <h2 style="color:#4dcf8f; margin:0; font-size:14pt;">${meta?.kop?.org || ""}</h2>
          ${meta?.kop?.org2 ? `<h2 style="color:#4dcf8f; margin:0; font-size:14pt;">${meta.kop.org2}</h2>` : ""}
          <p><b>${[meta?.kop?.sub, meta?.kop?.alamat].filter(Boolean).join(" ") || ""}</b></p>
        </div>
        <p>Nomor: ${letter.nomor_surat}</p>
        <p>Hal: <b>${letter.perihal}</b></p>
        <p>Kepada Yth.<br><b>${meta?.tujuan || ""}</b></p>
        <div style="margin-top:30px">${(meta?.isi_surat || "").split("\n").join("<br>")}</div>
        <div class="ttd">
          <div><p>${meta?.ttd1?.jabatan || ""}</p><div class="n">${meta?.ttd1?.nama || ""}</div><p>NIA: ${meta?.ttd1?.nia || ""}</p></div>
          <div><p>${meta?.ttd2?.jabatan || ""}</p><div class="n">${meta?.ttd2?.nama || ""}</div><p>NIA: ${meta?.ttd2?.nia || ""}</p></div>
        </div>
        <div style="position:fixed; bottom:30px; left:40px; display:flex; align-items:center; gap:10px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIF-${letter.nomor_surat}" style="width:50px;height:50px;">
          <span style="font-size:7pt;color:#999 italic">Verifikasi digital SIMPEL NU</span>
        </div>
        <div class="f">BELAJAR, BERJUANG, BERTAQWA</div>
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 800);
  }

  function exportToExcel() {
    const headers = ["No", "Nomor Surat", "Perihal", "Tanggal", "Pembuat"];
    const rows = filtered.map((s, i) => [i + 1, s.nomor_surat || "-", s.perihal || "-", s.tanggal_surat || "-", s.profiles?.nama_lengkap || "-"]);
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arsip_${org}.csv`;
    a.click();
  }

  const counts = {
    masuk: letters.filter(s => s.jenis_surat === "masuk_scan").length,
    keluar: letters.filter(s => s.jenis_surat === "keluar_otomatis" || s.jenis_surat === "digital").length
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6 md:p-10">
      {/* Header Utama */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-[2rem] text-white overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${config.color}, #0d3320)` }}>
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-xl">
             <Archive size={32} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-green-200 opacity-80">Arsip Digital Terintegrasi</p>
            <h1 className="font-extrabold text-2xl md:text-3xl tracking-tight">Arsip {config.name}</h1>
          </div>
        </div>
        <div className="relative z-10 flex gap-3 items-center">
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className={`p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all ${loading ? 'animate-spin' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          {basePath === "/admin" && (
            <Link href={`${basePath}/surat-digital/${org}/buat`}>
              <button className="px-6 py-3 rounded-xl bg-[#f4c430] text-[#0d3320] text-xs font-bold shadow-lg hover:scale-105 transition-all">Buat Surat Baru</button>
            </Link>
          )}
          <button onClick={exportToExcel} className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md text-xs font-bold border border-white/10 hover:bg-white/20 transition-all">Export Excel</button>
        </div>
        {/* Decoration */}
        <div className="absolute -right-10 -bottom-10 opacity-10"><Archive size={200} /></div>
      </motion.div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-blue-100 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FileSearch size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Surat Masuk (Scan)</p>
            <p className="text-xl font-bold text-slate-800">{counts.masuk} Dokumen</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-green-100 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><FileText size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Surat Keluar (Sistem)</p>
            <p className="text-xl font-bold text-slate-800">{counts.keluar} Dokumen</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border shadow-sm">
        <div className="flex p-1 bg-slate-100 rounded-xl self-start">
          {[
            { id: "semua", label: "Semua Arsip" },
            { id: "masuk", label: "Surat Masuk" },
            { id: "keluar", label: "Surat Keluar" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id 
                ? "bg-white text-green-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Cari nomor atau perihal..." 
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-slate-50 border-none focus:ring-2 focus:ring-green-500 outline-none transition-all" 
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b">
              <th className="p-5 w-16">No</th>
              <th className="p-5">Informasi Surat</th>
              <th className="p-5">Jenis</th>
              <th className="p-5">Pembuat</th>
              <th className="p-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((s, i) => {
              const scanImg = getFileUrl(s);
              return (
                <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-5 text-slate-400 font-mono text-xs">{i + 1}</td>
                  <td className="p-5">
                    <div className="flex items-start gap-3.5">
                      {scanImg ? (
                        <button
                          type="button"
                          onClick={() => setSelectedLetter(s)}
                          className="w-12 h-14 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-100 group relative cursor-pointer shadow-xs hover:shadow-md hover:border-blue-400 transition-all text-left"
                          title="Klik untuk melihat foto dokumen"
                        >
                          <img 
                            src={scanImg} 
                            alt="Foto Dokumen" 
                            loading="lazy" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye size={16} />
                          </div>
                        </button>
                      ) : (
                        <div className={`w-12 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                          s.jenis_surat === "masuk_scan"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-green-50 text-green-600 border-green-100"
                        }`}>
                          <FileText size={20} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 text-sm leading-tight mb-1 truncate">{s.nomor_surat || "Tanpa Nomor"}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                          <Calendar size={12} /> {s.tanggal_surat ? (() => { try { const d = new Date(s.tanggal_surat); return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return "-"; } })() : "-"}
                        </p>
                        <p className="text-xs text-slate-400 italic line-clamp-1">{s.perihal}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      s.jenis_surat === "masuk_scan" 
                      ? "bg-blue-50 text-blue-600 border border-blue-100" 
                      : "bg-green-50 text-green-600 border border-green-100"
                    }`}>
                      {s.jenis_surat === "masuk_scan" ? "Masuk" : "Keluar"}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {s.profiles?.nama_lengkap?.charAt(0) || "U"}
                      </div>
                      <span className="text-xs font-medium text-slate-600">{s.profiles?.nama_lengkap || "User"}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => setSelectedLetter(s)} 
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <Archive size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-medium">Belum ada dokumen di folder ini.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedLetter(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-white rounded-[2.5rem] z-[160] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 md:p-8 bg-slate-900 text-white flex justify-between items-center relative flex-shrink-0">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pratinjau Dokumen</p>
                  <h3 className="font-bold text-lg md:text-xl tracking-tight text-white line-clamp-1">{selectedLetter.perihal}</h3>
                </div>
                <button onClick={() => setSelectedLetter(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor Surat</label>
                    <p className="font-bold text-slate-800 text-sm md:text-base break-all">{selectedLetter.nomor_surat || "Tanpa Nomor"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori Arsip</label>
                    <p className="font-bold text-slate-800 uppercase text-xs">{selectedLetter.kategori_dashboard} · {selectedLetter.jenis_surat === "masuk_scan" ? "Masuk" : "Keluar"}</p>
                  </div>
                </div>

                {selectedLetter.jenis_surat === "masuk_scan" ? (
                  <div className="space-y-4">
                    {selectedLetter.metadata?.sender && (
                      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block">Pengirim Surat</label>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedLetter.metadata.sender}</p>
                        </div>
                        {selectedLetter.metadata?.original_date && (
                          <div className="text-right">
                            <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block">Tgl Surat</label>
                            <p className="text-xs font-semibold text-slate-600 mt-0.5">{selectedLetter.metadata.original_date}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {getFileUrl(selectedLetter) ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <ImageIcon size={15} className="text-blue-600" /> Pratinjau Foto Scan Fisik
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">Klik gambar untuk perbesar</span>
                        </div>
                        
                        <div 
                          onClick={() => setLightboxUrl(getFileUrl(selectedLetter))}
                          className="relative group bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-100 cursor-pointer max-h-[380px] flex items-center justify-center shadow-inner"
                        >
                          <img 
                            src={getFileUrl(selectedLetter)!} 
                            alt="Foto Scan Surat" 
                            className="max-h-[380px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 backdrop-blur-xs">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                              <ZoomIn size={24} />
                            </div>
                            <span className="text-xs font-bold tracking-wide">Klik untuk Melihat Ukuran Penuh</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 min-h-[150px] relative">
                        <div className="absolute top-4 right-6 opacity-5"><FileText size={80} /></div>
                        <p className="text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                          {selectedLetter.metadata?.isi_surat || "Dokumen ini adalah hasil scan atau tidak memiliki isi teks digital."}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 min-h-[150px] relative">
                    <div className="absolute top-4 right-6 opacity-5"><FileText size={80} /></div>
                    <p className="text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                      {selectedLetter.metadata?.isi_surat || "Dokumen ini tidak memiliki isi teks digital."}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {selectedLetter.jenis_surat === "keluar_otomatis" && (
                    <button onClick={() => handleDownloadPdf(selectedLetter)} className="flex-1 py-3.5 bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-green-100 hover:bg-green-800 transition-all">
                      <Download size={18} /> Cetak & Download PDF
                    </button>
                  )}
                  {selectedLetter.jenis_surat === "masuk_scan" && getFileUrl(selectedLetter) && (
                    <>
                      <button 
                        type="button"
                        onClick={() => setLightboxUrl(getFileUrl(selectedLetter))}
                        className="flex-1 py-3.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"
                      >
                        <ZoomIn size={18} /> Perbesar Foto
                      </button>
                      <a 
                        href={getFileUrl(selectedLetter)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                      >
                        <ExternalLink size={18} /> Buka Tab Baru
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox / Zoom Fullscreen */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
            onClick={() => setLightboxUrl(null)}
          >
            <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
              <a
                href={lightboxUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/20 backdrop-blur-md shadow-lg"
              >
                <ExternalLink size={14} /> Buka Tab Baru
              </a>
              <button 
                onClick={() => setLightboxUrl(null)}
                className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all border border-white/20 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95"
                title="Tutup (Esc)"
              >
                <X size={22} />
              </button>
            </div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-5xl max-h-[88vh] flex items-center justify-center overflow-auto p-2"
            >
              <img 
                src={lightboxUrl} 
                alt="Scan Full Preview" 
                className="max-h-[88vh] max-w-full object-contain rounded-2xl shadow-2xl ring-1 ring-white/10" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

