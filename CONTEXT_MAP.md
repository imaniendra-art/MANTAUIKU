# CONTEXT MAP — MANTAUIKU (STIMI YAPMI MAKASSAR)

## Peta Modul & Rute Utama

### 1. Halaman Publik & Autentikasi
- `src/app/page.tsx` — Beranda publik transparansi mutu LPM STIMI YAPMI (12 IKU, AMI, LAMEMBA, CDC Tracer).
- `src/app/login/page.tsx` — Halaman login RBAC (LPM, UNIT_KERJA/PIC, PIMPINAN).
- `src/app/public/tracer-study/page.tsx` — Formulir kuesioner tracer study alumni (Auto-supply IKU 2).
- `src/app/public/employer-survey/page.tsx` — Formulir kepuasan pengguna lulusan oleh mitra industri.

### 2. Dashboard Internal Penjaminan Mutu
- `src/app/dashboard/page.tsx` — Dashboard analitik eksekutif capaian 12 IKU triwulan (TW 1 - TW 4).
- `src/app/dashboard/achievements/page.tsx` — Input capaian IKU PIC dengan modal drill-down Numerator & Denominator.
- `src/app/dashboard/targets/page.tsx` — Penetapan target & baseline 12 IKU oleh LPM.
- `src/app/dashboard/ami/page.tsx` — Audit Mutu Internal Siklus IX, 10 Auditee, KTS Mayor/Minor/OB, PTK/RTL.
- `src/app/dashboard/accreditation/page.tsx` — Matriks 9 Kriteria LAMEMBA, Countdown PEPA, Lampiran DL-05.
- `src/app/dashboard/evaluations/page.tsx` — Pusat Evaluasi EDO, EKA, Tracer Study, dan Survei Pengguna Lulusan.
- `src/app/dashboard/copilot/page.tsx` — AI Quality Copilot (Generator Draf LED LAMEMBA 9 Kriteria & Konsultasi).
- `src/app/dashboard/reports/page.tsx` — Rekapitulasi perbandingan TW1-TW4, ekspor CSV, dan pratinjau cetak PDF berkop resmi.
- `src/app/dashboard/users/page.tsx` — Manajemen akun pengguna PIC dan tombol administratif reset password oleh LPM.
- `src/app/dashboard/profile/page.tsx` — Kartu profil pengguna, informasi tugas IKU, dan fitur ubah kata sandi mandiri.

### 3. Keamanan & Keandalan (Hardening 5 Pilar)
- `src/lib/rateLimit.ts` — Sliding-window rate limiter & RFC 429 response.
- `next.config.ts` — Security headers (HSTS, X-Frame-Options, no-sniff, poweredBy: false).
- `src/app/error.tsx` & `src/app/dashboard/error.tsx` & `src/app/global-error.tsx` — Error boundaries.
- `src/app/not-found.tsx` — Halaman 404 Sky-Cyan.
- `src/app/api/healthz/route.ts` — Health probe MongoDB Atlas & uptime.
- `src/app/robots.ts` & `src/app/sitemap.ts` — Bot crawler isolation & sitemap.
