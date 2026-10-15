"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  Target, 
  Users, 
  Sparkles, 
  Lock,
  ArrowRight,
  ArrowUp,
  Menu,
  X,
  FileText,
  Building2,
  CheckCircle2,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PPEPPSycle from "@/components/public/PPEPPSycle";
import EarlyWarningSystem from "@/components/public/EarlyWarningSystem";
import PublicIndicatorsShowcase from "@/components/public/PublicIndicatorsShowcase";
import QualityDocumentCenter from "@/components/public/QualityDocumentCenter";
import AmiTransparencyWidget from "@/components/public/AmiTransparencyWidget";
import AccreditationWidget from "@/components/public/AccreditationWidget";
import EvaluationsWidget from "@/components/public/EvaluationsWidget";

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "beranda", label: "Beranda" },
  { id: "akreditasi", label: "Akreditasi" },
  { id: "ppepp", label: "Siklus PPEPP" },
  { id: "iku", label: "12 IKU" },
  { id: "deteksi", label: "Deteksi Dini" },
  { id: "ami", label: "Audit (AMI)" },
  { id: "survei", label: "Survei & Tracer" },
  { id: "dokumen", label: "Dokumen Mutu" },
];

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<string>("beranda");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  // Throttled Scroll Spy via requestAnimationFrame untuk animasi yang bebas jitter / patah-patah
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setShowBackToTop(scrollY > 400);

          const headerOffset = 140;
          if (scrollY < 120) {
            setActiveSection((prev) => (prev !== "beranda" ? "beranda" : prev));
            ticking = false;
            return;
          }

          // Identifikasi section aktif saat ini dari urutan bawah ke atas
          for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
            const item = NAV_ITEMS[i];
            const el = document.getElementById(item.id);
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
              if (scrollY >= top) {
                setActiveSection((prev) => (prev !== item.id ? item.id : prev));
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll handler dengan kompensasi tinggi navbar fixed
  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActiveSection(id);
    setIsMobileMenuOpen(false);

    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 84;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-cyan-500 selection:text-white flex flex-col font-sans">
      {/* 1. Header / Navbar Publik Resmi (Lebar Terbuka & Proporsional) */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Kampus Branding */}
          <Link 
            href="#beranda" 
            onClick={(e) => scrollToSection(e, "beranda")} 
            className="flex items-center gap-3.5 group shrink-0"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-0.5 shadow-md shadow-sky-500/20 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image 
                src="/logo_stimi.png" 
                alt="Logo STIMI YAPMI" 
                width={36} 
                height={36} 
                className="drop-shadow-sm object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-950 text-base tracking-tight group-hover:text-sky-700 transition-colors">
                  MANTAU IKU
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs">
                  PORTAL MUTU
                </span>
              </div>
              <span className="text-xs font-bold text-sky-700/90 tracking-tight">
                STIMI YAPMI MAKASSAR
              </span>
            </div>
          </Link>

          {/* Navigasi Utama Desktop (Animasi Meluncur Sangat Halus Tanpa Layout Shift) */}
          <nav className="hidden lg:flex items-center p-1 rounded-full bg-slate-100/90 border border-slate-200/80 backdrop-blur-md shadow-inner">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`relative px-3.5 xl:px-4 py-2 rounded-full text-xs transition-colors duration-150 cursor-pointer select-none whitespace-nowrap ${
                    isActive 
                      ? "text-sky-900 font-bold" 
                      : "text-slate-600 hover:text-sky-700 hover:bg-white/50 font-medium"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavBadge"
                      className="absolute inset-0 rounded-full bg-white shadow-xs border border-sky-300/80 -z-10"
                      transition={{ 
                        type: "spring", 
                        stiffness: 350, 
                        damping: 30, 
                        mass: 0.7 
                      }}
                    />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sisi Kanan: Tombol Masuk PIC & Mobile Hamburger */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link 
              href="/login"
              className="group inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md shadow-sky-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] ring-2 ring-sky-500/20"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-200 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Masuk Sistem PIC / LPM</span>
              <span className="sm:hidden">Masuk</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              aria-label="Toggle menu navigasi"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-sky-700" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-1.5 shadow-xl"
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Menu Portal Mutu Institusi
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => scrollToSection(e, item.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                        isActive 
                          ? "bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs" 
                          : "text-slate-600 hover:text-sky-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isActive && <span className="w-2 h-2 rounded-full bg-sky-600" />}
                        {item.label}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-sky-600" : "text-slate-300"}`} />
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-sm hover:bg-sky-700 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Akses Dashboard Pengelola LPM & PIC Unit</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Section: Keterbukaan Informasi Mutu & IKU */}
      <section id="beranda" className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-sky-400/15 to-cyan-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main Hero Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-sky-950 via-sky-900 to-cyan-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-sky-700/30"
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              {/* Regulatory Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-cyan-200 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Permendiktisaintek No. 39/2025 jo. No. 10/2026 & SAN Dikti BAN-PT 2025</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Sistem Penjaminan Mutu & Keterbukaan Kinerja Institusi
              </h1>

              {/* Description */}
              <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed">
                Portal resmi pemantauan <span className="text-cyan-300 font-bold">12 Indikator Kinerja Utama (IKU)</span> dan akuntabilitas Sistem Penjaminan Mutu Internal (SPMI) STIMI YAPMI Makassar berbasis luaran nyata, relevansi kurikulum manajemen, dan kesiapan akreditasi LAMEMBA.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a 
                  href="#iku"
                  onClick={(e) => scrollToSection(e, "iku")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-400/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <TrendingUp className="w-4 h-4 text-slate-950" />
                  <span>Eksplorasi Capaian 12 IKU</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                </a>

                <a 
                  href="#ppepp"
                  onClick={(e) => scrollToSection(e, "ppepp")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-300" />
                  <span>Siklus Mutu PPEPP</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* 3. Makro Metrik Kinerja Kampus (UNJA-PLUS Insight) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                Total Indikator Terpantau
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                12 IKU
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Standar Nasional Dikti & LAMEMBA
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                Klaster Penjaminan Mutu
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                4 Klaster
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Talenta, Inovasi, Riset, Tata Kelola
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                Siklus SPMI Aktif
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                PPEPP 2026
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Audit Mutu Internal Terjadwal
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                Akreditasi & Sertifikasi
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                BAN-PT / LAMEMBA
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Akuntabilitas Terverifikasi
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Section Fase 6: Status Akreditasi BAN-PT & LAMEMBA S1 Manajemen */}
      <section id="akreditasi" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-2xs">
                Legalitas Formal • BAN-PT & 9 Kriteria LAMEMBA
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Status Akreditasi & Pemantauan Tahunan DL-05
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Transparansi status peringkat akreditasi institusi dan program studi, simulasi pemenuhan 9 Kriteria LAMEMBA, serta pelaporan evaluasi berkala tahunan sesuai format resmi Lampiran DL-05 LAMEMBA.
            </p>
          </div>

          <AccreditationWidget />
        </div>
      </section>

      {/* 4. Section Fase 2: Siklus PPEPP SPMI Interaktif (Jarak Rapi & Badge Fokus) */}
      <section id="ppepp" className="py-20 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200/90 shadow-2xs">
                Sistem Penjaminan Mutu Internal (SPMI) • Standar Nasional Dikti
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Siklus PPEPP Penjaminan Mutu Internal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Klik setiap tahapan di bawah untuk melihat rincian mekanisme penjaminan mutu, penanggung jawab, regulasi kementerian terkait, dan dokumen luaran autentik (*audit-ready*).
            </p>
          </div>

          <PPEPPSycle />
        </div>
      </section>

      {/* 5. Section Fase 3: Etalase 12 IKU Publik Interaktif (Diposisikan Tepat Pasca PPEPP) */}
      <section id="iku" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-2xs">
                Transparansi Kinerja 2026 • Terverifikasi LPM
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Etalase 12 Indikator Kinerja Utama
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Pantau realisasi capaian triwulanan terhadap target tahunan 2026 yang telah diverifikasi oleh Lembaga Penjaminan Mutu, lengkap dengan drill-down numerator/denominator, riwayat triwulan, dan dokumen bukti dukung publik.
            </p>
          </div>

          <PublicIndicatorsShowcase />
        </div>
      </section>

      {/* 6. Section Fase 2: Early Warning System (Sistem Deteksi Dini Mutu) */}
      <section id="deteksi" className="py-20 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                Mitigasi Risiko Mutu • Sistem Lampu Lalu Lintas (RAG Alert)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Early Warning System Mutu (RAG Alert)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Sistem lampu lalu lintas otomatis yang mendeteksi indikator berkinerja rendah sebelum kuartal berakhir, memicu Rencana Tindak Lanjut (RTL) pada Rapat Tinjauan Manajemen (RTM).
            </p>
          </div>

          <EarlyWarningSystem />
        </div>
      </section>

      {/* 7. Section Fase 5: Transparansi Audit Mutu Internal (AMI) & KTS/OB */}
      <section id="ami" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs">
                Audit Mutu Internal (AMI) • Standar LAMEMBA C.9 & SAN Dikti
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Kepatuhan & Pengendalian Temuan Audit (KTS/OB)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Transparansi pelaksanaan visitasi auditor mutu independen terhadap 10 unit organisasi kampus, pemenuhan Formulir Tindak Lanjut (PTK/RTL), dan persentase temuan yang telah diverifikasi tuntas (Closed) menuju Rapat Tinjauan Manajemen.
            </p>
          </div>

          <AmiTransparencyWidget />
        </div>
      </section>

      {/* 8. Section Fase 7: Pusat Survei Mutu (EDO/EKA) & Tracer Study Alumni */}
      <section id="survei" className="py-20 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <EvaluationsWidget />
        </div>
      </section>

      {/* 9. Section Fase 4: Dokumen Kebijakan & Standar SPMI */}
      <section id="dokumen" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                Keterbukaan Informasi Publik & Tata Kelola SPMI
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Pusat Dokumen Kebijakan & Standar Mutu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Akses instrumen kebijakan SPMI, buku standar IKU, manual PPEPP, dan ringkasan eksekutif laporan Audit Mutu Internal (AMI) sesuai standar Permendiktisaintek No. 39/2025 jo. No. 10/2026 dan LAMEMBA.
            </p>
          </div>

          <QualityDocumentCenter />
        </div>
      </section>

      {/* 10. Footer Resmi Institusi */}
      <footer className="mt-auto bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* 4 Kolom Navigasi & Informasi Institusi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Kolom 1: Profil Kampus & LPM */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 p-0.5 shadow-md flex items-center justify-center">
                  <Image 
                    src="/logo_stimi.png" 
                    alt="Logo STIMI" 
                    width={32} 
                    height={32} 
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">STIMI YAPMI MAKASSAR</h4>
                  <span className="text-[10px] font-bold text-sky-400">Lembaga Penjaminan Mutu (LPM)</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sistem Monitoring Indikator Kinerja Utama (MANTAU IKU) mewujudkan tata kelola perguruan tinggi transparan, akuntabel, dan berorientasi pada mutu luaran berkelanjutan.
              </p>
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-950/80 border border-sky-800/60 text-cyan-300 text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sistem SPMI Real-time • Tahun 2026</span>
                </div>
              </div>
            </div>

            {/* Kolom 2: Navigasi Portal Publik (Tersinkronisasi) */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-sky-500 rounded-full" />
                Navigasi Halaman
              </h5>
              <ul className="space-y-2 text-xs">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={(e) => scrollToSection(e, item.id)}
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group cursor-pointer text-left"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kolom 3: Layanan Penjaminan Mutu & Akses */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-cyan-500 rounded-full" />
                Layanan & Dokumen
              </h5>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <Link 
                    href="/login"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-2 group"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Portal Pengelola PIC / LPM →</span>
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={(e) => scrollToSection(e, "survei")}
                    className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer text-left"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tracer Study & Survei Pengguna</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => scrollToSection(e, "dokumen")}
                    className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Unduh Instrumen & Standar SPMI</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => scrollToSection(e, "akreditasi")}
                    className="hover:text-white transition-colors flex items-center gap-2 cursor-pointer text-left"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Formulir Tahunan DL-05 LAMEMBA</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Kolom 4: Kontak & Lokasi Institusi */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full" />
                Kontak & Alamat Kampus
              </h5>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Jl. Perintis Kemerdekaan KM. 9, Tamalanrea Indah, Kec. Tamalanrea, Kota Makassar, Sulawesi Selatan 90245
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>lpm@stimiyapmi.ac.id</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>(0411) 585489 / Hotline LPM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Back to Top */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© 2026 Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
            <button
              onClick={(e) => scrollToSection(e, "beranda")}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 font-semibold transition-colors group cursor-pointer"
            >
              <span>Kembali ke Atas</span>
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={(e) => scrollToSection(e, "beranda")}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white shadow-xl shadow-sky-600/30 border border-sky-400/30 transition-all hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group"
            title="Kembali ke Bagian Atas"
            aria-label="Kembali ke Bagian Atas"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
