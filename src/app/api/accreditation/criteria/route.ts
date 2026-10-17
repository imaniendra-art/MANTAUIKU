import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { LamembaCriteria, AccreditationProfile, AccreditationEvidence } from '@/models/Accreditation';
import { SpmiDocument } from '@/models/SpmiDocument';
import { SpmiVaultFile } from '@/models/SpmiVaultFile';
import { AmiPeriod, AmiFinding } from '@/models/Ami';
import Achievement from '@/models/Achievement';
import IKUMetadata from '@/models/IKUMetadata';
import {
  TracerStudyResponse,
  EmployerSurveyResponse,
  EdoLecturerEvaluation,
  EkaServiceEvaluation,
} from '@/models/Evaluation';
import Profile from '@/models/Profile';
import {
  evaluateLamembaDl09,
  IDl09UnggulSummary,
  ISystemSourceData,
} from '@/lib/accreditation/lamemba-dl09';

export type { ISystemSourceData } from '@/lib/accreditation/lamemba-dl09';

export const dynamic = 'force-dynamic';

export interface IAssessorVerificationCheckItem {
  itemKey: string;
  indicatorCode: string;     // e.g. "LAM-01" s/d "LAM-29"
  dimension: string;         // 12 Dimensi SN-Dikti
  item: string;               // Deskripsi indikator resmi
  verified: boolean;
  isSyaratPerlu: boolean;    // true jika merupakan 15 Indikator Syarat Perlu Terakreditasi (*)
  evidenceDoc: string;        // Nama dokumen resmi yang diminta
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string;
  requiredForUnggul?: boolean;
  systemSourceData?: ISystemSourceData;
}

export interface ISmartEvidenceCriteria {
  digitalEvidenceStatus: 'TERSEDIA' | 'KOSONG' | 'PERLU_TINDAKAN';
  evidenceSummary: string;
  evidenceHref: string;
  evidenceActionLabel: string;
  hasAlert: boolean;
  missingRequirements?: string[];
  assessorVerificationChecklist: IAssessorVerificationCheckItem[];
  verifiedCount: number;
  totalChecklistCount: number;
  syaratPerluCount: number;
  syaratPerluVerifiedCount: number;
}

const DEFAULT_5_KRITERIA = [
  {
    code: 'K.1',
    name: 'Tata Pamong dan Tata Kelola',
    weight: 15,
    score: 0,
    targetScore: 85,
    status: 'PERLU_PERBAIKAN' as const,
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
    status: 'PERLU_PERBAIKAN' as const,
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
    status: 'PERLU_PERBAIKAN' as const,
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
    status: 'PERLU_PERBAIKAN' as const,
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
    status: 'PERLU_PERBAIKAN' as const,
    description:
      'Pelaksanaan penelitian dan kegiatan PkM relevan dengan bidang ilmu manajemen (EMBA), meningkatkan kompetensi dosen, berkontribusi bagi masyarakat/UMKM, dan diintegrasikan ke dalam materi ajar.',
    strengths: [
      'Belum ada dokumen fisik pembuktian yang diunggah ke sistem.',
    ],
    recommendations: [
      'Siapkan dokumen luaran riset dan PkM dosen DKPS Tabel 8 dan unggah berkasnya.',
    ],
  },
];

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Fetch pangkalan data secara paralel
    let criteriaDocs = await LamembaCriteria.find().sort({ code: 1 });

    // Auto-migrate jika database masih menyimpan 9 kriteria lama (C.1 .. C.9)
    const hasLegacyCriteria = criteriaDocs.some((c) => c.code.startsWith('C.'));
    if (criteriaDocs.length === 0 || hasLegacyCriteria) {
      await LamembaCriteria.deleteMany({});
      await LamembaCriteria.insertMany(DEFAULT_5_KRITERIA);
      criteriaDocs = await LamembaCriteria.find().sort({ code: 1 });
    }

    const [
      accreditationProfiles,
      campusProfile,
      uploadedEvidences,
      spmiDocs,
      spmiVaultFiles,
      amiPeriods,
      amiFindings,
      achievements,
      ikuMetadataList,
      tracerCount,
      employerSurveyCount,
      ekaEvaluations,
      edoEvaluations,
    ] = await Promise.all([
      AccreditationProfile.find().lean(),
      Profile.findOne().lean(),
      AccreditationEvidence.find({ targetType: 'PRODI' }).lean(),
      SpmiDocument.find().lean(),
      SpmiVaultFile.find().lean(),
      AmiPeriod.find().lean(),
      AmiFinding.find().lean(),
      Achievement.find().lean(),
      IKUMetadata.find().lean(),
      TracerStudyResponse.countDocuments(),
      EmployerSurveyResponse.countDocuments(),
      EkaServiceEvaluation.find().lean(),
      EdoLecturerEvaluation.find().lean(),
    ]);

    // Build Evidence Map by itemKey
    const evidenceMap = new Map<string, any>();
    uploadedEvidences.forEach((ev) => {
      evidenceMap.set(ev.itemKey, ev);
    });

    // Build Hybrid Insights dari Modul-Modul MANTAUIKU (Opsi B)
    const validSpmiBooks = spmiDocs.filter((d) => d.status === 'DITETAPKAN_BERLAKU');
    const validVaultFiles = spmiVaultFiles.filter((f) => f.statusDocument !== 'KADALUARSA');
    const totalEffectiveSpmiCount = validSpmiBooks.length + validVaultFiles.length;
    const activeAmiPeriod = amiPeriods.find((p) => p.status === 'ACTIVE' || p.status === 'COMPLETED');

    const ikuCodeToIdMap = new Map<string, string>();
    ikuMetadataList.forEach((meta) => {
      ikuCodeToIdMap.set(meta.code, meta._id.toString());
    });

    const getAchievementForIku = (code: string) => {
      const id = ikuCodeToIdMap.get(code);
      if (!id) return null;
      return achievements.find((a) => a.ikuId?.toString() === id);
    };

    const iku4Ach = getAchievementForIku('IKU 4');
    const iku5Ach = getAchievementForIku('IKU 5');
    const iku6Ach = getAchievementForIku('IKU 6');

    // 1. Insight SPMI & AMI
    const spmiSourceData: ISystemSourceData = {
      title: 'Sistem Penjaminan Mutu Internal',
      countText: `${totalEffectiveSpmiCount > 0 ? totalEffectiveSpmiCount + ' Dokumen SPMI Tersedia' : 'Pangkalan Dokumen SPMI'} • ${activeAmiPeriod ? 'Siklus AMI (' + activeAmiPeriod.academicYear + ')' : 'Siklus PPEPP Aktif'}`,
      href: '/dashboard/spmi',
      actionLabel: 'Buka Dokumen SPMI & AMI',
      badge: 'Modul SPMI/AMI',
    };

    // 2. Insight Dosen & SDM (IKU 4)
    const dosenIkuSourceData: ISystemSourceData = {
      title: 'Kualifikasi Dosen & SDM',
      countText: iku4Ach
        ? `Capaian IKU 4: ${iku4Ach.achievedValue}${iku4Ach.unit || '%'} Dosen S3/Praktisi (Target: ${iku4Ach.targetValue}${iku4Ach.unit || '%'})`
        : 'Terhubung ke Modul Capaian IKU 4 (Kualifikasi Dosen)',
      href: '/dashboard/achievements',
      actionLabel: 'Buka Capaian IKU 4',
      badge: 'Modul IKU',
    };

    // 3. Insight Evaluasi Dosen (EDO)
    const edoSourceData: ISystemSourceData = {
      title: 'Evaluasi Dosen oleh Mahasiswa (EDO)',
      countText: `${edoEvaluations.length} Data Penilaian Mengajar Dosen (EDO) Terdata`,
      href: '/dashboard/evaluations',
      actionLabel: 'Buka Hasil EDO',
      badge: 'Modul Evaluasi',
    };

    // 4. Insight Layanan Tendik & Sarpras (EKA)
    const ekaSourceData: ISystemSourceData = {
      title: 'Evaluasi Kinerja Layanan Akademik & Tendik (EKA)',
      countText: `${ekaEvaluations.length} Responden Survei Kepuasan Layanan & Tendik (EKA)`,
      href: '/dashboard/evaluations',
      actionLabel: 'Buka Hasil EKA',
      badge: 'Modul Evaluasi',
    };

    // 5. Insight Tracer Study & Kepuasan Pengguna
    const tracerSourceData: ISystemSourceData = {
      title: 'Tracer Study & Pengguna Lulusan',
      countText: `${tracerCount} Responden Alumni • ${employerSurveyCount} Responden Mitra Pengguna`,
      href: '/dashboard/evaluations',
      actionLabel: 'Buka Tracer Study',
      badge: 'Modul Evaluasi',
    };

    // 6. Insight Riset & Publikasi Dosen (IKU 5)
    const risetIkuSourceData: ISystemSourceData = {
      title: 'Luaran Riset & Publikasi Ilmiah',
      countText: iku5Ach
        ? `Capaian IKU 5: ${iku5Ach.achievedValue} Luaran Riset/HKI Terverifikasi`
        : 'Terhubung ke Modul IKU 5 (Publikasi & Riset Dosen)',
      href: '/dashboard/achievements',
      actionLabel: 'Buka Capaian IKU 5',
      badge: 'Modul IKU',
    };

    // 7. Insight Kemitraan Kerjasama (IKU 6)
    const kemitraanIkuSourceData: ISystemSourceData = {
      title: 'Kemitraan & Kerjasama EMBA',
      countText: iku6Ach
        ? `Capaian IKU 6: ${iku6Ach.achievedValue} Mitra Kerjasama Aktif`
        : 'Terhubung ke Modul IKU 6 (Kemitraan)',
      href: '/dashboard/achievements',
      actionLabel: 'Buka Capaian IKU 6',
      badge: 'Modul IKU',
    };

    // System Sources Map untuk DL-09
    const systemSourcesMap = new Map<string, ISystemSourceData>();
    systemSourcesMap.set('LAM-U21', spmiSourceData);
    systemSourcesMap.set('LAM-U31', dosenIkuSourceData);
    systemSourcesMap.set('LAM-U36', edoSourceData);
    systemSourcesMap.set('LAM-U37', ekaSourceData);
    systemSourcesMap.set('LAM-U39', ekaSourceData);
    systemSourcesMap.set('LAM-U51', tracerSourceData);
    systemSourcesMap.set('LAM-U53', risetIkuSourceData);
    systemSourcesMap.set('LAM-U54', kemitraanIkuSourceData);

    // Evaluasi 4 Syarat Perlu (Knockout Criteria) Status UNGGUL LAMEMBA:
    // STRICT REALISM: HANYA LOLOS JIKA BENAR-BENAR TELAH DIUNGGAH BERKAS BUKTI FISIK DIGITAL
    const dosenS3Passed = evidenceMap.has('lam-06-kualifikasi-dosen-tetap');
    const obeCurriculumPassed =
      evidenceMap.has('lam-20-peta-kurikulum-cpl') &&
      evidenceMap.has('lam-21-rps-case-method-team-project');
    const tracerStudyPassed = evidenceMap.has('lam-24-evaluasi-capaian-cpl');
    const spmiProdiPassed = evidenceMap.has('lam-05-spmi-ppepp-berkala');

    const allKnockoutPassed = dosenS3Passed && obeCurriculumPassed && tracerStudyPassed && spmiProdiPassed;

    // Helper untuk membuat item checklist dengan Strict Realism (Zero Fake Green)
    // Syarat sah: dokumen HANYA terverifikasi jika ada berkas yang diunggah di AccreditationEvidence
    const makeCheckItem = (
      itemKey: string,
      indicatorCode: string,
      dimension: string,
      itemTitle: string,
      defaultDocName: string,
      isSyaratPerlu: boolean,
      requiredForUnggul = false,
      systemSourceData?: ISystemSourceData
    ): IAssessorVerificationCheckItem => {
      const uploaded = evidenceMap.get(itemKey);
      if (uploaded && uploaded.fileUrl) {
        return {
          itemKey,
          indicatorCode,
          dimension,
          item: itemTitle,
          verified: true,
          isSyaratPerlu,
          evidenceDoc: uploaded.evidenceDocName || defaultDocName,
          fileUrl: uploaded.fileUrl,
          fileName: uploaded.originalName || uploaded.fileName,
          uploadedAt: uploaded.updatedAt?.toISOString() || uploaded.createdAt?.toISOString(),
          requiredForUnggul,
          systemSourceData,
        };
      }

      // Jika belum ada unggahan berkas digital mandiri: STATUS 100% MERAH (Strict Realism)
      return {
        itemKey,
        indicatorCode,
        dimension,
        item: itemTitle,
        verified: false,
        isSyaratPerlu,
        evidenceDoc: defaultDocName,
        requiredForUnggul,
        systemSourceData,
      };
    };

    // 2. Generate 5 Kriteria & 29 Indikator LAMEMBA Edisi 2026
    let totalAllIndicators = 0;
    let totalVerifiedIndicators = 0;
    let totalSyaratPerlu = 0;
    let totalVerifiedSyaratPerlu = 0;

    const enrichedCriteria = criteriaDocs.map((c) => {
      let smart: ISmartEvidenceCriteria;
      let isSyaratPerluUnggul = false;
      let isKnockoutItemPassed = true;
      let checklist: IAssessorVerificationCheckItem[] = [];

      switch (c.code) {
        case 'K.1': {
          // KRITERIA 1: TATA PAMONG DAN TATA KELOLA (5 INDIKATOR, 4 SYARAT PERLU)
          isSyaratPerluUnggul = true;
          isKnockoutItemPassed = spmiProdiPassed;

          checklist = [
            // Dimensi 1: Tata Pamong
            makeCheckItem(
              'lam-01-struktur-tata-pamong',
              'LAM-01',
              'Tata Pamong',
              'UPPS/PS menunjukkan struktur dan proses tata pamong.',
              'Statuta, SOTK UPPS/PS, dan SK Uraian Tugas Tata Pamong',
              true,  // (*) Syarat Perlu
              false
            ),
            makeCheckItem(
              'lam-02-pengawasan-sinergi-vmts',
              'LAM-02',
              'Tata Pamong',
              'UPPS/PS menunjukkan bukti dilaksanakannya proses pengawasan, pembentukan sinergi, penyediaan sumber daya, penjagaan dan penguatan nilai-nilai yang mengacu pada misi dan visi institusi dengan efektif dan efisien.',
              'Dokumen Bukti Pengawasan, Sinergi Sumber Daya, & Penguatan Nilai VMTS',
              true,  // (*) Syarat Perlu
              false
            ),
            // Dimensi 2: Tata Kelola
            makeCheckItem(
              'lam-03-rip-renstra-renop',
              'LAM-03',
              'Tata Kelola',
              'UPPS/PS menunjukkan bukti pelaksanaan perencanaan, pengorganisasian, pengarahan, dan pengendalian usaha untuk mendapatkan, mengembangkan, dan memanfaatkan sumber daya untuk mewujudkan visi, mencapai tujuan dan sasarannya.',
              'Rencana Induk Pengembangan (RIP), Renstra UPPS, & Dokumen Renop Tahunan',
              false,
              false
            ),
            makeCheckItem(
              'lam-04-gug-kode-etik',
              'LAM-04',
              'Tata Kelola',
              'UPPS/PS menunjukkan bukti bahwa sistem tata kelola mampu mendorong UPPS/PS menjalankan tugas dan kewajibannya secara efektif, efisien, akuntabel, bertanggung jawab, transparan, adil, dan terhindar dari konflik kepentingan.',
              'Pedoman & Bukti Pelaksanaan Good University Governance (GUG) serta Kode Etik',
              true,  // (*) Syarat Perlu
              false
            ),
            makeCheckItem(
              'lam-05-spmi-ppepp-berkala',
              'LAM-05',
              'Tata Kelola',
              'UPPS/PS menjalankan sistem manajemen mutu internal yang diimplementasikan secara konsisten, efektif dan efisien serta melaporkan hasil penjaminan mutu secara berkala untuk tindak lanjut peningkatan mutu UPPS dan PS dalam menjalankan Tridharma.',
              'Dokumen SPMI Siklus PPEPP (Kebijakan, Manual, Standar, Formulir, & Laporan RTM/AMI)',
              true,  // (*) Syarat Perlu
              true,  // Syarat Perlu Unggul
              spmiSourceData
            ),
          ];
          break;
        }

        case 'K.2': {
          // KRITERIA 2: PENGELOLAAN DOSEN DAN TENAGA KEPENDIDIKAN (10 INDIKATOR, 4 SYARAT PERLU)
          isSyaratPerluUnggul = true;
          isKnockoutItemPassed = dosenS3Passed;

          checklist = [
            // Dimensi 3: Kecukupan dan Kualifikasi Dosen
            makeCheckItem(
              'lam-06-kualifikasi-dosen-tetap',
              'LAM-06',
              'Kecukupan dan Kualifikasi Dosen',
              'UPPS/PS menunjukkan bukti penetapan dan penggunaan kriteria dalam menentukan kualifikasi dosen untuk mendukung fokus Tridharma dengan memerhatikan SN Dikti, SAN-Dikti, misi, visi, tujuan dan sasaran, serta strategi UPPS/PS yang berkaitan dengan tingkat pendidikan, jenjang jabatan akademik, bidang keilmuan, kepakaran, dan rekognisi dosen dengan jumlah yang cukup (minimal lima dosen tetap) sesuai fokus Tridharma Perguruan Tinggi.',
              'DKPS Tabel 1 & 2: Profil DTPS (Minimal 5 Dosen Tetap Linier, Ijazah S2/S3 & Jafung)',
              true,  // (*) Syarat Perlu
              true,  // Syarat Perlu Unggul
              dosenIkuSourceData
            ),
            makeCheckItem(
              'lam-07-matriks-penugasan-dosen',
              'LAM-07',
              'Kecukupan dan Kualifikasi Dosen',
              'UPPS menunjukkan bukti penggunaan matriks yang menggambarkan rencana dan pelaksanaan penugasan dosen di berbagai PS yang dikelolanya.',
              'Matriks Distribusi & Rencana Penugasan Dosen di Seluruh Program Studi UPPS',
              false,
              false
            ),
            makeCheckItem(
              'lam-08-ewmp-beban-kerja-dosen',
              'LAM-08',
              'Kecukupan dan Kualifikasi Dosen',
              'UPPS/PS menerapkan beban kerja dosen yang konsisten dengan fokus Tridharma.',
              'DKPS Tabel 4: Laporan BKD / EWMP Dosen Tetap (Rata-rata 12-16 SKS setara 56.25 jam/pekan)',
              false,
              false
            ),
            // Dimensi 4: Pengelolaan Dosen
            makeCheckItem(
              'lam-09-rekrutmen-pengembangan-dosen',
              'LAM-09',
              'Pengelolaan Dosen',
              'UPPS/PS menunjukkan bukti pelaksanaan rencana rekrutmen dan pengembangan dosen secara terstruktur, dan berkelanjutan, sehingga memiliki dosen dengan jumlah dan kualifikasi sesuai dengan kebutuhan UPPS/PS dan misi, visi, tujuan dan sasaran, serta strategi.',
              'Pedoman & Laporan Realisasi Rekrutmen serta Pengembangan Kompetensi/Studi Lanjut Dosen',
              true,  // (*) Syarat Perlu
              false
            ),
            makeCheckItem(
              'lam-10-fasilitas-rekognisi-emba',
              'LAM-10',
              'Pengelolaan Dosen',
              'UPPS menunjukkan bukti telah memberi dukungan dan fasilitas secara terstruktur dan berkelanjutan kepada dosen untuk memajukan pendidikan, ilmu pengetahuan, praktik profesional, kerjasama/keterlibatan dan rekognisi di bidang EMBA.',
              'Bukti Dukungan Finansial & Fasilitas Riset, Sertifikasi Profesi BNSP/Industri, & Konferensi EMBA',
              false,
              false,
              kemitraanIkuSourceData
            ),
            makeCheckItem(
              'lam-11-evaluasi-kinerja-dosen',
              'LAM-11',
              'Pengelolaan Dosen',
              'UPPS/PS menunjukkan bukti telah melakukan evaluasi proses secara sistematik, terstruktur, dan berkelanjutan terhadap rekrutmen, pengembangan dosen, dan bukti pengukuran kinerja dosen dalam bidang pendidikan, penelitian, dan PKM.',
              'Dokumen Hasil Evaluasi Kinerja Dosen Berkala (EDO, Peer Review Tridharma, & SK Reward/Punishment)',
              false,
              false,
              edoSourceData
            ),
            // Dimensi 5: Kecukupan dan Kualifikasi Tenaga Kependidikan
            makeCheckItem(
              'lam-12-kualifikasi-kecukupan-tendik',
              'LAM-12',
              'Kecukupan dan Kualifikasi Tenaga Kependidikan',
              'UPPS/PS menunjukkan bukti telah memiliki dan menggunakan kriteria untuk menentukan kualifikasi dan jumlah tenaga kependidikan (minimal dua orang untuk layanan dan satu orang untuk perpustakaan) dengan memerhatikan SN Dikti untuk mendukung kegiatan UPPS/PS dalam mencapai misi, visi, tujuan dan sasaran, serta strategi.',
              'DKPS Tabel 5: Profil Tendik (Min. 2 Staf Layanan Akademik/IT & 1 Pustakawan Berkelayakan)',
              true,  // (*) Syarat Perlu
              false,
              ekaSourceData
            ),
            makeCheckItem(
              'lam-13-sertifikat-kompetensi-tendik',
              'LAM-13',
              'Kecukupan dan Kualifikasi Tenaga Kependidikan',
              'UPPS/PS menunjukkan bukti bahwa kualifikasi tenaga kependidikan (pendidikan dan kompetensi) sesuai dengan tugas yang diembannya.',
              'Sertifikat Kompetensi Keahlian Tendik (Laboran Komputer, Pustakawan, Arsiparis, dsb.)',
              false,
              false
            ),
            // Dimensi 6: Pengelolaan Tenaga Kependidikan
            makeCheckItem(
              'lam-14-rekrutmen-pelatihan-tendik',
              'LAM-14',
              'Pengelolaan Tenaga Kependidikan',
              'UPPS/PS menunjukkan bukti memiliki dan melaksanakan rencana rekrutmen dan pengembangan tenaga kependidikan secara sistematik, terstruktur, dan berkelanjutan.',
              'Rencana & Laporan Pelaksanaan Rekrutmen serta Pelatihan/Upskilling Tenaga Kependidikan',
              true,  // (*) Syarat Perlu
              false,
              ekaSourceData
            ),
            makeCheckItem(
              'lam-15-formasi-abk-tendik',
              'LAM-15',
              'Pengelolaan Tenaga Kependidikan',
              'UPPS/PS menunjukkan bukti memiliki tenaga kependidikan dengan jumlah dan kualifikasi sesuai dengan kebutuhan UPPS/PS dan selaras dengan misi, visi, tujuan dan sasaran, serta strategi.',
              'Analisis Beban Kerja (ABK) Tendik & Kesesuaian Formasi Layanan Administrasi Akademik',
              false,
              false
            ),
          ];
          break;
        }

        case 'K.3': {
          // KRITERIA 3: KEUANGAN DAN SARANA PRASARANA (4 INDIKATOR, 2 SYARAT PERLU)
          checklist = [
            // Dimensi 7: Keuangan
            makeCheckItem(
              'lam-16-rkat-realisasi-keuangan',
              'LAM-16',
              'Keuangan',
              'UPPS/PS menunjukkan bukti telah merencanakan penerimaan dan pengeluaran/pemanfaatan sumber keuangan untuk mendukung, mempertahankan, dan meningkatkan kualitas layanan, terutama yang berkaitan dengan pemenuhan kebutuhan operasional pendidikan, penelitian dan pengabdian kepada masyarakat serta investasi yang selaras dengan misi, visi, tujuan dan sasaran, serta strategi.',
              'DKPS Tabel 6: Rencana Kerja & Anggaran Tahunan (RKAT) serta Laporan Realisasi Keuangan TS-2 s.d TS',
              true,  // (*) Syarat Perlu
              false
            ),
            makeCheckItem(
              'lam-17-keberlanjutan-keuangan-audit',
              'LAM-17',
              'Keuangan',
              'UPPS/PS menunjukkan bukti telah melakukan usaha dan menunjukkan hasil-hasilnya untuk menjamin keberlanjutan sumber daya keuangan.',
              'Laporan Audit Keuangan Eksternal (Akuntan Publik) & Bukti Diversifikasi Sumber Pendanaan Mandiri',
              false,
              false
            ),
            // Dimensi 8: Sarana dan Prasarana
            makeCheckItem(
              'lam-18-inventaris-masterplan-sarpras',
              'LAM-18',
              'Sarana Prasarana',
              'UPPS/PS menunjukkan bukti penyediaan dan pengelolaan serta rencana pengembangan sarana dan prasarana yang dapat dimanfaatkan oleh mahasiswa dan dosen untuk kegiatan pendidikan, penelitian, pengabdian kepada masyarakat dan oleh tenaga kependidikan untuk mendukung kegiatan pendidikan, penelitian dan pengabdian kepada masyarakat.',
              'Daftar Inventaris Sarpras, Lab Komputer Bisnis, Ruang Kuliah Multimedia, & Masterplan Sarpras',
              true,  // (*) Syarat Perlu
              false
            ),
            makeCheckItem(
              'lam-19-k3-ramah-difabel-gender',
              'LAM-19',
              'Sarana Prasarana',
              'UPPS/PS menunjukkan bukti bahwa sarana dan prasarana yang memenuhi standar kebersihan, kesehatan, keamanan, dan keselamatan, serta memerhatikan kesetaraan gender dan ramah difabel.',
              'SOP & Bukti Fisik Fasilitas K3, Akses Difabel (Ramp/Toilet Khusus), & Sarana Responsif Gender',
              false,
              false
            ),
          ];
          break;
        }

        case 'K.4': {
          // KRITERIA 4: PENDIDIKAN DAN PENGAJARAN (6 INDIKATOR, 3 SYARAT PERLU)
          isSyaratPerluUnggul = true;
          isKnockoutItemPassed = obeCurriculumPassed && tracerStudyPassed;

          checklist = [
            // Dimensi 9: Kurikulum
            makeCheckItem(
              'lam-20-peta-kurikulum-cpl',
              'LAM-20',
              'Kurikulum',
              'UPPS/PS menunjukkan bukti penggunaan peta kurikulum untuk menjamin struktur mata kuliah dan kegiatan pembelajaran konsisten dan relevan dengan kompetensi (CPL) yang diharapkan dan selaras dengan misi, visi, tujuan dan sasaran, serta strategi.',
              'Buku Kurikulum OBE S1 Manajemen, Profil Lulusan, Matriks CPL terhadap Mata Kuliah & Peta Kurikulum',
              true,  // (*) Syarat Perlu
              true   // Syarat Perlu Unggul
            ),
            makeCheckItem(
              'lam-21-rps-case-method-team-project',
              'LAM-21',
              'Kurikulum',
              'UPPS/PS menunjukkan bukti implementasi kurikulum mampu memfasilitasi keterlibatan aktif mahasiswa dan dosen dalam kegiatan belajar mengajar.',
              'Perangkat Rencana Pembelajaran Semester (RPS) Berbasis Studi Kasus & Proyek Tim Partisipatif',
              true,  // (*) Syarat Perlu
              true   // Syarat Perlu Unggul
            ),
            makeCheckItem(
              'lam-22-materi-mutakhir-lms-portofolio',
              'LAM-22',
              'Kurikulum',
              'UPPS/PS menunjukkan bukti penggunaan materi dan metoda pembelajaran yang mutakhir dan relevan dengan kebutuhan EMBA saat ini dan di masa depan, selaras dengan misi, visi, tujuan dan sasaran, serta strategi untuk mencapai kompetensi (CPL) yang ditetapkan.',
              'Bahan Ajar/Modul Mutakhir, Pemanfaatan E-Learning LMS, & Portofolio Asesmen Mahasiswa',
              false,
              false
            ),
            makeCheckItem(
              'lam-23-reviu-kurikulum-dudik-alumni',
              'LAM-23',
              'Kurikulum',
              'UPPS/PS menunjukkan bukti evaluasi, perbaikan, dan pengembangan kurikulum agar sesuai dan relevan dengan perkembangan ilmu pengetahuan, praktik profesional, dan tantangan di masa yang akan datang dengan melibatkan pemangku kepentingan.',
              'Berita Acara, Notulen, & Daftar Hadir Reviu Kurikulum bersama Asosiasi Profesi/DUDIK & Alumni',
              false,
              false
            ),
            // Dimensi 10: Jaminan Pembelajaran
            makeCheckItem(
              'lam-24-evaluasi-capaian-cpl',
              'LAM-24',
              'Jaminan Pembelajaran',
              'UPPS/PS menunjukkan bukti analisis dan evaluasi hasil pembelajaran.',
              'Laporan Hasil Pengukuran Ketercapaian CPL Mahasiswa & Rubrik Penilaian Portofolio Lulusan',
              true,  // (*) Syarat Perlu
              true,  // Syarat Perlu Unggul
              tracerSourceData
            ),
            makeCheckItem(
              'lam-25-tindak-lanjut-intervensi-pembelajaran',
              'LAM-25',
              'Jaminan Pembelajaran',
              'UPPS/PS menunjukkan bukti intervensi sebagai tindak lanjut hasil analisis dan evaluasi hasil pembelajaran.',
              'Laporan Tindak Lanjut & Intervensi Peningkatan Mutu Pembelajaran (Remedial, Lokakarya Dosen, Modifikasi RPS)',
              false,
              false
            ),
          ];
          break;
        }

        case 'K.5': {
          // KRITERIA 5: PENELITIAN DAN PENGABDIAN KEPADA MASYARAKAT (4 INDIKATOR, 2 SYARAT PERLU)
          checklist = [
            // Dimensi 11: Penelitian
            makeCheckItem(
              'lam-26-publikasi-riset-dosen-sinta',
              'LAM-26',
              'Penelitian',
              'UPPS/PS menunjukkan bukti bahwa kegiatan dan hasil penelitiannya mampu berkontribusi dalam meningkatkan kompetensi dosen.',
              'DKPS Tabel 3b & 8: Laporan Publikasi Ilmiah Dosen pada Jurnal Terakreditasi Sinta/Scopus & HKI',
              true,  // (*) Syarat Perlu
              false, // requiredForUnggul
              risetIkuSourceData
            ),
            makeCheckItem(
              'lam-27-integrasi-riset-dalam-pbm',
              'LAM-27',
              'Penelitian',
              'UPPS/PS menunjukkan bukti pengintegrasian kegiatan, hasil, dan kontribusi penelitian dalam evaluasi kinerja dosen.',
              'Bukti Hasil Penelitian Dosen yang Diintegrasikan ke dalam Bahan Ajar/RPS Mata Kuliah & Evaluasi Kinerja',
              false,
              false
            ),
            // Dimensi 12: Pengabdian kepada Masyarakat
            makeCheckItem(
              'lam-28-laporan-pkm-dampak-masyarakat',
              'LAM-28',
              'Pengabdian kepada Masyarakat',
              'UPPS/PS menunjukkan bukti bahwa kegiatan dan hasil PKM mampu berkontribusi dalam meningkatkan kompetensi dosen dan masyarakat.',
              'Laporan Pelaksanaan Kegiatan PkM Dosen yang Memberikan Dampak Nyata pada Mitra UMKM/Masyarakat',
              true,  // (*) Syarat Perlu
              false
            ),
            makeCheckItem(
              'lam-29-integrasi-pkm-dalam-pbm',
              'LAM-29',
              'Pengabdian kepada Masyarakat',
              'UPPS/PS menunjukkan bukti pengintegrasian kegiatan, hasil, dan kontribusi PKM dalam evaluasi kinerja dosen.',
              'Bukti Hasil PkM Dosen yang Diadopsi Masyarakat / Diintegrasikan dalam Pembelajaran & Evaluasi Kinerja',
              false,
              false
            ),
          ];
          break;
        }

        default:
          checklist = [];
      }

      const verifiedCount = checklist.filter((x) => x.verified).length;
      const totalCount = checklist.length;
      const syaratPerluItems = checklist.filter((x) => x.isSyaratPerlu);
      const syaratPerluVerified = syaratPerluItems.filter((x) => x.verified).length;

      totalAllIndicators += totalCount;
      totalVerifiedIndicators += verifiedCount;
      totalSyaratPerlu += syaratPerluItems.length;
      totalVerifiedSyaratPerlu += syaratPerluVerified;

      const digitalStatus: 'TERSEDIA' | 'PERLU_TINDAKAN' | 'KOSONG' =
        verifiedCount === totalCount ? 'TERSEDIA' : verifiedCount > 0 ? 'PERLU_TINDAKAN' : 'KOSONG';

      smart = {
        digitalEvidenceStatus: digitalStatus,
        evidenceSummary:
          verifiedCount > 0
            ? `${verifiedCount} dari ${totalCount} indikator terverifikasi sah (${syaratPerluVerified}/${syaratPerluItems.length} Syarat Perlu terpenuhi).`
            : `Belum ada berkas fisik digital yang diunggah untuk ${totalCount} indikator kriteria ini.`,
        evidenceHref: '/dashboard/spmi',
        evidenceActionLabel: 'Kelola Dokumen Pendukung',
        hasAlert: verifiedCount < totalCount,
        assessorVerificationChecklist: checklist,
        verifiedCount,
        totalChecklistCount: totalCount,
        syaratPerluCount: syaratPerluItems.length,
        syaratPerluVerifiedCount: syaratPerluVerified,
      };

      // Skor Kriteria: Mengikuti nilai tersimpan di database atau proporsional bukti riil
      // Karena pangkalan data awal berstatus nol, jika c.score === 0 maka skor = 0
      const calculatedScore = totalCount > 0 ? Number(((verifiedCount / totalCount) * 100).toFixed(1)) : 0;
      const criterionScore = c.score > 0 ? c.score : calculatedScore;
      const criterionStatus =
        criterionScore >= 85
          ? 'UNGGUL'
          : criterionScore >= 70
          ? 'BAIK_SEKALI'
          : criterionScore >= 55
          ? 'BAIK'
          : 'PERLU_PERBAIKAN';

      return {
        _id: c._id.toString(),
        code: c.code,
        name: c.name,
        weight: c.weight,
        score: criterionScore,
        targetScore: c.targetScore,
        status: criterionStatus,
        description: c.description,
        strengths: verifiedCount > 0 ? c.strengths : ['Belum ada dokumen fisik pembuktian yang diunggah ke sistem.'],
        recommendations:
          verifiedCount > 0
            ? c.recommendations
            : ['Siapkan dokumen resmi yang diminta asesor dan klik tombol [+ Upload Dokumen / PDF] pada butir indikator.'],
        isSyaratPerluUnggul,
        isKnockoutItemPassed,
        smartEvidence: smart,
      };
    });

    // 3. Kalkulasi Skor Terbobot & Ambang Kelulusan LAMEMBA 2026
    let weightedSum = 0;
    let totalWeight = 0;
    enrichedCriteria.forEach((c) => {
      weightedSum += (c.score * c.weight);
      totalWeight += c.weight;
    });

    const finalWeightedScore = Number((weightedSum / (totalWeight || 100)).toFixed(1));

    // Ambang SN-Dikti 2026:
    // 1. Minimal 90% indikator (minimal 26 dari 29) memenuhi SN-Dikti
    const isSnDiktiPassed = totalVerifiedIndicators >= 26;
    // 2. 15 Indikator Syarat Perlu Terakreditasi wajib 100% terpenuhi
    const isSyaratPerluPassed = totalVerifiedSyaratPerlu === 15;
    const isTerakreditasiPassed = isSnDiktiPassed && isSyaratPerluPassed;

    const snDiktiSummary = {
      totalIndicators: totalAllIndicators || 29,
      verifiedIndicators: totalVerifiedIndicators,
      percentage: Number((((totalVerifiedIndicators) / (totalAllIndicators || 29)) * 100).toFixed(1)),
      minThreshold: 26,
      isSnDiktiPassed,
      syaratPerluTotal: totalSyaratPerlu || 15,
      syaratPerluVerified: totalVerifiedSyaratPerlu,
      isSyaratPerluPassed,
      isTerakreditasiPassed,
    };

    // Mode 1: Pertahankan Peringkat Aktif (BAIK SEKALI)
    const summaryBaikSekali = {
      targetMode: 'BAIK_SEKALI' as const,
      targetScoreMin: 70,
      achievedScore: finalWeightedScore,
      isPassed: isTerakreditasiPassed,
      statusLabel: isTerakreditasiPassed
        ? 'TERAKREDITASI (BAIK SEKALI)'
        : `BELUM MEMENUHI AMBANG TERAKREDITASI (SKOR: ${finalWeightedScore.toFixed(1)})`,
      description: isTerakreditasiPassed
        ? 'Program Studi S1 Manajemen memenuhi ambang batas SN-Dikti (29 Indikator) dan 15 Indikator Syarat Perlu Terakreditasi.'
        : `Tersisa ${15 - totalVerifiedSyaratPerlu} Syarat Perlu dan ${Math.max(0, 26 - totalVerifiedIndicators)} indikator kelayakan yang perlu diunggah berkas fisiknya.`,
      skNumber: 'SK LAMEMBA No. 933/DE/A.5/AR.10/XII/2023',
    };

    // Mode 2: Target Akselerasi UNGGUL
    const isScoreUnggulPassed = finalWeightedScore >= 85.0;
    const isUnggulPassed = isTerakreditasiPassed && isScoreUnggulPassed && allKnockoutPassed;

    const summaryUnggul = {
      targetMode: 'UNGGUL' as const,
      targetScoreMin: 85,
      achievedScore: finalWeightedScore,
      isScorePassed: isScoreUnggulPassed,
      isKnockoutPassed: allKnockoutPassed,
      isPassed: isUnggulPassed,
      statusLabel: isUnggulPassed
        ? 'TERAKREDITASI UNGGUL'
        : `BELUM MEMENUHI SYARAT UNGGUL (SKOR: ${finalWeightedScore.toFixed(1)})`,
      description: isUnggulPassed
        ? 'Seluruh 4 Syarat Perlu (Knockout Criteria) UNGGUL dan 29 Indikator SN-Dikti Terpenuhi Sah.'
        : 'Status belum mencapai Unggul karena berkas fisik dokumen SN-Dikti dan 4 Syarat Perlu Knockout belum diunggah.',
    };

    const knockoutReport = {
      allPassed: allKnockoutPassed,
      c4DosenS3: {
        passed: dosenS3Passed,
        label: 'Kriteria K.2 SDM (Dosen Tetap S3 >= 20% & Lektor Kepala >= 10%)',
        value: dosenS3Passed ? 'Bukti DKPS Terunggah' : 'Belum Ada Berkas (0%)',
      },
      c6ObeCurriculum: {
        passed: obeCurriculumPassed,
        label: 'Kriteria K.4 Pendidikan (Kurikulum OBE & RPS Case/Project >= 50%)',
        value: obeCurriculumPassed ? 'Buku OBE Siap' : 'Belum Ada Berkas',
      },
      c9TracerStudy: {
        passed: tracerStudyPassed,
        label: 'Kriteria K.4 Jaminan Pembelajaran (Tracer Study Responden >= 50%)',
        value: tracerStudyPassed ? 'Laporan PDF Terunggah' : 'Belum Ada Berkas',
      },
      spmiProdi: {
        passed: spmiProdiPassed,
        label: 'Kriteria K.1 SPMI (Siklus PPEPP Berjalan Efektif >= 3 Tahun)',
        value: spmiProdiPassed ? 'SPMI PPEPP Aktif' : 'Belum Ada Berkas',
      },
    };

    const dl09Summary: IDl09UnggulSummary = evaluateLamembaDl09(evidenceMap, systemSourcesMap);

    return NextResponse.json({
      success: true,
      data: {
        criteria: enrichedCriteria,
        finalWeightedScore,
        totalWeight,
        snDiktiSummary,
        summaryBaikSekali,
        summaryUnggul,
        knockoutReport,
        dl09Summary,
        prodiProfile: {
          name: 'Program Studi S1 Manajemen',
          degreeLevel: 'Sarjana (S1)',
          agency: 'LAMEMBA',
          currentGrade: 'BAIK_SEKALI',
          skNumber: 'SK LAMEMBA No. 933/DE/A.5/AR.10/XII/2023',
          validUntil: '2028-12-28',
        },
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching accreditation criteria:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'LPM') {
      return NextResponse.json(
        { success: false, error: 'Hanya LPM yang dapat memperbarui evaluasi kriteria akreditasi.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, score, description, strengths, recommendations } = body;

    if (!id || score === undefined) {
      return NextResponse.json({ success: false, error: 'Data kriteria tidak lengkap.' }, { status: 400 });
    }

    await connectToDatabase();
    const criteria = await LamembaCriteria.findById(id);
    if (!criteria) {
      return NextResponse.json({ success: false, error: 'Kriteria tidak ditemukan.' }, { status: 404 });
    }

    criteria.score = score;
    if (score >= 85) criteria.status = 'UNGGUL';
    else if (score >= 70) criteria.status = 'BAIK_SEKALI';
    else if (score >= 55) criteria.status = 'BAIK';
    else criteria.status = 'PERLU_PERBAIKAN';

    if (description) criteria.description = description;
    if (strengths) criteria.strengths = strengths;
    if (recommendations) criteria.recommendations = recommendations;

    await criteria.save();

    return NextResponse.json({ success: true, data: criteria });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
