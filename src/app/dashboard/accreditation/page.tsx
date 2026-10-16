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
  Edit3,
  Save,
  Loader2,
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

export interface ILamembaDl05AssessorFollowUp {
  recommendationNo?: number;
  recommendation: string;
  yearIndex: number;
  actionTaken: string;
  obstacle?: string;
  cqiSolution: string;
  achievement: string;
  status: "SELESAI" | "SEDANG_BERJALAN" | "BELUM";
  evidenceUrl?: string;
}

export interface ILamembaDl05RenstraItem {
  yearIndex: number;
  strategy: string;
  actionTaken: string;
  obstacle?: string;
  cqiSolution: string;
  achievement: string;
}

export interface ILamembaDl05FacultyExpertiseItem {
  name: string;
  magister: string;
  doktor?: string;
  bidangKeahlian: string;
  serdos?: string;
  sertifikatProfesi?: string;
  isChange: boolean;
}

export interface ILamembaDl05ResearchOutcomeItem {
  judul: string;
  tahun: number;
  jenisLuaran: string;
  sumberBiayaPtMandiri: number;
  sumberBiayaLuarPt: number;
  sumberBiayaLuarNegeri: number;
  publikasiTidakTerakreditasi: number;
  publikasiNasionalTerakreditasi: number;
  publikasiInternasional: number;
  publikasiInternasionalBereputasi: number;
  seminarWilayah: number;
  seminarNasional: number;
  seminarInternasional: number;
  tulisanMediaWilayah: number;
  tulisanMediaNasional: number;
  tulisanMediaInternasional: number;
  pagelaranWilayah: number;
  pagelaranNasional: number;
  pagelaranInternasional: number;
  isChange: boolean;
}

export interface ILamembaDl05CitationItem {
  judulArtikel: string;
  tahunTerbit: number;
  penulis: string;
  jenisPublikasi: string;
  sitasiTs2: number;
  sitasiTs1: number;
  sitasiTs: number;
  linkArtikel: string;
  isChange: boolean;
}

export interface ILamembaDl05StudentOutcomeItem {
  judulLuaran: string;
  tahun: number;
  namaMahasiswa: string;
  jenisLuaran: string;
  buktiLuaran: string;
  isChange: boolean;
}

// Identitas Pengusul Dokumen (Sesuai Halaman Depan LAMEMBA)
export interface ILamembaDl05IdentitasPengusul {
  perguruanTinggi?: string;
  unitPengelola?: string;
  jenisProgram?: string;
  namaProdi?: string;
  alamat?: string;
  telepon?: string;
  emailWeb?: string;
  nomorSkPendirianPt?: string;
  tanggalSkPendirianPt?: string;
  pejabatSkPendirianPt?: string;
  nomorSkPembukaanPs?: string;
  tanggalSkPembukaanPs?: string;
  pejabatSkPembukaanPs?: string;
  tahunPertamaMenerimaMhs?: string;
  peringkatAkreditasiTerbaru?: string;
  nomorSkLam?: string;
  tanggalKadaluarsa?: string;
  kota?: string;
  tahunDokumen?: string;
  logoUrl?: string;
}

export interface ILamembaDl05TimPenyusunItem {
  nama: string;
  nikNidn: string;
  jabatan: string;
  peran: string;
}

export interface ILamembaDl05LembarPengesahanPihak {
  jabatan: string;
  nama: string;
  nikNidn: string;
}

export interface ILamembaDl05LembarPengesahan {
  kota?: string;
  tanggal?: string;
  kaprodi?: ILamembaDl05LembarPengesahanPihak;
  ketuaLpm?: ILamembaDl05LembarPengesahanPihak;
  ketuaPt?: ILamembaDl05LembarPengesahanPihak;
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

  // Sub-Tab 1: Rekomendasi Asesor & Renstra (Bab I & II)
  assessorFollowUpsList?: ILamembaDl05AssessorFollowUp[];
  renstraProgressList?: ILamembaDl05RenstraItem[];

  // Sub-Tab 2: Jaminan Pembelajaran & SDM Dosen (Bab III.1 & III.2)
  learningAssuranceItems?: ILamembaDl05LearningItem[];
  perbaikanBerkelanjutanJaminanPembelajaran?: string;

  dosenProfiles?: ILamembaDl05FacultyItem[];
  dosenExpertise?: ILamembaDl05FacultyExpertiseItem[];
  kontribusiIntelektualDosen?: ILamembaDl05IntellectualItem[];
  ewmpList?: ILamembaDl05EwmpItem[];
  perbaikanBerkelanjutanDosen?: string;

  // Sub-Tab 3: Tridharma, Riset, Sitasi, Mahasiswa & PD-Dikti (Bab III.3)
  researchOutcomes?: ILamembaDl05ResearchOutcomeItem[];
  citationsList?: ILamembaDl05CitationItem[];
  studentOutcomes?: ILamembaDl05StudentOutcomeItem[];
  mahasiswaAktifList?: ILamembaDl05StudentItem[];
  perbaikanBerkelanjutanTridharma?: string;
  perbaikanBerkelanjutanKemahasiswaan?: string;

  // Sub-Tab 4: Sampul, Identitas, Kata Pengantar, Narasi & Penutup
  identitasPengusul?: ILamembaDl05IdentitasPengusul;
  timPenyusun?: ILamembaDl05TimPenyusunItem[];
  lembarPengesahan?: ILamembaDl05LembarPengesahan;
  kataPengantar?: string;
  narasiBab1?: string;
  narasiBab2?: string;
  narasiBab3?: string;
  narasiBab31?: string;
  narasiBab32?: string;
  narasiBab33?: string;
  penutup?: string;

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

  // DL-05 Sub-Tabs state (Modular Opsi B)
  const [activeDl05SubTab, setActiveDl05SubTab] = useState<"asesor_renstra" | "cpl_dosen" | "tridharma_mhs" | "arsip_cetak">("asesor_renstra");

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

  // Sub-Tab 1: Edit State for Tabel 1.1 (Tindak Lanjut Rekomendasi Asesor)
  const [isEditingTable1, setIsEditingTable1] = useState(false);
  const [editingAssessorList, setEditingAssessorList] = useState<ILamembaDl05AssessorFollowUp[]>([]);
  const [isSavingTable1, setIsSavingTable1] = useState(false);
  const [table1Feedback, setTable1Feedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 1: Edit State for Tabel 2.1 (Kemajuan Implementasi Renstra)
  const [isEditingTable2, setIsEditingTable2] = useState(false);
  const [editingRenstraList, setEditingRenstraList] = useState<ILamembaDl05RenstraItem[]>([]);
  const [isSavingTable2, setIsSavingTable2] = useState(false);
  const [table2Feedback, setTable2Feedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 2: Edit State for Tabel 3.1.1 (Jaminan Pembelajaran)
  const [isEditingTable311, setIsEditingTable311] = useState(false);
  const [editingLearningList, setEditingLearningList] = useState<ILamembaDl05LearningItem[]>([]);
  const [editingLearningCqi, setEditingLearningCqi] = useState<string>("");
  const [isSavingTable311, setIsSavingTable311] = useState(false);
  const [table311Feedback, setTable311Feedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 2: Edit State for Tabel 3.2.1 (Profil Kepegawaian Dosen)
  const [isEditingTable321, setIsEditingTable321] = useState(false);
  const [editingDosenProfiles, setEditingDosenProfiles] = useState<ILamembaDl05FacultyItem[]>([]);
  const [isSavingTable321, setIsSavingTable321] = useState(false);
  const [table321Feedback, setTable321Feedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 2: Edit State for Tabel 3.2.3 (Latar Belakang Keahlian Dosen)
  const [isEditingTable323, setIsEditingTable323] = useState(false);
  const [editingDosenExpertise, setEditingDosenExpertise] = useState<ILamembaDl05FacultyExpertiseItem[]>([]);
  const [isSavingTable323, setIsSavingTable323] = useState(false);
  const [table323Feedback, setTable323Feedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 2: Edit State for Tabel 3.2.5 (Kontribusi Intelektual Dosen)
  const [isEditingTable325, setIsEditingTable325] = useState(false);
  const [editingKontribusiIntelektual, setEditingKontribusiIntelektual] = useState<ILamembaDl05IntellectualItem[]>([]);
  const [isSavingTable325, setIsSavingTable325] = useState(false);
  const [table325Feedback, setTable325Feedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 2: Edit State for Tabel 3.2.7 (EWMP Dosen) & CQI Dosen
  const [isEditingTable327, setIsEditingTable327] = useState(false);
  const [editingEwmpList, setEditingEwmpList] = useState<ILamembaDl05EwmpItem[]>([]);
  const [editingDosenCqi, setEditingDosenCqi] = useState<string>("");
  const [isSavingTable327, setIsSavingTable327] = useState(false);
  const [table327Feedback, setTable327Feedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 3: Edit State for Tabel 3.3.1 (Luaran Riset & PkM)
  const [isEditingTable331, setIsEditingTable331] = useState(false);
  const [editingResearchOutcomes, setEditingResearchOutcomes] = useState<ILamembaDl05ResearchOutcomeItem[]>([]);
  const [isSavingTable331, setIsSavingTable331] = useState(false);
  const [table331Feedback, setTable331Feedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 3: Edit State for Tabel 3.3.5 (Sitasi Dosen)
  const [isEditingTable335, setIsEditingTable335] = useState(false);
  const [editingCitationsList, setEditingCitationsList] = useState<ILamembaDl05CitationItem[]>([]);
  const [isSavingTable335, setIsSavingTable335] = useState(false);
  const [table335Feedback, setTable335Feedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 3: Edit State for Tabel 3.3.7 (Luaran Mahasiswa)
  const [isEditingTable337, setIsEditingTable337] = useState(false);
  const [editingStudentOutcomes, setEditingStudentOutcomes] = useState<ILamembaDl05StudentOutcomeItem[]>([]);
  const [isSavingTable337, setIsSavingTable337] = useState(false);
  const [table337Feedback, setTable337Feedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 3: Edit State for Tabel 3.3.9 (Kemahasiswaan & PD-Dikti) & CQI
  const [isEditingTable339, setIsEditingTable339] = useState(false);
  const [editingMahasiswaAktifList, setEditingMahasiswaAktifList] = useState<ILamembaDl05StudentItem[]>([]);
  const [editingTridharmaCqi, setEditingTridharmaCqi] = useState<string>("");
  const [editingKemahasiswaanCqi, setEditingKemahasiswaanCqi] = useState<string>("");
  const [isSavingTable339, setIsSavingTable339] = useState(false);
  const [table339Feedback, setTable339Feedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 4: Edit State for Identitas Pengusul & Sampul
  const [isEditingIdentitas, setIsEditingIdentitas] = useState(false);
  const [editingIdentitas, setEditingIdentitas] = useState<ILamembaDl05IdentitasPengusul>({});
  const [isSavingIdentitas, setIsSavingIdentitas] = useState(false);
  const [identitasFeedback, setIdentitasFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 4: Edit State for Tim Penyusun
  const [isEditingTimPenyusun, setIsEditingTimPenyusun] = useState(false);
  const [editingTimPenyusun, setEditingTimPenyusun] = useState<ILamembaDl05TimPenyusunItem[]>([]);
  const [isSavingTimPenyusun, setIsSavingTimPenyusun] = useState(false);
  const [timPenyusunFeedback, setTimPenyusunFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 4: Edit State for Lembar Pengesahan (Penandatangan 3 Pihak)
  const [isEditingPengesahan, setIsEditingPengesahan] = useState(false);
  const [editingPengesahan, setEditingPengesahan] = useState<ILamembaDl05LembarPengesahan>({});
  const [isSavingPengesahan, setIsSavingPengesahan] = useState(false);
  const [pengesahanFeedback, setPengesahanFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 4: Edit State for Kata Pengantar
  const [isEditingKataPengantar, setIsEditingKataPengantar] = useState(false);
  const [editingKataPengantar, setEditingKataPengantar] = useState<string>("");
  const [isSavingKataPengantar, setIsSavingKataPengantar] = useState(false);
  const [kataPengantarFeedback, setKataPengantarFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sub-Tab 4: Edit State for Narasi Antar-Bab & Penutup
  const [isEditingNarasi, setIsEditingNarasi] = useState(false);
  const [editingNarasiBab1, setEditingNarasiBab1] = useState<string>("");
  const [editingNarasiBab2, setEditingNarasiBab2] = useState<string>("");
  const [editingNarasiBab3, setEditingNarasiBab3] = useState<string>("");
  const [editingNarasiBab31, setEditingNarasiBab31] = useState<string>("");
  const [editingNarasiBab32, setEditingNarasiBab32] = useState<string>("");
  const [editingNarasiBab33, setEditingNarasiBab33] = useState<string>("");
  const [editingPenutup, setEditingPenutup] = useState<string>("");
  const [isSavingNarasi, setIsSavingNarasi] = useState(false);
  const [narasiFeedback, setNarasiFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  // Sub-Tab 1: Handlers for Tabel 1.1 (Tindak Lanjut Rekomendasi Asesor)
  const handleStartEditTable1 = () => {
    const initialList = dl05?.assessorFollowUpsList
      ? JSON.parse(JSON.stringify(dl05.assessorFollowUpsList))
      : [];
    setEditingAssessorList(initialList);
    setIsEditingTable1(true);
    setTable1Feedback(null);
  };

  const handleCancelEditTable1 = () => {
    setIsEditingTable1(false);
    setTable1Feedback(null);
  };

  const handleAddRowTable1 = () => {
    setEditingAssessorList(prev => [
      ...prev,
      {
        recommendationNo: prev.length + 1,
        recommendation: "",
        yearIndex: 1,
        actionTaken: "",
        obstacle: "",
        cqiSolution: "",
        achievement: "",
        status: "SEDANG_BERJALAN" as const,
        evidenceUrl: "",
      }
    ]);
  };

  const handleRemoveRowTable1 = (idx: number) => {
    setEditingAssessorList(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated.map((item, i) => ({ ...item, recommendationNo: i + 1 }));
    });
  };

  const handleUpdateRowTable1 = (idx: number, field: keyof ILamembaDl05AssessorFollowUp, value: any) => {
    setEditingAssessorList(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveTable1 = async () => {
    if (!dl05) return;
    setIsSavingTable1(true);
    setTable1Feedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          assessorFollowUpsList: editingAssessorList,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTable1Feedback({ type: "success", text: "Perubahan data Tabel 1.1 Tindak Lanjut Rekomendasi Asesor berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTable1(false);
          setTable1Feedback(null);
        }, 1200);
      } else {
        setTable1Feedback({ type: "error", text: data.error || "Gagal menyimpan perubahan Tabel 1.1." });
      }
    } catch {
      setTable1Feedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan Tabel 1.1." });
    } finally {
      setIsSavingTable1(false);
    }
  };

  // Sub-Tab 1: Handlers for Tabel 2.1 (Kemajuan Implementasi Renstra)
  const handleStartEditTable2 = () => {
    const initialList = dl05?.renstraProgressList
      ? JSON.parse(JSON.stringify(dl05.renstraProgressList))
      : [];
    setEditingRenstraList(initialList);
    setIsEditingTable2(true);
    setTable2Feedback(null);
  };

  const handleCancelEditTable2 = () => {
    setIsEditingTable2(false);
    setTable2Feedback(null);
  };

  const handleAddRowTable2 = () => {
    setEditingRenstraList(prev => [
      ...prev,
      {
        yearIndex: 1,
        strategy: "",
        actionTaken: "",
        obstacle: "",
        cqiSolution: "",
        achievement: "",
      }
    ]);
  };

  const handleRemoveRowTable2 = (idx: number) => {
    setEditingRenstraList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRowTable2 = (idx: number, field: keyof ILamembaDl05RenstraItem, value: any) => {
    setEditingRenstraList(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveTable2 = async () => {
    if (!dl05) return;
    setIsSavingTable2(true);
    setTable2Feedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          renstraProgressList: editingRenstraList,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTable2Feedback({ type: "success", text: "Perubahan data Tabel 2.1 Kemajuan Strategi Renstra berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTable2(false);
          setTable2Feedback(null);
        }, 1200);
      } else {
        setTable2Feedback({ type: "error", text: data.error || "Gagal menyimpan perubahan Tabel 2.1." });
      }
    } catch {
      setTable2Feedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan Tabel 2.1." });
    } finally {
      setIsSavingTable2(false);
    }
  };

  // ==========================================
  // SUB-TAB 2 HANDLERS (BAB III.1 & BAB III.2)
  // ==========================================

  // Tabel 3.1.1 (Jaminan Pembelajaran) & CQI CPL
  const handleStartEditTable311 = () => {
    const initialList = dl05?.learningAssuranceItems
      ? JSON.parse(JSON.stringify(dl05.learningAssuranceItems))
      : [];
    setEditingLearningList(initialList);
    setEditingLearningCqi(dl05?.perbaikanBerkelanjutanJaminanPembelajaran || "");
    setIsEditingTable311(true);
    setTable311Feedback(null);
  };

  const handleCancelEditTable311 = () => {
    setIsEditingTable311(false);
    setTable311Feedback(null);
  };

  const handleAddRowTable311 = () => {
    setEditingLearningList(prev => [
      ...prev,
      {
        nomor: prev.length + 1,
        indikator: "",
        upayaTahun1: "",
        hasilTahun1: "",
        upayaTahun2: "",
        hasilTahun2: "",
        upayaTahun3: "",
        hasilTahun3: "",
        upayaTahun4: "",
        hasilTahun4: "",
      }
    ]);
  };

  const handleRemoveRowTable311 = (idx: number) => {
    setEditingLearningList(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated.map((item, i) => ({ ...item, nomor: i + 1 }));
    });
  };

  const handleUpdateRowTable311 = (idx: number, field: keyof ILamembaDl05LearningItem, value: any) => {
    setEditingLearningList(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveTable311 = async () => {
    if (!dl05) return;
    setIsSavingTable311(true);
    setTable311Feedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          learningAssuranceItems: editingLearningList,
          perbaikanBerkelanjutanJaminanPembelajaran: editingLearningCqi,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTable311Feedback({ type: "success", text: "Perubahan data Tabel 3.1.1 Jaminan Pembelajaran & CQI berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTable311(false);
          setTable311Feedback(null);
        }, 1200);
      } else {
        setTable311Feedback({ type: "error", text: data.error || "Gagal menyimpan perubahan Tabel 3.1.1." });
      }
    } catch {
      setTable311Feedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan Tabel 3.1.1." });
    } finally {
      setIsSavingTable311(false);
    }
  };

  // Tabel 3.2.1 (Profil Kepegawaian Dosen)
  const handleStartEditTable321 = () => {
    const initialList = dl05?.dosenProfiles
      ? JSON.parse(JSON.stringify(dl05.dosenProfiles))
      : [];
    setEditingDosenProfiles(initialList);
    setIsEditingTable321(true);
    setTable321Feedback(null);
  };

  const handleCancelEditTable321 = () => {
    setIsEditingTable321(false);
    setTable321Feedback(null);
  };

  const handleAddRowTable321 = () => {
    setEditingDosenProfiles(prev => [
      ...prev,
      {
        name: "",
        status: "Tetap",
        nidn: "",
        jabatanAkademik: "Lektor",
        jalur: "Akademisi",
        namaPerusahaan: "",
        isChange: false,
        isKeluar: false,
      }
    ]);
  };

  const handleRemoveRowTable321 = (idx: number) => {
    setEditingDosenProfiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRowTable321 = (idx: number, field: keyof ILamembaDl05FacultyItem, value: any) => {
    setEditingDosenProfiles(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveTable321 = async () => {
    if (!dl05) return;
    setIsSavingTable321(true);
    setTable321Feedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          dosenProfiles: editingDosenProfiles,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTable321Feedback({ type: "success", text: "Perubahan data Tabel 3.2.1 Profil Kepegawaian Dosen berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTable321(false);
          setTable321Feedback(null);
        }, 1200);
      } else {
        setTable321Feedback({ type: "error", text: data.error || "Gagal menyimpan data Tabel 3.2.1." });
      }
    } catch {
      setTable321Feedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan Tabel 3.2.1." });
    } finally {
      setIsSavingTable321(false);
    }
  };

  // Tabel 3.2.3 (Latar Belakang Keahlian Dosen)
  const handleStartEditTable323 = () => {
    const initialList = dl05?.dosenExpertise
      ? JSON.parse(JSON.stringify(dl05.dosenExpertise))
      : [];
    setEditingDosenExpertise(initialList);
    setIsEditingTable323(true);
    setTable323Feedback(null);
  };

  const handleCancelEditTable323 = () => {
    setIsEditingTable323(false);
    setTable323Feedback(null);
  };

  const handleAddRowTable323 = () => {
    setEditingDosenExpertise(prev => [
      ...prev,
      {
        name: "",
        magister: "",
        doktor: "",
        bidangKeahlian: "",
        serdos: "",
        sertifikatProfesi: "",
        isChange: false,
      }
    ]);
  };

  const handleRemoveRowTable323 = (idx: number) => {
    setEditingDosenExpertise(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRowTable323 = (idx: number, field: keyof ILamembaDl05FacultyExpertiseItem, value: any) => {
    setEditingDosenExpertise(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveTable323 = async () => {
    if (!dl05) return;
    setIsSavingTable323(true);
    setTable323Feedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          dosenExpertise: editingDosenExpertise,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTable323Feedback({ type: "success", text: "Perubahan data Tabel 3.2.3 Latar Belakang Keahlian Dosen berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTable323(false);
          setTable323Feedback(null);
        }, 1200);
      } else {
        setTable323Feedback({ type: "error", text: data.error || "Gagal menyimpan data Tabel 3.2.3." });
      }
    } catch {
      setTable323Feedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan Tabel 3.2.3." });
    } finally {
      setIsSavingTable323(false);
    }
  };

  // Tabel 3.2.5 (Kontribusi Intelektual Dosen)
  const handleStartEditTable325 = () => {
    const initialList = dl05?.kontribusiIntelektualDosen
      ? JSON.parse(JSON.stringify(dl05.kontribusiIntelektualDosen))
      : [];
    setEditingKontribusiIntelektual(initialList);
    setIsEditingTable325(true);
    setTable325Feedback(null);
  };

  const handleCancelEditTable325 = () => {
    setIsEditingTable325(false);
    setTable325Feedback(null);
  };

  const handleAddRowTable325 = () => {
    setEditingKontribusiIntelektual(prev => [
      ...prev,
      {
        name: "",
        rekognisiPendidikan: "",
        rekognisiPraktik: "",
        rekognisiPenelitian: "",
        rekognisiSosial: "",
        isChange: false,
      }
    ]);
  };

  const handleRemoveRowTable325 = (idx: number) => {
    setEditingKontribusiIntelektual(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRowTable325 = (idx: number, field: keyof ILamembaDl05IntellectualItem, value: any) => {
    setEditingKontribusiIntelektual(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveTable325 = async () => {
    if (!dl05) return;
    setIsSavingTable325(true);
    setTable325Feedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          kontribusiIntelektualDosen: editingKontribusiIntelektual,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTable325Feedback({ type: "success", text: "Perubahan data Tabel 3.2.5 Kontribusi Intelektual Dosen berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTable325(false);
          setTable325Feedback(null);
        }, 1200);
      } else {
        setTable325Feedback({ type: "error", text: data.error || "Gagal menyimpan data Tabel 3.2.5." });
      }
    } catch {
      setTable325Feedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan Tabel 3.2.5." });
    } finally {
      setIsSavingTable325(false);
    }
  };

  // Tabel 3.2.7 (EWMP Dosen) & CQI Dosen
  const handleStartEditTable327 = () => {
    const initialList = dl05?.ewmpList
      ? JSON.parse(JSON.stringify(dl05.ewmpList))
      : [];
    setEditingEwmpList(initialList);
    setEditingDosenCqi(dl05?.perbaikanBerkelanjutanDosen || "");
    setIsEditingTable327(true);
    setTable327Feedback(null);
  };

  const handleCancelEditTable327 = () => {
    setIsEditingTable327(false);
    setTable327Feedback(null);
  };

  const handleAddRowTable327 = () => {
    setEditingEwmpList(prev => [
      ...prev,
      {
        name: "",
        psAkreditasiSks: 0,
        psLainDalamPtSks: 0,
        psLainLuarPtSks: 0,
        penelitianSks: 0,
        pkmSks: 0,
        tugasTambahanSks: 0,
        totalSks: 0,
        avgSemesterSks: 0,
        isChange: false,
      }
    ]);
  };

  const handleRemoveRowTable327 = (idx: number) => {
    setEditingEwmpList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRowTable327 = (idx: number, field: keyof ILamembaDl05EwmpItem, value: any) => {
    setEditingEwmpList(prev => {
      const updated = [...prev];
      const numVal = typeof value === "number" ? value : parseFloat(value) || 0;
      updated[idx] = { ...updated[idx], [field]: field === "name" || field === "isChange" ? value : numVal };
      const row = updated[idx];
      row.totalSks = (Number(row.psAkreditasiSks) || 0) +
                     (Number(row.psLainDalamPtSks) || 0) +
                     (Number(row.psLainLuarPtSks) || 0) +
                     (Number(row.penelitianSks) || 0) +
                     (Number(row.pkmSks) || 0) +
                     (Number(row.tugasTambahanSks) || 0);
      return updated;
    });
  };

  const handleSaveTable327 = async () => {
    if (!dl05) return;
    setIsSavingTable327(true);
    setTable327Feedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          ewmpList: editingEwmpList,
          perbaikanBerkelanjutanDosen: editingDosenCqi,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTable327Feedback({ type: "success", text: "Perubahan data Tabel 3.2.7 EWMP Dosen & Catatan CQI berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTable327(false);
          setTable327Feedback(null);
        }, 1200);
      } else {
        setTable327Feedback({ type: "error", text: data.error || "Gagal menyimpan data Tabel 3.2.7." });
      }
    } catch {
      setTable327Feedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan Tabel 3.2.7." });
    } finally {
      setIsSavingTable327(false);
    }
  };

  // ==========================================
  // SUB-TAB 3 HANDLERS (BAB III.3)
  // ==========================================

  // Tabel 3.3.1 (Luaran Riset & PkM)
  const handleStartEditTable331 = () => {
    const initialList = dl05?.researchOutcomes
      ? JSON.parse(JSON.stringify(dl05.researchOutcomes))
      : [];
    setEditingResearchOutcomes(initialList);
    setIsEditingTable331(true);
    setTable331Feedback(null);
  };

  const handleCancelEditTable331 = () => {
    setIsEditingTable331(false);
    setTable331Feedback(null);
  };

  const handleAddRowTable331 = () => {
    setEditingResearchOutcomes(prev => [
      ...prev,
      {
        judul: "",
        tahun: new Date().getFullYear(),
        jenisLuaran: "Jurnal Ilmiah",
        sumberBiayaPtMandiri: 1,
        sumberBiayaLuarPt: 0,
        sumberBiayaLuarNegeri: 0,
        publikasiTidakTerakreditasi: 0,
        publikasiNasionalTerakreditasi: 1,
        publikasiInternasional: 0,
        publikasiInternasionalBereputasi: 0,
        seminarWilayah: 0,
        seminarNasional: 0,
        seminarInternasional: 0,
        tulisanMediaWilayah: 0,
        tulisanMediaNasional: 0,
        tulisanMediaInternasional: 0,
        pagelaranWilayah: 0,
        pagelaranNasional: 0,
        pagelaranInternasional: 0,
        isChange: false,
      }
    ]);
  };

  const handleRemoveRowTable331 = (idx: number) => {
    setEditingResearchOutcomes(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRowTable331 = (idx: number, field: keyof ILamembaDl05ResearchOutcomeItem, value: any) => {
    setEditingResearchOutcomes(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveTable331 = async () => {
    if (!dl05) return;
    setIsSavingTable331(true);
    setTable331Feedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          researchOutcomes: editingResearchOutcomes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTable331Feedback({ type: "success", text: "Perubahan data Tabel 3.3.1 Luaran Riset & PkM berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTable331(false);
          setTable331Feedback(null);
        }, 1200);
      } else {
        setTable331Feedback({ type: "error", text: data.error || "Gagal menyimpan data Tabel 3.3.1." });
      }
    } catch {
      setTable331Feedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan Tabel 3.3.1." });
    } finally {
      setIsSavingTable331(false);
    }
  };

  // Tabel 3.3.5 (Sitasi Dosen)
  const handleStartEditTable335 = () => {
    const initialList = dl05?.citationsList
      ? JSON.parse(JSON.stringify(dl05.citationsList))
      : [];
    setEditingCitationsList(initialList);
    setIsEditingTable335(true);
    setTable335Feedback(null);
  };

  const handleCancelEditTable335 = () => {
    setIsEditingTable335(false);
    setTable335Feedback(null);
  };

  const handleAddRowTable335 = () => {
    setEditingCitationsList(prev => [
      ...prev,
      {
        judulArtikel: "",
        tahunTerbit: new Date().getFullYear() - 1,
        penulis: "",
        jenisPublikasi: "Jurnal Nasional Terakreditasi",
        sitasiTs2: 0,
        sitasiTs1: 0,
        sitasiTs: 0,
        linkArtikel: "",
        isChange: false,
      }
    ]);
  };

  const handleRemoveRowTable335 = (idx: number) => {
    setEditingCitationsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRowTable335 = (idx: number, field: keyof ILamembaDl05CitationItem, value: any) => {
    setEditingCitationsList(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveTable335 = async () => {
    if (!dl05) return;
    setIsSavingTable335(true);
    setTable335Feedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          citationsList: editingCitationsList,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTable335Feedback({ type: "success", text: "Perubahan data Tabel 3.3.5 Sitasi Dosen berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTable335(false);
          setTable335Feedback(null);
        }, 1200);
      } else {
        setTable335Feedback({ type: "error", text: data.error || "Gagal menyimpan data Tabel 3.3.5." });
      }
    } catch {
      setTable335Feedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan Tabel 3.3.5." });
    } finally {
      setIsSavingTable335(false);
    }
  };

  // Tabel 3.3.7 (Luaran Mahasiswa)
  const handleStartEditTable337 = () => {
    const initialList = dl05?.studentOutcomes
      ? JSON.parse(JSON.stringify(dl05.studentOutcomes))
      : [];
    setEditingStudentOutcomes(initialList);
    setIsEditingTable337(true);
    setTable337Feedback(null);
  };

  const handleCancelEditTable337 = () => {
    setIsEditingTable337(false);
    setTable337Feedback(null);
  };

  const handleAddRowTable337 = () => {
    setEditingStudentOutcomes(prev => [
      ...prev,
      {
        judulLuaran: "",
        tahun: new Date().getFullYear(),
        namaMahasiswa: "",
        jenisLuaran: "Prestasi / Rekognisi",
        buktiLuaran: "",
        isChange: false,
      }
    ]);
  };

  const handleRemoveRowTable337 = (idx: number) => {
    setEditingStudentOutcomes(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRowTable337 = (idx: number, field: keyof ILamembaDl05StudentOutcomeItem, value: any) => {
    setEditingStudentOutcomes(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSaveTable337 = async () => {
    if (!dl05) return;
    setIsSavingTable337(true);
    setTable337Feedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          studentOutcomes: editingStudentOutcomes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTable337Feedback({ type: "success", text: "Perubahan data Tabel 3.3.7 Luaran Mahasiswa berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTable337(false);
          setTable337Feedback(null);
        }, 1200);
      } else {
        setTable337Feedback({ type: "error", text: data.error || "Gagal menyimpan data Tabel 3.3.7." });
      }
    } catch {
      setTable337Feedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan Tabel 3.3.7." });
    } finally {
      setIsSavingTable337(false);
    }
  };

  // Tabel 3.3.9 (Kemahasiswaan & PD-Dikti) & CQI
  const handleStartEditTable339 = () => {
    const initialList = dl05?.mahasiswaAktifList
      ? JSON.parse(JSON.stringify(dl05.mahasiswaAktifList))
      : [];
    setEditingMahasiswaAktifList(initialList);
    setEditingTridharmaCqi(dl05?.perbaikanBerkelanjutanTridharma || "");
    setEditingKemahasiswaanCqi(dl05?.perbaikanBerkelanjutanKemahasiswaan || "");
    setIsEditingTable339(true);
    setTable339Feedback(null);
  };

  const handleCancelEditTable339 = () => {
    setIsEditingTable339(false);
    setTable339Feedback(null);
  };

  const handleAddRowTable339 = () => {
    setEditingMahasiswaAktifList(prev => [
      ...prev,
      {
        semester: prev.length % 2 === 0 ? "Ganjil" : "Genap",
        mhsAktif: 0,
        mhsPdDikti: 0,
        selisih: 0,
        isChange: false,
      }
    ]);
  };

  const handleRemoveRowTable339 = (idx: number) => {
    setEditingMahasiswaAktifList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRowTable339 = (idx: number, field: keyof ILamembaDl05StudentItem, value: any) => {
    setEditingMahasiswaAktifList(prev => {
      const updated = [...prev];
      const numVal = typeof value === "number" ? value : parseInt(value) || 0;
      updated[idx] = { ...updated[idx], [field]: field === "semester" || field === "isChange" ? value : numVal };
      const row = updated[idx];
      row.selisih = Math.abs((Number(row.mhsAktif) || 0) - (Number(row.mhsPdDikti) || 0));
      return updated;
    });
  };

  const handleSaveTable339 = async () => {
    if (!dl05) return;
    setIsSavingTable339(true);
    setTable339Feedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          mahasiswaAktifList: editingMahasiswaAktifList,
          perbaikanBerkelanjutanTridharma: editingTridharmaCqi,
          perbaikanBerkelanjutanKemahasiswaan: editingKemahasiswaanCqi,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTable339Feedback({ type: "success", text: "Perubahan data Tabel 3.3.9 Rekonsiliasi PD-Dikti & CQI berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTable339(false);
          setTable339Feedback(null);
        }, 1200);
      } else {
        setTable339Feedback({ type: "error", text: data.error || "Gagal menyimpan data Tabel 3.3.9." });
      }
    } catch {
      setTable339Feedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan Tabel 3.3.9." });
    } finally {
      setIsSavingTable339(false);
    }
  };

  // Sub-Tab 4 Handlers: Identitas Pengusul & Sampul
  const handleStartEditIdentitas = () => {
    setEditingIdentitas(
      dl05?.identitasPengusul || {
        perguruanTinggi: "Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar",
        unitPengelola: "Jurusan Manajemen / Sekolah Tinggi Ilmu Manajemen Indonesia",
        jenisProgram: "Sarjana (S1)",
        namaProdi: "Program Studi Sarjana Manajemen",
        alamat: "Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan 90245",
        telepon: "0411-588123",
        emailWeb: "info@stimiyapmi.ac.id / www.stimiyapmi.ac.id",
        nomorSkPendirianPt: "SK Mendikbud RI No. 042/D/O/1997",
        tanggalSkPendirianPt: "1997-07-25",
        pejabatSkPendirianPt: "Menteri Pendidikan dan Kebudayaan RI",
        nomorSkPembukaanPs: "SK Dirjen Dikti No. 219/DIKTI/Kep/1999",
        tanggalSkPembukaanPs: "1999-05-18",
        pejabatSkPembukaanPs: "Direktur Jenderal Pendidikan Tinggi",
        tahunPertamaMenerimaMhs: "1998",
        peringkatAkreditasiTerbaru: "Baik Sekali",
        nomorSkLam: "SK LAMEMBA No. 933/DE/A.5/AR.10/XII/2023",
        tanggalKadaluarsa: "2028-12-28",
        kota: "Makassar",
        tahunDokumen: "2025",
        logoUrl: "/logo_stimi.png",
      }
    );
    setIsEditingIdentitas(true);
    setIdentitasFeedback(null);
  };

  const handleUpdateIdentitasField = (field: keyof ILamembaDl05IdentitasPengusul, value: string) => {
    setEditingIdentitas((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveIdentitas = async () => {
    if (!dl05) return;
    setIsSavingIdentitas(true);
    setIdentitasFeedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          identitasPengusul: editingIdentitas,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIdentitasFeedback({ type: "success", text: "Identitas Pengusul & Sampul berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingIdentitas(false);
          setIdentitasFeedback(null);
        }, 1200);
      } else {
        setIdentitasFeedback({ type: "error", text: data.error || "Gagal menyimpan identitas pengusul." });
      }
    } catch {
      setIdentitasFeedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan identitas pengusul." });
    } finally {
      setIsSavingIdentitas(false);
    }
  };

  // Sub-Tab 4 Handlers: Tim Penyusun
  const handleStartEditTimPenyusun = () => {
    setEditingTimPenyusun(dl05?.timPenyusun ? JSON.parse(JSON.stringify(dl05.timPenyusun)) : []);
    setIsEditingTimPenyusun(true);
    setTimPenyusunFeedback(null);
  };

  const handleAddRowTimPenyusun = () => {
    setEditingTimPenyusun((prev) => [
      ...prev,
      {
        nama: "Nama Anggota Baru",
        nikNidn: "NIDN. -",
        jabatan: "Dosen / Tim Taskforce",
        peran: "Anggota Tim Evaluasi",
      },
    ]);
  };

  const handleRemoveRowTimPenyusun = (idx: number) => {
    setEditingTimPenyusun((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRowTimPenyusun = (idx: number, field: keyof ILamembaDl05TimPenyusunItem, value: any) => {
    setEditingTimPenyusun((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSaveTimPenyusun = async () => {
    if (!dl05) return;
    setIsSavingTimPenyusun(true);
    setTimPenyusunFeedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          timPenyusun: editingTimPenyusun,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTimPenyusunFeedback({ type: "success", text: "Daftar Tim Penyusun berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingTimPenyusun(false);
          setTimPenyusunFeedback(null);
        }, 1200);
      } else {
        setTimPenyusunFeedback({ type: "error", text: data.error || "Gagal menyimpan tim penyusun." });
      }
    } catch {
      setTimPenyusunFeedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan tim penyusun." });
    } finally {
      setIsSavingTimPenyusun(false);
    }
  };

  // Sub-Tab 4 Handlers: Lembar Pengesahan (Penandatangan 3 Pihak)
  const handleStartEditPengesahan = () => {
    setEditingPengesahan(
      dl05?.lembarPengesahan || {
        kota: "Makassar",
        tanggal: "15 Januari 2026",
        kaprodi: {
          jabatan: "Ketua Program Studi S1 Manajemen",
          nama: (dl05?.timPenyusun && dl05.timPenyusun[0]?.nama) || "Drs. H. M. Said, M.Si",
          nikNidn: (dl05?.timPenyusun && dl05.timPenyusun[0]?.nikNidn) || "NIDN. 0918077501",
        },
        ketuaLpm: {
          jabatan: "Ketua Lembaga Penjaminan Mutu",
          nama: "Dr. Nurul Fadilah, SE., MM",
          nikNidn: "NIDN. 0915088201",
        },
        ketuaPt: {
          jabatan: "Ketua STIMI YAPMI Makassar",
          nama: "Dr. Ibrahim Syah, S.E., M.M.",
          nikNidn: "NIDN. 0920037601",
        },
      }
    );
    setIsEditingPengesahan(true);
    setPengesahanFeedback(null);
  };

  const handleUpdatePengesahanPihak = (
    pihak: "kaprodi" | "ketuaLpm" | "ketuaPt",
    field: "jabatan" | "nama" | "nikNidn",
    value: string
  ) => {
    setEditingPengesahan((prev) => ({
      ...prev,
      [pihak]: {
        ...(prev[pihak] || { jabatan: "", nama: "", nikNidn: "" }),
        [field]: value,
      },
    }));
  };

  const handleUpdatePengesahanMeta = (field: "kota" | "tanggal", value: string) => {
    setEditingPengesahan((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSavePengesahan = async () => {
    if (!dl05) return;
    setIsSavingPengesahan(true);
    setPengesahanFeedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          lembarPengesahan: editingPengesahan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPengesahanFeedback({ type: "success", text: "Pengaturan Penandatangan Lembar Pengesahan berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingPengesahan(false);
          setPengesahanFeedback(null);
        }, 1200);
      } else {
        setPengesahanFeedback({ type: "error", text: data.error || "Gagal menyimpan lembar pengesahan." });
      }
    } catch {
      setPengesahanFeedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan lembar pengesahan." });
    } finally {
      setIsSavingPengesahan(false);
    }
  };

  // Sub-Tab 4 Handlers: Kata Pengantar
  const handleStartEditKataPengantar = () => {
    setEditingKataPengantar(dl05?.kataPengantar || "");
    setIsEditingKataPengantar(true);
    setKataPengantarFeedback(null);
  };

  const handleSaveKataPengantar = async () => {
    if (!dl05) return;
    setIsSavingKataPengantar(true);
    setKataPengantarFeedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          kataPengantar: editingKataPengantar,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setKataPengantarFeedback({ type: "success", text: "Kata Pengantar berhasil diperbarui!" });
        await loadData();
        setTimeout(() => {
          setIsEditingKataPengantar(false);
          setKataPengantarFeedback(null);
        }, 1200);
      } else {
        setKataPengantarFeedback({ type: "error", text: data.error || "Gagal menyimpan kata pengantar." });
      }
    } catch {
      setKataPengantarFeedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan kata pengantar." });
    } finally {
      setIsSavingKataPengantar(false);
    }
  };

  // Sub-Tab 4 Handlers: Narasi Antar-Bab & Penutup
  const handleStartEditNarasi = () => {
    setEditingNarasiBab1(dl05?.narasiBab1 || "");
    setEditingNarasiBab2(dl05?.narasiBab2 || "");
    setEditingNarasiBab3(dl05?.narasiBab3 || "");
    setEditingNarasiBab31(dl05?.narasiBab31 || "");
    setEditingNarasiBab32(dl05?.narasiBab32 || "");
    setEditingNarasiBab33(dl05?.narasiBab33 || "");
    setEditingPenutup(dl05?.penutup || "");
    setIsEditingNarasi(true);
    setNarasiFeedback(null);
  };

  const handleSaveNarasi = async () => {
    if (!dl05) return;
    setIsSavingNarasi(true);
    setNarasiFeedback(null);
    try {
      const res = await fetch("/api/accreditation/dl05", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: dl05.academicYear,
          narasiBab1: editingNarasiBab1,
          narasiBab2: editingNarasiBab2,
          narasiBab3: editingNarasiBab3,
          narasiBab31: editingNarasiBab31,
          narasiBab32: editingNarasiBab32,
          narasiBab33: editingNarasiBab33,
          penutup: editingPenutup,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNarasiFeedback({ type: "success", text: "Seluruh Narasi Pengantar Bab & Penutup berhasil disimpan!" });
        await loadData();
        setTimeout(() => {
          setIsEditingNarasi(false);
          setNarasiFeedback(null);
        }, 1200);
      } else {
        setNarasiFeedback({ type: "error", text: data.error || "Gagal menyimpan narasi bab." });
      }
    } catch {
      setNarasiFeedback({ type: "error", text: "Terjadi gangguan jaringan saat menyimpan narasi." });
    } finally {
      setIsSavingNarasi(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Akreditasi & Pemantauan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Status Legalitas BAN-PT, Akreditasi LAMEMBA, serta Dokumen Pemantauan & Evaluasi Tahunan (DL-05).
          </p>
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
                <span>Format Baku Lampiran DL-05 • Standar Regulasi LAMEMBA</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-300/80 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800">
                Kode Dokumen: LAMEMBA-DL-05
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300 font-bold">
                  <span>{dl05.prodiName}</span>
                  <span>•</span>
                  <span>Tahun Akademik {dl05.academicYear}</span>
                  <span>•</span>
                  <span className="text-emerald-200/90 font-medium">Siklus Pemantauan Pasca-Akreditasi</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  Dokumen Pemantauan & Evaluasi Tahunan <span className="whitespace-nowrap">(DL-05)</span>
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed text-justify">
                  Borang resmi penjaminan mutu berkala untuk merekam tindak lanjut rekomendasi asesor, pencapaian sasaran Renstra, jaminan pembelajaran (CPL), profil kualifikasi dosen, luaran Tridharma, hingga pengarsipan surat keputusan rekomendasi tahunan dari Dewan Eksekutif LAMEMBA.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/10 text-emerald-200 text-[11px] font-semibold border border-white/10">
                    <Check className="w-3 h-3 text-emerald-300" /> 4 Bab Format Baku Word
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/10 text-emerald-200 text-[11px] font-semibold border border-white/10">
                    <Check className="w-3 h-3 text-emerald-300" /> Rekonsiliasi PD-Dikti Feeder
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/10 text-emerald-200 text-[11px] font-semibold border border-white/10">
                    <Check className="w-3 h-3 text-emerald-300" /> Koleksi 1 SK Rekomendasi/Tahun
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setIsPrintDl05ModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all hover:scale-[1.02] cursor-pointer shadow-sm"
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

          {/* 4 MODULAR SUB-TABS NAVIGATION (OPSI B) */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveDl05SubTab("asesor_renstra")}
              className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeDl05SubTab === "asesor_renstra"
                  ? "bg-white text-emerald-800 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>📑 Sub-Tab 1: Rekomendasi Asesor & Renstra (Bab I & II)</span>
            </button>

            <button
              onClick={() => setActiveDl05SubTab("cpl_dosen")}
              className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeDl05SubTab === "cpl_dosen"
                  ? "bg-white text-purple-800 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
              <span>🎓 Sub-Tab 2: Kurikulum CPL & Profil Dosen (Bab III.1 & III.2)</span>
            </button>

            <button
              onClick={() => setActiveDl05SubTab("tridharma_mhs")}
              className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeDl05SubTab === "tridharma_mhs"
                  ? "bg-white text-sky-800 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-sky-600 shrink-0" />
              <span>🔬 Sub-Tab 3: Tridharma, Riset, Sitasi & Mahasiswa (Bab III.3)</span>
            </button>

            <button
              onClick={() => setActiveDl05SubTab("arsip_cetak")}
              className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeDl05SubTab === "arsip_cetak"
                  ? "bg-white text-amber-800 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>📂 Sub-Tab 4: Arsip Surat LAM & Cetak Borang Lengkap</span>
            </button>
          </div>

          {/* SUB-TAB 1: REKOMENDASI ASESOR & STRATEGI RENSTRA (BAB I & BAB II) */}
          {activeDl05SubTab === "asesor_renstra" && (
            <div className="space-y-8">
              {/* BAB I: TINDAK LANJUT REKOMENDASI ASESOR (TABEL 1.1) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Bab I: Tindak Lanjut Rekomendasi Asesor (Tabel 1.1)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Tindak lanjut komprehensif terhadap temuan dan rekomendasi asesor saat Asesmen Lapangan akreditasi LAMEMBA terakhir
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Tabel 1.1 Standar LAMEMBA
                    </span>
                    {!isEditingTable1 ? (
                      <button
                        onClick={handleStartEditTable1}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tabel 1.1</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable1}
                          disabled={isSavingTable1}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable1}
                          disabled={isSavingTable1}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable1 ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>{isSavingTable1 ? "Menyimpan..." : "Simpan Perubahan"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {table1Feedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                      table1Feedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {table1Feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{table1Feedback.text}</span>
                  </div>
                )}

                {!isEditingTable1 ? (
                  /* VIEW MODE TABEL 1.1 */
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200 text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700">
                          <th className="border border-slate-200 p-3 text-center w-12 font-black">No</th>
                          <th className="border border-slate-200 p-3 text-left w-1/4 font-black">
                            Rekomendasi Asesor (Asesmen Lapangan Terakhir)
                          </th>
                          <th className="border border-slate-200 p-3 text-left font-black">
                            Usaha yang Dilakukan
                          </th>
                          <th className="border border-slate-200 p-3 text-left font-black bg-amber-50/50 text-amber-950">
                            Hambatan yang Dihadapi
                          </th>
                          <th className="border border-slate-200 p-3 text-left font-black bg-sky-50/50 text-sky-950">
                            Tindakan CQI untuk Mengatasi Hambatan
                          </th>
                          <th className="border border-slate-200 p-3 text-left font-black text-emerald-950">
                            Hasil yang Dicapai
                          </th>
                          <th className="border border-slate-200 p-3 text-center w-24 font-black">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.assessorFollowUpsList || []).length > 0 ? (
                          dl05.assessorFollowUpsList!.map((item) => (
                            <tr key={item.recommendationNo} className="align-top hover:bg-slate-50/60 transition-colors">
                              <td className="border border-slate-200 p-3 text-center font-bold text-slate-500">
                                {item.recommendationNo}
                              </td>
                              <td className="border border-slate-200 p-3 font-bold text-slate-900 leading-relaxed">
                                {item.recommendation}
                              </td>
                              <td className="border border-slate-200 p-3 text-slate-700 leading-relaxed">
                                {item.actionTaken}
                              </td>
                              <td className="border border-slate-200 p-3 text-amber-900 bg-amber-50/20 leading-relaxed">
                                {item.obstacle || "-"}
                              </td>
                              <td className="border border-slate-200 p-3 text-sky-900 bg-sky-50/20 leading-relaxed">
                                {item.cqiSolution || "-"}
                              </td>
                              <td className="border border-slate-200 p-3 font-semibold text-emerald-900 leading-relaxed">
                                {item.achievement}
                              </td>
                              <td className="border border-slate-200 p-3 text-center">
                                <span
                                  className={`px-2 py-1 rounded-full text-[10px] font-black inline-block whitespace-nowrap ${
                                    item.status === "SELESAI"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : item.status === "SEDANG_BERJALAN"
                                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                                      : "bg-rose-100 text-rose-800 border border-rose-300"
                                  }`}
                                >
                                  {item.status === "SELESAI"
                                    ? "🟢 Selesai"
                                    : item.status === "SEDANG_BERJALAN"
                                    ? "🟡 Berjalan"
                                    : "🔴 Belum"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                              Belum ada data tindak lanjut rekomendasi asesor. Klik tombol &quot;Edit Tabel 1.1&quot; untuk menambahkan data.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* EDIT MODE TABEL 1.1 */
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700">
                            <th className="border border-slate-200 p-2.5 text-center w-10 font-black">No</th>
                            <th className="border border-slate-200 p-2.5 text-left w-1/4 font-black">
                              Rekomendasi Asesor (Asesmen Lapangan)
                            </th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">
                              Usaha yang Dilakukan
                            </th>
                            <th className="border border-slate-200 p-2.5 text-left font-black bg-amber-50 text-amber-950">
                              Hambatan yang Dihadapi
                            </th>
                            <th className="border border-slate-200 p-2.5 text-left font-black bg-sky-50 text-sky-950">
                              Tindakan CQI untuk Mengatasi Hambatan
                            </th>
                            <th className="border border-slate-200 p-2.5 text-left font-black text-emerald-950">
                              Hasil yang Dicapai
                            </th>
                            <th className="border border-slate-200 p-2.5 text-center w-28 font-black">
                              Status
                            </th>
                            <th className="border border-slate-200 p-2.5 text-center w-12 font-black">
                              Hapus
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingAssessorList.map((item, idx) => (
                            <tr key={idx} className="align-top hover:bg-slate-50/40">
                              <td className="border border-slate-200 p-2 text-center font-bold text-slate-500 pt-3">
                                {item.recommendationNo}
                              </td>
                              <td className="border border-slate-200 p-2">
                                <textarea
                                  rows={3}
                                  value={item.recommendation}
                                  onChange={(e) => handleUpdateRowTable1(idx, "recommendation", e.target.value)}
                                  placeholder="Tulis rekomendasi asesor..."
                                  className="w-full p-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-2">
                                <textarea
                                  rows={3}
                                  value={item.actionTaken}
                                  onChange={(e) => handleUpdateRowTable1(idx, "actionTaken", e.target.value)}
                                  placeholder="Usaha / langkah tindak lanjut..."
                                  className="w-full p-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-2 bg-amber-50/20">
                                <textarea
                                  rows={3}
                                  value={item.obstacle || ""}
                                  onChange={(e) => handleUpdateRowTable1(idx, "obstacle", e.target.value)}
                                  placeholder="Hambatan yang dihadapi..."
                                  className="w-full p-2 border border-amber-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-2 bg-sky-50/20">
                                <textarea
                                  rows={3}
                                  value={item.cqiSolution || ""}
                                  onChange={(e) => handleUpdateRowTable1(idx, "cqiSolution", e.target.value)}
                                  placeholder="Tindakan solusi CQI..."
                                  className="w-full p-2 border border-sky-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-2 bg-emerald-50/20">
                                <textarea
                                  rows={3}
                                  value={item.achievement}
                                  onChange={(e) => handleUpdateRowTable1(idx, "achievement", e.target.value)}
                                  placeholder="Hasil konkret yang dicapai..."
                                  className="w-full p-2 border border-emerald-300 rounded-lg text-xs font-semibold leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-2 text-center pt-3">
                                <select
                                  value={item.status}
                                  onChange={(e) => handleUpdateRowTable1(idx, "status", e.target.value as any)}
                                  className="p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-500"
                                >
                                  <option value="SELESAI">🟢 Selesai</option>
                                  <option value="SEDANG_BERJALAN">🟡 Berjalan</option>
                                  <option value="BELUM">🔴 Belum</option>
                                </select>
                              </td>
                              <td className="border border-slate-200 p-2 text-center pt-3">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRowTable1(idx)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hapus Baris"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {editingAssessorList.length === 0 && (
                            <tr>
                              <td colSpan={8} className="p-6 text-center text-slate-400 italic bg-slate-50/50">
                                Belum ada baris rekomendasi. Klik tombol <strong>&quot;+ Tambah Baris Rekomendasi Asesor&quot;</strong> di bawah untuk menambahkan data baru, atau klik <strong>&quot;Simpan Perubahan Tabel 1.1&quot;</strong> untuk menyimpan tabel dalam keadaan kosong.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleAddRowTable1}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Baris Rekomendasi Asesor</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable1}
                          disabled={isSavingTable1}
                          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable1}
                          disabled={isSavingTable1}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable1 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>{isSavingTable1 ? "Menyimpan..." : "Simpan Perubahan Tabel 1.1"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BAB II: KEMAJUAN IMPLEMENTASI STRATEGI RENSTRA (TABEL 2.1) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Bab II: Kemajuan Implementasi Strategi Renstra UPPS (Tabel 2.1)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Monitoring ketercapaian sasaran strategis, implementasi program, identifikasi hambatan, dan continuous quality improvement (CQI)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-50 text-sky-800 border border-sky-200">
                      Tabel 2.1 Standar LAMEMBA
                    </span>
                    {!isEditingTable2 ? (
                      <button
                        onClick={handleStartEditTable2}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tabel 2.1</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable2}
                          disabled={isSavingTable2}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable2}
                          disabled={isSavingTable2}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable2 ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>{isSavingTable2 ? "Menyimpan..." : "Simpan Perubahan"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {table2Feedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                      table2Feedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {table2Feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{table2Feedback.text}</span>
                  </div>
                )}

                {!isEditingTable2 ? (
                  /* VIEW MODE TABEL 2.1 */
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200 text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700">
                          <th className="border border-slate-200 p-3 text-center w-12 font-black">No</th>
                          <th className="border border-slate-200 p-3 text-left w-1/4 font-black">
                            Sasaran Strategis & Target Renstra UPPS
                          </th>
                          <th className="border border-slate-200 p-3 text-left font-black">
                            Implementasi / Usaha yang Dilakukan
                          </th>
                          <th className="border border-slate-200 p-3 text-left font-black bg-amber-50/50 text-amber-950">
                            Hambatan yang Dihadapi
                          </th>
                          <th className="border border-slate-200 p-3 text-left font-black bg-sky-50/50 text-sky-950">
                            Tindakan CQI untuk Mengatasi Hambatan
                          </th>
                          <th className="border border-slate-200 p-3 text-left font-black text-emerald-950">
                            Hasil yang Dicapai
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.renstraProgressList || []).length > 0 ? (
                          dl05.renstraProgressList!.map((item, idx) => (
                            <tr key={idx} className="align-top hover:bg-slate-50/60 transition-colors">
                              <td className="border border-slate-200 p-3 text-center font-bold text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="border border-slate-200 p-3 font-bold text-slate-900 leading-relaxed">
                                {item.strategy}
                              </td>
                              <td className="border border-slate-200 p-3 text-slate-700 leading-relaxed">
                                {item.actionTaken}
                              </td>
                              <td className="border border-slate-200 p-3 text-amber-900 bg-amber-50/20 leading-relaxed">
                                {item.obstacle || "-"}
                              </td>
                              <td className="border border-slate-200 p-3 text-sky-900 bg-sky-50/20 leading-relaxed">
                                {item.cqiSolution || "-"}
                              </td>
                              <td className="border border-slate-200 p-3 font-semibold text-emerald-900 leading-relaxed">
                                {item.achievement}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                              Belum ada data kemajuan implementasi Renstra. Klik tombol &quot;Edit Tabel 2.1&quot; untuk menambahkan data.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* EDIT MODE TABEL 2.1 */
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700">
                            <th className="border border-slate-200 p-2.5 text-center w-10 font-black">No</th>
                            <th className="border border-slate-200 p-2.5 text-left w-1/4 font-black">
                              Sasaran Strategis & Target Renstra UPPS
                            </th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">
                              Implementasi / Usaha yang Dilakukan
                            </th>
                            <th className="border border-slate-200 p-2.5 text-left font-black bg-amber-50 text-amber-950">
                              Hambatan yang Dihadapi
                            </th>
                            <th className="border border-slate-200 p-2.5 text-left font-black bg-sky-50 text-sky-950">
                              Tindakan CQI untuk Mengatasi Hambatan
                            </th>
                            <th className="border border-slate-200 p-2.5 text-left font-black text-emerald-950">
                              Hasil yang Dicapai
                            </th>
                            <th className="border border-slate-200 p-2.5 text-center w-12 font-black">
                              Hapus
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingRenstraList.map((item, idx) => (
                            <tr key={idx} className="align-top hover:bg-slate-50/40">
                              <td className="border border-slate-200 p-2 text-center font-bold text-slate-500 pt-3">
                                {idx + 1}
                              </td>
                              <td className="border border-slate-200 p-2">
                                <textarea
                                  rows={3}
                                  value={item.strategy}
                                  onChange={(e) => handleUpdateRowTable2(idx, "strategy", e.target.value)}
                                  placeholder="Sasaran strategis & target renstra..."
                                  className="w-full p-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-2">
                                <textarea
                                  rows={3}
                                  value={item.actionTaken}
                                  onChange={(e) => handleUpdateRowTable2(idx, "actionTaken", e.target.value)}
                                  placeholder="Implementasi program / usaha..."
                                  className="w-full p-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-2 bg-amber-50/20">
                                <textarea
                                  rows={3}
                                  value={item.obstacle || ""}
                                  onChange={(e) => handleUpdateRowTable2(idx, "obstacle", e.target.value)}
                                  placeholder="Hambatan yang dihadapi..."
                                  className="w-full p-2 border border-amber-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-2 bg-sky-50/20">
                                <textarea
                                  rows={3}
                                  value={item.cqiSolution || ""}
                                  onChange={(e) => handleUpdateRowTable2(idx, "cqiSolution", e.target.value)}
                                  placeholder="Tindakan solusi penjaminan mutu CQI..."
                                  className="w-full p-2 border border-sky-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-2 bg-emerald-50/20">
                                <textarea
                                  rows={3}
                                  value={item.achievement}
                                  onChange={(e) => handleUpdateRowTable2(idx, "achievement", e.target.value)}
                                  placeholder="Hasil konkret yang dicapai..."
                                  className="w-full p-2 border border-emerald-300 rounded-lg text-xs font-semibold leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-2 text-center pt-3">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRowTable2(idx)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hapus Baris"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {editingRenstraList.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-6 text-center text-slate-400 italic bg-slate-50/50">
                                Belum ada baris sasaran renstra. Klik tombol <strong>&quot;+ Tambah Baris Sasaran Renstra&quot;</strong> di bawah untuk menambahkan data baru, atau klik <strong>&quot;Simpan Perubahan Tabel 2.1&quot;</strong> untuk menyimpan tabel dalam keadaan kosong.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleAddRowTable2}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-sky-300 bg-sky-50/60 hover:bg-sky-100/70 text-sky-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Baris Sasaran Renstra</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable2}
                          disabled={isSavingTable2}
                          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable2}
                          disabled={isSavingTable2}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable2 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>{isSavingTable2 ? "Menyimpan..." : "Simpan Perubahan Tabel 2.1"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: KURIKULUM CPL & PROFIL DOSEN (BAB III.1 & BAB III.2) */}
          {activeDl05SubTab === "cpl_dosen" && (
            <div className="space-y-8">
              {/* SELECTOR TAHUN SIKLUS PEMANTAUAN (TAHUN KE-0 S.D 4) */}
              <div className="bg-slate-100 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 border border-slate-200">
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
                          ? "bg-white text-purple-900 shadow-sm border border-slate-200"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 font-medium px-3 py-1">
                  Menampilkan data evaluasi pembelajaran untuk: <strong className="text-purple-700">Tahun Ke-{selectedDl05Year}</strong>
                </div>
              </div>

              {/* BAB III.1: JAMINAN PEMBELAJARAN (TABEL 3.1.1) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Bab III.1: Jaminan Pembelajaran (Tabel 3.1.1)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Pengukuran ketercapaian Capaian Pembelajaran Lulusan (CPL) langsung & tidak langsung serta intervensi kurikulum
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-800 border border-purple-200">
                      Tabel 3.1.1 Standar LAMEMBA
                    </span>
                    {!isEditingTable311 ? (
                      <button
                        onClick={handleStartEditTable311}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tabel 3.1.1</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable311}
                          disabled={isSavingTable311}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable311}
                          disabled={isSavingTable311}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable311 ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>{isSavingTable311 ? "Menyimpan..." : "Simpan Perubahan"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {table311Feedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                      table311Feedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {table311Feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{table311Feedback.text}</span>
                  </div>
                )}

                {!isEditingTable311 ? (
                  /* VIEW MODE TABEL 3.1.1 */
                  <div className="space-y-4">
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
                          {(dl05.learningAssuranceItems || []).length > 0 ? (
                            dl05.learningAssuranceItems!.map((item) => {
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
                                      <span className="font-semibold text-purple-900">{hasilText}</span>
                                    ) : (
                                      <span className="text-amber-600 italic">Belum ada hasil dilaporkan untuk tahun ini.</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                                Belum ada data jaminan pembelajaran. Klik tombol &quot;Edit Tabel 3.1.1&quot; untuk menambahkan data.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {dl05.perbaikanBerkelanjutanJaminanPembelajaran && (
                      <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs space-y-1">
                        <span className="font-black text-purple-900 block">
                          Catatan Perbaikan Berkelanjutan (CQI) Jaminan Pembelajaran:
                        </span>
                        <p className="text-purple-800 leading-relaxed">
                          {dl05.perbaikanBerkelanjutanJaminanPembelajaran}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* EDIT MODE TABEL 3.1.1 */
                  <div className="space-y-4">
                    <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
                      <span>
                        ✏️ Mengedit Upaya & Hasil untuk <strong>Tahun Ke-{selectedDl05Year || 1}</strong>. Gunakan tombol siklus tahun di atas tabel untuk beralih tahun lainnya.
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700">
                            <th className="border border-slate-200 p-2.5 text-center w-10 font-black">No</th>
                            <th className="border border-slate-200 p-2.5 text-left w-1/3 font-black">
                              Indikator Jaminan Pembelajaran (CPL)
                            </th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">
                              Upaya yang Dilakukan (Tahun Ke-{selectedDl05Year || 1})
                            </th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">
                              Hasil yang Dicapai (Tahun Ke-{selectedDl05Year || 1})
                            </th>
                            <th className="border border-slate-200 p-2.5 text-center w-12 font-black">
                              Hapus
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingLearningList.map((item, idx) => {
                            const yearKey = (selectedDl05Year === 2 ? 2 : selectedDl05Year === 3 ? 3 : selectedDl05Year === 4 ? 4 : 1) as 1 | 2 | 3 | 4;
                            const upayaField = `upayaTahun${yearKey}` as keyof ILamembaDl05LearningItem;
                            const hasilField = `hasilTahun${yearKey}` as keyof ILamembaDl05LearningItem;

                            return (
                              <tr key={idx} className="align-top hover:bg-slate-50/40">
                                <td className="border border-slate-200 p-2 text-center font-bold text-slate-500 pt-3">
                                  {item.nomor}
                                </td>
                                <td className="border border-slate-200 p-2">
                                  <textarea
                                    rows={3}
                                    value={item.indikator}
                                    onChange={(e) => handleUpdateRowTable311(idx, "indikator", e.target.value)}
                                    placeholder="Tuliskan indikator jaminan pembelajaran..."
                                    className="w-full p-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-2">
                                  <textarea
                                    rows={3}
                                    value={(item[upayaField] as string) || ""}
                                    onChange={(e) => handleUpdateRowTable311(idx, upayaField, e.target.value)}
                                    placeholder={`Upaya intervensi kurikulum tahun ke-${yearKey}...`}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-2">
                                  <textarea
                                    rows={3}
                                    value={(item[hasilField] as string) || ""}
                                    onChange={(e) => handleUpdateRowTable311(idx, hasilField, e.target.value)}
                                    placeholder={`Capaian / hasil pengukuran CPL tahun ke-${yearKey}...`}
                                    className="w-full p-2 border border-purple-300 rounded-lg text-xs font-semibold leading-relaxed focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-2 text-center pt-3">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRowTable311(idx)}
                                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {editingLearningList.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-slate-400 italic bg-slate-50/50">
                                Belum ada indikator jaminan pembelajaran. Klik tombol <strong>&quot;+ Tambah Indikator CPL&quot;</strong> di bawah untuk menambahkan data baru, atau klik <strong>&quot;Simpan Perubahan Tabel 3.1.1&quot;</strong> untuk menyimpan tabel dalam keadaan kosong.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-1.5 p-4 rounded-2xl bg-purple-50/40 border border-purple-200">
                      <label className="text-xs font-black text-purple-900 block">
                        Catatan Perbaikan Berkelanjutan (CQI) Jaminan Pembelajaran:
                      </label>
                      <textarea
                        rows={3}
                        value={editingLearningCqi}
                        onChange={(e) => setEditingLearningCqi(e.target.value)}
                        placeholder="Uraikan evaluasi berkala siklus PPEPP dan pembaruan kurikulum berbasis OBE..."
                        className="w-full p-2.5 border border-purple-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleAddRowTable311}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-purple-300 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Indikator CPL</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable311}
                          disabled={isSavingTable311}
                          className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable311}
                          disabled={isSavingTable311}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable311 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>{isSavingTable311 ? "Menyimpan..." : "Simpan Perubahan Tabel 3.1.1"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BAB III.2: DOSEN (TABEL 3.2.1, 3.2.3, 3.2.5, 3.2.7) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Bab III.2: Kecukupan dan Kualifikasi Dosen
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Profil kepegawaian dosen, keahlian S2/S3, sertifikasi BNSP, kontribusi intelektual 4 bidang, dan EWMP
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-800 border border-purple-200">
                    Tabel 3.2.1 s.d 3.2.7 Standar LAMEMBA
                  </span>
                </div>

                {/* Sub-A: Tabel 3.2.1 Status Kepegawaian & Jalur Rekrutmen Dosen */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Tabel 3.2.1 Profil Kepegawaian & Jalur Rekrutmen Dosen</span>
                    </h5>
                    {!isEditingTable321 ? (
                      <button
                        onClick={handleStartEditTable321}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tabel 3.2.1</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable321}
                          disabled={isSavingTable321}
                          className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable321}
                          disabled={isSavingTable321}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable321 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>{isSavingTable321 ? "Menyimpan..." : "Simpan"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {table321Feedback && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        table321Feedback.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {table321Feedback.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{table321Feedback.text}</span>
                    </div>
                  )}

                  {!isEditingTable321 ? (
                    /* VIEW MODE TABEL 3.2.1 */
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
                          {(dl05.dosenProfiles || []).length > 0 ? (
                            dl05.dosenProfiles!.map((dosen, idx) => (
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
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                                Belum ada data profil kepegawaian dosen. Klik &quot;Edit Tabel 3.2.1&quot; untuk menambahkan data.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* EDIT MODE TABEL 3.2.1 */
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-200 text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700">
                              <th className="border border-slate-200 p-2 text-center w-8 font-black">No</th>
                              <th className="border border-slate-200 p-2 text-left font-black">Nama Dosen</th>
                              <th className="border border-slate-200 p-2 text-center w-28 font-black">Status</th>
                              <th className="border border-slate-200 p-2 text-center w-28 font-black">NIDN</th>
                              <th className="border border-slate-200 p-2 text-left font-black">Jabatan Akademik</th>
                              <th className="border border-slate-200 p-2 text-center w-28 font-black">Jalur</th>
                              <th className="border border-slate-200 p-2 text-left font-black">Perusahaan Asal</th>
                              <th className="border border-slate-200 p-2 text-center w-24 font-black">Perubahan</th>
                              <th className="border border-slate-200 p-2 text-center w-10 font-black">Hapus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editingDosenProfiles.map((dosen, idx) => (
                              <tr key={idx} className="align-middle hover:bg-slate-50/40">
                                <td className="border border-slate-200 p-2 text-center font-bold text-slate-500">
                                  {idx + 1}
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="text"
                                    value={dosen.name}
                                    onChange={(e) => handleUpdateRowTable321(idx, "name", e.target.value)}
                                    placeholder="Nama lengkap & gelar..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5 text-center">
                                  <select
                                    value={dosen.status}
                                    onChange={(e) => handleUpdateRowTable321(idx, "status", e.target.value as any)}
                                    className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                                  >
                                    <option value="Tetap">Tetap</option>
                                    <option value="Tidak Tetap">Tidak Tetap</option>
                                  </select>
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="text"
                                    value={dosen.nidn}
                                    onChange={(e) => handleUpdateRowTable321(idx, "nidn", e.target.value)}
                                    placeholder="NIDN/NIDK..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-mono text-center bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <select
                                    value={dosen.jabatanAkademik}
                                    onChange={(e) => handleUpdateRowTable321(idx, "jabatanAkademik", e.target.value)}
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                  >
                                    <option value="Tenaga Pengajar">Tenaga Pengajar</option>
                                    <option value="Asisten Ahli">Asisten Ahli</option>
                                    <option value="Lektor">Lektor</option>
                                    <option value="Lektor Kepala">Lektor Kepala</option>
                                    <option value="Guru Besar">Guru Besar</option>
                                  </select>
                                </td>
                                <td className="border border-slate-200 p-1.5 text-center">
                                  <select
                                    value={dosen.jalur}
                                    onChange={(e) => handleUpdateRowTable321(idx, "jalur", e.target.value as any)}
                                    className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                                  >
                                    <option value="Akademisi">Akademisi</option>
                                    <option value="Praktisi">Praktisi</option>
                                  </select>
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="text"
                                    value={dosen.namaPerusahaan || ""}
                                    onChange={(e) => handleUpdateRowTable321(idx, "namaPerusahaan", e.target.value)}
                                    placeholder="Nama perusahaan jika praktisi..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5 text-center">
                                  <select
                                    value={dosen.isChange ? "true" : "false"}
                                    onChange={(e) => handleUpdateRowTable321(idx, "isChange", e.target.value === "true")}
                                    className="p-1.5 border border-slate-300 rounded-lg text-[11px] bg-white font-bold"
                                  >
                                    <option value="false">Tetap</option>
                                    <option value="true">Perubahan</option>
                                  </select>
                                </td>
                                <td className="border border-slate-200 p-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRowTable321(idx)}
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {editingDosenProfiles.length === 0 && (
                              <tr>
                                <td colSpan={9} className="p-4 text-center text-slate-400 italic bg-slate-50/50">
                                  Belum ada data dosen. Klik &quot;+ Tambah Baris Dosen&quot; di bawah untuk menambah data baru.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleAddRowTable321}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-purple-300 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800 font-bold text-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Baris Dosen</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-B: Tabel 3.2.3 Latar Belakang Keahlian Dosen & BNSP */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Tabel 3.2.3 Profil Dosen Berdasarkan Latar Belakang Keahlian & Sertifikasi BNSP</span>
                    </h5>
                    {!isEditingTable323 ? (
                      <button
                        onClick={handleStartEditTable323}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tabel 3.2.3</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable323}
                          disabled={isSavingTable323}
                          className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable323}
                          disabled={isSavingTable323}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable323 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>{isSavingTable323 ? "Menyimpan..." : "Simpan"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {table323Feedback && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        table323Feedback.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {table323Feedback.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{table323Feedback.text}</span>
                    </div>
                  )}

                  {!isEditingTable323 ? (
                    /* VIEW MODE TABEL 3.2.3 */
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700">
                            <th className="border border-slate-200 p-2.5 text-center w-10 font-black">No</th>
                            <th className="border border-slate-200 p-2.5 text-left font-black w-48">Nama Dosen</th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">Pendidikan Magister (S2)</th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">Pendidikan Doktor (S3)</th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">Bidang Keahlian</th>
                            <th className="border border-slate-200 p-2.5 text-center font-black">No. Serdos</th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">Sertifikat Kompetensi / Profesi BNSP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(dl05.dosenExpertise || []).length > 0 ? (
                            dl05.dosenExpertise!.map((exp, idx) => (
                              <tr key={idx} className="align-top hover:bg-slate-50/60 transition-colors">
                                <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-500">
                                  {idx + 1}
                                </td>
                                <td className="border border-slate-200 p-2.5 font-bold text-slate-900">
                                  {exp.name}
                                </td>
                                <td className="border border-slate-200 p-2.5 text-slate-700">
                                  {exp.magister}
                                </td>
                                <td className="border border-slate-200 p-2.5 text-slate-700">
                                  {exp.doktor || "-"}
                                </td>
                                <td className="border border-slate-200 p-2.5 font-medium text-purple-900">
                                  {exp.bidangKeahlian}
                                </td>
                                <td className="border border-slate-200 p-2.5 text-center font-mono text-[11px] text-slate-600">
                                  {exp.serdos || "-"}
                                </td>
                                <td className="border border-slate-200 p-2.5 text-emerald-900 font-semibold">
                                  {exp.sertifikatProfesi || "-"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                                Belum ada data latar belakang keahlian dosen. Klik &quot;Edit Tabel 3.2.3&quot; untuk menambahkan data.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* EDIT MODE TABEL 3.2.3 */
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-200 text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700">
                              <th className="border border-slate-200 p-2 text-center w-8 font-black">No</th>
                              <th className="border border-slate-200 p-2 text-left font-black w-44">Nama Dosen</th>
                              <th className="border border-slate-200 p-2 text-left font-black">Magister (S2)</th>
                              <th className="border border-slate-200 p-2 text-left font-black">Doktor (S3)</th>
                              <th className="border border-slate-200 p-2 text-left font-black">Bidang Keahlian</th>
                              <th className="border border-slate-200 p-2 text-center w-28 font-black">No. Serdos</th>
                              <th className="border border-slate-200 p-2 text-left font-black">Sertifikat BNSP / Profesi</th>
                              <th className="border border-slate-200 p-2 text-center w-10 font-black">Hapus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editingDosenExpertise.map((exp, idx) => (
                              <tr key={idx} className="align-top hover:bg-slate-50/40">
                                <td className="border border-slate-200 p-2 text-center font-bold text-slate-500 pt-3">
                                  {idx + 1}
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="text"
                                    value={exp.name}
                                    onChange={(e) => handleUpdateRowTable323(idx, "name", e.target.value)}
                                    placeholder="Nama dosen..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="text"
                                    value={exp.magister}
                                    onChange={(e) => handleUpdateRowTable323(idx, "magister", e.target.value)}
                                    placeholder="Magister S2..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="text"
                                    value={exp.doktor || ""}
                                    onChange={(e) => handleUpdateRowTable323(idx, "doktor", e.target.value)}
                                    placeholder="Doktor S3 (jika ada)..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="text"
                                    value={exp.bidangKeahlian}
                                    onChange={(e) => handleUpdateRowTable323(idx, "bidangKeahlian", e.target.value)}
                                    placeholder="Bidang keahlian..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-purple-900 font-semibold"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="text"
                                    value={exp.serdos || ""}
                                    onChange={(e) => handleUpdateRowTable323(idx, "serdos", e.target.value)}
                                    placeholder="No. Serdos..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-mono text-center bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="text"
                                    value={exp.sertifikatProfesi || ""}
                                    onChange={(e) => handleUpdateRowTable323(idx, "sertifikatProfesi", e.target.value)}
                                    placeholder="Sertifikat BNSP / Industri..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-emerald-900 font-semibold bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5 text-center pt-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRowTable323(idx)}
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {editingDosenExpertise.length === 0 && (
                              <tr>
                                <td colSpan={8} className="p-4 text-center text-slate-400 italic bg-slate-50/50">
                                  Belum ada data keahlian dosen. Klik &quot;+ Tambah Baris Keahlian Dosen&quot; di bawah untuk menambah data.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleAddRowTable323}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-purple-300 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800 font-bold text-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Baris Keahlian Dosen</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-C: Tabel 3.2.5 Kontribusi Intelektual Dosen */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                      <span>Tabel 3.2.5 Kontribusi Intelektual Dosen (4 Bidang Rekognisi)</span>
                    </h5>
                    {!isEditingTable325 ? (
                      <button
                        onClick={handleStartEditTable325}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tabel 3.2.5</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable325}
                          disabled={isSavingTable325}
                          className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable325}
                          disabled={isSavingTable325}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable325 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>{isSavingTable325 ? "Menyimpan..." : "Simpan"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {table325Feedback && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        table325Feedback.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {table325Feedback.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{table325Feedback.text}</span>
                    </div>
                  )}

                  {!isEditingTable325 ? (
                    /* VIEW MODE TABEL 3.2.5 */
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
                          {(dl05.kontribusiIntelektualDosen || []).length > 0 ? (
                            dl05.kontribusiIntelektualDosen!.map((item, idx) => (
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
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                                Belum ada data kontribusi intelektual dosen. Klik &quot;Edit Tabel 3.2.5&quot; untuk menambahkan data.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* EDIT MODE TABEL 3.2.5 */
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-200 text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700">
                              <th className="border border-slate-200 p-2 text-center w-8 font-black">No</th>
                              <th className="border border-slate-200 p-2 text-left font-black w-40">Nama Dosen</th>
                              <th className="border border-slate-200 p-2 text-left font-black">1. Rekognisi Pendidikan</th>
                              <th className="border border-slate-200 p-2 text-left font-black">2. Rekognisi Praktik Bisnis</th>
                              <th className="border border-slate-200 p-2 text-left font-black">3. Rekognisi Riset & Publikasi</th>
                              <th className="border border-slate-200 p-2 text-left font-black">4. Rekognisi Sosial</th>
                              <th className="border border-slate-200 p-2 text-center w-10 font-black">Hapus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editingKontribusiIntelektual.map((item, idx) => (
                              <tr key={idx} className="align-top hover:bg-slate-50/40">
                                <td className="border border-slate-200 p-2 text-center font-bold text-slate-500 pt-3">
                                  {idx + 1}
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleUpdateRowTable325(idx, "name", e.target.value)}
                                    placeholder="Nama dosen..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <textarea
                                    rows={2}
                                    value={item.rekognisiPendidikan || ""}
                                    onChange={(e) => handleUpdateRowTable325(idx, "rekognisiPendidikan", e.target.value)}
                                    placeholder="Bahan ajar, modul, rekognisi pengajaran..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <textarea
                                    rows={2}
                                    value={item.rekognisiPraktik || ""}
                                    onChange={(e) => handleUpdateRowTable325(idx, "rekognisiPraktik", e.target.value)}
                                    placeholder="Konsultansi, narasumber bisnis..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <textarea
                                    rows={2}
                                    value={item.rekognisiPenelitian || ""}
                                    onChange={(e) => handleUpdateRowTable325(idx, "rekognisiPenelitian", e.target.value)}
                                    placeholder="Reviewer jurnal, keynote speaker riset..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <textarea
                                    rows={2}
                                    value={item.rekognisiSosial || ""}
                                    onChange={(e) => handleUpdateRowTable325(idx, "rekognisiSosial", e.target.value)}
                                    placeholder="Pengurus asosiasi, pembina UMKM..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5 text-center pt-3">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRowTable325(idx)}
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {editingKontribusiIntelektual.length === 0 && (
                              <tr>
                                <td colSpan={7} className="p-4 text-center text-slate-400 italic bg-slate-50/50">
                                  Belum ada data kontribusi intelektual. Klik &quot;+ Tambah Baris Kontribusi Intelektual&quot; di bawah untuk menambah data.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleAddRowTable325}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-purple-300 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800 font-bold text-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Baris Kontribusi Intelektual</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-D: Tabel 3.2.7 EWMP */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Tabel 3.2.7 Ekuivalensi Waktu Mengajar Penuh (EWMP) Dosen
                      </h5>
                      <span className="text-[11px] font-normal text-slate-500">
                        Standar SN-Dikti: 12 - 16 SKS per semester
                      </span>
                    </div>

                    {!isEditingTable327 ? (
                      <button
                        onClick={handleStartEditTable327}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tabel 3.2.7</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable327}
                          disabled={isSavingTable327}
                          className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable327}
                          disabled={isSavingTable327}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable327 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>{isSavingTable327 ? "Menyimpan..." : "Simpan"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {table327Feedback && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        table327Feedback.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {table327Feedback.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{table327Feedback.text}</span>
                    </div>
                  )}

                  {!isEditingTable327 ? (
                    /* VIEW MODE TABEL 3.2.7 */
                    <div className="space-y-4">
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
                            {(dl05.ewmpList || []).length > 0 ? (
                              dl05.ewmpList!.map((ewmp, idx) => {
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
                              })
                            ) : (
                              <tr>
                                <td colSpan={9} className="p-6 text-center text-slate-400 italic">
                                  Belum ada data EWMP dosen. Klik &quot;Edit Tabel 3.2.7&quot; untuk menambahkan data.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {dl05.perbaikanBerkelanjutanDosen && (
                        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs space-y-1">
                          <span className="font-black text-purple-900 block">
                            Catatan Perbaikan Berkelanjutan (CQI) Dosen:
                          </span>
                          <p className="text-purple-800 leading-relaxed">{dl05.perbaikanBerkelanjutanDosen}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* EDIT MODE TABEL 3.2.7 */
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-200 text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 text-center">
                              <th className="border border-slate-200 p-2 text-left font-black">Nama Dosen</th>
                              <th className="border border-slate-200 p-2 font-black w-20">PS Sendiri</th>
                              <th className="border border-slate-200 p-2 font-black w-20">PS Lain PT</th>
                              <th className="border border-slate-200 p-2 font-black w-20">Luar PT</th>
                              <th className="border border-slate-200 p-2 font-black w-20">Penelitian</th>
                              <th className="border border-slate-200 p-2 font-black w-20">PkM</th>
                              <th className="border border-slate-200 p-2 font-black w-20">Tugas Tambahan</th>
                              <th className="border border-slate-200 p-2 font-black w-24 bg-slate-200">Total SKS</th>
                              <th className="border border-slate-200 p-2 font-black w-10">Hapus</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editingEwmpList.map((ewmp, idx) => {
                              const isCompliant = ewmp.totalSks >= 12 && ewmp.totalSks <= 16;
                              return (
                                <tr key={idx} className="align-middle hover:bg-slate-50/40 text-center">
                                  <td className="border border-slate-200 p-1.5 text-left">
                                    <input
                                      type="text"
                                      value={ewmp.name}
                                      onChange={(e) => handleUpdateRowTable327(idx, "name", e.target.value)}
                                      placeholder="Nama dosen..."
                                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                                    />
                                  </td>
                                  <td className="border border-slate-200 p-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      step={0.5}
                                      value={ewmp.psAkreditasiSks}
                                      onChange={(e) => handleUpdateRowTable327(idx, "psAkreditasiSks", e.target.value)}
                                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-center bg-white font-mono"
                                    />
                                  </td>
                                  <td className="border border-slate-200 p-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      step={0.5}
                                      value={ewmp.psLainDalamPtSks}
                                      onChange={(e) => handleUpdateRowTable327(idx, "psLainDalamPtSks", e.target.value)}
                                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-center bg-white font-mono"
                                    />
                                  </td>
                                  <td className="border border-slate-200 p-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      step={0.5}
                                      value={ewmp.psLainLuarPtSks}
                                      onChange={(e) => handleUpdateRowTable327(idx, "psLainLuarPtSks", e.target.value)}
                                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-center bg-white font-mono"
                                    />
                                  </td>
                                  <td className="border border-slate-200 p-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      step={0.5}
                                      value={ewmp.penelitianSks}
                                      onChange={(e) => handleUpdateRowTable327(idx, "penelitianSks", e.target.value)}
                                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-center bg-white font-mono"
                                    />
                                  </td>
                                  <td className="border border-slate-200 p-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      step={0.5}
                                      value={ewmp.pkmSks}
                                      onChange={(e) => handleUpdateRowTable327(idx, "pkmSks", e.target.value)}
                                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-center bg-white font-mono"
                                    />
                                  </td>
                                  <td className="border border-slate-200 p-1.5">
                                    <input
                                      type="number"
                                      min={0}
                                      step={0.5}
                                      value={ewmp.tugasTambahanSks}
                                      onChange={(e) => handleUpdateRowTable327(idx, "tugasTambahanSks", e.target.value)}
                                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-center bg-white font-mono"
                                    />
                                  </td>
                                  <td className="border border-slate-200 p-1.5 bg-slate-50 font-black">
                                    <span className={isCompliant ? "text-emerald-700" : "text-amber-700"}>
                                      {ewmp.totalSks} SKS
                                    </span>
                                  </td>
                                  <td className="border border-slate-200 p-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveRowTable327(idx)}
                                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                      title="Hapus Baris"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                            {editingEwmpList.length === 0 && (
                              <tr>
                                <td colSpan={9} className="p-4 text-center text-slate-400 italic bg-slate-50/50">
                                  Belum ada data EWMP. Klik &quot;+ Tambah Baris EWMP Dosen&quot; di bawah untuk menambah data.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="space-y-1.5 p-4 rounded-2xl bg-purple-50/40 border border-purple-200">
                        <label className="text-xs font-black text-purple-900 block">
                          Catatan Perbaikan Berkelanjutan (CQI) Dosen:
                        </label>
                        <textarea
                          rows={3}
                          value={editingDosenCqi}
                          onChange={(e) => setEditingDosenCqi(e.target.value)}
                          placeholder="Uraikan strategi pemerataan beban kerja dosen (12-14 SKS), peningkatan kualifikasi S3 dan jabatan fungsional Lektor Kepala..."
                          className="w-full p-2.5 border border-purple-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleAddRowTable327}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-purple-300 bg-purple-50/60 hover:bg-purple-100/70 text-purple-800 font-bold text-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Baris EWMP Dosen</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: TRIDHARMA, RISET, SITASI, MAHASISWA & PD-DIKTI (BAB III.3) */}
          {activeDl05SubTab === "tridharma_mhs" && (
            <div className="space-y-8">
              {/* BAB III.3: LUARAN RISET & PKM (TABEL 3.3.1 S.D 3.3.3) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Bab III.3: Luaran Penelitian dan PkM Dosen (Tabel 3.3.1 s.d 3.3.3)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Publikasi jurnal ilmiah terakreditasi, prosiding seminar internasional/nasional, HKI hak cipta, dan buku ajar ber-ISBN
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-50 text-sky-800 border border-sky-200">
                      Tabel 3.3.1 s.d 3.3.3
                    </span>
                    {!isEditingTable331 ? (
                      <button
                        onClick={handleStartEditTable331}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tabel 3.3.1</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable331}
                          disabled={isSavingTable331}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable331}
                          disabled={isSavingTable331}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable331 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>{isSavingTable331 ? "Menyimpan..." : "Simpan Perubahan"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {table331Feedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                      table331Feedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {table331Feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{table331Feedback.text}</span>
                  </div>
                )}

                {!isEditingTable331 ? (
                  /* VIEW MODE TABEL 3.3.1 */
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200 text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700">
                          <th className="border border-slate-200 p-2.5 text-center w-10 font-black">No</th>
                          <th className="border border-slate-200 p-2.5 text-left font-black">Judul Luaran Penelitian / PkM</th>
                          <th className="border border-slate-200 p-2.5 text-center w-16 font-black">Tahun</th>
                          <th className="border border-slate-200 p-2.5 text-left font-black">Jenis Luaran</th>
                          <th className="border border-slate-200 p-2.5 text-center font-black">Sumber Pembiayaan</th>
                          <th className="border border-slate-200 p-2.5 text-center font-black">Kategori Publikasi / Forum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.researchOutcomes || []).length > 0 ? (
                          dl05.researchOutcomes!.map((res, idx) => {
                            const sumberText = res.sumberBiayaPtMandiri ? "PT / Mandiri" : res.sumberBiayaLuarPt ? "Luar PT / DRTPM" : "Luar Negeri";
                            const kategoriText = res.publikasiNasionalTerakreditasi ? "Jurnal Nasional Terakreditasi (SINTA)" : res.publikasiInternasionalBereputasi ? "Jurnal Internasional Bereputasi" : res.seminarNasional ? "Seminar Nasional" : res.seminarInternasional ? "Seminar Internasional" : "Buku / Media";

                            return (
                              <tr key={idx} className="align-middle hover:bg-slate-50/60 transition-colors">
                                <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-500">
                                  {idx + 1}
                                </td>
                                <td className="border border-slate-200 p-2.5 font-bold text-slate-900 leading-relaxed">
                                  {res.judul}
                                </td>
                                <td className="border border-slate-200 p-2.5 text-center font-mono text-slate-600">
                                  {res.tahun}
                                </td>
                                <td className="border border-slate-200 p-2.5 text-slate-700">
                                  {res.jenisLuaran}
                                </td>
                                <td className="border border-slate-200 p-2.5 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                                    {sumberText}
                                  </span>
                                </td>
                                <td className="border border-slate-200 p-2.5 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {kategoriText}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                              Belum ada data luaran penelitian dan PkM dosen. Klik &quot;Edit Tabel 3.3.1&quot; untuk menambahkan data.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* EDIT MODE TABEL 3.3.1 */
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700">
                            <th className="border border-slate-200 p-2 text-center w-8 font-black">No</th>
                            <th className="border border-slate-200 p-2 text-left font-black">Judul Luaran Riset / PkM</th>
                            <th className="border border-slate-200 p-2 text-center w-20 font-black">Tahun</th>
                            <th className="border border-slate-200 p-2 text-left w-36 font-black">Jenis Luaran</th>
                            <th className="border border-slate-200 p-2 text-center w-36 font-black">Sumber Pembiayaan</th>
                            <th className="border border-slate-200 p-2 text-left w-48 font-black">Kategori Publikasi</th>
                            <th className="border border-slate-200 p-2 text-center w-10 font-black">Hapus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingResearchOutcomes.map((res, idx) => (
                            <tr key={idx} className="align-top hover:bg-slate-50/40">
                              <td className="border border-slate-200 p-2 text-center font-bold text-slate-500 pt-3">
                                {idx + 1}
                              </td>
                              <td className="border border-slate-200 p-1.5">
                                <textarea
                                  rows={2}
                                  value={res.judul}
                                  onChange={(e) => handleUpdateRowTable331(idx, "judul", e.target.value)}
                                  placeholder="Judul artikel ilmiah / paten / buku..."
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-1.5">
                                <input
                                  type="number"
                                  value={res.tahun}
                                  onChange={(e) => handleUpdateRowTable331(idx, "tahun", parseInt(e.target.value) || 2024)}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-mono text-center bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-1.5">
                                <select
                                  value={res.jenisLuaran}
                                  onChange={(e) => handleUpdateRowTable331(idx, "jenisLuaran", e.target.value)}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                >
                                  <option value="Jurnal Ilmiah">Jurnal Ilmiah</option>
                                  <option value="HKI: Paten / Hak Cipta">HKI: Paten / Hak Cipta</option>
                                  <option value="Buku / Book Chapter">Buku / Book Chapter</option>
                                  <option value="Prosiding Seminar">Prosiding Seminar</option>
                                  <option value="Media Massa">Media Massa</option>
                                </select>
                              </td>
                              <td className="border border-slate-200 p-1.5 text-center">
                                <select
                                  value={res.sumberBiayaPtMandiri ? "mandiri" : res.sumberBiayaLuarPt ? "luar_pt" : "luar_negeri"}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingResearchOutcomes(prev => {
                                      const updated = [...prev];
                                      updated[idx] = {
                                        ...updated[idx],
                                        sumberBiayaPtMandiri: val === "mandiri" ? 1 : 0,
                                        sumberBiayaLuarPt: val === "luar_pt" ? 1 : 0,
                                        sumberBiayaLuarNegeri: val === "luar_negeri" ? 1 : 0,
                                      };
                                      return updated;
                                    });
                                  }}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                                >
                                  <option value="mandiri">PT / Mandiri</option>
                                  <option value="luar_pt">Luar PT / DRTPM</option>
                                  <option value="luar_negeri">Luar Negeri</option>
                                </select>
                              </td>
                              <td className="border border-slate-200 p-1.5">
                                <select
                                  value={
                                    res.publikasiNasionalTerakreditasi
                                      ? "sinta"
                                      : res.publikasiInternasionalBereputasi
                                      ? "scopus"
                                      : res.seminarNasional
                                      ? "sem_nas"
                                      : res.seminarInternasional
                                      ? "sem_int"
                                      : "buku"
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingResearchOutcomes(prev => {
                                      const updated = [...prev];
                                      updated[idx] = {
                                        ...updated[idx],
                                        publikasiNasionalTerakreditasi: val === "sinta" ? 1 : 0,
                                        publikasiInternasionalBereputasi: val === "scopus" ? 1 : 0,
                                        seminarNasional: val === "sem_nas" ? 1 : 0,
                                        seminarInternasional: val === "sem_int" ? 1 : 0,
                                        tulisanMediaNasional: val === "buku" ? 1 : 0,
                                      };
                                      return updated;
                                    });
                                  }}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-emerald-900 font-semibold"
                                >
                                  <option value="sinta">Jurnal Nasional (SINTA)</option>
                                  <option value="scopus">Jurnal Internasional Bereputasi</option>
                                  <option value="sem_nas">Seminar Nasional</option>
                                  <option value="sem_int">Seminar Internasional</option>
                                  <option value="buku">Buku / Media</option>
                                </select>
                              </td>
                              <td className="border border-slate-200 p-1.5 text-center pt-3">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRowTable331(idx)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Hapus Baris"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {editingResearchOutcomes.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-4 text-center text-slate-400 italic bg-slate-50/50">
                                Belum ada data luaran riset. Klik &quot;+ Tambah Baris Luaran Riset & PkM&quot; di bawah untuk menambah data.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleAddRowTable331}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-sky-300 bg-sky-50/60 hover:bg-sky-100/70 text-sky-800 font-bold text-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Baris Luaran Riset & PkM</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BAB III.3: TABEL SITASI DOSEN (TABEL 3.3.5) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Bab III.3: Sitasi Karya Ilmiah Dosen (Tabel 3.3.5)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Rekam jejak dampak riset dosen yang disitasi dalam 3 tahun terakhir (TS-2, TS-1, TS)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-50 text-teal-800 border border-teal-200">
                      Tabel 3.3.5 Standar LAMEMBA
                    </span>
                    {!isEditingTable335 ? (
                      <button
                        onClick={handleStartEditTable335}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tabel 3.3.5</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable335}
                          disabled={isSavingTable335}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable335}
                          disabled={isSavingTable335}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable335 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>{isSavingTable335 ? "Menyimpan..." : "Simpan Perubahan"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {table335Feedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                      table335Feedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {table335Feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{table335Feedback.text}</span>
                  </div>
                )}

                {!isEditingTable335 ? (
                  /* VIEW MODE TABEL 3.3.5 */
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200 text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 text-center">
                          <th className="border border-slate-200 p-2.5 text-center w-10 font-black">No</th>
                          <th className="border border-slate-200 p-2.5 text-left font-black">Judul Artikel yang Disitasi</th>
                          <th className="border border-slate-200 p-2.5 text-left font-black">Penulis</th>
                          <th className="border border-slate-200 p-2.5 text-left font-black">Jurnal / Publikasi</th>
                          <th className="border border-slate-200 p-2.5 font-black">TS-2</th>
                          <th className="border border-slate-200 p-2.5 font-black">TS-1</th>
                          <th className="border border-slate-200 p-2.5 font-black">TS</th>
                          <th className="border border-slate-200 p-2.5 font-black bg-teal-50 text-teal-950">Total</th>
                          <th className="border border-slate-200 p-2.5 font-black">Tautan / DOI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.citationsList || []).length > 0 ? (
                          dl05.citationsList!.map((cite, idx) => {
                            const total = (cite.sitasiTs2 || 0) + (cite.sitasiTs1 || 0) + (cite.sitasiTs || 0);
                            return (
                              <tr key={idx} className="align-middle hover:bg-slate-50/60 transition-colors">
                                <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-500">
                                  {idx + 1}
                                </td>
                                <td className="border border-slate-200 p-2.5 font-bold text-slate-900 leading-relaxed">
                                  {cite.judulArtikel}
                                </td>
                                <td className="border border-slate-200 p-2.5 text-slate-700">
                                  {cite.penulis}
                                </td>
                                <td className="border border-slate-200 p-2.5 text-slate-600">
                                  {cite.jenisPublikasi}
                                </td>
                                <td className="border border-slate-200 p-2.5 text-center font-mono">{cite.sitasiTs2}</td>
                                <td className="border border-slate-200 p-2.5 text-center font-mono">{cite.sitasiTs1}</td>
                                <td className="border border-slate-200 p-2.5 text-center font-mono">{cite.sitasiTs}</td>
                                <td className="border border-slate-200 p-2.5 text-center font-black font-mono text-teal-900 bg-teal-50/50">
                                  {total}
                                </td>
                                <td className="border border-slate-200 p-2.5 text-center">
                                  {cite.linkArtikel ? (
                                    <a
                                      href={cite.linkArtikel}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold hover:underline"
                                    >
                                      <span>Buka Link</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={9} className="p-6 text-center text-slate-400 italic">
                              Belum ada data sitasi dosen. Klik &quot;Edit Tabel 3.3.5&quot; untuk menambahkan data.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* EDIT MODE TABEL 3.3.5 */
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 text-center">
                            <th className="border border-slate-200 p-2 text-center w-8 font-black">No</th>
                            <th className="border border-slate-200 p-2 text-left font-black">Judul Artikel yang Disitasi</th>
                            <th className="border border-slate-200 p-2 text-left w-36 font-black">Penulis</th>
                            <th className="border border-slate-200 p-2 text-left w-40 font-black">Jurnal / Publikasi</th>
                            <th className="border border-slate-200 p-2 font-black w-16">TS-2</th>
                            <th className="border border-slate-200 p-2 font-black w-16">TS-1</th>
                            <th className="border border-slate-200 p-2 font-black w-16">TS</th>
                            <th className="border border-slate-200 p-2 font-black w-20 bg-teal-100">Total</th>
                            <th className="border border-slate-200 p-2 text-left w-36 font-black">Tautan / DOI</th>
                            <th className="border border-slate-200 p-2 font-black w-10">Hapus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingCitationsList.map((cite, idx) => {
                            const total = (Number(cite.sitasiTs2) || 0) + (Number(cite.sitasiTs1) || 0) + (Number(cite.sitasiTs) || 0);
                            return (
                              <tr key={idx} className="align-middle hover:bg-slate-50/40 text-center">
                                <td className="border border-slate-200 p-2 text-center font-bold text-slate-500">
                                  {idx + 1}
                                </td>
                                <td className="border border-slate-200 p-1.5 text-left">
                                  <textarea
                                    rows={2}
                                    value={cite.judulArtikel}
                                    onChange={(e) => handleUpdateRowTable335(idx, "judulArtikel", e.target.value)}
                                    placeholder="Judul artikel ilmiah..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5 text-left">
                                  <input
                                    type="text"
                                    value={cite.penulis}
                                    onChange={(e) => handleUpdateRowTable335(idx, "penulis", e.target.value)}
                                    placeholder="Nama penulis..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5 text-left">
                                  <input
                                    type="text"
                                    value={cite.jenisPublikasi}
                                    onChange={(e) => handleUpdateRowTable335(idx, "jenisPublikasi", e.target.value)}
                                    placeholder="Nama jurnal / prosiding..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={cite.sitasiTs2}
                                    onChange={(e) => handleUpdateRowTable335(idx, "sitasiTs2", parseInt(e.target.value) || 0)}
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-center font-mono bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={cite.sitasiTs1}
                                    onChange={(e) => handleUpdateRowTable335(idx, "sitasiTs1", parseInt(e.target.value) || 0)}
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-center font-mono bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={cite.sitasiTs}
                                    onChange={(e) => handleUpdateRowTable335(idx, "sitasiTs", parseInt(e.target.value) || 0)}
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs text-center font-mono bg-white"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5 font-black font-mono text-teal-900 bg-teal-50">
                                  {total}
                                </td>
                                <td className="border border-slate-200 p-1.5 text-left">
                                  <input
                                    type="text"
                                    value={cite.linkArtikel}
                                    onChange={(e) => handleUpdateRowTable335(idx, "linkArtikel", e.target.value)}
                                    placeholder="https://doi.org/..."
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white text-sky-700"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRowTable335(idx)}
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {editingCitationsList.length === 0 && (
                            <tr>
                              <td colSpan={10} className="p-4 text-center text-slate-400 italic bg-slate-50/50">
                                Belum ada data sitasi dosen. Klik &quot;+ Tambah Baris Sitasi&quot; di bawah untuk menambah data.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleAddRowTable335}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-teal-300 bg-teal-50/60 hover:bg-teal-100/70 text-teal-800 font-bold text-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Baris Sitasi</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BAB III.3: TABEL LUARAN MAHASISWA (TABEL 3.3.7) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Bab III.3: Karya / Prestasi / Luaran Mahasiswa (Tabel 3.3.7)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Prestasi kompetisi nasional, publikasi ilmiah kolaboratif dosen-mahasiswa, dan produk kewirausahaan ber-HKI
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                      Tabel 3.3.7 Standar LAMEMBA
                    </span>
                    {!isEditingTable337 ? (
                      <button
                        onClick={handleStartEditTable337}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tabel 3.3.7</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable337}
                          disabled={isSavingTable337}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable337}
                          disabled={isSavingTable337}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable337 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>{isSavingTable337 ? "Menyimpan..." : "Simpan Perubahan"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {table337Feedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                      table337Feedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {table337Feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{table337Feedback.text}</span>
                  </div>
                )}

                {!isEditingTable337 ? (
                  /* VIEW MODE TABEL 3.3.7 */
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200 text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700">
                          <th className="border border-slate-200 p-2.5 text-center w-10 font-black">No</th>
                          <th className="border border-slate-200 p-2.5 text-left font-black">Judul Luaran / Prestasi Mahasiswa</th>
                          <th className="border border-slate-200 p-2.5 text-center w-16 font-black">Tahun</th>
                          <th className="border border-slate-200 p-2.5 text-left font-black">Nama Mahasiswa</th>
                          <th className="border border-slate-200 p-2.5 text-left font-black">Jenis Luaran</th>
                          <th className="border border-slate-200 p-2.5 text-center font-black">Bukti Dokumen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.studentOutcomes || []).length > 0 ? (
                          dl05.studentOutcomes!.map((mhs, idx) => (
                            <tr key={idx} className="align-middle hover:bg-slate-50/60 transition-colors">
                              <td className="border border-slate-200 p-2.5 text-center font-bold text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="border border-slate-200 p-2.5 font-bold text-slate-900 leading-relaxed">
                                {mhs.judulLuaran}
                              </td>
                              <td className="border border-slate-200 p-2.5 text-center font-mono text-slate-600">
                                {mhs.tahun}
                              </td>
                              <td className="border border-slate-200 p-2.5 text-slate-800 font-semibold">
                                {mhs.namaMahasiswa}
                              </td>
                              <td className="border border-slate-200 p-2.5 text-slate-600">
                                {mhs.jenisLuaran}
                              </td>
                              <td className="border border-slate-200 p-2.5 text-center">
                                {mhs.buktiLuaran ? (
                                  <a
                                    href={mhs.buktiLuaran}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                                  >
                                    <span>Bukti Fisik</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                              Belum ada data luaran mahasiswa. Klik &quot;Edit Tabel 3.3.7&quot; untuk menambahkan data.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* EDIT MODE TABEL 3.3.7 */
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700">
                            <th className="border border-slate-200 p-2 text-center w-8 font-black">No</th>
                            <th className="border border-slate-200 p-2 text-left font-black">Judul Luaran / Prestasi</th>
                            <th className="border border-slate-200 p-2 text-center w-20 font-black">Tahun</th>
                            <th className="border border-slate-200 p-2 text-left w-44 font-black">Nama Mahasiswa</th>
                            <th className="border border-slate-200 p-2 text-left w-36 font-black">Jenis Luaran</th>
                            <th className="border border-slate-200 p-2 text-left w-40 font-black">Tautan Bukti Dokumen</th>
                            <th className="border border-slate-200 p-2 text-center w-10 font-black">Hapus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingStudentOutcomes.map((mhs, idx) => (
                            <tr key={idx} className="align-middle hover:bg-slate-50/40">
                              <td className="border border-slate-200 p-2 text-center font-bold text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="border border-slate-200 p-1.5">
                                <textarea
                                  rows={2}
                                  value={mhs.judulLuaran}
                                  onChange={(e) => handleUpdateRowTable337(idx, "judulLuaran", e.target.value)}
                                  placeholder="Judul prestasi / produk kewirausahaan / publikasi..."
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-1.5">
                                <input
                                  type="number"
                                  value={mhs.tahun}
                                  onChange={(e) => handleUpdateRowTable337(idx, "tahun", parseInt(e.target.value) || 2024)}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-mono text-center bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-1.5">
                                <input
                                  type="text"
                                  value={mhs.namaMahasiswa}
                                  onChange={(e) => handleUpdateRowTable337(idx, "namaMahasiswa", e.target.value)}
                                  placeholder="Nama mahasiswa..."
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-1.5">
                                <select
                                  value={mhs.jenisLuaran}
                                  onChange={(e) => handleUpdateRowTable337(idx, "jenisLuaran", e.target.value)}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                                >
                                  <option value="Prestasi / Rekognisi">Prestasi / Rekognisi</option>
                                  <option value="Publikasi Ilmiah">Publikasi Ilmiah</option>
                                  <option value="Produk Kewirausahaan">Produk Kewirausahaan</option>
                                  <option value="HKI Mahasiswa">HKI Mahasiswa</option>
                                </select>
                              </td>
                              <td className="border border-slate-200 p-1.5">
                                <input
                                  type="text"
                                  value={mhs.buktiLuaran}
                                  onChange={(e) => handleUpdateRowTable337(idx, "buktiLuaran", e.target.value)}
                                  placeholder="https://... atau drive link"
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-mono text-emerald-800 bg-white"
                                />
                              </td>
                              <td className="border border-slate-200 p-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRowTable337(idx)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Hapus Baris"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {editingStudentOutcomes.length === 0 && (
                            <tr>
                              <td colSpan={7} className="p-4 text-center text-slate-400 italic bg-slate-50/50">
                                Belum ada data prestasi mahasiswa. Klik &quot;+ Tambah Baris Luaran Mahasiswa&quot; di bawah untuk menambah data.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleAddRowTable337}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 hover:bg-amber-100/70 text-amber-800 font-bold text-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Baris Luaran Mahasiswa</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BAB III.3: REKONSILIASI PD-DIKTI (TABEL 3.3.9) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Bab III.3: Kemahasiswaan & Rekonsiliasi PD-Dikti (Tabel 3.3.9)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Sinkronisasi jumlah mahasiswa aktif kampus terhadap data terdaftar pada Pangkalan Data Pendidikan Tinggi (PD-Dikti)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-50 text-cyan-800 border border-cyan-200">
                      Tabel 3.3.9 Rekonsiliasi Feeder
                    </span>
                    {!isEditingTable339 ? (
                      <button
                        onClick={handleStartEditTable339}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tabel 3.3.9</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditTable339}
                          disabled={isSavingTable339}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTable339}
                          disabled={isSavingTable339}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs shadow-sm transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                        >
                          {isSavingTable339 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>{isSavingTable339 ? "Menyimpan..." : "Simpan Perubahan"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {table339Feedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                      table339Feedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {table339Feedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{table339Feedback.text}</span>
                  </div>
                )}

                {!isEditingTable339 ? (
                  /* VIEW MODE TABEL 3.3.9 */
                  <div className="space-y-4">
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
                          {(dl05.mahasiswaAktifList || []).length > 0 ? (
                            dl05.mahasiswaAktifList!.map((mhs, idx) => {
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
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-slate-400 italic">
                                Belum ada data rekonsiliasi mahasiswa aktif PD-Dikti. Klik &quot;Edit Tabel 3.3.9&quot; untuk menambahkan data.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {dl05.perbaikanBerkelanjutanTridharma && (
                      <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs space-y-1">
                        <span className="font-black text-sky-900 block">
                          Catatan Perbaikan Berkelanjutan (CQI) Tridharma:
                        </span>
                        <p className="text-sky-800 leading-relaxed">
                          {dl05.perbaikanBerkelanjutanTridharma}
                        </p>
                      </div>
                    )}

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
                ) : (
                  /* EDIT MODE TABEL 3.3.9 */
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 text-center">
                            <th className="border border-slate-200 p-2 text-center w-8 font-black">No</th>
                            <th className="border border-slate-200 p-2 text-left font-black w-36">Semester</th>
                            <th className="border border-slate-200 p-2 font-black">Mhs Aktif Kampus</th>
                            <th className="border border-slate-200 p-2 font-black">Mhs di PD-Dikti</th>
                            <th className="border border-slate-200 p-2 font-black w-28 bg-slate-200">Selisih</th>
                            <th className="border border-slate-200 p-2 font-black w-10">Hapus</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingMahasiswaAktifList.map((mhs, idx) => {
                            const diff = Math.abs((Number(mhs.mhsAktif) || 0) - (Number(mhs.mhsPdDikti) || 0));
                            return (
                              <tr key={idx} className="align-middle hover:bg-slate-50/40 text-center">
                                <td className="border border-slate-200 p-2 text-center font-bold text-slate-500">
                                  {idx + 1}
                                </td>
                                <td className="border border-slate-200 p-1.5 text-left">
                                  <select
                                    value={mhs.semester}
                                    onChange={(e) => handleUpdateRowTable339(idx, "semester", e.target.value as any)}
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                                  >
                                    <option value="Ganjil">Semester Ganjil</option>
                                    <option value="Genap">Semester Genap</option>
                                  </select>
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={mhs.mhsAktif}
                                    onChange={(e) => handleUpdateRowTable339(idx, "mhsAktif", parseInt(e.target.value) || 0)}
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-mono text-center bg-white font-bold"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={mhs.mhsPdDikti}
                                    onChange={(e) => handleUpdateRowTable339(idx, "mhsPdDikti", parseInt(e.target.value) || 0)}
                                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-mono text-center bg-white font-bold"
                                  />
                                </td>
                                <td className="border border-slate-200 p-1.5 bg-slate-50">
                                  <span className={`font-mono font-black ${diff === 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                    {diff} Mhs
                                  </span>
                                </td>
                                <td className="border border-slate-200 p-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRowTable339(idx)}
                                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {editingMahasiswaAktifList.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-slate-400 italic bg-slate-50/50">
                                Belum ada data mahasiswa aktif. Klik &quot;+ Tambah Baris Semester&quot; di bawah untuk menambah data.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5 p-4 rounded-2xl bg-sky-50/40 border border-sky-200">
                        <label className="text-xs font-black text-sky-900 block">
                          Catatan Perbaikan Berkelanjutan (CQI) Tridharma:
                        </label>
                        <textarea
                          rows={2}
                          value={editingTridharmaCqi}
                          onChange={(e) => setEditingTridharmaCqi(e.target.value)}
                          placeholder="Uraikan hilirisasi riset dosen ke pengabdian masyarakat dan insentif publikasi bereputasi..."
                          className="w-full p-2.5 border border-sky-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div className="space-y-1.5 p-4 rounded-2xl bg-cyan-50/40 border border-cyan-200">
                        <label className="text-xs font-black text-cyan-900 block">
                          Catatan Rekonsiliasi PD-Dikti & Kemahasiswaan:
                        </label>
                        <textarea
                          rows={2}
                          value={editingKemahasiswaanCqi}
                          onChange={(e) => setEditingKemahasiswaanCqi(e.target.value)}
                          placeholder="Uraikan mekanisme sinkronisasi data feeder PD-Dikti setiap awal semester dan pembinaan prestasi..."
                          className="w-full p-2.5 border border-cyan-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleAddRowTable339}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-cyan-300 bg-cyan-50/60 hover:bg-cyan-100/70 text-cyan-800 font-bold text-xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Baris Semester</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-TAB 4: ARSIP SURAT REKOMENDASI LAM & CETAK BORANG LENGKAP */}
          {activeDl05SubTab === "arsip_cetak" && (
            <div className="space-y-8">
              {/* 1. SAMPUL DEPAN & IDENTITAS PENGUSUL */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Halaman Muka (Sampul) & Identitas Pengusul
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Informasi resmi perguruan tinggi, unit pengelola, program studi, SK pendirian/pembukaan, akreditasi, dan logo resmi sesuai template muka LAMEMBA (Kode: DL-05)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingIdentitas ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditingIdentitas(false)}
                          disabled={isSavingIdentitas}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveIdentitas}
                          disabled={isSavingIdentitas}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          {isSavingIdentitas ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Simpan Identitas</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartEditIdentitas}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Identitas & Sampul</span>
                      </button>
                    )}
                  </div>
                </div>

                {identitasFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      identitasFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {identitasFeedback.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{identitasFeedback.text}</span>
                  </div>
                )}

                {!isEditingIdentitas ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visual Card Preview Sampul */}
                    <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-amber-50/30 border border-amber-200/70 flex flex-col items-center text-center justify-between space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200">
                        Pratinjau Sampul Depan
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dl05.identitasPengusul?.logoUrl || "/logo_stimi.png"}
                        alt="Logo Perguruan Tinggi"
                        className="w-24 h-24 object-contain drop-shadow-sm my-2"
                      />
                      <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase text-slate-800 tracking-tight">
                          DOKUMEN PEMANTAUAN DAN EVALUASI TAHUN KE-{selectedDl05Year}
                        </p>
                        <p className="text-[10px] font-bold text-slate-600 uppercase">
                          AKREDITASI PROGRAM STUDI
                        </p>
                        <p className="text-xs font-black text-amber-900 uppercase pt-2">
                          {dl05.identitasPengusul?.namaProdi || dl05.prodiName}
                        </p>
                        <p className="text-[11px] font-extrabold text-slate-900 uppercase">
                          {dl05.identitasPengusul?.perguruanTinggi || "STIMI YAPMI MAKASSAR"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {dl05.identitasPengusul?.unitPengelola || "JURUSAN MANAJEMEN"}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-amber-200/60 w-full text-[10px] font-mono font-bold text-slate-600">
                        {dl05.identitasPengusul?.kota || "MAKASSAR"}, {dl05.identitasPengusul?.tahunDokumen || "2025"}
                      </div>
                    </div>

                    {/* Tabel Rincian Identitas Pengusul 16 Butir */}
                    <div className="lg:col-span-2 overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <tbody>
                          <tr className="border-b border-slate-200 hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-600 w-1/3 bg-slate-50">Perguruan Tinggi</td>
                            <td className="p-2.5 font-black text-slate-900">{dl05.identitasPengusul?.perguruanTinggi || "STIMI YAPMI Makassar"}</td>
                          </tr>
                          <tr className="border-b border-slate-200 hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-600 bg-slate-50">Unit Pengelola Program Studi</td>
                            <td className="p-2.5 text-slate-800">{dl05.identitasPengusul?.unitPengelola || "Jurusan Manajemen"}</td>
                          </tr>
                          <tr className="border-b border-slate-200 hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-600 bg-slate-50">Jenis Program & Nama Prodi</td>
                            <td className="p-2.5 text-slate-800 font-semibold">{dl05.identitasPengusul?.jenisProgram || "Sarjana (S1)"} • {dl05.identitasPengusul?.namaProdi || "Manajemen"}</td>
                          </tr>
                          <tr className="border-b border-slate-200 hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-600 bg-slate-50">Alamat Kampus</td>
                            <td className="p-2.5 text-slate-700">{dl05.identitasPengusul?.alamat || "Jl. Perintis Kemerdekaan KM. 9, Makassar"}</td>
                          </tr>
                          <tr className="border-b border-slate-200 hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-600 bg-slate-50">Kontak Telepon & Website</td>
                            <td className="p-2.5 text-slate-700 font-mono text-[11px]">{dl05.identitasPengusul?.telepon || "-"} • {dl05.identitasPengusul?.emailWeb || "-"}</td>
                          </tr>
                          <tr className="border-b border-slate-200 hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-600 bg-slate-50">SK Pendirian PT</td>
                            <td className="p-2.5 text-slate-700 font-mono text-[11px]">{dl05.identitasPengusul?.nomorSkPendirianPt || "-"} ({dl05.identitasPengusul?.tanggalSkPendirianPt || "-"}) oleh {dl05.identitasPengusul?.pejabatSkPendirianPt || "-"}</td>
                          </tr>
                          <tr className="border-b border-slate-200 hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-600 bg-slate-50">SK Pembukaan Program Studi</td>
                            <td className="p-2.5 text-slate-700 font-mono text-[11px]">{dl05.identitasPengusul?.nomorSkPembukaanPs || "-"} ({dl05.identitasPengusul?.tanggalSkPembukaanPs || "-"}) oleh {dl05.identitasPengusul?.pejabatSkPembukaanPs || "-"}</td>
                          </tr>
                          <tr className="border-b border-slate-200 hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-600 bg-slate-50">Tahun Pertama Menerima Mahasiswa</td>
                            <td className="p-2.5 font-black text-slate-900">{dl05.identitasPengusul?.tahunPertamaMenerimaMhs || "1998"}</td>
                          </tr>
                          <tr className="border-b border-slate-200 hover:bg-slate-50/60">
                            <td className="p-2.5 font-bold text-slate-600 bg-slate-50">Peringkat Akreditasi Terkini & SK LAM</td>
                            <td className="p-2.5 text-slate-800">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 mr-2">
                                {dl05.identitasPengusul?.peringkatAkreditasiTerbaru || "Baik Sekali"}
                              </span>
                              <span className="font-mono text-[11px]">{dl05.identitasPengusul?.nomorSkLam || "-"}</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold text-slate-600 bg-slate-50">Kota Kedudukan & Tahun Dokumen</td>
                            <td className="p-2.5 text-slate-800 font-bold">{dl05.identitasPengusul?.kota || "Makassar"}, Tahun {dl05.identitasPengusul?.tahunDokumen || "2025"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Form Edit Mode Identitas */
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Nama Perguruan Tinggi</label>
                        <input
                          type="text"
                          value={editingIdentitas.perguruanTinggi || ""}
                          onChange={(e) => handleUpdateIdentitasField("perguruanTinggi", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Unit Pengelola Program Studi (UPPS)</label>
                        <input
                          type="text"
                          value={editingIdentitas.unitPengelola || ""}
                          onChange={(e) => handleUpdateIdentitasField("unitPengelola", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Nama Program Studi</label>
                        <input
                          type="text"
                          value={editingIdentitas.namaProdi || ""}
                          onChange={(e) => handleUpdateIdentitasField("namaProdi", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Jenis Program (Strata)</label>
                        <input
                          type="text"
                          value={editingIdentitas.jenisProgram || ""}
                          onChange={(e) => handleUpdateIdentitasField("jenisProgram", e.target.value)}
                          placeholder="Sarjana (S1)"
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-700 block">Alamat Kampus</label>
                        <input
                          type="text"
                          value={editingIdentitas.alamat || ""}
                          onChange={(e) => handleUpdateIdentitasField("alamat", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Nomor Telepon</label>
                        <input
                          type="text"
                          value={editingIdentitas.telepon || ""}
                          onChange={(e) => handleUpdateIdentitasField("telepon", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">E-mail dan Website Resmi</label>
                        <input
                          type="text"
                          value={editingIdentitas.emailWeb || ""}
                          onChange={(e) => handleUpdateIdentitasField("emailWeb", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">URL Logo Perguruan Tinggi</label>
                        <input
                          type="text"
                          value={editingIdentitas.logoUrl || ""}
                          onChange={(e) => handleUpdateIdentitasField("logoUrl", e.target.value)}
                          placeholder="/logo_stimi.png"
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Nomor SK Pendirian PT</label>
                        <input
                          type="text"
                          value={editingIdentitas.nomorSkPendirianPt || ""}
                          onChange={(e) => handleUpdateIdentitasField("nomorSkPendirianPt", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Tanggal SK Pendirian PT</label>
                        <input
                          type="date"
                          value={editingIdentitas.tanggalSkPendirianPt || ""}
                          onChange={(e) => handleUpdateIdentitasField("tanggalSkPendirianPt", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Pejabat SK Pendirian PT</label>
                        <input
                          type="text"
                          value={editingIdentitas.pejabatSkPendirianPt || ""}
                          onChange={(e) => handleUpdateIdentitasField("pejabatSkPendirianPt", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Nomor SK Pembukaan PS</label>
                        <input
                          type="text"
                          value={editingIdentitas.nomorSkPembukaanPs || ""}
                          onChange={(e) => handleUpdateIdentitasField("nomorSkPembukaanPs", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Tanggal SK Pembukaan PS</label>
                        <input
                          type="date"
                          value={editingIdentitas.tanggalSkPembukaanPs || ""}
                          onChange={(e) => handleUpdateIdentitasField("tanggalSkPembukaanPs", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Pejabat SK Pembukaan PS</label>
                        <input
                          type="text"
                          value={editingIdentitas.pejabatSkPembukaanPs || ""}
                          onChange={(e) => handleUpdateIdentitasField("pejabatSkPembukaanPs", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Tahun Pertama Menerima Mhs</label>
                        <input
                          type="text"
                          value={editingIdentitas.tahunPertamaMenerimaMhs || ""}
                          onChange={(e) => handleUpdateIdentitasField("tahunPertamaMenerimaMhs", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Peringkat Akreditasi Terkini</label>
                        <input
                          type="text"
                          value={editingIdentitas.peringkatAkreditasiTerbaru || ""}
                          onChange={(e) => handleUpdateIdentitasField("peringkatAkreditasiTerbaru", e.target.value)}
                          placeholder="Baik Sekali / Unggul"
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Nomor SK LAMEMBA</label>
                        <input
                          type="text"
                          value={editingIdentitas.nomorSkLam || ""}
                          onChange={(e) => handleUpdateIdentitasField("nomorSkLam", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Tanggal Kedaluwarsa SK</label>
                        <input
                          type="date"
                          value={editingIdentitas.tanggalKadaluarsa || ""}
                          onChange={(e) => handleUpdateIdentitasField("tanggalKadaluarsa", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Kota Kedudukan PT</label>
                        <input
                          type="text"
                          value={editingIdentitas.kota || ""}
                          onChange={(e) => handleUpdateIdentitasField("kota", e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Tahun Dokumen Evaluasi</label>
                        <input
                          type="text"
                          value={editingIdentitas.tahunDokumen || ""}
                          onChange={(e) => handleUpdateIdentitasField("tahunDokumen", e.target.value)}
                          placeholder="2025"
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. IDENTITAS TIM PENYUSUN EVALUASI DIRI (TASKFORCE DL-05) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Identitas Tim Penyusun Evaluasi Diri (Taskforce DL-05)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Daftar personil pimpinan UPPS, gugus kendali mutu, prodi, dan dosen penyusun borang resmi sesuai template halaman depan LAMEMBA
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingTimPenyusun ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditingTimPenyusun(false)}
                          disabled={isSavingTimPenyusun}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTimPenyusun}
                          disabled={isSavingTimPenyusun}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          {isSavingTimPenyusun ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Simpan Tim</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartEditTimPenyusun}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tim Penyusun</span>
                      </button>
                    )}
                  </div>
                </div>

                {timPenyusunFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      timPenyusunFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {timPenyusunFeedback.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{timPenyusunFeedback.text}</span>
                  </div>
                )}

                {!isEditingTimPenyusun ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-200 text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700">
                          <th className="border border-slate-200 p-3 text-center w-12 font-black">No</th>
                          <th className="border border-slate-200 p-3 text-left font-black">Nama Lengkap</th>
                          <th className="border border-slate-200 p-3 text-left font-black">NIDN / NIK</th>
                          <th className="border border-slate-200 p-3 text-left font-black">Jabatan Struktural</th>
                          <th className="border border-slate-200 p-3 text-left font-black">Peran dalam Tim Evaluasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.timPenyusun || []).map((tp, idx) => (
                          <tr key={idx} className="align-middle hover:bg-slate-50/60 transition-colors">
                            <td className="border border-slate-200 p-3 text-center font-bold text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="border border-slate-200 p-3 font-bold text-slate-900">
                              {tp.nama}
                            </td>
                            <td className="border border-slate-200 p-3 font-mono text-slate-600">
                              {tp.nikNidn}
                            </td>
                            <td className="border border-slate-200 p-3 text-slate-700">
                              {tp.jabatan}
                            </td>
                            <td className="border border-slate-200 p-3">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-50 text-sky-900 border border-sky-200">
                                {tp.peran}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {(dl05.timPenyusun || []).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-slate-400 italic bg-slate-50">
                              Belum ada anggota tim penyusun. Klik &quot;Edit Tim Penyusun&quot; untuk menambahkan anggota.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-slate-200 text-xs">
                        <thead>
                          <tr className="bg-sky-50 text-sky-900">
                            <th className="border border-slate-200 p-2.5 text-center w-12 font-black">No</th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">Nama Lengkap</th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">NIDN / NIK</th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">Jabatan Struktural</th>
                            <th className="border border-slate-200 p-2.5 text-left font-black">Peran dalam Tim</th>
                            <th className="border border-slate-200 p-2.5 text-center w-14 font-black">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingTimPenyusun.map((tp, idx) => (
                            <tr key={idx} className="align-middle">
                              <td className="border border-slate-200 p-2 text-center font-bold text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="border border-slate-200 p-2">
                                <input
                                  type="text"
                                  value={tp.nama}
                                  onChange={(e) => handleUpdateRowTimPenyusun(idx, "nama", e.target.value)}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                                  placeholder="Nama Lengkap dengan Gelar"
                                />
                              </td>
                              <td className="border border-slate-200 p-2">
                                <input
                                  type="text"
                                  value={tp.nikNidn}
                                  onChange={(e) => handleUpdateRowTimPenyusun(idx, "nikNidn", e.target.value)}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                                  placeholder="NIDN. ..."
                                />
                              </td>
                              <td className="border border-slate-200 p-2">
                                <input
                                  type="text"
                                  value={tp.jabatan}
                                  onChange={(e) => handleUpdateRowTimPenyusun(idx, "jabatan", e.target.value)}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                                  placeholder="Jabatan di Kampus"
                                />
                              </td>
                              <td className="border border-slate-200 p-2">
                                <input
                                  type="text"
                                  value={tp.peran}
                                  onChange={(e) => handleUpdateRowTimPenyusun(idx, "peran", e.target.value)}
                                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                                  placeholder="Peran di Taskforce"
                                />
                              </td>
                              <td className="border border-slate-200 p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRowTimPenyusun(idx)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Hapus Anggota"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {editingTimPenyusun.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-slate-400 italic bg-slate-50">
                                Anggota tim kosong. Klik &quot;+ Tambah Anggota Tim&quot; di bawah untuk menambah.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddRowTimPenyusun}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Anggota Tim</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. PENGATURAN LEMBAR PENGESAHAN & PENANDATANGAN RESMI (3 PIHAK) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Pengaturan Penandatangan Lembar Pengesahan (3 Pihak)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Konfigurasi resmi penandatangan Dokumen DL-05 (Kaprodi, Ketua LPM, dan Ketua Perguruan Tinggi) yang tercetak pada lembar pengesahan borang
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingPengesahan ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditingPengesahan(false)}
                          disabled={isSavingPengesahan}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSavePengesahan}
                          disabled={isSavingPengesahan}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          {isSavingPengesahan ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Simpan Penandatangan</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartEditPengesahan}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Penandatangan</span>
                      </button>
                    )}
                  </div>
                </div>

                {pengesahanFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      pengesahanFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {pengesahanFeedback.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{pengesahanFeedback.text}</span>
                  </div>
                )}

                {!isEditingPengesahan ? (
                  <div className="space-y-4">
                    {/* Lokasi & Tanggal Pengesahan Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span className="font-bold text-slate-700">Tempat & Tanggal Pengesahan:</span>
                        <strong className="text-slate-900 font-black">
                          {dl05.lembarPengesahan?.kota || "Makassar"}, {dl05.lembarPengesahan?.tanggal || "15 Januari 2026"}
                        </strong>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        Format Cetak: Lembar 3 Kolom
                      </span>
                    </div>

                    {/* 3 Kartu Penandatangan */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Pihak 1: Kaprodi */}
                      <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-teal-50/20 border border-teal-200/70 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 px-2 py-0.5 rounded-md bg-teal-100">
                            Pihak I • Penyusun
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-slate-500 uppercase">
                            {dl05.lembarPengesahan?.kaprodi?.jabatan || "Ketua Program Studi S1 Manajemen"}
                          </p>
                          <p className="text-sm font-black text-slate-900 underline underline-offset-2">
                            {dl05.lembarPengesahan?.kaprodi?.nama || (dl05.timPenyusun && dl05.timPenyusun[0]?.nama) || "Drs. H. M. Said, M.Si"}
                          </p>
                          <p className="text-[11px] font-mono text-slate-600">
                            {dl05.lembarPengesahan?.kaprodi?.nikNidn || (dl05.timPenyusun && dl05.timPenyusun[0]?.nikNidn) || "NIDN. 0918077501"}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-teal-200/50 text-[10px] text-slate-400">
                          Penanggung jawab penyusunan borang DL-05
                        </div>
                      </div>

                      {/* Pihak 2: LPM */}
                      <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-sky-50/20 border border-sky-200/70 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 px-2 py-0.5 rounded-md bg-sky-100">
                            Pihak II • Verifikator
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-slate-500 uppercase">
                            {dl05.lembarPengesahan?.ketuaLpm?.jabatan || "Ketua Lembaga Penjaminan Mutu"}
                          </p>
                          <p className="text-sm font-black text-slate-900 underline underline-offset-2">
                            {dl05.lembarPengesahan?.ketuaLpm?.nama || "Dr. Nurul Fadilah, SE., MM"}
                          </p>
                          <p className="text-[11px] font-mono text-slate-600">
                            {dl05.lembarPengesahan?.ketuaLpm?.nikNidn || "NIDN. 0915088201"}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-sky-200/50 text-[10px] text-slate-400">
                          Audit & verifikasi siklus PPEPP penjaminan mutu
                        </div>
                      </div>

                      {/* Pihak 3: Ketua STIMI */}
                      <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50/20 border border-indigo-200/70 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 px-2 py-0.5 rounded-md bg-indigo-100">
                            Pihak III • Menyetujui
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-slate-500 uppercase">
                            {dl05.lembarPengesahan?.ketuaPt?.jabatan || "Ketua STIMI YAPMI Makassar"}
                          </p>
                          <p className="text-sm font-black text-slate-900 underline underline-offset-2">
                            {dl05.lembarPengesahan?.ketuaPt?.nama || "Dr. Ibrahim Syah, S.E., M.M."}
                          </p>
                          <p className="text-[11px] font-mono text-slate-600">
                            {dl05.lembarPengesahan?.ketuaPt?.nikNidn || "NIDN. 0920037601"}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-indigo-200/50 text-[10px] text-slate-400">
                          Pengesahan pimpinan perguruan tinggi pengusul
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 pt-1">
                    {/* Form Edit Tempat & Tanggal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Kota Pengesahan</label>
                        <input
                          type="text"
                          value={editingPengesahan.kota || ""}
                          onChange={(e) => handleUpdatePengesahanMeta("kota", e.target.value)}
                          placeholder="Makassar"
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Tanggal Pengesahan Dokumen</label>
                        <input
                          type="text"
                          value={editingPengesahan.tanggal || ""}
                          onChange={(e) => handleUpdatePengesahanMeta("tanggal", e.target.value)}
                          placeholder="15 Januari 2026"
                          className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                    </div>

                    {/* Form Edit 3 Pihak */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Pihak 1: Kaprodi */}
                      <div className="p-4 rounded-2xl bg-teal-50/30 border border-teal-200 space-y-3">
                        <div className="text-xs font-black text-teal-900 pb-1 border-b border-teal-200">
                          Pihak I (Penyusun / Kaprodi)
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">Jabatan Resmi</label>
                          <input
                            type="text"
                            value={editingPengesahan.kaprodi?.jabatan || ""}
                            onChange={(e) => handleUpdatePengesahanPihak("kaprodi", "jabatan", e.target.value)}
                            placeholder="Ketua Program Studi S1 Manajemen"
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">Nama Lengkap & Gelar</label>
                          <input
                            type="text"
                            value={editingPengesahan.kaprodi?.nama || ""}
                            onChange={(e) => handleUpdatePengesahanPihak("kaprodi", "nama", e.target.value)}
                            placeholder="Drs. H. M. Said, M.Si"
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">NIDN / NIK</label>
                          <input
                            type="text"
                            value={editingPengesahan.kaprodi?.nikNidn || ""}
                            onChange={(e) => handleUpdatePengesahanPihak("kaprodi", "nikNidn", e.target.value)}
                            placeholder="NIDN. 0918077501"
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Pihak 2: LPM */}
                      <div className="p-4 rounded-2xl bg-sky-50/30 border border-sky-200 space-y-3">
                        <div className="text-xs font-black text-sky-900 pb-1 border-b border-sky-200">
                          Pihak II (Verifikator / Ketua LPM)
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">Jabatan Resmi</label>
                          <input
                            type="text"
                            value={editingPengesahan.ketuaLpm?.jabatan || ""}
                            onChange={(e) => handleUpdatePengesahanPihak("ketuaLpm", "jabatan", e.target.value)}
                            placeholder="Ketua Lembaga Penjaminan Mutu"
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">Nama Lengkap & Gelar</label>
                          <input
                            type="text"
                            value={editingPengesahan.ketuaLpm?.nama || ""}
                            onChange={(e) => handleUpdatePengesahanPihak("ketuaLpm", "nama", e.target.value)}
                            placeholder="Dr. Nurul Fadilah, SE., MM"
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">NIDN / NIK</label>
                          <input
                            type="text"
                            value={editingPengesahan.ketuaLpm?.nikNidn || ""}
                            onChange={(e) => handleUpdatePengesahanPihak("ketuaLpm", "nikNidn", e.target.value)}
                            placeholder="NIDN. 0915088201"
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Pihak 3: Ketua STIMI */}
                      <div className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-200 space-y-3">
                        <div className="text-xs font-black text-indigo-900 pb-1 border-b border-indigo-200">
                          Pihak III (Pimpinan PT / Menyetujui)
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">Jabatan Resmi</label>
                          <input
                            type="text"
                            value={editingPengesahan.ketuaPt?.jabatan || ""}
                            onChange={(e) => handleUpdatePengesahanPihak("ketuaPt", "jabatan", e.target.value)}
                            placeholder="Ketua STIMI YAPMI Makassar"
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">Nama Lengkap & Gelar</label>
                          <input
                            type="text"
                            value={editingPengesahan.ketuaPt?.nama || ""}
                            onChange={(e) => handleUpdatePengesahanPihak("ketuaPt", "nama", e.target.value)}
                            placeholder="Dr. Ibrahim Syah, S.E., M.M."
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">NIDN / NIK</label>
                          <input
                            type="text"
                            value={editingPengesahan.ketuaPt?.nikNidn || ""}
                            onChange={(e) => handleUpdatePengesahanPihak("ketuaPt", "nikNidn", e.target.value)}
                            placeholder="NIDN. 0920037601"
                            className="w-full p-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. KATA PENGANTAR */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Kata Pengantar Dokumen DL-05
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Prakata resmi pimpinan perguruan tinggi dan ketua taskforce pengusul borang pemantauan tahunan LAMEMBA
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingKataPengantar ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditingKataPengantar(false)}
                          disabled={isSavingKataPengantar}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveKataPengantar}
                          disabled={isSavingKataPengantar}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          {isSavingKataPengantar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Simpan Kata Pengantar</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartEditKataPengantar}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Kata Pengantar</span>
                      </button>
                    )}
                  </div>
                </div>

                {kataPengantarFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      kataPengantarFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {kataPengantarFeedback.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{kataPengantarFeedback.text}</span>
                  </div>
                )}

                {!isEditingKataPengantar ? (
                  <div className="p-5 rounded-2xl bg-purple-50/30 border border-purple-100 space-y-3 text-xs text-slate-700 leading-relaxed whitespace-pre-line text-justify">
                    {dl05.kataPengantar || "(Kata Pengantar belum diisi)"}
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={8}
                      value={editingKataPengantar}
                      onChange={(e) => setEditingKataPengantar(e.target.value)}
                      placeholder="Tuliskan kata pengantar resmi di sini..."
                      className="w-full p-3.5 border border-purple-300 rounded-2xl text-xs bg-white focus:ring-2 focus:ring-purple-500 leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* 4. DAFTAR ISI DOKUMEN DL-05 */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Daftar Isi Dokumen (Sesuai Struktur Baku LAMEMBA)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Struktur bab dan urutan lampiran otomatis diselaraskan secara konsisten ke pratinjau cetak
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-50 text-teal-800 border border-teal-200">
                    Format Resmi Word
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2.5 text-xs text-slate-800 font-medium">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 font-bold">
                    <span>Halaman Muka (Sampul Dokumen & Logo Perguruan Tinggi)</span>
                    <span className="font-mono text-slate-400">Hal. i</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 font-bold">
                    <span>Identitas Pengusul</span>
                    <span className="font-mono text-slate-400">Hal. ii</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 font-bold">
                    <span>Identitas Tim Penyusun Dokumen Evaluasi Diri</span>
                    <span className="font-mono text-slate-400">Hal. iii</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 font-bold">
                    <span>Kata Pengantar</span>
                    <span className="font-mono text-slate-400">Hal. iv</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 font-bold">
                    <span>Daftar Isi</span>
                    <span className="font-mono text-slate-400">Hal. v</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                    <span className="font-black text-slate-900">BAB I TINDAK LANJUT REKOMENDASI ASESOR</span>
                    <span className="font-mono text-slate-400">Hal. 1</span>
                  </div>
                  <div className="pl-4 flex items-center justify-between text-slate-600 text-[11px]">
                    <span>• Tabel 1.1 Tindak Lanjut Rekomendasi Asesor</span>
                    <span className="font-mono text-slate-400">Hal. 1</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                    <span className="font-black text-slate-900">BAB II KEMAJUAN IMPLEMENTASI STRATEGI</span>
                    <span className="font-mono text-slate-400">Hal. 2</span>
                  </div>
                  <div className="pl-4 flex items-center justify-between text-slate-600 text-[11px]">
                    <span>• Tabel 2.1 Kemajuan Implementasi Strategi Renstra</span>
                    <span className="font-mono text-slate-400">Hal. 2</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                    <span className="font-black text-slate-900">BAB III EVALUASI KINERJA PROGRAM STUDI</span>
                    <span className="font-mono text-slate-400">Hal. 3</span>
                  </div>
                  <div className="pl-4 flex items-center justify-between text-slate-600 text-[11px]">
                    <span>• 3.1 Jaminan Pembelajaran (Tabel 3.1.1 Jaminan Pembelajaran & CQI)</span>
                    <span className="font-mono text-slate-400">Hal. 3</span>
                  </div>
                  <div className="pl-4 flex items-center justify-between text-slate-600 text-[11px]">
                    <span>• 3.2 Kecukupan dan Kualifikasi Dosen (Tabel 3.2.1, 3.2.3, 3.2.5, 3.2.7)</span>
                    <span className="font-mono text-slate-400">Hal. 4</span>
                  </div>
                  <div className="pl-4 flex items-center justify-between text-slate-600 text-[11px]">
                    <span>• 3.3 Luaran dan Capaian Tridharma (Tabel 3.3.1-3.3.3, 3.3.5, 3.3.7, 3.3.9)</span>
                    <span className="font-mono text-slate-400">Hal. 6</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 font-bold">
                    <span>BAB IV PENUTUP & LEMBAR PENGESAHAN 3 PIHAK</span>
                    <span className="font-mono text-slate-400">Hal. 8</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-emerald-800">
                    <span>LAMPIRAN: KOLEKSI ARSIP SURAT REKOMENDASI RESMI LAMEMBA (THN 0 S.D 4)</span>
                    <span className="font-mono text-slate-400">Hal. 9</span>
                  </div>
                </div>
              </div>

              {/* 5. NARASI PENGANTAR ANTAR-BAB (BAB I, II, III & PENUTUP) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="text-base font-black text-slate-900">
                        Narasi Pengantar Antar-Bab & Penutup
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Teks narasi deskriptif pengantar sebelum tabel pada Bab I, Bab II, Bab III (Umum, 3.1, 3.2, 3.3) dan Bab IV Penutup
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingNarasi ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditingNarasi(false)}
                          disabled={isSavingNarasi}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNarasi}
                          disabled={isSavingNarasi}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          {isSavingNarasi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Simpan Seluruh Narasi</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartEditNarasi}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Seluruh Narasi</span>
                      </button>
                    )}
                  </div>
                </div>

                {narasiFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      narasiFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {narasiFeedback.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{narasiFeedback.text}</span>
                  </div>
                )}

                {!isEditingNarasi ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <h5 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Narasi Pengantar Bab I (Tindak Lanjut Rekomendasi Asesor)
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed text-justify">
                        {dl05.narasiBab1 || "(Narasi belum diisi)"}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <h5 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        Narasi Pengantar Bab II (Kemajuan Implementasi Strategi Renstra)
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed text-justify">
                        {dl05.narasiBab2 || "(Narasi belum diisi)"}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <h5 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                        Narasi Pengantar Bab III (Evaluasi Kinerja Program Studi - Umum)
                      </h5>
                      <p className="text-xs text-slate-600 leading-relaxed text-justify">
                        {dl05.narasiBab3 || "(Narasi belum diisi)"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-200 space-y-1">
                        <h6 className="font-extrabold text-purple-900 text-[11px]">3.1 Jaminan Pembelajaran</h6>
                        <p className="text-[11px] text-slate-600 line-clamp-4 leading-relaxed">
                          {dl05.narasiBab31 || "(Narasi belum diisi)"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200 space-y-1">
                        <h6 className="font-extrabold text-amber-900 text-[11px]">3.2 Kecukupan & Kualifikasi Dosen</h6>
                        <p className="text-[11px] text-slate-600 line-clamp-4 leading-relaxed">
                          {dl05.narasiBab32 || "(Narasi belum diisi)"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-cyan-50/40 border border-cyan-200 space-y-1">
                        <h6 className="font-extrabold text-cyan-900 text-[11px]">3.3 Luaran Tridharma & Kemahasiswaan</h6>
                        <p className="text-[11px] text-slate-600 line-clamp-4 leading-relaxed">
                          {dl05.narasiBab33 || "(Narasi belum diisi)"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-1">
                      <h5 className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        Narasi Bab IV Penutup & Komitmen Peningkatan Mutu Berkelanjutan
                      </h5>
                      <p className="text-xs text-slate-700 leading-relaxed text-justify">
                        {dl05.penutup || "(Narasi belum diisi)"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-800 block">
                        Narasi Pengantar Bab I (Tindak Lanjut Rekomendasi Asesor):
                      </label>
                      <textarea
                        rows={3}
                        value={editingNarasiBab1}
                        onChange={(e) => setEditingNarasiBab1(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-800 block">
                        Narasi Pengantar Bab II (Kemajuan Implementasi Strategi Renstra):
                      </label>
                      <textarea
                        rows={3}
                        value={editingNarasiBab2}
                        onChange={(e) => setEditingNarasiBab2(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-800 block">
                        Narasi Pengantar Bab III (Evaluasi Kinerja Program Studi - Umum):
                      </label>
                      <textarea
                        rows={3}
                        value={editingNarasiBab3}
                        onChange={(e) => setEditingNarasiBab3(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-purple-900 block">
                          Narasi Bab 3.1 Jaminan Pembelajaran:
                        </label>
                        <textarea
                          rows={4}
                          value={editingNarasiBab31}
                          onChange={(e) => setEditingNarasiBab31(e.target.value)}
                          className="w-full p-2 border border-purple-300 rounded-xl text-xs bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-amber-900 block">
                          Narasi Bab 3.2 Kecukupan & Kualifikasi Dosen:
                        </label>
                        <textarea
                          rows={4}
                          value={editingNarasiBab32}
                          onChange={(e) => setEditingNarasiBab32(e.target.value)}
                          className="w-full p-2 border border-amber-300 rounded-xl text-xs bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black text-cyan-900 block">
                          Narasi Bab 3.3 Luaran Tridharma & Kemahasiswaan:
                        </label>
                        <textarea
                          rows={4}
                          value={editingNarasiBab33}
                          onChange={(e) => setEditingNarasiBab33(e.target.value)}
                          className="w-full p-2 border border-cyan-300 rounded-xl text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-emerald-950 block">
                        Narasi Bab IV Penutup & Komitmen Mutu:
                      </label>
                      <textarea
                        rows={3}
                        value={editingPenutup}
                        onChange={(e) => setEditingPenutup(e.target.value)}
                        className="w-full p-2.5 border border-emerald-300 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 6. KOLEKSI WAJIB: 1 SURAT REKOMENDASI RESMI LAMEMBA PER TAHUN (TAHUN 0 S.D 4) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Koleksi Wajib Arsip Fisik: 1 Dokumen Sah / Tahun (Zero Fake Green)</span>
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

                {/* 5 Cards Timeline (Tahun 0 s.d 4) */}
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

              {/* 7. PUSAT AKSI EKSPOR & CETAK BORANG LENGKAP DL-05 */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-lg space-y-4 border border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <Printer className="w-5 h-5 text-emerald-400" />
                      <span>Cetak Borang Lengkap DL-05 (1:1 Format Baku LAMEMBA)</span>
                    </h4>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Pratinjau mencakup Halaman Sampul Resmi dengan Logo, Identitas Pengusul, Tim Penyusun, Kata Pengantar, Daftar Isi, Narasi Antar-Bab, seluruh 13 tabel resmi borang (Rekomendasi Asesor, Strategi Renstra, CPL, Dosen, Kontribusi Intelektual, EWMP, Luaran Riset & PkM, Sitasi, Mahasiswa, Rekonsiliasi PD-Dikti) lengkap dengan lembar pengesahan 3 pihak.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPrintDl05ModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Buka Pratinjau & Cetak Borang</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
              className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <span>Pratinjau Dokumen Cetak • Borang Lengkap DL-05 LAMEMBA (Sesuai Format Resmi Word)</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / Simpan PDF</span>
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
              <div className="p-8 sm:p-12 overflow-y-auto space-y-12 bg-white text-slate-900 text-xs print:p-0 print:space-y-8">
                {/* Embedded Print CSS for true 1:1 page breaks and layout */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    @page {
                      size: A4 portrait;
                      margin: 20mm 20mm 20mm 20mm;
                    }
                    body {
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                    }
                    .page-break {
                      page-break-after: always;
                      break-after: page;
                    }
                  }
                `}} />

                {/* ========================================================
                    HALAMAN 1: SAMPUL DEPAN (HALAMAN MUKA) SESUAI TEMPLATE WORD
                    ======================================================== */}
                <div className="border-4 border-double border-slate-900 p-8 sm:p-12 min-h-[820px] flex flex-col justify-between items-center text-center page-break bg-white shadow-xs">
                  {/* Bagian Atas Sampul */}
                  <div className="space-y-3 max-w-xl">
                    <p className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">
                      LAMPIRAN DL-05 • INSTRUMEN RESMI LAMEMBA
                    </p>
                    <h2 className="text-base sm:text-lg font-black uppercase text-slate-950 tracking-tight leading-snug">
                      DOKUMEN PEMANTAUAN DAN EVALUASI TAHUN KE-{selectedDl05Year}
                      <br />
                      AKREDITASI PROGRAM STUDI
                    </h2>
                  </div>

                  {/* Lambang Perguruan Tinggi (Logo Resmi) */}
                  <div className="my-8 flex flex-col items-center space-y-3">
                    <div className="w-36 h-36 rounded-2xl p-2 flex items-center justify-center bg-white border border-slate-200 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dl05.identitasPengusul?.logoUrl || "/logo_stimi.png"}
                        alt="Lambang Perguruan Tinggi"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
                      LAMBANG PERGURUAN TINGGI
                    </span>
                  </div>

                  {/* Bagian Bawah Sampul */}
                  <div className="space-y-4 max-w-xl">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        PROGRAM STUDI:
                      </p>
                      <h3 className="text-base sm:text-lg font-black uppercase text-slate-950 tracking-tight">
                        {dl05.identitasPengusul?.namaProdi || dl05.prodiName}
                      </h3>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        PERGURUAN TINGGI:
                      </p>
                      <h4 className="text-sm sm:text-base font-black uppercase text-slate-900 tracking-tight">
                        {dl05.identitasPengusul?.perguruanTinggi || "SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI MAKASSAR"}
                      </h4>
                      <p className="text-xs font-semibold uppercase text-slate-600">
                        {dl05.identitasPengusul?.unitPengelola || "JURUSAN MANAJEMEN"}
                      </p>
                    </div>

                    <div className="pt-6 border-t-2 border-slate-900/80 space-y-1">
                      <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-950">
                        {dl05.identitasPengusul?.kota || "MAKASSAR"}
                      </p>
                      <p className="text-xs font-black text-slate-800">
                        TAHUN {dl05.identitasPengusul?.tahunDokumen || "2025"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ========================================================
                    HALAMAN 2: IDENTITAS PENGUSUL
                    ======================================================== */}
                <div className="space-y-6 pt-4 page-break">
                  <div className="text-center space-y-1 pb-3 border-b-2 border-slate-900">
                    <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">
                      IDENTITAS PENGUSUL
                    </h3>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      Dokumen Pemantauan dan Evaluasi Akreditasi Program Studi (LAMEMBA-DL-05)
                    </p>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 w-1/3 bg-slate-50">1. Perguruan Tinggi</td>
                        <td className="p-2.5 font-black text-slate-950">{dl05.identitasPengusul?.perguruanTinggi || "Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">2. Unit Pengelola Program Studi</td>
                        <td className="p-2.5 text-slate-900 font-semibold">{dl05.identitasPengusul?.unitPengelola || "Jurusan Manajemen / Sekolah Tinggi Ilmu Manajemen Indonesia"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">3. Jenis Program</td>
                        <td className="p-2.5 text-slate-900">{dl05.identitasPengusul?.jenisProgram || "Sarjana (S1)"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">4. Nama Program Studi</td>
                        <td className="p-2.5 font-black text-slate-950">{dl05.identitasPengusul?.namaProdi || "Program Studi Sarjana Manajemen"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">5. Alamat Kampus</td>
                        <td className="p-2.5 text-slate-900">{dl05.identitasPengusul?.alamat || "Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">6. Nomor Telepon</td>
                        <td className="p-2.5 font-mono text-slate-900">{dl05.identitasPengusul?.telepon || "0411-588123"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">7. E-mail dan Website</td>
                        <td className="p-2.5 font-mono text-slate-900">{dl05.identitasPengusul?.emailWeb || "info@stimiyapmi.ac.id / www.stimiyapmi.ac.id"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">8. Nomor SK Pendirian PT</td>
                        <td className="p-2.5 font-mono text-slate-900">{dl05.identitasPengusul?.nomorSkPendirianPt || "SK Mendikbud RI No. 042/D/O/1997"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">9. Tanggal SK Pendirian PT</td>
                        <td className="p-2.5 text-slate-900">{dl05.identitasPengusul?.tanggalSkPendirianPt || "1997-07-25"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">10. Pejabat Penandatangan SK Pendirian PT</td>
                        <td className="p-2.5 text-slate-900">{dl05.identitasPengusul?.pejabatSkPendirianPt || "Menteri Pendidikan dan Kebudayaan RI"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">11. Nomor SK Pembukaan PS</td>
                        <td className="p-2.5 font-mono text-slate-900">{dl05.identitasPengusul?.nomorSkPembukaanPs || "SK Dirjen Dikti No. 219/DIKTI/Kep/1999"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">12. Tanggal SK Pembukaan PS</td>
                        <td className="p-2.5 text-slate-900">{dl05.identitasPengusul?.tanggalSkPembukaanPs || "1999-05-18"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">13. Pejabat Penandatangan SK Pembukaan PS</td>
                        <td className="p-2.5 text-slate-900">{dl05.identitasPengusul?.pejabatSkPembukaanPs || "Direktur Jenderal Pendidikan Tinggi"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">14. Tahun Pertama Kali Menerima Mahasiswa</td>
                        <td className="p-2.5 font-black text-slate-950">{dl05.identitasPengusul?.tahunPertamaMenerimaMhs || "1998"}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">15. Peringkat Terbaru Akreditasi PS</td>
                        <td className="p-2.5 text-slate-950 font-black">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-black">
                            {dl05.identitasPengusul?.peringkatAkreditasiTerbaru || "Baik Sekali"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border-r border-slate-300 p-2.5 font-bold text-slate-700 bg-slate-50">16. Nomor SK LAMEMBA & Masa Berlaku</td>
                        <td className="p-2.5 text-slate-900 font-mono text-[11px]">
                          <strong>{dl05.identitasPengusul?.nomorSkLam || "SK LAMEMBA No. 933/DE/A.5/AR.10/XII/2023"}</strong> (Berlaku s.d {dl05.identitasPengusul?.tanggalKadaluarsa || "2028-12-28"})
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ========================================================
                    HALAMAN 3: IDENTITAS TIM PENYUSUN DOKUMEN EVALUASI DIRI
                    ======================================================== */}
                <div className="space-y-6 pt-4 page-break">
                  <div className="text-center space-y-1 pb-3 border-b-2 border-slate-900">
                    <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">
                      IDENTITAS TIM PENYUSUN DOKUMEN EVALUASI DIRI
                    </h3>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      Tim Taskforce Pemantauan dan Evaluasi Akreditasi Program Studi (DL-05)
                    </p>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 p-2.5 text-center w-8">No</th>
                        <th className="border border-slate-300 p-2.5 text-left">Nama Lengkap</th>
                        <th className="border border-slate-300 p-2.5 text-left">NIK / NIDN</th>
                        <th className="border border-slate-300 p-2.5 text-left">Jabatan Struktural</th>
                        <th className="border border-slate-300 p-2.5 text-left">Peran dalam Tim</th>
                        <th className="border border-slate-300 p-2.5 text-center w-28">Tanda Tangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dl05.timPenyusun || []).map((tp, idx) => (
                        <tr key={idx} className="align-middle">
                          <td className="border border-slate-300 p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="border border-slate-300 p-2.5 font-bold text-slate-950">{tp.nama}</td>
                          <td className="border border-slate-300 p-2.5 font-mono text-[10px] text-slate-700">{tp.nikNidn}</td>
                          <td className="border border-slate-300 p-2.5 text-slate-800">{tp.jabatan}</td>
                          <td className="border border-slate-300 p-2.5 font-semibold text-slate-900">{tp.peran}</td>
                          <td className="border border-slate-300 p-2.5 text-center h-12">
                            <span className="text-[9px] text-slate-300 block border-b border-dotted border-slate-400 mt-6 mx-2"></span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ========================================================
                    HALAMAN 4: KATA PENGANTAR
                    ======================================================== */}
                <div className="space-y-6 pt-4 page-break">
                  <div className="text-center space-y-1 pb-3 border-b-2 border-slate-900">
                    <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">
                      KATA PENGANTAR
                    </h3>
                  </div>

                  <div className="text-justify leading-relaxed space-y-4 text-xs text-slate-800 whitespace-pre-line px-2">
                    {dl05.kataPengantar || "(Kata Pengantar belum diisi)"}
                  </div>

                  <div className="pt-8 flex justify-end">
                    <div className="text-center space-y-16 w-64 text-xs">
                      <p>
                        {dl05.identitasPengusul?.kota || "Makassar"},{" "}
                        {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                        <br />
                        <strong>Ketua Tim Taskforce DL-05,</strong>
                      </p>
                      <div>
                        <p className="font-black underline underline-offset-4">
                          {(dl05.timPenyusun && dl05.timPenyusun[0]?.nama) || "Drs. H. M. Said, M.Si"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {(dl05.timPenyusun && dl05.timPenyusun[0]?.nikNidn) || "NIDN. 0918077501"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========================================================
                    HALAMAN 5: DAFTAR ISI
                    ======================================================== */}
                <div className="space-y-6 pt-4 page-break">
                  <div className="text-center space-y-1 pb-3 border-b-2 border-slate-900">
                    <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">
                      DAFTAR ISI
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs text-slate-900 px-2">
                    <div className="flex items-end justify-between font-bold">
                      <span>HALAMAN MUKA (SAMPUL DEPAN)</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-2 mb-1"></span>
                      <span className="font-mono">i</span>
                    </div>
                    <div className="flex items-end justify-between font-bold">
                      <span>IDENTITAS PENGUSUL</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-2 mb-1"></span>
                      <span className="font-mono">ii</span>
                    </div>
                    <div className="flex items-end justify-between font-bold">
                      <span>IDENTITAS TIM PENYUSUN DOKUMEN EVALUASI DIRI</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-2 mb-1"></span>
                      <span className="font-mono">iii</span>
                    </div>
                    <div className="flex items-end justify-between font-bold">
                      <span>KATA PENGANTAR</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-2 mb-1"></span>
                      <span className="font-mono">iv</span>
                    </div>
                    <div className="flex items-end justify-between font-bold">
                      <span>DAFTAR ISI</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-2 mb-1"></span>
                      <span className="font-mono">v</span>
                    </div>

                    <div className="pt-3 flex items-end justify-between font-black text-slate-950">
                      <span>BAB I TINDAK LANJUT REKOMENDASI ASESOR</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-2 mb-1"></span>
                      <span className="font-mono">1</span>
                    </div>
                    <div className="pl-4 flex items-end justify-between text-slate-700">
                      <span>Tabel 1.1 Tindak Lanjut Rekomendasi Asesor</span>
                      <span className="flex-1 border-b border-dotted border-slate-300 mx-2 mb-1"></span>
                      <span className="font-mono">1</span>
                    </div>

                    <div className="pt-3 flex items-end justify-between font-black text-slate-950">
                      <span>BAB II KEMAJUAN IMPLEMENTASI STRATEGI</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-2 mb-1"></span>
                      <span className="font-mono">2</span>
                    </div>
                    <div className="pl-4 flex items-end justify-between text-slate-700">
                      <span>Tabel 2.1 Kemajuan Implementasi Strategi</span>
                      <span className="flex-1 border-b border-dotted border-slate-300 mx-2 mb-1"></span>
                      <span className="font-mono">2</span>
                    </div>

                    <div className="pt-3 flex items-end justify-between font-black text-slate-950">
                      <span>BAB III EVALUASI KINERJA PROGRAM STUDI</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-2 mb-1"></span>
                      <span className="font-mono">3</span>
                    </div>
                    <div className="pl-4 flex items-end justify-between font-bold text-slate-800">
                      <span>3.1 Jaminan Pembelajaran</span>
                      <span className="flex-1 border-b border-dotted border-slate-300 mx-2 mb-1"></span>
                      <span className="font-mono">3</span>
                    </div>
                    <div className="pl-8 flex items-end justify-between text-slate-600 text-[11px]">
                      <span>Tabel 3.1.1 Jaminan Pembelajaran</span>
                      <span className="flex-1 border-b border-dotted border-slate-200 mx-2 mb-1"></span>
                      <span className="font-mono">3</span>
                    </div>

                    <div className="pl-4 flex items-end justify-between font-bold text-slate-800">
                      <span>3.2 Kecukupan Dan Kualifikasi Dosen</span>
                      <span className="flex-1 border-b border-dotted border-slate-300 mx-2 mb-1"></span>
                      <span className="font-mono">4</span>
                    </div>
                    <div className="pl-8 flex items-end justify-between text-slate-600 text-[11px]">
                      <span>Tabel 3.2.1 Profil Dosen Berdasarkan Status Kepegawaian</span>
                      <span className="flex-1 border-b border-dotted border-slate-200 mx-2 mb-1"></span>
                      <span className="font-mono">4</span>
                    </div>
                    <div className="pl-8 flex items-end justify-between text-slate-600 text-[11px]">
                      <span>Tabel 3.2.3 Latar Belakang Keahlian Dosen & BNSP</span>
                      <span className="flex-1 border-b border-dotted border-slate-200 mx-2 mb-1"></span>
                      <span className="font-mono">4</span>
                    </div>
                    <div className="pl-8 flex items-end justify-between text-slate-600 text-[11px]">
                      <span>Tabel 3.2.5 Kontribusi Intelektual Dosen (4 Bidang Rekognisi)</span>
                      <span className="flex-1 border-b border-dotted border-slate-200 mx-2 mb-1"></span>
                      <span className="font-mono">5</span>
                    </div>
                    <div className="pl-8 flex items-end justify-between text-slate-600 text-[11px]">
                      <span>Tabel 3.2.7 Beban Kerja Dosen (EWMP SKS)</span>
                      <span className="flex-1 border-b border-dotted border-slate-200 mx-2 mb-1"></span>
                      <span className="font-mono">5</span>
                    </div>

                    <div className="pl-4 flex items-end justify-between font-bold text-slate-800">
                      <span>3.3 Luaran Dan Capaian Tridharma</span>
                      <span className="flex-1 border-b border-dotted border-slate-300 mx-2 mb-1"></span>
                      <span className="font-mono">6</span>
                    </div>
                    <div className="pl-8 flex items-end justify-between text-slate-600 text-[11px]">
                      <span>Tabel 3.3.1 s.d 3.3.3 Luaran Penelitian dan PkM Dosen</span>
                      <span className="flex-1 border-b border-dotted border-slate-200 mx-2 mb-1"></span>
                      <span className="font-mono">6</span>
                    </div>
                    <div className="pl-8 flex items-end justify-between text-slate-600 text-[11px]">
                      <span>Tabel 3.3.5 Sitasi Dosen</span>
                      <span className="flex-1 border-b border-dotted border-slate-200 mx-2 mb-1"></span>
                      <span className="font-mono">6</span>
                    </div>
                    <div className="pl-8 flex items-end justify-between text-slate-600 text-[11px]">
                      <span>Tabel 3.3.7 Luaran yang Dihasilkan Mahasiswa</span>
                      <span className="flex-1 border-b border-dotted border-slate-200 mx-2 mb-1"></span>
                      <span className="font-mono">7</span>
                    </div>
                    <div className="pl-8 flex items-end justify-between text-slate-600 text-[11px]">
                      <span>Tabel 3.3.9 Jumlah Mahasiswa Aktif & Rekonsiliasi PD-Dikti</span>
                      <span className="flex-1 border-b border-dotted border-slate-200 mx-2 mb-1"></span>
                      <span className="font-mono">7</span>
                    </div>

                    <div className="pt-3 flex items-end justify-between font-black text-slate-950">
                      <span>BAB IV PENUTUP & LEMBAR PENGESAHAN 3 PIHAK</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-2 mb-1"></span>
                      <span className="font-mono">8</span>
                    </div>

                    <div className="pt-1 flex items-end justify-between font-black text-emerald-900">
                      <span>LAMPIRAN: KOLEKSI ARSIP SURAT REKOMENDASI RESMI LAMEMBA (THN 0 S.D 4)</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-2 mb-1"></span>
                      <span className="font-mono">9</span>
                    </div>
                  </div>
                </div>

                {/* ========================================================
                    BAB I: TINDAK LANJUT REKOMENDASI ASESOR
                    ======================================================== */}
                <div className="space-y-4 pt-4 page-break">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">
                      BAB I TINDAK LANJUT REKOMENDASI ASESOR
                    </h3>
                    <p className="text-justify leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {dl05.narasiBab1 || "Bagian ini memuat penjelasan program studi atas tindak lanjut rekomendasi untuk perbaikan berkelanjutan yang telah disampaikan asesor saat asesmen lapangan, hambatan yang dihadapi, serta solusi dan hasil yang diperoleh."}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-slate-900">
                      Tabel 1.1 Tindak Lanjut Rekomendasi Asesor
                    </h4>
                    <table className="w-full border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800">
                          <th className="border border-slate-300 p-2 text-center w-8">No</th>
                          <th className="border border-slate-300 p-2 text-left w-1/4">Rekomendasi Asesor</th>
                          <th className="border border-slate-300 p-2 text-left">Usaha Dilakukan</th>
                          <th className="border border-slate-300 p-2 text-left">Hambatan</th>
                          <th className="border border-slate-300 p-2 text-left">Tindakan CQI</th>
                          <th className="border border-slate-300 p-2 text-left">Hasil Dicapai</th>
                          <th className="border border-slate-300 p-2 text-center w-16">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.assessorFollowUpsList || []).map((item) => (
                          <tr key={item.recommendationNo} className="align-top">
                            <td className="border border-slate-300 p-1.5 text-center font-bold">{item.recommendationNo}</td>
                            <td className="border border-slate-300 p-1.5 font-bold">{item.recommendation}</td>
                            <td className="border border-slate-300 p-1.5">{item.actionTaken}</td>
                            <td className="border border-slate-300 p-1.5">{item.obstacle || "-"}</td>
                            <td className="border border-slate-300 p-1.5">{item.cqiSolution || "-"}</td>
                            <td className="border border-slate-300 p-1.5 font-semibold text-emerald-900">{item.achievement}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold">{item.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ========================================================
                    BAB II: KEMAJUAN IMPLEMENTASI STRATEGI
                    ======================================================== */}
                <div className="space-y-4 pt-4 page-break">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">
                      BAB II KEMAJUAN IMPLEMENTASI STRATEGI
                    </h3>
                    <p className="text-justify leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {dl05.narasiBab2 || "Bagian ini memuat penjelasan program studi tentang capaian implementasi strategi yang tercantum pada Rencana Strategis atau dokumen strategis lainnya, termasuk hambatan dan solusi yang telah dilakukan untuk mencapai visi, misi, tujuan dan strategi."}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-slate-900">
                      Tabel 2.1 Kemajuan Implementasi Strategi
                    </h4>
                    <table className="w-full border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800">
                          <th className="border border-slate-300 p-2 text-center w-8">No</th>
                          <th className="border border-slate-300 p-2 text-left w-1/4">Sasaran Strategis & Target Renstra</th>
                          <th className="border border-slate-300 p-2 text-left">Implementasi / Usaha Dilakukan</th>
                          <th className="border border-slate-300 p-2 text-left">Hambatan</th>
                          <th className="border border-slate-300 p-2 text-left">Tindakan CQI</th>
                          <th className="border border-slate-300 p-2 text-left">Hasil Dicapai</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.renstraProgressList || []).map((item, idx) => (
                          <tr key={idx} className="align-top">
                            <td className="border border-slate-300 p-1.5 text-center font-bold">{idx + 1}</td>
                            <td className="border border-slate-300 p-1.5 font-bold">{item.strategy}</td>
                            <td className="border border-slate-300 p-1.5">{item.actionTaken}</td>
                            <td className="border border-slate-300 p-1.5">{item.obstacle || "-"}</td>
                            <td className="border border-slate-300 p-1.5">{item.cqiSolution || "-"}</td>
                            <td className="border border-slate-300 p-1.5 font-semibold text-emerald-900">{item.achievement}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ========================================================
                    BAB III: EVALUASI KINERJA PROGRAM STUDI
                    ======================================================== */}
                <div className="space-y-6 pt-4 page-break">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">
                      BAB III EVALUASI KINERJA PROGRAM STUDI
                    </h3>
                    <p className="text-justify leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {dl05.narasiBab3 || "Bagian ini memuat evaluasi pelaksanaan upaya perbaikan berkelanjutan baik perkembangan atau kemajuan yang terjadi pada program studi setiap tahunnya dari 3 (tiga) indikator: (1) Jaminan Pembelajaran, (2) Kecukupan dan Kualifikasi Dosen, dan (3) Luaran dan Capaian Tridharma."}
                    </p>
                  </div>

                  {/* 3.1 Jaminan Pembelajaran */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase">
                      3.1 Jaminan Pembelajaran
                    </h4>
                    <p className="text-justify leading-relaxed text-slate-700 text-[11px]">
                      {dl05.narasiBab31 || "Program studi menunjukkan perbaikan-perbaikan yang dilakukan terhadap pencapaian CPL mahasiswa berdasarkan kriteria enam butir 1-4."}
                    </p>

                    <h5 className="text-[11px] font-bold text-slate-900">
                      Tabel 3.1.1 Jaminan Pembelajaran
                    </h5>
                    <table className="w-full border-collapse border border-slate-300 text-[11px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800">
                          <th className="border border-slate-300 p-2 text-center w-8">No</th>
                          <th className="border border-slate-300 p-2 text-left w-1/3">Indikator Jaminan Pembelajaran</th>
                          <th className="border border-slate-300 p-2 text-left">Upaya yang Dilakukan (Tahun Ke-{selectedDl05Year})</th>
                          <th className="border border-slate-300 p-2 text-left">Hasil yang Dicapai (Tahun Ke-{selectedDl05Year})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.learningAssuranceItems || []).map((item) => (
                          <tr key={item.nomor} className="align-top">
                            <td className="border border-slate-300 p-2 text-center font-bold">{item.nomor}</td>
                            <td className="border border-slate-300 p-2">{item.indikator}</td>
                            <td className="border border-slate-300 p-2">
                              {selectedDl05Year === 1 ? item.upayaTahun1 : selectedDl05Year === 2 ? item.upayaTahun2 : selectedDl05Year === 3 ? item.upayaTahun3 : item.upayaTahun4 || "-"}
                            </td>
                            <td className="border border-slate-300 p-2 font-semibold">
                              {selectedDl05Year === 1 ? item.hasilTahun1 : selectedDl05Year === 2 ? item.hasilTahun2 : selectedDl05Year === 3 ? item.hasilTahun3 : item.hasilTahun4 || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {dl05.perbaikanBerkelanjutanJaminanPembelajaran && (
                      <p className="text-[10px] text-slate-600 italic pt-1 border-l-2 border-purple-500 pl-2">
                        <strong>Catatan CQI Jaminan Pembelajaran:</strong> {dl05.perbaikanBerkelanjutanJaminanPembelajaran}
                      </p>
                    )}
                  </div>

                  {/* 3.2 Kecukupan Dan Kualifikasi Dosen */}
                  <div className="space-y-3 pt-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase">
                      3.2 Kecukupan Dan Kualifikasi Dosen
                    </h4>
                    <p className="text-justify leading-relaxed text-slate-700 text-[11px]">
                      {dl05.narasiBab32 || "Bagian ini melampirkan pembaharuan data dosen tetap dengan menggunakan data yang berasal dari Dokumen Kinerja Program Studi (DKPS) terakhir dan data PD-Dikti."}
                    </p>

                    {/* Tabel 3.2.1 Status Kepegawaian */}
                    <h5 className="text-[11px] font-bold text-slate-900">
                      Tabel 3.2.1 Profil Dosen Berdasarkan Status Kepegawaian
                    </h5>
                    <table className="w-full border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800">
                          <th className="border border-slate-300 p-1.5 text-left">Nama Dosen</th>
                          <th className="border border-slate-300 p-1.5 text-center">Status</th>
                          <th className="border border-slate-300 p-1.5 text-center">NIDN</th>
                          <th className="border border-slate-300 p-1.5 text-left">Jabatan</th>
                          <th className="border border-slate-300 p-1.5 text-center">Jalur</th>
                          <th className="border border-slate-300 p-1.5 text-left">Perusahaan Asal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.dosenProfiles || []).map((d, idx) => (
                          <tr key={idx} className="align-middle">
                            <td className="border border-slate-300 p-1.5 font-bold">{d.name}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{d.status}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-mono">{d.nidn}</td>
                            <td className="border border-slate-300 p-1.5">{d.jabatanAkademik}</td>
                            <td className="border border-slate-300 p-1.5 text-center">{d.jalur}</td>
                            <td className="border border-slate-300 p-1.5">{d.namaPerusahaan || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Tabel 3.2.3 Latar Belakang Keahlian & BNSP */}
                    <h5 className="text-[11px] font-bold text-slate-900 pt-2">
                      Tabel 3.2.3 Latar Belakang Keahlian Dosen & BNSP
                    </h5>
                    <table className="w-full border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800">
                          <th className="border border-slate-300 p-1.5 text-left">Nama Dosen</th>
                          <th className="border border-slate-300 p-1.5 text-left">S2 (Magister)</th>
                          <th className="border border-slate-300 p-1.5 text-left">S3 (Doktor)</th>
                          <th className="border border-slate-300 p-1.5 text-left">Bidang Keahlian</th>
                          <th className="border border-slate-300 p-1.5 text-center">Serdos</th>
                          <th className="border border-slate-300 p-1.5 text-left">Sertifikat Profesi BNSP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.dosenExpertise || []).map((exp, idx) => (
                          <tr key={idx} className="align-middle">
                            <td className="border border-slate-300 p-1.5 font-bold">{exp.name}</td>
                            <td className="border border-slate-300 p-1.5">{exp.magister}</td>
                            <td className="border border-slate-300 p-1.5">{exp.doktor || "-"}</td>
                            <td className="border border-slate-300 p-1.5">{exp.bidangKeahlian}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-mono">{exp.serdos || "-"}</td>
                            <td className="border border-slate-300 p-1.5 font-semibold text-emerald-900">{exp.sertifikatProfesi || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Tabel 3.2.7 EWMP */}
                    <h5 className="text-[11px] font-bold text-slate-900 pt-2">
                      Tabel 3.2.7 Beban Kerja Dosen (EWMP SKS)
                    </h5>
                    <table className="w-full border-collapse border border-slate-300 text-[10px] text-center">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800">
                          <th className="border border-slate-300 p-1.5 text-left">Nama Dosen</th>
                          <th className="border border-slate-300 p-1.5">PS Sendiri</th>
                          <th className="border border-slate-300 p-1.5">PS Lain PT</th>
                          <th className="border border-slate-300 p-1.5">Luar PT</th>
                          <th className="border border-slate-300 p-1.5">Riset</th>
                          <th className="border border-slate-300 p-1.5">PkM</th>
                          <th className="border border-slate-300 p-1.5">Tugas Tambahan</th>
                          <th className="border border-slate-300 p-1.5 font-bold bg-slate-200">Total SKS</th>
                          <th className="border border-slate-300 p-1.5">Kepatuhan SN-Dikti</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.ewmpList || []).map((ewmp, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-300 p-1.5 text-left font-bold">{ewmp.name}</td>
                            <td className="border border-slate-300 p-1.5">{ewmp.psAkreditasiSks}</td>
                            <td className="border border-slate-300 p-1.5">{ewmp.psLainDalamPtSks}</td>
                            <td className="border border-slate-300 p-1.5">{ewmp.psLainLuarPtSks}</td>
                            <td className="border border-slate-300 p-1.5">{ewmp.penelitianSks}</td>
                            <td className="border border-slate-300 p-1.5">{ewmp.pkmSks}</td>
                            <td className="border border-slate-300 p-1.5">{ewmp.tugasTambahanSks}</td>
                            <td className="border border-slate-300 p-1.5 font-bold bg-slate-100">{ewmp.totalSks} SKS</td>
                            <td className="border border-slate-300 p-1.5 font-bold">
                              {ewmp.totalSks >= 12 && ewmp.totalSks <= 16 ? "MEMENUHI (12-16 SKS)" : "PENYESUAIAN"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {dl05.perbaikanBerkelanjutanDosen && (
                      <p className="text-[10px] text-slate-600 italic pt-1 border-l-2 border-amber-500 pl-2">
                        <strong>Catatan CQI Dosen:</strong> {dl05.perbaikanBerkelanjutanDosen}
                      </p>
                    )}
                  </div>

                  {/* 3.3 Luaran Dan Capaian Tridharma */}
                  <div className="space-y-3 pt-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase">
                      3.3 Luaran Dan Capaian Tridharma
                    </h4>
                    <p className="text-justify leading-relaxed text-slate-700 text-[11px]">
                      {dl05.narasiBab33 || "Bagian ini memuat pembaruan produktivitas tridharma dosen dan mahasiswa yang mencakup luaran riset dan PkM, sitasi karya ilmiah, prestasi mahasiswa, dan rekonsiliasi data mahasiswa aktif terhadap feeder PD-Dikti."}
                    </p>

                    {/* Tabel 3.3.1 Luaran Riset & PkM */}
                    <h5 className="text-[11px] font-bold text-slate-900">
                      Tabel 3.3.1 s.d 3.3.3 Luaran Penelitian dan PkM Dosen
                    </h5>
                    <table className="w-full border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800">
                          <th className="border border-slate-300 p-1.5 text-center w-8">No</th>
                          <th className="border border-slate-300 p-1.5 text-left">Judul Luaran Riset / PkM</th>
                          <th className="border border-slate-300 p-1.5 text-center w-12">Tahun</th>
                          <th className="border border-slate-300 p-1.5 text-left">Jenis Luaran</th>
                          <th className="border border-slate-300 p-1.5 text-center">Sumber Biaya</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.researchOutcomes || []).map((res, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                            <td className="border border-slate-300 p-1.5 font-bold">{res.judul}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-mono">{res.tahun}</td>
                            <td className="border border-slate-300 p-1.5">{res.jenisLuaran}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-semibold">
                              {res.sumberBiayaPtMandiri ? "PT / Mandiri" : res.sumberBiayaLuarPt ? "Luar PT / DRTPM" : "Luar Negeri"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Tabel 3.3.5 Sitasi Dosen */}
                    <h5 className="text-[11px] font-bold text-slate-900 pt-2">
                      Tabel 3.3.5 Sitasi Dosen
                    </h5>
                    <table className="w-full border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800">
                          <th className="border border-slate-300 p-1.5 text-left">Judul Artikel Disitasi</th>
                          <th className="border border-slate-300 p-1.5 text-left">Penulis</th>
                          <th className="border border-slate-300 p-1.5 text-center">TS-2</th>
                          <th className="border border-slate-300 p-1.5 text-center">TS-1</th>
                          <th className="border border-slate-300 p-1.5 text-center">TS</th>
                          <th className="border border-slate-300 p-1.5 text-center font-bold bg-slate-200">Total Sitasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.citationsList || []).map((cite, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-300 p-1.5 font-bold">{cite.judulArtikel}</td>
                            <td className="border border-slate-300 p-1.5">{cite.penulis}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-mono">{cite.sitasiTs2}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-mono">{cite.sitasiTs1}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-mono">{cite.sitasiTs}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-bold bg-slate-100">
                              {(cite.sitasiTs2 || 0) + (cite.sitasiTs1 || 0) + (cite.sitasiTs || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Tabel 3.3.7 Luaran Mahasiswa */}
                    <h5 className="text-[11px] font-bold text-slate-900 pt-2">
                      Tabel 3.3.7 Luaran yang Dihasilkan Mahasiswa
                    </h5>
                    <table className="w-full border-collapse border border-slate-300 text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800">
                          <th className="border border-slate-300 p-1.5 text-center w-8">No</th>
                          <th className="border border-slate-300 p-1.5 text-left">Judul Luaran / Prestasi Mahasiswa</th>
                          <th className="border border-slate-300 p-1.5 text-center w-12">Tahun</th>
                          <th className="border border-slate-300 p-1.5 text-left">Nama Mahasiswa</th>
                          <th className="border border-slate-300 p-1.5 text-left">Jenis Luaran</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.studentOutcomes || []).map((so, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                            <td className="border border-slate-300 p-1.5 font-bold">{so.judulLuaran}</td>
                            <td className="border border-slate-300 p-1.5 text-center font-mono">{so.tahun}</td>
                            <td className="border border-slate-300 p-1.5">{so.namaMahasiswa}</td>
                            <td className="border border-slate-300 p-1.5">{so.jenisLuaran}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Tabel 3.3.9 Rekonsiliasi PD-Dikti */}
                    <h5 className="text-[11px] font-bold text-slate-900 pt-2">
                      Tabel 3.3.9 Jumlah Mahasiswa Aktif & Rekonsiliasi PD-Dikti
                    </h5>
                    <table className="w-full border-collapse border border-slate-300 text-[11px] text-center">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800">
                          <th className="border border-slate-300 p-2 text-left">Semester</th>
                          <th className="border border-slate-300 p-2">Mhs Aktif Kampus</th>
                          <th className="border border-slate-300 p-2">Terdaftar PD-Dikti</th>
                          <th className="border border-slate-300 p-2">Selisih</th>
                          <th className="border border-slate-300 p-2">Validitas Data Feeder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dl05.mahasiswaAktifList || []).map((m, idx) => (
                          <tr key={idx}>
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
                    {(dl05.perbaikanBerkelanjutanTridharma || dl05.perbaikanBerkelanjutanKemahasiswaan) && (
                      <div className="space-y-1 pt-1">
                        {dl05.perbaikanBerkelanjutanTridharma && (
                          <p className="text-[10px] text-slate-600 italic border-l-2 border-sky-500 pl-2">
                            <strong>Catatan CQI Tridharma:</strong> {dl05.perbaikanBerkelanjutanTridharma}
                          </p>
                        )}
                        {dl05.perbaikanBerkelanjutanKemahasiswaan && (
                          <p className="text-[10px] text-slate-600 italic border-l-2 border-cyan-500 pl-2">
                            <strong>Catatan CQI Kemahasiswaan:</strong> {dl05.perbaikanBerkelanjutanKemahasiswaan}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ========================================================
                    BAB IV: PENUTUP DAN LEMBAR PENGESAHAN 3 PIHAK
                    ======================================================== */}
                <div className="space-y-6 pt-4 page-break">
                  <div className="space-y-1 pb-3 border-b-2 border-slate-900">
                    <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">
                      BAB IV PENUTUP DAN KOMITMEN MUTU
                    </h3>
                  </div>

                  <div className="text-justify leading-relaxed space-y-4 text-xs text-slate-800 whitespace-pre-line px-2">
                    {dl05.penutup || "Dokumen Pemantauan dan Evaluasi Tahunan Akreditasi Program Studi (Lampiran DL-05) ini merefleksikan transparansi dan komitmen terpadu seluruh sivitas akademika dalam menjaga mutu tridharma perguruan tinggi."}
                  </div>

                  {/* Lembar Pengesahan 3 Pihak Resmi */}
                  <div className="pt-8 space-y-6">
                    <p className="text-center font-bold text-xs uppercase tracking-wider text-slate-900">
                      LEMBAR PENGESAHAN EVALUASI DIRI TAHUNAN AKREDITASI (DL-05)
                    </p>

                    <div className="flex justify-end text-[11px] font-semibold text-slate-800 pr-2">
                      <p>
                        {dl05.lembarPengesahan?.kota || "Makassar"},{" "}
                        {dl05.lembarPengesahan?.tanggal || "15 Januari 2026"}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2 text-center text-[11px]">
                      <div className="space-y-16">
                        <p>
                          Disusun oleh,
                          <br />
                          <strong>
                            {dl05.lembarPengesahan?.kaprodi?.jabatan || "Ketua Program Studi S1 Manajemen"}
                          </strong>
                        </p>
                        <div>
                          <p className="font-black underline underline-offset-4">
                            {dl05.lembarPengesahan?.kaprodi?.nama ||
                              (dl05.timPenyusun && dl05.timPenyusun[0]?.nama) ||
                              "Drs. H. M. Said, M.Si"}
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono">
                            {dl05.lembarPengesahan?.kaprodi?.nikNidn ||
                              (dl05.timPenyusun && dl05.timPenyusun[0]?.nikNidn) ||
                              "NIDN. 0918077501"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-16">
                        <p>
                          Diverifikasi oleh,
                          <br />
                          <strong>
                            {dl05.lembarPengesahan?.ketuaLpm?.jabatan || "Ketua Lembaga Penjaminan Mutu"}
                          </strong>
                        </p>
                        <div>
                          <p className="font-black underline underline-offset-4">
                            {dl05.lembarPengesahan?.ketuaLpm?.nama || "Dr. Nurul Fadilah, SE., MM"}
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono">
                            {dl05.lembarPengesahan?.ketuaLpm?.nikNidn || "NIDN. 0915088201"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-16">
                        <p>
                          Mengetahui & Menyetujui,
                          <br />
                          <strong>
                            {dl05.lembarPengesahan?.ketuaPt?.jabatan || "Ketua STIMI YAPMI Makassar"}
                          </strong>
                        </p>
                        <div>
                          <p className="font-black underline underline-offset-4">
                            {dl05.lembarPengesahan?.ketuaPt?.nama || "Dr. Ibrahim Syah, S.E., M.M."}
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono">
                            {dl05.lembarPengesahan?.ketuaPt?.nikNidn || "NIDN. 0920037601"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========================================================
                    LAMPIRAN: REKAP ARSIP SURAT REKOMENDASI RESMI LAMEMBA
                    ======================================================== */}
                <div className="space-y-4 pt-4">
                  <div className="space-y-1 pb-3 border-b-2 border-slate-900">
                    <h3 className="text-sm font-black uppercase text-slate-950 tracking-wider">
                      LAMPIRAN: ARSIP SURAT REKOMENDASI RESMI DEWAN EKSEKUTIF LAMEMBA
                    </h3>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      Koleksi Wajib 1 Surat Rekomendasi/Keputusan Resmi per Tahun (Tahun 0 s.d 4)
                    </p>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 p-2 text-center w-8">No</th>
                        <th className="border border-slate-300 p-2 text-left">Siklus Pemantauan</th>
                        <th className="border border-slate-300 p-2 text-left">Nomor Surat / Keputusan Resmi</th>
                        <th className="border border-slate-300 p-2 text-center w-28">Tanggal Surat</th>
                        <th className="border border-slate-300 p-2 text-center w-28">Status Berkas Fisik</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dl05.annualLetters || []).map((letter, idx) => (
                        <tr key={idx} className="align-middle">
                          <td className="border border-slate-300 p-2 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="border border-slate-300 p-2 font-bold text-slate-900">{letter.yearLabel}</td>
                          <td className="border border-slate-300 p-2 font-mono text-slate-700">{letter.letterNumber || "-"}</td>
                          <td className="border border-slate-300 p-2 text-center text-slate-600">
                            {letter.letterDate ? new Date(letter.letterDate).toLocaleDateString("id-ID") : "-"}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {letter.fileUrl ? (
                              <span className="text-emerald-700">🟢 TERUNGGAH (SAH)</span>
                            ) : (
                              <span className="text-rose-600">🔴 BELUM ADA</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
