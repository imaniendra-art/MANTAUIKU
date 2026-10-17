import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import { SpmiDocument, ISpmiStandardItem } from '@/models/SpmiDocument';
import {
  STANDARD_KEBIJAKAN_21_BAB,
  STANDARD_KEBIJAKAN_LAMPIRAN,
  DEFAULT_LEMBAR_PENGESAHAN,
  DEFAULT_RIWAYAT_PERUBAHAN,
  DEFAULT_KATA_PENGANTAR,
  STANDARD_MANUAL_16_BAB,
  STANDARD_MANUAL_15_LAMPIRAN,
  DEFAULT_LEMBAR_PENGESAHAN_MANUAL,
  DEFAULT_RIWAYAT_PERUBAHAN_MANUAL,
  DEFAULT_KATA_PENGANTAR_MANUAL,
  STANDARD_STANDAR_PRELIMINARY_BABS,
  DEFAULT_LEMBAR_PENGESAHAN_STANDAR,
  DEFAULT_RIWAYAT_PERUBAHAN_STANDAR,
  DEFAULT_KATA_PENGANTAR_STANDAR,
  STANDARD_BAKU_18_STANDARDS,
} from '@/lib/spmi-constants';

export const dynamic = 'force-dynamic';

async function syncKebijakanDoc(doc: any) {
  let changed = false;
  if (!doc.sections || doc.sections.length < 21) {
    const existingMap = new Map();
    (doc.sections || []).forEach((sec: any) => {
      existingMap.set(sec.order, sec);
    });
    const newSections = STANDARD_KEBIJAKAN_21_BAB.map((bab) => {
      if (existingMap.has(bab.order)) {
        const existing = existingMap.get(bab.order);
        return {
          order: bab.order,
          title: existing.title || bab.title,
          content: existing.content || '',
        };
      }
      return {
        order: bab.order,
        title: bab.title,
        content: '',
      };
    });
    doc.sections = newSections;
    changed = true;
  }
  if (!doc.lembarPengesahan || !doc.lembarPengesahan.disusun) {
    doc.lembarPengesahan = DEFAULT_LEMBAR_PENGESAHAN;
    changed = true;
  }
  if (!doc.riwayatPerubahan || doc.riwayatPerubahan.length === 0) {
    doc.riwayatPerubahan = DEFAULT_RIWAYAT_PERUBAHAN;
    changed = true;
  }
  if (!doc.kataPengantar) {
    doc.kataPengantar = DEFAULT_KATA_PENGANTAR;
    changed = true;
  }
  if (!doc.lampiran || doc.lampiran.length === 0) {
    doc.lampiran = STANDARD_KEBIJAKAN_LAMPIRAN;
    changed = true;
  }
  if (changed) {
    await doc.save();
  }
  return doc;
}

async function syncManualDoc(doc: any) {
  let changed = false;
  if (!doc.sections || doc.sections.length < 16) {
    const existingMap = new Map();
    (doc.sections || []).forEach((sec: any) => {
      existingMap.set(sec.order, sec);
    });
    const newSections = STANDARD_MANUAL_16_BAB.map((bab) => {
      if (existingMap.has(bab.order)) {
        const existing = existingMap.get(bab.order);
        return {
          order: bab.order,
          title: existing.title || bab.title,
          content: existing.content || '',
        };
      }
      return {
        order: bab.order,
        title: bab.title,
        content: '',
      };
    });
    doc.sections = newSections;
    changed = true;
  }
  if (!doc.lembarPengesahan || !doc.lembarPengesahan.disusun) {
    doc.lembarPengesahan = DEFAULT_LEMBAR_PENGESAHAN_MANUAL;
    changed = true;
  }
  if (!doc.riwayatPerubahan || doc.riwayatPerubahan.length === 0) {
    doc.riwayatPerubahan = DEFAULT_RIWAYAT_PERUBAHAN_MANUAL;
    changed = true;
  }
  if (!doc.kataPengantar) {
    doc.kataPengantar = DEFAULT_KATA_PENGANTAR_MANUAL;
    changed = true;
  }
  if (!doc.lampiran || doc.lampiran.length === 0) {
    doc.lampiran = STANDARD_MANUAL_15_LAMPIRAN;
    changed = true;
  }
  if (changed) {
    await doc.save();
  }
  return doc;
}

async function syncStandarDoc(doc: any) {
  let changed = false;
  if (!doc.sections || doc.sections.length < 7) {
    const existingMap = new Map();
    (doc.sections || []).forEach((sec: any) => {
      existingMap.set(sec.order, sec);
    });
    const newSections = STANDARD_STANDAR_PRELIMINARY_BABS.map((bab) => {
      if (existingMap.has(bab.order)) {
        const existing = existingMap.get(bab.order);
        return {
          order: bab.order,
          title: existing.title || bab.title,
          content: existing.content || '',
        };
      }
      return {
        order: bab.order,
        title: bab.title,
        content: '',
      };
    });
    doc.sections = newSections;
    changed = true;
  }
  if (!doc.lembarPengesahan || !doc.lembarPengesahan.disusun) {
    doc.lembarPengesahan = DEFAULT_LEMBAR_PENGESAHAN_STANDAR;
    changed = true;
  }
  if (!doc.riwayatPerubahan || doc.riwayatPerubahan.length === 0) {
    doc.riwayatPerubahan = DEFAULT_RIWAYAT_PERUBAHAN_STANDAR;
    changed = true;
  }
  if (!doc.kataPengantar) {
    doc.kataPengantar = DEFAULT_KATA_PENGANTAR_STANDAR;
    changed = true;
  }
  if (!doc.standards || doc.standards.length === 0) {
    doc.standards = STANDARD_BAKU_18_STANDARDS;
    doc.markModified('standards');
    changed = true;
  } else {
    const refMap = new Map();
    STANDARD_BAKU_18_STANDARDS.forEach((ref) => refMap.set(ref.code, ref));

    let standardsUpdated = false;
    doc.standards = doc.standards.map((s: any) => {
      const ref = refMap.get(s.code);
      if (ref && (!s.statement || s.statement.trim() === '')) {
        standardsUpdated = true;
        return { ...ref };
      }
      return s;
    });

    const existingCodes = new Set((doc.standards || []).map((s: any) => s.code));
    const toAdd = STANDARD_BAKU_18_STANDARDS.filter((s) => !existingCodes.has(s.code));
    if (toAdd.length > 0) {
      doc.standards = [...doc.standards, ...toAdd];
      standardsUpdated = true;
    }

    if (standardsUpdated) {
      doc.markModified('standards');
      changed = true;
    }
  }

  if (changed) {
    doc.markModified('sections');
    doc.markModified('standards');
    doc.markModified('lembarPengesahan');
    doc.markModified('riwayatPerubahan');
    await doc.save();
  }
  return doc;
}

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const bookType = searchParams.get('bookType');

    // Ensure Buku I, Buku II, and Buku III exist and have their standard contents
    const kebijakanDoc = await getOrCreateBookDoc('KEBIJAKAN');
    await syncKebijakanDoc(kebijakanDoc);

    const manualDoc = await getOrCreateBookDoc('MANUAL');
    await syncManualDoc(manualDoc);

    const standarDoc = await getOrCreateBookDoc('STANDAR');
    await syncStandarDoc(standarDoc);

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

async function getOrCreateBookDoc(bookType: 'KEBIJAKAN' | 'MANUAL' | 'STANDAR' | 'FORMULIR') {
  let doc = await SpmiDocument.findOne({ bookType });
  if (doc) {
    if (bookType === 'KEBIJAKAN') {
      await syncKebijakanDoc(doc);
    } else if (bookType === 'MANUAL') {
      await syncManualDoc(doc);
    } else if (bookType === 'STANDAR') {
      await syncStandarDoc(doc);
    }
    return doc;
  }

  const metaMap = {
    KEBIJAKAN: {
      bookNumber: 1,
      title: 'Buku I: Kebijakan Penjaminan Mutu Internal (SPMI)',
      code: 'SPMI-K/01',
      version: 'Rev 01 (2026)',
      skNumber: 'SK Ketua STIMI YAPMI No. 042/SK/YAPMI/IX/2025',
      description: 'Arah kebijakan mutu internal, 10 asas tata pamong mutu, struktur organisasi LPM, dan integrasi dengan SPME STIMI YAPMI Makassar.',
    },
    MANUAL: {
      bookNumber: 2,
      title: 'Buku II: Pedoman Penerapan Siklus PPEPP & Pendokumentasian',
      code: 'SPMI-PPEPP/01',
      version: 'Rev 01 (2026)',
      skNumber: 'SK Ketua STIMI YAPMI No. 043/SK/YAPMI/IX/2025',
      description: 'Pedoman pelaksanaan 5 tahapan PPEPP, matriks penugasan wewenang (RACI), dan mekanisme pendokumentasian 6 tingkatan kode STIMI YAPMI Makassar.',
    },
    STANDAR: {
      bookNumber: 3,
      title: 'Buku III: Standar Penjaminan Mutu Internal (SPMI)',
      code: 'SPMI-STD/01',
      version: 'Rev 01 (2026)',
      skNumber: 'SK Ketua STIMI YAPMI No. 044/SK/YAPMI/IX/2025',
      description: 'Pusat rumusan butir standar SPMI STIMI YAPMI Makassar berbasis SN-Dikti Permendiktisaintek No. 39/2025 jo. No. 10/2026 dan kriteria akreditasi LAMEMBA.',
    },
    FORMULIR: {
      bookNumber: 4,
      title: 'Buku IV: Formulir Mutu & Rekaman SPMI',
      code: 'SPMI-FORM/01',
      version: 'Rev 01 (2026)',
      skNumber: 'SK Ketua STIMI YAPMI No. 045/SK/YAPMI/IX/2025',
      description: 'Formulir mutu operasional: Pemantauan Dini, Monev, Lembar 5-Why RCA, RTL, dan Risalah RTM.',
    },
  };

  const meta = metaMap[bookType];
  const initialSections = bookType === 'KEBIJAKAN' 
    ? STANDARD_KEBIJAKAN_21_BAB.map(b => ({ order: b.order, title: b.title, content: '' }))
    : bookType === 'MANUAL'
    ? STANDARD_MANUAL_16_BAB.map(b => ({ order: b.order, title: b.title, content: '' }))
    : bookType === 'STANDAR'
    ? STANDARD_STANDAR_PRELIMINARY_BABS.map(b => ({ order: b.order, title: b.title, content: '' }))
    : [];

  doc = new SpmiDocument({
    institutionName: 'STIMI YAPMI Makassar',
    bookType,
    bookNumber: meta.bookNumber,
    title: meta.title,
    code: meta.code,
    version: meta.version,
    skNumber: meta.skNumber,
    validFrom: new Date('2025-09-01'),
    validUntil: new Date('2029-08-31'),
    status: 'DITETAPKAN_BERLAKU',
    description: meta.description,
    sections: initialSections,
    standards: bookType === 'STANDAR' ? STANDARD_BAKU_18_STANDARDS : [],
    forms: [],
    kataPengantar: bookType === 'KEBIJAKAN' 
      ? DEFAULT_KATA_PENGANTAR 
      : bookType === 'MANUAL' 
      ? DEFAULT_KATA_PENGANTAR_MANUAL 
      : bookType === 'STANDAR'
      ? DEFAULT_KATA_PENGANTAR_STANDAR
      : '',
    lembarPengesahan: bookType === 'KEBIJAKAN' 
      ? DEFAULT_LEMBAR_PENGESAHAN 
      : bookType === 'MANUAL' 
      ? DEFAULT_LEMBAR_PENGESAHAN_MANUAL 
      : bookType === 'STANDAR'
      ? DEFAULT_LEMBAR_PENGESAHAN_STANDAR
      : undefined,
    riwayatPerubahan: bookType === 'KEBIJAKAN' 
      ? DEFAULT_RIWAYAT_PERUBAHAN 
      : bookType === 'MANUAL' 
      ? DEFAULT_RIWAYAT_PERUBAHAN_MANUAL 
      : bookType === 'STANDAR'
      ? DEFAULT_RIWAYAT_PERUBAHAN_STANDAR
      : [],
    lampiran: bookType === 'KEBIJAKAN' 
      ? STANDARD_KEBIJAKAN_LAMPIRAN 
      : bookType === 'MANUAL' 
      ? STANDARD_MANUAL_15_LAMPIRAN 
      : [],
    signedBy: {
      name: 'Dr. Ibrahim Syah, S.E., M.M.',
      title: 'Ketua STIMI YAPMI Makassar',
      nipOrNidn: 'NIDN. 0920037601',
      date: new Date('2025-09-01'),
    },
  });
  await doc.save();
  return doc;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'LPM' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya peran LPM yang memiliki otoritas menambah data SPMI.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, standard, book, bookType, section, form } = body;

    await connectToDatabase();

    // AKSI 1: TAMBAH BAB / SEKSI KE BUKU I (KEBIJAKAN) ATAU BUKU II (MANUAL)
    if (action === 'ADD_SECTION' || section) {
      const targetBookType = (bookType || 'KEBIJAKAN') as 'KEBIJAKAN' | 'MANUAL';
      if (!section || !section.title) {
        return NextResponse.json({ success: false, error: 'Judul Bab / Seksi wajib disertakan.' }, { status: 400 });
      }
      const doc = await getOrCreateBookDoc(targetBookType);
      const nextOrder = Number(section.order) || (doc.sections.length + 1);
      doc.sections.push({
        order: nextOrder,
        title: section.title.trim(),
        content: section.content ? section.content.trim() : '',
      });
      doc.sections.sort((a, b) => a.order - b.order);
      await doc.save();
      return NextResponse.json({
        success: true,
        message: `Bab "${section.title}" berhasil ditambahkan ke ${doc.title}!`,
        data: doc,
      });
    }

    // AKSI 2: TAMBAH FORMULIR MUTU KE BUKU IV (FORMULIR)
    if (action === 'ADD_FORM' || form) {
      if (!form || !form.code || !form.name) {
        return NextResponse.json({ success: false, error: 'Kode dan Nama Formulir wajib disertakan.' }, { status: 400 });
      }
      const doc = await getOrCreateBookDoc('FORMULIR');
      const exists = doc.forms.some((f) => f.code.toLowerCase() === form.code.trim().toLowerCase());
      if (exists) {
        return NextResponse.json({ success: false, error: `Formulir dengan kode ${form.code} sudah ada.` }, { status: 400 });
      }
      doc.forms.push({
        code: form.code.trim(),
        name: form.name.trim(),
        purpose: form.purpose ? form.purpose.trim() : '',
        targetUser: form.targetUser ? form.targetUser.trim() : 'LPM / Program Studi',
        fileTemplateUrl: form.fileTemplateUrl || '',
      });
      await doc.save();
      return NextResponse.json({
        success: true,
        message: `Formulir "${form.name}" berhasil ditambahkan ke Buku IV!`,
        data: doc,
      });
    }

    // AKSI 3: TAMBAH BUTIR STANDAR BARU KE BUKU III (STANDAR)
    if (action === 'ADD_STANDARD' || standard) {
      const stdData: ISpmiStandardItem = standard;
      if (!stdData || !stdData.code || !stdData.name) {
        return NextResponse.json(
          { success: false, error: 'Kode dan Nama Standar wajib disertakan.' },
          { status: 400 }
        );
      }

      // Cari atau buat Buku III jika belum ada
      const standardsDoc = await getOrCreateBookDoc('STANDAR');

      // Cek apakah kode standar sudah ada
      const exists = standardsDoc.standards.some((s) => s.code.toLowerCase() === stdData.code.trim().toLowerCase());
      if (exists) {
        return NextResponse.json(
          { success: false, error: `Standar dengan kode ${stdData.code} sudah ada di Buku III.` },
          { status: 400 }
        );
      }

      // Berikan nilai default untuk elemen yang belum terisi
      const newStandard: ISpmiStandardItem = {
        code: stdData.code.trim(),
        name: stdData.name.trim(),
        kelompok: stdData.kelompok || 'PROSES',
        bidang: stdData.bidang || 'PENDIDIKAN',
        category: stdData.category || 'PENDIDIKAN',
        version: stdData.version || '01',
        tanggalPenetapan: stdData.tanggalPenetapan || '2025-09-01',
        tanggalBerlaku: stdData.tanggalBerlaku || '2025-09-01',
        responsibleUnit: stdData.responsibleUnit || 'Program Studi Manajemen',
        rasional: stdData.rasional || '',
        pihakBertanggungJawab: stdData.pihakBertanggungJawab || 'Ketua (A), Waket I (C), Kaprodi (R), Dosen (C)',
        definisiIstilah: stdData.definisiIstilah || '',
        statement: stdData.statement || '',
        indicators: Array.isArray(stdData.indicators) ? stdData.indicators : [],
        indikatorKinerja: Array.isArray(stdData.indikatorKinerja) ? stdData.indikatorKinerja : [],
        targetValue: stdData.targetValue || '',
        strategies: Array.isArray(stdData.strategies) ? stdData.strategies : [],
        sumberDaya: stdData.sumberDaya || 'SDM Dosen, Anggaran Unit, dan Fasilitas Kampus',
        caraPengukuran: stdData.caraPengukuran || {
          rumus: '',
          sumberData: 'SIAKAD / PDDikti / LMS',
          periodeUkur: 'Semesteran',
          pihakPengukur: 'Kaprodi & LPM',
        },
        buktiDokumen: Array.isArray(stdData.buktiDokumen) ? stdData.buktiDokumen : [],
        ppeppCycle: stdData.ppeppCycle || {
          penetapanDate: '2025-09-01',
          pelaksanaanNotes: 'Diterapkan pada seluruh program kerja tahunan unit',
          evaluasiAmiStatus: 'SESUAI',
          statusPemantauan: 'HIJAU',
          pengendalianAction: 'Tindak lanjut perbaikan berkala melalui RTM',
          peningkatanTarget: 'Peningkatan target mutu pada siklus berikutnya',
        },
      };

      standardsDoc.standards.push(newStandard);
      await standardsDoc.save();

      return NextResponse.json({
        success: true,
        message: `Standar ${newStandard.code} berhasil ditambahkan ke Buku III!`,
        data: standardsDoc,
      });
    }

    // AKSI 4: BUAT BUKU BARU
    if (book) {
      const newDoc = await SpmiDocument.create(book);
      return NextResponse.json({
        success: true,
        message: 'Buku SPMI berhasil dibuat!',
        data: newDoc,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating SPMI document/standard:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'LPM' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Hanya peran LPM yang memiliki otoritas memperbarui dokumen SPMI.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id,
      action,
      bookType,
      sectionIndex,
      section,
      formCode,
      form,
      metadata,
      standardCode,
      standard,
      title,
      skNumber,
      version,
      status,
      description,
      sections,
      standards,
      forms,
      signedBy,
      institutionName,
    } = body;

    await connectToDatabase();

    // AKSI 1: UPDATE SINGLE BAB / SEKSI DI BUKU I / BUKU II
    if (action === 'UPDATE_SECTION') {
      const doc = id ? await SpmiDocument.findById(id) : await SpmiDocument.findOne({ bookType: bookType || 'KEBIJAKAN' });
      if (!doc) {
        return NextResponse.json({ success: false, error: 'Dokumen SPMI tidak ditemukan.' }, { status: 404 });
      }

      let idx = typeof sectionIndex === 'number' ? sectionIndex : -1;
      if (idx < 0 && section?.order) {
        idx = doc.sections.findIndex((s) => s.order === Number(section.order));
      }

      if (section) {
        if (idx >= 0) {
          doc.sections[idx] = {
            order: Number(section.order) || doc.sections[idx].order,
            title: section.title ? section.title.trim() : doc.sections[idx].title,
            content: section.content !== undefined ? section.content.trim() : doc.sections[idx].content,
          };
        } else {
          doc.sections.push({
            order: Number(section.order) || doc.sections.length + 1,
            title: section.title ? section.title.trim() : `BAB ${section.order}`,
            content: section.content !== undefined ? section.content.trim() : '',
          });
        }
        doc.sections.sort((a, b) => a.order - b.order);
      }

      await doc.save();
      const updatedTitle = section?.title || (idx >= 0 ? doc.sections[idx].title : 'Bab');
      return NextResponse.json({
        success: true,
        message: `Bab "${updatedTitle}" berhasil disimpan!`,
        data: doc,
      });
    }

    // AKSI 2: UPDATE METADATA BUKU (SK, Penandatangan, Versi, Masa Berlaku)
    if (action === 'UPDATE_METADATA') {
      const doc = id ? await SpmiDocument.findById(id) : await SpmiDocument.findOne({ bookType: bookType || 'KEBIJAKAN' });
      if (!doc) {
        return NextResponse.json({ success: false, error: 'Dokumen SPMI tidak ditemukan.' }, { status: 404 });
      }

      if (metadata) {
        if (metadata.title) doc.title = metadata.title.trim();
        if (metadata.code) doc.code = metadata.code.trim();
        if (metadata.skNumber) doc.skNumber = metadata.skNumber.trim();
        if (metadata.version) doc.version = metadata.version.trim();
        if (metadata.status) doc.status = metadata.status;
        if (metadata.description) doc.description = metadata.description.trim();
        if (metadata.validFrom) doc.validFrom = new Date(metadata.validFrom);
        if (metadata.validUntil) doc.validUntil = new Date(metadata.validUntil);
        if (metadata.signedBy) {
          doc.signedBy = {
            name: metadata.signedBy.name || doc.signedBy.name,
            title: metadata.signedBy.title || doc.signedBy.title,
            nipOrNidn: metadata.signedBy.nipOrNidn || doc.signedBy.nipOrNidn,
            date: metadata.signedBy.date ? new Date(metadata.signedBy.date) : doc.signedBy.date,
          };
        }
      }

      await doc.save();
      return NextResponse.json({
        success: true,
        message: `Identitas ${doc.title} berhasil diperbarui!`,
        data: doc,
      });
    }

    // AKSI 2B: UPDATE LEMBAR PENGESAHAN
    if (action === 'UPDATE_PENGESAHAN') {
      const doc = id ? await SpmiDocument.findById(id) : await SpmiDocument.findOne({ bookType: bookType || 'KEBIJAKAN' });
      if (!doc) {
        return NextResponse.json({ success: false, error: 'Dokumen SPMI tidak ditemukan.' }, { status: 404 });
      }

      if (body.lembarPengesahan) {
        doc.lembarPengesahan = body.lembarPengesahan;
        await doc.save();
      }

      return NextResponse.json({
        success: true,
        message: 'Lembar Pengesahan berhasil disimpan!',
        data: doc,
      });
    }

    // AKSI 2C: UPDATE RIWAYAT PERUBAHAN
    if (action === 'UPDATE_RIWAYAT') {
      const doc = id ? await SpmiDocument.findById(id) : await SpmiDocument.findOne({ bookType: bookType || 'KEBIJAKAN' });
      if (!doc) {
        return NextResponse.json({ success: false, error: 'Dokumen SPMI tidak ditemukan.' }, { status: 404 });
      }

      if (Array.isArray(body.riwayatPerubahan)) {
        doc.riwayatPerubahan = body.riwayatPerubahan;
        await doc.save();
      }

      return NextResponse.json({
        success: true,
        message: 'Riwayat Perubahan Dokumen berhasil disimpan!',
        data: doc,
      });
    }

    // AKSI 2D: UPDATE KATA PENGANTAR
    if (action === 'UPDATE_KATA_PENGANTAR') {
      const doc = id ? await SpmiDocument.findById(id) : await SpmiDocument.findOne({ bookType: bookType || 'KEBIJAKAN' });
      if (!doc) {
        return NextResponse.json({ success: false, error: 'Dokumen SPMI tidak ditemukan.' }, { status: 404 });
      }

      if (typeof body.kataPengantar === 'string') {
        doc.kataPengantar = body.kataPengantar;
        await doc.save();
      }

      return NextResponse.json({
        success: true,
        message: 'Kata Pengantar berhasil disimpan!',
        data: doc,
      });
    }

    // AKSI 2E: UPDATE LAMPIRAN
    if (action === 'UPDATE_LAMPIRAN') {
      const doc = id ? await SpmiDocument.findById(id) : await SpmiDocument.findOne({ bookType: bookType || 'KEBIJAKAN' });
      if (!doc) {
        return NextResponse.json({ success: false, error: 'Dokumen SPMI tidak ditemukan.' }, { status: 404 });
      }

      if (Array.isArray(body.lampiran)) {
        doc.lampiran = body.lampiran;
        await doc.save();
      }

      return NextResponse.json({
        success: true,
        message: 'Lampiran dokumen berhasil disimpan!',
        data: doc,
      });
    }

    // AKSI 3: UPDATE SINGLE STANDAR DI BUKU III
    if (action === 'UPDATE_STANDARD' && standardCode && standard) {
      const standardsDoc = id ? await SpmiDocument.findById(id) : await SpmiDocument.findOne({ bookType: 'STANDAR' });
      if (!standardsDoc) {
        return NextResponse.json({ success: false, error: 'Buku Standar SPMI tidak ditemukan.' }, { status: 404 });
      }

      const index = standardsDoc.standards.findIndex((s) => s.code === standardCode);
      if (index === -1) {
        return NextResponse.json(
          { success: false, error: `Standar ${standardCode} tidak ditemukan di Buku III.` },
          { status: 404 }
        );
      }

      // Merge data 12 elemen
      const existing = (standardsDoc.standards[index] as any).toObject
        ? (standardsDoc.standards[index] as any).toObject()
        : JSON.parse(JSON.stringify(standardsDoc.standards[index]));
      standardsDoc.standards[index] = {
        ...existing,
        ...standard,
      };

      await standardsDoc.save();
      return NextResponse.json({
        success: true,
        message: `Standar ${standardCode} berhasil diperbarui!`,
        data: standardsDoc,
      });
    }

    // UPDATE BUKU UMUM BY ID
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Dokumen SPMI wajib disertakan.' }, { status: 400 });
    }

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
    if (signedBy) doc.signedBy = signedBy;
    if (institutionName) doc.institutionName = institutionName;

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

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user?.role !== 'LPM' && session.user?.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Hanya peran LPM yang berwenang menghapus data SPMI.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const standardCode = searchParams.get('standardCode');
    const bookType = searchParams.get('bookType');
    const sectionIndexStr = searchParams.get('sectionIndex');
    const formCode = searchParams.get('formCode');
    const id = searchParams.get('id');
    const all = searchParams.get('all') === 'true';

    await connectToDatabase();

    // 1. HAPUS SATU BAB / SEKSI DARI BUKU
    if (bookType && sectionIndexStr !== null) {
      const doc = await SpmiDocument.findOne({ bookType: bookType as any });
      if (!doc) {
        return NextResponse.json({ success: false, error: 'Buku SPMI tidak ditemukan.' }, { status: 404 });
      }
      const idx = parseInt(sectionIndexStr, 10);
      if (isNaN(idx) || idx < 0 || idx >= doc.sections.length) {
        return NextResponse.json({ success: false, error: 'Indeks bab tidak valid.' }, { status: 400 });
      }
      const removed = doc.sections.splice(idx, 1);
      await doc.save();
      return NextResponse.json({
        success: true,
        message: `Bab "${removed[0]?.title || 'Bab'}" berhasil dihapus.`,
        data: doc,
      });
    }

    // 2. HAPUS SATU FORMULIR DARI BUKU IV
    if (formCode) {
      const doc = await SpmiDocument.findOne({ bookType: 'FORMULIR' });
      if (!doc) {
        return NextResponse.json({ success: false, error: 'Buku Formulir tidak ditemukan.' }, { status: 404 });
      }
      doc.forms = doc.forms.filter((f) => f.code.toLowerCase() !== formCode.toLowerCase());
      await doc.save();
      return NextResponse.json({
        success: true,
        message: `Formulir ${formCode} berhasil dihapus.`,
        data: doc,
      });
    }

    // 3. HAPUS SATU BUTIR STANDAR DARI BUKU III
    if (standardCode) {
      const standardsDoc = await SpmiDocument.findOne({ bookType: 'STANDAR' });
      if (!standardsDoc) {
        return NextResponse.json({ success: false, error: 'Buku Standar tidak ditemukan.' }, { status: 404 });
      }

      standardsDoc.standards = standardsDoc.standards.filter(
        (s) => s.code.toLowerCase() !== standardCode.toLowerCase()
      );
      await standardsDoc.save();

      return NextResponse.json({
        success: true,
        message: `Standar ${standardCode} berhasil dihapus dari Buku III.`,
        data: standardsDoc,
      });
    }

    // 4. KOSONGKAN SELURUH DOKUMEN SPMI (RESET UNTUK UJI KOSONG)
    if (all) {
      await SpmiDocument.deleteMany({});
      return NextResponse.json({
        success: true,
        message: 'Seluruh dokumen SPMI berhasil dikosongkan dari pangkalan data.',
      });
    }

    // 5. HAPUS BUKU TERTENTU BY ID
    if (id) {
      await SpmiDocument.findByIdAndDelete(id);
      return NextResponse.json({
        success: true,
        message: 'Buku SPMI berhasil dihapus.',
      });
    }

    return NextResponse.json({ success: false, error: 'Parameter penghapusan tidak valid.' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

