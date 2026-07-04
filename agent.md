# Aturan Pengembangan SIARSIP-SIDOREJO (untuk AI Agent)

## Siklus Wajib: Plan → Build → Test → Code Review → Git Commit → Push → GitHub CI → Verify

Setiap task yang diberikan WAJIB mengikuti 8 fase ini secara berurutan. Tidak boleh ada fase yang dilewati.

---

### 1. PLAN

- Baca `AGENTS.md` sebelum menulis kode apapun (mengandung aturan spesifik Next.js)
- Baca file terkait yang akan diubah/ditambahi
- Pahami struktur proyek:
  - `src/actions/` — server actions
  - `src/components/` — komponen React
  - `src/app/` — routing Next.js App Router
  - `src/lib/` — utilitas dan konfigurasi
  - `src/types/` — type definitions
  - `src/styles/` — styling global
  - `src/middleware.ts` — middleware
- Tampilkan rencana implementasi ke user untuk disetujui sebelum lanjut ke Build
- Gunakan `todowrite` untuk track progress task kompleks (3+ langkah)

### 2. BUILD

- Ikuti pattern dan konvensi kode yang sudah ada
- Jangan buat file baru jika bisa mengedit file yang sudah ada
- Gunakan TypeScript strict — semua tipe harus didefinisikan
- JANGAN tambahkan komentar kecuali diminta user
- Ikuti eksisting library: `@supabase/ssr`, `@supabase/supabase-js`, `clsx`, `tailwind-merge`, `lucide-react`, `framer-motion`, `pdf-lib`, `xlsx`, `tesseract.js`
- Next.js 16 — cek `node_modules/next/dist/docs/` jika ragu dengan API
- CSS menggunakan Tailwind CSS v4
- Jangan pernah hardcode secret/api key
- Setelah selesai, hapus debug code (`console.log`, `debugger`, dsb.)

### 3. TEST

Jalankan perintah berikut dan pastikan tidak ada error:

```bash
npm run lint
npm run build
```

Jika ada error, kembali ke fase Build untuk memperbaiki.

### 4. CODE REVIEW

- Periksa tidak ada commented-out code
- Periksa tidak ada `console.log` selain yang diminta
- Periksa tidak ada hardcoded credentials atau secret
- Periksa konsistensi import dan naming convention
- Periksa tidak ada file yang tidak sengaja berubah

### 5. GIT COMMIT

- JANGAN commit tanpa izin eksplisit dari user
- Sebelum commit: `git status`, `git diff`, `git log --oneline -10`
- Stage hanya file yang relevan (jangan stage file tak terkait)
- Format pesan commit:
  - `feat:` — fitur baru
  - `fix:` — perbaikan bug
  - `chore:` — tugas maintenance
  - `refactor:` — refaktor kode
  - `style:` — perubahan styling
  - `docs:` — perubahan dokumentasi
- Contoh: `feat: tambah form arsip surat masuk`
- Jangan gunakan `--amend`, `-i` (interactive), atau `--force`

### 6. PUSH

- Push hanya setelah commit berhasil: `git push origin <branch>`
- Pastikan branch sudah sesuai (biasanya `main` atau branch feature)
- Jika push gagal karena conflict, koordinasikan dengan user

### 7. GITHUB CI / TEST

- Setelah push, pantau GitHub Actions / CI pipeline jika ada
- Pastikan semua status check hijau
- Jika ada yang merah, laporkan ke user dan tawarkan bantuan perbaikan

### 8. VERIFY

- Konfirmasi ke user bahwa seluruh siklus telah selesai
- Laporkan:
  - Apa yang berubah (file + ringkasan)
  - Status lint & build
  - Status commit & push
  - Status CI

---

## Aturan Global

| Aturan | Keterangan |
|--------|-----------|
| Hak akses | Jangan membaca/mengubah file di luar folder proyek |
| Keamanan | Jangan pernah commit secret, key, atau token |
| Komunikasi | Gunakan bahasa Indonesia untuk respon dan dokumentasi |
| Emoji | Hanya gunakan jika user meminta |
| Proaktif | Boleh proaktif dalam siklus, tapi jangan commit tanpa izin |
| Referensi kode | Saat menyebut kode, sertakan `file:line_number` |

## Stack Teknologi

- **Framework:** Next.js 16.2.3 (App Router)
- **Bahasa:** TypeScript 5.x
- **CSS:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL) + Supabase SSR Auth
- **Library UI:** lucide-react, framer-motion, clsx, tailwind-merge
- **Lainnya:** pdf-lib, xlsx, tesseract.js, react-signature-canvas
- **Linting:** ESLint 9 + eslint-config-next
