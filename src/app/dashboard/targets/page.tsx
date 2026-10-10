import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Target from "@/models/Target";
import IKUMetadata from "@/models/IKUMetadata";
import { seedIKUData } from "@/lib/seedIKU";
import TargetsClient from "./TargetsClient";

export const dynamic = "force-dynamic";

export default async function TargetsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "LPM";

  await connectDB();
  
  // Ensure DB is seeded
  await seedIKUData();

  // Fetch targets for current year
  const currentYear = new Date().getFullYear();
  const targetsRaw = await Target.find({ year: currentYear })
    .populate({ path: 'ikuId', model: IKUMetadata })
    .lean();

  interface PopulatedTarget {
    _id: { toString(): string };
    year: number;
    baseline: number;
    target: number;
    status?: string;
    justificationNarrative?: string;
    ikuId: {
      _id: { toString(): string };
      code: string;
      name: string;
      unit: string;
    };
  }

  // Map to clean JSON-serializable array and sort by IKU code
  const targets = (targetsRaw as unknown as PopulatedTarget[])
    .map((t) => ({
      ...t,
      _id: t._id.toString(),
      ikuId: t.ikuId._id.toString(),
      iku: {
        ...t.ikuId,
        _id: t.ikuId._id.toString()
      }
    }))
    .sort((a, b) => {
      // Sort "IKU 1", "IKU 2" correctly (numerical sort)
      const numA = parseInt(a.iku.code.replace(/\D/g, ""));
      const numB = parseInt(b.iku.code.replace(/\D/g, ""));
      return numA - numB;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Target IKU</h2>
          <p className="text-gray-500 mt-1">Tetapkan baseline dan target capaian untuk tahun {currentYear}.</p>
        </div>
      </div>

      <TargetsClient initialTargets={targets} isAdmin={isAdmin} />
    </div>
  );
}
