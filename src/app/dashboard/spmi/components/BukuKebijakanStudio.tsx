"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Save, 
  X, 
  Search, 
  Check, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  ShieldCheck, 
  Layers, 
  ListChecks, 
  Calendar,
  Sparkles
} from "lucide-react";
import { ISpmiDocument } from "@/models/SpmiDocument";
import {
  STANDARD_KEBIJAKAN_21_BAB,
  STANDARD_KEBIJAKAN_LAMPIRAN,
  DEFAULT_LEMBAR_PENGESAHAN,
  DEFAULT_RIWAYAT_PERUBAHAN,
  DEFAULT_KATA_PENGANTAR,
} from "@/lib/spmi-constants";

interface BukuKebijakanStudioProps {
  doc: ISpmiDocument;
  isLpm: boolean;
  onRefresh: () => Promise<void>;
  onOpenPrintModal: () => void;
}

export default function BukuKebijakanStudio({
  doc,
  isLpm,
  onRefresh,
  onOpenPrintModal,
}: BukuKebijakanStudioProps) {
  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search/Filter for 21 Chapters
  const [searchQuery, setSearchQuery] = useState("");

  // In-Page State: Sampul & Metadata
  const [editingSampul, setEditingSampul] = useState(false);
  const [sampulForm, setSampulForm] = useState({
    title: doc?.title || "Buku I: Kebijakan Penjaminan Mutu Internal (SPMI)",
    code: doc?.code || "SPMI-K/01",
    skNumber: doc?.skNumber || "SK Ketua STIMI YAPMI No. 042/SK/YAPMI/IX/2025",
    version: doc?.version || "Rev 01 (2026)",
    description: doc?.description || "Arah kebijakan mutu internal, asas tata pamong, dan struktur LPM STIMI YAPMI Makassar.",
    validFrom: doc?.validFrom ? new Date(doc.validFrom).toISOString().split("T")[0] : "2025-09-01",
    validUntil: doc?.validUntil ? new Date(doc.validUntil).toISOString().split("T")[0] : "2029-08-31",
    signedName: doc?.signedBy?.name || "Dr. Ibrahim Syah, S.E., M.M.",
    signedTitle: doc?.signedBy?.title || "Ketua STIMI YAPMI Makassar",
    signedNidn: doc?.signedBy?.nipOrNidn || "NIDN. 0920037601",
  });
  const [savingSampul, setSavingSampul] = useState(false);

  // In-Page State: Lembar Pengesahan
  const [editingPengesahan, setEditingPengesahan] = useState(false);
  const [pengesahanForm, setPengesahanForm] = useState(
    doc?.lembarPengesahan?.disusun ? doc.lembarPengesahan : DEFAULT_LEMBAR_PENGESAHAN
  );
  const [savingPengesahan, setSavingPengesahan] = useState(false);

  // In-Page State: Riwayat Perubahan
  const [editingRiwayat, setEditingRiwayat] = useState(false);
  const [riwayatList, setRiwayatList] = useState(
    doc?.riwayatPerubahan && doc.riwayatPerubahan.length > 0 ? doc.riwayatPerubahan : DEFAULT_RIWAYAT_PERUBAHAN
  );
  const [newRiwayat, setNewRiwayat] = useState({
    revisi: "",
    tanggal: new Date().toISOString().split("T")[0],
    bagianDiubah: "",
    alasan: "",
    pengesah: "Ketua STIMI YAPMI Makassar",
  });
  const [savingRiwayat, setSavingRiwayat] = useState(false);

  // In-Page State: Kata Pengantar
  const [editingPengantar, setEditingPengantar] = useState(false);
  const [kataPengantarDraft, setKataPengantarDraft] = useState(
    doc?.kataPengantar || DEFAULT_KATA_PENGANTAR
  );
  const [savingPengantar, setSavingPengantar] = useState(false);

  // In-Page State: 21 Bab
  const [editingBabOrder, setEditingBabOrder] = useState<number | null>(null);
  const [babDrafts, setBabDrafts] = useState<Record<number, string>>({});
  const [savingBabOrder, setSavingBabOrder] = useState<number | null>(null);

  // In-Page State: Lampiran
  const [editingLampiranNomor, setEditingLampiranNomor] = useState<number | null>(null);
  const [lampiranDrafts, setLampiranDrafts] = useState<Record<number, string>>({});
  const [savingLampiranNomor, setSavingLampiranNomor] = useState<number | null>(null);

  // Sync internal state when doc updates from parent
  useEffect(() => {
    if (doc) {
      setSampulForm({
        title: doc.title || "Buku I: Kebijakan Penjaminan Mutu Internal (SPMI)",
        code: doc.code || "SPMI-K/01",
        skNumber: doc.skNumber || "SK Ketua STIMI YAPMI No. 042/SK/YAPMI/IX/2025",
        version: doc.version || "Rev 01 (2026)",
        description: doc.description || "",
        validFrom: doc.validFrom ? new Date(doc.validFrom).toISOString().split("T")[0] : "2025-09-01",
        validUntil: doc.validUntil ? new Date(doc.validUntil).toISOString().split("T")[0] : "2029-08-31",
        signedName: doc.signedBy?.name || "Dr. Ibrahim Syah, S.E., M.M.",
        signedTitle: doc.signedBy?.title || "Ketua STIMI YAPMI Makassar",
        signedNidn: doc.signedBy?.nipOrNidn || "NIDN. 0920037601",
      });

      if (doc.lembarPengesahan?.disusun) {
        setPengesahanForm(doc.lembarPengesahan);
      }
      if (doc.riwayatPerubahan && doc.riwayatPerubahan.length > 0) {
        setRiwayatList(doc.riwayatPerubahan);
      }
      if (doc.kataPengantar) {
        setKataPengantarDraft(doc.kataPengantar);
      }
    }
  }, [doc]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Simpan Sampul & Metadata In-Page
  const handleSaveSampul = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSampul(true);
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_METADATA",
          bookType: "KEBIJAKAN",
          id: doc._id,
          metadata: {
            title: sampulForm.title,
            code: sampulForm.code,
            skNumber: sampulForm.skNumber,
            version: sampulForm.version,
            description: sampulForm.description,
            validFrom: sampulForm.validFrom,
            validUntil: sampulForm.validUntil,
            signedBy: {
              name: sampulForm.signedName,
              title: sampulForm.signedTitle,
              nipOrNidn: sampulForm.signedNidn,
            },
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Sampul & Identitas Kebijakan SPMI berhasil disimpan!");
        setEditingSampul(false);
        await onRefresh();
      } else {
        alert(json.error || "Gagal menyimpan sampul.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSavingSampul(false);
    }
  };

  // 2. Simpan Lembar Pengesahan In-Page
  const handleSavePengesahan = async () => {
    try {
      setSavingPengesahan(true);
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PENGESAHAN",
          bookType: "KEBIJAKAN",
          id: doc._id,
          lembarPengesahan: pengesahanForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Lembar Pengesahan 6 Tingkat berhasil disimpan!");
        setEditingPengesahan(false);
        await onRefresh();
      } else {
        alert(json.error || "Gagal menyimpan pengesahan.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSavingPengesahan(false);
    }
  };

  // 3. Simpan Riwayat Perubahan In-Page
  const handleSaveRiwayat = async () => {
    try {
      setSavingRiwayat(true);
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_RIWAYAT",
          bookType: "KEBIJAKAN",
          id: doc._id,
          riwayatPerubahan: riwayatList,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Riwayat Perubahan Dokumen berhasil disimpan!");
        setEditingRiwayat(false);
        await onRefresh();
      } else {
        alert(json.error || "Gagal menyimpan riwayat.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSavingRiwayat(false);
    }
  };

  const handleAddRiwayatRow = () => {
    if (!newRiwayat.revisi || !newRiwayat.bagianDiubah) {
      alert("Nomor revisi dan bagian yang diubah wajib diisi.");
      return;
    }
    setRiwayatList((prev) => [...prev, newRiwayat]);
    setNewRiwayat({
      revisi: "",
      tanggal: new Date().toISOString().split("T")[0],
      bagianDiubah: "",
      alasan: "",
      pengesah: "Ketua STIMI YAPMI Makassar",
    });
  };

  // 4. Simpan Kata Pengantar In-Page
  const handleSavePengantar = async () => {
    try {
      setSavingPengantar(true);
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_KATA_PENGANTAR",
          bookType: "KEBIJAKAN",
          id: doc._id,
          kataPengantar: kataPengantarDraft,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Kata Pengantar Ketua LPM berhasil disimpan!");
        setEditingPengantar(false);
        await onRefresh();
      } else {
        alert(json.error || "Gagal menyimpan kata pengantar.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSavingPengantar(false);
    }
  };

  // 5. Simpan Bab Spesifik In-Page
  const handleSaveBab = async (order: number, title: string) => {
    try {
      setSavingBabOrder(order);
      const sec = doc?.sections?.find((s) => s.order === order);
      const contentToSave =
        babDrafts[order] !== undefined ? babDrafts[order] : sec?.content || "";

      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SECTION",
          bookType: "KEBIJAKAN",
          id: doc._id,
          section: {
            order,
            title,
            content: contentToSave,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Bab ${order}: "${title}" berhasil disimpan!`);
        setEditingBabOrder(null);
        await onRefresh();
      } else {
        alert(json.error || "Gagal menyimpan isian bab.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSavingBabOrder(null);
    }
  };

  // 6. Simpan Lampiran In-Page
  const handleSaveLampiran = async (nomor: number) => {
    try {
      setSavingLampiranNomor(nomor);
      const updated = STANDARD_KEBIJAKAN_LAMPIRAN.map((l) => {
        const existing = (doc?.lampiran || []).find((x) => x.nomor === l.nomor);
        const curContent =
          lampiranDrafts[l.nomor] !== undefined
            ? lampiranDrafts[l.nomor]
            : existing?.konten || "";
        return {
          nomor: l.nomor,
          judul: l.judul,
          konten: curContent,
        };
      });

      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_LAMPIRAN",
          bookType: "KEBIJAKAN",
          id: doc._id,
          lampiran: updated,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Lampiran ${nomor} berhasil disimpan!`);
        setEditingLampiranNomor(null);
        await onRefresh();
      } else {
        alert(json.error || "Gagal menyimpan lampiran.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSavingLampiranNomor(null);
    }
  };

  // Progress statistik
  const sections = doc?.sections || [];
  const filledCount = sections.filter((s) => s.content && s.content.trim().length > 0).length;
  const progressPercent = Math.round((filledCount / 21) * 100);

  // Filter 21 Bab
  const filteredBabs = STANDARD_KEBIJAKAN_21_BAB.filter((bab) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const sec = sections.find((s) => s.order === bab.order);
    return (
      bab.title.toLowerCase().includes(q) ||
      bab.outline.toLowerCase().includes(q) ||
      (sec?.content && sec.content.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Bar Navigasi Dokumen & Statistik Naskah */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-black text-xs">
                {doc?.code || "SPMI-K/01"}
              </span>
              <span className="text-xs font-bold text-slate-500">
                Versi: {doc?.version || "Rev 01 (2026)"}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                <Check className="w-3 h-3" />
                <span>{doc?.status?.replace("_", " ") || "DITETAPKAN BERLAKU"}</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Naskah Studio: {doc?.title || "Buku I: Kebijakan SPMI STIMI YAPMI Makassar"}
            </h2>
            <p className="text-xs text-slate-500">
              Disusun berdasarkan standar Permendiktisaintek No. 39/2025 jo. No. 10/2026. Editor in-page aktif untuk seluruh 21 Bab & lembar kelengkapan formal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Pratinjau Cetak Kop Resmi</span>
            </button>
          </div>
        </div>

        {/* Progress Bar 21 Bab */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">
              Kemajuan Perumusan Narasi: <strong>{filledCount}</strong> dari <strong>21 Bab</strong> telah diisi
            </span>
            <span className="text-sky-700">{progressPercent}% Selesai</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Anchor Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="font-bold text-slate-400">Lompat ke bagian:</span>
          {[
            { id: "sec-sampul", label: "1. Sampul & SK" },
            { id: "sec-pengesahan", label: "2. Lembar Pengesahan" },
            { id: "sec-riwayat", label: "3. Riwayat Revisi" },
            { id: "sec-pengantar", label: "4. Kata Pengantar" },
            { id: "sec-bab", label: "5. Batang Tubuh (21 Bab)" },
            { id: "sec-lampiran", label: "6. Lampiran (1-4)" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                const el = document.getElementById(pill.id);
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. BAGIAN 1: SAMPUL DOKUMEN & IDENTITAS LEGAL                       */}
      {/* =================================================================== */}
      <div id="sec-sampul" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black text-sky-700 uppercase tracking-wider block">
              Bagian 1: Identitas Legal Naskah
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Sampul Dokumen & Surat Keputusan Penetapan
            </h3>
          </div>
          {isLpm && !editingSampul && (
            <button
              onClick={() => setEditingSampul(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Sampul & Legalitas</span>
            </button>
          )}
        </div>

        {editingSampul ? (
          <form onSubmit={handleSaveSampul} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Judul Naskah Dokumen</label>
                <input
                  type="text"
                  required
                  value={sampulForm.title}
                  onChange={(e) => setSampulForm({ ...sampulForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Kode Naskah</label>
                <input
                  type="text"
                  required
                  value={sampulForm.code}
                  onChange={(e) => setSampulForm({ ...sampulForm, code: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nomor SK Penetapan</label>
                <input
                  type="text"
                  required
                  value={sampulForm.skNumber}
                  onChange={(e) => setSampulForm({ ...sampulForm, skNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Versi / Edisi</label>
                <input
                  type="text"
                  value={sampulForm.version}
                  onChange={(e) => setSampulForm({ ...sampulForm, version: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tanggal Mulai Berlaku</label>
                <input
                  type="date"
                  value={sampulForm.validFrom}
                  onChange={(e) => setSampulForm({ ...sampulForm, validFrom: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tanggal Berakhir Berlaku</label>
                <input
                  type="date"
                  value={sampulForm.validUntil}
                  onChange={(e) => setSampulForm({ ...sampulForm, validUntil: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-800 block">Pejabat Penetap (Ketua Institusi):</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Nama Pejabat</label>
                  <input
                    type="text"
                    value={sampulForm.signedName}
                    onChange={(e) => setSampulForm({ ...sampulForm, signedName: e.target.value })}
                    className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">NIDN / NIP</label>
                  <input
                    type="text"
                    value={sampulForm.signedNidn}
                    onChange={(e) => setSampulForm({ ...sampulForm, signedNidn: e.target.value })}
                    className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Jabatan Resmi</label>
                <input
                  type="text"
                  value={sampulForm.signedTitle}
                  onChange={(e) => setSampulForm({ ...sampulForm, signedTitle: e.target.value })}
                  className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingSampul(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingSampul}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSampul ? "Menyimpan..." : "Simpan Sampul & Identitas"}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="border-2 border-slate-200 rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-slate-50/50 to-white space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                YAYASAN PEMBANGUNAN MANAJEMEN INDONESIA (YAPMI) MAKASSAR
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-wide">
                SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI MAKASSAR
              </h2>
              <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-black text-[11px] tracking-wider mt-1">
                SISTEM PENJAMINAN MUTU INTERNAL (SPMI)
              </span>
            </div>

            <div className="py-6 border-y-2 border-slate-900/10 text-center space-y-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                DOKUMEN RESMI TINGKAT INSTITUSI
              </span>
              <h1 className="text-lg sm:text-2xl font-black text-slate-950 max-w-xl mx-auto">
                {doc?.title || "BUKU I: KEBIJAKAN SISTEM PENJAMINAN MUTU INTERNAL (SPMI)"}
              </h1>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                {doc?.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Kode Dokumen</span>
                <strong className="font-black text-slate-800">{doc?.code}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Nomor Revisi</span>
                <strong className="font-black text-slate-800">{doc?.version}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Dasar Hukum Penetapan</span>
                <strong className="font-bold text-slate-800 text-[11px] line-clamp-2">{doc?.skNumber}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Masa Berlaku</span>
                <strong className="font-bold text-slate-800 text-[11px]">
                  {doc?.validFrom ? new Date(doc.validFrom).toLocaleDateString("id-ID", { year: "numeric", month: "short" }) : "Sep 2025"} s.d.{" "}
                  {doc?.validUntil ? new Date(doc.validUntil).toLocaleDateString("id-ID", { year: "numeric", month: "short" }) : "Agu 2029"}
                </strong>
              </div>
            </div>

            <div className="pt-2 text-center text-xs space-y-1">
              <span className="text-slate-400 text-[11px] block">Ditetapkan Secara Sah oleh:</span>
              <strong className="text-sm font-black text-slate-900 block">{doc?.signedBy?.name}</strong>
              <span className="text-slate-600 text-xs block">{doc?.signedBy?.title} ({doc?.signedBy?.nipOrNidn})</span>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 3. BAGIAN 2: LEMBAR PENGESAHAN DOKUMEN (6 TINGKAT)                  */}
      {/* =================================================================== */}
      <div id="sec-pengesahan" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black text-sky-700 uppercase tracking-wider block">
              Bagian 2: Pengesahan Institusional
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Lembar Pengesahan Naskah Kebijakan SPMI (6 Tingkat Penetapan)
            </h3>
            <p className="text-xs text-slate-500">
              Pernyataan resmi perumusan, penjaminan, pertimbangan Senat, persetujuan Yayasan YAPMI, dan penetapan Ketua STIMI YAPMI Makassar.
            </p>
          </div>
          {isLpm && !editingPengesahan && (
            <button
              onClick={() => setEditingPengesahan(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Lembar Pengesahan</span>
            </button>
          )}
        </div>

        {editingPengesahan ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "disusun" as const, stage: "1. Disusun oleh", defaultRole: "Tim Ad-Hoc / Sekretaris LPM" },
                { key: "diperiksa" as const, stage: "2. Diperiksa oleh", defaultRole: "Wakil Ketua I (Akademik & Kerjasama)" },
                { key: "dikendalikan" as const, stage: "3. Dikendalikan oleh", defaultRole: "Ketua Lembaga Penjaminan Mutu (LPM)" },
                { key: "dipertimbangkan" as const, stage: "4. Dipertimbangkan oleh", defaultRole: "Ketua Senat Akademik" },
                { key: "disetujui" as const, stage: "5. Disetujui oleh", defaultRole: "Ketua Yayasan YAPMI Makassar" },
                { key: "ditetapkan" as const, stage: "6. Ditetapkan oleh", defaultRole: "Ketua STIMI YAPMI Makassar" },
              ].map((item) => (
                <div key={item.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-sky-900 block">{item.stage}</span>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Jabatan</label>
                    <input
                      type="text"
                      value={pengesahanForm[item.key]?.jabatan || item.defaultRole}
                      onChange={(e) =>
                        setPengesahanForm({
                          ...pengesahanForm,
                          [item.key]: {
                            ...pengesahanForm[item.key],
                            jabatan: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Nama Pejabat</label>
                    <input
                      type="text"
                      value={pengesahanForm[item.key]?.nama || ""}
                      onChange={(e) =>
                        setPengesahanForm({
                          ...pengesahanForm,
                          [item.key]: {
                            ...pengesahanForm[item.key],
                            nama: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Tanggal Pengesahan</label>
                    <input
                      type="date"
                      value={pengesahanForm[item.key]?.tanggal || "2025-09-01"}
                      onChange={(e) =>
                        setPengesahanForm({
                          ...pengesahanForm,
                          [item.key]: {
                            ...pengesahanForm[item.key],
                            tanggal: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPengesahan(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePengesahan}
                disabled={savingPengesahan}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingPengesahan ? "Menyimpan..." : "Simpan Lembar Pengesahan"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black">
                  <th className="p-3 border border-slate-200 w-12 text-center">No</th>
                  <th className="p-3 border border-slate-200">Tahapan Pengesahan</th>
                  <th className="p-3 border border-slate-200">Jabatan Pengesah</th>
                  <th className="p-3 border border-slate-200">Nama Pejabat</th>
                  <th className="p-3 border border-slate-200 w-32 text-center">Tanggal</th>
                  <th className="p-3 border border-slate-200 w-28 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {[
                  { no: 1, label: "Penyusunan Naskah", stage: pengesahanForm?.disusun },
                  { no: 2, label: "Pemeriksaan Akademik", stage: pengesahanForm?.diperiksa },
                  { no: 3, label: "Pengendalian Mutu", stage: pengesahanForm?.dikendalikan },
                  { no: 4, label: "Pertimbangan Senat", stage: pengesahanForm?.dipertimbangkan },
                  { no: 5, label: "Persetujuan Yayasan", stage: pengesahanForm?.disetujui },
                  { no: 6, label: "Penetapan Resmi Ketua", stage: pengesahanForm?.ditetapkan },
                ].map((row) => (
                  <tr key={row.no} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 border border-slate-200 text-center font-bold text-slate-500">{row.no}</td>
                    <td className="p-3 border border-slate-200 font-bold text-slate-900">{row.label}</td>
                    <td className="p-3 border border-slate-200 text-slate-600">{row.stage?.jabatan || "-"}</td>
                    <td className="p-3 border border-slate-200 font-bold text-slate-800">{row.stage?.nama || "-"}</td>
                    <td className="p-3 border border-slate-200 text-center text-slate-500">
                      {row.stage?.tanggal || "-"}
                    </td>
                    <td className="p-3 border border-slate-200 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        <Check className="w-3 h-3" />
                        <span>Sah</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 4. BAGIAN 3: RIWAYAT PERUBAHAN DOKUMEN (REVISION LEDGER)             */}
      {/* =================================================================== */}
      <div id="sec-riwayat" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black text-sky-700 uppercase tracking-wider block">
              Bagian 3: Pengendalian Versi (PPEPP Peningkatan)
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Riwayat Perubahan Dokumen (Revision Ledger)
            </h3>
            <p className="text-xs text-slate-500">
              Mencatat riwayat penetapan awal dan amandemen berkala sesuai siklus evaluasi & peningkatan mutu institusi.
            </p>
          </div>
          {isLpm && !editingRiwayat && (
            <button
              onClick={() => setEditingRiwayat(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>+ Tambah / Edit Catatan Revisi</span>
            </button>
          )}
        </div>

        {editingRiwayat ? (
          <div className="space-y-4">
            {/* Tabel baris yang sudah ada */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-2xl">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black">
                    <th className="p-2 border border-slate-200 w-16">Revisi</th>
                    <th className="p-2 border border-slate-200 w-28">Tanggal</th>
                    <th className="p-2 border border-slate-200">Bagian yang Diubah</th>
                    <th className="p-2 border border-slate-200">Alasan Perubahan</th>
                    <th className="p-2 border border-slate-200 w-40">Pejabat Pengesah</th>
                    <th className="p-2 border border-slate-200 w-10 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riwayatList.map((r, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border border-slate-200">
                        <input
                          type="text"
                          value={r.revisi}
                          onChange={(e) => {
                            const updated = [...riwayatList];
                            updated[idx].revisi = e.target.value;
                            setRiwayatList(updated);
                          }}
                          className="w-full p-1 rounded-lg text-xs bg-slate-50 border border-slate-200 font-bold"
                        />
                      </td>
                      <td className="p-2 border border-slate-200">
                        <input
                          type="date"
                          value={r.tanggal}
                          onChange={(e) => {
                            const updated = [...riwayatList];
                            updated[idx].tanggal = e.target.value;
                            setRiwayatList(updated);
                          }}
                          className="w-full p-1 rounded-lg text-xs bg-slate-50 border border-slate-200"
                        />
                      </td>
                      <td className="p-2 border border-slate-200">
                        <input
                          type="text"
                          value={r.bagianDiubah}
                          onChange={(e) => {
                            const updated = [...riwayatList];
                            updated[idx].bagianDiubah = e.target.value;
                            setRiwayatList(updated);
                          }}
                          className="w-full p-1 rounded-lg text-xs bg-slate-50 border border-slate-200"
                        />
                      </td>
                      <td className="p-2 border border-slate-200">
                        <input
                          type="text"
                          value={r.alasan}
                          onChange={(e) => {
                            const updated = [...riwayatList];
                            updated[idx].alasan = e.target.value;
                            setRiwayatList(updated);
                          }}
                          className="w-full p-1 rounded-lg text-xs bg-slate-50 border border-slate-200"
                        />
                      </td>
                      <td className="p-2 border border-slate-200">
                        <input
                          type="text"
                          value={r.pengesah}
                          onChange={(e) => {
                            const updated = [...riwayatList];
                            updated[idx].pengesah = e.target.value;
                            setRiwayatList(updated);
                          }}
                          className="w-full p-1 rounded-lg text-xs bg-slate-50 border border-slate-200 font-bold"
                        />
                      </td>
                      <td className="p-2 border border-slate-200 text-center">
                        <button
                          type="button"
                          onClick={() => setRiwayatList(riwayatList.filter((_, i) => i !== idx))}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Form Tambah Baris Baru */}
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-3">
              <span className="text-xs font-black text-sky-950 block">+ Tambah Catatan Riwayat Baru</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Revisi (e.g. 01)"
                  value={newRiwayat.revisi}
                  onChange={(e) => setNewRiwayat({ ...newRiwayat, revisi: e.target.value })}
                  className="p-2 rounded-xl text-xs bg-white border border-slate-200"
                />
                <input
                  type="date"
                  value={newRiwayat.tanggal}
                  onChange={(e) => setNewRiwayat({ ...newRiwayat, tanggal: e.target.value })}
                  className="p-2 rounded-xl text-xs bg-white border border-slate-200"
                />
                <input
                  type="text"
                  placeholder="Bagian yang diubah..."
                  value={newRiwayat.bagianDiubah}
                  onChange={(e) => setNewRiwayat({ ...newRiwayat, bagianDiubah: e.target.value })}
                  className="sm:col-span-2 p-2 rounded-xl text-xs bg-white border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Alasan perubahan / penyesuaian..."
                  value={newRiwayat.alasan}
                  onChange={(e) => setNewRiwayat({ ...newRiwayat, alasan: e.target.value })}
                  className="sm:col-span-2 p-2 rounded-xl text-xs bg-white border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddRiwayatRow}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
                >
                  Tambahkan ke Tabel
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingRiwayat(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRiwayat}
                disabled={savingRiwayat}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingRiwayat ? "Menyimpan..." : "Simpan Riwayat Perubahan"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-black">
                  <th className="p-3 border border-slate-200 w-20 text-center">Revisi</th>
                  <th className="p-3 border border-slate-200 w-32 text-center">Tanggal</th>
                  <th className="p-3 border border-slate-200">Bagian yang Diubah</th>
                  <th className="p-3 border border-slate-200">Alasan Perubahan</th>
                  <th className="p-3 border border-slate-200 w-48">Pejabat Pengesah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {riwayatList.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 border border-slate-200 text-center font-bold text-sky-800 bg-sky-50/50">
                      Rev {r.revisi}
                    </td>
                    <td className="p-3 border border-slate-200 text-center text-slate-500 font-bold">
                      {r.tanggal}
                    </td>
                    <td className="p-3 border border-slate-200 font-bold text-slate-900">{r.bagianDiubah}</td>
                    <td className="p-3 border border-slate-200 text-slate-600">{r.alasan}</td>
                    <td className="p-3 border border-slate-200 font-bold text-slate-800">{r.pengesah}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 5. BAGIAN 4: KATA PENGANTAR KETUA LPM                                */}
      {/* =================================================================== */}
      <div id="sec-pengantar" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black text-sky-700 uppercase tracking-wider block">
              Bagian 4: Pengantar Resmi
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Kata Pengantar Ketua Lembaga Penjaminan Mutu (LPM)
            </h3>
            <p className="text-xs text-slate-500">
              Pernyataan visi, komitmen perbaikan mutu berkelanjutan, dan apresiasi kepada seluruh unit kerja STIMI YAPMI Makassar.
            </p>
          </div>
          {isLpm && !editingPengantar && (
            <button
              onClick={() => setEditingPengantar(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Kata Pengantar</span>
            </button>
          )}
        </div>

        {editingPengantar ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Teks Narasi Kata Pengantar</label>
              <textarea
                rows={10}
                value={kataPengantarDraft}
                onChange={(e) => setKataPengantarDraft(e.target.value)}
                className="w-full p-4 rounded-2xl text-xs bg-slate-50 border border-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ketik narasi kata pengantar Ketua LPM STIMI YAPMI Makassar di sini..."
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPengantar(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePengantar}
                disabled={savingPengantar}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingPengantar ? "Menyimpan..." : "Simpan Kata Pengantar"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-4">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-serif italic">
              {kataPengantarDraft || "Kata pengantar belum diisi. Klik 'Edit Kata Pengantar' untuk mengetik narasi."}
            </p>
            <div className="pt-4 border-t border-slate-200 text-right text-xs">
              <span className="font-bold text-slate-800 block">Lembaga Penjaminan Mutu (LPM)</span>
              <span className="text-slate-500 block">STIMI YAPMI Makassar</span>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 6. BAGIAN 5: BATANG TUBUH 21 BAB KEBIJAKAN SPMI (IN-PAGE EDITOR)   */}
      {/* =================================================================== */}
      <div id="sec-bab" className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-black text-sky-700 uppercase tracking-wider block">
                Bagian 5: Batang Tubuh Standar Permendiktisaintek
              </span>
              <h3 className="text-base sm:text-xl font-black text-slate-900">
                21 Bab Kebijakan SPMI STIMI YAPMI Makassar
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Setiap bab telah dipetakan judul dan fokus bahasannya. Klik <strong>Edit Bab Ini</strong> pada bab manapun untuk mengetik atau menyempurnakan narasi langsung di halaman ini.
              </p>
            </div>

            {/* Kotak Pencarian Bab */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nomor bab atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Daftar 21 Bab Card */}
        <div className="space-y-4">
          {filteredBabs.map((bab) => {
            const sec = sections.find((s) => s.order === bab.order);
            const content = sec?.content || "";
            const hasContent = content.trim().length > 0;
            const wordCount = hasContent ? content.trim().split(/\s+/).length : 0;
            const isEditing = editingBabOrder === bab.order;
            const isSavingThis = savingBabOrder === bab.order;

            return (
              <div
                key={bab.order}
                className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all ${
                  isEditing
                    ? "border-sky-500 shadow-lg ring-2 ring-sky-100"
                    : "border-slate-200/80 shadow-xs hover:border-slate-300"
                }`}
              >
                {/* Header Bab */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-sky-950 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {bab.order < 10 ? `0${bab.order}` : bab.order}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900">
                        {bab.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {hasContent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3" />
                            <span>Telah Diisi ({wordCount} kata)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            <AlertCircle className="w-3 h-3" />
                            <span>Belum Ada Narasi (Siap Diketik)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isLpm && (
                    <div>
                      {isEditing ? (
                        <button
                          onClick={() => setEditingBabOrder(null)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tutup Editor</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingBabOrder(bab.order);
                            setBabDrafts((prev) => ({
                              ...prev,
                              [bab.order]: prev[bab.order] !== undefined ? prev[bab.order] : content,
                            }));
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{hasContent ? "Edit Isi Bab" : "Ketik Narasi Bab Ini"}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Outline Panduan Standar Permendiktisaintek */}
                <div className="my-3 p-3 rounded-2xl bg-sky-50/60 border border-sky-100/80 text-[11px] text-sky-900 leading-relaxed">
                  <strong className="block text-sky-950 font-bold mb-0.5">
                    Outline Pokok Bahasan Bab {bab.order}:
                  </strong>
                  <span className="whitespace-pre-line text-slate-700">{bab.outline}</span>
                </div>

                {/* Mode Tampilan vs Mode Editor In-Page */}
                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
                        <span>Ketik narasi kebijakan mutu STIMI YAPMI Makassar untuk bab ini:</span>
                        <span>
                          {((babDrafts[bab.order] !== undefined ? babDrafts[bab.order] : content).trim().split(/\s+/).filter(Boolean).length)} kata
                        </span>
                      </div>
                      <textarea
                        rows={12}
                        autoFocus
                        value={
                          babDrafts[bab.order] !== undefined ? babDrafts[bab.order] : content
                        }
                        onChange={(e) =>
                          setBabDrafts((prev) => ({
                            ...prev,
                            [bab.order]: e.target.value,
                          }))
                        }
                        className="w-full p-4 rounded-2xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed font-sans"
                        placeholder={`Ketik rumusan kebijakan untuk ${bab.title} STIMI YAPMI Makassar di sini...`}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] text-slate-400">
                        Perubahan disimpan langsung ke pangkalan data SPMI.
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingBabOrder(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={isSavingThis}
                          onClick={() => handleSaveBab(bab.order, bab.title)}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md hover:from-emerald-500 hover:to-teal-500 cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSavingThis ? "Menyimpan..." : "Simpan Bab Ini"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    {hasContent ? (
                      <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                        {content}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center space-y-2 bg-slate-50/30">
                        <p className="text-xs text-slate-500">
                          Belum ada narasi tersimpan untuk <strong>{bab.title}</strong>.
                        </p>
                        {isLpm && (
                          <button
                            onClick={() => {
                              setEditingBabOrder(bab.order);
                              setBabDrafts((prev) => ({
                                ...prev,
                                [bab.order]: "",
                              }));
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Mulai Ketik Bab Ini</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 7. BAGIAN 6: LAMPIRAN-LAMPIRAN NASKAH KEBIJAKAN                     */}
      {/* =================================================================== */}
      <div id="sec-lampiran" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <span className="text-[11px] font-black text-sky-700 uppercase tracking-wider block">
            Bagian 6: Dokumen Pelengkap Naskah
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Lampiran Naskah Kebijakan SPMI (Lampiran 1 s.d. 4)
          </h3>
          <p className="text-xs text-slate-500">
            Peta dokumen tata berkas L1-L6, matriks penugasan wewenang wewenang RACI, matriks manajemen unit, dan naskah pakta komitmen mutu.
          </p>
        </div>

        <div className="space-y-4">
          {STANDARD_KEBIJAKAN_LAMPIRAN.map((lamp) => {
            const existing = (doc?.lampiran || []).find((l) => l.nomor === lamp.nomor);
            const content = existing?.konten || "";
            const isEditing = editingLampiranNomor === lamp.nomor;
            const isSavingThis = savingLampiranNomor === lamp.nomor;

            return (
              <div
                key={lamp.nomor}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center">
                      L{lamp.nomor}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      {lamp.judul}
                    </h4>
                  </div>

                  {isLpm && (
                    <div>
                      {isEditing ? (
                        <button
                          onClick={() => setEditingLampiranNomor(null)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                        >
                          Tutup
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingLampiranNomor(lamp.nomor);
                            setLampiranDrafts((prev) => ({
                              ...prev,
                              [lamp.nomor]: prev[lamp.nomor] !== undefined ? prev[lamp.nomor] : content,
                            }));
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-sky-50 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{content ? "Edit Isian" : "Ketik Lampiran"}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-1">
                    <textarea
                      rows={6}
                      value={
                        lampiranDrafts[lamp.nomor] !== undefined
                          ? lampiranDrafts[lamp.nomor]
                          : content
                      }
                      onChange={(e) =>
                        setLampiranDrafts((prev) => ({
                          ...prev,
                          [lamp.nomor]: e.target.value,
                        }))
                      }
                      className="w-full p-3 rounded-xl text-xs bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                      placeholder={`Ketik rincian atau tautan berkas pendukung untuk ${lamp.judul}...`}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingLampiranNomor(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={isSavingThis}
                        onClick={() => handleSaveLampiran(lamp.nomor)}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3 h-3" />
                        <span>{isSavingThis ? "Menyimpan..." : "Simpan Lampiran"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {content ? (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line font-mono">
                        {content}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Lampiran ini belum memiliki rincian catatan. Klik &lsquo;Ketik Lampiran&rsquo; untuk melengkapi.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
