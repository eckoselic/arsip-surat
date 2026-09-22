export type JenisSurat = "masuk" | "keluar";

export interface Surat {
  id: string;
  jenis: JenisSurat;
  nomor_surat: string;
  tanggal_surat: string; // tanggal yang tertera di surat
  tanggal_terima: string | null; // khusus surat masuk
  perihal: string;
  pengirim_tujuan: string; // pengirim (surat masuk) / tujuan (surat keluar)
  kategori: string;
  file_url: string | null;
  file_nama: string | null;
  disposisi_untuk: string | null;
  disposisi_catatan: string | null;
  disposisi_status: "belum" | "sudah";
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface SuratInput {
  jenis: JenisSurat;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_terima?: string | null;
  perihal: string;
  pengirim_tujuan: string;
  kategori: string;
  file_url?: string | null;
  file_nama?: string | null;
}

export interface DisposisiInput {
  disposisi_untuk: string;
  disposisi_catatan: string;
}
