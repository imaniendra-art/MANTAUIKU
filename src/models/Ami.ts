import mongoose, { Schema, Document, Model } from 'mongoose';

export type AuditeeKey =
  | 'prodi'
  | 'lppm'
  | 'baak'
  | 'pusdatin'
  | 'perpustakaan'
  | 'lab_komputer'
  | 'keuangan'
  | 'umum_kerjasama'
  | 'kemahasiswaan'
  | 'humas';

export type FindingCategory = 'KTS_MAYOR' | 'KTS_MINOR' | 'OB';
export type FindingStatus = 'OPEN' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'CLOSED';
export type PeriodStatus = 'DRAFT' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED';

export interface IAmiPeriod extends Document {
  academicYear: string;
  cycleNumber: number;
  title: string;
  startDate: Date;
  endDate: Date;
  status: PeriodStatus;
  rtmDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAmiFinding extends Document {
  periodId: mongoose.Types.ObjectId;
  auditeeKey: AuditeeKey;
  auditeeName: string;
  standardRef: string;
  category: FindingCategory;
  description: string;
  auditorName: string;
  status: FindingStatus;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  picName?: string;
  dueDate?: Date;
  evidenceUrl?: string;
  evidenceNotes?: string;
  auditorFeedback?: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AmiPeriodSchema = new Schema<IAmiPeriod>(
  {
    academicYear: { type: String, required: true },
    cycleNumber: { type: Number, required: true },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'IN_REVIEW', 'COMPLETED'],
      default: 'ACTIVE',
    },
    rtmDate: { type: Date },
  },
  { timestamps: true }
);

const AmiFindingSchema = new Schema<IAmiFinding>(
  {
    periodId: { type: Schema.Types.ObjectId, ref: 'AmiPeriod', required: true },
    auditeeKey: {
      type: String,
      required: true,
      enum: [
        'prodi',
        'lppm',
        'baak',
        'pusdatin',
        'perpustakaan',
        'lab_komputer',
        'keuangan',
        'umum_kerjasama',
        'kemahasiswaan',
        'humas',
      ],
    },
    auditeeName: { type: String, required: true },
    standardRef: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['KTS_MAYOR', 'KTS_MINOR', 'OB'],
    },
    description: { type: String, required: true },
    auditorName: { type: String, required: true, default: 'Tim Auditor LPM' },
    status: {
      type: String,
      required: true,
      enum: ['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'CLOSED'],
      default: 'OPEN',
    },
    rootCause: { type: String },
    correctiveAction: { type: String },
    preventiveAction: { type: String },
    picName: { type: String },
    dueDate: { type: Date },
    evidenceUrl: { type: String },
    evidenceNotes: { type: String },
    auditorFeedback: { type: String },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const AmiPeriod: Model<IAmiPeriod> =
  mongoose.models.AmiPeriod || mongoose.model<IAmiPeriod>('AmiPeriod', AmiPeriodSchema);

export const AmiFinding: Model<IAmiFinding> =
  mongoose.models.AmiFinding || mongoose.model<IAmiFinding>('AmiFinding', AmiFindingSchema);
