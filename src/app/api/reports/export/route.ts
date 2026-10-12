import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db";
import IKUMetadata from "@/models/IKUMetadata";
import Target from "@/models/Target";
import Achievement from "@/models/Achievement";

export const dynamic = "force-dynamic";

function escapeCSV(str: unknown): string {
  if (str === null || str === undefined) return '""';
  const val = String(str).replace(/"/g, '""');
  return `"${val}"`;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "achievements"; // 'targets' | 'achievements'
    const year = parseInt(searchParams.get("year") || "2026");
    const quarter = parseInt(searchParams.get("quarter") || "1");

    await connectToDatabase();

    // 1. Export Target & Justifikasi
    if (type === "targets") {
      const allIKUs = await IKUMetadata.find().sort({ code: 1 });
      const targets = await Target.find({ year });
      const targetMap = new Map();
      targets.forEach((t) => targetMap.set(t.ikuId.toString(), t));

      // CSV Header
      const headers = [
        "No",
        "Kode IKU",
        "Nama Indikator Kinerja Utama",
        "Klaster",
        "Satuan",
        "Tipe Indikator",
        `Baseline (Tahun Lalu)`,
        `Target Tahun ${year}`,
        "Status Target",
        "Narasi Justifikasi Target",
      ];

      // Sort IKUs numerically
      allIKUs.sort((a, b) => {
        const numA = parseInt(a.code.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.code.replace(/\D/g, "")) || 0;
        return numA - numB;
      });

      const rows = allIKUs.map((iku, idx) => {
        const tgt = targetMap.get(iku._id.toString());
        return [
          idx + 1,
          escapeCSV(iku.code),
          escapeCSV(iku.name),
          escapeCSV(iku.cluster || "Umum"),
          escapeCSV(iku.unit),
          escapeCSV(iku.type),
          tgt ? tgt.baseline : 0,
          tgt ? tgt.target : 0,
          escapeCSV(tgt?.status || "Belum"),
          escapeCSV(tgt?.justificationNarrative || "-"),
        ].join(",");
      });

      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="Rekap_Target_IKU_STIMI_YAPMI_${year}.csv"`,
        },
      });
    }

    // 2. Export Capaian Triwulanan
    const allIKUs = await IKUMetadata.find().sort({ code: 1 });
    const targets = await Target.find({ year });
    const targetMap = new Map();
    targets.forEach((t) => targetMap.set(t.ikuId.toString(), t));

    const achievements = await Achievement.find({ year, quarter }).populate(
      "submittedBy",
      "name email unitCode unitName"
    );
    const achMap = new Map();
    achievements.forEach((a) => achMap.set(a.ikuId.toString(), a));

    allIKUs.sort((a, b) => {
      const numA = parseInt(a.code.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.code.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    const headers = [
      "No",
      "Kode IKU",
      "Nama Indikator Kinerja Utama",
      "Klaster",
      "Satuan",
      `Target Tahun ${year}`,
      `Realisasi TW ${quarter}`,
      "% Ketercapaian",
      "Status Validasi LPM",
      "Tautan Bukti Dukung",
      "Penanggung Jawab (PIC)",
      "Terakhir Diperbarui",
    ];

    const rows = allIKUs.map((iku, idx) => {
      const tgt = targetMap.get(iku._id.toString());
      const ach = achMap.get(iku._id.toString());
      const targetVal = tgt ? tgt.target : 0;
      const realVal = ach ? ach.value : 0;

      let pct = 0;
      if (targetVal > 0) {
        pct = Math.round((realVal / targetVal) * 100);
      } else if (realVal > 0) {
        pct = 100;
      }

      const picName = ach?.submittedBy?.unitName || ach?.submittedBy?.name || "-";
      const updatedAtStr = ach?.updatedAt ? new Date(ach.updatedAt).toLocaleDateString("id-ID") : "-";

      return [
        idx + 1,
        escapeCSV(iku.code),
        escapeCSV(iku.name),
        escapeCSV(iku.cluster || "Umum"),
        escapeCSV(iku.unit),
        targetVal,
        realVal,
        `${pct}%`,
        escapeCSV(ach ? ach.status : "Belum Diisi"),
        escapeCSV(ach?.documentUrl || "-"),
        escapeCSV(picName),
        escapeCSV(updatedAtStr),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Laporan_Kinerja_IKU_STIMI_YAPMI_${year}_TW${quarter}.csv"`,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error generating CSV report:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
