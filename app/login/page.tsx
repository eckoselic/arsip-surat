"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Gagal login");
        setLoading(false);
        return;
      }

      const redirectPath = searchParams.get("redirect") ?? (json.role === "admin_tu" ? "/tu" : "/kepsek");
      router.push(redirectPath);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan, coba lagi");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-8">
        <h1 className="text-lg font-bold text-primary text-center mb-1">Arsip Surat</h1>
        <p className="text-sm text-center text-gray-500 mb-6">SDN Jatinegara Kaum 07 Pagi</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="passcode">
              Kode Akses
            </label>
            <input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Masukkan kode akses"
              autoFocus
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-lg py-2 font-medium disabled:opacity-60">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">Kode akses berbeda untuk Admin TU dan Kepala Sekolah.</p>
      </div>
    </div>
  );
}
