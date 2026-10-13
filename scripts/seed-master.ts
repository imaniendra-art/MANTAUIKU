import mongoose from "mongoose";
import { config } from "dotenv";
import path from "path";

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), ".env.local") });

// Import models and seed functions
import { seedIKUData } from "../src/lib/seedIKU";
import User from "../src/models/User";
import IKUMetadata from "../src/models/IKUMetadata";
import Target from "../src/models/Target";
import { AmiPeriod, AmiFinding } from "../src/models/Ami";
import {
  AccreditationProfile,
  LamembaCriteria,
  LamembaDl05,
} from "../src/models/Accreditation";
import { POST as seedEvaluationsRoute } from "../src/app/api/evaluations/seed/route";

async function runMasterSeed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ ERROR: MONGODB_URI tidak ditemukan di .env.local");
    process.exit(1);
  }

  console.log("🔌 Menghubungkan ke MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("✅ Terhubung ke database:", mongoose.connection.name);

  try {
    // 1. Core IKU & RBAC Users Seed
    console.log("\n📦 [1/4] Menyemai 12 IKU, Target 2026, dan Akun RBAC PIC...");
    await seedIKUData();
    const userCount = await User.countDocuments();
    const ikuCount = await IKUMetadata.countDocuments();
    const targetCount = await Target.countDocuments();
    console.log(`   ✓ ${userCount} Akun Pengguna siap`);
    console.log(`   ✓ ${ikuCount} Indikator Kinerja Utama (IKU) siap`);
    console.log(`   ✓ ${targetCount} Target Kinerja 2026 siap`);

    // 2. AMI (Audit Mutu Internal) Seed
    console.log("\n📦 [2/4] Menyemai Siklus AMI IX & Temuan KTS/OB 10 Auditee...");
    let period = await AmiPeriod.findOne({ cycleNumber: 9 });
    if (!period) {
      period = await AmiPeriod.create({
        academicYear: "2025/2026",
        cycleNumber: 9,
        title: "Siklus AMI IX Tahun Akademik 2025/2026 (LAMEMBA & SAN Dikti)",
        startDate: new Date("2026-01-15"),
        endDate: new Date("2026-06-30"),
        status: "ACTIVE",
        rtmDate: new Date("2026-07-15"),
      });
    }

    const findingCount = await AmiFinding.countDocuments({ periodId: period._id });
    if (findingCount === 0) {
      const sampleFindings = [
        {
          periodId: period._id,
          auditeeKey: "prodi",
          auditeeName: "Program Studi Manajemen",
          standardRef: "LAMEMBA C.6.3 / Pemutakhiran RPS Berbasis OBE",
          category: "KTS_MINOR",
          description:
            "Sebanyak 4 dari 38 mata kuliah belum memperbarui Rencana Pembelajaran Semester (RPS) dengan pemetaan Capaian Pembelajaran Lulusan (CPL) berbasis kurikulum OBE.",
          auditorName: "Drs. H. M. Said, M.Si (Auditor LPM)",
          status: "IN_PROGRESS",
          rootCause:
            "Dosen pengampu mata kuliah terkait berhalangan hadir saat lokakarya kurikulum prodi bulan Januari.",
          correctiveAction:
            "Menyelenggarakan klinik penyusunan RPS OBE terpadu bagi dosen yang bersangkutan.",
          preventiveAction:
            "Mewajibkan validasi RPS oleh Gugus Kendali Mutu (GKM) prodi H-7 sebelum perkuliahan semester ganjil dimulai.",
          picName: "Kaprodi Manajemen",
          dueDate: new Date("2026-04-30"),
          evidenceUrl: "https://drive.google.com/drive/folders/stimi-rps-obe-2026",
          evidenceNotes: "Draft RPS 4 mata kuliah sedang dalam proses reviu GKM prodi.",
        },
        {
          periodId: period._id,
          auditeeKey: "lppm",
          auditeeName: "UPT. LPPM",
          standardRef: "Standar SN-Dikti / Keterlibatan Mahasiswa dalam Riset",
          category: "OB",
          description:
            "Rasio keterlibatan mahasiswa dalam penelitian dosen sudah mencapai 20%, namun dokumentasi keterlibatan di laporan akhir hibah penelitian belum seragam.",
          auditorName: "Dr. Hj. Nurlaela, S.E., M.Si (Auditor LPM)",
          status: "CLOSED",
          rootCause: "Belum tersedianya template baku lembar pengesahan keterlibatan mahasiswa.",
          correctiveAction: "Merilis template lembar keterlibatan mahasiswa per 1 Februari 2026.",
          preventiveAction: "Pemeriksaan format baku oleh reviewer internal LPPM sebelum pencairan tahap akhir.",
          picName: "Kepala UPT LPPM",
          dueDate: new Date("2026-02-28"),
          evidenceUrl: "https://drive.google.com/drive/folders/stimi-lppm-template",
          evidenceNotes: "Template resmi telah diunggah ke portal LPPM dan disosialisasikan.",
          auditorFeedback: "Template sudah diverifikasi dan diterapkan pada 8 laporan penelitian. Status Closed.",
          closedAt: new Date("2026-02-25"),
        },
        {
          periodId: period._id,
          auditeeKey: "baak",
          auditeeName: "UPT. BAAK",
          standardRef: "Standar Layanan Akademik / Ketepatan Penerbitan Transkrip",
          category: "KTS_MINOR",
          description:
            "Waktu penyelesaian transkrip nilai wisudawan periode ganjil masih membutuhkan rata-rata 5 hari kerja (Standar Mutu: Maksimal 3 hari kerja).",
          auditorName: "Drs. H. M. Said, M.Si (Auditor LPM)",
          status: "OPEN",
          picName: "Kepala UPT BAAK",
          dueDate: new Date("2026-05-15"),
        },
        {
          periodId: period._id,
          auditeeKey: "pusdatin",
          auditeeName: "UPT. Pusdatin",
          standardRef: "Kepatuhan Pelaporan PDDIKTI Feeder 100%",
          category: "OB",
          description:
            "Kelengkapan data riwayat status mahasiswa semester 2025/1 telah mencapai 99.2%, disarankan untuk mencapai 100% sebelum cut-off kementerian.",
          auditorName: "Rahmat Hidayat, S.Kom., M.T (Auditor Teknis)",
          status: "IN_PROGRESS",
          rootCause: "Sebanyak 3 mahasiswa mutasi dari kampus lain masih menunggu verifikasi berkas transfer SKS.",
          correctiveAction: "Koordinasi percepatan dengan subbag akademik fakultas asal.",
          picName: "Kepala UPT Pusdatin",
          dueDate: new Date("2026-04-15"),
        },
        {
          periodId: period._id,
          auditeeKey: "perpustakaan",
          auditeeName: "UPT. Perpustakaan",
          standardRef: "Kecukupan Koleksi E-Journal Manajemen Bereputasi",
          category: "KTS_MAYOR",
          description:
            "Langganan database jurnal internasional bereputasi bidang manajemen bisnis belum diperpanjang untuk tahun anggaran 2026, berpotensi menurunkan skor Kriteria C.6 LAMEMBA.",
          auditorName: "Dr. Hj. Nurlaela, S.E., M.Si (Auditor LPM)",
          status: "OPEN",
          picName: "Kepala UPT Perpustakaan & WK II",
          dueDate: new Date("2026-03-31"),
        },
        {
          periodId: period._id,
          auditeeKey: "humas",
          auditeeName: "UPT. Humas & Kerjasama",
          standardRef: "Keterbukaan Informasi Publik Website Kampus",
          category: "OB",
          description:
            "Pembaruan rubrik berita kegiatan tri dharma pada portal resmi stimi-yapmi.ac.id perlu ditingkatkan frekuensinya minimal 2 kali sepekan.",
          auditorName: "Drs. H. M. Said, M.Si (Auditor LPM)",
          status: "CLOSED",
          rootCause: "Staf pengelola portal merangkap tugas kepanitiaan PMB.",
          correctiveAction: "Membentuk tim redaksi magang mahasiswa dari UKM Jurnalistik.",
          preventiveAction: "Penyusunan kalender konten mingguan.",
          picName: "Kepala UPT Humas",
          dueDate: new Date("2026-03-10"),
          evidenceUrl: "https://stimi.ac.id/berita-terkini",
          evidenceNotes: "Kalender konten aktif dan artikel terbit rutin tiap hari Selasa & Jumat.",
          auditorFeedback: "Verifikasi website menunjukkan pembaruan konten berjalan sangat aktif. Closed.",
          closedAt: new Date("2026-03-12"),
        },
      ];
      await AmiFinding.insertMany(sampleFindings);
    }
    const finalFindings = await AmiFinding.countDocuments({ periodId: period._id });
    console.log(`   ✓ Siklus AMI IX Aktif (${period.academicYear})`);
    console.log(`   ✓ ${finalFindings} Temuan KTS & OB untuk 10 UPT Auditee`);

    // 3. Accreditation (LAMEMBA 9 Kriteria & Lampiran DL-05) Seed
    console.log("\n📦 [3/4] Menyemai Profil Akreditasi, 9 Kriteria LAMEMBA & DL-05...");
    const existingProfiles = await AccreditationProfile.countDocuments();
    if (existingProfiles === 0) {
      await AccreditationProfile.insertMany([
        {
          entityType: "INSTITUSI",
          name: "STIMI YAPMI Makassar",
          degreeLevel: "Perguruan Tinggi",
          agency: "BAN-PT",
          grade: "BAIK_SEKALI",
          skNumber: "SK BAN-PT No. 488/SK/BAN-PT/Ak/PT/VIII/2023",
          validFrom: new Date("2023-08-15"),
          validUntil: new Date("2028-08-15"),
          certificateUrl: "https://stimi.ac.id/dokumen/sertifikat-akreditasi-institusi-2023.pdf",
          notes: "Terakreditasi Baik Sekali oleh BAN-PT dengan masa berlaku hingga Agustus 2028.",
        },
        {
          entityType: "PRODI",
          name: "Program Studi S1 Manajemen",
          degreeLevel: "Sarjana (S1)",
          agency: "LAMEMBA",
          grade: "BAIK_SEKALI",
          skNumber: "SK LAMEMBA No. 128/DE/A.1/AR.8/VII/2023",
          validFrom: new Date("2023-07-20"),
          validUntil: new Date("2028-07-20"),
          certificateUrl: "https://stimi.ac.id/dokumen/sertifikat-akreditasi-s1-manajemen-lamemba.pdf",
          notes: "Terakreditasi Baik Sekali oleh Lembaga Akreditasi Mandiri Ekonomi Manajemen Bisnis dan Akuntansi (LAMEMBA).",
        },
      ]);
    }

    const existingCriteria = await LamembaCriteria.countDocuments();
    if (existingCriteria === 0) {
      await LamembaCriteria.insertMany([
        {
          code: "C.1",
          name: "Visi, Misi, Tujuan, dan Strategi (VMTS)",
          weightPercentage: 5,
          scoreSimulation: 3.75,
          status: "UNGGUL",
          indicatorsCount: 4,
          strengths: "VMTS berorientasi kewirausahaan digital dan selaras dengan Renstra STIMI YAPMI 2024-2028.",
          recommendations: "Peningkatan pemahaman VMTS pada dosen muda dan mahasiswa baru.",
        },
        {
          code: "C.2",
          name: "Tata Pamong, Tata Kelola, dan Kerjasama",
          weightPercentage: 10,
          scoreSimulation: 3.65,
          status: "UNGGUL",
          indicatorsCount: 7,
          strengths: "Struktur organisasi ramping, sistem penjaminan mutu SPMI aktif dengan siklus PPEPP konsisten.",
          recommendations: "Peningkatan kerjasama magang bersertifikat dengan BUMN dan industri multinasional.",
        },
        {
          code: "C.3",
          name: "Mahasiswa",
          weightPercentage: 10,
          scoreSimulation: 3.8,
          status: "UNGGUL",
          indicatorsCount: 5,
          strengths: "Rasio kelulusan tepat waktu mencapai 82%, daya tarik mahasiswa baru meningkat 14%.",
          recommendations: "Pengembangan layanan konseling karir digital dan pembinaan prestasi kewirausahaan nasional.",
        },
        {
          code: "C.4",
          name: "Sumber Daya Manusia (SDM)",
          weightPercentage: 15,
          scoreSimulation: 3.45,
          status: "BAIK_SEKALI",
          indicatorsCount: 8,
          strengths: "18 Dosen Tetap kualifikasi S2/S3 linear, jabatan fungsional Lektor ke atas mencapai 61%.",
          recommendations: "Percepatan penyelesaian studi doktoral (S3) bagi 4 dosen tetap yang sedang studi lanjut.",
        },
        {
          code: "C.5",
          name: "Keuangan, Sarana, dan Prasarana",
          weightPercentage: 10,
          scoreSimulation: 3.55,
          status: "UNGGUL",
          indicatorsCount: 6,
          strengths: "Alokasi anggaran tridharma rutin > 20% dari total penerimaan, laboratorium komputer ber-AC.",
          recommendations: "Pengadaan server cadangan cloud dan perluasan hotspot internet kampus.",
        },
        {
          code: "C.6",
          name: "Pendidikan (Kurikulum OBE & Pembelajaran)",
          weightPercentage: 25,
          scoreSimulation: 3.7,
          status: "UNGGUL",
          indicatorsCount: 12,
          strengths: "Kurikulum OBE memuat mata kuliah kekhususan Manajemen Keuangan, SDM, dan Pemasaran Digital.",
          recommendations: "Penyempurnaan modul asesmen CPL di SIAM dan penguatan studi kasus riil industri.",
        },
        {
          code: "C.7",
          name: "Penelitian",
          weightPercentage: 10,
          scoreSimulation: 3.35,
          status: "BAIK_SEKALI",
          indicatorsCount: 5,
          strengths: "Publikasi jurnal nasional SINTA 2-4 meningkat 28% dalam dua tahun terakhir.",
          recommendations: "Peningkatan publikasi pada jurnal internasional bereputasi terindeks Scopus/WoS.",
        },
        {
          code: "C.8",
          name: "Pengabdian kepada Masyarakat (PkM)",
          weightPercentage: 5,
          scoreSimulation: 3.6,
          status: "UNGGUL",
          indicatorsCount: 4,
          strengths: "Program PkM berbasis pendampingan UMKM di Kota Makassar dan Kabupaten Maros berjalan rutin.",
          recommendations: "Peningkatan perolehan Hak Kekayaan Intelektual (HKI) dari luaran PkM dosen dan mahasiswa.",
        },
        {
          code: "C.9",
          name: "Luaran dan Capaian Tridharma",
          weightPercentage: 10,
          scoreSimulation: 3.68,
          status: "UNGGUL",
          indicatorsCount: 6,
          strengths: "Waktu tunggu lulusan 3.2 bulan, tingkat kepuasan pengguna lulusan mencapai indeks 3.74/4.00.",
          recommendations: "Peningkatan persentase lulusan yang berwirausaha mandiri berbadan hukum.",
        },
      ]);
    }

    const existingDl05 = await LamembaDl05.countDocuments();
    if (existingDl05 === 0) {
      await LamembaDl05.create({
        academicYear: "2025/2026",
        prodiName: "Program Studi S1 Manajemen",
        submissionDate: new Date("2026-03-01"),
        status: "SUBMITTED",
        assessorFollowUps: [
          {
            recommendation:
              "Perlu peningkatan keterlibatan praktisi industri dalam pengajaran matakuliah terapan manajemen.",
            actionTaken:
              "Telah direkrut 4 orang praktisi industri (perbankan & logistik) untuk mengajar secara team-teaching.",
            status: "SELESAI",
            evidenceUrl: "https://drive.google.com/file/d/sk-praktisi-mengajar-2025/view",
          },
          {
            recommendation:
              "Tingkatkan rasio publikasi dosen tetap di jurnal internasional bereputasi.",
            actionTaken:
              "LPPM memberikan insentif publikasi Rp 7.500.000 per artikel terindeks Scopus/WoS.",
            status: "SEDANG_BERJALAN",
            evidenceUrl: "https://drive.google.com/file/d/sk-insentif-publikasi/view",
          },
          {
            recommendation:
              "Perkuat pemantauan penyerapan lulusan melalui tracer study berkala berbasis sistem daring.",
            actionTaken:
              "Integrasi modul pelacak alumni digital dan kolaborasi intensif dengan IKA STIMI YAPMI.",
            status: "SELESAI",
            evidenceUrl: "https://drive.google.com/file/d/laporan-tracer-study-2025/view",
          },
        ],
        renstraProgress: [
          {
            targetName: "Renstra 2026: Akreditasi Prodi Menuju Peringkat Unggul LAMEMBA",
            achievement: "Pencapaian Milestone 78% sesuai target tahun ke-2 Renstra 2024-2028",
            obstacle: "Kebutuhan akselerasi percepatan jabatan fungsional Lektor Kepala dosen muda",
            cqiSolution: "Workshop pendampingan intensif pengajuan PAK Lektor Kepala bersama LLDIKTI IX",
          },
        ],
        learningAssurance: {
          cplAchievementPercentage: 88,
          obeRpsPercentage: 92,
          description:
            "Asesmen jaminan pembelajaran (Assurance of Learning) membuktikan 88% mahasiswa mencapai standar kelulusan CPL yang ditetapkan.",
        },
        facultySufficiency: {
          permanentFacultyCount: 18,
          doctoralPercentage: 33,
          lektorHeadPercentage: 61,
          facultyStudentRatio: "1:24",
          description:
            "Seluruh dosen tetap berkualifikasi S2/S3 linear, dengan rasio dosen mahasiswa 1:24 (sangat memenuhi ambang batas LAMEMBA).",
        },
        tridharmaOutcomes: {
          gpaAverage: 3.42,
          avgStudyDurationMonths: 46,
          tracerStudyResponseRate: 78,
          waitingTimeMonths: 3.2,
          publicationsCount: 24,
          description:
            "Lulusan memiliki daya saing tinggi dengan waktu tunggu kerja 3.2 bulan dan tingkat kepuasan pengguna lulusan 89%.",
        },
      });
    }
    const profileCount = await AccreditationProfile.countDocuments();
    const criteriaCount = await LamembaCriteria.countDocuments();
    console.log(`   ✓ ${profileCount} Profil Akreditasi (BAN-PT & LAMEMBA Baik Sekali)`);
    console.log(`   ✓ ${criteriaCount} Kriteria LAMEMBA C.1 s.d. C.9 dengan simulasi Skor Unggul`);
    console.log(`   ✓ Instrumen Pemantauan Tahunan Wajib Lampiran DL-05 siap`);

    // 4. Evaluations (EDO, EKA, Tracer Study, Employer Survey) Seed via API Route Handler
    console.log("\n📦 [4/4] Menyemai Data EDO, EKA, Tracer Study, dan Survei Pengguna...");
    const evalRes = await seedEvaluationsRoute();
    const evalJson = await evalRes.json();

    if (evalJson.success) {
      console.log(`   ✓ ${evalJson.stats.edoCount} Dosen Evaluasi EDO (IKD Rata-rata Sangat Baik)`);
      console.log(`   ✓ ${evalJson.stats.ekaCount} Layanan UPT Evaluasi EKA`);
      console.log(`   ✓ ${evalJson.stats.tracerCount} Responden Tracer Study Alumni (Tingkat Serapan: ${evalJson.stats.tracerAbsorptionRate})`);
      console.log(`   ✓ ${evalJson.stats.employerCount} Mitra Industri Survei Pengguna`);
      if (evalJson.stats.iku2Updated) {
        console.log(`   ⚡ [AUTO-SUPPLY] Nilai IKU 2 di MongoDB Atlas ter-update otomatis menjadi ${evalJson.stats.tracerAbsorptionRate}!`);
      }
    } else {
      console.error("   ❌ Gagal menyemai evaluasi:", evalJson.error);
    }

    console.log("\n=================================================================");
    console.log("🎉 SELURUH SEEDING DATABASE ATLAS (OPSI A) BERHASIL 100%!");
    console.log("=================================================================\n");

  } catch (error) {
    console.error("❌ Terjadi kesalahan saat seeding:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Koneksi MongoDB diputus dengan rapi.");
    process.exit(0);
  }
}

runMasterSeed();
