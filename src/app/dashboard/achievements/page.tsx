"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  Edit3, 
  X, 
  TrendingUp,
  Search,
  Calculator
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NumeratorDenominatorModal, { AuditDetails } from "@/components/dashboard/NumeratorDenominatorModal";

interface IKUItem {
  _id: string;
  code: string;
  name: string;
  category: string;
  cluster: string;
  unit: string;
  type: string;
  formula?: string;
  numeratorLabel?: string;
  denominatorLabel?: string;
  calculationMethod?: string;
  target: number;
  baseline: number;
  achievement: {
    _id: string;
    value: number;
    numerator?: number | null;
    denominator?: number | null;
    formula?: string;
    numeratorLabel?: string;
    denominatorLabel?: string;
    documentUrl: string;
    status: string;
    submittedBy?: {
      name: string;
      unitName?: string;
    };
    updatedAt?: string;
  } | null;
}

export default function AchievementsPage() {
  const { data: session } = useSession();
  const [activeQuarter, setActiveQuarter] = useState<number>(1);
  const [items, setItems] = useState<IKUItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Input / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIKU, setSelectedIKU] = useState<IKUItem | null>(null);
  const [formValue, setFormValue] = useState<string>("");
  const [formNumerator, setFormNumerator] = useState<string>("");
  const [formDenominator, setFormDenominator] = useState<string>("");
  const [formDocUrl, setFormDocUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Drill-down Numerator/Denominator Audit Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditModalData, setAuditModalData] = useState<AuditDetails | null>(null);

  const userRole = session?.user?.role;
  const isLPM = userRole === "LPM";

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/achievements?quarter=${activeQuarter}`);
      const data = await res.json();
      if (data.success && data.data) {
        setItems(data.data);
      }
    } catch (e) {
      console.error("Error fetching achievements:", e);
    } finally {
      setLoading(false);
    }
  }, [activeQuarter]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch(`/api/achievements?quarter=${activeQuarter}`);
        const data = await res.json();
        if (!ignore && data.success && data.data) {
          setItems(data.data);
        }
      } catch (e) {
        console.error("Error fetching achievements:", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [activeQuarter]);

  const handleOpenModal = (item: IKUItem) => {
    setSelectedIKU(item);
    setFormValue(item.achievement ? String(item.achievement.value) : "");
    setFormNumerator(item.achievement?.numerator !== undefined && item.achievement?.numerator !== null ? String(item.achievement.numerator) : "");
    setFormDenominator(item.achievement?.denominator !== undefined && item.achievement?.denominator !== null ? String(item.achievement.denominator) : "");
    setFormDocUrl(item.achievement?.documentUrl || "");
    setFormMessage(null);
    setIsModalOpen(true);
  };

  const handleNumeratorChange = (val: string) => {
    setFormNumerator(val);
    const num = parseFloat(val);
    const den = parseFloat(formDenominator);
    if (!isNaN(num) && !isNaN(den) && den > 0 && selectedIKU?.unit === "%") {
      setFormValue(String(Math.round((num / den) * 1000) / 10));
    }
  };

  const handleDenominatorChange = (val: string) => {
    setFormDenominator(val);
    const num = parseFloat(formNumerator);
    const den = parseFloat(val);
    if (!isNaN(num) && !isNaN(den) && den > 0 && selectedIKU?.unit === "%") {
      setFormValue(String(Math.round((num / den) * 1000) / 10));
    }
  };

  const handleSaveAchievement = async (status: "Draf" | "pendingDiajukan") => {
    if (!selectedIKU) return;
    setSubmitting(true);
    setFormMessage(null);

    try {
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ikuId: selectedIKU._id,
          year: 2026,
          quarter: activeQuarter,
          value: parseFloat(formValue) || 0,
          numerator: formNumerator ? parseFloat(formNumerator) : undefined,
          denominator: formDenominator ? parseFloat(formDenominator) : undefined,
          formula: selectedIKU.formula,
          numeratorLabel: selectedIKU.numeratorLabel,
          denominatorLabel: selectedIKU.denominatorLabel,
          documentUrl: formDocUrl,
          status,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormMessage({ type: "success", text: "Capaian berhasil disimpan!" });
        setTimeout(() => {
          setIsModalOpen(false);
          fetchAchievements();
        }, 1000);
      } else {
        setFormMessage({ type: "error", text: data.error || "Gagal menyimpan capaian" });
      }
    } catch (err: unknown) {
      const e = err as Error;
      setFormMessage({ type: "error", text: e.message || "Terjadi kesalahan sistem" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidateStatus = async (achievementId: string, status: string) => {
    try {
      const res = await fetch("/api/achievements/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementId, status }),
      });
      if (res.ok) {
        fetchAchievements();
      }
    } catch (e) {
      console.error("Failed to validate:", e);
    }
  };

  const filteredItems = items.filter((item) => 
    item.code.toLowerCase().includes(search.toLowerCase()) ||
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.cluster.toLowerCase().includes(search.toLowerCase())
  );

  const totalReported = items.filter((i) => i.achievement !== null).length;
  const totalApproved = items.filter((i) => i.achievement?.status === "Disetujui").length;
  const totalPending = items.filter((i) => i.achievement?.status === "pendingDiajukan").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pelaporan Capaian Kinerja (Triwulan {activeQuarter})
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {isLPM 
              ? "Evaluasi dan validasi dokumen capaian 12 IKU yang dilaporkan unit kerja."
              : `Input realisasi capaian dan lampirkan tautan bukti dukung untuk indikator Anda.`}
          </p>
        </div>

        {/* Quarter Selectors */}
        <div className="inline-flex rounded-2xl bg-white p-1.5 border border-slate-200/80 shadow-xs">
          {[1, 2, 3, 4].map((tw) => (
            <button
              key={tw}
              onClick={() => setActiveQuarter(tw)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeQuarter === tw 
                  ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Triwulan {tw}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Tanggung Jawab IKU</span>
            <FileText className="w-5 h-5 text-sky-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{items.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Sudah Diisi</span>
            <TrendingUp className="w-5 h-5 text-cyan-600" />
          </div>
          <span className="text-2xl font-black text-slate-900">{totalReported}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Menunggu Validasi</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600">{totalPending}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Tervalidasi LPM</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-600">{totalApproved}</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Cari kode atau nama IKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Menampilkan {filteredItems.length} indikator kerja
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-5">KODE & INDIKATOR</th>
                <th className="py-3.5 px-4">KLASTER</th>
                <th className="py-3.5 px-4 text-center">TARGET 2026</th>
                <th className="py-3.5 px-4 text-center">REALISASI TW {activeQuarter}</th>
                <th className="py-3.5 px-4">BUKTI DUKUNG</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Memuat data indikator capaian...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Tidak ada indikator yang cocok dengan pencarian atau akun Anda.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const ach = item.achievement;
                  const isDone = ach?.status === "Disetujui";
                  const isPending = ach?.status === "pendingDiajukan";

                  return (
                    <tr key={item._id} className="hover:bg-sky-50/30 transition-colors">
                      <td className="py-4 px-5 max-w-sm">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-extrabold bg-sky-100 text-sky-800 mb-1">
                          {item.code}
                        </span>
                        <p className="font-semibold text-slate-900 leading-snug line-clamp-2">
                          {item.name}
                        </p>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                        {item.cluster}
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap font-bold text-slate-700">
                        {item.target} {item.unit}
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {ach ? (
                          <button
                            type="button"
                            onClick={() => {
                              setAuditModalData({
                                code: item.code,
                                name: item.name,
                                cluster: item.cluster,
                                unit: item.unit,
                                quarter: activeQuarter,
                                year: 2026,
                                target: item.target,
                                realization: ach.value,
                                numerator: ach.numerator,
                                denominator: ach.denominator,
                                formula: ach.formula || item.formula,
                                numeratorLabel: ach.numeratorLabel || item.numeratorLabel,
                                denominatorLabel: ach.denominatorLabel || item.denominatorLabel,
                                calculationMethod: item.calculationMethod,
                                status: ach.status,
                                documentUrl: ach.documentUrl,
                                submittedBy: ach.submittedBy,
                                updatedAt: ach.updatedAt,
                              });
                              setIsAuditModalOpen(true);
                            }}
                            className="group inline-flex flex-col items-center py-1 px-2.5 rounded-xl hover:bg-sky-100/70 border border-transparent hover:border-sky-200 transition-all cursor-pointer"
                            title="Klik untuk melihat rincian Pembilang & Penyebut (Numerator/Denominator) Audit Mutu"
                          >
                            <span className="font-black text-sky-700 text-sm group-hover:text-sky-900 group-hover:scale-105 transition-all">
                              {ach.value} {item.unit}
                            </span>
                            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 group-hover:bg-white border border-sky-200/80 px-2 py-0.5 rounded-md mt-0.5 inline-flex items-center gap-1 shadow-2xs">
                              <Calculator className="w-3 h-3 text-sky-600" />
                              {ach.numerator !== null && ach.numerator !== undefined && ach.denominator !== null && ach.denominator !== undefined
                                ? `${ach.numerator} / ${ach.denominator}`
                                : "Rincian Formula 🔢"}
                            </span>
                          </button>
                        ) : (
                          <span className="text-slate-300 italic font-normal">Belum diisi</span>
                        )}
                      </td>

                      <td className="py-4 px-4 max-w-[160px] truncate">
                        {ach?.documentUrl ? (
                          <a
                            href={ach.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-bold hover:underline"
                          >
                            <span>Lihat Bukti</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-slate-300 italic">Tanpa dokumen</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {ach ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isDone ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            isPending ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {isDone ? "Disetujui" : isPending ? "Diajukan" : "Draf"}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-400">
                            Kosong
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Unit Kerja Edit Button */}
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{ach ? "Ubah" : "Isi"}</span>
                          </button>

                          {/* LPM Approve/Reject Buttons */}
                          {isLPM && ach && (
                            <button
                              onClick={() => handleValidateStatus(ach._id, "Disetujui")}
                              title="Setujui Capaian"
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && selectedIKU && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-sky-100 text-sky-800">
                    {selectedIKU.code} • Triwulan {activeQuarter}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Input Realisasi Capaian
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-5 line-clamp-2">
                {selectedIKU.name}
              </p>

              {formMessage && (
                <div className={`p-3 rounded-xl mb-4 text-xs font-semibold ${
                  formMessage.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}>
                  {formMessage.text}
                </div>
              )}

              {/* Formula Guidance Banner */}
              <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-2xl mb-4 space-y-1">
                <div className="flex items-center gap-1.5 text-sky-900 font-bold text-xs">
                  <Calculator className="w-3.5 h-3.5 text-sky-600" />
                  <span>Formula Audit Mutu:</span>
                </div>
                <p className="text-[11px] font-mono font-bold text-sky-950 bg-white/70 px-2.5 py-1.5 rounded-lg border border-sky-200/60">
                  {selectedIKU.formula || "(Pembilang / Penyebut) × 100%"}
                </p>
              </div>

              <div className="space-y-4">
                {/* Numerator & Denominator Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate" title={selectedIKU.numeratorLabel || "Pembilang (Numerator)"}>
                      {selectedIKU.numeratorLabel || "Pembilang (Numerator)"}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formNumerator}
                      onChange={(e) => handleNumeratorChange(e.target.value)}
                      placeholder="Contoh: 76"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate" title={selectedIKU.denominatorLabel || "Penyebut (Denominator)"}>
                      {selectedIKU.denominatorLabel || "Penyebut (Denominator)"}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formDenominator}
                      onChange={(e) => handleDenominatorChange(e.target.value)}
                      placeholder="Contoh: 84"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                  </div>
                  {selectedIKU.unit === "%" && (
                    <span className="sm:col-span-2 text-[10px] text-slate-400 italic">
                      * Nilai realisasi (%) akan otomatis dihitung saat pembilang & penyebut diisi.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nilai Realisasi Final ({selectedIKU.unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder={`Contoh: 85 (${selectedIKU.unit})`}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-semibold text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Target Tahunan: {selectedIKU.target} {selectedIKU.unit}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tautan Bukti Dukung (Google Drive / SK / Surat)
                  </label>
                  <input
                    type="url"
                    value={formDocUrl}
                    onChange={(e) => setFormDocUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveAchievement("Draf")}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Simpan Draf
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSaveAchievement("pendingDiajukan")}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all cursor-pointer"
                >
                  {submitting ? "Menyimpan..." : "Ajukan ke LPM"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Drill-Down Numerator & Denominator Audit Mutu */}
      <NumeratorDenominatorModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        data={auditModalData}
      />
    </div>
  );
}
