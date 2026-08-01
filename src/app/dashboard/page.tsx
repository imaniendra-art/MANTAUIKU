"use client";

import { useSession } from "next-auth/react";
import { CheckCircle, Clock, FileText, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { data: session } = useSession();

  const stats = [
    { title: "Total IKU", value: "12", icon: Target, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Telah Dilaporkan", value: "8", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Menunggu Validasi", value: "3", icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Tervalidasi", value: "5", icon: CheckCircle, color: "text-indigo-600", bg: "bg-indigo-100" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Selamat Datang, {session?.user?.name}! 👋
          </h2>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Di Sistem Manajemen Indikator Kinerja Utama (MANTAU IKU). 
            Ini adalah pusat kendali Anda untuk memantau, melaporkan, dan mengevaluasi target kinerja institusi.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <Icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Area: Progress & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Progres Capaian Kinerja (2026)</h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50">
              <option>Triwulan 1</option>
              <option>Triwulan 2</option>
              <option>Triwulan 3</option>
              <option>Triwulan 4</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Grafik Capaian akan ditampilkan di sini</p>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-6">Aktivitas Terakhir</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Upload Dokumen IKU {i}</p>
                  <p className="text-xs text-gray-500 mt-1">Oleh Bidang Kerjasama • 2 jam yang lalu</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
