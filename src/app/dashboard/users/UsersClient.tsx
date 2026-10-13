"use client";

import { useState } from "react";
import { Plus, Trash2, X, ShieldCheck, KeyRound } from "lucide-react";
import { createUserAction, deleteUserAction, resetUserPasswordAction } from "@/app/actions/userActions";

const allIKUOptions = [
  "IKU 1", "IKU 2", "IKU 3", "IKU 4", "IKU 5", "IKU 6",
  "IKU 7", "IKU 8", "IKU 9", "IKU 10", "IKU 11", "IKU 12"
];

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  unitCode?: string;
  unitName?: string;
  assignedIKUCodes?: string[];
  phone?: string;
}

export default function UsersClient({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIKUs, setSelectedIKUs] = useState<string[]>([]);

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus akun penanggung jawab ini?")) {
      try {
        await deleteUserAction(id);
        setUsers(users.filter(u => u._id !== id));
      } catch {
        alert("Gagal menghapus user");
      }
    }
  };

  const handleResetPassword = async (user: UserItem) => {
    const newPass = prompt(
      `Reset kata sandi untuk ${user.name} (${user.email}). Masukkan kata sandi baru (kosongkan untuk default 'password123'):`,
      "password123"
    );
    if (newPass === null) return;
    try {
      const res = await resetUserPasswordAction(user._id, newPass || "password123");
      alert(res.message);
    } catch (err: unknown) {
      const error = err as Error;
      alert("Gagal mereset kata sandi: " + error.message);
    }
  };

  const handleToggleIKU = (code: string) => {
    setSelectedIKUs(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("assignedIKUCodes", selectedIKUs.join(","));

    try {
      const newUser = await createUserAction(formData);
      setUsers([...users, newUser as unknown as UserItem]);
      setIsModalOpen(false);
      setSelectedIKUs([]);
    } catch (error: unknown) {
      const err = error as Error;
      alert("Gagal membuat user: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pengguna & Unit Kerja (PIC IKU)
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Kelola akun penanggung jawab unit kerja dan pembagian tugas indikator kinerja STIMI YAPMI.
          </p>
        </div>
        
        <button 
          onClick={() => {
            setSelectedIKUs([]);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" /> 
          <span>Tambah Akun PIC</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold">
              <th className="py-4 px-6">PENANGGUNG JAWAB (PIC)</th>
              <th className="py-4 px-6">PERAN & UNIT</th>
              <th className="py-4 px-6">INDIKATOR YANG DITUGASKAN</th>
              <th className="py-4 px-6">KONTAK</th>
              <th className="py-4 px-6 text-center">OPSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {users.map((u) => {
              const isAdmin = u.role === "LPM";
              const isPimpinan = u.role === "PIMPINAN";
              const ikus: string[] = u.assignedIKUCodes || [];

              return (
                <tr key={u._id} className="hover:bg-sky-50/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-sky-600/20">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 align-middle">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      isAdmin 
                        ? 'bg-sky-50 text-sky-700 border-sky-200' 
                        : isPimpinan 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                    }`}>
                      <ShieldCheck className="w-3 h-3" />
                      {isAdmin ? 'Admin Kampus (LPM)' : isPimpinan ? 'Pimpinan Kampus' : (u.unitName || 'Unit Kerja')}
                    </span>
                  </td>

                  <td className="py-4 px-6 align-middle">
                    {isAdmin || isPimpinan ? (
                      <span className="text-xs font-semibold text-slate-500 italic">
                        Semua Indikator (12 IKU)
                      </span>
                    ) : ikus.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {ikus.map((code) => (
                          <span key={code} className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-100">
                            {code}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300 italic text-xs">Belum ditugaskan</span>
                    )}
                  </td>

                  <td className="py-4 px-6 align-middle text-slate-600">
                    {u.phone || '-'}
                  </td>

                  <td className="py-4 px-6 align-middle text-center">
                    {!isAdmin ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleResetPassword(u)}
                          title="Reset kata sandi pengguna"
                          className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(u._id)} 
                          title="Hapus akun"
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-bold italic">Akun Utama</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Tambah Akun Penanggung Jawab (PIC)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tugaskan indikator IKU spesifik kepada unit kerja terkait.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pejabat / PIC *</label>
                <input 
                  required 
                  name="name" 
                  type="text" 
                  placeholder="Contoh: Dr. H. Rahman, M.M."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500/30 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Unit Kerja *</label>
                  <input 
                    required 
                    name="unitName" 
                    type="text" 
                    placeholder="Misal: WK III Kemahasiswaan" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500/30 outline-none" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Unit *</label>
                  <input 
                    required 
                    name="unitCode" 
                    type="text" 
                    placeholder="Misal: WK3" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500/30 outline-none uppercase" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Login *</label>
                  <input 
                    required 
                    name="email" 
                    type="email" 
                    placeholder="wk3@stimi.ac.id"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500/30 outline-none" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password *</label>
                  <input 
                    required 
                    name="password" 
                    type="password" 
                    defaultValue="password123"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500/30 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Tugaskan Tanggung Jawab IKU (Pilih yang relevan):
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {allIKUOptions.map((code) => {
                    const isChecked = selectedIKUs.includes(code);
                    return (
                      <button
                        type="button"
                        key={code}
                        onClick={() => handleToggleIKU(code)}
                        className={`py-1 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                          isChecked 
                            ? "bg-sky-600 text-white border-sky-600 shadow-xs" 
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 transition-all shadow-md shadow-sky-600/20 disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
