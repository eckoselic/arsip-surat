import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arsip Surat - SDN Jatinegara Kaum 07 Pagi",
  description: "Sistem manajemen arsip surat masuk dan keluar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
