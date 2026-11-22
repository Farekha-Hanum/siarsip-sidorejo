"use client";

import { motion } from "framer-motion";
import { Archive, PlusCircle, ArrowRight, FolderKanban } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    id: "ipnu",
    name: "IPNU",
    fullName: "Ikatan Pelajar Nahdlatul Ulama",
    desc: "Lihat dan telusuri arsip surat masuk dan surat keluar untuk organisasi IPNU.",
    logo: "/logo-ipnu.png",
    color: "#2d8c5a",
    link: "/user/surat-digital/ipnu"
  },
  {
    id: "ippnu",
    name: "IPPNU",
    fullName: "Ikatan Pelajar Putri Nahdlatul Ulama",
    desc: "Lihat dan telusuri arsip surat masuk dan surat keluar untuk organisasi IPPNU.",
    logo: "/logo-ippnu.png",
    color: "#145c38",
    link: "/user/surat-digital/ippnu"
  },
  {
    id: "gabungan",
    name: "Gabungan",
    fullName: "IPNU - IPPNU",
    desc: "Lihat dan telusuri arsip surat bersama dan proposal kegiatan gabungan IPNU & IPPNU.",
    logo: "/logo-baru.png",
    color: "#0d3320",
    link: "/user/surat-digital/gabungan"
  }
];

export default function UserSuratSelectorPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-100 shadow-sm"
        >
          <Archive size={14} className="text-[#1f9a5e]" />
          <span className="text-xs font-bold uppercase tracking-widest">Arsip Surat Digital</span>
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0d3320] tracking-tight">Pilih Kategori Arsip Surat</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
          Silakan pilih kategori organisasi untuk melihat dan menelusuri riwayat dokumen surat masuk (hasil scan fisik)
          serta surat keluar resmi yang tersimpan dalam sistem.
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className="group relative bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-2xl hover:shadow-green-900/10"
          >
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <Archive size={100} />
            </div>

            {/* Logo Circle */}
            <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
               <Image src={cat.logo} alt={cat.name} width={64} height={64} className="object-contain relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="space-y-2 flex-1">
              <h2 className="text-2xl font-bold text-[#0d3320] tracking-tight">{cat.name}</h2>
              <p className="text-[10px] font-bold uppercase text-green-600 tracking-widest">{cat.fullName}</p>
              <p className="text-sm text-slate-500 leading-relaxed mt-4">
                {cat.desc}
              </p>
            </div>

            <Link href={cat.link} className="w-full mt-8">
              <button 
                className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${cat.color}, #1a7a4a)` }}
              >
                Buka Arsip Surat <ArrowRight size={18} />
              </button>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-8 rounded-3xl bg-[#0d3320] text-white overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <PlusCircle className="text-[#f4c430]" size={24} />
             </div>
             <div className="text-left">
                <h4 className="font-bold text-lg">Punya Surat Masuk Fisik?</h4>
                <p className="text-white/50 text-sm">Gunakan fitur Scanner OCR untuk memindai dokumen fisik ke dalam arsip digital.</p>
             </div>
          </div>
          <Link href="/user/scanner">
            <button className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold text-sm border border-white/10 cursor-pointer">
              Buka Scanner OCR
            </button>
          </Link>
        </div>
        {/* BG Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] -mr-32 -mt-32" />
      </div>
    </div>
  );
}
