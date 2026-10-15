import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISpmiStandardItem {
  code: string; // e.g. "STD-DIK-01", "STD-LIT-01"
  name: string; // e.g. "Standar Kompetensi Lulusan Berbasis OBE"
  category: 'PENDIDIKAN' | 'PENELITIAN' | 'PENGABDIAN' | 'TATA_PAMONG' | 'SDM_SARPRAS_KEUANGAN';
  statement: string; // Pernyataan isi standar SPMI
  indicators: string[]; // Indikator ketercapaian terukur
  targetValue: string; // Target capaian institusi
  strategies: string[]; // Strategi pelaksanaan
  responsibleUnit: string; // Unit pelaksana/penanggung jawab
  ppeppCycle: {
    penetapanDate: string;
    pelaksanaanNotes: string;
    evaluasiAmiStatus: 'SESUAI' | 'OB' | 'KTS';
    pengendalianAction: string;
    peningkatanTarget: string;
  };
}

export interface ISpmiFormItem {
  code: string; // e.g. "FORM-AMI-01"
  name: string;
  purpose: string;
  targetUser: string;
  fileTemplateUrl?: string;
}

export interface ISpmiSectionItem {
  title: string;
  content: string;
  order: number;
}

export interface ISpmiDocument extends Document {
  bookType: 'KEBIJAKAN' | 'MANUAL' | 'STANDAR' | 'FORMULIR';
  bookNumber: number; // 1, 2, 3, 4
  title: string;
  code: string; // e.g. "SPMI-STIMI-01"
  version: string; // e.g. "3.0"
  skNumber: string; // SK Ketua STIMI YAPMI
  validFrom: Date;
  validUntil: Date;
  status: 'DRAFT' | 'DIREVIU_SENAT' | 'DITETAPKAN_BERLAKU';
  description: string;
  sections: ISpmiSectionItem[];
  standards: ISpmiStandardItem[];
  forms: ISpmiFormItem[];
  signedBy: {
    name: string;
    title: string;
    nipOrNidn: string;
    date: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SpmiStandardItemSchema = new Schema<ISpmiStandardItem>({
  code: { type: String, required: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['PENDIDIKAN', 'PENELITIAN', 'PENGABDIAN', 'TATA_PAMONG', 'SDM_SARPRAS_KEUANGAN'],
    required: true 
  },
  statement: { type: String, required: true },
  indicators: [{ type: String }],
  targetValue: { type: String, required: true },
  strategies: [{ type: String }],
  responsibleUnit: { type: String, required: true },
  ppeppCycle: {
    penetapanDate: { type: String, default: '2025-09-01' },
    pelaksanaanNotes: { type: String, default: 'Diterapkan pada seluruh program kerja tahunan unit' },
    evaluasiAmiStatus: { type: String, enum: ['SESUAI', 'OB', 'KTS'], default: 'SESUAI' },
    pengendalianAction: { type: String, default: 'Tindak lanjut perbaikan berkala melalui RTM' },
    peningkatanTarget: { type: String, default: 'Peningkatan target mutu 10% pada siklus berikutnya' },
  },
});

const SpmiFormItemSchema = new Schema<ISpmiFormItem>({
  code: { type: String, required: true },
  name: { type: String, required: true },
  purpose: { type: String, required: true },
  targetUser: { type: String, required: true },
  fileTemplateUrl: { type: String },
});

const SpmiSectionItemSchema = new Schema<ISpmiSectionItem>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, required: true },
});

const SpmiDocumentSchema = new Schema<ISpmiDocument>(
  {
    bookType: { 
      type: String, 
      enum: ['KEBIJAKAN', 'MANUAL', 'STANDAR', 'FORMULIR'], 
      required: true,
      unique: true 
    },
    bookNumber: { type: Number, required: true },
    title: { type: String, required: true },
    code: { type: String, required: true },
    version: { type: String, default: '3.0' },
    skNumber: { type: String, required: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['DRAFT', 'DIREVIU_SENAT', 'DITETAPKAN_BERLAKU'], 
      default: 'DITETAPKAN_BERLAKU' 
    },
    description: { type: String, required: true },
    sections: [SpmiSectionItemSchema],
    standards: [SpmiStandardItemSchema],
    forms: [SpmiFormItemSchema],
    signedBy: {
      name: { type: String, default: 'Dr. Ibrahim Syah, S.E., M.M.' },
      title: { type: String, default: 'Ketua STIMI YAPMI Makassar' },
      nipOrNidn: { type: String, default: 'NIDN. 0920037601' },
      date: { type: Date, default: () => new Date('2025-09-01') },
    },
  },
  { timestamps: true }
);

export const SpmiDocument: Model<ISpmiDocument> =
  mongoose.models.SpmiDocument ||
  mongoose.model<ISpmiDocument>('SpmiDocument', SpmiDocumentSchema);
