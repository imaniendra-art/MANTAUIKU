import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { EmployerSurveyResponse } from "@/models/Evaluation";
import { getClientIp, checkRateLimit, createRateLimitExceededResponse } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const surveys = await EmployerSurveyResponse.find().sort({ createdAt: -1 });

    const totalCount = surveys.length;
    let avgScore = 0;
    let avgEthics = 0;
    let avgExpertise = 0;
    let avgEnglish = 0;
    let avgItSkill = 0;
    let avgCommunication = 0;
    let avgTeamwork = 0;
    let avgSelfDevelopment = 0;

    if (totalCount > 0) {
      const sum = surveys.reduce(
        (acc, item) => {
          acc.score += item.averageScore;
          acc.ethics += item.ethicsScore;
          acc.expertise += item.expertiseScore;
          acc.english += item.englishScore;
          acc.itSkill += item.itSkillScore;
          acc.communication += item.communicationScore;
          acc.teamwork += item.teamworkScore;
          acc.selfDevelopment += item.selfDevelopmentScore;
          return acc;
        },
        {
          score: 0,
          ethics: 0,
          expertise: 0,
          english: 0,
          itSkill: 0,
          communication: 0,
          teamwork: 0,
          selfDevelopment: 0,
        }
      );

      avgScore = Math.round((sum.score / totalCount) * 100) / 100;
      avgEthics = Math.round((sum.ethics / totalCount) * 100) / 100;
      avgExpertise = Math.round((sum.expertise / totalCount) * 100) / 100;
      avgEnglish = Math.round((sum.english / totalCount) * 100) / 100;
      avgItSkill = Math.round((sum.itSkill / totalCount) * 100) / 100;
      avgCommunication = Math.round((sum.communication / totalCount) * 100) / 100;
      avgTeamwork = Math.round((sum.teamwork / totalCount) * 100) / 100;
      avgSelfDevelopment = Math.round((sum.selfDevelopment / totalCount) * 100) / 100;
    }

    return NextResponse.json({
      success: true,
      data: surveys,
      summary: {
        totalEvaluations: totalCount,
        averageSatisfactionScore: avgScore,
        satisfactionRatePercent: Math.round((avgScore / 4.0) * 1000) / 10,
        competencies: {
          ethics: avgEthics,
          expertise: avgExpertise,
          english: avgEnglish,
          itSkill: avgItSkill,
          communication: avgCommunication,
          teamwork: avgTeamwork,
          selfDevelopment: avgSelfDevelopment,
        },
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching employer survey data:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch employer survey data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // 0. Rate limiting protection (Max 15 submissions per 10 minutes per client IP)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, "employer_survey_submit", 15, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return createRateLimitExceededResponse(
        rateLimit.retryAfterSeconds,
        `Terlalu banyak pengisian survei dari perangkat Anda. Silakan tunggu ${rateLimit.retryAfterSeconds} detik sebelum mengirimkan penilaian berikutnya.`
      );
    }

    await connectToDatabase();
    const body = await req.json();

    const {
      companyName,
      evaluatorName,
      evaluatorPosition,
      alumniName,
      ethicsScore = 4,
      expertiseScore = 4,
      englishScore = 3.5,
      itSkillScore = 4,
      communicationScore = 4,
      teamworkScore = 4,
      selfDevelopmentScore = 4,
      feedbackNotes,
    } = body;

    if (!companyName || !evaluatorName || !alumniName) {
      return NextResponse.json(
        { success: false, error: "Mohon lengkapi identitas perusahaan, penilai, dan nama alumni" },
        { status: 400 }
      );
    }

    const scores = [
      Number(ethicsScore),
      Number(expertiseScore),
      Number(englishScore),
      Number(itSkillScore),
      Number(communicationScore),
      Number(teamworkScore),
      Number(selfDevelopmentScore),
    ];
    const averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;

    const newSurvey = await EmployerSurveyResponse.create({
      companyName,
      evaluatorName,
      evaluatorPosition,
      alumniName,
      ethicsScore: Number(ethicsScore),
      expertiseScore: Number(expertiseScore),
      englishScore: Number(englishScore),
      itSkillScore: Number(itSkillScore),
      communicationScore: Number(communicationScore),
      teamworkScore: Number(teamworkScore),
      selfDevelopmentScore: Number(selfDevelopmentScore),
      averageScore,
      feedbackNotes,
    });

    return NextResponse.json({
      success: true,
      message: "Terima kasih atas penilaian dan masukan berharga Anda bagi peningkatan mutu lulusan STIMI YAPMI Makassar.",
      data: newSurvey,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error saving employer survey:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save employer survey" },
      { status: 500 }
    );
  }
}
