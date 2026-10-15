"use client";

import { useState } from "react";
import { 
  Building2, 
  Save, 
  Upload, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  User as UserIcon, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Briefcase,
  Layers
} from "lucide-react";
import { saveProfileAction } from "@/app/actions/profileActions";
import { changePasswordAction } from "@/app/actions/userActions";

interface ProfileData {
  leaderName?: string;
  email?: string;
  phone?: string;
  website?: string;
  province?: string;
  address?: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  unitCode: string;
  unitName: string;
  assignedIKUCodes: string[];
}

export default function ProfileClient({ 
  currentUser,
  initialProfile,
  isLPM 
}: { 
  currentUser: CurrentUser;
  initialProfile: ProfileData | null;
  isLPM: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"security" | "institution">("security");

  // Institutional form state
  const [isSavingInst, setIsSavingInst] = useState(false);
  const [instMessage, setInstMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change state
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingPass(true);
    setPassMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await changePasswordAction(formData);
      setPassMessage({ type: "success", text: res.message });
      form.reset();
    } catch (err: unknown) {
      const error = err as Error;
      setPassMessage({ type: "error", text: error.message || "Gagal mengubah kata sandi" });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleInstSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingInst(true);
    setInstMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      await saveProfileAction(formData);
      setInstMessage({ type: "success", text: "Profil institusi berhasil disimpan!" });
    } catch (err: unknown) {
      const error = err as Error;
      setInstMessage({ type: "error", text: error.message || "Gagal menyimpan profil institusi" });
    } finally {
      setIsSavingInst(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-xs">
            <UserIcon className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Profil & Keamanan Akun</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Kelola informasi identitas akun, ganti kata sandi mandiri, serta pengaturan institusi.
            </p>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "security"
                ? "bg-white text-sky-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Akun & Kata Sandi</span>
          </button>

          {isLPM && (
            <button
              type="button"
              onClick={() => setActiveTab("institution")}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "institution"
                  ? "bg-white text-sky-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Profil Perguruan Tinggi</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: AKUN & KEAMANAN KATA SANDI */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sisi Kiri: Kartu Identitas Akun PIC / Pengguna */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-sky-600/20 shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="font-extrabold text-slate-900 text-base truncate">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                <div className="pt-0.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                    currentUser.role === "LPM" 
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : currentUser.role === "PIMPINAN"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-sky-50 text-sky-700 border-sky-200"
                  }`}>
                    {currentUser.role === "LPM" ? "Super Admin LPM" : currentUser.role === "PIMPINAN" ? "Eksekutif Pimpinan" : "PIC Unit Kerja"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Unit Kerja Resmi
                </span>
                <p className="font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {currentUser.unitName} ({currentUser.unitCode})
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Tanggung Jawab Pengawasan IKU
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentUser.assignedIKUCodes && currentUser.assignedIKUCodes.length > 0 ? (
                    currentUser.assignedIKUCodes.map((code) => (
                      <span key={code} className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-bold text-[11px]">
                        {code}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">Semua Indikator (Akses Penuh)</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-1 text-sky-900">
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Kebijakan Keamanan Akun SPMI</span>
                </div>
                <p className="text-[11px] text-sky-800/80 leading-relaxed">
                  Ganti kata sandi default (<code className="bg-sky-200/50 px-1 rounded font-bold">password123</code>) secara berkala demi menjamin integritas data pelaporan akreditasi kampus.
                </p>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Formulir Ganti Kata Sandi */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-600" />
                <span>Ubah Kata Sandi Akun Saya</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pastikan kata sandi baru Anda unik, kuat, dan terdiri dari minimal 6 karakter.
              </p>
            </div>

            {passMessage && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${
                passMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}>
                {passMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{passMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              {/* Kata Sandi Lama */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Kata Sandi Saat Ini (Lama) *
                </label>
                <div className="relative">
                  <input
                    required
                    name="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    placeholder="Masukkan kata sandi saat ini..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Kata Sandi Baru */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Kata Sandi Baru * (Minimal 6 Karakter)
                </label>
                <div className="relative">
                  <input
                    required
                    name="newPassword"
                    type={showNew ? "text" : "password"}
                    minLength={6}
                    placeholder="Masukkan kata sandi baru..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Konfirmasi Kata Sandi Baru *
                </label>
                <div className="relative">
                  <input
                    required
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    minLength={6}
                    placeholder="Ulangi kata sandi baru..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-sky-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isChangingPass ? "Memproses..." : "Perbarui Kata Sandi Saya"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PROFIL PERGURUAN TINGGI (KHUSUS LPM) */}
      {activeTab === "institution" && isLPM && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Identitas & Profil Resmi Perguruan Tinggi</span>
            </h3>
            <p className="text-xs text-slate-500">
              Informasi ini akan dicantumkan pada kop surat cetak rekapitulasi, dokumen Lampiran DL-05 LAMEMBA, serta laporan PDF resmi.
            </p>
          </div>

          {instMessage && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${
              instMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{instMessage.text}</span>
            </div>
          )}

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
            <form onSubmit={handleInstSubmit} className="flex-1 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Lengkap Pimpinan (Ketua / Rektor) *</label>
                <input required name="leaderName" type="text" defaultValue={initialProfile?.leaderName || "Dr. Ibrahim Syah, S.E., M.M."} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-medium" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-sky-600" /> Email Resmi PT *
                  </label>
                  <input required name="email" type="email" defaultValue={initialProfile?.email || "info@stimi-yapmi.ac.id"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-sky-600" /> Nomor Telepon / Fax
                  </label>
                  <input name="phone" type="text" defaultValue={initialProfile?.phone || "(0411) 852123"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-sky-600" /> Website Resmi (URL)
                  </label>
                  <input name="website" type="url" defaultValue={initialProfile?.website || "https://stimi-yapmi.ac.id"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-medium" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" /> Provinsi Lokasi *
                  </label>
                  <select name="province" defaultValue={initialProfile?.province || "SULAWESI SELATAN"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 font-medium">
                    <option>SULAWESI SELATAN</option>
                    <option>DKI JAKARTA</option>
                    <option>JAWA BARAT</option>
                    <option>JAWA TIMUR</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Alamat Kampus *</label>
                <textarea name="address" rows={3} defaultValue={initialProfile?.address || "Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Makassar"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 resize-none font-medium"></textarea>
              </div>

              <div className="pt-3 flex justify-end">
                <button disabled={isSavingInst} type="submit" className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-sky-600/20 disabled:opacity-50 cursor-pointer">
                  <Save className="w-4 h-4" /> {isSavingInst ? "Menyimpan..." : "Simpan Perubahan Institusi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
