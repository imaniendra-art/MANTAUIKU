import mongoose from "mongoose";
import IKUMetadata from "@/models/IKUMetadata";
import Target from "@/models/Target";

const initialIKUs = [
  {
    code: "IKU 1",
    name: "Angka Efisiensi Edukasi perguruan tinggi (AEE PT)",
    category: "Talenta",
    unit: "%",
    type: "Wajib",
  },
  {
    code: "IKU 2",
    name: "Persentase lulusan pendidikan tinggi yang langsung bekerja, berwirausaha, atau melanjutkan studi",
    category: "Talenta",
    unit: "%",
    type: "Wajib",
  },
  {
    code: "IKU 3",
    name: "Persentase mahasiswa program Diploma dan Sarjana yang berkegiatan/meraih prestasi di luar program studi",
    category: "Talenta",
    unit: "%",
    type: "Wajib",
  },
  {
    code: "IKU 4",
    name: "Jumlah Dosen perguruan tinggi yang mendapatkan rekognisi internasional atau hasil penelitiannya diterapkan oleh masyarakat",
    category: "Inovasi",
    unit: "Angka",
    type: "Pilihan",
  },
  {
    code: "IKU 5",
    name: "Persentase luaran hasil kerja sama dan hilirisasi antara perguruan tinggi dengan industri/Lembaga",
    category: "Inovasi",
    unit: "%",
    type: "Wajib",
  },
  {
    code: "IKU 6",
    name: "Persentase publikasi bereputasi internasional (Scopus/WoS)",
    category: "Inovasi",
    unit: "%",
    type: "Pilihan", // Wajib for PTN-BH, Pilihan for PTS
  },
  {
    code: "IKU 7",
    name: "Persentase keterlibatan perguruan tinggi dalam SDGs",
    category: "Kontribusi pada masyarakat",
    unit: "%",
    type: "Wajib",
  },
  {
    code: "IKU 8",
    name: "Persentase Sumber Daya Manusia (SDM) perguruan tinggi yang terlibat langsung dalam penyusunan kebijakan",
    category: "Kontribusi pada masyarakat",
    unit: "%",
    type: "Pilihan",
  },
  {
    code: "IKU 9",
    name: "Persentase pendapatan/penghasilan dari bidang non-akademik (selain UKT/uang kuliah)",
    category: "Tata kelola berintegritas",
    unit: "%",
    type: "Wajib",
  },
  {
    code: "IKU 10",
    name: "Zona Integritas (WBK dan WBBM)",
    category: "Tata kelola berintegritas",
    unit: "%",
    type: "Pilihan",
  },
  {
    code: "IKU 11",
    name: "Hasil audit atas Laporan Keuangan PT dan Predikat SAKIP",
    category: "Tata kelola berintegritas",
    unit: "Opini/Predikat",
    type: "Pilihan",
  },
  {
    code: "IKU 12",
    name: "Ketersediaan perencanaan strategis peningkatan kesejahteraan dosen",
    category: "Tata kelola berintegritas",
    unit: "%",
    type: "Wajib",
  }
];

export async function seedIKUData() {
  try {
    const existingCount = await IKUMetadata.countDocuments();
    
    if (existingCount === 0) {
      console.log("No IKU Metadata found. Seeding the 12 standard IKUs...");
      
      const insertedIKUs = await IKUMetadata.insertMany(initialIKUs);
      console.log(`Successfully seeded ${insertedIKUs.length} IKUs.`);

      // Create empty targets for the current year (2026)
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
      console.log(`IKU Metadata already exists (${existingCount} records). Skipping seed.`);
    }
  } catch (error) {
    console.error("Error seeding IKU data:", error);
  }
}
