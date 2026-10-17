import mongoose, { Schema, Document, Model } from 'mongoose';

export type SpmiVaultFolder =
  | '01_Kebijakan'
  | '02_Pedoman'
  | '03_Standar'
  | '04_SOP_Formulir'
  | '05_Penetapan'
  | '06_Pelaksanaan'
  | '07_Evaluasi_AMI_Survei'
  | '08_Pengendalian_RTL_RTM'
  | '09_Peningkatan'
  | '10_Laporan_Tahunan'
  | '11_Dokumen_Eksternal'
  | '12_Archive';

export interface ISpmiVaultFile extends Document {
  folderCategory: SpmiVaultFolder;
  documentCode: string; // e.g. "SPMI-K/01", "SPMI-PPEPP/01", "SPMI-STD/01"
  title: string;
  version: string; // e.g. "00", "01", "Rev 02"
  skNumber?: string; // SK penetapan/pengesahan
  validFrom?: Date;
  validUntil?: Date;
  statusDocument: 'TERKENDALI' | 'KADALUARSA' | 'DRAFT' | 'TIDAK_TERKENDALI';
  accessClass: 'PUBLIK' | 'INTERNAL' | 'TERBATAS' | 'RAHASIA';
  unitOwner: string; // e.g. "LPM", "Prodi Manajemen", "BAAK", "LPPM"
  fileUrl: string; // Local / cloud URL to file
  fileName: string; // Original uploaded file name
  fileSize: number; // Bytes
  fileType: string; // MIME type or extension
  description?: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const SpmiVaultFileSchema = new Schema<ISpmiVaultFile>(
  {
    folderCategory: {
      type: String,
      required: true,
      enum: [
        '01_Kebijakan',
        '02_Pedoman',
        '03_Standar',
        '04_SOP_Formulir',
        '05_Penetapan',
        '06_Pelaksanaan',
        '07_Evaluasi_AMI_Survei',
        '08_Pengendalian_RTL_RTM',
        '09_Peningkatan',
        '10_Laporan_Tahunan',
        '11_Dokumen_Eksternal',
        '12_Archive',
      ],
      index: true,
    },
    documentCode: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    version: { type: String, required: true, default: '00' },
    skNumber: { type: String, trim: true },
    validFrom: { type: Date },
    validUntil: { type: Date },
    statusDocument: {
      type: String,
      enum: ['TERKENDALI', 'KADALUARSA', 'DRAFT', 'TIDAK_TERKENDALI'],
      default: 'TERKENDALI',
      index: true,
    },
    accessClass: {
      type: String,
      enum: ['PUBLIK', 'INTERNAL', 'TERBATAS', 'RAHASIA'],
      default: 'INTERNAL',
    },
    unitOwner: { type: String, required: true, default: 'LPM' },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    description: { type: String, default: '' },
    uploadedBy: { type: String, required: true, default: 'LPM STIMI YAPMI' },
  },
  { timestamps: true }
);

export const SpmiVaultFile: Model<ISpmiVaultFile> =
  mongoose.models.SpmiVaultFile ||
  mongoose.model<ISpmiVaultFile>('SpmiVaultFile', SpmiVaultFileSchema);
