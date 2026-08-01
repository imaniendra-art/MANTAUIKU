"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Profile from "@/models/Profile";
import { revalidatePath } from "next/cache";

export async function saveProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "LPM") throw new Error("Unauthorized");

  await connectDB();

  const leaderName = formData.get("leaderName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const website = formData.get("website") as string;
  const province = formData.get("province") as string;
  const address = formData.get("address") as string;

  const profileData = { leaderName, email, phone, website, province, address };

  // Assume there is only one profile per university
  let profile = await Profile.findOne();
  if (profile) {
    profile = await Profile.findByIdAndUpdate(profile._id, profileData, { new: true });
  } else {
    profile = await Profile.create(profileData);
  }

  revalidatePath("/dashboard/profile");
  return JSON.parse(JSON.stringify(profile));
}
