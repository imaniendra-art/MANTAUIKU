import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Profile from "@/models/Profile";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        Silakan masuk terlebih dahulu untuk mengakses profil Anda.
      </div>
    );
  }

  await connectDB();
  
  const profileRaw = await Profile.findOne().lean();
  let profile = null;
  
  if (profileRaw) {
    profile = {
      ...profileRaw,
      _id: profileRaw._id.toString()
    };
  }

  const currentUser = {
    id: session.user.id,
    name: session.user.name || "Pengguna",
    email: session.user.email || "",
    role: session.user.role || "UNIT_KERJA",
    unitCode: session.user.unitCode || "-",
    unitName: session.user.unitName || "-",
    assignedIKUCodes: session.user.assignedIKUCodes || [],
  };

  return (
    <ProfileClient 
      currentUser={currentUser} 
      initialProfile={profile} 
      isLPM={session.user.role === "LPM"} 
    />
  );
}
