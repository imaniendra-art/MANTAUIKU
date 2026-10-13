"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  DollarSign,
  Building,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IEdoLecturer {
  _id: string;
  nidn: string;
  lecturerName: string;
  courseName: string;
  courseCode: string;
  academicYear: string;
  semester: string;
  respondentCount: number;
  pedagogicScore: number;
  professionalScore: number;
  personalityScore: number;
  socialScore: number;
  ikdScore: number;
  predicate: string;
  syncedAt: string;
}

interface IEdoSummary {
  totalEvaluated: number;
  totalRespondents: number;
  averageIkd: number;
  competencies: {
    pedagogic: number;
    professional: number;
    personality: number;
    social: number;
  };
  predicates: {
    sangatBaik: number;
    baik: number;
    cukup: number;
    kurang: number;
    sangatBaikPercent: number;
  };
  lastSynced: string;
}

interface IEkaService {
  _id: string;
  unitKey: string;
  unitName: string;
  academicYear: string;
  respondentCount: number;
  speedScore: number;
  courtesyScore: number;
  facilityScore: number;
  transparencyScore: number;
  averageScore: number;
  satisfactionRate: number;
}

interface IEkaSummary {
  totalUnits: number;
  totalRespondents: number;
  institutionalSatisfactionRate: number;
  institutionalAverageScore: number;
  highestUnit: { name: string; rate: number; score: number } | null;
  lowestUnit: { name: string; rate: number; score: number } | null;
  warningUnits: Array<{ unitName: string; satisfactionRate: number; reason: string }>;
  lastSynced: string;
}

interface ITracerItem {
  _id: string;
  nim: string;
  name: string;
  graduationYear: number;
  prodi: string;
  phone: string;
  email: string;
  status: "BEKERJA" | "WIRAUSAHA" | "STUDI_LANJUT" | "MENCARI_KERJA";
  waitingTimeMonths: number;
  fieldAlignment: "TINGGI" | "SEDANG" | "RENDAH";
  monthlySalary?: number;
  companyName?: string;
  jobTitle?: string;
  createdAt: string;
}

interface ITracerSummary {
  totalRespondents: number;
  absorbedCount: number;
  absorptionRate: number;
  avgWaitingTime: number;
  avgSalary: number;
  statusBreakdown: {
    bekerja: number;
    wirausaha: number;
    studiLanjut: number;
    mencariKerja: number;
  };
  fieldAlignmentBreakdown: {
    tinggi: number;
    sedang: number;
    rendah: number;
  };
}

interface IEmployerItem {
  _id: string;
  companyName: string;
  evaluatorName: string;
  evaluatorPosition: string;
  alumniName: string;
  ethicsScore: number;
  expertiseScore: number;
  englishScore: number;
  itSkillScore: number;
  communicationScore: number;
  teamworkScore: number;
  selfDevelopmentScore: number;
  averageScore: number;
  feedbackNotes?: string;
  createdAt: string;
}

interface IEmployerSummary {
  totalEvaluations: number;
  averageSatisfactionScore: number;
  satisfactionRatePercent: number;
  competencies: {
    ethics: number;
    expertise: number;
    english: number;
    itSkill: number;
    communication: number;
    teamwork: number;
    selfDevelopment: number;
  };
}

export default function EvaluationsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"edo" | "eka" | "tracer" | "employer">("edo");
  const [loading, setLoading] = useState(true);
  const [syncingSiam, setSyncingSiam] = useState(false);
  const [syncingTracer, setSyncingTracer] = useState(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);

  // EDO Data
  const [edoData, setEdoData] = useState<IEdoLecturer[]>([]);
  const [edoSummary, setEdoSummary] = useState<IEdoSummary | null>(null);
  const [edoSearch, setEdoSearch] = useState("");

  // EKA Data
  const [ekaData, setEkaData] = useState<IEkaService[]>([]);
  const [ekaSummary, setEkaSummary] = useState<IEkaSummary | null>(null);

  // Tracer Data
  const [tracerData, setTracerData] = useState<ITracerItem[]>([]);
  const [tracerSummary, setTracerSummary] = useState<ITracerSummary | null>(null);
  const [tracerStatusFilter, setTracerStatusFilter] = useState("ALL");

  // Employer Data
  const [employerData, setEmployerData] = useState<IEmployerItem[]>([]);
  const [employerSummary, setEmployerSummary] = useState<IEmployerSummary | null>(null);

  // Fetch all evaluation data
  const loadData = async () => {
    try {
      const [resEdo, resEka, resTracer, resEmployer] = await Promise.all([
        fetch("/api/evaluations/edo"),
        fetch("/api/evaluations/eka"),
        fetch("/api/public/tracer-study"),
        fetch("/api/public/employer-survey"),
      ]);

      const [jsonEdo, jsonEka, jsonTracer, jsonEmployer] = await Promise.all([
        resEdo.json(),
        resEka.json(),
        resTracer.json(),
        resEmployer.json(),
      ]);

      if (jsonEdo.success) {
        setEdoData(jsonEdo.data);
        setEdoSummary(jsonEdo.summary);
      }
      if (jsonEka.success) {
        setEkaData(jsonEka.data);
        setEkaSummary(jsonEka.summary);
      }
      if (jsonTracer.success) {
        setTracerData(jsonTracer.data);
        setTracerSummary(jsonTracer.summary);
      }
      if (jsonEmployer.success) {
        setEmployerData(jsonEmployer.data);
        setEmployerSummary(jsonEmployer.summary);
      }
    } catch (err) {
      console.error("Failed loading evaluations data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [resEdo, resEka, resTracer, resEmployer] = await Promise.all([
          fetch("/api/evaluations/edo"),
          fetch("/api/evaluations/eka"),
          fetch("/api/public/tracer-study"),
          fetch("/api/public/employer-survey"),
        ]);

        const [jsonEdo, jsonEka, jsonTracer, jsonEmployer] = await Promise.all([
          resEdo.json(),
          resEka.json(),
          resTracer.json(),
          resEmployer.json(),
        ]);

        if (!ignore) {
          if (jsonEdo.success) {
            setEdoData(jsonEdo.data);
            setEdoSummary(jsonEdo.summary);
          }
          if (jsonEka.success) {
            setEkaData(jsonEka.data);
            setEkaSummary(jsonEka.summary);
          }
          if (jsonTracer.success) {
            setTracerData(jsonTracer.data);
            setTracerSummary(jsonTracer.summary);
          }
          if (jsonEmployer.success) {
            setEmployerData(jsonEmployer.data);
            setEmployerSummary(jsonEmployer.summary);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed loading evaluations data:", err);
        if (!ignore) setLoading(false);
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Sync with SIAM action
  const handleSyncSiam = async () => {
    setSyncingSiam(true);
    try {
      const res = await fetch("/api/integrations/siam/sync", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSyncSuccessToast(
          `Sinkronisasi SIAM Berhasil! ${json.syncDetails.syncedLecturers} dosen & ${json.syncDetails.syncedUnits} unit terupdate.`
        );
        setTimeout(() => setSyncSuccessToast(null), 5000);
        await loadData();
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncingSiam(false);
    }
  };

  // Sync with Tracer Study Application action
  const handleSyncTracer = async () => {
    setSyncingTracer(true);
    try {
      const res = await fetch("/api/integrations/tracer/sync", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSyncSuccessToast(
          `Sinkronisasi Aplikasi Tracer Berhasil! ${json.syncDetails.recordsUpserted} alumni terintegrasi. Capaian IKU 2 diperbarui: ${json.syncDetails.newAbsorptionRate}`
        );
        setTimeout(() => setSyncSuccessToast(null), 6000);
        await loadData();
      }
    } catch (err) {
      console.error("Tracer sync error:", err);
    } finally {
      setSyncingTracer(false);
    }
  };

  const filteredEdo = edoData.filter(
    (d) =>
      d.lecturerName.toLowerCase().includes(edoSearch.toLowerCase()) ||
      d.courseName.toLowerCase().includes(edoSearch.toLowerCase()) ||
      d.nidn.includes(edoSearch)
  );

  const filteredTracer = tracerData.filter((t) =>
    tracerStatusFilter === "ALL" ? true : t.status === tracerStatusFilter
  );

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-800/40 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>SIAM Bridge Integration & Continuous Tracer Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pusat Evaluasi Dosen, Layanan & Tracer Study
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Hub agregasi data survei kepuasan mahasiswa terpadu: <span className="text-sky-300 font-bold">EDO</span> (Evaluasi Dosen), <span className="text-cyan-300 font-bold">EKA</span> (Evaluasi Layanan 10 UPT), serta <span className="text-emerald-300 font-bold">Tracer Study Alumni</span> yang terhubung langsung memperbarui capaian <span className="text-yellow-300 font-bold">IKU 2</span> di database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleSyncSiam}
              disabled={syncingSiam}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all hover:scale-105 disabled:opacity-50"
              title="Sinkronkan data EDO & EKA dari portal akademik SIAM"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingSiam ? "animate-spin" : ""}`} />
              <span>{syncingSiam ? "Menyinkronkan SIAM..." : "Tarik Data SIAM (EDO/EKA)"}</span>
            </button>

            <button
              onClick={handleSyncTracer}
              disabled={syncingTracer}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 disabled:opacity-50"
              title="Sinkronkan data lulusan dari Aplikasi Tracer Study STIMI YAPMI (CDC Gateway)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingTracer ? "animate-spin" : ""}`} />
              <span>{syncingTracer ? "Menyinkronkan Tracer..." : "Tarik Data Tracer App"}</span>
            </button>

            <a
              href="/#evaluasi-tracer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              <span>Portal Form Publik</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Sync Toast Notification */}
        <AnimatePresence>
          {syncSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncSuccessToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Modern 4-Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("edo")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-colors ${
            activeTab === "edo"
              ? "border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. EDO Dosen (SIAM Sync)</span>
          {edoSummary && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-sky-100 text-sky-700 font-bold">
              IKD {edoSummary.averageIkd}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("eka")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-colors ${
            activeTab === "eka"
              ? "border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>2. EKA Layanan 10 UPT (SIAM)</span>
          {ekaSummary && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 font-bold">
              {ekaSummary.institutionalSatisfactionRate}%
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("tracer")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-colors ${
            activeTab === "tracer"
              ? "border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>3. Tracer Study Alumni (Auto IKU 2)</span>
          {tracerSummary && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-yellow-100 text-yellow-800 font-bold">
              IKU 2: {tracerSummary.absorptionRate}%
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("employer")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-colors ${
            activeTab === "employer"
              ? "border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>4. Survei Pengguna Lulusan</span>
          {employerSummary && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 font-bold">
              {employerSummary.satisfactionRatePercent}%
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
          <p className="text-xs font-semibold">Memuat data evaluasi dan hasil sinkronisasi SIAM...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: EDO DOSEN */}
          {activeTab === "edo" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Indeks Kinerja Dosen (IKD)</span>
                    <Award className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {edoSummary?.averageIkd || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/ 4.00</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Predikat: {edoSummary?.averageIkd && edoSummary.averageIkd >= 3.5 ? "Sangat Baik" : "Baik"}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Dosen Dievaluasi</span>
                    <Users className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {edoSummary?.totalEvaluated || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Dosen Tetap S1</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Semester Genap 2025/2026 via SIAM
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Responden Mahasiswa</span>
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {edoSummary?.totalRespondents || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Kuesioner Masuk</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Wajib diisi sebelum akses KHS di SIAM
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Status Sinkronisasi SIAM</span>
                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-sm font-black text-emerald-600 flex items-center gap-1.5 pt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Terhubung Otomatis</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Update terakhir: {edoSummary?.lastSynced ? new Date(edoSummary.lastSynced).toLocaleDateString("id-ID") : "Hari ini"}
                  </p>
                </div>
              </div>

              {/* 4 Competency Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Rata-rata 4 Dimensi Kompetensi Dosen (Standar Nasional Dikti)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">1. Pedagogik</span>
                      <span className="text-sky-700 font-black">{edoSummary?.competencies.pedagogic || 0} / 4.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${((edoSummary?.competencies.pedagogic || 0) / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">RPS, kejelasan materi & interaksi kelas</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">2. Profesional</span>
                      <span className="text-cyan-700 font-black">{edoSummary?.competencies.professional || 0} / 4.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-600 h-full rounded-full"
                        style={{ width: `${((edoSummary?.competencies.professional || 0) / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Penguasaan keilmuan manajemen & studi kasus</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">3. Kepribadian</span>
                      <span className="text-indigo-700 font-black">{edoSummary?.competencies.personality || 0} / 4.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${((edoSummary?.competencies.personality || 0) / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Kedisiplinan, keteladanan & kearifan</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">4. Sosial</span>
                      <span className="text-purple-700 font-black">{edoSummary?.competencies.social || 0} / 4.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{ width: `${((edoSummary?.competencies.social || 0) / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Keterbukaan konsultasi & komunikasi santun</p>
                  </div>
                </div>
              </div>

              {/* Table of Lecturers */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Daftar Hasil Penilaian Dosen oleh Mahasiswa
                  </h3>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama dosen, mata kuliah..."
                      value={edoSearch}
                      onChange={(e) => setEdoSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                        <th className="py-3 px-3">NIDN</th>
                        <th className="py-3 px-3">Nama Dosen & Gelar</th>
                        <th className="py-3 px-3">Mata Kuliah Diampu</th>
                        <th className="py-3 px-3 text-center">Responden</th>
                        <th className="py-3 px-2 text-center">Pedagogik</th>
                        <th className="py-3 px-2 text-center">Profesional</th>
                        <th className="py-3 px-2 text-center">Kepribadian</th>
                        <th className="py-3 px-2 text-center">Sosial</th>
                        <th className="py-3 px-3 text-center">Skor IKD</th>
                        <th className="py-3 px-3 text-center">Predikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEdo.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                            {item.nidn}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {item.lecturerName}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            <span className="font-semibold text-slate-800">{item.courseName}</span>
                            <span className="text-[10px] text-slate-400 block">{item.courseCode}</span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {item.respondentCount} mhs
                          </td>
                          <td className="py-3 px-2 text-center font-medium text-slate-600">
                            {item.pedagogicScore}
                          </td>
                          <td className="py-3 px-2 text-center font-medium text-slate-600">
                            {item.professionalScore}
                          </td>
                          <td className="py-3 px-2 text-center font-medium text-slate-600">
                            {item.personalityScore}
                          </td>
                          <td className="py-3 px-2 text-center font-medium text-slate-600">
                            {item.socialScore}
                          </td>
                          <td className="py-3 px-3 text-center font-black text-sky-700">
                            {item.ikdScore}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.predicate === "Sangat Baik"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-sky-50 text-sky-700 border border-sky-200"
                              }`}
                            >
                              {item.predicate}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EKA LAYANAN 10 UPT */}
          {activeTab === "eka" && (
            <div className="space-y-6">
              {/* Early Warning Banner if any unit is low */}
              {ekaSummary?.warningUnits && ekaSummary.warningUnits.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-950">
                      Peringatan Dini Penjaminan Mutu (SPMI): Unit dengan Kepuasan Memerlukan Pembinaan
                    </h4>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Terdapat {ekaSummary.warningUnits.length} unit dengan tingkat kepuasan di bawah ambang 85%:{" "}
                      <span className="font-bold">
                        {ekaSummary.warningUnits.map((w) => `${w.unitName} (${w.satisfactionRate}%)`).join(", ")}
                      </span>
                      . LPM merekomendasikan penerbitan Formulir Permintaan Tindakan Koreksi (PTK).
                    </p>
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Indeks Kepuasan Layanan (IKL)</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {ekaSummary?.institutionalSatisfactionRate || 0}%
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      ({ekaSummary?.institutionalAverageScore || 0}/4.0)
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Kategori: Layanan Sangat Memuaskan
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Unit Layanan Tertinggi</span>
                    <Award className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-sm font-black text-slate-900 truncate">
                    {ekaSummary?.highestUnit?.name || "-"}
                  </div>
                  <div className="text-xs font-bold text-sky-700">
                    Skor: {ekaSummary?.highestUnit?.rate}% ({ekaSummary?.highestUnit?.score}/4.0)
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Unit Butuh Peningkatan</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-sm font-black text-slate-900 truncate">
                    {ekaSummary?.lowestUnit?.name || "-"}
                  </div>
                  <div className="text-xs font-bold text-amber-700">
                    Skor: {ekaSummary?.lowestUnit?.rate}% ({ekaSummary?.lowestUnit?.score}/4.0)
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Cakupan UPT & Unit Kerja</span>
                    <Building2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {ekaSummary?.totalUnits || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Unit Dievaluasi</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Seluruh 10 auditee resmi STIMI YAPMI
                  </p>
                </div>
              </div>

              {/* Grid of 10 Units */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ekaData.map((unit) => (
                  <div
                    key={unit._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 hover:border-sky-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-black text-sm text-slate-900">
                          {unit.unitName}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          Responden: {unit.respondentCount} Mahasiswa
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            unit.satisfactionRate >= 90
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : unit.satisfactionRate >= 85
                              ? "bg-sky-50 text-sky-700 border border-sky-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {unit.satisfactionRate}%
                        </span>
                        <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                          Skor {unit.averageScore}/4.0
                        </span>
                      </div>
                    </div>

                    {/* 4 Dimension Bars */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Kecepatan & Responsivitas</span>
                          <span className="font-bold text-slate-700">{unit.speedScore} / 4.0</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-500 h-full rounded-full"
                            style={{ width: `${(unit.speedScore / 4) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Keramahan & Sikap Petugas</span>
                          <span className="font-bold text-slate-700">{unit.courtesyScore} / 4.0</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full rounded-full"
                            style={{ width: `${(unit.courtesyScore / 4) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Kenyamanan & Fasilitas Layanan</span>
                          <span className="font-bold text-slate-700">{unit.facilityScore} / 4.0</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${(unit.facilityScore / 4) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Transparansi Prosedur (SOP)</span>
                          <span className="font-bold text-slate-700">{unit.transparencyScore} / 4.0</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${(unit.transparencyScore / 4) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TRACER STUDY & AUTO-SUPPLY IKU 2 */}
          {activeTab === "tracer" && (
            <div className="space-y-6">
              {/* Highlight Banner: Connected to IKU 2 */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border border-yellow-200 text-yellow-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-yellow-400 text-yellow-950 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                        Pipa Data Otomatis (Auto-Supply)
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white">
                        AKTIF & TERSINKRONISASI
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900">
                      Capaian IKU 2 Terhubung Langsung ke Pengisian Tracer Study Alumni
                    </h4>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      Setiap kali alumni mengisi formulir tracer publik, sistem secara atomik menghitung kembali rasio kelulusan yang langsung bekerja/wirausaha/studi lanjut dan langsung meng-update nilai capaian di modul <span className="font-bold text-slate-900">IKU 2 (Talenta & Mahasiswa)</span>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={handleSyncTracer}
                    disabled={syncingTracer}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition-all hover:scale-105 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingTracer ? "animate-spin" : ""}`} />
                    <span>{syncingTracer ? "Menyinkronkan Tracer..." : "Tarik Data dari Aplikasi Tracer"}</span>
                  </button>

                  <a
                    href="/dashboard"
                    className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-bold text-xs shadow-md shadow-yellow-500/20 flex items-center gap-1.5"
                  >
                    <span>Cek Skor di Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Tingkat Serapan Alumni (IKU 2)</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-700">
                      {tracerSummary?.absorptionRate || 0}%
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      ({tracerSummary?.absorbedCount}/{tracerSummary?.totalRespondents})
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Target Standar Nasional: 80% (Terpenuhi)</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Rata-rata Waktu Tunggu</span>
                    <Clock className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {tracerSummary?.avgWaitingTime || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Bulan</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Standar BAN-PT / LAMEMBA: &lt; 6 Bulan
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Rata-rata Gaji Pertama</span>
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      Rp {((tracerSummary?.avgSalary || 0) / 1000000).toFixed(1)} Jt
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Di atas Upah Minimum Regional (UMR)
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Keselarasan Bidang Kerja</span>
                    <Award className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {tracerSummary?.fieldAlignmentBreakdown.tinggi || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Alumni (Tinggi)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Relevan dengan kurikulum Manajemen
                  </p>
                </div>
              </div>

              {/* Status Breakdown & Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Daftar Responden Tracer Study Alumni S1 Manajemen
                    </h3>
                    <p className="text-xs text-slate-500">
                      Data real-time pelacakan lulusan untuk bukti dukung audit akreditasi
                    </p>
                  </div>

                  {/* Filter Status */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    {["ALL", "BEKERJA", "WIRAUSAHA", "STUDI_LANJUT", "MENCARI_KERJA"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setTracerStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          tracerStatusFilter === st
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {st === "ALL" ? "Semua" : st.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold">
                        <th className="py-3 px-3">NIM</th>
                        <th className="py-3 px-3">Nama Alumni</th>
                        <th className="py-3 px-3">Tahun Lulus</th>
                        <th className="py-3 px-3">Status Saat Ini</th>
                        <th className="py-3 px-3">Instansi / Perusahaan</th>
                        <th className="py-3 px-3">Posisi / Jabatan</th>
                        <th className="py-3 px-3 text-center">Waktu Tunggu</th>
                        <th className="py-3 px-3 text-center">Keselarasan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTracer.map((alumni) => (
                        <tr key={alumni._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                            {alumni.nim}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {alumni.name}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {alumni.graduationYear}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                alumni.status === "BEKERJA"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : alumni.status === "WIRAUSAHA"
                                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                                  : alumni.status === "STUDI_LANJUT"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {alumni.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {alumni.companyName || "-"}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {alumni.jobTitle || "-"}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {alumni.waitingTimeMonths} bln
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                alumni.fieldAlignment === "TINGGI"
                                  ? "text-emerald-700 bg-emerald-50"
                                  : alumni.fieldAlignment === "SEDANG"
                                  ? "text-amber-700 bg-amber-50"
                                  : "text-rose-700 bg-rose-50"
                              }`}
                            >
                              {alumni.fieldAlignment}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SURVEI PENGGUNA LULUSAN (MITRA INDUSTRI) */}
          {activeTab === "employer" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Indeks Kepuasan Pengguna Lulusan</span>
                    <Briefcase className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-purple-700">
                      {employerSummary?.satisfactionRatePercent || 0}%
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      ({employerSummary?.averageSatisfactionScore || 0} / 4.00)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Dinilai langsung oleh pimpinan mitra kerja
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Perusahaan Responden</span>
                    <Building className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {employerSummary?.totalEvaluations || 0}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Mitra Industri</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    BUMN Perbankan, Pelabuhan, & Korporasi
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Kompetensi Tertinggi</span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    Etika & Integritas Kerja
                  </div>
                  <div className="text-xs font-bold text-emerald-700">
                    Skor: {employerSummary?.competencies.ethics || 0} / 4.00 (96.3%)
                  </div>
                </div>
              </div>

              {/* 7 Graduate Competencies Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Penilaian 7 Dimensi Kemampuan Lulusan oleh Industri (Standar BAN-PT & LAMEMBA)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">1. Etika & Integritas</span>
                      <span className="text-sky-700">{employerSummary?.competencies.ethics || 0} / 4.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${((employerSummary?.competencies.ethics || 0) / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">2. Keahlian Manajemen</span>
                      <span className="text-sky-700">{employerSummary?.competencies.expertise || 0} / 4.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${((employerSummary?.competencies.expertise || 0) / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">3. Penggunaan TI & Digital</span>
                      <span className="text-sky-700">{employerSummary?.competencies.itSkill || 0} / 4.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${((employerSummary?.competencies.itSkill || 0) / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">4. Kemampuan Komunikasi</span>
                      <span className="text-sky-700">{employerSummary?.competencies.communication || 0} / 4.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${((employerSummary?.competencies.communication || 0) / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">5. Kerjasama Tim</span>
                      <span className="text-sky-700">{employerSummary?.competencies.teamwork || 0} / 4.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${((employerSummary?.competencies.teamwork || 0) / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">6. Pengembangan Diri</span>
                      <span className="text-sky-700">{employerSummary?.competencies.selfDevelopment || 0} / 4.0</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-600 h-full rounded-full"
                        style={{ width: `${((employerSummary?.competencies.selfDevelopment || 0) / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials and Feedback Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employerData.map((emp) => (
                  <div
                    key={emp._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="font-black text-sm text-slate-900">
                          {emp.companyName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {emp.evaluatorName} • <span className="text-slate-400">{emp.evaluatorPosition}</span>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
                        Skor {emp.averageScore} / 4.0
                      </span>
                    </div>

                    <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                      <span className="font-bold text-slate-700">Alumni yang Dinilai: </span>
                      {emp.alumniName}
                    </div>

                    {emp.feedbackNotes && (
                      <p className="text-xs text-slate-600 italic bg-purple-50/40 p-3 rounded-xl border border-purple-100/60 leading-relaxed">
                        &quot;{emp.feedbackNotes}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
