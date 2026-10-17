"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  FileText,
  BookOpen,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  FileCheck2,
  Award,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Trash2,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IIapt41Item, IIapt41Summary } from "@/components/dashboard/Iapt41DashboardWidget";

interface Iapt41LedDocumentBuilderProps {
  isLpm: boolean;
  indicators: IIapt41Item[];
  summary: IIapt41Summary;
}

export interface IIapt41LedData {
  _id?: string;
  academicYear: string;
  institutionName: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED";
  submissionDate: string;
  identitasPt: {
    perguruanTinggi: string;
    badanPenyelenggara: string;
    nomorSkPendirianPt: string;
    tanggalSkPendirianPt: string;
    pejabatSkPendirianPt: string;
    alamat: string;
    kota: string;
    telepon: string;
    emailWeb: string;
    peringkatAkreditasiTerbaru: string;
    nomorSkBanPt: string;
    tanggalKadaluarsa: string;
    namaPimpinan: string;
    nidnPimpinan: string;
    tahunDokumen: string;
    logoUrl: string;
  };
  timPenyusun: Array<{
    nama: string;
    nikNidn: string;
    jabatan: string;
    peran: string;
  }>;
  kataPengantar: string;
  ringkasanEksekutif: string;
  narasiKriteriaC: string;
  narasiKriteriaR: string;
  narasiKriteriaA: string;
  narasiKriteriaM: string;
  penutup: string;
  lembarPengesahan: {
    kota: string;
    tanggal: string;
    ketuaPt: {
      jabatan: string;
      nama: string;
      nikNidn: string;
    };
    ketuaYayasan: {
      jabatan: string;
      nama: string;
      nikNidn: string;
    };
  };
}

export default function Iapt41LedDocumentBuilder({
  isLpm,
  indicators,
  summary,
}: Iapt41LedDocumentBuilderProps) {
  const [ledData, setLedData] = useState<IIapt41LedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"identitas" | "tim" | "pengantar" | "narasi" | "pengesahan">("identitas");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Edit States
  const [isEditingIdentitas, setIsEditingIdentitas] = useState(false);
  const [editIdentitas, setEditIdentitas] = useState<any>(null);
  const [isSavingIdentitas, setIsSavingIdentitas] = useState(false);

  const [isEditingTim, setIsEditingTim] = useState(false);
  const [editTim, setEditTim] = useState<any[]>([]);
  const [isSavingTim, setIsSavingTim] = useState(false);

  const [isEditingPengantar, setIsEditingPengantar] = useState(false);
  const [editKataPengantar, setEditKataPengantar] = useState("");
  const [editRingkasanEksekutif, setEditRingkasanEksekutif] = useState("");
  const [isSavingPengantar, setIsSavingPengantar] = useState(false);

  const [activeCramTab, setActiveCramTab] = useState<"C" | "R" | "A" | "M">("C");
  const [isEditingNarasi, setIsEditingNarasi] = useState(false);
  const [editNarasiC, setEditNarasiC] = useState("");
  const [editNarasiR, setEditNarasiR] = useState("");
  const [editNarasiA, setEditNarasiA] = useState("");
  const [editNarasiM, setEditNarasiM] = useState("");
  const [editPenutup, setEditPenutup] = useState("");
  const [isSavingNarasi, setIsSavingNarasi] = useState(false);

  const [isEditingPengesahan, setIsEditingPengesahan] = useState(false);
  const [editPengesahan, setEditPengesahan] = useState<any>(null);
  const [isSavingPengesahan, setIsSavingPengesahan] = useState(false);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch LED Document Data
  const fetchLedData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/accreditation/iapt41/led");
      const json = await res.json();
      if (json.success && json.data) {
        setLedData(json.data);
        setEditIdentitas(json.data.identitasPt);
        setEditTim(json.data.timPenyusun || []);
        setEditKataPengantar(json.data.kataPengantar || "");
        setEditRingkasanEksekutif(json.data.ringkasanEksekutif || "");
        setEditNarasiC(json.data.narasiKriteriaC || "");
        setEditNarasiR(json.data.narasiKriteriaR || "");
        setEditNarasiA(json.data.narasiKriteriaA || "");
        setEditNarasiM(json.data.narasiKriteriaM || "");
        setEditPenutup(json.data.penutup || "");
        setEditPengesahan(json.data.lembarPengesahan);
      }
    } catch (e) {
      console.error("Gagal memuat dokumen LED:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedData();
  }, []);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  // 1. Simpan Identitas PT
  const handleSaveIdentitas = async () => {
    setIsSavingIdentitas(true);
    try {
      const res = await fetch("/api/accreditation/iapt41/led", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identitasPt: editIdentitas }),
      });
      const json = await res.json();
      if (json.success) {
        setLedData(json.data);
        setIsEditingIdentitas(false);
        showFeedback("success", "Identitas Perguruan Tinggi & Sampul berhasil disimpan!");
      } else {
        showFeedback("error", json.error || "Gagal menyimpan identitas.");
      }
    } catch {
      showFeedback("error", "Terjadi gangguan jaringan saat menyimpan.");
    } finally {
      setIsSavingIdentitas(false);
    }
  };

  // 2. Simpan Tim Penyusun
  const handleSaveTim = async () => {
    setIsSavingTim(true);
    try {
      // Membersihkan baris yang kosong total
      const cleanedTim = editTim
        .filter((t) => t && (t.nama?.trim() || t.jabatan?.trim() || t.peran?.trim()))
        .map((t) => ({
          nama: t.nama || "",
          nikNidn: t.nikNidn || "",
          jabatan: t.jabatan || "",
          peran: t.peran || "",
        }));

      const res = await fetch("/api/accreditation/iapt41/led", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timPenyusun: cleanedTim }),
      });
      const json = await res.json();
      if (json.success) {
        setLedData(json.data);
        setEditTim(json.data.timPenyusun || []);
        setIsEditingTim(false);
        showFeedback("success", "Daftar Tim Penyusun LED berhasil disimpan!");
      } else {
        showFeedback("error", json.error || "Gagal menyimpan tim penyusun.");
      }
    } catch {
      showFeedback("error", "Terjadi gangguan jaringan saat menyimpan.");
    } finally {
      setIsSavingTim(false);
    }
  };

  // 3. Simpan Kata Pengantar & Ringkasan
  const handleSavePengantar = async () => {
    setIsSavingPengantar(true);
    try {
      const res = await fetch("/api/accreditation/iapt41/led", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kataPengantar: editKataPengantar,
          ringkasanEksekutif: editRingkasanEksekutif,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setLedData(json.data);
        setIsEditingPengantar(false);
        showFeedback("success", "Kata Pengantar & Ringkasan Eksekutif berhasil disimpan!");
      } else {
        showFeedback("error", json.error || "Gagal menyimpan pengantar.");
      }
    } catch {
      showFeedback("error", "Terjadi gangguan jaringan saat menyimpan.");
    } finally {
      setIsSavingPengantar(false);
    }
  };

  // 4. Simpan Narasi 4 Kriteria CRAM & Penutup
  const handleSaveNarasi = async () => {
    setIsSavingNarasi(true);
    try {
      const res = await fetch("/api/accreditation/iapt41/led", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          narasiKriteriaC: editNarasiC,
          narasiKriteriaR: editNarasiR,
          narasiKriteriaA: editNarasiA,
          narasiKriteriaM: editNarasiM,
          penutup: editPenutup,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setLedData(json.data);
        setIsEditingNarasi(false);
        showFeedback("success", "Narasi Evaluasi Diri Kriteria CRAM & Penutup berhasil disimpan!");
      } else {
        showFeedback("error", json.error || "Gagal menyimpan narasi kriteria.");
      }
    } catch {
      showFeedback("error", "Terjadi gangguan jaringan saat menyimpan.");
    } finally {
      setIsSavingNarasi(false);
    }
  };

  // 5. Simpan Lembar Pengesahan
  const handleSavePengesahan = async () => {
    setIsSavingPengesahan(true);
    try {
      const res = await fetch("/api/accreditation/iapt41/led", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lembarPengesahan: editPengesahan }),
      });
      const json = await res.json();
      if (json.success) {
        setLedData(json.data);
        setIsEditingPengesahan(false);
        showFeedback("success", "Lembar Pengesahan Pimpinan & Yayasan berhasil disimpan!");
      } else {
        showFeedback("error", json.error || "Gagal menyimpan lembar pengesahan.");
      }
    } catch {
      showFeedback("error", "Terjadi gangguan jaringan saat menyimpan.");
    } finally {
      setIsSavingPengesahan(false);
    }
  };

  if (isLoading || !ledData) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center space-y-4 text-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-800">Menyiapkan Dokumen LED IAPT 4.1 BAN-PT...</h4>
          <p className="text-xs text-slate-500">Memuat format resmi Lampiran 1 & 2 Peraturan BAN-PT No. 35 Tahun 2025</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-sky-800/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-cyan-300" />
              <span>Instrumen IAPT 4.1 • Format Baku Naskah LED BAN-PT</span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Penyusun Dokumen Laporan Evaluasi Diri (LED) Institusi
            </h3>
            <p className="text-xs sm:text-sm text-sky-200/80 leading-relaxed">
              Format baku instrumen akreditasi institusi BAN-PT 2025/2026. Lengkapi halaman muka/sampul, identitas PT, tim penyusun, kata pengantar, narasi 4 kriteria CRAM, penutup, dan lembar pengesahan resmi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ring-2 ring-emerald-300/40"
            >
              <Printer className="w-4 h-4" />
              <span>Pratinjau Dokumen Cetak LED (Format BAN-PT)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-sm transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 2. Sub-Section Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200/70">
        {[
          { key: "identitas", label: "1. Sampul & Identitas PT", icon: Building2 },
          { key: "tim", label: "2. Tim Penyusun LED", icon: Users },
          { key: "pengantar", label: "3. Kata Pengantar & Ringkasan", icon: BookOpen },
          { key: "narasi", label: "4. Narasi 4 Kriteria CRAM", icon: FileText },
          { key: "pengesahan", label: "5. Lembar Pengesahan", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSection(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-sky-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. SECTION CONTENT */}

      {/* ===================== SECTION 1: IDENTITAS PT & SAMPUL ===================== */}
      {activeSection === "identitas" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Halaman Muka (Sampul) & Identitas Perguruan Tinggi</span>
              </h4>
              <p className="text-xs text-slate-500">
                Informasi resmi kelembagaan pengusul sesuai format Lampiran 1 & 2 BAN-PT IAPT 4.1
              </p>
            </div>

            {isLpm && (
              <div>
                {isEditingIdentitas ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditIdentitas(ledData.identitasPt);
                        setIsEditingIdentitas(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveIdentitas}
                      disabled={isSavingIdentitas}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      {isSavingIdentitas ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Simpan Identitas</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingIdentitas(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Identitas PT</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Form / View Identitas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Nama Perguruan Tinggi</label>
              {isEditingIdentitas ? (
                <input
                  type="text"
                  value={editIdentitas?.perguruanTinggi || ""}
                  onChange={(e) => setEditIdentitas({ ...editIdentitas, perguruanTinggi: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-bold">
                  {ledData.identitasPt.perguruanTinggi}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Badan Penyelenggara (Yayasan)</label>
              {isEditingIdentitas ? (
                <input
                  type="text"
                  value={editIdentitas?.badanPenyelenggara || ""}
                  onChange={(e) => setEditIdentitas({ ...editIdentitas, badanPenyelenggara: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-bold">
                  {ledData.identitasPt.badanPenyelenggara}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Nomor SK Pendirian PT</label>
              {isEditingIdentitas ? (
                <input
                  type="text"
                  value={editIdentitas?.nomorSkPendirianPt || ""}
                  onChange={(e) => setEditIdentitas({ ...editIdentitas, nomorSkPendirianPt: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-medium">
                  {ledData.identitasPt.nomorSkPendirianPt}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Tanggal SK Pendirian PT</label>
              {isEditingIdentitas ? (
                <input
                  type="date"
                  value={editIdentitas?.tanggalSkPendirianPt || ""}
                  onChange={(e) => setEditIdentitas({ ...editIdentitas, tanggalSkPendirianPt: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-medium">
                  {ledData.identitasPt.tanggalSkPendirianPt}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Pejabat Penerbit SK Pendirian</label>
              {isEditingIdentitas ? (
                <input
                  type="text"
                  value={editIdentitas?.pejabatSkPendirianPt || ""}
                  onChange={(e) => setEditIdentitas({ ...editIdentitas, pejabatSkPendirianPt: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-medium">
                  {ledData.identitasPt.pejabatSkPendirianPt}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Nama Pimpinan PT (Ketua)</label>
              {isEditingIdentitas ? (
                <input
                  type="text"
                  value={editIdentitas?.namaPimpinan || ""}
                  onChange={(e) => setEditIdentitas({ ...editIdentitas, namaPimpinan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 font-bold"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-bold">
                  {ledData.identitasPt.namaPimpinan} ({ledData.identitasPt.nidnPimpinan})
                </div>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700">Alamat Kampus</label>
              {isEditingIdentitas ? (
                <input
                  type="text"
                  value={editIdentitas?.alamat || ""}
                  onChange={(e) => setEditIdentitas({ ...editIdentitas, alamat: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-medium">
                  {ledData.identitasPt.alamat}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Telepon</label>
              {isEditingIdentitas ? (
                <input
                  type="text"
                  value={editIdentitas?.telepon || ""}
                  onChange={(e) => setEditIdentitas({ ...editIdentitas, telepon: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-medium">
                  {ledData.identitasPt.telepon}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Email & Website</label>
              {isEditingIdentitas ? (
                <input
                  type="text"
                  value={editIdentitas?.emailWeb || ""}
                  onChange={(e) => setEditIdentitas({ ...editIdentitas, emailWeb: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-medium">
                  {ledData.identitasPt.emailWeb}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Peringkat & Nomor SK Akreditasi BAN-PT</label>
              {isEditingIdentitas ? (
                <input
                  type="text"
                  value={editIdentitas?.nomorSkBanPt || ""}
                  onChange={(e) => setEditIdentitas({ ...editIdentitas, nomorSkBanPt: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-medium">
                  {ledData.identitasPt.peringkatAkreditasiTerbaru} • {ledData.identitasPt.nomorSkBanPt}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Masa Berlaku Akreditasi</label>
              {isEditingIdentitas ? (
                <input
                  type="date"
                  value={editIdentitas?.tanggalKadaluarsa || ""}
                  onChange={(e) => setEditIdentitas({ ...editIdentitas, tanggalKadaluarsa: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-medium">
                  s.d. {ledData.identitasPt.tanggalKadaluarsa}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== SECTION 2: TIM PENYUSUN ===================== */}
      {activeSection === "tim" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Identitas Tim Penyusun Laporan Evaluasi Diri (LED)</span>
              </h4>
              <p className="text-xs text-slate-500">
                Daftar tim ad hoc yang ditugaskan melalui Surat Keputusan Ketua STIMI YAPMI Makassar
              </p>
            </div>

            {isLpm && (
              <div>
                {isEditingTim ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditTim(ledData.timPenyusun || []);
                        setIsEditingTim(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTim}
                      disabled={isSavingTim}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      {isSavingTim ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Simpan Tim</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingTim(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Tim Penyusun</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Nama Lengkap & Gelar</th>
                  <th className="p-3">NIDN / NIP</th>
                  <th className="p-3">Jabatan Struktural / Unit</th>
                  <th className="p-3">Peran dalam Tim LED</th>
                  {isEditingTim && <th className="p-3 w-16 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {(isEditingTim ? editTim : ledData.timPenyusun).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-3">
                      {isEditingTim ? (
                        <input
                          type="text"
                          value={item.nama}
                          placeholder="Nama lengkap & gelar..."
                          onChange={(e) => {
                            const newTim = [...editTim];
                            newTim[idx].nama = e.target.value;
                            setEditTim(newTim);
                          }}
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold"
                        />
                      ) : (
                        <span className="font-bold text-slate-900">{item.nama}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditingTim ? (
                        <input
                          type="text"
                          value={item.nikNidn}
                          placeholder="NIDN..."
                          onChange={(e) => {
                            const newTim = [...editTim];
                            newTim[idx].nikNidn = e.target.value;
                            setEditTim(newTim);
                          }}
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                        />
                      ) : (
                        <span className="font-mono text-slate-600">{item.nikNidn}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditingTim ? (
                        <input
                          type="text"
                          value={item.jabatan}
                          placeholder="Jabatan struktural..."
                          onChange={(e) => {
                            const newTim = [...editTim];
                            newTim[idx].jabatan = e.target.value;
                            setEditTim(newTim);
                          }}
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                        />
                      ) : (
                        item.jabatan
                      )}
                    </td>
                    <td className="p-3">
                      {isEditingTim ? (
                        <input
                          type="text"
                          value={item.peran}
                          placeholder="Peran di tim LED..."
                          onChange={(e) => {
                            const newTim = [...editTim];
                            newTim[idx].peran = e.target.value;
                            setEditTim(newTim);
                          }}
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs font-semibold text-sky-800"
                        />
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-bold border border-sky-200/60">
                          {item.peran}
                        </span>
                      )}
                    </td>
                    {isEditingTim && (
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const newTim = editTim.filter((_, i) => i !== idx);
                            setEditTim(newTim);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus baris ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isEditingTim && (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditTim([
                    ...editTim,
                    { nama: "", nikNidn: "", jabatan: "", peran: "Anggota Tim LED" },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 text-sky-800 font-bold text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Tambah Baris Anggota Tim</span>
              </button>
              <span className="text-[11px] text-slate-400">
                Gunakan ikon tong sampah untuk menghapus baris, atau kosongkan nama (baris kosong otomatis dibersihkan saat simpan).
              </span>
            </div>
          )}
        </div>
      )}

      {/* ===================== SECTION 3: KATA PENGANTAR & RINGKASAN ===================== */}
      {activeSection === "pengantar" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <span>Kata Pengantar & Ringkasan Eksekutif</span>
              </h4>
              <p className="text-xs text-slate-500">
                Pernyataan resmi pimpinan dan gambaran menyeluruh kesiapan akreditasi institusi
              </p>
            </div>

            {isLpm && (
              <div>
                {isEditingPengantar ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditKataPengantar(ledData.kataPengantar || "");
                        setEditRingkasanEksekutif(ledData.ringkasanEksekutif || "");
                        setIsEditingPengantar(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePengantar}
                      disabled={isSavingPengantar}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      {isSavingPengantar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Simpan Pengantar</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingPengantar(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Teks Pengantar</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6 text-xs">
            {/* Kata Pengantar */}
            <div className="space-y-2">
              <label className="font-black text-slate-900 text-sm">Kata Pengantar Ketua Perguruan Tinggi</label>
              {isEditingPengantar ? (
                <textarea
                  rows={8}
                  value={editKataPengantar}
                  onChange={(e) => setEditKataPengantar(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-serif leading-relaxed text-slate-800 whitespace-pre-line text-justify">
                  {ledData.kataPengantar}
                </div>
              )}
            </div>

            {/* Ringkasan Eksekutif */}
            <div className="space-y-2">
              <label className="font-black text-slate-900 text-sm">Ringkasan Eksekutif Evaluasi Diri (Executive Summary)</label>
              {isEditingPengantar ? (
                <textarea
                  rows={8}
                  value={editRingkasanEksekutif}
                  onChange={(e) => setEditRingkasanEksekutif(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-serif leading-relaxed text-slate-800 whitespace-pre-line text-justify">
                  {ledData.ringkasanEksekutif}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== SECTION 4: NARASI 4 KRITERIA CRAM ===================== */}
      {activeSection === "narasi" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Narasi Evaluasi Diri 4 Kriteria CRAM (Buku 2 BAN-PT)</span>
              </h4>
              <p className="text-xs text-slate-500">
                Analisis komprehensif implementasi Culture, Relevance, Accountability, dan Mission
              </p>
            </div>

            {isLpm && (
              <div>
                {isEditingNarasi ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditNarasiC(ledData.narasiKriteriaC || "");
                        setEditNarasiR(ledData.narasiKriteriaR || "");
                        setEditNarasiA(ledData.narasiKriteriaA || "");
                        setEditNarasiM(ledData.narasiKriteriaM || "");
                        setEditPenutup(ledData.penutup || "");
                        setIsEditingNarasi(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNarasi}
                      disabled={isSavingNarasi}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      {isSavingNarasi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Simpan Semua Narasi</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingNarasi(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Narasi Kriteria</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* CRAM Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
            {[
              { key: "C", code: "Kriteria C", title: "Budaya Mutu (Culture)", color: "text-emerald-700" },
              { key: "R", code: "Kriteria R", title: "Relevansi (Relevance)", color: "text-blue-700" },
              { key: "A", code: "Kriteria A", title: "Akuntabilitas (Accountability)", color: "text-amber-700" },
              { key: "M", code: "Kriteria M", title: "Diferensiasi Misi (Mission)", color: "text-purple-700" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCramTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  activeCramTab === tab.key
                    ? "bg-white text-slate-950 shadow-sm border border-slate-300/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span className={`px-2 py-0.5 rounded-md bg-slate-200/80 text-[10px] font-mono ${tab.color}`}>
                  {tab.key}
                </span>
                <span>{tab.title}</span>
              </button>
            ))}
          </div>

          {/* Active CRAM Narrative Editor / View */}
          <div className="space-y-4">
            {activeCramTab === "C" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">Bab I: Evaluasi Kriteria C (Budaya Mutu / Culture)</span>
                  <span className="text-[11px] text-slate-500">Mencakup Indikator 1 s.d. 4 (SPMI 4 Buku, PPEPP, PD-Dikti Feeder, Akreditasi Prodi)</span>
                </div>
                {isEditingNarasi ? (
                  <textarea
                    rows={12}
                    value={editNarasiC}
                    onChange={(e) => setEditNarasiC(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-sky-500"
                  />
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-serif leading-relaxed text-slate-800 whitespace-pre-line text-justify text-xs">
                    {ledData.narasiKriteriaC}
                  </div>
                )}
              </div>
            )}

            {activeCramTab === "R" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">Bab II: Evaluasi Kriteria R (Relevansi / Relevance)</span>
                  <span className="text-[11px] text-slate-500">Mencakup Indikator 5 s.d. 23 (Pendidikan OBE, SDM Dosen, Sarpras K3, Riset LPPM, PkM)</span>
                </div>
                {isEditingNarasi ? (
                  <textarea
                    rows={12}
                    value={editNarasiR}
                    onChange={(e) => setEditNarasiR(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-sky-500"
                  />
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-serif leading-relaxed text-slate-800 whitespace-pre-line text-justify text-xs">
                    {ledData.narasiKriteriaR}
                  </div>
                )}
              </div>
            )}

            {activeCramTab === "A" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">Bab III: Evaluasi Kriteria A (Akuntabilitas / Accountability)</span>
                  <span className="text-[11px] text-slate-500">Mencakup Indikator 24 s.d. 35 (SOTK/Statuta, TIK, Audit KAP WTP, K3, Satgas PPKS)</span>
                </div>
                {isEditingNarasi ? (
                  <textarea
                    rows={12}
                    value={editNarasiA}
                    onChange={(e) => setEditNarasiA(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-sky-500"
                  />
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-serif leading-relaxed text-slate-800 whitespace-pre-line text-justify text-xs">
                    {ledData.narasiKriteriaA}
                  </div>
                )}
              </div>
            )}

            {activeCramTab === "M" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">Bab IV: Evaluasi Kriteria M (Diferensiasi Misi / Mission)</span>
                  <span className="text-[11px] text-slate-500">Mencakup Indikator 36 s.d. 39 (Fokus Keunggulan, Renstra 2020-2030, DUDIK &gt;= 5 Tahun)</span>
                </div>
                {isEditingNarasi ? (
                  <textarea
                    rows={12}
                    value={editNarasiM}
                    onChange={(e) => setEditNarasiM(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-sky-500"
                  />
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-serif leading-relaxed text-slate-800 whitespace-pre-line text-justify text-xs">
                    {ledData.narasiKriteriaM}
                  </div>
                )}
              </div>
            )}

            {/* Penutup */}
            <div className="pt-6 border-t border-slate-100 space-y-2">
              <span className="font-black text-slate-900 text-sm">Bab V: Penutup & Komitmen Berkelanjutan</span>
              {isEditingNarasi ? (
                <textarea
                  rows={5}
                  value={editPenutup}
                  onChange={(e) => setEditPenutup(e.target.value)}
                  className="w-full p-4 rounded-2xl border border-slate-300 text-xs font-serif leading-relaxed focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 font-serif leading-relaxed text-slate-800 whitespace-pre-line text-justify text-xs">
                  {ledData.penutup}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== SECTION 5: LEMBAR PENGESAHAN ===================== */}
      {activeSection === "pengesahan" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Lembar Pengesahan Dokumen Evaluasi Diri</span>
              </h4>
              <p className="text-xs text-slate-500">
                Persetujuan dan legalisasi resmi oleh Pimpinan Perguruan Tinggi dan Yayasan Penyelenggara
              </p>
            </div>

            {isLpm && (
              <div>
                {isEditingPengesahan ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditPengesahan(ledData.lembarPengesahan);
                        setIsEditingPengesahan(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePengesahan}
                      disabled={isSavingPengesahan}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      {isSavingPengesahan ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>Simpan Pengesahan</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingPengesahan(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Pengesahan</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Pihak 1: Ketua STIMI YAPMI */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 font-black text-[10px]">
                Pihak I • Pimpinan Perguruan Tinggi
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Jabatan Penandatangan</label>
                  {isEditingPengesahan ? (
                    <input
                      type="text"
                      value={editPengesahan?.ketuaPt?.jabatan || ""}
                      onChange={(e) =>
                        setEditPengesahan({
                          ...editPengesahan,
                          ketuaPt: { ...editPengesahan.ketuaPt, jabatan: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  ) : (
                    <p className="font-bold text-slate-900">{ledData.lembarPengesahan.ketuaPt.jabatan}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Nama Lengkap & Gelar</label>
                  {isEditingPengesahan ? (
                    <input
                      type="text"
                      value={editPengesahan?.ketuaPt?.nama || ""}
                      onChange={(e) =>
                        setEditPengesahan({
                          ...editPengesahan,
                          ketuaPt: { ...editPengesahan.ketuaPt, nama: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  ) : (
                    <p className="font-black text-slate-900 text-sm underline">{ledData.lembarPengesahan.ketuaPt.nama}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">NIDN / NIP</label>
                  {isEditingPengesahan ? (
                    <input
                      type="text"
                      value={editPengesahan?.ketuaPt?.nikNidn || ""}
                      onChange={(e) =>
                        setEditPengesahan({
                          ...editPengesahan,
                          ketuaPt: { ...editPengesahan.ketuaPt, nikNidn: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  ) : (
                    <p className="font-mono text-slate-600">{ledData.lembarPengesahan.ketuaPt.nikNidn}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pihak 2: Ketua Yayasan */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                Pihak II • Badan Penyelenggara (Yayasan)
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Jabatan Penandatangan</label>
                  {isEditingPengesahan ? (
                    <input
                      type="text"
                      value={editPengesahan?.ketuaYayasan?.jabatan || ""}
                      onChange={(e) =>
                        setEditPengesahan({
                          ...editPengesahan,
                          ketuaYayasan: { ...editPengesahan.ketuaYayasan, jabatan: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  ) : (
                    <p className="font-bold text-slate-900">{ledData.lembarPengesahan.ketuaYayasan.jabatan}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Nama Lengkap</label>
                  {isEditingPengesahan ? (
                    <input
                      type="text"
                      value={editPengesahan?.ketuaYayasan?.nama || ""}
                      onChange={(e) =>
                        setEditPengesahan({
                          ...editPengesahan,
                          ketuaYayasan: { ...editPengesahan.ketuaYayasan, nama: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  ) : (
                    <p className="font-black text-slate-900 text-sm underline">{ledData.lembarPengesahan.ketuaYayasan.nama}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Keterangan / Jabatan</label>
                  {isEditingPengesahan ? (
                    <input
                      type="text"
                      value={editPengesahan?.ketuaYayasan?.nikNidn || ""}
                      onChange={(e) =>
                        setEditPengesahan({
                          ...editPengesahan,
                          ketuaYayasan: { ...editPengesahan.ketuaYayasan, nikNidn: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  ) : (
                    <p className="font-mono text-slate-600">{ledData.lembarPengesahan.ketuaYayasan.nikNidn}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL PRATINJAU CETAK 1:1 FORMAT BAN-PT ===================== */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <span>Pratinjau Dokumen Cetak • Laporan Evaluasi Diri (LED) IAPT 4.1 BAN-PT (Format Resmi)</span>
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
                    onClick={() => setIsPrintModalOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
              <div className="p-8 sm:p-12 overflow-y-auto space-y-12 bg-white text-slate-900 text-xs print:p-0 print:space-y-8 font-serif">
                {/* Print Stylesheet */}
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
                    HALAMAN 1: SAMPUL DEPAN (HALAMAN MUKA) SESUAI TEMPLATE BAN-PT
                    ======================================================== */}
                <div className="border-4 border-double border-slate-900 p-8 sm:p-12 min-h-[820px] flex flex-col justify-between items-center text-center page-break bg-white shadow-xs">
                  <div className="space-y-3 max-w-xl">
                    <p className="text-[11px] font-sans font-black tracking-widest text-slate-500 uppercase">
                      PERATURAN BAN-PT NOMOR 35 TAHUN 2025
                    </p>
                    <h2 className="text-lg sm:text-xl font-black uppercase text-slate-950 tracking-tight leading-snug font-sans">
                      LAPORAN EVALUASI DIRI (LED)
                      <br />
                      AKREDITASI PERGURUAN TINGGI (IAPT 4.1)
                    </h2>
                    <p className="text-xs font-sans font-bold text-slate-600">
                      Instrumen Akreditasi Perguruan Tinggi Swasta Akademik (CRAM)
                    </p>
                  </div>

                  {/* Lambang Perguruan Tinggi & BAN-PT */}
                  <div className="my-8 flex flex-col items-center space-y-3">
                    <div className="w-36 h-36 rounded-2xl p-2 flex items-center justify-center bg-white border border-slate-200 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ledData.identitasPt.logoUrl || "/logo_stimi.png"}
                        alt="Lambang Perguruan Tinggi"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-sans font-mono text-slate-400 tracking-wider uppercase">
                      LAMBANG PERGURUAN TINGGI
                    </span>
                  </div>

                  {/* Bagian Bawah Sampul */}
                  <div className="space-y-4 max-w-xl font-sans">
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-black uppercase text-slate-900">
                        {ledData.identitasPt.perguruanTinggi}
                      </h3>
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        {ledData.identitasPt.badanPenyelenggara}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {ledData.identitasPt.kota}, {ledData.academicYear}
                    </div>
                  </div>
                </div>

                {/* ========================================================
                    HALAMAN 2: IDENTITAS PERGURUAN TINGGI PENGUSUL
                    ======================================================== */}
                <div className="space-y-6 min-h-[820px] page-break">
                  <div className="border-b-2 border-slate-900 pb-2 text-center">
                    <h3 className="text-base font-black uppercase tracking-tight text-slate-900 font-sans">
                      IDENTITAS PERGURUAN TINGGI PENGUSUL
                    </h3>
                  </div>

                  <table className="w-full border-collapse border border-slate-800 text-xs">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold bg-slate-50 w-1/3 border-r border-slate-300">Nama Perguruan Tinggi</td>
                        <td className="p-2.5 font-bold">{ledData.identitasPt.perguruanTinggi}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Badan Penyelenggara</td>
                        <td className="p-2.5">{ledData.identitasPt.badanPenyelenggara}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Nomor SK Pendirian PT</td>
                        <td className="p-2.5">{ledData.identitasPt.nomorSkPendirianPt}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Tanggal SK Pendirian PT</td>
                        <td className="p-2.5">{ledData.identitasPt.tanggalSkPendirianPt}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Pejabat Penerbit SK Pendirian</td>
                        <td className="p-2.5">{ledData.identitasPt.pejabatSkPendirianPt}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Alamat Kampus</td>
                        <td className="p-2.5">{ledData.identitasPt.alamat}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Kota / Kode Pos</td>
                        <td className="p-2.5">{ledData.identitasPt.kota}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Nomor Telepon</td>
                        <td className="p-2.5">{ledData.identitasPt.telepon}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Email & Situs Web Resmi</td>
                        <td className="p-2.5">{ledData.identitasPt.emailWeb}</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Peringkat & SK Akreditasi BAN-PT</td>
                        <td className="p-2.5 font-bold">{ledData.identitasPt.peringkatAkreditasiTerbaru} ({ledData.identitasPt.nomorSkBanPt})</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-300">Nama Pimpinan PT (Ketua)</td>
                        <td className="p-2.5 font-bold">{ledData.identitasPt.namaPimpinan} ({ledData.identitasPt.nidnPimpinan})</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ========================================================
                    HALAMAN 3: IDENTITAS TIM PENYUSUN
                    ======================================================== */}
                <div className="space-y-6 min-h-[820px] page-break">
                  <div className="border-b-2 border-slate-900 pb-2 text-center">
                    <h3 className="text-base font-black uppercase tracking-tight text-slate-900 font-sans">
                      IDENTITAS TIM PENYUSUN LAPORAN EVALUASI DIRI
                    </h3>
                  </div>

                  <table className="w-full border-collapse border border-slate-800 text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-800 text-slate-900 font-bold font-sans">
                        <th className="p-2.5 border-r border-slate-800 text-center w-12">No</th>
                        <th className="p-2.5 border-r border-slate-800">Nama Lengkap & Gelar</th>
                        <th className="p-2.5 border-r border-slate-800">NIDN / NIP</th>
                        <th className="p-2.5 border-r border-slate-800">Jabatan Struktural</th>
                        <th className="p-2.5">Peran dalam Tim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledData.timPenyusun.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-300">
                          <td className="p-2 text-center font-bold border-r border-slate-300">{idx + 1}</td>
                          <td className="p-2 font-bold border-r border-slate-300">{item.nama}</td>
                          <td className="p-2 font-mono border-r border-slate-300">{item.nikNidn}</td>
                          <td className="p-2 border-r border-slate-300">{item.jabatan}</td>
                          <td className="p-2 font-bold">{item.peran}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ========================================================
                    HALAMAN 4: KATA PENGANTAR
                    ======================================================== */}
                <div className="space-y-6 min-h-[820px] page-break">
                  <div className="border-b-2 border-slate-900 pb-2 text-center">
                    <h3 className="text-base font-black uppercase tracking-tight text-slate-900 font-sans">
                      KATA PENGANTAR
                    </h3>
                  </div>

                  <div className="text-justify leading-relaxed whitespace-pre-line text-xs space-y-4">
                    {ledData.kataPengantar}
                  </div>

                  <div className="pt-10 flex flex-col items-end text-xs">
                    <div className="text-center space-y-1 w-64">
                      <p>{ledData.identitasPt.kota}, {ledData.lembarPengesahan.tanggal}</p>
                      <p className="font-bold">Ketua STIMI YAPMI Makassar,</p>
                      <div className="h-20"></div>
                      <p className="font-bold underline text-sm">{ledData.identitasPt.namaPimpinan}</p>
                      <p className="font-mono text-[11px]">{ledData.identitasPt.nidnPimpinan}</p>
                    </div>
                  </div>
                </div>

                {/* ========================================================
                    HALAMAN 5: RINGKASAN EKSEKUTIF
                    ======================================================== */}
                <div className="space-y-6 min-h-[820px] page-break">
                  <div className="border-b-2 border-slate-900 pb-2 text-center">
                    <h3 className="text-base font-black uppercase tracking-tight text-slate-900 font-sans">
                      RINGKASAN EKSEKUTIF
                    </h3>
                  </div>

                  <div className="text-justify leading-relaxed whitespace-pre-line text-xs space-y-4">
                    {ledData.ringkasanEksekutif}
                  </div>
                </div>

                {/* ========================================================
                    HALAMAN 6: DAFTAR ISI
                    ======================================================== */}
                <div className="space-y-6 min-h-[820px] page-break font-sans">
                  <div className="border-b-2 border-slate-900 pb-2 text-center">
                    <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                      DAFTAR ISI
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-900">
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                      <span className="font-bold">HALAMAN MUKA (SAMPUL)</span>
                      <span>i</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                      <span className="font-bold">IDENTITAS PERGURUAN TINGGI PENGUSUL</span>
                      <span>ii</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                      <span className="font-bold">IDENTITAS TIM PENYUSUN LAPORAN EVALUASI DIRI</span>
                      <span>iii</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                      <span className="font-bold">KATA PENGANTAR</span>
                      <span>iv</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                      <span className="font-bold">RINGKASAN EKSEKUTIF</span>
                      <span>v</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                      <span className="font-bold">DAFTAR ISI</span>
                      <span>vi</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pt-2">
                      <span className="font-bold">BAB I: KRITERIA BUDAYA MUTU (CULTURE)</span>
                      <span>1</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>1.1 Sistem Penjaminan Mutu Internal (SPMI) Masukan</span>
                      <span>1</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>1.2 Pelaksanaan Siklus PPEPP dan RTM</span>
                      <span>2</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>1.3 Pelaporan SPMI & PD-Dikti Feeder</span>
                      <span>3</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>1.4 Pengakuan Eksternal Akreditasi Program Studi</span>
                      <span>4</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pt-2">
                      <span className="font-bold">BAB II: KRITERIA RELEVANSI (RELEVANCE)</span>
                      <span>5</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>2.1 Relevansi Pendidikan (Kurikulum OBE & Dosen)</span>
                      <span>5</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>2.2 Relevansi Penelitian (LPPM & Publikasi)</span>
                      <span>7</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>2.3 Relevansi Pengabdian kepada Masyarakat (PkM)</span>
                      <span>8</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pt-2">
                      <span className="font-bold">BAB III: KRITERIA AKUNTABILITAS (ACCOUNTABILITY)</span>
                      <span>9</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>3.1 Tata Pamong & Good University Governance (GUG)</span>
                      <span>9</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>3.2 Akuntabilitas Keuangan (Audit Eksternal KAP WTP)</span>
                      <span>10</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>3.3 Sistem K3, Kampus Sehat & Satgas PPKS</span>
                      <span>11</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pt-2">
                      <span className="font-bold">BAB IV: KRITERIA DIFERENSIASI MISI (MISSION)</span>
                      <span>12</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>4.1 Fokus Keunggulan Spesifik STIMI YAPMI Makassar</span>
                      <span>12</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>4.2 Rencana Strategis Jangka Panjang & Menengah</span>
                      <span>13</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pl-4">
                      <span>4.3 Kemitraan Strategis DUDIK Berkelanjutan &gt;= 5 Tahun</span>
                      <span>14</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1 pt-2">
                      <span className="font-bold">BAB V: PENUTUP & KOMITMEN PENINGKATAN MUTU</span>
                      <span>15</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                      <span className="font-bold">MATRIKS REKAPITULASI 39 BUTIR PENILAIAN IAPT 4.1</span>
                      <span>16</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                      <span className="font-bold">LEMBAR PENGESAHAN RESMI PIMPINAN & YAYASAN</span>
                      <span>18</span>
                    </div>
                  </div>
                </div>

                {/* ========================================================
                    HALAMAN 7: BAB I BUDAYA MUTU (CULTURE)
                    ======================================================== */}
                <div className="space-y-6 min-h-[820px] page-break">
                  <div className="border-b-2 border-slate-900 pb-2">
                    <h3 className="text-sm font-black uppercase text-slate-900 font-sans">
                      BAB I: EVALUASI KRITERIA BUDAYA MUTU (CULTURE)
                    </h3>
                  </div>
                  <div className="text-justify leading-relaxed whitespace-pre-line text-xs space-y-4">
                    {ledData.narasiKriteriaC}
                  </div>
                </div>

                {/* ========================================================
                    HALAMAN 8: BAB II RELEVANSI TRIDHARMA (RELEVANCE)
                    ======================================================== */}
                <div className="space-y-6 min-h-[820px] page-break">
                  <div className="border-b-2 border-slate-900 pb-2">
                    <h3 className="text-sm font-black uppercase text-slate-900 font-sans">
                      BAB II: EVALUASI KRITERIA RELEVANSI (RELEVANCE)
                    </h3>
                  </div>
                  <div className="text-justify leading-relaxed whitespace-pre-line text-xs space-y-4">
                    {ledData.narasiKriteriaR}
                  </div>
                </div>

                {/* ========================================================
                    HALAMAN 9: BAB III AKUNTABILITAS (ACCOUNTABILITY)
                    ======================================================== */}
                <div className="space-y-6 min-h-[820px] page-break">
                  <div className="border-b-2 border-slate-900 pb-2">
                    <h3 className="text-sm font-black uppercase text-slate-900 font-sans">
                      BAB III: EVALUASI KRITERIA AKUNTABILITAS (ACCOUNTABILITY)
                    </h3>
                  </div>
                  <div className="text-justify leading-relaxed whitespace-pre-line text-xs space-y-4">
                    {ledData.narasiKriteriaA}
                  </div>
                </div>

                {/* ========================================================
                    HALAMAN 10: BAB IV DIFERENSIASI MISI (MISSION)
                    ======================================================== */}
                <div className="space-y-6 min-h-[820px] page-break">
                  <div className="border-b-2 border-slate-900 pb-2">
                    <h3 className="text-sm font-black uppercase text-slate-900 font-sans">
                      BAB IV: EVALUASI KRITERIA DIFERENSIASI MISI (MISSION)
                    </h3>
                  </div>
                  <div className="text-justify leading-relaxed whitespace-pre-line text-xs space-y-4">
                    {ledData.narasiKriteriaM}
                  </div>
                </div>

                {/* ========================================================
                    HALAMAN 11: MATRIKS REKAPITULASI 39 BUTIR PENILAIAN BAN-PT
                    ======================================================== */}
                <div className="space-y-6 min-h-[820px] page-break font-sans">
                  <div className="border-b-2 border-slate-900 pb-2 text-center">
                    <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                      MATRIKS REKAPITULASI 39 BUTIR PENILAIAN IAPT 4.1 BAN-PT
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      Hasil Evaluasi Ketercapaian Status Terakreditasi & Terakreditasi Unggul
                    </p>
                  </div>

                  <table className="w-full border-collapse border border-slate-800 text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-800 text-slate-900 font-bold">
                        <th className="p-1.5 border-r border-slate-800 text-center w-8">No</th>
                        <th className="p-1.5 border-r border-slate-800 text-center w-12">CRAM</th>
                        <th className="p-1.5 border-r border-slate-800">Indikator & Aspek Penilaian</th>
                        <th className="p-1.5 border-r border-slate-800 text-center w-24">Syarat Perlu</th>
                        <th className="p-1.5 text-center w-24">Status Pemenuhan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indicators.map((item) => (
                        <tr key={item.nomor} className="border-b border-slate-300">
                          <td className="p-1.5 text-center font-bold border-r border-slate-300">{item.nomor}</td>
                          <td className="p-1.5 text-center font-bold border-r border-slate-300">{item.cramCategory}</td>
                          <td className="p-1.5 border-r border-slate-300">
                            <p className="font-bold text-slate-900">{item.indikator}</p>
                            <p className="text-slate-600 text-[9px] mt-0.5">{item.aspekPenilaian}</p>
                          </td>
                          <td className="p-1.5 text-center border-r border-slate-300 text-[9px]">
                            {item.isSyaratPerluUnggul ? (
                              <span className="font-bold text-amber-700">Unggul</span>
                            ) : item.isSyaratPerluTerakreditasi ? (
                              <span className="font-bold text-emerald-700">Terakreditasi</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-1.5 text-center font-bold">
                            {item.status === "MEMENUHI" ? (
                              <span className="text-emerald-700">MEMENUHI</span>
                            ) : (
                              <span className="text-rose-600">BELUM</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ========================================================
                    HALAMAN 12: BAB V PENUTUP & LEMBAR PENGESAHAN RESMI
                    ======================================================== */}
                <div className="space-y-8 min-h-[820px] page-break">
                  <div className="space-y-4">
                    <div className="border-b-2 border-slate-900 pb-2">
                      <h3 className="text-sm font-black uppercase text-slate-900 font-sans">
                        BAB V: PENUTUP
                      </h3>
                    </div>
                    <div className="text-justify leading-relaxed whitespace-pre-line text-xs">
                      {ledData.penutup}
                    </div>
                  </div>

                  {/* LEMBAR PENGESAHAN */}
                  <div className="pt-8 border-t-2 border-slate-900 space-y-6">
                    <div className="text-center">
                      <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 font-sans">
                        LEMBAR PENGESAHAN DOKUMEN EVALUASI DIRI (LED)
                      </h3>
                      <p className="text-xs text-slate-600 font-sans">
                        Ditetapkan di {ledData.lembarPengesahan.kota}, pada tanggal {ledData.lembarPengesahan.tanggal}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-center pt-8 text-xs font-sans">
                      {/* Pihak 1: Ketua STIMI YAPMI */}
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700">{ledData.lembarPengesahan.ketuaPt.jabatan},</p>
                        <div className="h-24 flex items-center justify-center">
                          <span className="text-[10px] text-slate-400 italic">[ Tanda Tangan & Cap Resmi ]</span>
                        </div>
                        <p className="font-black text-slate-900 underline text-sm">
                          {ledData.lembarPengesahan.ketuaPt.nama}
                        </p>
                        <p className="font-mono text-slate-600 text-[11px]">
                          {ledData.lembarPengesahan.ketuaPt.nikNidn}
                        </p>
                      </div>

                      {/* Pihak 2: Ketua Yayasan */}
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700">{ledData.lembarPengesahan.ketuaYayasan.jabatan},</p>
                        <div className="h-24 flex items-center justify-center">
                          <span className="text-[10px] text-slate-400 italic">[ Tanda Tangan & Cap Resmi ]</span>
                        </div>
                        <p className="font-black text-slate-900 underline text-sm">
                          {ledData.lembarPengesahan.ketuaYayasan.nama}
                        </p>
                        <p className="font-mono text-slate-600 text-[11px]">
                          {ledData.lembarPengesahan.ketuaYayasan.nikNidn}
                        </p>
                      </div>
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
