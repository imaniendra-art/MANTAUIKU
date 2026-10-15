"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  BookOpen, 
  ShieldCheck, 
  Award, 
  FileText, 
  Printer, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Save, 
  X,
  Search,
  Filter,
  Building2,
  Calendar,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ISpmiDocument, ISpmiStandardItem, ISpmiFormItem } from "@/models/SpmiDocument";

export default function SpmiDashboardPage() {
  const { data: session } = useSession();
  const isLpm = session?.user?.role === "LPM";

  const [activeBook, setActiveBook] = useState<"KEBIJAKAN" | "MANUAL" | "STANDAR" | "FORMULIR">("STANDAR");
  const [documents, setDocuments] = useState<ISpmiDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter for Standards
  const [standardCategory, setStandardCategory] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<ISpmiStandardItem | null>(null);
  const [isEditStandardModalOpen, setIsEditStandardModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form state for editing a standard
  const [editForm, setEditForm] = useState({
    name: "",
    statement: "",
    targetValue: "",
    responsibleUnit: "",
    strategiesText: "",
    indicatorsText: "",
  });

  const loadData = async () => {
    try {
      const res = await fetch("/api/spmi/documents");
      const json = await res.json();

      if (json.success) {
        setDocuments(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load SPMI documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeSpmi = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/spmi/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        await loadData();
      }
    } catch (err) {
      console.error("Gagal menginisialisasi SPMI:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSpmi = async () => {
    if (!confirm("Kosongkan seluruh pangkalan data SPMI? Indikator SPMI di Akreditasi Institusi akan otomatis berubah menjadi MERAH (Belum Memenuhi).")) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/spmi/documents", { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        await loadData();
      }
    } catch (err) {
      console.error("Gagal mengosongkan SPMI:", err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentDoc = documents.find((d) => d.bookType === activeBook) || documents[0];

  const standardsDoc = documents.find((d) => d.bookType === "STANDAR");
  const allStandards = standardsDoc?.standards || [];

  const filteredStandards = allStandards.filter((std) => {
    const matchesCategory = standardCategory === "ALL" || std.category === standardCategory;
    const matchesSearch =
      std.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.responsibleUnit.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openEditStandard = (std: ISpmiStandardItem) => {
    setSelectedStandard(std);
    setEditForm({
      name: std.name,
      statement: std.statement,
      targetValue: std.targetValue,
      responsibleUnit: std.responsibleUnit,
      strategiesText: std.strategies.join("\n"),
      indicatorsText: std.indicators.join("\n"),
    });
    setSaveMessage(null);
    setIsEditStandardModalOpen(true);
  };

  const handleSaveStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standardsDoc || !selectedStandard) return;

    setIsSaving(true);
    setSaveMessage(null);

    const updatedStandards = standardsDoc.standards.map((s) => {
      if (s.code === selectedStandard.code) {
        return {
          ...s,
          name: editForm.name,
          statement: editForm.statement,
          targetValue: editForm.targetValue,
          responsibleUnit: editForm.responsibleUnit,
          strategies: editForm.strategiesText.split("\n").filter((t) => t.trim() !== ""),
          indicators: editForm.indicatorsText.split("\n").filter((t) => t.trim() !== ""),
        };
      }
      return s;
    });

    try {
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: standardsDoc._id,
          standards: updatedStandards,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaveMessage("Standar SPMI berhasil diperbarui!");
        await loadData();
        setTimeout(() => {
          setIsEditStandardModalOpen(false);
        }, 1000);
      } else {
        setSaveMessage(json.error || "Gagal memperbarui standar.");
      }
    } catch {
      setSaveMessage("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Bar */}
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-sky-950/10 border border-sky-700/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-semibold backdrop-blur-md">
            <BookOpen className="w-4 h-4 text-cyan-300" />
            <span>Pusat Mutu Internal • Standar Permendiktisaintek No. 39/2025</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Pusat Dokumen & Standar SPMI (4 Buku)
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed">
            Sistem perumusan, pengesahan, dan pengkompilasian 4 Buku SPMI Baku STIMI YAPMI Makassar (Kebijakan, Manual, Standar, & Formulir). Menghasilkan berkas resmi bersertifikasi yang siap diunggah ke portal nasional <strong>spmi.kemdiktisaintek.go.id</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {documents.length > 0 ? (
            <button
              onClick={handleClearSpmi}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs transition-all hover:scale-[1.02] cursor-pointer"
              title="Kosongkan SPMI untuk menguji reaksi status Merah di Akreditasi Institusi"
            >
              <span>{isSaving ? "Memproses..." : "Kosongkan SPMI (Uji Reset)"}</span>
            </button>
          ) : (
            <button
              onClick={handleInitializeSpmi}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSaving ? "Menerbitkan..." : "Inisialisasi 4 Buku SPMI"}</span>
            </button>
          )}

          <button
            onClick={() => setIsPrintModalOpen(true)}
            disabled={documents.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              documents.length === 0
                ? "bg-white/10 text-slate-400 cursor-not-allowed opacity-60 border border-white/10"
                : "bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white shadow-lg shadow-cyan-500/25 hover:scale-[1.02]"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Kompilasi & Cetak PDF Kop Resmi</span>
          </button>

          <a
            href="https://spmi.kemdiktisaintek.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Portal SPMI Kemdiktisaintek</span>
          </a>
        </div>
      </div>

      {/* 2. Navigasi 4 Buku SPMI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            type: "KEBIJAKAN" as const,
            num: 1,
            label: "Buku I: Kebijakan SPMI",
            desc: "Arah mutu, asas, & struktur LPM",
            color: "from-sky-600 to-blue-700",
          },
          {
            type: "MANUAL" as const,
            num: 2,
            label: "Buku II: Manual Mutu",
            desc: "SOP Siklus PPEPP komprehensif",
            color: "from-cyan-600 to-teal-700",
          },
          {
            type: "STANDAR" as const,
            num: 3,
            label: "Buku III: Standar Mutu",
            desc: "Pendidikan, Riset, PkM, & Pamong",
            color: "from-indigo-600 to-blue-800",
          },
          {
            type: "FORMULIR" as const,
            num: 4,
            label: "Buku IV: Formulir Mutu",
            desc: "Instrumen AMI, PTK, & RTM",
            color: "from-emerald-600 to-teal-800",
          },
        ].map((tab) => {
          const isActive = activeBook === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveBook(tab.type)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                isActive
                  ? "bg-white border-sky-500 shadow-md ring-2 ring-sky-200"
                  : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md text-white bg-gradient-to-r ${tab.color}`}>
                  BUKU {tab.num}
                </span>
                {isActive && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
              </div>
              <h4 className="text-xs font-black text-slate-900">{tab.label}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-1">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Memuat berkas 4 Buku SPMI...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-amber-300/80 text-center max-w-3xl mx-auto shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              Kondisi Riil: Pangkalan Data Dokumen SPMI Sedang Kosong (0 Berkas)
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              4 Buku SPMI Belum Tersedia di Sistem
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
              Sesuai pengujian live audit: Ketika data SPMI di sini kosong, indikator <strong>#1 Budaya Mutu SPMI 4 Aspek</strong>, <strong>#2 Siklus PPEPP</strong>, dan <strong>#3 Pelaporan SPMI</strong> pada Tab <strong>Akreditasi Institusi (IAPT 4.1)</strong> secara otomatis menampilkan tanda bahaya <strong className="text-rose-600">🔴 BELUM MEMENUHI / Bukti Digital Kosong</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5 max-w-xl mx-auto">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>Dampak Langsung ke Audit Akreditasi Institusi (IAPT 4.1):</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Butir #1 (SPMI 4 Aspek): <strong>🔴 Syarat Perlu GUGUR</strong> (skor ambang SN-Dikti belum tercapai).</li>
              <li>Butir #2 (Siklus PPEPP Konsisten): <strong>🔴 Syarat Perlu GUGUR</strong>.</li>
              <li>Status Rekomendasi Institusi: <strong>🔴 TIDAK TERAKREDITASI</strong> hingga 4 Buku SPMI diterbitkan dan disahkan.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleInitializeSpmi}
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-sky-600/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSaving ? "Sedang Menerbitkan 4 Buku..." : "Inisialisasi 4 Buku SPMI Sekarang"}</span>
            </button>
            <a
              href="/dashboard/accreditation"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Cek Bukti di Tab Akreditasi (IAPT 4.1)</span>
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Metadata Card Dokumen Terpilih */}
          {currentDoc && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-black text-xs">
                    {currentDoc.code}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Versi: {currentDoc.version}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                    <Check className="w-3 h-3" />
                    <span>{currentDoc.status.replace("_", " ")}</span>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-950">
                  {currentDoc.title}
                </h3>
                <p className="text-xs text-slate-600">
                  Dasar Hukum: <strong>{currentDoc.skNumber}</strong> • Berlaku:{" "}
                  {new Date(currentDoc.validFrom).toLocaleDateString("id-ID", { dateStyle: "medium" })} s.d.{" "}
                  {new Date(currentDoc.validUntil).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                </p>
              </div>

              <div className="text-right text-xs border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 space-y-0.5">
                <span className="text-slate-400 font-semibold block">Ditetapkan oleh:</span>
                <strong className="text-slate-900 block font-bold">{currentDoc.signedBy.name}</strong>
                <span className="text-slate-500 block text-[11px]">{currentDoc.signedBy.title}</span>
              </div>
            </div>
          )}

          {/* TAB CONTENT: BUKU 1 - KEBIJAKAN */}
          {activeBook === "KEBIJAKAN" && currentDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentDoc.sections.map((sec) => (
                  <div key={sec.order} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center">
                        {sec.order}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">{sec.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: BUKU 2 - MANUAL PPEPP */}
          {activeBook === "MANUAL" && currentDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {["Penetapan (P)", "Pelaksanaan (P)", "Evaluasi (E)", "Pengendalian (P)", "Peningkatan (P)"].map((step, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-center space-y-1">
                    <span className="w-7 h-7 mx-auto rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h5 className="text-xs font-black text-sky-950">{step}</h5>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {currentDoc.sections.map((sec) => (
                  <div key={sec.order} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-cyan-100 text-cyan-800 font-black text-xs">
                        Manual #{sec.order}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">{sec.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT: BUKU 3 - STANDAR SPMI */}
          {activeBook === "STANDAR" && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari kode standar, nama standar, atau unit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                  {[
                    { id: "ALL", label: "Semua Rumpun" },
                    { id: "PENDIDIKAN", label: "Pendidikan OBE" },
                    { id: "PENELITIAN", label: "Penelitian LPPM" },
                    { id: "PENGABDIAN", label: "PkM LPPM" },
                    { id: "SDM_SARPRAS_KEUANGAN", label: "SDM & Sarpras" },
                    { id: "TATA_PAMONG", label: "Tata Pamong" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setStandardCategory(cat.id)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        standardCategory === cat.id
                          ? "bg-white text-sky-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Standard Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
                  <span>Menampilkan {filteredStandards.length} Butir Standar SPMI Baku</span>
                  <span className="text-sky-700">Terintegrasi Langsung ke Modul AMI Siklus IX</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredStandards.map((std) => (
                    <div
                      key={std.code}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
                    >
                      {/* Top Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-indigo-900 text-white font-black text-xs flex items-center justify-center">
                            {std.code}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                            {std.category.replace("_", " ")}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700">
                            Unit: {std.responsibleUnit}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Evaluasi AMI: {std.ppeppCycle.evaluasiAmiStatus}
                          </span>
                          {isLpm && (
                            <button
                              onClick={() => openEditStandard(std)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Standar</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Standar Name & Pernyataan */}
                      <div className="space-y-2">
                        <h3 className="text-base font-black text-slate-900">{std.name}</h3>
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <strong className="text-slate-900">Pernyataan Standar SPMI: </strong>
                          {std.statement}
                        </p>
                      </div>

                      {/* Target & Indikator */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 space-y-1.5">
                          <span className="font-bold text-indigo-950 block">Target Capaian Mutu:</span>
                          <p className="text-indigo-900 font-extrabold text-[11px]">{std.targetValue}</p>
                          <div className="pt-1.5 border-t border-indigo-100 text-slate-600 text-[11px]">
                            <strong>Indikator Ketercapaian:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                              {std.indicators.map((ind, i) => (
                                <li key={i}>{ind}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100/80 space-y-1.5">
                          <span className="font-bold text-sky-950 block">Strategi Pelaksanaan:</span>
                          <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                            {std.strategies.map((strat, i) => (
                              <li key={i}>{strat}</li>
                            ))}
                          </ul>
                          <div className="pt-1.5 border-t border-sky-100 text-[11px] text-slate-600">
                            <strong>Siklus Peningkatan:</strong> {std.ppeppCycle.peningkatanTarget}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: BUKU 4 - FORMULIR MUTU */}
          {activeBook === "FORMULIR" && currentDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentDoc.forms.map((form) => (
                  <div key={form.code} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs">
                        {form.code}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Sasaran: {form.targetUser}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900">{form.name}</h4>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <strong>Tujuan & Fungsi:</strong> {form.purpose}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Formulir Terstandarisasi LPM</span>
                      </span>
                      <button
                        onClick={() => setIsPrintModalOpen(true)}
                        className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Format Cetak</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL EDIT STANDAR (LPM ONLY) */}
      <AnimatePresence>
        {isEditStandardModalOpen && selectedStandard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsEditStandardModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-black text-sky-700 uppercase tracking-wider">
                  Perumusan Butir Standar • {selectedStandard.code}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Update Parameter Standar SPMI
                </h3>
              </div>

              <form onSubmit={handleSaveStandard} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Standar</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-3 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pernyataan Isi Standar</label>
                  <textarea
                    rows={3}
                    value={editForm.statement}
                    onChange={(e) => setEditForm({ ...editForm, statement: e.target.value })}
                    className="w-full p-3 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Target Capaian Institusi</label>
                    <input
                      type="text"
                      value={editForm.targetValue}
                      onChange={(e) => setEditForm({ ...editForm, targetValue: e.target.value })}
                      className="w-full p-3 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Unit Penanggung Jawab</label>
                    <input
                      type="text"
                      value={editForm.responsibleUnit}
                      onChange={(e) => setEditForm({ ...editForm, responsibleUnit: e.target.value })}
                      className="w-full p-3 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Indikator Ketercapaian (Pisahkan dengan baris baru)
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.indicatorsText}
                    onChange={(e) => setEditForm({ ...editForm, indicatorsText: e.target.value })}
                    className="w-full p-3 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Strategi Pencapaian Mutu (Pisahkan dengan baris baru)
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.strategiesText}
                    onChange={(e) => setEditForm({ ...editForm, strategiesText: e.target.value })}
                    className="w-full p-3 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {saveMessage && (
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800">
                    {saveMessage}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditStandardModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-sky-600 to-cyan-600 text-white hover:from-sky-700 hover:to-cyan-700 shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Menyimpan..." : "Simpan Standar"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CETAK PDF DOKUMEN RESMI BUNDEL 4 BUKU */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Pratinjau Kompilasi Dokumen SPMI STIMI YAPMI
                    </h3>
                    <p className="text-xs text-slate-500">
                      Dokumen resmi ber-kop surat, siap cetak / simpan PDF untuk pelaporan Kemdiktisaintek
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* KOP RESMI STIMI YAPMI */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 text-slate-900">
                <div className="border-b-2 border-double border-slate-800 pb-4 text-center space-y-1">
                  <h4 className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                    Yayasan Pendidikan Manajemen Indonesia (YAPMI)
                  </h4>
                  <h2 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                    Sekolah Tinggi Ilmu Manajemen (STIMI) YAPMI Makassar
                  </h2>
                  <h3 className="text-xs font-black text-sky-800 uppercase">
                    Lembaga Penjaminan Mutu (LPM)
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Jalan Perintis Kemerdekaan KM. 9 No. 84, Tamalanrea, Kota Makassar, Sulawesi Selatan 90245 • Website: stimi.ac.id
                  </p>
                </div>

                {/* Cover Ringkas */}
                <div className="text-center py-4 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-slate-100 rounded-full text-slate-700">
                    Dokumen Mutu Internal Resmi
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    BUNDEL 4 BUKU SISTEM PENJAMINAN MUTU INTERNAL (SPMI)
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold">
                    Tahun Akademik 2025/2026 • Siklus PPEPP Aktif
                  </p>
                </div>

                {/* Ringkasan 4 Buku */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong>Buku I: Kebijakan SPMI</strong>
                      <span className="block text-[11px] text-slate-500">SK No. 042/SK/YAPMI/IX/2025 • 4 Bab Kebijakan Mutu</span>
                    </div>
                    <span className="text-emerald-700 font-bold">✓ Lengkap</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong>Buku II: Manual Mutu (Siklus PPEPP)</strong>
                      <span className="block text-[11px] text-slate-500">SK No. 043/SK/YAPMI/IX/2025 • 5 SOP Siklus PPEPP</span>
                    </div>
                    <span className="text-emerald-700 font-bold">✓ Lengkap</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong>Buku III: Standar SPMI (Pendidikan, Riset, PkM, Pamong)</strong>
                      <span className="block text-[11px] text-slate-500">SK No. 044/SK/YAPMI/IX/2025 • {allStandards.length} Butir Standar Melampaui SN-Dikti</span>
                    </div>
                    <span className="text-emerald-700 font-bold">✓ Lengkap</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong>Buku IV: Formulir Mutu (Instrumen AMI & PTK)</strong>
                      <span className="block text-[11px] text-slate-500">SK No. 045/SK/YAPMI/IX/2025 • 5 Formulir Baku Operasional</span>
                    </div>
                    <span className="text-emerald-700 font-bold">✓ Lengkap</span>
                  </div>
                </div>

                {/* Lembar Tanda Tangan Pengesahan */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="text-left space-y-12">
                    <div>
                      <span className="text-slate-500 block">Mengetahui,</span>
                      <strong className="block">Kepala Lembaga Penjaminan Mutu</strong>
                    </div>
                    <div>
                      <strong className="block underline">LPM STIMI YAPMI Makassar</strong>
                      <span className="text-[10px] text-slate-500">NIDN. 0914078502</span>
                    </div>
                  </div>

                  <div className="text-right space-y-12">
                    <div>
                      <span className="text-slate-500 block">Makassar, 1 September 2025</span>
                      <strong className="block">Ketua STIMI YAPMI Makassar</strong>
                    </div>
                    <div>
                      <strong className="block underline">Dr. Ibrahim Syah, S.E., M.M.</strong>
                      <span className="text-[10px] text-slate-500">NIDN. 0920037601</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Tutup
                </button>
                <button
                  onClick={handlePrint}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-sky-600 to-cyan-600 text-white hover:from-sky-700 hover:to-cyan-700 shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen Sekarang (PDF)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
