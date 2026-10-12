import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Profil Akreditasi (Institusi & Program Studi)
export interface IAccreditationProfile extends Document {
  entityType: 'INSTITUSI' | 'PRODI';
  name: string;               // e.g. "STIMI YAPMI Makassar" atau "Program Studi S1 Manajemen"
  degreeLevel?: string;       // "S1", "Institusi"
  agency: 'BAN-PT' | 'LAMEMBA';
  grade: 'UNGGUL' | 'BAIK_SEKALI' | 'BAIK' | 'TERAKREDITASI';
  skNumber: string;           // e.g. "SK LAMEMBA No. 128/DE/A.1/AR.8/VII/2023"
  validFrom: Date;
  validUntil: Date;
  certificateUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Kriteria LAMEMBA (Kriteria 1 s/d 9)
export interface ILamembaCriteria extends Document {
  code: string;               // "C.1", "C.2", ..., "C.9"
  name: string;               // e.g. "Pendidikan", "Tata Pamong, Tata Kelola, dan Kerjasama"
  weight: number;             // Bobot persentase
  score: number;              // Skor capaian (0-100)
  targetScore: number;        // Target minimum (e.g. 85 untuk Unggul)
  status: 'UNGGUL' | 'BAIK_SEKALI' | 'BAIK' | 'PERLU_PERBAIKAN';
  description: string;
  strengths: string[];
  recommendations: string[];
  updatedAt: Date;
}

// 3. Instrumen Pemantauan & Evaluasi Tahunan Wajib Lampiran DL-05 LAMEMBA
export interface ILamembaDl05 extends Document {
  academicYear: string;       // e.g. "2025/2026"
  prodiName: string;          // "Program Studi S1 Manajemen"
  submissionDate: Date;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  
  // Bagian 1: Tindak Lanjut Rekomendasi Asesor (Asesmen Lapangan Terakhir)
  assessorFollowUps: Array<{
    recommendation: string;
    actionTaken: string;
    status: 'SELESAI' | 'SEDANG_BERJALAN' | 'BELUM';
    evidenceUrl?: string;
  }>;

  // Bagian 2: Kemajuan Implementasi Renstra & CQI
  renstraProgress: Array<{
    targetName: string;
    achievement: string;
    obstacle: string;
    cqiSolution: string;
  }>;

  // Bagian 3: Evaluasi Kinerja Tiga Pilar Kunci
  learningAssurance: {
    cplAchievementPercentage: number;
    obeRpsPercentage: number;
    description: string;
  };
  facultySufficiency: {
    permanentFacultyCount: number;
    doctoralPercentage: number;
    lektorHeadPercentage: number;
    facultyStudentRatio: string;
    description: string;
  };
  tridharmaOutcomes: {
    gpaAverage: number;
    avgStudyDurationMonths: number;
    tracerStudyResponseRate: number;
    waitingTimeMonths: number;
    publicationsCount: number;
    description: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const AccreditationProfileSchema = new Schema<IAccreditationProfile>(
  {
    entityType: { type: String, enum: ['INSTITUSI', 'PRODI'], required: true },
    name: { type: String, required: true },
    degreeLevel: { type: String, default: 'S1' },
    agency: { type: String, enum: ['BAN-PT', 'LAMEMBA'], required: true },
    grade: {
      type: String,
      enum: ['UNGGUL', 'BAIK_SEKALI', 'BAIK', 'TERAKREDITASI'],
      required: true,
    },
    skNumber: { type: String, required: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    certificateUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const LamembaCriteriaSchema = new Schema<ILamembaCriteria>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    score: { type: Number, required: true },
    targetScore: { type: Number, required: true, default: 85 },
    status: {
      type: String,
      enum: ['UNGGUL', 'BAIK_SEKALI', 'BAIK', 'PERLU_PERBAIKAN'],
      default: 'BAIK_SEKALI',
    },
    description: { type: String, required: true },
    strengths: [{ type: String }],
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

const LamembaDl05Schema = new Schema<ILamembaDl05>(
  {
    academicYear: { type: String, required: true },
    prodiName: { type: String, required: true, default: 'Program Studi S1 Manajemen' },
    submissionDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED'], default: 'SUBMITTED' },
    assessorFollowUps: [
      {
        recommendation: { type: String, required: true },
        actionTaken: { type: String, required: true },
        status: { type: String, enum: ['SELESAI', 'SEDANG_BERJALAN', 'BELUM'], default: 'SEDANG_BERJALAN' },
        evidenceUrl: { type: String },
      },
    ],
    renstraProgress: [
      {
        targetName: { type: String, required: true },
        achievement: { type: String, required: true },
        obstacle: { type: String },
        cqiSolution: { type: String, required: true },
      },
    ],
    learningAssurance: {
      cplAchievementPercentage: { type: Number, default: 88 },
      obeRpsPercentage: { type: Number, default: 92 },
      description: { type: String },
    },
    facultySufficiency: {
      permanentFacultyCount: { type: Number, default: 18 },
      doctoralPercentage: { type: Number, default: 33 },
      lektorHeadPercentage: { type: Number, default: 61 },
      facultyStudentRatio: { type: String, default: '1:24' },
      description: { type: String },
    },
    tridharmaOutcomes: {
      gpaAverage: { type: Number, default: 3.42 },
      avgStudyDurationMonths: { type: Number, default: 46 },
      tracerStudyResponseRate: { type: Number, default: 78 },
      waitingTimeMonths: { type: Number, default: 3.2 },
      publicationsCount: { type: Number, default: 24 },
      description: { type: String },
    },
  },
  { timestamps: true }
);

export const AccreditationProfile: Model<IAccreditationProfile> =
  mongoose.models.AccreditationProfile ||
  mongoose.model<IAccreditationProfile>('AccreditationProfile', AccreditationProfileSchema);

export const LamembaCriteria: Model<ILamembaCriteria> =
  mongoose.models.LamembaCriteria ||
  mongoose.model<ILamembaCriteria>('LamembaCriteria', LamembaCriteriaSchema);

export const LamembaDl05: Model<ILamembaDl05> =
  mongoose.models.LamembaDl05 ||
  mongoose.model<ILamembaDl05>('LamembaDl05', LamembaDl05Schema);
