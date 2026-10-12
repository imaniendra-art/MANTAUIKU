import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { EdoLecturerEvaluation } from "@/models/Evaluation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const semester = searchParams.get("semester") || "";

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { lecturerName: { $regex: search, $options: "i" } },
        { courseName: { $regex: search, $options: "i" } },
        { nidn: { $regex: search, $options: "i" } },
      ];
    }
    if (semester && semester !== "ALL") {
      query.semester = semester;
    }

    const evaluations = await EdoLecturerEvaluation.find(query).sort({ ikdScore: -1 });

    // Analytics Summary
    const totalCount = evaluations.length;
    let avgIkd = 0;
    let avgPedagogic = 0;
    let avgProfessional = 0;
    let avgPersonality = 0;
    let avgSocial = 0;
    let totalRespondents = 0;

    let sangatBaikCount = 0;
    let baikCount = 0;
    let cukupCount = 0;
    let kurangCount = 0;

    if (totalCount > 0) {
      const sum = evaluations.reduce(
        (acc, item) => {
          acc.ikd += item.ikdScore;
          acc.pedagogic += item.pedagogicScore;
          acc.professional += item.professionalScore;
          acc.personality += item.personalityScore;
          acc.social += item.socialScore;
          acc.respondents += item.respondentCount;
          return acc;
        },
        { ikd: 0, pedagogic: 0, professional: 0, personality: 0, social: 0, respondents: 0 }
      );

      avgIkd = Math.round((sum.ikd / totalCount) * 100) / 100;
      avgPedagogic = Math.round((sum.pedagogic / totalCount) * 100) / 100;
      avgProfessional = Math.round((sum.professional / totalCount) * 100) / 100;
      avgPersonality = Math.round((sum.personality / totalCount) * 100) / 100;
      avgSocial = Math.round((sum.social / totalCount) * 100) / 100;
      totalRespondents = sum.respondents;

      evaluations.forEach((item) => {
        if (item.predicate === "Sangat Baik") sangatBaikCount++;
        else if (item.predicate === "Baik") baikCount++;
        else if (item.predicate === "Cukup") cukupCount++;
        else kurangCount++;
      });
    }

    return NextResponse.json({
      success: true,
      data: evaluations,
      summary: {
        totalEvaluated: totalCount,
        totalRespondents,
        averageIkd: avgIkd,
        competencies: {
          pedagogic: avgPedagogic,
          professional: avgProfessional,
          personality: avgPersonality,
          social: avgSocial,
        },
        predicates: {
          sangatBaik: sangatBaikCount,
          baik: baikCount,
          cukup: cukupCount,
          kurang: kurangCount,
          sangatBaikPercent: totalCount > 0 ? Math.round((sangatBaikCount / totalCount) * 100) : 0,
        },
        lastSynced: evaluations[0]?.syncedAt || new Date(),
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching EDO data:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch EDO data" },
      { status: 500 }
    );
  }
}
