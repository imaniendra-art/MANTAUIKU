"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Send,
  Sparkles,
  AlertCircle
} from "lucide-react";

interface IPublicEvalSummary {
  edo: {
    totalEvaluated: number;
    averageIkd: number;
    totalRespondents: number;
    predicateLabel: string;
  };
  eka: {
    totalUnits: number;
    satisfactionRate: number;
    averageScore: number;
  };
  tracer: {
    totalAlumni: number;
    absorbedCount: number;
    absorptionRate: number;
    avgWaitingTime: number;
    statusBreakdown: {
      bekerja: number;
      wirausaha: number;
      studiLanjut: number;
      mencariKerja: number;
    };
  };
  employer: {
    totalCompanies: number;
    averageScore: number;
    satisfactionRate: number;
    recentFeedback: Array<{
      companyName: string;
      evaluatorPosition: string;
      score: number;
      notes?: string;
    }>;
  };
}

export default function EvaluationsWidget() {
  const [activeFormTab, setActiveFormTab] = useState<"tracer" | "employer">("tracer");
  const [summaryData, setSummaryData] = useState<IPublicEvalSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Tracer Study Form State
  const [tracerForm, setTracerForm] = useState({
    nim: "",
    name: "",
    graduationYear: 2024,
    prodi: "S1 Manajemen",
    phone: "",
    email: "",
    status: "BEKERJA",
    waitingTimeMonths: 3,
    fieldAlignment: "TINGGI",
    monthlySalary: 5500000,
    companyName: "",
    jobTitle: "",
  });
  const [submittingTracer, setSubmittingTracer] = useState(false);
  const [tracerSuccessMessage, setTracerSuccessMessage] = useState<string | null>(null);
  const [tracerErrorMessage, setTracerErrorMessage] = useState<string | null>(null);

  // Employer Survey Form State
  const [employerForm, setEmployerForm] = useState({
    companyName: "",
    evaluatorName: "",
    evaluatorPosition: "",
    alumniName: "",
    ethicsScore: 4,
    expertiseScore: 4,
    englishScore: 3.5,
    itSkillScore: 4,
    communicationScore: 4,
    teamworkScore: 4,
    selfDevelopmentScore: 4,
    feedbackNotes: "",
  });
  const [submittingEmployer, setSubmittingEmployer] = useState(false);
  const [employerSuccessMessage, setEmployerSuccessMessage] = useState<string | null>(null);
  const [employerErrorMessage, setEmployerErrorMessage] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/public/evaluations");
      const json = await res.json();
      if (json.success) {
        setSummaryData(json);
      }
    } catch (e) {
      console.error("Failed fetching public evaluations:", e);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/public/evaluations");
        const json = await res.json();
        if (!ignore && json.success) {
          setSummaryData(json);
        }
      } catch (e) {
        console.error("Failed fetching public evaluations:", e);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Handle Tracer Submit
  const handleTracerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTracer(true);
    setTracerSuccessMessage(null);
    setTracerErrorMessage(null);

    try {
      const res = await fetch("/api/public/tracer-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tracerForm),
      });
      const data = await res.json();

      if (data.success) {
        setTracerSuccessMessage(
          `Terima kasih Kak ${tracerForm.name}! Formulir Tracer Study berhasil terkirim dan capaian IKU 2 diperbarui secara real-time!`
        );
        setTracerForm({
          nim: "",
          name: "",
          graduationYear: 2024,
          prodi: "S1 Manajemen",
          phone: "",
          email: "",
          status: "BEKERJA",
          waitingTimeMonths: 3,
          fieldAlignment: "TINGGI",
          monthlySalary: 5500000,
          companyName: "",
          jobTitle: "",
        });
        await fetchSummary();
      } else {
        setTracerErrorMessage(data.error || "Gagal mengirim formulir tracer");
      }
    } catch {
      setTracerErrorMessage("Terjadi gangguan koneksi jaringan");
    } finally {
      setSubmittingTracer(false);
    }
  };

  // Handle Employer Submit
  const handleEmployerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEmployer(true);
    setEmployerSuccessMessage(null);
    setEmployerErrorMessage(null);

    try {
      const res = await fetch("/api/public/employer-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employerForm),
      });
      const data = await res.json();

      if (data.success) {
        setEmployerSuccessMessage(
          `Terima kasih atas penilaian Bapak/Ibu dari ${employerForm.companyName}! Masukan ini menjadi bagian penting peningkatan mutu lulusan kami.`
        );
        setEmployerForm({
          companyName: "",
          evaluatorName: "",
          evaluatorPosition: "",
          alumniName: "",
          ethicsScore: 4,
          expertiseScore: 4,
          englishScore: 3.5,
          itSkillScore: 4,
          communicationScore: 4,
          teamworkScore: 4,
          selfDevelopmentScore: 4,
          feedbackNotes: "",
        });
        await fetchSummary();
      } else {
        setEmployerErrorMessage(data.error || "Gagal mengirim kuesioner pengguna lulusan");
      }
    } catch {
      setEmployerErrorMessage("Terjadi gangguan koneksi jaringan");
    } finally {
      setSubmittingEmployer(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400">
        <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold">Memuat data evaluasi & survei...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 1. Header Section (Jarak Lega & Rapi) */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 shadow-2xs">
            Umpan Balik Mutu Berkelanjutan
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Pusat Survei Mutu & Tracer Study Alumni
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Keterbukaan hasil evaluasi pembelajaran dosen (EDO), indeks kepuasan layanan 10 unit akademik (EKA), serta formulir partisipasi langsung bagi alumni dan mitra industri.
        </p>
      </div>

      {/* 2. 4 Executive Transparent Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: EDO */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Kinerja Dosen (EDO)</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {summaryData?.edo.averageIkd || 3.66}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 4.00</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700">
              {summaryData?.edo.predicateLabel || "Sangat Baik"}
            </span>
            <span className="text-slate-400 font-medium">
              {summaryData?.edo.totalRespondents || 337} Responden
            </span>
          </div>
        </div>

        {/* Card 2: EKA */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Kepuasan Layanan (EKA)</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {summaryData?.eka.satisfactionRate || 88.4}%
            </span>
            <span className="text-xs font-bold text-slate-400">
              ({summaryData?.eka.averageScore || 3.54}/4.0)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="px-2 py-0.5 rounded-md font-bold bg-cyan-50 text-cyan-700">
              10 UPT & Unit Kerja
            </span>
            <span className="text-slate-400 font-medium">Sinkron SIAM</span>
          </div>
        </div>

        {/* Card 3: Tracer Study (IKU 2) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Serapan Alumni (IKU 2)</span>
            <div className="p-2 rounded-xl bg-yellow-50 text-yellow-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">
              {summaryData?.tracer.absorptionRate || 86.7}%
            </span>
            <span className="text-xs font-bold text-slate-400">Bekerja/Usaha/S2</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700">
              Target 80% (Terlampaui)
            </span>
            <span className="text-slate-400 font-medium">
              Tunggu {summaryData?.tracer.avgWaitingTime || 2.7} Bln
            </span>
          </div>
        </div>

        {/* Card 4: Employer Survey */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Kepuasan Pengguna</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-700">
              {summaryData?.employer.satisfactionRate || 93.3}%
            </span>
            <span className="text-xs font-bold text-slate-400">
              ({summaryData?.employer.averageScore || 3.73}/4.0)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="px-2 py-0.5 rounded-md font-bold bg-purple-50 text-purple-700">
              Mitra Industri & BUMN
            </span>
            <span className="text-slate-400 font-medium">Standar LAMEMBA</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Public Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-2 gap-2">
          <button
            onClick={() => setActiveFormTab("tracer")}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeFormTab === "tracer"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-yellow-600" />
            <span>Formulir Tracer Study Alumni (Khusus Lulusan STIMI YAPMI)</span>
          </button>

          <button
            onClick={() => setActiveFormTab("employer")}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeFormTab === "employer"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Briefcase className="w-4 h-4 text-purple-600" />
            <span>Survei Kepuasan Pengguna Lulusan (Perusahaan & Mitra Industri)</span>
          </button>
        </div>

        {/* TAB 1: FORM TRACER STUDY */}
        {activeFormTab === "tracer" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200">
                <Sparkles className="w-3 h-3 text-yellow-600" />
                <span>Terhubung Langsung Memperbarui Capaian IKU 2 Institusi</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Kuesioner Pelacakan Jejak Alumni (Tracer Study)
              </h3>
              <p className="text-xs text-slate-500">
                Bantu almamater Anda memenuhi standar akreditasi LAMEMBA dan BAN-PT dengan mengisi data karir Anda saat ini.
              </p>
            </div>

            {tracerSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{tracerSuccessMessage}</span>
              </div>
            )}

            {tracerErrorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{tracerErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleTracerSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nomor Induk Mahasiswa (NIM) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 202001099"
                    value={tracerForm.nim}
                    onChange={(e) => setTracerForm({ ...tracerForm, nim: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Fadli, S.M."
                    value={tracerForm.name}
                    onChange={(e) => setTracerForm({ ...tracerForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Tahun Kelulusan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={tracerForm.graduationYear}
                    onChange={(e) => setTracerForm({ ...tracerForm, graduationYear: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value={2025}>2025</option>
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                    <option value={2022}>2022</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={tracerForm.phone}
                    onChange={(e) => setTracerForm({ ...tracerForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Alamat Email Aktif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={tracerForm.email}
                    onChange={(e) => setTracerForm({ ...tracerForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Status Aktivitas Saat Ini <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={tracerForm.status}
                    onChange={(e) => setTracerForm({ ...tracerForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-sky-800 bg-sky-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="BEKERJA">Bekerja (Karyawan / ASN / BUMN / Swasta)</option>
                    <option value="WIRAUSAHA">Berwirausaha / Membuka Usaha Mandiri</option>
                    <option value="STUDI_LANJUT">Melanjutkan Studi (Magister / S2)</option>
                    <option value="MENCARI_KERJA">Sedang Mencari Pekerjaan</option>
                  </select>
                </div>
              </div>

              {/* Detail Karir jika bekerja / wirausaha */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold text-slate-800">
                  Rincian Karir & Tempat Bekerja / Usaha
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">
                      Nama Instansi / Perusahaan / Usaha
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: PT Bank Mandiri / Usaha Cafe"
                      value={tracerForm.companyName}
                      onChange={(e) => setTracerForm({ ...tracerForm, companyName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">
                      Posisi / Jabatan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Staff Keuangan / Owner"
                      value={tracerForm.jobTitle}
                      onChange={(e) => setTracerForm({ ...tracerForm, jobTitle: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">
                      Waktu Tunggu Mendapat Kerja (Bulan)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={24}
                      value={tracerForm.waitingTimeMonths}
                      onChange={(e) => setTracerForm({ ...tracerForm, waitingTimeMonths: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">
                      Tingkat Keselarasan Bidang Studi
                    </label>
                    <select
                      value={tracerForm.fieldAlignment}
                      onChange={(e) => setTracerForm({ ...tracerForm, fieldAlignment: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    >
                      <option value="TINGGI">Tinggi (Sesuai Bidang Manajemen)</option>
                      <option value="SEDANG">Sedang (Terkait Ilmu Bisnis/Ekonomi)</option>
                      <option value="RENDAH">Rendah (Luar Bidang Manajemen)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingTracer}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-sky-600/25 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingTracer ? "Menyimpan Data..." : "Kirim Jawaban Tracer Study"}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: FORM EMPLOYER SURVEY */}
        {activeFormTab === "employer" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                <Briefcase className="w-3 h-3 text-purple-600" />
                <span>Standar Pemantauan LAMEMBA & SAN Dikti BAN-PT 2025</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Kuesioner Kepuasan Pengguna Lulusan STIMI YAPMI
              </h3>
              <p className="text-xs text-slate-500">
                Ditujukan kepada pimpinan instansi, atasan langsung, atau divisi HRD tempat lulusan STIMI YAPMI Makassar bekerja.
              </p>
            </div>

            {employerSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{employerSuccessMessage}</span>
              </div>
            )}

            {employerErrorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{employerErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleEmployerSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nama Perusahaan / Instansi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Bank Mandiri (Persero)"
                    value={employerForm.companyName}
                    onChange={(e) => setEmployerForm({ ...employerForm, companyName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nama Penilai / Evaluator <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ir. Herman Syam"
                    value={employerForm.evaluatorName}
                    onChange={(e) => setEmployerForm({ ...employerForm, evaluatorName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Jabatan Penilai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Manager HRD / Branch Manager"
                    value={employerForm.evaluatorPosition}
                    onChange={(e) => setEmployerForm({ ...employerForm, evaluatorPosition: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nama Alumni yang Dinilai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Hidayat, S.M."
                    value={employerForm.alumniName}
                    onChange={(e) => setEmployerForm({ ...employerForm, alumniName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* 7 Competency Scales (1 - 4) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-black text-slate-800">
                  Penilaian 7 Aspek Kemampuan Lulusan (Skala 1 - 4: 1=Kurang, 2=Cukup, 3=Baik, 4=Sangat Baik)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      1. Etika & Integritas: <span className="font-bold text-purple-700">{employerForm.ethicsScore}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={0.1}
                      value={employerForm.ethicsScore}
                      onChange={(e) => setEmployerForm({ ...employerForm, ethicsScore: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      2. Keahlian Manajemen: <span className="font-bold text-purple-700">{employerForm.expertiseScore}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={0.1}
                      value={employerForm.expertiseScore}
                      onChange={(e) => setEmployerForm({ ...employerForm, expertiseScore: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      3. Bahasa Inggris/Asing: <span className="font-bold text-purple-700">{employerForm.englishScore}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={0.1}
                      value={employerForm.englishScore}
                      onChange={(e) => setEmployerForm({ ...employerForm, englishScore: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      4. Penggunaan TI: <span className="font-bold text-purple-700">{employerForm.itSkillScore}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={0.1}
                      value={employerForm.itSkillScore}
                      onChange={(e) => setEmployerForm({ ...employerForm, itSkillScore: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      5. Komunikasi: <span className="font-bold text-purple-700">{employerForm.communicationScore}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={0.1}
                      value={employerForm.communicationScore}
                      onChange={(e) => setEmployerForm({ ...employerForm, communicationScore: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      6. Kerjasama Tim: <span className="font-bold text-purple-700">{employerForm.teamworkScore}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={0.1}
                      value={employerForm.teamworkScore}
                      onChange={(e) => setEmployerForm({ ...employerForm, teamworkScore: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      7. Pengembangan Diri: <span className="font-bold text-purple-700">{employerForm.selfDevelopmentScore}</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={0.1}
                      value={employerForm.selfDevelopmentScore}
                      onChange={(e) => setEmployerForm({ ...employerForm, selfDevelopmentScore: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Umpan Balik & Masukan Kualitas Lulusan
                </label>
                <textarea
                  rows={3}
                  placeholder="Berikan saran bagi kurikulum dan kesiapan kerja lulusan kami..."
                  value={employerForm.feedbackNotes}
                  onChange={(e) => setEmployerForm({ ...employerForm, feedbackNotes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingEmployer}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingEmployer ? "Mengirim Evaluasi..." : "Kirim Evaluasi Pengguna Lulusan"}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
