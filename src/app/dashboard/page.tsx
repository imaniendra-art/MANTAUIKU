"use client";

import { useSession } from "next-auth/react";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Building, 
  Users, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);

  const userRole = session?.user?.role;
  const assignedIKUs = session?.user?.assignedIKUCodes || [];

  const stats = [
    { 
      title: "Total Indikator", 
      value: "12 IKU", 
      icon: Target, 
      color: "text-sky-600", 
      bg: "bg-sky-50",
      border: "border-sky-100",
      desc: "Standar Kemendikbudristek"
    },
    { 
      title: "Telah Dilaporkan", 
      value: "8 Capaian", 
      icon: FileText, 
      color: "text-cyan-600", 
      bg: "bg-cyan-50",
      border: "border-cyan-100",
      desc: "Triwulan I 2026"
    },
    { 
      title: "Menunggu Validasi", 
      value: "3 Pengajuan", 
      icon: Clock, 
      color: "text-amber-600", 
      bg: "bg-amber-50",
      border: "border-amber-100",
      desc: "Oleh Tim LPM"
    },
    { 
      title: "Tervalidasi & Sesuai", 
      value: "5 IKU", 
      icon: CheckCircle, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      desc: "Status Target Tercapai"
    },
  ];

  const clusters = [
    {
      id: "talenta",
      title: "Klaster 1: Talenta & Mahasiswa",
      ikurange: "IKU 1, IKU 2, IKU 3",
      pic: "WK III (Kemahasiswaan & Alumni)",
      icon: Users,
      progress: 78,
      status: "On Track",
      items: [
        "AEE Perguruan Tinggi",
        "Lulusan Bekerja & Berwirausaha",
        "Prestasi & MBKM Luar Kampus"
      ]
    },
    {
      id: "inovasi",
      title: "Klaster 2: Inovasi & Riset",
      ikurange: "IKU 4, IKU 5, IKU 6",
      pic: "WK I & WK II (Kerjasama)",
      icon: BookOpen,
      progress: 64,
      status: "Perlu Bukti",
      items: [
        "Dosen Rekognisi Internasional",
        "Hilirisasi & Kerjasama Industri",
        "Publikasi Bereputasi SINTA/Scopus"
      ]
    },
    {
      id: "tatakelola",
      title: "Klaster 3: Tata Kelola & Finansial",
      ikurange: "IKU 7 - IKU 12",
      pic: "Tim Tata Pamong & Keuangan",
      icon: Building,
      progress: 85,
      status: "Sesuai Target",
      items: [
        "SDGs & Partisipasi Kebijakan",
        "Income Generating Non-UKT",
        "Zona Integritas & SAKIP"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Command Section (Inspired by Dashboard UNJA) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-900 text-white p-8 md:p-10 shadow-xl shadow-sky-950/10 border border-sky-700/30"
      >
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Sistem Monitoring Kinerja Terpadu • STIMI YAPMI Makassar</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Dashboard Indikator Kinerja Utama
            </h1>

            <p className="text-sky-100/80 text-sm md:text-base leading-relaxed">
              Selamat datang, <span className="font-semibold text-cyan-300">{session?.user?.name}</span>!
              {userRole === "UNIT_KERJA" && assignedIKUs.length > 0 ? (
                <> Anda bertindak sebagai penanggung jawab untuk <span className="font-semibold text-white underline decoration-cyan-400">{assignedIKUs.join(", ")}</span>.</>
              ) : (
                <> Pantau pencapaian 12 IKU institusi, verifikasi dokumen capaian, dan evaluasi target tahunan secara akurat.</>
              )}
            </p>
          </div>

          {/* Quick Action Grid */}
          <div className="w-full lg:w-auto flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <Link 
              href="/dashboard/achievements"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              <TrendingUp className="w-4 h-4 text-slate-900" />
              <span>Input Capaian</span>
            </Link>

            <Link 
              href="/dashboard/reports"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all"
            >
              <FileText className="w-4 h-4 text-sky-300" />
              <span>Rekap Laporan</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`bg-white p-6 rounded-2xl border ${stat.border} shadow-xs hover:shadow-md transition-all flex items-start justify-between`}
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                  {stat.title}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stat.value}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {stat.desc}
                </p>
              </div>

              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Section: 3 IKU Clusters Overview */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Capaian Kinerja per Klaster IKU (Tahun 2026)
            </h2>
            <p className="text-xs text-slate-500">
              Pengelompokan 12 indikator kinerja berdasarkan bidang tanggung jawab unit kerja
            </p>
          </div>

          {/* Quarter Filter */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {[1, 2, 3, 4].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedQuarter === q 
                    ? "bg-white text-sky-700 shadow-xs" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Triwulan {q}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clusters.map((cluster, idx) => {
            const Icon = cluster.icon;
            return (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-100">
                      {cluster.ikurange}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {cluster.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      PIC: {cluster.pic}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500">Rata-rata Capaian</span>
                      <span className="text-sky-700 font-bold">{cluster.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-sky-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${cluster.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {cluster.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <Link 
                    href="/dashboard/achievements" 
                    className="inline-flex items-center justify-between w-full text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
                  >
                    <span>Detail Indikator Klaster</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress Chart & Verification Queue Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Grafik Capaian Target vs Realisasi (2026)
              </h3>
              <p className="text-xs text-slate-400">
                Perbandingan target baseline dan realisasi capaian yang divalidasi
              </p>
            </div>
            
            <span className="text-xs font-semibold px-3 py-1 bg-sky-50 text-sky-700 rounded-lg border border-sky-100">
              Triwulan {selectedQuarter}
            </span>
          </div>

          {/* Visual Simulation Bars */}
          <div className="h-64 flex flex-col justify-end p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 h-44 items-end px-2">
              {[85, 92, 70, 60, 95, 80, 75, 88, 65, 78, 90, 82].map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="relative w-full flex justify-center">
                    <span className="absolute -top-6 text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 rounded shadow-xs">
                      {val}%
                    </span>
                    <div 
                      className="w-full max-w-[20px] rounded-t-lg bg-gradient-to-t from-sky-600 to-cyan-400 group-hover:from-sky-500 group-hover:to-cyan-300 transition-all shadow-sm"
                      style={{ height: `${val}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">
                    I{i + 1}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-sky-600 to-cyan-400"></span>
                <span>Tingkat Ketercapaian IKU 1 s/d 12</span>
              </span>
              <span className="font-semibold text-slate-600">Rata-rata: 79.9%</span>
            </div>
          </div>
        </motion.div>

        {/* Verification Status & Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-slate-900">
                Aktivitas & Validasi
              </h3>
              <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                Terbaru
              </span>
            </div>

            <div className="space-y-4">
              {[
                { 
                  iku: "IKU 3", 
                  title: "Laporan Prestasi Mahasiswa Nasional", 
                  unit: "WK III Kemahasiswaan", 
                  status: "Menunggu",
                  time: "10 menit lalu",
                  badge: "bg-amber-50 text-amber-700 border-amber-200"
                },
                { 
                  iku: "IKU 5", 
                  title: "Kerjasama Magang Industri & BUMN", 
                  unit: "WK II Kerjasama", 
                  status: "Tervalidasi",
                  time: "1 jam lalu",
                  badge: "bg-emerald-50 text-emerald-700 border-emerald-200"
                },
                { 
                  iku: "IKU 6", 
                  title: "Submit 4 Artikel Jurnal SINTA 2", 
                  unit: "WK I Akademik/LPPM", 
                  status: "Tervalidasi",
                  time: "3 jam lalu",
                  badge: "bg-emerald-50 text-emerald-700 border-emerald-200"
                },
              ].map((act, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-sky-700">
                      {act.iku} • {act.unit}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${act.badge}`}>
                      {act.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {act.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link 
              href="/dashboard/achievements" 
              className="text-xs font-bold text-center block text-sky-600 hover:text-sky-700"
            >
              Lihat Seluruh Antrean Validasi →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
