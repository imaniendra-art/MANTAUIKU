"use client";

import { useState } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Filter,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IndicatorRAG {
  code: string;
  name: string;
  cluster: string;
  target: number;
  realized: number;
  unit: string;
  percentage: number;
  status: "HIJAU" | "KUNING" | "MERAH";
  rekomendasi: string;
}

export default function EarlyWarningSystem() {
  const [activeFilter, setActiveFilter] = useState<"SEMUA" | "HIJAU" | "KUNING" | "MERAH">("SEMUA");

  // Sample data representing the 12 indicators for early warning assessment
  const indicators: IndicatorRAG[] = [
    {
      code: "IKU 1",
      name: "Angka Efisiensi Edukasi perguruan tinggi (AEE PT)",
      cluster: "Talenta & Mahasiswa",
      target: 80,
      realized: 76,
      unit: "%",
      percentage: 95,
      status: "HIJAU",
      rekomendasi: "Kinerja sangat baik. Pertahankan retensi dan kelulusan tepat waktu."
    },
    {
      code: "IKU 2",
      name: "Persentase lulusan yang langsung bekerja, berwirausaha, atau studi lanjut",
      cluster: "Talenta & Mahasiswa",
      target: 70,
      realized: 62,
      unit: "%",
      percentage: 88,
      status: "HIJAU",
      rekomendasi: "Sesuai standar LAMEMBA. Tingkatkan jejaring alumni dan inkubator bisnis."
    },
    {
      code: "IKU 3",
      name: "Persentase mahasiswa berkegiatan/meraih prestasi di luar kampus (MBKM)",
      cluster: "Talenta & Mahasiswa",
      target: 60,
      realized: 42,
      unit: "%",
      percentage: 70,
      status: "KUNING",
      rekomendasi: "Perlu percepatan pelaporan konversi SKS magang dan keikutsertaan kompetisi nasional."
    },
    {
      code: "IKU 4",
      name: "Jumlah Dosen dengan rekognisi internasional atau riset diterapkan masyarakat",
      cluster: "Inovasi & Riset",
      target: 10,
      realized: 4,
      unit: "Angka",
      percentage: 40,
      status: "MERAH",
      rekomendasi: "Perlu intervensi LPPM: fasilitasi insentif HKI dan pendampingan pengabdian kemitraan."
    },
    {
      code: "IKU 5",
      name: "Persentase luaran hasil kerja sama dan hilirisasi dengan industri/DUDI",
      cluster: "Inovasi & Riset",
      target: 50,
      realized: 48,
      unit: "%",
      percentage: 96,
      status: "HIJAU",
      rekomendasi: "Sangat baik. Kemitraan industri manajemen aktif menghasilkan MoU dan magang."
    },
    {
      code: "IKU 6",
      name: "Persentase publikasi bereputasi internasional (Scopus/WoS/SINTA)",
      cluster: "Inovasi & Riset",
      target: 30,
      realized: 20,
      unit: "%",
      percentage: 66,
      status: "KUNING",
      rekomendasi: "Perlu percepatan submit naskah dosen pada jurnal SINTA 2 sebelum batas akhir kuartal."
    },
    {
      code: "IKU 7",
      name: "Persentase keterlibatan perguruan tinggi dalam program SDGs",
      cluster: "Tata Kelola & Finansial",
      target: 65,
      realized: 58,
      unit: "%",
      percentage: 89,
      status: "HIJAU",
      rekomendasi: "On target. Program pengabdian masyarakat terintegrasi pilar SDGs."
    },
    {
      code: "IKU 8",
      name: "Persentase SDM perguruan tinggi yang terlibat langsung penyusunan kebijakan",
      cluster: "Tata Kelola & Finansial",
      target: 20,
      realized: 9,
      unit: "%",
      percentage: 45,
      status: "MERAH",
      rekomendasi: "Perlu surat tugas formal bagi dosen yang menjadi staf ahli atau narasumber Pemda/BUMN."
    },
    {
      code: "IKU 9",
      name: "Persentase pendapatan non-akademik (selain SPP/UKT)",
      cluster: "Tata Kelola & Finansial",
      target: 25,
      realized: 21,
      unit: "%",
      percentage: 84,
      status: "HIJAU",
      rekomendasi: "Sesuai target. Unit bisnis pelatihan dan konsultasi manajemen berjalan efektif."
    },
    {
      code: "IKU 10",
      name: "Zona Integritas (Pembangunan Wilayah Bebas Korupsi / WBK)",
      cluster: "Tata Kelola & Finansial",
      target: 80,
      realized: 60,
      unit: "%",
      percentage: 75,
      status: "KUNING",
      rekomendasi: "Percepat kelengkapan lembar kerja evaluasi ZI unit pelayanan akademik."
    },
    {
      code: "IKU 11",
      name: "Hasil audit atas Laporan Keuangan PT dan Predikat SAKIP",
      cluster: "Tata Kelola & Finansial",
      target: 85,
      realized: 82,
      unit: "%",
      percentage: 96,
      status: "HIJAU",
      rekomendasi: "Sangat baik. Opini WTP dan akuntabilitas keuangan mematuhi tata kelola modern."
    },
    {
      code: "IKU 12",
      name: "Ketersediaan perencanaan strategis peningkatan kesejahteraan dosen",
      cluster: "Tata Kelola & Finansial",
      target: 100,
      realized: 90,
      unit: "%",
      percentage: 90,
      status: "HIJAU",
      rekomendasi: "Tercapai. Regulasi tunjangan fungsional dan asuransi kesehatan dosen telah ditetapkan."
    }
  ];

  const countHijau = indicators.filter(i => i.status === "HIJAU").length;
  const countKuning = indicators.filter(i => i.status === "KUNING").length;
  const countMerah = indicators.filter(i => i.status === "MERAH").length;

  const filtered = activeFilter === "SEMUA" 
    ? indicators 
    : indicators.filter(i => i.status === activeFilter);

  return (
    <div className="space-y-6">
      {/* Overview Cards (Red-Amber-Green Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Hijau */}
        <div 
          onClick={() => setActiveFilter(activeFilter === "HIJAU" ? "SEMUA" : "HIJAU")}
          className={`cursor-pointer p-5 rounded-3xl border transition-all ${
            activeFilter === "HIJAU" 
              ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md" 
              : "bg-white border-slate-200/80 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Kinerja Unggul
            </span>
          </div>
          <h4 className="text-2xl font-black text-slate-900">{countHijau} IKU</h4>
          <span className="text-xs font-bold text-emerald-700 block mt-0.5">Kategori Hijau (≥ 80% Target)</span>
          <p className="text-[11px] text-slate-500 mt-1">Indikator on-track atau telah melampaui target tahunan.</p>
        </div>

        {/* Kuning */}
        <div 
          onClick={() => setActiveFilter(activeFilter === "KUNING" ? "SEMUA" : "KUNING")}
          className={`cursor-pointer p-5 rounded-3xl border transition-all ${
            activeFilter === "KUNING" 
              ? "bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-md" 
              : "bg-white border-slate-200/80 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Dalam Pengawasan
            </span>
          </div>
          <h4 className="text-2xl font-black text-slate-900">{countKuning} IKU</h4>
          <span className="text-xs font-bold text-amber-700 block mt-0.5">Kategori Kuning (50% - 79%)</span>
          <p className="text-[11px] text-slate-500 mt-1">Memerlukan percepatan upload bukti dukung sebelum penutupan kuartal.</p>
        </div>

        {/* Merah */}
        <div 
          onClick={() => setActiveFilter(activeFilter === "MERAH" ? "SEMUA" : "MERAH")}
          className={`cursor-pointer p-5 rounded-3xl border transition-all ${
            activeFilter === "MERAH" 
              ? "bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 shadow-md" 
              : "bg-white border-slate-200/80 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              Perlu Intervensi
            </span>
          </div>
          <h4 className="text-2xl font-black text-slate-900">{countMerah} IKU</h4>
          <span className="text-xs font-bold text-rose-700 block mt-0.5">Kategori Merah (&lt; 50% Target)</span>
          <p className="text-[11px] text-slate-500 mt-1">Menjadi agenda prioritas pada Rapat Tinjauan Manajemen (RTM).</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-700">Filter Status Peringatan:</span>
        </div>

        <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
          {(["SEMUA", "HIJAU", "KUNING", "MERAH"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeFilter === f 
                  ? "bg-white text-slate-900 shadow-xs" 
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {f === "SEMUA" ? "Semua (12)" : f === "HIJAU" ? `Hijau (${countHijau})` : f === "KUNING" ? `Kuning (${countKuning})` : `Merah (${countMerah})`}
            </button>
          ))}
        </div>
      </div>

      {/* Indicator RAG Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((item) => {
            const isGreen = item.status === "HIJAU";
            const isAmber = item.status === "KUNING";

            return (
              <motion.div
                key={item.code}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-sky-50 text-sky-700 border border-sky-100">
                      {item.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                      isGreen ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      isAmber ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {isGreen ? "ON TARGET" : isAmber ? "ON WATCH" : "CRITICAL"}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                    {item.name}
                  </h5>

                  <span className="text-[10px] font-semibold text-slate-400 block">
                    Klaster: {item.cluster}
                  </span>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Realisasi / Target:</span>
                    <span className="font-black text-slate-800">
                      {item.realized} / {item.target} {item.unit} ({item.percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isGreen ? "bg-emerald-500" : isAmber ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-tight flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span>{item.rekomendasi}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
