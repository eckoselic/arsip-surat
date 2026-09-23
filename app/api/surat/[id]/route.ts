import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionRole } from "@/lib/session";
import { deleteSuratFile, getSignedFileUrl } from "@/lib/storage";
import type { SuratInput, DisposisiInput } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("arsip_surat")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
  }

  const signedUrl = await getSignedFileUrl(data.file_url);
  return NextResponse.json({ data: { ...data, file_signed_url: signedUrl } });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const role = await getSessionRole();
  if (!role) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (role === "kepala_sekolah") {
    // Kepala sekolah hanya boleh mengisi/mengubah disposisi, tidak boleh ubah data surat
    const { disposisi_untuk, disposisi_catatan }: Partial<DisposisiInput> = body;
    if (!disposisi_untuk || !disposisi_catatan) {
      return NextResponse.json({ error: "Disposisi untuk & catatan wajib diisi" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("arsip_surat")
      .update({
        disposisi_untuk,
        disposisi_catatan,
        disposisi_status: "sudah",
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  if (role === "admin_tu") {
    const update: Partial<SuratInput> & { disposisi_status?: string } = body;
    const { data, error } = await supabase
      .from("arsip_surat")
      .update({
        jenis: update.jenis,
        nomor_surat: update.nomor_surat,
        tanggal_surat: update.tanggal_surat,
        tanggal_terima: update.tanggal_terima ?? null,
        perihal: update.perihal,
        pengirim_tujuan: update.pengirim_tujuan,
        kategori: update.kategori,
        ...(update.file_url !== undefined ? { file_url: update.file_url } : {}),
        ...(update.file_nama !== undefined ? { file_nama: update.file_nama } : {}),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const role = await getSessionRole();
  if (role !== "admin_tu") {
    return NextResponse.json({ error: "Hanya admin TU yang boleh menghapus surat" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("arsip_surat")
    .select("file_url")
    .eq("id", params.id)
    .single();

  const { error } = await supabase.from("arsip_surat").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existing?.file_url) {
    await deleteSuratFile(existing.file_url);
  }

  return NextResponse.json({ ok: true });
}
