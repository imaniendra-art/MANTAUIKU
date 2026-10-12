"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  FileText,
  MessageSquare,
  Archive,
  Send,
  Copy,
  Printer,
  CheckCircle2,
  RefreshCw,
  Award,
  Layers,
  ChevronRight,
  BookOpen,
  TrendingUp,
  Download,
  Building2,
  Users,
  ShieldCheck,
  Check,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ILedDraftItem {
  _id: string;
  criterionKey: string;
  criterionNumber: number;
  criterionTitle: string;
  academicYear: string;
  prodi: string;
  targetRating: string;
  contentMarkdown: string;
  wordCount: number;
  dataSourcesUsed: string[];
  status: "DRAF" | "DISETUJUI_TIM_AKREDITASI" | "FINAL";
  generatedBy: string;
  updatedAt: string;
}

interface IChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  citations?: string[];
  timestamp: string;
}

const CRITERIA_OPTIONS = [
  { key: "c1", num: 1, label: "Kriteria C.1", title: "Visi, Misi, Tujuan & Strategi (VMTS)" },
  { key: "c2", num: 2, label: "Kriteria C.2", title: "Tata Pamong, Tata Kelola & Kerjasama" },
  { key: "c3", num: 3, label: "Kriteria C.3", title: "Kemahasiswaan & Tracer Study (IKU 2)" },
  { key: "c4", num: 4, label: "Kriteria C.4", title: "Sumber Daya Manusia (Dosen & EDO)" },
  { key: "c5", num: 5, label: "Kriteria C.5", title: "Keuangan, Sarana & Prasarana (EKA)" },
  { key: "c6", num: 6, label: "Kriteria C.6", title: "Pendidikan (Kurikulum OBE & AoL)" },
  { key: "c7", num: 7, label: "Kriteria C.7", title: "Penelitian (LPPM & Publikasi)" },
  { key: "c8", num: 8, label: "Kriteria C.8", title: "Pengabdian kepada Masyarakat (PkM)" },
  { key: "c9", num: 9, label: "Kriteria C.9", title: "Luaran Tridharma & Kepuasan Mitra" },
];

export default function CopilotLedPage() {
  const [activeTab, setActiveTab] = useState<"generator" | "chat" | "repository">("generator");

  // Generator State
  const [selectedCriterion, setSelectedCriterion] = useState<string>("c3");
  const [targetRating, setTargetRating] = useState<string>("Unggul");
  const [generating, setGenerating] = useState<boolean>(false);
  const [currentDraft, setCurrentDraft] = useState<ILedDraftItem | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<IChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: `Halo Tim Penjaminan Mutu & Taskforce Akreditasi STIMI YAPMI Makassar! Saya adalah **AI Quality Copilot**, asisten mutu yang terhubung langsung ke basis data MongoDB Atlas institusi.\n\nSaya siap membantu Anda menyusun narasi **Laporan Evaluasi Diri (LED) LAMEMBA 9 Kriteria**, menganalisis temuan AMI, serta memberikan rekomendasi perbaikan berbasis data riil. Silakan pilih kriteria untuk digenerate atau ajukan pertanyaan di bawah ini.`,
      citations: ["MongoDB Atlas Live Cluster", "Buku Standar IKU STIMI YAPMI 2026"],
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Repository State
  const [savedDrafts, setSavedDrafts] = useState<ILedDraftItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState<boolean>(false);

  // Load existing drafts
  const fetchDrafts = async () => {
    setLoadingDrafts(true);
    try {
      const res = await fetch("/api/copilot/drafts");
      const json = await res.json();
      if (json.success) {
        setSavedDrafts(json.data);
        // Default current draft if available
        const defaultDraft = json.data.find((d: ILedDraftItem) => d.criterionKey === selectedCriterion);
        if (defaultDraft && !currentDraft) {
          setCurrentDraft(defaultDraft);
        }
      }
    } catch (e) {
      console.error("Error fetching drafts:", e);
    } finally {
      setLoadingDrafts(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  // Handle Generate LED Draft
  const handleGenerateLed = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/copilot/generate-led", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          criterionKey: selectedCriterion,
          prodi: "S1 Manajemen",
          targetRating,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentDraft(json.draft);
        await fetchDrafts();
      }
    } catch (e) {
      console.error("Error generating LED:", e);
    } finally {
      setGenerating(false);
    }
  };

  // Handle Copy Draft Text
  const handleCopyText = () => {
    if (currentDraft?.contentMarkdown) {
      navigator.clipboard.writeText(currentDraft.contentMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Handle Send Chat
  const handleSendChat = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: IChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!presetText) setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const json = await res.json();

      if (json.success) {
        const aiMsg: IChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: json.answer,
          citations: json.citations,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      }
    } catch (e) {
      console.error("Chat error:", e);
    } finally {
      setChatLoading(false);
    }
  };

  // When criterion changes, find if draft already exists
  const handleSelectCriterion = (key: string) => {
    setSelectedCriterion(key);
    const existing = savedDrafts.find((d) => d.criterionKey === key);
    if (existing) {
      setCurrentDraft(existing);
    } else {
      setCurrentDraft(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI Quality Engine • LAMEMBA & SAN Dikti 2025 Standard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              AI Quality Copilot & Generator Draf LED Akreditasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Asisten cerdas perancangan narasi <span className="text-indigo-300 font-bold">Laporan Evaluasi Diri (LED) LAMEMBA 9 Kriteria</span> yang terhubung langsung menyuntikkan data capaian 12 IKU, hasil Audit AMI, skor EDO dosen, kepuasan layanan EKA, dan pelacakan Tracer Study secara otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-300 space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-bold">Basis Data Audit</span>
              <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                MongoDB Atlas Terhubung
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("generator")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-colors ${
            activeTab === "generator"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Generator Draf LED LAMEMBA</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-bold">
            9 Kriteria
          </span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-colors ${
            activeTab === "chat"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>2. Tanya Jawab Mutu & Advisor</span>
        </button>

        <button
          onClick={() => setActiveTab("repository")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-colors ${
            activeTab === "repository"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>3. Repositori Draf Tersimpan ({savedDrafts.length})</span>
        </button>
      </div>

      {/* TAB 1: GENERATOR DRAF LED */}
      {activeTab === "generator" && (
        <div className="space-y-6">
          {/* Criterion Selector Pills */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900">
                  Pilih Kriteria Akreditasi LAMEMBA untuk Digenerate
                </h3>
                <p className="text-xs text-slate-500">
                  AI akan mensintesis data riil indikator menjadi bab evaluasi diri baku berstandar asesor
                </p>
              </div>

              {/* Target Rating Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Target Peringkat:</span>
                <select
                  value={targetRating}
                  onChange={(e) => setTargetRating(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-indigo-50/50 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Unggul">UNGGUL (Skor &gt; 80)</option>
                  <option value="Baik Sekali">Baik Sekali</option>
                </select>
              </div>
            </div>

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {CRITERIA_OPTIONS.map((c) => {
                const isSelected = selectedCriterion === c.key;
                const hasSaved = savedDrafts.some((d) => d.criterionKey === c.key);
                return (
                  <button
                    key={c.key}
                    onClick={() => handleSelectCriterion(c.key)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                        : "bg-slate-50/80 hover:bg-slate-100/80 text-slate-700 border-slate-200/80"
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider block ${isSelected ? "text-indigo-200" : "text-indigo-600"}`}>
                        {c.label}
                      </span>
                      <span className="text-xs font-bold leading-tight block mt-0.5">
                        {c.title}
                      </span>
                    </div>
                    {hasSaved && (
                      <span
                        className={`p-1 rounded-full text-[10px] ${
                          isSelected ? "bg-indigo-500 text-white" : "bg-emerald-100 text-emerald-700"
                        }`}
                        title="Draf sudah tersedia di repositori"
                      >
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Trigger Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Terhubung ke capaian 12 IKU, hasil AMI 10 unit, EDO, EKA, dan Tracer Study</span>
              </div>

              <button
                onClick={handleGenerateLed}
                disabled={generating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
                <span>
                  {generating
                    ? "Menyintesis Data & Menyusun Draf..."
                    : `Generate Draf ${CRITERIA_OPTIONS.find((c) => c.key === selectedCriterion)?.label} dengan AI`}
                </span>
              </button>
            </div>
          </div>

          {/* Generated Document Viewer */}
          {currentDraft ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden space-y-0">
              {/* Document Toolbar */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/30 border border-indigo-400/40 text-indigo-300">
                      DRAF LED TERVERIFIKASI
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Tahun Akademik {currentDraft.academicYear} • {currentDraft.prodi}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white">
                    {currentDraft.criterionTitle}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
                  </button>

                  <button
                    onClick={() => setPrintModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Dokumen Resmi</span>
                  </button>
                </div>
              </div>

              {/* Data Sources Footnote */}
              <div className="px-6 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center gap-2 text-[11px] text-indigo-900 font-semibold">
                <span className="font-bold text-indigo-950">Data Sumber Riil:</span>
                {currentDraft.dataSourcesUsed.map((ds, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-white border border-indigo-200/80 text-[10px] font-medium">
                    {ds}
                  </span>
                ))}
              </div>

              {/* Document Prose Body */}
              <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6 text-slate-800 leading-relaxed text-xs sm:text-sm font-serif prose prose-slate">
                <div className="whitespace-pre-line font-sans text-xs sm:text-sm leading-relaxed space-y-4">
                  {currentDraft.contentMarkdown}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">
                Belum Ada Draf untuk {CRITERIA_OPTIONS.find((c) => c.key === selectedCriterion)?.title}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Klik tombol &quot;Generate Draf LED dengan AI&quot; di atas untuk menyusun narasi evaluasi diri otomatis menggunakan data riil sistem MANTAUIKU.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHAT DENGAN COPILOT */}
      {activeTab === "chat" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900">AI Quality Copilot STIMI YAPMI</h3>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Connected to MongoDB Atlas
                </span>
              </div>
            </div>
          </div>

          {/* Prompt Inspiration Chips */}
          <div className="p-3 bg-indigo-50/40 border-b border-indigo-100/60 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-bold shrink-0">Inspirasi:</span>
            {[
              "Analisis Kesiapan Kriteria C.3 & IKU 2",
              "Rekomendasi Tindak Lanjut Unit Sarpras (EKA & AMI)",
              "Hasil Evaluasi Dosen (EDO) Semester Ini",
              "Simulasi Skor Menuju Peringkat Unggul LAMEMBA",
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendChat(chip)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold whitespace-nowrap transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                      : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none font-sans"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                      <span className="font-bold text-slate-600">Rujukan Basis Data:</span>
                      {msg.citations.map((c, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[9px] text-right ${
                      msg.sender === "user" ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold pl-10">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menganalisis basis data mutu dan menyusun jawaban...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Ajukan pertanyaan tentang kesiapan akreditasi, data IKU, atau draf LED..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            <button
              onClick={() => handleSendChat()}
              disabled={chatLoading || !chatInput.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: REPOSITORI DRAF */}
      {activeTab === "repository" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900">Repositori Draf LED Institusi</h3>
              <p className="text-xs text-slate-500">
                Koleksi draf narasi per kriteria yang tersimpan di database siap direviu tim akreditasi
              </p>
            </div>
            <button
              onClick={fetchDrafts}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1.5 font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDrafts ? "animate-spin" : ""}`} />
              <span>Segarkan</span>
            </button>
          </div>

          {savedDrafts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                    <th className="py-3 px-3">Kriteria</th>
                    <th className="py-3 px-3">Judul Bab LED</th>
                    <th className="py-3 px-3">Jumlah Kata</th>
                    <th className="py-3 px-3">Status Persetujuan</th>
                    <th className="py-3 px-3">Tanggal Dibuat</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {savedDrafts.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                        {d.criterionKey.toUpperCase()}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {d.criterionTitle}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {d.wordCount} kata
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {new Date(d.updatedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedCriterion(d.criterionKey);
                            setCurrentDraft(d);
                            setActiveTab("generator");
                          }}
                          className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                        >
                          Buka Draf
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada draf yang digenerate. Masuk ke tab Generator untuk menyusun draf pertama.
            </div>
          )}
        </div>
      )}

      {/* PRINT-READY MODAL: BERKOP RESMI STIMI YAPMI */}
      {printModalOpen && currentDraft && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  Pratinjau Dokumen Resmi Draf LED (Format Akreditasi LAMEMBA)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  Cetak Sekarang
                </button>
                <button
                  onClick={() => setPrintModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Dokumen Cetak Berkop Resmi */}
            <div className="p-8 sm:p-12 overflow-y-auto space-y-6 print:p-0">
              {/* Kop Surat Resmi */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center gap-4">
                <Image
                  src="/logo_stimi.png"
                  alt="Logo STIMI"
                  width={60}
                  height={60}
                  className="object-contain shrink-0"
                />
                <div className="text-center flex-1 space-y-0.5">
                  <h2 className="text-xs font-bold tracking-wider uppercase text-slate-700">
                    YAYASAN PENDIDIKAN MAKASSAR INDONESIA (YAPMI)
                  </h2>
                  <h1 className="text-base font-black uppercase text-slate-950">
                    SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI MAKASSAR
                  </h1>
                  <p className="text-[10px] text-slate-600">
                    Lembaga Penjaminan Mutu (LPM) • Tim Penyusun Laporan Evaluasi Diri (LED)
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan 90245
                  </p>
                </div>
              </div>

              {/* Judul Dokumen */}
              <div className="text-center space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  DRAF LAPORAN EVALUASI DIRI (LED) PROGRAM STUDI S1 MANAJEMEN
                </h3>
                <h4 className="text-sm font-bold text-indigo-900">
                  {currentDraft.criterionTitle}
                </h4>
                <p className="text-[10px] text-slate-500">
                  Instrumen Akreditasi Program Studi (IAPS) LAMEMBA • Tahun Akademik {currentDraft.academicYear}
                </p>
              </div>

              {/* Teks Dokumen */}
              <div className="whitespace-pre-line text-xs font-serif text-slate-900 leading-relaxed border-t border-slate-200 pt-4">
                {currentDraft.contentMarkdown}
              </div>

              {/* Lembar Tanda Tangan */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
                <div className="space-y-16">
                  <p className="text-[11px] text-slate-600">
                    Ketua Tim Penyusun LED S1 Manajemen,
                  </p>
                  <div>
                    <p className="font-bold underline text-slate-900">Dr. H. Syahrir, S.E., M.M.</p>
                    <p className="text-[10px] text-slate-500">NIDN: 0915087201</p>
                  </div>
                </div>

                <div className="space-y-16">
                  <p className="text-[11px] text-slate-600">
                    Mengetahui,<br/>Ketua Lembaga Penjaminan Mutu (LPM),
                  </p>
                  <div>
                    <p className="font-bold underline text-slate-900">Dr. Hj. Nurhaedah, S.E., M.Si.</p>
                    <p className="text-[10px] text-slate-500">NIDN: 0920047502</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
