import mongoose from 'mongoose';

const IKUMetadataSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g. "IKU 1", "Sub IKU 1.1"
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g. "Talenta", "Inovasi"
  cluster: { type: String }, // e.g. "Talenta & Mahasiswa", "Inovasi & Riset", "Tata Kelola & Finansial"
  unit: { type: String, required: true }, // e.g. "%", "Angka", "Dokumen"
  type: { type: String, enum: ['Wajib', 'Pilihan', 'Partisipatif'], required: true },
  assignedUnitId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Assigned Unit Kerja
}, { timestamps: true });

export default mongoose.models.IKUMetadata || mongoose.model('IKUMetadata', IKUMetadataSchema);
