import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Visual Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
          <FileQuestion className="w-10 h-10" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
            Error 404
          </span>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Halaman atau instrumen penjaminan mutu yang Anda cari tidak tersedia atau tautan telah dipindahkan.
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Beranda Publik
          </Link>
        </div>

        {/* Footer note */}
        <div className="pt-8 border-t border-slate-200/80">
          <p className="text-xs text-slate-400">
            MANTAUIKU &copy; {new Date().getFullYear()} LPM STIMI YAPMI Makassar
          </p>
        </div>
      </div>
    </div>
  );
}
