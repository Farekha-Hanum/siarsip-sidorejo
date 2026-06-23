"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogIn, Mail, Lock, AlertCircle, Star, User as UserIcon, ShieldCheck } from "lucide-react";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormAction = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'user') => {
    const formData = new FormData();
    if (role === 'admin') {
      formData.append("email", "adminsimpelnu@gmail.com");
      formData.append("password", "admin1234");
    } else {
      formData.append("email", "putri.melati@gmail.com");
      formData.append("password", "putri1234");
    }
    handleFormAction(formData);
  };

  return (
    <div
      className="min-h-screen flex font-sans"
      style={{ background: "linear-gradient(145deg, #0f2518 0%, #1a3a28 50%, #22624a 100%)" }}
    >
      {/* Decorative stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-[#f4c430]"
            style={{
              left: `${(i * 91 + 5) % 100}%`,
              top: `${(i * 73 + 9) % 95}%`,
              fontSize: `${6 + (i % 4) * 6}px`,
              opacity: 0.15 + (i % 3) * 0.08,
            }}
            animate={{ rotate: 360, scale: [1, 1.3, 1] }}
            transition={{ duration: 8 + i * 1.5, repeat: Infinity, ease: "linear" }}
          >
            ✦
          </motion.div>
        ))}
        {/* Large decorative circle */}
        <div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #f4c430, transparent)" }}
        />
        <div
          className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #4dcf8f, transparent)" }}
        />
      </div>

      {/* Left Panel – Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#f4c430]/40">
            <Image src="/logo-baru.png" alt="Logo" width={40} height={40} className="object-cover" />
          </div>
          <div>
            <span className="font-bebas text-2xl text-white tracking-widest">SIMPEL NU</span>
            <p className="text-[#80e5b0] text-[10px] tracking-widest uppercase -mt-1">Sidorejo</p>
          </div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative w-52 h-52">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#f4c430]/25 animate-spin-slow" />
              <div className="absolute inset-6 rounded-full border border-[#4dcf8f]/20" style={{ animation: "spin-slow 12s linear infinite reverse" }} />
              <div className="absolute inset-0 flex items-center justify-center animate-float">
                <Image src="/logo-baru.png" alt="Logo IPNU IPPNU" width={160} height={160} className="rounded-full drop-shadow-2xl object-cover" />
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-bebas text-5xl text-white leading-tight tracking-tight mb-4"
          >
            Selamat Datang<br />
            <span style={{ color: "#f4c430" }}>Pelajar NU</span> 👋
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/50 text-base leading-relaxed max-w-sm"
          >
            Masuk untuk mengakses sistem manajemen arsip, kegiatan, dan inventaris ranting IPNU-IPPNU Sidorejo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex gap-3"
          >
            {["Arsip Surat", "Kegiatan", "Inventaris", "Leaderboard"].map((tag) => (
              <span
                key={tag}
                className="text-xs font-bold px-3 py-1 rounded-full border border-[#4dcf8f]/30 text-[#80e5b0]"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        <p className="text-white/20 text-xs">© 2025 PRNU Sidorejo · SIMPEL NU</p>
      </div>

      {/* Right Panel – Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-3xl p-8 md:p-10 shadow-2xl"
            style={{
              background: "rgba(13, 51, 32, 0.7)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(77, 207, 143, 0.2)",
            }}
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <Image src="/logo-baru.png" alt="Logo" width={36} height={36} className="rounded-full object-cover" />
              <span className="font-bebas text-xl text-white tracking-widest">SIMPEL NU</span>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} className="text-[#f4c430]" fill="#f4c430" />
                <span className="text-[#80e5b0] text-xs font-bold tracking-widest uppercase">Login Anggota</span>
              </div>
              <h1 className="font-bebas text-4xl text-white tracking-tight">Masuk Sekarang</h1>
              <p className="text-white/40 text-sm mt-1">Gunakan akun yang telah didaftarkan admin</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-2xl flex items-center gap-3"
                style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}
              >
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            <form action={handleFormAction} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70 block">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#4dcf8f]/60 group-focus-within:text-[#f4c430] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="email@example.com"
                    className="block w-full pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all text-white placeholder-white/30 font-medium"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(77,207,143,0.2)",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid rgba(244,196,48,0.6)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(244,196,48,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid rgba(77,207,143,0.2)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/70 block">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#4dcf8f]/60 group-focus-within:text-[#f4c430] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all text-white placeholder-white/30 font-medium"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(77,207,143,0.2)",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid rgba(244,196,48,0.6)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(244,196,48,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid rgba(77,207,143,0.2)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                type="submit"
                className="w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl mt-2"
                style={{
                  background: loading ? "rgba(244,196,48,0.4)" : "linear-gradient(135deg, #f4c430, #f7d45e)",
                  color: "#0d3320",
                  boxShadow: loading ? "none" : "0 8px 24px rgba(244,196,48,0.3)",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0d3320]/30 border-t-[#0d3320] rounded-full animate-spin" />
                    Memuat...
                  </span>
                ) : (
                  <>
                    <LogIn size={18} />
                    Masuk ke SIMPEL NU
                  </>
                )}
              </motion.button>
            </form>

            {/* Quick Login Buttons */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1 bg-white/10"></div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Coba Cepat</span>
                <div className="h-px flex-1 bg-white/10"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:bg-white/10 text-white/60 border border-white/10"
                >
                  <ShieldCheck size={14} className="text-[#f4c430]" />
                  Login Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('user')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:bg-white/10 text-white/60 border border-white/10"
                >
                  <UserIcon size={14} className="text-[#4dcf8f]" />
                  Login User
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-2">
              <p className="text-white/40 text-sm">
                Belum punya akun?{" "}
                <Link href="/register" className="text-[#80e5b0] font-bold hover:text-[#f4c430] transition-colors">
                  Daftar di sini
                </Link>
              </p>
              <p className="text-white/30 text-xs">
                Sistem Informasi Manajemen Pelajar NU · Sidorejo
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
