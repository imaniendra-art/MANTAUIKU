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
  AlertCircle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Iapt41LedDocumentBuilder from "./Iapt41LedDocumentBuilder";

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
  if (nomor === 5) {
    return [
      { label: "Standar Kurikulum OBE SPMI", href: "/dashboard/spmi", icon: BookOpen },
      { label: "Evaluasi Dosen oleh Mhs (EDO)", href: "/dashboard/evaluations", icon: FileCheck2 },
    ];
  }
  if (nomor >= 6 && nomor <= 13) {
    return [
      { label: "Data Dosen & Profil Kampus", href: "/dashboard/profile", icon: Building2 },
      { label: "Capaian Dosen (IKU 9 / Rasio)", href: "/dashboard/achievements", icon: Sparkles },
    ];
  }
  if (nomor === 14 || nomor === 15) {
    return [
      { label: "Rekap Tracer Study CDC Alumni", href: "/dashboard/evaluations", icon: FileCheck2 },
      { label: "Capaian IKU 2 (Serapan Kerja)", href: "/dashboard/achievements", icon: Sparkles },
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
  if (nomor === 26 || nomor === 27) {
    return [
      { label: "Evaluasi Layanan Sivitas (EKA)", href: "/dashboard/evaluations", icon: FileCheck2 },
      { label: "Standar Kemahasiswaan SPMI", href: "/dashboard/spmi", icon: BookOpen },
    ];
  }
  if (nomor === 32 || nomor === 33) {
    return [
      { label: "Capaian Kerjasama Mitra (IKU 6)", href: "/dashboard/achievements", icon: Sparkles },
      { label: "Sistem Informasi & Profil", href: "/dashboard/profile", icon: Building2 },
    ];
  }
  if (nomor === 34) {
    return [
      { label: "Survei Kepuasan Sivitas (EKA/EDO)", href: "/dashboard/evaluations", icon: FileCheck2 },
    ];
  }
  if (nomor >= 36 && nomor <= 39) {
    return [
      { label: "Capaian IKU Khas STIM LPI", href: "/dashboard/achievements", icon: Sparkles },
      { label: "Laporan Evaluasi Diri (LED)", href: "/dashboard/reports", icon: FileCheck2 },
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
  onSwitchTab?: (tab: "profiles" | "iapt41" | "criteria" | "dl05") => void;
}

export default function Iapt41DashboardWidget({
  data,
  isLpm,
  onRefresh,
  onSwitchTab,
}: Iapt41DashboardWidgetProps) {
  // Dual Mode Target: "TERAKREDITASI" (Default Hijau/Aman) vs "UNGGUL" (Eskalasi)
  const [targetMode, setTargetMode] = useState<"TERAKREDITASI" | "UNGGUL">("TERAKREDITASI");
  // Sub-Tab Navigation: "matriks" vs "led_builder"
  const [activeIaptSubTab, setActiveIaptSubTab] = useState<"matriks" | "led_builder">("matriks");
  // Toggle Pusat Unduh Regulasi & Template (Hemat ruang)
  const [showDownloadCenter, setShowDownloadCenter] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCram, setSelectedCram] = useState<"ALL" | "C" | "R" | "A" | "M">("ALL");
  const [filterSpecial, setFilterSpecial] = useState<
    "ALL" | "CRITICAL_ALERT" | "SYARAT_UNGGUL" | "SYARAT_TERAKREDITASI" | "BUKTI_KOSONG" | "BUKTI_TERSEDIA" | "BUKTI_PERLU_TINDAKAN"
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
    } else if (filterSpecial === "BUKTI_PERLU_TINDAKAN") {
      matchesSpecial = item.smartEvidence?.digitalEvidenceStatus === "PERLU_TINDAKAN";
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

      {/* SUB-TAB NAVIGATOR: MATRIKS 39 BUTIR vs DOKUMEN LED RESMI BAN-PT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveIaptSubTab("matriks")}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeIaptSubTab === "matriks"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <FileSpreadsheet className={`w-4 h-4 ${activeIaptSubTab === "matriks" ? "text-sky-600" : "text-slate-400"}`} />
            <span>Matriks 39 Indikator & Smart Audit CRAM</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
              39 Butir
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveIaptSubTab("led_builder")}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeIaptSubTab === "led_builder"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <FileText className={`w-4 h-4 ${activeIaptSubTab === "led_builder" ? "text-emerald-600" : "text-slate-400"}`} />
            <span>Dokumen LED BAN-PT (Penyusunan & Cetak 1:1)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Format Baku
            </span>
          </button>
        </div>

        {/* Action Button: Toggle Download Center (Ringkas & Hemat Tempat) */}
        {activeIaptSubTab === "matriks" && (
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
            <span>Unduh Regulasi & Template</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDownloadCenter ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {activeIaptSubTab === "led_builder" && (
        <Iapt41LedDocumentBuilder
          isLpm={isLpm}
          indicators={data.indicators}
          summary={data}
        />
      )}

      {activeIaptSubTab === "matriks" && (
        <>
          {/* Pusat Unduh Dokumen (Collapsible Drawer - Muncul saat tombol di klik) */}
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
                        Regulasi Resmi BAN-PT 2025/2026
                      </span>
                      <span className="text-xs font-bold text-sky-200">Peraturan BAN-PT No. 35 Tahun 2025</span>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                    {/* 1. Salinan PerBAN-PT 35/2025 */}
                    <a
                      href="/uploads/accreditation/templates/Peraturan_BAN_PT_No_35_Tahun_2025_IAPT_4_1.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 transition-all flex flex-col justify-between gap-2.5 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-cyan-300 font-bold text-[11px]">
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>Salinan Regulasi Resmi (PDF)</span>
                        </div>
                        <strong className="block text-white font-extrabold text-xs group-hover:text-cyan-200 transition-colors">
                          Peraturan BAN-PT No. 35 Tahun 2025 tentang IAPT 4.1
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
                      className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 transition-all flex flex-col justify-between gap-2.5 group"
                    >
                      <div className="space-y-1">
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4 Pilar C-R-A-M (Sekaligus Tombol Filter Interaktif Kategori) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Culture */}
            <div 
              onClick={() => setSelectedCram(selectedCram === "C" ? "ALL" : "C")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group select-none ${
                selectedCram === "C"
                  ? "bg-sky-50 border-sky-500 shadow-md ring-2 ring-sky-400"
                  : "bg-white border-slate-200/90 hover:border-sky-300 hover:shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg transition-colors ${
                  selectedCram === "C" ? "bg-sky-600 text-white" : "bg-sky-100 text-sky-800"
                }`}>
                  C • CULTURE
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {data.cramScores.C.fulfilled}/{data.cramScores.C.total} Butir
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                Budaya Mutu
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                SPMI Siklus PPEPP, kepatuhan AMI, pelaporan PDDIKTI, & akreditasi prodi.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="bg-sky-600 h-full rounded-full transition-all"
                  style={{ width: `${(data.cramScores.C.fulfilled / data.cramScores.C.total) * 100}%` }}
                />
              </div>
              {selectedCram === "C" && (
                <div className="mt-2 text-[10px] font-black text-sky-700 flex items-center justify-between">
                  <span>✓ Filter Aktif</span>
                  <span className="text-slate-400 font-normal">Klik untuk reset</span>
                </div>
              )}
            </div>

            {/* Relevance */}
            <div 
              onClick={() => setSelectedCram(selectedCram === "R" ? "ALL" : "R")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group select-none ${
                selectedCram === "R"
                  ? "bg-cyan-50 border-cyan-500 shadow-md ring-2 ring-cyan-400"
                  : "bg-white border-slate-200/90 hover:border-cyan-300 hover:shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg transition-colors ${
                  selectedCram === "R" ? "bg-cyan-600 text-white" : "bg-cyan-100 text-cyan-800"
                }`}>
                  R • RELEVANCE
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {data.cramScores.R.fulfilled}/{data.cramScores.R.total} Butir
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-cyan-700 transition-colors">
                Relevansi Tridharma
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                Kurikulum OBE, rasio DTPS & S3, riset LPPM Sinta/Scopus, PkM, & Tracer Study.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="bg-cyan-600 h-full rounded-full transition-all"
                  style={{ width: `${(data.cramScores.R.fulfilled / data.cramScores.R.total) * 100}%` }}
                />
              </div>
              {selectedCram === "R" && (
                <div className="mt-2 text-[10px] font-black text-cyan-700 flex items-center justify-between">
                  <span>✓ Filter Aktif</span>
                  <span className="text-slate-400 font-normal">Klik untuk reset</span>
                </div>
              )}
            </div>

            {/* Accountability */}
            <div 
              onClick={() => setSelectedCram(selectedCram === "A" ? "ALL" : "A")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group select-none ${
                selectedCram === "A"
                  ? "bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-400"
                  : "bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg transition-colors ${
                  selectedCram === "A" ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-800"
                }`}>
                  A • ACCOUNTABILITY
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {data.cramScores.A.fulfilled}/{data.cramScores.A.total} Butir
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                Akuntabilitas
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                Tata kelola GUG, Satgas PPKS, manajemen POAC, kepuasan sivitas, & KAP WTP.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${(data.cramScores.A.fulfilled / data.cramScores.A.total) * 100}%` }}
                />
              </div>
              {selectedCram === "A" && (
                <div className="mt-2 text-[10px] font-black text-indigo-700 flex items-center justify-between">
                  <span>✓ Filter Aktif</span>
                  <span className="text-slate-400 font-normal">Klik untuk reset</span>
                </div>
              )}
            </div>

            {/* Mission */}
            <div 
              onClick={() => setSelectedCram(selectedCram === "M" ? "ALL" : "M")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group select-none ${
                selectedCram === "M"
                  ? "bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-400"
                  : "bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg transition-colors ${
                  selectedCram === "M" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-800"
                }`}>
                  M • MISSION
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {data.cramScores.M.fulfilled}/{data.cramScores.M.total} Butir
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                Diferensiasi Misi
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                Keunggulan khas Sekolah Tinggi Ilmu Manajemen & rekognisi institusi.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${(data.cramScores.M.fulfilled / data.cramScores.M.total) * 100}%` }}
                />
              </div>
              {selectedCram === "M" && (
                <div className="mt-2 text-[10px] font-black text-emerald-700 flex items-center justify-between">
                  <span>✓ Filter Aktif</span>
                  <span className="text-slate-400 font-normal">Klik untuk reset</span>
                </div>
              )}
            </div>
          </div>

          {/* 5. Bar Pencarian & Filter Cepat (Single Streamlined Row) */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari indikator, aspek penilaian, atau kata kunci..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
              {searchTerm && (
                <button 
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills (Status & Kategori) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {selectedCram !== "ALL" && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-100 text-sky-900 font-bold border border-sky-300">
                  <span>Pilar: {selectedCram === "C" ? "Culture" : selectedCram === "R" ? "Relevance" : selectedCram === "A" ? "Accountability" : "Mission"}</span>
                  <button 
                    type="button"
                    onClick={() => setSelectedCram("ALL")} 
                    className="hover:bg-sky-200 rounded p-0.5 cursor-pointer"
                    title="Hapus filter pilar"
                  >
                    <X className="w-3 h-3 text-sky-800" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setFilterSpecial("ALL")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterSpecial === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                Semua ({data.totalIndicators})
              </button>

              {activeCriticalCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterSpecial(filterSpecial === "CRITICAL_ALERT" ? "ALL" : "CRITICAL_ALERT")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    filterSpecial === "CRITICAL_ALERT"
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                  <span>Butir Kritis ({activeCriticalCount})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setFilterSpecial(filterSpecial === "BUKTI_TERSEDIA" ? "ALL" : "BUKTI_TERSEDIA")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "BUKTI_TERSEDIA"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lengkap ({data.digitalReadiness?.availableCount ?? 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial(filterSpecial === "BUKTI_PERLU_TINDAKAN" ? "ALL" : "BUKTI_PERLU_TINDAKAN")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "BUKTI_PERLU_TINDAKAN"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Perlu Tindakan ({data.digitalReadiness?.actionRequiredCount ?? 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial(filterSpecial === "BUKTI_KOSONG" ? "ALL" : "BUKTI_KOSONG")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "BUKTI_KOSONG"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Belum Terisi ({data.digitalReadiness?.missingCount ?? 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial(filterSpecial === "SYARAT_TERAKREDITASI" ? "ALL" : "SYARAT_TERAKREDITASI")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "SYARAT_TERAKREDITASI"
                    ? "bg-sky-700 text-white shadow-xs"
                    : "bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200"
                }`}
              >
                <span>Syarat Terakreditasi (5)</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterSpecial(filterSpecial === "SYARAT_UNGGUL" ? "ALL" : "SYARAT_UNGGUL")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterSpecial === "SYARAT_UNGGUL"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Syarat Unggul (8)</span>
              </button>
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

                {/* Kotak Hibrida Sinkronisasi Sistem & Bukti Digital (Opsi B) */}
                {smart && (
                  <div
                    className={`p-4 rounded-2xl border text-xs space-y-3.5 transition-all ${
                      smart.digitalEvidenceStatus === "TERSEDIA"
                        ? "bg-slate-50/90 border-slate-200/90 shadow-2xs"
                        : smart.digitalEvidenceStatus === "PERLU_TINDAKAN"
                        ? "bg-amber-50/50 border-amber-200/90"
                        : "bg-red-50/40 border-red-200/90"
                    }`}
                  >
                    {/* Header Kotak Hibrida: Status Sinkronisasi Pangkalan Data & Tombol Menu Terhubung */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            smart.digitalEvidenceStatus === "TERSEDIA"
                              ? "bg-emerald-600/10 text-emerald-700"
                              : smart.digitalEvidenceStatus === "PERLU_TINDAKAN"
                              ? "bg-amber-600/10 text-amber-700"
                              : "bg-red-600/10 text-red-700"
                          }`}
                        >
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 text-xs">
                              Sinkronisasi Pangkalan Data & Audit Digital
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                                smart.digitalEvidenceStatus === "TERSEDIA"
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : smart.digitalEvidenceStatus === "PERLU_TINDAKAN"
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : "bg-red-100 text-red-900 border-red-300"
                              }`}
                            >
                              {smart.digitalEvidenceStatus === "TERSEDIA" ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Pangkalan Data Terhubung Aktif</span>
                                </>
                              ) : smart.digitalEvidenceStatus === "PERLU_TINDAKAN" ? (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>Perlu Berkas / Tindakan</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-red-600" />
                                  <span>Belum Ada Bukti Digital</span>
                                </>
                              )}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                            {smart.evidenceSummary}
                          </p>
                        </div>
                      </div>

                      {/* Tombol Akses Cepat Langsung ke Modul Terhubung */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start md:self-center">
                        {getEvidenceLinks(item.nomor).map((ev, i) => {
                          const IconComp = ev.icon;
                          if (ev.href === "/dashboard/accreditation" && onSwitchTab) {
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => onSwitchTab("profiles")}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white text-[11px] font-bold transition-all shadow-xs hover:scale-[1.02] cursor-pointer"
                              >
                                <IconComp className="w-3.5 h-3.5 text-amber-300" />
                                <span>{ev.label} (Buka Tab 1)</span>
                                <ArrowRight className="w-3 h-3 text-sky-200" />
                              </button>
                            );
                          }
                          return (
                            <Link
                              key={i}
                              href={ev.href}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white text-[11px] font-bold transition-all shadow-xs hover:scale-[1.02]"
                            >
                              <IconComp className="w-3.5 h-3.5 text-sky-300" />
                              <span>{ev.label}</span>
                              <ExternalLink className="w-3 h-3 text-sky-200" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Missing requirements tags if any */}
                    {smart.missingRequirements && smart.missingRequirements.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-red-100/50 border border-red-200/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-black text-red-900">Perlu Dilengkapi:</span>
                        {smart.missingRequirements.map((req, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-red-100 text-red-800 font-bold border border-red-200"
                          >
                            ✕ {req}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Rubrik Uji Petik Asesor BAN-PT (AK / AL) */}
                    {smart.assessorVerificationChecklist && smart.assessorVerificationChecklist.length > 0 && (
                      <div className="pt-2 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <FileCheck2 className="w-3.5 h-3.5 text-sky-700" />
                            <span>Rubrik Uji Petik Asesor BAN-PT (AK / AL):</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Rujukan: PerBAN-PT No. 35/2025
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {smart.assessorVerificationChecklist.map((chk, cIdx) => (
                            <div
                              key={cIdx}
                              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                                chk.verified
                                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs"
                                  : "bg-red-50/80 border-red-300 text-red-950 shadow-2xs"
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

                              {/* Action Row per Butir Checklist: Hybrid Pangkalan Data + Manual File */}
                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-[10px] flex-wrap">
                                {chk.verified ? (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {chk.fileUrl ? (
                                      <div className="flex items-center gap-1.5">
                                        <a
                                          href={chk.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          <span>{chk.fileName ? `Lihat Berkas (${chk.fileName})` : "Lihat / Unduh Dokumen"}</span>
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteEvidence(chk.itemKey || `apt-${item.nomor}-${cIdx + 1}`)}
                                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                          title="Hapus berkas fisik"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                                        <Database className="w-3 h-3 text-emerald-700" />
                                        <span>Pangkalan Data Terhubung Aktif</span>
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => openUploadModal(item.nomor, item.indikator, chk)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold transition-colors cursor-pointer"
                                    >
                                      <Upload className="w-2.5 h-2.5 text-slate-500" />
                                      <span>{chk.fileUrl ? "Ganti Berkas" : "+ Upload SK / File Fisik"}</span>
                                    </button>
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
              </motion.div>
            );
          })}
        </div>
      </div>
        </>
      )}

      {/* Modal Upload Berkas Dokumen Fisik Indikator IAPT 4.1 */}
      <AnimatePresence>
        {uploadModalItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-black text-xs">
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Upload Bukti Digital • Butir #{uploadModalItem.nomor}</span>
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
                    placeholder="Contoh: SK Ketua Nomor ... tentang penetapan standar / pedoman..."
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
