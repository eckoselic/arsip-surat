-- Jalankan file ini di Supabase Dashboard > SQL Editor

create extension if not exists "pgcrypto";

create table if not exists arsip_surat (
  id uuid primary key default gen_random_uuid(),
  jenis text not null check (jenis in ('masuk', 'keluar')),
  nomor_surat text not null,
  tanggal_surat date not null,
  tanggal_terima date, -- hanya diisi untuk surat masuk
  perihal text not null,
  pengirim_tujuan text not null, -- pengirim (surat masuk) / tujuan (surat keluar)
  kategori text not null,
  file_url text,
  file_nama text,
  disposisi_untuk text,
  disposisi_catatan text,
  disposisi_status text not null default 'belum' check (disposisi_status in ('belum', 'sudah')),
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);

create index if not exists arsip_surat_jenis_idx on arsip_surat (jenis);
create index if not exists arsip_surat_tanggal_surat_idx on arsip_surat (tanggal_surat);
create index if not exists arsip_surat_kategori_idx on arsip_surat (kategori);

-- Trigger sederhana supaya diperbarui_pada otomatis terupdate tiap kali baris diubah
create or replace function set_diperbarui_pada()
returns trigger
language plpgsql
as $$
begin
  new.diperbarui_pada = now();
  return new;
end;
$$;

drop trigger if exists arsip_surat_set_diperbarui_pada on arsip_surat;
create trigger arsip_surat_set_diperbarui_pada
before update on arsip_surat
for each row execute function set_diperbarui_pada();

-- RLS diaktifkan TANPA policy sama sekali secara sengaja: aplikasi ini pakai
-- Pola B (passcode di server, bukan Supabase Auth), jadi satu-satunya akses ke
-- tabel ini adalah lewat service_role key di route handler (lib/supabase/admin.ts),
-- yang otomatis bypass RLS. anon key / browser TIDAK PERNAH boleh menyentuh
-- tabel ini langsung, sehingga "tanpa policy" di sini berarti "akses publik
-- ditolak total", bukan kelalaian.
alter table arsip_surat enable row level security;

-- Catatan setup Supabase Storage:
-- 1. Buat bucket baru bernama "arsip-surat" (Storage > New bucket), set PRIVATE (bukan public).
-- 2. Tidak perlu storage policy tambahan: file diupload & dibaca lewat signed URL
--    yang dibuat server-side (service_role key), bukan lewat akses langsung dari browser.
