"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell, Search, PanelLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "./SidebarContext";

export default function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  let pageTitle = "Dashboard Kinerja";
  let pageSubtitle = "Monitoring capaian 12 Indikator Kinerja Utama STIMI YAPMI";

  if (pathname.includes("/targets")) {
    pageTitle = "Manajemen Target IKU";
    pageSubtitle = "Penetapan baseline & target tahunan institusi";
  } else if (pathname.includes("/achievements")) {
    pageTitle = "Pelaporan Capaian";
    pageSubtitle = "Input realisasi indikator triwulan & unggah bukti dukung";
  } else if (pathname.includes("/reports")) {
    pageTitle = "Arsip & Rekap Laporan";
    pageSubtitle = "Evaluasi kinerja institusi & ekspor laporan";
  } else if (pathname.includes("/users")) {
    pageTitle = "Pengguna & Unit Kerja";
    pageSubtitle = "Manajemen akun penanggung jawab (PIC) IKU";
  } else if (pathname.includes("/profile")) {
    pageTitle = "Profil Institusi";
    pageSubtitle = "Identitas & parameter kampus STIMI YAPMI Makassar";
  }

  const role = session?.user?.role;
  const unit = session?.user?.unitName || (role === "LPM" ? "Lembaga Penjaminan Mutu" : "PIC Unit");

  return (
    <header className="h-20 bg-white/75 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 shadow-xs">
      {/* Left: Collapse Toggle & Breadcrumb / Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          title="Toggle Sidebar"
          className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {pageTitle}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Quick Action, Notifications, User */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari IKU 1-12 atau indikator..." 
            className="w-64 pl-10 pr-4 py-2 bg-slate-100/70 border border-slate-200/80 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
          />
        </div>

        {/* Quick Action Button for Submissions */}
        <Link 
          href="/dashboard/achievements" 
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-xl text-xs font-semibold shadow-sm shadow-sky-600/20 hover:from-sky-700 hover:to-cyan-700 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Input Capaian</span>
        </Link>

        {/* Notification Bell */}
        <button 
          title="Notifikasi sistem"
          className="relative p-2.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50/80 rounded-xl transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="w-px h-7 bg-slate-200 hidden sm:block"></div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-sky-600/30">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden md:flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
              {session?.user?.name || "Memuat..."}
            </span>
            <span className="text-[11px] text-sky-700 font-medium truncate max-w-[140px]">
              {unit}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
