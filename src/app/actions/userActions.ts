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
  const email = formData.get("email") as string;
  const unitName = formData.get("unitName") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "Unit Kerja",
    unitName,
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
