import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import IKUMetadata from "@/models/IKUMetadata";
import Target from "@/models/Target";
import Achievement from "@/models/Achievement";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const quarter = parseInt(searchParams.get("quarter") || "1");

    await connectToDatabase();

    // Query all or assigned IKUs
    const ikuFilter: Record<string, unknown> = {};
    if (session.user.role === "UNIT_KERJA" && session.user.assignedIKUCodes && session.user.assignedIKUCodes.length > 0) {
      ikuFilter.code = { $in: session.user.assignedIKUCodes };
    }

    const ikuList = await IKUMetadata.find(ikuFilter).sort({ code: 1 });
    const ikuIds = ikuList.map((i) => i._id);

    // Fetch Targets for the year
    const targets = await Target.find({ ikuId: { $in: ikuIds }, year });
    const targetMap = new Map();
    targets.forEach((t) => targetMap.set(t.ikuId.toString(), t));

    // Fetch Achievements for the year and quarter
    const achievements = await Achievement.find({
      ikuId: { $in: ikuIds },
      year,
      quarter,
    }).populate("submittedBy", "name email unitCode unitName");

    const achievementMap = new Map();
    achievements.forEach((a) => achievementMap.set(a.ikuId.toString(), a));

    // Combine data
    const results = ikuList.map((iku) => {
      const targetObj = targetMap.get(iku._id.toString());
      const achObj = achievementMap.get(iku._id.toString());

      return {
        _id: iku._id,
        code: iku.code,
        name: iku.name,
        category: iku.category,
        cluster: iku.cluster || "Umum",
        unit: iku.unit,
        type: iku.type,
        formula: iku.formula || "(Pembilang / Penyebut) × 100%",
        numeratorLabel: iku.numeratorLabel || "Pembilang Capaian",
        denominatorLabel: iku.denominatorLabel || "Penyebut Basis",
        calculationMethod: iku.calculationMethod || "PERCENTAGE",
        target: targetObj ? targetObj.target : 0,
        baseline: targetObj ? targetObj.baseline : 0,
        achievement: achObj
          ? {
              _id: achObj._id,
              value: achObj.value,
              numerator: achObj.numerator !== undefined && achObj.numerator !== null ? achObj.numerator : null,
              denominator: achObj.denominator !== undefined && achObj.denominator !== null ? achObj.denominator : null,
              formula: achObj.formula || iku.formula || "(Pembilang / Penyebut) × 100%",
              numeratorLabel: achObj.numeratorLabel || iku.numeratorLabel || "Pembilang Capaian",
              denominatorLabel: achObj.denominatorLabel || iku.denominatorLabel || "Penyebut Basis",
              documentUrl: achObj.documentUrl,
              status: achObj.status,
              submittedBy: achObj.submittedBy,
              updatedAt: achObj.updatedAt,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      year,
      quarter,
      userRole: session.user.role,
      unitCode: session.user.unitCode,
      data: results,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in GET /api/achievements:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      ikuId, 
      year, 
      quarter, 
      value, 
      numerator, 
      denominator, 
      formula,
      numeratorLabel,
      denominatorLabel,
      documentUrl, 
      status 
    } = body;

    if (!ikuId || !year || !quarter) {
      return NextResponse.json({ error: "Parameter wajib tidak lengkap" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user has permission for this IKU
    if (session.user.role === "UNIT_KERJA") {
      const ikuDoc = await IKUMetadata.findById(ikuId);
      if (!ikuDoc || !session.user.assignedIKUCodes?.includes(ikuDoc.code)) {
        return NextResponse.json(
          { error: "Anda tidak memiliki wewenang untuk IKU ini" },
          { status: 403 }
        );
      }
    }

    // Upsert Achievement
    const updated = await Achievement.findOneAndUpdate(
      { ikuId, year, quarter },
      {
        value: Number(value),
        numerator: numerator !== undefined && numerator !== null ? Number(numerator) : undefined,
        denominator: denominator !== undefined && denominator !== null ? Number(denominator) : undefined,
        formula: formula || undefined,
        numeratorLabel: numeratorLabel || undefined,
        denominatorLabel: denominatorLabel || undefined,
        documentUrl: documentUrl || "",
        status: status || "pendingDiajukan",
        submittedBy: session.user.id,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in POST /api/achievements:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
