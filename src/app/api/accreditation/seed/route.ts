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

    // 2. Seed 5 Kriteria LAMEMBA Edisi 2026 (SN-Dikti & 29 Indikator)
    const existingCriteria = await LamembaCriteria.countDocuments();
    if (existingCriteria === 0) {
      await LamembaCriteria.insertMany([
        {
          code: 'K.1',
          name: 'Tata Pamong dan Tata Kelola',
          weight: 15,
          score: 0,
          targetScore: 85,
          status: 'PERLU_PERBAIKAN',
          description:
            'Sistem tata pamong mendeskripsikan pengasuhan (parenting), pengawasan, pembentukan sinergi, penyediaan sumber daya, nilai-nilai VMTS, serta implementasi SPMI siklus PPEPP secara konsisten.',
          strengths: [
            'Belum ada dokumen fisik pembuktian yang diunggah ke sistem.',
          ],
          recommendations: [
            'Siapkan dokumen resmi yang diminta pada masing-masing indikator dan unggah berkasnya.',
          ],
        },
        {
          code: 'K.2',
          name: 'Pengelolaan Dosen dan Tenaga Kependidikan',
          weight: 30,
          score: 0,
          targetScore: 85,
          status: 'PERLU_PERBAIKAN',
          description:
            'Pengelolaan dosen dan tendik mencakup kecukupan dan kualifikasi dosen tetap (minimal 5 dosen linier), matriks penugasan, EWMP (56,25 jam/pekan), serta rekrutmen dan pengembangan karir dosen dan tendik berkelanjutan.',
          strengths: [
            'Belum ada dokumen fisik pembuktian yang diunggah ke sistem.',
          ],
          recommendations: [
            'Siapkan dokumen profil dosen DKPS Tabel 1 s.d 5 dan unggah berkasnya.',
          ],
        },
        {
          code: 'K.3',
          name: 'Keuangan dan Sarana Prasarana',
          weight: 15,
          score: 0,
          targetScore: 85,
          status: 'PERLU_PERBAIKAN',
          description:
            'Pengelolaan sumber daya keuangan menjamin keberlanjutan pembiayaan operasional pendidikan, riset, dan PkM, didukung sarana dan prasarana yang higienis, aman, dan ramah difabel.',
          strengths: [
            'Belum ada dokumen fisik pembuktian yang diunggah ke sistem.',
          ],
          recommendations: [
            'Siapkan dokumen RKAT, laporan keuangan DKPS Tabel 6, serta bukti inventaris sarpras.',
          ],
        },
        {
          code: 'K.4',
          name: 'Pendidikan dan Pengajaran',
          weight: 25,
          score: 0,
          targetScore: 85,
          status: 'PERLU_PERBAIKAN',
          description:
            'Pengelolaan kurikulum berbasis Outcome-Based Education (OBE), peta kurikulum selaras CPL, metode mutakhir (case method & team-based project), serta siklus jaminan pembelajaran (analisis & evaluasi hasil belajar).',
          strengths: [
            'Belum ada dokumen fisik pembuktian yang diunggah ke sistem.',
          ],
          recommendations: [
            'Siapkan dokumen kurikulum OBE, peta kurikulum, RPS berbasis kasus/proyek, dan laporan tracer study.',
          ],
        },
        {
          code: 'K.5',
          name: 'Penelitian dan Pengabdian kepada Masyarakat (PkM)',
          weight: 15,
          score: 0,
          targetScore: 85,
          status: 'PERLU_PERBAIKAN',
          description:
            'Pelaksanaan penelitian dan kegiatan PkM relevan dengan bidang ilmu manajemen (EMBA), meningkatkan kompetensi dosen, berkontribusi bagi masyarakat/UMKM, dan diintegrasikan ke dalam materi ajar.',
          strengths: [
            'Belum ada dokumen fisik pembuktian yang diunggah ke sistem.',
          ],
          recommendations: [
            'Siapkan dokumen luaran riset dan PkM dosen DKPS Tabel 8 dan unggah berkasnya.',
          ],
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
