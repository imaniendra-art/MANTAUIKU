# BLUEPRINT & ARSITEKTUR SISTEM: MANTAUIKU (STIMI YAPMI MAKASSAR)

Dokumen ini mendefinisikan arsitektur sistem, desain antarmuka, model data, serta alur kerja Role-Based Access Control (RBAC) untuk aplikasi monitoring dan evaluasi Indikator Kinerja Utama (IKU).

---

## 1. Identitas Visual & Design System

### 1.1 Palet Warna (Sky Blue & Cyan Palette)
Mengadopsi tema modern universitas analitik (terinspirasi dari Dashboard UNJA dengan penyesuaian identitas kampus):
- **Primary / Brand**: Sky Blue (`#0284c7` / `sky-600`) & Deep Azure (`#0369a1` / `sky-700`)
- **Accent / Highlight**: Cyan Glow (`#06b6d4` / `cyan-500`, `#0891b2` / `cyan-600`)
- **Background & Surface**: Slate Light (`#f8fafc` / `slate-50`) & Pure White (`#ffffff`) dengan border halus (`#e2e8f0` / `slate-200`)
- **Card Badges & Status**:
  - *Disetujui / Selesai*: Emerald (`#10b981`)
  - *Menunggu Validasi*: Amber (`#f59e0b`)
  - *Draf / Belum Diisi*: Slate (`#64748b`)

### 1.2 Layout Navigasi Hybrid
- **Sidebar Collapsible (Icon-Only Mode)**:
  - *Expanded*: `w-72` — Logo, nama sistem, label menu lengkap, kategori, status PIC.
  - *Collapsed*: `w-20` — Hanya ikon Lucide, animasi smooth Framer Motion, dilengkapi tooltip mengambang (*floating tooltip*) saat hover.
  - *State Persistence*: Status minimize disimpan di `localStorage` (`mantauiku_sidebar_collapsed`).
- **Topbar Analitik**:
  - Tombol toggle minimize sidebar.
  - Pencarian global IKU.
  - Profil PIC dengan badge peran dan unit kerja.
  - Tombol aksi cepat logout.
- **Hero Command Section**:
  - Banner sambutan dengan shortcut akses cepat pelaporan triwulan.

---

## 2. Struktur Pengelompokan Menu & Klaster IKU

Sistem menyaring 12 Indikator Kinerja Utama ke dalam 4 Klaster Tematik:

| Klaster | Indikator Terkait | PIC Penanggung Jawab |
| :--- | :--- | :--- |
| **Klaster Talenta & Mahasiswa** | **IKU 1**: Angka Efisiensi Edukasi (AEE PT)<br>**IKU 2**: Lulusan Langsung Bekerja / Wirausaha / Studi<br>**IKU 3**: Mahasiswa Berprestasi & MBKM | **WK III (Kemahasiswaan & Alumni)** |
| **Klaster Inovasi & Riset** | **IKU 4**: Dosen Rekognisi Internasional / Diterapkan<br>**IKU 5**: Hilirisasi & Kerjasama Industri / Lembaga<br>**IKU 6**: Publikasi Bereputasi (Scopus/SINTA) | **WK I (Akademik & Riset)**<br>serta **WK II (Kerjasama)** |
| **Klaster Tata Kelola & Finansial** | **IKU 7**: Keterlibatan SDGs<br>**IKU 8**: SDM Terlibat Kebijakan<br>**IKU 9**: Pendapatan Non-UKT<br>**IKU 10**: Zona Integritas (WBK/WBBM)<br>**IKU 11**: Laporan Keuangan & Predikat SAKIP<br>**IKU 12**: Perencanaan Kesejahteraan Dosen | **WK II (Keuangan)**<br>serta **Tim Tata Pamong & Penjaminan Mutu** |

---

## 3. Matriks Peran & Hak Akses (RBAC)

1. **LPM (Lembaga Penjaminan Mutu) / Super Admin**:
   - Menetapkan baseline dan target tahunan untuk seluruh 12 IKU.
   - Mereviu dan memvalidasi (Setujui / Tolak / Kembalikan) bukti dukung capaian yang diajukan unit kerja.
   - Mengunci pelaporan per triwulan.
   - Mengelola akun pengguna unit kerja.

2. **Unit Kerja / Penanggung Jawab (PIC)**:
   - Login terfilter secara otomatis ke IKU yang ditugaskan.
   - Input realisasi capaian per triwulan (TW1, TW2, TW3, TW4).
   - Melampirkan tautan bukti dukung (Google Drive / SK / Sertifikat / Laporan).
   - Mengajukan capaian untuk divalidasi oleh LPM.

3. **Pimpinan / Rektorat**:
   - Akses dasbor eksekutif *read-only*.
   - Memantau capaian skor IKU real-time dan capaian per unit kerja.
   - Mengunduh rekapitulasi laporan kinerja.

---

## 4. Akun Default Bawaan (*Seeded Accounts*)

| Email | Peran | Unit Kerja | Tanggung Jawab IKU |
| :--- | :--- | :--- | :--- |
| `lpm@stimi.ac.id` | `LPM` | Lembaga Penjaminan Mutu | Semua (IKU 1–12) |
| `wk3@stimi.ac.id` | `UNIT_KERJA` | WK III - Kemahasiswaan & Alumni | IKU 1, IKU 2, IKU 3 |
| `wk1@stimi.ac.id` | `UNIT_KERJA` | WK I - Akademik & Riset | IKU 4, IKU 6, IKU 8 |
| `wk2@stimi.ac.id` | `UNIT_KERJA` | WK II - Kerjasama & Keuangan | IKU 5, IKU 9, IKU 11 |
| `tatapamong@stimi.ac.id` | `UNIT_KERJA` | Tim Tata Kelola & Mutu | IKU 7, IKU 10, IKU 12 |
| `pimpinan@stimi.ac.id` | `PIMPINAN` | Pimpinan Institusi | Semua (Read-Only) |

---

## 5. Rencana & Status Tahapan Eksekusi

1. **Fase 1 (Selesai)**: Refactor Shell Navigasi (Sidebar Collapsible + Icon-Only Tooltip + Topbar + Tema Sky-Cyan ala Dashboard UNJA).
2. **Fase 2 (Selesai)**: Penyesuaian Model & Skrip Seeding Akun PIC Unit Kerja serta Pemetaan 12 IKU ke 4 Klaster.
3. **Fase 3 (Selesai)**: Pembaharuan Halaman Dashboard Utama (`/dashboard`) dan Halaman Pelaporan Capaian (`/dashboard/achievements`):
   - Endpoint real-time `/api/dashboard/summary` terhubung langsung ke MongoDB Atlas.
   - Filter capaian triwulanan (TW 1 s/d TW 4).
   - Metrik otomatis: Total Indikator, Capaian Dilaporkan, Menunggu Validasi, Tervalidasi.
   - Perhitungan progres klaster riil dan antrean aktivitas validasi terbaru.
   - Bar interaktif perbandingan target vs realisasi dengan hover tooltip rinci.
4. **Fase 4 (Selesai)**: Pengayaan Visualisasi Multi-Chart Lanjutan & Generator Ekspor Laporan:
   - Matriks Komparasi Capaian Sepanjang Tahun (TW 1 s/d TW 4 vs Target Tahunan) ala Dashboard UNJA.
   - Endpoint `/api/reports/export` untuk unduh otomatis format Microsoft Excel (.CSV dengan UTF-8 BOM).
   - Unduh Rekapitulasi Target & Narasi Justifikasi Tahun 2026.
   - Modal Pratinjau Dokumen Cetak / PDF resmi berkop surat STIMI YAPMI Makassar lengkap dengan lembar pengesahan tanda tangan Ketua LPM dan Pimpinan Institusi.

---

## 6. Portal Mutu Publik STIMI YAPMI Makassar (`/`)

Dibangun untuk memenuhi transparansi informasi publik LPM dan standar penjaminan mutu terkini:
- **Landasan Regulasi**: **Permendiktisaintek No. 39 Tahun 2025 jo. No. 10 Tahun 2026** dan **Peraturan BAN-PT No. 20 Tahun 2025 (SAN Dikti)**, berorientasi akreditasi **LAMEMBA**.
- **Komponen Utama**:
  1. **Hero & Metrik Makro**: Statistik capaian IKU tervalidasi, akreditasi prodi, rasio dosen ber-NIDN, dan status audit SPMI.
  2. **Siklus Mutu PPEPP Interaktif** (`src/components/public/PPEPPSycle.tsx`): Visualisasi tahapan Penetapan, Pelaksanaan, Evaluasi, Pengendalian, dan Peningkatan dengan rincian instrumen & dokumen kunci.
  3. **Early Warning System / RAG Radar** (`src/components/public/EarlyWarningSystem.tsx`): Peringatan dini berstatus Red (Kritis), Amber (Waspada), Green (Aman) dilengkapi rekomendasi tindakan preventif/korektif LPM.
  4. **Pintu Masuk Internal**: Tombol otentikasi aman menuju ruang kerja internal (`/login` & `/dashboard`).

---

---

## 7. Fase 5 (Selesai): Modul Audit Mutu Internal (AMI) & Manajemen Temuan KTS/OB

Mengakomodasi struktur organisasi resmi STIMI YAPMI Makassar dan standar akreditasi **LAMEMBA Kriteria C.9** serta **Permendiktisaintek No. 39/2025 jo. No. 10/2026**:
1. **Pemetaan 10 Auditee Resmi**:
   - `Program Studi` (Kurikulum, RPS OBE, CPL, Dosen)
   - `UPT. LPPM` (Riset Dosen, PkM, Publikasi SINTA)
   - `UPT. BAAK` (Administrasi Akademik, Ijazah, Transkrip)
   - `UPT. Pusdatin` (Sinkronisasi PDDIKTI, Sistem Informasi)
   - `UPT. Perpustakaan` (Koleksi Buku, E-Journal Internasional)
   - `UPT. Lab. Komputer` (Perangkat Keras & Lunak Praktikum)
   - `UPT. Keuangan Rutin Pegawai` (Akuntabilitas Anggaran Operasional)
   - `UPT. Umum dan Kerjasama` (Sarana Prasarana Gedung, PKS/MoA Industri)
   - `UPT. Kemahasiswaan & Alumni` (Prestasi, Beasiswa, Tracer Study)
   - `UPT. Humas` (Keterbukaan Informasi Publik, Citra Kampus)
2. **Klasifikasi Temuan Baku**:
   - 🔴 **KTS Mayor**: Deviasi berat terhadap standar nasional/kementerian.
   - 🟡 **KTS Minor**: Deviasi terhadap SOP internal kampus.
   - 🔵 **OB (Observasi)**: Peluang peningkatan mutu sebelum menjadi KTS.
3. **Instrumen Pengendalian Digital**:
   - Formulir **PTK (Permintaan Tindakan Koreksi)** & Analisis Akar Masalah 5-Why.
   - Formulir **RTL (Rencana Tindak Lanjut)** dengan target tanggal selesai dan tautan bukti perbaikan.
   - Verifikasi **Closing (Tuntas)** oleh Auditor LPM.
   - Pratinjau Cetak Berita Acara AMI & Formulir PTK berkop surat resmi kampus.
4. **Widget Transparansi Publik**:
   - Komponen `src/components/public/AmiTransparencyWidget.tsx` terpasang di beranda (`#ami`) terhubung ke endpoint `/api/public/ami`.

---

---

## 8. Fase 6 (Selesai): Matriks Akreditasi LAMEMBA 9 Kriteria & Pemantauan Tahunan Wajib DL-05

Mengakomodasi standar akreditasi **LAMEMBA** (Lembaga Akreditasi Mandiri Ekonomi Manajemen Bisnis dan Akuntansi) dan **BAN-PT SAN Dikti 2025**:
1. **Profil Akreditasi & Countdown PEPA**:
   - Institusi: STIMI YAPMI Makassar (BAN-PT, "Baik Sekali", SK No. 488/SK/BAN-PT/Ak/PT/VIII/2023, s.d. 2028).
   - Program Studi: S1 Manajemen (LAMEMBA, "Baik Sekali", SK No. 128/DE/A.1/AR.8/VII/2023, s.d. 2028).
   - Countdown otomatis sisa masa berlaku (Hari & Bulan) dengan status PEPA: Aman (>12 bulan), Waspada (6-12 bulan), Kritis (<6 bulan).
2. **Matriks Evaluasi 9 Kriteria LAMEMBA**:
   - Simulasi skor kesiapan terbobot: 85.3 / 100 (Threshold Kategori Peringkat **UNGGUL**).
   - Evaluasi rinci Kriteria C.1 s.d. C.9 dengan bobot persentase, kekuatan utama, dan rekomendasi peningkatan.
3. **Instrumen Pemantauan & Evaluasi Tahunan Wajib (Lampiran DL-05 LAMEMBA)**:
   - **Bagian 1**: Tindak Lanjut Rekomendasi Asesmen Lapangan Terakhir (Status Selesai / Sedang Berjalan + Bukti Dukung).
   - **Bagian 2**: Kemajuan Implementasi Renstra & Continuous Quality Improvement (CQI).
   - **Bagian 3**: Evaluasi Kinerja Tiga Pilar Kunci:
     - *Jaminan Pembelajaran (AoL)*: Ketercapaian CPL 88%, RPS OBE 94%.
     - *Kecukupan Dosen Tetap*: 18 Dosen Tetap, Doktor S3 33%, Lektor/Lektor Kepala 61%, Rasio 1:24.
     - *Luaran Tridharma*: IPK 3.42, Waktu Tunggu 3.2 Bulan, Tracer Study Response Rate 78%.
   - Pratinjau Dokumen Cetak / PDF Resmi format baku Lampiran DL-05 LAMEMBA dengan lembar pengesahan tanda tangan Kaprodi, Ketua LPM, dan Ketua STIMI YAPMI.
4. **Widget Transparansi Publik (`#akreditasi`)**:
   - Terintegrasi di halaman depan ([`src/components/public/AccreditationWidget.tsx`](file:///c:/Users/imani/Documents/GitHub/MANTAUIKU/src/components/public/AccreditationWidget.tsx)) terhubung ke `/api/public/accreditation`.

---

## 9. Fase 7 (Selesai): Pusat Evaluasi Terpadu (EDO, EKA via SIAM Sync, Tracer Study & Survei Pengguna)

Mengintegrasikan seluruh siklus umpan balik *Continuous Quality Improvement (CQI)* pemangku kepentingan:
1. **EDO (Evaluasi Dosen oleh Mahasiswa - SIAM Sync)**:
   - Data primer dikumpulkan langsung di portal SIAM sebelum mahasiswa mengisi KRS/melihat KHS.
   - Endpoint jembatan (`/api/integrations/siam/sync`) dan analitik (`/api/evaluations/edo`).
   - Rata-rata IKD institusi: **3.66 / 4.00** (Predikat Sangat Baik) mencakup 4 dimensi: Pedagogik (3.63), Profesional (3.69), Kepribadian (3.67), dan Sosial (3.65).
2. **EKA (Evaluasi Layanan Akademik 10 UPT - SIAM Sync)**:
   - Penilaian kepuasan mahasiswa terhadap 10 unit organisasi kampus (`/api/evaluations/eka`).
   - Rata-rata kepuasan layanan: **88.5% (3.54 / 4.00)**.
   - Deteksi dini penjaminan mutu otomatis: memberikan peringatan dini (*warning trigger*) pada unit dengan skor di bawah ambang batas 85% untuk penerbitan Formulir PTK.
3. **Tracer Study Alumni & Auto-Supply IKU 2 (Dua Jalur Input)**:
   - **Jalur A (Formulir Publik)**: Formulir responsif publik (`/api/public/tracer-study`) untuk alumni S1 Manajemen yang mengisi secara mandiri.
   - **Jalur B (API Sinkronisasi Aplikasi Tracer Study CDC)**: Endpoint API bridge (`/api/integrations/tracer/sync`) untuk menarik dan mengintegrasikan batch data alumni langsung dari aplikasi sistem informasi tracer study eksternal/CDC kampus.
   - **Fitur Kunci**: Baik lewat pengisian formulir maupun tarikan sinkronisasi API, sistem secara atomik menghitung ulang rasio kelulusan yang terserap (*Bekerja + Wirausaha + Studi Lanjut*) dan **langsung meng-update capaian IKU 2** di koleksi `Achievement` database MongoDB Atlas!
   - Tingkat serapan kerja saat ini: **90.5%** (Target IKU 2: 80% - Terlampaui), rata-rata waktu tunggu: **2.6 Bulan**.
4. **Survei Kepuasan Pengguna Lulusan (Mitra Industri & BUMN)**:
   - Evaluasi langsung oleh atasan alumni di instansi mitra (`/api/public/employer-survey`).
   - Rata-rata indeks kepuasan: **93.5% (3.74 / 4.00)** pada 7 kompetensi: Etika & Integritas, Keahlian Manajemen, Bahasa Asing, TI & Digital, Komunikasi, Kerjasama Tim, dan Pengembangan Diri.
5. **Dashboard Internal & Widget Publik**:
   - Dashboard eksekutif 4-tab: [`src/app/dashboard/evaluations/page.tsx`](file:///c:/Users/imani/Documents/GitHub/MANTAUIKU/src/app/dashboard/evaluations/page.tsx) dengan tombol live *Tarik Data SIAM (EDO/EKA)* dan *Tarik Data Tracer App*.
   - Navigasi sidebar terpadu: item *Evaluasi & Tracer* ([`src/components/layout/Sidebar.tsx`](file:///c:/Users/imani/Documents/GitHub/MANTAUIKU/src/components/layout/Sidebar.tsx)).
   - Widget publik interaktif: [`src/components/public/EvaluationsWidget.tsx`](file:///c:/Users/imani/Documents/GitHub/MANTAUIKU/src/components/public/EvaluationsWidget.tsx) terpasang di beranda ([`src/app/page.tsx`](file:///c:/Users/imani/Documents/GitHub/MANTAUIKU/src/app/page.tsx) `#survei`).

---

## 10. Status Kesiapan & Roadmap Fase Selanjutnya

1. **Fase 1 - 4 (Selesai)**: Portal Mutu Publik, Siklus PPEPP, Radar RAG Early Warning, Dashboard Internal Atlas, Ekspor CSV & Laporan PDF Resmi.
2. **Fase 5 (Selesai)**: Modul AMI Digital & Manajemen Temuan KTS/OB 10 Unit STIMI YAPMI.
3. **Fase 6 (Selesai)**: Matriks Akreditasi LAMEMBA 9 Kriteria, Countdown PEPA, & Pemantauan Tahunan Wajib Lampiran DL-05.
4. **Fase 7 (Selesai)**: Pusat Evaluasi Terpadu EDO, EKA (SIAM Sync), Tracer Study (Auto-Supply IKU 2), dan Survei Pengguna Lulusan.
5. **Roadmap Fase 8**:
   - **Fase 8**: AI Quality Copilot & Generator Draf Laporan Evaluasi Diri (LED) Akreditasi.




