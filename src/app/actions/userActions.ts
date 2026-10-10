"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createUserAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "LPM") throw new Error("Unauthorized");

  await connectDB();

  const name = formData.get("name") as string;
  const email = (formData.get("email") as string).toLowerCase().trim();
  const unitName = formData.get("unitName") as string;
  const unitCode = (formData.get("unitCode") as string) || "UNIT";
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "UNIT_KERJA";
  const assignedIKUCodesRaw = formData.get("assignedIKUCodes") as string;
  const assignedIKUCodes = assignedIKUCodesRaw ? assignedIKUCodesRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email sudah terdaftar");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role === "PIMPINAN" ? "PIMPINAN" : "UNIT_KERJA",
    unitCode,
    unitName,
    assignedIKUCodes,
    phone
  });

  revalidatePath("/dashboard/users");
  return JSON.parse(JSON.stringify(newUser));
}

export async function deleteUserAction(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "LPM") throw new Error("Unauthorized");

  await connectDB();
  await User.findByIdAndDelete(id);

  revalidatePath("/dashboard/users");
  return true;
}
