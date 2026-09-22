import { SuratTable } from "@/components/SuratTable";

export default function TuDashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Arsip Surat Masuk & Keluar</h1>
      <SuratTable basePath="/tu" />
    </div>
  );
}
