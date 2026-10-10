import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { seedIKUData } from "@/lib/seedIKU";
import User from "@/models/User";
import IKUMetadata from "@/models/IKUMetadata";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await seedIKUData();

    const userCount = await User.countDocuments();
    const ikuCount = await IKUMetadata.countDocuments();
    const users = await User.find({}, "name email role unitCode unitName assignedIKUCodes");

    return NextResponse.json({
      success: true,
      message: "Database seeded and synchronized successfully",
      stats: {
        users: userCount,
        ikus: ikuCount
      },
      accounts: users
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error running seed API:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
