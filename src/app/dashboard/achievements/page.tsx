"use client";

import { CheckCircle, Clock, FileText, Lock, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState("tw1");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pelaporan Capaian Kinerja</h2>
          <p className="text-gray-500 mt-1">Pantau dan lengkapi pelaporan realisasi IKU secara bertahap.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 font-medium">Total IKU</span>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800">17</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 font-medium">Dilaporkan</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800">17</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 font-medium">Diajukan</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800">1</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 font-medium">Valid</span>
            <CheckCircle className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-gray-800">0</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-gray-200/50 p-1 rounded-xl w-fit">
        {["tw1", "tw2", "tw3", "tw4"].map((tw) => (
          <button
            key={tw}
            onClick={() => setActiveTab(tw)}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === tw 
                ? "bg-white text-emerald-700 shadow-sm" 
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Triwulan {tw.replace("tw", "")}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Triwulan {activeTab.replace("tw", "")} 
              {activeTab === "tw1" && <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 text-xs rounded-md flex items-center gap-1"><Lock className="w-3 h-3"/> Dikunci</span>}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Periode pelaporan capaian kuartal ini.</p>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="w-full bg-gray-200 rounded-full h-2 w-24">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "0%" }}></div>
              </div>
              <span className="text-xs font-semibold text-gray-600">0%</span>
            </div>
          </div>
        </div>

        {/* Empty State / Table */}
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-gray-800 font-bold text-lg">Belum Ada Data Dukung Terkumpul</h4>
          <p className="text-gray-500 text-sm mt-2 max-w-md">
            Unit kerja belum mengunggah dokumen capaian untuk Triwulan ini.
          </p>
          <button className="mt-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-emerald-600/30">
            <PlusCircle className="w-5 h-5" />
            Input Realisasi Baru
          </button>
        </div>

      </motion.div>
    </div>
  );
}
