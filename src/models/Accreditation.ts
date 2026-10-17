import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Profil Akreditasi (Institusi & Program Studi)
export interface IAccreditationProfile extends Document {
  entityType: 'INSTITUSI' | 'PRODI';
  name: string;               // e.g. "STIMI YAPMI Makassar", "Program Studi S1 Manajemen", "Program Studi S2 Manajemen"
  degreeLevel?: string;       // "S1", "S2", "Institusi"
  agency: 'BAN-PT' | 'LAMEMBA';
  grade: 'UNGGUL' | 'BAIK_SEKALI' | 'BAIK' | 'TERAKREDITASI' | 'AKREDITASI_SEMENTARA' | 'BELUM_TERAKREDITASI';
  skNumber: string;           // e.g. "SK LAMEMBA No. 128/DE/A.1/AR.8/VII/2023"
  validFrom: Date;
  validUntil: Date;
  certificateUrl?: string;
  skDocUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Kriteria LAMEMBA Edisi 2026 (5 Kriteria SN-Dikti & 29 Indikator)
export interface ILamembaCriteria extends Document {
  code: string;               // "K.1", "K.2", ..., "K.5" (atau "C.1".."C.9" legacy)
  name: string;               // e.g. "Tata Pamong dan Tata Kelola", "Pendidikan dan Pengajaran"
  weight: number;             // Bobot persentase (e.g. 15, 30, 15, 25, 15)
  score: number;              // Skor capaian (0-100)
  targetScore: number;        // Target minimum (e.g. 85 untuk Unggul)
  status: 'UNGGUL' | 'BAIK_SEKALI' | 'BAIK' | 'PERLU_PERBAIKAN';
  description: string;
  strengths: string[];
  recommendations: string[];
  updatedAt: Date;
}

// 3. Instrumen Pemantauan & Evaluasi Tahunan Wajib Lampiran DL-05 LAMEMBA (Peraturan No. 2 Tahun 2025)
export interface ILamembaDl05AnnualLetter {
  yearIndex: number;           // 0: Baseline, 1: Thn 1, 2: Thn 2, 3: Thn 3, 4: Thn 4
  yearLabel: string;           // "Tahun Ke-0 (Baseline)", "Tahun Ke-1", dst.
  letterNumber: string;        // Nomor surat keputusan/rekomendasi
  letterDate: string;          // Tanggal surat
  fileUrl?: string;            // URL PDF yang diunggah
  fileName?: string;           // Nama file PDF
  uploadedAt?: Date;
  notes?: string;
}

export interface ILamembaDl05LearningItem {
  nomor: number;
  indikator: string;
  upayaTahun1: string;
  hasilTahun1: string;
  upayaTahun2: string;
  hasilTahun2: string;
  upayaTahun3: string;
  hasilTahun3: string;
  upayaTahun4: string;
  hasilTahun4: string;
}

export interface ILamembaDl05FacultyItem {
  name: string;
  status: 'Tetap' | 'Tidak Tetap';
  nidn: string;
  jabatanAkademik: string;
  jalur: 'Akademisi' | 'Praktisi';
  namaPerusahaan?: string;
  catatan?: string;
  isChange: boolean;
  isKeluar?: boolean;
}

export interface ILamembaDl05EwmpItem {
  name: string;
  psAkreditasiSks: number;
  psLainDalamPtSks: number;
  psLainLuarPtSks: number;
  penelitianSks: number;
  pkmSks: number;
  tugasTambahanSks: number;
  totalSks: number;
  avgSemesterSks: number;
  isChange: boolean;
}

export interface ILamembaDl05IntellectualItem {
  name: string;
  rekognisiPendidikan: string;
  rekognisiPraktik: string;
  rekognisiPenelitian: string;
  rekognisiSosial: string;
  isChange: boolean;
}

export interface ILamembaDl05StudentItem {
  semester: 'Ganjil' | 'Genap';
  mhsAktif: number;
  mhsPdDikti: number;
  selisih: number;
  isChange: boolean;
}

// Bab I: Tindak Lanjut Rekomendasi Asesor (Tabel 1.1)
export interface ILamembaDl05AssessorFollowUp {
  recommendationNo?: number;
  recommendation: string;
  yearIndex: number;           // 1 s.d 4
  actionTaken: string;        // Usaha yang dilakukan
  obstacle?: string;          // Hambatan
  cqiSolution: string;        // Solusi atas hambatan
  achievement: string;        // Hasil
  status: 'SELESAI' | 'SEDANG_BERJALAN' | 'BELUM';
  evidenceUrl?: string;
}

// Bab II: Kemajuan Implementasi Strategi Renstra (Tabel 2.1)
export interface ILamembaDl05RenstraItem {
  yearIndex: number;           // 1 s.d 4
  strategy: string;           // Sasaran Strategi Renstra
  actionTaken: string;        // Implementasi Strategi
  obstacle?: string;          // Hambatan
  cqiSolution: string;        // Solusi atas hambatan
  achievement: string;        // Hasil
}

// Bab III.2: Profil Dosen Berdasarkan Latar Belakang Keahlian (Tabel 3.2.3)
export interface ILamembaDl05FacultyExpertiseItem {
  name: string;
  magister: string;           // Magister S2
  doktor?: string;            // Doktor S3
  bidangKeahlian: string;     // Bidang Keahlian
  serdos?: string;            // Nomor Sertifikat Pendidik Profesional
  sertifikatProfesi?: string; // Sertifikat Kompetensi/Profesi BNSP/Industri
  isChange: boolean;
}

// Bab III.3: Luaran Penelitian dan PkM Dosen (Tabel 3.3.1 s.d 3.3.3)
export interface ILamembaDl05ResearchOutcomeItem {
  judul: string;
  tahun: number;
  jenisLuaran: string; // HKI: Paten/Hak Cipta, Buku ber-ISBN, Book Chapter, Publikasi Ilmiah
  sumberBiayaPtMandiri: number;
  sumberBiayaLuarPt: number;
  sumberBiayaLuarNegeri: number;
  publikasiTidakTerakreditasi: number;
  publikasiNasionalTerakreditasi: number; // SINTA
  publikasiInternasional: number;
  publikasiInternasionalBereputasi: number; // Scopus/WoS
  seminarWilayah: number;
  seminarNasional: number;
  seminarInternasional: number;
  tulisanMediaWilayah: number;
  tulisanMediaNasional: number;
  tulisanMediaInternasional: number;
  pagelaranWilayah: number;
  pagelaranNasional: number;
  pagelaranInternasional: number;
  isChange: boolean;
}

// Bab III.3: Sitasi Dosen (Tabel 3.3.5)
export interface ILamembaDl05CitationItem {
  judulArtikel: string;
  tahunTerbit: number;
  penulis: string;
  jenisPublikasi: string;
  sitasiTs2: number;
  sitasiTs1: number;
  sitasiTs: number;
  linkArtikel: string;
  isChange: boolean;
}

// Bab III.3: Luaran yang Dihasilkan Mahasiswa (Tabel 3.3.7)
export interface ILamembaDl05StudentOutcomeItem {
  judulLuaran: string;
  tahun: number;
  namaMahasiswa: string;
  jenisLuaran: string;
  buktiLuaran: string;
  isChange: boolean;
}

// Identitas Pengusul Dokumen (Sesuai Halaman Depan LAMEMBA)
export interface ILamembaDl05IdentitasPengusul {
  perguruanTinggi?: string;
  unitPengelola?: string;
  jenisProgram?: string;
  namaProdi?: string;
  alamat?: string;
  telepon?: string;
  emailWeb?: string;
  nomorSkPendirianPt?: string;
  tanggalSkPendirianPt?: string;
  pejabatSkPendirianPt?: string;
  nomorSkPembukaanPs?: string;
  tanggalSkPembukaanPs?: string;
  pejabatSkPembukaanPs?: string;
  tahunPertamaMenerimaMhs?: string;
  peringkatAkreditasiTerbaru?: string;
  nomorSkLam?: string;
  tanggalKadaluarsa?: string;
  kota?: string;
  tahunDokumen?: string;
  logoUrl?: string;
}

// Tim Penyusun Evaluasi Diri (6 Orang)
export interface ILamembaDl05TimPenyusunItem {
  nama: string;
  nikNidn: string;
  jabatan: string;
  peran: string;
}

// Lembar Pengesahan Resmi 3 Pihak Dokumen DL-05
export interface ILamembaDl05LembarPengesahanPihak {
  jabatan: string;
  nama: string;
  nikNidn: string;
}

export interface ILamembaDl05LembarPengesahan {
  kota?: string;
  tanggal?: string;
  kaprodi?: ILamembaDl05LembarPengesahanPihak;
  ketuaLpm?: ILamembaDl05LembarPengesahanPihak;
  ketuaPt?: ILamembaDl05LembarPengesahanPihak;
}

export interface ILamembaDl05 extends Document {
  academicYear: string;       // e.g. "2025/2026"
  prodiName: string;          // "Program Studi S1 Manajemen"
  submissionDate: Date;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  selectedYearIndex: number;  // 0, 1, 2, 3, 4
  
  // Koleksi Wajib: 1 Surat Rekomendasi/Keputusan Resmi LAMEMBA per Tahun (Tahun 0 s.d 4)
  annualLetters: ILamembaDl05AnnualLetter[];

  // Sub-Tab 1: Rekomendasi Asesor & Renstra (Bab I & II)
  assessorFollowUpsList: ILamembaDl05AssessorFollowUp[];
  renstraProgressList: ILamembaDl05RenstraItem[];

  // Sub-Tab 2: Jaminan Pembelajaran & SDM Dosen (Bab III.1 & III.2)
  learningAssuranceItems: ILamembaDl05LearningItem[];
  perbaikanBerkelanjutanJaminanPembelajaran?: string;

  dosenProfiles: ILamembaDl05FacultyItem[];
  dosenExpertise: ILamembaDl05FacultyExpertiseItem[];
  kontribusiIntelektualDosen: ILamembaDl05IntellectualItem[];
  ewmpList: ILamembaDl05EwmpItem[];
  perbaikanBerkelanjutanDosen?: string;

  // Sub-Tab 3: Tridharma, Riset, Sitasi, Mahasiswa & PD-Dikti (Bab III.3)
  researchOutcomes: ILamembaDl05ResearchOutcomeItem[];
  citationsList: ILamembaDl05CitationItem[];
  studentOutcomes: ILamembaDl05StudentOutcomeItem[];
  mahasiswaAktifList: ILamembaDl05StudentItem[];
  perbaikanBerkelanjutanTridharma?: string;
  perbaikanBerkelanjutanKemahasiswaan?: string;

  // Sub-Tab 4: Sampul, Identitas, Kata Pengantar, Narasi & Penutup
  identitasPengusul?: ILamembaDl05IdentitasPengusul;
  timPenyusun: ILamembaDl05TimPenyusunItem[];
  lembarPengesahan?: ILamembaDl05LembarPengesahan;
  kataPengantar?: string;
  narasiBab1?: string;
  narasiBab2?: string;
  narasiBab3?: string;
  narasiBab31?: string;
  narasiBab32?: string;
  narasiBab33?: string;
  penutup?: string;

  // Legacy fallback fields for backward compatibility
  assessorFollowUps: Array<{
    recommendation: string;
    actionTaken: string;
    status: 'SELESAI' | 'SEDANG_BERJALAN' | 'BELUM';
    evidenceUrl?: string;
  }>;
  renstraProgress: Array<{
    targetName: string;
    achievement: string;
    obstacle: string;
    cqiSolution: string;
  }>;
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
      enum: ['UNGGUL', 'BAIK_SEKALI', 'BAIK', 'TERAKREDITASI', 'AKREDITASI_SEMENTARA', 'BELUM_TERAKREDITASI'],
      required: true,
    },
    skNumber: { type: String, required: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    certificateUrl: { type: String },
    skDocUrl: { type: String },
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
    selectedYearIndex: { type: Number, default: 1 },

    // Koleksi Wajib 1 Surat Rekomendasi/Keputusan Resmi LAMEMBA per Tahun (Tahun 0 s.d 4)
    annualLetters: [
      {
        yearIndex: { type: Number, required: true },
        yearLabel: { type: String, required: true },
        letterNumber: { type: String, default: '' },
        letterDate: { type: String, default: '' },
        fileUrl: { type: String },
        fileName: { type: String },
        uploadedAt: { type: Date },
        notes: { type: String },
      },
    ],

    // Sub-Tab 1: Rekomendasi Asesor & Renstra (Bab I & II)
    assessorFollowUpsList: [
      {
        recommendationNo: { type: Number },
        recommendation: { type: String, required: true },
        yearIndex: { type: Number, required: true },
        actionTaken: { type: String, default: '' },
        obstacle: { type: String, default: '' },
        cqiSolution: { type: String, default: '' },
        achievement: { type: String, default: '' },
        status: { type: String, enum: ['SELESAI', 'SEDANG_BERJALAN', 'BELUM'], default: 'SEDANG_BERJALAN' },
        evidenceUrl: { type: String },
      },
    ],
    renstraProgressList: [
      {
        yearIndex: { type: Number, required: true },
        strategy: { type: String, required: true },
        actionTaken: { type: String, default: '' },
        obstacle: { type: String, default: '' },
        cqiSolution: { type: String, default: '' },
        achievement: { type: String, default: '' },
      },
    ],

    // Sub-Tab 2: Jaminan Pembelajaran (Tabel 3.1.1)
    learningAssuranceItems: [
      {
        nomor: { type: Number, required: true },
        indikator: { type: String, required: true },
        upayaTahun1: { type: String, default: '' },
        hasilTahun1: { type: String, default: '' },
        upayaTahun2: { type: String, default: '' },
        hasilTahun2: { type: String, default: '' },
        upayaTahun3: { type: String, default: '' },
        hasilTahun3: { type: String, default: '' },
        upayaTahun4: { type: String, default: '' },
        hasilTahun4: { type: String, default: '' },
      },
    ],
    perbaikanBerkelanjutanJaminanPembelajaran: { type: String, default: '' },

    // Sub-Tab 2: SDM Dosen (Tabel 3.2.1, 3.2.3, 3.2.5, 3.2.7)
    dosenProfiles: [
      {
        name: { type: String, required: true },
        status: { type: String, enum: ['Tetap', 'Tidak Tetap'], default: 'Tetap' },
        nidn: { type: String, default: '' },
        jabatanAkademik: { type: String, default: 'Lektor' },
        jalur: { type: String, enum: ['Akademisi', 'Praktisi'], default: 'Akademisi' },
        namaPerusahaan: { type: String, default: '' },
        catatan: { type: String, default: '' },
        isChange: { type: Boolean, default: false },
        isKeluar: { type: Boolean, default: false },
      },
    ],
    dosenExpertise: [
      {
        name: { type: String, required: true },
        magister: { type: String, default: '' },
        doktor: { type: String, default: '' },
        bidangKeahlian: { type: String, default: '' },
        serdos: { type: String, default: '' },
        sertifikatProfesi: { type: String, default: '' },
        isChange: { type: Boolean, default: false },
      },
    ],
    kontribusiIntelektualDosen: [
      {
        name: { type: String, required: true },
        rekognisiPendidikan: { type: String, default: '' },
        rekognisiPraktik: { type: String, default: '' },
        rekognisiPenelitian: { type: String, default: '' },
        rekognisiSosial: { type: String, default: '' },
        isChange: { type: Boolean, default: false },
      },
    ],
    ewmpList: [
      {
        name: { type: String, required: true },
        psAkreditasiSks: { type: Number, default: 0 },
        psLainDalamPtSks: { type: Number, default: 0 },
        psLainLuarPtSks: { type: Number, default: 0 },
        penelitianSks: { type: Number, default: 0 },
        pkmSks: { type: Number, default: 0 },
        tugasTambahanSks: { type: Number, default: 0 },
        totalSks: { type: Number, default: 0 },
        avgSemesterSks: { type: Number, default: 0 },
        isChange: { type: Boolean, default: false },
      },
    ],
    perbaikanBerkelanjutanDosen: { type: String, default: '' },

    // Sub-Tab 3: Tridharma, Riset, Sitasi, Mahasiswa & PD-Dikti (Bab III.3)
    researchOutcomes: [
      {
        judul: { type: String, required: true },
        tahun: { type: Number, default: 2024 },
        jenisLuaran: { type: String, default: 'Jurnal Ilmiah' },
        sumberBiayaPtMandiri: { type: Number, default: 0 },
        sumberBiayaLuarPt: { type: Number, default: 0 },
        sumberBiayaLuarNegeri: { type: Number, default: 0 },
        publikasiTidakTerakreditasi: { type: Number, default: 0 },
        publikasiNasionalTerakreditasi: { type: Number, default: 0 },
        publikasiInternasional: { type: Number, default: 0 },
        publikasiInternasionalBereputasi: { type: Number, default: 0 },
        seminarWilayah: { type: Number, default: 0 },
        seminarNasional: { type: Number, default: 0 },
        seminarInternasional: { type: Number, default: 0 },
        tulisanMediaWilayah: { type: Number, default: 0 },
        tulisanMediaNasional: { type: Number, default: 0 },
        tulisanMediaInternasional: { type: Number, default: 0 },
        pagelaranWilayah: { type: Number, default: 0 },
        pagelaranNasional: { type: Number, default: 0 },
        pagelaranInternasional: { type: Number, default: 0 },
        isChange: { type: Boolean, default: false },
      },
    ],
    citationsList: [
      {
        judulArtikel: { type: String, required: true },
        tahunTerbit: { type: Number, default: 2023 },
        penulis: { type: String, default: '' },
        jenisPublikasi: { type: String, default: 'Jurnal Nasional' },
        sitasiTs2: { type: Number, default: 0 },
        sitasiTs1: { type: Number, default: 0 },
        sitasiTs: { type: Number, default: 0 },
        linkArtikel: { type: String, default: '' },
        isChange: { type: Boolean, default: false },
      },
    ],
    studentOutcomes: [
      {
        judulLuaran: { type: String, required: true },
        tahun: { type: Number, default: 2024 },
        namaMahasiswa: { type: String, default: '' },
        jenisLuaran: { type: String, default: 'Karya Ilmiah / Prestasi' },
        buktiLuaran: { type: String, default: '' },
        isChange: { type: Boolean, default: false },
      },
    ],
    mahasiswaAktifList: [
      {
        semester: { type: String, enum: ['Ganjil', 'Genap'], required: true },
        mhsAktif: { type: Number, default: 0 },
        mhsPdDikti: { type: Number, default: 0 },
        selisih: { type: Number, default: 0 },
        isChange: { type: Boolean, default: false },
      },
    ],
    perbaikanBerkelanjutanTridharma: { type: String, default: '' },
    perbaikanBerkelanjutanKemahasiswaan: { type: String, default: '' },

    // Sub-Tab 4: Sampul, Identitas, Kata Pengantar, Narasi & Penutup
    identitasPengusul: {
      perguruanTinggi: { type: String, default: 'Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar' },
      unitPengelola: { type: String, default: 'Jurusan Manajemen / Sekolah Tinggi Ilmu Manajemen Indonesia' },
      jenisProgram: { type: String, default: 'Sarjana (S1)' },
      namaProdi: { type: String, default: 'Program Studi Sarjana Manajemen' },
      alamat: { type: String, default: 'Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan' },
      telepon: { type: String, default: '0411-588123' },
      emailWeb: { type: String, default: 'info@stimiyapmi.ac.id / www.stimiyapmi.ac.id' },
      nomorSkPendirianPt: { type: String, default: 'SK Mendikbud RI No. 042/D/O/1997' },
      tanggalSkPendirianPt: { type: String, default: '1997-07-25' },
      pejabatSkPendirianPt: { type: String, default: 'Menteri Pendidikan dan Kebudayaan RI' },
      nomorSkPembukaanPs: { type: String, default: 'SK Dirjen Dikti No. 219/DIKTI/Kep/1999' },
      tanggalSkPembukaanPs: { type: String, default: '1999-05-18' },
      pejabatSkPembukaanPs: { type: String, default: 'Direktur Jenderal Pendidikan Tinggi' },
      tahunPertamaMenerimaMhs: { type: String, default: '1998' },
      peringkatAkreditasiTerbaru: { type: String, default: 'Baik Sekali' },
      nomorSkLam: { type: String, default: 'SK LAMEMBA No. 933/DE/A.5/AR.10/XII/2023' },
      tanggalKadaluarsa: { type: String, default: '2028-12-28' },
      kota: { type: String, default: 'Makassar' },
      tahunDokumen: { type: String, default: '2025' },
      logoUrl: { type: String, default: '/logo_stimi.png' },
    },
    timPenyusun: [
      {
        nama: { type: String, required: true },
        nikNidn: { type: String, default: '' },
        jabatan: { type: String, default: '' },
        peran: { type: String, default: '' },
      },
    ],
    lembarPengesahan: {
      kota: { type: String, default: 'Makassar' },
      tanggal: { type: String, default: '15 Januari 2026' },
      kaprodi: {
        jabatan: { type: String, default: 'Ketua Program Studi S1 Manajemen' },
        nama: { type: String, default: 'Drs. H. M. Said, M.Si' },
        nikNidn: { type: String, default: 'NIDN. 0918077501' },
      },
      ketuaLpm: {
        jabatan: { type: String, default: 'Ketua Lembaga Penjaminan Mutu' },
        nama: { type: String, default: 'Dr. Nurul Fadilah, SE., MM' },
        nikNidn: { type: String, default: 'NIDN. 0915088201' },
      },
      ketuaPt: {
        jabatan: { type: String, default: 'Ketua STIMI YAPMI Makassar' },
        nama: { type: String, default: 'Dr. Ibrahim Syah, S.E., M.M.' },
        nikNidn: { type: String, default: 'NIDN. 0920037601' },
      },
    },
    kataPengantar: { type: String, default: '' },
    narasiBab1: { type: String, default: '' },
    narasiBab2: { type: String, default: '' },
    narasiBab3: { type: String, default: '' },
    narasiBab31: { type: String, default: '' },
    narasiBab32: { type: String, default: '' },
    narasiBab33: { type: String, default: '' },
    penutup: { type: String, default: '' },

    // Legacy fields
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
  { timestamps: true, strict: false }
);

// 4. Evaluasi Mandiri IAPT 4.1 BAN-PT (Peraturan No. 35 Tahun 2025)
export interface IIapt41Evaluation extends Document {
  nomor: number;
  kriteria: string;
  cramCategory: 'C' | 'R' | 'A' | 'M';
  status: 'MEMENUHI' | 'BELUM';
  notes?: string;
  updatedBy?: string;
  updatedAt: Date;
}

const Iapt41EvaluationSchema = new Schema<IIapt41Evaluation>(
  {
    nomor: { type: Number, required: true, unique: true },
    kriteria: { type: String, required: true },
    cramCategory: { type: String, enum: ['C', 'R', 'A', 'M'], required: true },
    status: { type: String, enum: ['MEMENUHI', 'BELUM'], default: 'MEMENUHI' },
    notes: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

if (mongoose.models.AccreditationProfile && !mongoose.models.AccreditationProfile.schema.paths['skDocUrl']) {
  delete (mongoose.models as any).AccreditationProfile;
}

export const AccreditationProfile: Model<IAccreditationProfile> =
  (mongoose.models.AccreditationProfile as Model<IAccreditationProfile>) ||
  mongoose.model<IAccreditationProfile>('AccreditationProfile', AccreditationProfileSchema);

export const LamembaCriteria: Model<ILamembaCriteria> =
  mongoose.models.LamembaCriteria ||
  mongoose.model<ILamembaCriteria>('LamembaCriteria', LamembaCriteriaSchema);

if (mongoose.models.LamembaDl05 && !mongoose.models.LamembaDl05.schema.paths['lembarPengesahan']) {
  delete (mongoose.models as any).LamembaDl05;
}

export const LamembaDl05: Model<ILamembaDl05> =
  (mongoose.models.LamembaDl05 as Model<ILamembaDl05>) ||
  mongoose.model<ILamembaDl05>('LamembaDl05', LamembaDl05Schema);

export const Iapt41Evaluation: Model<IIapt41Evaluation> =
  mongoose.models.Iapt41Evaluation ||
  mongoose.model<IIapt41Evaluation>('Iapt41Evaluation', Iapt41EvaluationSchema);

// 5. Dokumen Resmi Laporan Evaluasi Diri (LED) IAPT 4.1 BAN-PT (Peraturan No. 35 Tahun 2025)
export interface IIapt41LedIdentitasPt {
  perguruanTinggi: string;
  badanPenyelenggara: string;
  nomorSkPendirianPt: string;
  tanggalSkPendirianPt: string;
  pejabatSkPendirianPt: string;
  alamat: string;
  kota: string;
  telepon: string;
  emailWeb: string;
  peringkatAkreditasiTerbaru: string;
  nomorSkBanPt: string;
  tanggalKadaluarsa: string;
  namaPimpinan: string;
  nidnPimpinan: string;
  tahunDokumen: string;
  logoUrl: string;
}

export interface IIapt41LedTimPenyusunItem {
  nama: string;
  nikNidn: string;
  jabatan: string;
  peran: string;
}

export interface IIapt41LedPengesahanPihak {
  jabatan: string;
  nama: string;
  nikNidn: string;
}

export interface IIapt41LedPengesahan {
  kota: string;
  tanggal: string;
  ketuaPt: IIapt41LedPengesahanPihak;
  ketuaYayasan: IIapt41LedPengesahanPihak;
}

export interface IIapt41LedDocument extends Document {
  academicYear: string;
  institutionName: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  submissionDate: Date;
  identitasPt: IIapt41LedIdentitasPt;
  timPenyusun: IIapt41LedTimPenyusunItem[];
  kataPengantar: string;
  ringkasanEksekutif: string;
  narasiKriteriaC: string;
  narasiKriteriaR: string;
  narasiKriteriaA: string;
  narasiKriteriaM: string;
  penutup: string;
  lembarPengesahan: IIapt41LedPengesahan;
  createdAt: Date;
  updatedAt: Date;
}

const Iapt41LedDocumentSchema = new Schema<IIapt41LedDocument>(
  {
    academicYear: { type: String, required: true, default: '2025/2026' },
    institutionName: { type: String, required: true, default: 'STIMI YAPMI Makassar' },
    status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED'], default: 'SUBMITTED' },
    submissionDate: { type: Date, default: Date.now },
    identitasPt: {
      perguruanTinggi: { type: String, default: 'Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar' },
      badanPenyelenggara: { type: String, default: 'Yayasan Pembangunan Manajemen Indonesia (YAPMI) Makassar' },
      nomorSkPendirianPt: { type: String, default: 'SK Mendikbud RI No. 042/D/O/1997' },
      tanggalSkPendirianPt: { type: String, default: '1997-07-25' },
      pejabatSkPendirianPt: { type: String, default: 'Menteri Pendidikan dan Kebudayaan RI' },
      alamat: { type: String, default: 'Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan 90245' },
      kota: { type: String, default: 'Makassar' },
      telepon: { type: String, default: '(0411) 588123' },
      emailWeb: { type: String, default: 'info@stimiyapmi.ac.id / https://stimiyapmi.ac.id' },
      peringkatAkreditasiTerbaru: { type: String, default: 'Baik' },
      nomorSkBanPt: { type: String, default: 'SK BAN-PT No. 1024/SK/BAN-PT/Ak-PPJ/PT/XII/2021' },
      tanggalKadaluarsa: { type: String, default: '2026-12-22' },
      namaPimpinan: { type: String, default: 'Dr. Ibrahim Syah, S.E., M.M.' },
      nidnPimpinan: { type: String, default: 'NIDN. 0920037601' },
      tahunDokumen: { type: String, default: '2025' },
      logoUrl: { type: String, default: '/logo_stimi.png' },
    },
    timPenyusun: [
      {
        nama: { type: String, default: '' },
        nikNidn: { type: String, default: '' },
        jabatan: { type: String, default: '' },
        peran: { type: String, default: '' },
      },
    ],
    kataPengantar: { type: String, default: '' },
    ringkasanEksekutif: { type: String, default: '' },
    narasiKriteriaC: { type: String, default: '' },
    narasiKriteriaR: { type: String, default: '' },
    narasiKriteriaA: { type: String, default: '' },
    narasiKriteriaM: { type: String, default: '' },
    penutup: { type: String, default: '' },
    lembarPengesahan: {
      kota: { type: String, default: 'Makassar' },
      tanggal: { type: String, default: '15 Januari 2026' },
      ketuaPt: {
        jabatan: { type: String, default: 'Ketua STIMI YAPMI Makassar' },
        nama: { type: String, default: 'Dr. Ibrahim Syah, S.E., M.M.' },
        nikNidn: { type: String, default: 'NIDN. 0920037601' },
      },
      ketuaYayasan: {
        jabatan: { type: String, default: 'Ketua Yayasan Pembangunan Manajemen Indonesia (YAPMI)' },
        nama: { type: String, default: 'H. M. Yasin Limpo, SE' },
        nikNidn: { type: String, default: 'Ketua Pengurus Yayasan' },
      },
    },
  },
  { timestamps: true }
);

if (mongoose.models.Iapt41LedDocument) {
  delete (mongoose.models as any).Iapt41LedDocument;
}

export const Iapt41LedDocument: Model<IIapt41LedDocument> =
  (mongoose.models.Iapt41LedDocument as Model<IIapt41LedDocument>) ||
  mongoose.model<IIapt41LedDocument>('Iapt41LedDocument', Iapt41LedDocumentSchema);


// 5. Bukti Fisik Digital Mandiri per Kriteria Akreditasi (Renstra, SK, SOTK, MoU, dsb.)
export interface IAccreditationEvidence extends Document {
  targetType: 'PRODI' | 'INSTITUSI';
  criterionCode: string; // e.g. "C.1" .. "C.9" atau "APT-1" .. "APT-39"
  itemKey: string;       // Unique identifier per item checklist
  itemTitle: string;
  evidenceDocName: string;
  fileUrl: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  uploadedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccreditationEvidenceSchema = new Schema<IAccreditationEvidence>(
  {
    targetType: { type: String, enum: ['PRODI', 'INSTITUSI'], required: true },
    criterionCode: { type: String, required: true },
    itemKey: { type: String, required: true },
    itemTitle: { type: String, required: true },
    evidenceDocName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

AccreditationEvidenceSchema.index({ targetType: 1, itemKey: 1 }, { unique: true });

export const AccreditationEvidence: Model<IAccreditationEvidence> =
  mongoose.models.AccreditationEvidence ||
  mongoose.model<IAccreditationEvidence>('AccreditationEvidence', AccreditationEvidenceSchema);

