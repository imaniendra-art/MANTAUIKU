/**
 * Master Data & Evaluator Instrumen Akreditasi Unggul (IAU) LAMEMBA (Lampiran 9 / DL-09)
 * Rujukan Resmi: Peraturan LAMEMBA Nomor 1 Tahun 2025 tentang Instrumen Akreditasi
 * Program Studi Ekonomi, Manajemen, Bisnis, dan Akuntansi untuk Status Terakreditasi UNGGUL.
 * 
 * Terdiri dari:
 * - 7 Kriteria
 * - 21 Dimensi
 * - 58 Indikator Evaluasi (Klaster Input: 9, Proses: 20, Output/Outcome: 29)
 * - 3 Pilar Syarat Perlu Terakreditasi Unggul (Tabel 4, 5, 6, 7)
 */

export interface IDl09IndicatorItem {
  id: number;                   // 1 s.d. 58
  code: string;                 // "LAM-U01" s.d. "LAM-U58"
  itemKey: string;              // Unique key slug untuk AccreditationEvidence
  kriteriaCode: 'K.1' | 'K.2' | 'K.3' | 'K.4' | 'K.5' | 'K.6' | 'K.7';
  kriteriaName: string;
  dimension: string;
  statement: string;
  evidenceDoc: string;
  isEnamDimensiKunci: boolean;  // True jika masuk 6 Dimensi Terpilih K2, K4, K6 (Tabel 5 Wajib 100%)
  standardType: 'STANDAR_LAM' | 'SN_DIKTI';
  cluster: 'INPUT' | 'PROSES' | 'OUTPUT_OUTCOME';
}

export interface ISystemSourceData {
  title: string;
  countText: string;
  href: string;
  actionLabel: string;
  badge?: string;
}

export interface IDl09EvaluatedIndicator extends IDl09IndicatorItem {
  verified: boolean;
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string;
  systemSourceData?: ISystemSourceData;
}

export interface IDl09CriterionEnriched {
  code: string;
  name: string;
  weight: number;
  score: number;
  targetScore: number;
  status: 'UNGGUL' | 'BAIK_SEKALI' | 'BAIK' | 'PERLU_PERBAIKAN';
  description: string;
  standardType: 'STANDAR_LAM' | 'SN_DIKTI';
  dimensions: string[];
  indicators: IDl09EvaluatedIndicator[];
  totalIndicators: number;
  verifiedIndicators: number;
  isEnamDimensiKunciPassed: boolean;
  strengths: string[];
  recommendations: string[];
}

export interface IDl09FacultyRequirementCheck {
  item: string;
  rule: string;
  currentValue: string;
  passed: boolean;
  notes: string;
}

export interface IDl09UnggulSummary {
  criteria: IDl09CriterionEnriched[];
  totalIndicators: number;
  verifiedIndicators: number;
  percentage: number;
  finalWeightedScore: number;
  
  // Pilar 1: Pemenuhan 6 Dimensi Terpilih (Kriteria 2, 4, 6 - Tabel 5)
  enamDimensiTerpilih: {
    totalIndicators: number;       // 18 indikator pada 6 dimensi kunci
    verifiedIndicators: number;
    passed: boolean;              // Wajib 100% lolos
    dimensions: Array<{
      name: string;
      kriteriaCode: string;
      total: number;
      verified: number;
      passed: boolean;
    }>;
  };

  // Pilar 2: Pemenuhan 15 Dimensi Lainnya (Tabel 6)
  limabelasDimensiLainnya: {
    totalIndicators: number;       // 40 indikator
    verifiedIndicators: number;
    passed: boolean;
  };

  // Pilar 3: Syarat Perlu Kualifikasi & Luaran Dosen (Program Sarjana S1 - Tabel 7)
  syaratDosenS1: {
    passed: boolean;
    checks: IDl09FacultyRequirementCheck[];
  };

  // Status Akhir Kelayakan Unggul
  isAllPillarsPassed: boolean;
  isScorePassed: boolean;
  isUnggulAchieved: boolean;
  statusBadge: string;
  statusDescription: string;
}

// 58 INDIKATOR RESMI PANDUAN PENILAIAN AKREDITASI UNGGUL LAMEMBA (DL-09)
export const DL09_58_INDIKATORS: IDl09IndicatorItem[] = [
  // ==========================================
  // KRITERIA 1. ORIENTASI STRATEGIS (Standar LAM)
  // Dimensi: Misi, Visi, Tujuan dan Sasaran, Strategi (15 Indikator)
  // ==========================================
  // Dimensi: Misi (No 1 - 4/5)
  {
    id: 1,
    code: 'LAM-U01',
    itemKey: 'dl09-k1-misi-pencapaian',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Misi',
    statement: 'UPPS/PS menunjukkan bukti pencapaian misinya yang sesuai dengan pemangku kepentingan yang dilayani, cakupan layanan yang disediakan, hasil dan kontribusi yang diharapkan berdasar nilai-nilai dan keyakinan yang menjadi landasan moral bagi keputusan, kegiatan, dan kontribusi UPPS/PS.',
    evidenceDoc: 'Laporan Ketercapaian Misi, Statuta/Pedoman Penyelenggaraan, & Profil UPPS/PS',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 2,
    code: 'LAM-U02',
    itemKey: 'dl09-k1-misi-penyusunan',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Misi',
    statement: 'UPPS/PS menunjukkan bukti bahwa misi disusun dan ditetapkan dengan melibatkan pemangku kepentingan.',
    evidenceDoc: 'Dokumen SK Penetapan Misi, Notulen, & Daftar Hadir Penyusunan Misi bersama Pemangku Kepentingan',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 3,
    code: 'LAM-U03',
    itemKey: 'dl09-k1-misi-evaluasi-berkala',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Misi',
    statement: 'UPPS/PS menunjukkan bukti bahwa misi ditinjau dan dievaluasi agar tetap relevan dengan kebutuhan pemangku kepentingan pada saat ini dan di masa datang.',
    evidenceDoc: 'Laporan Evaluasi & Reviu Berkala Misi terhadap Perkembangan Kebutuhan Stakeholder',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 4,
    code: 'LAM-U04',
    itemKey: 'dl09-k1-misi-landasan-kebijakan',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Misi',
    statement: 'UPPS/PS menunjukkan bukti bahwa misi telah digunakan sebagai landasan dan pedoman bagi kebijakan, keputusan, kegiatan, hasil, dan kontribusinya.',
    evidenceDoc: 'Dokumen Kebijakan & SK Pelaksanaan Kegiatan/Program Kerja yang Berlandaskan Misi',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 5,
    code: 'LAM-U05',
    itemKey: 'dl09-k1-misi-dampak-berkelanjutan',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Misi',
    statement: 'UPPS/PS menunjukkan bukti bahwa dengan menjalankan misi mereka, UPPS/PS telah secara strategis berkontribusi dan memberikan dampak serta manfaat kepada masyarakat secara berkelanjutan dan beretika.',
    evidenceDoc: 'Portofolio Bukti Dampak Strategis & Kontribusi Berkelanjutan bagi Masyarakat Beretika',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },

  // Dimensi: Visi (No 6 - 10)
  {
    id: 6,
    code: 'LAM-U06',
    itemKey: 'dl09-k1-visi-keselarasan-pt',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Visi',
    statement: 'UPPS/PS menunjukkan bukti pencapaian visi yang selaras dengan visi institusi.',
    evidenceDoc: 'Laporan Capaian IKU Visi & Matriks Keselarasan Visi PS terhadap Visi Perguruan Tinggi',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 7,
    code: 'LAM-U07',
    itemKey: 'dl09-k1-visi-rumusan-kredibel',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Visi',
    statement: 'UPPS/PS merumuskan visi dengan jelas, realistis, kredibel, dan selaras dengan visi institusi.',
    evidenceDoc: 'Naskah Akademik Rumusan Visi yang Jelas, Realistis, Kredibel, & SK Penetapan',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 8,
    code: 'LAM-U08',
    itemKey: 'dl09-k1-visi-standar-kinerja',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Visi',
    statement: 'UPPS/PS menunjukkan bukti bahwa visi mampu menjadi standar kinerja UPPS/PS, dosen, tenaga kependidikan, dan mahasiswa.',
    evidenceDoc: 'Standar Kinerja SPMI & Sasaran Kinerja Terukur yang Menurunkan Visi ke Dosen, Tendik, & Mhs',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 9,
    code: 'LAM-U09',
    itemKey: 'dl09-k1-visi-evaluasi-eksternal',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Visi',
    statement: 'UPPS/PS menunjukkan bukti proses dan hasil evaluasi relevansi visi yang memerhatikan arah perkembangan lingkungan internal dan eksternal dengan melibatkan pemangku kepentingan.',
    evidenceDoc: 'Dokumen Evaluasi Lingkungan Strategis (SWOT/Analisis Pasar) & Keterlibatan Stakeholder',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 10,
    code: 'LAM-U10',
    itemKey: 'dl09-k1-visi-pedoman-kebijakan',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Visi',
    statement: 'UPPS/PS menunjukkan bukti bahwa visi telah digunakan sebagai landasan dan pedoman atas kebijakan, keputusan, kegiatan, hasil, dan kontribusinya.',
    evidenceDoc: 'Rencana Operasional (Renop) & Pedoman Kebijakan yang Menurunkan Visi dalam Operasional Harian',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },

  // Dimensi: Tujuan dan Sasaran (No 11 - 13)
  {
    id: 11,
    code: 'LAM-U11',
    itemKey: 'dl09-k1-tujuan-penurunan-misi',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Tujuan dan Sasaran',
    statement: 'UPPS/PS menunjukkan bukti pencapaian tujuan yang diturunkan dari misi dan visi serta dievaluasi dan ditinjau ulang secara berkala agar relevan dengan kebutuhan pemangku kepentingan, serta selaras dengan arah perkembangan lingkungan internal dan eksternal.',
    evidenceDoc: 'Dokumen Tujuan Strategis UPPS/PS & Laporan Evaluasi Pencapaian Berkala',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 12,
    code: 'LAM-U12',
    itemKey: 'dl09-k1-sasaran-spesifik-waktu',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Tujuan dan Sasaran',
    statement: 'UPPS/PS menunjukkan bukti pencapaian sasaran yang diturunkan dari tujuan dan dinyatakan secara spesifik, yaitu dengan menetapkan ukuran pencapaian, waktu, dan pemangku kepentingan sasaran.',
    evidenceDoc: 'Matriks Sasaran Mutu dengan Indikator Kuantitatif, Target Waktu, & Penanggung Jawab',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 13,
    code: 'LAM-U13',
    itemKey: 'dl09-k1-tingkat-capaian-sasaran',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Tujuan dan Sasaran',
    statement: 'UPPS/PS menunjukkan upaya dan tingkat pencapaian tujuan dan sasaran.',
    evidenceDoc: 'Laporan Capaian Kinerja Sasaran Mutu Tahunan & Analisis Deviasi Target',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },

  // Dimensi: Strategi (No 14 - 16)
  {
    id: 14,
    code: 'LAM-U14',
    itemKey: 'dl09-k1-strategi-manajemen-risiko',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Strategi',
    statement: 'UPPS/PS menunjukkan bukti dalam menjalankan strateginya yang sesuai dengan misi, visi, tujuan dan sasarannya, serta mengintegrasikan manajemen risiko.',
    evidenceDoc: 'Dokumen Renstra UPPS & Register Manajemen Risiko Strategis Terintegrasi',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'PROSES',
  },
  {
    id: 15,
    code: 'LAM-U15',
    itemKey: 'dl09-k1-strategi-pelaksanaan-mitigasi',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Strategi',
    statement: 'UPPS/PS menunjukkan bukti bahwa strategi ditetapkan dan dilaksanakan dengan mengintegrasikan manajemen risiko.',
    evidenceDoc: 'SOP Manajemen Risiko & Laporan Pelaksanaan Mitigasi Risiko Operasional dan Akademik',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'PROSES',
  },
  {
    id: 16,
    code: 'LAM-U16',
    itemKey: 'dl09-k1-strategi-pelibatan-stakeholder',
    kriteriaCode: 'K.1',
    kriteriaName: 'Orientasi Strategis',
    dimension: 'Strategi',
    statement: 'UPPS/PS menunjukkan bukti bahwa perancangan dan pelaksanaan strategi melibatkan pemangku kepentingan dalam mendapatkan, mengembangkan, dan memanfaatkan sumber daya dengan memerhatikan keefektifan dan efisiensi.',
    evidenceDoc: 'Dokumen Berita Acara Pelibatan Pemangku Kepentingan dalam Alokasi Sumber Daya Efektif & Efisien',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'PROSES',
  },

  // ==========================================
  // KRITERIA 2. TATA PAMONG DAN TATA KELOLA (Standar LAM)
  // Dimensi: Tata Pamong (2), Tata Kelola (3) -> [TERMASUK 6 DIMENSI KUNCI UNGGUL]
  // ==========================================
  // Dimensi: Tata Pamong (No 17 - 18) [DIMENSI KUNCI 1]
  {
    id: 17,
    code: 'LAM-U17',
    itemKey: 'dl09-k2-struktur-tata-pamong',
    kriteriaCode: 'K.2',
    kriteriaName: 'Tata Pamong dan Tata Kelola',
    dimension: 'Tata Pamong',
    statement: 'UPPS/PS menunjukkan struktur dan proses tata pamong.',
    evidenceDoc: 'Statuta, SOTK UPPS/PS, & SK Uraian Tugas Pimpinan / Pengelola Tata Pamong',
    isEnamDimensiKunci: true,
    standardType: 'STANDAR_LAM',
    cluster: 'PROSES',
  },
  {
    id: 18,
    code: 'LAM-U18',
    itemKey: 'dl09-k2-pengawasan-sinergi-vmts',
    kriteriaCode: 'K.2',
    kriteriaName: 'Tata Pamong dan Tata Kelola',
    dimension: 'Tata Pamong',
    statement: 'UPPS/PS menunjukkan bukti dilaksanakannya proses pengawasan, pembentukan sinergi, penyediaan sumber daya, penjagaan, dan penguatan nilai-nilai yang mengacu pada misi dan visi institusi dengan efektif dan efisien.',
    evidenceDoc: 'Laporan Pengawasan Tata Pamong, Pembentukan Sinergi, & Bukti Penguatan Nilai VMTS',
    isEnamDimensiKunci: true,
    standardType: 'STANDAR_LAM',
    cluster: 'PROSES',
  },

  // Dimensi: Tata Kelola (No 19 - 21) [DIMENSI KUNCI 2]
  {
    id: 19,
    code: 'LAM-U19',
    itemKey: 'dl09-k2-pelaksanaan-perencanaan-tata-kelola',
    kriteriaCode: 'K.2',
    kriteriaName: 'Tata Pamong dan Tata Kelola',
    dimension: 'Tata Kelola',
    statement: 'UPPS/PS menunjukkan bukti pelaksanaan perencanaan, pengorganisasian, pengarahan, dan pengendalian usaha untuk mendapatkan, mengembangkan, dan memanfaatkan sumber daya untuk mewujudkan visi, mencapai tujuan dan sasarannya.',
    evidenceDoc: 'RIP, Renstra, Laporan Kinerja Tahunan UPPS, & Bukti Pengendalian Usaha',
    isEnamDimensiKunci: true,
    standardType: 'STANDAR_LAM',
    cluster: 'PROSES',
  },
  {
    id: 20,
    code: 'LAM-U20',
    itemKey: 'dl09-k2-sistem-gug-kode-etik',
    kriteriaCode: 'K.2',
    kriteriaName: 'Tata Pamong dan Tata Kelola',
    dimension: 'Tata Kelola',
    statement: 'UPPS/PS menunjukkan bukti bahwa sistem tata kelola mampu mendorong UPPS/PS menjalankan tugas dan kewajibannya secara efektif, efisien, akuntabel, bertanggung jawab, transparan, adil, dan terhindar dari konflik kepentingan.',
    evidenceDoc: 'Pedoman Good University Governance (GUG), Kode Etik Dosen/Tendik/Mhs, & Survei Kepuasan Stakeholder',
    isEnamDimensiKunci: true,
    standardType: 'STANDAR_LAM',
    cluster: 'PROSES',
  },
  {
    id: 21,
    code: 'LAM-U21',
    itemKey: 'dl09-k2-spmi-ppepp-pembinaan-kampus',
    kriteriaCode: 'K.2',
    kriteriaName: 'Tata Pamong dan Tata Kelola',
    dimension: 'Tata Kelola',
    statement: 'UPPS/PS menjalankan sistem manajemen mutu internal yang diimplementasikan secara konsisten, efektif, dan efisien, serta melaporkan hasil penjaminan mutu secara berkala untuk tindak lanjut peningkatan mutu UPPS dan PS dalam menjalankan Tridharma.',
    evidenceDoc: 'Dokumen SPMI Siklus PPEPP Lengkap, Laporan AMI & RTM, serta Bukti Kerjasama Pembinaan Kampus Kecil',
    isEnamDimensiKunci: true,
    standardType: 'STANDAR_LAM',
    cluster: 'PROSES',
  },

  // ==========================================
  // KRITERIA 3. PENGELOLAAN MAHASISWA (SN-Dikti & Standar LAM)
  // Dimensi: Penerimaan (2), Layanan (2), Kinerja (1), Kesejahteraan (3), Karir (1)
  // ==========================================
  // Dimensi: Penerimaan Mahasiswa (No 22 - 23) [SN-Dikti]
  {
    id: 22,
    code: 'LAM-U22',
    itemKey: 'dl09-k3-pmb-transparan-selaras',
    kriteriaCode: 'K.3',
    kriteriaName: 'Pengelolaan Mahasiswa',
    dimension: 'Penerimaan Mahasiswa',
    statement: 'UPPS/PS menunjukkan bukti bahwa penerimaan mahasiswa dilaksanakan secara transparan dan selaras dengan misi, visi, tujuan dan sasaran, strategi, nilai-nilai dan profil/kompetensi lulusan yang diharapkan.',
    evidenceDoc: 'Pedoman, SK, Brosur, & Laporan Penerimaan Mahasiswa Baru yang Transparan & Selaras Profil Lulusan',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'INPUT',
  },
  {
    id: 23,
    code: 'LAM-U23',
    itemKey: 'dl09-k3-pmb-inklusif-afirmatif',
    kriteriaCode: 'K.3',
    kriteriaName: 'Pengelolaan Mahasiswa',
    dimension: 'Penerimaan Mahasiswa',
    statement: 'UPPS/PS menunjukkan bukti bahwa pelaksanaan dan hasil penerimaan mahasiswa bersifat inklusif, afirmatif, adil, dan mempertimbangkan asas pemerataan.',
    evidenceDoc: 'Kebijakan & Laporan Realisasi Penerimaan Mahasiswa Afirmatif, Inklusif, KIP Kuliah / Beasiswa Pemerataan',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'INPUT',
  },

  // Dimensi: Layanan Akademik Mahasiswa (No 24 - 25) [SN-Dikti]
  {
    id: 24,
    code: 'LAM-U24',
    itemKey: 'dl09-k3-layanan-akademik-ai-lms',
    kriteriaCode: 'K.3',
    kriteriaName: 'Pengelolaan Mahasiswa',
    dimension: 'Layanan Akademik Mahasiswa',
    statement: 'UPPS/PS menunjukkan bukti tingkat penggunaan (partisipasi pengguna) modalitas dan pedagogi (tangible and intangible resources) yang sesuai dengan kompetensi/CPL mahasiswa (tangible and intangible resources, serta penggunaan teknologi dan AI).',
    evidenceDoc: 'Data Log Partisipasi E-Learning LMS, E-Library, Akses Jurnal Internasional, Lab Komputer, & Integrasi AI',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 25,
    code: 'LAM-U25',
    itemKey: 'dl09-k3-layanan-unit-kegiatan-mhs',
    kriteriaCode: 'K.3',
    kriteriaName: 'Pengelolaan Mahasiswa',
    dimension: 'Layanan Akademik Mahasiswa',
    statement: 'UPPS/PS menunjukkan bukti tingkat penggunaan (partisipasi pengguna) fasilitas/dukungan pada kegiatan unit mahasiswa yang selaras dengan misi, visi, tujuan dan sasaran, serta strategi UPPS/PS.',
    evidenceDoc: 'Laporan Partisipasi & Alokasi Fasilitas/Dana pada Unit Kegiatan Mahasiswa (UKM/BEM/HIMA)',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },

  // Dimensi: Kinerja Akademik Mahasiswa (No 26) [Standar LAM]
  {
    id: 26,
    code: 'LAM-U26',
    itemKey: 'dl09-k3-kinerja-ipk-prestasi-emba',
    kriteriaCode: 'K.3',
    kriteriaName: 'Pengelolaan Mahasiswa',
    dimension: 'Kinerja Akademik Mahasiswa',
    statement: 'UPPS/PS menunjukkan bukti kinerja akademik mahasiswa yang selaras dengan tujuan pendidikan Program Studi dan Standar Pendidikan Tinggi UPPS/PS, yang diukur dengan berbagai indikator, antara lain: IPK, masa studi, dan hasil keterlibatan mahasiswa dalam kegiatan yang intrakurikuler maupun ekstrakurikuler yang menunjang pengembangan kompetensi mahasiswa.',
    evidenceDoc: 'Laporan Rata-rata IPK, Masa Studi & Kelulusan Tepat Waktu, Sertifikat Kompetensi, & Prestasi EMBA',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },

  // Dimensi: Kesejahteraan Mahasiswa (No 27 - 29) [Standar LAM]
  {
    id: 27,
    code: 'LAM-U27',
    itemKey: 'dl09-k3-kesejahteraan-kesehatan-mental',
    kriteriaCode: 'K.3',
    kriteriaName: 'Pengelolaan Mahasiswa',
    dimension: 'Kesejahteraan Mahasiswa',
    statement: 'UPPS/PS menunjukkan bukti pemanfaatan layanan kesehatan fisik dan mental serta fasilitas belajar dan proses belajar yang memerhatikan kesejahteraan fisik dan mental mahasiswa.',
    evidenceDoc: 'Dokumen Layanan Poliklinik/Kesehatan Fisik, Konseling Mental Mahasiswa, & Beasiswa',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 28,
    code: 'LAM-U28',
    itemKey: 'dl09-k3-kesejahteraan-fasilitas-k3-difabel',
    kriteriaCode: 'K.3',
    kriteriaName: 'Pengelolaan Mahasiswa',
    dimension: 'Kesejahteraan Mahasiswa',
    statement: 'UPPS/PS menunjukkan bukti pemanfaatan (partisipasi pengguna) fasilitas belajar, olahraga, kesehatan, kesenian, kantin, dan/atau fasilitas lainnya yang sesuai misi, visi, tujuan dan sasaran, serta strategi, yang memenuhi standar kebersihan, kesehatan, keamanan, dan keselamatan, serta memerhatikan kesetaraan gender dan ramah difabel.',
    evidenceDoc: 'Bukti Standar K3 Sarana Kampus, Fasilitas Olahraga/Seni, Kantin Sehat, Akses Difabel & Gender',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 29,
    code: 'LAM-U29',
    itemKey: 'dl09-k3-kesejahteraan-satgas-ppks',
    kriteriaCode: 'K.3',
    kriteriaName: 'Pengelolaan Mahasiswa',
    dimension: 'Kesejahteraan Mahasiswa',
    statement: 'UPPS/PS menunjukkan bukti ketersediaan kebijakan, peraturan, dan tindakan yang menjamin lingkungan belajar terbebas dari berbagai tindak diskriminasi, pelecehan, perundungan, dan kekerasan.',
    evidenceDoc: 'SK Pembentukan Satgas PPKS, Peraturan Pencegahan Diskriminasi/Kekerasan, & Laporan Penanganan Kasus',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'OUTPUT_OUTCOME',
  },

  // Dimensi: Pengembangan Karir Mahasiswa (No 30) [Standar LAM]
  {
    id: 30,
    code: 'LAM-U30',
    itemKey: 'dl09-k3-karir-cdc-magang-permendikbud',
    kriteriaCode: 'K.3',
    kriteriaName: 'Pengelolaan Mahasiswa',
    dimension: 'Pengembangan Karir Mahasiswa',
    statement: 'UPPS/PS menunjukkan bukti memiliki rencana dan melaksanakan program yang mendukung pengembangan karir mahasiswa, yang antara lain, dapat berupa pembekalan bagi mahasiswa untuk memasuki dunia kerja, pelaksanaan bursa kerja, dan penyaluran lulusan.',
    evidenceDoc: 'Dokumen Career Development Center (CDC), Pelatihan Interview/CV/Soft-Skill, Job Fair DUDI, & Magang Permendikbudristek 64/2024',
    isEnamDimensiKunci: false,
    standardType: 'STANDAR_LAM',
    cluster: 'PROSES',
  },

  // ==========================================
  // KRITERIA 4. DOSEN DAN TENAGA KEPENDIDIKAN (SN-Dikti)
  // Dimensi: Kecukupan Dosen (3), Pengelolaan Dosen (3), Kecukupan Tendik (2), Pengelolaan Tendik (2)
  // ==========================================
  // Dimensi: Kecukupan dan Kualifikasi Dosen (No 31 - 33) [DIMENSI KUNCI 3]
  {
    id: 31,
    code: 'LAM-U31',
    itemKey: 'dl09-k4-kualifikasi-kecukupan-dosen-tetap',
    kriteriaCode: 'K.4',
    kriteriaName: 'Dosen dan Tenaga Kependidikan',
    dimension: 'Kecukupan dan Kualifikasi Dosen',
    statement: 'UPPS/PS menunjukkan bukti penetapan dan penggunaan kriteria dalam menentukan kualifikasi dosen untuk mendukung fokus Tridharma dengan memerhatikan SN-Dikti, SAN-Dikti, misi, visi, tujuan dan sasaran, serta strategi UPPS/PS yang berkaitan dengan tingkat pendidikan, jenjang jabatan akademik, bidang keilmuan, kepakaran, dan rekognisi dosen dengan jumlah yang cukup sesuai fokus Tridharma Perguruan Tinggi.',
    evidenceDoc: 'DKPS Tabel 1 & 2: Profil DTPS (Ijazah S2/S3 Linier, SK Jafung Asisten Ahli/Lektor/GB, & Kepakaran EMBA)',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'INPUT',
  },
  {
    id: 32,
    code: 'LAM-U32',
    itemKey: 'dl09-k4-matriks-penugasan-dosen',
    kriteriaCode: 'K.4',
    kriteriaName: 'Dosen dan Tenaga Kependidikan',
    dimension: 'Kecukupan dan Kualifikasi Dosen',
    statement: 'UPPS menunjukkan bukti penggunaan matriks yang menggambarkan rencana dan pelaksanaan penugasan dosen di berbagai PS yang dikelolanya.',
    evidenceDoc: 'Matriks Distribusi & Rencana Penugasan Dosen di Seluruh Program Studi UPPS',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'INPUT',
  },
  {
    id: 33,
    code: 'LAM-U33',
    itemKey: 'dl09-k4-ewmp-beban-kerja-praktisi',
    kriteriaCode: 'K.4',
    kriteriaName: 'Dosen dan Tenaga Kependidikan',
    dimension: 'Kecukupan dan Kualifikasi Dosen',
    statement: 'UPPS/PS menerapkan beban kerja dosen (dosen tetap, dosen tidak tetap/praktisi) yang konsisten dengan fokus Tridharma.',
    evidenceDoc: 'Laporan BKD/EWMP Dosen Tetap & Bukti Dosen Praktisi Mengajar (Rasio Teori:Praktek 50:50)',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'INPUT',
  },

  // Dimensi: Pengelolaan Dosen (No 34 - 36) [DIMENSI KUNCI 4]
  {
    id: 34,
    code: 'LAM-U34',
    itemKey: 'dl09-k4-rekrutmen-pengembangan-dosen',
    kriteriaCode: 'K.4',
    kriteriaName: 'Dosen dan Tenaga Kependidikan',
    dimension: 'Pengelolaan Dosen',
    statement: 'UPPS/PS menunjukkan bukti pelaksanaan rencana rekrutmen dan pengembangan dosen secara terstruktur, dan berkelanjutan, sehingga memiliki dosen dengan jumlah dan kualifikasi sesuai dengan kebutuhan UPPS/PS dan misi, visi, tujuan dan sasaran, serta strategi.',
    evidenceDoc: 'Pedoman & Laporan Realisasi Rekrutmen serta Pengembangan Kompetensi/Studi Lanjut S3 Dosen',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'PROSES',
  },
  {
    id: 35,
    code: 'LAM-U35',
    itemKey: 'dl09-k4-fasilitas-dukungan-rekognisi-emba',
    kriteriaCode: 'K.4',
    kriteriaName: 'Dosen dan Tenaga Kependidikan',
    dimension: 'Pengelolaan Dosen',
    statement: 'UPPS menunjukkan bukti telah memberi dukungan dan fasilitas secara terstruktur dan berkelanjutan kepada dosen untuk memajukan pendidikan, ilmu pengetahuan, praktik profesional, kerjasama/keterlibatan, dan rekognisi di bidang EMBA.',
    evidenceDoc: 'Bukti Bantuan Finansial Riset, Partisipasi Konferensi, Sertifikasi Profesi BNSP/Industri, & Rekognisi EMBA',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'PROSES',
  },
  {
    id: 36,
    code: 'LAM-U36',
    itemKey: 'dl09-k4-evaluasi-kinerja-tridharma-dosen',
    kriteriaCode: 'K.4',
    kriteriaName: 'Dosen dan Tenaga Kependidikan',
    dimension: 'Pengelolaan Dosen',
    statement: 'UPPS/PS menunjukkan bukti pengembangan dosen secara sistematik, terstruktur, dan berkelanjutan dalam bidang pendidikan.',
    evidenceDoc: 'Dokumen Hasil Evaluasi Kinerja Dosen Berkala (EDO Mahasiswa, Peer Review Tridharma, & SK Reward/Punishment)',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'PROSES',
  },

  // Dimensi: Kecukupan dan Kualifikasi Tenaga Kependidikan (No 37 - 38)
  {
    id: 37,
    code: 'LAM-U37',
    itemKey: 'dl09-k4-kualifikasi-kecukupan-tendik',
    kriteriaCode: 'K.4',
    kriteriaName: 'Dosen dan Tenaga Kependidikan',
    dimension: 'Kecukupan dan Kualifikasi Tenaga Kependidikan',
    statement: 'UPPS/PS menunjukkan bukti telah memiliki dan menggunakan kriteria untuk menentukan kualifikasi dan jumlah tenaga kependidikan dengan memerhatikan SN DIKTI untuk mendukung kegiatan UPPS/PS dalam mencapai misi, visi, tujuan dan sasaran, serta strategi.',
    evidenceDoc: 'DKPS Tabel 5: Profil Tenaga Kependidikan (Kualifikasi Akademik & Kecukupan Formasi Layanan Akademik/IT)',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'INPUT',
  },
  {
    id: 38,
    code: 'LAM-U38',
    itemKey: 'dl09-k4-sertifikasi-kompetensi-tendik',
    kriteriaCode: 'K.4',
    kriteriaName: 'Dosen dan Tenaga Kependidikan',
    dimension: 'Kecukupan dan Kualifikasi Tenaga Kependidikan',
    statement: 'UPPS/PS menunjukkan bukti bahwa kualifikasi tenaga kependidikan (pendidikan dan kompetensi) sesuai dengan tugas yang diembannya.',
    evidenceDoc: 'Sertifikat Kompetensi Keahlian Tendik (Laboran IT, Pustakawan, Pengelola SIAKAD, Arsiparis)',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'INPUT',
  },

  // Dimensi: Pengelolaan Tenaga Kependidikan (No 39 - 40)
  {
    id: 39,
    code: 'LAM-U39',
    itemKey: 'dl09-k4-rekrutmen-pelatihan-tendik',
    kriteriaCode: 'K.4',
    kriteriaName: 'Dosen dan Tenaga Kependidikan',
    dimension: 'Pengelolaan Tenaga Kependidikan',
    statement: 'UPPS/PS menunjukkan bukti memiliki dan melaksanakan rencana rekrutmen dan pengembangan tenaga kependidikan secara sistematik, terstruktur, dan berkelanjutan.',
    evidenceDoc: 'Rencana & Laporan Pelaksanaan Rekrutmen serta Pelatihan/Upskilling Tenaga Kependidikan',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'PROSES',
  },
  {
    id: 40,
    code: 'LAM-U40',
    itemKey: 'dl09-k4-abk-jenjang-karir-tendik',
    kriteriaCode: 'K.4',
    kriteriaName: 'Dosen dan Tenaga Kependidikan',
    dimension: 'Pengelolaan Tenaga Kependidikan',
    statement: 'UPPS/PS menunjukkan bukti pengelolaan tenaga kependidikan dalam lingkup perencanaan dan pengembangan yang terstruktur sesuai dengan arah pengembangan UPPS/PS termasuk untuk memenuhi kebutuhan layanan mahasiswa dan mendukung karir serta kinerja tenaga kependidikan.',
    evidenceDoc: 'Analisis Beban Kerja (ABK) Tendik, Pemetaan Jenjang Karir, & Penilaian Kinerja Tendik',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'PROSES',
  },

  // ==========================================
  // KRITERIA 5. KEUANGAN DAN SARANA PRASARANA (SN-Dikti)
  // Dimensi: Keuangan (2), Sarana Prasarana (2)
  // ==========================================
  // Dimensi: Keuangan (No 41 - 42)
  {
    id: 41,
    code: 'LAM-U41',
    itemKey: 'dl09-k5-rkat-realisasi-operasional',
    kriteriaCode: 'K.5',
    kriteriaName: 'Keuangan dan Sarana Prasarana',
    dimension: 'Keuangan',
    statement: 'UPPS/PS menunjukkan bukti telah merencanakan penerimaan dan pengeluaran/pemanfaatan sumber keuangan untuk mendukung, mempertahankan, dan meningkatkan kualitas layanan, terutama yang berkaitan dengan pemenuhan kebutuhan operasional pendidikan, penelitian, dan pengabdian kepada masyarakat serta investasi yang selaras dengan misi, visi, tujuan dan sasaran, serta strategi.',
    evidenceDoc: 'DKPS Tabel 6: Rencana Kerja dan Anggaran Tahunan (RKAT) serta Laporan Realisasi Keuangan TS-2 s.d TS',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'INPUT',
  },
  {
    id: 42,
    code: 'LAM-U42',
    itemKey: 'dl09-k5-keberlanjutan-keuangan-audit',
    kriteriaCode: 'K.5',
    kriteriaName: 'Keuangan dan Sarana Prasarana',
    dimension: 'Keuangan',
    statement: 'UPPS/PS menunjukkan bukti telah melakukan usaha dan menunjukkan hasil-hasilnya untuk menjamin keberlanjutan sumber daya keuangan.',
    evidenceDoc: 'Laporan Audit Keuangan Eksternal Kantor Akuntan Publik (KAP) & Bukti Diversifikasi Dana Mandiri',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'INPUT',
  },

  // Dimensi: Sarana Prasarana (No 43 - 44)
  {
    id: 43,
    code: 'LAM-U43',
    itemKey: 'dl09-k5-masterplan-sarpras-tridharma',
    kriteriaCode: 'K.5',
    kriteriaName: 'Keuangan dan Sarana Prasarana',
    dimension: 'Sarana Prasarana',
    statement: 'UPPS/PS menunjukkan bukti penyediaan dan pengelolaan serta rencana pengembangan sarana dan prasarana yang dapat dimanfaatkan oleh mahasiswa dan dosen untuk kegiatan pendidikan, penelitian, pengabdian kepada masyarakat dan oleh tenaga kependidikan untuk mendukung kegiatan pendidikan, penelitian, dan pengabdian kepada masyarakat.',
    evidenceDoc: 'Daftar Inventaris Sarpras, Ruang Kuliah Multimedia, Laboratorium Komputer/Bisnis, & Masterplan Sarpras',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'PROSES',
  },
  {
    id: 44,
    code: 'LAM-U44',
    itemKey: 'dl09-k5-k3-sarpras-difabel-gender',
    kriteriaCode: 'K.5',
    kriteriaName: 'Keuangan dan Sarana Prasarana',
    dimension: 'Sarana Prasarana',
    statement: 'UPPS/PS menunjukkan bukti bahwa sarana dan prasarana yang memenuhi standar kebersihan, kesehatan, keamanan, dan keselamatan, serta memerhatikan kesetaraan gender dan ramah difabel.',
    evidenceDoc: 'SOP & Bukti Sertifikasi Fasilitas K3, Akses Difabel (Ramp, Toilet Khusus), & Sarana Responsif Gender',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'PROSES',
  },

  // ==========================================
  // KRITERIA 6. PENDIDIKAN DAN PENGAJARAN (SN-Dikti)
  // Dimensi: Kurikulum (4), Jaminan Pembelajaran (3) -> [TERMASUK 6 DIMENSI KUNCI UNGGUL]
  // ==========================================
  // Dimensi: Kurikulum (No 45 - 48) [DIMENSI KUNCI 5]
  {
    id: 45,
    code: 'LAM-U45',
    itemKey: 'dl09-k6-peta-kurikulum-cpl-obe',
    kriteriaCode: 'K.6',
    kriteriaName: 'Pendidikan dan Pengajaran',
    dimension: 'Kurikulum',
    statement: 'UPPS/PS menunjukkan bukti penggunaan peta kurikulum untuk menjamin struktur mata kuliah dan kegiatan pembelajaran konsisten dan relevan dengan kompetensi (CPL) yang diharapkan dan selaras dengan misi, visi, tujuan dan sasaran, serta strategi.',
    evidenceDoc: 'Buku Kurikulum OBE S1 Manajemen, Profil Lulusan, Peta Kurikulum, & Matriks CPL terhadap Mata Kuliah',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'PROSES',
  },
  {
    id: 46,
    code: 'LAM-U46',
    itemKey: 'dl09-k6-rps-case-method-team-project',
    kriteriaCode: 'K.6',
    kriteriaName: 'Pendidikan dan Pengajaran',
    dimension: 'Kurikulum',
    statement: 'UPPS/PS menunjukkan bukti implementasi kurikulum mampu memfasilitasi keterlibatan aktif mahasiswa dalam proses pembelajaran, interaksi produktif antara mahasiswa, dosen, praktisi, dan masyarakat umum untuk mencapai tujuan pembelajaran, dengan memanfaatkan kerjasama dengan mitra yang dievaluasi dan ditindaklanjuti secara berkala agar selaras dengan misi, visi, tujuan, dan sasaran, serta strategi UPPS dan visi keilmuan PS.',
    evidenceDoc: 'Perangkat RPS Berbasis Studi Kasus (Case Method) & Proyek Tim (Team-Based Project) bersama Mitra DUDI',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'PROSES',
  },
  {
    id: 47,
    code: 'LAM-U47',
    itemKey: 'dl09-k6-metode-mutakhir-global-ai',
    kriteriaCode: 'K.6',
    kriteriaName: 'Pendidikan dan Pengajaran',
    dimension: 'Kurikulum',
    statement: 'UPPS/PS menunjukkan bukti penggunaan materi dan metoda pembelajaran yang mutakhir dan relevan dengan kebutuhan EMBA saat ini dan di masa depan, memiliki perspektif global, selaras dengan misi, visi, tujuan dan sasaran, serta strategi untuk mencapai kompetensi (CPL) yang ditetapkan.',
    evidenceDoc: 'Bahan Ajar / Modul Mutakhir Berperspektif Global EMBA, Pemanfaatan Teknologi AI & LMS E-Learning',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'PROSES',
  },
  {
    id: 48,
    code: 'LAM-U48',
    itemKey: 'dl09-k6-reviu-kurikulum-dudi-alumni',
    kriteriaCode: 'K.6',
    kriteriaName: 'Pendidikan dan Pengajaran',
    dimension: 'Kurikulum',
    statement: 'UPPS/PS menunjukkan bukti evaluasi, perbaikan, dan pengembangan kurikulum agar sesuai dan relevan dengan perkembangan ilmu pengetahuan, praktik profesional, dan tantangan di masa yang akan datang dengan melibatkan pemangku kepentingan.',
    evidenceDoc: 'Berita Acara, Notulen, & Daftar Hadir Reviu Kurikulum Berkala bersama Mitra DUDI, Asosiasi Profesi, & Alumni',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'PROSES',
  },

  // Dimensi: Jaminan Pembelajaran (No 49 - 51) [DIMENSI KUNCI 6]
  {
    id: 49,
    code: 'LAM-U49',
    itemKey: 'dl09-k6-asesmen-langsung-rubrik-cpl',
    kriteriaCode: 'K.6',
    kriteriaName: 'Pendidikan dan Pengajaran',
    dimension: 'Jaminan Pembelajaran',
    statement: 'UPPS/PS menunjukkan bukti pengukuran langsung atas ketercapaian kompetensi (CPL) mahasiswa dengan menggunakan pedoman standar pemenuhan capaian pembelajaran (rubrik) dan instrumen yang valid dan handal dengan metode yang relevan dalam mengukur ketercapaian kompetensi (CPL) mahasiswa.',
    evidenceDoc: 'Pedoman Standar & Rubrik Penilaian CPL, Instrumen Asesmen Valid, & Portofolio Ketercapaian CPL Mahasiswa',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 50,
    code: 'LAM-U50',
    itemKey: 'dl09-k6-intervensi-tindak-lanjut-cqi',
    kriteriaCode: 'K.6',
    kriteriaName: 'Pendidikan dan Pengajaran',
    dimension: 'Jaminan Pembelajaran',
    statement: 'UPPS/PS menunjukkan bukti intervensi sebagai tindak lanjut hasil pengukuran ketercapaian kompetensi (CPL) mahasiswa, untuk perbaikan kualitas pembelajaran dan tingkat pemenuhan CPL.',
    evidenceDoc: 'Laporan Tindak Lanjut & Intervensi Perbaikan Pembelajaran (Continuous Quality Improvement / CQI)',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 51,
    code: 'LAM-U51',
    itemKey: 'dl09-k6-tracer-study-survei-pengguna',
    kriteriaCode: 'K.6',
    kriteriaName: 'Pendidikan dan Pengajaran',
    dimension: 'Jaminan Pembelajaran',
    statement: 'UPPS/PS melakukan pengukuran tidak langsung atas ketercapaian kompetensi (CPL) mahasiswa, antara lain melalui survey pengguna maupun studi pelacakan lulusan (tracer study) dan mempertimbangkan masukan dari hasil pengukuran tersebut ke dalam intervensi perbaikan kualitas pembelajaran.',
    evidenceDoc: 'Laporan Tracer Study Alumni & Hasil Survei Kepuasan Pengguna Lulusan terhadap Relevansi CPL',
    isEnamDimensiKunci: true,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },

  // ==========================================
  // KRITERIA 7. PENELITIAN DAN PENGABDIAN KEPADA MASYARAKAT (SN-Dikti)
  // Dimensi: Penelitian (4), PKM (4)
  // ==========================================
  // Dimensi: Penelitian (No 52 - 55)
  {
    id: 52,
    code: 'LAM-U52',
    itemKey: 'dl09-k7-renstra-roadmap-riset-dosen',
    kriteriaCode: 'K.7',
    kriteriaName: 'Penelitian dan Pengabdian kepada Masyarakat',
    dimension: 'Penelitian',
    statement: 'UPPS/PS menunjukkan bukti perencanaan strategis pada kegiatan, hasil, dan kontribusi penelitiannya dalam memajukan pendidikan, ilmu pengetahuan, dan praktik profesional bagi pemangku kepentingan.',
    evidenceDoc: 'Renstra Penelitian UPPS/PS, Roadmap Riset Dosen, & Alokasi Pendanaan Internal/Eksternal',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 53,
    code: 'LAM-U53',
    itemKey: 'dl09-k7-publikasi-riset-sinta-scopus',
    kriteriaCode: 'K.7',
    kriteriaName: 'Penelitian dan Pengabdian kepada Masyarakat',
    dimension: 'Penelitian',
    statement: 'UPPS/PS menunjukkan bukti bahwa kegiatan dan hasil penelitiannya mampu berkontribusi dalam memajukan ilmu pengetahuan, pendidikan, dan praktik profesional pemangku kepentingan.',
    evidenceDoc: 'DKPS Tabel 8: Laporan Publikasi Ilmiah Dosen pada Jurnal Nasional Terakreditasi SINTA 1-6 / Internasional & HKI',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 54,
    code: 'LAM-U54',
    itemKey: 'dl09-k7-kerjasama-riset-rekognisi-mitra',
    kriteriaCode: 'K.7',
    kriteriaName: 'Penelitian dan Pengabdian kepada Masyarakat',
    dimension: 'Penelitian',
    statement: 'UPPS dan PS menunjukkan bukti kegiatan dan hasil kerja sama/keterlibatan penelitian (rekognisi) dengan para mitranya di bidang penelitian dan/atau praktik profesional telah mendukung dan selaras dengan misi, visi, tujuan dan sasaran, serta strategi UPPS/PS.',
    evidenceDoc: 'Dokumen Perjanjian Kerjasama (MoU/MoA) Riset dengan Mitra DUDI/Kampus Lain & Sertifikat Rekognisi Peneliti',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 55,
    code: 'LAM-U55',
    itemKey: 'dl09-k7-integrasi-riset-dalam-pbm',
    kriteriaCode: 'K.7',
    kriteriaName: 'Penelitian dan Pengabdian kepada Masyarakat',
    dimension: 'Penelitian',
    statement: 'UPPS/PS menunjukkan bukti pengintegrasian kegiatan, hasil, dan kontribusi penelitian dalam evaluasi kinerja dosen.',
    evidenceDoc: 'Bukti Hasil Penelitian Dosen yang Diintegrasikan ke Materi Kuliah/Bahan Ajar & Laporan Kinerja BKD Dosen',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },

  // Dimensi: Pengabdian kepada Masyarakat (No 56 - 58)
  {
    id: 56,
    code: 'LAM-U56',
    itemKey: 'dl09-k7-renstra-roadmap-pkm',
    kriteriaCode: 'K.7',
    kriteriaName: 'Penelitian dan Pengabdian kepada Masyarakat',
    dimension: 'Pengabdian kepada Masyarakat',
    statement: 'UPPS/PS menunjukkan bukti perencanaan strategis pada kegiatan, hasil, dan kontribusi PKM dalam memajukan pendidikan, ilmu pengetahuan, dan praktik profesional bagi pemangku kepentingan.',
    evidenceDoc: 'Renstra & Roadmap PkM UPPS/PS, Agenda Pengabdian Berkelanjutan, & Sumber Pendanaan PkM',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 57,
    code: 'LAM-U57',
    itemKey: 'dl09-k7-laporan-pkm-dampak-umkm',
    kriteriaCode: 'K.7',
    kriteriaName: 'Penelitian dan Pengabdian kepada Masyarakat',
    dimension: 'Pengabdian kepada Masyarakat',
    statement: 'UPPS/PS menunjukkan bukti bahwa kegiatan dan hasil PKM mampu berkontribusi dalam memajukan ilmu pengetahuan, pendidikan, dan praktik profesional pemangku kepentingan.',
    evidenceDoc: 'Laporan Pelaksanaan Kegiatan PkM Dosen yang Berdampak Langsung pada Pendampingan UMKM & Masyarakat',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },
  {
    id: 58,
    code: 'LAM-U58',
    itemKey: 'dl09-k7-kerjasama-integrasi-pkm-pbm',
    kriteriaCode: 'K.7',
    kriteriaName: 'Penelitian dan Pengabdian kepada Masyarakat',
    dimension: 'Pengabdian kepada Masyarakat',
    statement: 'UPPS/PS menunjukkan bukti kegiatan dan hasil kerja sama/keterlibatan pengabdian kepada masyarakat (rekognisi) dengan para mitranya di bidang pengabdian kepada masyarakat dan/atau praktik profesional mendukung dan selaras dengan misi, visi, tujuan dan sasaran, serta strategi UPPS/PS.',
    evidenceDoc: 'Bukti Kerjasama PkM dengan Mitra Pemda/DUDI, Rekognisi PkM, & Hasil PkM yang Diintegrasikan ke Bahan Ajar',
    isEnamDimensiKunci: false,
    standardType: 'SN_DIKTI',
    cluster: 'OUTPUT_OUTCOME',
  },
];

// 7 KRITERIA BOBOT IAU LAMEMBA (DL-09)
export const DL09_CRITERIA_METADATA = [
  {
    code: 'K.1',
    name: 'Orientasi Strategis',
    weight: 10,
    targetScore: 85,
    description: 'Orientasi strategis mendeskripsikan perumusan dan pencapaian Misi, Visi, Tujuan, Sasaran, dan Strategi UPPS/PS dengan integrasi manajemen risiko dan pelibatan pemangku kepentingan.',
    standardType: 'STANDAR_LAM' as const,
    dimensions: ['Misi', 'Visi', 'Tujuan dan Sasaran', 'Strategi'],
  },
  {
    code: 'K.2',
    name: 'Tata Pamong dan Tata Kelola',
    weight: 15,
    targetScore: 85,
    description: 'Tata pamong mendeskripsikan pengasuhan (parenting), pengawasan, sinergi sumber daya, penguatan nilai VMTS, tata kelola berprinsip GUG bebas konflik kepentingan, serta implementasi SPMI siklus PPEPP secara konsisten.',
    standardType: 'STANDAR_LAM' as const,
    dimensions: ['Tata Pamong', 'Tata Kelola'],
  },
  {
    code: 'K.3',
    name: 'Pengelolaan Mahasiswa',
    weight: 10,
    targetScore: 85,
    description: 'Pengelolaan mahasiswa mencakup penerimaan mahasiswa transparan & inklusif, modalitas pedagogi berbasis teknologi/AI, early warning system, prestasi kompetensi EMBA, kesejahteraan fisik & mental, serta pusat karir CDC.',
    standardType: 'STANDAR_LAM' as const,
    dimensions: ['Penerimaan Mahasiswa', 'Layanan Akademik Mahasiswa', 'Kinerja Akademik Mahasiswa', 'Kesejahteraan Mahasiswa', 'Pengembangan Karir Mahasiswa'],
  },
  {
    code: 'K.4',
    name: 'Dosen dan Tenaga Kependidikan',
    weight: 25,
    targetScore: 85,
    description: 'Pengelolaan SDM mencakup kecukupan dosen tetap linier, dosen berkualifikasi Doktor, jafung minimal Lektor, beban kerja konsisten, serta rekrutmen dan pengembangan karir dosen dan tendik berkelanjutan.',
    standardType: 'SN_DIKTI' as const,
    dimensions: ['Kecukupan dan Kualifikasi Dosen', 'Pengelolaan Dosen', 'Kecukupan dan Kualifikasi Tenaga Kependidikan', 'Pengelolaan Tenaga Kependidikan'],
  },
  {
    code: 'K.5',
    name: 'Keuangan dan Sarana Prasarana',
    weight: 10,
    targetScore: 85,
    description: 'Pengelolaan keuangan dan sarpras menjamin keberlanjutan operasional pendidikan, riset, dan PkM melalui RKAT, audit eksternal KAP, fasilitas berstandar K3, ramah difabel, dan responsif gender.',
    standardType: 'SN_DIKTI' as const,
    dimensions: ['Keuangan', 'Sarana Prasarana'],
  },
  {
    code: 'K.6',
    name: 'Pendidikan dan Pengajaran',
    weight: 20,
    targetScore: 85,
    description: 'Pendidikan mencakup kurikulum OBE berorientasi masa depan, perangkat RPS berbasis studi kasus & proyek tim, metode mutakhir, evaluasi berkala pemangku kepentingan, rubrik asesmen CPL langsung, CQI, dan tracer study.',
    standardType: 'SN_DIKTI' as const,
    dimensions: ['Kurikulum', 'Jaminan Pembelajaran'],
  },
  {
    code: 'K.7',
    name: 'Penelitian dan Pengabdian kepada Masyarakat',
    weight: 10,
    targetScore: 85,
    description: 'Penelitian dan PkM mencakup roadmap strategis, publikasi jurnal nasional terakreditasi SINTA / internasional, rekognisi kepakaran dosen, integrasi ke materi ajar, dan kontribusi nyata pada UMKM/masyarakat.',
    standardType: 'SN_DIKTI' as const,
    dimensions: ['Penelitian', 'Pengabdian kepada Masyarakat'],
  },
];

/**
 * Evaluasi Lengkap Instrumen Akreditasi Unggul (DL-09) Berdasarkan Berkas Riil (Strict Realism)
 */
export function evaluateLamembaDl09(
  evidenceMap: Map<string, any>,
  systemSourcesMap?: Map<string, ISystemSourceData>
): IDl09UnggulSummary {
  // 1. Evaluasi 58 Indikator
  const evaluatedIndicators: IDl09EvaluatedIndicator[] = DL09_58_INDIKATORS.map((ind) => {
    const uploaded = evidenceMap.get(ind.itemKey);
    const isVerified = Boolean(uploaded && uploaded.fileUrl);
    const systemSourceData = systemSourcesMap?.get(ind.code) || systemSourcesMap?.get(ind.itemKey);

    return {
      ...ind,
      verified: isVerified,
      fileUrl: uploaded?.fileUrl,
      fileName: uploaded?.originalName || uploaded?.fileName,
      uploadedAt: uploaded?.updatedAt?.toISOString() || uploaded?.createdAt?.toISOString(),
      systemSourceData,
    };
  });

  const totalIndicators = evaluatedIndicators.length; // 58
  const verifiedIndicators = evaluatedIndicators.filter((x) => x.verified).length;
  const percentage = Number(((verifiedIndicators / totalIndicators) * 100).toFixed(1));

  // 2. Evaluasi 7 Kriteria
  let weightedSum = 0;
  let totalWeight = 0;

  const enrichedCriteria: IDl09CriterionEnriched[] = DL09_CRITERIA_METADATA.map((meta) => {
    const indicatorsForCriteria = evaluatedIndicators.filter((x) => x.kriteriaCode === meta.code);
    const count = indicatorsForCriteria.length;
    const verified = indicatorsForCriteria.filter((x) => x.verified).length;

    // Strict Realism: Skor kriteria dihitung dari persentase dokumen fisik yang terunggah
    const score = count > 0 ? Number(((verified / count) * 100).toFixed(1)) : 0;
    
    // Status per kriteria
    const status =
      score >= 85
        ? 'UNGGUL'
        : score >= 70
        ? 'BAIK_SEKALI'
        : score >= 55
        ? 'BAIK'
        : 'PERLU_PERBAIKAN';

    // Cek apakah seluruh dimensi kunci pada kriteria ini (jika ada) lolos
    const kunciIndicators = indicatorsForCriteria.filter((x) => x.isEnamDimensiKunci);
    const isEnamDimensiKunciPassed =
      kunciIndicators.length === 0 || kunciIndicators.every((x) => x.verified);

    weightedSum += score * meta.weight;
    totalWeight += meta.weight;

    return {
      code: meta.code,
      name: meta.name,
      weight: meta.weight,
      score,
      targetScore: meta.targetScore,
      status,
      description: meta.description,
      standardType: meta.standardType,
      dimensions: meta.dimensions,
      indicators: indicatorsForCriteria,
      totalIndicators: count,
      verifiedIndicators: verified,
      isEnamDimensiKunciPassed,
      strengths:
        verified > 0
          ? [`Telah tersedia ${verified} berkas dokumen pembuktian sah pada kriteria ini.`]
          : ['Belum ada dokumen fisik pembuktian yang diunggah ke sistem.'],
      recommendations:
        verified === count
          ? ['Pertahankan kelengkapan berkas fisik dan lakukan pembaruan berkala setiap semester.']
          : ['Siapkan dokumen resmi yang diminta asesor dan klik tombol [+ Upload Dokumen / PDF] pada butir indikator.'],
    };
  });

  const finalWeightedScore = Number((weightedSum / (totalWeight || 100)).toFixed(1));

  // 3. Evaluasi Pilar 1: 6 Dimensi Terpilih (K2, K4, K6 - Tabel 5)
  // Wajib memenuhi seluruh indikator pada 6 dimensi kunci:
  // - K2 Tata Pamong (2 indikator: LAM-U17, LAM-U18)
  // - K2 Tata Kelola (3 indikator: LAM-U19, LAM-U20, LAM-U21)
  // - K4 Kecukupan & Kualifikasi Dosen (3 indikator: LAM-U31, LAM-U32, LAM-U33)
  // - K4 Pengelolaan Dosen (3 indikator: LAM-U34, LAM-U35, LAM-U36)
  // - K6 Kurikulum (4 indikator: LAM-U45, LAM-U46, LAM-U47, LAM-U48)
  // - K6 Jaminan Pembelajaran (3 indikator: LAM-U49, LAM-U50, LAM-U51)
  const enamDimensiList = [
    { name: 'Tata Pamong', kriteriaCode: 'K.2', codes: ['LAM-U17', 'LAM-U18'] },
    { name: 'Tata Kelola', kriteriaCode: 'K.2', codes: ['LAM-U19', 'LAM-U20', 'LAM-U21'] },
    { name: 'Kecukupan dan Kualifikasi Dosen', kriteriaCode: 'K.4', codes: ['LAM-U31', 'LAM-U32', 'LAM-U33'] },
    { name: 'Pengelolaan Dosen', kriteriaCode: 'K.4', codes: ['LAM-U34', 'LAM-U35', 'LAM-U36'] },
    { name: 'Kurikulum', kriteriaCode: 'K.6', codes: ['LAM-U45', 'LAM-U46', 'LAM-U47', 'LAM-U48'] },
    { name: 'Jaminan Pembelajaran', kriteriaCode: 'K.6', codes: ['LAM-U49', 'LAM-U50', 'LAM-U51'] },
  ];

  const dimensiKunciEvaluated = enamDimensiList.map((d) => {
    const inds = evaluatedIndicators.filter((x) => d.codes.includes(x.code));
    const total = inds.length;
    const verified = inds.filter((x) => x.verified).length;
    return {
      name: d.name,
      kriteriaCode: d.kriteriaCode,
      total,
      verified,
      passed: verified === total && total > 0,
    };
  });

  const totalKunciIndikator = dimensiKunciEvaluated.reduce((acc, curr) => acc + curr.total, 0); // 18
  const verifiedKunciIndikator = dimensiKunciEvaluated.reduce((acc, curr) => acc + curr.verified, 0);
  const isEnamDimensiPassed = dimensiKunciEvaluated.every((d) => d.passed);

  // 4. Evaluasi Pilar 2: 15 Dimensi Lainnya (Tabel 6)
  const nonKunciIndicators = evaluatedIndicators.filter((x) => !x.isEnamDimensiKunci);
  const totalLainnya = nonKunciIndicators.length; // 40
  const verifiedLainnya = nonKunciIndicators.filter((x) => x.verified).length;
  // Memenuhi standar jika minimal 90% dimensi lainnya terpenuhi
  const isLainnyaPassed = verifiedLainnya >= Math.floor(totalLainnya * 0.9);

  // 5. Evaluasi Pilar 3: Syarat Perlu Kualifikasi & Luaran Dosen (Program Sarjana S1 - Tabel 7 DL-09)
  // Syarat S1:
  // 1. Jumlah Dosen sesuai analisis (DT >= 60%, DTT <= 40%) -> Butuh DKPS Profil Dosen
  // 2. >= 1 Dosen Tetap Doktor (S3), seluruh DT minimal Magister (S2)
  // 3. >= 40% Dosen Tetap berkualifikasi minimal Lektor dalam 3 tahun terakhir
  // 4. >= 20% Dosen Tetap publikasi di jurnal nasional terakreditasi (SINTA 1-6) dalam 3 tahun terakhir
  const hasDosenTetapProfile = evidenceMap.has('dl09-k4-kualifikasi-kecukupan-dosen-tetap');
  const hasDosenS3Evidence = evidenceMap.has('dl09-k4-rekrutmen-pengembangan-dosen') || hasDosenTetapProfile;
  const hasJafungLektorEvidence = evidenceMap.has('dl09-k4-fasilitas-dukungan-rekognisi-emba') || hasDosenTetapProfile;
  const hasPublikasiSintaEvidence = evidenceMap.has('dl09-k7-publikasi-riset-sinta-scopus');

  const syaratDosenChecks: IDl09FacultyRequirementCheck[] = [
    {
      item: 'Kecukupan Jumlah Dosen Tetap (DT)',
      rule: 'DT minimal 60% dari seluruh dosen UPPS, DTT maksimal 40% (rasio ideal mahasiswa aktif)',
      currentValue: hasDosenTetapProfile ? 'DKPS Profil Terunggah' : 'Belum Ada Berkas (0%)',
      passed: hasDosenTetapProfile,
      notes: 'Berdasarkan Tabel 1 & 2 DKPS Profil Dosen Tetap Program Studi Manajemen.',
    },
    {
      item: 'Kualifikasi Pendidikan Doktor (S3)',
      rule: '≥ 1 Dosen Tetap berkualifikasi Doktor (S3), seluruh DT minimal Magister (S2) selaras CPL',
      currentValue: hasDosenS3Evidence ? 'Ijazah Doktor Terverifikasi' : 'Belum Ada Berkas (0%)',
      passed: hasDosenS3Evidence,
      notes: 'Wajib memiliki minimal 1 DT dengan kualifikasi Doktor dalam 3 tahun terakhir.',
    },
    {
      item: 'Kualifikasi Jabatan Fungsional (Jafung)',
      rule: '≥ 40% Dosen Tetap berkualifikasi minimal Lektor (Lektor, Lektor Kepala, atau Guru Besar)',
      currentValue: hasJafungLektorEvidence ? 'SK Jafung Terverifikasi' : 'Belum Ada Berkas (0%)',
      passed: hasJafungLektorEvidence,
      notes: 'Dihitung dari dosen tetap yang ditugaskan UPPS pada prodi dalam 3 tahun terakhir.',
    },
    {
      item: 'Publikasi Jurnal Nasional Terakreditasi',
      rule: '≥ 20% Dosen Tetap memiliki publikasi pada jurnal terakreditasi SINTA 1 s.d. SINTA 6',
      currentValue: hasPublikasiSintaEvidence ? 'Bukti SINTA Terunggah' : 'Belum Ada Berkas (0%)',
      passed: hasPublikasiSintaEvidence,
      notes: 'Posisi author atau co-author dalam 3 tahun terakhir pada jurnal bereputasi SINTA.',
    },
  ];

  const isSyaratDosenPassed = syaratDosenChecks.every((c) => c.passed);

  // 6. Penentuan Akhir Status UNGGUL (DL-09)
  const isScorePassed = finalWeightedScore >= 85.0;
  const isAllPillarsPassed = isEnamDimensiPassed && isLainnyaPassed && isSyaratDosenPassed;
  const isUnggulAchieved = isScorePassed && isAllPillarsPassed;

  return {
    criteria: enrichedCriteria,
    totalIndicators,
    verifiedIndicators,
    percentage,
    finalWeightedScore,
    enamDimensiTerpilih: {
      totalIndicators: totalKunciIndikator,
      verifiedIndicators: verifiedKunciIndikator,
      passed: isEnamDimensiPassed,
      dimensions: dimensiKunciEvaluated,
    },
    limabelasDimensiLainnya: {
      totalIndicators: totalLainnya,
      verifiedIndicators: verifiedLainnya,
      passed: isLainnyaPassed,
    },
    syaratDosenS1: {
      passed: isSyaratDosenPassed,
      checks: syaratDosenChecks,
    },
    isAllPillarsPassed,
    isScorePassed,
    isUnggulAchieved,
    statusBadge: isUnggulAchieved
      ? 'TERAKREDITASI UNGGUL (DL-09 RESMI)'
      : `BELUM MEMENUHI AMBANG UNGGUL (SKOR: ${finalWeightedScore.toFixed(1)})`,
    statusDescription: isUnggulAchieved
      ? 'Program Studi S1 Manajemen memenuhi seluruh 7 Kriteria, 58 Indikator, 6 Dimensi Terpilih Kunci, dan Syarat Kualifikasi Dosen S1 IAU LAMEMBA (DL-09).'
      : `Pangkalan data baru: Belum ada berkas dokumen pembuktian fisik yang diunggah (${verifiedIndicators}/58 Indikator Terpenuhi). Unggah berkas pada indikator yang bertanda merah.`,
  };
}
