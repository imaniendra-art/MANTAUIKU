import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { LamembaDl05, AccreditationEvidence } from '@/models/Accreditation';

export const dynamic = 'force-dynamic';

// 1. Koleksi Wajib: 1 Surat Rekomendasi/Keputusan Resmi per Tahun (Tahun 0 s.d 4)
const DEFAULT_ANNUAL_LETTERS = [
  {
    yearIndex: 0,
    yearLabel: 'Tahun Ke-0 (Baseline Penetapan Akreditasi)',
    letterNumber: 'SK LAMEMBA No. 933/DE/A.5/AR.10/XII/2023',
    letterDate: '2023-12-28',
    notes: 'SK Peringkat Akreditasi Baik Sekali & Berita Acara Rekomendasi Asesmen Lapangan Terakhir',
  },
  {
    yearIndex: 1,
    yearLabel: 'Tahun Ke-1 (Pemantauan Siklus 1)',
    letterNumber: '',
    letterDate: '',
    notes: 'Surat Hasil Pemantauan & Rekomendasi Evaluasi Tahun ke-1 dari Dewan Eksekutif LAMEMBA',
  },
  {
    yearIndex: 2,
    yearLabel: 'Tahun Ke-2 (Pemantauan Siklus 2)',
    letterNumber: '',
    letterDate: '',
    notes: 'Surat Hasil Pemantauan & Rekomendasi Evaluasi Tahun ke-2 dari Dewan Eksekutif LAMEMBA',
  },
  {
    yearIndex: 3,
    yearLabel: 'Tahun Ke-3 (Pemantauan Siklus 3)',
    letterNumber: '',
    letterDate: '',
    notes: 'Surat Hasil Pemantauan & Rekomendasi Evaluasi Tahun ke-3 dari Dewan Eksekutif LAMEMBA',
  },
  {
    yearIndex: 4,
    yearLabel: 'Tahun Ke-4 (Evaluasi Reakreditasi)',
    letterNumber: '',
    letterDate: '',
    notes: 'Surat Hasil Evaluasi Komprehensif & Rekomendasi Reakreditasi dari Dewan Eksekutif LAMEMBA',
  },
];

// 2. Sub-Tab 1: Bab I Tindak Lanjut Rekomendasi Asesor (Tabel 1.1)
const DEFAULT_ASSESSOR_FOLLOW_UPS_LIST = [
  {
    recommendationNo: 1,
    recommendation: 'Penyesuaian dokumen RPS dengan metode pembelajaran studi kasus (case method) dan team-based project minimal 50% dari total mata kuliah.',
    yearIndex: 1,
    actionTaken: 'Pelaksanaan lokakarya peninjauan kurikulum OBE bersama pakar dan pelatihan penyusunan rubrik case method bagi seluruh dosen pengampu mata kuliah keahlian.',
    obstacle: 'Adaptasi beberapa dosen senior terhadap rubrik penilaian holistik berbasis studi kasus memerlukan waktu pendampingan.',
    cqiSolution: 'Pembentukan klinik pembelajaran dan program mentoring sebaya (peer mentoring) antar-dosen rumpun keilmuan manajemen.',
    achievement: 'Tersedia 24 RPS berbasis studi kasus dan proyek tim yang telah divalidasi oleh Gugus Kendali Mutu (GKM).',
    status: 'SELESAI' as const,
    evidenceUrl: '',
  },
  {
    recommendationNo: 2,
    recommendation: 'Peningkatan publikasi artikel ilmiah dosen tetap pada jurnal nasional terakreditasi minimal SINTA 2 dan jurnal internasional bereputasi.',
    yearIndex: 1,
    actionTaken: 'Alokasi dana hibah penelitian internal prodi sebesar Rp 15.000.000/judul dan insentif publikasi Rp 7.500.000 untuk artikel tembus SINTA 2.',
    obstacle: 'Keterbatasan waktu dosen dalam penulisan manuskrip akibat padatnya beban mengajar perkuliahan.',
    cqiSolution: 'Penataan ulang jadwal dan pembatasan EWMP mengajar maksimal 12 SKS agar dosen memiliki waktu riset minimal 4 SKS per semester.',
    achievement: 'Berhasil mempublikasikan 3 artikel pada jurnal terakreditasi SINTA 2 dan 1 artikel pada jurnal bereputasi internasional.',
    status: 'SELESAI' as const,
    evidenceUrl: '',
  },
  {
    recommendationNo: 3,
    recommendation: 'Optimalisasi pelaksanaan pelacakan lulusan (tracer study) tahunan dengan respon responden minimal 50% dan masa tunggu kerja pertama <= 6 bulan.',
    yearIndex: 2,
    actionTaken: 'Pengembangan sistem tracer study daring terintegrasi dan kolaborasi aktif dengan Ikatan Alumni (IKA) STIMI YAPMI Makassar.',
    obstacle: 'Tingkat pergantian nomor kontak ponsel dan email alumni yang belum terdata secara otomatis setelah wisuda.',
    cqiSolution: 'Pemberian token insentif kuota internet dan verifikasi berkala kontak alumni melalui WhatsApp Gateway resmi kampus.',
    achievement: 'Response rate tracer study mencapai 78.4% dengan rata-rata masa tunggu kerja lulusan 3.4 bulan.',
    status: 'SELESAI' as const,
    evidenceUrl: '',
  },
  {
    recommendationNo: 4,
    recommendation: 'Peningkatan kepemilikan sertifikat kompetensi/profesi industri bagi dosen tetap yang diakui oleh BNSP atau lembaga sertifikasi profesi internasional.',
    yearIndex: 2,
    actionTaken: 'Mengikutsertakan 4 dosen tetap dalam sertifikasi Certified Financial Planner (CFP) dan Certified Risk Associate (CRA).',
    obstacle: 'Biaya keikutsertaan sertifikasi profesi berstandar internasional memerlukan alokasi anggaran khusus institusi.',
    cqiSolution: 'Kemitraan strategis dengan LSP Perbankan dan Asosiasi Profesi Keuangan untuk mendapatkan skema beasiswa sertifikasi.',
    achievement: '4 dosen tetap berhasil lulus dan memegang sertifikat kompetensi profesi aktif dari BNSP & LSP terkait.',
    status: 'SELESAI' as const,
    evidenceUrl: '',
  },
];

// 3. Sub-Tab 1: Bab II Kemajuan Implementasi Strategi Renstra (Tabel 2.1)
const DEFAULT_RENSTRA_PROGRESS_LIST = [
  {
    yearIndex: 1,
    strategy: 'Peningkatan Akreditasi Program Studi Menuju Peringkat Unggul melalui pemenuhan SN-Dikti dan kriteria LAMEMBA.',
    actionTaken: 'Restrukturisasi Gugus Kendali Mutu (GKM) prodi dan pelaksanaan Audit Mutu Internal (AMI) siklus 1 secara berkala setiap semester.',
    obstacle: 'Dokumentasi bukti fisik LKPS sebelumnya masih tersebar di beberapa unit kerja dan belum tersentralisasi.',
    cqiSolution: 'Penerapan sistem repositori digital MANTAUIKU untuk pengarsipan bukti dokumen akreditasi secara otomatis dan terverifikasi.',
    achievement: 'Seluruh 29 indikator kelayakan akreditasi terpetakan secara real-time dengan pemenuhan syarat perlu status akreditasi.',
  },
  {
    yearIndex: 1,
    strategy: 'Digitalisasi Kurikulum dan Penguatan Ekosistem Kewirausahaan Mahasiswa (Business Incubator).',
    actionTaken: 'Pendirian Unit Inkubator Bisnis Mahasiswa STIMI YAPMI dan integrasi mata kuliah Digital Business Practice ke dalam kurikulum.',
    obstacle: 'Akses permodalan awal dan legalitas izin usaha mikro bagi bisnis rintisan mahasiswa.',
    cqiSolution: 'Kerjasama pendampingan legalitas NIB (Nomor Induk Berusaha) bersama Dinas Koperasi dan UMKM Kota Makassar.',
    achievement: 'Terbentuk 12 kelompok wirausaha mahasiswa aktif yang berbadan usaha resmi dan menghasilkan omzet rutin.',
  },
  {
    yearIndex: 2,
    strategy: 'Peningkatan Kualifikasi Akademik Doktor (S3) Dosen Tetap Program Studi minimal mencapai 30%.',
    actionTaken: 'Pemberian rekomendasi dan dukungan pembiayaan bagi 3 dosen tetap untuk melanjutkan studi doktoral di Universitas Hasanuddin dan Universitas Muslim Indonesia.',
    obstacle: 'Manajemen waktu antara menyelesaikan riset disertasi doktoral dan kewajiban mengajar di kampus asal.',
    cqiSolution: 'Pemberian skema cuti akademik terstruktur dan bantuan biaya publikasi disertasi pada jurnal bereputasi.',
    achievement: '2 dosen tetap berhasil menyelesaikan ujian promosi doktor dan persentase kualifikasi S3 meningkat menjadi 33.3%.',
  },
  {
    yearIndex: 2,
    strategy: 'Penguatan Kemitraan Strategis dengan Dunia Usaha dan Dunia Industri (DUDI) untuk Program MBKM.',
    actionTaken: 'Penandatanganan Perjanjian Kerjasama (PKS) magang bersertifikat dengan 15 mitra perbankan, BUMN, dan perusahaan ritel nasional.',
    obstacle: 'Penyetaraan konversi 20 SKS kegiatan magang industri ke dalam mata kuliah terstruktur kurikulum prodi.',
    cqiSolution: 'Penyusunan Pedoman Konversi Magang MBKM Prodi Manajemen dengan rubrik penilaian capaian pembelajaran yang terstandar.',
    achievement: 'Sebanyak 42 mahasiswa berhasil menyelesaikan magang bersertifikat 1 semester penuh dengan nilai konversi A.',
  },
];

// 4. Sub-Tab 2: Bab III.1 Jaminan Pembelajaran (Tabel 3.1.1 - 4 Indikator CPL)
const DEFAULT_LEARNING_ITEMS = [
  {
    nomor: 1,
    indikator:
      'Unit Pengelola Program Studi mendokumentasikan proses jaminan pembelajaran dengan baik yang sesuai dengan profil lulusan, kompetensi lulusan, dan capaian pembelajaran yang telah ditetapkan serta selaras dengan visi, misi, tujuan, dan strategi.',
    upayaTahun1: 'Penyusunan dokumen profil lulusan terstandar bersama asosiasi profesi dan pemetaan matriks CPL ke visi keilmuan prodi.',
    hasilTahun1: 'Tersedia dokumen resmi kurikulum OBE S1 Manajemen ber-SK Ketua STIMI YAPMI dengan 8 profil lulusan utama.',
    upayaTahun2: 'Audit keterlaksanaan proses pembelajaran melalui evaluasi berkala Gugus Kendali Mutu di tengah dan akhir semester.',
    hasilTahun2: 'Seluruh kelas perkuliahan telah dilengkapi portofolio CPL dan berita acara jaminan pembelajaran yang terverifikasi.',
    upayaTahun3: '',
    hasilTahun3: '',
    upayaTahun4: '',
    hasilTahun4: '',
  },
  {
    nomor: 2,
    indikator:
      'Unit Pengelola Program Studi menyusun peta kurikulum untuk menjamin struktur mata kuliah dan kegiatan pembelajaran konsisten dan relevan dengan capaian pembelajaran dan profil lulusan yang diharapkan serta selaras dengan visi, misi, tujuan, dan strategi.',
    upayaTahun1: 'Lokakarya pemetaan struktur mata kuliah prasyarat dan pembobotan SKS agar sesuai dengan profil kompetensi manajer bisnis.',
    hasilTahun1: 'Peta kurikulum 144 SKS tersusun rapi dengan pohon keilmuan yang jelas (Pemasaran, Keuangan, SDM, dan Operasional).',
    upayaTahun2: 'Integrasi mata kuliah wajib berbasis praktika bisnis dan pemanfaatan perangkat lunak analisis bisnis (SPSS & FinTech).',
    hasilTahun2: 'Mata kuliah praktika terbukti mendukung pencapaian sub-CPL analitikal mahasiswa sebesar 86.4%.',
    upayaTahun3: '',
    hasilTahun3: '',
    upayaTahun4: '',
    hasilTahun4: '',
  },
  {
    nomor: 3,
    indikator:
      'Unit Pengelola Program Studi mendeskripsikan pedoman standar pemenuhan capaian pembelajaran dan mengembangkan instrumen yang valid dan handal dengan metode yang relevan untuk mengukur capaian pembelajaran serta menetapkan intervensi untuk perbaikan kualitas pembelajaran berdasar tingkat pemenuhan capaian pembelajaran serta masukan dari para pemangku kepentingan.',
    upayaTahun1: 'Pengembangan rubrik asesmen CPL analitis dan holistik untuk penilaian tugas individu, ujian studi kasus, dan presentasi tim.',
    hasilTahun1: 'Tersedia pedoman asesmen CPL terstandar yang digunakan secara seragam oleh 100% dosen pengampu mata kuliah.',
    upayaTahun2: 'Intervensi khusus berupa program tutorial sebaya dan modul pengayaan bagi mahasiswa dengan capaian nilai di bawah target CPL.',
    hasilTahun2: 'Tingkat kelulusan mata kuliah kuantitatif (Manajemen Keuangan & Riset Operasi) meningkat signifikan sebesar 18.2%.',
    upayaTahun3: '',
    hasilTahun3: '',
    upayaTahun4: '',
    hasilTahun4: '',
  },
  {
    nomor: 4,
    indikator:
      'Unit Pengelola Program Studi mendeskripsikan hasil evaluasi pengukuran capaian pembelajaran mahasiswa dan tindak lanjut yang ditetapkan agar kegiatan dan proses pembelajaran konsisten dan relevan dengan capaian pembelajaran dan profil lulusan yang diharapkan serta selaras dengan visi, misi, tujuan, dan strategi.',
    upayaTahun1: 'Rapat tinjauan kurikulum akhir tahun akademik untuk mengevaluasi ketercapaian nilai CPL lulusan dari 4 konsentrasi.',
    hasilTahun1: 'Rata-rata pencapaian CPL langsung mahasiswa program studi mencapai 84.7% (kategori Sangat Baik).',
    upayaTahun2: 'Tindak lanjut masukan pengguna lulusan dengan menambahkan muatan etika bisnis, komunikasi profesional, dan bahasa Inggris bisnis.',
    hasilTahun2: 'Skor kepuasan mitra pengguna terhadap integritas dan etika kerja alumni STIMI YAPMI meningkat menjadi 91.5%.',
    upayaTahun3: '',
    hasilTahun3: '',
    upayaTahun4: '',
    hasilTahun4: '',
  },
];

// 5. Sub-Tab 2: Bab III.2 Profil Dosen Berdasarkan Status Kepegawaian (Tabel 3.2.1)
const DEFAULT_DOSEN_PROFILES = [
  {
    name: 'Dr. Muhammad Idris, S.E., M.M.',
    status: 'Tetap' as const,
    nidn: '0912047501',
    jabatanAkademik: 'Lektor Kepala',
    jalur: 'Akademisi' as const,
    namaPerusahaan: '',
    catatan: 'Dosen Tetap Homebase S1 Manajemen',
    isChange: false,
    isKeluar: false,
  },
  {
    name: 'Dr. Hj. Rahmawati, S.E., M.Si.',
    status: 'Tetap' as const,
    nidn: '0918088002',
    jabatanAkademik: 'Lektor',
    jalur: 'Akademisi' as const,
    namaPerusahaan: '',
    catatan: 'Dosen Tetap Homebase S1 Manajemen',
    isChange: false,
    isKeluar: false,
  },
  {
    name: 'Drs. H. M. Said, M.Si',
    status: 'Tetap' as const,
    nidn: '0918077501',
    jabatanAkademik: 'Lektor Kepala',
    jalur: 'Akademisi' as const,
    namaPerusahaan: '',
    catatan: 'Ketua Program Studi S1 Manajemen',
    isChange: false,
    isKeluar: false,
  },
  {
    name: 'Nurul Hidayah, S.E., M.M.',
    status: 'Tetap' as const,
    nidn: '0922039004',
    jabatanAkademik: 'Asisten Ahli',
    jalur: 'Akademisi' as const,
    namaPerusahaan: '',
    catatan: 'Koordinator Kurikulum & Mutu Pembelajaran',
    isChange: false,
    isKeluar: false,
  },
  {
    name: 'Ahmad Fauzi, S.E., M.M., CFP',
    status: 'Tidak Tetap' as const,
    nidn: '0925118503',
    jabatanAkademik: 'Lektor',
    jalur: 'Praktisi' as const,
    namaPerusahaan: 'PT Bank Sulselbar (Head of SME Credit)',
    catatan: 'Dosen Praktisi Industri Perbankan & Lembaga Keuangan',
    isChange: false,
    isKeluar: false,
  },
];

// 6. Sub-Tab 2: Bab III.2 Profil Dosen Berdasarkan Latar Belakang Keahlian (Tabel 3.2.3)
const DEFAULT_DOSEN_EXPERTISE = [
  {
    name: 'Dr. Muhammad Idris, S.E., M.M.',
    magister: 'Magister Manajemen (Universitas Hasanuddin)',
    doktor: 'Doktor Ilmu Manajemen (Universitas Hasanuddin)',
    bidangKeahlian: 'Manajemen Stratejik & Manajemen Operasional',
    serdos: '1110912047501',
    sertifikatProfesi: 'Certified Risk Associate (CRA) - BNSP',
    isChange: false,
  },
  {
    name: 'Dr. Hj. Rahmawati, S.E., M.Si.',
    magister: 'Magister Sains Manajemen (Universitas Muslim Indonesia)',
    doktor: 'Doktor Ilmu Manajemen (Universitas Muslim Indonesia)',
    bidangKeahlian: 'Manajemen Keuangan & Perbankan Syariah',
    serdos: '1210918088002',
    sertifikatProfesi: 'Certified Financial Planner (CFP) - FPSB Indonesia',
    isChange: false,
  },
  {
    name: 'Drs. H. M. Said, M.Si',
    magister: 'Magister Sains Administrasi Bisnis (Unhas)',
    doktor: '-',
    bidangKeahlian: 'Manajemen Sumber Daya Manusia & Organisasi',
    serdos: '1010918077501',
    sertifikatProfesi: 'Certified Human Resource Professional (CHRP)',
    isChange: false,
  },
  {
    name: 'Nurul Hidayah, S.E., M.M.',
    magister: 'Magister Manajemen (Universitas Hasanuddin)',
    doktor: '-',
    bidangKeahlian: 'Manajemen Pemasaran & Perilaku Konsumen',
    serdos: '1510922039004',
    sertifikatProfesi: 'Digital Marketing Associate - BNSP',
    isChange: false,
  },
  {
    name: 'Ahmad Fauzi, S.E., M.M., CFP',
    magister: 'Magister Manajemen Keuangan (STIE Nobel Makassar)',
    doktor: '-',
    bidangKeahlian: 'Manajemen Kredit Perbankan & Analisis Finansial',
    serdos: '-',
    sertifikatProfesi: 'Certified Financial Planner (CFP) & Analis Kredit (LSPP)',
    isChange: false,
  },
];

// 7. Sub-Tab 2: Bab III.2 Kontribusi Intelektual Dosen (Tabel 3.2.5)
const DEFAULT_KONTRIBUSI_INTELEKTUAL = [
  {
    name: 'Dr. Muhammad Idris, S.E., M.M.',
    rekognisiPendidikan: 'Narasumber Pelatihan Penyusunan Kurikulum Berbasis OBE di 3 PTS LLDIKTI IX',
    rekognisiPraktik: 'Konsultan Ahli Manajemen Stratejik & Tata Kelola Perusda Sulsel',
    rekognisiPenelitian: 'Penulis Utama Jurnal Terakreditasi SINTA 2 (3 Artikel, 28 Sitasi) & Reviewer Jurnal Nasional',
    rekognisiSosial: 'Ketua Dewan Pembina Asosiasi Pengusaha Muda Sulsel & Pengarah Pendampingan UMKM',
    isChange: false,
  },
  {
    name: 'Dr. Hj. Rahmawati, S.E., M.Si.',
    rekognisiPendidikan: 'Instruktur Pelatihan Analisis Laporan Keuangan bagi Pelaku Usaha Mikro',
    rekognisiPraktik: 'Tenaga Ahli Audit Internal Koperasi & Dewan Pengawas Syariah BMT Makassar',
    rekognisiPenelitian: 'Publikasi Jurnal SINTA 2 & Penerima Hibah Riset Fundamental Kemendikbudristek',
    rekognisiSosial: 'Fasilitator Pemberdayaan Ekonomi Perempuan Pesisir dan Nelayan Maros',
    isChange: false,
  },
  {
    name: 'Drs. H. M. Said, M.Si',
    rekognisiPendidikan: 'Penguji Eksternal Uji Kompetensi Keahlian SMK Manajemen Bisnis',
    rekognisiPraktik: 'Konsultan Pengembangan SDM dan Penataan Karir Karyawan Ritel Modern',
    rekognisiPenelitian: 'Penulis Buku Ajar Manajemen Sumber Daya Manusia Terapan ber-ISBN',
    rekognisiSosial: 'Koordinator Program Pengabdian Masyarakat Edukasi Manajemen Keuangan Keluarga',
    isChange: false,
  },
  {
    name: 'Nurul Hidayah, S.E., M.M.',
    rekognisiPendidikan: 'Dosen Pembimbing Lapangan Program Wirausaha Merdeka Kemendikbud',
    rekognisiPraktik: 'Mentor Digital Marketing pada Inkubator Bisnis Makassar Technopark',
    rekognisiPenelitian: 'Publikasi Artikel Jurnal SINTA 3 tentang Pemasaran Media Sosial UMKM',
    rekognisiSosial: 'Pendamping Program Transformasi Digital Pedagang Pasar Tradisional Terong',
    isChange: false,
  },
  {
    name: 'Ahmad Fauzi, S.E., M.M., CFP',
    rekognisiPendidikan: 'Dosen Tamu Praktisi Industri Perbankan Mata Kuliah Manajemen Lembaga Keuangan',
    rekognisiPraktik: 'Kepala Bagian Analisis Kredit Usaha Menengah PT Bank Sulselbar',
    rekognisiPenelitian: 'Kolaborator Riset Terapan Skema Pembiayaan Mikro Perbankan Daerah',
    rekognisiSosial: 'Narasumber Literasi Keuangan Otoritas Jasa Keuangan (OJK) Regional 6 Sulampua',
    isChange: false,
  },
];

// 8. Sub-Tab 2: Bab III.2 EWMP Dosen (Tabel 3.2.7)
const DEFAULT_EWMP_LIST = [
  {
    name: 'Dr. Muhammad Idris, S.E., M.M.',
    psAkreditasiSks: 6.0,
    psLainDalamPtSks: 2.0,
    psLainLuarPtSks: 0.0,
    penelitianSks: 3.0,
    pkmSks: 1.5,
    tugasTambahanSks: 1.5,
    totalSks: 14.0,
    avgSemesterSks: 14.0,
    isChange: false,
  },
  {
    name: 'Dr. Hj. Rahmawati, S.E., M.Si.',
    psAkreditasiSks: 7.0,
    psLainDalamPtSks: 0.0,
    psLainLuarPtSks: 0.0,
    penelitianSks: 3.5,
    pkmSks: 1.5,
    tugasTambahanSks: 2.0,
    totalSks: 14.0,
    avgSemesterSks: 14.0,
    isChange: false,
  },
  {
    name: 'Drs. H. M. Said, M.Si',
    psAkreditasiSks: 6.0,
    psLainDalamPtSks: 0.0,
    psLainLuarPtSks: 0.0,
    penelitianSks: 2.5,
    pkmSks: 1.5,
    tugasTambahanSks: 4.0,
    totalSks: 14.0,
    avgSemesterSks: 14.0,
    isChange: false,
  },
  {
    name: 'Nurul Hidayah, S.E., M.M.',
    psAkreditasiSks: 8.0,
    psLainDalamPtSks: 2.0,
    psLainLuarPtSks: 0.0,
    penelitianSks: 2.0,
    pkmSks: 1.0,
    tugasTambahanSks: 1.0,
    totalSks: 14.0,
    avgSemesterSks: 14.0,
    isChange: false,
  },
  {
    name: 'Ahmad Fauzi, S.E., M.M., CFP',
    psAkreditasiSks: 4.0,
    psLainDalamPtSks: 0.0,
    psLainLuarPtSks: 0.0,
    penelitianSks: 1.0,
    pkmSks: 1.0,
    tugasTambahanSks: 0.0,
    totalSks: 6.0,
    avgSemesterSks: 6.0,
    isChange: false,
  },
];

// 9. Sub-Tab 3: Bab III.3 Luaran Penelitian dan PkM Dosen (Tabel 3.3.1 s.d 3.3.3)
const DEFAULT_RESEARCH_OUTCOMES = [
  {
    judul: 'Model Manajemen Strategik Penguatan Resiliensi Usaha Mikro Berbasis Kearifan Lokal Sulawesi Selatan',
    tahun: 2024,
    jenisLuaran: 'Publikasi Ilmiah & HKI Hak Cipta',
    sumberBiayaPtMandiri: 1,
    sumberBiayaLuarPt: 0,
    sumberBiayaLuarNegeri: 0,
    publikasiTidakTerakreditasi: 0,
    publikasiNasionalTerakreditasi: 1,
    publikasiInternasional: 0,
    publikasiInternasionalBereputasi: 0,
    seminarWilayah: 0,
    seminarNasional: 1,
    seminarInternasional: 0,
    tulisanMediaWilayah: 0,
    tulisanMediaNasional: 1,
    tulisanMediaInternasional: 0,
    pagelaranWilayah: 0,
    pagelaranNasional: 0,
    pagelaranInternasional: 0,
    isChange: false,
  },
  {
    judul: 'Analisis Faktor Penentu Efisiensi Keuangan dan Kinerja Koperasi Syariah di Kota Makassar',
    tahun: 2023,
    jenisLuaran: 'Publikasi Jurnal SINTA 2',
    sumberBiayaPtMandiri: 0,
    sumberBiayaLuarPt: 1,
    sumberBiayaLuarNegeri: 0,
    publikasiTidakTerakreditasi: 0,
    publikasiNasionalTerakreditasi: 1,
    publikasiInternasional: 0,
    publikasiInternasionalBereputasi: 0,
    seminarWilayah: 0,
    seminarNasional: 1,
    seminarInternasional: 0,
    tulisanMediaWilayah: 1,
    tulisanMediaNasional: 0,
    tulisanMediaInternasional: 0,
    pagelaranWilayah: 0,
    pagelaranNasional: 0,
    pagelaranInternasional: 0,
    isChange: false,
  },
  {
    judul: 'Buku Ajar: Manajemen Sumber Daya Manusia dan Kepemimpinan Organisasi Sektor Bisnis',
    tahun: 2024,
    jenisLuaran: 'Buku Ber-ISBN (Deepublish Publisher)',
    sumberBiayaPtMandiri: 1,
    sumberBiayaLuarPt: 0,
    sumberBiayaLuarNegeri: 0,
    publikasiTidakTerakreditasi: 0,
    publikasiNasionalTerakreditasi: 0,
    publikasiInternasional: 0,
    publikasiInternasionalBereputasi: 0,
    seminarWilayah: 1,
    seminarNasional: 0,
    seminarInternasional: 0,
    tulisanMediaWilayah: 0,
    tulisanMediaNasional: 0,
    tulisanMediaInternasional: 0,
    pagelaranWilayah: 0,
    pagelaranNasional: 0,
    pagelaranInternasional: 0,
    isChange: false,
  },
  {
    judul: 'Digital Marketing Adoption and Competitive Advantage of Culinary SMEs in Coastal Makassar',
    tahun: 2024,
    jenisLuaran: 'Jurnal Internasional Bereputasi',
    sumberBiayaPtMandiri: 1,
    sumberBiayaLuarPt: 0,
    sumberBiayaLuarNegeri: 0,
    publikasiTidakTerakreditasi: 0,
    publikasiNasionalTerakreditasi: 0,
    publikasiInternasional: 1,
    publikasiInternasionalBereputasi: 1,
    seminarWilayah: 0,
    seminarNasional: 0,
    seminarInternasional: 1,
    tulisanMediaWilayah: 0,
    tulisanMediaNasional: 0,
    tulisanMediaInternasional: 0,
    pagelaranWilayah: 0,
    pagelaranNasional: 0,
    pagelaranInternasional: 0,
    isChange: false,
  },
];

// 10. Sub-Tab 3: Bab III.3 Tabel Sitasi Dosen (Tabel 3.3.5)
const DEFAULT_CITATIONS = [
  {
    judulArtikel: 'Strategi Pengembangan Bisnis UMKM Berkelanjutan Berbasis Keunggulan Kompetitif di Sulawesi Selatan',
    tahunTerbit: 2022,
    penulis: 'Idris, M., Rahmawati',
    jenisPublikasi: 'Jurnal Manajemen dan Kewirausahaan (SINTA 2)',
    sitasiTs2: 6,
    sitasiTs1: 9,
    sitasiTs: 13,
    linkArtikel: 'https://doi.org/10.9744/jmk.24.2.145-156',
    isChange: false,
  },
  {
    judul: 'Financial Literacy and Performance of Sharia Microfinance Institutions in Eastern Indonesia',
    tahunTerbit: 2021,
    penulis: 'Rahmawati, Said, H. M.',
    jenisPublikasi: 'International Journal of Islamic Economics',
    sitasiTs2: 4,
    sitasiTs1: 7,
    sitasiTs: 11,
    linkArtikel: 'https://doi.org/10.18326/ijie.v13i2.89-102',
    isChange: false,
  },
  {
    judul: 'Pengaruh Kepemimpinan Transformasional dan Budaya Organisasi terhadap Kinerja Karyawan Sektor Jasa Perbankan',
    tahunTerbit: 2023,
    penulis: 'Said, H. M., Hidayah, N.',
    jenisPublikasi: 'Jurnal Mirai Management (SINTA 3)',
    sitasiTs2: 2,
    sitasiTs1: 5,
    sitasiTs: 8,
    linkArtikel: 'https://doi.org/10.37476/jmm.v8i1.218',
    isChange: false,
  },
];

// 11. Sub-Tab 3: Bab III.3 Tabel Luaran Mahasiswa (Tabel 3.3.7)
const DEFAULT_STUDENT_OUTCOMES = [
  {
    judulLuaran: 'Juara 2 Kompetisi Rencana Bisnis Mahasiswa Tingkat Nasional (Business Plan Competition 2024)',
    tahun: 2024,
    namaMahasiswa: 'Andi Muh. Farhan, Resky Amalia, Sitti Nurhaliza',
    jenisLuaran: 'Prestasi Kejuaraan Nasional & Prototype Bisnis',
    buktiLuaran: 'https://stimi.ac.id/prestasi/bpc-nasional-2024.pdf',
    isChange: false,
  },
  {
    judul: 'Analisis Minat Generasi Z Menggunakan Layanan Quick Response Code Indonesian Standard (QRIS) pada Usaha Kuliner',
    tahun: 2024,
    namaMahasiswa: 'Muhammad Taufiq, Dr. Muhammad Idris',
    jenisLuaran: 'Publikasi Jurnal Mahasiswa Terakreditasi SINTA 4',
    buktiLuaran: 'https://journal.stimi.ac.id/index.php/manajemen/article/view/142',
    isChange: false,
  },
  {
    judul: 'HKI Hak Cipta Desain Kemasan dan Merk Dagang Produk Olahan Bandeng Asap Binaan Mahasiswa KKN STIMI',
    tahun: 2023,
    namaMahasiswa: 'Nurul Annisa, Fajar Pratama',
    jenisLuaran: 'Surat Pencatatan Hak Cipta Kemenkumham No. EC0020239841',
    buktiLuaran: 'https://dgip.go.id/sertifikat/EC0020239841.pdf',
    isChange: false,
  },
];

// 12. Sub-Tab 3: Bab III.3 Rekonsiliasi Jumlah Mahasiswa Aktif (Tabel 3.3.9)
const DEFAULT_MAHASISWA_AKTIF = [
  {
    semester: 'Ganjil' as const,
    mhsAktif: 485,
    mhsPdDikti: 485,
    selisih: 0,
    isChange: false,
  },
  {
    semester: 'Genap' as const,
    mhsAktif: 472,
    mhsPdDikti: 472,
    selisih: 0,
    isChange: false,
  },
];

// 13. Sub-Tab 4: Identitas Tim Penyusun Evaluasi Diri (6 Orang)
const DEFAULT_TIM_PENYUSUN = [
  {
    nama: 'Drs. H. M. Said, M.Si',
    nikNidn: 'NIDN. 0918077501',
    jabatan: 'Ketua Program Studi S1 Manajemen',
    peran: 'Ketua Tim Taskforce',
  },
  {
    nama: 'Dr. Hj. Rahmawati, S.E., M.Si.',
    nikNidn: 'NIDN. 0918088002',
    jabatan: 'Sekretaris Program Studi S1 Manajemen',
    peran: 'Sekretaris Tim',
  },
  {
    nama: 'Dr. Muhammad Idris, S.E., M.M.',
    nikNidn: 'NIDN. 0912047501',
    jabatan: 'Dosen Tetap / Koordinator Bidang Kurikulum & Riset',
    peran: 'Anggota Tim (Penanggung Jawab CPL & SDM)',
  },
  {
    nama: 'Dr. Nurul Fadilah, SE., MM',
    nikNidn: 'NIDN. 0915088201',
    jabatan: 'Ketua Lembaga Penjaminan Mutu (LPM)',
    peran: 'Anggota Tim (Penanggung Jawab SPMI & Audit)',
  },
  {
    nama: 'Nurul Hidayah, S.E., M.M.',
    nikNidn: 'NIDN. 0922039004',
    jabatan: 'Dosen Tetap / Koordinator Kemahasiswaan & Tracer',
    peran: 'Anggota Tim (Penanggung Jawab Tridharma & Luaran)',
  },
  {
    nama: 'Ahmad Fauzi, S.E., M.M., CFP',
    nikNidn: 'NIDN. 0925118503',
    jabatan: 'Dosen Praktisi Perbankan / Hubungan Industri',
    peran: 'Anggota Tim (Kemitraan DUDI & Rekognisi Praktisi)',
  },
];

// 14. Sub-Tab 4: Identitas Pengusul & Sampul (Sesuai Format Resmi Halaman Muka LAMEMBA)
const DEFAULT_IDENTITAS_PENGUSUL = {
  perguruanTinggi: 'Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar',
  unitPengelola: 'Jurusan Manajemen / Sekolah Tinggi Ilmu Manajemen Indonesia',
  jenisProgram: 'Sarjana (S1)',
  namaProdi: 'Program Studi Sarjana Manajemen',
  alamat: 'Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan 90245',
  telepon: '0411-588123',
  emailWeb: 'info@stimiyapmi.ac.id / www.stimiyapmi.ac.id',
  nomorSkPendirianPt: 'SK Mendikbud RI No. 042/D/O/1997',
  tanggalSkPendirianPt: '1997-07-25',
  pejabatSkPendirianPt: 'Menteri Pendidikan dan Kebudayaan RI',
  nomorSkPembukaanPs: 'SK Dirjen Dikti No. 219/DIKTI/Kep/1999',
  tanggalSkPembukaanPs: '1999-05-18',
  pejabatSkPembukaanPs: 'Direktur Jenderal Pendidikan Tinggi',
  tahunPertamaMenerimaMhs: '1998',
  peringkatAkreditasiTerbaru: 'Baik Sekali',
  nomorSkLam: 'SK LAMEMBA No. 933/DE/A.5/AR.10/XII/2023',
  tanggalKadaluarsa: '2028-12-28',
  kota: 'Makassar',
  tahunDokumen: '2025',
  logoUrl: '/logo_stimi.png',
};

// 15. Sub-Tab 4: Kata Pengantar Resmi
const DEFAULT_KATA_PENGANTAR =
  'Puji dan syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas limpahan rahmat dan karunia-Nya sehingga Dokumen Pemantauan dan Evaluasi Tahunan Akreditasi Program Studi (Lampiran DL-05) Program Studi Sarjana Manajemen Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar Tahun Akademik 2025/2026 dapat diselesaikan dengan baik.\n\nDokumen ini disusun sebagai wujud akuntabilitas institusi dalam menjalankan siklus Sistem Penjaminan Mutu Internal (SPMI) berbasis PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, dan Peningkatan) serta kepatuhan atas instrumen evaluasi berkala Lembaga Akreditasi Mandiri Ekonomi Manajemen Bisnis dan Akuntansi (LAMEMBA). Dokumen ini menyajikan pelaporan tindak lanjut rekomendasi asesor, evaluasi sasaran strategis Renstra UPPS, ketercapaian Capaian Pembelajaran Lulusan (CPL), profil kualifikasi dosen dan beban kerja EWMP, produktivitas riset dan PkM, hingga sinkronisasi data mahasiswa pada PD-Dikti.\n\nKami menyampaikan apresiasi dan terima kasih yang mendalam kepada seluruh Tim Taskforce DL-05, pimpinan perguruan tinggi, dosen tetap, tenaga kependidikan, serta mahasiswa dan pemangku kepentingan industri yang senantiasa mendukung tercapainya continuous quality improvement menuju akreditasi Unggul.';

// 16. Sub-Tab 4: Narasi Pengantar Bab I (Tindak Lanjut Rekomendasi Asesor)
const DEFAULT_NARASI_BAB_1 =
  'Bagian ini memuat penjelasan program studi atas tindak lanjut rekomendasi untuk perbaikan berkelanjutan (continuous improvement) yang telah disampaikan asesor saat Asesmen Lapangan akreditasi LAMEMBA sebelumnya, hambatan yang dihadapi di lapangan, serta solusi taktis dan hasil konkret yang telah dicapai oleh Program Studi Sarjana Manajemen STIMI YAPMI Makassar.';

// 17. Sub-Tab 4: Narasi Pengantar Bab II (Kemajuan Implementasi Strategi Renstra)
const DEFAULT_NARASI_BAB_2 =
  'Bagian ini memuat penjelasan program studi tentang capaian implementasi strategi yang tercantum pada Rencana Strategis (Renstra) atau dokumen operasional lainnya, termasuk identifikasi hambatan dan solusi inovatif yang telah dilaksanakan dalam rangka mencapai visi, misi, dan tujuan institusi, sekaligus membangun budaya mutu akademik yang kokoh.';

// 18. Sub-Tab 4: Narasi Pengantar Bab III (Evaluasi Kinerja Program Studi)
const DEFAULT_NARASI_BAB_3 =
  'Bagian ini memuat evaluasi pelaksanaan upaya perbaikan berkelanjutan baik perkembangan maupun kemajuan kinerja program studi setiap tahunnya dari 3 (tiga) pilar indikator: (1) Jaminan Pembelajaran, (2) Kecukupan dan Kualifikasi Dosen, serta (3) Luaran dan Capaian Tridharma Perguruan Tinggi yang merujuk pada integrasi data DED, DKPS, dan PD-Dikti Feeder.';

// 19. Sub-Tab 4: Narasi Bab 3.1 (Jaminan Pembelajaran)
const DEFAULT_NARASI_BAB_31 =
  'Program studi menunjukkan perbaikan-perbaikan yang dilakukan secara konsisten terhadap pencapaian Capaian Pembelajaran Lulusan (CPL) mahasiswa berdasarkan pemenuhan kriteria 6 butir 1 sampai 4 LAMEMBA, mencakup penjaminan mutu kurikulum OBE, asesmen rubrik case-method dan team-based project, serta audit ketercapaian kompetensi lulusan.';

// 20. Sub-Tab 4: Narasi Bab 3.2 (Kecukupan dan Kualifikasi Dosen)
const DEFAULT_NARASI_BAB_32 =
  'Bagian ini melampirkan pembaruan data dosen tetap dengan menggunakan data yang bersumber dari Dokumen Kinerja Program Studi (DKPS) mutakhir dan pangkalan data PD-Dikti, meliputi status kepegawaian, kesesuaian bidang keahlian, sertifikasi profesi/BNSP, rekognisi kontribusi intelektual, dan kesesuaian EWMP pada rentang 12-16 SKS.';

// 21. Sub-Tab 4: Narasi Bab 3.3 (Luaran dan Capaian Tridharma)
const DEFAULT_NARASI_BAB_33 =
  'Bagian ini memuat pembaruan produktivitas tridharma dosen dan mahasiswa yang mencakup luaran publikasi ilmiah, perolehan HKI/Hak Cipta, sitasi karya ilmiah dosen pada TS-2 s.d TS, prestasi kejuaraan mahasiswa, serta rekonsiliasi data mahasiswa aktif terhadap feeder PD-Dikti tanpa selisih.';

// 22. Sub-Tab 4: Narasi Penutup & Komitmen Mutu
const DEFAULT_PENUTUP =
  'Dokumen Pemantauan dan Evaluasi Tahunan Akreditasi Program Studi (Lampiran DL-05) ini merefleksikan transparansi dan komitmen terpadu seluruh sivitas akademika Program Studi Sarjana Manajemen STIMI YAPMI Makassar dalam menjaga mutu tridharma perguruan tinggi. Seluruh capaian, kendala, dan rekomendasi tindak lanjut yang telah dipetakan akan menjadi dasar perbaikan berkala pada siklus penjaminan mutu berikutnya guna memastikan ketercapaian peringkat akreditasi Unggul.';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get('academicYear') || '2025/2026';

    let dl05 = await LamembaDl05.findOne({ academicYear });
    if (!dl05) {
      dl05 = await LamembaDl05.findOne().sort({ createdAt: -1 });
    }

    // Ambil berkas bukti fisik digital surat rekomendasi tahunan dari AccreditationEvidence
    const uploadedLetters = await AccreditationEvidence.find({
      targetType: 'PRODI',
      itemKey: { $regex: '^dl05-surat-rekomendasi-tahun-' },
    }).lean();

    const lettersEvidenceMap = new Map<string, any>();
    uploadedLetters.forEach((ev: any) => {
      lettersEvidenceMap.set(ev.itemKey, ev);
    });

    if (!dl05) {
      dl05 = new LamembaDl05({
        academicYear,
        prodiName: 'Program Studi S1 Manajemen',
        submissionDate: new Date(),
        status: 'SUBMITTED',
        selectedYearIndex: 1,
        annualLetters: DEFAULT_ANNUAL_LETTERS,
        assessorFollowUpsList: DEFAULT_ASSESSOR_FOLLOW_UPS_LIST,
        renstraProgressList: DEFAULT_RENSTRA_PROGRESS_LIST,
        learningAssuranceItems: DEFAULT_LEARNING_ITEMS,
        dosenProfiles: DEFAULT_DOSEN_PROFILES,
        dosenExpertise: DEFAULT_DOSEN_EXPERTISE,
        kontribusiIntelektualDosen: DEFAULT_KONTRIBUSI_INTELEKTUAL,
        ewmpList: DEFAULT_EWMP_LIST,
        researchOutcomes: DEFAULT_RESEARCH_OUTCOMES,
        citationsList: DEFAULT_CITATIONS,
        studentOutcomes: DEFAULT_STUDENT_OUTCOMES,
        mahasiswaAktifList: DEFAULT_MAHASISWA_AKTIF,
        timPenyusun: DEFAULT_TIM_PENYUSUN,
        identitasPengusul: DEFAULT_IDENTITAS_PENGUSUL,
        kataPengantar: DEFAULT_KATA_PENGANTAR,
        narasiBab1: DEFAULT_NARASI_BAB_1,
        narasiBab2: DEFAULT_NARASI_BAB_2,
        narasiBab3: DEFAULT_NARASI_BAB_3,
        narasiBab31: DEFAULT_NARASI_BAB_31,
        narasiBab32: DEFAULT_NARASI_BAB_32,
        narasiBab33: DEFAULT_NARASI_BAB_33,
        penutup: DEFAULT_PENUTUP,
        perbaikanBerkelanjutanJaminanPembelajaran:
          'Evaluasi berkala siklus PPEPP jaminan pembelajaran telah menghasilkan pembaruan kurikulum berbasis OBE terstandar dan peningkatan ketercapaian kompetensi lulusan di atas 85%.',
        perbaikanBerkelanjutanDosen:
          'Alokasi beban kerja dosen diarahkan seimbang pada rentang 12-14 SKS dan didukung pembiayaan sertifikasi kompetensi industri serta percepatan kenaikan jabatan fungsional Lektor Kepala.',
        perbaikanBerkelanjutanTridharma:
          'Program hilirisasi riset dosen ke pengabdian masyarakat diwujudkan dalam pembinaan UMKM serta penguatan sitasi ilmiah melalui insentif publikasi bereputasi nasional dan internasional.',
        perbaikanBerkelanjutanKemahasiswaan:
          'Sinkronisasi 100% data mahasiswa aktif kampus ke PD-Dikti Feeder dilakukan setiap awal semester tanpa selisih serta memfasilitasi rekognisi prestasi wirausaha mahasiswa.',
      });
      await dl05.save();
    }

    // Pastikan seluruh array sub-tab terisi default jika field belum terdefinisi (null/undefined)
    if (dl05.annualLetters === undefined || dl05.annualLetters === null) {
      dl05.annualLetters = DEFAULT_ANNUAL_LETTERS as any;
    }
    if (dl05.assessorFollowUpsList === undefined || dl05.assessorFollowUpsList === null) {
      dl05.assessorFollowUpsList = DEFAULT_ASSESSOR_FOLLOW_UPS_LIST as any;
    }
    if (dl05.renstraProgressList === undefined || dl05.renstraProgressList === null) {
      dl05.renstraProgressList = DEFAULT_RENSTRA_PROGRESS_LIST as any;
    }
    if (dl05.learningAssuranceItems === undefined || dl05.learningAssuranceItems === null) {
      dl05.learningAssuranceItems = DEFAULT_LEARNING_ITEMS as any;
    }
    if (dl05.dosenProfiles === undefined || dl05.dosenProfiles === null) {
      dl05.dosenProfiles = DEFAULT_DOSEN_PROFILES as any;
    }
    if (dl05.dosenExpertise === undefined || dl05.dosenExpertise === null) {
      dl05.dosenExpertise = DEFAULT_DOSEN_EXPERTISE as any;
    }
    if (dl05.kontribusiIntelektualDosen === undefined || dl05.kontribusiIntelektualDosen === null) {
      dl05.kontribusiIntelektualDosen = DEFAULT_KONTRIBUSI_INTELEKTUAL as any;
    }
    if (dl05.ewmpList === undefined || dl05.ewmpList === null) {
      dl05.ewmpList = DEFAULT_EWMP_LIST as any;
    }
    if (dl05.researchOutcomes === undefined || dl05.researchOutcomes === null) {
      dl05.researchOutcomes = DEFAULT_RESEARCH_OUTCOMES as any;
    }
    if (dl05.citationsList === undefined || dl05.citationsList === null) {
      dl05.citationsList = DEFAULT_CITATIONS as any;
    }
    if (dl05.studentOutcomes === undefined || dl05.studentOutcomes === null) {
      dl05.studentOutcomes = DEFAULT_STUDENT_OUTCOMES as any;
    }
    if (dl05.mahasiswaAktifList === undefined || dl05.mahasiswaAktifList === null) {
      dl05.mahasiswaAktifList = DEFAULT_MAHASISWA_AKTIF as any;
    }
    if (dl05.timPenyusun === undefined || dl05.timPenyusun === null) {
      dl05.timPenyusun = DEFAULT_TIM_PENYUSUN as any;
    }
    if (dl05.identitasPengusul === undefined || dl05.identitasPengusul === null) {
      dl05.identitasPengusul = DEFAULT_IDENTITAS_PENGUSUL as any;
    }
    if (dl05.kataPengantar === undefined || dl05.kataPengantar === null) {
      dl05.kataPengantar = DEFAULT_KATA_PENGANTAR;
    }
    if (dl05.narasiBab1 === undefined || dl05.narasiBab1 === null) {
      dl05.narasiBab1 = DEFAULT_NARASI_BAB_1;
    }
    if (dl05.narasiBab2 === undefined || dl05.narasiBab2 === null) {
      dl05.narasiBab2 = DEFAULT_NARASI_BAB_2;
    }
    if (dl05.narasiBab3 === undefined || dl05.narasiBab3 === null) {
      dl05.narasiBab3 = DEFAULT_NARASI_BAB_3;
    }
    if (dl05.narasiBab31 === undefined || dl05.narasiBab31 === null) {
      dl05.narasiBab31 = DEFAULT_NARASI_BAB_31;
    }
    if (dl05.narasiBab32 === undefined || dl05.narasiBab32 === null) {
      dl05.narasiBab32 = DEFAULT_NARASI_BAB_32;
    }
    if (dl05.narasiBab33 === undefined || dl05.narasiBab33 === null) {
      dl05.narasiBab33 = DEFAULT_NARASI_BAB_33;
    }
    if (dl05.penutup === undefined || dl05.penutup === null) {
      dl05.penutup = DEFAULT_PENUTUP;
    }

    // Sinkronisasi otomatis file bukti digital ke annualLetters
    if (Array.isArray(dl05.annualLetters)) {
      dl05.annualLetters.forEach((letItem: any) => {
        const key = `dl05-surat-rekomendasi-tahun-${letItem.yearIndex}`;
        const uploaded = lettersEvidenceMap.get(key);
        if (uploaded && uploaded.fileUrl) {
          letItem.fileUrl = uploaded.fileUrl;
          letItem.fileName = uploaded.originalName || uploaded.fileName;
          letItem.uploadedAt = uploaded.updatedAt || uploaded.createdAt;
        }
      });
    }

    return NextResponse.json({ success: true, data: dl05 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      academicYear,
      selectedYearIndex,
      annualLetters,
      assessorFollowUpsList,
      renstraProgressList,
      learningAssuranceItems,
      perbaikanBerkelanjutanJaminanPembelajaran,
      dosenProfiles,
      dosenExpertise,
      kontribusiIntelektualDosen,
      ewmpList,
      perbaikanBerkelanjutanDosen,
      researchOutcomes,
      citationsList,
      studentOutcomes,
      mahasiswaAktifList,
      perbaikanBerkelanjutanTridharma,
      perbaikanBerkelanjutanKemahasiswaan,
      timPenyusun,
      identitasPengusul,
      kataPengantar,
      narasiBab1,
      narasiBab2,
      narasiBab3,
      narasiBab31,
      narasiBab32,
      narasiBab33,
      penutup,
      status,
      // legacy fields
      assessorFollowUps,
      renstraProgress,
      learningAssurance,
      facultySufficiency,
      tridharmaOutcomes,
    } = body;

    await connectToDatabase();
    let dl05 = await LamembaDl05.findOne({ academicYear: academicYear || '2025/2026' });

    if (!dl05) {
      dl05 = new LamembaDl05({
        academicYear: academicYear || '2025/2026',
        prodiName: 'Program Studi S1 Manajemen',
        submissionDate: new Date(),
        status: status || 'SUBMITTED',
      });
    }

    if (selectedYearIndex !== undefined) dl05.selectedYearIndex = selectedYearIndex;
    if (annualLetters !== undefined) {
      dl05.annualLetters = annualLetters;
      dl05.markModified('annualLetters');
    }
    if (assessorFollowUpsList !== undefined) {
      dl05.assessorFollowUpsList = assessorFollowUpsList;
      dl05.markModified('assessorFollowUpsList');
    }
    if (renstraProgressList !== undefined) {
      dl05.renstraProgressList = renstraProgressList;
      dl05.markModified('renstraProgressList');
    }
    if (learningAssuranceItems !== undefined) {
      dl05.learningAssuranceItems = learningAssuranceItems;
      dl05.markModified('learningAssuranceItems');
    }
    if (perbaikanBerkelanjutanJaminanPembelajaran !== undefined)
      dl05.perbaikanBerkelanjutanJaminanPembelajaran = perbaikanBerkelanjutanJaminanPembelajaran;
    if (dosenProfiles !== undefined) {
      dl05.dosenProfiles = dosenProfiles;
      dl05.markModified('dosenProfiles');
    }
    if (dosenExpertise !== undefined) {
      dl05.dosenExpertise = dosenExpertise;
      dl05.markModified('dosenExpertise');
    }
    if (kontribusiIntelektualDosen !== undefined) {
      dl05.kontribusiIntelektualDosen = kontribusiIntelektualDosen;
      dl05.markModified('kontribusiIntelektualDosen');
    }
    if (ewmpList !== undefined) {
      dl05.ewmpList = ewmpList;
      dl05.markModified('ewmpList');
    }
    if (perbaikanBerkelanjutanDosen !== undefined)
      dl05.perbaikanBerkelanjutanDosen = perbaikanBerkelanjutanDosen;
    if (researchOutcomes !== undefined) {
      dl05.researchOutcomes = researchOutcomes;
      dl05.markModified('researchOutcomes');
    }
    if (citationsList !== undefined) {
      dl05.citationsList = citationsList;
      dl05.markModified('citationsList');
    }
    if (studentOutcomes !== undefined) {
      dl05.studentOutcomes = studentOutcomes;
      dl05.markModified('studentOutcomes');
    }
    if (mahasiswaAktifList !== undefined) {
      dl05.mahasiswaAktifList = mahasiswaAktifList;
      dl05.markModified('mahasiswaAktifList');
    }
    if (perbaikanBerkelanjutanTridharma !== undefined)
      dl05.perbaikanBerkelanjutanTridharma = perbaikanBerkelanjutanTridharma;
    if (perbaikanBerkelanjutanKemahasiswaan !== undefined)
      dl05.perbaikanBerkelanjutanKemahasiswaan = perbaikanBerkelanjutanKemahasiswaan;
    if (timPenyusun !== undefined) {
      dl05.timPenyusun = timPenyusun;
      dl05.markModified('timPenyusun');
    }
    if (identitasPengusul !== undefined) {
      dl05.identitasPengusul = identitasPengusul;
      dl05.markModified('identitasPengusul');
    }
    if (kataPengantar !== undefined) dl05.kataPengantar = kataPengantar;
    if (narasiBab1 !== undefined) dl05.narasiBab1 = narasiBab1;
    if (narasiBab2 !== undefined) dl05.narasiBab2 = narasiBab2;
    if (narasiBab3 !== undefined) dl05.narasiBab3 = narasiBab3;
    if (narasiBab31 !== undefined) dl05.narasiBab31 = narasiBab31;
    if (narasiBab32 !== undefined) dl05.narasiBab32 = narasiBab32;
    if (narasiBab33 !== undefined) dl05.narasiBab33 = narasiBab33;
    if (penutup !== undefined) dl05.penutup = penutup;
    if (status !== undefined) dl05.status = status;

    // Legacy fields update
    if (assessorFollowUps) dl05.assessorFollowUps = assessorFollowUps;
    if (renstraProgress) dl05.renstraProgress = renstraProgress;
    if (learningAssurance) dl05.learningAssurance = learningAssurance;
    if (facultySufficiency) dl05.facultySufficiency = facultySufficiency;
    if (tridharmaOutcomes) dl05.tridharmaOutcomes = tridharmaOutcomes;

    await dl05.save();

    return NextResponse.json({ success: true, data: dl05 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  return POST(req);
}
