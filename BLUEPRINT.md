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

