"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Surat } from "@/lib/types";

export function DisposisiForm({ surat }: { surat: Surat }) {
  const router = useRouter();
  const [disposisiUntuk, setDisposisiUntuk] = useState(surat.disposisi_untuk ?? "");
  const [disposisiCatatan, setDisposisiCatatan] = useState(
    surat.disposisi_catatan ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/surat/${surat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        disposisi_untuk: disposisiUntuk,
        disposisi_catatan: disposisiCatatan,
      }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Gagal menyimpan disposisi");
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4 max-w-2xl">
      <h2 className="font-semibold">Disposisi</h2>
      <div>
        <label className="block text-sm font-medium mb-1">
          Disposisi Untuk (nama guru/pihak yang dituju)
        </label>
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={disposisiUntuk}
          onChange={(e) => setDisposisiUntuk(e.target.value)}
          placeholder="Contoh: Bapak/Ibu Wali Kelas 3A"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Catatan / Instruksi</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2"
          rows={3}
          value={disposisiCatatan}
          onChange={(e) => setDisposisiCatatan(e.target.value)}
          placeholder="Contoh: Mohon ditindaklanjuti dan dilaporkan kembali"
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white rounded-lg px-4 py-2 font-medium disabled:opacity-60"
      >
        {loading ? "Menyimpan..." : "Simpan Disposisi"}
      </button>
    </form>
  );
}
