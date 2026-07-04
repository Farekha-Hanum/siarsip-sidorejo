"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Download, FileText, Star, CheckCircle, Search, RefreshCcw, QrCode } from "lucide-react";
import Image from "next/image";
import { ORG_CONFIGS, type OrgType } from "@/lib/org-config";
import { saveLetter } from "@/actions/letter";
import { getNextLetterSequence } from "@/actions/letter-count";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditorView({ org }: { org: string }) {
  const config = ORG_CONFIGS[org as OrgType];
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const jenisSuratParam = searchParams.get("jenis");

  function parseMarkdown(text: string) {
    if (!text) return "";
    let html = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    return html;
  }

  // State Management
  const [noSuratStr, setNoSuratStr] = useState("");
  const [perihal, setPerihal] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [isiSurat, setIsSurat] = useState("");
  
  // Kop Surat Data
  const [kopTingkat1, setKopTingkat1] = useState(config.tingkat1);
  const [kopOrgText, setKopOrgText] = useState(config.orgText);
  const [kopSubOrg, setKopSubOrg] = useState(config.subOrg);
  const [kopAlamat1, setKopAlamat1] = useState(config.alamat1);
  const [kopWilayah, setKopWilayah] = useState(config.wilayah);
  const [kopKontakWa, setKopKontakWa] = useState(config.kontakWa || "");
  const [kopKontakEmail, setKopKontakEmail] = useState(config.kontakEmail || "");
  const [kopSekretariat, setKopSekretariat] = useState(config.sekretariat || "");

  // TTD Section
  const [ttdWilayah, setTtdWilayah] = useState(config.wilayah.split(" ").pop() || "Sidorejo");
  const [ttdTanggal, setTtdTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [ttdTanggalHijriah, setTtdTanggalHijriah] = useState("");
  const [ttd1Jabatan, setTtd1Jabatan] = useState("Ketua");
  const [ttd1Nama, setTtd1Nama] = useState("");
  const [ttd1Nia, setTtd1Nia] = useState("");
  const [ttd2Jabatan, setTtd2Jabatan] = useState("Sekretaris");
  const [ttd2Nama, setTtd2Nama] = useState("");
  const [ttd2Nia, setTtd2Nia] = useState("");

  // Logo Kegiatan (untuk Gabungan) - Manual
  const [logoKiri, setLogoKiri] = useState<string | null>(null);
  const [logoTengah, setLogoTengah] = useState<string | null>(null);
  const [logoKanan, setLogoKanan] = useState<string | null>(null);

  // States for Modals & Data
  const [pengurus, setPengurus] = useState<any[]>([]);
  const [showSearch1, setShowSearch1] = useState(false);
  const [showSearch2, setShowSearch2] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const templates: Record<string, any> = {
    SU: { 
      h: "Undangan Pertemuan Rutin",
      t: "Kepada Rekan-Rekanita\ndi Tempat",
      i: "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nSalam silaturahmi kami sampaikan, semoga kita semua selalu dalam lindungan-Nya.\n\nSehubungan dengan akan dilaksanakannya kegiatan Pertemuan Rutin, kami mengharap kehadiran rekan-rekanita pada:\n\nHari / tanggal : ...\nWaktu          : ...\nTempat         : ...\n\nDemikian undangan ini kami sampaikan, atas kehadirannya kami ucapkan terima kasih.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh."
    },
    ST: {
      h: "Surat Tugas",
      t: "",
      i: "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nDengan ini Pimpinan Ranting menugaskan nama-nama tersebut di bawah ini untuk melaksanakan kegiatan ... yang akan dilaksanakan pada ...\n\nDemikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh."
    },
    SK: {
       h: "Surat Keputusan",
       t: "",
       i: "MEMUTUSKAN:\n\nMenetapkan ... sebagai ... periode ...\n\nKeputusan ini berlaku sejak tanggal ditetapkan."
    },
    SM: {
      h: "Surat Mandat",
      t: "",
      i: "_Bismillahirrahmanirrahim_\n\nYang bertanda tangan dibawah ini, Pimpinan Ranting Ikatan Pelajar Putri Nahdlatul Ulama (PR IPPNU) Desa Sidorejo dengan ini memberi mandat kepada :\n\n1.\tNama\t: *Feni Lidyana*\n\tJabatan\t: Ketua Umum PR IPPNU Desa Sidorejo\n\n2.\tNama\t: *Siti Yulia Farekha Hanum*\n\tJabatan\t: Sekretaris Umum PR IPPNU Desa Sidorejo\n\nDengan ini menugaskan kepada :\n\n1.\tNama\t: *Wilda Azzani*\n\tTTL\t: Pekalongan, 14 Februari 2008\n\tJabatan\t: Anggota Lembaga Ekonomi\n\n2.\tNama\t: *Zilfi Oktaviani*\n\tTTL\t: Pekalongan, 31 Oktober 2010\n\tJabatan\t: Anggota Lembaga Ekonomi\n\n3.\tNama\t: *Nur Syiam Fitri Ani*\n\tTTL\t: Pekalongan, 12 September 2009\n\tJabatan\t: Anggota PR IPPNU Sidorejo\n\nUntuk mengikuti Kegiatan *DIKLATAMA VIII* yang diadakan oleh PAC IPNU dan IPPNU Kecamatan Tirto yang dilaksanakan pada :\n\nHari / tanggal\t: Jum'at - Ahad, 14-16 November 2025\nTempat\t: Lapangan Desa Dadirejo Timur\n\nDemikian surat mandat ini dibuat untuk dipergunakan sebagaimana mestinya.\n\n_Wallahul muwafiq ila aqwamiththoriq_"
    },
    PRP: {
       h: "Proposal Kegiatan",
       t: "Kepada Yth.\nBapak/Ibu Donatur\ndi Tempat",
       i: "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n"
    }
  };

  // Auto-fill Logic for Templates
  useEffect(() => {
    const cat = noSuratStr.split("/")[1]?.split(".")[0];
    if (cat && templates[cat]) {
      // Hanya isi otomatis jika kolom-kolom tersebut masih kosong
      if (perihal === "") setPerihal(templates[cat].h);
      if (tujuan === "") setTujuan(templates[cat].t);
      if (isiSurat === "") setIsSurat(templates[cat].i);
    }
  }, [noSuratStr]);

  // Load Initial Data (Draft or Pengurus)
  useEffect(() => {
    fetchPengurus();
    // Load Auto-save Draft
    try {
      const draft = localStorage.getItem(`draft_letter_${org}`);
      if (draft && !editId) {
        const data = JSON.parse(draft);
        setTujuan(data.t || "");
        setPerihal(data.p || "");
        setIsSurat(data.i || "");
      }
    } catch {
      // Ignore corrupt draft data
    }
  }, [org]);

  // Auto-save Logic
  useEffect(() => {
    if (tujuan || perihal || isiSurat) {
      try {
        localStorage.setItem(`draft_letter_${org}`, JSON.stringify({ t: tujuan, p: perihal, i: isiSurat }));
      } catch {
        // Storage full or unavailable — skip auto-save
      }
    }
  }, [tujuan, perihal, isiSurat]);

  async function fetchPengurus() {
    const supabase = createClient();
    const { data } = await supabase.from("data_pengurus").select("*").order("nama_lengkap");
    if (data) setPengurus(data);
  }

  function isManualInput() {
    return perihal !== "" || tujuan !== "" || isiSurat !== "";
  }

  const handleResetForm = () => {
    if(confirm("Hapus seluruh draf dan kosongkan form?")) {
      setTujuan(""); setPerihal(""); setIsSurat("");
      try {
        localStorage.removeItem(`draft_letter_${org}`);
      } catch {
        // Ignore if localStorage unavailable
      }
    }
  };

  const handleReloadFormat = () => {
    const kode = searchParams.get("kode") || noSuratStr.split("/")[1]?.split(".")[0];
    if (!kode || !templates[kode]) {
      alert("Template tidak ditemukan. Pastikan Anda masuk dari menu Pembuatan Surat.");
      return;
    }
    if (confirm("Muat ulang format surat? Isian form saat ini akan ditimpa dengan template default!")) {
      setPerihal(templates[kode].h);
      setTujuan(templates[kode].t);
      setIsSurat(templates[kode].i);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = isiSurat.substring(0, start) + "\t" + isiSurat.substring(end);
      setIsSurat(newValue);
      // Move cursor
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0);
    }
  };

  const handleSelectPengurus = (p: any, type: 1 | 2) => {
    if (type === 1) {
      setTtd1Nama(p.nama_lengkap);
      setTtd1Nia(p.nia || "");
      setTtd1Jabatan(p.jabatan || "Ketua");
      setShowSearch1(false);
    } else {
      setTtd2Nama(p.nama_lengkap);
      setTtd2Nia(p.nia || "");
      setTtd2Jabatan(p.jabatan || "Sekretaris");
      setShowSearch2(false);
    }
    setSearchQuery("");
  };

  const filteredPengurus = pengurus.filter(p => 
    p.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.nia && p.nia.includes(searchQuery))
  );

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      });
    } catch {
      return "-";
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const result = await saveLetter({
        nomor_surat: noSuratStr,
        perihal,
        jenis_surat: "digital",
        tanggal_surat: ttdTanggal,
        kategori_dashboard: org,
        metadata: {
          tujuan,
          isi_surat: isiSurat,
          kop: { tingkat: kopTingkat1, org: kopOrgText, sub: kopSubOrg, alamat: kopAlamat1, sekretariat: kopSekretariat, wilayah: kopWilayah },
          tanggal_hijriah: ttdTanggalHijriah,
          ttd_wilayah: ttdWilayah,
          ttd1: { jabatan: ttd1Jabatan, nama: ttd1Nama, nia: ttd1Nia },
          ttd2: { jabatan: ttd2Jabatan, nama: ttd2Nama, nia: ttd2Nia },
          logos: { kiri: logoKiri, tengah: logoTengah, kanan: logoKanan }
        },
      });

      if (result.error) {
        alert(result.error);
        setSaving(false);
        return;
      }
      
      setSaving(false);
      setSuccess(`Surat berhasil dibuat! Nomor: ${result.nomorSurat}`);
      try {
        localStorage.removeItem(`draft_letter_${org}`);
      } catch {
        // Ignore if localStorage unavailable
      }
      
      // Redirect otomatis ke arsip setelah 1.5 detik
      setTimeout(() => {
        const basePath = pathname.startsWith("/admin") ? "/admin" : "/user";
        window.location.href = `${basePath}/surat-digital/${org}`;
      }, 1500);
    } catch {
      alert("Terjadi kesalahan saat menyimpan surat. Silakan coba lagi.");
      setSaving(false);
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>, position: "kiri" | "tengah" | "kanan") {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        if (position === "kiri") setLogoKiri(res);
        if (position === "tengah") setLogoTengah(res);
        if (position === "kanan") setLogoKanan(res);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleDownloadPdf = () => {
    const previewEl = document.getElementById("letter-preview");
    if (!previewEl) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Izinkan popup untuk mendownload PDF. Periksa pengaturan popup blocker browser Anda.");
      return;
    }

    printWindow.document.write(`
      <html>
      <head>
        <title>Cetak Surat - ${noSuratStr}</title>
        <style>
          @page { size: 210mm 330mm; margin: 0; }
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div style="position: relative; min-height: 297mm; background: white;">
          ${previewEl.outerHTML}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 800);
  };

  const isIPNU = org === "ipnu" || org === "gabungan";
  const orgFontClass = isIPNU ? "Arial, sans-serif" : "'Times New Roman', Times, serif";
  const headerFontClass = "var(--font-cinzel), serif";
  const footerFontClass = headerFontClass; // Samakan dengan KOP
  const headerColor = "#4dcf8f";

  if (!config) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md text-center">
        <h1 className="font-bebas text-4xl text-slate-800 mb-2">Organisasi Tidak Ditemukan</h1>
        <p className="text-slate-500">Organisasi "{org}" tidak dikenal. Periksa URL atau pilih organisasi yang valid.</p>
      </div>
    </div>;
  }

  // Menu Pemilihan Jenis Surat (Jika belum memilih)
  if (!jenisSuratParam && !editId) {
    const letterTypes: Record<string, { label: string, kode: string }[]> = {
      ipnu: [
        { label: "Surat Tugas", kode: "ST" },
        { label: "Surat Keterangan", kode: "SK" },
        { label: "Surat Undangan", kode: "SU" },
        { label: "Surat Permohonan", kode: "SP" }
      ],
      ippnu: [
        { label: "Surat Mandat", kode: "SM" },
        { label: "Surat Keterangan", kode: "SK" },
        { label: "Surat Undangan", kode: "SU" },
        { label: "Surat Permohonan", kode: "SP" }
      ],
      gabungan: [
        { label: "Proposal Kegiatan", kode: "PRP" },
        { label: "Undangan", kode: "UND" },
        { label: "Laporan Pertanggungjawaban", kode: "LPJ" }
      ],
      all: [
        { label: "Surat Umum", kode: "SU" }
      ]
    };

    const types = letterTypes[org] || letterTypes.gabungan;

    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#1f9a5e]/10 text-[#1f9a5e] flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h1 className="font-bebas text-4xl tracking-wide text-[#0d3320]">Menu Buat Surat {config.name}</h1>
          <p className="text-gray-500 mt-2">Pilih jenis surat yang ingin Anda buat untuk melanjutkan ke editor.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {types.map((type, i) => (
            <motion.a
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              href={`${pathname}?jenis=${encodeURIComponent(type.label)}&kode=${type.kode}`}
              className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#1f9a5e]/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-[#1f9a5e] group-hover:text-white transition-colors flex items-center justify-center text-gray-400">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#0d3320] group-hover:text-[#1f9a5e] transition-colors">{type.label}</h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Kode: {type.kode}</p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full px-4 md:px-8 mx-auto -mt-2">
      {/* Top Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1f9a5e]/10 flex items-center justify-center text-[#1f9a5e]"><FileText size={20} /></div>
          <div>
            <h1 className="font-bebas text-2xl tracking-wide text-[#0d3320]">Editor Surat Digital</h1>
            <p className="text-[10px] uppercase font-bold text-[#1f9a5e] flex items-center gap-1"><Star size={10} fill="#f4c430" /> {config.fullName} Sidorejo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReloadFormat} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100"><RefreshCcw size={14} /> Muat Ulang Template</button>
          <button onClick={handleResetForm} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-100"> Kosongkan Form</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1f9a5e] hover:bg-[#145c38] transition-all shadow-md active:scale-95">
            <Save size={15} /> {saving ? "Menyimpan..." : "Simpan Arsip"}
          </button>
        </div>
      </motion.div>

      {success && (
        <div className="p-4 rounded-xl bg-[#e0f3e8] border border-[#1f9a5e]/30 text-[#145c38] flex items-center gap-2">
          <CheckCircle size={18} /> <span className="font-bold text-sm">{success}</span>
        </div>
      )}

      {/* 2-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* LEFT: Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="relative z-10 rounded-2xl p-5 space-y-6 bg-white border border-[#1f9a5e]/10 shadow-sm overflow-hidden"
        >
          {/* Section: Penomoran */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#145c38] border-b pb-2">1. Dasar Penomoran</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#145c38]">Nomor Surat Lengkap</label>
              <input type="text" value={noSuratStr} onChange={(e) => setNoSuratStr(e.target.value)} placeholder="001/PR/A/IPNU/X/2024" className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#1f9a5e] outline-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#145c38]">Perihal</label>
                <input type="text" value={perihal} onChange={(e) => setPerihal(e.target.value)} placeholder="Contoh: Undangan Rapat" className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-100 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#145c38]">Tujuan (Kepada Yth.)</label>
                <textarea value={tujuan} onChange={(e) => setTujuan(e.target.value)} placeholder="Contoh: Rekanita Fatayat\ndi Sidorejo" className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-100 outline-none h-[38px] min-h-[38px]" />
              </div>
            </div>
          </div>

          {/* Section: Kop Surat */}
          <div className="space-y-3">
             <h3 className="text-xs font-bold uppercase tracking-widest text-[#145c38] border-b pb-2">2. Editor Kop Surat</h3>
             <div className="grid grid-cols-2 gap-2">
                <input type="text" value={kopTingkat1} onChange={(e) => setKopTingkat1(e.target.value)} placeholder="Level" className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
                <input type="text" value={kopOrgText} onChange={(e) => setKopOrgText(e.target.value)} placeholder="Organisasi" className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
                <input type="text" value={kopSubOrg} onChange={(e) => setKopSubOrg(e.target.value)} placeholder="Desa" className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
                <input type="text" value={kopAlamat1} onChange={(e) => setKopAlamat1(e.target.value)} placeholder="Kecamatan" className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
             </div>
             <div className="flex gap-2">
                <input type="text" value={kopKontakWa} onChange={(e) => setKopKontakWa(e.target.value)} placeholder="No WA" className="w-1/2 text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
                <input type="text" value={kopKontakEmail} onChange={(e) => setKopKontakEmail(e.target.value)} placeholder="Email" className="w-1/2 text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
             </div>
             {org === "gabungan" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <div className="p-3 border rounded-xl border-green-100 bg-green-50/50 space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[#1f9a5e] block">Logo Kiri</label>
                    <input type="file" accept="image/*" onChange={(e) => handleLogoChange(e, "kiri")} className="text-[10px] w-full" />
                  </div>
                  <div className="p-3 border rounded-xl border-green-100 bg-green-50/50 space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[#1f9a5e] block">Logo Tengah</label>
                    <input type="file" accept="image/*" onChange={(e) => handleLogoChange(e, "tengah")} className="text-[10px] w-full" />
                  </div>
                  <div className="p-3 border rounded-xl border-green-100 bg-green-50/50 space-y-2">
                    <label className="text-[10px] uppercase font-bold text-[#1f9a5e] block">Logo Kanan</label>
                    <input type="file" accept="image/*" onChange={(e) => handleLogoChange(e, "kanan")} className="text-[10px] w-full" />
                  </div>
                </div>
              ) : (
                <input type="text" value={kopSekretariat} onChange={(e) => setKopSekretariat(e.target.value)} placeholder="Sekretariat: ...." className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none" />
              )}
          </div>

          {/* Section: Isi Surat */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#145c38] border-b pb-2">3. Isi Surat</h3>
            <textarea value={isiSurat} onChange={(e) => setIsSurat(e.target.value)} onKeyDown={handleTextareaKeyDown} placeholder="Tuliskan isi surat secara lengkap..." className="w-full p-4 h-[220px] text-sm rounded-2xl bg-gray-50 border border-gray-100 focus:border-[#1f9a5e] outline-none transition-all leading-relaxed" style={{ tabSize: "40px" }} />
          </div>

          {/* Section: TTD */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#145c38] border-b pb-2">4. Tanda Tangan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#145c38]">Kota/Tempat</label>
                <input type="text" value={ttdWilayah} onChange={(e) => setTtdWilayah(e.target.value)} className="w-full text-sm p-2 rounded-xl border border-gray-200" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#145c38]">Tanggal Masehi</label>
                <input type="date" value={ttdTanggal} onChange={(e) => setTtdTanggal(e.target.value)} className="w-full text-sm p-2 rounded-xl border border-gray-200" />
              </div>
            </div>
            <div className="mt-2 text-left">
              <label className="text-xs font-bold text-[#145c38]">Tanggal Hijriah (Manual)</label>
              <input type="text" value={ttdTanggalHijriah} onChange={(e) => setTtdTanggalHijriah(e.target.value)} placeholder="Contoh: 12 Syawal 1446 H" className="w-full text-sm p-2 rounded-xl border border-gray-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* TTD 1 */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Penandatangan 1</label>
                  <button onClick={() => setShowSearch1(!showSearch1)} className="p-1 hover:bg-[#1f9a5e]/10 text-[#1f9a5e] rounded-md transition-colors"><Search size={14} /></button>
                </div>
                <AnimatePresence>
                  {showSearch1 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="absolute inset-x-0 top-10 z-10 bg-white border shadow-xl rounded-xl p-2 max-h-48 overflow-y-auto overflow-hidden">
                       <input type="text" placeholder="Cari pengurus..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-xs p-2 mb-2 border-b outline-none" />
                       {filteredPengurus.map(p => (
                         <div key={p.id} onClick={() => handleSelectPengurus(p, 1)} className="p-2 hover:bg-gray-50 text-xs cursor-pointer rounded-lg border-b border-gray-50">
                           <p className="font-bold">{p.nama_lengkap}</p>
                           <p className="text-[9px] text-gray-400">{p.jabatan} {p.nia ? ` · NIA: ${p.nia}` : ""}</p>
                         </div>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <input type="text" value={ttd1Jabatan} onChange={(e) => setTtd1Jabatan(e.target.value)} placeholder="Jabatan (Ketua)" className="w-full text-sm p-2 rounded-lg border border-gray-100 outline-none" />
                <input type="text" value={ttd1Nama} onChange={(e) => setTtd1Nama(e.target.value)} placeholder="Nama Terang" className="w-full text-sm p-2 rounded-lg border border-gray-100 outline-none font-bold" />
                <input type="text" value={ttd1Nia} onChange={(e) => setTtd1Nia(e.target.value)} placeholder="NIA" className="w-full text-sm p-2 rounded-lg border border-gray-100 outline-none" />
              </div>

              {/* TTD 2 */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Penandatangan 2</label>
                  <button onClick={() => setShowSearch2(!showSearch2)} className="p-1 hover:bg-[#1f9a5e]/10 text-[#1f9a5e] rounded-md transition-colors"><Search size={14} /></button>
                </div>
                <AnimatePresence>
                  {showSearch2 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="absolute inset-x-0 top-10 z-10 bg-white border shadow-xl rounded-xl p-2 max-h-48 overflow-y-auto overflow-hidden">
                       <input type="text" placeholder="Cari pengurus..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-xs p-2 mb-2 border-b outline-none" />
                       {filteredPengurus.map(p => (
                         <div key={p.id} onClick={() => handleSelectPengurus(p, 2)} className="p-2 hover:bg-gray-50 text-xs cursor-pointer rounded-lg border-b border-gray-50">
                           <p className="font-bold">{p.nama_lengkap}</p>
                           <p className="text-[9px] text-gray-400">{p.jabatan} {p.nia ? ` · NIA: ${p.nia}` : ""}</p>
                         </div>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <input type="text" value={ttd2Jabatan} onChange={(e) => setTtd2Jabatan(e.target.value)} placeholder="Jabatan (Sekretaris)" className="w-full text-sm p-2 rounded-lg border border-gray-100 outline-none" />
                <input type="text" value={ttd2Nama} onChange={(e) => setTtd2Nama(e.target.value)} placeholder="Nama Terang" className="w-full text-sm p-2 rounded-lg border border-gray-100 outline-none font-bold" />
                <input type="text" value={ttd2Nia} onChange={(e) => setTtd2Nia(e.target.value)} placeholder="NIA" className="w-full text-sm p-2 rounded-lg border border-gray-100 outline-none" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Real-time Preview */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl overflow-hidden shadow-sm bg-white border border-[#1f9a5e]/20 sticky top-20">
          <div className="px-4 py-2 flex items-center justify-between bg-[#f0faf4] border-b border-[#1f9a5e]/10">
            <span className="text-[10px] font-bold text-[#145c38] uppercase tracking-wider">Preview Otomatis (Format F4)</span>
            <button onClick={handleDownloadPdf} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold text-white bg-[#1f9a5e] hover:bg-[#145c38] transition-all"><Download size={12} /> Unduh / Cetak PDF</button>
          </div>

          <div className="overflow-y-auto overflow-x-hidden bg-gray-100 p-4 max-h-[80vh] flex justify-center w-full">
            {/* Scaling wrapper */}
            <div className="shadow-2xl" id="letter-preview-container" style={{ width: "210mm", height: "330mm", background: "white", zoom: 0.72 } as any}>
              <div id="letter-preview" className="p-8 md:p-10 text-black bg-white" style={{ fontFamily: orgFontClass, fontSize: "10.5pt", lineHeight: 1.1, height: "330mm", width: "210mm", position: "relative", paddingTop: "10mm", boxSizing: "border-box" }}>
                 
                 {/* Kop Surat Header */}
                 <div style={{ display: "flex", paddingBottom: "0px", marginBottom: "4px", alignItems: "flex-start", borderBottom: "2px solid #000" }}>
                    <div style={{ display: "flex", gap: "6px", marginRight: "12px", flexShrink: 0, marginTop: "2px" }}>
                      {org === "gabungan" ? (
                        <>
                          {logoKiri && <img src={logoKiri} alt="L" style={{ width: "50px", height: "auto", objectFit: "contain" }} />}
                          {logoTengah && <img src={logoTengah} alt="M" style={{ width: "50px", height: "auto", objectFit: "contain" }} />}
                          {logoKanan && <img src={logoKanan} alt="R" style={{ width: "50px", height: "auto", objectFit: "contain" }} />}
                        </>
                      ) : (
                        <img src={config.logo} alt={config.name} style={{ width: "75px", height: "auto", objectFit: "contain" }} />
                      )}
                    </div>
                    <div style={{ flexGrow: 1, textAlign: "right" }}>
                      <p style={{ fontFamily: headerFontClass, fontSize: "15px", fontWeight: "bold", color: headerColor, margin: 0, textTransform: "uppercase" }}>{kopTingkat1}</p>
                      <p style={{ fontFamily: headerFontClass, fontSize: "14px", fontWeight: "bold", color: headerColor, margin: "1px 0", textTransform: "uppercase" }}>{kopOrgText}</p>
                      <p style={{ fontFamily: headerFontClass, fontSize: "13px", fontWeight: "bold", color: headerColor, margin: "1px 0", textTransform: "uppercase" }}>{kopSubOrg} {kopAlamat1}</p>
                      
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0px", marginTop: "2px", fontSize: "8.5px", color: "#000" }}>
                        <p style={{ margin: 0, fontWeight: "bold" }}>{kopSekretariat.startsWith("Sekretariat") ? kopSekretariat : `Sekretariat : ${kopSekretariat}`}</p>
                        
                        {kopKontakWa && (
                          <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "1px" }}>
                            <span style={{ fontWeight: "bold" }}>{kopKontakWa} (CP)</span>
                            <img src="https://img.icons8.com/color/48/whatsapp--v1.png" alt="WA" style={{ width: "10px", height: "10px" }} />
                          </div>
                        )}
                        {kopKontakEmail && (
                          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                            <span style={{ fontWeight: "bold", color: "#0000EE", textDecoration: "underline" }}>{kopKontakEmail}</span>
                            <img src="https://img.icons8.com/color/48/gmail-new.png" alt="Email" style={{ width: "10px", height: "10px" }} />
                          </div>
                        )}
                      </div>
                    </div>
                 </div>

                 {/* Body */}
                 {tujuan.trim() === "" ? (
                    <div style={{ textAlign: "center", marginBottom: "15px", marginTop: "15px" }}>
                       <p style={{ margin: 0, fontWeight: "bold", textDecoration: "underline", fontSize: "12pt", textTransform: "uppercase" }}>{perihal}</p>
                       <p style={{ margin: 0 }}>Nomor : {noSuratStr}</p>
                    </div>
                 ) : (
                    <>
                       <div style={{ marginBottom: "4px", marginTop: "8px" }}>
                          <p style={{ margin: "1px 0" }}>Nomor : {noSuratStr}</p>
                          <p style={{ margin: "1px 0" }}>Hal : <b>{perihal}</b></p>
                       </div>
                       <div style={{ marginBottom: "4px", paddingLeft: "25px" }}>
                          {tujuan.split("\n").map((line, i) => <p key={i} style={{ margin: "1px 0" }}>{line}</p>)}
                       </div>
                    </>
                 )}

                 <div style={{ textAlign: "justify", marginBottom: "5px", tabSize: "40px" }}>
                    {isiSurat.split("\n").map((p, i) => (
                       <p key={i} style={{ marginBottom: "2px", whiteSpace: "pre-wrap", minHeight: p.trim() === "" ? "1em" : "auto" }} dangerouslySetInnerHTML={{ __html: parseMarkdown(p) }} />
                    ))}
                 </div>

                 {/* TTD Section */}
                 <div style={{ marginTop: "50px", width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "15px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{ttdWilayah},</span>
                        {ttdTanggalHijriah ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span>{ttdTanggalHijriah}</span>
                            <hr style={{ width: "100%", margin: "2px 0", borderTop: "1px solid black" }} />
                            <span>{formatDate(ttdTanggal)} M</span>
                          </div>
                        ) : (
                          <span>{formatDate(ttdTanggal)} M</span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: "center", marginBottom: "4px", fontWeight: "bold", textTransform: "uppercase", fontSize: "9.5pt" }}>
                      <p style={{ margin: 0 }}>{kopTingkat1}</p>
                      <p style={{ margin: 0 }}>{kopOrgText}</p>
                      <p style={{ margin: 0 }}>{kopSubOrg} {kopAlamat1}</p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                      <div style={{ textAlign: "center", width: "45%" }}>
                        <p style={{ margin: "0 0 15px 0" }}>{ttd1Jabatan}</p>
                        <div style={{ marginTop: "10px" }}>
                          <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0, textTransform: "uppercase" }}>{ttd1Nama || "________________"}</p>
                          <p style={{ fontSize: "8.5px", margin: 0 }}>NIA: {ttd1Nia || "..."}</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "center", width: "45%" }}>
                        <p style={{ margin: "0 0 15px 0" }}>{ttd2Jabatan}</p>
                        <div style={{ marginTop: "10px" }}>
                          <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0, textTransform: "uppercase" }}>{ttd2Nama || "________________"}</p>
                          <p style={{ fontSize: "8.5px", margin: 0 }}>NIA: {ttd2Nia || "..."}</p>
                        </div>
                      </div>
                    </div>
                 </div>

                  {/* Footer Slogan - Fixed at standard margin */}
                  <div style={{ position: "absolute", bottom: "15mm", left: "0", right: "0", textAlign: "left" }}>
                     <p style={{ color: "#1f9a5e", fontWeight: "bold", fontSize: "16px", margin: 0, letterSpacing: "0.15em", fontFamily: footerFontClass }}>BELAJAR, BERJUANG, BERTAQWA</p>
                  </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
