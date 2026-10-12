import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { AmiPeriod, AmiFinding } from '@/models/Ami';

export async function POST() {
  try {
    await connectToDatabase();

    // Check if period already exists
    let period = await AmiPeriod.findOne({ cycleNumber: 9 });
    if (!period) {
      period = await AmiPeriod.create({
        academicYear: '2025/2026',
        cycleNumber: 9,
        title: 'Siklus AMI IX Tahun Akademik 2025/2026 (LAMEMBA & SAN Dikti)',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
        rtmDate: new Date('2026-07-15'),
      });
    }

    // Check if findings exist
    const count = await AmiFinding.countDocuments({ periodId: period._id });
    if (count === 0) {
      const sampleFindings = [
        {
          periodId: period._id,
          auditeeKey: 'prodi',
          auditeeName: 'Program Studi Manajemen',
          standardRef: 'LAMEMBA C.6.3 / Pemutakhiran RPS Berbasis OBE',
          category: 'KTS_MINOR',
          description: 'Sebanyak 4 dari 38 mata kuliah belum memperbarui Rencana Pembelajaran Semester (RPS) dengan pemetaan Capaian Pembelajaran Lulusan (CPL) berbasis kurikulum OBE.',
          auditorName: 'Drs. H. M. Said, M.Si (Auditor LPM)',
          status: 'IN_PROGRESS',
          rootCause: 'Dosen pengampu mata kuliah terkait berhalangan hadir saat lokakarya kurikulum prodi bulan Januari.',
          correctiveAction: 'Menyelenggarakan klinik penyusunan RPS OBE terpadu bagi dosen yang bersangkutan.',
          preventiveAction: 'Mewajibkan validasi RPS oleh Gugus Kendali Mutu (GKM) prodi H-7 sebelum perkuliahan semester ganjil dimulai.',
          picName: 'Kaprodi Manajemen',
          dueDate: new Date('2026-04-30'),
          evidenceUrl: 'https://drive.google.com/drive/folders/stimi-rps-obe-2026',
          evidenceNotes: 'Draft RPS 4 mata kuliah sedang dalam proses reviu GKM prodi.',
        },
        {
          periodId: period._id,
          auditeeKey: 'lppm',
          auditeeName: 'UPT. LPPM',
          standardRef: 'Standar SN-Dikti / Keterlibatan Mahasiswa dalam Riset',
          category: 'OB',
          description: 'Rasio keterlibatan mahasiswa dalam penelitian dosen sudah mencapai 20%, namun dokumentasi keterlibatan di laporan akhir hibah penelitian belum seragam.',
          auditorName: 'Dr. Nurul Fadilah, SE., MM (Auditor LPM)',
          status: 'CLOSED',
          rootCause: 'Format template laporan akhir LPPM belum memiliki kolom khusus daftar mahasiswa pembantu peneliti.',
          correctiveAction: 'Memperbarui template laporan kemajuan dan laporan akhir riset LPPM edisi 2026.',
          preventiveAction: 'Sosialisasi format baru melalui surat edaran LPPM ke seluruh dosen.',
          picName: 'Kepala UPT LPPM',
          dueDate: new Date('2026-03-15'),
          evidenceUrl: 'https://drive.google.com/file/d/lppm-template-2026/view',
          evidenceNotes: 'Template revisi telah diterbitkan dan diunggah di portal dokumen LPPM.',
          auditorFeedback: 'Bukti template baru valid dan sudah tersosialisasi dengan baik. Temuan dinyatakan Closed.',
          closedAt: new Date('2026-03-20'),
        },
        {
          periodId: period._id,
          auditeeKey: 'perpustakaan',
          auditeeName: 'UPT. Perpustakaan',
          standardRef: 'Standar LAMEMBA C.5.2 / Akses Jurnal Elektronik Internasional',
          category: 'KTS_MAYOR',
          description: 'Akses langganan database e-journal bidang manajemen/bisnis internasional sempat terputus selama 2 bulan karena keterlambatan perpanjangan kontrak lisensi.',
          auditorName: 'Drs. H. M. Said, M.Si (Auditor LPM)',
          status: 'UNDER_REVIEW',
          rootCause: 'Keterlambatan proses pengajuan disposisi anggaran perpanjangan lisensi ke bagian keuangan.',
          correctiveAction: 'Telah dilakukan perpanjangan langganan e-journal Emerald & EBSCO untuk periode 2026-2027.',
          preventiveAction: 'Menerapkan sistem pengingat otomatis (auto-reminder) H-60 sebelum masa berlaku lisensi habis.',
          picName: 'Kepala UPT Perpustakaan',
          dueDate: new Date('2026-04-15'),
          evidenceUrl: 'https://drive.google.com/file/d/invoice-ebsco-2026/view',
          evidenceNotes: 'Bukti invoice resmi dan surat aktivasi akun perpustakaan kampus telah dilampirkan.',
        },
        {
          periodId: period._id,
          auditeeKey: 'pusdatin',
          auditeeName: 'UPT. Pusdatin',
          standardRef: 'Permendiktisaintek No. 39/2025 / Validitas Pelaporan PDDIKTI',
          category: 'OB',
          description: 'Sinkronisasi data aktivitas perkuliahan ke PDDIKTI Feeder sudah 100%, namun log backup database server lokal belum terjadwal secara otomatis di cloud storage.',
          auditorName: 'Dr. Nurul Fadilah, SE., MM (Auditor LPM)',
          status: 'OPEN',
          rootCause: 'Script cron job backup lokal belum dikonfigurasi ke bucket cloud S3 kampus.',
          correctiveAction: 'Menyiapkan automasi cron job backup database mingguan terenkripsi.',
          preventiveAction: 'Pemeriksaan integritas snapshot data setiap awal bulan.',
          picName: 'Kepala UPT Pusdatin',
          dueDate: new Date('2026-05-15'),
        },
        {
          periodId: period._id,
          auditeeKey: 'lab_komputer',
          auditeeName: 'UPT. Lab. Komputer',
          standardRef: 'Standar Sarpras / Kelayakan Perangkat Lunak Praktikum',
          category: 'KTS_MINOR',
          description: 'Sebanyak 8 unit PC di Lab 2 memerlukan update lisensi aplikasi pengolahan data statistik (SPSS/SmartPLS) untuk praktikum metode penelitian manajemen.',
          auditorName: 'Tim Auditor LPM',
          status: 'OPEN',
          picName: 'Kepala Lab Komputer',
          dueDate: new Date('2026-05-01'),
        },
        {
          periodId: period._id,
          auditeeKey: 'keuangan',
          auditeeName: 'UPT. Keuangan Rutin Pegawai',
          standardRef: 'LAMEMBA C.4.1 / Transparansi & Akuntabilitas Anggaran Operasional',
          category: 'OB',
          description: 'SOP pengajuan uang muka kerja (UMK) kegiatan prodi perlu digitalisasi form agar tidak bergantung pada tanda tangan fisik basah saat pimpinan dinas luar.',
          auditorName: 'Tim Auditor LPM',
          status: 'CLOSED',
          rootCause: 'Belum ada modul formulir pengajuan online.',
          correctiveAction: 'Telah dibuat form pengajuan digital berbasis Google Workspace kampus.',
          preventiveAction: 'Sosialisasi alur verifikasi berkas digital.',
          picName: 'Kabag Keuangan',
          dueDate: new Date('2026-02-28'),
          evidenceUrl: 'https://drive.google.com/file/d/sop-keuangan-digital/view',
          evidenceNotes: 'SOP baru telah ditandatangani Ketua STIMI YAPMI.',
          auditorFeedback: 'SOP dan form digital sudah aktif digunakan. Temuan Closed.',
          closedAt: new Date('2026-03-01'),
        },
        {
          periodId: period._id,
          auditeeKey: 'kemahasiswaan',
          auditeeName: 'UPT. Kemahasiswaan & Alumni',
          standardRef: 'Standar IKU 2 & LAMEMBA C.3.4 / Response Rate Tracer Study',
          category: 'KTS_MINOR',
          description: 'Tingkat partisipasi (response rate) alumni dalam pengisian tracer study lulusan tahun 2025 masih di angka 58% (target minimum LAMEMBA: 70%).',
          auditorName: 'Tim Auditor LPM',
          status: 'IN_PROGRESS',
          rootCause: 'Banyak nomor kontak WhatsApp alumni angkatan 2025 yang berganti setelah yudisium.',
          correctiveAction: 'Mengadakan program pembaruan data alumni berhadiah e-wallet dan melibatkan ikatan alumni (IKA).',
          preventiveAction: 'Mewajibkan verifikasi nomor kontak abadi sebelum pengambilan ijazah asli.',
          picName: 'Kepala UPT Kemahasiswaan',
          dueDate: new Date('2026-05-30'),
          evidenceUrl: 'https://drive.google.com/drive/folders/tracer-study-update-2026',
        },
        {
          periodId: period._id,
          auditeeKey: 'baak',
          auditeeName: 'UPT. BAAK',
          standardRef: 'Standar Tata Pamong / Kecepatan Layanan Legalisir Dokumen',
          category: 'OB',
          description: 'Waktu tunggu layanan legalisir ijazah dan transkrip rata-rata 3 hari kerja, disarankan ditingkatkan menjadi layanan satu hari (one-day service) berbasis tanda tangan elektronik.',
          auditorName: 'Tim Auditor LPM',
          status: 'OPEN',
          picName: 'Kepala BAAK',
          dueDate: new Date('2026-06-15'),
        },
        {
          periodId: period._id,
          auditeeKey: 'umum_kerjasama',
          auditeeName: 'UPT. Umum dan Kerjasama',
          standardRef: 'Standar Kerjasama LAMEMBA C.8 / Implementasi Nyata Dokumen Kerjasama',
          category: 'KTS_MAYOR',
          description: 'Dari 14 MoU yang aktif dengan dunia usaha/industri, terdapat 6 MoU yang belum memiliki dokumen Perjanjian Kerjasama (PKS/MoA) dan belum terlaksana kegiatannya.',
          auditorName: 'Tim Auditor LPM',
          status: 'IN_PROGRESS',
          rootCause: 'Belum ada PIC operasional yang ditunjuk khusus untuk mengawal implementasi tiap mitra industri.',
          correctiveAction: 'Menugaskan dosen penanggung jawab program magang dan praktisi mengajar untuk menindaklanjuti 6 MoU tersebut menjadi PKS konkret.',
          preventiveAction: 'Evaluasi tahunan status kemitraan aktif sebelum perpanjangan masa berlaku MoU.',
          picName: 'Kepala UPT Kerjasama',
          dueDate: new Date('2026-05-15'),
          evidenceUrl: 'https://drive.google.com/drive/folders/pks-mitra-industri-2026',
        },
        {
          periodId: period._id,
          auditeeKey: 'humas',
          auditeeName: 'UPT. Humas',
          standardRef: 'Keterbukaan Informasi Publik / Pembaruan Konten Website Resmi',
          category: 'OB',
          description: 'Publikasi capaian prestasi mahasiswa dan agenda kampus di website resmi perlu diperbarui secara berkala minimal 2 kali seminggu untuk meningkatkan visibilitas institusi.',
          auditorName: 'Tim Auditor LPM',
          status: 'CLOSED',
          rootCause: 'Kekurangan staf content writer.',
          correctiveAction: 'Membentuk tim redaksi magang mahasiswa dari UKM Jurnalistik.',
          preventiveAction: 'Penyusunan kalender konten mingguan.',
          picName: 'Kepala UPT Humas',
          dueDate: new Date('2026-03-10'),
          evidenceUrl: 'https://stimi.ac.id/berita-terkini',
          evidenceNotes: 'Kalender konten aktif dan artikel terbit rutin tiap hari Selasa & Jumat.',
          auditorFeedback: 'Verifikasi website menunjukkan pembaruan konten berjalan sangat aktif. Closed.',
          closedAt: new Date('2026-03-12'),
        },
      ];

      await AmiFinding.insertMany(sampleFindings);
    }

    return NextResponse.json({
      success: true,
      message: 'Siklus AMI dan temuan awal berhasil di-seed!',
      periodId: period._id,
    });
  } catch (error: any) {
    console.error('Error seeding AMI data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
