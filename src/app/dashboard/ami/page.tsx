"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  ExternalLink, 
  Printer, 
  FileText, 
  X,
  Calendar,
  Building,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IAmiPeriod {
  _id: string;
  academicYear: string;
  cycleNumber: number;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  rtmDate?: string;
}

interface IAmiFinding {
  _id: string;
  periodId: string;
  auditeeKey: string;
  auditeeName: string;
  standardRef: string;
  category: "KTS_MAYOR" | "KTS_MINOR" | "OB";
  description: string;
  auditorName: string;
  status: "OPEN" | "IN_PROGRESS" | "UNDER_REVIEW" | "CLOSED";
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  picName?: string;
  dueDate?: string;
  evidenceUrl?: string;
  evidenceNotes?: string;
  auditorFeedback?: string;
  closedAt?: string;
  createdAt: string;
}

interface IAmiSummary {
  period?: IAmiPeriod;
  totalFindings: number;
  categories: { mayor: number; minor: number; ob: number };
  statuses: { open: number; inProgress: number; underReview: number; closed: number };
  closingRate: number;
  byAuditee: Array<{
    key: string;
    name: string;
    total: number;
    mayor: number;
    minor: number;
    ob: number;
    closed: number;
  }>;
}

const AUDITEES = [
  { key: "all", name: "Semua Unit (10)" },
  { key: "prodi", name: "Program Studi Manajemen" },
  { key: "lppm", name: "UPT. LPPM" },
  { key: "baak", name: "UPT. BAAK" },
  { key: "pusdatin", name: "UPT. Pusdatin" },
  { key: "perpustakaan", name: "UPT. Perpustakaan" },
  { key: "lab_komputer", name: "UPT. Lab. Komputer" },
  { key: "keuangan", name: "UPT. Keuangan Rutin" },
  { key: "umum_kerjasama", name: "UPT. Umum & Kerjasama" },
  { key: "kemahasiswaan", name: "UPT. Kemahasiswaan & Alumni" },
  { key: "humas", name: "UPT. Humas" },
];

export default function AmiDashboardPage() {
  const { data: session } = useSession();
  const [periods, setPeriods] = useState<IAmiPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<IAmiPeriod | null>(null);
  const [findings, setFindings] = useState<IAmiFinding[]>([]);
  const [summary, setSummary] = useState<IAmiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters
  const [selectedAuditee, setSelectedAuditee] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Modals
  const [selectedFinding, setSelectedFinding] = useState<IAmiFinding | null>(null);
  const [isRtlModalOpen, setIsRtlModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isAddFindingModalOpen, setIsAddFindingModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form States
  const [rtlForm, setRtlForm] = useState({
    rootCause: "",
    correctiveAction: "",
    preventiveAction: "",
    picName: "",
    dueDate: "",
    evidenceUrl: "",
    evidenceNotes: "",
  });

  const [verifyForm, setVerifyForm] = useState({
    auditorFeedback: "",
  });

  const [newFindingForm, setNewFindingForm] = useState({
    auditeeKey: "prodi",
    auditeeName: "Program Studi Manajemen",
    standardRef: "",
    category: "KTS_MINOR" as "KTS_MAYOR" | "KTS_MINOR" | "OB",
    description: "",
    auditorName: "Tim Auditor LPM",
    dueDate: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const isLPM = session?.user?.role === "LPM";

  // 1. Fetch Periods & Summary on mount
  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [periodsRes, summaryRes] = await Promise.all([
          fetch("/api/ami/periods"),
          fetch("/api/ami/summary"),
        ]);

        const periodsData = await periodsRes.json();
        const summaryData = await summaryRes.json();

        if (!ignore) {
          if (periodsData.success && periodsData.data.length > 0) {
            setPeriods(periodsData.data);
            setActivePeriod(periodsData.data[0]);
          }
          if (summaryData.success) {
            setSummary(summaryData.data);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load AMI initial data:", err);
        if (!ignore) setLoading(false);
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, []);

  // 2. Fetch Findings whenever activePeriod, filters, or refreshTrigger changes
  useEffect(() => {
    if (!activePeriod) return;
    const currentPeriodId = activePeriod._id;
    let ignore = false;

    async function loadFindings() {
      try {
        const params = new URLSearchParams({
          periodId: currentPeriodId,
          auditeeKey: selectedAuditee,
          category: selectedCategory,
          status: selectedStatus,
          search,
        });

        const res = await fetch(`/api/ami/findings?${params.toString()}`);
        const data = await res.json();
        if (!ignore && data.success) {
          setFindings(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch findings:", err);
      }
    }

    loadFindings();
    return () => {
      ignore = true;
    };
  }, [activePeriod, selectedAuditee, selectedCategory, selectedStatus, search, refreshTrigger]);

  // Open RTL Form Modal
  const openRtlModal = (finding: IAmiFinding) => {
    setSelectedFinding(finding);
    setRtlForm({
      rootCause: finding.rootCause || "",
      correctiveAction: finding.correctiveAction || "",
      preventiveAction: finding.preventiveAction || "",
      picName: finding.picName || "",
      dueDate: finding.dueDate ? finding.dueDate.split("T")[0] : "",
      evidenceUrl: finding.evidenceUrl || "",
      evidenceNotes: finding.evidenceNotes || "",
    });
    setIsRtlModalOpen(true);
  };

  // Submit RTL Form
  const handleSubmitRtl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFinding) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/ami/findings/${selectedFinding._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_rtl",
          ...rtlForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsRtlModalOpen(false);
        setRefreshTrigger((t) => t + 1);
        // Refresh summary
        const summaryRes = await fetch(`/api/ami/summary?periodId=${activePeriod?._id}`);
        const summaryData = await summaryRes.json();
        if (summaryData.success) setSummary(summaryData.data);
      } else {
        alert(data.error || "Gagal menyimpan formulir PTK.");
      }
    } catch (err) {
      console.error("Error submitting RTL:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Verification Modal
  const openVerifyModal = (finding: IAmiFinding) => {
    setSelectedFinding(finding);
    setVerifyForm({
      auditorFeedback: finding.auditorFeedback || "",
    });
    setIsVerifyModalOpen(true);
  };

  // Submit Verification (Close or Request Revision)
  const handleVerify = async (action: "close_finding" | "request_revision") => {
    if (!selectedFinding) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/ami/findings/${selectedFinding._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          auditorFeedback: verifyForm.auditorFeedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsVerifyModalOpen(false);
        setRefreshTrigger((t) => t + 1);
        const summaryRes = await fetch(`/api/ami/summary?periodId=${activePeriod?._id}`);
        const summaryData = await summaryRes.json();
        if (summaryData.success) setSummary(summaryData.data);
      } else {
        alert(data.error || "Gagal memverifikasi temuan.");
      }
    } catch (err) {
      console.error("Error verifying finding:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Create New Finding (LPM Only)
  const handleCreateFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriod) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/ami/findings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId: activePeriod._id,
          ...newFindingForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddFindingModalOpen(false);
        setNewFindingForm({
          auditeeKey: "prodi",
          auditeeName: "Program Studi Manajemen",
          standardRef: "",
          category: "KTS_MINOR",
          description: "",
          auditorName: "Tim Auditor LPM",
          dueDate: "",
        });
        setRefreshTrigger((t) => t + 1);
        const summaryRes = await fetch(`/api/ami/summary?periodId=${activePeriod._id}`);
        const summaryData = await summaryRes.json();
        if (summaryData.success) setSummary(summaryData.data);
      } else {
        alert(data.error || "Gagal mencatat temuan.");
      }
    } catch (err) {
      console.error("Error creating finding:", err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-sky-950/10 border border-sky-700/30">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-cyan-200 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span>Siklus PPEPP • Audit Mutu Internal (AMI) STIMI YAPMI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Audit Mutu Internal & Tindak Lanjut KTS/OB
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed">
            Sistem pengawasan standar akreditasi LAMEMBA C.9 dan Permendiktisaintek No. 39/2025 jo. No. 10/2026. Pantau temuan ketidaksesuaian, formulir PTK/RTL, hingga verifikasi closing menuju RTM.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Cycle selector / badge */}
          {periods.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs">
              <Calendar className="w-3.5 h-3.5 text-cyan-300" />
              <span>Siklus {activePeriod?.cycleNumber || 9} ({activePeriod?.academicYear || "2025/2026"})</span>
            </div>
          )}

          {/* Print Report Button */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-cyan-300" />
            <span>Cetak Berita Acara AMI</span>
          </button>

          {/* Add Finding Button (LPM Only) */}
          {isLPM && (
            <button
              onClick={() => setIsAddFindingModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Temuan Baru</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Memuat data Audit Mutu Internal...</p>
        </div>
      ) : (
        <>
          {/* 2. Top Metric Cards (5 Indikator Utama) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Temuan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Temuan</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {summary?.totalFindings || 0}
          </div>
          <p className="text-[11px] text-slate-400">10 Unit Auditee STIMI</p>
        </div>

        {/* Card 2: KTS Mayor */}
        <div className="bg-white p-5 rounded-2xl border border-red-200/80 shadow-xs space-y-2 bg-gradient-to-b from-red-50/30 to-white">
          <div className="flex items-center justify-between text-red-600 text-xs font-bold uppercase tracking-wider">
            <span>KTS Mayor</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600">
            {summary?.categories?.mayor || 0}
          </div>
          <p className="text-[11px] text-red-500 font-medium">Prioritas Kritis Akreditasi</p>
        </div>

        {/* Card 3: KTS Minor */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs space-y-2 bg-gradient-to-b from-amber-50/30 to-white">
          <div className="flex items-center justify-between text-amber-600 text-xs font-bold uppercase tracking-wider">
            <span>KTS Minor</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {summary?.categories?.minor || 0}
          </div>
          <p className="text-[11px] text-amber-600 font-medium">Deviasi SOP Internal</p>
        </div>

        {/* Card 4: OB (Observasi) */}
        <div className="bg-white p-5 rounded-2xl border border-sky-200/80 shadow-xs space-y-2 bg-gradient-to-b from-sky-50/30 to-white">
          <div className="flex items-center justify-between text-sky-600 text-xs font-bold uppercase tracking-wider">
            <span>Observasi (OB)</span>
            <Info className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-600">
            {summary?.categories?.ob || 0}
          </div>
          <p className="text-[11px] text-sky-600 font-medium">Peluang Peningkatan Mutu</p>
        </div>

        {/* Card 5: Closing Rate */}
        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-2 bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <span>Closing Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {summary?.closingRate || 0}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${summary?.closingRate || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Filter Navigation & Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        {/* Horizontal Auditee Tabs (10 Unit STIMI YAPMI) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-sky-600" />
              Filter Auditee (Unit yang Diaudit Sesuai Struktur STIMI):
            </span>
            <span className="text-[11px] text-slate-400">Pilih unit untuk melihat temuan khusus</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {AUDITEES.map((aud) => (
              <button
                key={aud.key}
                onClick={() => setSelectedAuditee(aud.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedAuditee === aud.key
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {aud.name}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter & Search Input */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari butir standar, kata kunci temuan, atau akar masalah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filter Kategori */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="all">Semua Kategori Temuan</option>
              <option value="KTS_MAYOR">🔴 KTS Mayor (Kritis)</option>
              <option value="KTS_MINOR">🟡 KTS Minor (Deviasi SOP)</option>
              <option value="OB">🔵 Observasi (Peluang)</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="all">Semua Status Penyelesaian</option>
              <option value="OPEN">⚪ Open (Belum Diisi)</option>
              <option value="IN_PROGRESS">🟡 In Progress (Tindak Lanjut)</option>
              <option value="UNDER_REVIEW">🔵 Under Review (Menunggu Auditor)</option>
              <option value="CLOSED">🟢 Closed (Tuntas)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Findings List Cards / Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Daftar Temuan Audit</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
              {findings.length} Data
            </span>
          </h2>
          <span className="text-xs text-slate-500">
            Siklus: <strong>{activePeriod?.title || "Aktif"}</strong>
          </span>
        </div>

        {findings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Tidak ada temuan audit yang sesuai kriteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Semua standar pada unit ini telah sesuai atau filter yang dipilih tidak memiliki rekaman temuan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {findings.map((item) => {
              const isClosed = item.status === "CLOSED";
              const isUnderReview = item.status === "UNDER_REVIEW";
              const isInProgress = item.status === "IN_PROGRESS";

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-3xl p-6 border transition-all hover:shadow-md space-y-4 ${
                    isClosed
                      ? "border-emerald-200/80 bg-emerald-50/10"
                      : item.category === "KTS_MAYOR"
                      ? "border-red-200/80"
                      : "border-slate-200/80"
                  }`}
                >
                  {/* Top Line: Badges & Standard Ref */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Category Badge */}
                      {item.category === "KTS_MAYOR" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          KTS MAYOR
                        </span>
                      )}
                      {item.category === "KTS_MINOR" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          KTS MINOR
                        </span>
                      )}
                      {item.category === "OB" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-700 border border-sky-200">
                          <Info className="w-3.5 h-3.5" />
                          OBSERVASI
                        </span>
                      )}

                      {/* Auditee Name Badge */}
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.auditeeName}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isClosed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          CLOSED / TUNTAS
                        </span>
                      )}
                      {isUnderReview && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-700 border border-sky-200 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          MENUNGGU VERIFIKASI AUDITOR
                        </span>
                      )}
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          IN PROGRESS (TINDAK LANJUT)
                        </span>
                      )}
                      {item.status === "OPEN" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
                          OPEN (BELUM DIISI)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Standard Ref & Finding Description */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-black text-sky-700 uppercase tracking-tight block">
                      {item.standardRef}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Root Cause & Corrective Action (If filled) */}
                  {item.rootCause && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <span className="font-extrabold text-slate-600 block mb-0.5">
                            🔍 Akar Masalah (Root Cause):
                          </span>
                          <p className="text-slate-800 font-medium leading-relaxed">
                            {item.rootCause}
                          </p>
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-600 block mb-0.5">
                            🛠️ Rencana Tindakan Koreksi:
                          </span>
                          <p className="text-slate-800 font-medium leading-relaxed">
                            {item.correctiveAction}
                          </p>
                        </div>
                      </div>

                      {/* Evidence Link */}
                      {item.evidenceUrl && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                          <span className="text-slate-500 font-medium">
                            Dokumen Bukti Perbaikan:
                          </span>
                          <a
                            href={item.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-bold hover:underline"
                          >
                            <span>Buka Bukti Dukung</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {/* Auditor Feedback if any */}
                      {item.auditorFeedback && (
                        <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-900">
                          <span className="font-bold block text-[11px] mb-0.5">
                            Catatan Verifikator LPM:
                          </span>
                          <p className="text-xs font-medium leading-relaxed">
                            {item.auditorFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Meta & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Auditor: <strong>{item.auditorName}</strong></span>
                      </span>
                      {item.dueDate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tenggat: <strong>{new Date(item.dueDate).toLocaleDateString("id-ID")}</strong></span>
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Button for Auditee to fill PTK / RTL */}
                      <button
                        onClick={() => openRtlModal(item)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.rootCause ? "Perbarui PTK / RTL" : "Isi PTK / RTL"}</span>
                      </button>

                      {/* Button for LPM / Auditor to Verify */}
                      {isLPM && !isClosed && (
                        <button
                          onClick={() => openVerifyModal(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold text-xs shadow-xs transition-all"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verifikasi Closing</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
        </>
      )}

      {/* 5. MODAL FORM PTK & RTL (Permintaan Tindakan Koreksi) */}
      <AnimatePresence>
        {isRtlModalOpen && selectedFinding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black uppercase">
                    Formulir PTK & RTL SPMI
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Tindak Lanjut Temuan Audit Mutu
                  </h3>
                </div>
                <button
                  onClick={() => setIsRtlModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Finding Snapshot */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sky-800">{selectedFinding.auditeeName}</span>
                  <span className="font-bold text-slate-500">{selectedFinding.standardRef}</span>
                </div>
                <p className="text-slate-800 font-medium">{selectedFinding.description}</p>
              </div>

              <form onSubmit={handleSubmitRtl} className="space-y-4 text-xs">
                {/* Akar Masalah */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>1. Analisis Akar Masalah (Root Cause Analysis / 5-Why)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Jelaskan secara mendalam penyebab utama terjadinya ketidaksesuaian ini..."
                    value={rtlForm.rootCause}
                    onChange={(e) => setRtlForm({ ...rtlForm, rootCause: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Tindakan Koreksi Langsung */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <span>2. Rencana Tindakan Koreksi (Corrective Action)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Langkah konkret apa yang dilakukan untuk menyelesaikan temuan ini..."
                    value={rtlForm.correctiveAction}
                    onChange={(e) => setRtlForm({ ...rtlForm, correctiveAction: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Tindakan Pencegahan */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    3. Rencana Tindakan Pencegahan (Preventive Action)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Kebijakan / SOP apa yang diterapkan agar masalah serupa tidak terulang..."
                    value={rtlForm.preventiveAction}
                    onChange={(e) => setRtlForm({ ...rtlForm, preventiveAction: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PIC Penanggung Jawab */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Penanggung Jawab (PIC)</label>
                    <input
                      type="text"
                      placeholder="e.g. Kaprodi / Kepala UPT"
                      value={rtlForm.picName}
                      onChange={(e) => setRtlForm({ ...rtlForm, picName: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Target Tanggal Selesai */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Target Tanggal Selesai (Due Date)</label>
                    <input
                      type="date"
                      value={rtlForm.dueDate}
                      onChange={(e) => setRtlForm({ ...rtlForm, dueDate: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Evidence Link */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Link Bukti Perbaikan (Google Drive / URL Dokumen)</span>
                    <span className="text-slate-400 font-normal">Wajib jika ingin diverifikasi Closing</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={rtlForm.evidenceUrl}
                    onChange={(e) => setRtlForm({ ...rtlForm, evidenceUrl: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRtlModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-extrabold shadow-md shadow-sky-600/20 hover:from-sky-700 hover:to-cyan-700 transition-all disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : "Kirim Formulir PTK / RTL"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODAL VERIFIKASI CLOSING (Khusus LPM / Auditor) */}
      <AnimatePresence>
        {isVerifyModalOpen && selectedFinding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Verifikasi Auditor Mutu
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Pemeriksaan Hasil Tindak Lanjut
                  </h3>
                </div>
                <button
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Finding & Evidence Review */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div>
                  <span className="font-bold text-slate-500 block mb-0.5">Auditee:</span>
                  <span className="font-black text-slate-800">{selectedFinding.auditeeName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block mb-0.5">Tindakan Koreksi:</span>
                  <p className="font-medium text-slate-800">{selectedFinding.correctiveAction || "Belum diisi"}</p>
                </div>
                {selectedFinding.evidenceUrl ? (
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                    <span className="font-bold text-sky-900">Bukti Perbaikan:</span>
                    <a
                      href={selectedFinding.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sky-700 font-extrabold hover:underline"
                    >
                      <span>Buka Tautan Bukti</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 font-medium">
                    ⚠️ Auditee belum melampirkan tautan bukti perbaikan.
                  </div>
                )}
              </div>

              {/* Feedback Field */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">
                  Catatan Evaluasi / Feedback Auditor:
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan catatan evaluasi terhadap bukti yang telah diperiksa..."
                  value={verifyForm.auditorFeedback}
                  onChange={(e) => setVerifyForm({ auditorFeedback: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Verification Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => handleVerify("request_revision")}
                  disabled={submitting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 font-extrabold transition-colors"
                >
                  Kembalikan untuk Perbaikan
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify("close_finding")}
                  disabled={submitting || !selectedFinding.evidenceUrl}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {submitting ? "Memproses..." : "Setujui & Tutup Temuan (Closed)"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. MODAL TAMBAH TEMUAN AUDIT BARU (LPM Only) */}
      <AnimatePresence>
        {isAddFindingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase">
                    Instrumen Audit Mutu
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Catat Temuan Ketidaksesuaian Baru
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddFindingModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFinding} className="space-y-4 text-xs">
                {/* Pilih Auditee dari 10 Unit */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Unit yang Diaudit (Auditee):</label>
                  <select
                    value={newFindingForm.auditeeKey}
                    onChange={(e) => {
                      const found = AUDITEES.find((a) => a.key === e.target.value);
                      setNewFindingForm({
                        ...newFindingForm,
                        auditeeKey: e.target.value,
                        auditeeName: found ? found.name : "",
                      });
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none font-semibold text-slate-800"
                  >
                    {AUDITEES.filter((a) => a.key !== "all").map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Klasifikasi Temuan & Butir Standar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Klasifikasi Temuan Baku:</label>
                    <select
                      value={newFindingForm.category}
                      onChange={(e) =>
                        setNewFindingForm({
                          ...newFindingForm,
                          category: e.target.value as "KTS_MAYOR" | "KTS_MINOR" | "OB",
                        })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-800"
                    >
                      <option value="KTS_MAYOR">🔴 KTS Mayor (Kritis Akreditasi)</option>
                      <option value="KTS_MINOR">🟡 KTS Minor (Deviasi SOP)</option>
                      <option value="OB">🔵 Observasi (Peluang Mutu)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Rujukan Standar SPMI / LAMEMBA:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LAMEMBA C.6.3 / Standar Sarpras STIMI"
                      value={newFindingForm.standardRef}
                      onChange={(e) =>
                        setNewFindingForm({ ...newFindingForm, standardRef: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                </div>

                {/* Deskripsi Temuan */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">
                    Uraian Fakta Temuan Ketidaksesuaian:
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Uraikan secara jelas kondisi fakta yang tidak sesuai dengan standar mutu acuan..."
                    value={newFindingForm.description}
                    onChange={(e) =>
                      setNewFindingForm({ ...newFindingForm, description: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Auditor Penilai */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Nama Auditor Penilai:</label>
                    <input
                      type="text"
                      required
                      value={newFindingForm.auditorName}
                      onChange={(e) =>
                        setNewFindingForm({ ...newFindingForm, auditorName: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>

                  {/* Tenggat Waktu Penyelesaian */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Batas Waktu Perbaikan (Due Date):</label>
                    <input
                      type="date"
                      value={newFindingForm.dueDate}
                      onChange={(e) =>
                        setNewFindingForm({ ...newFindingForm, dueDate: e.target.value })
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddFindingModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold shadow-md shadow-red-600/20 hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : "Simpan Temuan Audit"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. MODAL PRATINJAU CETAK RESMI BERITA ACARA AMI */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                  <Printer className="w-4 h-4 text-sky-600" />
                  <span>Pratinjau Dokumen Cetak • Berita Acara Audit Mutu Internal</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Cetak / Simpan PDF
                  </button>
                  <button
                    onClick={() => setIsPrintModalOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Body */}
              <div className="p-8 sm:p-12 overflow-y-auto space-y-8 bg-white text-slate-900 text-xs">
                {/* Kop Surat Resmi */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo_stimi.png" alt="Logo STIMI" className="w-16 h-16 object-contain" />
                    <div>
                      <h2 className="text-base font-black tracking-tight text-slate-950">
                        SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA
                      </h2>
                      <h3 className="text-sm font-black text-sky-800 tracking-tight">
                        STIMI YAPMI MAKASSAR
                      </h3>
                      <p className="text-[10px] text-slate-600 font-medium">
                        LEMBAGA PENJAMINAN MUTU (LPM) • KAMPUS MERDEKA BERSTANDAR SPMI
                      </p>
                      <p className="text-[9px] text-slate-400">
                        Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-bold">
                    <span>FORMULIR: LPM-AMI-09</span>
                    <br />
                    <span>EDISI: 2026</span>
                  </div>
                </div>

                {/* Judul Dokumen */}
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-black uppercase text-slate-950 underline underline-offset-4">
                    BERITA ACARA & REKAPITULASI AUDIT MUTU INTERNAL (AMI)
                  </h3>
                  <p className="text-xs text-slate-600 font-bold">
                    {activePeriod?.title || "Siklus AMI IX Tahun 2025/2026"}
                  </p>
                </div>

                {/* Rangkuman Metrik Hasil Audit */}
                <div className="grid grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block">Total Temuan</span>
                    <strong className="text-base text-slate-900">{summary?.totalFindings || 0}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-600 block">KTS Mayor</span>
                    <strong className="text-base text-red-600">{summary?.categories?.mayor || 0}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 block">KTS Minor</span>
                    <strong className="text-base text-amber-600">{summary?.categories?.minor || 0}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 block">Tuntas (Closed)</span>
                    <strong className="text-base text-emerald-600">{summary?.closingRate || 0}%</strong>
                  </div>
                </div>

                {/* Tabel Rekap Temuan & PTK */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase">
                    Rincian Temuan & Rencana Tindak Lanjut (PTK / RTL)
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="border border-slate-300 p-2 text-center w-8">No</th>
                        <th className="border border-slate-300 p-2 text-left">Unit Auditee</th>
                        <th className="border border-slate-300 p-2 text-left">Standar & Temuan</th>
                        <th className="border border-slate-300 p-2 text-center w-20">Kategori</th>
                        <th className="border border-slate-300 p-2 text-left">Rencana Koreksi (PTK)</th>
                        <th className="border border-slate-300 p-2 text-center w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {findings.map((item, idx) => (
                        <tr key={item._id} className="align-top">
                          <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-300 p-2 font-bold">{item.auditeeName}</td>
                          <td className="border border-slate-300 p-2">
                            <span className="font-bold text-sky-800 block text-[10px]">{item.standardRef}</span>
                            <span>{item.description}</span>
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {item.category.replace("_", " ")}
                          </td>
                          <td className="border border-slate-300 p-2">
                            {item.correctiveAction ? (
                              <span>{item.correctiveAction}</span>
                            ) : (
                              <span className="text-slate-400 italic">Belum diisi</span>
                            )}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {item.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Kolom Pengesahan Tanda Tangan */}
                <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                  <div className="space-y-16">
                    <p className="font-medium">
                      Makassar, {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
                      <br />
                      <strong>Ketua Lembaga Penjaminan Mutu (LPM)</strong>
                    </p>
                    <div>
                      <p className="font-black underline underline-offset-4">Dr. Nurul Fadilah, SE., MM</p>
                      <p className="text-[10px] text-slate-500">NIDN. 0915088201</p>
                    </div>
                  </div>

                  <div className="space-y-16">
                    <p className="font-medium">
                      Mengetahui,
                      <br />
                      <strong>Ketua STIMI YAPMI Makassar</strong>
                    </p>
                    <div>
                      <p className="font-black underline underline-offset-4">Ibrahim Syah, SE., MM.</p>
                      <p className="text-[10px] text-slate-500">NIDN. 0920037601</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
