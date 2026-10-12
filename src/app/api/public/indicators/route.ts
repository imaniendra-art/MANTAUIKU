import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import IKUMetadata from "@/models/IKUMetadata";
import Target from "@/models/Target";
import Achievement from "@/models/Achievement";

export const dynamic = "force-dynamic";

interface AchievementDoc {
  _id: { toString(): string };
  ikuId: string | { toString(): string };
  quarter: number;
  year: number;
  value?: number;
  status: string;
  documentUrl?: string;
  updatedAt?: Date;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || "2026");
    const quarterParam = searchParams.get("quarter");
    const activeQuarter = quarterParam ? parseInt(quarterParam) : 1;
    const filterCluster = searchParams.get("cluster");

    await connectToDatabase();

    // 1. Fetch all 12 IKUs
    const allIKUs = await IKUMetadata.find().sort({ code: 1 });
    allIKUs.sort((a, b) => {
      const numA = parseInt(a.code.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.code.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    const ikuIds = allIKUs.map((i) => i._id);

    // 2. Fetch targets for the selected year
    const targets = await Target.find({ ikuId: { $in: ikuIds }, year });
    const targetMap = new Map<string, { baseline: number; target: number }>();
    targets.forEach((t) => {
      targetMap.set(t.ikuId.toString(), {
        baseline: t.baseline || 0,
        target: t.target || 0,
      });
    });

    // 3. Fetch achievements for this year
    const achievementsRaw = await Achievement.find({
      ikuId: { $in: ikuIds },
      year,
    });

    const achievements = achievementsRaw as unknown as AchievementDoc[];
    const achMatrix = new Map<string, Map<number, AchievementDoc>>();
    achievements.forEach((a) => {
      const key = typeof a.ikuId === "object" && a.ikuId !== null ? a.ikuId.toString() : String(a.ikuId);
      if (!achMatrix.has(key)) {
        achMatrix.set(key, new Map());
      }
      achMatrix.get(key)!.set(a.quarter, a);
    });

    // 4. Map sanitized public indicators
    const indicators = allIKUs
      .map((iku) => {
        const key = iku._id.toString();
        const tgt = targetMap.get(key);
        const targetVal = tgt?.target || 0;
        const baselineVal = tgt?.baseline || 0;

        // Current quarter achievement
        const currentAch = achMatrix.get(key)?.get(activeQuarter);
        const realizedVal = typeof currentAch?.value === "number" ? currentAch.value : 0;
        const status = currentAch?.status || "Belum Diisi";

        let percentage = 0;
        if (targetVal > 0) {
          percentage = Math.min(Math.round((realizedVal / targetVal) * 100), 100);
        } else if (realizedVal > 0) {
          percentage = 100;
        }

        // Quarter details for 1..4
        const quartersData: Record<number, { value: number; status: string; percentage: number }> = {};
        for (let q = 1; q <= 4; q++) {
          const qAch = achMatrix.get(key)?.get(q);
          const qVal = typeof qAch?.value === "number" ? qAch.value : 0;
          let qPct = 0;
          if (targetVal > 0) {
            qPct = Math.min(Math.round((qVal / targetVal) * 100), 100);
          } else if (qVal > 0) {
            qPct = 100;
          }
          quartersData[q] = {
            value: qVal,
            status: qAch?.status || "Belum",
            percentage: qPct,
          };
        }

        let evaluationStatus = "Belum Ada Data";
        if (status === "Disetujui") {
          if (percentage >= 80) evaluationStatus = "Sesuai Target";
          else if (percentage >= 50) evaluationStatus = "On Track";
          else evaluationStatus = "Perlu Peningkatan";
        } else if (status === "pendingDiajukan") {
          evaluationStatus = "Proses Verifikasi LPM";
        }

        return {
          id: key,
          code: iku.code,
          name: iku.name,
          category: iku.category || "Umum",
          cluster: iku.cluster || "Tata Kelola & Finansial",
          unit: iku.unit,
          type: iku.type || "Wajib",
          baseline: baselineVal,
          target: targetVal,
          realized: realizedVal,
          percentage,
          status,
          evaluationStatus,
          documentUrl: currentAch?.documentUrl || "",
          quarters: quartersData,
        };
      })
      .filter((item) => {
        if (!filterCluster || filterCluster === "SEMUA") return true;
        return item.cluster.toLowerCase().includes(filterCluster.toLowerCase());
      });

    // Summary calculation
    const totalTarget = indicators.reduce((acc, i) => acc + i.target, 0);
    const totalRealized = indicators.reduce((acc, i) => acc + i.realized, 0);
    const avgPercentage =
      indicators.length > 0
        ? Math.round(indicators.reduce((acc, i) => acc + i.percentage, 0) / indicators.length)
        : 0;

    return NextResponse.json({
      success: true,
      year,
      activeQuarter,
      totalCount: indicators.length,
      averagePercentage: avgPercentage,
      totalTarget,
      totalRealized,
      indicators,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in GET /api/public/indicators:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
