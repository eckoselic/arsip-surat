import { Navbar } from "@/components/Navbar";

export default function KepsekLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar roleLabel="Kepala Sekolah" />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
