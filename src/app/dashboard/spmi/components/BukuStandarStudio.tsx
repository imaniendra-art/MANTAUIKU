"use client";

import { useState } from "react";
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
  Building2, 
  ShieldCheck, 
  Layers, 
  ListChecks, 
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Target,
  BarChart3,
  Award,
  Users,
  Compass,
  FileCheck
} from "lucide-react";
import { ISpmiDocument, ISpmiStandardItem } from "@/models/SpmiDocument";
import {
  STANDARD_STANDAR_PRELIMINARY_BABS,
  DEFAULT_LEMBAR_PENGESAHAN_STANDAR,
  DEFAULT_RIWAYAT_PERUBAHAN_STANDAR,
  DEFAULT_KATA_PENGANTAR_STANDAR,
  STANDARD_BAKU_18_STANDARDS,
} from "@/lib/spmi-constants";

interface BukuStandarStudioProps {
  doc: ISpmiDocument;
  isLpm: boolean;
  onRefresh: () => Promise<void>;
  onOpenPrintModal: () => void;
}

export default function BukuStandarStudio({
  doc,
  isLpm,
  onRefresh,
  onOpenPrintModal,
}: BukuStandarStudioProps) {
  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter State untuk 18 Butir Standar
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKelompok, setFilterKelompok] = useState<string>("ALL");
  const [filterBidang, setFilterBidang] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Search untuk 7 Bab Pedoman Awal
  const [babSearchQuery, setBabSearchQuery] = useState("");

  // In-Page State: Sampul & Metadata
  const [editingSampul, setEditingSampul] = useState(false);
  const [sampulForm, setSampulForm] = useState({
    title: doc?.title || "Buku III: Standar Penjaminan Mutu Internal (SPMI)",
    code: doc?.code || "SPMI-STD/01",
    skNumber: doc?.skNumber || "SK Ketua STIMI YAPMI No. 044/SK/YAPMI/IX/2025",
    version: doc?.version || "Rev 01 (2026)",
    description: doc?.description || "Standar mutu SPMI STIMI YAPMI Makassar berbasis SN-Dikti Permendiktisaintek No. 39/2025 jo. No. 10/2026 dan kriteria akreditasi LAMEMBA.",
    validFrom: doc?.validFrom ? new Date(doc.validFrom).toISOString().split("T")[0] : "2025-09-01",
    validUntil: doc?.validUntil ? new Date(doc.validUntil).toISOString().split("T")[0] : "2029-08-31",
    signedName: doc?.signedBy?.name || "Dr. Ibrahim Syah, S.E., M.M.",
    signedTitle: doc?.signedBy?.title || "Ketua STIMI YAPMI Makassar",
    signedNip: doc?.signedBy?.nipOrNidn || "NIDN. 0920037601",
  });

  // In-Page State: Lembar Pengesahan
  const [editingPengesahan, setEditingPengesahan] = useState(false);
  const [pengesahanForm, setPengesahanForm] = useState(
    doc?.lembarPengesahan || DEFAULT_LEMBAR_PENGESAHAN_STANDAR
  );

  // In-Page State: Riwayat Perubahan
  const [editingRiwayat, setEditingRiwayat] = useState(false);
  const [riwayatList, setRiwayatList] = useState(
    doc?.riwayatPerubahan && doc.riwayatPerubahan.length > 0
      ? doc.riwayatPerubahan
      : DEFAULT_RIWAYAT_PERUBAHAN_STANDAR
  );

  // In-Page State: Kata Pengantar
  const [editingKataPengantar, setEditingKataPengantar] = useState(false);
  const [kataPengantarText, setKataPengantarText] = useState(
    doc?.kataPengantar || DEFAULT_KATA_PENGANTAR_STANDAR
  );

  // In-Page State: 7 Bab Pendahuluan
  const [editingBabOrder, setEditingBabOrder] = useState<number | null>(null);
  const [babTextMap, setBabTextMap] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    (doc?.sections || []).forEach((sec) => {
      map[sec.order] = sec.content || "";
    });
    return map;
  });

  // In-Page State: Expanded Standards & Active Standard Editing
  const [expandedStandardCodes, setExpandedStandardCodes] = useState<Record<string, boolean>>({
    "STD-DIK-01": true, // Default buka standar nomor 1
  });
  const [editingStandardCode, setEditingStandardCode] = useState<string | null>(null);
  const [standardEditForm, setStandardEditForm] = useState<ISpmiStandardItem | null>(null);

  // In-Page Form: Tambah Standar Baru
  const [isAddingNewStandard, setIsAddingNewStandard] = useState(false);
  const [newStandardForm, setNewStandardForm] = useState<ISpmiStandardItem>({
    code: "",
    name: "",
    kelompok: "PROSES",
    bidang: "PENDIDIKAN",
    category: "PENDIDIKAN",
    version: "Rev 01 (2026)",
    tanggalPenetapan: "2025-09-01",
    tanggalBerlaku: "2025-09-01",
    responsibleUnit: "Program Studi S1 Manajemen",
    rasional: "",
    pihakBertanggungJawab: "Ketua STIMI (A), Waket I (C), Kaprodi (R), Dosen (C)",
    definisiIstilah: "",
    statement: "",
    indicators: [],
    indikatorKinerja: [],
    targetValue: "",
    strategies: [],
    sumberDaya: "SDM Dosen, Anggaran Unit, dan Fasilitas Kampus",
    caraPengukuran: {
      rumus: "",
      sumberData: "SIAKAD / PDDikti / LMS",
      periodeUkur: "Semesteran",
      pihakPengukur: "Kaprodi & LPM",
    },
    buktiDokumen: [],
    ppeppCycle: {
      penetapanDate: "2025-09-01",
      pelaksanaanNotes: "",
      evaluasiAmiStatus: "SESUAI",
      statusPemantauan: "HIJAU",
      pengendalianAction: "",
      peningkatanTarget: "",
    },
  });
  const [newStdIndicatorsText, setNewStdIndicatorsText] = useState("");
  const [newStdStrategiesText, setNewStdStrategiesText] = useState("");
  const [newStdBuktiText, setNewStdBuktiText] = useState("");

  // Saving Indicator
  const [isSaving, setIsSaving] = useState(false);

  // Trigger Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle Standard Expansion
  const toggleStandardExpand = (code: string) => {
    setExpandedStandardCodes((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // Expand All / Collapse All
  const expandAllStandards = (expand: boolean) => {
    const nextMap: Record<string, boolean> = {};
    (doc?.standards || []).forEach((s) => {
      nextMap[s.code] = expand;
    });
    setExpandedStandardCodes(nextMap);
  };

  // 1. Simpan Perubahan Sampul / Metadata
  const handleSaveSampul = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doc._id,
          title: sampulForm.title,
          code: sampulForm.code,
          skNumber: sampulForm.skNumber,
          version: sampulForm.version,
          description: sampulForm.description,
          signedBy: {
            name: sampulForm.signedName,
            title: sampulForm.signedTitle,
            nipOrNidn: sampulForm.signedNip,
            date: new Date(sampulForm.validFrom),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Sampul & SK Penetapan Buku Standar SPMI berhasil diperbarui!");
        setEditingSampul(false);
        await onRefresh();
      } else {
        alert(data.error || "Gagal menyimpan sampul");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan sampul.");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Simpan Lembar Pengesahan
  const handleSavePengesahan = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doc._id,
          bookType: "STANDAR",
          action: "UPDATE_PENGESAHAN",
          lembarPengesahan: pengesahanForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Lembar Pengesahan Buku Standar SPMI berhasil disimpan!");
        setEditingPengesahan(false);
        await onRefresh();
      } else {
        alert(data.error || "Gagal menyimpan lembar pengesahan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan lembar pengesahan.");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Simpan Riwayat Perubahan
  const handleSaveRiwayat = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doc._id,
          bookType: "STANDAR",
          action: "UPDATE_RIWAYAT",
          riwayatPerubahan: riwayatList,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Riwayat Perubahan Dokumen berhasil diperbarui!");
        setEditingRiwayat(false);
        await onRefresh();
      } else {
        alert(data.error || "Gagal menyimpan riwayat perubahan");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan riwayat perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRiwayatRow = () => {
    setRiwayatList([
      ...riwayatList,
      {
        revisi: `0${riwayatList.length}`,
        tanggal: new Date().toISOString().split("T")[0],
        bagianDiubah: "Penyesuaian butir standar mutu",
        alasan: "Hasil RTM / Evaluasi Siklus PPEPP",
        pengesah: "Ketua STIMI YAPMI Makassar",
      },
    ]);
  };

  // 4. Simpan Kata Pengantar
  const handleSaveKataPengantar = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doc._id,
          bookType: "STANDAR",
          action: "UPDATE_KATA_PENGANTAR",
          kataPengantar: kataPengantarText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Kata Pengantar Ketua LPM berhasil disimpan!");
        setEditingKataPengantar(false);
        await onRefresh();
      } else {
        alert(data.error || "Gagal menyimpan kata pengantar");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan kata pengantar.");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Simpan Bab Pendahuluan
  const handleSaveBab = async (order: number) => {
    try {
      setIsSaving(true);
      const babDef = STANDARD_STANDAR_PRELIMINARY_BABS.find((b) => b.order === order);
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doc._id,
          bookType: "STANDAR",
          action: "UPDATE_SECTION",
          section: {
            order,
            title: babDef?.title || `BAB ${order}`,
            content: babTextMap[order] || "",
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Isi ${babDef?.title || `Bab ${order}`} berhasil disimpan!`);
        setEditingBabOrder(null);
        await onRefresh();
      } else {
        alert(data.error || "Gagal menyimpan bab");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan bab.");
    } finally {
      setIsSaving(false);
    }
  };

  // 6. Mulai Edit Standar (In-Page)
  const handleStartEditStandard = (std: ISpmiStandardItem) => {
    setEditingStandardCode(std.code);
    setStandardEditForm(JSON.parse(JSON.stringify(std)));
    // Pastikan card terbuka
    setExpandedStandardCodes((prev) => ({ ...prev, [std.code]: true }));
  };

  // 7. Simpan Edit Standar (In-Page)
  const handleSaveEditedStandard = async () => {
    if (!standardEditForm || !editingStandardCode) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: doc._id,
          bookType: "STANDAR",
          action: "UPDATE_STANDARD",
          standardCode: editingStandardCode,
          standard: standardEditForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Standar ${editingStandardCode} (${standardEditForm.name}) berhasil disimpan!`);
        setEditingStandardCode(null);
        setStandardEditForm(null);
        await onRefresh();
      } else {
        alert(data.error || "Gagal memperbarui standar");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memperbarui standar.");
    } finally {
      setIsSaving(false);
    }
  };

  // 8. Hapus Standar
  const handleDeleteStandard = async (code: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus butir standar ${code} dari Buku III?`)) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/spmi/documents?standardCode=${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Standar ${code} berhasil dihapus.`);
        await onRefresh();
      } else {
        alert(data.error || "Gagal menghapus standar");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghapus standar.");
    } finally {
      setIsSaving(false);
    }
  };

  // 9. Simpan Standar Baru (In-Page)
  const handleCreateNewStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStandardForm.code || !newStandardForm.name) {
      alert("Kode dan Nama Standar wajib diisi!");
      return;
    }

    const indicatorsArr = newStdIndicatorsText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const strategiesArr = newStdStrategiesText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const buktiArr = newStdBuktiText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload: ISpmiStandardItem = {
      ...newStandardForm,
      indicators: indicatorsArr,
      strategies: strategiesArr,
      buktiDokumen: buktiArr,
    };

    try {
      setIsSaving(true);
      const res = await fetch("/api/spmi/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_STANDARD",
          standard: payload,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Standar baru ${payload.code} berhasil ditambahkan ke Buku III!`);
        setIsAddingNewStandard(false);
        setNewStandardForm({
          code: "",
          name: "",
          kelompok: "PROSES",
          bidang: "PENDIDIKAN",
          category: "PENDIDIKAN",
          version: "Rev 01 (2026)",
          tanggalPenetapan: "2025-09-01",
          tanggalBerlaku: "2025-09-01",
          responsibleUnit: "Program Studi S1 Manajemen",
          rasional: "",
          pihakBertanggungJawab: "Ketua STIMI (A), Waket I (C), Kaprodi (R), Dosen (C)",
          definisiIstilah: "",
          statement: "",
          indicators: [],
          indikatorKinerja: [],
          targetValue: "",
          strategies: [],
          sumberDaya: "SDM Dosen, Anggaran Unit, dan Fasilitas Kampus",
          caraPengukuran: {
            rumus: "",
            sumberData: "SIAKAD / PDDikti / LMS",
            periodeUkur: "Semesteran",
            pihakPengukur: "Kaprodi & LPM",
          },
          buktiDokumen: [],
          ppeppCycle: {
            penetapanDate: "2025-09-01",
            pelaksanaanNotes: "",
            evaluasiAmiStatus: "SESUAI",
            statusPemantauan: "HIJAU",
            pengendalianAction: "",
            peningkatanTarget: "",
          },
        });
        setNewStdIndicatorsText("");
        setNewStdStrategiesText("");
        setNewStdBuktiText("");
        await onRefresh();
      } else {
        alert(data.error || "Gagal menambahkan butir standar");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menambahkan standar baru.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter List Standar (Prioritaskan doc.standards dari database, fallback ke STANDARD_BAKU_18_STANDARDS)
  const allStandards = (doc?.standards && doc.standards.length > 0) ? doc.standards : STANDARD_BAKU_18_STANDARDS;
  const filteredStandards = allStandards.filter((std) => {
    const matchesKelompok = filterKelompok === "ALL" || std.kelompok === filterKelompok;
    const matchesBidang = filterBidang === "ALL" || std.bidang === filterBidang;
    const matchesStatus =
      filterStatus === "ALL" ||
      (std.ppeppCycle?.statusPemantauan || "HIJAU") === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      std.code.toLowerCase().includes(query) ||
      std.name.toLowerCase().includes(query) ||
      std.statement.toLowerCase().includes(query) ||
      std.responsibleUnit.toLowerCase().includes(query) ||
      (std.indicators || []).some((ind) => ind.toLowerCase().includes(query));

    return matchesKelompok && matchesBidang && matchesStatus && matchesQuery;
  });

  // Filter 7 Bab Pedoman Awal
  const filteredBabs = STANDARD_STANDAR_PRELIMINARY_BABS.filter((b) => {
    if (!babSearchQuery) return true;
    const q = babSearchQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.outline.toLowerCase().includes(q);
  });

  // Hitung Progres Standar
  const standardsWithStatement = allStandards.filter((s) => s.statement && s.statement.trim().length > 10).length;
  const standardsPercent = allStandards.length > 0 ? Math.round((standardsWithStatement / allStandards.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-indigo-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Bar Navigasi Dokumen & Statistik Naskah */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-black text-xs">
                {doc?.code || "SPMI-STD/01"}
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
              Naskah Studio: {doc?.title || "Buku III: Standar SPMI STIMI YAPMI Makassar"}
            </h2>
            <p className="text-xs text-slate-500">
              Pusat rumusan butir standar mutu berbasis Permendiktisaintek No. 39/2025 jo. No. 10/2026 dan kriteria LAMEMBA. Editor in-page aktif untuk 7 Bab Pedoman Awal & 18 Butir Standar 12 Elemen Baku.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isLpm && (
              <button
                onClick={() => {
                  setIsAddingNewStandard(!isAddingNewStandard);
                  const el = document.getElementById("sec-std-daftar");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingNewStandard ? "Tutup Form Tambah" : "+ Standar Baru"}</span>
              </button>
            )}
            <button
              onClick={onOpenPrintModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Pratinjau Cetak Kop Resmi</span>
            </button>
          </div>
        </div>

        {/* Progress Bar 18 Standar */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">
              Kemajuan Perumusan Butir Standar: <strong>{standardsWithStatement}</strong> dari <strong>{allStandards.length} Standar</strong> telah dirumuskan
            </span>
            <span className="text-indigo-700">{standardsPercent}% Selesai</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${standardsPercent}%` }}
            />
          </div>
        </div>

        {/* 4 Rumpun Standar Quick Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          {[
            { step: "1. Pendidikan", count: "8 Standar", desc: "CPL, Pembelajaran, Penilaian, Dosen, Sarpras" },
            { step: "2. Penelitian", count: "3 Standar", desc: "Hasil Riset, Proses Penelitian, Peneliti" },
            { step: "3. Pengabdian (PkM)", count: "3 Standar", desc: "Penerapan Iptek, Pengabdian, Pendanaan" },
            { step: "4. Standar Tambahan", count: "4 Standar", desc: "Tata Pamong, PMB, Tracer Study, SIM Kampus" },
          ].map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 block text-[11px] truncate">{item.step}</span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">{item.count}</span>
                </div>
                <span className="text-[10px] text-slate-500 block truncate">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Anchor Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs border-t border-slate-100">
          <span className="font-bold text-slate-400">Lompat ke bagian:</span>
          {[
            { id: "sec-std-sampul", label: "1. Sampul & SK" },
            { id: "sec-std-pengesahan", label: "2. Lembar Pengesahan" },
            { id: "sec-std-riwayat", label: "3. Riwayat Revisi" },
            { id: "sec-std-pengantar", label: "4. Kata Pengantar" },
            { id: "sec-std-batang-tubuh", label: "5. Pedoman (7 Bab)" },
            { id: "sec-std-daftar", label: `6. Butir Standar (${allStandards.length})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                const el = document.getElementById(pill.id);
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. BAGIAN 1: SAMPUL DOKUMEN & IDENTITAS LEGAL                  */}
      {/* ============================================================== */}
      <div id="sec-std-sampul" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider block">
              Bagian 1: Identitas Legal Naskah
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Sampul Dokumen & Surat Keputusan Penetapan Standar SPMI
            </h3>
          </div>
          {isLpm && !editingSampul && (
            <button
              onClick={() => setEditingSampul(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Sampul & Legalitas</span>
            </button>
          )}
        </div>

        {editingSampul ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveSampul(); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700">Judul Naskah Dokumen</label>
                <input
                  type="text"
                  required
                  value={sampulForm.title}
                  onChange={(e) => setSampulForm({ ...sampulForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Kode Naskah</label>
                <input
                  type="text"
                  required
                  value={sampulForm.code}
                  onChange={(e) => setSampulForm({ ...sampulForm, code: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Versi / Edisi</label>
                <input
                  type="text"
                  value={sampulForm.version}
                  onChange={(e) => setSampulForm({ ...sampulForm, version: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tanggal Berakhir Berlaku</label>
                <input
                  type="date"
                  value={sampulForm.validUntil}
                  onChange={(e) => setSampulForm({ ...sampulForm, validUntil: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">NIDN / NIP</label>
                  <input
                    type="text"
                    value={sampulForm.signedNip}
                    onChange={(e) => setSampulForm({ ...sampulForm, signedNip: e.target.value })}
                    className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200 font-bold"
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
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Sampul & Identitas"}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="border-2 border-slate-200 rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-indigo-50/20 to-white space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                YAYASAN PEMBANGUNAN MANAJEMEN INDONESIA (YAPMI) MAKASSAR
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-wide">
                SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI MAKASSAR
              </h2>
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 font-black text-[11px] tracking-wider mt-1">
                SISTEM PENJAMINAN MUTU INTERNAL (SPMI) • BUKU STANDAR SPMI
              </span>
            </div>

            <div className="py-6 border-y-2 border-slate-900/10 text-center space-y-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                DOKUMEN RESMI TINGKAT INSTITUSI
              </span>
              <h1 className="text-lg sm:text-2xl font-black text-slate-950 max-w-xl mx-auto">
                {doc?.title || "BUKU III: STANDAR SISTEM PENJAMINAN MUTU INTERNAL (SPMI)"}
              </h1>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                {doc?.description || "Standar mutu SPMI STIMI YAPMI Makassar berbasis SN-Dikti Permendiktisaintek No. 39/2025 jo. No. 10/2026 dan kriteria akreditasi LAMEMBA."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Kode Dokumen</span>
                <strong className="font-black text-slate-800">{doc?.code || "SPMI-STD/01"}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Nomor Revisi</span>
                <strong className="font-black text-slate-800">{doc?.version || "Rev 01 (2026)"}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Dasar Hukum Penetapan</span>
                <strong className="font-bold text-slate-800 text-[11px] line-clamp-2">{doc?.skNumber || "SK Ketua STIMI YAPMI No. 044/SK/YAPMI/IX/2025"}</strong>
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
              <strong className="text-sm font-black text-slate-900 block">{doc?.signedBy?.name || "Dr. Ibrahim Syah, S.E., M.M."}</strong>
              <span className="text-slate-600 text-xs block">{doc?.signedBy?.title || "Ketua STIMI YAPMI Makassar"} ({doc?.signedBy?.nipOrNidn || "NIDN. 0920037601"})</span>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* BAGIAN 2: LEMBAR PENGESAHAN STANDAR SPMI (6 TINGKAT)           */}
      {/* ============================================================== */}
      <section id="sec-std-pengesahan" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider block">
              Bagian 2: Legalitas & Otoritas Institusi
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Lembar Pengesahan Naskah Standar Mutu (6 Tingkat)
            </h3>
            <p className="text-xs text-slate-500">
              Pernyataan resmi perumusan, penjaminan mutu, pertimbangan Senat, persetujuan Yayasan YAPMI, dan penetapan Ketua STIMI YAPMI Makassar.
            </p>
          </div>

          {isLpm && !editingPengesahan && (
            <button
              onClick={() => setEditingPengesahan(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto"
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
                { key: "disusun" as const, stage: "1. Disusun oleh", defaultRole: "Tim Ad-Hoc Penyusun Standar / LPM" },
                { key: "diperiksa" as const, stage: "2. Diperiksa oleh", defaultRole: "Wakil Ketua I (Bidang Akademik & PPEPP)" },
                { key: "dikendalikan" as const, stage: "3. Dikendalikan oleh", defaultRole: "Ketua Lembaga Penjaminan Mutu (LPM)" },
                { key: "dipertimbangkan" as const, stage: "4. Dipertimbangkan oleh", defaultRole: "Ketua Senat Akademik" },
                { key: "disetujui" as const, stage: "5. Disetujui oleh", defaultRole: "Ketua Yayasan YAPMI Makassar" },
                { key: "ditetapkan" as const, stage: "6. Ditetapkan oleh", defaultRole: "Ketua STIMI YAPMI Makassar" },
              ].map((item) => {
                const cur = (pengesahanForm as any)?.[item.key] || {};
                return (
                  <div key={item.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-black text-indigo-950 block">{item.stage}</span>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Jabatan</label>
                      <input
                        type="text"
                        placeholder="Nama Jabatan..."
                        value={cur.jabatan || item.defaultRole}
                        onChange={(e) =>
                          setPengesahanForm({
                            ...pengesahanForm,
                            [item.key]: { ...cur, jabatan: e.target.value },
                          })
                        }
                        className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Nama Pejabat</label>
                      <input
                        type="text"
                        placeholder="Nama Pejabat..."
                        value={cur.nama || ""}
                        onChange={(e) =>
                          setPengesahanForm({
                            ...pengesahanForm,
                            [item.key]: { ...cur, nama: e.target.value },
                          })
                        }
                        className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Tanggal Pengesahan</label>
                      <input
                        type="date"
                        value={cur.tanggal || "2025-09-01"}
                        onChange={(e) =>
                          setPengesahanForm({
                            ...pengesahanForm,
                            [item.key]: { ...cur, tanggal: e.target.value },
                          })
                        }
                        className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200"
                      />
                    </div>
                  </div>
                );
              })}
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
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs shadow-md cursor-pointer transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Lembar Pengesahan</span>
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
                  { no: 1, label: "Penyusunan Naskah Standar", stage: pengesahanForm?.disusun },
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
      </section>

      {/* ============================================================== */}
      {/* BAGIAN 3: RIWAYAT PERUBAHAN DOKUMEN                            */}
      {/* ============================================================== */}
      <section id="sec-std-riwayat" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black">
              3
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Riwayat Perubahan Dokumen (Revision Ledger)
              </h3>
              <p className="text-xs text-slate-500">
                Catatan riwayat nomor revisi, tanggal pembaruan, dan pejabat pengesah standar
              </p>
            </div>
          </div>

          {isLpm && (
            <div className="flex items-center gap-2">
              {editingRiwayat && (
                <button
                  onClick={handleAddRiwayatRow}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris</span>
                </button>
              )}
              <button
                onClick={() => setEditingRiwayat(!editingRiwayat)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{editingRiwayat ? "Batal Edit" : "Edit Riwayat"}</span>
              </button>
            </div>
          )}
        </div>

        {editingRiwayat ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {riwayatList.map((row, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Revisi</label>
                    <input
                      type="text"
                      value={row.revisi}
                      onChange={(e) => {
                        const copy = [...riwayatList];
                        copy[idx].revisi = e.target.value;
                        setRiwayatList(copy);
                      }}
                      className="w-full p-2 bg-white rounded-lg border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Tanggal</label>
                    <input
                      type="date"
                      value={row.tanggal}
                      onChange={(e) => {
                        const copy = [...riwayatList];
                        copy[idx].tanggal = e.target.value;
                        setRiwayatList(copy);
                      }}
                      className="w-full p-2 bg-white rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Bagian Diubah</label>
                    <input
                      type="text"
                      value={row.bagianDiubah}
                      onChange={(e) => {
                        const copy = [...riwayatList];
                        copy[idx].bagianDiubah = e.target.value;
                        setRiwayatList(copy);
                      }}
                      className="w-full p-2 bg-white rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Alasan Perubahan</label>
                    <input
                      type="text"
                      value={row.alasan}
                      onChange={(e) => {
                        const copy = [...riwayatList];
                        copy[idx].alasan = e.target.value;
                        setRiwayatList(copy);
                      }}
                      className="w-full p-2 bg-white rounded-lg border border-slate-200"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Pengesah</label>
                      <input
                        type="text"
                        value={row.pengesah}
                        onChange={(e) => {
                          const copy = [...riwayatList];
                          copy[idx].pengesah = e.target.value;
                          setRiwayatList(copy);
                        }}
                        className="w-full p-2 bg-white rounded-lg border border-slate-200"
                      />
                    </div>
                    {riwayatList.length > 1 && (
                      <button
                        onClick={() => setRiwayatList(riwayatList.filter((_, i) => i !== idx))}
                        className="p-2 mt-4 text-rose-500 hover:bg-rose-100 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingRiwayat(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRiwayat}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-black shadow-md cursor-pointer transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Riwayat Perubahan</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-black">
                <tr>
                  <th className="p-3 border-b border-slate-200">Revisi</th>
                  <th className="p-3 border-b border-slate-200">Tanggal</th>
                  <th className="p-3 border-b border-slate-200">Bagian Diubah</th>
                  <th className="p-3 border-b border-slate-200">Alasan Perubahan</th>
                  <th className="p-3 border-b border-slate-200">Disahkan Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayatList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-indigo-900">{row.revisi}</td>
                    <td className="p-3 text-slate-600">{row.tanggal}</td>
                    <td className="p-3 font-semibold text-slate-900">{row.bagianDiubah}</td>
                    <td className="p-3 text-slate-600">{row.alasan}</td>
                    <td className="p-3 font-bold text-slate-800">{row.pengesah}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* BAGIAN 4: KATA PENGANTAR KETUA LPM                             */}
      {/* ============================================================== */}
      <section id="sec-std-pengantar" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black">
              4
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Kata Pengantar Ketua Lembaga Penjaminan Mutu (LPM)
              </h3>
              <p className="text-xs text-slate-500">
                Arah pengantar formal penerapan seluruh butir standar SPMI di lingkungan STIMI YAPMI Makassar
              </p>
            </div>
          </div>

          {isLpm && (
            <button
              onClick={() => setEditingKataPengantar(!editingKataPengantar)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{editingKataPengantar ? "Batal Edit" : "Edit Kata Pengantar"}</span>
            </button>
          )}
        </div>

        {editingKataPengantar ? (
          <div className="space-y-4">
            <textarea
              rows={8}
              value={kataPengantarText}
              onChange={(e) => setKataPengantarText(e.target.value)}
              className="w-full p-4 rounded-2xl text-xs bg-slate-50 border border-slate-200 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingKataPengantar(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveKataPengantar}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-black shadow-md cursor-pointer transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Kata Pengantar</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200/80 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-serif italic">
            {kataPengantarText}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* BAGIAN 5: PEDOMAN & BATANG TUBUH 7 BAB BAKU BUKU STANDAR       */}
      {/* ============================================================== */}
      <section id="sec-std-batang-tubuh" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black">
              5
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Pedoman Pengantar & Ketentuan Standar (7 Bab Baku)
              </h3>
              <p className="text-xs text-slate-500">
                Landasan hukum, visi-misi, prinsip penetapan formula ABCD, dan ketentuan pengendalian dokumen standar
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari bab pendahuluan..."
              value={babSearchQuery}
              onChange={(e) => setBabSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredBabs.map((bab) => {
            const isEditing = editingBabOrder === bab.order;
            const currentContent = babTextMap[bab.order] || "";
            const isFilled = currentContent.trim().length > 15;

            return (
              <div
                key={bab.order}
                className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white transition-all space-y-3 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-indigo-900 text-white font-black text-xs flex items-center justify-center">
                      {bab.order}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">{bab.title}</h4>
                    {isFilled ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        ✓ Terisi
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Belum Terisi
                      </span>
                    )}
                  </div>

                  {isLpm && (
                    <button
                      onClick={() => setEditingBabOrder(isEditing ? null : bab.order)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEditing ? "Tutup Editor" : isFilled ? "Edit Narasi" : "Tulis Narasi"}</span>
                    </button>
                  )}
                </div>

                {/* Box Panduan Sub-Bab Outline */}
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/70 text-xs text-indigo-950 space-y-1">
                  <strong className="block font-bold text-[11px] text-indigo-900">
                    Panduan Butir Bahasan Baku:
                  </strong>
                  <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">
                    {bab.outline}
                  </p>
                </div>

                {/* Editor In-Page */}
                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <textarea
                      rows={6}
                      placeholder={`Tuliskan narasi resmi ${bab.title} STIMI YAPMI Makassar di sini...`}
                      value={currentContent}
                      onChange={(e) =>
                        setBabTextMap({
                          ...babTextMap,
                          [bab.order]: e.target.value,
                        })
                      }
                      className="w-full p-4 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Jumlah kata: {currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0} kata
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingBabOrder(null)}
                          className="px-3 py-1.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveBab(bab.order)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-black shadow-md cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Bab #{bab.order}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  currentContent && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {currentContent}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* BAGIAN 6: BUTIR STANDAR SPMI (18 STANDAR & 12 ELEMEN BAKU)    */}
      {/* ============================================================== */}
      <section id="sec-std-daftar" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="sticky top-20 z-10 bg-white/95 backdrop-blur-md pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black shrink-0">
              6
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Pusat Rumusan Butir Standar SPMI & 12 Elemen Baku
              </h3>
              <p className="text-xs text-slate-500">
                14 Standar SN-Dikti + 4 Standar Tambahan STIMI YAPMI Makassar dengan instrumen formula ABCD
              </p>
            </div>
          </div>

          {isLpm && (
            <button
              onClick={() => {
                setIsAddingNewStandard(!isAddingNewStandard);
                if (!isAddingNewStandard) {
                  setTimeout(() => {
                    const el = document.getElementById("form-tambah-standar");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingNewStandard ? "Tutup Form Tambah" : "Tambah Standar Baru"}</span>
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filter Rumpun */}
            <select
              value={filterBidang}
              onChange={(e) => setFilterBidang(e.target.value)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Semua Rumpun</option>
              <option value="PENDIDIKAN">Pendidikan (8 Standar)</option>
              <option value="PENELITIAN">Penelitian (3 Standar)</option>
              <option value="PKM">PkM (3 Standar)</option>
              <option value="STANDAR_TAMBAHAN">Standar Tambahan / LAMEMBA (4 Standar)</option>
            </select>

            {/* Filter Kelompok */}
            <select
              value={filterKelompok}
              onChange={(e) => setFilterKelompok(e.target.value)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Semua Kelompok</option>
              <option value="LUARAN">Kelompok Luaran (Output/Outcome)</option>
              <option value="PROSES">Kelompok Proses (Pelaksanaan)</option>
              <option value="MASUKAN">Kelompok Masukan (Input/SDM/Sarpras)</option>
              <option value="TATA_KELOLA">Kelompok Tata Kelola</option>
            </select>

            {/* Filter Status Pemantauan */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Semua Status Pemantauan</option>
              <option value="HIJAU">● HIJAU (Sesuai Target)</option>
              <option value="KUNING">● KUNING (Perlu Perhatian)</option>
              <option value="MERAH">● MERAH (Kritis / Tidak Sesuai)</option>
              <option value="BIRU">● BIRU (Melampaui Target)</option>
            </select>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode, nama, pernyataan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* IN-PAGE FORM: TAMBAH STANDAR BARU (COLLAPSIBLE) */}
        {isAddingNewStandard && (
          <div id="form-tambah-standar" className="p-6 rounded-3xl bg-indigo-50/70 border-2 border-dashed border-indigo-300 space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-700" />
                <h4 className="text-sm font-black text-indigo-950">
                  Form Tambah Butir Standar SPMI Baru (In-Page)
                </h4>
              </div>
              <button
                onClick={() => setIsAddingNewStandard(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStandard} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kode Standar *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STD-TAM-05"
                    value={newStandardForm.code}
                    onChange={(e) => setNewStandardForm({ ...newStandardForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Standar *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Standar Kerjasama Internasional & Kemitraan Luar Negeri"
                    value={newStandardForm.name}
                    onChange={(e) => setNewStandardForm({ ...newStandardForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Rumpun Bidang</label>
                  <select
                    value={newStandardForm.bidang}
                    onChange={(e) => setNewStandardForm({ ...newStandardForm, bidang: e.target.value as any, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="PENDIDIKAN">Pendidikan</option>
                    <option value="PENELITIAN">Penelitian</option>
                    <option value="PKM">PkM</option>
                    <option value="STANDAR_TAMBAHAN">Standar Tambahan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kelompok Standar</label>
                  <select
                    value={newStandardForm.kelompok}
                    onChange={(e) => setNewStandardForm({ ...newStandardForm, kelompok: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="LUARAN">LUARAN (Output / Capaian)</option>
                    <option value="PROSES">PROSES (Pelaksanaan)</option>
                    <option value="MASUKAN">MASUKAN (Input / Sumber Daya)</option>
                    <option value="TATA_KELOLA">TATA KELOLA</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Unit Penanggung Jawab</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Program Studi S1 Manajemen / LPPM"
                    value={newStandardForm.responsibleUnit}
                    onChange={(e) => setNewStandardForm({ ...newStandardForm, responsibleUnit: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pernyataan Isi Standar (Formula ABCD: Audience, Behaviour, Condition, Degree) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Program Studi S1 Manajemen bersama Dosen menetapkan dan mengevaluasi..."
                  value={newStandardForm.statement}
                  onChange={(e) => setNewStandardForm({ ...newStandardForm, statement: e.target.value })}
                  className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Capaian Mutu *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100% mata kuliah selaras CPL, IPK >= 3.35"
                    value={newStandardForm.targetValue}
                    onChange={(e) => setNewStandardForm({ ...newStandardForm, targetValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Rasional & Alasan Penetapan</label>
                  <input
                    type="text"
                    placeholder="e.g. Diperlukan untuk memenuhi syarat akreditasi LAMEMBA..."
                    value={newStandardForm.rasional}
                    onChange={(e) => setNewStandardForm({ ...newStandardForm, rasional: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Indikator Ketercapaian (1 baris per butir)</label>
                  <textarea
                    rows={3}
                    placeholder="100% dokumen kurikulum sah&#10;IPK lulusan minimal 3.25"
                    value={newStdIndicatorsText}
                    onChange={(e) => setNewStdIndicatorsText(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Strategi Pencapaian (1 baris per butir)</label>
                  <textarea
                    rows={3}
                    placeholder="Workshop berkala dosen&#10;Monitoring bulanan via SIAKAD"
                    value={newStdStrategiesText}
                    onChange={(e) => setNewStdStrategiesText(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Dokumen Bukti Wajib (1 baris per butir)</label>
                  <textarea
                    rows={3}
                    placeholder="Buku Kurikulum OBE&#10;Rekap Nilai SIAKAD&#10;Laporan Monev"
                    value={newStdBuktiText}
                    onChange={(e) => setNewStdBuktiText(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-200">
                <button
                  type="button"
                  onClick={() => setIsAddingNewStandard(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-black shadow-md cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Standar Baru</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LIST 18 BUTIR STANDAR DENGAN 12 ELEMEN BAKU */}
        {filteredStandards.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 space-y-2">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-black text-slate-700">Tidak ada butir standar yang sesuai filter</h4>
            <p className="text-xs text-slate-400">Silakan ubah filter rumpun, kelompok, atau kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStandards.map((std) => {
              const isExpanded = !!expandedStandardCodes[std.code];
              const isEditing = editingStandardCode === std.code;

              return (
                <div
                  key={std.code}
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? "bg-white border-indigo-300 shadow-sm ring-1 ring-indigo-100"
                      : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  {/* HEADER KARTU STANDAR */}
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-mono font-black text-xs tracking-wide shadow-xs whitespace-nowrap">
                          {std.code}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-900 border border-indigo-100">
                          {std.kelompok || "PROSES"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                          {std.bidang || std.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                          Unit: {std.responsibleUnit}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Pemantauan 4 Warna */}
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-black border ${
                            std.ppeppCycle?.statusPemantauan === "MERAH"
                              ? "bg-rose-50 text-rose-800 border-rose-300"
                              : std.ppeppCycle?.statusPemantauan === "KUNING"
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : std.ppeppCycle?.statusPemantauan === "BIRU"
                              ? "bg-blue-50 text-blue-800 border-blue-300"
                              : "bg-emerald-50 text-emerald-800 border-emerald-300"
                          }`}
                        >
                          ● {std.ppeppCycle?.statusPemantauan || "HIJAU"}
                        </span>

                        {/* Toggle Expand Button */}
                        <button
                          onClick={() => toggleStandardExpand(std.code)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5 text-indigo-700" />
                              <span>Tutup 12 Elemen</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5 text-indigo-700" />
                              <span>Buka 12 Elemen</span>
                            </>
                          )}
                        </button>

                        {/* Edit Button */}
                        {isLpm && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingStandardCode(null);
                                  setStandardEditForm(null);
                                } else {
                                  handleStartEditStandard(std);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{isEditing ? "Batal Edit" : "Edit In-Page"}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteStandard(std.code)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus butir standar ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Judul & Pernyataan ABCD */}
                    <div className="space-y-1.5">
                      <h4 className="text-base font-black text-slate-900">{std.name}</h4>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <strong className="text-slate-900 font-bold">Pernyataan Standar (ABCD): </strong>
                        {std.statement || "(Pernyataan isi standar belum dirumuskan)"}
                      </p>
                    </div>

                    {/* Target & Pengukuran Singkat */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 space-y-1">
                        <span className="font-bold text-indigo-950 block text-[11px]">Target Capaian Mutu:</span>
                        <p className="text-indigo-900 font-black text-xs">{std.targetValue || "-"}</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100/80 space-y-1">
                        <span className="font-bold text-sky-950 block text-[11px]">Sumber Data & Pengukur:</span>
                        <p className="text-slate-600 text-xs">
                          {std.caraPengukuran?.sumberData || "-"} • Pengukur: {std.caraPengukuran?.pihakPengukur || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================== */}
                  {/* DETAIL 12 ELEMEN BAKU (EXPANDED VIEW & INLINE EDIT MODE) */}
                  {/* ========================================================== */}
                  {isExpanded && (
                    <div className="border-t border-slate-200/80 bg-slate-50/40 p-6 sm:p-8 space-y-6">
                      {isEditing && standardEditForm ? (
                        /* --- INLINE EDIT MODE (NO MODAL) --- */
                        <div className="space-y-6 bg-white p-6 rounded-2xl border border-indigo-200 shadow-xs">
                          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                            <span className="text-xs font-black text-indigo-950 flex items-center gap-2">
                              <Edit3 className="w-4 h-4 text-indigo-600" />
                              <span>Mengedit 12 Elemen Baku: {standardEditForm.code} ({standardEditForm.name})</span>
                            </span>
                            <span className="text-[11px] text-slate-400">Mode In-Page Canvas</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">1. Nama Standar</label>
                              <input
                                type="text"
                                value={standardEditForm.name}
                                onChange={(e) => setStandardEditForm({ ...standardEditForm, name: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Kelompok</label>
                              <select
                                value={standardEditForm.kelompok}
                                onChange={(e) => setStandardEditForm({ ...standardEditForm, kelompok: e.target.value as any })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                              >
                                <option value="LUARAN">LUARAN</option>
                                <option value="PROSES">PROSES</option>
                                <option value="MASUKAN">MASUKAN</option>
                                <option value="TATA_KELOLA">TATA KELOLA</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Bidang</label>
                              <select
                                value={standardEditForm.bidang}
                                onChange={(e) => setStandardEditForm({ ...standardEditForm, bidang: e.target.value as any, category: e.target.value as any })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                              >
                                <option value="PENDIDIKAN">Pendidikan</option>
                                <option value="PENELITIAN">Penelitian</option>
                                <option value="PKM">PkM</option>
                                <option value="STANDAR_TAMBAHAN">Standar Tambahan</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Unit Penanggung Jawab</label>
                              <input
                                type="text"
                                value={standardEditForm.responsibleUnit}
                                onChange={(e) => setStandardEditForm({ ...standardEditForm, responsibleUnit: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Status Pemantauan 4 Warna</label>
                              <select
                                value={standardEditForm.ppeppCycle?.statusPemantauan || "HIJAU"}
                                onChange={(e) =>
                                  setStandardEditForm({
                                    ...standardEditForm,
                                    ppeppCycle: {
                                      ...standardEditForm.ppeppCycle,
                                      statusPemantauan: e.target.value as any,
                                    },
                                  })
                                }
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                              >
                                <option value="HIJAU">● HIJAU (Sesuai Target)</option>
                                <option value="KUNING">● KUNING (Perlu Perhatian)</option>
                                <option value="MERAH">● MERAH (Kritis)</option>
                                <option value="BIRU">● BIRU (Melampaui)</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Status Evaluasi AMI</label>
                              <select
                                value={standardEditForm.ppeppCycle?.evaluasiAmiStatus || "SESUAI"}
                                onChange={(e) =>
                                  setStandardEditForm({
                                    ...standardEditForm,
                                    ppeppCycle: {
                                      ...standardEditForm.ppeppCycle,
                                      evaluasiAmiStatus: e.target.value as any,
                                    },
                                  })
                                }
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                              >
                                <option value="SESUAI">SESUAI (Compliant)</option>
                                <option value="OB">OB (Observasi)</option>
                                <option value="KTS">KTS (Ketidaksesuaian)</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            <label className="font-bold text-slate-700">2. Rasional Standar & Kaitan SN-Dikti</label>
                            <textarea
                              rows={2}
                              value={standardEditForm.rasional}
                              onChange={(e) => setStandardEditForm({ ...standardEditForm, rasional: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">3. Pihak Bertanggung Jawab (RACI)</label>
                              <input
                                type="text"
                                value={standardEditForm.pihakBertanggungJawab}
                                onChange={(e) => setStandardEditForm({ ...standardEditForm, pihakBertanggungJawab: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">4. Definisi Istilah</label>
                              <input
                                type="text"
                                value={standardEditForm.definisiIstilah}
                                onChange={(e) => setStandardEditForm({ ...standardEditForm, definisiIstilah: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                              />
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            <label className="font-bold text-slate-700">5. Pernyataan Isi Standar (Rumusan ABCD)</label>
                            <textarea
                              rows={3}
                              value={standardEditForm.statement}
                              onChange={(e) => setStandardEditForm({ ...standardEditForm, statement: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg leading-relaxed font-medium"
                            />
                          </div>

                          <div className="space-y-1 text-xs">
                            <label className="font-bold text-slate-700">6. Indikator Kinerja (1 baris per indikator)</label>
                            <textarea
                              rows={3}
                              value={(standardEditForm.indicators || []).join("\n")}
                              onChange={(e) =>
                                setStandardEditForm({
                                  ...standardEditForm,
                                  indicators: e.target.value.split("\n").filter((s) => s.trim().length > 0),
                                })
                              }
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">7. Target Capaian Mutu</label>
                              <input
                                type="text"
                                value={standardEditForm.targetValue}
                                onChange={(e) => setStandardEditForm({ ...standardEditForm, targetValue: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-indigo-900"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">9. Alokasi Sumber Daya</label>
                              <input
                                type="text"
                                value={standardEditForm.sumberDaya}
                                onChange={(e) => setStandardEditForm({ ...standardEditForm, sumberDaya: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">8. Strategi Pencapaian (1 baris per butir)</label>
                              <textarea
                                rows={2}
                                value={(standardEditForm.strategies || []).join("\n")}
                                onChange={(e) =>
                                  setStandardEditForm({
                                    ...standardEditForm,
                                    strategies: e.target.value.split("\n").filter((s) => s.trim().length > 0),
                                  })
                                }
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">11. Dokumen Bukti Wajib (1 baris per butir)</label>
                              <textarea
                                rows={2}
                                value={(standardEditForm.buktiDokumen || []).join("\n")}
                                onChange={(e) =>
                                  setStandardEditForm({
                                    ...standardEditForm,
                                    buktiDokumen: e.target.value.split("\n").filter((s) => s.trim().length > 0),
                                  })
                                }
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                              />
                            </div>
                          </div>

                          {/* 10. Cara Pengukuran */}
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                            <span className="font-black text-indigo-950 block">10. Cara Pengukuran Standar</span>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">Rumus Perhitungan</label>
                                <input
                                  type="text"
                                  value={standardEditForm.caraPengukuran?.rumus || ""}
                                  onChange={(e) =>
                                    setStandardEditForm({
                                      ...standardEditForm,
                                      caraPengukuran: { ...standardEditForm.caraPengukuran, rumus: e.target.value },
                                    })
                                  }
                                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">Sumber Data</label>
                                <input
                                  type="text"
                                  value={standardEditForm.caraPengukuran?.sumberData || ""}
                                  onChange={(e) =>
                                    setStandardEditForm({
                                      ...standardEditForm,
                                      caraPengukuran: { ...standardEditForm.caraPengukuran, sumberData: e.target.value },
                                    })
                                  }
                                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">Periode Ukur</label>
                                <input
                                  type="text"
                                  value={standardEditForm.caraPengukuran?.periodeUkur || ""}
                                  onChange={(e) =>
                                    setStandardEditForm({
                                      ...standardEditForm,
                                      caraPengukuran: { ...standardEditForm.caraPengukuran, periodeUkur: e.target.value },
                                    })
                                  }
                                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">Pihak Pengukur</label>
                                <input
                                  type="text"
                                  value={standardEditForm.caraPengukuran?.pihakPengukur || ""}
                                  onChange={(e) =>
                                    setStandardEditForm({
                                      ...standardEditForm,
                                      caraPengukuran: { ...standardEditForm.caraPengukuran, pihakPengukur: e.target.value },
                                    })
                                  }
                                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 12. Catatan Siklus PPEPP */}
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                            <span className="font-black text-indigo-950 block">12. Alur Catatan Siklus PPEPP</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">Pelaksanaan (P)</label>
                                <textarea
                                  rows={2}
                                  value={standardEditForm.ppeppCycle?.pelaksanaanNotes || ""}
                                  onChange={(e) =>
                                    setStandardEditForm({
                                      ...standardEditForm,
                                      ppeppCycle: { ...standardEditForm.ppeppCycle, pelaksanaanNotes: e.target.value },
                                    })
                                  }
                                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">Pengendalian (P) - RTL</label>
                                <textarea
                                  rows={2}
                                  value={standardEditForm.ppeppCycle?.pengendalianAction || ""}
                                  onChange={(e) =>
                                    setStandardEditForm({
                                      ...standardEditForm,
                                      ppeppCycle: { ...standardEditForm.ppeppCycle, pengendalianAction: e.target.value },
                                    })
                                  }
                                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 font-bold block mb-1">Peningkatan (P) - Target Baru</label>
                                <textarea
                                  rows={2}
                                  value={standardEditForm.ppeppCycle?.peningkatanTarget || ""}
                                  onChange={(e) =>
                                    setStandardEditForm({
                                      ...standardEditForm,
                                      ppeppCycle: { ...standardEditForm.ppeppCycle, peningkatanTarget: e.target.value },
                                    })
                                  }
                                  className="w-full p-2 bg-white rounded-lg border border-slate-200 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-100">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStandardCode(null);
                                setStandardEditForm(null);
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEditedStandard}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-black shadow-md cursor-pointer transition-colors disabled:opacity-50"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Simpan 12 Elemen Standar</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* --- READ-ONLY 12 ELEMEN DISPLAY --- */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* 1. Rasional & Bentuk Pelampauan */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                              <span className="font-black text-indigo-950 flex items-center gap-1.5 text-xs">
                                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                                <span>2. Rasional Standar & Pelampauan</span>
                              </span>
                              <p className="text-slate-600 text-xs leading-relaxed">
                                {std.rasional || "-"}
                              </p>
                            </div>

                            {/* 3. Pihak Bertanggung Jawab (RACI) */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                              <span className="font-black text-indigo-950 flex items-center gap-1.5 text-xs">
                                <Users className="w-3.5 h-3.5 text-indigo-600" />
                                <span>3. Pihak Bertanggung Jawab (RACI)</span>
                              </span>
                              <p className="text-slate-800 font-bold text-xs">
                                {std.pihakBertanggungJawab || "-"}
                              </p>
                              <span className="text-[10px] text-slate-400 block">
                                R=Responsible, A=Accountable, C=Consulted, I=Informed
                              </span>
                            </div>

                            {/* 4. Definisi Istilah */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                              <span className="font-black text-indigo-950 flex items-center gap-1.5 text-xs">
                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                <span>4. Definisi Istilah Kunci</span>
                              </span>
                              <p className="text-slate-600 text-xs leading-relaxed">
                                {std.definisiIstilah || "-"}
                              </p>
                            </div>

                            {/* 6. Indikator Kinerja */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                              <span className="font-black text-indigo-950 flex items-center gap-1.5 text-xs">
                                <Target className="w-3.5 h-3.5 text-indigo-600" />
                                <span>6. Indikator Kinerja (Utama/Pelampauan)</span>
                              </span>
                              {std.indicators && std.indicators.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs">
                                  {std.indicators.map((ind, i) => (
                                    <li key={i}>{ind}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-slate-400 text-xs">Belum ada indikator terinci</p>
                              )}
                            </div>

                            {/* 8. Strategi Pencapaian */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                              <span className="font-black text-indigo-950 flex items-center gap-1.5 text-xs">
                                <Award className="w-3.5 h-3.5 text-indigo-600" />
                                <span>8. Strategi Pencapaian Mutu</span>
                              </span>
                              {std.strategies && std.strategies.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs">
                                  {std.strategies.map((strat, i) => (
                                    <li key={i}>{strat}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-slate-400 text-xs">Belum ada strategi khusus</p>
                              )}
                            </div>

                            {/* 9. Alokasi Sumber Daya */}
                            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                              <span className="font-black text-indigo-950 flex items-center gap-1.5 text-xs">
                                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                                <span>9. Alokasi Sumber Daya</span>
                              </span>
                              <p className="text-slate-700 text-xs">
                                {std.sumberDaya || "-"}
                              </p>
                            </div>
                          </div>

                          {/* 10. Cara Pengukuran */}
                          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                            <span className="font-black text-indigo-950 flex items-center gap-1.5 text-xs">
                              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>10. Cara Pengukuran & Rumus Perhitungan</span>
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                              <div>
                                <span className="text-slate-400 font-semibold block text-[10px]">Rumus:</span>
                                <strong className="text-slate-800 block text-xs">{std.caraPengukuran?.rumus || "-"}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 font-semibold block text-[10px]">Sumber Data:</span>
                                <strong className="text-slate-800 block text-xs">{std.caraPengukuran?.sumberData || "-"}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 font-semibold block text-[10px]">Periode Ukur:</span>
                                <strong className="text-slate-800 block text-xs">{std.caraPengukuran?.periodeUkur || "-"}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 font-semibold block text-[10px]">Pihak Pengukur:</span>
                                <strong className="text-slate-800 block text-xs">{std.caraPengukuran?.pihakPengukur || "-"}</strong>
                              </div>
                            </div>
                          </div>

                          {/* 11. Dokumen Bukti Wajib */}
                          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                            <span className="font-black text-indigo-950 flex items-center gap-1.5 text-xs">
                              <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>11. Dokumen Bukti Wajib (Evidence-by-Design)</span>
                            </span>
                            {std.buktiDokumen && std.buktiDokumen.length > 0 ? (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {std.buktiDokumen.map((b, i) => (
                                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                                    📄 {b}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-400 text-xs">Belum ada daftar bukti khusus</p>
                            )}
                          </div>

                          {/* 12. Alur Siklus PPEPP */}
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-3 text-xs">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <span className="font-black text-indigo-200 text-xs flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>12. Integrasi Siklus PPEPP untuk Butir Ini</span>
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                Ditetapkan: {std.ppeppCycle?.penetapanDate || std.tanggalPenetapan || "2025-09-01"}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                                <span className="text-[10px] font-black text-sky-300 block uppercase">Pelaksanaan (P)</span>
                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                  {std.ppeppCycle?.pelaksanaanNotes || "-"}
                                </p>
                              </div>
                              <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                                <span className="text-[10px] font-black text-amber-300 block uppercase">Pengendalian (P) - RTL</span>
                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                  {std.ppeppCycle?.pengendalianAction || "-"}
                                </p>
                              </div>
                              <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                                <span className="text-[10px] font-black text-emerald-300 block uppercase">Peningkatan (P)</span>
                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                  {std.ppeppCycle?.peningkatanTarget || "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
