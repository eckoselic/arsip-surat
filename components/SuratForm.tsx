"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Surat } from "@/lib/types";

const KATEGORI_UMUM = [
  "Dinas Pendidikan",
  "Undangan",
  "Kepegawaian",
  "Keuangan",
  "Kesiswaan",
  "Lainnya",
];

interface Props {
  initialData?: Surat;
}

export function SuratForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [jenis, setJenis] = useState<"masuk" | "keluar">(
    initialData?.jenis ?? "masuk"
  );
  const [nomorSurat, setNomorSurat] = useState(initialData?.nomor_surat ?? "");
  const [tanggalSurat, setTanggalSurat] = useState(
    initialData?.tanggal_surat?.slice(0, 10) ?? ""
  );
  const [tanggalTerima, setTanggalTerima] = useState(
    initialData?.tanggal_terima?.slice(0, 10) ?? ""
  );
  const [perihal, setPerihal] = useState(initialData?.perihal ?? "");
  const [pengirimTujuan, setPengirimTujuan] = useState(
    initialData?.pengirim_tujuan ?? ""
  );
  const [kategori, setKategori] = useState(initialData?.kategori ?? KATEGORI_UMUM[0]);
  const [file, setFile] = useState<File | null>(null);
  const [fileNamaLama, setFileNamaLama] = useState(initialData?.file_nama ?? null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let fileUrl: string | null | undefined = undefined;
      let fileNama: string | null | undefined = undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadJson.error ?? "Gagal mengunggah file");
          setLoading(false);
          return;
        }
        fileUrl = uploadJson.path;
        fileNama = uploadJson.fileName;
      }

      const payload = {
        jenis,
        nomor_surat: nomorSurat,
        tanggal_surat: tanggalSurat,
        tanggal_terima: jenis === "masuk" ? tanggalTerima || null : null,
        perihal,
        pengirim_tujuan: pengirimTujuan,
        kategori,
        ...(fileUrl !== undefined ? { file_url: fileUrl, file_nama: fileNama } : {}),
      };

      const res = await fetch(
        isEdit ? `/api/surat/${initialData!.id}` : "/api/surat",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Gagal menyimpan surat");
        setLoading(false);
        return;
      }

      router.push(isEdit ? `/tu/surat/${initialData!.id}` : "/tu");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan, coba lagi");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4 max-w-2xl">
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={jenis === "masuk"}
            onChange={() => setJenis("masuk")}
          />
          Surat Masuk
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={jenis === "keluar"}
            onChange={() => setJenis("keluar")}
          />
          Surat Keluar
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nomor Surat</label>
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={nomorSurat}
          onChange={(e) => setNomorSurat(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Tanggal Surat
          </label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2"
            value={tanggalSurat}
            onChange={(e) => setTanggalSurat(e.target.value)}
            required
          />
        </div>
        {jenis === "masuk" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Tanggal Diterima
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={tanggalTerima}
              onChange={(e) => setTanggalTerima(e.target.value)}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Perihal</label>
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={perihal}
          onChange={(e) => setPerihal(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {jenis === "masuk" ? "Pengirim" : "Tujuan"}
        </label>
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={pengirimTujuan}
          onChange={(e) => setPengirimTujuan(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Kategori</label>
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
        >
          {KATEGORI_UMUM.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          File Scan Surat (PDF/JPG/PNG)
        </label>
        {fileNamaLama && !file && (
          <p className="text-xs text-gray-500 mb-1">
            File saat ini: {fileNamaLama}
          </p>
        )}
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white rounded-lg px-4 py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Surat"}
        </button>
      </div>
    </form>
  );
}
