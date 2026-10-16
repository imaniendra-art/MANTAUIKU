import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import {
  AccreditationProfile,
  LamembaCriteria,
  LamembaDl05,
} from '@/models/Accreditation';

export async function GET() {
  try {
    await connectToDatabase();

    const [profiles, criteria, dl05] = await Promise.all([
      AccreditationProfile.find().sort({ entityType: 1 }),
      LamembaCriteria.find().sort({ code: 1 }),
      LamembaDl05.findOne().sort({ createdAt: -1 }),
    ]);

    const now = new Date();

    const formattedProfiles = profiles.map((p) => {
      const validUntil = new Date(p.validUntil);
      const diffTime = validUntil.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const monthsRemaining = Math.max(0, Math.round(daysRemaining / 30));

      return {
        id: p._id,
        entityType: p.entityType,
        name: p.name,
        degreeLevel: p.degreeLevel,
        agency: p.agency,
        grade: p.grade,
        skNumber: p.skNumber,
        validUntil: p.validUntil,
        daysRemaining,
        monthsRemaining,
        certificateUrl: p.certificateUrl,
        skDocUrl: p.skDocUrl,
        notes: p.notes,
      };
    });

    let totalWeighted = 0;
    criteria.forEach((c) => {
      totalWeighted += (c.score * c.weight) / 100;
    });

    return NextResponse.json({
      success: true,
      data: {
        profiles: formattedProfiles,
        overallScore: Number(totalWeighted.toFixed(1)),
        criteriaCount: criteria.length,
        criteriaList: criteria.map((c) => ({
          code: c.code,
          name: c.name,
          score: c.score,
          status: c.status,
          weight: c.weight,
        })),
        dl05Summary: dl05
          ? {
              academicYear: dl05.academicYear,
              cplAchievement: dl05.learningAssurance?.cplAchievementPercentage || 88,
              resolvedRecommendationsCount: dl05.assessorFollowUps.filter(
                (f) => f.status === 'SELESAI'
              ).length,
              totalRecommendationsCount: dl05.assessorFollowUps.length,
              status: dl05.status,
            }
          : null,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
