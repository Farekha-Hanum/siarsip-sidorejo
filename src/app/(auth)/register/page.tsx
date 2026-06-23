"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { UserPlus, User, Lock, Mail, ChevronRight, CheckCircle2, AlertCircle, Star } from "lucide-react";
import { signup } from "@/actions/auth";

const NU_DARK  = "#0d3320";
const NU_GREEN = "#1f9a5e";
const NU_GOLD  = "#f4c430";
const NU_LIGHT = "#4dcf8f";

const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(77,207,143,0.2)",
};

function NUInput({ name, type = "text", placeholder, required, icon: Icon }: {
  name: string; type?: string; placeholder: string; required?: boolean; icon: React.ElementType;
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none" style={{ color: "rgba(77,207,143,0.6)" }}>
        <Icon size={17} />
      </div>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="block w-full pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all text-white placeholder-white/30 font-medium"
        style={inputBase}
        onFocus={(e) => { e.target.style.border = "1px solid rgba(244,196,48,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(244,196,48,0.1)"; }}
        onBlur={(e) => { e.target.style.border = "1px solid rgba(77,207,143,0.2)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const result = await signup(formData);
    setLoading(false);
    if (result?.error) setError(result.error);
    else if (result?.success) setSuccess(result.success);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans"
      style={{ background: `linear-gradient(145deg, ${NU_DARK} 0%, #145c38 50%, ${NU_GREEN} 100%)` }}
    >
      {/* Background stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div key={i} className="absolute"
            style={{ left: `${(i * 91 + 7) % 100}%`, top: `${(i * 73 + 11) % 90}%`, color: NU_GOLD,
              fontSize: `${6 + (i % 4) * 6}px`, opacity: 0.12 + (i % 3) * 0.07 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear" }}
          >✦</motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl relative z-10"
      >
        <div
          className="rounded-3xl p-8 md:p-10 shadow-2xl"
          style={{ background: "rgba(13,51,32,0.72)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(77,207,143,0.2)" }}
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 ring-2 ring-[#f4c430]/30 shadow-xl animate-float">
              <Image src="/logo-baru.png" alt="Logo SIMPEL NU" width={64} height={64} className="object-cover" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Star size={12} fill={NU_GOLD} style={{ color: NU_GOLD }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: NU_LIGHT }}>Bergabung Sekarang</span>
            </div>
            <h1 className="font-bebas text-4xl text-white tracking-tight">Daftar Akun Baru</h1>
            <p className="text-white/45 text-sm mt-1">
              Bergabunglah dengan SIMPEL NU untuk mulai berpartisipasi di kegiatan ranting.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              className="mb-5 p-4 rounded-2xl flex items-center gap-3"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5" }}>
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-6 rounded-2xl flex flex-col items-center text-center gap-4"
              style={{ background: "rgba(31,154,94,0.12)", border: "1px solid rgba(31,154,94,0.3)" }}>
              <CheckCircle2 size={48} style={{ color: NU_LIGHT }} />
              <div>
                <h3 className="font-bold text-white text-lg">Pendaftaran Berhasil!</h3>
                <p className="text-sm mt-1" style={{ color: NU_LIGHT }}>{success}</p>
              </div>
              <Link href="/login"
                className="font-bold flex items-center gap-1 transition-colors hover:underline"
                style={{ color: NU_GOLD }}>
                Kembali ke Login <ChevronRight size={16} />
              </Link>
            </motion.div>
          )}

          {/* Form */}
          {!success && (
            <form action={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>Nama Lengkap</label>
                  <NUInput name="nama_lengkap" placeholder="Contoh: Ahmad Fauzi" required icon={User} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>Username</label>
                  <NUInput name="username" placeholder="ahmad_fauzi" required icon={UserPlus} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>Email</label>
                <NUInput name="email" type="email" placeholder="nama@email.com" required icon={Mail} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>Password</label>
                <NUInput name="password" type="password" placeholder="••••••••" required icon={Lock} />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                type="submit"
                className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-2 shadow-xl"
                style={{
                  background: loading ? "rgba(244,196,48,0.4)" : `linear-gradient(135deg, ${NU_GOLD}, #f7d45e)`,
                  color: NU_DARK,
                  boxShadow: loading ? "none" : "0 8px 24px rgba(244,196,48,0.3)",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0d3320]/30 border-t-[#0d3320] rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <><UserPlus size={18} /> Daftar Sekarang</>
                )}
              </motion.button>
            </form>
          )}

          {!success && (
            <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <p className="text-white/40 text-sm">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-bold transition-colors hover:underline" style={{ color: "#80e5b0" }}>
                  Masuk di sini
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
