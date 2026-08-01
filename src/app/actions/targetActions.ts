"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Target from "@/models/Target";
import { revalidatePath } from "next/cache";

export async function updateTargetAction(id: string, baseline: number, target: number) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "LPM") {
    throw new Error("Unauthorized");
  }

  await connectDB();

  const updatedTarget = await Target.findByIdAndUpdate(
    id,
    { baseline, target },
    { new: true }
  );

  if (!updatedTarget) {
    throw new Error("Target not found");
  }

  revalidatePath("/dashboard/targets");
  return JSON.parse(JSON.stringify(updatedTarget));
}

export async function lockTargetAction(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "LPM") throw new Error("Unauthorized");

  await connectDB();
  const updated = await Target.findByIdAndUpdate(id, { status: "Dikunci" }, { new: true });
  
  revalidatePath("/dashboard/targets");
  return JSON.parse(JSON.stringify(updated));
}

export async function updateJustificationAction(id: string, narrative: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  await connectDB();
  // Here Unit Kerja can upload justification.
  const updated = await Target.findByIdAndUpdate(id, { justificationNarrative: narrative }, { new: true });
  
  revalidatePath("/dashboard/targets");
  return JSON.parse(JSON.stringify(updated));
}
