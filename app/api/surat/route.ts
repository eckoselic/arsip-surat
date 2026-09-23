import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionRole } from "@/lib/session";
import type { SuratInput } from "@/lib/types";

export async function GET(request: Request) {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jenis = searchParams.get("jenis"); // "masuk" | "keluar" | null (semua)
  const kategori = searchParams.get("kategori");
  const q = searchParams.get("q"); // pencarian bebas: perihal / nomor / pengirim-tujuan
  const dari = searchParams.get("dari"); // tanggal_surat >=
  const sampai = searchParams.get("sampai"); // tanggal_surat <=

  const supabase = createAdminClient();
  let query = supabase
    .from("arsip_surat")
    .select("*")
    .order("tanggal_surat", { ascending: false })
    .order("dibuat_pada", { ascending: false });

  if (jenis === "masuk" || jenis === "keluar") {
    query = query.eq("jenis", jenis);
  }
  if (kategori) {
    query = query.eq("kategori", kategori);
  }
  if (dari) {
    query = query.gte("tanggal_surat", dari);
  }
  if (sampai) {
    query = query.lte("tanggal_surat", sampai);
  }
  if (q) {
    query = query.or(
      `perihal.ilike.%${q}%,nomor_surat.ilike.%${q}%,pengirim_tujuan.ilike.%${q}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const role = await getSessionRole();
  if (role !== "admin_tu") {
    return NextResponse.json({ error: "Hanya admin TU yang boleh menambah surat" }, { status: 403 });
  }

  const body: SuratInput = await request.json().catch(() => null as any);
  if (!body || !body.jenis || !body.nomor_surat || !body.tanggal_surat || !body.perihal || !body.pengirim_tujuan || !body.kategori) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("arsip_surat")
    .insert({
      jenis: body.jenis,
      nomor_surat: body.nomor_surat,
      tanggal_surat: body.tanggal_surat,
      tanggal_terima: body.tanggal_terima ?? null,
      perihal: body.perihal,
      pengirim_tujuan: body.pengirim_tujuan,
      kategori: body.kategori,
      file_url: body.file_url ?? null,
      file_nama: body.file_nama ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
}
