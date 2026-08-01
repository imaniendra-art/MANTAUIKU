"use client";

import { Download, FolderArchive, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 flex items-center justify-center shadow-sm">
          <FolderArchive className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Arsip Laporan Kinerja</h2>
          <p className="text-gray-500 mt-0.5">Riwayat pelaporan capaian kinerja triwulan dan dokumentasi bukti dukung.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Archival Integrity Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden"
        >
          <h3 className="font-bold text-gray-800 text-lg mb-2">Archival Integrity Info</h3>
          <p className="text-sm text-gray-600 mb-6">
            Setiap arsip berisi Ringkasan Capaian (CSV) dan seluruh File Bukti Dukung digital yang telah dibundel menjadi satu paket ZIP.
          </p>
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center text-center">
            <Download className="w-6 h-6 text-emerald-600 mb-2" />
            <span className="font-semibold text-emerald-800 text-sm">Rekap Target Tahunan</span>
            <p className="text-xs text-emerald-600/80 mt-1 mb-3">Unduh rekapitulasi target beserta justifikasi.</p>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2 rounded-xl text-sm font-semibold transition-colors">
              Target 2026
            </button>
          </div>
        </motion.div>

        {/* Reports Log */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
        >
          <h3 className="font-bold text-gray-800 text-lg mb-4">Reports Log</h3>
          
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-2xl p-4 hover:border-emerald-300 transition-colors cursor-pointer group">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-800">Triwulan 01</h4>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">Synchronized</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>17 IKU</span>
                <span>29 Mar 2026</span>
              </div>
              <button className="mt-4 w-full bg-gray-100 group-hover:bg-emerald-50 text-gray-700 group-hover:text-emerald-700 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <FolderArchive className="w-4 h-4" /> ZIP (PDF + Bukti)
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-2xl p-4 hover:border-emerald-300 transition-colors cursor-pointer group">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-800">Triwulan 02</h4>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg">Submitted</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>17 IKU</span>
                <span>29 Jul 2026</span>
              </div>
              <button className="mt-4 w-full bg-gray-100 group-hover:bg-emerald-50 text-gray-700 group-hover:text-emerald-700 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <FolderArchive className="w-4 h-4" /> ZIP (PDF + Bukti)
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
