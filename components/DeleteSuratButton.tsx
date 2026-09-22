"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteSuratButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus surat ini? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/surat/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/tu");
      router.refresh();
    } else {
      setLoading(false);
      alert("Gagal menghapus surat");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? "Menghapus..." : "Hapus Surat"}
    </button>
  );
}
