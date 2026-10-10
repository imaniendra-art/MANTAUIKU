import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import Achievement from "@/models/Achievement";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "LPM") {
      return NextResponse.json({ error: "Hanya LPM yang dapat memvalidasi data" }, { status: 403 });
    }

    const { achievementId, status } = await req.json();

    if (!achievementId || !status) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    await connectToDatabase();

    const updated = await Achievement.findByIdAndUpdate(
      achievementId,
      { status },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in POST /api/achievements/validate:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
