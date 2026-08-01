"use client";

import { useState } from "react";
import { Building2, Save, Upload, MapPin, Mail, Phone, Globe } from "lucide-react";
import { saveProfileAction } from "@/app/actions/profileActions";

export default function ProfileClient({ initialProfile }: { initialProfile: any }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await saveProfileAction(formData);
      alert("Profil institusi berhasil disimpan!");
    } catch (error) {
      alert("Gagal menyimpan profil");
    } finally {
      setIsLoading(false);
    }
  };

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
          <form onSubmit={handleSubmit} className="flex-1 space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Nama Lengkap Pimpinan *</label>
              <input required name="leaderName" type="text" defaultValue={initialProfile?.leaderName || ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Email Resmi PT *
                </label>
                <input required name="email" type="email" defaultValue={initialProfile?.email || ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                  <Phone className="w-4 h-4" /> Nomor Telepon
                </label>
                <input name="phone" type="text" defaultValue={initialProfile?.phone || ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                  <Globe className="w-4 h-4" /> Website Resmi (URL)
                </label>
                <input name="website" type="url" defaultValue={initialProfile?.website || ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Provinsi Lokasi *
                </label>
                <select name="province" defaultValue={initialProfile?.province || "SULAWESI SELATAN"} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                  <option>SULAWESI SELATAN</option>
                  <option>DKI JAKARTA</option>
                  <option>JAWA BARAT</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Alamat Lengkap Kantor Pusat *</label>
              <textarea name="address" rows={3} defaultValue={initialProfile?.address || ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={isLoading} type="submit" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm shadow-emerald-600/30 disabled:opacity-50">
                <Save className="w-5 h-5" /> {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
