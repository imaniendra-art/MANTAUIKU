import bcrypt from "bcryptjs";
import IKUMetadata from "@/models/IKUMetadata";
import Target from "@/models/Target";
import User from "@/models/User";

const initialIKUs = [
  {
    code: "IKU 1",
    name: "Angka Efisiensi Edukasi perguruan tinggi (AEE PT)",
    category: "Talenta",
    unit: "%",
    type: "Wajib",
    cluster: "Talenta & Mahasiswa",
  },
  {
    code: "IKU 2",
    name: "Persentase lulusan pendidikan tinggi yang langsung bekerja, berwirausaha, atau melanjutkan studi",
    category: "Talenta",
    unit: "%",
    type: "Wajib",
    cluster: "Talenta & Mahasiswa",
  },
  {
    code: "IKU 3",
    name: "Persentase mahasiswa program Diploma dan Sarjana yang berkegiatan/meraih prestasi di luar program studi",
    category: "Talenta",
    unit: "%",
    type: "Wajib",
    cluster: "Talenta & Mahasiswa",
  },
  {
    code: "IKU 4",
    name: "Jumlah Dosen perguruan tinggi yang mendapatkan rekognisi internasional atau hasil penelitiannya diterapkan oleh masyarakat",
    category: "Inovasi",
    unit: "Angka",
    type: "Pilihan",
    cluster: "Inovasi & Riset",
  },
  {
    code: "IKU 5",
    name: "Persentase luaran hasil kerja sama dan hilirisasi antara perguruan tinggi dengan industri/Lembaga",
    category: "Inovasi",
    unit: "%",
    type: "Wajib",
    cluster: "Inovasi & Riset",
  },
  {
    code: "IKU 6",
    name: "Persentase publikasi bereputasi internasional (Scopus/WoS)",
    category: "Inovasi",
    unit: "%",
    type: "Pilihan",
    cluster: "Inovasi & Riset",
  },
  {
    code: "IKU 7",
    name: "Persentase keterlibatan perguruan tinggi dalam SDGs",
    category: "Kontribusi pada masyarakat",
    unit: "%",
    type: "Wajib",
    cluster: "Tata Kelola & Finansial",
  },
  {
    code: "IKU 8",
    name: "Persentase Sumber Daya Manusia (SDM) perguruan tinggi yang terlibat langsung dalam penyusunan kebijakan",
    category: "Kontribusi pada masyarakat",
    unit: "%",
    type: "Pilihan",
    cluster: "Tata Kelola & Finansial",
  },
  {
    code: "IKU 9",
    name: "Persentase pendapatan/penghasilan dari bidang non-akademik (selain UKT/uang kuliah)",
    category: "Tata kelola berintegritas",
    unit: "%",
    type: "Wajib",
    cluster: "Tata Kelola & Finansial",
  },
  {
    code: "IKU 10",
    name: "Zona Integritas (WBK dan WBBM)",
    category: "Tata kelola berintegritas",
    unit: "%",
    type: "Pilihan",
    cluster: "Tata Kelola & Finansial",
  },
  {
    code: "IKU 11",
    name: "Hasil audit atas Laporan Keuangan PT dan Predikat SAKIP",
    category: "Tata kelola berintegritas",
    unit: "Opini/Predikat",
    type: "Pilihan",
    cluster: "Tata Kelola & Finansial",
  },
  {
    code: "IKU 12",
    name: "Ketersediaan perencanaan strategis peningkatan kesejahteraan dosen",
    category: "Tata kelola berintegritas",
    unit: "%",
    type: "Wajib",
    cluster: "Tata Kelola & Finansial",
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

    // 2. Seed IKUs if not present
    const existingCount = await IKUMetadata.countDocuments();
    if (existingCount === 0) {
      console.log("No IKU Metadata found. Seeding the 12 standard IKUs...");
      const insertedIKUs = await IKUMetadata.insertMany(initialIKUs);
      console.log(`Successfully seeded ${insertedIKUs.length} IKUs.`);

      const currentYear = new Date().getFullYear();
      const targetsToInsert = insertedIKUs.map(iku => ({
        ikuId: iku._id,
        year: currentYear,
        baseline: 0,
        target: 0,
        status: "Belum"
      }));

      await Target.insertMany(targetsToInsert);
      console.log(`Successfully created empty targets for year ${currentYear}.`);
    } else {
      console.log(`IKU Metadata already exists (${existingCount} records).`);
    }
  } catch (error) {
    console.error("Error seeding IKU data:", error);
  }
}
