import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import User from "@/models/User";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "LPM") {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  await connectDB();
  
  const usersRaw = await User.find({}).sort({ role: 1, name: 1 }).lean();
  const users = usersRaw.map((u: any) => ({
    ...u,
    _id: u._id.toString(),
    // Exclude password
    password: undefined,
  }));

  return <UsersClient initialUsers={users} />;
}
