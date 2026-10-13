import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { AmiFinding } from '@/models/Ami';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body; // 'submit_rtl' | 'close_finding' | 'request_revision' | 'edit_finding'

    await connectToDatabase();
    const finding = await AmiFinding.findById(id);
    if (!finding) {
      return NextResponse.json({ success: false, error: 'Temuan audit tidak ditemukan.' }, { status: 404 });
    }

    const isLPM = session.user?.role === 'LPM';

    if (action === 'submit_rtl') {
      // Auditee submitting PTK & RTL with evidence
      const {
        rootCause,
        correctiveAction,
        preventiveAction,
        picName,
        dueDate,
        evidenceUrl,
        evidenceNotes,
      } = body;

      if (!rootCause || !correctiveAction) {
        return NextResponse.json(
          { success: false, error: 'Akar masalah dan tindakan koreksi wajib diisi.' },
          { status: 400 }
        );
      }

      finding.rootCause = rootCause;
      finding.correctiveAction = correctiveAction;
      finding.preventiveAction = preventiveAction;
      finding.picName = picName || finding.picName;
      if (dueDate) finding.dueDate = new Date(dueDate);
      if (evidenceUrl) finding.evidenceUrl = evidenceUrl;
      if (evidenceNotes) finding.evidenceNotes = evidenceNotes;

      // If evidence URL is provided, move to UNDER_REVIEW, else IN_PROGRESS
      finding.status = evidenceUrl ? 'UNDER_REVIEW' : 'IN_PROGRESS';
      await finding.save();

      return NextResponse.json({ success: true, data: finding });
    } else if (action === 'close_finding') {
      // Only LPM / Auditor can verify and close
      if (!isLPM) {
        return NextResponse.json(
          { success: false, error: 'Hanya LPM / Auditor yang dapat menutup temuan audit.' },
          { status: 403 }
        );
      }

      const { auditorFeedback } = body;
      finding.status = 'CLOSED';
      finding.closedAt = new Date();
      if (auditorFeedback) finding.auditorFeedback = auditorFeedback;
      await finding.save();

      return NextResponse.json({ success: true, data: finding });
    } else if (action === 'request_revision') {
      // LPM requests revision on the submitted evidence
      if (!isLPM) {
        return NextResponse.json(
          { success: false, error: 'Hanya LPM / Auditor yang dapat mengembalikan temuan.' },
          { status: 403 }
        );
      }

      const { auditorFeedback } = body;
      finding.status = 'IN_PROGRESS';
      finding.auditorFeedback = auditorFeedback || 'Bukti perbaikan belum mencukupi. Silakan lengkapi kembali.';
      await finding.save();

      return NextResponse.json({ success: true, data: finding });
    } else if (action === 'edit_finding' && isLPM) {
      // LPM directly updates finding details
      const { standardRef, category, description, dueDate, auditorName } = body;
      if (standardRef) finding.standardRef = standardRef;
      if (category) finding.category = category;
      if (description) finding.description = description;
      if (dueDate) finding.dueDate = new Date(dueDate);
      if (auditorName) finding.auditorName = auditorName;
      await finding.save();

      return NextResponse.json({ success: true, data: finding });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak valid.' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'LPM') {
      return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 403 });
    }

    await connectToDatabase();
    await AmiFinding.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Temuan audit berhasil dihapus.' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
