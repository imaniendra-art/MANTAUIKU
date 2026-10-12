"use client";

import { useState, useEffect } from "react";
import { 
  Award, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  FileCheck2, 
  Building2 
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileItem {
  id: string;
  entityType: "INSTITUSI" | "PRODI";
  name: string;
  degreeLevel?: string;
  agency: "BAN-PT" | "LAMEMBA";
  grade: string;
  skNumber: string;
  validUntil: string;
  daysRemaining: number;
  monthsRemaining: number;
  certificateUrl?: string;
  notes?: string;
}

interface CriteriaItem {
  code: string;
  name: string;
  score: number;
  status: string;
  weight: number;
}

interface PublicAccreditationData {
  profiles: ProfileItem[];
  overallScore: number;
  criteriaCount: number;
  criteriaList: CriteriaItem[];
  dl05Summary?: {
    academicYear: string;
    cplAchievement: number;
    resolvedRecommendationsCount: number;
    totalRecommendationsCount: number;
    status: string;
  } | null;
}

export default function AccreditationWidget() {
  const [data, setData] = useState<PublicAccreditationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/public/accreditation");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load public accreditation data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* 1. Dua Kartu Akreditasi Resmi (Institusi & Program Studi) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.profiles?.map((p, idx) => {
          const isProdi = p.entityType === "PRODI";

          return (
            <motion.div
              key={p.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-6 relative overflow-hidden group"
            >
              {/* Glow Accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-sky-400/10 to-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                  {isProdi ? "Akreditasi Program Studi" : "Akreditasi Institusi"}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Peringkat: {p.grade.replace("_", " ")}</span>
                </span>
              </div>

              {/* Title & Agency */}
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {p.name}
                </h4>
                <p className="text-xs font-bold text-sky-700">
                  Lembaga Akreditasi: <strong>{p.agency}</strong> ({p.degreeLevel || "S1"})
                </p>
              </div>

              {/* Legal & Countdown Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Nomor SK:</span>
                  <span className="font-extrabold text-slate-900">{p.skNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Masa Berlaku Hingga:</span>
                  <strong className="text-slate-900 font-bold">
                    {new Date(p.validUntil).toLocaleDateString("id-ID", { dateStyle: "long" })}
                  </strong>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    <span>Sisa Masa Berlaku:</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                    {p.daysRemaining} Hari ({p.monthsRemaining} Bulan)
                  </span>
                </div>
              </div>

              {/* Certificate Download Link */}
              {p.certificateUrl && (
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Verifikasi Dokumen:</span>
                  <a
                    href={p.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-bold hover:underline"
                  >
                    <span>Sertifikat Resmi PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 2. Banner Simulasi 9 Kriteria LAMEMBA & Pemantauan DL-05 */}
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-cyan-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-sky-800/40 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Standar LAMEMBA & SAN Dikti Terkini</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white">
              Kesiapan Reakreditasi & Pemantauan Tahunan Wajib DL-05
            </h4>
            <p className="text-xs text-sky-200/80 leading-relaxed">
              Program Studi S1 Manajemen memenuhi 9 Kriteria Akreditasi LAMEMBA dan secara berkala menyampaikan Dokumen Pemantauan dan Evaluasi Pasca-Akreditasi melalui <strong>Lampiran DL-05 LAMEMBA</strong>.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[140px]">
              <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-wide block">
                Skor 9 Kriteria
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {data?.overallScore || 85.1}
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold block">
                Threshold UNGGUL
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[140px]">
              <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-wide block">
                Jaminan Belajar (AoL)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {data?.dl05Summary?.cplAchievement || 88}%
              </div>
              <span className="text-[10px] text-cyan-300 font-semibold block">
                Ketercapaian CPL OBE
              </span>
            </div>
          </div>
        </div>

        {/* 9 Criteria Pills Bar */}
        <div className="pt-4 border-t border-white/10">
          <span className="text-xs font-bold text-slate-300 block mb-3">
            Pemenuhan 9 Kriteria Akreditasi LAMEMBA (S1 Manajemen):
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {data?.criteriaList?.map((c) => (
              <div
                key={c.code}
                className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/10 text-center transition-all space-y-1"
              >
                <span className="text-[10px] font-black text-cyan-300 block">
                  {c.code}
                </span>
                <span className="text-xs font-black text-white block">
                  {c.score}
                </span>
                <span className="text-[9px] text-slate-400 font-medium block truncate">
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
