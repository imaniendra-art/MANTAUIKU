import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISpmiIndikatorKinerja {
  name: string;
  jenis: 'UTAMA' | 'TAMBAHAN' | 'PELAMPAUAN';
}

export interface ISpmiCaraPengukuran {
  rumus: string;
  sumberData: string; // e.g. "SIAKAD, PDDikti, LMS, Survei"
  periodeUkur: string; // e.g. "Semesteran", "Tahunan", "Tengah Semester"
  pihakPengukur: string; // e.g. "Kaprodi", "LPM", "Auditor Internal"
}

export interface ISpmiStandardItem {
  // 1. Identitas Standar
  code: string; // e.g. "SPMI-STD/01" / "STD-DIK-01"
  name: string; // e.g. "Standar Kompetensi Lulusan (CPL) Berbasis OBE"
  kelompok: 'LUARAN' | 'PROSES' | 'MASUKAN' | 'TATA_KELOLA';
  bidang: 'PENDIDIKAN' | 'PENELITIAN' | 'PKM' | 'STANDAR_TAMBAHAN';
  category: 'PENDIDIKAN' | 'PENELITIAN' | 'PENGABDIAN' | 'TATA_PAMONG' | 'SDM_SARPRAS_KEUANGAN' | 'STANDAR_TAMBAHAN';
  version: string; // e.g. "01", "Rev 02"
  tanggalPenetapan: string;
  tanggalBerlaku: string;
  responsibleUnit: string; // Unit pelaksana/penanggung jawab

  // 2. Rasional Standar
  rasional: string; // Mengapa standar diperlukan, kaitan SN-Dikti, visi-misi, bentuk pelampauan

  // 3. Pihak yang Bertanggung Jawab (RACI)
  pihakBertanggungJawab: string; // e.g. "Ketua (A), Waket I (C), Kaprodi (R), Dosen (C)"

  // 4. Definisi Istilah
  definisiIstilah: string;

  // 5. Pernyataan Isi Standar (Formula ABCD: Audience, Behaviour, Condition, Degree)
  statement: string;

  // 6. Indikator Kinerja (Utama, Tambahan, Pelampauan)
  indicators: string[]; // List ringkas string
  indikatorKinerja: ISpmiIndikatorKinerja[];

  // 7. Target Mutu (Spesifik, Terukur, Realistis Menantang, Berbatas Waktu, Baseline)
  targetValue: string;

  // 8. Strategi Pencapaian
  strategies: string[];

  // 9. Alokasi Sumber Daya
  sumberDaya: string; // SDM, Anggaran, Sarpras, TI

  // 10. Cara Pengukuran
  caraPengukuran: ISpmiCaraPengukuran;

  // 11. Bukti / Dokumen Wajib
  buktiDokumen: string[];

  // 12. Alur Siklus PPEPP
  ppeppCycle: {
    penetapanDate: string;
    pelaksanaanNotes: string;
    evaluasiAmiStatus: 'SESUAI' | 'OB' | 'KTS';
    statusPemantauan?: 'HIJAU' | 'KUNING' | 'MERAH' | 'BIRU';
    pengendalianAction: string;
    peningkatanTarget: string;
  };
}

export interface ISpmiFormItem {
  code: string; // e.g. "SPMI-FR/MON-01", "SPMI-FR/RTL-01"
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

export interface ISpmiPengesahanStage {
  jabatan: string;
  nama: string;
  tanggal?: string;
  catatan?: string;
}

export interface ISpmiRiwayatPerubahanItem {
  revisi: string;
  tanggal: string;
  bagianDiubah: string;
  alasan: string;
  pengesah: string;
}

export interface ISpmiLampiranItem {
  nomor: number;
  judul: string;
  konten: string;
}

export interface ISpmiDocument extends Document {
  institutionName: string; // default "STIMI YAPMI Makassar"
  bookType: 'KEBIJAKAN' | 'MANUAL' | 'STANDAR' | 'FORMULIR';
  bookNumber: number; // 1, 2, 3, 4
  title: string;
  code: string; // e.g. "SPMI-K/01", "SPMI-PPEPP/01", "SPMI-STD/01", "SPMI-FR/01"
  version: string; // e.g. "Rev 01 (2026)"
  skNumber: string; // SK Ketua STIMI YAPMI Makassar
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
  kataPengantar?: string;
  lembarPengesahan?: {
    disusun?: ISpmiPengesahanStage;
    diperiksa?: ISpmiPengesahanStage;
    dikendalikan?: ISpmiPengesahanStage;
    dipertimbangkan?: ISpmiPengesahanStage;
    disetujui?: ISpmiPengesahanStage;
    ditetapkan?: ISpmiPengesahanStage;
  };
  riwayatPerubahan?: ISpmiRiwayatPerubahanItem[];
  lampiran?: ISpmiLampiranItem[];
  createdAt: Date;
  updatedAt: Date;
}

const SpmiIndikatorKinerjaSchema = new Schema<ISpmiIndikatorKinerja>(
  {
    name: { type: String, required: true },
    jenis: { type: String, enum: ['UTAMA', 'TAMBAHAN', 'PELAMPAUAN'], default: 'UTAMA' },
  },
  { _id: false }
);

const SpmiCaraPengukuranSchema = new Schema<ISpmiCaraPengukuran>(
  {
    rumus: { type: String, default: '' },
    sumberData: { type: String, default: 'SIAKAD / PDDikti / LMS' },
    periodeUkur: { type: String, default: 'Semesteran' },
    pihakPengukur: { type: String, default: 'Kaprodi & LPM' },
  },
  { _id: false }
);

const SpmiStandardItemSchema = new Schema<ISpmiStandardItem>({
  code: { type: String, required: true },
  name: { type: String, required: true },
  kelompok: { 
    type: String, 
    enum: ['LUARAN', 'PROSES', 'MASUKAN', 'TATA_KELOLA'], 
    default: 'PROSES' 
  },
  bidang: { 
    type: String, 
    enum: ['PENDIDIKAN', 'PENELITIAN', 'PKM', 'STANDAR_TAMBAHAN'], 
    default: 'PENDIDIKAN' 
  },
  category: { 
    type: String, 
    enum: ['PENDIDIKAN', 'PENELITIAN', 'PENGABDIAN', 'TATA_PAMONG', 'SDM_SARPRAS_KEUANGAN', 'STANDAR_TAMBAHAN'],
    default: 'PENDIDIKAN' 
  },
  version: { type: String, default: '01' },
  tanggalPenetapan: { type: String, default: '2025-09-01' },
  tanggalBerlaku: { type: String, default: '2025-09-01' },
  responsibleUnit: { type: String, required: true },
  rasional: { type: String, default: '' },
  pihakBertanggungJawab: { type: String, default: 'Ketua (A), LPM (R), Kaprodi (C)' },
  definisiIstilah: { type: String, default: '' },
  statement: { type: String, required: true },
  indicators: [{ type: String }],
  indikatorKinerja: [SpmiIndikatorKinerjaSchema],
  targetValue: { type: String, required: true },
  strategies: [{ type: String }],
  sumberDaya: { type: String, default: 'SDM Dosen, Anggaran Unit, dan Fasilitas Kampus' },
  caraPengukuran: { type: SpmiCaraPengukuranSchema, default: () => ({}) },
  buktiDokumen: [{ type: String }],
  ppeppCycle: {
    penetapanDate: { type: String, default: '2025-09-01' },
    pelaksanaanNotes: { type: String, default: 'Diterapkan pada seluruh program kerja tahunan unit' },
    evaluasiAmiStatus: { type: String, enum: ['SESUAI', 'OB', 'KTS'], default: 'SESUAI' },
    statusPemantauan: { type: String, enum: ['HIJAU', 'KUNING', 'MERAH', 'BIRU'], default: 'HIJAU' },
    pengendalianAction: { type: String, default: 'Tindak lanjut perbaikan berkala melalui RTM' },
    peningkatanTarget: { type: String, default: 'Peningkatan target mutu pada siklus berikutnya' },
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
    institutionName: { type: String, default: 'STIMI YAPMI Makassar' },
    bookType: { 
      type: String, 
      enum: ['KEBIJAKAN', 'MANUAL', 'STANDAR', 'FORMULIR'], 
      required: true,
      unique: true 
    },
    bookNumber: { type: Number, required: true },
    title: { type: String, required: true },
    code: { type: String, required: true },
    version: { type: String, default: 'Rev 01 (2026)' },
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
    kataPengantar: { type: String, default: '' },
    lembarPengesahan: {
      disusun: {
        jabatan: { type: String, default: 'Tim Ad-Hoc / Sekretaris LPM' },
        nama: { type: String, default: 'Sekretaris LPM STIMI YAPMI Makassar' },
        tanggal: { type: String, default: '2025-08-15' },
      },
      diperiksa: {
        jabatan: { type: String, default: 'Wakil Ketua I (Bidang Akademik & Kerjasama)' },
        nama: { type: String, default: 'Wakil Ketua I STIMI YAPMI Makassar' },
        tanggal: { type: String, default: '2025-08-20' },
      },
      dikendalikan: {
        jabatan: { type: String, default: 'Ketua Lembaga Penjaminan Mutu (LPM)' },
        nama: { type: String, default: 'Ketua LPM STIMI YAPMI Makassar' },
        tanggal: { type: String, default: '2025-08-25' },
      },
      dipertimbangkan: {
        jabatan: { type: String, default: 'Ketua Senat Akademik' },
        nama: { type: String, default: 'Ketua Senat STIMI YAPMI Makassar' },
        tanggal: { type: String, default: '2025-08-28' },
      },
      disetujui: {
        jabatan: { type: String, default: 'Ketua Yayasan YAPMI Makassar' },
        nama: { type: String, default: 'Ketua Yayasan Pembangunan Manajemen Indonesia (YAPMI)' },
        tanggal: { type: String, default: '2025-08-30' },
      },
      ditetapkan: {
        jabatan: { type: String, default: 'Ketua STIMI YAPMI Makassar' },
        nama: { type: String, default: 'Dr. Ibrahim Syah, S.E., M.M.' },
        tanggal: { type: String, default: '2025-09-01' },
      },
    },
    riwayatPerubahan: [
      {
        revisi: { type: String, default: '00' },
        tanggal: { type: String, default: '2025-09-01' },
        bagianDiubah: { type: String, default: 'Penyusunan Perdana Dokumen Kebijakan SPMI' },
        alasan: { type: String, default: 'Pemberlakuan Standar Permendiktisaintek No. 39/2025 jo. No. 10/2026' },
        pengesah: { type: String, default: 'Ketua STIMI YAPMI Makassar' },
      },
    ],
    lampiran: [
      {
        nomor: { type: Number, required: true },
        judul: { type: String, required: true },
        konten: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

export const SpmiDocument: Model<ISpmiDocument> =
  mongoose.models.SpmiDocument ||
  mongoose.model<ISpmiDocument>('SpmiDocument', SpmiDocumentSchema);
