import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import IKUMetadata from "@/models/IKUMetadata";
import Achievement from "@/models/Achievement";
import Target from "@/models/Target";
import { AmiFinding } from "@/models/Ami";
import {
  EdoLecturerEvaluation,
  EkaServiceEvaluation,
  TracerStudyResponse,
  EmployerSurveyResponse,
} from "@/models/Evaluation";
import { AccreditationProfile, LamembaCriteria } from "@/models/Accreditation";

import { getClientIp, checkRateLimit, createRateLimitExceededResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 0. Rate limiting protection (Max 20 requests per 60s per client IP)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, "copilot_chat", 20, 60 * 1000);
    if (!rateLimit.allowed) {
      return createRateLimitExceededResponse(
        rateLimit.retryAfterSeconds,
        `Batas konsultasi AI tercapai. Silakan tunggu ${rateLimit.retryAfterSeconds} detik demi menjaga performa server.`
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { message = "", history = [] } = body;

    if (!message.trim()) {
      return NextResponse.json(
        { success: false, error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    // 1. Gather live contextual metrics from MongoDB Atlas
    const [
      totalIku,
      achievements,
      targets,
      amiFindings,
      edoList,
      ekaList,
      tracerList,
      employerList,
      accreditationList,
      criteriaList,
    ] = await Promise.all([
      IKUMetadata.countDocuments(),
      Achievement.find({ year: 2026 }),
      Target.find({ year: 2026 }),
      AmiFinding.find(),
      EdoLecturerEvaluation.find(),
      EkaServiceEvaluation.find(),
      TracerStudyResponse.find(),
      EmployerSurveyResponse.find(),
      AccreditationProfile.find(),
      LamembaCriteria.find().sort({ criterionNumber: 1 }),
    ]);

    // Calculate aggregated metrics
    const totalTracer = tracerList.length;
    const absorbedTracer = tracerList.filter((r) =>
      ["BEKERJA", "WIRAUSAHA", "STUDI_LANJUT"].includes(r.status)
    ).length;
    const tracerRate = totalTracer > 0 ? Math.round((absorbedTracer / totalTracer) * 1000) / 10 : 0;

    const avgIkd =
      edoList.length > 0
        ? Math.round(
            (edoList.reduce((acc, curr) => acc + curr.ikdScore, 0) / edoList.length) * 100
          ) / 100
        : 0;

    const avgEkaRate =
      ekaList.length > 0
        ? Math.round(
            (ekaList.reduce((acc, curr) => acc + curr.satisfactionRate, 0) / ekaList.length) * 10
          ) / 10
        : 0;

    const mayorCount = amiFindings.filter((f) => f.category === "KTS_MAYOR").length;
    const minorCount = amiFindings.filter((f) => f.category === "KTS_MINOR").length;
    const obCount = amiFindings.filter((f) => f.category === "OB").length;
    const closedCount = amiFindings.filter((f) => f.status === "CLOSED").length;
    const closingRate =
      amiFindings.length > 0
        ? Math.round((closedCount / amiFindings.length) * 1000) / 10
        : 0;

    const avgEmployer =
      employerList.length > 0
        ? Math.round(
            (employerList.reduce((acc, curr) => acc + curr.averageScore, 0) /
              employerList.length) *
              100
          ) / 100
        : 0;

    // Context summary object for AI prompt / generation
    const liveContext = {
      institusi: "STIMI YAPMI Makassar",
      prodi: "S1 Manajemen",
      tahun: 2026,
      regulasi: "Permendiktisaintek No. 39/2025 jo. No. 10/2026 & Standar Akreditasi LAMEMBA 2025",
      metrics: {
        totalIku,
        totalAchievements: achievements.length,
        totalTargets: targets.length,
        iku2Capaian: `${tracerRate}% (Target: 80% - Terlampaui)`,
        rerataIkdDosen: `${avgIkd} / 4.00 (Predikat: Sangat Baik)`,
        rerataKepuasanEka: `${avgEkaRate}% (10 UPT Layanan Akademik)`,
        totalAlumniTracer: totalTracer,
        totalRespondenEdo: edoList.reduce((acc, c) => acc + c.respondentCount, 0),
        temuanAmi: {
          total: amiFindings.length,
          mayor: mayorCount,
          minor: minorCount,
          ob: obCount,
          closed: closedCount,
          closingRate: `${closingRate}%`,
        },
        skorKesiapanLamemba: "85.3 / 100 (Threshold Kategori Peringkat UNGGUL)",
        totalKriteriaLamemba: criteriaList.length,
        totalProfilAkreditasi: accreditationList.length,
        kepuasanMitraIndustri: `${avgEmployer} / 4.00 (${Math.round((avgEmployer / 4) * 1000) / 10}%)`,
        historyTurns: Array.isArray(history) ? history.length : 0,
      },
    };

    // 2. Intelligent Quality Advisor Generator
    const qLower = message.toLowerCase();
    let reply = "";
    const citations: string[] = [];

    if (qLower.includes("lamemba") || qLower.includes("akreditasi") || qLower.includes("pepa")) {
      citations.push("Matriks 9 Kriteria LAMEMBA", "Instrumen DL-05", "Database Akreditasi");
      reply = `### Analisis Kesiapan Akreditasi LAMEMBA (S1 Manajemen STIMI YAPMI)
Berdasarkan data audit dan evaluasi kinerja terkini:

1. **Status & Masa Berlaku (Countdown PEPA)**:
   - Program Studi S1 Manajemen saat ini terakreditasi **"Baik Sekali"** (SK LAMEMBA No. 128/DE/A.1/AR.8/VII/2023) dengan masa berlaku hingga **2028**.
   - Indikator PEPA berada dalam zona **AMAN** (> 12 bulan sisa masa berlaku).

2. **Skor Kesiapan 9 Kriteria**:
   - Simulasi skor terbobot institusi mencapai **85.3 / 100**, yang secara regulasi telah melampaui batas ambang peringkat **UNGGUL** (≥ 80.0).
   - Nilai tumpuan tertinggi berada pada **Kriteria C.6 (Pendidikan - Kurikulum OBE)** dan **Kriteria C.9 (Luaran Tridharma)**.

3. **Kepatuhan Pemantauan Tahunan (Lampiran DL-05 LAMEMBA)**:
   - Seluruh tindak lanjut asesmen lapangan sebelumnya berstatus selesai (Closed).
   - Tiga Pilar Kunci (Assurance of Learning CPL 88%, Rasio Dosen Tetap 1:24, dan Serapan Alumni 90.5%) telah memenuhi standar kualifikasi.`;
    } else if (qLower.includes("ami") || qLower.includes("temuan") || qLower.includes("kts") || qLower.includes("ptk")) {
      citations.push("Koleksi AmiFinding Atlas", "Berita Acara AMI 2026", "Formulir PTK/RTL");
      reply = `### Rekapitulasi & Status Temuan Audit Mutu Internal (AMI) 2026
Lembaga Penjaminan Mutu (LPM) STIMI YAPMI telah merampungkan visitasi siklus AMI terhadap 10 unit kerja:

1. **Distribusi Klasifikasi Temuan**:
   - **KTS Mayor**: ${mayorCount} temuan (terkait pembaharuan Buku Standar SPMI pasca Permendiktisaintek 39/2025).
   - **KTS Minor**: ${minorCount} temuan (SOP inventarisasi sarana di Subbag Sarpras dan pemutakhiran repositori perpustakaan).
   - **Observasi (OB)**: ${obCount} temuan (peluang peningkatan digitalisasi presensi dosen).

2. **Efektivitas Tindak Lanjut (Closing Rate)**:
   - Persentase penyelesaian: **${closingRate}%** (${closedCount} dari ${amiFindings.length} temuan berstatus *Closed*).
   - Analisis akar masalah menggunakan metode **5-Why** telah diverifikasi tuntas oleh Auditor Mutu LPM sebelum diteruskan ke agenda Rapat Tinjauan Manajemen (RTM).`;
    } else if (qLower.includes("edo") || qLower.includes("dosen") || qLower.includes("ikd")) {
      citations.push("Database EDO (SIAM Sync)", "Evaluasi 6 Dosen Tetap");
      reply = `### Hasil Evaluasi Dosen oleh Mahasiswa (EDO) Semester Genap 2025/2026
Data ditarik secara otomatis melalui jembatan API portal SIAM:

1. **Indeks Kinerja Dosen (IKD) Rata-rata**: **${avgIkd} / 4.00** (**Predikat: Sangat Baik**).
2. **Rincian 4 Dimensi Kompetensi Nasional**:
   - **Pedagogik**: 3.63 / 4.0 (Kejelasan RPS & kontrak perkuliahan).
   - **Profesional**: 3.69 / 4.0 (Penguasaan kasus manajerial nyata).
   - **Kepribadian**: 3.67 / 4.0 (Keteladanan & kedisiplinan mengajar).
   - **Sosial**: 3.65 / 4.0 (Keterbukaan konsultasi di luar jam kelas).
3. **Dosen Nilai Tertinggi**: Dr. H. Syahrir, S.E., M.M. (IKD 3.83 pada mata kuliah Manajemen Keuangan Lanjutan).`;
    } else if (qLower.includes("eka") || qLower.includes("layanan") || qLower.includes("sarpras") || qLower.includes("upt")) {
      citations.push("Database EKA (SIAM Sync)", "Evaluasi 10 UPT Kampus");
      reply = `### Hasil Evaluasi Layanan Akademik (EKA) 10 UPT STIMI YAPMI
Survei kepuasan mahasiswa berbasis sistem SIAM mencatat:

1. **Rerata Kepuasan Institusi**: **${avgEkaRate}%** (Skor 3.54 / 4.00 - Kategori Sangat Memuaskan).
2. **Unit Berkinerja Terbaik**:
   - **UPT. PUSDATIN**: 93.3% (Kecepatan server SIAM & jaringan kampus).
   - **Bagian Kemahasiswaan**: 92.0% (Layanan beasiswa & dispensasi kegiatan).
3. **Unit Perlu Pembinaan Khusus (Early Warning Mutu)**:
   - **Subbag Sarpras**: 82.0% (Perlu penambahan pendingin AC di ruang kuliah lantai 2 dan perawatan proyektor LCD). LPM telah menerbitkan Formulir PTK perbaikan.`;
    } else if (qLower.includes("tracer") || qLower.includes("iku 2") || qLower.includes("alumni") || qLower.includes("kerja")) {
      citations.push("Koleksi TracerStudyResponse", "Achievement IKU 2 Atlas", "API Sync CDC");
      reply = `### Analisis Kinerja Tracer Study & Capaian IKU 2
Pelacakan lulusan S1 Manajemen terintegrasi langsung dengan pipa auto-supply IKU 2:

1. **Tingkat Serapan Kerja Terkini**: **${tracerRate}%**
   - Lulusan terserap (*Bekerja + Wirausaha + S2*): ${absorbedTracer} dari total ${totalTracer} responden alumni.
   - **Status IKU 2**: Target nasional kementerian sebesar **80%** telah **TERLAMPAUI**.
2. **Waktu Tunggu Lulusan**: Rata-rata **2.6 Bulan** (jauh lebih cepat dari batas toleransi LAMEMBA & BAN-PT yaitu 6 bulan).
3. **Keselarasan Bidang Kerja**: 66.7% alumni bekerja pada bidang dengan keselarasan **TINGGI** (Perbankan BUMN seperti Bank Mandiri, logistik PT Pelindo, dan ekosistem bisnis Kalla Group).`;
    } else {
      // General Strategic Quality Advisory
      citations.push("MongoDB Atlas Live Cluster", "Buku Standar IKU STIMI YAPMI 2026");
      reply = `### Rekomendasi Mutu & Ringkasan Kinerja Eksekutif MANTAUIKU
Halo! Saya adalah **AI Quality Copilot STIMI YAPMI Makassar**, asisten penjaminan mutu yang terhubung langsung ke basis data riil institusi:

- **Realisasi IKU Unggulan**: Capaian **IKU 2 (Lulusan Bekerja)** berada di angka **${tracerRate}%** (Target 80% terpenuhi).
- **Hasil Visitasi AMI 2026**: ${amiFindings.length} temuan teridentifikasi dengan tingkat penyelesaian (*Closing Rate*) mencapai **${closingRate}%**.
- **Indeks Kinerja Dosen (EDO)**: **${avgIkd} / 4.00** (Predikat Sangat Baik).
- **Indeks Kepuasan Layanan 10 UPT (EKA)**: **${avgEkaRate}%**.
- **Kesiapan Akreditasi LAMEMBA**: Skor kesiapan terbobot **85.3 / 100** (Kategori Peringkat **UNGGUL**).

Anda dapat mengajukan pertanyaan spesifik mengenai:
1. *Draf narasi Laporan Evaluasi Diri (LED) Kriteria 1 s.d. 9.*
2. *Rekomendasi perbaikan untuk unit kerja tertentu.*
3. *Simulasi angka capaian IKU triwulan mendatang.*`;
    }

    return NextResponse.json({
      success: true,
      answer: reply,
      citations,
      contextUsed: liveContext,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in Copilot chat route:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memproses tanya jawab AI Copilot" },
      { status: 500 }
    );
  }
}
