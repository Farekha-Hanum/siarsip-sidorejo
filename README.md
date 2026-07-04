# SIARSIP-SIDOREJO

**Arsip Surat Digital PR IPNU IPPNU Desa Sidorejo**

Aplikasi manajemen arsip surat digital untuk Pimpinan Ranting IPNU dan IPPNU Desa Sidorejo, Kecamatan Tirto, Kabupaten Pekalongan. Mengubah administrasi manual berbasis kertas menjadi _workflow_ digital yang terintegrasi.

## Fitur

- **Arsip Surat** — Penyimpanan dan pencarian arsip surat digital.
- **Buat Surat** — Pembuatan surat resmi dengan _auto-numbering_ dan arsip digital.
- **Scan OCR** — Pemindaian surat masuk dengan pembacaan teks otomatis.
- **Manajemen Pengurus** — Data kepengurusan organisasi IPNU dan IPPNU.
- **Inventaris** — Pencatatan aset dan perlengkapan organisasi.
- **Daftar Kegiatan & Reward Anggota** — Pencatatan partisipasi kegiatan, validasi, _leaderboard_ skor, dan unduhan sertifikat.

## Tech Stack

| Kategori        | Teknologi                                              |
| --------------- | ------------------------------------------------------ |
| Framework       | Next.js 16, React 19, TypeScript                       |
| Database & Auth | Supabase (Auth, PostgreSQL, Storage)                   |
| Styling         | Tailwind CSS 4, Framer Motion, Lucide React            |
| PDF & OCR       | pdf-lib, Tesseract.js                                  |
| Lainnya         | react-signature-canvas, xlsx, clsx, tailwind-merge     |

## Prasyarat

- Node.js 20+
- Akun [Supabase](https://supabase.com) (free tier cukup)

## Variabel Lingkungan

Buat file `.env.local` di root proyek:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Cara Menjalankan

```bash
npm install
cp .env.example .env.local   # lalu isi variabel lingkungan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Setup Database

Jalankan SQL berikut di Supabase SQL Editor secara berurutan:

1. `migration_schema.sql` — skema dasar
2. `update_schema_v2.sql` — tambahan kolom dan tabel
3. `update_schema_v3.sql` — jenis surat `digital` dan perbaikan RLS
4. `update_data_pengurus.sql` — kolom NIA, organisasi, tanggal bergabung
5. `fix_leaderboard_and_validation.sql` — _view_ leaderboard dan RLS
6. `update_storage_rls.sql` — kebijakan storage bucket

## Struktur Proyek

```
src/
├── app/                  # Halaman (App Router)
│   ├── (auth)/           # Login & Register
│   ├── admin/            # Dashboard admin
│   └── user/             # Dashboard user
├── actions/              # Server Actions (CRUD + auth)
├── components/           # Komponen UI
├── lib/                  # Utilitas & konfigurasi
│   └── supabase/         # Klien Supabase (client & server)
└── middleware.ts         # Proteksi rute + RBAC
```

## Role & Akses

### Admin
- Kelola arsip surat, buat surat, scan OCR
- Kelola pengurus, inventaris, kegiatan
- Validasi partisipasi kegiatan anggota

### User
- Partisipasi kegiatan
- Scan OCR surat masuk
- Lihat daftar inventaris
- Buat surat

## Akun Testing

Jalankan skema migrasi dulu, lalu:

```bash
node seed_users.mjs
```

| Role  | Email                       | Password   |
| ----- | --------------------------- | ---------- |
| Admin | `adminsimpelnu@gmail.com`   | `admin1234` |
| User  | `putri.melati@gmail.com`    | `putri1234` |
| User  | `ahmad.hanafi@gmail.com`    | `hanafi123` |

## CI/CD

Setiap _push_ ke branch `main` menjalankan:

- `npm ci`
- `npm run lint`
- `npm run build`

---

**Pengembang**

```
NAMA  : SITI YULIA FAREKHA HANUM
NIM   : 101230062
KELAS : TF23B
```

