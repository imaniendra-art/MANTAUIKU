import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { LamembaDl05 } from '@/models/Accreditation';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const academicYear = searchParams.get('academicYear') || '2025/2026';

    let dl05 = await LamembaDl05.findOne({ academicYear });
    if (!dl05) {
      dl05 = await LamembaDl05.findOne().sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data: dl05 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      academicYear,
      assessorFollowUps,
      renstraProgress,
      learningAssurance,
      facultySufficiency,
      tridharmaOutcomes,
      status,
    } = body;

    await connectToDatabase();
    let dl05 = await LamembaDl05.findOne({ academicYear: academicYear || '2025/2026' });

    if (dl05) {
      if (assessorFollowUps) dl05.assessorFollowUps = assessorFollowUps;
      if (renstraProgress) dl05.renstraProgress = renstraProgress;
      if (learningAssurance) dl05.learningAssurance = learningAssurance;
      if (facultySufficiency) dl05.facultySufficiency = facultySufficiency;
      if (tridharmaOutcomes) dl05.tridharmaOutcomes = tridharmaOutcomes;
      if (status) dl05.status = status;
      await dl05.save();
    } else {
      dl05 = await LamembaDl05.create({
        academicYear: academicYear || '2025/2026',
        prodiName: 'Program Studi S1 Manajemen',
        assessorFollowUps: assessorFollowUps || [],
        renstraProgress: renstraProgress || [],
        learningAssurance,
        facultySufficiency,
        tridharmaOutcomes,
        status: status || 'SUBMITTED',
      });
    }

    return NextResponse.json({ success: true, data: dl05 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
