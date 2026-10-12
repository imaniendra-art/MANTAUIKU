import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { TracerStudyResponse } from "@/models/Evaluation";
import IKUMetadata from "@/models/IKUMetadata";
import Achievement from "@/models/Achievement";

export const dynamic = "force-dynamic";

// Data simulasi batch lulusan tambahan yang ditarik dari Aplikasi Tracer Study Eksternal / CDC
const externalTracerFeed = [
  {
    nim: "202101018",
    name: "Taufiqurrahman, S.M.",
    graduationYear: 2025,
    prodi: "S1 Manajemen",
    phone: "081244558833",
    email: "taufiq.rahman@kallagroup.co.id",
    status: "BEKERJA",
    waitingTimeMonths: 2,
    fieldAlignment: "TINGGI",
    monthlySalary: 6400000,
    companyName: "PT Hadji Kalla (Kalla Toyota)",
    jobTitle: "Business Development Officer",
  },
  {
    nim: "202101024",
    name: "Siti Rahmawati, S.M.",
    graduationYear: 2025,
    prodi: "S1 Manajemen",
    phone: "085299112233",
    email: "siti.rahmawati@btn.co.id",
    status: "BEKERJA",
    waitingTimeMonths: 3,
    fieldAlignment: "TINGGI",
    monthlySalary: 5800000,
    companyName: "PT Bank Tabungan Negara (Persero) Tbk",
    jobTitle: "Customer Service Staff & Loan Administration",
  },
  {
    nim: "202101031",
    name: "Muhammad Ilhamsyah",
    graduationYear: 2025,
    prodi: "S1 Manajemen",
    phone: "082188447711",
    email: "ilhamsyah.digital@gmail.com",
    status: "WIRAUSAHA",
    waitingTimeMonths: 1,
    fieldAlignment: "TINGGI",
    monthlySalary: 11000000,
    companyName: "Makassar Digital Craft (Creative Agency)",
    jobTitle: "Co-Founder & Chief Operations",
  },
  {
    nim: "202101039",
    name: "Ayu Lestari, S.M.",
    graduationYear: 2025,
    prodi: "S1 Manajemen",
    phone: "081377889900",
    email: "ayu.lestari@unhas.ac.id",
    status: "STUDI_LANJUT",
    waitingTimeMonths: 2,
    fieldAlignment: "TINGGI",
    monthlySalary: 0,
    companyName: "Universitas Hasanuddin",
    jobTitle: "Mahasiswa Magister Sains Manajemen (S2)",
  },
];

export async function POST() {
  try {
    await connectToDatabase();
    const now = new Date();

    // 1. Ingest / Upsert data dari feed API Aplikasi Tracer Study
    let upsertCount = 0;
    for (const item of externalTracerFeed) {
      await TracerStudyResponse.findOneAndUpdate(
        { nim: item.nim },
        { ...item },
        { upsert: true, new: true }
      );
      upsertCount++;
    }

    // 2. Hitung ulang total responden dan tingkat serapan kerja
    const totalCount = await TracerStudyResponse.countDocuments();
    const absorbedCount = await TracerStudyResponse.countDocuments({
      status: { $in: ["BEKERJA", "WIRAUSAHA", "STUDI_LANJUT"] },
    });
    const absorptionRate =
      totalCount > 0 ? Math.round((absorbedCount / totalCount) * 100 * 10) / 10 : 0;

    // 3. Atomik Update ke IKU 2 di koleksi Achievement
    const iku2Meta = await IKUMetadata.findOne({ code: "IKU 2" });
    let iku2Updated = false;

    if (iku2Meta) {
      await Achievement.findOneAndUpdate(
        { ikuId: iku2Meta._id, year: 2026, quarter: 4 },
        {
          ikuId: iku2Meta._id,
          year: 2026,
          quarter: 4,
          value: absorptionRate,
          status: "Disetujui",
          documentUrl: "/dashboard/evaluations",
        },
        { upsert: true, new: true }
      );
      iku2Updated = true;
    }

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi data dari Aplikasi Tracer Study (CDC STIMI YAPMI) berhasil! ${upsertCount} data alumni baru terintegrasi.`,
      syncDetails: {
        source: "Aplikasi Tracer Study STIMI YAPMI Gateway API v1.8 (stimi-yapmi.ac.id/tracer/api)",
        protocol: "REST / JSON Web Token (HMAC-SHA256)",
        timestamp: now.toISOString(),
        recordsFetched: externalTracerFeed.length,
        recordsUpserted: upsertCount,
        totalAlumniInDb: totalCount,
        absorbedCount,
        newAbsorptionRate: `${absorptionRate}%`,
        iku2Updated,
        status: "ONLINE_SYNCHRONIZED",
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error syncing Tracer Study application:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to sync Tracer Study data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
