"use client";

import { useState } from "react";
import { Building2, Save, Upload, MapPin, Mail, Phone, Globe } from "lucide-react";
import { saveProfileAction } from "@/app/actions/profileActions";

interface ProfileData {
  leaderName?: string;
  email?: string;
  phone?: string;
  website?: string;
  province?: string;
  address?: string;
}

export default function ProfileClient({ initialProfile }: { initialProfile: ProfileData | null }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await saveProfileAction(formData);
      alert("Profil institusi berhasil disimpan!");
    } catch {
      alert("Gagal menyimpan profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-xs">
          <Building2 className="w-6 h-6 text-sky-600" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Profil Perguruan Tinggi</h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">Kelola identitas dan informasi institusi STIMI YAPMI Makassar.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Logo Upload Section */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-40 h-40 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 hover:border-sky-400 transition-all">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-600">Pilih Logo Kampus</span>
              <span className="text-[10px] text-slate-400 mt-1">PNG/JPG Max 5MB</span>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Nama Lengkap Pimpinan (Ketua / Rektor) *</label>
              <input required name="leaderName" type="text" defaultValue={initialProfile?.leaderName || "Dr. H. Rahman, M.M."} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-sky-600" /> Email Resmi PT *
                </label>
                <input required name="email" type="email" defaultValue={initialProfile?.email || "info@stimi-yapmi.ac.id"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-sky-600" /> Nomor Telepon / Fax
                </label>
                <input name="phone" type="text" defaultValue={initialProfile?.phone || "(0411) 852123"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-sky-600" /> Website Resmi (URL)
                </label>
                <input name="website" type="url" defaultValue={initialProfile?.website || "https://stimi-yapmi.ac.id"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" /> Provinsi Lokasi *
                </label>
                <select name="province" defaultValue={initialProfile?.province || "SULAWESI SELATAN"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30">
                  <option>SULAWESI SELATAN</option>
                  <option>DKI JAKARTA</option>
                  <option>JAWA BARAT</option>
                  <option>JAWA TIMUR</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Alamat Kampus *</label>
              <textarea name="address" rows={3} defaultValue={initialProfile?.address || "Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Makassar"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 resize-none"></textarea>
            </div>

            <div className="pt-3 flex justify-end">
              <button disabled={isLoading} type="submit" className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-sky-600/20 disabled:opacity-50">
                <Save className="w-4 h-4" /> {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
