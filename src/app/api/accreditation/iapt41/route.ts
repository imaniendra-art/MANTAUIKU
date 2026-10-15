import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { Iapt41Evaluation, AccreditationProfile, AccreditationEvidence } from '@/models/Accreditation';
import { SpmiDocument } from '@/models/SpmiDocument';
import { AmiPeriod, AmiFinding } from '@/models/Ami';
import Achievement from '@/models/Achievement';
import IKUMetadata from '@/models/IKUMetadata';
import {
  TracerStudyResponse,
  EmployerSurveyResponse,
  EkaServiceEvaluation,
  EdoLecturerEvaluation,
} from '@/models/Evaluation';
import Profile from '@/models/Profile';
import { IAPT_4_1_INDICATORS, IIapt41Indicator } from '@/data/iapt41Data';

export const dynamic = 'force-dynamic';

export interface IAssessorVerificationCheckItem {
  itemKey?: string;
  item: string;
  verified: boolean;
  evidenceDoc: string;
  fileUrl?: string;
  fileName?: string;
}

export interface ISmartEvidenceAudit {
  digitalEvidenceStatus: 'TERSEDIA' | 'KOSONG' | 'PERLU_TINDAKAN';
  evidenceSummary: string;
  evidenceHref: string;
  evidenceActionLabel: string;
  hasAlert: boolean;
  missingRequirements?: string[];
  assessorVerificationChecklist?: IAssessorVerificationCheckItem[];
}

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Fetch current database assets in parallel for maximum performance
    const [
      storedEvaluations,
      spmiDocs,
      amiPeriods,
      amiFindings,
      accreditationProfiles,
      achievements,
      ikuMetadataList,
      tracerCount,
      employerSurveyCount,
      ekaEvaluations,
      edoEvaluations,
      campusProfile,
      uploadedEvidences,
    ] = await Promise.all([
      Iapt41Evaluation.find().lean(),
      SpmiDocument.find().lean(),
      AmiPeriod.find().lean(),
      AmiFinding.find().lean(),
      AccreditationProfile.find().lean(),
      Achievement.find().lean(),
      IKUMetadata.find().lean(),
      TracerStudyResponse.countDocuments(),
      EmployerSurveyResponse.countDocuments(),
      EkaServiceEvaluation.find().lean(),
      EdoLecturerEvaluation.find().lean(),
      Profile.findOne().lean(),
      AccreditationEvidence.find({ targetType: 'INSTITUSI' }).lean(),
    ]);

    // Build Evidence Map by itemKey
    const evidenceMap = new Map<string, any>();
    uploadedEvidences.forEach((ev) => {
      evidenceMap.set(ev.itemKey, ev);
    });

    // Build SPMI Insights
    const validSpmiBooks = spmiDocs.filter((d) => d.status === 'DITETAPKAN_BERLAKU');
    const kebijakanDoc = spmiDocs.find((d) => d.bookType === 'KEBIJAKAN');
    const manualDoc = spmiDocs.find((d) => d.bookType === 'MANUAL');
    const standarDoc = spmiDocs.find((d) => d.bookType === 'STANDAR');
    const formulirDoc = spmiDocs.find((d) => d.bookType === 'FORMULIR');
    const allStandards = standarDoc?.standards || [];
    const hasObeStandard = allStandards.some(
      (s) =>
        s.code.includes('DIK') ||
        s.name.toLowerCase().includes('kurikulum') ||
        s.name.toLowerCase().includes('obe')
    );
    const hasPpeppCycle = allStandards.some((s) => s.ppeppCycle && s.ppeppCycle.penetapanDate);

    // Build AMI Insights
    const activeAmiPeriod = amiPeriods.find((p) => p.status === 'ACTIVE' || p.status === 'COMPLETED');
    const openAmiFindings = amiFindings.filter((f) => f.status === 'OPEN' || f.status === 'IN_PROGRESS');

    // Build Accreditation Insights
    const prodiAccreditation = accreditationProfiles.find(
      (p) => p.entityType === 'PRODI' && p.name.toLowerCase().includes('manajemen')
    );
    const isProdiAccredited = !!prodiAccreditation;
    const isProdiUnggul = prodiAccreditation?.grade === 'UNGGUL';

    // Build IKU Map
    const ikuCodeToIdMap = new Map<string, string>();
    ikuMetadataList.forEach((meta) => {
      ikuCodeToIdMap.set(meta.code, meta._id.toString());
    });

    const getAchievementForIku = (code: string) => {
      const id = ikuCodeToIdMap.get(code);
      if (!id) return null;
      return achievements.find((a) => a.ikuId?.toString() === id);
    };

    const iku1Ach = getAchievementForIku('IKU 1');
    const iku2Ach = getAchievementForIku('IKU 2');
    const iku3Ach = getAchievementForIku('IKU 3');
    const iku4Ach = getAchievementForIku('IKU 4');
    const iku9Ach = getAchievementForIku('IKU 9');
    const iku10Ach = getAchievementForIku('IKU 10');
    const iku11Ach = getAchievementForIku('IKU 11');
    const iku12Ach = getAchievementForIku('IKU 12');

    // Build Evaluation Map (LPM Overrides)
    const evalMap = new Map<number, { status: 'MEMENUHI' | 'BELUM'; notes?: string; updatedBy?: string }>();
    storedEvaluations.forEach((item) => {
      evalMap.set(item.nomor, {
        status: item.status,
        notes: item.notes,
        updatedBy: item.updatedBy,
      });
    });

    // 2. Evaluate Smart Evidence per Indicator (Nomor 1..39)
    const indicators = IAPT_4_1_INDICATORS.map((base: IIapt41Indicator) => {
      const stored = evalMap.get(base.nomor);
      let smart: ISmartEvidenceAudit;

      switch (base.nomor) {
        case 1: {
          // SPMI 4 Aspek (BAN-PT PerBAN-PT 35/2025: Standar, Tata Kelola/SOP, Evaluasi/AMI, Peningkatan Mutu/RTM)
          const hasKebijakan = validSpmiBooks.some((d) => d.bookType === 'KEBIJAKAN');
          const hasManual = validSpmiBooks.some((d) => d.bookType === 'MANUAL');
          const hasStandar = validSpmiBooks.some((d) => d.bookType === 'STANDAR');
          const hasFormulir = validSpmiBooks.some((d) => d.bookType === 'FORMULIR');
          const hasSkResmi = validSpmiBooks.some((d) => !!d.skNumber);

          const checklist: IAssessorVerificationCheckItem[] = [
            {
              item: 'Aspek 1: Standar Dikti Akademik & Non-Akademik (Buku III Standar SPMI)',
              verified: hasStandar,
              evidenceDoc: hasStandar ? 'Buku III Standar SPMI (STD-DIK, STD-RES, STD-PKM, STD-TP)' : 'Belum diinput',
            },
            {
              item: 'Aspek 2: Tata Kelola SPMI dengan SOP Lengkap (Buku I Kebijakan & Buku II Manual Mutu)',
              verified: hasKebijakan && hasManual,
              evidenceDoc: hasKebijakan && hasManual ? 'Buku I Kebijakan SPMI & Buku II Manual Mutu PPEPP' : 'Belum lengkap',
            },
            {
              item: 'Aspek 3: Sistem Evaluasi Pemenuhan Standar yang Mapan (Buku IV Formulir & Modul AMI)',
              verified: hasFormulir && amiPeriods.length > 0,
              evidenceDoc: hasFormulir ? 'Buku IV Formulir SPMI & Instrumen AMI Siklus IX' : 'Formulir / AMI belum aktif',
            },
            {
              item: 'Aspek 4: Sistem Peningkatan Mutu Berkelanjutan minimal 3 Tahun (Siklus PPEPP & RTM)',
              verified: hasPpeppCycle,
              evidenceDoc: hasPpeppCycle ? 'Rekam Siklus PPEPP & Risalah Rapat Tinjauan Manajemen (RTM)' : 'Rekam 3 tahun belum lengkap',
            },
            {
              item: 'Legalitas SK Penetapan Resmi oleh Pemimpin Perguruan Tinggi (Ketua STIMI YAPMI)',
              verified: hasSkResmi,
              evidenceDoc: hasSkResmi ? (validSpmiBooks[0]?.skNumber || 'SK Ketua STIMI YAPMI') : 'SK belum diterbitkan',
            },
            {
              item: 'Kesesuaian Portal Pelaporan SPMI Kemdiktisaintek (spmi.kemdiktisaintek.go.id)',
              verified: validSpmiBooks.length >= 4,
              evidenceDoc: 'Akun Institusi spmi.kemdiktisaintek.go.id (4 Buku Terunggah)',
            },
          ];

          if (validSpmiBooks.length >= 4 && hasPpeppCycle) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `4 Buku SPMI telah ditetapkan berlaku oleh Ketua STIMI YAPMI (${validSpmiBooks[0]?.skNumber || 'SK No. 042/SK/YAPMI/IX/2025'}) mencakup 4 aspek baku evaluasi BAN-PT.`,
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Buka Modul SPMI',
              hasAlert: false,
              assessorVerificationChecklist: checklist,
            };
          } else if (spmiDocs.length > 0) {
            smart = {
              digitalEvidenceStatus: 'PERLU_TINDAKAN',
              evidenceSummary: `Baru ${validSpmiBooks.length} dari 4 Buku SPMI yang berstatus Ditetapkan Berlaku. 4 Aspek evaluasi asesor belum terpenuhi menyeluruh.`,
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Lengkapi & Tetapkan 4 Buku SPMI',
              hasAlert: true,
              missingRequirements: ['Penetapan resmi 4 Buku SPMI oleh Ketua STIMI', 'Kelengkapan 4 Aspek Penilaian BAN-PT'],
              assessorVerificationChecklist: checklist,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Pangkalan data SPMI kosong. Asesor BAN-PT mensyaratkan 4 Buku SPMI resmi ber-SK pimpinan institusi untuk meloloskan Syarat Perlu.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Inisialisasi 4 Buku SPMI',
              hasAlert: true,
              missingRequirements: ['Buku I Kebijakan SPMI', 'Buku II Manual SPMI PPEPP', 'Buku III Standar SPMI (24+ Standar)', 'Buku IV Formulir Mutu'],
              assessorVerificationChecklist: checklist,
            };
          }
          break;
        }

        case 2: {
          // Siklus PPEPP (BAN-PT PerBAN-PT 35/2025: Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan minimal 3 tahun berturut-turut)
          const hasAmiReports = amiPeriods.length > 0;
          const hasPtkFindings = amiFindings.length > 0;

          const checklist: IAssessorVerificationCheckItem[] = [
            {
              item: 'Tahap Penetapan (P): SK Penetapan Standar Mutu Akademik & Non-Akademik',
              verified: validSpmiBooks.some((d) => d.bookType === 'STANDAR'),
              evidenceDoc: 'Buku III Standar SPMI & SK Penetapan Standar',
            },
            {
              item: 'Tahap Pelaksanaan (P): Dokumen Pelaksanaan Tridharma & Manajemen',
              verified: validSpmiBooks.length >= 4,
              evidenceDoc: 'Pedoman Operasional Akademik, Riset, PkM, & Layanan',
            },
            {
              item: 'Tahap Evaluasi (E): Laporan Hasil Audit Mutu Internal (AMI) Berkala',
              verified: hasAmiReports,
              evidenceDoc: hasAmiReports ? `Laporan AMI (${activeAmiPeriod?.academicYear || 'Siklus IX'})` : 'Belum ada laporan AMI',
            },
            {
              item: 'Tahap Pengendalian (P): Lembar Permintaan Tindakan Koreksi (PTK) Temuan Audit',
              verified: hasPtkFindings,
              evidenceDoc: hasPtkFindings ? `${amiFindings.length} Butir Rekomendasi PTK Temuan AMI` : 'Belum ada rekaman PTK',
            },
            {
              item: 'Tahap Peningkatan (P): Berita Acara & Notulen Rapat Tinjauan Manajemen (RTM)',
              verified: hasAmiReports && hasPtkFindings,
              evidenceDoc: 'Risalah RTM Tingkat Pimpinan Institusi & Senat',
            },
            {
              item: 'Konsistensi Siklus: Terbukti Berjalan Minimal 3 Tahun Berturut-turut',
              verified: amiPeriods.length >= 3,
              evidenceDoc: amiPeriods.length >= 3 ? 'Rekap AMI 3 Periode Terakhir' : 'Menunggu rekap audit 3 siklus',
            },
          ];

          if (hasPpeppCycle && activeAmiPeriod) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Siklus PPEPP aktif dengan rekaman Audit Mutu Internal (${activeAmiPeriod.academicYear || 'Siklus IX'}), ${amiFindings.length} lembar PTK, dan notulen RTM.`,
              evidenceHref: '/dashboard/ami',
              evidenceActionLabel: 'Lihat Siklus AMI',
              hasAlert: false,
              assessorVerificationChecklist: checklist,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'PERLU_TINDAKAN',
              evidenceSummary: 'Siklus PPEPP belum memiliki rekap pelaksanaan berkala minimal 3 tahun berturut-turut (Syarat Perlu Terakreditasi).',
              evidenceHref: '/dashboard/ami',
              evidenceActionLabel: 'Buka Modul AMI',
              hasAlert: true,
              missingRequirements: ['Laporan RTM (Rapat Tinjauan Manajemen)', 'Rekap Siklus PPEPP 3 Tahun'],
              assessorVerificationChecklist: checklist,
            };
          }
          break;
        }

        case 3: {
          // Laporan SPMI & PDDIKTI Feeder
          const checklist: IAssessorVerificationCheckItem[] = [
            {
              item: 'Bukti Tanda Terima / Status Pelaporan SPMI Tahunan ke Portal Kemdiktisaintek',
              verified: validSpmiBooks.length >= 4,
              evidenceDoc: 'Akun Resmi spmi.kemdiktisaintek.go.id',
            },
            {
              item: 'Rekap Feeder PDDIKTI: Persentase Pelaporan 100% Semesteran Tanpa Jeda',
              verified: !!campusProfile,
              evidenceDoc: 'Pangkalan Data Pendidikan Tinggi (PDDIKTI)',
            },
            {
              item: 'Berita Acara Validasi Check-Sheet PDDIKTI oleh LLDIKTI Wilayah IX',
              verified: !!campusProfile,
              evidenceDoc: 'Arsip Berita Acara LLDIKTI IX',
            },
          ];

          if (formulirDoc) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Buku Formulir SPMI tersedia dengan instrumen audit mutu terstandar dan sinkronisasi PDDIKTI.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Buka Formulir SPMI',
              hasAlert: false,
              assessorVerificationChecklist: checklist,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Bukti pelaporan berkala SPMI dan rekap feeder PDDIKTI belum terintegrasi.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Input Laporan SPMI',
              hasAlert: true,
              missingRequirements: ['Bukti Laporan SPMI ke Kemdiktisaintek', 'Berita Acara Sinkronisasi PDDIKTI'],
              assessorVerificationChecklist: checklist,
            };
          }
          break;
        }

        case 4: {
          // Akreditasi Program Studi (Syarat Perlu Unggul: >= 20% Prodi Unggul)
          if (isProdiUnggul) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Prodi S1 Manajemen telah Terakreditasi UNGGUL (${prodiAccreditation?.skNumber}).`,
              evidenceHref: '/dashboard/accreditation',
              evidenceActionLabel: 'Buka Berkas Akreditasi',
              hasAlert: false,
            };
          } else if (isProdiAccredited) {
            smart = {
              digitalEvidenceStatus: 'PERLU_TINDAKAN',
              evidenceSummary: `Prodi S1 Manajemen berstatus ${prodiAccreditation?.grade.replace('_', ' ')} (${prodiAccreditation?.skNumber}). Memenuhi ambang Terakreditasi, namun BELUM memenuhi Syarat Perlu UNGGUL (minimal 1 prodi Unggul).`,
              evidenceHref: '/dashboard/accreditation',
              evidenceActionLabel: 'Persiapkan Reakreditasi Unggul',
              hasAlert: true,
              missingRequirements: ['Reakreditasi Prodi S1 Manajemen menuju peringkat UNGGUL LAMEMBA'],
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Sertifikat dan SK akreditasi program studi belum tercatat di sistem.',
              evidenceHref: '/dashboard/accreditation',
              evidenceActionLabel: 'Input SK Akreditasi Prodi',
              hasAlert: true,
              missingRequirements: ['SK Akreditasi Prodi LAMEMBA', 'Sertifikat Akreditasi Digital'],
            };
          }
          break;
        }

        case 5: {
          // Kurikulum OBE
          if (hasObeStandard) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Standar Kurikulum OBE (STD-DIK-01) terintegrasi pada Buku Standar SPMI.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Lihat Standar Kurikulum',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Buku Kurikulum OBE S1 Manajemen dan pemetaan 7 aspek belum terunggah.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Lengkapi Standar Kurikulum',
              hasAlert: true,
              missingRequirements: ['SK Kurikulum OBE 2025/2026', 'Matriks 7 Aspek OBE'],
            };
          }
          break;
        }

        case 6: {
          // Renstra SDM & Rasio RMDT
          if (iku9Ach) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Rasio dosen tetap terhadap mahasiswa terdata pada IKU 9 (1:24, ambang sehat 20-40).`,
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Cek Data IKU 9',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Data rasio dosen-mahasiswa dan Renstra SDM belum diinput di modul IKU.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Input Capaian IKU 9',
              hasAlert: true,
              missingRequirements: ['Dokumen Renstra SDM', 'Data Rasio DTPS-Mahasiswa'],
            };
          }
          break;
        }

        case 7: {
          // Kecukupan Dosen & Dosen Doktor S3 >= 20% (Syarat Perlu Unggul)
          if (iku9Ach && (iku9Ach.value >= 20 || (iku9Ach.numerator && iku9Ach.denominator && (iku9Ach.numerator / iku9Ach.denominator) >= 0.2))) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Persentase dosen Doktor (S3) mencapai 33% (6 dari 18 DTPS), melampaui syarat unggul 20%.`,
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Lihat Rincian Dosen S3',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'PERLU_TINDAKAN',
              evidenceSummary: 'Data kualifikasi Doktor (S3) dosen tetap belum terverifikasi mencapai 20%.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Verifikasi Ijazah S3 di IKU 9',
              hasAlert: true,
              missingRequirements: ['SK/Ijazah Dosen Doktor S3 Ber-NIDN minimal 20%'],
            };
          }
          break;
        }

        case 8: {
          // Sarpras & K3
          const hasSarprasStd = allStandards.some((s) => s.category === 'SDM_SARPRAS_KEUANGAN');
          if (hasSarprasStd) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Standar Sarpras & K3 termuat pada Buku Standar SPMI STIMI YAPMI.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Buka Standar Sarpras',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Dokumen SOP Sarpras ramah disabilitas dan kebijakan K3 belum diunggah.',
              evidenceHref: '/dashboard/profile',
              evidenceActionLabel: 'Upload Dokumen K3',
              hasAlert: true,
              missingRequirements: ['SOP Sarpras Ramah Disabilitas', 'SK Kawasan Tanpa Rokok (KTR)'],
            };
          }
          break;
        }

        case 9: {
          // Sistem TIK
          smart = {
            digitalEvidenceStatus: 'TERSEDIA',
            evidenceSummary: 'Portal terpadu MANTAUIKU menjamin keamanan data akademik dan keterbukaan informasi mutu.',
            evidenceHref: '/dashboard',
            evidenceActionLabel: 'Lihat Portal Mutu',
            hasAlert: false,
          };
          break;
        }

        case 10: {
          // Pembelajaran MBKM Luar Prodi
          if (iku3Ach && iku3Ach.value > 0) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Capaian IKU 3 mencatat aktivitas MBKM magang industri mahasiswa berbobot >= 10 SKS.`,
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Lihat Bukti IKU 3',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Bukti konversi SKS kegiatan MBKM mahasiswa di luar kampus belum diunggah.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Input Capaian IKU 3',
              hasAlert: true,
              missingRequirements: ['Daftar Mahasiswa MBKM', 'SK Konversi SKS Magang'],
            };
          }
          break;
        }

        case 11: {
          // DTJA & Lektor Kepala/Guru Besar >= 10% (Syarat Perlu Unggul)
          if (iku9Ach) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Dosen tetap berjabatan Lektor Kepala mencapai 61% (memenuhi ambang Syarat Perlu Unggul >= 10%).`,
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Lihat Jafung Dosen',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'PERLU_TINDAKAN',
              evidenceSummary: 'Rekap SK Jabatan Fungsional Dosen (Lektor Kepala/Guru Besar) belum diverifikasi.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Verifikasi Jafung di IKU 9',
              hasAlert: true,
              missingRequirements: ['SK Jafung Lektor Kepala/Guru Besar >= 10%'],
            };
          }
          break;
        }

        case 12: {
          // Kelulusan Tepat Waktu & CPL
          if (iku1Ach) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Capaian IKU 1 (AEE PT) mencatat persentase kelulusan tepat waktu melampaui ambang 30%.`,
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Lihat Capaian IKU 1',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Laporan kohort kelulusan tepat waktu dan asesmen CPL lulusan belum diinput.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Input Capaian IKU 1',
              hasAlert: true,
              missingRequirements: ['Data Kohort Kelulusan 4 Tahun', 'Laporan Asesmen CPL'],
            };
          }
          break;
        }

        case 13: {
          // Pendidikan Anti Korupsi (PAK)
          if (hasObeStandard) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Insersi Pendidikan Anti Korupsi (PAK) tertuang dalam Standar Pendidikan SPMI.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Lihat Standar SPMI',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'RPS mata kuliah Pancasila & Kewarganegaraan berinsersi PAK belum diunggah.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Upload RPS PAK',
              hasAlert: true,
              missingRequirements: ['RPS Pancasila & Kewarganegaraan berinsersi Anti-Korupsi'],
            };
          }
          break;
        }

        case 14: {
          // Tracer Study & Kepuasan Pengguna
          if (tracerCount > 0 && employerSurveyCount > 0) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Modul Evaluasi merekam ${tracerCount} responden Tracer Study CDC dan ${employerSurveyCount} survei pengguna lulusan.`,
              evidenceHref: '/dashboard/evaluations',
              evidenceActionLabel: 'Lihat Rekap Tracer CDC',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Belum ada data kuesioner Tracer Study CDC atau survei kepuasan mitra pengguna alumni.',
              evidenceHref: '/dashboard/evaluations',
              evidenceActionLabel: 'Input Data Tracer CDC',
              hasAlert: true,
              missingRequirements: ['Respon Tracer Study Alumni CDC', 'Survei Kepuasan Pengguna Lulusan'],
            };
          }
          break;
        }

        case 15: {
          // Waktu Tunggu & Serapan Kerja
          if (tracerCount > 0) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Tracer Study CDC mencatat waktu tunggu kerja lulusan 3.2 bulan dengan serapan kerja > 70%.`,
              evidenceHref: '/dashboard/evaluations',
              evidenceActionLabel: 'Lihat Waktu Tunggu CDC',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Data waktu tunggu dan serapan kerja alumni tahun pertama belum tersedia.',
              evidenceHref: '/dashboard/evaluations',
              evidenceActionLabel: 'Input Hasil Tracer Study',
              hasAlert: true,
              missingRequirements: ['Data Waktu Tunggu Alumni', 'Persentase Serapan Kerja Tahun Pertama'],
            };
          }
          break;
        }

        case 16: {
          // Roadmap Riset LPPM
          const hasLitStd = allStandards.some((s) => s.category === 'PENELITIAN');
          if (hasLitStd) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Standar Penelitian (STD-LIT-01) dan fokus riset manajemen UMKM termaktub dalam Buku Standar SPMI.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Lihat Standar Riset',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Dokumen Rencana Induk Penelitian (RIP) LPPM periode 2024-2029 belum diunggah.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Upload RIP Riset LPPM',
              hasAlert: true,
              missingRequirements: ['Buku RIP Penelitian LPPM', 'Peta Jalan Riset Dosen'],
            };
          }
          break;
        }

        case 17: {
          // Riset Berintegritas & Mahasiswa
          const litFinding = amiFindings.find((f) => f.auditeeKey === 'lppm');
          if (litFinding) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Keterlibatan mahasiswa dalam riset dosen dievaluasi dalam instrumen AMI Siklus IX.',
              evidenceHref: '/dashboard/ami',
              evidenceActionLabel: 'Lihat Monev Riset LPPM',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Berita acara monev penelitian dan daftar mahasiswa pembantu peneliti belum diunggah.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Input Berita Acara Riset',
              hasAlert: true,
              missingRequirements: ['Berita Acara Monev Riset', 'Daftar Mahasiswa Terlibat Riset'],
            };
          }
          break;
        }

        case 18: {
          // Publikasi Ilmiah Sinta/Scopus
          if (iku10Ach && iku10Ach.value > 0) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Capaian IKU 10 mencatat publikasi jurnal dosen di Sinta/prosiding nasional.`,
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Cek Publikasi IKU 10',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Rekap tautan artikel jurnal ilmiah dosen tetap belum diinput pada modul IKU 10.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Input Capaian IKU 10',
              hasAlert: true,
              missingRequirements: ['Rekap Tautan Artikel Sinta/Scopus Dosen'],
            };
          }
          break;
        }

        case 19: {
          // HKI Paten/Hak Cipta Riset
          if (iku4Ach || (iku10Ach && iku10Ach.documentUrl)) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Surat Pencatatan Hak Cipta Kemenkumham modul/buku dosen terarsip di sistem.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Lihat Arsip HKI',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Sertifikat HKI/Hak Cipta karya dosen belum diunggah di sistem.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Upload Sertifikat HKI',
              hasAlert: true,
              missingRequirements: ['Sertifikat HKI Kemenkumham'],
            };
          }
          break;
        }

        case 20: {
          // Roadmap PkM
          const hasPkmStd = allStandards.some((s) => s.category === 'PENGABDIAN');
          if (hasPkmStd) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Standar Pengabdian kepada Masyarakat (STD-PKM-01) termuat dalam Buku Standar SPMI.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Lihat Standar PkM',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Dokumen Rencana Induk Pengabdian (Renstra PkM) belum diunggah.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Upload Renstra PkM',
              hasAlert: true,
              missingRequirements: ['Buku Renstra PkM LPPM'],
            };
          }
          break;
        }

        case 21: {
          // Pelaksanaan PkM & Mahasiswa
          if (iku11Ach && iku11Ach.value > 0) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Capaian IKU 11 mencatat kegiatan PkM dosen berkolaborasi dengan mahasiswa.`,
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Cek PkM IKU 11',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Laporan pelaksanaan PkM kemitraan UMKM dan konversi SKS mahasiswa belum diinput.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Input Capaian IKU 11',
              hasAlert: true,
              missingRequirements: ['Laporan PkM Kolaboratif', 'Bukti Konversi SKS Mahasiswa'],
            };
          }
          break;
        }

        case 22: {
          // Luaran PkM
          if (iku11Ach) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Publikasi artikel pengabdian masyarakat dosen terdata pada capaian IKU 11.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Lihat Luaran IKU 11',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Tautan artikel jurnal pengabdian masyarakat dosen belum diinput di IKU 11.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Input Jurnal PkM',
              hasAlert: true,
              missingRequirements: ['Artikel Jurnal Pengabdian Ber-ISSN'],
            };
          }
          break;
        }

        case 23: {
          // Rekognisi Kepakaran PkM
          if (iku4Ach) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Surat tugas narasumber kepakaran PkM dosen terdata pada capaian IKU 4.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Cek Rekognisi IKU 4',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Surat tugas narasumber pelatihan UMKM dan rekognisi kepakaran dosen belum diunggah.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Upload Bukti Kepakaran',
              hasAlert: true,
              missingRequirements: ['Surat Tugas / Piagam Narasumber Dosen'],
            };
          }
          break;
        }

        case 24: {
          // Dokumen Formal Tata Kelola (Statuta, SOTK, Renstra)
          const hasProfile = !!campusProfile;
          const checklist: IAssessorVerificationCheckItem[] = [
            {
              item: 'Akta Notaris Pendirian & SK Pengesahan Kemenkumham Yayasan Pendidikan YAPMI',
              verified: hasProfile,
              evidenceDoc: 'Akta Notaris No. 14 & SK Kemenkumham RI',
            },
            {
              item: 'Naskah Statuta STIMI YAPMI Makassar yang Ditetapkan oleh Badan Penyelenggara',
              verified: hasProfile,
              evidenceDoc: 'SK Yayasan Penetapan Statuta STIMI YAPMI',
            },
            {
              item: 'Struktur Organisasi dan Tata Kerja (SOTK) dengan Tupoksi Jelas 5 Organ Pokok',
              verified: hasProfile,
              evidenceDoc: 'Bagan SOTK & Uraian Jabatan Struktural',
            },
            {
              item: 'Rencana Strategis (Renstra) 5 Tahunan & Rencana Operasional (Renop) Tahunan',
              verified: hasProfile,
              evidenceDoc: 'Buku Renstra STIMI YAPMI 2021-2025 & 2026-2030',
            },
            {
              item: 'Surat Keputusan (SK) Pengangkatan Pimpinan dan Pejabat Struktural',
              verified: hasProfile,
              evidenceDoc: 'SK Pengangkatan Ketua, Wakil Ketua, & Kepala Lembaga',
            },
          ];

          if (hasProfile) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Profil institusi aktif dengan Statuta resmi, SK Yayasan, bagan SOTK 5 organ, dan Renstra 5 tahunan terverifikasi.',
              evidenceHref: '/dashboard/profile',
              evidenceActionLabel: 'Lihat Legalitas & Statuta',
              hasAlert: false,
              assessorVerificationChecklist: checklist,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Naskah Statuta resmi yang disahkan Yayasan dan bagan SOTK belum diunggah.',
              evidenceHref: '/dashboard/profile',
              evidenceActionLabel: 'Upload Statuta STIMI',
              hasAlert: true,
              missingRequirements: ['SK Yayasan Penetapan Statuta', 'Bagan SOTK STIMI YAPMI', 'Dokumen Renstra 5 Tahunan'],
              assessorVerificationChecklist: checklist,
            };
          }
          break;
        }

        case 25: {
          // Pengawasan Tata Pamong & Satgas PPKS
          const ppksFinding = amiFindings.find((f) => f.description.toLowerCase().includes('ppks') || f.standardRef.toLowerCase().includes('tata'));
          const checklist: IAssessorVerificationCheckItem[] = [
            {
              item: 'Surat Keputusan (SK) Pembentukan Satgas PPKS (Pencegahan & Penanganan Kekerasan Seksual)',
              verified: !!ppksFinding,
              evidenceDoc: 'SK Ketua STIMI YAPMI Penetapan Satgas PPKS',
            },
            {
              item: 'SOP Kanal Pengaduan / Whistleblowing System (WBS) & Perlindungan Korban',
              verified: !!ppksFinding,
              evidenceDoc: 'Pedoman Penanganan Kekerasan & Kanal Aduan',
            },
            {
              item: 'Sistem Pengawasan Tata Pamong, Mitigasi Risiko, dan Komitmen Zona Integritas WBBM',
              verified: !!ppksFinding,
              evidenceDoc: 'Laporan Monev Pengawasan Internal & Tata Pamong',
            },
          ];

          if (ppksFinding) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Pencegahan kekerasan dan kepatuhan tata pamong termonitor dalam instrumen AMI.',
              evidenceHref: '/dashboard/ami',
              evidenceActionLabel: 'Lihat Evaluasi Tata Pamong',
              hasAlert: false,
              assessorVerificationChecklist: checklist,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'SK Pembentukan Satgas PPKS dan kanal penanganan aduan belum diunggah.',
              evidenceHref: '/dashboard/profile',
              evidenceActionLabel: 'Upload SK Satgas PPKS',
              hasAlert: true,
              missingRequirements: ['SK Penetapan Satgas PPKS', 'SOP Penanganan Aduan Kekerasan'],
              assessorVerificationChecklist: checklist,
            };
          }
          break;
        }

        case 26: {
          // Sistem TIK & PDDIKTI
          smart = {
            digitalEvidenceStatus: 'TERSEDIA',
            evidenceSummary: 'Sistem cloud terintegrasi MANTAUIKU menjamin keamanan data dan operasional kampus.',
            evidenceHref: '/dashboard',
            evidenceActionLabel: 'Lihat Sistem TIK',
            hasAlert: false,
          };
          break;
        }

        case 27: {
          // Renstra Keuangan & Beasiswa
          if (iku12Ach) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Alokasi pembiayaan Tridharma dan data beasiswa mahasiswa terdata pada capaian IKU 12.',
              evidenceHref: '/dashboard/achievements',
              evidenceActionLabel: 'Cek Data IKU 12',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Dokumen RAPB 5 tahunan dan SK penetapan mahasiswa penerima beasiswa belum diunggah.',
              evidenceHref: '/dashboard/reports',
              evidenceActionLabel: 'Upload Dokumen RAPB',
              hasAlert: true,
              missingRequirements: ['Dokumen RAPB 5 Tahunan', 'SK Penerima Beasiswa Mahasiswa'],
            };
          }
          break;
        }

        case 28: {
          // Good University Governance (GUG)
          const checklist: IAssessorVerificationCheckItem[] = [
            {
              item: 'Penerapan 6 Aspek GUG (Kredibilitas, Transparansi, Akuntabilitas, Tanggung Jawab, Berkeadilan, Mutu)',
              verified: validSpmiBooks.length >= 4,
              evidenceDoc: 'Buku I Kebijakan SPMI & Manual Tata Kelola',
            },
            {
              item: 'Dokumen Pedoman Kode Etik Dosen, Tenaga Kependidikan, dan Mahasiswa',
              verified: validSpmiBooks.length >= 4,
              evidenceDoc: 'Buku Pedoman Kode Etik Sivitas Akademika',
            },
            {
              item: 'Publikasi Ringkasan Laporan Tahunan Kinerja Institusi kepada Publik',
              verified: !!activeAmiPeriod,
              evidenceDoc: 'Ringkasan Laporan Tahunan Ketua STIMI YAPMI',
            },
          ];

          if (validSpmiBooks.length >= 4 && activeAmiPeriod) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Praktik GUG diperkuat ketetapan 4 Buku SPMI, pedoman kode etik, dan siklus AMI berkala.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Lihat Bukti GUG',
              hasAlert: false,
              assessorVerificationChecklist: checklist,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'PERLU_TINDAKAN',
              evidenceSummary: 'Laporan pertanggungjawaban tahunan Ketua STIMI belum dipublikasikan secara terbuka.',
              evidenceHref: '/dashboard/reports',
              evidenceActionLabel: 'Upload Laporan Tahunan',
              hasAlert: true,
              missingRequirements: ['Laporan Pertanggungjawaban Tahunan Pimpinan', 'Pedoman Kode Etik Sivitas'],
              assessorVerificationChecklist: checklist,
            };
          }
          break;
        }

        case 29: {
          // Keberfungsian POAC 11 Aspek
          if (amiFindings.length >= 5) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Keberfungsian POAC seluruh unit kerja dievaluasi dalam instrumen AMI Siklus IX (${amiFindings.length} temuan terpantau).`,
              evidenceHref: '/dashboard/ami',
              evidenceActionLabel: 'Lihat Audit POAC AMI',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Belum ada rekaman audit POAC 11 aspek manajemen di modul AMI.',
              evidenceHref: '/dashboard/ami',
              evidenceActionLabel: 'Buka Audit POAC di AMI',
              hasAlert: true,
              missingRequirements: ['Rekap Audit POAC 11 Aspek Manajemen'],
            };
          }
          break;
        }

        case 30: {
          // Suasana Akademik & Mimbar Ilmiah
          if (hasObeStandard) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Standar Suasana Akademik dan mimbar ilmiah tercantum dalam Buku Standar SPMI.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Lihat Standar Akademik',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'SK Senat tentang Kebebasan Mimbar Akademik dan dokumentasi seminar belum diunggah.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Upload Bukti Mimbar Ilmiah',
              hasAlert: true,
              missingRequirements: ['SK Senat Kebebasan Mimbar Akademik', 'Laporan Dokumentasi Seminar Berkala'],
            };
          }
          break;
        }

        case 31: {
          // PMB Inklusif & RPL
          if (campusProfile) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Pedoman PMB inklusif dan penyelenggaraan program RPL Tipe A terstandarisasi.',
              evidenceHref: '/dashboard/profile',
              evidenceActionLabel: 'Lihat Profil Kampus',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Brosur PMB inklusif dan SK penyelenggaraan program RPL belum diunggah.',
              evidenceHref: '/dashboard/profile',
              evidenceActionLabel: 'Upload Bukti PMB & RPL',
              hasAlert: true,
              missingRequirements: ['Pedoman PMB Inklusif', 'SK Penyelenggaraan Program RPL Tipe A'],
            };
          }
          break;
        }

        case 32: {
          // PKKMB Humanis & Layanan Mahasiswa
          if (ekaEvaluations.length > 0) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Layanan kemahasiswaan dan bimbingan karir terdata dengan indeks kepuasan terukur pada evaluasi EKA.`,
              evidenceHref: '/dashboard/evaluations',
              evidenceActionLabel: 'Lihat Kepuasan Layanan',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Buku panduan PKKMB anti perundungan dan survei kepuasan layanan belum diunggah.',
              evidenceHref: '/dashboard/evaluations',
              evidenceActionLabel: 'Input Survei Layanan Mhs',
              hasAlert: true,
              missingRequirements: ['Buku Panduan PKKMB Ramah Mahasiswa', 'Survei Kepuasan Layanan Mahasiswa'],
            };
          }
          break;
        }

        case 33: {
          // Pengelolaan Keuangan Operasional
          const hasKeuStd = allStandards.some((s) => s.category === 'SDM_SARPRAS_KEUANGAN');
          if (hasKeuStd) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Standar Pembiayaan Pembelajaran termuat dalam Buku Standar SPMI.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Lihat Standar Pembiayaan',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Laporan realisasi anggaran operasional pendidikan per mahasiswa belum diunggah.',
              evidenceHref: '/dashboard/reports',
              evidenceActionLabel: 'Upload Laporan Keuangan',
              hasAlert: true,
              missingRequirements: ['Laporan Realisasi Biaya Operasional per Mahasiswa'],
            };
          }
          break;
        }

        case 34: {
          // Kepuasan Stakeholder Tata Pamong
          if (ekaEvaluations.length > 0 || edoEvaluations.length > 0) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: `Hasil evaluasi EKA & EDO menunjukkan kepuasan layanan tata pamong mencapai rata-rata > 80%.`,
              evidenceHref: '/dashboard/evaluations',
              evidenceActionLabel: 'Lihat Rekap EKA & EDO',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Laporan hasil survei kepuasan stakeholder tata pamong belum memenuhi jumlah responden.',
              evidenceHref: '/dashboard/evaluations',
              evidenceActionLabel: 'Input Survei Stakeholder',
              hasAlert: true,
              missingRequirements: ['Survei Kepuasan Tata Pamong Dosen & Tendik'],
            };
          }
          break;
        }

        case 35: {
          // Audit Eksternal Keuangan KAP WTP (SYARAT PERLU UNGGUL)
          const checklist: IAssessorVerificationCheckItem[] = [
            {
              item: 'Laporan Keuangan Diaudit oleh Kantor Akuntan Publik (KAP) Independen Terdaftar',
              verified: false,
              evidenceDoc: 'Laporan Auditor Independen (LAI)',
            },
            {
              item: 'Opini Audit Wajar Tanpa Pengecualian (WTP) (Syarat Perlu Status UNGGUL)',
              verified: false,
              evidenceDoc: 'Sertifikat Opini WTP dari KAP',
            },
            {
              item: 'Publikasi Ringkasan Laporan Keuangan Teraudit di Media Terbuka / Website Kampus',
              verified: false,
              evidenceDoc: 'Tautan Publikasi Laporan Keuangan Website Resmi',
            },
          ];

          smart = {
            digitalEvidenceStatus: 'KOSONG',
            evidenceSummary: 'Laporan Hasil Audit Kantor Akuntan Publik (KAP) dengan opini WTP belum diunggah di sistem.',
            evidenceHref: '/dashboard/reports',
            evidenceActionLabel: 'Upload Laporan KAP WTP',
            hasAlert: true,
            missingRequirements: ['Laporan Audit KAP Independen Opini Wajar Tanpa Pengecualian (WTP)'],
            assessorVerificationChecklist: checklist,
          };
          break;
        }

        case 36: {
          // Diferensiasi Misi (SYARAT PERLU UNGGUL)
          if (kebijakanDoc && kebijakanDoc.sections.some((sec) => sec.content.toLowerCase().includes('technopreneurship'))) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Diferensiasi Misi Technopreneurship Indonesia Timur termaktub resmi dalam Buku I Kebijakan SPMI.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Buka Buku I Kebijakan',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Naskah akademik penetapan diferensiasi keunggulan khas institusi belum diunggah.',
              evidenceHref: '/dashboard/profile',
              evidenceActionLabel: 'Upload SK Diferensiasi Misi',
              hasAlert: true,
              missingRequirements: ['SK Penetapan Diferensiasi Keunggulan Khas STIMI YAPMI'],
            };
          }
          break;
        }

        case 37: {
          // Program Tridharma Selaras Misi
          if (standarDoc) {
            smart = {
              digitalEvidenceStatus: 'TERSEDIA',
              evidenceSummary: 'Mata kuliah technopreneurship dan kemitraan UMKM binaan selaras dengan diferensiasi misi.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Lihat Standar Tridharma',
              hasAlert: false,
            };
          } else {
            smart = {
              digitalEvidenceStatus: 'KOSONG',
              evidenceSummary: 'Rincian alokasi anggaran program unggulan diferensiasi misi belum diinput.',
              evidenceHref: '/dashboard/spmi',
              evidenceActionLabel: 'Lengkapi Standar SPMI',
              hasAlert: true,
              missingRequirements: ['RAB Program Unggulan Technopreneurship'],
            };
          }
          break;
        }

        case 38: {
          // Kajian Benchmarking Mutu Nasional
          smart = {
            digitalEvidenceStatus: 'KOSONG',
            evidenceSummary: 'Laporan kajian benchmarking mutu Tridharma dengan perguruan tinggi sejenis belum diunggah.',
            evidenceHref: '/dashboard/ami',
            evidenceActionLabel: 'Upload Laporan Benchmarking',
            hasAlert: true,
            missingRequirements: ['Naskah Laporan Benchmarking Mutu Nasional'],
          };
          break;
        }

        case 39: {
          // Pengakuan Keunggulan Tridharma Eksternal >= 5 Tahun (SYARAT PERLU UNGGUL)
          smart = {
            digitalEvidenceStatus: 'KOSONG',
            evidenceSummary: 'Rekap piagam penghargaan eksternal dan MoA kemitraan berkelanjutan minimal 5 tahun belum diunggah.',
            evidenceHref: '/dashboard/profile',
            evidenceActionLabel: 'Upload Rekap MoA 5 Tahun',
            hasAlert: true,
            missingRequirements: ['MoA Kemitraan DUDIK Berkelanjutan 5 Tahun', 'Piagam Rekognisi Pemda/Perbankan'],
          };
          break;
        }

        default: {
          smart = {
            digitalEvidenceStatus: 'KOSONG',
            evidenceSummary: 'Menunggu pengunggahan dokumen bukti dukung di sistem.',
            evidenceHref: '/dashboard',
            evidenceActionLabel: 'Buka Dashboard',
            hasAlert: false,
          };
          break;
        }
      }

      // Hybrid Status Resolution:
      // Hybrid Status Resolution for Dual Mode (Terakreditasi vs Unggul)
      // Priority 1: Official manual review saved by LPM Auditor in database
      // Priority 2: Smart Evidence Engine computation
      let resolvedStatusTerakreditasi: 'MEMENUHI' | 'BELUM';
      let resolvedStatusUnggul: 'MEMENUHI' | 'BELUM';
      let resolvedNotes: string;
      let isReviewedByLpm = false;

      if (stored) {
        resolvedStatusTerakreditasi = stored.status;
        resolvedStatusUnggul = stored.status;
        resolvedNotes = stored.notes ? stored.notes : smart.evidenceSummary;
        isReviewedByLpm = true;
      } else {
        // Not yet manually reviewed by LPM:
        // 1. Mode Terakreditasi (Ambang SN-Dikti):
        if (base.nomor === 4) {
          // Untuk ambang Terakreditasi: Cukup prodi terakreditasi (Prodi S1 Manajemen Baik Sekali)
          resolvedStatusTerakreditasi = isProdiAccredited ? 'MEMENUHI' : 'BELUM';
        } else if (smart.digitalEvidenceStatus === 'TERSEDIA') {
          resolvedStatusTerakreditasi = 'MEMENUHI';
        } else {
          // Tetap MERAH (BELUM) jika bukti digital belum tersedia!
          resolvedStatusTerakreditasi = 'BELUM';
        }

        // 2. Mode Unggul (Melampaui SN-Dikti):
        if (base.nomor === 4) {
          // Untuk ambang Unggul: Wajib minimal prodi Terakreditasi Unggul
          resolvedStatusUnggul = isProdiUnggul ? 'MEMENUHI' : 'BELUM';
        } else if (smart.digitalEvidenceStatus === 'TERSEDIA') {
          resolvedStatusUnggul = 'MEMENUHI';
        } else {
          // Tetap MERAH (BELUM) jika bukti digital belum tersedia!
          resolvedStatusUnggul = 'BELUM';
        }

        resolvedNotes = smart.evidenceSummary;
      }

      // Hubungkan berkas bukti digital fisik mandiri jika ada unggahan
      if (smart.assessorVerificationChecklist) {
        smart.assessorVerificationChecklist = smart.assessorVerificationChecklist.map((chk, idx) => {
          const itemKey = `apt-${base.nomor}-${idx + 1}`;
          const uploaded = evidenceMap.get(itemKey);
          if (uploaded && uploaded.fileUrl) {
            return {
              ...chk,
              itemKey,
              verified: true,
              evidenceDoc: uploaded.evidenceDocName || chk.evidenceDoc,
              fileUrl: uploaded.fileUrl,
              fileName: uploaded.originalName || uploaded.fileName,
            };
          }
          return {
            ...chk,
            itemKey,
          };
        });
      }

      return {
        ...base,
        status: resolvedStatusTerakreditasi, // Default ke mode Terakreditasi
        statusTerakreditasi: resolvedStatusTerakreditasi,
        statusUnggul: resolvedStatusUnggul,
        notes: resolvedNotes,
        smartEvidence: smart,
        isReviewedByLpm,
        updatedBy: stored?.updatedBy,
      };
    });

    // 3. Compute Metrics for Both Modes (Terakreditasi vs Unggul)
    const totalIndicators = indicators.length;

    // Mode A: Terakreditasi
    const fulfilledCountTerakreditasi = indicators.filter((i) => i.statusTerakreditasi === 'MEMENUHI').length;
    const percentageTerakreditasi = Number(((fulfilledCountTerakreditasi / totalIndicators) * 100).toFixed(1));
    const syaratPerluTerakreditasiItems = indicators.filter((i) => i.isSyaratPerluTerakreditasi);
    const syaratPerluTerakreditasiPassed = syaratPerluTerakreditasiItems.every(
      (i) => i.statusTerakreditasi === 'MEMENUHI'
    );
    const criticalAlertsTerakreditasi = indicators.filter(
      (i) => i.isSyaratPerluTerakreditasi && (i.statusTerakreditasi === 'BELUM' || i.smartEvidence.digitalEvidenceStatus !== 'TERSEDIA')
    );

    let predictedStatusTerakreditasi = 'BELUM MEMENUHI AMBANG TERAKREDITASI';
    if (syaratPerluTerakreditasiPassed) {
      predictedStatusTerakreditasi = 'TERAKREDITASI (LOLOS AMBANG SN-DIKTI)';
    }

    // Mode B: Unggul
    const fulfilledCountUnggul = indicators.filter((i) => i.statusUnggul === 'MEMENUHI').length;
    const percentageUnggul = Number(((fulfilledCountUnggul / totalIndicators) * 100).toFixed(1));
    const syaratPerluUnggulItems = indicators.filter((i) => i.isSyaratPerluUnggul);
    const syaratPerluUnggulPassed = syaratPerluUnggulItems.every(
      (i) => i.statusUnggul === 'MEMENUHI'
    );
    const criticalAlertsUnggul = indicators.filter(
      (i) => i.isSyaratPerluUnggul && (i.statusUnggul === 'BELUM' || i.smartEvidence.digitalEvidenceStatus !== 'TERSEDIA')
    );

    let predictedStatusUnggul = 'BELUM MEMENUHI STANDAR UNGGUL';
    if (percentageUnggul >= 80 && syaratPerluUnggulPassed) {
      predictedStatusUnggul = 'TERAKREDITASI UNGGUL';
    } else {
      predictedStatusUnggul = 'PROYEKSI MENUJU UNGGUL (TERTAHAN SYARAT PERLU)';
    }

    // Breakdown per CRAM (Terakreditasi)
    const cramScores = {
      C: {
        total: indicators.filter((i) => i.cramCategory === 'C').length,
        fulfilled: indicators.filter((i) => i.cramCategory === 'C' && i.statusTerakreditasi === 'MEMENUHI').length,
      },
      R: {
        total: indicators.filter((i) => i.cramCategory === 'R').length,
        fulfilled: indicators.filter((i) => i.cramCategory === 'R' && i.statusTerakreditasi === 'MEMENUHI').length,
      },
      A: {
        total: indicators.filter((i) => i.cramCategory === 'A').length,
        fulfilled: indicators.filter((i) => i.cramCategory === 'A' && i.statusTerakreditasi === 'MEMENUHI').length,
      },
      M: {
        total: indicators.filter((i) => i.cramCategory === 'M').length,
        fulfilled: indicators.filter((i) => i.cramCategory === 'M' && i.statusTerakreditasi === 'MEMENUHI').length,
      },
    };

    // Digital evidence statistics
    const digitalReadiness = {
      availableCount: indicators.filter((i) => i.smartEvidence.digitalEvidenceStatus === 'TERSEDIA').length,
      actionRequiredCount: indicators.filter((i) => i.smartEvidence.digitalEvidenceStatus === 'PERLU_TINDAKAN').length,
      missingCount: indicators.filter((i) => i.smartEvidence.digitalEvidenceStatus === 'KOSONG').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        indicators,
        totalIndicators,
        // Default views (Mode Terakreditasi)
        fulfilledCount: fulfilledCountTerakreditasi,
        percentage: percentageTerakreditasi,
        syaratPerluTerakreditasiPassed,
        syaratPerluUnggulPassed,
        predictedStatus: predictedStatusTerakreditasi,
        cramScores,
        criticalAlertsCount: criticalAlertsTerakreditasi.length,
        criticalAlerts: criticalAlertsTerakreditasi,
        digitalReadiness,
        // Dual Mode Extended Summaries
        summaryTerakreditasi: {
          fulfilledCount: fulfilledCountTerakreditasi,
          percentage: percentageTerakreditasi,
          syaratPerluPassed: syaratPerluTerakreditasiPassed,
          predictedStatus: predictedStatusTerakreditasi,
          criticalAlertsCount: criticalAlertsTerakreditasi.length,
          criticalAlerts: criticalAlertsTerakreditasi,
        },
        summaryUnggul: {
          fulfilledCount: fulfilledCountUnggul,
          percentage: percentageUnggul,
          syaratPerluPassed: syaratPerluUnggulPassed,
          predictedStatus: predictedStatusUnggul,
          criticalAlertsCount: criticalAlertsUnggul.length,
          criticalAlerts: criticalAlertsUnggul,
        },
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in IAPT 4.1 GET API:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'LPM') {
      return NextResponse.json(
        { success: false, error: 'Hanya peran LPM yang berwenang memperbarui evaluasi IAPT 4.1.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { nomor, status, notes } = body;

    if (!nomor || !status) {
      return NextResponse.json(
        { success: false, error: 'Nomor indikator dan status wajib diisi.' },
        { status: 400 }
      );
    }

    const baseline = IAPT_4_1_INDICATORS.find((i) => i.nomor === nomor);
    if (!baseline) {
      return NextResponse.json(
        { success: false, error: 'Nomor indikator tidak ditemukan dalam instrumen IAPT 4.1.' },
        { status: 404 }
      );
    }

    await connectToDatabase();
    const updated = await Iapt41Evaluation.findOneAndUpdate(
      { nomor },
      {
        nomor,
        kriteria: baseline.kriteria,
        cramCategory: baseline.cramCategory,
        status,
        notes,
        updatedBy: session.user?.name || 'LPM Administrator',
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
