import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'LPM') {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya LPM yang berwenang mengunggah sertifikat akreditasi.' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entityType') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File PDF wajib dilampirkan.' }, { status: 400 });
    }

    // Validasi tipe file
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung. Mohon unggah dokumen berformat PDF.' },
        { status: 400 }
      );
    }

    // Batas ukuran maksimal 25 MB
    const maxSizeBytes = 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file melebihi batas maksimal 25 MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
    await mkdir(uploadDir, { recursive: true });

    const safePrefix = entityType === 'PRODI' ? 'sertifikat-aps-lamemba' : 'sertifikat-apt-banpt';
    const timestamp = Date.now();
    const cleanFileName = `${safePrefix}-${timestamp}.pdf`;
    const fullPath = path.join(uploadDir, cleanFileName);

    await writeFile(fullPath, buffer);

    const fileUrl = `/uploads/certificates/${cleanFileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: cleanFileName,
      originalName: file.name,
      size: file.size,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error uploading accreditation certificate:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
