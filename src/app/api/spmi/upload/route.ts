import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { SpmiVaultFile, SpmiVaultFolder } from '@/models/SpmiVaultFile';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'LPM' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya peran LPM atau Admin yang berwenang mengunggah dokumen SPMI.' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folderCategory = (formData.get('folderCategory') as SpmiVaultFolder) || '01_Kebijakan';
    const documentCode = ((formData.get('documentCode') as string) || 'SPMI-DOC').trim();
    const title = ((formData.get('title') as string) || file?.name || 'Dokumen SPMI').trim();
    const version = ((formData.get('version') as string) || '00').trim();
    const skNumber = (formData.get('skNumber') as string) || '';
    const statusDocument = (formData.get('statusDocument') as any) || 'TERKENDALI';
    const accessClass = (formData.get('accessClass') as any) || 'INTERNAL';
    const unitOwner = ((formData.get('unitOwner') as string) || 'LPM').trim();
    const description = (formData.get('description') as string) || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Berkas file wajib dilampirkan.' }, { status: 400 });
    }

    // Validasi ekstensi yang diizinkan (PDF, DOC, DOCX, XLS, XLSX)
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const originalExt = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(originalExt)) {
      return NextResponse.json(
        { success: false, error: `Format file ${originalExt} tidak didukung. Unggah berkas PDF, DOCX, atau XLSX.` },
        { status: 400 }
      );
    }

    // Maksimal 50 MB
    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file melebihi batas maksimal 50 MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Folder tujuan sesuai Lampiran 13 SPMI-PD/01
    const cleanCategory = folderCategory.replace(/[^a-zA-Z0-9_-]/g, '_');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'spmi', cleanCategory);
    await mkdir(uploadDir, { recursive: true });

    // Format Penamaan Berkas SPMI: [Kode]_[JudulSingkat]_Rev[xx]_[YYYYMMDD].[ext]
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const safeCode = documentCode.replace(/[^a-zA-Z0-9_-]/g, '-');
    const safeTitle = title.slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeRev = version.replace(/[^a-zA-Z0-9]/g, '');
    const cleanFileName = `${safeCode}_${safeTitle}_Rev${safeRev || '00'}_${dateStr}${originalExt}`;
    const fullPath = path.join(uploadDir, cleanFileName);

    await writeFile(fullPath, buffer);

    const fileUrl = `/uploads/spmi/${cleanCategory}/${cleanFileName}`;

    await connectToDatabase();
    const vaultDoc = await SpmiVaultFile.create({
      folderCategory,
      documentCode,
      title,
      version,
      skNumber,
      statusDocument,
      accessClass,
      unitOwner,
      fileUrl,
      fileName: cleanFileName,
      fileSize: file.size,
      fileType: file.type || originalExt,
      description,
      uploadedBy: session.user?.name || 'LPM STIMI YAPMI',
    });

    return NextResponse.json({
      success: true,
      message: 'Dokumen SPMI berhasil diunggah ke Repositori!',
      data: vaultDoc,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error uploading SPMI Vault file:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
