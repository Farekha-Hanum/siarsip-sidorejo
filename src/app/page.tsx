"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Star, Users, Shield, Zap } from "lucide-react";

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 0, -8],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  },
};

export default function Home() {
  return (
    <main className="min-h-screen font-sans overflow-hidden" style={{ background: "linear-gradient(160deg, #0d3320 0%, #145c38 40%, #1f9a5e 100%)" }}>
      {/* Decorative background stars (NU style) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-[#f4c430] opacity-20"
            style={{
              left: `${(i * 83 + 7) % 100}%`,
              top: `${(i * 67 + 13) % 90}%`,
              fontSize: `${8 + (i % 3) * 8}px`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
          >
            ✦
          </motion.div>
        ))}
      </div>

      {/* Navbar */}
      <nav className="relative z-20 px-6 md:px-12 py-5 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-[#f4c430]/40 shadow-lg">
            <Image src="/logo-baru.png" alt="Logo SIMPEL NU" width={40} height={40} className="object-cover" />
          </div>
          <div>
            <span className="font-bebas text-2xl text-white tracking-widest">SIMPEL NU</span>
            <span className="block text-[10px] text-[#80e5b0] tracking-widest uppercase font-medium -mt-1">Sidorejo</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/login"
            className="bg-[#f4c430] hover:bg-[#f7d45e] text-[#0d3320] px-5 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-[#f4c430]/20 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Shield size={16} /> Masuk
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-12 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#80e5b0] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
            >
              <Star size={12} className="text-[#f4c430]" fill="#f4c430" />
              IPNU · IPPNU · Sidorejo
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-bebas text-white tracking-tight leading-none mb-4"
            >
              SIMPEL{" "}
              <span
                className="relative inline-block"
                style={{
                  background: "linear-gradient(90deg, #f4c430, #fae38c, #f4c430)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmer 3s linear infinite",
                }}
              >
                NU
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[#b3f0ce] text-lg md:text-xl mb-3 font-semibold"
            >
              Sistem Informasi Manajemen Pelajar Nahdlatul Ulama
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-white/60 text-base mb-10 leading-relaxed max-w-lg"
            >
              Platform digital terpadu untuk pengelolaan arsip surat, kegiatan, dan inventaris
              ranting IPNU-IPPNU Sidorejo secara modern dan efisien.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-4 justify-center md:justify-start"
            >
              <Link
                href="/login"
                className="group bg-[#f4c430] hover:bg-[#f7d45e] text-[#0d3320] px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-[#f4c430]/25 transition-all hover:scale-105 hover:shadow-2xl"
              >
                Masuk ke Sistem
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#fitur"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-bold transition-all"
              >
                Pelajari Fitur
              </a>
            </motion.div>
          </div>

          {/* Logo float */}
          <motion.div
            variants={floatVariants}
            initial="initial"
            animate="animate"
            className="flex-shrink-0 relative"
          >
            <div className="w-56 h-56 md:w-72 md:h-72 relative">
              {/* Outer glow ring */}
              <div
                className="absolute inset-0 rounded-full animate-pulse-glow"
                style={{ background: "radial-gradient(circle, rgba(244,196,48,0.15) 0%, transparent 70%)" }}
              />
              {/* Spinning ring */}
              <div
                className="absolute inset-4 rounded-full border-2 border-dashed border-[#f4c430]/30 animate-spin-slow"
              />
              <div
                className="absolute inset-8 rounded-full border border-[#4dcf8f]/20 animate-spin-slow"
                style={{ animationDirection: "reverse", animationDuration: "12s" }}
              />
              {/* Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-2xl">
                  <Image
                    src="/logo-baru.png"
                    alt="Logo IPNU IPPNU"
                    width={240}
                    height={240}
                    loading="eager"
                    priority
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 mx-6 md:mx-12 max-w-5xl md:mx-auto mb-16"
      >
        <div className="glass-dark rounded-3xl px-8 py-6 grid grid-cols-3 gap-4 text-center">
          {[
            { value: "IPNU", label: "Ikatan Pelajar Nahdlatul Ulama" },
            { value: "IPPNU", label: "Ikatan Pelajar Putri NU" },
            { value: "Digital", label: "Arsip & Kegiatan Online" },
          ].map((s, i) => (
            <div key={i}>
              <p className="font-bebas text-2xl md:text-3xl text-[#f4c430] tracking-wide">{s.value}</p>
              <p className="text-[#80e5b0] text-[10px] leading-tight mt-1 font-medium uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <section id="fitur" className="relative z-10 py-20 px-6 md:px-12" style={{ background: "rgba(13,31,20,0.4)", backdropFilter: "blur(4px)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#f4c430] font-bold text-sm uppercase tracking-widest">Fitur Unggulan</span>
            <h2 className="font-bebas text-5xl text-white mt-2 tracking-tight">Semua dalam Satu Platform</h2>
            <p className="text-white/50 mt-3">Didesain khusus untuk kebutuhan ranting IPNU-IPPNU</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Surat Digital",
                desc: "Buat dan arsipkan surat organisasi dengan tanda tangan digital terintegrasi dan sistem nomor otomatis.",
                color: "#1f9a5e",
                glow: "rgba(31,154,94,0.3)",
              },
              {
                icon: BookOpen,
                title: "Kegiatan & Skor",
                desc: "Catat keaktifan anggota, validasi kegiatan, dan lihat peringkat leaderboard secara real-time.",
                color: "#f4c430",
                glow: "rgba(244,196,48,0.3)",
              },
              {
                icon: Users,
                title: "Manajemen Pengurus",
                desc: "Data profil lengkap seluruh pengurus ranting beserta jabatan, kontak, dan rekam jejak kegiatan.",
                color: "#4dcf8f",
                glow: "rgba(77,207,143,0.3)",
              },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass-dark rounded-3xl p-8 cursor-default group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-transform group-hover:scale-110"
                  style={{ background: feat.color, boxShadow: `0 8px 24px ${feat.glow}` }}
                >
                  <feat.icon size={26} className="text-white" />
                </div>
                <h3 className="font-bebas text-2xl text-white mb-3 tracking-tight">{feat.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="relative z-10 py-12 px-6 text-center border-t border-white/10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap size={14} className="text-[#f4c430]" />
          <span className="text-white/40 text-xs tracking-widest uppercase">
            © 2025 PRNU Sidorejo — SIMPEL NU
          </span>
        </div>
        <p className="text-white/20 text-xs">Dibangun dengan ❤ untuk pelajar Nahdlatul Ulama</p>
      </footer>
    </main>
  );
}
