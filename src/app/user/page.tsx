"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Award,
  Zap,
  TrendingUp,
  Medal,
  ShieldCheck,
  Star,
  FileText,
  Archive,
  ChevronRight,
  Target,
  ClipboardList,
  Users,
  Scan,
  Download
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { generateMemberCertificate } from "@/lib/certificate-generator";

const NU_GREEN  = "#4dcf8f";
const NU_DARK   = "#1f9a5e";
const NU_GOLD   = "#f4c430";

export default function UserDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isTopUser, setIsTopUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { fetchDashboardData(); }, []);

  async function fetchDashboardData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch profile to get assigned_dashboard
    const { data: profileData } = await supabase
      .from("profiles")
      .select("assigned_dashboard")
      .eq("id", user.id)
      .single();

    const assignedDashboard = profileData?.assigned_dashboard || "all";

    const { data: leaderData } = await supabase
      .from("view_leaderboard").select("*")
      .order("total_skor", { ascending: false });

    if (leaderData) {
      setLeaderboard(leaderData);
      const myRankIndex = leaderData.findIndex(l => l.id === user.id);
      if (myRankIndex !== -1) {
        const myData = leaderData[myRankIndex];
        setUserProfile({ ...myData, rank: myRankIndex + 1, assigned_dashboard: assignedDashboard });
        if (myRankIndex === 0 && (myData?.total_skor || 0) >= 70) setIsTopUser(true);
      } else {
        // Handle user not in leaderboard yet
        setUserProfile({ id: user.id, nama_lengkap: user.user_metadata?.nama_lengkap || "Anggota", total_skor: 0, rank: "-", assigned_dashboard: assignedDashboard });
      }
    }
    setLoading(false);
  }

  async function handleDownloadCertificate() {
    if (!userProfile) return;
    const pdfBytes = await generateMemberCertificate({
      nama: userProfile.nama_lengkap,
      skor: userProfile.total_skor || 0,
      tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    });
    const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Sertifikat_${userProfile.nama_lengkap.replace(/\s+/g, "_")}.pdf`;
    link.click();
  }

  const progress = userProfile ? Math.min((userProfile.total_skor / 70) * 100, 100) : 0;
  const skor = userProfile?.total_skor || 0;

  const dashboardType = userProfile?.assigned_dashboard || "all";
  const arsipHref = dashboardType === "all" ? "/user/surat-digital" : `/user/surat-digital/${dashboardType}`;
  const buatHref =
    dashboardType === "all" ? "/user/surat-digital" :
    dashboardType === "ippnu" ? "/user/surat-digital/ippnu/buat?jenis=Surat%20Mandat&kode=SM" :
    dashboardType === "gabungan" ? "/user/surat-digital/gabungan/buat?jenis=Proposal%20Kegiatan&kode=PRP" :
    "/user/surat-digital/ipnu/buat?jenis=Surat%20Tugas&kode=ST";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1f9a5e]/20 border-t-[#1f9a5e] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* ===== HEADER SECTION ===== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#f4c430] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Selamat Datang</span>
          </div>
          <h1 className="font-bebas text-5xl md:text-6xl tracking-tight leading-none text-[#1f9a5e]">
            Halo, <span className="text-[#f4c430]">{userProfile?.nama_lengkap?.split(' ')[0] || "Anggota"}</span>!
          </h1>
          <p className="text-slate-500 text-sm max-w-md mt-2 leading-relaxed">
            Akses seluruh layanan digital IPNU-IPPNU Sidorejo melalui dashboard personal Anda.
          </p>
        </motion.div>

        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-[#fdf8e6] flex items-center justify-center text-[#f4c430]">
                <Zap size={18} fill="#f4c430" />
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Skor Anda</p>
                <p className="font-bebas text-xl text-[#1f9a5e] leading-none">{skor} Poin</p>
             </div>
          </div>
        </div>
      </div>

      {/* ===== HERO CARD: STATUS & CERTIFICATE ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[3rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${NU_DARK}, #0d3320)` }}
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none text-white">
          <Medal size={240} />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          {/* Radial Progress Gauge */}
          <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
             <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" stroke="#f4c430" strokeWidth="8" 
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * progress / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round" 
                />
             </svg>
             <div className="absolute text-center">
                <div className="font-bebas text-5xl tracking-tighter leading-none">{skor}</div>
                <div className="text-[10px] font-black opacity-60 uppercase tracking-widest">Poin</div>
             </div>
          </div>

          <div className="flex-1 text-center lg:text-left space-y-4">
            <div>
              <p className="text-[#80e5b0] text-xs font-black uppercase tracking-[0.3em] mb-2">✦ Status Anggota Terbest</p>
              <h2 className="font-bebas text-4xl md:text-5xl leading-none tracking-tight">
                {skor >= 70 ? "Selamat! Anda Anggota Terbest" : "Terus Aktif, Kejar Target!"}
              </h2>
              <p className="text-white/60 text-sm max-w-lg mt-3 leading-relaxed">
                {skor >= 70 
                  ? "Anda telah mencapai ambang batas 70 poin. Sertifikat penghargaan digital Anda sudah siap untuk diunduh." 
                  : `Anda membutuhkan ${70 - skor} poin lagi untuk mendapatkan predikat Anggota Terbest. Ikuti lebih banyak kegiatan!`}
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4">
              <button
                onClick={skor >= 70 ? handleDownloadCertificate : undefined}
                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${
                  skor >= 70 
                    ? "bg-[#f4c430] hover:bg-[#eab308] text-[#0d3320] shadow-xl shadow-[#f4c430]/20 hover:scale-105" 
                    : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                }`}
              >
                <Download size={18} /> 
                {skor >= 70 ? "Unduh Sertifikat" : "Sertifikat Terkunci"}
              </button>
              
              <Link href="/user/kegiatan">
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all border border-white/10">
                  <TrendingUp size={18} /> Lihat Daftar Kegiatan
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== QUICK ACTIONS GRID ===== */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <div className="h-px flex-1 bg-slate-200" />
           <h3 className="font-bebas text-2xl text-slate-400 tracking-widest">MENU UTAMA</h3>
           <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: "Arsip Surat", 
              desc: "Lihat & kelola arsip digital", 
              icon: Archive, 
              href: arsipHref, 
              color: "#1f9a5e", 
              gradient: "linear-gradient(135deg, #1f9a5e, #145c38)" 
            },
            { 
              label: "Buat Surat", 
              desc: "Generator surat otomatis", 
              icon: FileText, 
              href: buatHref, 
              color: "#3b82f6", 
              gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)" 
            },
            { 
              label: "Scanner OCR", 
              desc: "Scan surat ke digital", 
              icon: Scan, 
              href: "/user/scanner", 
              color: "#f59e0b", 
              gradient: "linear-gradient(135deg, #f59e0b, #b45309)" 
            },
            { 
              label: "Input Kegiatan", 
              desc: "Absensi & klaim skor", 
              icon: Target, 
              href: "/user/kegiatan", 
              color: "#ec4899", 
              gradient: "linear-gradient(135deg, #ec4899, #be185d)" 
            },
          ].map((mod, i) => (
            <Link key={i} href={mod.href} className="flex group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.05) }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-6 transition-all hover:shadow-2xl flex-1 relative overflow-hidden"
              >
                <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-500">
                  <mod.icon size={120} />
                </div>
                <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform"
                  style={{ background: mod.gradient }}>
                  <mod.icon size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bebas text-3xl tracking-tight text-slate-800">{mod.label}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{mod.desc}</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all group-hover:gap-4" 
                  style={{ color: mod.color }}>
                  Buka Menu <ChevronRight size={14} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== LEADERBOARD SECTION (SPLIT LAYOUT) ===== */}
      <div id="leaderboard" className="pt-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100"
        >
          <div className="px-10 py-8 bg-slate-50 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] flex items-center justify-center">
                <Trophy size={24} className="text-[#f59e0b]" />
              </div>
              <h3 className="font-bebas text-3xl text-[#1f9a5e] tracking-tight">Peringkat Anggota Terbest</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Column: Ranking Table */}
            <div className="overflow-x-auto border-r border-slate-50">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Rank</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap</th>
                    <th className="px-10 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Skor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaderboard.map((item, index) => {
                    const isMe = item.id === userProfile?.id;
                    return (
                      <tr key={item.id} className={`transition-colors ${isMe ? 'bg-[#f0faf4]/50' : 'hover:bg-slate-50/50'}`}>
                        <td className="px-10 py-6">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bebas text-xl shadow-sm ${
                            index === 0 ? 'bg-[#f4c430] text-white' : 
                            index === 1 ? 'bg-slate-300 text-white' :
                            index === 2 ? 'bg-[#cd7f32] text-white' : 'text-slate-400'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-6">
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-slate-700">{item.nama_lengkap}</p>
                            {isMe && <span className="px-2 py-0.5 rounded-md bg-[#1f9a5e] text-white text-[8px] font-black uppercase">SAYA</span>}
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <span className="font-bebas text-3xl text-[#1f9a5e]">{item.total_skor || 0}</span>
                          <span className="text-[10px] font-black text-slate-300 ml-1">PTS</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Right Column: High-Fidelity 3D Graphical Diagram (Inspired by Image) */}
            <div className="px-6 py-12 bg-white relative overflow-hidden flex flex-col items-center">
              {/* Background Chart Grid */}
              <div className="absolute inset-x-10 top-12 bottom-24 border-l border-b border-slate-200 pointer-events-none opacity-40" />

              <div className="relative z-10 w-full max-w-lg h-[400px] flex flex-col">
                <div className="flex items-center gap-2 mb-12 self-start px-4">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Analisis Pertumbuhan Skor</span>
                </div>

                <div className="relative flex-1 flex items-end justify-around px-4 pb-12">
                  {/* SVG Line Overlay (Connecting Tops) */}
                  <svg className="absolute inset-0 pointer-events-none w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.path
                      d={(() => {
                        const top5 = leaderboard.slice(0, 5);
                        if (top5.length < 2) return "";
                        return top5.map((item, idx) => {
                          const x = (idx * 20) + 10;
                          const barHeight = Math.max((item.total_skor / (leaderboard[0]?.total_skor || 1)) * 60, 10);
                          const y = 80 - barHeight;
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(" ");
                      })()}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    {leaderboard.slice(0, 5).map((item, idx) => {
                      const x = (idx * 20) + 10;
                      const barHeight = Math.max((item.total_skor / (leaderboard[0]?.total_skor || 1)) * 60, 10);
                      const y = 80 - barHeight;
                      return (
                        <motion.circle 
                          key={idx} cx={x} cy={y} r="1.5" fill="#ef4444" stroke="white" strokeWidth="0.5"
                          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + (idx * 0.2) }}
                        />
                      );
                    })}
                  </svg>

                  {/* 3D Vertical Bars */}
                  {leaderboard.slice(0, 5).map((item, idx) => {
                    const barHeight = Math.max((item.total_skor / (leaderboard[0]?.total_skor || 1)) * 200, 40);
                    const colors = [
                      { main: "#ec4899", side: "#be185d", top: "#f472b6" }, // Pink
                      { main: "#f97316", side: "#c2410c", top: "#fb923c" }, // Orange
                      { main: "#3b82f6", side: "#1d4ed8", top: "#60a5fa" }, // Blue
                      { main: "#06b6d4", side: "#0e7490", top: "#22d3ee" }, // Cyan
                      { main: "#ef4444", side: "#b91c1c", top: "#f87171" }, // Red
                    ];
                    const c = colors[idx % colors.length];

                    return (
                      <div key={item.id} className="relative group cursor-pointer flex flex-col items-center">
                        {/* 3D Bar Container */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: barHeight }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.9, rotate: [0, -2, 2, 0] }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="relative w-10 flex items-end"
                          style={{ perspective: "1000px" }}
                        >
                          {/* Front Face */}
                          <div className="absolute inset-x-0 bottom-0 w-full h-full shadow-lg"
                               style={{ background: c.main, transform: "translateZ(5px)" }} />
                          {/* Side Face */}
                          <div className="absolute bottom-0 h-full w-[10px] right-[-10px] origin-left"
                               style={{ background: c.side, transform: "rotateY(90deg)" }} />
                          {/* Top Face */}
                          <div className="absolute top-[-10px] inset-x-0 h-[10px] origin-bottom"
                               style={{ background: c.top, transform: "rotateX(90deg)" }} />
                        </motion.div>

                        {/* Labels below chart */}
                        <div className="absolute top-[calc(100%+15px)] text-center w-32">
                          <p className="font-bebas text-lg leading-none" style={{ color: c.main }}>
                            {Math.round((item.total_skor / 70) * 100)}%
                          </p>
                          <p className="text-[7px] font-black uppercase text-slate-400 mt-1 leading-tight tracking-tighter">
                            {item.nama_lengkap.split(' ')[0]}<br/>
                            {idx === 0 ? "🥇 TERBAIK" : idx === 1 ? "🥈 RUNNER UP" : "TOP MEMBER"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-24 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between">
                   <div className="text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rata-rata Skor</p>
                      <p className="font-bebas text-2xl text-slate-700">
                        {Math.round(leaderboard.reduce((a, b) => a + (b.total_skor || 0), 0) / (leaderboard.length || 1))}
                      </p>
                   </div>
                   <div className="w-px h-10 bg-slate-200" />
                   <div className="text-right">
                      <p className="text-[9px] font-black text-[#1f9a5e] uppercase tracking-widest">Target Capaian</p>
                      <p className="font-bebas text-2xl text-[#1f9a5e]">70 PTS</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
