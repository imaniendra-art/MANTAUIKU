"use client";

import { useSession } from "next-auth/react";
import { Edit, Plus, Trash2, Users } from "lucide-react";

export default function UsersPage() {
  const { data: session } = useSession();

  // Dummy data
  const usersList = [
    { id: 1, name: "Riswan", role: "Admin Kampus (LPM)", contact: "kampus.stimiyapmi@gmail.com", phone: "085174489071" },
    { id: 2, name: "Dr. Ahmad", role: "Unit Kerja (Bidang Akademik)", contact: "akademik@stimi-yapmi.ac.id", phone: "081234567890" },
  ];

  if (session?.user?.role !== "LPM") {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Anggota Tim Kampus</h2>
          <p className="text-gray-500 mt-1">Kelola akses tim khusus di lingkup perguruan tinggi Anda untuk kolaborasi data IKU.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-emerald-600/30">
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
            {usersList.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.contact}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 align-middle">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                    {u.role}
                  </span>
                </td>
                <td className="py-4 px-6 align-middle">
                  <span className="text-sm text-gray-600">{u.phone}</span>
                </td>
                <td className="py-4 px-6 align-middle text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
