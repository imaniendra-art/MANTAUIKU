"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Bell, Search, Settings } from "lucide-react";

export default function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Simple logic to get page title based on pathname
  let pageTitle = "Dashboard";
  if (pathname.includes("/targets")) pageTitle = "Manajemen Target";
  else if (pathname.includes("/achievements")) pageTitle = "Pelaporan Capaian";
  else if (pathname.includes("/reports")) pageTitle = "Arsip Laporan";
  else if (pathname.includes("/users")) pageTitle = "Anggota Tim Kampus";
  else if (pathname.includes("/profile")) pageTitle = "Profil Institusi";

  return (
    <header className="h-20 bg-white/60 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari IKU..." 
            className="w-64 pl-10 pr-4 py-2 bg-gray-100/50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-8 bg-gray-200"></div>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-gray-800 leading-none mb-1">
              {session?.user?.name || "Loading..."}
            </span>
            <span className="text-xs text-gray-500 leading-none">
              {session?.user?.role === "LPM" ? "Administrator" : session?.user?.unitName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
