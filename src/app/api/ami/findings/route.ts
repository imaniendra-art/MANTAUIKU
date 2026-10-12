import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { AmiFinding } from '@/models/Ami';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const periodId = searchParams.get('periodId');
    const auditeeKey = searchParams.get('auditeeKey');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};

    if (periodId) {
      query.periodId = periodId;
    }
    if (auditeeKey && auditeeKey !== 'all') {
      query.auditeeKey = auditeeKey;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { standardRef: { $regex: search, $options: 'i' } },
        { auditeeName: { $regex: search, $options: 'i' } },
        { rootCause: { $regex: search, $options: 'i' } },
      ];
    }

    const findings = await AmiFinding.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: findings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'LPM') {
      return NextResponse.json({ success: false, error: 'Hanya LPM yang dapat mencatat temuan audit baru.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      periodId,
      auditeeKey,
      auditeeName,
      standardRef,
      category,
      description,
      auditorName,
      dueDate,
    } = body;

    if (!periodId || !auditeeKey || !auditeeName || !standardRef || !category || !description) {
      return NextResponse.json({ success: false, error: 'Data temuan audit belum lengkap.' }, { status: 400 });
    }

    await connectToDatabase();
    const newFinding = await AmiFinding.create({
      periodId,
      auditeeKey,
      auditeeName,
      standardRef,
      category,
      description,
      auditorName: auditorName || 'Tim Auditor LPM',
      status: 'OPEN',
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return NextResponse.json({ success: true, data: newFinding });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
