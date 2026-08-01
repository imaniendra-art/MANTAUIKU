import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  ikuId: { type: mongoose.Schema.Types.ObjectId, ref: 'IKUMetadata', required: true },
  year: { type: Number, required: true },
  quarter: { type: Number, required: true, enum: [1, 2, 3, 4] }, // TW 1, 2, 3, 4
  value: { type: Number, required: true }, // Capaian
  documentUrl: { type: String }, // Link to Bukti
  status: { type: String, enum: ['Draf', 'pendingDiajukan', 'Disetujui', 'Dikunci'], default: 'Draf' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema);
