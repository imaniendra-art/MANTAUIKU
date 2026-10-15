"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Award, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  Printer, 
  BookOpen, 
  GraduationCap, 
  Building2, 
  TrendingUp, 
  Sparkles,
  X,
  FileCheck2,
  Info,
  FileUp,
  Upload,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Trash2,
  Download,
  Plus,
  Check,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Iapt41DashboardWidget, { IIapt41Summary } from "@/components/dashboard/Iapt41DashboardWidget";
import LamembaDashboardWidget, { ILamembaSummaryData } from "@/components/dashboard/LamembaDashboardWidget";

interface IProfile {
  _id: string;
  entityType: "INSTITUSI" | "PRODI";
  name: string;
  degreeLevel?: string;
  agency: "BAN-PT" | "LAMEMBA";
  grade: "UNGGUL" | "BAIK_SEKALI" | "BAIK" | "TERAKREDITASI";
  skNumber: string;
  validFrom: string;
  validUntil: string;
  certificateUrl?: string;
  notes?: string;
  daysRemaining: number;
  monthsRemaining: number;
  pepaStatus: "AMAN" | "WASPADA" | "KRITIS";
}

interface ICriteria {
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
}

export interface ILamembaDl05AnnualLetter {
  yearIndex: number;
  yearLabel: string;
  letterNumber?: string;
  letterDate?: string;
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string | Date;
  notes?: string;
}

export interface ILamembaDl05LearningItem {
  nomor: number;
  indikator: string;
  upayaTahun1: string;
  hasilTahun1: string;
  upayaTahun2: string;
  hasilTahun2: string;
  upayaTahun3: string;
  hasilTahun3: string;
  upayaTahun4: string;
  hasilTahun4: string;
}

export interface ILamembaDl05FacultyItem {
  name: string;
  status: "Tetap" | "Tidak Tetap";
  nidn: string;
  jabatanAkademik: string;
  jalur: "Akademisi" | "Praktisi";
  namaPerusahaan?: string;
  catatan?: string;
  isChange: boolean;
  isKeluar?: boolean;
}

export interface ILamembaDl05EwmpItem {
  name: string;
  psAkreditasiSks: number;
  psLainDalamPtSks: number;
  psLainLuarPtSks: number;
  penelitianSks: number;
  pkmSks: number;
  tugasTambahanSks: number;
  totalSks: number;
  avgSemesterSks: number;
  isChange: boolean;
}

export interface ILamembaDl05IntellectualItem {
  name: string;
  rekognisiPendidikan: string;
  rekognisiPraktik: string;
  rekognisiPenelitian: string;
  rekognisiSosial: string;
  isChange: boolean;
}

export interface ILamembaDl05StudentItem {
  semester: "Ganjil" | "Genap";
  mhsAktif: number;
  mhsPdDikti: number;
  selisih: number;
  isChange: boolean;
}

interface IDl05 {
  _id: string;
  academicYear: string;
  prodiName: string;
  submissionDate: string;
  status: string;
  selectedYearIndex?: number;

  // Koleksi Wajib: 1 Surat Rekomendasi Resmi per Tahun
  annualLetters?: ILamembaDl05AnnualLetter[];

  // Format 4 Bab Baku Lampiran DL-05 LAMEMBA 2025
  learningAssuranceItems?: ILamembaDl05LearningItem[];
  perbaikanBerkelanjutanJaminanPembelajaran?: string;

  dosenProfiles?: ILamembaDl05FacultyItem[];
  ewmpList?: ILamembaDl05EwmpItem[];
  perbaikanBerkelanjutanDosen?: string;

  kontribusiIntelektualDosen?: ILamembaDl05IntellectualItem[];
  perbaikanBerkelanjutanTridharma?: string;

  mahasiswaAktifList?: ILamembaDl05StudentItem[];
  perbaikanBerkelanjutanKemahasiswaan?: string;

  // Legacy fallback
  assessorFollowUps?: Array<{
    recommendation: string;
    actionTaken: string;
    status: "SELESAI" | "SEDANG_BERJALAN" | "BELUM";
    evidenceUrl?: string;
  }>;
  renstraProgress?: Array<{
    targetName: string;
    achievement: string;
    obstacle: string;
    cqiSolution: string;
  }>;
  learningAssurance?: {
    cplAchievementPercentage: number;
    obeRpsPercentage: number;
    description: string;
  };
  facultySufficiency?: {
    permanentFacultyCount: number;
    doctoralPercentage: number;
    lektorHeadPercentage: number;
    facultyStudentRatio: string;
    description: string;
  };
  tridharmaOutcomes?: {
    gpaAverage: number;
    avgStudyDurationMonths: number;
    tracerStudyResponseRate: number;
    waitingTimeMonths: number;
    publicationsCount: number;
    description: string;
  };
}

export default function AccreditationDashboardPage() {
  const { data: session } = useSession();
  const isLpm = session?.user?.role === "LPM";

  const [activeTab, setActiveTab] = useState<"profiles" | "iapt41" | "criteria" | "dl05">("profiles");

  // Data states
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [criteria, setCriteria] = useState<ICriteria[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [predictedGrade, setPredictedGrade] = useState<string>("BAIK_SEKALI");
  const [dl05, setDl05] = useState<IDl05 | null>(null);
  const [iapt41Summary, setIapt41Summary] = useState<IIapt41Summary | null>(null);
  const [lamembaSummary, setLamembaSummary] = useState<ILamembaSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  // DL-05 Year cycle state (0: Baseline, 1-4: Pemantauan Siklus 1 s.d 4)
  const [selectedDl05Year, setSelectedDl05Year] = useState<number>(1);
  const [isUploadLetterModalOpen, setIsUploadLetterModalOpen] = useState(false);
  const [activeLetterItem, setActiveLetterItem] = useState<ILamembaDl05AnnualLetter | null>(null);
  const [letterFormData, setLetterFormData] = useState({
    letterNumber: "",
    letterDate: "",
    notes: "",
  });
  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [isUploadingLetter, setIsUploadingLetter] = useState(false);
  const [letterModalMessage, setLetterModalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [isPrintDl05ModalOpen, setIsPrintDl05ModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<IProfile | null>(null);
  
  // Edit & Upload Form State
  const [editFormData, setEditFormData] = useState({
    grade: "BAIK_SEKALI" as "UNGGUL" | "BAIK_SEKALI" | "BAIK" | "TERAKREDITASI",
    skNumber: "",
    validFrom: "",
    validUntil: "",
    certificateUrl: "",
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [profilesRes, criteriaRes, dl05Res, iapt41Res] = await Promise.all([
        fetch("/api/accreditation/profiles"),
        fetch("/api/accreditation/criteria"),
        fetch("/api/accreditation/dl05"),
        fetch("/api/accreditation/iapt41"),
      ]);

      const pData = await profilesRes.json();
      const cData = await criteriaRes.json();
      const dData = await dl05Res.json();
      const iData = await iapt41Res.json();

      if (pData.success) setProfiles(pData.data);
      if (cData.success) {
        setLamembaSummary(cData.data);
        setCriteria(cData.data.criteria);
        setOverallScore(cData.data.finalWeightedScore);
        setPredictedGrade(cData.data.summaryBaikSekali?.statusLabel || cData.data.predictedGrade);
      }
      if (dData.success) {
        setDl05(dData.data);
        if (dData.data.selectedYearIndex !== undefined) {
          setSelectedDl05Year(dData.data.selectedYearIndex);
        }
      }
      if (iData.success) setIapt41Summary(iData.data);
    } catch (err) {
      console.error("Failed to load accreditation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditModal = (profile: IProfile) => {
    setSelectedProfile(profile);
    setEditFormData({
      grade: profile.grade,
      skNumber: profile.skNumber,
      validFrom: profile.validFrom ? new Date(profile.validFrom).toISOString().split("T")[0] : "",
      validUntil: profile.validUntil ? new Date(profile.validUntil).toISOString().split("T")[0] : "",
      certificateUrl: profile.certificateUrl || "",
      notes: profile.notes || "",
    });
    setSelectedFile(null);
    setModalMessage(null);
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    setIsSaving(true);
    setModalMessage(null);

    try {
      let finalCertificateUrl = editFormData.certificateUrl;

      // Unggah file PDF jika ada file baru yang dipilih
      if (selectedFile) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        uploadData.append("entityType", selectedProfile.entityType);

        const uploadRes = await fetch("/api/accreditation/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();
        setIsUploading(false);

        if (!uploadJson.success) {
          setModalMessage({ type: "error", text: uploadJson.error || "Gagal mengunggah file PDF sertifikat." });
          setIsSaving(false);
          return;
        }

        finalCertificateUrl = uploadJson.fileUrl;
      }

      // Kirim pembaruan ke API PUT /api/accreditation/profiles
      const res = await fetch("/api/accreditation/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedProfile._id,
          grade: editFormData.grade,
          skNumber: editFormData.skNumber,
          validFrom: editFormData.validFrom,
          validUntil: editFormData.validUntil,
          certificateUrl: finalCertificateUrl,
          notes: editFormData.notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setModalMessage({ type: "success", text: "Data profil akreditasi & sertifikat resmi berhasil diperbarui!" });
        await loadData();
        setTimeout(() => {
          setIsEditProfileModalOpen(false);
        }, 1200);
      } else {
        setModalMessage({ type: "error", text: json.error || "Gagal memperbarui profil akreditasi." });
      }
    } catch {
      setModalMessage({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan data." });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  // DL-05 Annual Letter Modal Handlers
  const openUploadLetterModal = (letter: ILamembaDl05AnnualLetter) => {
    setActiveLetterItem(letter);
    setLetterFormData({
      letterNumber: letter.letterNumber || "",
      letterDate: letter.letterDate ? new Date(letter.letterDate).toISOString().split("T")[0] : "",
      notes: letter.notes || "",
    });
    setLetterFile(null);
    setLetterModalMessage(null);
    setIsUploadLetterModalOpen(true);
  };

  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLetterItem || !dl05) return;

    setIsUploadingLetter(true);
    setLetterModalMessage(null);

    try {
      // 1. Upload file fisik jika ada file yang dipilih
      if (letterFile) {
        const formData = new FormData();
        formData.append("file", letterFile);
        formData.append("targetType", "PRODI");
        formData.append("criterionCode", "DL-05");
        formData.append("itemKey", `dl05-surat-rekomendasi-tahun-${activeLetterItem.yearIndex}`);
        formData.append("itemTitle", `Surat Rekomendasi/Keputusan Resmi LAMEMBA ${activeLetterItem.yearLabel}`);
        formData.append("evidenceDocName", `Surat Rekomendasi LAMEMBA Tahun Ke-${activeLetterItem.yearIndex}`);
        formData.append("notes", letterFormData.notes || `Surat Rekomendasi Resmi LAMEMBA Tahun Ke-${activeLetterItem.yearIndex}`);

        const uploadRes = await fetch("/api/accreditation/evidence", {
          method: "POST",
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) {
          setLetterModalMessage({ type: "error", text: uploadJson.error || "Gagal mengunggah berkas surat rekomendasi resmi LAMEMBA." });
          setIsUploadingLetter(false);
          return;
        }
      }

      // 2. Perbarui metadata surat pada DL-05 (Nomor, Tanggal, Catatan)
      const currentLetters = dl05.annualLetters && dl05.annualLetters.length > 0 
        ? [...dl05.annualLetters] 
        : [];
      
      const targetIdx = currentLetters.findIndex(l => l.yearIndex === activeLetterItem.yearIndex);
      if (targetIdx >= 0) {
        currentLetters[targetIdx] = {
          ...currentLetters[targetIdx],
          letterNumber: letterFormData.letterNumber,
          letterDate: letterFormData.letterDate,
          notes: letterFormData.notes,
        };
      } else {
        currentLetters.push({
          yearIndex: activeLetterItem.yearIndex,
          yearLabel: activeLetterItem.yearLabel,
          letterNumber: letterFormData.letterNumber,
          letterDate: letterFormData.letterDate,
          notes: letterFormData.notes,
        });
      }

      const patchRes = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          annualLetters: currentLetters,
          selectedYearIndex: selectedDl05Year,
        }),
      });

      const patchJson = await patchRes.json();
      if (!patchJson.success) {
        setLetterModalMessage({ type: "error", text: patchJson.error || "Gagal memperbarui metadata surat rekomendasi." });
        setIsUploadingLetter(false);
        return;
      }

      setLetterModalMessage({ type: "success", text: "Surat rekomendasi resmi LAMEMBA berhasil disimpan!" });
      await loadData();
      setTimeout(() => {
        setIsUploadLetterModalOpen(false);
      }, 1000);
    } catch {
      setLetterModalMessage({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan surat rekomendasi." });
    } finally {
      setIsUploadingLetter(false);
    }
  };

  const handleDeleteLetter = async (letter: ILamembaDl05AnnualLetter) => {
    if (!confirm(`Hapus berkas surat rekomendasi resmi untuk ${letter.yearLabel}? Berkas fisik dan tautan dokumen akan dikosongkan.`)) {
      return;
    }

    try {
      // 1. Hapus berkas fisik di AccreditationEvidence
      await fetch(`/api/accreditation/evidence?targetType=PRODI&itemKey=dl05-surat-rekomendasi-tahun-${letter.yearIndex}`, {
        method: "DELETE",
      });

      // 2. Kosongkan link file di DL-05
      if (dl05?.annualLetters) {
        const updatedLetters = dl05.annualLetters.map(l => {
          if (l.yearIndex === letter.yearIndex) {
            return {
              ...l,
              fileUrl: undefined,
              fileName: undefined,
              uploadedAt: undefined,
            };
          }
          return l;
        });

        await fetch("/api/accreditation/dl05", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            academicYear: dl05.academicYear,
            annualLetters: updatedLetters,
          }),
        });
      }

      await loadData();
    } catch (err) {
      console.error("Gagal menghapus surat rekomendasi:", err);
      alert("Gagal menghapus surat rekomendasi.");
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-950 via-sky-900 to-cyan-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-sky-950/10 border border-sky-700/30">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-semibold backdrop-blur-md">
            <Award className="w-4 h-4 text-cyan-300" />
            <span>Akreditasi Institusi & LAMEMBA • Lampiran Wajib DL-05</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Matriks Akreditasi & Pemantauan Tahunan DL-05
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed">
            Sistem pemantauan status akreditasi BAN-PT & LAMEMBA, evaluasi instrumen LAMEMBA (DL-05 Status Terakreditasi & DL-09 IAU Unggul), dan penyusunan instrumen pemantauan tahunan pasca-akreditasi sesuai <strong>Lampiran DL-05 LAMEMBA</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPrintDl05ModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan DL-05 LAMEMBA</span>
          </button>
        </div>
      </div>

      {/* 2. Navigasi 4 Tab Utama */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === "profiles"
              ? "bg-white text-sky-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-600" />
          <span>Status & Berkas SK</span>
        </button>

        <button
          onClick={() => setActiveTab("iapt41")}
          className={`flex-1 min-w-[190px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === "iapt41"
              ? "bg-white text-sky-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Akreditasi Institusi (IAPT 4.1)</span>
        </button>

        <button
          onClick={() => setActiveTab("criteria")}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === "criteria"
              ? "bg-white text-sky-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <span>Akreditasi Prodi (LAMEMBA)</span>
        </button>

        <button
          onClick={() => setActiveTab("dl05")}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === "dl05"
              ? "bg-white text-sky-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          <span>Pemantauan Wajib DL-05</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Memuat data akreditasi...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: STATUS & COUNTDOWN REAKREDITASI PEPA */}
          {activeTab === "profiles" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {profiles.map((p) => {
              const isProdi = p.entityType === "PRODI";
              const isAman = p.pepaStatus === "AMAN";
              const isWaspada = p.pepaStatus === "WASPADA";

              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-6 relative overflow-hidden"
                >
                  {/* Watermark Logo/Text */}
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900 font-black text-7xl select-none pointer-events-none">
                    {p.agency}
                  </div>

                  {/* Header Pill */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                      {isProdi ? "Program Studi" : "Institusi Perguruan Tinggi"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Peringkat: {p.grade.replace("_", " ")}
                    </span>
                  </div>

                  {/* Title & Agency */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-950">
                      {p.name}
                    </h3>
                    <p className="text-xs font-bold text-sky-700">
                      Lembaga Akreditasi: {p.agency} ({p.degreeLevel || "S1"})
                    </p>
                  </div>

                  {/* Legal Details */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Nomor SK Resmi:</span>
                      <strong className="text-slate-900 font-bold">{p.skNumber}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Berlaku Sampai:</span>
                      <strong className="text-slate-900 font-bold">
                        {new Date(p.validUntil).toLocaleDateString("id-ID", { dateStyle: "long" })}
                      </strong>
                    </div>
                  </div>

                  {/* Countdown Timer PEPA */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                          Sisa Masa Berlaku
                        </span>
                        <h4 className="text-sm font-black text-slate-900">
                          {p.daysRemaining} Hari ({p.monthsRemaining} Bulan)
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                        isAman
                          ? "bg-emerald-100 text-emerald-800"
                          : isWaspada
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      Status PEPA: {p.pepaStatus}
                    </span>
                  </div>

                  {/* Action Row: Sertifikat & Kelola LPM */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      {p.certificateUrl ? (
                        <a
                          href={p.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Unduh Sertifikat PDF</span>
                        </a>
                      ) : (
                        <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Belum ada dokumen sertifikat PDF</span>
                        </span>
                      )}
                    </div>

                    {isLpm && (
                      <button
                        onClick={() => openEditModal(p)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-extrabold shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>Kelola / Upload Sertifikat PDF</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* SOP Peringatan Dini Reakreditasi BAN-PT / LAMEMBA */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-600" />
              <span>Panduan Kepatuhan Regulasi Pemantauan Akreditasi (BAN-PT & SAN Dikti)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <span className="font-black text-emerald-800 block">🟢 Fase Aman (&gt; 12 Bulan)</span>
                <p className="text-slate-600">
                  Melaksanakan siklus PPEPP internal secara rutin dan menyusun laporan evaluasi tahunan Lampiran DL-05 LAMEMBA.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
                <span className="font-black text-amber-800 block">🟡 Fase Waspada (6 - 12 Bulan)</span>
                <p className="text-slate-600">
                  Pembentukan Tim Taskforce Reakreditasi Prodi, audit internal menyeluruh LKPS/DKPS, dan pengumpulan bukti dukung instrumen akreditasi.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 space-y-1">
                <span className="font-black text-red-800 block">🔴 Fase Kritis (&lt; 6 Bulan)</span>
                <p className="text-slate-600">
                  Batas akhir pengunggahan dokumen LED & LKPS ke sistem SAPTO BAN-PT / Portal Akreditasi LAMEMBA agar status tidak kedaluwarsa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AKREDITASI INSTITUSI IAPT 4.1 BAN-PT (PERATURAN NO. 35 TAHUN 2025) */}
      {activeTab === "iapt41" && (
        iapt41Summary ? (
          <Iapt41DashboardWidget
            data={iapt41Summary}
            isLpm={isLpm}
            onRefresh={loadData}
          />
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">Memuat matriks instrumen IAPT 4.1 BAN-PT...</p>
          </div>
        )
      )}

      {/* TAB 3: INSTRUMEN AKREDITASI LAMEMBA (DL-05 STANDAR & DL-09 UNGGUL) */}
      {activeTab === "criteria" && (
        lamembaSummary ? (
          <LamembaDashboardWidget
            data={lamembaSummary}
            isLpm={isLpm}
            onRefresh={loadData}
          />
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-500">Memuat instrumen akreditasi LAMEMBA...</p>
          </div>
        )
      )}

      {/* TAB 4: PEMANTAUAN TAHUNAN WAJIB LAMPIRAN DL-05 LAMEMBA */}
      {activeTab === "dl05" && dl05 && (
        <div className="space-y-8">
          {/* Header DL-05 Official Notice Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-4 border border-emerald-700/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-semibold backdrop-blur-md border border-emerald-400/30">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Format Baku Lampiran 1 DL-05 • Peraturan LAMEMBA No. 2 Tahun 2025</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-300/80 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800">
                Kode Dokumen: LAMEMBA-DL-05
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Dokumen Pemantauan & Evaluasi Tahunan Pasca-Akreditasi (DL-05)
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
                  Program Studi: <strong className="text-white">{dl05.prodiName}</strong> • Tahun Akademik: <strong className="text-white">{dl05.academicYear}</strong>. Instrumen ini menyajikan 4 Bab Baku pemantauan mutu berkelanjutan serta kewajiban mengoleksi <strong>1 surat rekomendasi resmi LAMEMBA setiap tahun</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsPrintDl05ModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span>Pratinjau Dokumen Cetak DL-05</span>
                </button>
                <a
                  href="/uploads/accreditation/templates/Panduan_Penilaian_Akreditasi_Unggul_DL09_LAMEMBA.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Panduan PDF</span>
                </a>
              </div>
            </div>
          </div>

          {/* 1. KOLEKSI WAJIB: 1 SURAT REKOMENDASI RESMI LAMEMBA PER TAHUN (TAHUN 0 S.D 4) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Koleksi Wajib Arsip Fisik: 1 Dokumen Sah / Tahun</span>
                </div>
                <h4 className="text-base font-black text-slate-900">
                  Arsip Surat Rekomendasi & Keputusan Resmi LAMEMBA (Tahun 0 s.d 4)
                </h4>
                <p className="text-xs text-slate-500">
                  Setiap siklus pemantauan wajib mengoleksi 1 berkas resmi dari Dewan Eksekutif LAMEMBA. Jika belum diunggah, dokumen bertanda merah dan belum memenuhi kelengkapan arsip.
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400 font-semibold block text-[11px]">Kelengkapan Koleksi:</span>
                <span className="font-black text-slate-900">
                  {(dl05.annualLetters || []).filter((l) => l.fileUrl).length} / {(dl05.annualLetters || []).length || 5} Dokumen Sah
                </span>
              </div>
            </div>

            {/* 5 Cards Timeline (Tahun 0 s.d. 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {((dl05.annualLetters && dl05.annualLetters.length > 0)
                ? dl05.annualLetters
                : [
                    { yearIndex: 0, yearLabel: "Tahun Ke-0 (Baseline Akreditasi)", letterNumber: "SK LAMEMBA No. 933/DE/A.5/AR.10/XII/2023", letterDate: "2023-12-28", notes: "SK Penetapan Peringkat Baik Sekali" },
                    { yearIndex: 1, yearLabel: "Tahun Ke-1 (Pemantauan Siklus 1)", letterNumber: "", letterDate: "", notes: "" },
                    { yearIndex: 2, yearLabel: "Tahun Ke-2 (Pemantauan Siklus 2)", letterNumber: "", letterDate: "", notes: "" },
                    { yearIndex: 3, yearLabel: "Tahun Ke-3 (Pemantauan Siklus 3)", letterNumber: "", letterDate: "", notes: "" },
                    { yearIndex: 4, yearLabel: "Tahun Ke-4 (Evaluasi Reakreditasi)", letterNumber: "", letterDate: "", notes: "" },
                  ]
              ).map((letter) => {
                const isUploaded = Boolean(letter.fileUrl);

                return (
                  <div
                    key={letter.yearIndex}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isUploaded
                        ? "bg-emerald-50/40 border-emerald-200"
                        : "bg-rose-50/40 border-rose-200"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {letter.yearIndex === 0 ? "Tahun Ke-0" : `Tahun Ke-${letter.yearIndex}`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isUploaded
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {isUploaded ? "🟢 Terunggah" : "🔴 Belum Ada"}
                        </span>
                      </div>

                      <div>
                        <h5 className="font-extrabold text-slate-900 text-xs line-clamp-1">
                          {letter.yearLabel}
                        </h5>
                        <p className="text-[11px] text-slate-600 font-mono mt-1 break-all line-clamp-2">
                          {letter.letterNumber || "(Nomor surat belum diisi)"}
                        </p>
                        {letter.letterDate && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Tgl: {new Date(letter.letterDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 space-y-2 text-xs">
                      {isUploaded ? (
                        <div className="space-y-1.5">
                          <a
                            href={letter.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-black text-[11px] hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[130px]">{letter.fileName || "Lihat Surat PDF"}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>

                          {isLpm && (
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => openUploadLetterModal(letter)}
                                className="text-[11px] text-sky-700 font-bold hover:underline cursor-pointer"
                              >
                                Ganti PDF
                              </button>
                              <span className="text-slate-300">•</span>
                              <button
                                onClick={() => handleDeleteLetter(letter)}
                                className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-rose-700 font-medium">
                            Surat rekomendasi belum diarsipkan.
                          </p>
                          {isLpm && (
                            <button
                              onClick={() => openUploadLetterModal(letter)}
                              className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Unggah Surat</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. SELECTOR TAHUN SIKLUS PEMANTAUAN (TAHUN KE-0 S.D 4) */}
          <div className="bg-slate-100 p-2 rounded-2xl flex flex-wrap items-center justify-between gap-2 border border-slate-200">
            <div className="flex items-center gap-1.5 overflow-x-auto p-1">
              {[
                { idx: 0, label: "Tahun 0 (Baseline)" },
                { idx: 1, label: "Tahun 1 (Siklus 1)" },
                { idx: 2, label: "Tahun 2 (Siklus 2)" },
                { idx: 3, label: "Tahun 3 (Siklus 3)" },
                { idx: 4, label: "Tahun 4 (Evaluasi Reakreditasi)" },
              ].map((tab) => (
                <button
                  key={tab.idx}
                  onClick={() => setSelectedDl05Year(tab.idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedDl05Year === tab.idx
                      ? "bg-white text-emerald-800 shadow-sm border border-slate-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 font-medium px-3 py-1">
              Menampilkan data pemantauan untuk: <strong className="text-emerald-700">Tahun Ke-{selectedDl05Year}</strong>
            </div>
          </div>

          {/* 3. BAB I: JAMINAN PEMBELAJARAN (TABEL 1.1 LAMPIRAN DL-05) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    Bab I: Jaminan Pembelajaran (Tabel 1.1)
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  Pengukuran langsung & tidak langsung atas ketercapaian kompetensi (CPL) mahasiswa dan intervensi perbaikan pembelajaran (CQI)
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-50 text-sky-800 border border-sky-200">
                Tabel 1.1 Standar LAMEMBA
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="border border-slate-200 p-3 text-center w-12 font-black">No</th>
                    <th className="border border-slate-200 p-3 text-left w-1/3 font-black">
                      Indikator Jaminan Pembelajaran
                    </th>
                    <th className="border border-slate-200 p-3 text-left font-black">
                      Upaya yang Dilakukan (Tahun Ke-{selectedDl05Year})
                    </th>
                    <th className="border border-slate-200 p-3 text-left font-black">
                      Hasil yang Dicapai (Tahun Ke-{selectedDl05Year})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(dl05.learningAssuranceItems || []).map((item) => {
                    const upayaText =
                      selectedDl05Year === 1
                        ? item.upayaTahun1
                        : selectedDl05Year === 2
                        ? item.upayaTahun2
                        : selectedDl05Year === 3
                        ? item.upayaTahun3
                        : selectedDl05Year === 4
                        ? item.upayaTahun4
                        : "Data baseline penetapan akreditasi awal.";

                    const hasilText =
                      selectedDl05Year === 1
                        ? item.hasilTahun1
                        : selectedDl05Year === 2
                        ? item.hasilTahun2
                        : selectedDl05Year === 3
                        ? item.hasilTahun3
                        : selectedDl05Year === 4
                        ? item.hasilTahun4
                        : "Sesuai berita acara penetapan visitasi akreditasi terakhir.";

                    return (
                      <tr key={item.nomor} className="align-top hover:bg-slate-50/60 transition-colors">
                        <td className="border border-slate-200 p-3 text-center font-bold text-slate-500">
                          {item.nomor}
                        </td>
                        <td className="border border-slate-200 p-3 font-semibold text-slate-800 leading-relaxed">
                          {item.indikator}
                        </td>
                        <td className="border border-slate-200 p-3 text-slate-700 leading-relaxed">
                          {upayaText ? (
                            <span>{upayaText}</span>
                          ) : (
                            <span className="text-amber-600 italic">Belum ada upaya dilaporkan untuk tahun ini.</span>
                          )}
                        </td>
                        <td className="border border-slate-200 p-3 text-slate-700 leading-relaxed">
                          {hasilText ? (
                            <span className="font-medium text-emerald-900">{hasilText}</span>
                          ) : (
                            <span className="text-amber-600 italic">Belum ada hasil dilaporkan untuk tahun ini.</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {dl05.perbaikanBerkelanjutanJaminanPembelajaran && (
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs space-y-1">
                <span className="font-black text-sky-900 block">
                  Catatan Perbaikan Berkelanjutan Jaminan Pembelajaran:
                </span>
                <p className="text-sky-800 leading-relaxed">
                  {dl05.perbaikanBerkelanjutanJaminanPembelajaran}
                </p>
              </div>
            )}
          </div>

          {/* 4. BAB II: KECUKUPAN DAN KUALIFIKASI DOSEN (TABEL 2.1 & 2.3) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    Bab II: Kecukupan dan Kualifikasi Dosen
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  Profil kepegawaian dosen (akademisi vs praktisi industri) serta Ekuivalensi Waktu Mengajar Penuh (EWMP)
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-800 border border-purple-200">
                Tabel 2.1 & Tabel 2.3
              </span>
            </div>

            {/* Sub-A: Tabel 2.1 Profil Kepegawaian Dosen (Akademisi vs Praktisi Industri) */}
            <div className="space-y-3">
              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>Tabel 2.1 Profil Kepegawaian & Jalur Rekrutmen Dosen</span>
              </h5>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="border border-slate-200 p-2.5 text-center w-10 font-black">No</th>
                      <th className="border border-slate-200 p-2.5 text-left font-black">Nama Dosen</th>
                      <th className="border border-slate-200 p-2.5 text-center font-black">Status</th>
                      <th className="border border-slate-200 p-2.5 text-center font-black">NIDN</th>
                      <th className="border border-slate-200 p-2.5 text-left font-black">Jabatan Akademik</th>
                      <th className="border border-slate-200 p-2.5 text-center font-black">Jalur</th>
                      <th className="border border-slate-200 p-2.5 text-left font-black">Perusahaan Asal</th>
                      <th className="border border-slate-200 p-2.5 text-center font-black">Perubahan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dl05.dosenProfiles || []).map((dosen, idx) => (
                      <tr key={idx} className="align-middle hover:bg-slate-50/60 transition-colors">
                        <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-200 p-2.5 font-bold text-slate-900">
                          {dosen.name}
                        </td>
                        <td className="border border-slate-200 p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              dosen.status === "Tetap"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {dosen.status}
                          </span>
                        </td>
                        <td className="border border-slate-200 p-2.5 text-center font-mono text-[11px] text-slate-600">
                          {dosen.nidn}
                        </td>
                        <td className="border border-slate-200 p-2.5 text-slate-700">
                          {dosen.jabatanAkademik}
                        </td>
                        <td className="border border-slate-200 p-2.5 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              dosen.jalur === "Praktisi"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : "bg-sky-100 text-sky-800 border border-sky-200"
                            }`}
                          >
                            {dosen.jalur === "Praktisi" ? "💼 Praktisi Industri" : "🎓 Akademisi"}
                          </span>
                        </td>
                        <td className="border border-slate-200 p-2.5 text-slate-600">
                          {dosen.namaPerusahaan || "-"}
                        </td>
                        <td className="border border-slate-200 p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              dosen.isChange
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {dosen.isChange ? "Ada Perubahan" : "Tetap (Baseline)"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sub-B: Tabel 2.3 EWMP */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Tabel 2.3 Ekuivalensi Waktu Mengajar Penuh (EWMP) Dosen</span>
                <span className="text-[11px] font-normal text-slate-500 normal-case">
                  Standar SN-Dikti: 12 - 16 SKS per semester
                </span>
              </h5>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 text-center">
                      <th className="border border-slate-200 p-2.5 text-left font-black">Nama Dosen</th>
                      <th className="border border-slate-200 p-2.5 font-black">PS Sendiri (SKS)</th>
                      <th className="border border-slate-200 p-2.5 font-black">PS Lain PT (SKS)</th>
                      <th className="border border-slate-200 p-2.5 font-black">Luar PT (SKS)</th>
                      <th className="border border-slate-200 p-2.5 font-black">Penelitian (SKS)</th>
                      <th className="border border-slate-200 p-2.5 font-black">PkM (SKS)</th>
                      <th className="border border-slate-200 p-2.5 font-black">Tugas Tambahan (SKS)</th>
                      <th className="border border-slate-200 p-2.5 font-black bg-slate-100">Total SKS</th>
                      <th className="border border-slate-200 p-2.5 font-black">Kepatuhan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dl05.ewmpList || []).map((ewmp, idx) => {
                      const isCompliant = ewmp.totalSks >= 12 && ewmp.totalSks <= 16;
                      return (
                        <tr key={idx} className="align-middle hover:bg-slate-50/60 transition-colors text-center">
                          <td className="border border-slate-200 p-2.5 text-left font-bold text-slate-900">
                            {ewmp.name}
                          </td>
                          <td className="border border-slate-200 p-2.5">{ewmp.psAkreditasiSks}</td>
                          <td className="border border-slate-200 p-2.5">{ewmp.psLainDalamPtSks}</td>
                          <td className="border border-slate-200 p-2.5">{ewmp.psLainLuarPtSks}</td>
                          <td className="border border-slate-200 p-2.5">{ewmp.penelitianSks}</td>
                          <td className="border border-slate-200 p-2.5">{ewmp.pkmSks}</td>
                          <td className="border border-slate-200 p-2.5">{ewmp.tugasTambahanSks}</td>
                          <td className="border border-slate-200 p-2.5 font-black text-slate-900 bg-slate-50">
                            {ewmp.totalSks} SKS
                          </td>
                          <td className="border border-slate-200 p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                isCompliant
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {isCompliant ? "🟢 Memenuhi" : "🟡 Perlu Penyesuaian"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {dl05.perbaikanBerkelanjutanDosen && (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs space-y-1">
                <span className="font-black text-purple-900 block">
                  Catatan Perbaikan Berkelanjutan Dosen:
                </span>
                <p className="text-purple-800 leading-relaxed">{dl05.perbaikanBerkelanjutanDosen}</p>
              </div>
            )}
          </div>

          {/* 5. BAB III: LUARAN DAN CAPAIAN TRIDHARMA (TABEL 3.1 KONTRIBUSI INTELEKTUAL) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    Bab III: Luaran dan Capaian Tridharma (Tabel 3.1)
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  Kontribusi intelektual dan rekognisi kepakaran dosen dalam 4 bidang (Pendidikan, Praktik, Riset, Sosial)
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                Tabel 3.1 Kontribusi Intelektual
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="border border-slate-200 p-2.5 text-center w-10 font-black">No</th>
                    <th className="border border-slate-200 p-2.5 text-left font-black w-48">Nama Dosen</th>
                    <th className="border border-slate-200 p-2.5 text-left font-black">1. Rekognisi Pendidikan</th>
                    <th className="border border-slate-200 p-2.5 text-left font-black">2. Rekognisi Praktik Bisnis</th>
                    <th className="border border-slate-200 p-2.5 text-left font-black">3. Rekognisi Riset & Publikasi</th>
                    <th className="border border-slate-200 p-2.5 text-left font-black">4. Rekognisi Sosial</th>
                  </tr>
                </thead>
                <tbody>
                  {(dl05.kontribusiIntelektualDosen || []).map((item, idx) => (
                    <tr key={idx} className="align-top hover:bg-slate-50/60 transition-colors">
                      <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-200 p-2.5 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="border border-slate-200 p-2.5 text-slate-700 leading-relaxed">
                        {item.rekognisiPendidikan || "-"}
                      </td>
                      <td className="border border-slate-200 p-2.5 text-slate-700 leading-relaxed">
                        {item.rekognisiPraktik || "-"}
                      </td>
                      <td className="border border-slate-200 p-2.5 text-slate-700 leading-relaxed">
                        {item.rekognisiPenelitian || "-"}
                      </td>
                      <td className="border border-slate-200 p-2.5 text-slate-700 leading-relaxed">
                        {item.rekognisiSosial || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {dl05.perbaikanBerkelanjutanTridharma && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1">
                <span className="font-black text-emerald-900 block">
                  Catatan Perbaikan Berkelanjutan Tridharma:
                </span>
                <p className="text-emerald-800 leading-relaxed">
                  {dl05.perbaikanBerkelanjutanTridharma}
                </p>
              </div>
            )}
          </div>

          {/* 6. BAB IV: KEMAHASISWAAN & SINKRONISASI PD-DIKTI (TABEL 4.1) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-black text-slate-900">
                    Bab IV: Kemahasiswaan & Rekonsiliasi PD-Dikti (Tabel 4.1)
                  </h4>
                </div>
                <p className="text-xs text-slate-500">
                  Sinkronisasi jumlah mahasiswa aktif kampus terhadap data terdaftar pada Pangkalan Data Pendidikan Tinggi (PD-Dikti)
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-50 text-cyan-800 border border-cyan-200">
                Tabel 4.1 Rekonsiliasi Feeder
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-center">
                    <th className="border border-slate-200 p-3 text-left font-black">Semester</th>
                    <th className="border border-slate-200 p-3 font-black">Jumlah Mahasiswa Aktif Kampus</th>
                    <th className="border border-slate-200 p-3 font-black">Terdaftar di PD-Dikti</th>
                    <th className="border border-slate-200 p-3 font-black">Selisih (Discrepancy)</th>
                    <th className="border border-slate-200 p-3 font-black">Status Validitas Feeder</th>
                  </tr>
                </thead>
                <tbody>
                  {(dl05.mahasiswaAktifList || []).map((mhs, idx) => {
                    const isZeroDiscrepancy = mhs.selisih === 0;
                    return (
                      <tr key={idx} className="align-middle hover:bg-slate-50/60 transition-colors text-center">
                        <td className="border border-slate-200 p-3 text-left font-black text-slate-900">
                          Semester {mhs.semester} ({dl05.academicYear})
                        </td>
                        <td className="border border-slate-200 p-3 font-bold text-slate-900">
                          {mhs.mhsAktif} Orang
                        </td>
                        <td className="border border-slate-200 p-3 font-bold text-slate-900">
                          {mhs.mhsPdDikti} Orang
                        </td>
                        <td className="border border-slate-200 p-3 font-black">
                          <span
                            className={
                              isZeroDiscrepancy ? "text-emerald-700 font-mono" : "text-rose-700 font-mono"
                            }
                          >
                            {mhs.selisih} Mahasiswa
                          </span>
                        </td>
                        <td className="border border-slate-200 p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-black inline-flex items-center gap-1.5 ${
                              isZeroDiscrepancy
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {isZeroDiscrepancy ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>100% Sinkron (Nol Selisih)</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Terdapat Selisih Data</span>
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {dl05.perbaikanBerkelanjutanKemahasiswaan && (
              <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 text-xs space-y-1">
                <span className="font-black text-cyan-900 block">
                  Catatan Rekonsiliasi PD-Dikti & Kemahasiswaan:
                </span>
                <p className="text-cyan-800 leading-relaxed">
                  {dl05.perbaikanBerkelanjutanKemahasiswaan}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}

      {/* 4. MODAL PRATINJAU CETAK RESMI FORMAT LAMPIRAN 1 DL-05 LAMEMBA 2025 */}
      <AnimatePresence>
        {isPrintDl05ModalOpen && dl05 && (
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
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <span>Pratinjau Dokumen Cetak • Lampiran 1 DL-05 LAMEMBA 2025</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Cetak / Simpan PDF
                  </button>
                  <button
                    onClick={() => setIsPrintDl05ModalOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
              <div className="p-8 sm:p-12 overflow-y-auto space-y-8 bg-white text-slate-900 text-xs">
                {/* Kop Surat Resmi STIMI YAPMI Makassar */}
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
                        PROGRAM STUDI S1 MANAJEMEN • TERAKREDITASI LAMEMBA
                      </p>
                      <p className="text-[9px] text-slate-400">
                        Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-bold">
                    <span>KODE DOKUMEN:</span>
                    <br />
                    <span className="text-emerald-700 font-black">LAMEMBA-DL-05</span>
                    <br />
                    <span className="text-[9px] text-slate-400">Peraturan No. 2 Thn 2025</span>
                  </div>
                </div>

                {/* Judul Laporan */}
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-black uppercase text-slate-950 underline underline-offset-4">
                    DOKUMEN PEMANTAUAN DAN EVALUASI PASCA-AKREDITASI (DL-05)
                  </h3>
                  <p className="text-xs text-slate-600 font-bold">
                    PROGRAM STUDI SARJANA MANAJEMEN • TAHUN AKADEMIK {dl05.academicYear} • TAHUN KE-{selectedDl05Year}
                  </p>
                </div>

                {/* Arsip Surat Rekomendasi Resmi LAM */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase">
                    1. Arsip Surat Rekomendasi Resmi Dewan Eksekutif LAMEMBA
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="border border-slate-300 p-2 text-center w-8">No</th>
                        <th className="border border-slate-300 p-2 text-left">Siklus Pemantauan</th>
                        <th className="border border-slate-300 p-2 text-left">Nomor Surat / Keputusan Resmi</th>
                        <th className="border border-slate-300 p-2 text-center w-28">Tanggal Surat</th>
                        <th className="border border-slate-300 p-2 text-center w-24">Status Berkas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dl05.annualLetters || []).map((letter, idx) => (
                        <tr key={idx} className="align-middle">
                          <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-300 p-2 font-bold">{letter.yearLabel}</td>
                          <td className="border border-slate-300 p-2 font-mono">{letter.letterNumber || "-"}</td>
                          <td className="border border-slate-300 p-2 text-center">
                            {letter.letterDate ? new Date(letter.letterDate).toLocaleDateString("id-ID") : "-"}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {letter.fileUrl ? "TERUNGGAH" : "BELUM ADA"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bab I Jaminan Pembelajaran */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase">
                    2. Bab I: Jaminan Pembelajaran (Tabel 1.1)
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="border border-slate-300 p-2 text-center w-8">No</th>
                        <th className="border border-slate-300 p-2 text-left w-1/3">Indikator</th>
                        <th className="border border-slate-300 p-2 text-left">Upaya yang Dilakukan</th>
                        <th className="border border-slate-300 p-2 text-left">Hasil yang Dicapai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dl05.learningAssuranceItems || []).map((item) => (
                        <tr key={item.nomor} className="align-top">
                          <td className="border border-slate-300 p-2 text-center">{item.nomor}</td>
                          <td className="border border-slate-300 p-2">{item.indikator}</td>
                          <td className="border border-slate-300 p-2">
                            {selectedDl05Year === 1 ? item.upayaTahun1 : selectedDl05Year === 2 ? item.upayaTahun2 : selectedDl05Year === 3 ? item.upayaTahun3 : item.upayaTahun4 || "-"}
                          </td>
                          <td className="border border-slate-300 p-2">
                            {selectedDl05Year === 1 ? item.hasilTahun1 : selectedDl05Year === 2 ? item.hasilTahun2 : selectedDl05Year === 3 ? item.hasilTahun3 : item.hasilTahun4 || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bab II Dosen */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase">
                    3. Bab II: Profil Dosen & Beban Mengajar (EWMP)
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="border border-slate-300 p-1.5 text-left">Nama Dosen</th>
                        <th className="border border-slate-300 p-1.5 text-center">Status</th>
                        <th className="border border-slate-300 p-1.5 text-center">NIDN</th>
                        <th className="border border-slate-300 p-1.5 text-center">Jalur</th>
                        <th className="border border-slate-300 p-1.5 text-left">Perusahaan / Mitra</th>
                        <th className="border border-slate-300 p-1.5 text-center">Total EWMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dl05.dosenProfiles || []).map((d, idx) => {
                        const matchedEwmp = (dl05.ewmpList || []).find((e) => e.name === d.name);
                        return (
                          <tr key={idx} className="align-middle">
                            <td className="border border-slate-300 p-1.5 font-bold">{d.name}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{d.status}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-mono">{d.nidn}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{d.jalur}</td>
                            <td className="border border-slate-300 p-1.5">{d.namaPerusahaan || "-"}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold">
                              {matchedEwmp ? `${matchedEwmp.totalSks} SKS` : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Bab IV Kemahasiswaan & Rekonsiliasi PD-Dikti */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase">
                    4. Bab IV: Kemahasiswaan & Rekonsiliasi Data PD-Dikti (Tabel 4.1)
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-center">
                        <th className="border border-slate-300 p-2 text-left">Semester</th>
                        <th className="border border-slate-300 p-2">Mhs Aktif Kampus</th>
                        <th className="border border-slate-300 p-2">Terdaftar PD-Dikti</th>
                        <th className="border border-slate-300 p-2">Selisih</th>
                        <th className="border border-slate-300 p-2">Validitas Data Feeder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dl05.mahasiswaAktifList || []).map((m, idx) => (
                        <tr key={idx} className="text-center">
                          <td className="border border-slate-300 p-2 text-left font-bold">Semester {m.semester}</td>
                          <td className="border border-slate-300 p-2">{m.mhsAktif} Orang</td>
                          <td className="border border-slate-300 p-2">{m.mhsPdDikti} Orang</td>
                          <td className="border border-slate-300 p-2 font-bold font-mono">{m.selisih}</td>
                          <td className="border border-slate-300 p-2 font-bold">
                            {m.selisih === 0 ? "100% SINKRON (VALID)" : "ADA SELISIH DATA"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Kolom Tanda Tangan Pengesahan 3 Pihak */}
                <div className="grid grid-cols-3 gap-4 pt-8 text-center text-[11px]">
                  <div className="space-y-14">
                    <p>
                      Disusun oleh,
                      <br />
                      <strong>Ketua Program Studi S1 Manajemen</strong>
                    </p>
                    <div>
                      <p className="font-black underline underline-offset-4">Drs. H. M. Said, M.Si</p>
                      <p className="text-[9px] text-slate-500">NIDN. 0918077501</p>
                    </div>
                  </div>

                  <div className="space-y-14">
                    <p>
                      Diverifikasi oleh,
                      <br />
                      <strong>Ketua Lembaga Penjaminan Mutu</strong>
                    </p>
                    <div>
                      <p className="font-black underline underline-offset-4">Dr. Nurul Fadilah, SE., MM</p>
                      <p className="text-[9px] text-slate-500">NIDN. 0915088201</p>
                    </div>
                  </div>

                  <div className="space-y-14">
                    <p>
                      Mengetahui & Menyetujui,
                      <br />
                      <strong>Ketua STIMI YAPMI Makassar</strong>
                    </p>
                    <div>
                      <p className="font-black underline underline-offset-4">Dr. Ibrahim Syah, S.E., M.M.</p>
                      <p className="text-[9px] text-slate-500">NIDN. 0920037601</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL UNGGAH SURAT REKOMENDASI RESMI LAMEMBA (KHUSUS LPM) */}
      <AnimatePresence>
        {isUploadLetterModalOpen && activeLetterItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 my-8"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Arsip Wajib 1 Surat Resmi / Tahun</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Unggah Surat Rekomendasi LAMEMBA
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeLetterItem.yearLabel}
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadLetterModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {letterModalMessage && (
                <div
                  className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
                    letterModalMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {letterModalMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{letterModalMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveLetter} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nomor Surat / Keputusan Resmi LAMEMBA
                  </label>
                  <input
                    type="text"
                    value={letterFormData.letterNumber}
                    onChange={(e) =>
                      setLetterFormData({ ...letterFormData, letterNumber: e.target.value })
                    }
                    placeholder="Contoh: Surat Dewan Eksekutif No. 124/DE/A.5/AR.10/2024"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Tanggal Surat Resmi
                  </label>
                  <input
                    type="date"
                    value={letterFormData.letterDate}
                    onChange={(e) =>
                      setLetterFormData({ ...letterFormData, letterDate: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Berkas Surat PDF Resmi dari LAMEMBA</span>
                    <span className="text-[11px] text-slate-400 font-normal">Maks. 25 MB</span>
                  </label>

                  <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-colors text-center space-y-2">
                    <input
                      type="file"
                      id="letter-file-input"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setLetterFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="letter-file-input"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-emerald-800">
                        {letterFile ? letterFile.name : "Pilih File Surat Resmi (Format PDF)"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {letterFile
                          ? `Ukuran: ${(letterFile.size / 1024 / 1024).toFixed(2)} MB`
                          : "Surat berkop resmi Dewan Eksekutif LAMEMBA"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Catatan / Rangkuman Arahan LAMEMBA
                  </label>
                  <textarea
                    rows={2}
                    value={letterFormData.notes}
                    onChange={(e) =>
                      setLetterFormData({ ...letterFormData, notes: e.target.value })
                    }
                    placeholder="Catatan rekomendasi yang diberikan oleh LAMEMBA..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadLetterModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isUploadingLetter}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                  >
                    {isUploadingLetter ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menyimpan Berkas...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simpan Surat Resmi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Modal Kelola Profil & Upload Sertifikat PDF (Khusus LPM) */}
      <AnimatePresence>
        {isEditProfileModalOpen && selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-6 my-8"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-100 text-sky-800">
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Lembaga Penjaminan Mutu (LPM)</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Kelola Profil & Sertifikat: {selectedProfile.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbarui data SK akreditasi resmi dan unggah salinan sertifikat digital format PDF.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Alert Feedback */}
              {modalMessage && (
                <div
                  className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
                    modalMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {modalMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{modalMessage.text}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Peringkat */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Peringkat Akreditasi
                    </label>
                    <select
                      value={editFormData.grade}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, grade: e.target.value as any })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                      required
                    >
                      <option value="UNGGUL">UNGGUL</option>
                      <option value="BAIK_SEKALI">BAIK SEKALI</option>
                      <option value="BAIK">BAIK</option>
                      <option value="TERAKREDITASI">TERAKREDITASI</option>
                    </select>
                  </div>

                  {/* Lembaga Akreditasi (Readonly) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Badan Akreditasi
                    </label>
                    <input
                      type="text"
                      value={`${selectedProfile.agency} (${selectedProfile.entityType})`}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Nomor SK */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nomor SK Resmi BAN-PT / LAMEMBA
                  </label>
                  <input
                    type="text"
                    value={editFormData.skNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, skNumber: e.target.value })}
                    placeholder="Contoh: SK BAN-PT No. 488/SK/BAN-PT/Ak/PT/VIII/2023"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                {/* Masa Berlaku */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Tanggal Mulai Berlaku
                    </label>
                    <input
                      type="date"
                      value={editFormData.validFrom}
                      onChange={(e) => setEditFormData({ ...editFormData, validFrom: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Tanggal Berakhir (Expired)
                    </label>
                    <input
                      type="date"
                      value={editFormData.validUntil}
                      onChange={(e) => setEditFormData({ ...editFormData, validUntil: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                {/* Upload Dokumen PDF Sertifikat */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>File Dokumen Sertifikat Resmi (.PDF)</span>
                    <span className="text-[11px] text-slate-400 font-normal">Maks. 25 MB</span>
                  </label>

                  <div className="p-4 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 hover:bg-sky-50 transition-colors text-center space-y-2">
                    <input
                      type="file"
                      id="cert-file-input"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="cert-file-input"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-sky-800">
                        {selectedFile ? selectedFile.name : "Klik untuk Pilih File PDF dari Komputer"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {selectedFile
                          ? `Ukuran: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB (Siap diunggah)`
                          : "Format resmi PDF berkop BAN-PT / LAMEMBA"}
                      </span>
                    </label>
                  </div>

                  {/* Manual / Existing URL alternative */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Atau Tautan File Sertifikat (Google Drive / Cloud Institusi):
                    </span>
                    <input
                      type="url"
                      value={editFormData.certificateUrl}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, certificateUrl: e.target.value })
                      }
                      placeholder="https://drive.google.com/... atau /uploads/certificates/..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {editFormData.certificateUrl && (
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sertifikat terpasang:</span>
                        <a
                          href={editFormData.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline truncate max-w-xs"
                        >
                          {editFormData.certificateUrl}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Catatan LPM */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Catatan Verifikasi LPM
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    placeholder="Catatan tambahan mengenai SK akreditasi ini..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-extrabold text-xs shadow-md shadow-sky-600/25 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mengunggah PDF...</span>
                      </>
                    ) : isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simpan Profil & Sertifikat</span>
                      </>
                    )}
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
