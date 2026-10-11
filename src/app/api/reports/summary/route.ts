import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import IKUMetadata from "@/models/IKUMetadata";
import Target from "@/models/Target";
import Achievement from "@/models/Achievement";
import Profile from "@/models/Profile";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || "2026");

    await connectToDatabase();

    // 1. Fetch Campus Profile
    const profile = await Profile.findOne();

    // 2. Fetch all 12 IKUs
    const allIKUs = await IKUMetadata.find().sort({ code: 1 });
    allIKUs.sort((a, b) => {
      const numA = parseInt(a.code.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.code.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    // 3. Fetch Targets for the year
    const targets = await Target.find({ year });
    const targetMap = new Map();
    targets.forEach((t) => targetMap.set(t.ikuId.toString(), t));

    // 4. Fetch all Achievements for all 4 quarters of this year
    const achievements = await Achievement.find({ year }).populate(
      "submittedBy",
      "name email unitCode unitName"
    );

    // Map achievements by ikuId and quarter
    const achMatrix = new Map<string, Map<number, any>>();
    achievements.forEach((a) => {
      const key = a.ikuId.toString();
      if (!achMatrix.has(key)) {
        achMatrix.set(key, new Map());
      }
      achMatrix.get(key)!.set(a.quarter, a);
    });

    // 5. Build Quarter Logs (TW 1, TW 2, TW 3, TW 4)
    const quarters = [1, 2, 3, 4].map((q) => {
      const qAchs = achievements.filter((a) => a.quarter === q);
      const reportedCount = qAchs.filter((a) => a.value !== null && a.value !== undefined).length;
      const approvedCount = qAchs.filter((a) => a.status === "Disetujui").length;
      const pendingCount = qAchs.filter((a) => a.status === "pendingDiajukan").length;

      // Calculate average achievement score for this quarter
      let totalPct = 0;
      let validCount = 0;
      allIKUs.forEach((iku) => {
        const tgt = targetMap.get(iku._id.toString())?.target || 0;
        const ach = achMatrix.get(iku._id.toString())?.get(q);
        if (tgt > 0 && ach) {
          totalPct += Math.min(100, Math.round((ach.value / tgt) * 100));
          validCount++;
        }
      });
      const avgScore = validCount > 0 ? Math.round(totalPct / validCount) : 0;

      let status = "Belum Dimulai";
      let statusBadge = "bg-slate-100 text-slate-600 border-slate-200";
      if (approvedCount >= 10) {
        status = "Tervalidasi";
        statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
      } else if (reportedCount > 0) {
        status = pendingCount > 0 ? "Perlu Validasi" : "Proses Input";
        statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
      }

      const quarterMonths = [
        "Januari - Maret",
        "April - Juni",
        "Juli - September",
        "Oktober - Desember",
      ];

      return {
        quarter: q,
        name: `Triwulan 0${q} (TW ${q})`,
        period: quarterMonths[q - 1],
        reportedCount,
        approvedCount,
        pendingCount,
        totalIKU: allIKUs.length,
        averageScore: avgScore,
        status,
        statusBadge,
      };
    });

    // 6. Build Multi-Quarter Comparison Table (12 IKUs across all 4 quarters)
    const comparisonTable = allIKUs.map((iku) => {
      const tgt = targetMap.get(iku._id.toString());
      const targetVal = tgt ? tgt.target : 0;
      const baselineVal = tgt ? tgt.baseline : 0;

      const qValues: Record<number, { value: number; status: string; pct: number }> = {};
      for (let q = 1; q <= 4; q++) {
        const ach = achMatrix.get(iku._id.toString())?.get(q);
        const val = ach ? ach.value : 0;
        let pct = 0;
        if (targetVal > 0) {
          pct = Math.round((val / targetVal) * 100);
        } else if (val > 0) {
          pct = 100;
        }
        qValues[q] = {
          value: val,
          status: ach ? ach.status : "Belum",
          pct,
        };
      }

      return {
        id: iku._id.toString(),
        code: iku.code,
        name: iku.name,
        cluster: iku.cluster || "Umum",
        unit: iku.unit,
        baseline: baselineVal,
        target: targetVal,
        q1: qValues[1],
        q2: qValues[2],
        q3: qValues[3],
        q4: qValues[4],
      };
    });

    return NextResponse.json({
      success: true,
      year,
      profile: profile || {
        leaderName: "Dr. H. Rahman, M.M.",
        email: "info@stimi-yapmi.ac.id",
        phone: "(0411) 852123",
        address: "Jl. Perintis Kemerdekaan KM. 9, Tamalanrea, Makassar",
      },
      quarters,
      comparisonTable,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in GET /api/reports/summary:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
