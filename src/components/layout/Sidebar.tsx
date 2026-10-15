"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  Archive, 
  Users, 
  Building2, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  Award,
  GraduationCap,
  Sparkles,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./SidebarContext";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  description: string;
}

interface NavGroup {
  category: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  const userRole = session?.user?.role;
  const isAdmin = userRole === "LPM";

  // Urutan menu terstruktur selaras dengan alur Penjaminan Mutu & Tampilan Publik
  const navGroups: NavGroup[] = [
    {
      category: "IKHTISAR UTAMA",
      items: [
        { 
          name: "Dashboard Kinerja", 
          href: "/dashboard", 
          icon: LayoutDashboard,
          description: "Ringkasan capaian & skor makro IKU"
        },
      ]
    },
    {
      category: "LEGALITAS & SPMI",
      items: [
        { 
          name: "Akreditasi & DL-05", 
          href: "/dashboard/accreditation", 
          icon: Award,
          description: "Legalitas BAN-PT, LAMEMBA & DL-05"
        },
        { 
          name: "Dokumen & Standar SPMI", 
          href: "/dashboard/spmi", 
          icon: BookOpen,
          description: "Pusat 4 Buku SPMI & Siklus PPEPP"
        },
        { 
          name: "Audit Mutu (AMI)", 
          href: "/dashboard/ami", 
          icon: ShieldCheck,
          description: "Siklus AMI & Temuan KTS/OB 10 Unit"
        },
      ]
    },
    {
      category: "12 IKU INSTITUSI",
      items: [
        { 
          name: "Pelaporan Capaian", 
          href: "/dashboard/achievements", 
          icon: TrendingUp,
          description: "Input realisasi TW 1-4 & bukti dukung"
        },
        { 
          name: "Manajemen Target", 
          href: "/dashboard/targets", 
          icon: Target,
          description: "Penetapan target tahunan 2026 LPM"
        },
      ]
    },
    {
      category: "UMPAN BALIK SIVITAS",
      items: [
        { 
          name: "Evaluasi & Tracer", 
          href: "/dashboard/evaluations", 
          icon: GraduationCap,
          description: "EDO, EKA & Tracer CDC (Auto-Supply IKU 2)"
        },
      ]
    },
    {
      category: "AKREDITASI & LAPORAN",
      items: [
        { 
          name: "AI Quality Copilot", 
          href: "/dashboard/copilot", 
          icon: Sparkles,
          description: "Draf Bab LED 9 Kriteria & Konsultasi Mutu"
        },
        { 
          name: "Arsip Laporan", 
          href: "/dashboard/reports", 
          icon: Archive,
          description: "Rekap komparasi, ekspor CSV & PDF kop resmi"
        },
      ]
    },
  ];

  if (isAdmin) {
    navGroups.push({
      category: "TATA PAMONG (LPM)",
      items: [
        { 
          name: "Pengguna & Unit", 
          href: "/dashboard/users", 
          icon: Users,
          description: "Manajemen akun PIC & reset kata sandi"
        },
        { 
          name: "Profil Institusi", 
          href: "/dashboard/profile", 
          icon: Building2,
          description: "Profil kampus & ubah kata sandi mandiri"
        }
      ]
    });
  }

  // Format unit / role display name
  const getRoleBadge = () => {
    if (userRole === "LPM") return { label: "LPM (Admin)", bg: "bg-sky-100 text-sky-800 border-sky-200" };
    if (userRole === "PIMPINAN") return { label: "Pimpinan", bg: "bg-purple-100 text-purple-800 border-purple-200" };
    return { 
      label: session?.user?.unitCode ? `PIC: ${session.user.unitCode}` : "Unit Kerja", 
      bg: "bg-cyan-100 text-cyan-800 border-cyan-200" 
    };
  };

  const badge = getRoleBadge();

  return (
    <aside 
      className={`fixed inset-y-0 left-0 bg-white/90 backdrop-blur-xl border-r border-slate-200/80 flex flex-col z-30 transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(15,23,42,0.04)] ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Branding Header */}
      <div className={`h-20 flex items-center border-b border-slate-200/70 transition-all ${
        isCollapsed ? "justify-center px-2" : "justify-between px-6"
      }`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20 shrink-0 flex items-center justify-center">
            <Image 
              src="/logo_stimi.png" 
              alt="STIMI Logo" 
              width={34} 
              height={34} 
              className="drop-shadow-sm object-contain"
              priority
            />
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col truncate"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-900 tracking-tight">MANTAU IKU</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700">v2.0</span>
                </div>
                <span className="text-[11px] font-semibold text-sky-700/80 truncate">STIMI YAPMI MAKASSAR</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle Collapse Button (Desktop) */}
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            title="Minimize sidebar"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* When collapsed, small expand button under header */}
      {isCollapsed && (
        <div className="flex justify-center pt-3 pb-1 border-b border-slate-100">
          <button
            onClick={toggleSidebar}
            title="Expand sidebar"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation Links with Group Headers */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto overflow-x-hidden">
        {navGroups.map((group, groupIdx) => (
          <div key={group.category} className="space-y-1">
            {/* Group Label */}
            {!isCollapsed ? (
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3.5 pt-1 pb-1">
                {group.category}
              </div>
            ) : groupIdx > 0 ? (
              <div className="border-t border-slate-200/60 my-2" />
            ) : null}

            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;

                return (
                  <div key={item.href} className="relative group">
                    <Link href={item.href}>
                      <div 
                        className={`
                          relative flex items-center rounded-xl transition-all duration-200 cursor-pointer
                          ${isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5"}
                          ${isActive 
                            ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-600/25 font-semibold" 
                            : "text-slate-600 hover:bg-sky-50/80 hover:text-sky-900"}
                        `}
                      >
                        <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? "text-white" : "text-slate-400 group-hover:text-sky-600"}`} />
                        
                        {!isCollapsed && (
                          <span className="text-xs font-semibold tracking-normal truncate">
                            {item.name}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Floating Tooltip in Collapsed Mode */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap min-w-[150px]">
                        <p className="font-bold text-sky-300">{item.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">{group.category}</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">{item.description}</p>
                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info & Logout Section */}
      <div className={`border-t border-slate-200/70 bg-slate-50/60 transition-all ${
        isCollapsed ? "p-3 flex flex-col items-center" : "p-4"
      }`}>
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-sky-600/20 shrink-0">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col truncate min-w-0">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {session?.user?.name || "Memuat..."}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  {session?.user?.unitName || (isAdmin ? "Lembaga Penjaminan Mutu" : "PIC Unit")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {badge.label}
              </span>

              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Keluar dari sistem"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group flex flex-col items-center gap-2">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Keluar Sistem"
              className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap">
              Keluar ({session?.user?.name || "User"})
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
