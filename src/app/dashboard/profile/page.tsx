"use client";

import { Building2, Save, Upload, MapPin, Mail, Phone, Globe } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 flex items-center justify-center shadow-sm">
          <Building2 className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Profil Perguruan Tinggi</h2>
          <p className="text-gray-500 mt-0.5">Kelola identitas dan informasi institusi Anda.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Logo Upload Section */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-40 h-40 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 hover:border-emerald-300 transition-all">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-semibold text-gray-600">Pilih Gambar</span>
              <span className="text-xs text-gray-400 mt-1">Maksimal: 10MB</span>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Nama Lengkap Pimpinan *</label>
              <input type="text" defaultValue="Dr. Ibrahim Syah, S.E., M.M" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Email Resmi PT *
                </label>
                <input type="email" defaultValue="kampus.stimiyapmi@gmail.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                  <Phone className="w-4 h-4" /> Nomor Telepon
                </label>
                <input type="text" defaultValue="085174489071" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                  <Globe className="w-4 h-4" /> Website Resmi (URL)
                </label>
                <input type="url" defaultValue="https://stimi-yapmi.ac.id/" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Provinsi Lokasi *
                </label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                  <option>SULAWESI SELATAN</option>
                  <option>DKI JAKARTA</option>
                  <option>JAWA BARAT</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Alamat Lengkap Kantor Pusat *</label>
              <textarea rows={3} defaultValue="Jl. Perintis Kemerdekaan No.Km.9, Tamalanrea Jaya, Kec. Tamalanrea, Kota Makassar, Sulawesi Selatan 90245" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm shadow-emerald-600/30">
                <Save className="w-5 h-5" /> Simpan Perubahan
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
