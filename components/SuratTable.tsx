"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Surat } from "@/lib/types";

const KATEGORI_UMUM = [
  "Dinas Pendidikan",
  "Undangan",
  "Kepegawaian",
  "Keuangan",
  "Kesiswaan",
  "Lainnya",
];

export function SuratTable({ basePath }: { basePath: "/tu" | "/kepsek" }) {
  const [data, setData] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [jenis, setJenis] = useState("");
  const [kategori, setKategori] = useState("");
  const [q, setQ] = useState("");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (jenis) params.set("jenis", jenis);
    if (kategori) params.set("kategori", kategori);
    if (q) params.set("q", q);
    if (dari) params.set("dari", dari);
    if (sampai) params.set("sampai", sampai);

    try {
      const res = await fetch(`/api/surat?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Gagal memuat data");
        return;
      }
      setData(json.data ?? []);
    } catch {
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [jenis, kategori, q, dari, sampai]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleExportPdf() {
    const params = new URLSearchParams();
    if (jenis) params.set("jenis", jenis);
    if (kategori) params.set("kategori", kategori);
    if (dari) params.set("dari", dari);
    if (sampai) params.set("sampai", sampai);
    window.open(`/api/rekap/pdf?${params.toString()}`, "_blank");
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input
          className="border rounded-lg px-3 py-2 md:col-span-2"
          placeholder="Cari perihal / nomor / pengirim..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2"
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
        >
          <option value="">Semua Jenis</option>
          <option value="masuk">Surat Masuk</option>
          <option value="keluar">Surat Keluar</option>
        </select>
        <select
          className="border rounded-lg px-3 py-2"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {KATEGORI_UMUM.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="border rounded-lg px-3 py-2"
          value={dari}
          onChange={(e) => setDari(e.target.value)}
          title="Dari tanggal"
        />
        <input
          type="date"
          className="border rounded-lg px-3 py-2"
          value={sampai}
          onChange={(e) => setSampai(e.target.value)}
          title="Sampai tanggal"
        />
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          {loading ? "Memuat..." : `${data.length} surat ditemukan`}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleExportPdf}
            className="text-sm bg-white border border-primary text-primary rounded-lg px-3 py-2 hover:bg-primary/5"
          >
            Cetak Rekap PDF
          </button>
          {basePath === "/tu" && (
            <Link
              href="/tu/surat/baru"
              className="text-sm bg-primary text-white rounded-lg px-3 py-2"
            >
              + Tambah Surat
            </Link>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-3 py-2">Jenis</th>
              <th className="px-3 py-2">Nomor Surat</th>
              <th className="px-3 py-2">Tanggal</th>
              <th className="px-3 py-2">Perihal</th>
              <th className="px-3 py-2">Pengirim/Tujuan</th>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2">Disposisi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr
                key={s.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => (window.location.href = `${basePath}/surat/${s.id}`)}
              >
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      s.jenis === "masuk"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {s.jenis === "masuk" ? "Masuk" : "Keluar"}
                  </span>
                </td>
                <td className="px-3 py-2">{s.nomor_surat}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Date(s.tanggal_surat).toLocaleDateString("id-ID")}
                </td>
                <td className="px-3 py-2">{s.perihal}</td>
                <td className="px-3 py-2">{s.pengirim_tujuan}</td>
                <td className="px-3 py-2">{s.kategori}</td>
                <td className="px-3 py-2">
                  {s.disposisi_status === "sudah" ? (
                    <span className="text-green-700">Sudah</span>
                  ) : (
                    <span className="text-gray-400">Belum</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                  Tidak ada surat yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
