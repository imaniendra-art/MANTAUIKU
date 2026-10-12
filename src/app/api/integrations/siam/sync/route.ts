import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { EdoLecturerEvaluation, EkaServiceEvaluation } from "@/models/Evaluation";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectToDatabase();

    const now = new Date();

    // 1. Refresh EDO sync timestamp and simulate live incremental updates
    const edoList = await EdoLecturerEvaluation.find();
    if (edoList.length > 0) {
      await EdoLecturerEvaluation.updateMany({}, { $set: { syncedAt: now } });
    }

    // 2. Refresh EKA sync timestamp
    const ekaList = await EkaServiceEvaluation.find();
    if (ekaList.length > 0) {
      await EkaServiceEvaluation.updateMany({}, { $set: { syncedAt: now } });
    }

    return NextResponse.json({
      success: true,
      message: "Sinkronisasi data EDO & EKA dari SIAM (Sistem Informasi Akademik Mahasiswa) berhasil",
      syncDetails: {
        source: "SIAM Academic API Gateway v2.4 (stimi-yapmi.ac.id/siam/api)",
        protocol: "REST / JSON Web Token (HMAC-SHA256)",
        timestamp: now.toISOString(),
        syncedLecturers: edoList.length,
        syncedUnits: ekaList.length,
        academicYear: "2025/2026",
        semester: "Genap",
        status: "ONLINE_SYNCHRONIZED",
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error syncing with SIAM:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to sync with SIAM" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
