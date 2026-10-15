import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { AccreditationEvidence } from '@/models/Accreditation';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

// GET: Ambil daftar seluruh dokumen bukti fisik digital yang terunggah
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get('targetType');
    const criterionCode = searchParams.get('criterionCode');

    const filter: Record<string, unknown> = {};
    if (targetType) filter.targetType = targetType;
    if (criterionCode) filter.criterionCode = criterionCode;

    const evidences = await AccreditationEvidence.find(filter).sort({ criterionCode: 1, itemKey: 1 }).lean();

    return NextResponse.json({
      success: true,
      data: evidences,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching accreditation evidence:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Unggah berkas bukti digital langsung per butir checklist kriteria
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Anda harus masuk ke sistem untuk mengunggah dokumen.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawTargetType = formData.get('targetType') as string | null;
    const targetType: 'PRODI' | 'INSTITUSI' = rawTargetType === 'INSTITUSI' ? 'INSTITUSI' : 'PRODI';
    const criterionCode = (formData.get('criterionCode') as string) || '';
    const itemKey = (formData.get('itemKey') as string) || '';
    const itemTitle = (formData.get('itemTitle') as string) || '';
    const evidenceDocName = (formData.get('evidenceDocName') as string) || '';
    const notes = (formData.get('notes') as string) || '';

    if (!file || !itemKey || !criterionCode) {
      return NextResponse.json(
        { success: false, error: 'File dan metadata butir checklist wajib diisi.' },
        { status: 400 }
      );
    }

    // Batas ukuran 30 MB
    const maxSizeBytes = 30 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file melebihi batas maksimal 30 MB.' },
        { status: 400 }
      );
    }

    // Validasi ekstensi yang diizinkan (PDF, DOCX, XLSX, ZIP)
    const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.xls', '.doc', '.zip', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { success: false, error: 'Format berkas tidak didukung. Mohon unggah berkas PDF, DOCX, atau XLSX.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'accreditation', 'evidence');
    await mkdir(uploadDir, { recursive: true });

    const cleanCriterion = criterionCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanItemKey = itemKey.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const timestamp = Date.now();
    const safeFileName = `${targetType.toLowerCase()}_${cleanCriterion}_${cleanItemKey}_${timestamp}${ext}`;
    const fullPath = path.join(uploadDir, safeFileName);

    await writeFile(fullPath, buffer);

    const fileUrl = `/uploads/accreditation/evidence/${safeFileName}`;

    await connectToDatabase();

    // Hapus file lama jika ada penggantian berkas
    const existing = await AccreditationEvidence.findOne({ targetType, itemKey });
    if (existing && existing.fileUrl) {
      try {
        const oldPath = path.join(process.cwd(), 'public', existing.fileUrl);
        await unlink(oldPath);
      } catch {
        // Abaikan jika berkas lama tidak ditemukan di disk
      }
    }

    // Simpan atau perbarui data bukti ke MongoDB
    const updatedEvidence = await AccreditationEvidence.findOneAndUpdate(
      { targetType, itemKey },
      {
        targetType,
        criterionCode,
        itemKey,
        itemTitle: itemTitle || existing?.itemTitle || 'Bukti Kriteria',
        evidenceDocName: evidenceDocName || existing?.evidenceDocName || file.name,
        fileUrl,
        fileName: safeFileName,
        originalName: file.name,
        fileSize: file.size,
        uploadedBy: session.user.name || session.user.email || 'Tim Penjaminan Mutu',
        notes,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: `Berkas ${file.name} berhasil diunggah untuk butir ${itemKey}!`,
      data: updatedEvidence,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error uploading accreditation evidence:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Hapus berkas bukti digital jika ingin direset
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const itemKey = searchParams.get('itemKey');
    const rawTargetType = searchParams.get('targetType');
    const targetType: 'PRODI' | 'INSTITUSI' = rawTargetType === 'INSTITUSI' ? 'INSTITUSI' : 'PRODI';

    await connectToDatabase();

    const query: Record<string, unknown> = id ? { _id: id } : { targetType, itemKey };
    const evidence = await AccreditationEvidence.findOne(query);

    if (!evidence) {
      return NextResponse.json({ success: false, error: 'Berkas bukti tidak ditemukan.' }, { status: 404 });
    }

    // Hapus berkas fisik jika ada
    if (evidence.fileUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', evidence.fileUrl);
        await unlink(filePath);
      } catch {
        // file might not exist, proceed
      }
    }

    await AccreditationEvidence.deleteOne({ _id: evidence._id });

    return NextResponse.json({
      success: true,
      message: 'Berkas bukti berhasil dihapus.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting accreditation evidence:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
