import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { AmiPeriod } from '@/models/Ami';

export async function GET() {
  try {
    await connectToDatabase();
    const periods = await AmiPeriod.find().sort({ cycleNumber: -1 });
    return NextResponse.json({ success: true, data: periods });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'LPM') {
      return NextResponse.json({ success: false, error: 'Akses ditolak. Hanya LPM yang dapat menambah siklus AMI.' }, { status: 403 });
    }

    const body = await req.json();
    const { academicYear, cycleNumber, title, startDate, endDate, rtmDate } = body;

    if (!academicYear || !cycleNumber || !title || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Semua kolom wajib diisi.' }, { status: 400 });
    }

    await connectToDatabase();
    const newPeriod = await AmiPeriod.create({
      academicYear,
      cycleNumber,
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rtmDate: rtmDate ? new Date(rtmDate) : undefined,
      status: 'ACTIVE',
    });

    return NextResponse.json({ success: true, data: newPeriod });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
