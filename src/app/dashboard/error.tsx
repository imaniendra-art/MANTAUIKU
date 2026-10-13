"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
      <div className="max-w-md w-full bg-white rounded-xl border border-rose-100 shadow-sm p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800">
            Gagal Memuat Modul Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Terjadi kendala saat menyinkronkan data modul penjaminan mutu ini. Anda dapat mencoba memuat ulang modul tanpa harus keluar dari sistem.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-slate-400 bg-slate-50 py-0.5 px-2 rounded inline-block mt-2">
              ID Masalah: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Muat Ulang Modul Ini
          </button>
        </div>
      </div>
    </div>
  );
}
