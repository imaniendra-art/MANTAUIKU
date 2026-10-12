import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { AccreditationProfile } from '@/models/Accreditation';

export async function GET() {
  try {
    await connectToDatabase();
    const profiles = await AccreditationProfile.find().sort({ entityType: 1 });

    const now = new Date();

    // Map profiles with PEPA warning countdown calculations
    const enriched = profiles.map((p) => {
      const validUntil = new Date(p.validUntil);
      const diffTime = validUntil.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const monthsRemaining = Math.round(daysRemaining / 30);

      let pepaStatus: 'AMAN' | 'WASPADA' | 'KRITIS' = 'AMAN';
      if (daysRemaining <= 180) {
        pepaStatus = 'KRITIS'; // < 6 bulan (Wajib penyerahan instrumen reakreditasi)
      } else if (daysRemaining <= 365) {
        pepaStatus = 'WASPADA'; // < 12 bulan (Persiapan borang & pembentukan tim taskforce)
      }

      return {
        ...p.toObject(),
        daysRemaining: Math.max(0, daysRemaining),
        monthsRemaining: Math.max(0, monthsRemaining),
        pepaStatus,
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'LPM') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya LPM yang dapat memperbarui data profil akreditasi.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, grade, skNumber, validFrom, validUntil, certificateUrl, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID profil akreditasi wajib disertakan.' }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await AccreditationProfile.findByIdAndUpdate(
      id,
      {
        grade,
        skNumber,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        certificateUrl,
        notes,
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
