import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSignedFileUrl } from "@/lib/storage";
import { SuratForm } from "@/components/SuratForm";
import { DeleteSuratButton } from "@/components/DeleteSuratButton";
import type { Surat } from "@/lib/types";

export default async function DetailSuratTuPage({
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
          <DeleteSuratButton id={surat.id} />
          <Link href="/tu" className="text-sm bg-white border rounded-lg px-3 py-2 hover:bg-gray-50">
            Kembali
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-sm font-medium mb-1">Status Disposisi</p>
        {surat.disposisi_status === "sudah" ? (
          <p className="text-sm text-green-700">
            Sudah didisposisikan kepada <b>{surat.disposisi_untuk}</b>: {surat.disposisi_catatan}
          </p>
        ) : (
          <p className="text-sm text-gray-400">
            Belum didisposisikan oleh Kepala Sekolah
          </p>
        )}
      </div>

      <SuratForm initialData={surat} />
    </div>
  );
}
