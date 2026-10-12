import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { EkaServiceEvaluation } from "@/models/Evaluation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const services = await EkaServiceEvaluation.find().sort({ satisfactionRate: -1 });

    const totalCount = services.length;
    let avgScore = 0;
    let avgSatisfactionRate = 0;
    let totalRespondents = 0;

    let highestUnit = null;
    let lowestUnit = null;
    const warningUnits: Array<{ unitName: string; satisfactionRate: number; reason: string }> = [];

    if (totalCount > 0) {
      const sum = services.reduce(
        (acc, item) => {
          acc.score += item.averageScore;
          acc.rate += item.satisfactionRate;
          acc.respondents += item.respondentCount;
          return acc;
        },
        { score: 0, rate: 0, respondents: 0 }
      );

      avgScore = Math.round((sum.score / totalCount) * 100) / 100;
      avgSatisfactionRate = Math.round((sum.rate / totalCount) * 10) / 10;
      totalRespondents = sum.respondents;

      highestUnit = services[0];
      lowestUnit = services[services.length - 1];

      // Early Warning Check: Units with satisfaction rate < 85% or speed < 3.3
      services.forEach((s) => {
        if (s.satisfactionRate < 85 || s.speedScore < 3.3) {
          warningUnits.push({
            unitName: s.unitName,
            satisfactionRate: s.satisfactionRate,
            reason:
              s.satisfactionRate < 85
                ? `Kepuasan di bawah 85% (${s.satisfactionRate}%)`
                : `Skor kecepatan layanan rendah (${s.speedScore}/4.0)`,
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: services,
      summary: {
        totalUnits: totalCount,
        totalRespondents,
        institutionalSatisfactionRate: avgSatisfactionRate,
        institutionalAverageScore: avgScore,
        highestUnit: highestUnit
          ? { name: highestUnit.unitName, rate: highestUnit.satisfactionRate, score: highestUnit.averageScore }
          : null,
        lowestUnit: lowestUnit
          ? { name: lowestUnit.unitName, rate: lowestUnit.satisfactionRate, score: lowestUnit.averageScore }
          : null,
        warningUnits,
        lastSynced: services[0]?.syncedAt || new Date(),
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching EKA data:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch EKA data" },
      { status: 500 }
    );
  }
}
