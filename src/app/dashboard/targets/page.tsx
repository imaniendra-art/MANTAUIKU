"use client";

import { useSession } from "next-auth/react";
import { Info, Lock, Edit3, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

export default function TargetsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "LPM";

  // Dummy Data for demonstration
  const targets = [
    {
      id: "9",
      code: "IKU 9",
      name: "Persentase pendapatan non-pendidikan/UKT terhadap total pendapatan",
      baseline: 0,
      target: 10,
      unit: "%",
      trend: "Naik",
      status: "Dikunci",
      justification: "Baseline tahun 2025 sebesar 0% karena seluruh pendapatan perguruan tinggi masih bergantung pada UKT mahasiswa."
    },
    {
      id: "1",
      code: "IKU 1",
      name: "Lulusan Mendapat Pekerjaan yang Layak",
      baseline: 45,
      target: 60,
      unit: "%",
      trend: "Naik",
      status: "Belum",
      justification: null
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Target IKU</h2>
          <p className="text-gray-500 mt-1">Tetapkan baseline dan target capaian untuk tahun berjalan.</p>
        </div>
        {isAdmin && (
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-emerald-600/30">
            Tambah IKU Baru
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm w-16">No</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Indikator Kinerja Utama</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Satuan</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Baseline</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Target</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {targets.map((target, index) => (
                <tr key={target.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="py-4 px-6 align-top">
                    <span className="font-bold text-gray-400">{index + 1}</span>
                  </td>
                  <td className="py-4 px-6 max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
                        {target.code}
                      </span>
                      {target.status === "Dikunci" && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md border border-gray-200">
                          <Lock className="w-3 h-3" /> Dikunci
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-800 leading-snug">{target.name}</p>
                    
                    {target.justification && (
                      <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 relative">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-blue-900">Narasi Justifikasi</p>
                            <p className="text-xs text-blue-800/80 mt-0.5 leading-relaxed">"{target.justification}"</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 align-top text-center">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      {target.unit}
                    </span>
                    <p className="text-xs text-emerald-600 font-semibold mt-2">↑ {target.trend}</p>
                  </td>
                  <td className="py-4 px-6 align-top text-center">
                    <span className="text-lg font-bold text-gray-600">{target.baseline}</span>
                  </td>
                  <td className="py-4 px-6 align-top text-center">
                    <span className="text-lg font-bold text-emerald-600">{target.target}</span>
                  </td>
                  <td className="py-4 px-6 align-top text-center">
                    {target.status === "Dikunci" ? (
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-not-allowed" title="Terkunci">
                        <Lock className="w-5 h-5 mx-auto" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        {isAdmin && (
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Edit Target">
                            <Edit3 className="w-5 h-5" />
                          </button>
                        )}
                        <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" title="Upload Justifikasi">
                          <UploadCloud className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
