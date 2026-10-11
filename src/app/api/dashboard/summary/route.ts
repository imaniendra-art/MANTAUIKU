import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import IKUMetadata from "@/models/IKUMetadata";
import Target from "@/models/Target";
import Achievement from "@/models/Achievement";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || "2026");
    const quarter = parseInt(searchParams.get("quarter") || "1");

    await connectToDatabase();

    // 1. Fetch all 12 IKUs
    const allIKUs = await IKUMetadata.find().sort({ code: 1 });
    const ikuIds = allIKUs.map((i) => i._id);

    // 2. Fetch all Targets for the year
    const targets = await Target.find({ ikuId: { $in: ikuIds }, year });
    const targetMap = new Map<string, { baseline: number; target: number }>();
    targets.forEach((t) => {
      targetMap.set(t.ikuId.toString(), {
        baseline: t.baseline || 0,
        target: t.target || 0,
      });
    });

    // 3. Fetch Achievements for the year and quarter
    const achievements = await Achievement.find({
      ikuId: { $in: ikuIds },
      year,
      quarter,
    }).populate("submittedBy", "name email unitCode unitName");

    const achievementMap = new Map<string, any>();
    achievements.forEach((a) => {
      achievementMap.set(a.ikuId.toString(), a);
    });

    // 4. Calculate Stats
    const totalIKU = allIKUs.length;
    const reportedCount = achievements.filter((a) => a.value !== undefined && a.value !== null).length;
    const pendingCount = achievements.filter((a) => a.status === "pendingDiajukan").length;
    const approvedCount = achievements.filter((a) => a.status === "Disetujui").length;

    // 5. Build Chart Data (12 IKUs with Target vs Realized)
    const chartData = allIKUs.map((iku) => {
      const tgt = targetMap.get(iku._id.toString())?.target || 0;
      const base = targetMap.get(iku._id.toString())?.baseline || 0;
      const ach = achievementMap.get(iku._id.toString());
      const value = ach ? ach.value : 0;
      const status = ach ? ach.status : "Belum";

      let percentage = 0;
      if (tgt > 0) {
        percentage = Math.min(100, Math.round((value / tgt) * 100));
      } else if (value > 0) {
        percentage = 100;
      }

      return {
        id: iku._id.toString(),
        code: iku.code,
        name: iku.name,
        cluster: iku.cluster || "Umum",
        unit: iku.unit,
        type: iku.type,
        baseline: base,
        target: tgt,
        realized: value,
        percentage,
        status,
        documentUrl: ach?.documentUrl || "",
        updatedAt: ach?.updatedAt || null,
      };
    });

    // Sort numerically by IKU code
    chartData.sort((a, b) => {
      const numA = parseInt(a.code.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.code.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    // 6. Calculate Clusters Progress
    const clusterDefinitions = [
      {
        id: "talenta",
        title: "Klaster 1: Talenta & Mahasiswa",
        ikurange: "IKU 1, IKU 2, IKU 3",
        pic: "WK III (Kemahasiswaan & Alumni)",
        codes: ["IKU 1", "IKU 2", "IKU 3"],
      },
      {
        id: "inovasi",
        title: "Klaster 2: Inovasi & Riset",
        ikurange: "IKU 4, IKU 5, IKU 6",
        pic: "WK I & WK II (Kerjasama)",
        codes: ["IKU 4", "IKU 5", "IKU 6"],
      },
      {
        id: "tatakelola",
        title: "Klaster 3: Tata Kelola & Finansial",
        ikurange: "IKU 7 - IKU 12",
        pic: "Tim Tata Pamong & Keuangan",
        codes: ["IKU 7", "IKU 8", "IKU 9", "IKU 10", "IKU 11", "IKU 12"],
      },
    ];

    const clusters = clusterDefinitions.map((c) => {
      const matchedItems = chartData.filter((item) => c.codes.includes(item.code));
      const totalItems = matchedItems.length;
      const totalProgress = matchedItems.reduce((acc, curr) => acc + curr.percentage, 0);
      const avgProgress = totalItems > 0 ? Math.round(totalProgress / totalItems) : 0;

      let statusBadge = "Belum Ada Data";
      if (avgProgress >= 80) statusBadge = "Sesuai Target";
      else if (avgProgress >= 50) statusBadge = "On Track";
      else if (matchedItems.some((m) => m.status === "pendingDiajukan")) statusBadge = "Perlu Validasi";
      else if (avgProgress > 0) statusBadge = "Dalam Proses";

      return {
        id: c.id,
        title: c.title,
        ikurange: c.ikurange,
        pic: c.pic,
        progress: avgProgress,
        status: statusBadge,
        items: matchedItems.map((m) => ({
          code: m.code,
          name: m.name,
          realized: m.realized,
          target: m.target,
          unit: m.unit,
          status: m.status,
        })),
      };
    });

    // 7. Recent Activities across the system
    const recentActivitiesRaw = await Achievement.find({ year })
      .sort({ updatedAt: -1 })
      .limit(6)
      .populate("ikuId", "code name cluster unit")
      .populate("submittedBy", "name email unitCode unitName");

    const recentActivities = recentActivitiesRaw.map((act: any) => ({
      _id: act._id.toString(),
      ikuCode: act.ikuId?.code || "IKU",
      ikuName: act.ikuId?.name || "Indikator",
      unit: act.submittedBy?.unitName || act.submittedBy?.unitCode || "Unit Kerja",
      status: act.status,
      quarter: act.quarter,
      value: act.value,
      unitMeasurement: act.ikuId?.unit || "",
      updatedAt: act.updatedAt,
    }));

    // Overall Institutional Average Score
    const totalPossiblePoints = chartData.length * 100;
    const totalAchievedPoints = chartData.reduce((acc, curr) => acc + curr.percentage, 0);
    const overallAverage = totalPossiblePoints > 0 ? Math.round((totalAchievedPoints / totalPossiblePoints) * 100) : 0;

    return NextResponse.json({
      success: true,
      year,
      quarter,
      stats: {
        totalIKU,
        reportedCount,
        pendingCount,
        approvedCount,
        overallAverage,
      },
      clusters,
      chartData,
      recentActivities,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in GET /api/dashboard/summary:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
