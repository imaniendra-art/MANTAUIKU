"use client";

import { Download, FolderArchive } from "lucide-react";
import { motion } from "framer-motion";

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-xs">
          <FolderArchive className="w-6 h-6 text-sky-600" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Arsip Laporan Kinerja</h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">Riwayat pelaporan capaian kinerja triwulan dan dokumentasi bukti dukung.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Archival Integrity Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden"
        >
          <h3 className="font-bold text-slate-900 text-base mb-2">Integritas Dokumen Arsip</h3>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Setiap arsip berisi Ringkasan Capaian (CSV/Excel) dan tautan bukti dukung digital yang divalidasi oleh Lembaga Penjaminan Mutu (LPM).
          </p>
          <div className="bg-sky-50/70 border border-sky-100 p-5 rounded-2xl flex flex-col items-center text-center">
            <Download className="w-6 h-6 text-sky-600 mb-2" />
            <span className="font-bold text-sky-900 text-sm">Rekapitulasi Target & IKU</span>
            <p className="text-xs text-sky-700/80 mt-1 mb-3">Unduh data target tahunan beserta narasi justifikasi.</p>
            <button className="bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-sky-600/20">
              Unduh Target Tahun 2026
            </button>
          </div>
        </motion.div>

        {/* Reports Log */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs"
        >
          <h3 className="font-bold text-slate-900 text-base mb-4">Log Pelaporan Kinerja Triwulan</h3>
          
          <div className="space-y-3.5">
            <div className="border border-slate-200 rounded-2xl p-4 hover:border-sky-300 transition-colors cursor-pointer group bg-slate-50/30">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-900 text-sm">Triwulan 01 (TW 1)</h4>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">Tervalidasi</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>12 Indikator Kinerja</span>
                <span>Maret 2026</span>
              </div>
              <button className="mt-3 w-full bg-white border border-slate-200 group-hover:border-sky-300 group-hover:bg-sky-50 text-slate-700 group-hover:text-sky-700 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
                <FolderArchive className="w-3.5 h-3.5" /> Ekspor Rekapitulasi (PDF / Excel)
              </button>
            </div>
            
            <div className="border border-slate-200 rounded-2xl p-4 hover:border-sky-300 transition-colors cursor-pointer group bg-slate-50/30">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-900 text-sm">Triwulan 02 (TW 2)</h4>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold rounded-full">Proses Input</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>12 Indikator Kinerja</span>
                <span>Juli 2026</span>
              </div>
              <button className="mt-3 w-full bg-white border border-slate-200 group-hover:border-sky-300 group-hover:bg-sky-50 text-slate-700 group-hover:text-sky-700 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
                <FolderArchive className="w-3.5 h-3.5" /> Ekspor Rekapitulasi (PDF / Excel)
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
