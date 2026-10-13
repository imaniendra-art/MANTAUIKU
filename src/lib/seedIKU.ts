import bcrypt from "bcryptjs";
import IKUMetadata from "@/models/IKUMetadata";
import Target from "@/models/Target";
import Achievement from "@/models/Achievement";
import User from "@/models/User";

const initialIKUs = [
  {
    code: "IKU 1",
    name: "Angka Efisiensi Edukasi perguruan tinggi (AEE PT)",
    category: "Talenta",
    unit: "%",
    type: "Wajib",
    cluster: "Talenta & Mahasiswa",
    formula: "(Jumlah Mahasiswa Lulus Tepat Waktu ≤ 4 Thn / Total Mhs Baru Angkatan Tersebut) × 100%",
    numeratorLabel: "Lulusan Tepat Waktu (≤ 4 Tahun)",
    denominatorLabel: "Total Mahasiswa Baru Angkatan Terkait",
    calculationMethod: "PERCENTAGE",
  },
  {
    code: "IKU 2",
    name: "Persentase lulusan pendidikan tinggi yang langsung bekerja, berwirausaha, atau melanjutkan studi",
    category: "Talenta",
    unit: "%",
    type: "Wajib",
    cluster: "Talenta & Mahasiswa",
    formula: "((Lulusan Bekerja + Wirausaha + Lanjut Studi) / Total Responden Tracer Study) × 100%",
    numeratorLabel: "Lulusan Bekerja / Wirausaha / Studi Lanjut",
    denominatorLabel: "Total Responden Tracer Study Terlacak",
    calculationMethod: "PERCENTAGE",
  },
  {
    code: "IKU 3",
    name: "Persentase mahasiswa program Diploma dan Sarjana yang berkegiatan/meraih prestasi di luar program studi",
    category: "Talenta",
    unit: "%",
    type: "Wajib",
    cluster: "Talenta & Mahasiswa",
    formula: "(Mahasiswa Ikut MBKM / Meraih Prestasi Non-Kampus / Total Mahasiswa Aktif) × 100%",
    numeratorLabel: "Mahasiswa Berprestasi & Program MBKM",
    denominatorLabel: "Total Mahasiswa Aktif S1 Manajemen",
    calculationMethod: "PERCENTAGE",
  },
  {
    code: "IKU 4",
    name: "Jumlah Dosen perguruan tinggi yang mendapatkan rekognisi internasional atau hasil penelitiannya diterapkan oleh masyarakat",
    category: "Inovasi",
    unit: "Orang/Karya",
    type: "Pilihan",
    cluster: "Inovasi & Riset",
    formula: "Akumulasi Jumlah Dosen Ber-Rekognisi atau Riset Diterapkan Mitra",
    numeratorLabel: "Dosen Bereputasi / Karya Diterapkan",
    denominatorLabel: "Total Dosen Tetap STIMI (Basis Rujukan)",
    calculationMethod: "ACCUMULATION",
  },
  {
    code: "IKU 5",
    name: "Persentase luaran hasil kerja sama dan hilirisasi antara perguruan tinggi dengan industri/Lembaga",
    category: "Inovasi",
    unit: "%",
    type: "Wajib",
    cluster: "Inovasi & Riset",
    formula: "(Kerjasama Tridharma Memiliki Luaran Riil / Total Kerjasama MoU/MoA Aktif) × 100%",
    numeratorLabel: "Kerjasama Menghasilkan Luaran Riil (MoA/PKS)",
    denominatorLabel: "Total Nota Kesepahaman (MoU) Kampus",
    calculationMethod: "PERCENTAGE",
  },
  {
    code: "IKU 6",
    name: "Persentase publikasi bereputasi internasional (Scopus/WoS)",
    category: "Inovasi",
    unit: "%",
    type: "Pilihan",
    cluster: "Inovasi & Riset",
    formula: "(Artikel Ilmiah Terbit di Scopus / WoS / SINTA 1-2 / Total Dosen Tetap) × 100%",
    numeratorLabel: "Publikasi Bereputasi Terbit",
    denominatorLabel: "Total Dosen Tetap STIMI YAPMI",
    calculationMethod: "PERCENTAGE",
  },
  {
    code: "IKU 7",
    name: "Persentase keterlibatan perguruan tinggi dalam SDGs",
    category: "Kontribusi pada masyarakat",
    unit: "%",
    type: "Wajib",
    cluster: "Tata Kelola & Finansial",
    formula: "(Kegiatan Tridharma Mendukung 17 Pilar SDGs / Total Agenda Riset & PkM LPPM) × 100%",
    numeratorLabel: "Kegiatan Riset & PkM Berbasis SDGs",
    denominatorLabel: "Total Program Riset & PkM LPPM",
    calculationMethod: "PERCENTAGE",
  },
  {
    code: "IKU 8",
    name: "Persentase Sumber Daya Manusia (SDM) perguruan tinggi yang terlibat langsung dalam penyusunan kebijakan",
    category: "Kontribusi pada masyarakat",
    unit: "%",
    type: "Pilihan",
    cluster: "Tata Kelola & Finansial",
    formula: "(Dosen/Tendik Terlibat Perumus Kebijakan Pemda/Mitra / Total Dosen Tetap) × 100%",
    numeratorLabel: "Dosen Tim Ahli / Perumus Kebijakan",
    denominatorLabel: "Total Dosen Tetap STIMI YAPMI",
    calculationMethod: "PERCENTAGE",
  },
  {
    code: "IKU 9",
    name: "Persentase pendapatan/penghasilan dari bidang non-akademik (selain UKT/uang kuliah)",
    category: "Tata kelola berintegritas",
    unit: "%",
    type: "Wajib",
    cluster: "Tata Kelola & Finansial",
    formula: "(Realisasi Pendapatan Usaha, Jasa & Hibah / Total Pendapatan Operasional Kampus) × 100%",
    numeratorLabel: "Realisasi Penerimaan Non-UKT (Rp)",
    denominatorLabel: "Total Anggaran Pendapatan Kampus (Rp)",
    calculationMethod: "PERCENTAGE",
  },
  {
    code: "IKU 10",
    name: "Zona Integritas (WBK dan WBBM)",
    category: "Tata kelola berintegritas",
    unit: "%",
    type: "Pilihan",
    cluster: "Tata Kelola & Finansial",
    formula: "(Komponen Pengungkit ZI yang Terpenuhi / 6 Area Perubahan Menpan-RB) × 100%",
    numeratorLabel: "Area Perubahan ZI Terpenuhi",
    denominatorLabel: "Total 6 Area Perubahan Standar",
    calculationMethod: "PERCENTAGE",
  },
  {
    code: "IKU 11",
    name: "Hasil audit atas Laporan Keuangan PT dan Predikat SAKIP",
    category: "Tata kelola berintegritas",
    unit: "Predikat/Skor",
    type: "Pilihan",
    cluster: "Tata Kelola & Finansial",
    formula: "Evaluasi Akuntabilitas Kinerja & Opini WTP Auditor Independen",
    numeratorLabel: "Nilai Evaluasi Akuntabilitas (SAKIP)",
    denominatorLabel: "Skor Maksimum Penilaian SAKIP (100)",
    calculationMethod: "PREDICATE",
  },
  {
    code: "IKU 12",
    name: "Ketersediaan perencanaan strategis peningkatan kesejahteraan dosen",
    category: "Tata kelola berintegritas",
    unit: "%",
    type: "Wajib",
    cluster: "Tata Kelola & Finansial",
    formula: "(Program Kesejahteraan & Asuransi Terealisasi / Total Rencana Renstra Mutu) × 100%",
    numeratorLabel: "Program Kesejahteraan Terealisasi",
    denominatorLabel: "Target Program Renstra Kesejahteraan",
    calculationMethod: "PERCENTAGE",
  }
];

const defaultUsers = [
  {
    name: "Lembaga Penjaminan Mutu (LPM)",
    email: "lpm@stimi.ac.id",
    passwordRaw: "password123",
    role: "LPM",
    unitCode: "LPM",
    unitName: "Lembaga Penjaminan Mutu",
    assignedIKUCodes: ["IKU 1", "IKU 2", "IKU 3", "IKU 4", "IKU 5", "IKU 6", "IKU 7", "IKU 8", "IKU 9", "IKU 10", "IKU 11", "IKU 12"],
  },
  {
    name: "Wakil Ketua III (Kemahasiswaan & Alumni)",
    email: "wk3@stimi.ac.id",
    passwordRaw: "password123",
    role: "UNIT_KERJA",
    unitCode: "WK3",
    unitName: "WK III - Kemahasiswaan & Alumni",
    assignedIKUCodes: ["IKU 1", "IKU 2", "IKU 3"],
  },
  {
    name: "Wakil Ketua I (Akademik & Riset)",
    email: "wk1@stimi.ac.id",
    passwordRaw: "password123",
    role: "UNIT_KERJA",
    unitCode: "WK1",
    unitName: "WK I - Akademik & Riset",
    assignedIKUCodes: ["IKU 4", "IKU 6", "IKU 8"],
  },
  {
    name: "Wakil Ketua II (Kerjasama & Keuangan)",
    email: "wk2@stimi.ac.id",
    passwordRaw: "password123",
    role: "UNIT_KERJA",
    unitCode: "WK2",
    unitName: "WK II - Kerjasama & Keuangan",
    assignedIKUCodes: ["IKU 5", "IKU 9", "IKU 11"],
  },
  {
    name: "Tim Tata Kelola & Mutu",
    email: "tatapamong@stimi.ac.id",
    passwordRaw: "password123",
    role: "UNIT_KERJA",
    unitCode: "MUTU",
    unitName: "Tim Tata Kelola & Mutu",
    assignedIKUCodes: ["IKU 7", "IKU 10", "IKU 12"],
  },
  {
    name: "Pimpinan STIMI YAPMI",
    email: "pimpinan@stimi.ac.id",
    passwordRaw: "password123",
    role: "PIMPINAN",
    unitCode: "PIMPINAN",
    unitName: "Pimpinan Institusi",
    assignedIKUCodes: ["IKU 1", "IKU 2", "IKU 3", "IKU 4", "IKU 5", "IKU 6", "IKU 7", "IKU 8", "IKU 9", "IKU 10", "IKU 11", "IKU 12"],
  }
];

export async function seedIKUData() {
  try {
    // 1. Seed or sync default users
    for (const u of defaultUsers) {
      const existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(u.passwordRaw, 10);
        await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          unitCode: u.unitCode,
          unitName: u.unitName,
          assignedIKUCodes: u.assignedIKUCodes,
        });
        console.log(`Created seeded user: ${u.email} (${u.unitCode})`);
      } else {
        // Update assignedIKUCodes & unitCode if missing
        existingUser.unitCode = u.unitCode;
        existingUser.unitName = u.unitName;
        existingUser.assignedIKUCodes = u.assignedIKUCodes;
        await existingUser.save();
      }
    }

    // 2. Seed or update IKUs
    for (const ikuData of initialIKUs) {
      await IKUMetadata.findOneAndUpdate(
        { code: ikuData.code },
        {
          name: ikuData.name,
          category: ikuData.category,
          cluster: ikuData.cluster,
          unit: ikuData.unit,
          type: ikuData.type,
          formula: ikuData.formula,
          numeratorLabel: ikuData.numeratorLabel,
          denominatorLabel: ikuData.denominatorLabel,
          calculationMethod: ikuData.calculationMethod,
        },
        { upsert: true, new: true }
      );
    }
    console.log("Successfully synced 12 IKUs with audit formula and numerator/denominator labels.");

    // 3. Ensure Targets for current year
    const currentYear = new Date().getFullYear();
    const allIKUs = await IKUMetadata.find();
    for (const iku of allIKUs) {
      const existingTgt = await Target.findOne({ ikuId: iku._id, year: currentYear });
      if (!existingTgt) {
        let tgtVal = 80;
        let baseVal = 70;
        if (iku.code === "IKU 4") { tgtVal = 6; baseVal = 4; }
        if (iku.code === "IKU 9") { tgtVal = 15; baseVal = 10; }
        if (iku.code === "IKU 11") { tgtVal = 90; baseVal = 85; }
        await Target.create({
          ikuId: iku._id,
          year: currentYear,
          baseline: baseVal,
          target: tgtVal,
          status: "Diajukan",
          justificationNarrative: `Target operasional ${iku.name} tahun ${currentYear} diselaraskan dengan standar LAMEMBA.`
        });
      }
    }

    // 4. Seed / Backfill realistic achievements with Numerator & Denominator for 2026
    const sampleAuditData: Record<string, { num: number; den: number; val: number }> = {
      "IKU 1": { num: 112, den: 135, val: 83.0 },
      "IKU 2": { num: 76, den: 84, val: 90.5 },
      "IKU 3": { num: 48, den: 320, val: 15.0 },
      "IKU 4": { num: 6, den: 18, val: 6.0 },
      "IKU 5": { num: 14, den: 18, val: 77.8 },
      "IKU 6": { num: 11, den: 18, val: 61.1 },
      "IKU 7": { num: 8, den: 10, val: 80.0 },
      "IKU 8": { num: 5, den: 18, val: 27.8 },
      "IKU 9": { num: 280000000, den: 2500000000, val: 11.2 },
      "IKU 10": { num: 5, den: 6, val: 83.3 },
      "IKU 11": { num: 88.5, den: 100, val: 88.5 },
      "IKU 12": { num: 4, den: 4, val: 100.0 },
    };

    const lpmUser = await User.findOne({ email: "lpm@stimi.ac.id" });

    for (const iku of allIKUs) {
      const audit = sampleAuditData[iku.code];
      if (audit) {
        // Seed TW 1 as validated and TW 2 as submitted
        for (const q of [1, 2, 3, 4]) {
          const ach = await Achievement.findOne({ ikuId: iku._id, year: currentYear, quarter: q });
          if (!ach) {
            await Achievement.create({
              ikuId: iku._id,
              year: currentYear,
              quarter: q,
              value: q === 1 ? audit.val : Math.max(0, +(audit.val - (4 - q) * 3).toFixed(1)),
              numerator: audit.num,
              denominator: audit.den,
              formula: iku.formula,
              numeratorLabel: iku.numeratorLabel,
              denominatorLabel: iku.denominatorLabel,
              status: q === 1 ? "Disetujui" : q === 2 ? "pendingDiajukan" : "Draf",
              documentUrl: "https://drive.google.com/drive/folders/stimiyapmi-spmi-bukti-dukung",
              submittedBy: lpmUser?._id,
            });
          } else if (!ach.numerator || !ach.denominator) {
            ach.numerator = audit.num;
            ach.denominator = audit.den;
            ach.formula = iku.formula;
            ach.numeratorLabel = iku.numeratorLabel;
            ach.denominatorLabel = iku.denominatorLabel;
            await ach.save();
          }
        }
      }
    }
    console.log("Successfully backfilled Numerator and Denominator audit data for all 12 IKUs.");
  } catch (error) {
    console.error("Error seeding IKU data:", error);
  }
}
