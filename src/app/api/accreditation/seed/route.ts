import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import {
  AccreditationProfile,
  LamembaCriteria,
  LamembaDl05,
} from '@/models/Accreditation';

export async function POST() {
  try {
    await connectToDatabase();

    // 1. Seed Profiles
    const existingProfiles = await AccreditationProfile.countDocuments();
    if (existingProfiles === 0) {
      await AccreditationProfile.insertMany([
        {
          entityType: 'INSTITUSI',
          name: 'STIMI YAPMI Makassar',
          degreeLevel: 'Perguruan Tinggi',
          agency: 'BAN-PT',
          grade: 'BAIK_SEKALI',
          skNumber: 'SK BAN-PT No. 488/SK/BAN-PT/Ak/PT/VIII/2023',
          validFrom: new Date('2023-08-15'),
          validUntil: new Date('2028-08-15'),
          certificateUrl: 'https://stimi.ac.id/dokumen/sertifikat-akreditasi-institusi-2023.pdf',
          notes: 'Terakreditasi Baik Sekali oleh BAN-PT dengan masa berlaku hingga Agustus 2028.',
        },
        {
          entityType: 'PRODI',
          name: 'Program Studi S1 Manajemen',
          degreeLevel: 'Sarjana (S1)',
          agency: 'LAMEMBA',
          grade: 'BAIK_SEKALI',
          skNumber: 'SK LAMEMBA No. 128/DE/A.1/AR.8/VII/2023',
          validFrom: new Date('2023-07-20'),
          validUntil: new Date('2028-07-20'),
          certificateUrl: 'https://stimi.ac.id/dokumen/sertifikat-akreditasi-s1-manajemen-lamemba.pdf',
          notes: 'Terakreditasi Baik Sekali oleh Lembaga Akreditasi Mandiri Ekonomi Manajemen Bisnis dan Akuntansi (LAMEMBA).',
        },
      ]);
    }

    // 2. Seed 9 Kriteria LAMEMBA
    const existingCriteria = await LamembaCriteria.countDocuments();
    if (existingCriteria === 0) {
      await LamembaCriteria.insertMany([
        {
          code: 'C.1',
          name: 'Visi, Misi, Tujuan, dan Strategi (VMTS)',
          weight: 5,
          score: 88,
          targetScore: 85,
          status: 'UNGGUL',
          description: 'Pemahaman sivitas akademika terhadap VMTS Prodi Manajemen sangat tinggi dan terintegrasi dalam rencana operasional tahunan.',
          strengths: ['Sosialisasi VMTS terukur berbasis survei pemahaman 92%', 'Renstra prodi selaras dengan Renstra institusi STIMI YAPMI'],
          recommendations: ['Peningkatan keterlibatan asosiasi profesi manajemen dalam reviu berkala VMTS'],
        },
        {
          code: 'C.2',
          name: 'Tata Pamong, Tata Kelola, dan Kerjasama',
          weight: 10,
          score: 86,
          targetScore: 85,
          status: 'UNGGUL',
          description: 'Sistem kepemimpinan partisipatif, penjaminan mutu SPMI siklus PPEPP berjalan aktif, dan jejaring kerjasama industri memadai.',
          strengths: ['Struktur SPMI LPM memiliki garis koordinasi langsung ke Ketua STIMI', 'Tersedia dokumen SOP tata pamong lengkap'],
          recommendations: ['Mempercepat konversi MoU kemitraan industri menjadi PKS (MoA) operasional'],
        },
        {
          code: 'C.3',
          name: 'Mahasiswa',
          weight: 10,
          score: 84,
          targetScore: 85,
          status: 'BAIK_SEKALI',
          description: 'Rasio pendaftar terhadap yang diterima sehat, layanan bimbingan konseling dan karir aktif, prestasi mahasiswa tingkat wilayah meningkat.',
          strengths: ['Sistem seleksi mahasiswa baru transparan', 'Pemberian beasiswa berprestasi dan KIP Kuliah tepat sasaran'],
          recommendations: ['Mendorong keikutsertaan mahasiswa dalam kompetisi bisnis rencana mandiri tingkat nasional (KBMK)'],
        },
        {
          code: 'C.4',
          name: 'Sumber Daya Manusia (SDM)',
          weight: 15,
          score: 82,
          targetScore: 85,
          status: 'BAIK_SEKALI',
          description: 'Kualifikasi Dosen Tetap Program Studi (DTPS) seluruhnya berkualifikasi S2/S3 dengan jabatan fungsional Lektor dan Lektor Kepala.',
          strengths: ['100% dosen tetap memiliki NIDN dan bidang ilmu linier Manajemen', 'Rasio dosen terhadap mahasiswa sangat ideal (1:24)'],
          recommendations: ['Mendorong 3 dosen yang sedang studi lanjut S3 agar segera menyelesaikan disertasi'],
        },
        {
          code: 'C.5',
          name: 'Keuangan, Sarana, dan Prasarana',
          weight: 10,
          score: 85,
          targetScore: 85,
          status: 'UNGGUL',
          description: 'Alokasi anggaran operasional pembelajaran, fasilitas laboratorium komputer bisnis, dan akses e-library jurnal internasional memadai.',
          strengths: ['Lab komputer dilengkapi software analisis data statistik', 'Ruang kelas ber-AC dengan multimedia interaktif'],
          recommendations: ['Peremajaan lisensi software analisis bisnis secara berkala'],
        },
        {
          code: 'C.6',
          name: 'Pendidikan (Kurikulum OBE & Pembelajaran)',
          weight: 20,
          score: 90,
          targetScore: 85,
          status: 'UNGGUL',
          description: 'Kurikulum telah mengadopsi Outcome-Based Education (OBE), RPS termutakhirkan, dan implementasi MBKM magang bersertifikat berjalan baik.',
          strengths: ['RPS memuat Capaian Pembelajaran Lulusan (CPL) terukur', 'Pelaksanaan metode pembelajaran studi kasus (case method) dan team-based project'],
          recommendations: ['Memperluas mata kuliah kolaborasi praktisi mengajar dari dunia perbankan/bisnis'],
        },
        {
          code: 'C.7',
          name: 'Penelitian Dosen & Mahasiswa',
          weight: 10,
          score: 81,
          targetScore: 85,
          status: 'BAIK',
          description: 'Produktivitas riset dosen tetap berjalan rutin dengan keterlibatan mahasiswa pada tema-tema manajemen keuangan dan pemasaran UMKM.',
          strengths: ['Tersedia dana hibah penelitian internal dari yayasan', 'Roadmap penelitian LPPM fokus pada penguatan ekonomi lokal'],
          recommendations: ['Meningkatkan perolehan hibah riset kompetitif nasional Kemendiktisaintek (BIMA)'],
        },
        {
          code: 'C.8',
          name: 'Pengabdian kepada Masyarakat (PkM)',
          weight: 10,
          score: 83,
          targetScore: 85,
          status: 'BAIK_SEKALI',
          description: 'Kegiatan PkM dosen dan mahasiswa aktif memberikan pendampingan manajemen keuangan dan digital marketing bagi pelaku UMKM di Makassar.',
          strengths: ['Kemitraan PkM dengan binaan UMKM binaan Dinas Koperasi Makassar', 'Keterlibatan mahasiswa dalam kegiatan PkM mencapai 35%'],
          recommendations: ['Mendorong pendaftaran Hak Kekayaan Intelektual (HKI) atas modul pelatihan PkM'],
        },
        {
          code: 'C.9',
          name: 'Luaran dan Capaian Tridharma',
          weight: 10,
          score: 87,
          targetScore: 85,
          status: 'UNGGUL',
          description: 'Rata-rata IPK lulusan 3.42, masa studi tepat waktu 3.8 tahun, response rate tracer study tinggi, dan waktu tunggu kerja lulusan 3.2 bulan.',
          strengths: ['Waktu tunggu kerja lulusan singkat (< 4 bulan)', 'Publikasi artikel ilmiah mahasiswa bersama dosen di jurnal terindeks SINTA'],
          recommendations: ['Peningkatan persentase lulusan yang berwirausaha mandiri berbasis digital'],
        },
      ]);
    }

    // 3. Seed Pemantauan Tahunan DL-05 LAMEMBA
    const existingDl05 = await LamembaDl05.countDocuments();
    if (existingDl05 === 0) {
      await LamembaDl05.create({
        academicYear: '2025/2026',
        prodiName: 'Program Studi S1 Manajemen',
        submissionDate: new Date('2026-03-01'),
        status: 'SUBMITTED',
        assessorFollowUps: [
          {
            recommendation: 'Perlu peningkatan keterlibatan praktisi industri dalam pengajaran matakuliah terapan manajemen.',
            actionTaken: 'Telah direkrut 4 orang praktisi industri (perbankan & logistik) untuk mengajar secara team-teaching.',
            status: 'SELESAI',
            evidenceUrl: 'https://drive.google.com/file/d/sk-praktisi-mengajar-2025/view',
          },
          {
            recommendation: 'Tingkatkan rasio publikasi dosen tetap di jurnal internasional bereputasi.',
            actionTaken: 'LPPM memberikan insentif publikasi Rp 7.500.000 per artikel terindeks Scopus/WoS.',
            status: 'SEDANG_BERJALAN',
            evidenceUrl: 'https://drive.google.com/file/d/sk-insentif-publikasi/view',
          },
          {
            recommendation: 'Perkuat pemantauan penyerapan lulusan melalui tracer study berkala berbasis sistem daring.',
            actionTaken: 'Integrasi modul pelacak alumni digital dan kolaborasi intensif dengan IKA STIMI YAPMI.',
            status: 'SELESAI',
            evidenceUrl: 'https://drive.google.com/file/d/laporan-tracer-study-2025/view',
          },
        ],
        renstraProgress: [
          {
            targetName: 'Renstra 2026: Akreditasi Prodi Menuju Peringkat Unggul LAMEMBA',
            achievement: 'Skor kesiapan 9 kriteria mencapai 85.1 (kategori Sangat Siap / Threshold Unggul).',
            obstacle: 'Jumlah dosen berkualifikasi S3 Doktor masih 33% (target ideal 40%).',
            cqiSolution: 'Memberikan beasiswa pendamping bagi 2 dosen tetap yang sedang menempuh program doktor ilmu manajemen.',
          },
          {
            targetName: 'Renstra 2026: Penerapan Kurikulum OBE 100% pada Seluruh Mata Kuliah',
            achievement: '38 dari 38 RPS telah mengintegrasikan pemetaan CPL dan portofolio asesmen berbasis OBE.',
            obstacle: 'Beberapa dosen baru memerlukan pelatihan penyusunan rubrik penilaian terstandar.',
            cqiSolution: 'Menyelenggarakan workshop penyusunan rubrik asesmen OBE bekerjasama dengan LPM.',
          },
        ],
        learningAssurance: {
          cplAchievementPercentage: 88,
          obeRpsPercentage: 94,
          description: 'Asesmen jaminan pembelajaran (Assurance of Learning) membuktikan 88% mahasiswa mencapai standar kelulusan CPL yang ditetapkan.',
        },
        facultySufficiency: {
          permanentFacultyCount: 18,
          doctoralPercentage: 33,
          lektorHeadPercentage: 61,
          facultyStudentRatio: '1:24',
          description: 'Seluruh dosen tetap berkualifikasi S2/S3 linear, dengan rasio dosen mahasiswa 1:24 (sangat memenuhi ambang batas LAMEMBA).',
        },
        tridharmaOutcomes: {
          gpaAverage: 3.42,
          avgStudyDurationMonths: 46,
          tracerStudyResponseRate: 78,
          waitingTimeMonths: 3.2,
          publicationsCount: 24,
          description: 'Lulusan memiliki daya saing tinggi dengan waktu tunggu kerja 3.2 bulan dan tingkat kepuasan pengguna lulusan 89%.',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Data akreditasi, 9 Kriteria LAMEMBA, dan instrumen Lampiran DL-05 berhasil di-seed!',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error seeding accreditation data:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
