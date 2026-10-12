"use client";

import { useState, useEffect } from "react";
import { 
  Download, 
  FolderArchive, 
  Printer, 
  FileSpreadsheet, 
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface QuarterInfo {
  quarter: number;
  name: string;
  period: string;
  reportedCount: number;
  approvedCount: number;
  pendingCount: number;
  totalIKU: number;
  averageScore: number;
  status: string;
  statusBadge: string;
}

interface ComparisonRow {
  id: string;
  code: string;
  name: string;
  cluster: string;
  unit: string;
  baseline: number;
  target: number;
  q1: { value: number; status: string; pct: number };
  q2: { value: number; status: string; pct: number };
  q3: { value: number; status: string; pct: number };
  q4: { value: number; status: string; pct: number };
}

interface ReportsData {
  year: number;
  profile: {
    leaderName?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  quarters: QuarterInfo[];
  comparisonTable: ComparisonRow[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [printQuarter, setPrintQuarter] = useState<number | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    async function loadReports() {
      try {
        const res = await fetch(`/api/reports/summary?year=${selectedYear}`);
        const json = await res.json();
        if (isSubscribed && json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Gagal memuat rekap laporan:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }
    loadReports();
    return () => {
      isSubscribed = false;
    };
  }, [selectedYear]);

  const handleDownloadCSV = (quarter: number) => {
    const url = `/api/reports/export?type=achievements&year=${selectedYear}&quarter=${quarter}`;
    window.open(url, "_blank");
  };

  const handleDownloadTargetsCSV = () => {
    const url = `/api/reports/export?type=targets&year=${selectedYear}`;
    window.open(url, "_blank");
  };

  const activePrintQuarterInfo = data?.quarters.find((q) => q.quarter === printQuarter);

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-xs">
            <FolderArchive className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Arsip & Ekspor Laporan Kinerja
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Riwayat pelaporan capaian kinerja triwulan, ekspor spreadsheet, dan cetak dokumen resmi.
            </p>
          </div>
        </div>

        {/* Year Filter */}
        <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500">Tahun Anggaran:</span>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="text-xs font-extrabold text-sky-700 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* Top Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target & Justification Export Card */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-100">
                Data Dasar
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">
                Rekapitulasi Target & Narasi Justifikasi
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Unduh matriks 12 target IKU tahun {selectedYear} lengkap dengan nilai baseline tahun sebelumnya serta catatan justifikasi penurunan target.
            </p>
          </div>

          <div className="bg-sky-50/70 border border-sky-100 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <span className="font-bold text-sky-950 text-xs block">
                  Format Microsoft Excel (.CSV)
                </span>
                <span className="text-[11px] text-sky-700/80">
                  Kompatibel dengan Excel, Google Sheets, dan SPSS
                </span>
              </div>
            </div>

            <button 
              onClick={handleDownloadTargetsCSV}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-sky-600/25 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Target {selectedYear}</span>
            </button>
          </div>
        </motion.div>

        {/* Archival Integrity & Verification Card */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Jaminan Mutu
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">
                Integritas Dokumen & Akuntabilitas
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Setiap capaian yang terekam telah melalui verifikasi dua tingkat: input oleh PIC Unit Kerja dan validasi formal oleh Lembaga Penjaminan Mutu (LPM).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Standar Evaluasi</span>
              <span className="text-xs font-extrabold text-slate-800">12 IKU Kemendikbudristek</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Institusi</span>
              <span className="text-xs font-extrabold text-slate-800">STIMI YAPMI Makassar</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Log Pelaporan Kinerja Triwulan (4 Cards) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Log Pelaporan Kinerja Triwulan (Tahun {selectedYear})
          </h3>
          <p className="text-xs text-slate-500">
            Pilih triwulan untuk mengunduh spreadsheet atau mencetak dokumen rekapitulasi resmi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data?.quarters || [
            { quarter: 1, name: "Triwulan 01 (TW 1)", period: "Januari - Maret", reportedCount: 0, approvedCount: 0, pendingCount: 0, totalIKU: 12, averageScore: 0, status: "Memuat...", statusBadge: "bg-slate-100 text-slate-600" },
            { quarter: 2, name: "Triwulan 02 (TW 2)", period: "April - Juni", reportedCount: 0, approvedCount: 0, pendingCount: 0, totalIKU: 12, averageScore: 0, status: "Memuat...", statusBadge: "bg-slate-100 text-slate-600" },
            { quarter: 3, name: "Triwulan 03 (TW 3)", period: "Juli - September", reportedCount: 0, approvedCount: 0, pendingCount: 0, totalIKU: 12, averageScore: 0, status: "Memuat...", statusBadge: "bg-slate-100 text-slate-600" },
            { quarter: 4, name: "Triwulan 04 (TW 4)", period: "Oktober - Desember", reportedCount: 0, approvedCount: 0, pendingCount: 0, totalIKU: 12, averageScore: 0, status: "Memuat...", statusBadge: "bg-slate-100 text-slate-600" },
          ]).map((q) => (
            <motion.div 
              key={q.quarter}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: q.quarter * 0.06 }}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{q.name}</h4>
                    <span className="text-[11px] text-slate-400 font-medium">{q.period}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${q.statusBadge}`}>
                    {q.status}
                  </span>
                </div>

                <div className="space-y-1.5 py-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Terisi:</span>
                    <span className="font-bold text-slate-700">{q.reportedCount} / {q.totalIKU} IKU</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Disetujui LPM:</span>
                    <span className="font-bold text-emerald-600">{q.approvedCount} IKU</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Rata-rata Skor:</span>
                    <span className="font-bold text-sky-700">{q.averageScore}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
                <button 
                  onClick={() => handleDownloadCSV(q.quarter)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200/80 text-xs font-bold transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                  <span>Ekspor Excel (.CSV)</span>
                </button>

                <button 
                  onClick={() => setPrintQuarter(q.quarter)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Pratinjau / Cetak</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Multi-Quarter Comparison Table (Fitur Khas Dashboard UNJA) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Matriks Komparasi Capaian Sepanjang Tahun ({selectedYear})
            </h3>
            <p className="text-xs text-slate-500">
              Perbandingan tren capaian 12 IKU triwulan 1 s/d triwulan 4 terhadap target tahunan
            </p>
          </div>
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-100">
            12 Indikator Kinerja Utama
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-5">KODE & INDIKATOR</th>
                <th className="py-3.5 px-4">KLASTER</th>
                <th className="py-3.5 px-3 text-center">TARGET</th>
                <th className="py-3.5 px-3 text-center bg-sky-50/40">TW 1</th>
                <th className="py-3.5 px-3 text-center bg-sky-50/40">TW 2</th>
                <th className="py-3.5 px-3 text-center bg-sky-50/40">TW 3</th>
                <th className="py-3.5 px-3 text-center bg-sky-50/40">TW 4</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Memuat matriks perbandingan IKU...
                  </td>
                </tr>
              ) : data?.comparisonTable && data.comparisonTable.length > 0 ? (
                data.comparisonTable.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 max-w-xs">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-100 text-sky-800 mb-1">
                        {row.code}
                      </span>
                      <p className="font-semibold text-slate-900 line-clamp-2 leading-snug">
                        {row.name}
                      </p>
                    </td>

                    <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                      {row.cluster}
                    </td>

                    <td className="py-4 px-3 text-center font-bold text-slate-800 whitespace-nowrap">
                      {row.target} {row.unit}
                    </td>

                    {/* TW 1 */}
                    <td className="py-4 px-3 text-center whitespace-nowrap bg-sky-50/20">
                      {row.q1.value > 0 ? (
                        <div>
                          <span className="font-bold text-slate-900">{row.q1.value}</span>
                          <span className={`block text-[10px] font-bold ${row.q1.pct >= 80 ? 'text-emerald-600' : 'text-sky-600'}`}>
                            {row.q1.pct}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* TW 2 */}
                    <td className="py-4 px-3 text-center whitespace-nowrap bg-sky-50/20">
                      {row.q2.value > 0 ? (
                        <div>
                          <span className="font-bold text-slate-900">{row.q2.value}</span>
                          <span className={`block text-[10px] font-bold ${row.q2.pct >= 80 ? 'text-emerald-600' : 'text-sky-600'}`}>
                            {row.q2.pct}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* TW 3 */}
                    <td className="py-4 px-3 text-center whitespace-nowrap bg-sky-50/20">
                      {row.q3.value > 0 ? (
                        <div>
                          <span className="font-bold text-slate-900">{row.q3.value}</span>
                          <span className={`block text-[10px] font-bold ${row.q3.pct >= 80 ? 'text-emerald-600' : 'text-sky-600'}`}>
                            {row.q3.pct}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* TW 4 */}
                    <td className="py-4 px-3 text-center whitespace-nowrap bg-sky-50/20">
                      {row.q4.value > 0 ? (
                        <div>
                          <span className="font-bold text-slate-900">{row.q4.value}</span>
                          <span className={`block text-[10px] font-bold ${row.q4.pct >= 80 ? 'text-emerald-600' : 'text-sky-600'}`}>
                            {row.q4.pct}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Tidak ada data rekapitulasi untuk tahun {selectedYear}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Print Preview Modal */}
      <AnimatePresence>
        {printQuarter !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-10 max-w-4xl w-full shadow-2xl border border-slate-200 my-8 relative overflow-hidden"
            >
              {/* Modal Top Actions (Hidden in Print) */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-100 text-sky-800">
                    Format Dokumen Cetak / PDF
                  </span>
                  <span className="text-xs text-slate-500">
                    Triwulan {printQuarter} Tahun {selectedYear}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-bold text-xs shadow-md shadow-sky-600/25 hover:from-sky-700 hover:to-cyan-700 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Dokumen / Simpan PDF</span>
                  </button>
                  <button
                    onClick={() => setPrintQuarter(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Document Sheet */}
              <div className="space-y-6 text-slate-900 font-sans print:p-0">
                {/* Official Letterhead (KOP Kampus) */}
                <div className="flex items-center gap-5 pb-5 border-b-2 border-slate-900">
                  <div className="relative w-16 h-16 shrink-0">
                    <Image 
                      src="/logo_stimi.png" 
                      alt="Logo STIMI" 
                      fill 
                      className="object-contain" 
                      priority
                    />
                  </div>
                  <div className="flex-1 text-center pr-12">
                    <h2 className="text-lg font-black tracking-wide uppercase text-slate-950">
                      SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA
                    </h2>
                    <h3 className="text-base font-extrabold text-sky-800 tracking-tight">
                      STIMI YAPMI MAKASSAR
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {data?.profile?.address || "Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Makassar"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Email: {data?.profile?.email || "info@stimi-yapmi.ac.id"} | Telp: {data?.profile?.phone || "(0411) 852123"}
                    </p>
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-black underline tracking-tight uppercase">
                    LAPORAN CAPAIAN INDIKATOR KINERJA UTAMA (IKU)
                  </h4>
                  <p className="text-xs font-semibold text-slate-700">
                    Periode: Triwulan {printQuarter} ({activePrintQuarterInfo?.period}) • Tahun Anggaran {selectedYear}
                  </p>
                </div>

                {/* Performance Summary Statistics */}
                <div className="grid grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Total Indikator</span>
                    <span className="font-extrabold text-slate-900">12 IKU</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Telah Dilaporkan</span>
                    <span className="font-extrabold text-cyan-700">{activePrintQuarterInfo?.reportedCount || 0} IKU</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Disetujui LPM</span>
                    <span className="font-extrabold text-emerald-700">{activePrintQuarterInfo?.approvedCount || 0} IKU</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Rata-rata Capaian</span>
                    <span className="font-extrabold text-sky-800">{activePrintQuarterInfo?.averageScore || 0}%</span>
                  </div>
                </div>

                {/* Table of 12 IKUs for this Quarter */}
                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center">NO</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 w-24">KODE</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">INDIKATOR KINERJA</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 text-center w-24">TARGET</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 text-center w-24">REALISASI</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">%</th>
                        <th className="py-2.5 px-3 text-center w-24">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {data?.comparisonTable.map((row, idx) => {
                        const qData = printQuarter === 1 ? row.q1 : printQuarter === 2 ? row.q2 : printQuarter === 3 ? row.q3 : row.q4;
                        return (
                          <tr key={row.id}>
                            <td className="py-2 px-3 border-r border-slate-200 text-center">{idx + 1}</td>
                            <td className="py-2 px-3 border-r border-slate-200 font-bold">{row.code}</td>
                            <td className="py-2 px-3 border-r border-slate-200 leading-tight">{row.name}</td>
                            <td className="py-2 px-3 border-r border-slate-200 text-center">{row.target} {row.unit}</td>
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">{qData.value > 0 ? `${qData.value} ${row.unit}` : "-"}</td>
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">{qData.value > 0 ? `${qData.pct}%` : "-"}</td>
                            <td className="py-2 px-3 text-center">
                              <span className="text-[10px] font-bold">
                                {qData.status === "Disetujui" ? "TERVALIDASI" : qData.status === "pendingDiajukan" ? "DIAJUKAN" : "BELUM"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Sign-off / Signature Area */}
                <div className="pt-8 grid grid-cols-2 text-center text-xs">
                  <div className="space-y-16">
                    <div>
                      <p className="font-semibold text-slate-600">Diverifikasi & Divalidasi oleh:</p>
                      <p className="font-bold text-slate-900">Lembaga Penjaminan Mutu (LPM)</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 underline">Tim LPM STIMI YAPMI</p>
                      <p className="text-[11px] text-slate-500">NIDN. 0912048101</p>
                    </div>
                  </div>

                  <div className="space-y-16">
                    <div>
                      <p className="font-semibold text-slate-600">Makassar, {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="font-bold text-slate-900">Ketua STIMI YAPMI Makassar</p>
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 underline">{data?.profile?.leaderName || "Dr. H. Rahman, M.M."}</p>
                      <p className="text-[11px] text-slate-500">NIDN. 0905087302</p>
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
