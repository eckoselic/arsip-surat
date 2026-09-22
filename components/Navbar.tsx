"use client";

import { useRouter } from "next/navigation";

export function Navbar({ roleLabel }: { roleLabel: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-primary text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-bold leading-tight">Arsip Surat</p>
          <p className="text-xs text-white/70 leading-tight">
            SDN Jatinegara Kaum 07 Pagi — {roleLabel}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
