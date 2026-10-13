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

export async function changePasswordAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Anda harus login terlebih dahulu.");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("Semua kolom kata sandi wajib diisi");
  }

  if (newPassword.length < 6) {
    throw new Error("Kata sandi baru minimal 6 karakter");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Konfirmasi kata sandi baru tidak cocok");
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) throw new Error("Pengguna tidak ditemukan");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Kata sandi lama yang Anda masukkan salah.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return { success: true, message: "Kata sandi Anda berhasil diperbarui!" };
}

export async function resetUserPasswordAction(userId: string, newPasswordRaw?: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "LPM") throw new Error("Hanya LPM yang dapat mereset kata sandi akun lain");

  const passwordToSet = newPasswordRaw || "password123";
  if (passwordToSet.length < 6) throw new Error("Kata sandi minimal 6 karakter");

  await connectDB();

  const user = await User.findById(userId);
  if (!user) throw new Error("Pengguna tidak ditemukan");

  const hashedPassword = await bcrypt.hash(passwordToSet, 10);
  user.password = hashedPassword;
  await user.save();

  revalidatePath("/dashboard/users");
  return { success: true, message: `Kata sandi untuk ${user.name} berhasil direset!` };
}
