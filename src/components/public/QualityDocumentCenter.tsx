"use client";

import { useState } from "react";
import { 
  FileText, 
  Download, 
  Search, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentItem {
  id: string;
  title: string;
  code: string;
  category: "Kebijakan & Manual" | "Instrumen Akreditasi" | "Laporan Hasil Audit";
  standard: string;
  size: string;
  pages: number;
  releaseDate: string;
  description: string;
  fileUrl: string;
  isVerified: boolean;
}

export default function QualityDocumentCenter() {
  const [selectedCategory, setSelectedCategory] = useState<string>("SEMUA");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [downloadModalDoc, setDownloadModalDoc] = useState<DocumentItem | null>(null);

  const documents: DocumentItem[] = [
    {
      id: "doc-1",
      title: "Buku Kebijakan Sistem Penjaminan Mutu Internal (SPMI) STIMI YAPMI Makassar",
      code: "SK Ketua STIMI No. 042/SK/YAPMI/I/2026",
      category: "Kebijakan & Manual",
      standard: "Permendiktisaintek No. 39/2025 jo. No. 10/2026",
      size: "2.4 MB",
      pages: 48,
      releaseDate: "15 Januari 2026",
      description: "Landasan filosofis, komitmen pimpinan, dan arah kebijakan mutu institusi STIMI YAPMI Makassar dalam mengawal Tri Dharma Perguruan Tinggi yang akuntabel.",
      fileUrl: "#",
      isVerified: true,
    },
    {
      id: "doc-2",
      title: "Buku Standar Mutu 12 Indikator Kinerja Utama (IKU) & Rubrik Penilaian",
      code: "SK LPM No. 018/LPM/STIMI/II/2026",
      category: "Instrumen Akreditasi",
      standard: "SAN Dikti Peraturan BAN-PT No. 20/2025 & LAMEMBA",
      size: "3.8 MB",
      pages: 72,
      releaseDate: "02 Februari 2026",
      description: "Definisi operasional, target baseline, rumus perhitungan capaian, dan mekanisme verifikasi dokumen bukti pendukung untuk 12 IKU perguruan tinggi.",
      fileUrl: "#",
      isVerified: true,
    },
    {
      id: "doc-3",
      title: "Manual Prosedur Operasional Siklus Mutu PPEPP & Instrumen Audit Mutu Internal",
      code: "SOP-SPMI No. 009/SOP-LPM/STIMI/2026",
      category: "Kebijakan & Manual",
      standard: "Siklus PPEPP SN-Dikti",
      size: "1.9 MB",
      pages: 36,
      releaseDate: "20 Februari 2026",
      description: "Panduan teknis pelaksanaan 5 tahapan PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan) serta kode etik auditor mutu internal.",
      fileUrl: "#",
      isVerified: true,
    },
    {
      id: "doc-4",
      title: "Ringkasan Eksekutif Laporan Audit Mutu Internal (AMI) & Risalah RTM 2025/2026",
      code: "LAP-AMI No. 003/AMI-LPM/2026",
      category: "Laporan Hasil Audit",
      standard: "Rapat Tinjauan Manajemen (RTM)",
      size: "4.1 MB",
      pages: 54,
      releaseDate: "10 Maret 2026",
      description: "Temuan audit kepatuhan IKU seluruh unit kerja, matriks risiko, dan rekomendasi Rencana Tindak Lanjut (RTL) yang diputuskan oleh Ketua STIMI YAPMI Makassar.",
      fileUrl: "#",
      isVerified: true,
    },
  ];

  const categories = [
    { id: "SEMUA", label: "Semua Dokumen" },
    { id: "Kebijakan & Manual", label: "Kebijakan & Manual" },
    { id: "Instrumen Akreditasi", label: "Instrumen Akreditasi" },
    { id: "Laporan Hasil Audit", label: "Laporan Hasil Audit" },
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === "SEMUA" || doc.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.standard.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownloadClick = (doc: DocumentItem) => {
    setDownloadModalDoc(doc);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-slate-400 self-end sm:self-auto">
            {filteredDocs.length} Dokumen Tersedia
          </span>
        </div>

        {/* Search Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dokumen kebijakan mutu, SOP, SK, standar akreditasi LAMEMBA..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Document Cards Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-slate-800 text-sm">Dokumen Tidak Ditemukan</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada dokumen yang sesuai dengan pencarian &quot;{searchQuery}&quot;.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("SEMUA");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors"
          >
            Tampilkan Semua Dokumen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredDocs.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between group space-y-5"
              >
                <div className="space-y-4">
                  {/* Top Meta */}
                  <div className="flex justify-between items-start gap-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black bg-sky-50 text-sky-700 border border-sky-100">
                      {doc.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Terverifikasi LPM</span>
                    </div>
                  </div>

                  {/* Title & Legal Code */}
                  <div className="space-y-1.5">
                    <h4 className="font-black text-slate-900 text-base leading-snug group-hover:text-sky-700 transition-colors">
                      {doc.title}
                    </h4>
                    <p className="text-xs font-semibold text-sky-700 font-mono">
                      {doc.code}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {doc.description}
                  </p>

                  {/* Standard & Date Meta */}
                  <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 font-semibold block uppercase text-[10px]">Landasan Regulasi</span>
                      <span className="font-bold text-slate-800 line-clamp-1">{doc.standard}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 font-semibold block uppercase text-[10px]">Ukuran / Format</span>
                      <span className="font-bold text-slate-800">{doc.size} • {doc.pages} Hal (PDF)</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Rilis: {doc.releaseDate}</span>
                  </div>

                  <button
                    onClick={() => handleDownloadClick(doc)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Akses Dokumen</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Information Banner Regarding Open Quality Assurance */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-900 to-cyan-950 text-white border border-sky-800/40 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-cyan-300" />
          </div>
          <div>
            <h5 className="font-extrabold text-sm sm:text-base text-white">
              Keterbukaan Informasi Instrumen SPMI STIMI YAPMI Makassar
            </h5>
            <p className="text-xs text-sky-200/80 mt-0.5 max-w-2xl leading-relaxed">
              Seluruh dokumen mutu dipublikasikan secara transparan untuk memenuhi asas akuntabilitas publik dan persyaratan akreditasi institusi BAN-PT & LAMEMBA.
            </p>
          </div>
        </div>

        <a
          href="/dashboard/reports"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all shrink-0"
        >
          <span>Pusat Arsip Internal</span>
          <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
        </a>
      </div>

      {/* Download / Verification Modal */}
      <AnimatePresence>
        {downloadModalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Dokumen Sah Ber-barcode LPM
                  </span>
                  <h4 className="font-black text-slate-900 text-base leading-snug">
                    {downloadModalDoc.title}
                  </h4>
                  <p className="text-xs font-mono text-sky-700">
                    {downloadModalDoc.code}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Standar Acuan:</span>
                  <span className="font-bold text-slate-800">{downloadModalDoc.standard}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tanggal Pengesahan:</span>
                  <span className="font-bold text-slate-800">{downloadModalDoc.releaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Halaman:</span>
                  <span className="font-bold text-slate-800">{downloadModalDoc.pages} Halaman (PDF)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Integritas Dokumen:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tanda Tangan Digital Ketua LPM
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDownloadModalDoc(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  Tutup
                </button>
                <a
                  href={`/api/reports/export?type=targets&year=2026`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setDownloadModalDoc(null)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Dokumen PDF</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
