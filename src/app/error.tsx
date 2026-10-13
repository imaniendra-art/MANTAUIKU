"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors for client telemetry
    console.error("MANTAUIKU Root Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Warning Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
          <AlertTriangle className="w-10 h-10" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Terjadi Kesalahan Sistem
          </span>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Gagal Memuat Halaman
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Terjadi gangguan teknis saat memproses permintaan Anda. Sistem telah mencatat insiden ini untuk penanganan lebih lanjut.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-400 bg-slate-100 py-1 px-2 rounded inline-block">
              Kode Insiden: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-200/80">
          <p className="text-xs text-slate-400">
            Lembaga Penjaminan Mutu (LPM) STIMI YAPMI Makassar
          </p>
        </div>
      </div>
    </div>
  );
}
