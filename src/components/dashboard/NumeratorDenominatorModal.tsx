"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Calculator, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Info,
  TrendingUp,
  Award
} from "lucide-react";
import { useState } from "react";

export interface AuditDetails {
  code: string;
  name: string;
  cluster: string;
  unit: string;
  quarterName?: string;
  quarter?: number;
  year?: number;
  target?: number;
  realization?: number;
  numerator?: number | null;
  denominator?: number | null;
  formula?: string;
  numeratorLabel?: string;
  denominatorLabel?: string;
  calculationMethod?: string;
  status?: string;
  documentUrl?: string;
  submittedBy?: {
    name?: string;
    unitName?: string;
  };
  updatedAt?: string;
}

interface NumeratorDenominatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AuditDetails | null;
}

export default function NumeratorDenominatorModal({
  isOpen,
  onClose,
  data,
}: NumeratorDenominatorModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const numVal = data.numerator !== undefined && data.numerator !== null ? data.numerator : null;
  const denVal = data.denominator !== undefined && data.denominator !== null ? data.denominator : null;
  const realVal = data.realization ?? 0;
  const targetVal = data.target ?? 0;

  // Percentage calculation
  let achievementPct = 0;
  if (targetVal > 0) {
    achievementPct = Math.round((realVal / targetVal) * 100);
  } else if (realVal > 0) {
    achievementPct = 100;
  }

  const isAchieved = realVal >= targetVal;

  const handleCopySummary = () => {
    const text = `[AUDIT IKU MUTUSTIMI - STIMI YAPMI MAKASSAR]
Indikator: ${data.code} - ${data.name}
Periode: TW ${data.quarter || 1} Tahun ${data.year || 2026}
Rumus: ${data.formula || "(Pembilang / Penyebut) x 100%"}
Pembilang (${data.numeratorLabel || "Numerator"}): ${numVal ?? "-"}
Penyebut (${data.denominatorLabel || "Denominator"}): ${denVal ?? "-"}
Realisasi Capaian: ${realVal} ${data.unit}
Target Tahunan: ${targetVal} ${data.unit}
Ketercapaian: ${achievementPct}% (${isAchieved ? "Memenuhi Target" : "Belum Memenuhi Target"})
Status Verifikasi LPM: ${data.status || "Draf"}
Tautan Bukti Dukung: ${data.documentUrl || "-"}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-sky-600 via-sky-700 to-cyan-600 text-white flex items-start justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-1.5 relative z-10 pr-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 border border-white/20 text-white font-extrabold text-[11px] uppercase tracking-wider">
                  {data.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 text-[11px] font-semibold border border-cyan-400/30">
                  {data.cluster}
                </span>
                {data.quarter && (
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-900/40 text-sky-100 text-[11px] font-medium">
                    TW {data.quarter} • Tahun {data.year || 2026}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                {data.name}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer relative z-10 shrink-0"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* 1. Formula Box (Standar Audit Mutu) */}
            <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-xs uppercase tracking-wide">
                <Calculator className="w-4 h-4 text-sky-600" />
                <span>Formula Matematis Perhitungan Audit Mutu</span>
              </div>
              <p className="text-sm font-semibold font-mono text-sky-950 bg-white/80 px-3.5 py-2 rounded-xl border border-sky-200/60 shadow-xs">
                {data.formula || "(Pembilang / Penyebut) × 100%"}
              </p>
              <p className="text-[11px] text-sky-700/80 leading-relaxed">
                Diadopsi dari pedoman pengukuran standar IKU Ditjen Diktiristek & instrumen akreditasi LAMEMBA 9 Kriteria.
              </p>
            </div>

            {/* 2. Visual Fraction Card (Numerator / Denominator) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Rincian Pembilang & Penyebut (Data Riil)</span>
                <span className="text-[11px] text-slate-400 font-normal">Satuan: {data.unit}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Fraction Box */}
                <div className="md:col-span-8 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center space-y-2">
                  {/* Numerator (Pembilang) */}
                  <div className="w-full text-center pb-2 border-b-2 border-sky-500 space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase block truncate">
                      {data.numeratorLabel || "Pembilang (Numerator)"}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-sky-600">
                      {numVal !== null ? numVal.toLocaleString("id-ID") : "-"}
                    </span>
                  </div>

                  {/* Denominator (Penyebut) */}
                  <div className="w-full text-center pt-1 space-y-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-800">
                      {denVal !== null ? denVal.toLocaleString("id-ID") : "-"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase block truncate">
                      {data.denominatorLabel || "Penyebut (Denominator)"}
                    </span>
                  </div>
                </div>

                {/* Result Box */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 text-center space-y-1">
                  <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wide">
                    Nilai Realisasi
                  </span>
                  <div className="text-3xl font-black text-sky-900">
                    {realVal} <span className="text-sm font-bold text-sky-600">{data.unit}</span>
                  </div>
                  <div className="pt-2 border-t border-sky-200/60 w-full flex items-center justify-between text-xs px-2">
                    <span className="text-slate-500 font-medium">Target:</span>
                    <span className="font-bold text-slate-800">{targetVal} {data.unit}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge Progress */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Ketercapaian Terhadap Target:</span>
                  <span className={`font-black px-2.5 py-0.5 rounded-full ${
                    isAchieved 
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}>
                    {achievementPct}% {isAchieved ? "• Terlampaui" : "• Belum Terpenuhi"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Verifikasi: <strong>{data.status || "Draf"}</strong></span>
                </div>
              </div>
            </div>

            {/* 3. Metrik Akuntabilitas & Rujukan Bukti Dukung */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                  Unit Kerja Penanggung Jawab (PIC)
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {data.submittedBy?.unitName || data.submittedBy?.name || "Unit Terkait STIMI YAPMI"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">
                  Waktu Pembaruan Data
                </span>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{data.updatedAt ? new Date(data.updatedAt).toLocaleString("id-ID") : "Tersinkronisasi"}</span>
                </p>
              </div>
            </div>

            {/* 4. Link Bukti Dukung */}
            {data.documentUrl ? (
              <a
                href={data.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/60 hover:bg-sky-100/60 border border-sky-200 text-sky-900 transition-all text-xs font-bold group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <ExternalLink className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">Tautan Bukti Dukung Resmi (Google Drive / SK / Surat Tugas)</span>
                </div>
                <span className="text-[11px] text-sky-600 font-extrabold group-hover:translate-x-0.5 transition-transform shrink-0">
                  Buka Dokumen &rarr;
                </span>
              </a>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <span>Belum melampirkan tautan bukti dukung formal.</span>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Salin Ringkasan Audit Mutu</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
