"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { createUserAction, deleteUserAction } from "@/app/actions/userActions";

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("Hapus pengguna ini?")) {
      try {
        await deleteUserAction(id);
        setUsers(users.filter(u => u._id !== id));
      } catch (error) {
        alert("Gagal menghapus user");
      }
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const newUser = await createUserAction(formData);
      setUsers([...users, newUser]);
      setIsModalOpen(false);
    } catch (error: any) {
      alert("Gagal membuat user: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Anggota Tim Kampus</h2>
          <p className="text-gray-500 mt-1">Kelola akses tim khusus di lingkup perguruan tinggi Anda untuk kolaborasi data IKU.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-emerald-600/30"
        >
          <Plus className="w-5 h-5" /> Tambah Anggota
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Identitas Tim</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Hak Akses / Role</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Kontak</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Opsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50/30 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 align-middle">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${u.role === 'LPM' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                    {u.role === 'LPM' ? 'Admin Kampus (LPM)' : `Unit Kerja (${u.unitName || '-'})`}
                  </span>
                </td>
                <td className="py-4 px-6 align-middle">
                  <span className="text-sm text-gray-600">{u.phone || '-'}</span>
                </td>
                <td className="py-4 px-6 align-middle text-center">
                  <div className="flex items-center justify-center gap-2">
                    {u.role !== 'LPM' && (
                      <button onClick={() => handleDelete(u._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Tambah Anggota / Unit Kerja Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 ml-1">Nama PIC *</label>
                <input required name="name" type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-emerald-500/50 outline-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 ml-1">Nama Unit Kerja *</label>
                <input required name="unitName" type="text" placeholder="Misal: Bidang Akademik" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-emerald-500/50 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 ml-1">Email (Untuk Login) *</label>
                  <input required name="email" type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-emerald-500/50 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 ml-1">Password *</label>
                  <input required name="password" type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-emerald-500/50 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 ml-1">Nomor Telepon</label>
                <input name="phone" type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mt-1 focus:ring-2 focus:ring-emerald-500/50 outline-none" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isLoading} className="px-5 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {isLoading ? "Menyimpan..." : "Simpan Anggota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
