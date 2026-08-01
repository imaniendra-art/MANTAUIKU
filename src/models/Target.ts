import mongoose from 'mongoose';

const TargetSchema = new mongoose.Schema({
  ikuId: { type: mongoose.Schema.Types.ObjectId, ref: 'IKUMetadata', required: true },
  year: { type: Number, required: true }, // e.g. 2026
  baseline: { type: Number, default: 0 }, // e.g. 2025 baseline
  target: { type: Number, required: true },
  justificationNotes: { type: String }, // Catatan Justifikasi
  justificationNarrative: { type: String }, // Narasi Justifikasi
  documentUrl: { type: String }, // URL Dokumen Pendukung (S3/Cloudinary/etc)
  status: { type: String, enum: ['Belum', 'Diajukan', 'Dikunci'], default: 'Belum' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Unit Kerja that submitted it
}, { timestamps: true });

export default mongoose.models.Target || mongoose.model('Target', TargetSchema);
