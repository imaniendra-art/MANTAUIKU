"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  Target,
  Users,
  Sparkles,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import PPEPPSycle from "@/components/public/PPEPPSycle";
import EarlyWarningSystem from "@/components/public/EarlyWarningSystem";
import PublicIndicatorsShowcase from "@/components/public/PublicIndicatorsShowcase";
import QualityDocumentCenter from "@/components/public/QualityDocumentCenter";
import AmiTransparencyWidget from "@/components/public/AmiTransparencyWidget";
import AccreditationWidget from "@/components/public/AccreditationWidget";
import EvaluationsWidget from "@/components/public/EvaluationsWidget";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-cyan-500 selection:text-white flex flex-col">
      {/* 1. Header / Navbar Publik Resmi */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Kampus Branding */}
          <Link href="/" className="flex items-center gap-3.5 group">
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
                <span className="font-black text-slate-950 text-base tracking-tight">MANTAU IKU</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-sky-100 text-sky-700">PORTAL MUTU</span>
              </div>
              <span className="text-xs font-bold text-sky-700/90 tracking-tight">
                STIMI YAPMI MAKASSAR
              </span>
            </div>
          </Link>

          {/* Navigasi Utama */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-slate-600">
            <Link href="#beranda" className="text-sky-700 hover:text-sky-800 transition-colors">
              Beranda
            </Link>
            <Link href="#akreditasi" className="hover:text-sky-700 transition-colors">
              Akreditasi
            </Link>
            <Link href="#ppepp" className="hover:text-sky-700 transition-colors">
              Siklus PPEPP
            </Link>
            <Link href="#deteksi" className="hover:text-sky-700 transition-colors">
              Deteksi Dini
            </Link>
            <Link href="#ami" className="hover:text-sky-700 transition-colors">
              Audit (AMI)
            </Link>
            <Link href="#survei" className="hover:text-sky-700 transition-colors">
              Survei & Tracer
            </Link>
            <Link href="#iku" className="hover:text-sky-700 transition-colors">
              12 IKU
            </Link>
            <Link href="#dokumen" className="hover:text-sky-700 transition-colors">
              Dokumen Mutu
            </Link>
          </nav>

          {/* Tombol Masuk Internal PIC / LPM */}
          <div className="flex items-center gap-3">
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md shadow-sky-600/25 transition-all hover:scale-[1.02]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Masuk Sistem PIC / LPM</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Keterbukaan Informasi Mutu & IKU */}
      <section id="beranda" className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-sky-400/15 to-cyan-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
                <Link 
                  href="#iku"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-400/25 transition-all hover:scale-[1.02]"
                >
                  <TrendingUp className="w-4 h-4 text-slate-950" />
                  <span>Eksplorasi Capaian 12 IKU</span>
                </Link>

                <Link 
                  href="#ppepp"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-300" />
                  <span>Siklus Mutu PPEPP</span>
                </Link>
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
      <section id="akreditasi" className="py-20 bg-slate-50/80 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
              Legalitas Formal • BAN-PT & LAMEMBA Edisi Terkini
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Status Akreditasi & Pemantauan Tahunan DL-05
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Transparansi status peringkat akreditasi institusi dan program studi, simulasi pemenuhan 9 Kriteria LAMEMBA, serta pelaporan evaluasi berkala tahunan sesuai format resmi Lampiran DL-05 LAMEMBA.
            </p>
          </div>

          <AccreditationWidget />
        </div>
      </section>

      {/* 4. Section Fase 2: Siklus PPEPP SPMI Interaktif */}
      <section id="ppepp" className="py-20 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
              Permendiktisaintek No. 39/2025 jo. No. 10/2026 & SAN Dikti BAN-PT
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Siklus PPEPP Penjaminan Mutu Internal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Klik setiap tahapan di bawah untuk melihat rincian mekanisme penjaminan mutu, penanggung jawab, regulasi kementerian terkait, dan dokumen luaran autentik (*audit-ready*).
            </p>
          </div>

          <PPEPPSycle />
        </div>
      </section>

      {/* 5. Section Fase 2: Early Warning System (Sistem Deteksi Dini Mutu) */}
      <section id="deteksi" className="py-20 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Fitur Eksklusif • Tidak Ada di Dashboard UNJA
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Early Warning System Mutu (RAG Alert)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Sistem lampu lalu lintas otomatis yang mendeteksi indikator berkinerja rendah sebelum kuartal berakhir, memicu Rencana Tindak Lanjut (RTL) pada Rapat Tinjauan Manajemen (RTM).
            </p>
          </div>

          <EarlyWarningSystem />
        </div>
      </section>

      {/* 5. Section Fase 5: Transparansi Audit Mutu Internal (AMI) & KTS/OB */}
      <section id="ami" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
              Audit Mutu Internal (AMI) • Standar LAMEMBA C.9 & SAN Dikti
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Kepatuhan & Pengendalian Temuan Audit (KTS/OB)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Transparansi pelaksanaan visitasi auditor mutu independen terhadap 10 unit organisasi kampus, pemenuhan Formulir Tindak Lanjut (PTK/RTL), dan persentase temuan yang telah diverifikasi tuntas (Closed) menuju Rapat Tinjauan Manajemen.
            </p>
          </div>

          <AmiTransparencyWidget />
        </div>
      </section>

      {/* 6. Section Fase 7: Pusat Survei Mutu (EDO/EKA) & Tracer Study Alumni */}
      <section id="survei" className="py-20 bg-slate-50/70 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EvaluationsWidget />
        </div>
      </section>

      {/* 7. Section Fase 3: Etalase 12 IKU Publik Interaktif */}
      <section id="iku" className="py-20 bg-white border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">
              Transparansi Kinerja 2026 • Terverifikasi LPM
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Etalase 12 Indikator Kinerja Utama
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Pantau realisasi capaian triwulanan terhadap target tahunan 2026 yang telah diverifikasi oleh Lembaga Penjaminan Mutu, lengkap dengan riwayat triwulan dan dokumen bukti dukung publik.
            </p>
          </div>

          <PublicIndicatorsShowcase />
        </div>
      </section>

      {/* 8. Section Fase 4: Dokumen Kebijakan & Standar SPMI */}
      <section id="dokumen" className="py-20 bg-slate-50/60 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              Keterbukaan Informasi Publik & Akuntabilitas SPMI
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Pusat Dokumen Kebijakan & Standar Mutu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Akses instrumen kebijakan SPMI, buku standar IKU, manual PPEPP, dan ringkasan eksekutif laporan Audit Mutu Internal (AMI) sesuai standar Permendiktisaintek No. 39/2025 jo. No. 10/2026 dan LAMEMBA.
            </p>
          </div>

          <QualityDocumentCenter />
        </div>
      </section>

      {/* 9. Footer Resmi Institusi */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Image 
                  src="/logo_stimi.png" 
                  alt="Logo STIMI" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
                <span className="font-black text-white text-base">STIMI YAPMI MAKASSAR</span>
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Lembaga Penjaminan Mutu (LPM) • Sistem Monitoring Indikator Kinerja Utama (MANTAU IKU) berbasis Permendiktisaintek Nomor 39 Tahun 2025 jo. Nomor 10 Tahun 2026.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-300">
              <Link href="#beranda" className="hover:text-white transition-colors">Beranda</Link>
              <Link href="#akreditasi" className="hover:text-white transition-colors">Akreditasi</Link>
              <Link href="#ppepp" className="hover:text-white transition-colors">Siklus PPEPP</Link>
              <Link href="#ami" className="hover:text-white transition-colors">Audit Mutu (AMI)</Link>
              <Link href="#survei" className="hover:text-white transition-colors">Survei & Tracer</Link>
              <Link href="#iku" className="hover:text-white transition-colors">12 IKU</Link>
              <Link href="#dokumen" className="hover:text-white transition-colors">Dokumen Mutu</Link>
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                Portal PIC / LPM →
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <p>© 2026 STIMI YAPMI Makassar. Hak Cipta Dilindungi Undang-Undang.</p>
            <p>Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
