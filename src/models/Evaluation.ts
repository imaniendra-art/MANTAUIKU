import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. EDO (Evaluasi Dosen oleh Mahasiswa - Agregasi dari SIAM)
export interface IEdoLecturerEvaluation extends Document {
  nidn: string;
  lecturerName: string;
  courseName: string;
  courseCode: string;
  academicYear: string;          // e.g. "2025/2026"
  semester: 'Ganjil' | 'Genap';
  respondentCount: number;       // Jumlah mahasiswa yang menilai di SIAM
  pedagogicScore: number;        // Skala 1 - 4
  professionalScore: number;     // Skala 1 - 4
  personalityScore: number;      // Skala 1 - 4
  socialScore: number;           // Skala 1 - 4
  ikdScore: number;              // Rata-rata Indeks Kinerja Dosen (1 - 4)
  predicate: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  syncedAt: Date;
}

// 2. EKA (Evaluasi Kinerja Layanan Akademik UPT - Agregasi dari SIAM)
export interface IEkaServiceEvaluation extends Document {
  unitKey: string;               // e.g. "baak", "pusdatin", "perpustakaan", dll
  unitName: string;              // e.g. "UPT. BAAK (Administrasi Akademik)"
  academicYear: string;          // e.g. "2025/2026"
  respondentCount: number;
  speedScore: number;            // Kecepatan layanan (1 - 4)
  courtesyScore: number;         // Keramahan & etika staf (1 - 4)
  facilityScore: number;         // Kualitas fasilitas/sarana (1 - 4)
  transparencyScore: number;     // Transparansi prosedur/SOP (1 - 4)
  averageScore: number;          // Rata-rata skor kepuasan (1 - 4)
  satisfactionRate: number;      // Persentase kepuasan (%)
  syncedAt: Date;
}

// 3. Tracer Study (Pelacakan Alumni - Auto supply ke IKU 2)
export interface ITracerStudyResponse extends Document {
  nim: string;
  name: string;
  graduationYear: number;
  prodi: string;
  phone: string;
  email: string;
  status: 'BEKERJA' | 'WIRAUSAHA' | 'STUDI_LANJUT' | 'MENCARI_KERJA';
  waitingTimeMonths: number;     // Waktu tunggu mendapatkan pekerjaan pertama
  fieldAlignment: 'TINGGI' | 'SEDANG' | 'RENDAH';
  monthlySalary?: number;
  companyName?: string;
  jobTitle?: string;
  createdAt: Date;
}

// 4. Survei Kepuasan Pengguna Lulusan (Mitra / Atasan Alumni di Industri)
export interface IEmployerSurveyResponse extends Document {
  companyName: string;
  evaluatorName: string;
  evaluatorPosition: string;
  alumniName: string;
  ethicsScore: number;           // Integritas & Etika (1 - 4)
  expertiseScore: number;        // Keahlian bidang manajemen (1 - 4)
  englishScore: number;          // Kemampuan bahasa asing (1 - 4)
  itSkillScore: number;          // Penggunaan teknologi informasi (1 - 4)
  communicationScore: number;    // Kemampuan komunikasi (1 - 4)
  teamworkScore: number;         // Kerjasama tim (1 - 4)
  selfDevelopmentScore: number;  // Pengembangan diri (1 - 4)
  averageScore: number;
  feedbackNotes?: string;
  createdAt: Date;
}

// Schemas
const EdoLecturerEvaluationSchema = new Schema<IEdoLecturerEvaluation>(
  {
    nidn: { type: String, required: true },
    lecturerName: { type: String, required: true },
    courseName: { type: String, required: true },
    courseCode: { type: String, required: true },
    academicYear: { type: String, required: true },
    semester: { type: String, enum: ['Ganjil', 'Genap'], required: true },
    respondentCount: { type: Number, required: true },
    pedagogicScore: { type: Number, required: true },
    professionalScore: { type: Number, required: true },
    personalityScore: { type: Number, required: true },
    socialScore: { type: Number, required: true },
    ikdScore: { type: Number, required: true },
    predicate: { type: String, enum: ['Sangat Baik', 'Baik', 'Cukup', 'Kurang'], required: true },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const EkaServiceEvaluationSchema = new Schema<IEkaServiceEvaluation>(
  {
    unitKey: { type: String, required: true },
    unitName: { type: String, required: true },
    academicYear: { type: String, required: true },
    respondentCount: { type: Number, required: true },
    speedScore: { type: Number, required: true },
    courtesyScore: { type: Number, required: true },
    facilityScore: { type: Number, required: true },
    transparencyScore: { type: Number, required: true },
    averageScore: { type: Number, required: true },
    satisfactionRate: { type: Number, required: true },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const TracerStudyResponseSchema = new Schema<ITracerStudyResponse>(
  {
    nim: { type: String, required: true },
    name: { type: String, required: true },
    graduationYear: { type: Number, required: true },
    prodi: { type: String, required: true, default: 'S1 Manajemen' },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    status: {
      type: String,
      enum: ['BEKERJA', 'WIRAUSAHA', 'STUDI_LANJUT', 'MENCARI_KERJA'],
      required: true,
    },
    waitingTimeMonths: { type: Number, required: true },
    fieldAlignment: { type: String, enum: ['TINGGI', 'SEDANG', 'RENDAH'], required: true },
    monthlySalary: { type: Number },
    companyName: { type: String },
    jobTitle: { type: String },
  },
  { timestamps: true }
);

const EmployerSurveyResponseSchema = new Schema<IEmployerSurveyResponse>(
  {
    companyName: { type: String, required: true },
    evaluatorName: { type: String, required: true },
    evaluatorPosition: { type: String, required: true },
    alumniName: { type: String, required: true },
    ethicsScore: { type: Number, required: true },
    expertiseScore: { type: Number, required: true },
    englishScore: { type: Number, required: true },
    itSkillScore: { type: Number, required: true },
    communicationScore: { type: Number, required: true },
    teamworkScore: { type: Number, required: true },
    selfDevelopmentScore: { type: Number, required: true },
    averageScore: { type: Number, required: true },
    feedbackNotes: { type: String },
  },
  { timestamps: true }
);

export const EdoLecturerEvaluation: Model<IEdoLecturerEvaluation> =
  mongoose.models.EdoLecturerEvaluation ||
  mongoose.model<IEdoLecturerEvaluation>('EdoLecturerEvaluation', EdoLecturerEvaluationSchema);

export const EkaServiceEvaluation: Model<IEkaServiceEvaluation> =
  mongoose.models.EkaServiceEvaluation ||
  mongoose.model<IEkaServiceEvaluation>('EkaServiceEvaluation', EkaServiceEvaluationSchema);

export const TracerStudyResponse: Model<ITracerStudyResponse> =
  mongoose.models.TracerStudyResponse ||
  mongoose.model<ITracerStudyResponse>('TracerStudyResponse', TracerStudyResponseSchema);

export const EmployerSurveyResponse: Model<IEmployerSurveyResponse> =
  mongoose.models.EmployerSurveyResponse ||
  mongoose.model<IEmployerSurveyResponse>('EmployerSurveyResponse', EmployerSurveyResponseSchema);
