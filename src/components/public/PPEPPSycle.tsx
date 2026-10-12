"use client";

import { useState } from "react";
import { 
  FileCheck2, 
  Workflow, 
  ClipboardCheck, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle,
  FileText,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StepDetail {
  code: string;
  name: string;
  subtitle: string;
  icon: typeof FileCheck2;
  color: string;
  bgLight: string;
  borderLight: string;
  penanggungJawab: string;
  periode: string;
  dokumenOutput: string[];
  deskripsi: string;
  aturanTerkait: string;
}

export default function PPEPPSycle() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps: StepDetail[] = [
    {
      code: "P",
      name: "Penetapan",
      subtitle: "Penetapan Standar & Target 12 IKU",
      icon: FileCheck2,
      color: "text-sky-600",
      bgLight: "bg-sky-50",
      borderLight: "border-sky-200",
      penanggungJawab: "Ketua STIMI YAPMI & Lembaga Penjaminan Mutu (LPM)",
      periode: "Awal Tahun Anggaran (Januari)",
      dokumenOutput: [
        "SK Penetapan Target 12 IKU Tahun Berjalan",
        "Buku Standar Penjaminan Mutu Internal (SPMI)",
        "Kontrak Kinerja Pimpinan dengan Unit Kerja"
      ],
      deskripsi: "Tahap perumusan dan penetapan standar mutu perguruan tinggi serta target terukur untuk 12 Indikator Kinerja Utama. Standar ini disusun melampaui Standar Nasional Pendidikan Tinggi (SN-Dikti) dengan diferensiasi misi sekolah tinggi manajemen.",
      aturanTerkait: "Permendiktisaintek No. 39/2025 Pasal 4 (Standar Pendidikan Tinggi Berbasis Luaran)"
    },
    {
      code: "P",
      name: "Pelaksanaan",
      subtitle: "Implementasi Tridharma & Pengumpulan Bukti",
      icon: Workflow,
      color: "text-cyan-600",
      bgLight: "bg-cyan-50",
      borderLight: "border-cyan-200",
      penanggungJawab: "Wakil Ketua I, II, III & Seluruh Unit Kerja (PIC IKU)",
      periode: "Sepanjang Tahun (TW 1 s/d TW 4)",
      dokumenOutput: [
        "Log Realisasi Capaian Triwulanan",
        "Repositori Bukti Dukung Digital (Google Drive / SK / Surat Tugas)",
        "Rekapitulasi Kemitraan DUDI & Tracer Study Lulusan"
      ],
      deskripsi: "Unit kerja melaksanakan kegiatan operasional tridharma perguruan tinggi sesuai tupoksi masing-masing. Seluruh realisasi diinput ke dalam sistem MANTAU IKU beserta bukti autentik digital untuk menjamin ketertelusuran dokumen (*traceability*).",
      aturanTerkait: "Permendiktisaintek No. 39/2025 Pasal 12 & SAN Dikti BAN-PT 2025"
    },
    {
      code: "E",
      name: "Evaluasi",
      subtitle: "Audit Mutu Internal (AMI) & Verifikasi Capaian",
      icon: ClipboardCheck,
      color: "text-indigo-600",
      bgLight: "bg-indigo-50",
      borderLight: "border-indigo-200",
      penanggungJawab: "Auditor Internal LPM & Tim Penjaminan Mutu",
      periode: "Triwulanan & Semesteran",
      dokumenOutput: [
        "Laporan Hasil Audit Mutu Internal (AMI)",
        "Berita Acara Verifikasi Berkas Bukti Dukung",
        "Matriks Komparasi Target vs Realisasi 12 IKU"
      ],
      deskripsi: "Lembaga Penjaminan Mutu (LPM) melakukan verifikasi atas capaian yang dilaporkan oleh unit kerja. Auditor menguji keabsahan bukti dukung, memvalidasi perhitungan persentase ketercapaian, dan mengidentifikasi deviasi terhadap target.",
      aturanTerkait: "Permendiktisaintek No. 10/2026 Pasal 18 (Mekanisme Evaluasi Mutu Berkala)"
    },
    {
      code: "P",
      name: "Pengendalian",
      subtitle: "Rapat Tinjauan Manajemen (RTM) & Rencana Tindak Lanjut",
      icon: AlertTriangle,
      color: "text-amber-600",
      bgLight: "bg-amber-50",
      borderLight: "border-amber-200",
      penanggungJawab: "Rapat Pleno Pimpinan & LPM STIMI YAPMI",
      periode: "Tiap Akhir Triwulan",
      dokumenOutput: [
        "Notulen & Rekomendasi Rapat Tinjauan Manajemen (RTM)",
        "Formulir Rencana Tindak Lanjut (RTL) Indikator Kritis",
        "Early Warning Alert untuk IKU Kategori Merah & Kuning"
      ],
      deskripsi: "Jika ditemukan indikator yang belum mencapai target (kategori merah/kuning), pimpinan bersama LPM menggelar RTM untuk menganalisis akar masalah (*root cause analysis*) dan merumuskan intervensi korektif yang terikat batas waktu.",
      aturanTerkait: "Permendiktisaintek No. 39/2025 Pasal 23 (Tindakan Pengendalian Mutu)"
    },
    {
      code: "P",
      name: "Peningkatan",
      subtitle: "Peningkatan Standar (*Continuous Improvement*)",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgLight: "bg-emerald-50",
      borderLight: "border-emerald-200",
      penanggungJawab: "Ketua STIMI YAPMI, Senat & Dewan Pembina",
      periode: "Tahunan (Desember - Januari)",
      dokumenOutput: [
        "SK Peningkatan Standar SPMI Periode Baru",
        "Laporan Akuntabilitas Kinerja Institusi Tahunan",
        "Portofolio Kesiapan Re-Akreditasi LAMEMBA"
      ],
      deskripsi: "Indikator yang telah berhasil melampaui target (kategori hijau) ditingkatkan nilai ambang batasnya untuk tahun berikutnya (*Kaizen*). STIMI YAPMI memastikan standar mutu tidak stagnan, melainkan terus naik menuju rekognisi unggul.",
      aturanTerkait: "Permendiktisaintek No. 10/2026 Pasal 27 & Standar Kriteria 9 LAMEMBA"
    }
  ];

  const current = steps[activeStep];
  const StepIcon = current.icon;

  return (
    <div className="space-y-8">
      {/* Step Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          const Icon = step.icon;

          return (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive 
                  ? "bg-white border-sky-500 shadow-md shadow-sky-500/10 ring-2 ring-sky-500/20" 
                  : "bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                  isActive ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {step.code}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? step.color : "text-slate-400"}`} />
              </div>

              <div>
                <h4 className={`text-xs font-extrabold ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                  {step.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {step.subtitle}
                </p>
              </div>

              {isActive && (
                <motion.div 
                  layoutId="activePillIndicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-600 to-cyan-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Step Deep Detail Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-xs space-y-6"
        >
          {/* Header of Active Step */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${current.bgLight} border ${current.borderLight} flex items-center justify-center shrink-0`}>
                <StepIcon className={`w-7 h-7 ${current.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${current.bgLight} ${current.color}`}>
                    Tahap {activeStep + 1} dari 5
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">•</span>
                  <span className="text-xs font-semibold text-slate-500">{current.periode}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Siklus {current.name}: {current.subtitle}
                </h3>
              </div>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Rujukan Hukum</span>
              <span className="inline-block text-xs font-extrabold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                {current.aturanTerkait}
              </span>
            </div>
          </div>

          {/* Description & Narrative */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Uraian Mekanisme Penjaminan Mutu
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {current.deskripsi}
            </p>
          </div>

          {/* 2-Columns Info: PIC & Output Dokumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Penanggung Jawab Siklus:</span>
              </div>
              <p className="text-xs font-semibold text-slate-700">
                {current.penanggungJawab}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <FileText className="w-4 h-4 text-cyan-600" />
                <span>Dokumen Bukti Output (*Audit-Ready*):</span>
              </div>
              <ul className="space-y-1">
                {current.dokumenOutput.map((dok, dIdx) => (
                  <li key={dIdx} className="text-xs text-slate-600 flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{dok}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
