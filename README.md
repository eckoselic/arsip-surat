# Arsip Surat — SDN Jatinegara Kaum 07 Pagi

Aplikasi web untuk mengelola arsip surat masuk dan surat keluar sekolah:
input surat, upload scan, pencarian, disposisi oleh Kepala Sekolah, dan
cetak rekap PDF berkop surat resmi.

Stack: **Next.js 14 (App Router) + Supabase (Database & Storage) + Vercel**,
semua di tier gratis.

## Peran & Akses

Aplikasi ini **tidak** memakai sistem akun/login penuh (Supabase Auth),
karena masing-masing peran hanya diisi oleh 1 orang. Sebagai gantinya,
setiap peran punya **kode akses (passcode)** sendiri:

- **Admin TU** — input, edit, hapus surat, upload scan, cetak rekap
- **Kepala Sekolah** — lihat semua arsip surat, isi/ubah disposisi, cetak rekap

Passcode diverifikasi di server (bukan di browser) dan sesi login disimpan
sebagai cookie yang ditandatangani (HMAC), jadi tidak bisa dipalsukan.

## 1. Setup Supabase

1. Buka [supabase.com](https://supabase.com) → buat project baru (gratis).
2. Buka **SQL Editor**, jalankan seluruh isi file `supabase/schema.sql` di
   repo ini. Ini akan membuat tabel `surat` beserta trigger dan RLS-nya.
3. Buka **Storage** → buat bucket baru bernama `arsip-surat`, set sebagai
   **Private** (bukan public). Tidak perlu bikin storage policy tambahan —
   semua upload/baca file dilakukan lewat server pakai `service_role key`,
   bukan langsung dari browser.
4. Buka **Project Settings > API**, catat:
   - `Project URL`
   - `anon public key`
   - `service_role key` (⚠️ rahasia, jangan pernah expose ke client)

## 2. Setup environment variables

Salin `.env.local.example` menjadi `.env.local`, lalu isi:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

TU_PASSCODE=buat_sendiri_bebas
KEPSEK_PASSCODE=buat_sendiri_bebas_beda_dari_atas

SESSION_SECRET=32_karakter_hex_acak
```

Untuk `SESSION_SECRET`, generate string acak, misalnya lewat:

```bash
openssl rand -hex 32
```

## 3. Jalankan secara lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — akan diarahkan ke
halaman login. Masukkan `TU_PASSCODE` atau `KEPSEK_PASSCODE` sesuai peran.

## 4. Deploy ke Vercel (gratis)

1. Push folder ini ke repo GitHub baru.
2. Buka [vercel.com](https://vercel.com) → Import Project → pilih repo tsb.
3. Di **Settings > Environment Variables**, isi semua variabel yang sama
   seperti `.env.local` (jangan commit file `.env.local` ke git — sudah
   diabaikan lewat `.gitignore`).
4. Deploy. Setiap push ke branch utama akan otomatis build ulang.

## Struktur fitur

- `app/tu/*` — dashboard & form khusus Admin TU (proteksi lewat `middleware.ts`)
- `app/kepsek/*` — dashboard & halaman disposisi khusus Kepala Sekolah
- `app/api/surat/*` — CRUD surat (semua otorisasi dicek di server, lihat `lib/session.ts`)
- `app/api/upload` — upload scan surat ke Supabase Storage
- `app/api/rekap/pdf` — generate PDF rekap dengan kop surat resmi (`@react-pdf/renderer`)
- `public/assets/kop-surat.png` — gambar kop surat resmi yang dipakai di PDF rekap.
  Ganti file ini kalau kop surat berubah (ukuran rasio lebar disarankan mengikuti file asli).

## Catatan keamanan

- Tabel `surat` di Supabase sengaja diaktifkan RLS **tanpa policy sama sekali** —
  ini disengaja karena satu-satunya akses ke tabel ini adalah lewat
  `service_role key` di server (route handler), yang otomatis melewati RLS.
  Anon key dari browser tidak akan pernah bisa membaca/menulis tabel ini
  secara langsung.
- Bucket storage bersifat private; file dibaca lewat *signed URL* yang
  dibuat server-side dan berlaku 1 jam.
- Ganti `TU_PASSCODE`, `KEPSEK_PASSCODE`, dan `SESSION_SECRET` secara berkala
  jika dirasa perlu, dan jangan bagikan passcode lewat chat/media yang tidak aman.
