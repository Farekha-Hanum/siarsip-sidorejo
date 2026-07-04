"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2518] to-[#1a3a28] p-6">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/10 shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-bebas text-4xl text-white tracking-tight mb-2">Terjadi Kesalahan</h1>
        <p className="text-white/50 text-sm mb-8">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="px-8 py-4 bg-[#f4c430] text-[#0d3320] rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-lg"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
