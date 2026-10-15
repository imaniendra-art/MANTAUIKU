import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { SpmiDocument } from '@/models/SpmiDocument';

export async function POST() {
  try {
    await connectToDatabase();

    // Check if documents already exist
    const count = await SpmiDocument.countDocuments();
    if (count > 0) {
      await SpmiDocument.updateMany(
        {},
        {
          $set: {
            "signedBy.name": "Dr. Ibrahim Syah, S.E., M.M.",
            "signedBy.title": "Ketua STIMI YAPMI Makassar",
            "signedBy.nipOrNidn": "NIDN. 0920037601",
          },
        }
      );
      return NextResponse.json({
        success: true,
        message: "Data 4 Buku SPMI telah disinkronkan dengan Ketua STIMI: Dr. Ibrahim Syah, S.E., M.M.",
        count,
      });
    }

    const spmiBooks = [
      // BUKU 1: KEBIJAKAN SPMI
      {
        bookType: 'KEBIJAKAN',
        bookNumber: 1,
        title: 'Buku I: Kebijakan Sistem Penjaminan Mutu Internal (SPMI)',
        code: 'SPMI-STIMI-01',
        version: '3.0 (2025/2026)',
        skNumber: 'SK Ketua STIMI YAPMI No. 042/SK/YAPMI/IX/2025',
        validFrom: new Date('2025-09-01'),
        validUntil: new Date('2029-08-31'),
        status: 'DITETAPKAN_BERLAKU',
        description: 'Landasan filosofis, komitmen pimpinan, asas operasional, dan arah kebijakan penjaminan mutu berkelanjutan di lingkungan STIMI YAPMI Makassar mengacu pada Permendiktisaintek No. 39/2025.',
        sections: [
          {
            order: 1,
            title: 'Latar Belakang & Komitmen Institusi',
            content: 'STIMI YAPMI Makassar berkomitmen mewujudkan penyelenggaraan Tridharma Perguruan Tinggi yang bermutu tinggi, berdaya saing di tingkat nasional, dan berorientasi luaran (Outcome-Based Education) dengan menegakkan budaya mutu berkelanjutan (Continuous Quality Improvement).'
          },
          {
            order: 2,
            title: 'Visi, Misi, dan Tujuan Penjaminan Mutu',
            content: 'Visi Mutu: Terwujudnya sistem penjaminan mutu internal yang kredibel, akuntabel, dan transformatif dalam mencetak sarjana manajemen yang profesional dan berjiwa technopreneurship di Indonesia Timur pada tahun 2030.'
          },
          {
            order: 3,
            title: 'Asas & Prinsip Tata Pamong Mutu (GUG)',
            content: 'Penyelenggaraan SPMI STIMI YAPMI berlandaskan pada 6 prinsip: (1) Otonomi dan kepemimpinan partisipatif, (2) Akuntabilitas berbasis data sahih, (3) Transparansi pelaporan publik, (4) Berkelanjutan (continuous improvement), (5) Inklusif dan adil, serta (6) Kepatuhan hukum perundang-undangan (Permendiktisaintek 39/2025 jo. No. 10/2026).'
          },
          {
            order: 4,
            title: 'Kedudukan & Garis Koordinasi Lembaga Penjaminan Mutu (LPM)',
            content: 'LPM berkedudukan tepat di bawah Ketua STIMI YAPMI dengan wewenang mengawal, memonitor, dan mengaudit seluruh Unit Pengelola Program Studi (UPPS), LPPM, BAAK, BAUK, dan Unit Pelaksana Teknis kampus.'
          }
        ],
        standards: [],
        forms: [],
        signedBy: {
          name: 'Dr. Ibrahim Syah, S.E., M.M.',
          title: 'Ketua STIMI YAPMI Makassar',
          nipOrNidn: 'NIDN. 0920037601',
          date: new Date('2025-09-01')
        }
      },

      // BUKU 2: MANUAL MUTU SPMI (SIKLUS PPEPP)
      {
        bookType: 'MANUAL',
        bookNumber: 2,
        title: 'Buku II: Manual Mutu SPMI Siklus PPEPP',
        code: 'SPMI-STIMI-02',
        version: '3.0 (2025/2026)',
        skNumber: 'SK Ketua STIMI YAPMI No. 043/SK/YAPMI/IX/2025',
        validFrom: new Date('2025-09-01'),
        validUntil: new Date('2029-08-31'),
        status: 'DITETAPKAN_BERLAKU',
        description: 'Panduan tata cara dan Standar Operasional Prosedur (SOP) pelaksanaan siklus PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan) di STIMI YAPMI Makassar.',
        sections: [
          {
            order: 1,
            title: 'Manual Penetapan (P) Standar Mutu',
            content: 'Tahap perancangan dan perumusan butir standar mutu baru atau revisi standar oleh LPM bersama Senat Akademik dengan mengacu pada SN-Dikti, instrumen IAPT 4.1 BAN-PT, dan instrumen LAMEMBA. Pengesahan dilakukan melalui Keputusan Ketua STIMI YAPMI.'
          },
          {
            order: 2,
            title: 'Manual Pelaksanaan (P) Standar Mutu',
            content: 'Tahap sosialisasi dan penerapan standar mutu oleh seluruh unit kerja (Prodi S1 Manajemen, BAAK, BAUK, LPPM, CDC). Setiap unit menyusun Rencana Operasional (Renop) tahunan selaras dengan target mutu.'
          },
          {
            order: 3,
            title: 'Manual Evaluasi (E) Pelaksanaan Standar (AMI)',
            content: 'Tahap pemantauan dan asesmen lapangan berkala melalui Audit Mutu Internal (AMI) oleh auditor bersertifikasi pada setiap akhir semester genap. Menghasilkan temuan KTS (Ketidaksesuaian) dan OB (Observasi).'
          },
          {
            order: 4,
            title: 'Manual Pengendalian (P) Pelaksanaan Standar (RTM)',
            content: 'Tahap analisis akar masalah temuan audit melalui Rapat Tinjauan Manajemen (RTM) yang dipimpin langsung Ketua STIMI YAPMI. Menghasilkan formulir Permintaan Tindakan Koreksi (PTK) dengan batas waktu tuntas 30-90 hari.'
          },
          {
            order: 5,
            title: 'Manual Peningkatan (P) Standar Mutu (Benchmarking)',
            content: 'Tahap meninggikan target butir standar mutu yang telah tercapai secara berturut-turut selama 2 siklus melalui benchmarking ke perguruan tinggi unggul rujukan.'
          }
        ],
        standards: [],
        forms: [],
        signedBy: {
          name: 'Dr. Ibrahim Syah, S.E., M.M.',
          title: 'Ketua STIMI YAPMI Makassar',
          nipOrNidn: 'NIDN. 0920037601',
          date: new Date('2025-09-01')
        }
      },

      // BUKU 3: STANDAR MUTU PENDIDIKAN TINGGI STIMI YAPMI
      {
        bookType: 'STANDAR',
        bookNumber: 3,
        title: 'Buku III: Standar Penjaminan Mutu Internal (Pendidikan, Penelitian, PkM & Tata Pamong)',
        code: 'SPMI-STIMI-03',
        version: '3.0 (2025/2026)',
        skNumber: 'SK Ketua STIMI YAPMI No. 044/SK/YAPMI/IX/2025',
        validFrom: new Date('2025-09-01'),
        validUntil: new Date('2029-08-31'),
        status: 'DITETAPKAN_BERLAKU',
        description: 'Rincian butir standar mutu berbasis SN-Dikti Permendiktisaintek No. 39/2025, instrumen IAPT 4.1 BAN-PT, dan kriteria LAMEMBA, yang melampaui standar nasional.',
        sections: [
          {
            order: 1,
            title: 'Kerangka Dasar Standar SPMI STIMI YAPMI',
            content: 'Standar SPMI STIMI YAPMI dirumuskan dengan menggunakan formula ABCD (Audience, Behaviour, Competence, Degree) dan terbagi menjadi 5 rumpun: Standar Pendidikan OBE, Standar Penelitian, Standar Pengabdian kepada Masyarakat, Standar Tata Pamong, serta Standar Sarana Prasarana & Keuangan.'
          }
        ],
        standards: [
          // RUMPUN PENDIDIKAN
          {
            code: 'STD-DIK-01',
            name: 'Standar Kompetensi Lulusan (CPL) Berbasis OBE',
            category: 'PENDIDIKAN',
            statement: 'Program Studi S1 Manajemen menetapkan profil lulusan dan Capaian Pembelajaran Lulusan (CPL) yang selaras dengan KKNI Level 6, mengintegrasikan kemampuan technopreneurship, etika bisnis, dan integritas anti-korupsi.',
            indicators: [
              '100% CPL prodi terukur dengan rubrik asesmen portofolio',
              'Rata-rata IPK lulusan minimal 3.25',
              'Masa studi tepat waktu minimal 75% mahasiswa lulus dalam 8 semester'
            ],
            targetValue: 'Rata-rata IPK >= 3.40, Kelulusan tepat waktu >= 75%',
            strategies: [
              'Penyelenggaraan matakuliah berbasis case method dan team-based project',
              'Monitoring berkala kemajuan studi mahasiswa tiap semester melalui BAAK'
            ],
            responsibleUnit: 'Program Studi S1 Manajemen',
            ppeppCycle: {
              penetapanDate: '2025-09-01',
              pelaksanaanNotes: 'Diterapkan pada seluruh kurikulum aktif angkatan 2022-2025',
              evaluasiAmiStatus: 'SESUAI',
              pengendalianAction: 'Pelatihan dosen pengampu mata kuliah dalam menyusun rubrik asesmen CPL',
              peningkatanTarget: 'Target kelulusan tepat waktu ditingkatkan menjadi 80% pada 2027'
            }
          },
          {
            code: 'STD-DIK-02',
            name: 'Standar Kurikulum dan Pembelajaran MBKM',
            category: 'PENDIDIKAN',
            statement: 'Kurikulum wajib menyediakan hak belajar di luar program studi sekurang-kurangnya 10-20 SKS melalui magang bersertifikat, studi independen, atau kewirausahaan terstruktur.',
            indicators: [
              'Tersedia pedoman konversi SKS MBKM yang adil dan transparan',
              'Minimal 15% mahasiswa aktif mengambil program belajar di luar prodi'
            ],
            targetValue: 'Persentase mahasiswa ber-MBKM >= 15% dengan konversi 20 SKS penuh',
            strategies: [
              'Memperluas MoA kemitraan magang dengan perbankan dan BUMN di Makassar',
              'Pendampingan dosen pembimbing magang industri'
            ],
            responsibleUnit: 'BAAK & Prodi S1 Manajemen',
            ppeppCycle: {
              penetapanDate: '2025-09-01',
              pelaksanaanNotes: 'Kerja sama magang dengan Bank Sulselbar & PT Pegadaian',
              evaluasiAmiStatus: 'SESUAI',
              pengendalianAction: 'Penguatan sistem logbook digital mahasiswa magang',
              peningkatanTarget: 'Target mitra magang bereputasi bertambah 5 mitra per tahun'
            }
          },
          {
            code: 'STD-DIK-03',
            name: 'Standar Kualifikasi & Kecukupan Dosen Tetap',
            category: 'SDM_SARPRAS_KEUANGAN',
            statement: 'Dosen Tetap Program Studi (DTPS) seluruhnya berkualifikasi minimal Magister (S2) linear dengan porsi Doktor (S3) sekurang-kurangnya 20% dan rasio dosen mahasiswa ideal 1:20 s.d. 1:30.',
            indicators: [
              '100% dosen memiliki NIDN dan Jabatan Fungsional Akademik',
              'Persentase dosen tetap bergelar Doktor (S3) >= 20%',
              'Rasio mahasiswa terhadap dosen tetap berada pada rentang 20-30'
            ],
            targetValue: 'Doktor >= 25%, Rasio Dosen-Mahasiswa 1:24',
            strategies: [
              'Pemberian beasiswa pendamping bagi dosen tetap yang menempuh S3 Manajemen',
              'Akselerasi kenaikan jabatan fungsional ke Lektor Kepala dan Guru Besar'
            ],
            responsibleUnit: 'BAUK & Pimpinan STIMI',
            ppeppCycle: {
              penetapanDate: '2025-09-01',
              pelaksanaanNotes: 'Saat ini terdapat 6 dosen bergelar S3 Doktor (33%) dari 18 DTPS',
              evaluasiAmiStatus: 'SESUAI',
              pengendalianAction: 'Monitoring progres disertasi bagi dosen yang sedang tugas belajar',
              peningkatanTarget: 'Menambah 2 doktor baru pada tahun 2026/2027'
            }
          },

          // RUMPUN PENELITIAN
          {
            code: 'STD-LIT-01',
            name: 'Standar Hasil Penelitian & Publikasi Ilmiah',
            category: 'PENELITIAN',
            statement: 'Setiap Dosen Tetap menghasilkan sekurang-kurangnya 1 publikasi artikel ilmiah per tahun pada jurnal nasional terakreditasi Sinta atau jurnal internasional bereputasi.',
            indicators: [
              'Rasio luaran publikasi (RLP) dosen tetap mencapai >= 50% per tahun',
              'Setiap penelitian dosen wajib melibatkan sekurang-kurangnya 2 orang mahasiswa'
            ],
            targetValue: 'RLP >= 60%, Minimal 5 artikel per tahun terbit di Sinta 2-3',
            strategies: [
              'Alokasi insentif publikasi Rp 5.000.000 per artikel Sinta 2 dan Rp 10.000.000 untuk Scopus',
              'Workshop berkala penulisan artikel ilmiah bereputasi oleh LPPM'
            ],
            responsibleUnit: 'LPPM STIMI YAPMI',
            ppeppCycle: {
              penetapanDate: '2025-09-01',
              pelaksanaanNotes: 'LPPM mengucurkan dana hibah internal penelitian Rp 150 juta/tahun',
              evaluasiAmiStatus: 'SESUAI',
              pengendalianAction: 'Klinik manuskrip bagi naskah dosen yang tertolak reviewer',
              peningkatanTarget: 'Mendorong 3 publikasi di jurnal internasional terindeks Scopus Q3'
            }
          },

          // RUMPUN PKM
          {
            code: 'STD-PKM-01',
            name: 'Standar Pengabdian kepada Masyarakat (PkM) Berdampak',
            category: 'PENGABDIAN',
            statement: 'Kegiatan PkM wajib berorientasi pada pemecahan masalah riil masyarakat dan UMKM di Sulawesi Selatan, menghasilkan modul ber-HKI, serta melibatkan mahasiswa.',
            indicators: [
              '100% dosen melaksanakan PkM minimal 1 kali per semester',
              'Minimal 10 kelompok UMKM binaan per tahun mendapatkan pendampingan keuangan/manajemen'
            ],
            targetValue: 'Kemitraan UMKM binaan >= 15 mitra per tahun, HKI PkM >= 5 per tahun',
            strategies: [
              'Kolaborasi terpadu dengan Dinas Koperasi dan UKM Kota Makassar',
              'Integrasi kegiatan Kuliah Kerja Mandiri (KKM) dengan tema penguatan UMKM'
            ],
            responsibleUnit: 'LPPM STIMI YAPMI',
            ppeppCycle: {
              penetapanDate: '2025-09-01',
              pelaksanaanNotes: 'Pendampingan digital marketing dan pembukuan bagi 12 UMKM',
              evaluasiAmiStatus: 'SESUAI',
              pengendalianAction: 'Pencatatan Hak Cipta modul PkM ke DJKI Kemenkumham',
              peningkatanTarget: 'Ekspansi desa binaan ke Kabupaten Maros dan Gowa'
            }
          },

          // RUMPUN TATA PAMONG & AKUNTABILITAS
          {
            code: 'STD-PAM-01',
            name: 'Standar Akuntabilitas & Audit Keuangan Eksternal',
            category: 'TATA_PAMONG',
            statement: 'Pengelolaan keuangan institusi wajib diaudit setiap tahun oleh Kantor Akuntan Publik (KAP) independen dengan opini Wajar Tanpa Pengecualian (WTP) dan dipublikasikan ringkasannya.',
            indicators: [
              'Tersedia laporan audit keuangan eksternal tahunan dari KAP berizin',
              'Opini audit keuangan Wajar Tanpa Pengecualian (WTP)'
            ],
            targetValue: 'Opini WTP 100% dan publikasi ikhtisar laporan keuangan',
            strategies: [
              'Penerapan software akuntansi terintegrasi pada BAUK',
              'Pengawasan berkala oleh Badan Pengawas Yayasan Pendidikan YAPMI'
            ],
            responsibleUnit: 'BAUK & Pimpinan Yayasan',
            ppeppCycle: {
              penetapanDate: '2025-09-01',
              pelaksanaanNotes: 'Audit laporan keuangan 2024 telah rampung dengan opini WTP',
              evaluasiAmiStatus: 'SESUAI',
              pengendalianAction: 'Penyempurnaan sistem inventarisasi aset sarpras kampus',
              peningkatanTarget: 'Pertahankan opini WTP dan automasi rekonsiliasi bank harian'
            }
          }
        ],
        forms: [],
        signedBy: {
          name: 'Dr. Ibrahim Syah, S.E., M.M.',
          title: 'Ketua STIMI YAPMI Makassar',
          nipOrNidn: 'NIDN. 0920037601',
          date: new Date('2025-09-01')
        }
      },

      // BUKU 4: FORMULIR MUTU SPMI
      {
        bookType: 'FORMULIR',
        bookNumber: 4,
        title: 'Buku IV: Formulir & Instrumen Mutu SPMI',
        code: 'SPMI-STIMI-04',
        version: '3.0 (2025/2026)',
        skNumber: 'SK Ketua STIMI YAPMI No. 045/SK/YAPMI/IX/2025',
        validFrom: new Date('2025-09-01'),
        validUntil: new Date('2029-08-31'),
        status: 'DITETAPKAN_BERLAKU',
        description: 'Kumpulan instrumen kerja baku, formulir daftar tilik audit, berita acara, lembar PTK, dan kuesioner evaluasi yang digunakan dalam siklus penjaminan mutu STIMI YAPMI.',
        sections: [
          {
            order: 1,
            title: 'Ketentuan Penggunaan Formulir Mutu',
            content: 'Setiap formulir mutu memiliki kodefikasi unik dan wajib digunakan oleh unit kerja sebagai rekaman mutu (quality records) yang dapat diaudit dan ditelusuri keabsahannya.'
          }
        ],
        standards: [],
        forms: [
          {
            code: 'FORM-AMI-01',
            name: 'Daftar Tilik Audit Mutu Internal (Checklist AMI)',
            purpose: 'Instrumen verifikasi kesesuaian operasional unit kerja terhadap butir standar SPMI',
            targetUser: 'Auditor Internal Bersertifikasi LPM'
          },
          {
            code: 'FORM-AMI-02',
            name: 'Formulir Permintaan Tindakan Koreksi (PTK / RTL)',
            purpose: 'Pencatatan temuan KTS/OB, identifikasi akar masalah, dan jadwal penyelesaian oleh auditee',
            targetUser: 'Kepala Unit / Ketua Program Studi'
          },
          {
            code: 'FORM-RTM-01',
            name: 'Berita Acara Rapat Tinjauan Manajemen (RTM)',
            purpose: 'Dokumentasi resmi hasil reviu pimpinan atas temuan audit dan alokasi sumber daya perbaikan',
            targetUser: 'Ketua STIMI YAPMI & Pimpinan Lembaga'
          },
          {
            code: 'FORM-EDO-01',
            name: 'Kuesioner Evaluasi Dosen oleh Mahasiswa (EDO)',
            purpose: 'Penilaian kepuasan mahasiswa terhadap kinerja pedagogik, profesional, dan materi ajar dosen',
            targetUser: 'Mahasiswa Aktif Seluruh Kelas'
          },
          {
            code: 'FORM-CDC-01',
            name: 'Kuesioner Tracer Study Alumni & Pengguna Lulusan',
            purpose: 'Pelacakan masa tunggu kerja, tingkat pendapatan, relevansi ilmu, dan kepuasan atasan alumni',
            targetUser: 'Alumni TS-1 s.d. TS-3 & Instansi DUDIK'
          }
        ],
        signedBy: {
          name: 'Dr. Ibrahim Syah, S.E., M.M.',
          title: 'Ketua STIMI YAPMI Makassar',
          nipOrNidn: 'NIDN. 0920037601',
          date: new Date('2025-09-01')
        }
      }
    ];

    await SpmiDocument.insertMany(spmiBooks);

    return NextResponse.json({
      success: true,
      message: 'Berhasil melakukan inisialisasi data baku 4 Buku SPMI STIMI YAPMI Makassar!',
      count: spmiBooks.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error seeding SPMI documents:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
