import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import {
  EdoLecturerEvaluation,
  EkaServiceEvaluation,
  TracerStudyResponse,
  EmployerSurveyResponse,
} from "@/models/Evaluation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. EDO Summary
    const edoList = await EdoLecturerEvaluation.find();
    const edoCount = edoList.length;
    let avgIkd = 0;
    let totalEdoRespondents = 0;
    if (edoCount > 0) {
      const sumIkd = edoList.reduce((acc, curr) => acc + curr.ikdScore, 0);
      avgIkd = Math.round((sumIkd / edoCount) * 100) / 100;
      totalEdoRespondents = edoList.reduce((acc, curr) => acc + curr.respondentCount, 0);
    }

    // 2. EKA Summary
    const ekaList = await EkaServiceEvaluation.find();
    const ekaCount = ekaList.length;
    let avgEkaSatisfactionRate = 0;
    let avgEkaScore = 0;
    if (ekaCount > 0) {
      const sumRate = ekaList.reduce((acc, curr) => acc + curr.satisfactionRate, 0);
      avgEkaSatisfactionRate = Math.round((sumRate / ekaCount) * 10) / 10;
      avgEkaScore = Math.round((ekaList.reduce((acc, curr) => acc + curr.averageScore, 0) / ekaCount) * 100) / 100;
    }

    // 3. Tracer Study Summary
    const tracerList = await TracerStudyResponse.find();
    const totalTracer = tracerList.length;
    const absorbedTracer = tracerList.filter((r) =>
      ["BEKERJA", "WIRAUSAHA", "STUDI_LANJUT"].includes(r.status)
    ).length;
    const absorptionRate =
      totalTracer > 0 ? Math.round((absorbedTracer / totalTracer) * 100 * 10) / 10 : 0;
    const workingTracer = tracerList.filter((r) => r.status !== "MENCARI_KERJA");
    const avgWaitingTime =
      workingTracer.length > 0
        ? Math.round(
            (workingTracer.reduce((acc, curr) => acc + curr.waitingTimeMonths, 0) /
              workingTracer.length) *
              10
          ) / 10
        : 0;

    // 4. Employer Survey Summary
    const employerList = await EmployerSurveyResponse.find();
    const employerCount = employerList.length;
    let avgEmployerScore = 0;
    if (employerCount > 0) {
      avgEmployerScore =
        Math.round(
          (employerList.reduce((acc, curr) => acc + curr.averageScore, 0) / employerCount) * 100
        ) / 100;
    }

    return NextResponse.json({
      success: true,
      edo: {
        totalEvaluated: edoCount,
        averageIkd: avgIkd,
        totalRespondents: totalEdoRespondents,
        predicateLabel: avgIkd >= 3.5 ? "Sangat Baik" : "Baik",
      },
      eka: {
        totalUnits: ekaCount,
        satisfactionRate: avgEkaSatisfactionRate,
        averageScore: avgEkaScore,
      },
      tracer: {
        totalAlumni: totalTracer,
        absorbedCount: absorbedTracer,
        absorptionRate,
        avgWaitingTime,
        statusBreakdown: {
          bekerja: tracerList.filter((r) => r.status === "BEKERJA").length,
          wirausaha: tracerList.filter((r) => r.status === "WIRAUSAHA").length,
          studiLanjut: tracerList.filter((r) => r.status === "STUDI_LANJUT").length,
          mencariKerja: tracerList.filter((r) => r.status === "MENCARI_KERJA").length,
        },
      },
      employer: {
        totalCompanies: employerCount,
        averageScore: avgEmployerScore,
        satisfactionRate: Math.round((avgEmployerScore / 4.0) * 1000) / 10,
        recentFeedback: employerList.slice(0, 3).map((item) => ({
          companyName: item.companyName,
          evaluatorPosition: item.evaluatorPosition,
          score: item.averageScore,
          notes: item.feedbackNotes,
        })),
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching public evaluations summary:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch evaluations summary" },
      { status: 500 }
    );
  }
}
