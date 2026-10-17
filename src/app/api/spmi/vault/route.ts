import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { SpmiVaultFile } from '@/models/SpmiVaultFile';
import { unlink } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const folderCategory = searchParams.get('folderCategory');
    const search = searchParams.get('search');
    const statusDocument = searchParams.get('statusDocument');

    const query: any = {};
    if (folderCategory && folderCategory !== 'ALL') {
      query.folderCategory = folderCategory;
    }
    if (statusDocument && statusDocument !== 'ALL') {
      query.statusDocument = statusDocument;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { documentCode: { $regex: search, $options: 'i' } },
        { unitOwner: { $regex: search, $options: 'i' } },
        { skNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const files = await SpmiVaultFile.find(query).sort({ createdAt: -1 });

    // Hitung ringkasan per folder kategori untuk lencana badge
    const counts = await SpmiVaultFile.aggregate([
      { $group: { _id: '$folderCategory', count: { $sum: 1 } } },
    ]);
    const folderCounts: Record<string, number> = {};
    counts.forEach((c) => {
      folderCounts[c._id] = c.count;
    });

    return NextResponse.json({
      success: true,
      data: files,
      folderCounts,
      total: files.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching SPMI Vault files:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'LPM' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya peran LPM atau Admin yang berwenang mengubah dokumen repositori.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, title, documentCode, version, skNumber, statusDocument, accessClass, unitOwner, description } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Dokumen Repositori wajib disertakan.' }, { status: 400 });
    }

    await connectToDatabase();
    const vaultDoc = await SpmiVaultFile.findById(id);
    if (!vaultDoc) {
      return NextResponse.json({ success: false, error: 'Dokumen repositori tidak ditemukan.' }, { status: 404 });
    }

    if (title) vaultDoc.title = title.trim();
    if (documentCode) vaultDoc.documentCode = documentCode.trim();
    if (version) vaultDoc.version = version.trim();
    if (skNumber !== undefined) vaultDoc.skNumber = skNumber.trim();
    if (statusDocument) vaultDoc.statusDocument = statusDocument;
    if (accessClass) vaultDoc.accessClass = accessClass;
    if (unitOwner) vaultDoc.unitOwner = unitOwner.trim();
    if (description !== undefined) vaultDoc.description = description.trim();

    await vaultDoc.save();

    return NextResponse.json({
      success: true,
      message: 'Metadata dokumen repositori berhasil diperbarui!',
      data: vaultDoc,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error updating SPMI Vault file:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'LPM' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya peran LPM atau Admin yang berwenang menghapus dokumen repositori.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID dokumen repositori wajib disertakan.' }, { status: 400 });
    }

    await connectToDatabase();
    const vaultDoc = await SpmiVaultFile.findById(id);
    if (!vaultDoc) {
      return NextResponse.json({ success: false, error: 'Dokumen repositori tidak ditemukan.' }, { status: 404 });
    }

    // Coba hapus file fisik jika ada di disk
    try {
      if (vaultDoc.fileUrl.startsWith('/uploads/spmi/')) {
        const filePath = path.join(process.cwd(), 'public', vaultDoc.fileUrl);
        await unlink(filePath).catch(() => {});
      }
    } catch {
      // Abaikan jika file fisik sudah tidak ada
    }

    await SpmiVaultFile.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Dokumen repositori berhasil dihapus secara permanen.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting SPMI Vault file:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
