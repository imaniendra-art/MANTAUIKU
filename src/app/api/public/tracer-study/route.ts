import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { TracerStudyResponse } from "@/models/Evaluation";
import IKUMetadata from "@/models/IKUMetadata";
import Achievement from "@/models/Achievement";
import { getClientIp, checkRateLimit, createRateLimitExceededResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const yearFilter = searchParams.get("year");

    const query: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== "ALL") {
      query.status = statusFilter;
    }
    if (yearFilter && yearFilter !== "ALL") {
      query.graduationYear = Number(yearFilter);
    }

    const responses = await TracerStudyResponse.find(query).sort({ createdAt: -1 });
    const allResponses = await TracerStudyResponse.find();

    const totalCount = allResponses.length;
    const absorbedCount = allResponses.filter((r) =>
      ["BEKERJA", "WIRAUSAHA", "STUDI_LANJUT"].includes(r.status)
    ).length;
    const absorptionRate =
      totalCount > 0 ? Math.round((absorbedCount / totalCount) * 100 * 10) / 10 : 0;

    // Status breakdown
    const bekerjaCount = allResponses.filter((r) => r.status === "BEKERJA").length;
    const wirausahaCount = allResponses.filter((r) => r.status === "WIRAUSAHA").length;
    const studiLanjutCount = allResponses.filter((r) => r.status === "STUDI_LANJUT").length;
    const mencariKerjaCount = allResponses.filter((r) => r.status === "MENCARI_KERJA").length;

    // Average waiting time for absorbed alumni
    const absorbedAlumni = allResponses.filter((r) => r.status !== "MENCARI_KERJA");
    const avgWaitingTime =
      absorbedAlumni.length > 0
        ? Math.round(
            (absorbedAlumni.reduce((sum, r) => sum + r.waitingTimeMonths, 0) /
              absorbedAlumni.length) *
              10
          ) / 10
        : 0;

    // Field alignment breakdown
    const highAlignment = allResponses.filter((r) => r.fieldAlignment === "TINGGI").length;
    const mediumAlignment = allResponses.filter((r) => r.fieldAlignment === "SEDANG").length;
    const lowAlignment = allResponses.filter((r) => r.fieldAlignment === "RENDAH").length;

    // Average salary for employed alumni
    const salaryAlumni = allResponses.filter((r) => (r.monthlySalary || 0) > 0);
    const avgSalary =
      salaryAlumni.length > 0
        ? Math.round(
            salaryAlumni.reduce((sum, r) => sum + (r.monthlySalary || 0), 0) /
              salaryAlumni.length
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: responses,
      summary: {
        totalRespondents: totalCount,
        absorbedCount,
        absorptionRate, // This directly reflects IKU 2!
        avgWaitingTime,
        avgSalary,
        statusBreakdown: {
          bekerja: bekerjaCount,
          wirausaha: wirausahaCount,
          studiLanjut: studiLanjutCount,
          mencariKerja: mencariKerjaCount,
        },
        fieldAlignmentBreakdown: {
          tinggi: highAlignment,
          sedang: mediumAlignment,
          rendah: lowAlignment,
        },
        iku2Status: "AUTO_SYNCHRONIZED_WITH_ACHIEVEMENTS",
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching tracer study data:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch tracer study data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // 0. Rate limiting protection (Max 15 submissions per 10 minutes per client IP)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, "tracer_study_submit", 15, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return createRateLimitExceededResponse(
        rateLimit.retryAfterSeconds,
        `Terlalu banyak pengisian kuesioner dari perangkat Anda. Silakan tunggu ${rateLimit.retryAfterSeconds} detik sebelum mengirimkan kuesioner berikutnya.`
      );
    }

    await connectToDatabase();
    const body = await req.json();

    const {
      nim,
      name,
      graduationYear,
      prodi = "S1 Manajemen",
      phone,
      email,
      status,
      waitingTimeMonths,
      fieldAlignment,
      monthlySalary,
      companyName,
      jobTitle,
    } = body;

    if (!nim || !name || !graduationYear || !phone || !email || !status) {
      return NextResponse.json(
        { success: false, error: "Mohon lengkapi seluruh formulir wajib" },
        { status: 400 }
      );
    }

    // Upsert or save new response based on NIM
    const tracerRecord = await TracerStudyResponse.findOneAndUpdate(
      { nim },
      {
        nim,
        name,
        graduationYear: Number(graduationYear),
        prodi,
        phone,
        email,
        status,
        waitingTimeMonths: Number(waitingTimeMonths || 0),
        fieldAlignment: fieldAlignment || "TINGGI",
        monthlySalary: Number(monthlySalary || 0),
        companyName: companyName || "-",
        jobTitle: jobTitle || "-",
      },
      { upsert: true, new: true }
    );

    // 2. CRITICAL AUTO-SUPPLY: Recalculate IKU 2 Rate
    const totalCount = await TracerStudyResponse.countDocuments();
    const absorbedCount = await TracerStudyResponse.countDocuments({
      status: { $in: ["BEKERJA", "WIRAUSAHA", "STUDI_LANJUT"] },
    });
    const absorptionRate =
      totalCount > 0 ? Math.round((absorbedCount / totalCount) * 100 * 10) / 10 : 0;

    const iku2Meta = await IKUMetadata.findOne({ code: "IKU 2" });
    let iku2AchievementUpdated = false;

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
      iku2AchievementUpdated = true;
    }

    return NextResponse.json({
      success: true,
      message: "Terima kasih! Data Tracer Study Anda berhasil disimpan dan memperbarui capaian IKU 2 secara real-time.",
      data: tracerRecord,
      iku2Sync: {
        absorptionRate: `${absorptionRate}%`,
        updatedAchievementCollection: iku2AchievementUpdated,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error submitting tracer study:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit tracer study" },
      { status: 500 }
    );
  }
}
