"use client";

import { useState, useEffect } from "react";
import { 
  Building, 
  FileCheck
} from "lucide-react";
import { motion } from "framer-motion";

interface AmiPublicData {
  periodTitle: string;
  academicYear: string;
  cycleNumber: number;
  totalAuditedStandards: number;
  totalFindings: number;
  closedFindings: number;
  closingRate: number;
  categories: {
    mayor: number;
    minor: number;
    ob: number;
  };
  auditedUnitsCount: number;
  rtmDate?: string;
}

const AUDITEES_PREVIEW = [
  { name: "Program Studi Manajemen", code: "PRODI", status: "In Progress", type: "Akademik" },
  { name: "UPT. LPPM", code: "LPPM", status: "Tuntas", type: "Riset & PkM" },
  { name: "UPT. BAAK", code: "BAAK", status: "Audit Selesai", type: "Layanan Mhs" },
  { name: "UPT. Pusdatin", code: "PUSDATIN", status: "In Progress", type: "PDDIKTI" },
  { name: "UPT. Perpustakaan", code: "PERPUS", status: "Verifikasi", type: "Sumber Belajar" },
  { name: "UPT. Lab. Komputer", code: "LAB", status: "Tindak Lanjut", type: "Praktikum" },
  { name: "UPT. Keuangan Rutin", code: "KEU", status: "Tuntas", type: "Finansial" },
  { name: "UPT. Umum & Kerjasama", code: "KERJASAMA", status: "In Progress", type: "Kemitraan" },
  { name: "UPT. Kemahasiswaan & Alumni", code: "KEMHS", status: "Tindak Lanjut", type: "Alumni" },
  { name: "UPT. Humas", code: "HUMAS", status: "Tuntas", type: "Informasi Publik" },
];

export default function AmiTransparencyWidget() {
  const [data, setData] = useState<AmiPublicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/public/ami");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load public AMI data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400">
        <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold">Memuat transparansi AMI...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Card: Status Siklus & Ringkasan */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-cyan-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-sky-800/40 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-300/30 text-cyan-200 text-xs font-semibold backdrop-blur-md">
                <FileCheck className="w-3.5 h-3.5 text-cyan-300" />
                <span>Transparansi SPMI • Tahap Evaluasi & Pengendalian</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {data?.periodTitle || "Audit Mutu Internal (AMI) STIMI YAPMI"}
              </h3>
              <p className="text-xs text-sky-200/80 max-w-xl leading-relaxed">
                Pelaksanaan audit kepatuhan terhadap 9 Kriteria LAMEMBA dan Permendiktisaintek No. 39/2025 jo. No. 10/2026 pada seluruh Program Studi dan Unit Pelaksana Teknis (UPT).
              </p>
            </div>

            {/* Closing Rate Highlight */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-center min-w-[160px] space-y-1">
              <span className="text-[11px] font-bold text-cyan-200 uppercase tracking-wider block">
                Closing Rate AMI
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {data?.closingRate || 0}%
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold block">
                Temuan Tertindaklanjuti
              </span>
            </div>
          </div>

          {/* 4 Quick Stat Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
              <span className="text-[11px] text-slate-300 font-medium">Standar Diaudit:</span>
              <div className="text-lg font-black text-white">
                {data?.totalAuditedStandards || 28} Butir
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
              <span className="text-[11px] text-red-300 font-medium">KTS Mayor:</span>
              <div className="text-lg font-black text-red-400">
                {data?.categories?.mayor || 0} Temuan
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
              <span className="text-[11px] text-amber-300 font-medium">KTS Minor:</span>
              <div className="text-lg font-black text-amber-400">
                {data?.categories?.minor || 0} Temuan
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-1">
              <span className="text-[11px] text-sky-300 font-medium">Observasi (OB):</span>
              <div className="text-lg font-black text-sky-300">
                {data?.categories?.ob || 0} Peluang
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 10 Auditee Unit Monitoring */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-0.5">
            <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-600" />
              <span>Status Kepatuhan Audit 10 Unit Organisasi STIMI YAPMI</span>
            </h4>
            <p className="text-xs text-slate-500">
              Hasil visitasi auditor independen LPM terhadap unit akademik dan unit pendukung layanan kampus
            </p>
          </div>
          <span className="hidden sm:inline-flex text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            100% Unit Diaudit
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {AUDITEES_PREVIEW.map((unit, idx) => {
            const isTuntas = unit.status === "Tuntas";
            const isVerif = unit.status === "Verifikasi";

            return (
              <motion.div
                key={unit.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-600">
                    {unit.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isTuntas
                        ? "bg-emerald-100 text-emerald-700"
                        : isVerif
                        ? "bg-sky-100 text-sky-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                <div>
                  <h5 className="text-xs font-black text-slate-900 line-clamp-1">
                    {unit.name}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Fokus: {unit.type}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
