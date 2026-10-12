import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import LedDraft from "@/models/LedDraft";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const drafts = await LedDraft.find().sort({ criterionNumber: 1 });
    return NextResponse.json({
      success: true,
      data: drafts,
      totalCount: drafts.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching LED drafts:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch LED drafts" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, contentMarkdown, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID draf wajib disertakan" },
        { status: 400 }
      );
    }

    const updateFields: Record<string, unknown> = {};
    if (contentMarkdown !== undefined) {
      updateFields.contentMarkdown = contentMarkdown;
      updateFields.wordCount = contentMarkdown.split(/\s+/).length;
    }
    if (status !== undefined) {
      updateFields.status = status;
    }

    const updated = await LedDraft.findByIdAndUpdate(id, updateFields, { new: true });

    return NextResponse.json({
      success: true,
      message: "Draf LED berhasil diperbarui",
      data: updated,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error updating LED draft:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update LED draft" },
      { status: 500 }
    );
  }
}
