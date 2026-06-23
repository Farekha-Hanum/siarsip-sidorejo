"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  Scan,
  ClipboardList,
  Trophy,
  LogOut,
  Menu,
  X,
  Star,
  ChevronDown,
  Archive
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import LogoutButton from "@/components/auth/LogoutButton";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard",          href: "/admin" },
  { icon: Users,           label: "Data Pengurus",      href: "/admin/pengurus" },
  { 
    icon: Archive,        
    label: "Arsip Surat",      
    subItems: [
      { label: "Arsip IPNU", href: "/admin/surat-digital/ipnu" },
      { label: "Arsip IPPNU", href: "/admin/surat-digital/ippnu" },
      { label: "Arsip Gabungan", href: "/admin/surat-digital/gabungan" }
    ]
  },
  { 
    icon: FileText,        
    label: "Buat Surat IPNU",      
    subItems: [
      { label: "Surat Tugas", href: "/admin/surat-digital/ipnu/buat?jenis=Surat%20Tugas&kode=ST" },
      { label: "Surat Keterangan", href: "/admin/surat-digital/ipnu/buat?jenis=Surat%20Keterangan&kode=SK" },
      { label: "Surat Undangan", href: "/admin/surat-digital/ipnu/buat?jenis=Surat%20Undangan&kode=SU" },
      { label: "Surat Permohonan", href: "/admin/surat-digital/ipnu/buat?jenis=Surat%20Permohonan&kode=SP" }
    ]
  },
  { 
    icon: FileText,        
    label: "Buat Surat IPPNU",      
    subItems: [
      { label: "Surat Mandat", href: "/admin/surat-digital/ippnu/buat?jenis=Surat%20Mandat&kode=SM" },
      { label: "Surat Keterangan", href: "/admin/surat-digital/ippnu/buat?jenis=Surat%20Keterangan&kode=SK" },
      { label: "Surat Undangan", href: "/admin/surat-digital/ippnu/buat?jenis=Surat%20Undangan&kode=SU" },
      { label: "Surat Permohonan", href: "/admin/surat-digital/ippnu/buat?jenis=Surat%20Permohonan&kode=SP" }
    ]
  },
  { 
    icon: FileText,        
    label: "Surat Gabungan",      
    subItems: [
      { label: "Proposal Kegiatan", href: "/admin/surat-digital/gabungan/buat?jenis=Proposal%20Kegiatan&kode=PRP" },
      { label: "Undangan", href: "/admin/surat-digital/gabungan/buat?jenis=Undangan&kode=UND" },
      { label: "LPJ", href: "/admin/surat-digital/gabungan/buat?jenis=Laporan%20Pertanggungjawaban&kode=LPJ" }
    ]
  },
  { icon: Scan,            label: "Scanner OCR",        href: "/admin/scanner" },
  { icon: ClipboardList,   label: "Inventaris",         href: "/admin/inventaris" },
  { icon: Trophy,          label: "Reward Anggota",     href: "/admin/validasi" },
  { icon: LayoutDashboard, label: "Daftar Kegiatan",    href: "/admin/kegiatan" },
];

const NU_GREEN  = "#1f9a5e";
const NU_DARK   = "#145c38";
const NU_GOLD   = "#f4c430";
const NU_LIGHT  = "#4dcf8f";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const findActiveSubmenu = () => {
    for (const item of sidebarItems) {
      if (item.subItems?.some(sub => pathname === sub.href)) return item.label;
    }
    return null;
  };
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(findActiveSubmenu());

  // Auto-collapse sidebar on editor pages
  useEffect(() => {
    if (pathname.includes("/buat")) {
      setIsOpen(false);
    }
  }, [pathname]);

  const currentPage = sidebarItems.find(i => i.href === pathname)?.label ?? 
                sidebarItems.find(i => i.subItems?.some(s => s.href === pathname))?.subItems?.find(s => s.href === pathname)?.label ?? 
                "Dashboard";

  return (
    <div className="flex min-h-screen font-sans" style={{ background: "#f0faf4" }}>

      {/* ===== SIDEBAR ===== */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 272 : 76 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full z-50 flex flex-col shadow-2xl overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${NU_DARK} 0%, ${NU_GREEN} 100%)`,
          borderRight: "1px solid rgba(77,207,143,0.2)",
        }}
      >
        {/* Logo area */}
        <div className="flex items-center px-4 py-5 border-b border-white/10 min-h-[72px]">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="open"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 flex-1 overflow-hidden"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 flex-shrink-0"
                  style={{ borderColor: `${NU_GOLD}40`, '--tw-ring-color': `${NU_GOLD}40` } as any}>
                  <Image src="/logo-baru.png" alt="Logo" width={36} height={36} className="object-cover" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bebas text-xl text-white tracking-widest leading-none">SIMPEL NU</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: NU_LIGHT }}>
                    Panel Admin
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="closed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-9 h-9 rounded-xl overflow-hidden mx-auto"
              >
                <Image src="/logo-baru.png" alt="Logo" width={36} height={36} className="object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="ml-auto p-1.5 rounded-lg transition-colors hover:bg-white/10 text-white/60 hover:text-white flex-shrink-0"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto overflow-x-hidden">
          {sidebarItems.map((item) => {
            const isActive = item.href ? pathname === item.href : false;
            const isSubMenuActive = item.subItems?.some(sub => pathname === sub.href);
            const isExpanded = openSubmenu === item.label;

            const content = (
              <motion.div
                whileHover={{ x: isOpen ? 4 : 0 }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group cursor-pointer"
                style={
                  isActive || isSubMenuActive
                    ? {
                        background: `linear-gradient(135deg, ${NU_GOLD}, #f7d45e)`,
                        color: NU_DARK,
                        boxShadow: `0 4px 20px rgba(244,196,48,0.35)`,
                      }
                    : { color: "rgba(255,255,255,0.65)" }
                }
                onClick={() => {
                  if (item.subItems) {
                    setOpenSubmenu(isExpanded ? null : item.label);
                    if (!isOpen) setIsOpen(true);
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isActive && !isSubMenuActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !isSubMenuActive) (e.currentTarget as HTMLElement).style.background = "";
                }}
              >
                {(isActive || isSubMenuActive) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${NU_GOLD}, #f7d45e)` }}
                  />
                )}
                <item.icon
                  size={20}
                  className="relative z-10 flex-shrink-0"
                  style={{ color: (isActive || isSubMenuActive) ? NU_DARK : "rgba(255,255,255,0.6)" }}
                />
                {isOpen && (
                  <span className="relative z-10 font-semibold text-sm whitespace-nowrap flex-1 flex items-center justify-between">
                    {item.label}
                    {item.subItems && (
                      <ChevronDown size={14} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    )}
                  </span>
                )}

                {/* Tooltip when collapsed */}
                {!isOpen && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0d3320] text-white text-xs font-bold rounded-lg
                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50"
                    style={{ border: "1px solid rgba(77,207,143,0.25)" }}
                  >
                    {item.label}
                  </div>
                )}
              </motion.div>
            );

            return (
              <div key={item.label}>
                {item.href ? (
                  <Link href={item.href}>{content}</Link>
                ) : (
                  content
                )}
                
                {/* Submenu Dropdown */}
                <AnimatePresence>
                  {item.subItems && isOpen && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-4 mr-2 mt-1 space-y-1"
                    >
                      {item.subItems.map(sub => (
                        <Link key={sub.href} href={sub.href}>
                          <div className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                            pathname === sub.href ? "bg-white/10 text-white font-bold" : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}>
                            {sub.label}
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <LogoutButton collapsed={!isOpen} />
        </div>

        {/* Bottom NU stars */}
        {isOpen && (
          <div className="px-5 pb-5 pt-2 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill={NU_GOLD} className="opacity-40" style={{ color: NU_GOLD }} />
            ))}
            <span className="text-[9px] text-white/20 ml-1 font-bold tracking-widest uppercase">IPNU · IPPNU</span>
          </div>
        )}
      </motion.aside>

      {/* ===== MAIN CONTENT ===== */}
      <main
        className="flex-1 transition-all duration-300 min-h-screen"
        style={{ marginLeft: isOpen ? 272 : 76 }}
      >
        {/* Top Header */}
        <header
          className="sticky top-0 z-40 px-6 md:px-8 py-4 flex items-center justify-between"
          style={{
            background: "rgba(240,250,244,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(31,154,94,0.12)",
          }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1f9a5e" }}>
              Panel Administrasi · SIMPEL NU
            </p>
            <h2 className="font-bebas text-2xl text-[#0d3320] tracking-tight leading-none">{currentPage}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#0d3320] leading-none">Admin Sidorejo</p>
              <p className="text-xs mt-0.5" style={{ color: "#1f9a5e" }}>Administrator Utama</p>
            </div>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
              style={{ background: `linear-gradient(135deg, #1f9a5e, #145c38)` }}
            >
              A
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
