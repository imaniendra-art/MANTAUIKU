"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
  Edit3,
  Search,
  X,
  FileCheck2,
  Info,
  GraduationCap,
  Award,
  BookOpen,
  Building2,
  Users,
  Check,
  Save,
  Upload,
  FileUp,
  FileText,
  Download,
  Trash2,
  Target,
  FileSpreadsheet,
  Star,
  CheckSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IAssessorVerificationCheckItem, ISmartEvidenceCriteria } from "@/app/api/accreditation/criteria/route";
import {
  IDl09UnggulSummary,
  IDl09CriterionEnriched,
  IDl09EvaluatedIndicator,
} from "@/lib/accreditation/lamemba-dl09";

export interface ILamembaCriteriaEnriched {
  _id: string;
  code: string;
  name: string;
  weight: number;
  score: number;
  targetScore: number;
  status: "UNGGUL" | "BAIK_SEKALI" | "BAIK" | "PERLU_PERBAIKAN";
  description: string;
  strengths: string[];
  recommendations: string[];
  isSyaratPerluUnggul: boolean;
  isKnockoutItemPassed: boolean;
  smartEvidence?: ISmartEvidenceCriteria;
}

export interface ILamembaSummaryData {
  criteria: ILamembaCriteriaEnriched[];
  finalWeightedScore: number;
  totalWeight: number;
  snDiktiSummary?: {
    totalIndicators: number;
    verifiedIndicators: number;
    percentage: number;
    minThreshold: number;
    isSnDiktiPassed: boolean;
    syaratPerluTotal: number;
    syaratPerluVerified: number;
    isSyaratPerluPassed: boolean;
    isTerakreditasiPassed: boolean;
  };
  summaryBaikSekali: {
    targetMode: "BAIK_SEKALI";
    targetScoreMin: number;
    achievedScore: number;
    isPassed: boolean;
    statusLabel: string;
    description: string;
    skNumber: string;
  };
  summaryUnggul: {
    targetMode: "UNGGUL";
    targetScoreMin: number;
    achievedScore: number;
    isScorePassed: boolean;
    isKnockoutPassed: boolean;
    isPassed: boolean;
    statusLabel: string;
    description: string;
  };
  knockoutReport: {
    allPassed: boolean;
    c4DosenS3: { passed: boolean; label: string; value: string };
    c6ObeCurriculum: { passed: boolean; label: string; value: string };
    c9TracerStudy: { passed: boolean; label: string; value: string };
    spmiProdi: { passed: boolean; label: string; value: string };
  };
  dl09Summary?: IDl09UnggulSummary;
  prodiProfile: {
    name: string;
    degreeLevel: string;
    agency: string;
    currentGrade: string;
    skNumber: string;
    validUntil: string;
  };
}

interface LamembaDashboardWidgetProps {
  data: ILamembaSummaryData;
  isLpm: boolean;
  onRefresh: () => Promise<void>;
  onSwitchTab?: (tab: "profiles" | "iapt41" | "criteria" | "dl05") => void;
}

export default function LamembaDashboardWidget({
  data,
  isLpm,
  onRefresh,
  onSwitchTab,
}: LamembaDashboardWidgetProps) {
  // Dual Mode Target Switcher: 'BAIK_SEKALI' (DL-05) vs 'UNGGUL' (DL-09 IAU)
  const [targetMode, setTargetMode] = useState<"BAIK_SEKALI" | "UNGGUL">("BAIK_SEKALI");
  const [showDownloadCenter, setShowDownloadCenter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecial, setFilterSpecial] = useState<
    "ALL" | "SYARAT_PERLU" | "SYARAT_UNGGUL" | "PERLU_TINDAKAN" | "BUKTI_TERSEDIA" | "ENAM_DIMENSI" | "LIMA_BELAS_DIMENSI" | "SYARAT_DOSEN"
  >("ALL");

  // LPM Edit Modal State
  const [editingItem, setEditingItem] = useState<ILamembaCriteriaEnriched | null>(null);
  const [editScore, setEditScore] = useState<number>(0);
  const [editDescription, setEditDescription] = useState("");
  const [editStrengths, setEditStrengths] = useState("");
  const [editRecommendations, setEditRecommendations] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Evidence Upload Modal State
  const [uploadModalItem, setUploadModalItem] = useState<{
    criterionCode: string;
    criterionName: string;
    itemKey: string;
    itemTitle: string;
    evidenceDocName: string;
    existingFileUrl?: string;
    existingFileName?: string;
  } | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isModeBaikSekali = targetMode === "BAIK_SEKALI";
  const snDikti = data.snDiktiSummary;
  const dl09 = data.dl09Summary;

  // Active Score & Status based on Mode
  const activeScore = isModeBaikSekali ? data.finalWeightedScore : (dl09?.finalWeightedScore ?? data.finalWeightedScore);
  const isTargetPassed = isModeBaikSekali
    ? data.summaryBaikSekali.isPassed
    : (dl09 ? dl09.isUnggulAchieved : data.summaryUnggul.isPassed);

  const activeStatusLabel = isModeBaikSekali
    ? data.summaryBaikSekali.statusLabel
    : (dl09 ? dl09.statusBadge : data.summaryUnggul.statusLabel);

  // Filter 5 Kriteria Baku DL-05 (Mode Baik Sekali)
  const filteredCriteria = data.criteria.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterSpecial === "SYARAT_PERLU") {
      return c.smartEvidence?.assessorVerificationChecklist.some((chk) => chk.isSyaratPerlu);
    }
    if (filterSpecial === "SYARAT_UNGGUL") {
      return c.isSyaratPerluUnggul;
    }
    if (filterSpecial === "PERLU_TINDAKAN") {
      return c.smartEvidence?.digitalEvidenceStatus === "PERLU_TINDAKAN" || c.smartEvidence?.digitalEvidenceStatus === "KOSONG";
    }
    if (filterSpecial === "BUKTI_TERSEDIA") {
      return c.smartEvidence?.digitalEvidenceStatus === "TERSEDIA";
    }

    return true;
  });

  // Filter 7 Kriteria Unggul DL-09 (Mode Unggul)
  const dl09CriteriaList = dl09?.criteria || [];
  const filteredDl09Criteria = dl09CriteriaList.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.code.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      c.dimensions.some((d) => d.toLowerCase().includes(term)) ||
      c.indicators.some((ind) => ind.code.toLowerCase().includes(term) || ind.statement.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (filterSpecial === "ENAM_DIMENSI") {
      return c.indicators.some((ind) => ind.isEnamDimensiKunci);
    }
    if (filterSpecial === "LIMA_BELAS_DIMENSI") {
      return c.indicators.some((ind) => !ind.isEnamDimensiKunci);
    }
    if (filterSpecial === "SYARAT_DOSEN") {
      return c.code === "K.4" || c.code === "K.7";
    }
    if (filterSpecial === "PERLU_TINDAKAN") {
      return c.indicators.some((ind) => !ind.verified);
    }
    if (filterSpecial === "BUKTI_TERSEDIA") {
      return c.indicators.every((ind) => ind.verified);
    }

    return true;
  });

  const openEditModal = (item: ILamembaCriteriaEnriched) => {
    setEditingItem(item);
    setEditScore(item.score);
    setEditDescription(item.description);
    setEditStrengths(item.strengths.join("\n"));
    setEditRecommendations(item.recommendations.join("\n"));
    setFeedbackMsg(null);
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/accreditation/criteria", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem._id,
          score: editScore,
          description: editDescription,
          strengths: editStrengths.split("\n").filter((s) => s.trim() !== ""),
          recommendations: editRecommendations.split("\n").filter((r) => r.trim() !== ""),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedbackMsg("Skor kriteria LAMEMBA berhasil diperbarui!");
        await onRefresh();
        setTimeout(() => setEditingItem(null), 800);
      } else {
        setFeedbackMsg(json.error || "Gagal memperbarui kriteria.");
      }
    } catch {
      setFeedbackMsg("Terjadi gangguan jaringan saat menyimpan perubahan.");
    } finally {
      setIsUpdating(false);
    }
  };

  const openUploadModal = (
    criterionCode: string,
    criterionName: string,
    item: {
      itemKey: string;
      itemTitle: string;
      evidenceDocName: string;
      existingFileUrl?: string;
      existingFileName?: string;
    }
  ) => {
    setUploadModalItem({
      criterionCode,
      criterionName,
      itemKey: item.itemKey,
      itemTitle: item.itemTitle,
      evidenceDocName: item.evidenceDocName,
      existingFileUrl: item.existingFileUrl,
      existingFileName: item.existingFileName,
    });
    setEvidenceFile(null);
    setEvidenceNotes("");
    setUploadFeedback(null);
  };

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalItem || !evidenceFile) {
      setUploadFeedback({ type: "error", text: "Mohon pilih berkas dokumen yang akan diunggah." });
      return;
    }

    setIsUploadingEvidence(true);
    setUploadFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", evidenceFile);
      formData.append("targetType", "PRODI");
      formData.append("criterionCode", uploadModalItem.criterionCode);
      formData.append("itemKey", uploadModalItem.itemKey);
      formData.append("itemTitle", uploadModalItem.itemTitle);
      formData.append("evidenceDocName", uploadModalItem.evidenceDocName);
      formData.append("notes", evidenceNotes);

      const res = await fetch("/api/accreditation/evidence", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setUploadFeedback({
          type: "success",
          text: `Berkas ${evidenceFile.name} berhasil diunggah dan diverifikasi!`,
        });
        await onRefresh();
        setTimeout(() => {
          setUploadModalItem(null);
        }, 1000);
      } else {
        setUploadFeedback({ type: "error", text: json.error || "Gagal mengunggah berkas bukti." });
      }
    } catch {
      setUploadFeedback({ type: "error", text: "Terjadi gangguan jaringan saat mengunggah berkas." });
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  const handleDeleteEvidence = async (itemKey: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berkas bukti digital ini? Status item akan kembali merah.")) return;
    try {
      const res = await fetch(`/api/accreditation/evidence?targetType=PRODI&itemKey=${itemKey}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        await onRefresh();
      } else {
        alert(json.error || "Gagal menghapus berkas bukti.");
      }
    } catch {
      alert("Terjadi gangguan jaringan saat menghapus berkas.");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner Prediksi Kesiapan Prodi dengan Dual Mode Switcher */}
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-cyan-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-sky-700/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-white font-black text-8xl select-none pointer-events-none">
          {isModeBaikSekali ? "DL-05" : "DL-09"}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-bold backdrop-blur-md">
              <GraduationCap className="w-4 h-4 text-cyan-300" />
              <span>Program Studi S1 Manajemen • {isModeBaikSekali ? "Instrumen Status Terakreditasi (DL-05)" : "Instrumen Akreditasi Unggul IAU (Lampiran 9 / DL-09)"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isModeBaikSekali
                ? "Instrumen 5 Kriteria & 29 Indikator LAMEMBA 2026"
                : "Instrumen Akreditasi Unggul (DL-09) • 7 Kriteria & 58 Indikator"}
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed">
              {isModeBaikSekali
                ? "Instrumen pemenuhan standar kelayakan akreditasi Program Studi Manajemen berbasis luaran (5 Kriteria, 12 Dimensi, dan 29 Indikator Evaluasi). Dilengkapi Live Smart Audit Engine verifikasi berkas bukti digital riil tanpa manipulasi warna."
                : "Instrumen resmi Peraturan LAMEMBA Nomor 1 Tahun 2025 untuk meraih status terakreditasi UNGGUL (7 Kriteria, 21 Dimensi, 58 Indikator). Menguji 6 Dimensi Kunci Wajib 100%, 15 Dimensi Lainnya, dan 4 Syarat Kualifikasi & Luaran Dosen Sarjana (S1)."}
            </p>

            {/* DUAL MODE TARGET SWITCHER (TANPA KATA DEFAULT / ESKALASI) */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pilih Mode Target:</span>
              </span>

              <div className="inline-flex p-1 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    setTargetMode("BAIK_SEKALI");
                    setFilterSpecial("ALL");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    isModeBaikSekali
                      ? "bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300 scale-102"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pertahankan Status Aktif (BAIK SEKALI)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetMode("UNGGUL");
                    setFilterSpecial("ALL");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    !isModeBaikSekali
                      ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-200 scale-102"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Target Akselerasi UNGGUL</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status Badge Box */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center min-w-[280px] shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-200">
              Prediksi Status ({isModeBaikSekali ? "Pemenuhan Dokumen Aktif" : "Instrumen Akreditasi Unggul DL-09"})
            </span>
            <div
              className={`text-lg sm:text-xl font-black my-1 flex items-center gap-2 ${
                isTargetPassed ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {isTargetPassed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              )}
              <span>{activeStatusLabel}</span>
            </div>
            <div className="text-xs font-semibold text-sky-100">
              Skor Terbobot {isModeBaikSekali ? "5 Kriteria" : "7 Kriteria"}: <strong>{activeScore}</strong> / 100
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 w-full flex items-center justify-around text-[10px]">
              {isModeBaikSekali ? (
                <>
                  <span className={snDikti?.isTerakreditasiPassed ? "text-emerald-300 font-bold" : "text-amber-300 font-bold"}>
                    {snDikti?.isTerakreditasiPassed ? "✓ SN-Dikti Lolos" : `⚠ SN-Dikti (${snDikti?.verifiedIndicators || 0}/26)`}
                  </span>
                  <span className={snDikti?.isSyaratPerluPassed ? "text-emerald-300 font-bold" : "text-amber-300 font-bold"}>
                    {snDikti?.isSyaratPerluPassed ? "★ 15 Syarat Perlu Lolos" : `☆ 15 Syarat Perlu (${snDikti?.syaratPerluVerified || 0}/15)`}
                  </span>
                </>
              ) : (
                <>
                  <span className={dl09?.enamDimensiTerpilih?.passed ? "text-emerald-300 font-bold" : "text-amber-300 font-bold"}>
                    {dl09?.enamDimensiTerpilih?.passed ? "★ 6 Dimensi Kunci Lolos" : `☆ 6 Dimensi (${dl09?.enamDimensiTerpilih?.verifiedIndicators || 0}/18)`}
                  </span>
                  <span className={dl09?.syaratDosenS1?.passed ? "text-emerald-300 font-bold" : "text-amber-300 font-bold"}>
                    {dl09?.syaratDosenS1?.passed ? "★ Dosen S1 Lolos" : "☆ Dosen S1 Belum"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. BAR KONTROL & PUSAT UNDUH DOKUMEN (RINGKAS & HEMAT TEMPAT) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 border border-slate-200">
        <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-700">
          <GraduationCap className="w-4 h-4 text-sky-600" />
          <span>Instrumen Evaluasi S1 Manajemen: <strong>{isModeBaikSekali ? "5 Kriteria SN-Dikti (DL-05)" : "7 Kriteria Unggul IAU (DL-09)"}</strong></span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSwitchTab && (
            <button
              type="button"
              onClick={() => onSwitchTab("dl05")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Buka Pemantauan DL-05 (Tab 4)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDownloadCenter(!showDownloadCenter)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              showDownloadCenter
                ? "bg-sky-900 text-white shadow-sm"
                : "bg-white text-slate-700 hover:text-sky-900 hover:bg-sky-50 border border-slate-200"
            }`}
          >
            <Download className="w-3.5 h-3.5 text-sky-600" />
            <span>Unduh Panduan & Template (4 Berkas)</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDownloadCenter ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Collapsible Pusat Unduh Dokumen Panduan & Template */}
      <AnimatePresence>
        {showDownloadCenter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white border border-sky-800/50 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                    Arsip Resmi LAMEMBA Edisi Terbaru
                  </span>
                  <span className="text-xs font-bold text-sky-200">Rujukan & Template Kinerja S1 Manajemen</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDownloadCenter(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
                {/* 1. Panduan Penilaian Akreditasi Unggul DL-09 */}
                <a
                  href="/uploads/accreditation/templates/Panduan_Penilaian_Akreditasi_Unggul_DL09_LAMEMBA.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 hover:border-amber-400/60 transition-all flex flex-col justify-between gap-2.5 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-[11px]">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Instrumen Unggul DL-09 (PDF)</span>
                    </div>
                    <strong className="block text-white font-extrabold text-xs group-hover:text-amber-200 transition-colors">
                      Buku Panduan Akreditasi Unggul LAMEMBA
                    </strong>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      7 Kriteria, 21 Dimensi, 58 Indikator, 6 Dimensi Kunci, & Syarat Dosen S1 (Tabel 7).
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-amber-300 font-bold text-[11px] pt-2 border-t border-white/10 group-hover:text-amber-200">
                    <Download className="w-3.5 h-3.5" />
                    <span>Buka PDF (552 KB)</span>
                  </div>
                </a>

                {/* 2. Panduan Penilaian Status Terakreditasi LAMEMBA 2026 (DL-05) */}
                <a
                  href="/uploads/accreditation/templates/Buku_Panduan_Penilaian_Instrumen_LAMEMBA_2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 transition-all flex flex-col justify-between gap-2.5 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-cyan-300 font-bold text-[11px]">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Panduan Terakreditasi DL-05 (PDF)</span>
                    </div>
                    <strong className="block text-white font-extrabold text-xs group-hover:text-cyan-200 transition-colors">
                      Panduan Penilaian Terakreditasi DL-05
                    </strong>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      5 Kriteria SN-Dikti, 12 Dimensi, 29 Indikator, dan 15 Indikator Syarat Perlu.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] pt-2 border-t border-white/10 group-hover:text-cyan-200">
                    <Download className="w-3.5 h-3.5" />
                    <span>Buka PDF (2.3 MB)</span>
                  </div>
                </a>

                {/* 3. Template DKPS Tabel 1 s.d. 8 */}
                <a
                  href="/uploads/accreditation/templates/Template_Resmi_DKPS_Tabel_1_sd_8_LAMEMBA_2026.xlsx"
                  download
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 transition-all flex flex-col justify-between gap-2.5 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-[11px]">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Template DKPS Excel</span>
                    </div>
                    <strong className="block text-white font-extrabold text-xs group-hover:text-emerald-200 transition-colors">
                      DKPS Tabel 1 s.d. 8 LAMEMBA 2026
                    </strong>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Format resmi Dosen Tetap, EWMP, Tendik, Keuangan TS-2 s.d TS, & Luaran Riset.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] pt-2 border-t border-white/10 group-hover:text-emerald-200">
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Excel (210 KB)</span>
                  </div>
                </a>

                {/* 4. Formulir Surat Permohonan */}
                <a
                  href="/uploads/accreditation/templates/Formulir_Permohonan_Akreditasi_LAMEMBA_2026.docx"
                  download
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between gap-2.5 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-[11px]">
                      <FileUp className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Surat Permohonan (Word)</span>
                    </div>
                    <strong className="block text-white font-extrabold text-xs group-hover:text-amber-200 transition-colors">
                      Surat Pengajuan Akreditasi LAMEMBA
                    </strong>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Format baku surat pengantar permohonan ke Dewan Eksekutif LAMEMBA.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-amber-300 font-bold text-[11px] pt-2 border-t border-white/10 group-hover:text-amber-200">
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Word (11 KB)</span>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. CARD MONITORING KELAYAKAN SESUAI MODE YANG DIPILIH */}
      {isModeBaikSekali ? (
        // Mode Baik Sekali: Monitoring SN-Dikti 29 Indikator & 15 Syarat Perlu (DL-05)
        snDikti && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-100 text-sky-700 shrink-0">
                  <Target className="w-6 h-6 text-sky-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Ambang Kelayakan Status Terakreditasi Standar Nasional Pendidikan Tinggi (SN-Dikti)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rujukan: Bab II Panduan Penilaian LAMEMBA 2026 (5 Kriteria, 12 Dimensi, 29 Indikator)
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border">
                {snDikti.isTerakreditasiPassed ? (
                  <span className="text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Ambang Terakreditasi Terpenuhi</span>
                  </span>
                ) : (
                  <span className="text-red-700 bg-red-50 border-red-200 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Belum Memenuhi Ambang Terakreditasi</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Meter 1: Pemenuhan 29 Indikator SN-Dikti */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-sky-700" />
                    <span>1. Pemenuhan SN-Dikti (Minimal 90%)</span>
                  </span>
                  <span className="font-black text-xs text-slate-900">
                    {snDikti.verifiedIndicators} / {snDikti.totalIndicators} Indikator ({snDikti.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      snDikti.isSnDiktiPassed ? "bg-emerald-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, snDikti.percentage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Ambang Lolos: Minimal 26 dari 29 Indikator</span>
                  <span className={snDikti.isSnDiktiPassed ? "text-emerald-700 font-bold" : "text-red-600 font-bold"}>
                    {snDikti.isSnDiktiPassed ? "✓ Memenuhi Syarat SN-Dikti" : `✕ Kurang ${Math.max(0, 26 - snDikti.verifiedIndicators)} Indikator`}
                  </span>
                </div>
              </div>

              {/* Meter 2: 15 Indikator Syarat Perlu Terakreditasi */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>2. 15 Syarat Perlu Terakreditasi (*)</span>
                  </span>
                  <span className="font-black text-xs text-slate-900">
                    {snDikti.syaratPerluVerified} / {snDikti.syaratPerluTotal} Terpenuhi
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      snDikti.isSyaratPerluPassed ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, (snDikti.syaratPerluVerified / 15) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Ambang Lolos: Wajib 100% (15 dari 15 Indikator)</span>
                  <span className={snDikti.isSyaratPerluPassed ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                    {snDikti.isSyaratPerluPassed ? "✓ Seluruh Syarat Perlu Lolos" : `⚠ Tersisa ${15 - snDikti.syaratPerluVerified} Syarat Perlu`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        // Mode Akselerasi Unggul: Monitoring 3 Pilar Syarat Perlu Unggul (DL-09 Tabel 4, 5, 6, 7)
        dl09 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shrink-0">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Audit 3 Pilar Syarat Perlu Terakreditasi UNGGUL (Peraturan LAMEMBA No. 1/2025 Lampiran 9 / DL-09)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mengevaluasi 7 Kriteria, 21 Dimensi, 58 Indikator, dan Pemenuhan Kualifikasi Luaran Dosen Program Sarjana S1
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border">
                {dl09.isUnggulAchieved ? (
                  <span className="text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Lolos Status Terakreditasi Unggul</span>
                  </span>
                ) : (
                  <span className="text-red-700 bg-red-50 border-red-200 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Belum Memenuhi Ambang Unggul</span>
                  </span>
                )}
              </div>
            </div>

            {/* Grid 3 Pilar Utama Syarat Perlu Unggul */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Pilar 1: 6 Dimensi Terpilih Kunci (Tabel 5 DL-09) */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>Pilar 1: 6 Dimensi Kunci (Tabel 5)</span>
                  </span>
                  <span className="font-black text-xs text-amber-950">
                    {dl09.enamDimensiTerpilih.verifiedIndicators} / {dl09.enamDimensiTerpilih.totalIndicators} Terpenuhi
                  </span>
                </div>
                <div className="w-full bg-amber-200/60 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      dl09.enamDimensiTerpilih.passed ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${(dl09.enamDimensiTerpilih.verifiedIndicators / 18) * 100}%` }}
                  />
                </div>
                <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Ambang: Wajib 100% (18 Indikator)</span>
                    <span className={dl09.enamDimensiTerpilih.passed ? "text-emerald-700 font-bold" : "text-amber-800 font-bold"}>
                      {dl09.enamDimensiTerpilih.passed ? "✓ Lolos 100%" : `Tersisa ${18 - dl09.enamDimensiTerpilih.verifiedIndicators}`}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    Mencakup: Tata Pamong (2), Tata Kelola (3), Kecukupan Dosen (3), Pengelolaan Dosen (3), Kurikulum (4), Jaminan Pembelajaran (3).
                  </div>
                </div>
              </div>

              {/* Pilar 2: 15 Dimensi Lainnya (Tabel 6 DL-09) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-700" />
                    <span>Pilar 2: 15 Dimensi Lainnya (Tabel 6)</span>
                  </span>
                  <span className="font-black text-xs text-slate-900">
                    {dl09.limabelasDimensiLainnya.verifiedIndicators} / {dl09.limabelasDimensiLainnya.totalIndicators} Terpenuhi
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      dl09.limabelasDimensiLainnya.passed ? "bg-emerald-500" : "bg-red-500"
                    }`}
                    style={{ width: `${(dl09.limabelasDimensiLainnya.verifiedIndicators / 40) * 100}%` }}
                  />
                </div>
                <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Ambang: Minimal 90% (36/40)</span>
                    <span className={dl09.limabelasDimensiLainnya.passed ? "text-emerald-700 font-bold" : "text-red-700 font-bold"}>
                      {dl09.limabelasDimensiLainnya.passed ? "✓ Memenuhi Standar" : `Kurang ${Math.max(0, 36 - dl09.limabelasDimensiLainnya.verifiedIndicators)} Indikator`}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    Mencakup: Misi, Visi, Sasaran, Strategi, PMB, Layanan Mhs, Tendik, Keuangan, Sarpras, Penelitian & PkM.
                  </div>
                </div>
              </div>

              {/* Pilar 3: Syarat Dosen S1 (Tabel 7 DL-09) */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-700" />
                    <span>Pilar 3: Syarat Dosen S1 (Tabel 7)</span>
                  </span>
                  <span className="font-black text-xs text-indigo-950">
                    {dl09.syaratDosenS1.checks.filter((c) => c.passed).length} / 4 Syarat Terpenuhi
                  </span>
                </div>
                <div className="w-full bg-indigo-200/60 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      dl09.syaratDosenS1.passed ? "bg-emerald-500" : "bg-indigo-500"
                    }`}
                    style={{ width: `${(dl09.syaratDosenS1.checks.filter((c) => c.passed).length / 4) * 100}%` }}
                  />
                </div>
                <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Ambang: 4 dari 4 Wajib Terpenuhi</span>
                    <span className={dl09.syaratDosenS1.passed ? "text-emerald-700 font-bold" : "text-indigo-800 font-bold"}>
                      {dl09.syaratDosenS1.passed ? "✓ Seluruh Syarat Lolos" : `Tersisa ${4 - dl09.syaratDosenS1.checks.filter((c) => c.passed).length} Syarat`}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    DT ≥ 60%, ≥ 1 Doktor (S3), ≥ 40% minimal Lektor, ≥ 20% Publikasi Jurnal Nasional SINTA 1-6.
                  </div>
                </div>
              </div>
            </div>

            {/* Rincian 4 Syarat Dosen S1 (Tabel 7) */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                Pemeriksaan Rincian Syarat Dosen S1 (Tabel 7 DL-09 LAMEMBA):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {dl09.syaratDosenS1.checks.map((chk, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-1.5 ${
                      chk.passed
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                        : "bg-red-50 border-red-300 text-red-950"
                    }`}
                  >
                    <div>
                      <strong className="block text-[11px] font-black">{chk.item}</strong>
                      <p className="text-[10px] text-slate-600 mt-0.5">{chk.rule}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 text-[10px] font-bold">
                      <span>Status: {chk.currentValue}</span>
                      {chk.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* 4. Filter Bar & Search */}
      <div id="indikator-list" className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              isModeBaikSekali
                ? "Cari kode indikator (LAM-01), kriteria, atau kata kunci..."
                : "Cari kode (LAM-U01), dimensi, kriteria, atau kata kunci..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {isModeBaikSekali ? (
            // Filters for DL-05
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs flex-wrap">
              <button
                type="button"
                onClick={() => setFilterSpecial("ALL")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filterSpecial === "ALL"
                    ? "bg-white text-sky-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua Kriteria (5)
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial("SYARAT_PERLU")}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "SYARAT_PERLU"
                    ? "bg-amber-100 text-amber-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                <span>15 Syarat Perlu (*)</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial("BUKTI_TERSEDIA")}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "BUKTI_TERSEDIA"
                    ? "bg-emerald-100 text-emerald-900 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Bukti Lengkap</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial("PERLU_TINDAKAN")}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "PERLU_TINDAKAN"
                    ? "bg-red-100 text-red-900 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <AlertCircle className="w-3 h-3 text-red-600" />
                <span>Perlu Upload Bukti</span>
              </button>
            </div>
          ) : (
            // Filters for DL-09 IAU
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs flex-wrap">
              <button
                type="button"
                onClick={() => setFilterSpecial("ALL")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filterSpecial === "ALL"
                    ? "bg-white text-amber-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua Kriteria Unggul (7)
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial("ENAM_DIMENSI")}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "ENAM_DIMENSI"
                    ? "bg-amber-200 text-amber-950 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                <span>6 Dimensi Kunci (18)</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial("LIMA_BELAS_DIMENSI")}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "LIMA_BELAS_DIMENSI"
                    ? "bg-sky-100 text-sky-900 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3 h-3 text-sky-600" />
                <span>15 Dimensi Lainnya (40)</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial("SYARAT_DOSEN")}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "SYARAT_DOSEN"
                    ? "bg-indigo-100 text-indigo-950 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-3 h-3 text-indigo-600" />
                <span>Syarat Dosen S1 (Tabel 7)</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial("BUKTI_TERSEDIA")}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "BUKTI_TERSEDIA"
                    ? "bg-emerald-100 text-emerald-900 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Bukti Lengkap</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial("PERLU_TINDAKAN")}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "PERLU_TINDAKAN"
                    ? "bg-red-100 text-red-900 shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <AlertCircle className="w-3 h-3 text-red-600" />
                <span>Perlu Upload Bukti</span>
              </button>
            </div>
          )}
        </div>
      </div>


      {/* 6. GRID KRITERIA SESUAI MODE */}
      {isModeBaikSekali ? (
        // ==========================================
        // TAMPILAN MODE 1: 5 KRITERIA BAKU (DL-05)
        // ==========================================
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
            <span>
              Menampilkan {filteredCriteria.length} dari 5 Kriteria Baku (29 Indikator Evaluasi) • Target Aktif:{" "}
              <strong className="text-emerald-700">Pertahankan Status Aktif (BAIK SEKALI)</strong>
            </span>
            <span className="text-sky-700">Rujukan: Panduan Instrumen LAMEMBA Status Terakreditasi 2026 (DL-05)</span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {filteredCriteria.map((c) => {
              const smart = c.smartEvidence;

              return (
                <motion.div
                  key={c.code}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 transition-all shadow-xs hover:shadow-md space-y-4"
                >
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-11 h-9 rounded-xl bg-sky-950 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {c.code}
                      </span>
                      <div>
                        <h3 className="text-base font-black text-slate-950">{c.name}</h3>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Bobot Penilaian: <strong>{c.weight}%</strong> • {smart?.totalChecklistCount || 0} Indikator ({smart?.syaratPerluCount || 0} Syarat Perlu)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {c.isSyaratPerluUnggul && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border bg-amber-50 text-amber-900 border-amber-300">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Syarat Perlu UNGGUL</span>
                        </span>
                      )}

                      {/* Status Pill */}
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                          c.score >= 85
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : c.score >= 70
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : c.score > 0
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {c.score >= 85 ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>UNGGUL ({c.score})</span>
                          </>
                        ) : c.score >= 70 ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-sky-600" />
                            <span>BAIK SEKALI ({c.score})</span>
                          </>
                        ) : c.score > 0 ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>BAIK ({c.score})</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>BELUM ADA BUKTI (0)</span>
                          </>
                        )}
                      </span>

                      {/* LPM Edit Button */}
                      {isLpm && (
                        <button
                          onClick={() => openEditModal(c)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Reviu LPM</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description & Score Progress */}
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      {c.description}
                    </p>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">
                          Capaian Skor Kriteria: <strong className={c.score > 0 ? "text-slate-900" : "text-red-600"}>{c.score} / 100</strong>
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Ambang Unggul: <strong>&ge; 85.0</strong> • Ambang Baik Sekali: <strong>&ge; 70.0</strong>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            c.score >= 85
                              ? "bg-emerald-500"
                              : c.score >= 70
                              ? "bg-sky-500"
                              : c.score > 0
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, c.score)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rubrik Uji Petik Asesor LAMEMBA: Rincian Indikator & Tombol Upload Langsung */}
                  {smart && smart.assessorVerificationChecklist && smart.assessorVerificationChecklist.length > 0 && (
                    <div className="pt-3 border-t border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-sky-700" />
                          <span>Indikator Penilaian Resmi LAMEMBA (Asesmen Kecukupan / Asesmen Lapangan):</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {smart.verifiedCount} dari {smart.totalChecklistCount} Indikator Terpenuhi Sah
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 text-[11px]">
                        {smart.assessorVerificationChecklist.map((chk, cIdx) => (
                          <div
                            key={cIdx}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                              chk.verified
                                ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                                : "bg-red-50/80 border-red-300 text-red-950"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {chk.verified ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                              )}
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-md font-black text-[10px] bg-slate-900 text-white">
                                    {chk.indicatorCode}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-sky-100 text-sky-900 border border-sky-200">
                                    {chk.dimension}
                                  </span>
                                  {chk.isSyaratPerlu && (
                                    <span className="px-2 py-0.5 rounded-md font-black text-[10px] bg-amber-200 text-amber-950 border border-amber-300 flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3 text-amber-700" />
                                      <span>Syarat Perlu Terakreditasi (*)</span>
                                    </span>
                                  )}
                                  {chk.requiredForUnggul && (
                                    <span className="px-2 py-0.5 rounded-md font-black text-[10px] bg-purple-200 text-purple-950 border border-purple-300 flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-purple-700" />
                                      <span>Syarat Knockout Unggul</span>
                                    </span>
                                  )}
                                </div>

                                <div className="font-extrabold text-xs text-slate-900 leading-snug">
                                  {chk.item}
                                </div>

                                <div
                                  className={`text-[11px] p-2 rounded-xl border ${
                                    chk.verified
                                      ? "bg-emerald-100/60 border-emerald-200 text-emerald-900 font-semibold"
                                      : "bg-red-100/60 border-red-200 text-red-900 font-bold"
                                  }`}
                                >
                                  <span className="block font-black text-[10px] uppercase tracking-wider mb-0.5 text-slate-600">
                                    Dokumen Bukti Pemeriksaan Asesor:
                                  </span>
                                  {chk.evidenceDoc}
                                </div>

                                {/* Kotak Hibrida Sinkronisasi Sistem (Opsi B) */}
                                {chk.systemSourceData && (
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-sky-50/90 border border-sky-200/90 text-[11px] text-sky-950 shadow-2xs">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 rounded-lg bg-sky-600/10 text-sky-700 shrink-0">
                                        <Database className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-extrabold text-sky-900">{chk.systemSourceData.title}</span>
                                          {chk.systemSourceData.badge && (
                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-sky-200/70 text-sky-800">
                                              {chk.systemSourceData.badge}
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[10px] text-slate-600 font-medium">
                                          {chk.systemSourceData.countText}
                                        </p>
                                      </div>
                                    </div>
                                    <Link
                                      href={chk.systemSourceData.href}
                                      className="inline-flex items-center gap-1 text-[11px] font-black text-sky-700 hover:text-sky-950 hover:underline shrink-0 bg-white px-2.5 py-1 rounded-lg border border-sky-200/60 shadow-2xs"
                                    >
                                      <span>{chk.systemSourceData.actionLabel}</span>
                                      <ExternalLink className="w-3 h-3 text-sky-600" />
                                    </Link>
                                  </div>
                                )}

                                {chk.verified && chk.fileUrl && (
                                  <div className="flex items-center gap-3 pt-1 text-[11px] text-emerald-800">
                                    <a
                                      href={chk.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 font-bold underline hover:text-emerald-950"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>{chk.fileName || "Lihat Dokumen Terunggah"}</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteEvidence(chk.itemKey)}
                                      className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Hapus</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-end pt-2 border-t border-slate-200/40">
                              <button
                                type="button"
                                onClick={() =>
                                  openUploadModal(c.code, c.name, {
                                    itemKey: chk.itemKey,
                                    itemTitle: chk.item,
                                    evidenceDocName: chk.evidenceDoc,
                                    existingFileUrl: chk.fileUrl,
                                    existingFileName: chk.fileName,
                                  })
                                }
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                                  chk.verified
                                    ? "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                                    : "bg-sky-900 hover:bg-sky-800 text-white"
                                }`}
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{chk.verified ? "Ganti Dokumen" : "+ Upload Dokumen / PDF"}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        // ==============================================================
        // TAMPILAN MODE 2: INSTRUMEN AKREDITASI UNGGUL DL-09 (7 KRITERIA & 58 INDIKATOR)
        // ==============================================================
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
            <span>
              Menampilkan {filteredDl09Criteria.length} dari 7 Kriteria Unggul (58 Indikator Evaluasi) • Target Aktif:{" "}
              <strong className="text-amber-700">Target Akselerasi UNGGUL (DL-09)</strong>
            </span>
            <span className="text-amber-700 font-extrabold">Rujukan: Panduan Penilaian Akreditasi Unggul IAU LAMEMBA (DL-09)</span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {filteredDl09Criteria.map((c) => {
              const isKunciAlert = !c.isEnamDimensiKunciPassed && (c.code === "K.2" || c.code === "K.4" || c.code === "K.6");

              return (
                <motion.div
                  key={c.code}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-3xl p-6 border transition-all shadow-xs hover:shadow-md space-y-4 ${
                    isKunciAlert
                      ? "border-amber-400 bg-amber-50/10 ring-1 ring-amber-200"
                      : "border-slate-200/80"
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-11 h-9 rounded-xl bg-gradient-to-br from-amber-900 to-slate-900 text-amber-200 font-black text-xs flex items-center justify-center shadow-xs border border-amber-600/30">
                        {c.code}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-950">{c.name}</h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                            {c.standardType === "STANDAR_LAM" ? "Standar LAM" : "SN-Dikti"}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Bobot Penilaian: <strong>{c.weight}%</strong> • {c.totalIndicators} Indikator • Dimensi: {c.dimensions.join(", ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Badge 6 Dimensi Kunci jika Kriteria K.2, K.4, K.6 */}
                      {(c.code === "K.2" || c.code === "K.4" || c.code === "K.6") && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border bg-amber-100 text-amber-950 border-amber-300">
                          <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                          <span>Pilar 1: Dimensi Kunci Unggul</span>
                        </span>
                      )}

                      {/* Status Pill */}
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                          c.score >= 85
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : c.score >= 70
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : c.score > 0
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {c.score >= 85 ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>UNGGUL ({c.score})</span>
                          </>
                        ) : c.score >= 70 ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-sky-600" />
                            <span>BAIK SEKALI ({c.score})</span>
                          </>
                        ) : c.score > 0 ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>BAIK ({c.score})</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>BELUM ADA BUKTI (0)</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Warning Box jika ada Dimensi Kunci yang belum lolos pada kriteria ini */}
                  {isKunciAlert && (
                    <div className="p-3 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-950 flex items-start gap-2 text-xs">
                      <Star className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 fill-amber-600" />
                      <div>
                        <strong>SYARAT PERLU UNGGUL (TABEL 5 DL-09): </strong>
                        Kriteria ini memuat dimensi kunci yang wajib 100% dipenuhi dokumen fisiknya. Belum terpenuhinya seluruh indikator kunci pada kriteria ini akan menggugurkan predikat UNGGUL.
                      </div>
                    </div>
                  )}

                  {/* Description & Score Progress */}
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      {c.description}
                    </p>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">
                          Capaian Skor Kriteria: <strong className={c.score > 0 ? "text-slate-900" : "text-red-600"}>{c.score} / 100</strong>
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Terpenuhi: <strong>{c.verifiedIndicators}</strong> dari {c.totalIndicators} Indikator • Ambang Unggul: <strong>&ge; 85.0</strong>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            c.score >= 85
                              ? "bg-emerald-500"
                              : c.score >= 70
                              ? "bg-sky-500"
                              : c.score > 0
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, c.score)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checklist 58 Indikator DL-09 */}
                  <div className="pt-3 border-t border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Rincian Indikator Evaluasi Resmi IAU LAMEMBA (DL-09):</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {c.verifiedIndicators} dari {c.totalIndicators} Indikator Terpenuhi Sah
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 text-[11px]">
                      {c.indicators.map((ind) => (
                        <div
                          key={ind.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                            ind.verified
                              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                              : "bg-red-50/80 border-red-300 text-red-950"
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {ind.verified ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md font-black text-[10px] bg-slate-900 text-white">
                                  {ind.code}
                                </span>
                                <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-sky-100 text-sky-900 border border-sky-200">
                                  {ind.dimension}
                                </span>
                                {ind.isEnamDimensiKunci && (
                                  <span className="px-2 py-0.5 rounded-md font-black text-[10px] bg-amber-200 text-amber-950 border border-amber-300 flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-700 fill-amber-600" />
                                    <span>6 Dimensi Kunci Unggul (Wajib 100%)</span>
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                                  {ind.standardType === "STANDAR_LAM" ? "Standar LAM" : "SN-Dikti"}
                                </span>
                                <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  Klaster: {ind.cluster === "OUTPUT_OUTCOME" ? "Output / Outcome" : ind.cluster}
                                </span>
                              </div>

                              <div className="font-extrabold text-xs text-slate-900 leading-snug">
                                {ind.statement}
                              </div>

                              <div
                                className={`text-[11px] p-2 rounded-xl border ${
                                  ind.verified
                                    ? "bg-emerald-100/60 border-emerald-200 text-emerald-900 font-semibold"
                                    : "bg-red-100/60 border-red-200 text-red-900 font-bold"
                                }`}
                              >
                                <span className="block font-black text-[10px] uppercase tracking-wider mb-0.5 text-slate-600">
                                  Dokumen Bukti Pemeriksaan Asesor:
                                </span>
                                {ind.evidenceDoc}
                              </div>

                              {/* Kotak Hibrida Sinkronisasi Sistem (Opsi B) */}
                              {ind.systemSourceData && (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-sky-50/90 border border-sky-200/90 text-[11px] text-sky-950 shadow-2xs">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-sky-600/10 text-sky-700 shrink-0">
                                      <Database className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-extrabold text-sky-900">{ind.systemSourceData.title}</span>
                                        {ind.systemSourceData.badge && (
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-sky-200/70 text-sky-800">
                                            {ind.systemSourceData.badge}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-600 font-medium">
                                        {ind.systemSourceData.countText}
                                      </p>
                                    </div>
                                  </div>
                                  <Link
                                    href={ind.systemSourceData.href}
                                    className="inline-flex items-center gap-1 text-[11px] font-black text-sky-700 hover:text-sky-950 hover:underline shrink-0 bg-white px-2.5 py-1 rounded-lg border border-sky-200/60 shadow-2xs"
                                  >
                                    <span>{ind.systemSourceData.actionLabel}</span>
                                    <ExternalLink className="w-3 h-3 text-sky-600" />
                                  </Link>
                                </div>
                              )}

                              {ind.verified && ind.fileUrl && (
                                <div className="flex items-center gap-3 pt-1 text-[11px] text-emerald-800">
                                  <a
                                    href={ind.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-bold underline hover:text-emerald-950"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{ind.fileName || "Lihat Dokumen Terunggah"}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEvidence(ind.itemKey)}
                                    className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end pt-2 border-t border-slate-200/40">
                            <button
                              type="button"
                              onClick={() =>
                                openUploadModal(c.code, c.name, {
                                  itemKey: ind.itemKey,
                                  itemTitle: ind.statement,
                                  evidenceDocName: ind.evidenceDoc,
                                  existingFileUrl: ind.fileUrl,
                                  existingFileName: ind.fileName,
                                })
                              }
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                                ind.verified
                                  ? "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                                  : "bg-sky-900 hover:bg-sky-800 text-white"
                              }`}
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>{ind.verified ? "Ganti Dokumen" : "+ Upload Dokumen / PDF"}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Modal Upload Berkas Dokumen Fisik */}
      <AnimatePresence>
        {uploadModalItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-black text-xs">
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Upload Bukti Digital • {uploadModalItem.criterionCode}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Unggah Dokumen Bukti Fisik Indikator
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadModalItem(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Box Item Context */}
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs space-y-2">
                <div className="font-extrabold text-slate-900">{uploadModalItem.itemTitle}</div>
                <div className="text-[11px] text-sky-900 font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                  <span>Dokumen yang diminta: <strong>{uploadModalItem.evidenceDocName}</strong></span>
                </div>
                {uploadModalItem.existingFileUrl && (
                  <div className="text-[11px] text-emerald-800 font-semibold pt-1 border-t border-sky-200/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saat ini telah ada: {uploadModalItem.existingFileName || "Dokumen tersimpan"}</span>
                  </div>
                )}
              </div>

              {/* Feedback Alert */}
              {uploadFeedback && (
                <div
                  className={`p-3 rounded-2xl text-xs font-bold border ${
                    uploadFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-red-50 text-red-900 border-red-200"
                  }`}
                >
                  {uploadFeedback.text}
                </div>
              )}

              {/* Upload Form */}
              <form onSubmit={handleUploadEvidence} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Pilih Berkas Dokumen (PDF, DOCX, XLSX - Maksimal 30 MB)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx,.xls,.doc,.zip"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Keterangan Dokumen / Catatan Bukti (Opsional)
                  </label>
                  <textarea
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    placeholder="Contoh: SK Ketua Nomor 045/SK/2024 tentang Kurikulum OBE S1 Manajemen..."
                    rows={2}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingEvidence || !evidenceFile}
                    className="px-5 py-2.5 rounded-xl bg-sky-900 hover:bg-sky-800 disabled:bg-slate-300 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isUploadingEvidence ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Simpan & Verifikasi Berkas</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Modal Reviu LPM Kriteria LAMEMBA */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-black text-xs">
                    {editingItem.code}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    Reviu Evaluasi {editingItem.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Skor Kriteria (0 - 100):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editScore}
                    onChange={(e) => setEditScore(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 font-black text-sm"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Ambang Unggul: &ge; 85 • Baik Sekali: 70 - 84 • Baik: 55 - 69
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Analisis Ketercapaian / Deskripsi:
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kekuatan Utama (Pisahkan dengan baris baru):
                  </label>
                  <textarea
                    rows={2}
                    value={editStrengths}
                    onChange={(e) => setEditStrengths(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rekomendasi Peningkatan (Pisahkan dengan baris baru):
                  </label>
                  <textarea
                    rows={2}
                    value={editRecommendations}
                    onChange={(e) => setEditRecommendations(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {feedbackMsg && (
                  <div className="p-3 rounded-xl bg-sky-50 text-sky-900 border border-sky-200 text-xs font-semibold">
                    {feedbackMsg}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2.5 rounded-xl font-black bg-sky-900 hover:bg-sky-800 text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isUpdating ? "Menyimpan..." : "Simpan Perubahan"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
