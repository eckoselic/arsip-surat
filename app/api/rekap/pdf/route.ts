import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "node:fs/promises";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionRole } from "@/lib/session";
import { RekapPdfDocument } from "@/components/RekapPdfDocument";
import type { Surat } from "@/lib/types";

export async function GET(request: Request) {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dari = searchParams.get("dari");
  const sampai = searchParams.get("sampai");
  const jenis = searchParams.get("jenis");
  const kategori = searchParams.get("kategori");

  const supabase = createAdminClient();
  let query = supabase
    .from("surat")
    .select("*")
    .order("tanggal_surat", { ascending: true });

  if (dari) query = query.gte("tanggal_surat", dari);
  if (sampai) query = query.lte("tanggal_surat", sampai);
  if (jenis === "masuk" || jenis === "keluar") query = query.eq("jenis", jenis);
  if (kategori) query = query.eq("kategori", kategori);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const kopSuratPath = path.join(process.cwd(), "public/assets/kop-surat.png");
  const kopSuratBuffer = await fs.readFile(kopSuratPath);
  const kopSuratBase64 = `data:image/png;base64,${kopSuratBuffer.toString("base64")}`;

  const periodeLabel =
    dari && sampai
      ? `Periode ${formatTgl(dari)} s.d. ${formatTgl(sampai)}`
      : "Seluruh Periode";

  const pdfBuffer = await renderToBuffer(
    RekapPdfDocument({
      data: (data ?? []) as Surat[],
      periodeLabel,
      kopSuratBase64,
      dicetakOleh: role === "admin_tu" ? "Admin TU" : "Kepala Sekolah",
    })
  );

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rekap-surat-${Date.now()}.pdf"`,
    },
  });
}

function formatTgl(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}
