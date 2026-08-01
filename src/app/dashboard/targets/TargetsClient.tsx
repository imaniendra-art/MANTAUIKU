"use client";

import { useState } from "react";
import { Info, Lock, Edit3, UploadCloud, Save, X, KeySquare } from "lucide-react";
import { updateTargetAction, lockTargetAction, updateJustificationAction } from "@/app/actions/targetActions";

export default function TargetsClient({ initialTargets, isAdmin }: { initialTargets: any[], isAdmin: boolean }) {
  const [targets, setTargets] = useState(initialTargets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ baseline: 0, target: 0 });
  const [justificationModal, setJustificationModal] = useState<{ id: string, text: string } | null>(null);

  const handleEditClick = (target: any) => {
    setEditingId(target._id);
    setEditForm({ baseline: target.baseline, target: target.target });
  };

  const handleSave = async (id: string) => {
    try {
      const updated = await updateTargetAction(id, editForm.baseline, editForm.target);
      if (updated) {
        setTargets(targets.map(t => t._id === id ? { ...t, baseline: editForm.baseline, target: editForm.target } : t));
      }
    } catch (error) {
      console.error("Failed to update", error);
      alert("Gagal menyimpan perubahan");
    }
    setEditingId(null);
  };

  const handleLock = async (id: string) => {
    if (confirm("Kunci target ini? Nilai tidak akan bisa diubah lagi untuk tahun ini.")) {
      try {
        const updated = await lockTargetAction(id);
        if (updated) {
          setTargets(targets.map(t => t._id === id ? { ...t, status: "Dikunci" } : t));
        }
      } catch (error) {
        console.error("Failed to lock", error);
        alert("Gagal mengunci target");
      }
    }
  };

  const handleSaveJustification = async () => {
    if (!justificationModal) return;
    try {
      const updated = await updateJustificationAction(justificationModal.id, justificationModal.text);
      if (updated) {
        setTargets(targets.map(t => t._id === justificationModal.id ? { ...t, justificationNarrative: justificationModal.text } : t));
        setJustificationModal(null);
      }
    } catch (error) {
      console.error("Failed to save justification", error);
      alert("Gagal menyimpan justifikasi");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      
      {/* Justification Modal */}
      {justificationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Narasi Justifikasi</h3>
            <p className="text-sm text-gray-500 mb-4">Berikan alasan mengapa target tahun ini berada di bawah nilai baseline sebelumnya.</p>
            <textarea 
              rows={4}
              value={justificationModal.text}
              onChange={(e) => setJustificationModal({ ...justificationModal, text: e.target.value })}
              placeholder="Contoh: Terjadi pengurangan kuota mahasiswa baru sebesar 20%..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none mb-4"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => setJustificationModal(null)} className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Batal
              </button>
              <button onClick={handleSaveJustification} className="px-5 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                Simpan Justifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm w-16">No</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Indikator Kinerja Utama</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Satuan</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Baseline</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Target</th>
              <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {targets.map((item, index) => (
              <tr key={item._id} className="hover:bg-gray-50/30 transition-colors">
                <td className="py-4 px-6 align-top">
                  <span className="font-bold text-gray-400">{index + 1}</span>
                </td>
                <td className="py-4 px-6 max-w-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
                      {item.iku?.code}
                    </span>
                    {item.status === "Dikunci" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md border border-gray-200">
                        <Lock className="w-3 h-3" /> Dikunci
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 leading-snug">{item.iku?.name}</p>
                  
                  {item.justificationNarrative && (
                    <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 relative">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900">Narasi Justifikasi</p>
                          <p className="text-xs text-blue-800/80 mt-0.5 leading-relaxed">"{item.justificationNarrative}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 align-top text-center">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    {item.iku?.unit}
                  </span>
                </td>
                <td className="py-4 px-6 align-top text-center">
                  {editingId === item._id ? (
                    <input 
                      type="number" 
                      value={editForm.baseline} 
                      onChange={(e) => setEditForm({...editForm, baseline: Number(e.target.value)})}
                      className="w-20 px-2 py-1 text-center border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-600">{item.baseline}</span>
                  )}
                </td>
                <td className="py-4 px-6 align-top text-center">
                  {editingId === item._id ? (
                    <input 
                      type="number" 
                      value={editForm.target} 
                      onChange={(e) => setEditForm({...editForm, target: Number(e.target.value)})}
                      className="w-20 px-2 py-1 text-center border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  ) : (
                    <span className="text-lg font-bold text-emerald-600">{item.target}</span>
                  )}
                </td>
                <td className="py-4 px-6 align-top text-center">
                  {item.status === "Dikunci" ? (
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-not-allowed" title="Terkunci">
                      <Lock className="w-5 h-5 mx-auto" />
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {editingId === item._id ? (
                        <>
                          <button onClick={() => handleSave(item._id)} className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors" title="Simpan">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors" title="Batal">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {isAdmin && (
                            <>
                              <button onClick={() => handleEditClick(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Edit Target">
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleLock(item._id)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors" title="Kunci Target">
                                <KeySquare className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => setJustificationModal({ id: item._id, text: item.justificationNarrative || "" })}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors" 
                            title="Upload Justifikasi"
                          >
                            <UploadCloud className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
