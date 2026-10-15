import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { SpmiDocument } from '@/models/SpmiDocument';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const bookType = searchParams.get('bookType');

    let query = {};
    if (bookType) {
      query = { bookType };
    }

    const documents = await SpmiDocument.find(query).sort({ bookNumber: 1 });

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'LPM') {
      return NextResponse.json(
        { success: false, error: 'Hanya peran LPM yang memiliki otoritas memperbarui dokumen SPMI.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, title, skNumber, version, status, description, sections, standards, forms } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Dokumen SPMI wajib disertakan.' }, { status: 400 });
    }

    await connectToDatabase();
    const doc = await SpmiDocument.findById(id);
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Dokumen SPMI tidak ditemukan.' }, { status: 404 });
    }

    if (title) doc.title = title;
    if (skNumber) doc.skNumber = skNumber;
    if (version) doc.version = version;
    if (status) doc.status = status;
    if (description) doc.description = description;
    if (sections) doc.sections = sections;
    if (standards) doc.standards = standards;
    if (forms) doc.forms = forms;

    await doc.save();

    return NextResponse.json({
      success: true,
      data: doc,
      message: 'Dokumen SPMI berhasil diperbarui!',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'LPM') {
      return NextResponse.json(
        { success: false, error: 'Hanya peran LPM yang berwenang mengosongkan dokumen SPMI.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    await SpmiDocument.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'Seluruh dokumen SPMI berhasil dikosongkan dari pangkalan data.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

