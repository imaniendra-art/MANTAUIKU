import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { LamembaCriteria } from '@/models/Accreditation';

export async function GET() {
  try {
    await connectToDatabase();
    const criteria = await LamembaCriteria.find().sort({ code: 1 });

    // Calculate weighted total score
    let totalScore = 0;
    let totalWeight = 0;

    criteria.forEach((c) => {
      totalScore += (c.score * c.weight) / 100;
      totalWeight += c.weight;
    });

    const finalWeightedScore = Number(totalScore.toFixed(1));

    // Determine simulation threshold based on LAMEMBA standards:
    // Unggul: >= 85
    // Baik Sekali: 70 - 84.9
    // Baik: 55 - 69.9
    let predictedGrade = 'BAIK';
    if (finalWeightedScore >= 85) {
      predictedGrade = 'UNGGUL';
    } else if (finalWeightedScore >= 70) {
      predictedGrade = 'BAIK_SEKALI';
    }

    return NextResponse.json({
      success: true,
      data: {
        criteria,
        finalWeightedScore,
        totalWeight,
        predictedGrade,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'LPM') {
      return NextResponse.json(
        { success: false, error: 'Hanya LPM yang dapat memperbarui evaluasi kriteria akreditasi.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, score, description, strengths, recommendations } = body;

    if (!id || score === undefined) {
      return NextResponse.json({ success: false, error: 'Data kriteria tidak lengkap.' }, { status: 400 });
    }

    await connectToDatabase();
    const criteria = await LamembaCriteria.findById(id);
    if (!criteria) {
      return NextResponse.json({ success: false, error: 'Kriteria tidak ditemukan.' }, { status: 404 });
    }

    criteria.score = score;
    if (score >= 85) criteria.status = 'UNGGUL';
    else if (score >= 70) criteria.status = 'BAIK_SEKALI';
    else if (score >= 55) criteria.status = 'BAIK';
    else criteria.status = 'PERLU_PERBAIKAN';

    if (description) criteria.description = description;
    if (strengths) criteria.strengths = strengths;
    if (recommendations) criteria.recommendations = recommendations;

    await criteria.save();

    return NextResponse.json({ success: true, data: criteria });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
