"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  FileText,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuarterDetail {
  value: number;
  status: string;
  percentage: number;
}

interface IndicatorItem {
  id: string;
  code: string;
  name: string;
  category: string;
  cluster: string;
  unit: string;
  type: string;
  baseline: number;
  target: number;
  realized: number;
  percentage: number;
  status: string;
  evaluationStatus: string;
  documentUrl: string;
  quarters: Record<number, QuarterDetail>;
}

interface ApiResponse {
  success: boolean;
  year: number;
  activeQuarter: number;
  totalCount: number;
  averagePercentage: number;
  indicators: IndicatorItem[];
}

export default function PublicIndicatorsShowcase() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [activeCluster, setActiveCluster] = useState<string>("SEMUA");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    let isSubscribed = true;
    async function loadIndicators() {
      try {
        const res = await fetch(`/api/public/indicators?year=2026&quarter=${selectedQuarter}`);
        const json = await res.json();
        if (isSubscribed && json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Gagal memuat indikator publik:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    loadIndicators();

    return () => {
      isSubscribed = false;
    };
  }, [selectedQuarter]);

  const clusterTabs = [
    { id: "SEMUA", label: "Semua Klaster" },
    { id: "Talenta", label: "Klaster 1: Talenta" },
    { id: "Inovasi", label: "Klaster 2: Inovasi" },
    { id: "Tata Kelola", label: "Klaster 3: Tata Kelola" },
  ];

  const filteredIndicators = (data?.indicators || []).filter((item) => {
    const matchesCluster =
      activeCluster === "SEMUA" ||
      item.cluster.toLowerCase().includes(activeCluster.toLowerCase()) ||
      item.category.toLowerCase().includes(activeCluster.toLowerCase());

    const matchesSearch =
      searchQuery.trim() === "" ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cluster.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCluster && matchesSearch;
  });

  const getStatusBadge = (item: IndicatorItem) => {
    if (item.status === "Disetujui") {
      if (item.percentage >= 80) {
        return {
          label: "Sesuai Target",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          bar: "bg-emerald-500",
        };
      }
      if (item.percentage >= 50) {
        return {
          label: "On Track",
          bg: "bg-cyan-50 text-cyan-700 border-cyan-200",
          icon: TrendingUp,
          bar: "bg-cyan-500",
        };
      }
      return {
        label: "Perlu Peningkatan",
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        icon: AlertCircle,
        bar: "bg-rose-500",
      };
    }
    if (item.status === "pendingDiajukan") {
      return {
        label: "Verifikasi LPM",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
        bar: "bg-amber-500",
      };
    }
    return {
      label: "Belum Dilaporkan",
      bg: "bg-slate-100 text-slate-600 border-slate-200",
      icon: Clock,
      bar: "bg-slate-400",
    };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Control Bar: Filter Cluster, Search, and Quarter Switcher */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Cluster Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {clusterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCluster(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCluster === tab.id
                    ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quarter Switcher */}
          <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200/80 shrink-0 self-start md:self-auto">
            {[1, 2, 3, 4].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setLoading(true);
                  setSelectedQuarter(q);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  selectedQuarter === q
                    ? "bg-white text-sky-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                TW {q}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari indikator (contoh: IKU 1, AEE PT, MBKM, Publikasi, Kerjasama)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Indicators Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="w-16 h-6 bg-slate-200 rounded-lg" />
                <div className="w-24 h-6 bg-slate-200 rounded-full" />
              </div>
              <div className="w-full h-10 bg-slate-200 rounded" />
              <div className="w-3/4 h-4 bg-slate-100 rounded" />
              <div className="w-full h-8 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredIndicators.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <Filter className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-slate-800 text-sm">Tidak Ada Indikator Ditemukan</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada indikator yang sesuai dengan filter klaster atau kata kunci &quot;{searchQuery}&quot;.
          </p>
          <button
            onClick={() => {
              setActiveCluster("SEMUA");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredIndicators.map((item) => {
              const badge = getStatusBadge(item);
              const BadgeIcon = badge.icon;

              return (
                <motion.div
                  key={item.code}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* Header Card */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-sky-50 text-sky-700 border border-sky-100 shrink-0">
                          {item.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.type}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badge.bg}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    {/* Indicator Name */}
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors">
                        {item.name}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
                        Klaster: {item.cluster}
                      </span>
                    </div>

                    {/* Realization vs Target Stats */}
                    <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-slate-500 font-medium">Realisasi TW {selectedQuarter}:</span>
                        <span className="font-black text-slate-900">
                          {item.realized} {item.unit}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-slate-500 font-medium">Target Tahunan:</span>
                        <span className="font-bold text-slate-700">
                          {item.target} {item.unit}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-400">Pencapaian:</span>
                          <span className="text-sky-700">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${badge.bar}`}
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mini Quarters History Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-400">Riwayat TW:</span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((q) => {
                          const qInfo = item.quarters[q];
                          const isCurrent = q === selectedQuarter;
                          const hasValue = qInfo && qInfo.value > 0;
                          return (
                            <span
                              key={q}
                              className={`px-1.5 py-0.5 rounded font-black ${
                                isCurrent
                                  ? "bg-sky-600 text-white"
                                  : hasValue
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                              title={`TW ${q}: ${qInfo?.value ?? 0} ${item.unit} (${qInfo?.status ?? "Belum"})`}
                            >
                              TW{q}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action: Proof Document Link */}
                  <div className="pt-4 mt-3 border-t border-slate-100">
                    {item.documentUrl ? (
                      <a
                        href={item.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lihat Bukti Dukung Publik</span>
                        <ExternalLink className="w-3 h-3 text-sky-500" />
                      </a>
                    ) : (
                      <div className="text-center py-1.5 text-[11px] text-slate-400 font-medium">
                        Bukti dukung internal terverifikasi LPM
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
