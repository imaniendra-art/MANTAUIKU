"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Target, 
  BarChart4, 
  Archive, 
  Users, 
  Building2,
  LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isAdmin = session?.user?.role === "LPM";

  const navItems = [
    { name: "Dashboard Kinerja", href: "/dashboard", icon: LayoutDashboard },
    { name: "Manajemen Target", href: "/dashboard/targets", icon: Target },
    { name: "Pelaporan Capaian", href: "/dashboard/achievements", icon: BarChart4 },
    { name: "Arsip Laporan", href: "/dashboard/reports", icon: Archive },
  ];

  if (isAdmin) {
    navItems.push({ name: "Anggota Tim", href: "/dashboard/users", icon: Users });
    navItems.push({ name: "Profil Institusi", href: "/dashboard/profile", icon: Building2 });
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Branding */}
      <div className="h-20 flex items-center px-6 gap-4 border-b border-gray-200/50">
        <Image 
          src="/logo_stimi.png" 
          alt="STIMI Logo" 
          width={40} 
          height={40} 
          className="drop-shadow-sm"
        />
        <div className="flex flex-col">
          <span className="font-extrabold text-lg text-emerald-900 leading-tight tracking-tight">MANTAU IKU</span>
          <span className="text-xs font-semibold text-emerald-600/80">STIMI YAPMI MAKASSAR</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <div className={`
                relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200
                ${isActive 
                  ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
              `}>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-emerald-100/50 border border-emerald-200/50 rounded-2xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
                <span className={`font-medium ${isActive ? "font-semibold" : ""}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Area & Logout */}
      <div className="p-4 border-t border-gray-200/50 bg-gray-50/50">
        <div className="flex flex-col gap-1 px-4 py-3 mb-2">
          <span className="text-sm font-bold text-gray-900 truncate">{session?.user?.name || "Memuat..."}</span>
          <span className="text-xs font-medium text-emerald-600 truncate">{session?.user?.role === "LPM" ? "Admin (LPM)" : session?.user?.unitName}</span>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
}
