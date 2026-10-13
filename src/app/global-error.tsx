"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">
              Kesalahan Kritis Aplikasi
            </h1>
            <p className="text-sm text-slate-600">
              Terjadi kesalahan fatal pada sistem MANTAUIKU STIMI YAPMI. Silakan muat ulang halaman aplikasi.
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-slate-400 bg-slate-100 py-1 px-2 rounded inline-block">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
