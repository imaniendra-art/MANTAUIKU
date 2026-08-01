import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Profile from "@/models/Profile";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "LPM") {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  await connectDB();
  
  let profileRaw = await Profile.findOne().lean();
  let profile = null;
  
  if (profileRaw) {
    profile = {
      ...profileRaw,
      _id: profileRaw._id.toString()
    };
  }

  return <ProfileClient initialProfile={profile} />;
}
