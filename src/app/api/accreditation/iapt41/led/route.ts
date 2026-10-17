import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { Iapt41LedDocument } from '@/models/Accreditation';

export const dynamic = 'force-dynamic';

const DEFAULT_TIM_PENYUSUN = [
  {
    nama: 'Dr. Nurul Fadilah, S.E., M.M.',
    nikNidn: 'NIDN. 0915088201',
    jabatan: 'Ketua Lembaga Penjaminan Mutu (LPM)',
    peran: 'Ketua Tim Penyusun LED',
  },
  {
    nama: 'Drs. H. M. Said, M.Si.',
    nikNidn: 'NIDN. 0918077501',
    jabatan: 'Ketua Program Studi S1 Manajemen',
    peran: 'Sekretaris Tim Penyusun LED',
  },
  {
    nama: 'Dr. Ibrahim Syah, S.E., M.M.',
    nikNidn: 'NIDN. 0920037601',
    jabatan: 'Ketua STIMI YAPMI Makassar',
    peran: 'Pengarah & Penanggung Jawab',
  },
  {
    nama: 'Dr. M. Aris, S.E., M.Si.',
    nikNidn: 'NIDN. 0912047802',
    jabatan: 'Wakil Ketua I Bidang Akademik & Riset',
    peran: 'Koordinator Kriteria C (Budaya Mutu) & R (Relevansi)',
  },
  {
    nama: 'Hj. Ratna Sari, S.E., M.M.',
    nikNidn: 'NIDN. 0923058001',
    jabatan: 'Wakil Ketua II Bidang Keuangan & Administrasi Umum',
    peran: 'Koordinator Kriteria A (Akuntabilitas Tata Kelola & Keuangan)',
  },
  {
    nama: 'Andi Baso, S.E., M.M.',
    nikNidn: 'NIDN. 0905108503',
    jabatan: 'Wakil Ketua III Bidang Kemahasiswaan & Kerjasama',
    peran: 'Koordinator Kriteria M (Diferensiasi Misi & DUDIK)',
  },
];

const DEFAULT_KATA_PENGANTAR = `Puji syukur kita panjatkan ke hadirat Allah Subhanahu Wa Ta'ala, Tuhan Yang Maha Esa, karena atas rahmat dan perkenan-Nya Laporan Evaluasi Diri (LED) Akreditasi Perguruan Tinggi (IAPT 4.1) Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar dapat terselesaikan dengan baik.

Penyusunan dokumen ini mengacu pada Peraturan Badan Akreditasi Nasional Perguruan Tinggi (BAN-PT) Nomor 35 Tahun 2025 tentang Instrumen Akreditasi Perguruan Tinggi untuk Status Terakreditasi dan Status Terakreditasi Unggul. Dokumen ini merefleksikan evaluasi mandiri yang komprehensif, obyektif, transparan, dan akuntabel mencakup 4 pilar utama Kriteria CRAM: Budaya Mutu (Culture), Relevansi (Relevance), Akuntabilitas (Accountability), dan Diferensiasi Misi (Mission).

Melalui penyusunan evaluasi diri ini, STIMI YAPMI Makassar meneguhkan komitmennya untuk terus meningkatkan mutu penyelenggaraan Tridharma Perguruan Tinggi, memperkuat tata pamong yang baik (Good University Governance), memperkokoh relevansi kurikulum Outcome-Based Education (OBE), dan memperluas kemitraan strategis dengan Dunia Usaha dan Dunia Industri Kerja (DUDIK) demi mencetak lulusan berkarakter, berdaya saing, dan berjiwa kewirausahaan di kawasan Indonesia Timur.

Apresiasi setinggi-tingginya kami sampaikan kepada Tim Penyusun LED, Badan Penyelenggara Yayasan YAPMI Makassar, seluruh dosen, tenaga kependidikan, mahasiswa, alumni, dan para pemangku kepentingan (stakeholder) yang telah berkontribusi aktif dalam penyempurnaan dokumen ini. Semoga dokumen ini dapat memberikan gambaran yang utuh dan sahih bagi para Asesor BAN-PT.`;

const DEFAULT_RINGKASAN_EKSEKUTIF = `Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar merupakan institusi pendidikan tinggi manajemen yang berdiri sejak tahun 1997 di bawah naungan Yayasan Pembangunan Manajemen Indonesia (YAPMI). Memasuki era baru penjaminan mutu pendidikan tinggi berbasis Permendiktisaintek No. 39 Tahun 2025 dan PerBAN-PT No. 35 Tahun 2025 (IAPT 4.1), STIMI YAPMI Makassar mengintegrasikan tata kelola institusi berbasis CRAM (Culture, Relevance, Accountability, Mission).

Dalam aspek Budaya Mutu (Culture), STIMI YAPMI Makassar telah menetapkan 4 Buku SPMI (Kebijakan, Manual, Standar, dan Formulir) secara berkala dan menjalankan siklus PPEPP secara berkelanjutan melalui pelaksanaan Audit Mutu Internal (AMI) Siklus IX dan Rapat Tinjauan Manajemen (RTM). 

Dalam aspek Relevansi (Relevance), kurikulum pada program studi telah bertransformasi ke Outcome-Based Education (OBE) dengan pemenuhan rasio dosen-mahasiswa yang sehat, kecukupan dosen tetap ber-NIDN, peningkatan kualifikasi dosen berpendidikan Doktor (S3), serta riset dan PkM terapan yang berorientasi pada pengembangan UMKM lokal.

Dalam aspek Akuntabilitas (Accountability), STIMI YAPMI Makassar menjamin transparansi pengelolaan melalui audit keuangan eksternal oleh Kantor Akuntan Publik (KAP) independen dengan opini Wajar Tanpa Pengecualian (WTP), penerapan sistem keselamatan kerja (K3), kawasan kampus sehat bebas rokok, dan satgas PPKS aktif.

Dalam aspek Diferensiasi Misi (Mission), STIMI YAPMI memposisikan diri sebagai 'Center of Entrepreneurship and Applied Management Education' di Indonesia Timur dengan jaringan kemitraan DUDIK berkelanjutan lebih dari 5 tahun.`;

const DEFAULT_NARASI_C = `Sistem Penjaminan Mutu Internal (SPMI) di STIMI YAPMI Makassar telah terstruktur dan diimplementasikan secara sistemik dan berkelanjutan di bawah koordinasi Lembaga Penjaminan Mutu (LPM).

1. Standar dan Regulasi SPMI:
STIMI YAPMI memiliki 4 Buku SPMI resmi yang telah ditetapkan melalui Surat Keputusan Ketua STIMI YAPMI, yaitu: (a) Buku Kebijakan SPMI, (b) Buku Manual SPMI, (c) Buku Standar SPMI yang mencakup Standar Nasional Pendidikan, Penelitian, dan PkM serta Standar Non-Akademik yang melampaui SN-Dikti, dan (d) Formulir SPMI.

2. Siklus PPEPP:
Pelaksanaan penjaminan mutu diimplementasikan secara utuh melalui tahapan Penetapan standar, Pelaksanaan standar, Evaluasi pelaksanaan standar, Pengendalian pelaksanaan standar, dan Peningkatan standar (PPEPP). Setiap semester dan tahun akademik, evaluasi pelaksanaan dilakukan melalui Audit Mutu Internal (AMI) yang melibatkan auditor internal tersertifikasi.

3. Rapat Tinjauan Manajemen (RTM) & Peningkatan Berkelanjutan:
Temuan-temuan AMI dilaporkan dalam RTM bersama Pimpinan Sekolah Tinggi dan Yayasan untuk merumuskan Tindakan Korektif (Corrective Action) dan peningkatan standar pada siklus berikutnya.

4. Pengakuan Eksternal:
Program studi sarjana manajemen telah terakreditasi oleh LAMEMBA, dan seluruh data kelembagaan disinkronkan secara tertib melalui pangkalan data kementerian (PD-Dikti Feeder dan Aplikasi SPMI Kemdiktisaintek).`;

const DEFAULT_NARASI_R = `Relevansi penyelenggaraan Tridharma Perguruan Tinggi di STIMI YAPMI Makassar diarahkan pada penguatan kompetensi lulusan dan kontribusi nyata bagi masyarakat:

1. Relevansi Pendidikan:
Kurikulum program studi disusun dan direvisi secara berkala berbasis capaian pembelajaran lulusan (Outcome-Based Education/OBE) yang melibatkan masukan dari asosiasi profesi manajemen, alumni, dan DUDIK. Ketersediaan dosen tetap memenuhi ketentuan regulasi dengan persentase dosen berjabatan fungsional Lektor dan Lektor Kepala di atas 50%, serta rasio mahasiswa terhadap dosen tetap yang ideal di bawah 1:35.

2. Relevansi Penelitian:
Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM) memfasilitasi penelitian dosen dan mahasiswa dengan fokus pada manajemen bisnis, kewirausahaan lokal, ekonomi digital, dan keberlanjutan UMKM di Sulawesi Selatan. Hasil penelitian dipublikasikan pada jurnal bereputasi nasional (terakreditasi SINTA) dan jurnal internasional.

3. Relevansi Pengabdian kepada Masyarakat (PkM):
Kegiatan PkM diarahkan langsung untuk memecahkan persoalan riil mitra kelompok masyarakat dan pelaku usaha mikro-kecil, mencakup pelatihan tata kelola keuangan UMKM, strategi pemasaran digital, dan pendampingan legalitas usaha, yang melibatkan mahasiswa dalam program pembelajaran kolaboratif.`;

const DEFAULT_NARASI_A = `Akuntabilitas tata pamong dan tata kelola di STIMI YAPMI Makassar berlandaskan pada prinsip Good University Governance (GUG):

1. Tata Pamong & Struktur Kelembagaan:
Struktur organisasi dan tata kerja (SOTK) STIMI YAPMI Makassar berpedoman pada Statuta yang sah, dengan pembagian wewenang yang tegas antara unsur pimpinan, badan pertimbangan (Senat), pelaksana akademik, pelaksana administratif, penjaminan mutu, dan unsur pelaksana tridharma.

2. Sistem Informasi Manajemen (TIK):
Infrastruktur teknologi informasi dan komunikasi kampus terintegrasi melalui Sistem Informasi Akademik (SIAKAD), repositori karya ilmiah, sistem pelaporan IKU dan SPMI digital MANTAUIKU, serta akses internet nirkabel menyeluruh di area kampus.

3. Akuntabilitas Finansial:
Pengelolaan keuangan dilakukan secara transparan, akuntabel, dan nirlaba dengan alokasi anggaran operasional dan investasi tridharma yang memadai. Laporan keuangan institusi diaudit secara berkala oleh Kantor Akuntan Publik (KAP) independen dengan raihan opini Wajar Tanpa Pengecualian (WTP).

4. K3, Kampus Sehat & Integritas:
Institusi mengimplementasikan pedoman Kesehatan, Keselamatan Kerja, dan Lingkungan (K3), penyediaan fasilitas tanggap darurat (APAR, jalur evakuasi), kawasan kampus ramah disabilitas, SK Kawasan Bebas Rokok, serta pembentukan Satuan Tugas Pencegahan dan Penanganan Kekerasan Seksual (Satgas PPKS).`;

const DEFAULT_NARASI_M = `Diferensiasi Misi STIMI YAPMI Makassar merupakan keunggulan pembeda institusi dalam memberikan kontribusi spesifik bagi pembangunan nasional:

1. Keunggulan Komparatif & Kompetitif:
Sebagai institusi spesialis ilmu manajemen, STIMI YAPMI Makassar berfokus pada pengembangan kepemimpinan manajerial aplikatif dan kewirausahaan berbasis kearifan lokal maritim-niaga Indonesia Timur. Mahasiswa dibekali keterampilan praktis manajemen bisnis, literasi keuangan modern, dan inkubasi usaha rintisan.

2. Rencana Strategis (Renstra) Jangka Menengah & Panjang:
Renstra STIMI YAPMI 2020-2030 memuat tonggak capaian (milestones) yang jelas menuju perguruan tinggi manajemen terkemuka yang unggul dan mandiri, dengan indikator kinerja utama (IKU) yang terukur dan dipantau secara real-time.

3. Kemitraan DUDIK Berkelanjutan:
Institusi memiliki jejaring kemitraan aktif lebih dari 5 tahun dengan Kamar Dagang dan Industri (KADIN), Himpunan Pengusaha Muda Indonesia (HIPMI), asosiasi UMKM Sulawesi Selatan, perbankan nasional, dan instansi pemerintah daerah, yang terwujud dalam program magang kerja, dosen praktisi, dan rekrutmen lulusan.`;

const DEFAULT_PENUTUP = `Laporan Evaluasi Diri (LED) IAPT 4.1 ini disusun sebagai bentuk pertanggungjawaban publik dan komitmen mutu STIMI YAPMI Makassar dalam menyelenggarakan pendidikan tinggi yang berkualitas. Berdasarkan hasil evaluasi terhadap seluruh kriteria CRAM, institusi telah memenuhi seluruh standar yang dipersyaratkan oleh BAN-PT dan berupaya melampaui SN-Dikti melalui perbaikan berkelanjutan (Continuous Quality Improvement). STIMI YAPMI Makassar siap menerima Asesmen Kecukupan dan Asesmen Lapangan dari Dewan Eksekutif BAN-PT.`;

export async function GET() {
  try {
    await connectToDatabase();

    let doc = await Iapt41LedDocument.findOne();

    if (!doc) {
      doc = await Iapt41LedDocument.create({
        academicYear: '2025/2026',
        institutionName: 'STIMI YAPMI Makassar',
        status: 'SUBMITTED',
        submissionDate: new Date(),
        identitasPt: {
          perguruanTinggi: 'Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar',
          badanPenyelenggara: 'Yayasan Pembangunan Manajemen Indonesia (YAPMI) Makassar',
          nomorSkPendirianPt: 'SK Mendikbud RI No. 042/D/O/1997',
          tanggalSkPendirianPt: '1997-07-25',
          pejabatSkPendirianPt: 'Menteri Pendidikan dan Kebudayaan RI',
          alamat: 'Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Kota Makassar, Sulawesi Selatan 90245',
          kota: 'Makassar',
          telepon: '(0411) 588123',
          emailWeb: 'info@stimiyapmi.ac.id / https://stimiyapmi.ac.id',
          peringkatAkreditasiTerbaru: 'Baik',
          nomorSkBanPt: 'SK BAN-PT No. 1024/SK/BAN-PT/Ak-PPJ/PT/XII/2021',
          tanggalKadaluarsa: '2026-12-22',
          namaPimpinan: 'Dr. Ibrahim Syah, S.E., M.M.',
          nidnPimpinan: 'NIDN. 0920037601',
          tahunDokumen: '2025',
          logoUrl: '/logo_stimi.png',
        },
        timPenyusun: DEFAULT_TIM_PENYUSUN,
        kataPengantar: DEFAULT_KATA_PENGANTAR,
        ringkasanEksekutif: DEFAULT_RINGKASAN_EKSEKUTIF,
        narasiKriteriaC: DEFAULT_NARASI_C,
        narasiKriteriaR: DEFAULT_NARASI_R,
        narasiKriteriaA: DEFAULT_NARASI_A,
        narasiKriteriaM: DEFAULT_NARASI_M,
        penutup: DEFAULT_PENUTUP,
        lembarPengesahan: {
          kota: 'Makassar',
          tanggal: '15 Januari 2026',
          ketuaPt: {
            jabatan: 'Ketua STIMI YAPMI Makassar',
            nama: 'Dr. Ibrahim Syah, S.E., M.M.',
            nikNidn: 'NIDN. 0920037601',
          },
          ketuaYayasan: {
            jabatan: 'Ketua Yayasan Pembangunan Manajemen Indonesia (YAPMI)',
            nama: 'H. M. Yasin Limpo, SE',
            nikNidn: 'Ketua Pengurus Yayasan',
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: doc,
    });
  } catch (error: any) {
    console.error('Error fetching IAPT 4.1 LED document:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat dokumen LED IAPT 4.1: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'LPM') {
      return NextResponse.json(
        { success: false, error: 'Hanya LPM yang memiliki hak akses untuk mengubah dokumen akreditasi.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();

    let doc = await Iapt41LedDocument.findOne();

    if (!doc) {
      doc = new Iapt41LedDocument(body);
    } else {
      // Merge updates
      if (body.academicYear !== undefined) doc.academicYear = body.academicYear;
      if (body.institutionName !== undefined) doc.institutionName = body.institutionName;
      if (body.status !== undefined) doc.status = body.status;
      if (body.submissionDate !== undefined) doc.submissionDate = body.submissionDate;
      if (body.identitasPt !== undefined) doc.identitasPt = { ...doc.identitasPt, ...body.identitasPt };
      if (body.timPenyusun !== undefined) {
        doc.timPenyusun = Array.isArray(body.timPenyusun)
          ? body.timPenyusun
              .filter((t: any) => t && (t.nama?.trim() || t.jabatan?.trim() || t.peran?.trim()))
              .map((t: any) => ({
                nama: t.nama || '',
                nikNidn: t.nikNidn || '',
                jabatan: t.jabatan || '',
                peran: t.peran || '',
              }))
          : [];
      }
      if (body.kataPengantar !== undefined) doc.kataPengantar = body.kataPengantar;
      if (body.ringkasanEksekutif !== undefined) doc.ringkasanEksekutif = body.ringkasanEksekutif;
      if (body.narasiKriteriaC !== undefined) doc.narasiKriteriaC = body.narasiKriteriaC;
      if (body.narasiKriteriaR !== undefined) doc.narasiKriteriaR = body.narasiKriteriaR;
      if (body.narasiKriteriaA !== undefined) doc.narasiKriteriaA = body.narasiKriteriaA;
      if (body.narasiKriteriaM !== undefined) doc.narasiKriteriaM = body.narasiKriteriaM;
      if (body.penutup !== undefined) doc.penutup = body.penutup;
      if (body.lembarPengesahan !== undefined) doc.lembarPengesahan = { ...doc.lembarPengesahan, ...body.lembarPengesahan };
    }

    await doc.save();

    return NextResponse.json({
      success: true,
      message: 'Dokumen LED IAPT 4.1 BAN-PT berhasil diperbarui!',
      data: doc,
    });
  } catch (error: any) {
    console.error('Error updating IAPT 4.1 LED document:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan dokumen LED IAPT 4.1: ' + error.message },
      { status: 500 }
    );
  }
}
