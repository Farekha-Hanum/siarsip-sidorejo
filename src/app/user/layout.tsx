"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Target,
  Users,
  ClipboardList,
  LogOut,
  Star,
  FileText,
  ChevronDown,
  Menu,
  X,
  Scan,
  Archive,
  Layers
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import LogoutButton from "@/components/auth/LogoutButton";

const navItems = [
  { icon: Home,          label: "Beranda",        href: "/user" },
  { 
    icon: Archive,       
    label: "Arsip Surat",    
    subItems: [
      { label: "Arsip IPNU", href: "/user/surat-digital/ipnu" },
      { label: "Arsip IPPNU", href: "/user/surat-digital/ippnu" },
      { label: "Arsip Gabungan", href: "/user/surat-digital/gabungan" }
    ]
  },
  { 
    icon: FileText,      
    label: "Buat Surat",     
    subItems: [
      { label: "Surat IPNU", href: "/user/surat-digital/ipnu/buat?jenis=Surat%20Tugas&kode=ST" },
      { label: "Surat IPPNU", href: "/user/surat-digital/ippnu/buat?jenis=Surat%20Mandat&kode=SM" },
      { label: "Surat Gabungan", href: "/user/surat-digital/gabungan/buat?jenis=Proposal%20Kegiatan&kode=PRP" }
    ]
  },
  { icon: Scan,          label: "Scanner OCR",    href: "/user/scanner" },
  { icon: Target,        label: "Input Kegiatan", href: "/user/kegiatan" },
  { icon: Users,         label: "Data Pengurus",  href: "/user/pengurus" },
  { icon: ClipboardList, label: "Inventaris",     href: "/user/inventaris" },
];

const NU_GREEN = "#4dcf8f";
const NU_DARK  = "#1f9a5e";
const NU_GOLD  = "#f4c430";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="min-h-screen font-sans pb-20 md:pb-10" style={{ background: "#f8faf9" }}>
      
      {/* ===== FLOATING TOP NAV (GLASSMORPHISM) ===== */}
      <div className="sticky top-0 z-[100] w-full px-4 pt-4">
        <header 
          className="max-w-7xl mx-auto rounded-[2rem] shadow-2xl border border-white/20 overflow-visible"
          style={{ 
            background: `rgba(31, 154, 94, 0.95)`,
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="px-6 md:px-8 h-24 flex items-center justify-between">
            
            {/* Logo & Portal Label */}
            <Link href="/user" className="flex items-center gap-3 min-w-fit">
              <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-[#f4c430]/50 shadow-lg bg-white p-1">
                <Image src="/logo-baru.png" alt="Logo" width={32} height={32} className="object-cover mx-auto" />
              </div>
              <div className="hidden sm:block">
                <p className="font-bebas text-xl text-white tracking-widest leading-none">SIMPEL NU</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#f4c430]">
                  PORTAL USER
                </p>
              </div>
            </Link>

            {/* Desktop Nav Items */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const hasSubItems = !!item.subItems;
                const isActive = pathname === item.href || (item.subItems?.some(s => pathname.startsWith(s.href)));
                
                if (hasSubItems) {
                  return (
                    <div 
                      key={item.label} 
                      className="relative h-24 flex items-center"
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        className={`px-3 py-2 rounded-2xl text-[10px] font-bold transition-all flex flex-col items-center gap-1.5 min-w-[80px] ${
                          isActive ? "bg-white text-[#1f9a5e] shadow-xl" : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <item.icon size={20} />
                        <span className="flex items-center gap-1">
                          {item.label} <ChevronDown size={10} className={`transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                        </span>
                      </button>

                      {/* Dropdown Menu Overlay */}
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-[85%] left-1/2 -translate-x-1/2 w-44 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden py-2 z-[110]"
                          >
                            {item.subItems?.map((sub) => (
                              <Link 
                                key={sub.label} 
                                href={sub.href}
                                className="block px-5 py-3 text-[11px] font-bold text-slate-600 hover:bg-[#f0faf4] hover:text-[#1f9a5e] transition-colors border-b border-slate-50 last:border-0"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link key={item.label} href={item.href || "#"}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      className={`px-3 py-2 rounded-2xl text-[10px] font-bold transition-all flex flex-col items-center gap-1.5 min-w-[80px] ${
                        isActive ? "bg-white text-[#1f9a5e] shadow-xl" : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side: Profile & Logout */}
            <div className="flex items-center gap-2">
              <div className="hidden xl:flex items-center gap-3 pr-4 border-r border-white/10 mr-2">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter leading-none">Anggota</p>
                  <p className="text-xs font-bold text-white leading-none mt-1">Sidorejo</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20 text-white font-bold text-xs shadow-inner border border-white/10">
                  U
                </div>
              </div>
              <LogoutButton variant="navbar" />
              
              {/* Mobile Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-2xl bg-white/10 text-white"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

          </div>
        </header>
      </div>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 z-[120] bg-[#f8faf9] flex flex-col lg:hidden"
          >
            <div className="p-6 flex items-center justify-between border-b bg-white">
              <div className="flex items-center gap-3">
                <Image src="/logo-baru.png" alt="Logo" width={32} height={32} />
                <span className="font-bebas text-xl text-[#1f9a5e]">MENU UTAMA</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl bg-slate-100">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {navItems.map((item) => (
                <div key={item.label} className="space-y-2">
                  {item.subItems ? (
                    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 px-2 mb-3 text-[#1f9a5e]">
                        <item.icon size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                      </div>
                      <div className="space-y-2">
                        {item.subItems.map((sub) => (
                          <Link key={sub.label} href={sub.href} onClick={() => setMobileMenuOpen(false)}>
                            <div className={`p-4 rounded-2xl font-bold text-sm transition-all ${
                              pathname === sub.href ? "bg-[#1f9a5e] text-white shadow-lg" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}>
                              {sub.label}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link href={item.href || "#"} onClick={() => setMobileMenuOpen(false)}>
                      <div className={`flex items-center gap-4 p-5 rounded-3xl font-bold transition-all ${
                        pathname === item.href ? "bg-[#1f9a5e] text-white shadow-lg" : "bg-white text-slate-600 shadow-sm border border-slate-50"
                      }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          pathname === item.href ? "bg-white/20" : "bg-slate-100 text-slate-400"
                        }`}>
                          <item.icon size={20} />
                        </div>
                        {item.label}
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t bg-white">
              <LogoutButton variant="navbar" className="!bg-red-50 !text-red-600 !w-full !justify-center !flex-row !py-4 !rounded-3xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {children}
      </main>

      {/* Footer / Star Decoration */}
      <div className="max-w-7xl mx-auto px-10 py-10 flex items-center justify-center gap-2 opacity-20 grayscale">
         <Image src="/logo-baru.png" alt="" width={24} height={24} />
         <div className="h-px w-20 bg-slate-400" />
         <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">SIMPEL NU SIDOREJO</span>
         <div className="h-px w-20 bg-slate-400" />
      </div>

    </div>
  );
}
