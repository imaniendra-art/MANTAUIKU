"use client";

import { useState, useEffect, useId } from "react";
import { useSession } from "next-auth/react";
import { 
  BookOpen, 
  FileText, 
  Printer, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Plus, 
  Edit3, 
  Save, 
  X,
  Search,
  Filter,
  Building2,
  Calendar,
  Check,
  Folder,
  FolderOpen,
  UploadCloud,
  Trash2,
  Eye,
  FileCheck,
  Info,
  RefreshCw,
  Tag,
  Clock,
  Shield,
  FileUp,
  File
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ISpmiDocument, ISpmiStandardItem, ISpmiFormItem, ISpmiSectionItem } from "@/models/SpmiDocument";
import { ISpmiVaultFile, SpmiVaultFolder } from "@/models/SpmiVaultFile";
import BukuKebijakanStudio from "./components/BukuKebijakanStudio";
import BukuManualStudio from "./components/BukuManualStudio";
import BukuStandarStudio from "./components/BukuStandarStudio";
import { STANDARD_BAKU_18_STANDARDS } from "@/lib/spmi-constants";

// Daftar 12 Folder Baku Repositori SPMI-PD/01
const VAULT_FOLDERS: { id: SpmiVaultFolder; label: string; desc: string; color: string }[] = [
  { id: "01_Kebijakan", label: "01. Kebijakan Mutu", desc: "SK & Dokumen Kebijakan SPMI resmi", color: "from-sky-600 to-blue-700" },
  { id: "02_Pedoman", label: "02. Pedoman & Manual", desc: "Pedoman PPEPP & Pendokumentasian", color: "from-cyan-600 to-teal-700" },
  { id: "03_Standar", label: "03. Buku Standar SPMI", desc: "14 Standar SN-Dikti & Standar Tambahan", color: "from-indigo-600 to-blue-800" },
  { id: "04_SOP_Formulir", label: "04. SOP & Formulir", desc: "Standar Prosedur Operasional & Form", color: "from-emerald-600 to-teal-800" },
  { id: "05_Penetapan", label: "05. Penetapan (P)", desc: "Bukti penetapan target & SK baru", color: "from-purple-600 to-indigo-700" },
  { id: "06_Pelaksanaan", label: "06. Pelaksanaan (P)", desc: "Renop, RKAT, dan rekaman kegiatan", color: "from-amber-600 to-orange-700" },
  { id: "07_Evaluasi_AMI_Survei", label: "07. Evaluasi (E)", desc: "Monev, AMI, Asesmen & Survei", color: "from-rose-600 to-red-700" },
  { id: "08_Pengendalian_RTL_RTM", label: "08. Pengendalian (P)", desc: "5-Why, Formulir RTL & Notulen RTM", color: "from-pink-600 to-rose-700" },
  { id: "09_Peningkatan", label: "09. Peningkatan (P)", desc: "Kajian benchmarking & revisi standar", color: "from-teal-600 to-emerald-700" },
  { id: "10_Laporan_Tahunan", label: "10. Laporan Tahunan", desc: "Laporan SPMI ke Kemdiktisaintek", color: "from-blue-700 to-indigo-900" },
  { id: "11_Dokumen_Eksternal", label: "11. Dokumen Eksternal", desc: "Regulasi kementerian & BAN-PT/LAM", color: "from-slate-600 to-slate-800" },
  { id: "12_Archive", label: "12. Arsip Inaktif", desc: "Dokumen kadaluarsa & legal hold", color: "from-zinc-600 to-stone-800" },
];

export default function SpmiDashboardPage() {
  const { data: session } = useSession();
  const isLpm = session?.user?.role === "LPM" || session?.user?.role === "ADMIN";

  // Mode Utama: 'STUDIO' (Pembuat Dokumen) vs 'VAULT' (Repositori Dokumen / Upload)
  const [mainMode, setMainMode] = useState<"STUDIO" | "VAULT">("STUDIO");

  // State STUDIO (4 Buku SPMI)
  const [activeBook, setActiveBook] = useState<"KEBIJAKAN" | "MANUAL" | "STANDAR" | "FORMULIR">("STANDAR");
  const [documents, setDocuments] = useState<ISpmiDocument[]>([]);
  const [studioLoading, setStudioLoading] = useState(true);

  // Filter Standar di Buku III
  const [standardKelompok, setStandardKelompok] = useState<string>("ALL");
  const [standardBidang, setStandardBidang] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // State VAULT (Upload & Repositori)
  const [vaultFiles, setVaultFiles] = useState<ISpmiVaultFile[]>([]);
  const [vaultFolderCounts, setVaultFolderCounts] = useState<Record<string, number>>({});
  const [activeVaultFolder, setActiveVaultFolder] = useState<SpmiVaultFolder | "ALL">("ALL");
  const [vaultSearchTerm, setVaultSearchTerm] = useState("");
  const [vaultLoading, setVaultLoading] = useState(true);

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<ISpmiStandardItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateStandardModalOpen, setIsCreateStandardModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modals & State untuk Bab/Seksi (Buku I & II), Formulir (Buku IV), dan Metadata Dokumen
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [sectionForm, setSectionForm] = useState({ order: 1, title: "", content: "" });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formItemData, setFormItemData] = useState({
    code: "",
    name: "",
    purpose: "",
    targetUser: "LPM / Program Studi",
    fileTemplateUrl: "",
  });

  const [isDocMetaModalOpen, setIsDocMetaModalOpen] = useState(false);
  const [docMetaForm, setDocMetaForm] = useState({
    title: "",
    code: "",
    skNumber: "",
    version: "",
    description: "",
    validFrom: "2025-09-01",
    validUntil: "2029-08-31",
    signedName: "Dr. Ibrahim Syah, S.E., M.M.",
    signedTitle: "Ketua STIMI YAPMI Makassar",
    signedNidn: "NIDN. 0920037601",
  });

  // Form State: 12 Elemen Baku Standar
  const [standardForm, setStandardForm] = useState<ISpmiStandardItem>({
    code: "",
    name: "",
    kelompok: "PROSES",
    bidang: "PENDIDIKAN",
    category: "PENDIDIKAN",
    version: "01",
    tanggalPenetapan: "2025-09-01",
    tanggalBerlaku: "2025-09-01",
    responsibleUnit: "Program Studi Manajemen",
    rasional: "",
    pihakBertanggungJawab: "Ketua (A), Waket I (C), Kaprodi (R), Dosen (C)",
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
      pelaksanaanNotes: "Diterapkan pada seluruh program kerja tahunan unit",
      evaluasiAmiStatus: "SESUAI",
      statusPemantauan: "HIJAU",
      pengendalianAction: "Tindak lanjut perbaikan berkala melalui RTM",
      peningkatanTarget: "Peningkatan target mutu pada siklus berikutnya",
    },
  });

  // State pembantu input multiline
  const [indicatorsInput, setIndicatorsInput] = useState("");
  const [strategiesInput, setStrategiesInput] = useState("");
  const [buktiInput, setBuktiInput] = useState("");

  // Form State: Upload Berkas ke Vault
  const [uploadForm, setUploadForm] = useState({
    folderCategory: "01_Kebijakan" as SpmiVaultFolder,
    documentCode: "",
    title: "",
    version: "00",
    skNumber: "",
    statusDocument: "TERKENDALI",
    accessClass: "INTERNAL",
    unitOwner: "LPM",
    description: "",
  });
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

  // 1. Load Data Studio
  const loadStudioData = async () => {
    try {
      setStudioLoading(true);
      const res = await fetch("/api/spmi/documents");
      const json = await res.json();
      if (json.success) {
        setDocuments(json.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat dokumen studio:", err);
    } finally {
      setStudioLoading(false);
    }
  };

  // 2. Load Data Vault
  const loadVaultData = async () => {
    try {
      setVaultLoading(true);
      const params = new URLSearchParams();
      if (activeVaultFolder !== "ALL") params.set("folderCategory", activeVaultFolder);
      if (vaultSearchTerm) params.set("search", vaultSearchTerm);

      const res = await fetch(`/api/spmi/vault?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setVaultFiles(json.data || []);
        setVaultFolderCounts(json.folderCounts || {});
      }
    } catch (err) {
      console.error("Gagal memuat berkas repositori:", err);
    } finally {
      setVaultLoading(false);
    }
  };

  useEffect(() => {
    loadStudioData();
  }, []);

  useEffect(() => {
    loadVaultData();
  }, [activeVaultFolder, vaultSearchTerm]);

  // Ekstrak Dokumen & Standar
  const currentDoc = documents.find((d) => d.bookType === activeBook) || documents[0];
  const kebijakanDoc = documents.find((d) => d.bookType === "KEBIJAKAN");
  const manualDoc = documents.find((d) => d.bookType === "MANUAL");
  const standardsDoc = documents.find((d) => d.bookType === "STANDAR");
  const formulirDoc = documents.find((d) => d.bookType === "FORMULIR");

  const allStandards = (standardsDoc?.standards && standardsDoc.standards.length > 0)
    ? standardsDoc.standards
    : STANDARD_BAKU_18_STANDARDS;
  const kebijakanCount = kebijakanDoc?.sections?.length || 0;
  const vaultKebijakanCount = vaultFolderCounts["01_Kebijakan"] || 0;
  const manualCount = manualDoc?.sections?.length || 0;
  const vaultManualCount = vaultFolderCounts["02_Pedoman"] || 0;
  const standarCount = allStandards.length;
  const vaultStandarCount = vaultFolderCounts["03_Standar"] || 0;
  const formulirCount = formulirDoc?.forms?.length || 0;
  const vaultFormulirCount = vaultFolderCounts["04_SOP_Formulir"] || 0;

  // Filter Buku III Standar
  const filteredStandards = allStandards.filter((std) => {
    const matchesKelompok = standardKelompok === "ALL" || std.kelompok === standardKelompok;
    const matchesBidang = standardBidang === "ALL" || std.bidang === standardBidang;
    const matchesSearch =
      std.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      std.responsibleUnit.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesKelompok && matchesBidang && matchesSearch;
  });

  // Handler: Buka Detail Standar
  const openDetailStandard = (std: ISpmiStandardItem) => {
    setSelectedStandard(std);
    setIsDetailModalOpen(true);
  };

  // Handler: Buka Edit Standar
  const openEditStandard = (std: ISpmiStandardItem) => {
    setSelectedStandard(std);
    setStandardForm({
      ...std,
      caraPengukuran: std.caraPengukuran || {
        rumus: "",
        sumberData: "SIAKAD / PDDikti / LMS",
        periodeUkur: "Semesteran",
        pihakPengukur: "Kaprodi & LPM",
      },
      ppeppCycle: std.ppeppCycle || {
        penetapanDate: "2025-09-01",
        pelaksanaanNotes: "Diterapkan pada seluruh program kerja tahunan unit",
        evaluasiAmiStatus: "SESUAI",
        statusPemantauan: "HIJAU",
        pengendalianAction: "Tindak lanjut perbaikan berkala melalui RTM",
        peningkatanTarget: "Peningkatan target mutu pada siklus berikutnya",
      },
    });
    setIndicatorsInput(std.indicators ? std.indicators.join("\n") : "");
    setStrategiesInput(std.strategies ? std.strategies.join("\n") : "");
    setBuktiInput(std.buktiDokumen ? std.buktiDokumen.join("\n") : "");
    setActionMessage(null);
    setIsEditModalOpen(true);
  };

  // Handler: Buka Form Tambah Standar Baru
  const openCreateStandard = () => {
    const nextNum = allStandards.length + 1;
    const nextCode = `SPMI-STD/${String(nextNum).padStart(2, "0")}`;
    setStandardForm({
      code: nextCode,
      name: "",
      kelompok: "PROSES",
      bidang: "PENDIDIKAN",
      category: "PENDIDIKAN",
      version: "01",
      tanggalPenetapan: "2025-09-01",
      tanggalBerlaku: "2025-09-01",
      responsibleUnit: "Program Studi Manajemen",
      rasional: "",
      pihakBertanggungJawab: "Ketua (A), Waket I (C), Kaprodi (R), Dosen (C)",
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
        pelaksanaanNotes: "Diterapkan pada seluruh program kerja tahunan unit",
        evaluasiAmiStatus: "SESUAI",
        statusPemantauan: "HIJAU",
        pengendalianAction: "Tindak lanjut perbaikan berkala melalui RTM",
        peningkatanTarget: "Peningkatan target mutu pada siklus berikutnya",
      },
    });
    setIndicatorsInput("");
    setStrategiesInput("");
    setBuktiInput("");
    setActionMessage(null);
    setIsCreateStandardModalOpen(true);
  };

  // Handler: Simpan Standar Baru (POST)
  const handleCreateStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setActionMessage(null);

    const payload: ISpmiStandardItem = {
      ...standardForm,
      indicators: indicatorsInput.split("\n").filter((t) => t.trim() !== ""),
      strategies: strategiesInput.split("\n").filter((t) => t.trim() !== ""),
      buktiDokumen: buktiInput.split("\n").filter((t) => t.trim() !== ""),
    };

    try {
      const res = await fetch("/api/spmi/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_STANDARD",
          standard: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionMessage("Standar baru berhasil ditambahkan!");
        await loadStudioData();
        setTimeout(() => setIsCreateStandardModalOpen(false), 900);
      } else {
        setActionMessage(json.error || "Gagal menambahkan standar.");
      }
    } catch {
      setActionMessage("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Update Standar Eksisting (PUT)
  const handleUpdateStandard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStandard) return;
    setIsSaving(true);
    setActionMessage(null);

    const payload: ISpmiStandardItem = {
      ...standardForm,
      indicators: indicatorsInput.split("\n").filter((t) => t.trim() !== ""),
      strategies: strategiesInput.split("\n").filter((t) => t.trim() !== ""),
      buktiDokumen: buktiInput.split("\n").filter((t) => t.trim() !== ""),
    };

    try {
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STANDARD",
          standardCode: selectedStandard.code,
          standard: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionMessage("Standar berhasil diperbarui!");
        await loadStudioData();
        setTimeout(() => setIsEditModalOpen(false), 900);
      } else {
        setActionMessage(json.error || "Gagal memperbarui standar.");
      }
    } catch {
      setActionMessage("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Hapus Butir Standar (DELETE)
  const handleDeleteStandard = async (code: string) => {
    if (!confirm(`Hapus butir standar ${code} secara permanen dari Buku III?`)) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/spmi/documents?standardCode=${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        await loadStudioData();
      } else {
        alert(json.error || "Gagal menghapus standar.");
      }
    } catch {
      alert("Kesalahan jaringan saat menghapus standar.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Bab / Seksi (Buku I & II)
  const openAddSection = (suggestedOrder?: number) => {
    setEditingSectionIndex(null);
    const nextOrder = suggestedOrder || ((currentDoc?.sections?.length || 0) + 1);
    setSectionForm({
      order: nextOrder,
      title: activeBook === "KEBIJAKAN" ? `BAB ${nextOrder}: ` : `SOP #${nextOrder}: `,
      content: "",
    });
    setIsSectionModalOpen(true);
  };

  const openEditSection = (sec: ISpmiSectionItem, idx: number) => {
    setEditingSectionIndex(idx);
    setSectionForm({
      order: sec.order,
      title: sec.title,
      content: sec.content,
    });
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.title.trim()) {
      alert("Judul Bab/Seksi wajib diisi.");
      return;
    }
    try {
      setIsSaving(true);
      if (editingSectionIndex !== null) {
        const res = await fetch("/api/spmi/documents", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UPDATE_SECTION",
            bookType: activeBook,
            sectionIndex: editingSectionIndex,
            section: sectionForm,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setActionMessage(`Bab "${sectionForm.title}" berhasil diperbarui!`);
          setIsSectionModalOpen(false);
          await loadStudioData();
        } else {
          alert(json.error || "Gagal memperbarui bab.");
        }
      } else {
        const res = await fetch("/api/spmi/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ADD_SECTION",
            bookType: activeBook,
            section: sectionForm,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setActionMessage(`Bab "${sectionForm.title}" berhasil ditambahkan!`);
          setIsSectionModalOpen(false);
          await loadStudioData();
        } else {
          alert(json.error || "Gagal menambahkan bab.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSection = async (idx: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bab ini?")) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/spmi/documents?bookType=${activeBook}&sectionIndex=${idx}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage("Bab berhasil dihapus.");
        await loadStudioData();
      } else {
        alert(json.error || "Gagal menghapus bab.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Formulir Mutu (Buku IV)
  const openAddForm = () => {
    const nextNum = (documents.find((d) => d.bookType === "FORMULIR")?.forms?.length || 0) + 1;
    setFormItemData({
      code: `SPMI-FR/${String(nextNum).padStart(2, "0")}`,
      name: "",
      purpose: "",
      targetUser: "LPM / Program Studi",
      fileTemplateUrl: "",
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItemData.code || !formItemData.name) {
      alert("Kode dan nama formulir wajib diisi.");
      return;
    }
    try {
      setIsSaving(true);
      const res = await fetch("/api/spmi/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_FORM",
          form: formItemData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`Formulir "${formItemData.name}" berhasil ditambahkan!`);
        setIsFormModalOpen(false);
        await loadStudioData();
      } else {
        alert(json.error || "Gagal menambahkan formulir.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteForm = async (code: string) => {
    if (!confirm(`Hapus formulir ${code}?`)) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/spmi/documents?formCode=${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`Formulir ${code} berhasil dihapus.`);
        await loadStudioData();
      } else {
        alert(json.error || "Gagal menghapus formulir.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Metadata Dokumen
  const openEditDocMeta = () => {
    if (!currentDoc) return;
    setDocMetaForm({
      title: currentDoc.title || "",
      code: currentDoc.code || "",
      skNumber: currentDoc.skNumber || "",
      version: currentDoc.version || "",
      description: currentDoc.description || "",
      validFrom: currentDoc.validFrom ? new Date(currentDoc.validFrom).toISOString().split("T")[0] : "2025-09-01",
      validUntil: currentDoc.validUntil ? new Date(currentDoc.validUntil).toISOString().split("T")[0] : "2029-08-31",
      signedName: currentDoc.signedBy?.name || "Dr. Ibrahim Syah, S.E., M.M.",
      signedTitle: currentDoc.signedBy?.title || "Ketua STIMI YAPMI Makassar",
      signedNidn: currentDoc.signedBy?.nipOrNidn || "NIDN. 0920037601",
    });
    setIsDocMetaModalOpen(true);
  };

  const handleSaveDocMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch("/api/spmi/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_METADATA",
          bookType: activeBook,
          id: currentDoc?._id,
          metadata: {
            title: docMetaForm.title,
            code: docMetaForm.code,
            skNumber: docMetaForm.skNumber,
            version: docMetaForm.version,
            description: docMetaForm.description,
            validFrom: docMetaForm.validFrom,
            validUntil: docMetaForm.validUntil,
            signedBy: {
              name: docMetaForm.signedName,
              title: docMetaForm.signedTitle,
              nipOrNidn: docMetaForm.signedNidn,
            },
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage("Identitas dokumen berhasil diperbarui!");
        setIsDocMetaModalOpen(false);
        await loadStudioData();
      } else {
        alert(json.error || "Gagal memperbarui metadata.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Upload File ke Vault (POST)
  const handleUploadVaultFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) {
      alert("Pilih berkas file yang akan diunggah.");
      return;
    }

    setIsSaving(true);
    setActionMessage(null);

    const fd = new FormData();
    fd.append("file", selectedUploadFile);
    fd.append("folderCategory", uploadForm.folderCategory);
    fd.append("documentCode", uploadForm.documentCode);
    fd.append("title", uploadForm.title);
    fd.append("version", uploadForm.version);
    fd.append("skNumber", uploadForm.skNumber);
    fd.append("statusDocument", uploadForm.statusDocument);
    fd.append("accessClass", uploadForm.accessClass);
    fd.append("unitOwner", uploadForm.unitOwner);
    fd.append("description", uploadForm.description);

    try {
      const res = await fetch("/api/spmi/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (json.success) {
        setActionMessage("Berkas resmi berhasil diunggah ke Vault!");
        setSelectedUploadFile(null);
        setUploadForm({
          folderCategory: "01_Kebijakan",
          documentCode: "",
          title: "",
          version: "00",
          skNumber: "",
          statusDocument: "TERKENDALI",
          accessClass: "INTERNAL",
          unitOwner: "LPM",
          description: "",
        });
        await loadVaultData();
        setTimeout(() => setIsUploadModalOpen(false), 900);
      } else {
        setActionMessage(json.error || "Gagal mengunggah file.");
      }
    } catch {
      setActionMessage("Terjadi kesalahan jaringan saat mengunggah.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Hapus File Vault (DELETE)
  const handleDeleteVaultFile = async (id: string, fileName: string) => {
    if (!confirm(`Hapus berkas ${fileName} dari Repositori SPMI?`)) return;
    try {
      const res = await fetch(`/api/spmi/vault?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        await loadVaultData();
      } else {
        alert(json.error || "Gagal menghapus berkas.");
      }
    } catch {
      alert("Kesalahan jaringan saat menghapus berkas.");
    }
  };

  // Handler: Print Naskah Resmi
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Bar Terpadu */}
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-sky-950/10 border border-sky-700/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-semibold backdrop-blur-md">
            <BookOpen className="w-4 h-4 text-cyan-300" />
            <span>Permendiktisaintek No. 39/2025 jo. No. 10/2026 • STIMI YAPMI Makassar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Pusat Dokumen & Standar SPMI
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/80 leading-relaxed">
            Sistem manajemen mutu dua pintu: <strong>Pembuat Dokumen Digital (Studio)</strong> untuk merumuskan 14 Standar SN-Dikti & 4 Buku SPMI, serta <strong>Penyimpanan Dokumen (Vault)</strong> untuk mengarsipkan berkas scan SK dan bukti fisik dalam 12 folder baku. Terkoneksi langsung ke Akreditasi Institusi & Pemantauan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {mainMode === "STUDIO" && isLpm && (
            <button
              onClick={() => {
                if (activeBook === "KEBIJAKAN") {
                  document.getElementById("sec-bab")?.scrollIntoView({ behavior: "smooth" });
                } else if (activeBook === "MANUAL") {
                  openAddSection();
                } else if (activeBook === "FORMULIR") {
                  openAddForm();
                } else {
                  openCreateStandard();
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeBook === "KEBIJAKAN"
                  ? "Daftar 21 Bab Kebijakan"
                  : activeBook === "MANUAL"
                  ? "+ Tambah Pedoman / SOP"
                  : activeBook === "FORMULIR"
                  ? "+ Tambah Formulir Mutu"
                  : "+ Tambah Standar Baru (12 Elemen)"}
              </span>
            </button>
          )}

          {mainMode === "VAULT" && isLpm && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              <span>Unggah Berkas Fisik / Scan</span>
            </button>
          )}

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Kompilasi & Cetak Kop Resmi</span>
          </button>

          <a
            href="https://spmi.kemdiktisaintek.go.id"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Portal SPMI Nasional</span>
          </a>
        </div>
      </div>

      {/* 2. DUA TAB UTAMA: STUDIO (PEMBUAT) vs VAULT (PENYIMPANAN) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setMainMode("STUDIO")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mainMode === "STUDIO"
                ? "bg-white text-sky-950 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit3 className="w-4 h-4 text-sky-600" />
            <span>1. Pembuat Dokumen (Studio Digital)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-100 text-sky-800 font-bold">
              {allStandards.length} Standar
            </span>
          </button>

          <button
            onClick={() => setMainMode("VAULT")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mainMode === "VAULT"
                ? "bg-white text-sky-950 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FolderOpen className="w-4 h-4 text-emerald-600" />
            <span>2. Penyimpanan Dokumen (Vault & Upload)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              {vaultFiles.length} Berkas
            </span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Integrasi Aktif: Bukti di kedua tab otomatis diakui Akreditasi & Pemantauan</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* KONTEN TAB 1: STUDIO DIGITAL (PEMBUAT DOKUMEN & 4 BUKU SPMI)  */}
      {/* ============================================================== */}
      {mainMode === "STUDIO" && (
        <div className="space-y-6">
          {/* Navigasi 4 Buku SPMI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                type: "KEBIJAKAN" as const,
                num: 1,
                label: "Buku I: Kebijakan SPMI",
                desc: "Arah mutu, asas, & struktur LPM (21 Bab)",
                color: "from-sky-600 to-blue-700",
              },
              {
                type: "MANUAL" as const,
                num: 2,
                label: "Buku II: Manual PPEPP",
                desc: "SOP Siklus & Pedoman Pendokumentasian",
                color: "from-cyan-600 to-teal-700",
              },
              {
                type: "STANDAR" as const,
                num: 3,
                label: "Buku III: Standar SPMI",
                desc: "14 Standar SN-Dikti (12 Elemen Baku)",
                color: "from-indigo-600 to-blue-800",
              },
              {
                type: "FORMULIR" as const,
                num: 4,
                label: "Buku IV: Formulir Mutu",
                desc: "Instrumen Pemantauan, Monev & RTM",
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

          {studioLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">Memuat berkas Studio SPMI...</p>
            </div>
          ) : (
            <>
              {/* Card Metadata Dokumen Aktif (Untuk Buku IV) */}
              {currentDoc && activeBook !== "KEBIJAKAN" && activeBook !== "MANUAL" && activeBook !== "STANDAR" && (
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

                  <div className="text-right text-xs border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 space-y-1.5">
                    <div>
                      <span className="text-slate-400 font-semibold block">Ditetapkan oleh:</span>
                      <strong className="text-slate-900 block font-bold">{currentDoc.signedBy.name}</strong>
                      <span className="text-slate-500 block text-[11px]">{currentDoc.signedBy.title}</span>
                    </div>
                    {isLpm && (
                      <button
                        onClick={openEditDocMeta}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit SK & Info Naskah</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* BUKU I: KEBIJAKAN SPMI (STUDIO IN-PAGE 21 BAB & PENGESAHAN) */}
              {activeBook === "KEBIJAKAN" && (
                <BukuKebijakanStudio
                  doc={kebijakanDoc || currentDoc}
                  isLpm={isLpm}
                  onRefresh={loadStudioData}
                  onOpenPrintModal={() => setIsPrintModalOpen(true)}
                />
              )}

              {/* BUKU II: MANUAL MUTU PPEPP & PENDOKUMENTASIAN (STUDIO IN-PAGE 16 BAB & 15 LAMPIRAN) */}
              {activeBook === "MANUAL" && (
                <BukuManualStudio
                  doc={manualDoc || currentDoc}
                  isLpm={isLpm}
                  onRefresh={loadStudioData}
                  onOpenPrintModal={() => setIsPrintModalOpen(true)}
                />
              )}

              {/* BUKU III: STANDAR SPMI (STUDIO IN-PAGE 18 BUTIR STANDAR 12 ELEMEN & 7 BAB PEDOMAN) */}
              {activeBook === "STANDAR" && (
                <BukuStandarStudio
                  doc={standardsDoc || currentDoc}
                  isLpm={isLpm}
                  onRefresh={loadStudioData}
                  onOpenPrintModal={() => setIsPrintModalOpen(true)}
                />
              )}

              {/* BUKU IV: FORMULIR MUTU SPMI */}
              {activeBook === "FORMULIR" && (
                <div className="space-y-4">
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <strong>Buku IV: Daftar Induk Formulir & Instrumen Mutu</strong> (Kode: <code>SPMI-FR/01</code>).
                      <span className="block text-slate-600 text-[11px] mt-0.5">
                        Kumpulan template rekaman mutu terkendali untuk Pemantauan, Monev, 5-Why RCA, RTL, dan RTM.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLpm && (
                        <button
                          onClick={openAddForm}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Tambah Formulir Mutu</span>
                        </button>
                      )}
                      <button
                        onClick={() => setIsPrintModalOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-emerald-900 border border-emerald-200 font-bold text-xs hover:bg-emerald-50 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Daftar Form</span>
                      </button>
                    </div>
                  </div>

                  {currentDoc?.forms && currentDoc.forms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentDoc.forms.map((form) => (
                        <div key={form.code} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs">
                              {form.code}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">
                                Sasaran: {form.targetUser}
                              </span>
                              {isLpm && (
                                <button
                                  onClick={() => handleDeleteForm(form.code)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hapus formulir ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <h4 className="text-sm font-black text-slate-900">{form.name}</h4>
                          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <strong>Tujuan & Fungsi:</strong> {form.purpose}
                          </p>

                          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Template Terkendali LPM</span>
                            </span>
                            <button
                              onClick={() => setIsPrintModalOpen(true)}
                              className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Format Cetak</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-4">
                      <FileCheck className="w-10 h-10 text-slate-400 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-800">Daftar Formulir Mutu Siap Terhubung</h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          Anda dapat mencatat formulir mutu baru secara digital atau mengunggah berkas template resmi ke <strong>Vault 04_SOP_Formulir</strong>.
                        </p>
                      </div>
                      {isLpm && (
                        <button
                          onClick={openAddForm}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-700/20 cursor-pointer transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Mulai Tambah Formulir Mutu Pertama</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* KONTEN TAB 2: REPOSITORI DOKUMEN / VAULT (UPLOAD BERKAS RESMI) */}
      {/* ============================================================== */}
      {mainMode === "VAULT" && (
        <div className="space-y-6">
          {/* Header Vault & Filter Folder */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-emerald-600" />
                  <span>Struktur 12 Folder Repositori Dokumen SPMI (SPMI-PD/01)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Tempat menyimpan dan menelusuri berkas resmi (scan SK asli bertanda tangan, naskah PDF, SOP, dan rekaman pelaksanaan).
                </p>
              </div>

              {isLpm && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Berkas Baru</span>
                </button>
              )}
            </div>

            {/* Folder Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              <button
                onClick={() => setActiveVaultFolder("ALL")}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                  activeVaultFolder === "ALL"
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Semua Folder</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeVaultFolder === "ALL" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"}`}>
                    {vaultFiles.length}
                  </span>
                </div>
              </button>

              {VAULT_FOLDERS.map((f) => {
                const isFolderActive = activeVaultFolder === f.id;
                const count = vaultFolderCounts[f.id] || 0;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveVaultFolder(f.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                      isFolderActive
                        ? "bg-sky-900 text-white border-sky-900 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate">{f.label.split(". ")[1]}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${isFolderActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"}`}>
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar Vault */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode dokumen, judul berkas, atau unit pengunggah..."
                value={vaultSearchTerm}
                onChange={(e) => setVaultSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-bold">
              Folder Aktif: <span className="text-emerald-700 font-black">{activeVaultFolder === "ALL" ? "Semua Folder" : activeVaultFolder}</span>
            </div>
          </div>

          {/* Tabel / Card Berkas Vault */}
          {vaultLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">Memuat berkas repositori...</p>
            </div>
          ) : vaultFiles.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-slate-300 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">Belum Ada Dokumen Terunggah di Folder Ini</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Repositori ini siap menampung berkas resmi PDF/Word scan yang bertanda tangan basah atau SK resmi institusi.
                </p>
              </div>
              {isLpm && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Unggah Berkas Resmi Pertama</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
                    <tr>
                      <th className="p-4">Kode Dokumen</th>
                      <th className="p-4">Judul & Nama Berkas</th>
                      <th className="p-4">Folder Repositori</th>
                      <th className="p-4">Status & Revisi</th>
                      <th className="p-4">Unit Pemilik</th>
                      <th className="p-4">Waktu Unggah</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vaultFiles.map((f) => (
                      <tr key={String(f._id)} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-black text-sky-900">
                          {f.documentCode}
                          {f.skNumber && (
                            <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                              SK: {f.skNumber}
                            </span>
                          )}
                        </td>
                        <td className="p-4 space-y-0.5 max-w-xs">
                          <strong className="text-slate-900 block font-bold truncate">{f.title}</strong>
                          <span className="text-[11px] text-slate-500 block truncate">{f.fileName}</span>
                          <span className="text-[10px] text-slate-400 block">
                            Ukuran: {(f.fileSize / 1024).toFixed(1)} KB
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700">
                            {f.folderCategory}
                          </span>
                        </td>
                        <td className="p-4 space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                              f.statusDocument === "TERKENDALI"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {f.statusDocument}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-semibold">
                            Rev: {f.version}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">
                          {f.unitOwner}
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">
                          {new Date(f.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={f.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh</span>
                            </a>
                            {isLpm && (
                              <button
                                onClick={() => handleDeleteVaultFile(String(f._id), f.fileName)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus dari repositori"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: TAMBAH STANDAR BARU (12 ELEMEN BAKU)                   */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isCreateStandardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsCreateStandardModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                  Perumusan Butir Standar Baru • 12 Elemen Baku 2026
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Tambah Butir Standar SPMI ke Buku III
                </h3>
              </div>

              <form onSubmit={handleCreateStandard} className="space-y-4">
                {/* 1. Identitas Standar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kode Standar</label>
                    <input
                      type="text"
                      placeholder="e.g. SPMI-STD/01 atau STD-DIK-01"
                      value={standardForm.code}
                      onChange={(e) => setStandardForm({ ...standardForm, code: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kelompok</label>
                    <select
                      value={standardForm.kelompok}
                      onChange={(e) => setStandardForm({ ...standardForm, kelompok: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="LUARAN">LUARAN</option>
                      <option value="PROSES">PROSES</option>
                      <option value="MASUKAN">MASUKAN</option>
                      <option value="TATA_KELOLA">TATA KELOLA</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Bidang Standar</label>
                    <select
                      value={standardForm.bidang}
                      onChange={(e) => setStandardForm({ ...standardForm, bidang: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="PENDIDIKAN">Pendidikan SN-Dikti</option>
                      <option value="PENELITIAN">Penelitian SN-Dikti</option>
                      <option value="PKM">PkM SN-Dikti</option>
                      <option value="STANDAR_TAMBAHAN">Standar Tambahan PT</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Standar</label>
                  <input
                    type="text"
                    placeholder="e.g. Standar Kompetensi Lulusan (CPL) Berbasis OBE"
                    value={standardForm.name}
                    onChange={(e) => setStandardForm({ ...standardForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Unit Penanggung Jawab (Pemilik)</label>
                    <input
                      type="text"
                      placeholder="e.g. Program Studi Manajemen / BAAK / LPPM"
                      value={standardForm.responsibleUnit}
                      onChange={(e) => setStandardForm({ ...standardForm, responsibleUnit: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Pihak Bertanggung Jawab (RACI)</label>
                    <input
                      type="text"
                      value={standardForm.pihakBertanggungJawab}
                      onChange={(e) => setStandardForm({ ...standardForm, pihakBertanggungJawab: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* 2. Rasional & Definisi */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Rasional Standar</label>
                  <textarea
                    rows={2}
                    placeholder="Alasan mengapa standar diperlukan, hubungan dengan SN-Dikti & visi-misi, bentuk pelampauan..."
                    value={standardForm.rasional}
                    onChange={(e) => setStandardForm({ ...standardForm, rasional: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 3. Pernyataan Isi Standar (ABCD) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Pernyataan Isi Standar (Kaidah ABCD: Audience, Behaviour, Condition, Degree)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Program Studi memastikan 100% lulusan mencapai CPL yang selaras KKNI Level 6..."
                    value={standardForm.statement}
                    onChange={(e) => setStandardForm({ ...standardForm, statement: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* 4. Target Mutu */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Mutu SMART & Baseline</label>
                  <input
                    type="text"
                    placeholder="e.g. Rata-rata IPK >= 3.40, Masa Studi tepat waktu >= 75%"
                    value={standardForm.targetValue}
                    onChange={(e) => setStandardForm({ ...standardForm, targetValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* 5. Indikator Ketercapaian */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Indikator Kinerja (Satu baris per butir)</label>
                  <textarea
                    rows={2}
                    placeholder="Masukkan indikator utama / pelampauan per baris baru..."
                    value={indicatorsInput}
                    onChange={(e) => setIndicatorsInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 6. Strategi & Dokumen Bukti */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Strategi Pencapaian (Per baris baru)</label>
                    <textarea
                      rows={2}
                      value={strategiesInput}
                      onChange={(e) => setStrategiesInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Dokumen Bukti Wajib (Per baris baru)</label>
                    <textarea
                      rows={2}
                      value={buktiInput}
                      onChange={(e) => setBuktiInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* 7. Cara Pengukuran */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Sumber Data Primer</label>
                    <input
                      type="text"
                      value={standardForm.caraPengukuran?.sumberData || "SIAKAD / PDDikti"}
                      onChange={(e) =>
                        setStandardForm({
                          ...standardForm,
                          caraPengukuran: { ...standardForm.caraPengukuran, sumberData: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Periode Ukur</label>
                    <input
                      type="text"
                      value={standardForm.caraPengukuran?.periodeUkur || "Semesteran"}
                      onChange={(e) =>
                        setStandardForm({
                          ...standardForm,
                          caraPengukuran: { ...standardForm.caraPengukuran, periodeUkur: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Pihak Pengukur</label>
                    <input
                      type="text"
                      value={standardForm.caraPengukuran?.pihakPengukur || "Kaprodi & LPM"}
                      onChange={(e) =>
                        setStandardForm({
                          ...standardForm,
                          caraPengukuran: { ...standardForm.caraPengukuran, pihakPengukur: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {actionMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                    {actionMessage}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateStandardModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Menyimpan Standar..." : "Simpan ke Buku III"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 2: DETAIL 12 ELEMEN BAKU STANDAR (VIEW MODAL)             */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isDetailModalOpen && selectedStandard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-indigo-900 text-white font-black text-sm flex items-center justify-center">
                  {selectedStandard.code}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-sky-100 text-sky-900">
                      Kelompok: {selectedStandard.kelompok}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                      Bidang: {selectedStandard.bidang}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">{selectedStandard.name}</h3>
                </div>
              </div>

              {/* 12 Elemen Grid */}
              <div className="space-y-4 text-xs">
                {/* 1. Pernyataan Standar ABCD */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <strong className="text-slate-900 font-bold block">1. Pernyataan Isi Standar (Kaidah ABCD):</strong>
                  <p className="text-slate-700 leading-relaxed">{selectedStandard.statement}</p>
                </div>

                {/* 2. Rasional & RACI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <strong className="text-slate-900 font-bold block">2. Rasional Standar:</strong>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedStandard.rasional || "Menjamin pemenuhan standar nasional pendidikan tinggi serta kesiapan akreditasi LAMEMBA."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <strong className="text-slate-900 font-bold block">3. Pihak Bertanggung Jawab (RACI):</strong>
                    <p className="text-slate-600 leading-relaxed">{selectedStandard.pihakBertanggungJawab}</p>
                    <span className="text-[11px] text-slate-500 block pt-1">
                      Unit Pemilik: <strong>{selectedStandard.responsibleUnit}</strong>
                    </span>
                  </div>
                </div>

                {/* 4. Target & Indikator */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                  <strong className="text-indigo-950 font-bold block">4. Target Capaian Mutu SMART:</strong>
                  <p className="text-indigo-900 font-black text-sm">{selectedStandard.targetValue}</p>
                  {selectedStandard.indicators && selectedStandard.indicators.length > 0 && (
                    <div className="pt-2 border-t border-indigo-100">
                      <strong className="text-indigo-950 block mb-1">Indikator Ketercapaian:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        {selectedStandard.indicators.map((ind, i) => (
                          <li key={i}>{ind}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 5. Cara Pengukuran & Bukti Dokumen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1">
                    <strong className="text-sky-950 font-bold block">5. Cara Pengukuran:</strong>
                    <p className="text-slate-700">Sumber: {selectedStandard.caraPengukuran?.sumberData || "SIAKAD/LMS"}</p>
                    <p className="text-slate-700">Periode: {selectedStandard.caraPengukuran?.periodeUkur || "Semesteran"}</p>
                    <p className="text-slate-700">Pihak Pengukur: {selectedStandard.caraPengukuran?.pihakPengukur || "Kaprodi & LPM"}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1">
                    <strong className="text-sky-950 font-bold block">6. Dokumen Bukti Wajib:</strong>
                    <p className="text-slate-700 leading-relaxed">
                      {selectedStandard.buktiDokumen && selectedStandard.buktiDokumen.length > 0
                        ? selectedStandard.buktiDokumen.join(", ")
                        : "RPS, Jurnal Perkuliahan, Rekap Asesmen, Berita Acara"}
                    </p>
                  </div>
                </div>

                {/* 7. Siklus PPEPP */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                  <strong className="text-emerald-950 font-bold block">7. Riwayat Siklus PPEPP:</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                    <div>Penetapan: {selectedStandard.ppeppCycle?.penetapanDate || "2025-09-01"}</div>
                    <div>Evaluasi AMI: <strong>{selectedStandard.ppeppCycle?.evaluasiAmiStatus || "SESUAI"}</strong></div>
                    <div>Pemantauan Operasional: <strong>{selectedStandard.ppeppCycle?.statusPemantauan || "HIJAU"}</strong></div>
                    <div>Pengendalian RTM: {selectedStandard.ppeppCycle?.pengendalianAction || "Tindak lanjut via RTM"}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 3: EDIT STANDAR 12 ELEMEN                                 */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isEditModalOpen && selectedStandard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-black text-sky-700 uppercase tracking-wider">
                  Update 12 Elemen • {selectedStandard.code}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Sunting Parameter Butir Standar
                </h3>
              </div>

              <form onSubmit={handleUpdateStandard} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kode Standar</label>
                    <input
                      type="text"
                      value={standardForm.code}
                      onChange={(e) => setStandardForm({ ...standardForm, code: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kelompok</label>
                    <select
                      value={standardForm.kelompok}
                      onChange={(e) => setStandardForm({ ...standardForm, kelompok: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="LUARAN">LUARAN</option>
                      <option value="PROSES">PROSES</option>
                      <option value="MASUKAN">MASUKAN</option>
                      <option value="TATA_KELOLA">TATA KELOLA</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Bidang Standar</label>
                    <select
                      value={standardForm.bidang}
                      onChange={(e) => setStandardForm({ ...standardForm, bidang: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="PENDIDIKAN">Pendidikan SN-Dikti</option>
                      <option value="PENELITIAN">Penelitian SN-Dikti</option>
                      <option value="PKM">PkM SN-Dikti</option>
                      <option value="STANDAR_TAMBAHAN">Standar Tambahan PT</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Standar</label>
                  <input
                    type="text"
                    value={standardForm.name}
                    onChange={(e) => setStandardForm({ ...standardForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pernyataan Isi Standar (ABCD)</label>
                  <textarea
                    rows={2}
                    value={standardForm.statement}
                    onChange={(e) => setStandardForm({ ...standardForm, statement: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Target Capaian Institusi (SMART)</label>
                    <input
                      type="text"
                      value={standardForm.targetValue}
                      onChange={(e) => setStandardForm({ ...standardForm, targetValue: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Unit Penanggung Jawab</label>
                    <input
                      type="text"
                      value={standardForm.responsibleUnit}
                      onChange={(e) => setStandardForm({ ...standardForm, responsibleUnit: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Indikator Ketercapaian (Per baris)</label>
                  <textarea
                    rows={2}
                    value={indicatorsInput}
                    onChange={(e) => setIndicatorsInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Strategi Pelaksanaan (Per baris)</label>
                    <textarea
                      rows={2}
                      value={strategiesInput}
                      onChange={(e) => setStrategiesInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Dokumen Bukti Wajib (Per baris)</label>
                    <textarea
                      rows={2}
                      value={buktiInput}
                      onChange={(e) => setBuktiInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {actionMessage && (
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800">
                    {actionMessage}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-sky-600 to-cyan-600 text-white hover:from-sky-700 hover:to-cyan-700 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 4: UPLOAD BERKAS KE VAULT REPOSITORI                      */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                  Pengendalian Dokumen • SPMI-PD/01
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Unggah Berkas Resmi ke Repositori Vault
                </h3>
              </div>

              <form onSubmit={handleUploadVaultFile} className="space-y-4">
                {/* 1. Pilih Folder Tujuan */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Folder Kategori Repositori</label>
                  <select
                    value={uploadForm.folderCategory}
                    onChange={(e) => setUploadForm({ ...uploadForm, folderCategory: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {VAULT_FOLDERS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label} ({f.desc})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. File Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Berkas Dokumen (PDF / DOCX / XLSX)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedUploadFile(e.target.files[0]);
                          if (!uploadForm.title) {
                            setUploadForm((prev) => ({
                              ...prev,
                              title: e.target.files![0].name.replace(/\.[^/.]+$/, ""),
                            }));
                          }
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                    {selectedUploadFile ? (
                      <div className="text-xs font-bold text-slate-800">
                        {selectedUploadFile.name} ({(selectedUploadFile.size / 1024).toFixed(1)} KB)
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        Klik atau seret file PDF/Word ke sini (Maksimal 50 MB)
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Metadata Dokumen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kode Dokumen</label>
                    <input
                      type="text"
                      placeholder="e.g. SPMI-K/01 atau SPMI-STD/01"
                      value={uploadForm.documentCode}
                      onChange={(e) => setUploadForm({ ...uploadForm, documentCode: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor Revisi</label>
                    <input
                      type="text"
                      placeholder="e.g. 00, 01, Rev 02"
                      value={uploadForm.version}
                      onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Judul Dokumen Resmi</label>
                  <input
                    type="text"
                    placeholder="e.g. SK Penetapan Kebijakan SPMI STIMI YAPMI Makassar"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor SK / Legalitas</label>
                    <input
                      type="text"
                      placeholder="e.g. SK No. 042/SK/YAPMI/IX/2025"
                      value={uploadForm.skNumber}
                      onChange={(e) => setUploadForm({ ...uploadForm, skNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Unit Pemilik Dokumen</label>
                    <input
                      type="text"
                      placeholder="e.g. LPM / Program Studi Manajemen"
                      value={uploadForm.unitOwner}
                      onChange={(e) => setUploadForm({ ...uploadForm, unitOwner: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {actionMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                    {actionMessage}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Mengunggah..." : "Unggah Dokumen"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 5: CETAK PDF KOP RESMI STIMI YAPMI MAKASSAR            */}
      {/* ============================================================== */}
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
                      Pratinjau Naskah Resmi SPMI STIMI YAPMI Makassar
                    </h3>
                    <p className="text-xs text-slate-500">
                      Dokumen resmi ber-kop surat, siap cetak / simpan PDF untuk pelaporan Kemdiktisaintek
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* KOP RESMI STIMI YAPMI MAKASSAR */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 text-slate-900">
                <div className="border-b-2 border-double border-slate-800 pb-4 text-center space-y-1">
                  <h4 className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                    Yayasan Pembangunan Manajemen Indonesia (YAPMI) Makassar
                  </h4>
                  <h2 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                    Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar
                  </h2>
                  <h3 className="text-xs font-black text-sky-800 uppercase">
                    Lembaga Penjaminan Mutu (LPM)
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan 90245 • Website: stimiyapmi.ac.id
                  </p>
                </div>

                {/* Cover Naskah */}
                <div className="text-center py-4 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-slate-100 rounded-full text-slate-700">
                    Dokumen Mutu Internal Resmi • Permendiktisaintek 39/2025 jo. 10/2026
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    BUNDEL SISTEM PENJAMINAN MUTU INTERNAL (SPMI)
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold">
                    Tahun Akademik 2025/2026 • Siklus PPEPP Aktif STIMI YAPMI Makassar
                  </p>
                </div>

                {/* Status Ringkas 4 Buku & Vault */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong>Buku I: Kebijakan SPMI (SPMI-K/01)</strong>
                      <span className="block text-[11px] text-slate-500">21 Bab Kebijakan Mutu & Tata Pamong</span>
                    </div>
                    {kebijakanCount > 0 || vaultKebijakanCount > 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        ✓ Tersedia ({kebijakanCount > 0 ? `${kebijakanCount} Bab` : ""}{kebijakanCount > 0 && vaultKebijakanCount > 0 ? " + " : ""}{vaultKebijakanCount > 0 ? `${vaultKebijakanCount} Berkas Vault` : ""})
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        ⚠️ Belum Terisi (0 Bab)
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong>Buku II: Pedoman Siklus PPEPP & Pendokumentasian</strong>
                      <span className="block text-[11px] text-slate-500">SOP Alur PPEPP, Matriks RACI & Tata Kode L1-L6</span>
                    </div>
                    {manualCount > 0 || vaultManualCount > 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        ✓ Tersedia ({manualCount > 0 ? `${manualCount} Bab` : ""}{manualCount > 0 && vaultManualCount > 0 ? " + " : ""}{vaultManualCount > 0 ? `${vaultManualCount} Berkas Vault` : ""})
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        ⚠️ Belum Terisi (0 Bab)
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong>Buku III: Standar SPMI (14 Standar SN-Dikti)</strong>
                      <span className="block text-[11px] text-slate-500">
                        {standarCount} Butir Standar Terumuskan (12 Elemen Baku)
                      </span>
                    </div>
                    {standarCount > 0 || vaultStandarCount > 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        ✓ Terdaftar ({standarCount > 0 ? `${standarCount} Butir` : ""}{standarCount > 0 && vaultStandarCount > 0 ? " + " : ""}{vaultStandarCount > 0 ? `${vaultStandarCount} Berkas Vault` : ""})
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        ⚠️ Belum Terisi (0 Butir Standar)
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong>Buku IV: Formulir Mutu & Rekaman Audit</strong>
                      <span className="block text-[11px] text-slate-500">Formulir Pemantauan Dini, Monev, 5-Why RCA, RTL & RTM</span>
                    </div>
                    {formulirCount > 0 || vaultFormulirCount > 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        ✓ Siap Digunakan ({formulirCount > 0 ? `${formulirCount} Form` : ""}{formulirCount > 0 && vaultFormulirCount > 0 ? " + " : ""}{vaultFormulirCount > 0 ? `${vaultFormulirCount} Berkas Vault` : ""})
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        ⚠️ Belum Terisi (0 Formulir)
                      </span>
                    )}
                  </div>
                </div>

                {/* Lembar Tanda Tangan Pengesahan Berjenjang */}
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={handlePrint}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-sky-600 to-cyan-600 text-white hover:from-sky-700 hover:to-cyan-700 shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Naskah Dokumen (PDF)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ============================================================== */}
      {/* MODAL 6: TAMBAH / EDIT BAB KEBIJAKAN & SOP (BUKU I & II)      */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-black text-sky-700 uppercase tracking-wider">
                  {activeBook === "KEBIJAKAN" ? "Buku I: Kebijakan SPMI" : "Buku II: Pedoman & SOP"}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingSectionIndex !== null
                    ? "Edit Bab / Seksi Naskah Mutu"
                    : activeBook === "KEBIJAKAN"
                    ? "Tambah Bab Kebijakan SPMI Baru"
                    : "Tambah Pedoman / SOP Baru"}
                </h3>
              </div>

              <form onSubmit={handleSaveSection} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor / Urutan</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={sectionForm.order}
                      onChange={(e) => setSectionForm({ ...sectionForm, order: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Judul Bab / Nama SOP</label>
                    <input
                      type="text"
                      required
                      placeholder={activeBook === "KEBIJAKAN" ? "e.g. BAB I: Visi, Misi, dan Tujuan Mutu" : "e.g. SOP Penetapan Standar Mutu Baru"}
                      value={sectionForm.title}
                      onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Isi Naskah / Butir Kebijakan / Uraian SOP</label>
                  <textarea
                    rows={8}
                    required
                    placeholder="Tuliskan isi pasal, arah komitmen, tata kerja, atau prosedur operasional di sini..."
                    value={sectionForm.content}
                    onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })}
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSectionModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-700 hover:to-indigo-700 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Menyimpan..." : "Simpan Bab ke Dokumen"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 7: TAMBAH FORMULIR MUTU (BUKU IV)                        */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative"
            >
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                  Buku IV: Formulir Mutu & Rekaman
                </span>
                <h3 className="text-lg font-black text-slate-900">Tambah Formulir Mutu Baru</h3>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kode Formulir</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SPMI-FR/MON-01"
                    value={formItemData.code}
                    onChange={(e) => setFormItemData({ ...formItemData, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Formulir</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Formulir Pemantauan Pelaksanaan Perkuliahan"
                    value={formItemData.name}
                    onChange={(e) => setFormItemData({ ...formItemData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tujuan & Fungsi Penggunaan</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Instrumen verifikasi kehadiran dosen, kesesuaian materi dengan RPS, dan lembar berita acara."
                    value={formItemData.purpose}
                    onChange={(e) => setFormItemData({ ...formItemData, purpose: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Sasaran Pengguna / Unit Terkait</label>
                  <input
                    type="text"
                    placeholder="e.g. Dosen, Ketua Program Studi, LPM"
                    value={formItemData.targetUser}
                    onChange={(e) => setFormItemData({ ...formItemData, targetUser: e.target.value })}
                    className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Menyimpan..." : "Simpan Formulir"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 8: EDIT METADATA DOKUMEN & SK PENGESAHAN                */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isDocMetaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsDocMetaModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-black text-sky-700 uppercase tracking-wider">
                  Pengesahan Legal Institusi
                </span>
                <h3 className="text-lg font-black text-slate-900">Edit Identitas Dokumen & SK Pengesahan</h3>
              </div>

              <form onSubmit={handleSaveDocMeta} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Judul Dokumen</label>
                    <input
                      type="text"
                      required
                      value={docMetaForm.title}
                      onChange={(e) => setDocMetaForm({ ...docMetaForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kode Naskah</label>
                    <input
                      type="text"
                      required
                      value={docMetaForm.code}
                      onChange={(e) => setDocMetaForm({ ...docMetaForm, code: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nomor SK Pengesahan</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SK Ketua STIMI YAPMI No. 042/SK/YAPMI/IX/2025"
                      value={docMetaForm.skNumber}
                      onChange={(e) => setDocMetaForm({ ...docMetaForm, skNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Versi Dokumen</label>
                    <input
                      type="text"
                      value={docMetaForm.version}
                      onChange={(e) => setDocMetaForm({ ...docMetaForm, version: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Berlaku Mulai</label>
                    <input
                      type="date"
                      value={docMetaForm.validFrom}
                      onChange={(e) => setDocMetaForm({ ...docMetaForm, validFrom: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Berlaku Hingga</label>
                    <input
                      type="date"
                      value={docMetaForm.validUntil}
                      onChange={(e) => setDocMetaForm({ ...docMetaForm, validUntil: e.target.value })}
                      className="w-full p-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-black text-slate-700 block">Pejabat yang Menetapkan:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Nama Pejabat</label>
                      <input
                        type="text"
                        value={docMetaForm.signedName}
                        onChange={(e) => setDocMetaForm({ ...docMetaForm, signedName: e.target.value })}
                        className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">NIDN / NIP</label>
                      <input
                        type="text"
                        value={docMetaForm.signedNidn}
                        onChange={(e) => setDocMetaForm({ ...docMetaForm, signedNidn: e.target.value })}
                        className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Jabatan Resmi</label>
                    <input
                      type="text"
                      value={docMetaForm.signedTitle}
                      onChange={(e) => setDocMetaForm({ ...docMetaForm, signedTitle: e.target.value })}
                      className="w-full p-2 rounded-xl text-xs bg-white border border-slate-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsDocMetaModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-700 hover:to-indigo-700 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Menyimpan..." : "Simpan Identitas SK"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
