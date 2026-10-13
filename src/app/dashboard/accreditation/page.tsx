"use client";

import { useState, useEffect } from "react";
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
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

interface IDl05 {
  _id: string;
  academicYear: string;
  prodiName: string;
  submissionDate: string;
  status: string;
  assessorFollowUps: Array<{
    recommendation: string;
    actionTaken: string;
    status: "SELESAI" | "SEDANG_BERJALAN" | "BELUM";
    evidenceUrl?: string;
  }>;
  renstraProgress: Array<{
    targetName: string;
    achievement: string;
    obstacle: string;
    cqiSolution: string;
  }>;
  learningAssurance: {
    cplAchievementPercentage: number;
    obeRpsPercentage: number;
    description: string;
  };
  facultySufficiency: {
    permanentFacultyCount: number;
    doctoralPercentage: number;
    lektorHeadPercentage: number;
    facultyStudentRatio: string;
    description: string;
  };
  tridharmaOutcomes: {
    gpaAverage: number;
    avgStudyDurationMonths: number;
    tracerStudyResponseRate: number;
    waitingTimeMonths: number;
    publicationsCount: number;
    description: string;
  };
}

export default function AccreditationDashboardPage() {
  const [activeTab, setActiveTab] = useState<"profiles" | "criteria" | "dl05">("profiles");

  // Data states
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [criteria, setCriteria] = useState<ICriteria[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [predictedGrade, setPredictedGrade] = useState<string>("BAIK_SEKALI");
  const [dl05, setDl05] = useState<IDl05 | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPrintDl05ModalOpen, setIsPrintDl05ModalOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [profilesRes, criteriaRes, dl05Res] = await Promise.all([
          fetch("/api/accreditation/profiles"),
          fetch("/api/accreditation/criteria"),
          fetch("/api/accreditation/dl05"),
        ]);

        const pData = await profilesRes.json();
        const cData = await criteriaRes.json();
        const dData = await dl05Res.json();

        if (!ignore) {
          if (pData.success) setProfiles(pData.data);
          if (cData.success) {
            setCriteria(cData.data.criteria);
            setOverallScore(cData.data.finalWeightedScore);
            setPredictedGrade(cData.data.predictedGrade);
          }
          if (dData.success) setDl05(dData.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load accreditation data:", err);
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

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
            Sistem pemantauan status akreditasi BAN-PT & LAMEMBA, evaluasi 9 Kriteria baku, dan penyusunan instrumen pemantauan tahunan pasca-akreditasi sesuai <strong>Lampiran DL-05 LAMEMBA</strong>.
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

      {/* 2. Navigasi 3 Tab Utama */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 max-w-2xl">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === "profiles"
              ? "bg-white text-sky-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-600" />
          <span>Status & Masa Berlaku</span>
        </button>

        <button
          onClick={() => setActiveTab("criteria")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === "criteria"
              ? "bg-white text-sky-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <span>Radar 9 Kriteria LAMEMBA</span>
        </button>

        <button
          onClick={() => setActiveTab("dl05")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
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

                  {/* Action Link to Certificate */}
                  {p.certificateUrl && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Salinan Dokumen SK & Sertifikat:</span>
                      <a
                        href={p.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-bold hover:underline"
                      >
                        <span>Unduh Sertifikat PDF</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
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
                  Pembentukan Tim Taskforce Reakreditasi Prodi, audit internal menyeluruh LKPS, dan pengumpulan bukti dukung 9 kriteria.
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

      {/* TAB 2: MATRIKS RADAR 9 KRITERIA LAMEMBA */}
      {activeTab === "criteria" && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-sky-700/30">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Simulasi Kesiapan Reakreditasi S1 Manajemen</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Skor Kesiapan 9 Kriteria: {overallScore} / 100
              </h3>
              <p className="text-xs text-sky-100/80 leading-relaxed">
                Skor agregasi terbobot berdasarkan instrumen penilaian LAMEMBA. Ambang batas syarat peringkat <strong>UNGGUL</strong> adalah nilai minimum &ge; 85.0.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center min-w-[200px] space-y-1">
              <span className="text-[11px] font-bold text-cyan-200 uppercase tracking-wider block">
                Prediksi Peringkat
              </span>
              <div className="text-3xl font-black text-white">
                {predictedGrade.replace("_", " ")}
              </div>
              <span className="text-[10px] text-emerald-300 font-semibold block">
                Memenuhi Ambang Batas
              </span>
            </div>
          </div>

          {/* 9 Criteria Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criteria.map((c) => {
              const isUnggul = c.status === "UNGGUL";

              return (
                <motion.div
                  key={c.code}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-sky-100 text-sky-800">
                      {c.code}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Bobot: <strong>{c.weight}%</strong>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                      {c.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">Capaian Skor:</span>
                      <strong className="text-slate-900 font-black">{c.score} / 100</strong>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isUnggul ? "bg-emerald-500" : "bg-sky-500"
                        }`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Strengths & Recommendations */}
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px]">
                    <div className="space-y-0.5">
                      <span className="font-bold text-emerald-700 block">Kekuatan Utama:</span>
                      <p className="text-slate-600 line-clamp-1">{c.strengths[0]}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold text-amber-700 block">Rekomendasi Peningkatan:</span>
                      <p className="text-slate-600 line-clamp-1">{c.recommendations[0]}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PEMANTAUAN TAHUNAN WAJIB LAMPIRAN DL-05 LAMEMBA */}
      {activeTab === "dl05" && dl05 && (
        <div className="space-y-6">
          {/* Header DL-05 Notice */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-sky-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-3 border border-emerald-700/40">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-semibold backdrop-blur-md">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Format Baku Lampiran DL-05 • Wajib Dilaporkan Setiap Tahun Pasca-Akreditasi</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Dokumen Pemantauan & Evaluasi Tahunan LAMEMBA
            </h3>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              Program Studi: <strong>{dl05.prodiName}</strong> • Tahun Akademik: <strong>{dl05.academicYear}</strong>. Instrumen ini mendokumentasikan tindak lanjut rekomendasi asesor, pencapaian Renstra, dan evaluasi 3 pilar kinerja prodi.
            </p>
          </div>

          {/* Bagian 1: Tindak Lanjut Rekomendasi Asesor */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-slate-900">
                  Bagian 1: Tindak Lanjut Rekomendasi Asesmen Lapangan Sebelumnya
                </h4>
                <p className="text-xs text-slate-500">
                  Penyelesaian rekomendasi perbaikan mutu yang diberikan oleh asesor pada saat visitasi akreditasi
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                {dl05.assessorFollowUps.filter((f) => f.status === "SELESAI").length} / {dl05.assessorFollowUps.length} Tuntas
              </span>
            </div>

            <div className="space-y-3">
              {dl05.assessorFollowUps.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">
                      Rekomendasi {idx + 1}: {item.recommendation}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        item.status === "SELESAI"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <span className="font-bold text-slate-700 block">Tindakan Nyata yang Dilakukan:</span>
                    <p>{item.actionTaken}</p>
                  </div>
                  {item.evidenceUrl && (
                    <a
                      href={item.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-bold pt-1 hover:underline"
                    >
                      <span>Tautan Bukti Tindak Lanjut</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bagian 2: Kemajuan Implementasi Renstra & CQI */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 space-y-0.5">
              <h4 className="text-sm font-black text-slate-900">
                Bagian 2: Kemajuan Implementasi Rencana Strategis (Renstra) & CQI
              </h4>
              <p className="text-xs text-slate-500">
                Pencapaian target strategis prodi beserta solusi Continuous Quality Improvement terhadap kendala yang dihadapi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dl05.renstraProgress.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                  <h5 className="font-black text-sky-900 text-sm">{item.targetName}</h5>
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-700 block">Capaian Kemajuan:</span>
                    <p className="text-slate-700">{item.achievement}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-amber-700 block">Hambatan yang Dihadapi:</span>
                    <p className="text-slate-700">{item.obstacle || "Tidak ada kendala berarti."}</p>
                  </div>
                  <div className="space-y-1 p-3 rounded-xl bg-sky-50 border border-sky-100">
                    <span className="font-bold text-sky-900 block">Solusi CQI Berkelanjutan:</span>
                    <p className="text-sky-800">{item.cqiSolution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bagian 3: Tiga Pilar Kunci DL-05 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3 space-y-0.5">
              <h4 className="text-sm font-black text-slate-900">
                Bagian 3: Evaluasi Kinerja Tiga Pilar Kunci Program Studi
              </h4>
              <p className="text-xs text-slate-500">
                Tolak ukur baku LAMEMBA DL-05 mencakup Jaminan Pembelajaran, Kecukupan Dosen, dan Luaran Tridharma
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Pilar A: Jaminan Pembelajaran */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h5 className="font-black text-slate-900 text-sm">A. Jaminan Pembelajaran</h5>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ketercapaian CPL:</span>
                    <strong className="text-slate-900">{dl05.learningAssurance.cplAchievementPercentage}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">RPS Berbasis OBE:</span>
                    <strong className="text-slate-900">{dl05.learningAssurance.obeRpsPercentage}%</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
                  {dl05.learningAssurance.description}
                </p>
              </div>

              {/* Pilar B: Kualifikasi Dosen */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h5 className="font-black text-slate-900 text-sm">B. Kecukupan & Kualifikasi Dosen</h5>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dosen Tetap (DTPS):</span>
                    <strong className="text-slate-900">{dl05.facultySufficiency.permanentFacultyCount} Orang</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kualifikasi S3 (Doktor):</span>
                    <strong className="text-slate-900">{dl05.facultySufficiency.doctoralPercentage}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rasio Dosen-Mahasiswa:</span>
                    <strong className="text-slate-900">{dl05.facultySufficiency.facultyStudentRatio}</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
                  {dl05.facultySufficiency.description}
                </p>
              </div>

              {/* Pilar C: Luaran Tridharma */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h5 className="font-black text-slate-900 text-sm">C. Luaran & Capaian Tridharma</h5>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rata-rata IPK:</span>
                    <strong className="text-slate-900">{dl05.tridharmaOutcomes.gpaAverage}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waktu Tunggu Kerja:</span>
                    <strong className="text-slate-900">{dl05.tridharmaOutcomes.waitingTimeMonths} Bulan</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Response Rate Tracer:</span>
                    <strong className="text-slate-900">{dl05.tridharmaOutcomes.tracerStudyResponseRate}%</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
                  {dl05.tridharmaOutcomes.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* 4. MODAL PRATINJAU CETAK RESMI FORMAT LAMPIRAN DL-05 LAMEMBA */}
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
                  <span>Pratinjau Dokumen Cetak • Lampiran DL-05 LAMEMBA</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Cetak / Simpan PDF
                  </button>
                  <button
                    onClick={() => setIsPrintDl05ModalOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
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
                  </div>
                </div>

                {/* Judul Laporan */}
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-black uppercase text-slate-950 underline underline-offset-4">
                    DOKUMEN PEMANTAUAN DAN EVALUASI PASCA-AKREDITASI
                  </h3>
                  <p className="text-xs text-slate-600 font-bold">
                    PROGRAM STUDI SARJANA MANAJEMEN • TAHUN AKADEMIK {dl05.academicYear}
                  </p>
                </div>

                {/* Bagian 1 Tabel Tindak Lanjut Rekomendasi */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase">
                    1. Tindak Lanjut Rekomendasi Asesmen Lapangan Terakhir
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="border border-slate-300 p-2 text-center w-8">No</th>
                        <th className="border border-slate-300 p-2 text-left">Rekomendasi Asesor</th>
                        <th className="border border-slate-300 p-2 text-left">Tindakan Nyata yang Dilakukan</th>
                        <th className="border border-slate-300 p-2 text-center w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dl05.assessorFollowUps.map((item, idx) => (
                        <tr key={idx} className="align-top">
                          <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-300 p-2">{item.recommendation}</td>
                          <td className="border border-slate-300 p-2">{item.actionTaken}</td>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {item.status.replace("_", " ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bagian 2 Kemajuan Renstra */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase">
                    2. Kemajuan Implementasi Renstra & Continuous Quality Improvement (CQI)
                  </h4>
                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="border border-slate-300 p-2 text-left">Sasaran Strategis</th>
                        <th className="border border-slate-300 p-2 text-left">Capaian Progres</th>
                        <th className="border border-slate-300 p-2 text-left">Hambatan & Solusi CQI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dl05.renstraProgress.map((item, idx) => (
                        <tr key={idx} className="align-top">
                          <td className="border border-slate-300 p-2 font-bold">{item.targetName}</td>
                          <td className="border border-slate-300 p-2">{item.achievement}</td>
                          <td className="border border-slate-300 p-2">
                            <span>Kendala: {item.obstacle || "-"}</span>
                            <br />
                            <strong>Solusi: {item.cqiSolution}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bagian 3 Rekapitulasi Tiga Pilar */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase">
                    3. Ringkasan Kinerja 3 Indikator Baku (Jaminan Pembelajaran, Dosen, Tridharma)
                  </h4>
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 text-center text-[10px]">
                    <div>
                      <span className="text-slate-500 block">Ketercapaian CPL:</span>
                      <strong className="text-sm text-slate-900">{dl05.learningAssurance.cplAchievementPercentage}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Dosen Bergelar Doktor:</span>
                      <strong className="text-sm text-slate-900">{dl05.facultySufficiency.doctoralPercentage}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Waktu Tunggu Kerja:</span>
                      <strong className="text-sm text-slate-900">{dl05.tridharmaOutcomes.waitingTimeMonths} Bulan</strong>
                    </div>
                  </div>
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
                      <p className="font-black underline underline-offset-4">Ibrahim Syah, SE., MM.</p>
                      <p className="text-[9px] text-slate-500">NIDN. 0920037601</p>
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
