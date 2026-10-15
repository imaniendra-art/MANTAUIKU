import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { LamembaDl05, AccreditationEvidence } from '@/models/Accreditation';

export const dynamic = 'force-dynamic';

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

const DEFAULT_LEARNING_ITEMS = [
  {
    nomor: 1,
    indikator:
      'UPPS/PS menunjukkan bukti pengukuran langsung atas ketercapaian kompetensi (CPL) mahasiswa dengan menggunakan pedoman standar pemenuhan capaian pembelajaran (rubrik) dan instrumen yang valid dan handal dengan metode yang relevan dalam mengukur ketercapaian kompetensi (CPL) mahasiswa.',
    upayaTahun1: 'Penyusunan rubrik asesmen CPL untuk 12 mata kuliah keahlian manajemen dan sosialisasi kepada seluruh dosen pengampu.',
    hasilTahun1: 'Tersedia portofolio pengukuran langsung CPL semester ganjil dan genap dengan rata-rata ketercapaian 84.5%.',
    upayaTahun2: 'Perluasan rubrik CPL berbasis studi kasus (case method) dan integrasi sistem asesmen ke dalam LMS kampus.',
    hasilTahun2: 'Ketercapaian CPL langsung meningkat menjadi 86.8% dan terpetakan per sub-CPL mahasiswa.',
    upayaTahun3: '',
    hasilTahun3: '',
    upayaTahun4: '',
    hasilTahun4: '',
  },
  {
    nomor: 2,
    indikator:
      'UPPS/PS menunjukkan bukti intervensi sebagai tindak lanjut hasil pengukuran ketercapaian kompetensi (CPL) mahasiswa, untuk perbaikan kualitas pembelajaran dan tingkat pemenuhan CPL.',
    upayaTahun1: 'Pelaksanaan lokakarya perbaikan metode pembelajaran berbasis proyek dan program tutorial sebaya untuk mata kuliah kuantitatif.',
    hasilTahun1: 'Persentase kelulusan mahasiswa pada mata kuliah Manajemen Keuangan dan Operasional meningkat 15%.',
    upayaTahun2: 'Restrukturisasi tugas terstruktur RPS dengan pendekatan Continuous Quality Improvement (CQI).',
    hasilTahun2: 'Tingkat remidi mahasiswa menurun drastis menjadi di bawah 8% dari total peserta kuliah.',
    upayaTahun3: '',
    hasilTahun3: '',
    upayaTahun4: '',
    hasilTahun4: '',
  },
  {
    nomor: 3,
    indikator:
      'UPPS/PS melakukan pengukuran tidak langsung atas ketercapaian kompetensi (CPL) mahasiswa, antara lain melalui survey pengguna maupun studi pelacakan lulusan (tracer study) dan mempertimbangkan masukan dari hasil pengukuran tersebut ke dalam intervensi perbaikan kualitas pembelajaran.',
    upayaTahun1: 'Pelaksanaan tracer study tahunan secara daring dan survei kepuasan mitra pengguna lulusan (perbankan, UMKM, ritel).',
    hasilTahun1: 'Response rate tracer mencapai 78.4% dengan waktu tunggu rata-rata kerja 3.4 bulan.',
    upayaTahun2: 'FGD kurikulum dengan asosiasi industri dan alumni untuk menyerap masukan penguasaan teknologi digital dan analisis data bisnis.',
    hasilTahun2: 'Penambahan muatan mata kuliah Digital Marketing & Business Analytics pada kurikulum prodi.',
    upayaTahun3: '',
    hasilTahun3: '',
    upayaTahun4: '',
    hasilTahun4: '',
  },
];

const DEFAULT_DOSEN_PROFILES = [
  {
    name: 'Dr. Muhammad Idris, S.E., M.M.',
    status: 'Tetap' as const,
    nidn: '0912047501',
    jabatanAkademik: 'Lektor Kepala',
    jalur: 'Akademisi' as const,
    namaPerusahaan: '',
    catatan: '',
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
    catatan: '',
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
    catatan: 'Dosen Praktisi Industri Perbankan (Rasio Teori:Praktek 50:50)',
    isChange: false,
    isKeluar: false,
  },
  {
    name: 'Nurul Hidayah, S.E., M.M.',
    status: 'Tetap' as const,
    nidn: '0905038804',
    jabatanAkademik: 'Asisten Ahli',
    jalur: 'Akademisi' as const,
    namaPerusahaan: '',
    catatan: 'Studi Lanjut S3 Ilmu Manajemen (Tahun ke-2)',
    isChange: true,
    isKeluar: false,
  },
];

const DEFAULT_EWMP_LIST = [
  {
    name: 'Dr. Muhammad Idris, S.E., M.M.',
    psAkreditasiSks: 8,
    psLainDalamPtSks: 2,
    psLainLuarPtSks: 0,
    penelitianSks: 3,
    pkmSks: 2,
    tugasTambahanSks: 3,
    totalSks: 18,
    avgSemesterSks: 16.5,
    isChange: false,
  },
  {
    name: 'Dr. Hj. Rahmawati, S.E., M.Si.',
    psAkreditasiSks: 9,
    psLainDalamPtSks: 0,
    psLainLuarPtSks: 0,
    penelitianSks: 3,
    pkmSks: 2,
    tugasTambahanSks: 0,
    totalSks: 14,
    avgSemesterSks: 14.0,
    isChange: false,
  },
  {
    name: 'Ahmad Fauzi, S.E., M.M., CFP',
    psAkreditasiSks: 4,
    psLainDalamPtSks: 0,
    psLainLuarPtSks: 0,
    penelitianSks: 0,
    pkmSks: 1,
    tugasTambahanSks: 0,
    totalSks: 5,
    avgSemesterSks: 5.0,
    isChange: false,
  },
];

const DEFAULT_KONTRIBUSI_INTELEKTUAL = [
  {
    name: 'Dr. Muhammad Idris, S.E., M.M.',
    rekognisiPendidikan: 'Visiting Lecturer di FEB UNHAS & Pemateri Lokakarya Kurikulum OBE',
    rekognisiPraktik: 'Konsultan Ahli Manajemen Strategis Pemprov Sulsel & Asesor BNSP',
    rekognisiPenelitian: 'Penulis Utama Jurnal Terakreditasi SINTA 2 (3 Artikel, 28 Sitasi) & Reviewer Jurnal Nasional',
    rekognisiSosial: 'Ketua Dewan Pembina Asosiasi Pengusaha Muda Sulsel & Pengarah Pendampingan UMKM',
    isChange: false,
  },
  {
    name: 'Dr. Hj. Rahmawati, S.E., M.Si.',
    rekognisiPendidikan: 'Narasumber Pelatihan Analisis Laporan Keuangan bagi Mahasiswa dan Alumni',
    rekognisiPraktik: 'Tenaga Ahli Audit Internal Koperasi & Dewan Pengawas Syariah BMT',
    rekognisiPenelitian: 'Publikasi Jurnal Terakreditasi SINTA 3 & Penerima Hibah Penelitian Kemendikbudristek',
    rekognisiSosial: 'Fasilitator Pemberdayaan Ekonomi Perempuan Pesisir Maros',
    isChange: false,
  },
];

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

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get('academicYear') || '2025/2026';

    let dl05 = await LamembaDl05.findOne({ academicYear });
    if (!dl05) {
      dl05 = await LamembaDl05.findOne().sort({ createdAt: -1 });
    }

    // Ambil bukti berkas digital surat rekomendasi tahunan dari AccreditationEvidence
    const uploadedLetters = await AccreditationEvidence.find({
      targetType: 'PRODI',
      itemKey: { $regex: '^dl05-surat-rekomendasi-tahun-' },
    }).lean();

    const lettersEvidenceMap = new Map<string, any>();
    uploadedLetters.forEach((ev) => {
      lettersEvidenceMap.set(ev.itemKey, ev);
    });

    // Inisialisasi dokumen DL-05 baru jika belum ada di database
    if (!dl05) {
      dl05 = await LamembaDl05.create({
        academicYear,
        prodiName: 'Program Studi S1 Manajemen',
        submissionDate: new Date(),
        status: 'SUBMITTED',
        selectedYearIndex: 1,
        annualLetters: DEFAULT_ANNUAL_LETTERS,
        learningAssuranceItems: DEFAULT_LEARNING_ITEMS,
        perbaikanBerkelanjutanJaminanPembelajaran:
          'Prodi secara berkala setiap semester melakukan telaah ketercapaian CPL dan melakukan modifikasi RPS berbasis OBE.',
        dosenProfiles: DEFAULT_DOSEN_PROFILES,
        ewmpList: DEFAULT_EWMP_LIST,
        perbaikanBerkelanjutanDosen:
          'Pemenuhan dosen praktisi industri sebesar 20% dan peningkatan kualifikasi 2 dosen tetap yang sedang menyelesaikan studi S3 Doktor.',
        kontribusiIntelektualDosen: DEFAULT_KONTRIBUSI_INTELEKTUAL,
        perbaikanBerkelanjutanTridharma:
          'Peningkatan jumlah publikasi artikel dosen pada jurnal terakreditasi SINTA 2-3 dan keterlibatan mahasiswa dalam kegiatan PkM.',
        mahasiswaAktifList: DEFAULT_MAHASISWA_AKTIF,
        perbaikanBerkelanjutanKemahasiswaan:
          'Sinkronisasi 100% data mahasiswa aktif SIAKAD kampus dengan data pangkalan PD-Dikti tanpa selisih (zero discrepancy).',
        // Fallback fields
        assessorFollowUps: [
          {
            recommendation: 'Tingkatkan persentase dosen tetap yang berkualifikasi Doktor (S3) dan berpangkat Lektor Kepala.',
            actionTaken: 'Mendelegasikan 2 dosen studi lanjut S3 dan memfasilitasi pengajuan Jafung Lektor Kepala ke LLDIKTI.',
            status: 'SEDANG_BERJALAN',
          },
          {
            recommendation: 'Perkuat implementasi kurikulum OBE dengan perangkat asesmen CPL terukur per mata kuliah.',
            actionTaken: 'Menerbitkan Buku Panduan Kurikulum OBE dan RPS Berbasis Kasus/Proyek Tim untuk seluruh mata kuliah.',
            status: 'SELESAI',
          },
        ],
        renstraProgress: [
          {
            targetName: 'Peningkatan Reputasi Akademik & Rekognisi Internasional',
            achievement: 'Terselenggaranya kolaborasi riset dengan mitra perguruan tinggi luar negeri dan student mobility.',
            obstacle: 'Keterbatasan kuota mobilitas internasional mahasiswa.',
            cqiSolution: 'Menjalin kerjasama baru dengan universitas mitra di Asia Tenggara dan penyediaan beasiswa parsial.',
          },
        ],
        learningAssurance: {
          cplAchievementPercentage: 86.8,
          obeRpsPercentage: 94.0,
          description: 'Penerapan kurikulum OBE didukung perangkat RPS studi kasus dan pengukuran langsung rubrik CPL mahasiswa.',
        },
        facultySufficiency: {
          permanentFacultyCount: 18,
          doctoralPercentage: 33.3,
          lektorHeadPercentage: 61.1,
          facultyStudentRatio: '1:26',
          description: 'Kecukupan dosen tetap linier terpenuhi dengan rata-rata EWMP 14-16 SKS per semester.',
        },
        tridharmaOutcomes: {
          gpaAverage: 3.48,
          avgStudyDurationMonths: 45,
          tracerStudyResponseRate: 78.4,
          waitingTimeMonths: 3.4,
          publicationsCount: 26,
          description: 'Tracer study terlaksana berkala dengan waktu tunggu kerja lulusan di bawah 4 bulan.',
        },
      });
    }

    // Pastikan struktur 4 bab dan annual letters selalu lengkap
    if (!dl05.annualLetters || dl05.annualLetters.length === 0) {
      dl05.annualLetters = DEFAULT_ANNUAL_LETTERS as any;
    }
    if (!dl05.learningAssuranceItems || dl05.learningAssuranceItems.length === 0) {
      dl05.learningAssuranceItems = DEFAULT_LEARNING_ITEMS as any;
    }
    if (!dl05.dosenProfiles || dl05.dosenProfiles.length === 0) {
      dl05.dosenProfiles = DEFAULT_DOSEN_PROFILES as any;
    }
    if (!dl05.ewmpList || dl05.ewmpList.length === 0) {
      dl05.ewmpList = DEFAULT_EWMP_LIST as any;
    }
    if (!dl05.kontribusiIntelektualDosen || dl05.kontribusiIntelektualDosen.length === 0) {
      dl05.kontribusiIntelektualDosen = DEFAULT_KONTRIBUSI_INTELEKTUAL as any;
    }
    if (!dl05.mahasiswaAktifList || dl05.mahasiswaAktifList.length === 0) {
      dl05.mahasiswaAktifList = DEFAULT_MAHASISWA_AKTIF as any;
    }

    // Sinkronisasi otomatis file bukti digital ke annualLetters
    dl05.annualLetters.forEach((letItem: any) => {
      const key = `dl05-surat-rekomendasi-tahun-${letItem.yearIndex}`;
      const uploaded = lettersEvidenceMap.get(key);
      if (uploaded && uploaded.fileUrl) {
        letItem.fileUrl = uploaded.fileUrl;
        letItem.fileName = uploaded.originalName || uploaded.fileName;
        letItem.uploadedAt = uploaded.updatedAt || uploaded.createdAt;
      }
    });

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
      learningAssuranceItems,
      perbaikanBerkelanjutanJaminanPembelajaran,
      dosenProfiles,
      ewmpList,
      perbaikanBerkelanjutanDosen,
      kontribusiIntelektualDosen,
      perbaikanBerkelanjutanTridharma,
      mahasiswaAktifList,
      perbaikanBerkelanjutanKemahasiswaan,
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
    if (annualLetters) dl05.annualLetters = annualLetters;
    if (learningAssuranceItems) dl05.learningAssuranceItems = learningAssuranceItems;
    if (perbaikanBerkelanjutanJaminanPembelajaran !== undefined)
      dl05.perbaikanBerkelanjutanJaminanPembelajaran = perbaikanBerkelanjutanJaminanPembelajaran;
    if (dosenProfiles) dl05.dosenProfiles = dosenProfiles;
    if (ewmpList) dl05.ewmpList = ewmpList;
    if (perbaikanBerkelanjutanDosen !== undefined)
      dl05.perbaikanBerkelanjutanDosen = perbaikanBerkelanjutanDosen;
    if (kontribusiIntelektualDosen) dl05.kontribusiIntelektualDosen = kontribusiIntelektualDosen;
    if (perbaikanBerkelanjutanTridharma !== undefined)
      dl05.perbaikanBerkelanjutanTridharma = perbaikanBerkelanjutanTridharma;
    if (mahasiswaAktifList) dl05.mahasiswaAktifList = mahasiswaAktifList;
    if (perbaikanBerkelanjutanKemahasiswaan !== undefined)
      dl05.perbaikanBerkelanjutanKemahasiswaan = perbaikanBerkelanjutanKemahasiswaan;
    if (status) dl05.status = status;

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
