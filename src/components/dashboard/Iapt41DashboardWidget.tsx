"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Sparkles, 
  BookOpen, 
  Check, 
  Edit3, 
  Save, 
  X, 
  FileCheck2, 
  Building2, 
  AlertTriangle, 
  Link2, 
  ShieldAlert, 
  ArrowRight, 
  Database, 
  Info, 
  Layers,
  Upload,
  Download,
  FileText,
  FileUp,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const getEvidenceLinks = (nomor: number) => {
  if (nomor === 1 || nomor === 2 || nomor === 3) {
    return [
      { label: "Pusat Dokumen SPMI (4 Buku)", href: "/dashboard/spmi", icon: BookOpen },
      { label: "Audit Mutu AMI Siklus IX", href: "/dashboard/ami", icon: CheckCircle2 },
    ];
  }
  if (nomor === 4) {
    return [
      { label: "Berkas SK & Sertifikat Prodi", href: "/dashboard/accreditation", icon: Award },
    ];
  }
  if (nomor === 14 || nomor === 15) {
    return [
      { label: "Rekap Tracer Study CDC Alumni", href: "/dashboard/evaluations", icon: FileCheck2 },
      { label: "Capaian IKU 2 (Serapan Kerja)", href: "/dashboard/achievements", icon: Sparkles },
    ];
  }
  if (nomor === 34) {
    return [
      { label: "Survei Kepuasan Sivitas", href: "/dashboard/evaluations", icon: FileCheck2 },
    ];
  }
  if (nomor >= 16 && nomor <= 19) {
    return [
      { label: "Bukti Riset LPPM (IKU 10)", href: "/dashboard/achievements", icon: Award },
      { label: "Standar Riset SPMI", href: "/dashboard/spmi", icon: BookOpen },
    ];
  }
  if (nomor >= 20 && nomor <= 23) {
    return [
      { label: "Bukti PkM LPPM (IKU 11)", href: "/dashboard/achievements", icon: Award },
      { label: "Standar PkM SPMI", href: "/dashboard/spmi", icon: BookOpen },
    ];
  }
  if (nomor === 24 || nomor === 25 || nomor === 28 || nomor === 31 || nomor === 35) {
    return [
      { label: "Profil Tata Pamong & Statuta", href: "/dashboard/profile", icon: Building2 },
      { label: "Laporan Keuangan & KAP WTP", href: "/dashboard/reports", icon: FileCheck2 },
    ];
  }
  return [
    { label: "Pelaporan Capaian 12 IKU", href: "/dashboard/achievements", icon: Sparkles },
    { label: "Standar Mutu Terkait", href: "/dashboard/spmi", icon: BookOpen },
  ];
};

export interface ISmartEvidenceItem {
  digitalEvidenceStatus: 'TERSEDIA' | 'KOSONG' | 'PERLU_TINDAKAN';
  evidenceSummary: string;
  evidenceHref: string;
  evidenceActionLabel: string;
  hasAlert: boolean;
  missingRequirements?: string[];
  assessorVerificationChecklist?: Array<{
    itemKey?: string;
    item: string;
    verified: boolean;
    evidenceDoc: string;
    fileUrl?: string;
    fileName?: string;
  }>;
}

export interface IIapt41Item {
  nomor: number;
  kriteria: "Budaya Mutu" | "Relevansi Pendidikan" | "Relevansi Penelitian" | "Relevansi PkM" | "Akuntabilitas" | "Diferensiasi Misi";
  cramCategory: "C" | "R" | "A" | "M";
  sasaranMutu: "Masukan" | "Proses" | "Luaran/Capaian" | "Dampak";
  indikator: string;
  aspekPenilaian: string;
  sumberData: string;
  deskripsiTerakreditasi: string;
  isSyaratPerluTerakreditasi: boolean;
  deskripsiUnggul: string;
  isSyaratPerluUnggul: boolean;
  status: "MEMENUHI" | "BELUM";
  statusTerakreditasi?: "MEMENUHI" | "BELUM";
  statusUnggul?: "MEMENUHI" | "BELUM";
  notes: string;
  smartEvidence?: ISmartEvidenceItem;
  isReviewedByLpm?: boolean;
  updatedBy?: string;
}

export interface IIapt41Summary {
  indicators: IIapt41Item[];
  totalIndicators: number;
  fulfilledCount: number;
  percentage: number;
  syaratPerluTerakreditasiPassed: boolean;
  syaratPerluUnggulPassed: boolean;
  predictedStatus: string;
  cramScores: {
    C: { total: number; fulfilled: number };
    R: { total: number; fulfilled: number };
    A: { total: number; fulfilled: number };
    M: { total: number; fulfilled: number };
  };
  criticalAlertsCount?: number;
  criticalAlerts?: IIapt41Item[];
  digitalReadiness?: {
    availableCount: number;
    actionRequiredCount: number;
    missingCount: number;
  };
  summaryTerakreditasi?: {
    fulfilledCount: number;
    percentage: number;
    syaratPerluPassed: boolean;
    predictedStatus: string;
    criticalAlertsCount: number;
    criticalAlerts: IIapt41Item[];
  };
  summaryUnggul?: {
    fulfilledCount: number;
    percentage: number;
    syaratPerluPassed: boolean;
    predictedStatus: string;
    criticalAlertsCount: number;
    criticalAlerts: IIapt41Item[];
  };
}

interface Iapt41DashboardWidgetProps {
  data: IIapt41Summary;
  isLpm: boolean;
  onRefresh: () => Promise<void>;
}

export default function Iapt41DashboardWidget({
  data,
  isLpm,
  onRefresh,
}: Iapt41DashboardWidgetProps) {
  // Dual Mode Target: "TERAKREDITASI" (Default Hijau/Aman) vs "UNGGUL" (Eskalasi)
  const [targetMode, setTargetMode] = useState<"TERAKREDITASI" | "UNGGUL">("TERAKREDITASI");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCram, setSelectedCram] = useState<"ALL" | "C" | "R" | "A" | "M">("ALL");
  const [filterSpecial, setFilterSpecial] = useState<
    "ALL" | "CRITICAL_ALERT" | "SYARAT_UNGGUL" | "SYARAT_TERAKREDITASI" | "BUKTI_KOSONG" | "BUKTI_TERSEDIA"
  >("ALL");

  // Evidence Upload Modal State
  const [uploadModalItem, setUploadModalItem] = useState<{
    nomor: number;
    indikator: string;
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

  const openUploadModal = (
    nomor: number,
    indikator: string,
    chk: { itemKey?: string; item: string; evidenceDoc: string; fileUrl?: string; fileName?: string }
  ) => {
    setUploadModalItem({
      nomor,
      indikator,
      itemKey: chk.itemKey || `apt-${nomor}-1`,
      itemTitle: chk.item,
      evidenceDocName: chk.evidenceDoc,
      existingFileUrl: chk.fileUrl,
      existingFileName: chk.fileName,
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
      formData.append("targetType", "INSTITUSI");
      formData.append("criterionCode", `APT-${uploadModalItem.nomor}`);
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
          text: `Berkas ${evidenceFile.name} berhasil diunggah dan terverifikasi!`,
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
      const res = await fetch(`/api/accreditation/evidence?targetType=INSTITUSI&itemKey=${itemKey}`, {
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

  // Edit State Modal (Reviu LPM)
  const [editingItem, setEditingItem] = useState<IIapt41Item | null>(null);
  const [editStatus, setEditStatus] = useState<"MEMENUHI" | "BELUM">("MEMENUHI");
  const [editNotes, setEditNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Active Metrics according to Dual Mode Target
  const activeSummary = targetMode === "TERAKREDITASI" ? data.summaryTerakreditasi : data.summaryUnggul;
  const activeFulfilledCount = activeSummary?.fulfilledCount ?? data.fulfilledCount;
  const activePercentage = activeSummary?.percentage ?? data.percentage;
  const activePredictedStatus = activeSummary?.predictedStatus ?? data.predictedStatus;
  const activeCriticalAlerts = activeSummary?.criticalAlerts ?? (targetMode === "TERAKREDITASI" ? [] : (data.criticalAlerts ?? []));
  const activeCriticalCount = activeCriticalAlerts.length;
  const isTargetPassed = activeSummary?.syaratPerluPassed ?? (targetMode === "TERAKREDITASI" ? data.syaratPerluTerakreditasiPassed : data.syaratPerluUnggulPassed);

  const filteredIndicators = data.indicators.filter((item) => {
    const itemStatus = targetMode === "TERAKREDITASI" 
      ? (item.statusTerakreditasi ?? item.status) 
      : (item.statusUnggul ?? item.status);

    // Search filter
    const matchesSearch =
      item.indikator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.aspekPenilaian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sumberData.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomor.toString() === searchTerm.trim();

    // CRAM filter
    const matchesCram = selectedCram === "ALL" || item.cramCategory === selectedCram;

    // Special filter
    let matchesSpecial = true;
    if (filterSpecial === "CRITICAL_ALERT") {
      if (targetMode === "TERAKREDITASI") {
        matchesSpecial = item.isSyaratPerluTerakreditasi && (itemStatus === "BELUM" || item.smartEvidence?.digitalEvidenceStatus !== "TERSEDIA");
      } else {
        matchesSpecial = item.isSyaratPerluUnggul && (itemStatus === "BELUM" || item.smartEvidence?.digitalEvidenceStatus !== "TERSEDIA");
      }
    } else if (filterSpecial === "SYARAT_UNGGUL") {
      matchesSpecial = item.isSyaratPerluUnggul;
    } else if (filterSpecial === "SYARAT_TERAKREDITASI") {
      matchesSpecial = item.isSyaratPerluTerakreditasi;
    } else if (filterSpecial === "BUKTI_KOSONG") {
      matchesSpecial = item.smartEvidence?.digitalEvidenceStatus === "KOSONG";
    } else if (filterSpecial === "BUKTI_TERSEDIA") {
      matchesSpecial = item.smartEvidence?.digitalEvidenceStatus === "TERSEDIA";
    }

    return matchesSearch && matchesCram && matchesSpecial;
  });

  const openEditModal = (item: IIapt41Item) => {
    const activeItemStatus = targetMode === "TERAKREDITASI" 
      ? (item.statusTerakreditasi ?? item.status) 
      : (item.statusUnggul ?? item.status);

    setEditingItem(item);
    setEditStatus(activeItemStatus);
    setEditNotes(item.notes || "");
    setFeedbackMsg(null);
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/accreditation/iapt41", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomor: editingItem.nomor,
          status: editStatus,
          notes: editNotes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedbackMsg("Status butir indikator berhasil diperbarui oleh LPM!");
        await onRefresh();
        setTimeout(() => {
          setEditingItem(null);
        }, 800);
      } else {
        setFeedbackMsg(json.error || "Gagal memperbarui data.");
      }
    } catch {
      setFeedbackMsg("Terjadi gangguan jaringan saat memperbarui status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner Prediksi Kesiapan Institusi dengan Dual Mode Switcher */}
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-sky-700/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-white font-black text-8xl select-none pointer-events-none">
          IAPT 4.1
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-bold backdrop-blur-md">
              <Award className="w-4 h-4 text-cyan-300" />
              <span>Peraturan BAN-PT No. 35 Tahun 2025 • Instrumen IAPT 4.1 (PTS Akademik)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kesiapan Akreditasi Institusi STIMI YAPMI Makassar
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed">
              Instrumen 39 Butir Penilaian PTS Akademik berlandaskan luaran nyata (<em>Outcome-Based Accreditation</em>). Dilengkapi <strong>Hybrid Smart Audit Engine</strong> untuk mengecek bukti riil pangkalan data.
            </p>

            {/* DUAL MODE TARGET SWITCHER */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pilih Mode Target:</span>
              </span>

              <div className="inline-flex p-1 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setTargetMode("TERAKREDITASI")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    targetMode === "TERAKREDITASI"
                      ? "bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-300 scale-102"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Standar Terakreditasi (Ambang SN-Dikti)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetMode("UNGGUL")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    targetMode === "UNGGUL"
                      ? "bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-200 scale-102"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Target Terakreditasi UNGGUL</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status Badge Box */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center min-w-[270px] shadow-lg">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-200">
              Prediksi Status ({targetMode === "TERAKREDITASI" ? "Ambang SN-Dikti" : "Target Unggul"})
            </span>
            <div className={`text-xl sm:text-2xl font-black my-1 flex items-center gap-2 ${
              isTargetPassed
                ? "text-emerald-300"
                : "text-amber-300"
            }`}>
              {isTargetPassed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <Sparkles className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
              )}
              <span>{activePredictedStatus}</span>
            </div>
            <div className="text-xs font-semibold text-sky-100">
              Ketercapaian: <strong>{activeFulfilledCount}</strong> dari {data.totalIndicators} Butir ({activePercentage}%)
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 w-full flex items-center justify-around text-[10px]">
              <span className={data.syaratPerluTerakreditasiPassed ? "text-emerald-300 font-bold" : "text-amber-300 font-bold"}>
                {data.syaratPerluTerakreditasiPassed ? "✓ 5 Syarat Terakreditasi Lolos" : "⚠ Syarat Terakreditasi Belum"}
              </span>
              <span className={data.syaratPerluUnggulPassed ? "text-amber-300 font-bold" : "text-slate-300 font-bold"}>
                {data.syaratPerluUnggulPassed ? "★ 8 Syarat Unggul Lolos" : "☆ 8 Syarat Unggul Belum"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PUSAT UNDUH DOKUMEN REGULASI RESMI BAN-PT (IAPT 4.1) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white border border-sky-800/50 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 shrink-0">
              <Download className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                  Regulasi Resmi BAN-PT 2025/2026
                </span>
                <span className="text-xs font-bold text-sky-200">Peraturan BAN-PT No. 35 Tahun 2025</span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                Pusat Unduh Dokumen Instrumen IAPT 4.1 & Template Evaluasi Mandiri
              </h3>
              <p className="text-xs text-sky-200/80">
                Gunakan berkas regulasi resmi dan instrumen excel di bawah ini untuk persiapan audit dan pengunggahan berkas bukti akreditasi institusi.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
          {/* 1. Salinan PerBAN-PT 35/2025 */}
          <a
            href="/uploads/accreditation/templates/Peraturan_BAN_PT_No_35_Tahun_2025_IAPT_4_1.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-[11px]">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Regulasi Resmi (PDF)</span>
              </div>
              <strong className="block text-white font-extrabold text-xs group-hover:text-cyan-200 transition-colors">
                Peraturan BAN-PT No. 35 Tahun 2025 tentang Instrumen IAPT 4.1
              </strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Salinan resmi instrumen akreditasi perguruan tinggi akademik (CRAM), 39 butir indikator, dan rubrik penilaian.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] pt-2 border-t border-white/10 group-hover:text-cyan-200">
              <Download className="w-3.5 h-3.5" />
              <span>Buka / Unduh Salinan PDF (1.0 MB)</span>
            </div>
          </a>

          {/* 2. Template Evaluasi Mandiri IAPT 4.1 */}
          <a
            href="/uploads/accreditation/templates/Instrumen_Evaluasi_Mandiri_IAPT_4_1_BAN_PT.xlsx"
            download
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-[11px]">
                <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Matriks Evaluasi Mandiri (Excel)</span>
              </div>
              <strong className="block text-white font-extrabold text-xs group-hover:text-emerald-200 transition-colors">
                Template Evaluasi Mandiri 39 Butir IAPT 4.1 BAN-PT
              </strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Format spreadsheet resmi matriks 39 butir indikator PTS Akademik kategori Masukan, Proses, Luaran, dan Dampak.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] pt-2 border-t border-white/10 group-hover:text-emerald-200">
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template Excel (220 KB)</span>
            </div>
          </a>
        </div>
      </div>

      {/* 2. Banner Status Kepatuhan: Hijau Reassuring di Mode Terakreditasi, atau Peringatan Kritis di Mode Unggul */}
      {targetMode === "TERAKREDITASI" ? (
        activeCriticalCount === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-slate-900 border-2 border-emerald-500/60 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                    Zona Kepatuhan Hijau
                  </span>
                  <span className="text-xs font-bold text-emerald-200">
                    Seluruh 5 Syarat Perlu Kelayakan Terakreditasi Terverifikasi Sah
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed max-w-3xl">
                  STIMI YAPMI Makassar memenuhi ambang kelayakan Standar Nasional Pendidikan Tinggi (SN-Dikti) sesuai Permendiktisaintek No. 39/2025 jo. No. 10/2026. Institusi berada pada status legal terakreditasi aman.
                </p>
              </div>
            </div>

            <button
              onClick={() => setTargetMode("UNGGUL")}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shrink-0 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cek Gap Menuju Unggul</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-red-950/90 border-2 border-red-500/60 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-red-600/30 border border-red-400/40 text-red-200 shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-300 animate-bounce" />
              </div>
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                  Peringatan Syarat Terakreditasi
                </span>
                <p className="text-xs text-red-100 leading-relaxed max-w-3xl">
                  Terdapat {activeCriticalCount} butir Syarat Perlu Terakreditasi yang belum lengkap dokumen buktinya.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilterSpecial("CRITICAL_ALERT")}
              className="px-4 py-2 rounded-xl bg-white text-red-950 font-black text-xs shrink-0"
            >
              Lihat Butir Kritis
            </button>
          </motion.div>
        )
      ) : (
        /* Target Mode === UNGGUL */
        activeCriticalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-gradient-to-r from-red-950/90 via-red-900/90 to-amber-950/90 border-2 border-red-500/60 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-red-600/30 border border-red-400/40 text-red-200 shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-300 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                    Peringatan Kepatuhan Mutu UNGGUL
                  </span>
                  <span className="text-xs font-bold text-red-200">
                    {activeCriticalCount} Butir Syarat Perlu UNGGUL Membutuhkan Pemenuhan Dokumen
                  </span>
                </div>
                <p className="text-xs text-red-100/90 leading-relaxed max-w-3xl">
                  Pencapaian <strong>Terakreditasi UNGGUL</strong> bagi STIMI YAPMI Makassar masih tertahan karena membutuhkan reakreditasi prodi S1 Manajemen menuju Unggul, laporan audit eksternal KAP WTP, atau pengakuan Tridharma 5 tahun.
                </p>
              </div>
            </div>

            <button
              onClick={() => setFilterSpecial("CRITICAL_ALERT")}
              className="px-4 py-2.5 rounded-2xl bg-white text-red-950 hover:bg-red-50 font-black text-xs transition-all shadow-md shrink-0 flex items-center gap-2"
            >
              <span>Tampilkan {activeCriticalCount} Butir Kritis Unggul</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )
      )}

      {/* 3. Ringkasan Kesiapan Digital (Digital Evidence Readiness) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <Database className="w-4 h-4 text-sky-600" />
          <span>Status Bukti Digital Sistem (Pangkalan Data Terintegrasi):</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tersedia: {data.digitalReadiness?.availableCount ?? 0} Butir</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Perlu Tindakan: {data.digitalReadiness?.actionRequiredCount ?? 0} Butir</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 border border-red-200 text-red-800 font-bold">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Belum Terisi: {data.digitalReadiness?.missingCount ?? 0} Butir</span>
          </div>
        </div>
      </div>

      {/* 4. Empat Pilar CRAM Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Culture */}
        <div 
          onClick={() => setSelectedCram("C")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedCram === "C"
              ? "bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-300"
              : "bg-white border-slate-200/80 hover:border-sky-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800">
              C • CULTURE
            </span>
            <span className="text-xs font-bold text-slate-500">
              {data.cramScores.C.fulfilled}/{data.cramScores.C.total} Butir
            </span>
          </div>
          <h4 className="text-sm font-black text-slate-900">Budaya Mutu</h4>
          <p className="text-xs text-slate-500 mt-1">
            SPMI Siklus PPEPP, kepatuhan AMI, pelaporan PDDIKTI, dan akreditasi prodi.
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-sky-600 h-full rounded-full transition-all"
              style={{ width: `${(data.cramScores.C.fulfilled / data.cramScores.C.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Relevance */}
        <div 
          onClick={() => setSelectedCram("R")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedCram === "R"
              ? "bg-cyan-50 border-cyan-400 shadow-md ring-2 ring-cyan-300"
              : "bg-white border-slate-200/80 hover:border-cyan-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-800">
              R • RELEVANCE
            </span>
            <span className="text-xs font-bold text-slate-500">
              {data.cramScores.R.fulfilled}/{data.cramScores.R.total} Butir
            </span>
          </div>
          <h4 className="text-sm font-black text-slate-900">Relevansi Tridharma</h4>
          <p className="text-xs text-slate-500 mt-1">
            Kurikulum OBE, rasio DTPS & S3 Doktor, riset LPPM Sinta/Scopus, PkM, & Tracer Study.
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-cyan-600 h-full rounded-full transition-all"
              style={{ width: `${(data.cramScores.R.fulfilled / data.cramScores.R.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Accountability */}
        <div 
          onClick={() => setSelectedCram("A")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedCram === "A"
              ? "bg-indigo-50 border-indigo-400 shadow-md ring-2 ring-indigo-300"
              : "bg-white border-slate-200/80 hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800">
              A • ACCOUNTABILITY
            </span>
            <span className="text-xs font-bold text-slate-500">
              {data.cramScores.A.fulfilled}/{data.cramScores.A.total} Butir
            </span>
          </div>
          <h4 className="text-sm font-black text-slate-900">Akuntabilitas</h4>
          <p className="text-xs text-slate-500 mt-1">
            Good University Governance, Satgas PPKS, manajemen POAC, kepuasan sivitas, & audit KAP WTP.
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${(data.cramScores.A.fulfilled / data.cramScores.A.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Mission */}
        <div 
          onClick={() => setSelectedCram("M")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedCram === "M"
              ? "bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-300"
              : "bg-white border-slate-200/80 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
              M • MISSION
            </span>
            <span className="text-xs font-bold text-slate-500">
              {data.cramScores.M.fulfilled}/{data.cramScores.M.total} Butir
            </span>
          </div>
          <h4 className="text-sm font-black text-slate-900">Diferensiasi Misi</h4>
          <p className="text-xs text-slate-500 mt-1">
            Keunggulan khas Sekolah Tinggi Ilmu Manajemen & apresiasi eksternal berkelanjutan.
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${(data.cramScores.M.fulfilled / data.cramScores.M.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Filter Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari indikator, aspek penilaian, atau kata kunci..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CRAM Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {(["ALL", "C", "R", "A", "M"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCram(cat)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  selectedCram === cat
                    ? "bg-white text-sky-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat === "ALL" ? "Semua CRAM" : cat}
              </button>
            ))}
          </div>

          {/* Special Condition Filter */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterSpecial("ALL")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterSpecial === "ALL"
                  ? "bg-white text-sky-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({data.totalIndicators})
            </button>

            {activeCriticalCount > 0 && (
              <button
                onClick={() => setFilterSpecial("CRITICAL_ALERT")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  filterSpecial === "CRITICAL_ALERT"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-red-700 hover:bg-red-50"
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-red-500" />
                <span>Alert Kritis ({activeCriticalCount})</span>
              </button>
            )}

            <button
              onClick={() => setFilterSpecial("SYARAT_TERAKREDITASI")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filterSpecial === "SYARAT_TERAKREDITASI"
                  ? "bg-emerald-100 text-emerald-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Syarat Terakreditasi (5)</span>
            </button>

            <button
              onClick={() => setFilterSpecial("SYARAT_UNGGUL")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filterSpecial === "SYARAT_UNGGUL"
                  ? "bg-amber-100 text-amber-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Syarat Unggul (8)</span>
            </button>

            <button
              onClick={() => setFilterSpecial("BUKTI_KOSONG")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filterSpecial === "BUKTI_KOSONG"
                  ? "bg-red-100 text-red-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <XCircle className="w-3 h-3 text-red-600" />
              <span>Bukti Kosong ({data.digitalReadiness?.missingCount ?? 0})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Daftar 39 Butir Indikator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
          <span>
            Menampilkan {filteredIndicators.length} dari 39 Butir Indikator • Target Aktif:{" "}
            <strong className={targetMode === "TERAKREDITASI" ? "text-emerald-700" : "text-amber-700"}>
              {targetMode === "TERAKREDITASI" ? "Standar Terakreditasi (Ambang SN-Dikti)" : "Target Terakreditasi UNGGUL"}
            </strong>
          </span>
          <span className="text-sky-700">Rujukan: Lampiran 2 & 3 Peraturan BAN-PT No. 35 Tahun 2025</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredIndicators.map((item) => {
            const itemStatus = targetMode === "TERAKREDITASI"
              ? (item.statusTerakreditasi ?? item.status)
              : (item.statusUnggul ?? item.status);
            const isFulfilled = itemStatus === "MEMENUHI";
            const smart = item.smartEvidence;
            const isCriticalTarget = targetMode === "TERAKREDITASI"
              ? item.isSyaratPerluTerakreditasi
              : item.isSyaratPerluUnggul;
            const isCriticalFailed = isCriticalTarget && !isFulfilled;

            return (
              <motion.div
                key={item.nomor}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-3xl p-6 border transition-all shadow-xs hover:shadow-md space-y-4 ${
                  isCriticalFailed
                    ? "border-red-400 bg-red-50/15 ring-1 ring-red-200"
                    : isFulfilled
                    ? "border-slate-200/80"
                    : "border-red-300 bg-red-50/20"
                }`}
              >
                {/* Top Row: Nomor, Kriteria, Sasaran Mutu, Status Syarat */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-sky-900 text-white font-black text-xs flex items-center justify-center">
                      #{item.nomor}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                      {item.kriteria}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700">
                      Sasaran: {item.sasaranMutu}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {item.isSyaratPerluUnggul && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border ${
                        targetMode === "UNGGUL" && !isFulfilled
                          ? "bg-red-100 text-red-900 border-red-300 animate-pulse"
                          : "bg-amber-50 text-amber-900 border-amber-300"
                      }`}>
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Syarat Perlu UNGGUL</span>
                      </span>
                    )}

                    {item.isSyaratPerluTerakreditasi && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border ${
                        isFulfilled
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : "bg-red-100 text-red-900 border-red-300 animate-pulse"
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Syarat Perlu Terakreditasi</span>
                      </span>
                    )}

                    {/* Smart Evidence Status Pill */}
                    {smart && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        smart.digitalEvidenceStatus === "TERSEDIA"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : smart.digitalEvidenceStatus === "PERLU_TINDAKAN"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}>
                        <Database className="w-3 h-3" />
                        <span>
                          {smart.digitalEvidenceStatus === "TERSEDIA"
                            ? "Bukti Digital Siap"
                            : smart.digitalEvidenceStatus === "PERLU_TINDAKAN"
                            ? "Perlu Verifikasi"
                            : "Bukti Digital Kosong"}
                        </span>
                      </span>
                    )}

                    {/* Final Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                        isFulfilled
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isCriticalFailed
                          ? "bg-red-600 text-white shadow-xs"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {isFulfilled ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>MEMENUHI (1)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>BELUM MEMENUHI (0)</span>
                        </>
                      )}
                    </span>

                    {/* LPM Edit Button */}
                    {isLpm && (
                      <button
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Reviu LPM</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Critical Alert Warning Box (Jika Syarat Perlu Target Aktif Belum Terpenuhi) */}
                {isCriticalFailed && (
                  <div className="p-3 rounded-2xl bg-red-100/90 border border-red-300 text-red-950 flex items-start gap-2 text-xs">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>PERINGATAN SYARAT MUTLAK: </strong>
                      Butir ini merupakan Syarat Perlu {targetMode === "UNGGUL" ? "UNGGUL" : "Terakreditasi"}. Belum memenuhi ambang kelayakan pada butir ini menyebabkan institusi tertahan.
                    </div>
                  </div>
                )}

                {/* Indikator Text & Aspek Penilaian Baku BAN-PT */}
                <div className="space-y-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                    {item.indikator}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <strong className="text-slate-800">Aspek Penilaian PTS Akademik: </strong>
                    {item.aspekPenilaian}
                  </p>
                </div>

                {/* Rubrik Pemenuhan: Terakreditasi vs Unggul (Baku BAN-PT 35/2025) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3.5 rounded-2xl border transition-all space-y-1 ${
                    targetMode === "TERAKREDITASI"
                      ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200"
                      : "bg-slate-50/60 border-slate-200 text-slate-500"
                  }`}>
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Standar Terakreditasi (Ambang SN Dikti)</span>
                      </div>
                      {targetMode === "TERAKREDITASI" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-200/60 text-emerald-900 font-black">
                          TARGET AKTIF
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {item.deskripsiTerakreditasi}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border transition-all space-y-1 ${
                    targetMode === "UNGGUL"
                      ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-200"
                      : "bg-slate-50/60 border-slate-200 text-slate-500"
                  }`}>
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Standar Terakreditasi UNGGUL (Melampaui SN Dikti)</span>
                      </div>
                      {targetMode === "UNGGUL" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-900 font-black">
                          TARGET AKTIF
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {item.deskripsiUnggul}
                    </p>
                  </div>
                </div>

                {/* Smart Audit Compliance & Action Box */}
                {smart && (
                  <div className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                    smart.digitalEvidenceStatus === "TERSEDIA"
                      ? "bg-slate-50 border-slate-200"
                      : "bg-red-50/40 border-red-200"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Hasil Audit Digital Sistem: </strong>
                          <span className="text-slate-700">{smart.evidenceSummary}</span>
                        </div>
                      </div>

                      {/* Quick Shortcut to Upload/Verify */}
                      {smart.evidenceHref && (
                        <Link
                          href={smart.evidenceHref}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-[11px] transition-colors shrink-0 shadow-xs"
                        >
                          <span>{smart.evidenceActionLabel}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    {/* Missing requirements tags if any */}
                    {smart.missingRequirements && smart.missingRequirements.length > 0 && (
                      <div className="pt-2 border-t border-red-200/60 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-red-900">Dokumen Belum Terpenuhi:</span>
                        {smart.missingRequirements.map((req, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-red-100 text-red-800 font-semibold"
                          >
                            ✕ {req}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Rubrik Uji Petik Asesor BAN-PT (AK / AL) */}
                    {smart.assessorVerificationChecklist && smart.assessorVerificationChecklist.length > 0 && (
                      <div className="pt-3 border-t border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <FileCheck2 className="w-3.5 h-3.5 text-sky-700" />
                            <span>Rubrik Uji Petik Asesor BAN-PT (AK / AL):</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            PerBAN-PT No. 35/2025
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {smart.assessorVerificationChecklist.map((chk, cIdx) => (
                            <div
                              key={cIdx}
                              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                                chk.verified
                                  ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                                  : "bg-red-50/70 border-red-300 text-red-950"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {chk.verified ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                )}
                                <div className="space-y-1 flex-1">
                                  <span className="font-extrabold text-xs block leading-tight">{chk.item}</span>
                                  <span className={`text-[11px] block ${chk.verified ? "text-emerald-800 font-semibold" : "text-red-700 font-bold"}`}>
                                    {chk.verified ? `✓ Bukti: ${chk.evidenceDoc}` : `✕ Belum Ada: ${chk.evidenceDoc}`}
                                  </span>
                                </div>
                              </div>

                              {/* Action Row per Butir Checklist */}
                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-[10px]">
                                {chk.verified ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {chk.fileUrl ? (
                                      <a
                                        href={chk.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Lihat / Unduh Dokumen</span>
                                      </a>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                                        ✓ Pangkalan Data Aktif
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => openUploadModal(item.nomor, item.indikator, chk)}
                                      className="text-slate-500 hover:text-slate-800 font-semibold hover:underline cursor-pointer"
                                    >
                                      Ganti File
                                    </button>

                                    {chk.fileUrl && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteEvidence(chk.itemKey || `apt-${item.nomor}-${cIdx + 1}`)}
                                        className="text-red-500 hover:text-red-700 font-semibold hover:underline cursor-pointer"
                                      >
                                        Hapus
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => openUploadModal(item.nomor, item.indikator, chk)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black transition-all shadow-xs hover:scale-[1.02] cursor-pointer"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>+ Upload Dokumen / PDF</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Bar: Sumber Data & Catatan Verifikasi LPM */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-semibold">Sumber Bukti Data:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 font-bold">
                      {item.sumberData}
                    </span>
                  </div>

                  <div className="text-slate-700 bg-slate-100/70 px-3 py-1 rounded-xl text-[11px] flex items-center gap-1.5">
                    {item.isReviewedByLpm ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          <strong className="text-emerald-900">Catatan Reviu LPM ({item.updatedBy}): </strong>
                          {item.notes}
                        </span>
                      </>
                    ) : (
                      <>
                        <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>
                          <strong className="text-sky-900">Catatan Verifikasi: </strong>
                          {item.notes}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Smart Evidence Connector (Akses Modul Terkait di MANTAUIKU) */}
                <div className="pt-2.5 border-t border-dashed border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Link2 className="w-3.5 h-3.5 text-sky-600" />
                    <span className="font-semibold">Modul Bukti Terhubung:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {getEvidenceLinks(item.nomor).map((ev, i) => {
                      const IconComp = ev.icon;
                      return (
                        <Link
                          key={i}
                          href={ev.href}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200/80 transition-colors shadow-2xs"
                        >
                          <IconComp className="w-3 h-3 text-sky-600" />
                          <span>{ev.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 7. Modal Reviu & Pembaruan Status Indikator (Khusus LPM) */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setEditingItem(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-black text-sky-700 uppercase tracking-wider">
                  Evaluasi Mandiri Butir #{editingItem.nomor} • {editingItem.kriteria}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Update Keterpenuhan Indikator IAPT 4.1
                </h3>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <strong>Indikator:</strong> {editingItem.indikator}
              </div>

              {/* Smart Evidence info in modal */}
              {editingItem.smartEvidence && (
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-200 text-xs text-sky-900 space-y-1">
                  <strong>Deteksi Bukti Sistem: </strong>
                  <span>{editingItem.smartEvidence.evidenceSummary}</span>
                </div>
              )}

              <form onSubmit={handleSaveEvaluation} className="space-y-4">
                {/* Status Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Status Keterpenuhan Hasil Verifikasi LPM ({targetMode === "TERAKREDITASI" ? "Ambang Terakreditasi" : "Target Unggul"})
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditStatus("MEMENUHI")}
                      className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        editStatus === "MEMENUHI"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>MEMENUHI (Skor 1)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditStatus("BELUM")}
                      className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        editStatus === "BELUM"
                          ? "bg-red-50 border-red-400 text-red-800 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>BELUM MEMENUHI (Skor 0)</span>
                    </button>
                  </div>
                </div>

                {/* Catatan Bukti Fisik */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Catatan Bukti Sahih & Verifikasi Fisik LPM STIMI YAPMI Makassar
                  </label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Contoh: Dokumen SOP lengkap terarsip, Surat Keputusan Ketua STIMI No. ..., data tersinkron di PDDIKTI..."
                    className="w-full p-3 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Feedback message */}
                {feedbackMsg && (
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800">
                    {feedbackMsg}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-sky-600 to-cyan-600 text-white hover:from-sky-700 hover:to-cyan-700 shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isUpdating ? "Menyimpan..." : "Simpan Evaluasi LPM"}</span>
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
