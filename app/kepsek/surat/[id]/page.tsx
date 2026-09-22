import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSignedFileUrl } from "@/lib/storage";
import { DisposisiForm } from "@/components/DisposisiForm";
import type { Surat } from "@/lib/types";

export default async function DetailSuratKepsekPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("surat")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const surat = data as Surat;
  const signedUrl = await getSignedFileUrl(surat.file_url);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Detail Surat</h1>
        <div className="flex gap-2">
          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm bg-white border rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              Lihat File Scan
            </a>
          )}
          <Link href="/kepsek" className="text-sm bg-white border rounded-lg px-3 py-2 hover:bg-gray-50">
            Kembali
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-1 text-sm">
        <p>
          <span className="text-gray-500">Jenis:</span>{" "}
          {surat.jenis === "masuk" ? "Surat Masuk" : "Surat Keluar"}
        </p>
        <p>
          <span className="text-gray-500">Nomor Surat:</span> {surat.nomor_surat}
        </p>
        <p>
          <span className="text-gray-500">Tanggal Surat:</span>{" "}
          {new Date(surat.tanggal_surat).toLocaleDateString("id-ID")}
        </p>
        <p>
          <span className="text-gray-500">Perihal:</span> {surat.perihal}
        </p>
        <p>
          <span className="text-gray-500">
            {surat.jenis === "masuk" ? "Pengirim" : "Tujuan"}:
          </span>{" "}
          {surat.pengirim_tujuan}
        </p>
        <p>
          <span className="text-gray-500">Kategori:</span> {surat.kategori}
        </p>
      </div>

      <DisposisiForm surat={surat} />
    </div>
  );
}
