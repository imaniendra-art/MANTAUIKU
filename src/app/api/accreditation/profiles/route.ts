import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { AccreditationProfile } from '@/models/Accreditation';

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Inisialisasi awal profil jika database masih kosong
    const totalCount = await AccreditationProfile.countDocuments();
    if (totalCount === 0) {
      await AccreditationProfile.insertMany([
        {
          entityType: 'INSTITUSI',
          name: 'STIMI YAPMI Makassar',
          degreeLevel: 'Perguruan Tinggi',
          agency: 'BAN-PT',
          grade: 'BAIK_SEKALI',
          skNumber: 'SK BAN-PT No. 488/SK/BAN-PT/Ak/PT/VIII/2023',
          validFrom: new Date('2023-08-15'),
          validUntil: new Date('2028-08-15'),
          certificateUrl: 'https://stimi.ac.id/dokumen/sertifikat-akreditasi-institusi-2023.pdf',
          skDocUrl: 'https://stimi.ac.id/dokumen/sk-akreditasi-institusi-banpt-2023.pdf',
          notes: 'Terakreditasi Baik Sekali oleh BAN-PT dengan masa berlaku hingga Agustus 2028.',
        },
        {
          entityType: 'PRODI',
          name: 'Program Studi S1 Manajemen',
          degreeLevel: 'Sarjana (S1)',
          agency: 'LAMEMBA',
          grade: 'BAIK_SEKALI',
          skNumber: 'SK LAMEMBA No. 128/DE/A.1/AR.8/VII/2023',
          validFrom: new Date('2023-07-20'),
          validUntil: new Date('2028-07-20'),
          certificateUrl: 'https://stimi.ac.id/dokumen/sertifikat-akreditasi-s1-manajemen-lamemba.pdf',
          skDocUrl: 'https://stimi.ac.id/dokumen/sk-akreditasi-s1-manajemen-lamemba-2023.pdf',
          notes: 'Terakreditasi Baik Sekali oleh Lembaga Akreditasi Mandiri Ekonomi Manajemen Bisnis dan Akuntansi (LAMEMBA).',
        },
        {
          entityType: 'PRODI',
          name: 'Program Studi S2 Magister Manajemen',
          degreeLevel: 'Pascasarjana (S2)',
          agency: 'LAMEMBA',
          grade: 'AKREDITASI_SEMENTARA',
          skNumber: 'SK Izin Operasional Kemendikbudristek No. 124/E/O/2023',
          validFrom: new Date('2024-01-01'),
          validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2),
          notes: 'Program Studi Pascasarjana (S2) Magister Manajemen STIMI YAPMI Makassar. Status akreditasi sementara dalam persiapan pengajuan instrumen akreditasi pertama.',
        },
      ]);
    } else {
      // 2. Pastikan card Prodi S2 Magister Manajemen dibuat jika belum ada
      const s2Exists = await AccreditationProfile.findOne({
        entityType: 'PRODI',
        $or: [
          { name: { $regex: /S2|Magister|Pascasarjana/i } },
          { degreeLevel: { $regex: /S2|Pascasarjana/i } },
        ],
      });

      if (!s2Exists) {
        await AccreditationProfile.create({
          entityType: 'PRODI',
          name: 'Program Studi S2 Magister Manajemen',
          degreeLevel: 'Pascasarjana (S2)',
          agency: 'LAMEMBA',
          grade: 'AKREDITASI_SEMENTARA',
          skNumber: 'SK Izin Operasional Kemendikbudristek No. 124/E/O/2023',
          validFrom: new Date('2024-01-01'),
          validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2),
          notes: 'Program Studi Pascasarjana (S2) Magister Manajemen STIMI YAPMI Makassar. Status akreditasi sementara dalam persiapan pengajuan instrumen akreditasi pertama.',
        });
      }
    }

    const profiles = await AccreditationProfile.find().sort({ entityType: 1, createdAt: 1 });

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
        { success: false, error: 'Akses ditolak. Hanya LPM yang dapat memperbarui data profil akreditasi.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, name, degreeLevel, agency, grade, skNumber, validFrom, validUntil, certificateUrl, skDocUrl, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID profil akreditasi wajib disertakan.' }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await AccreditationProfile.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(degreeLevel && { degreeLevel }),
        ...(agency && { agency }),
        grade,
        skNumber,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        certificateUrl,
        skDocUrl,
        notes,
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
