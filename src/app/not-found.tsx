import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2518] to-[#1a3a28] p-6">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/10 shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-bebas text-6xl text-white tracking-tight mb-2">404</h1>
        <p className="font-bebas text-2xl text-white/70 tracking-tight mb-2">Halaman Tidak Ditemukan</p>
        <p className="text-white/40 text-sm mb-8">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-[#f4c430] text-[#0d3320] rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
