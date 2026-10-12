import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { AmiPeriod, AmiFinding } from '@/models/Ami';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const periodId = searchParams.get('periodId');

    let activePeriod = null;
    if (periodId) {
      activePeriod = await AmiPeriod.findById(periodId);
    } else {
      activePeriod = await AmiPeriod.findOne({ status: { $in: ['ACTIVE', 'IN_REVIEW'] } }).sort({ cycleNumber: -1 });
      if (!activePeriod) {
        activePeriod = await AmiPeriod.findOne().sort({ cycleNumber: -1 });
      }
    }

    if (!activePeriod) {
      return NextResponse.json({
        success: true,
        data: {
          period: null,
          totalFindings: 0,
          categories: { mayor: 0, minor: 0, ob: 0 },
          statuses: { open: 0, inProgress: 0, underReview: 0, closed: 0 },
          closingRate: 0,
          byAuditee: [],
        },
      });
    }

    const findings = await AmiFinding.find({ periodId: activePeriod._id });

    const total = findings.length;
    let mayor = 0;
    let minor = 0;
    let ob = 0;
    let open = 0;
    let inProgress = 0;
    let underReview = 0;
    let closed = 0;

    const auditeeMap: Record<string, { auditeeKey: string; auditeeName: string; total: number; closed: number }> = {};

    findings.forEach((f) => {
      // Category count
      if (f.category === 'KTS_MAYOR') mayor++;
      else if (f.category === 'KTS_MINOR') minor++;
      else if (f.category === 'OB') ob++;

      // Status count
      if (f.status === 'OPEN') open++;
      else if (f.status === 'IN_PROGRESS') inProgress++;
      else if (f.status === 'UNDER_REVIEW') underReview++;
      else if (f.status === 'CLOSED') closed++;

      // Auditee breakdown
      if (!auditeeMap[f.auditeeKey]) {
        auditeeMap[f.auditeeKey] = {
          auditeeKey: f.auditeeKey,
          auditeeName: f.auditeeName,
          total: 0,
          closed: 0,
        };
      }
      auditeeMap[f.auditeeKey].total++;
      if (f.status === 'CLOSED') {
        auditeeMap[f.auditeeKey].closed++;
      }
    });

    const closingRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        period: activePeriod,
        totalFindings: total,
        categories: { mayor, minor, ob },
        statuses: { open, inProgress, underReview, closed },
        closingRate,
        byAuditee: Object.values(auditeeMap),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
