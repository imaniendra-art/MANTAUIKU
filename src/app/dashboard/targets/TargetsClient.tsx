"use client";

import { useState } from "react";
import { Info, Lock, Edit3, UploadCloud, Save, X, KeySquare } from "lucide-react";
import { updateTargetAction, lockTargetAction, updateJustificationAction } from "@/app/actions/targetActions";

interface TargetItem {
  _id: string;
  baseline: number;
  target: number;
  status?: string;
  justificationNarrative?: string;
  iku?: {
    code: string;
    name: string;
    unit: string;
  };
}

export default function TargetsClient({ initialTargets, isAdmin }: { initialTargets: TargetItem[], isAdmin: boolean }) {
  const [targets, setTargets] = useState<TargetItem[]>(initialTargets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ baseline: 0, target: 0 });
  const [justificationModal, setJustificationModal] = useState<{ id: string, text: string } | null>(null);

  const handleEditClick = (target: TargetItem) => {
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
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      
      {/* Justification Modal */}
      {justificationModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Upload Narasi Justifikasi</h3>
            <p className="text-xs text-slate-500 mb-4">Berikan alasan mengapa target tahun ini berada di bawah nilai baseline sebelumnya.</p>
            <textarea 
              rows={4}
              value={justificationModal.text}
              onChange={(e) => setJustificationModal({ ...justificationModal, text: e.target.value })}
              placeholder="Contoh: Terjadi pengurangan kuota mahasiswa baru sebesar 20%..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 resize-none mb-4"
            ></textarea>
            <div className="flex justify-end gap-2.5">
              <button onClick={() => setJustificationModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                Batal
              </button>
              <button onClick={handleSaveJustification} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 transition-all shadow-md shadow-sky-600/20">
                Simpan Justifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold">
              <th className="py-4 px-6 w-16">NO</th>
              <th className="py-4 px-6">INDIKATOR KINERJA UTAMA</th>
              <th className="py-4 px-6 text-center">SATUAN</th>
              <th className="py-4 px-6 text-center">BASELINE</th>
              <th className="py-4 px-6 text-center">TARGET 2026</th>
              <th className="py-4 px-6 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {targets.map((item, index) => (
              <tr key={item._id} className="hover:bg-sky-50/20 transition-colors">
                <td className="py-4 px-6 align-top">
                  <span className="font-bold text-slate-400">{index + 1}</span>
                </td>
                <td className="py-4 px-6 max-w-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-extrabold rounded">
                      {item.iku?.code}
                    </span>
                    {item.status === "Dikunci" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded border border-slate-200">
                        <Lock className="w-3 h-3" /> Dikunci
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 leading-snug">{item.iku?.name}</p>
                  
                  {item.justificationNarrative && (
                    <div className="mt-2.5 p-3 bg-sky-50/60 rounded-xl border border-sky-100 relative">
                      <div className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-sky-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-sky-900">Narasi Justifikasi</p>
                          <p className="text-[11px] text-sky-800/80 mt-0.5 leading-relaxed">&ldquo;{item.justificationNarrative}&rdquo;</p>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 align-top text-center">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                    {item.iku?.unit}
                  </span>
                </td>
                <td className="py-4 px-6 align-top text-center">
                  {editingId === item._id ? (
                    <input 
                      type="number" 
                      value={editForm.baseline} 
                      onChange={(e) => setEditForm({...editForm, baseline: Number(e.target.value)})}
                      className="w-20 px-2 py-1 text-center border border-sky-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 text-xs font-bold"
                    />
                  ) : (
                    <span className="text-base font-bold text-slate-600">{item.baseline}</span>
                  )}
                </td>
                <td className="py-4 px-6 align-top text-center">
                  {editingId === item._id ? (
                    <input 
                      type="number" 
                      value={editForm.target} 
                      onChange={(e) => setEditForm({...editForm, target: Number(e.target.value)})}
                      className="w-20 px-2 py-1 text-center border border-sky-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 text-xs font-bold"
                    />
                  ) : (
                    <span className="text-base font-bold text-sky-600">{item.target}</span>
                  )}
                </td>
                <td className="py-4 px-6 align-top text-center">
                  {item.status === "Dikunci" ? (
                    <button className="p-2 text-slate-300 rounded-xl cursor-not-allowed" title="Terkunci">
                      <Lock className="w-4 h-4 mx-auto" />
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      {editingId === item._id ? (
                        <>
                          <button onClick={() => handleSave(item._id)} className="p-2 text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors" title="Simpan">
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors" title="Batal">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          {isAdmin && (
                            <>
                              <button onClick={() => handleEditClick(item)} className="p-2 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors" title="Edit Target">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleLock(item._id)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors" title="Kunci Target">
                                <KeySquare className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => setJustificationModal({ id: item._id, text: item.justificationNarrative || "" })}
                            className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors" 
                            title="Upload Justifikasi"
                          >
                            <UploadCloud className="w-4 h-4" />
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
