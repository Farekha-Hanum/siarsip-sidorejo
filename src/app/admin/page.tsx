"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Inbox,
  Clock,
  ChevronRight,
  PlusCircle,
  Scan,
  ShieldCheck,
  Package,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const NU_GREEN = "#1f9a5e";
const NU_DARK  = "#145c38";
const NU_GOLD  = "#f4c430";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPengurus: 0,
    suratKeluar: 0,
    suratMasuk: 0,
    pendingValidasi: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    setLoading(true);

    const { count: pengurusCount } = await supabase
      .from("profiles").select("*", { count: "exact", head: true }).eq("role", "user");
    const { count: sKeluar } = await supabase
      .from("surat").select("*", { count: "exact", head: true }).eq("jenis_surat", "keluar_otomatis");
    const { count: sMasuk } = await supabase
      .from("surat").select("*", { count: "exact", head: true }).eq("jenis_surat", "masuk_scan");
    const { count: pending } = await supabase
      .from("user_kegiatan").select("*", { count: "exact", head: true }).eq("status_validasi", "pending");

    setStats({
      totalPengurus: pengurusCount || 0,
      suratKeluar: sKeluar || 0,
      suratMasuk: sMasuk || 0,
      pendingValidasi: pending || 0,
    });

    const { data: recentSurat } = await supabase
      .from("surat").select("perihal, created_at")
      .order("created_at", { ascending: false }).limit(3);

    if (recentSurat) {
      setRecentActivities(recentSurat.map(s => ({
        title: s.perihal,
        time: new Date(s.created_at).toLocaleDateString("id-ID"),
        desc: "Dokumen berhasil diarsipkan ke dalam sistem.",
        color: NU_GREEN,
      })));
    }
    setLoading(false);
  }

  const statCards = [
    { label: "Total Anggota",      value: stats.totalPengurus,   icon: Users,       bg: "#145c38", shadow: "rgba(20,92,56,0.3)" },
    { label: "Arsip Surat Keluar", value: stats.suratKeluar,     icon: FileText,    bg: "#1f9a5e", shadow: "rgba(31,154,94,0.3)" },
    { label: "Arsip Surat Masuk",  value: stats.suratMasuk,      icon: Inbox,       bg: "#27b870", shadow: "rgba(39,184,112,0.3)" },
    { label: "Butuh Validasi",     value: stats.pendingValidasi, icon: ShieldCheck, bg: "#f4c430", shadow: "rgba(244,196,48,0.3)" },
  ];

  return (
    <div className="space-y-8 pb-12">

      {/* ===== Welcome Hero ===== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden p-8 md:p-10 text-white shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${NU_DARK} 0%, ${NU_GREEN} 100%)` }}
      >
        {/* BG Decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 animate-spin-slow"
            style={{ border: "2px dashed #f4c430" }} />
          <div className="absolute top-4 right-4 opacity-8">
            <Image src="/logo-baru.png" alt="" width={220} height={220} className="opacity-[0.07]" />
          </div>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill={NU_GOLD} className="absolute opacity-20"
              style={{ color: NU_GOLD, left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%` }} />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: "rgba(244,196,48,0.2)", color: NU_GOLD, border: "1px solid rgba(244,196,48,0.3)" }}>
              ✦ Panel Admin
            </span>
          </div>
          <h1 className="font-bebas text-5xl md:text-6xl tracking-tight leading-none mb-3">
            Dashboard <span style={{ color: NU_GOLD }}>SIMPEL NU</span>
          </h1>
          <p className="text-white/60 max-w-xl text-base leading-relaxed mb-8">
            Selamat datang kembali. Pantau seluruh aktivitas surat-menyurat, kegiatan anggota,
            dan inventaris ranting IPNU-IPPNU Sidorejo secara real-time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/surat-digital">
              <button
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-xl"
                style={{ background: NU_GOLD, color: NU_DARK, boxShadow: `0 8px 24px rgba(244,196,48,0.4)` }}
              >
                <PlusCircle size={16} /> Buat Surat Baru
              </button>
            </Link>
            <Link href="/admin/scanner">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:bg-white/15"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <Scan size={16} /> Scanner OCR
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ===== Stats Grid ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-2xl p-6 transition-all cursor-default group"
            style={{ border: "1px solid rgba(31,154,94,0.1)", boxShadow: "0 2px 12px rgba(13,31,20,0.06)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              style={{ background: stat.bg, boxShadow: `0 6px 20px ${stat.shadow}` }}
            >
              <stat.icon size={22} className="text-white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#94a3b8" }}>
              {stat.label}
            </p>
            <h3 className="font-bebas text-4xl tracking-tight" style={{ color: NU_DARK }}>
              {loading ? (
                <span className="inline-block w-12 h-8 rounded animate-pulse" style={{ background: "#e2e8f0" }} />
              ) : stat.value}
            </h3>
          </motion.div>
        ))}
      </div>

      {/* ===== Activity + Quick Links ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden"
          style={{ border: "1px solid rgba(31,154,94,0.1)", boxShadow: "0 2px 20px rgba(13,31,20,0.06)" }}>
          <div className="px-8 py-6 border-b flex items-center gap-3" style={{ borderColor: "rgba(31,154,94,0.08)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(31,154,94,0.1)" }}>
              <Clock size={18} style={{ color: NU_GREEN }} />
            </div>
            <h3 className="font-bebas text-xl tracking-tight" style={{ color: NU_DARK }}>Log Aktivitas Terakhir</h3>
          </div>
          <div className="p-6 space-y-2">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <ActivityItem {...act} />
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center" style={{ color: "#94a3b8" }}>
                <FileText size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium text-sm">Belum ada aktivitas surat-menyurat terbaru.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-5">
          <div className="rounded-3xl p-7 text-white"
            style={{ background: `linear-gradient(145deg, ${NU_DARK}, ${NU_GREEN})`, boxShadow: `0 8px 40px rgba(31,154,94,0.25)` }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#80e5b0" }}>✦ Akses Cepat</p>
            <div className="space-y-2">
              <QuickLink href="/admin/validasi" label="Validasi Poin"  icon={ShieldCheck} />
              <QuickLink href="/admin/inventaris" label="Cek Inventaris" icon={Package} />
              <QuickLink href="/admin/pengurus" label="Data Pengurus"  icon={Users} />
            </div>
          </div>

          <div className="rounded-2xl p-6"
            style={{ background: "rgba(244,196,48,0.08)", border: "1px solid rgba(244,196,48,0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} fill={NU_GOLD} style={{ color: NU_GOLD }} />
              <h4 className="font-bold text-sm" style={{ color: "#7a4f00" }}>Tips Admin</h4>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#92680a" }}>
              Pastikan setiap surat masuk dipindai menggunakan OCR agar pengarsipan teks lebih efisien dan mudah dicari.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ title, time, desc, color }: any) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl transition-colors group"
      style={{ cursor: "default" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(240,250,244,0.8)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
    >
      <div className="mt-1.5 flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full group-hover:scale-150 transition-transform"
          style={{ background: color || "#1f9a5e", boxShadow: `0 0 6px ${color || "#1f9a5e"}60` }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-bold text-sm truncate" style={{ color: "#0d3320" }}>{title}</h4>
          <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "#94a3b8" }}>{time}</span>
        </div>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, label, icon: Icon }: any) {
  return (
    <Link href={href}>
      <div className="flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer group"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(244,196,48,0.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
      >
        <div className="flex items-center gap-3">
          <Icon size={17} style={{ color: "#80e5b0" }} />
          <span className="font-semibold text-sm text-white/80">{label}</span>
        </div>
        <ChevronRight size={15} className="text-white/30 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
