import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILedDraft extends Document {
  criterionKey: string;           // e.g. "c1", "c2", ..., "c9", "summary"
  criterionNumber: number;        // 1 - 9
  criterionTitle: string;         // e.g. "Kriteria C.4: Sumber Daya Manusia"
  academicYear: string;          // e.g. "2025/2026"
  prodi: string;                  // e.g. "S1 Manajemen"
  targetRating: string;           // e.g. "Unggul", "Baik Sekali"
  contentMarkdown: string;        // Isi lengkap draf narasi LED format Markdown
  wordCount: number;
  dataSourcesUsed: string[];      // e.g. ["IKU 1-12", "Hasil AMI 2026", "EDO SIAM", "Tracer Study CDC"]
  status: "DRAF" | "DISETUJUI_TIM_AKREDITASI" | "FINAL";
  generatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const LedDraftSchema = new Schema<ILedDraft>(
  {
    criterionKey: { type: String, required: true },
    criterionNumber: { type: Number, required: true },
    criterionTitle: { type: String, required: true },
    academicYear: { type: String, required: true, default: "2025/2026" },
    prodi: { type: String, required: true, default: "S1 Manajemen" },
    targetRating: { type: String, required: true, default: "Unggul" },
    contentMarkdown: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
    dataSourcesUsed: [{ type: String }],
    status: {
      type: String,
      enum: ["DRAF", "DISETUJUI_TIM_AKREDITASI", "FINAL"],
      default: "DRAF",
    },
    generatedBy: { type: String, default: "AI Quality Copilot MANTAUIKU" },
  },
  { timestamps: true }
);

export const LedDraft: Model<ILedDraft> =
  mongoose.models.LedDraft || mongoose.model<ILedDraft>("LedDraft", LedDraftSchema);

export default LedDraft;
