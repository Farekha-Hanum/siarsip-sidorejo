# MANUAL BOOK: SIMPEL NU SIDOREJO
**Sistem Informasi Manajemen Pelajar Nahdlatul Ulama**

---

## DAFTAR ISI

**HALAMAN JUDUL** ................................................................. i  
**HALAMAN REVISI** ................................................................. ii  
**DAFTAR ISI** ........................................................................... iii  

**BAB 1: PENDAHULUAN**  
1.1 Tentang Aplikasi ................................................................. 1  
1.2 Tujuan Manual ..................................................................... 2  
1.3 Prasyarat Sistem ................................................................. 3  

**BAB 2: MEMULAI CEPAT**  
2.1 Login Pertama Kali ............................................................. 4  
2.2 Navigasi Dasar .................................................................... 6  

**BAB 3: PANDUAN FITUR**  
3.1 Dashboard ............................................................................ 8  
3.2 Manajemen Data (Surat Digital) ........................................ 12  
3.3 Laporan (Kegiatan & Skor) ................................................ 20  
3.4 Pengaturan .......................................................................... 28  

**BAB 4: ADMINISTRASI**  
4.1 Manajemen Pengguna ....................................................... 35  
4.2 Backup & Restore ................................................................ 42  

**BAB 5: TROUBLESHOOTING & FAQ**  
5.1 Troubleshooting ................................................................. 48  
5.2 FAQ ....................................................................................... 52  

**BAB 6: LAMPIRAN**  
6.1 Glosarium ........................................................................... 55  
6.2 Kontak Dukungan ............................................................... 57  

---

## HALAMAN JUDUL (i)

[SCREENSHOT: Halaman Landing Page Utama SIMPEL NU]

**SIMPEL NU SIDOREJO**  
*Sistem Informasi Manajemen Pelajar Nahdlatul Ulama Ranting Sidorejo*

Buku panduan ini dirancang untuk memberikan pemahaman menyeluruh mengenai penggunaan platform manajemen digital terintegrasi bagi pengurus IPNU-IPPNU Sidorejo.

**Disusun Oleh:**  
Tim Pengembangan IT PR IPNU IPPNU Sidorejo  

**Tahun:**  
2025

---

## HALAMAN REVISI (ii)

| Versi | Tanggal | Deskripsi Perubahan | Penulis |
|-------|---------|---------------------|---------|
| 1.0   | 03 Mei 2025 | Inisialisasi Manual Book Lengkap | Antigravity AI |
| 1.1   | 04 Mei 2025 | Ekspansi Detail Fitur & Template Screenshot | Antigravity AI |

---

## BAB 1: PENDAHULUAN

### 1.1 Tentang Aplikasi
**SIMPEL NU Sidorejo** (Sistem Informasi Manajemen Pelajar Nahdlatul Ulama) adalah sebuah solusi transformasi digital yang dibangun khusus untuk memenuhi kebutuhan administratif dan organisasi di tingkat Ranting Sidorejo. Aplikasi ini tidak hanya berfungsi sebagai gudang data statis, tetapi sebagai ekosistem aktif yang mengelola:
*   **Arsip Persuratan**: Digitalisasi seluruh surat masuk dan keluar dengan standarisasi format NU.
*   **Manajemen Kegiatan**: Pencatatan kehadiran real-time yang terhubung dengan sistem poin prestasi.
*   **Inventarisasi**: Pendataan aset organisasi agar lebih terukur dan terjaga.
*   **Database Pengurus**: Profiling anggota yang dinamis untuk memudahkan koordinasi.

### 1.2 Tujuan Manual
Buku panduan ini bertujuan untuk:
1.  Memastikan setiap pengurus mampu mengoperasikan fitur-fitur digital secara mandiri.
2.  Menjadi acuan standar dalam pengelolaan data organisasi agar tetap konsisten dan kredibel.
3.  Memudahkan proses serah terima jabatan (estafet kepengurusan) dengan dokumentasi sistem yang jelas.

### 1.3 Prasyarat Sistem
Untuk pengalaman pengguna yang paling mulus (smooth), aplikasi ini sangat disarankan dijalankan pada:
*   **Perangkat**: Laptop atau PC (untuk fitur pembuatan surat) dan Smartphone (untuk scanner dan input kegiatan).
*   **Browser**: Versi terbaru dari Google Chrome atau Microsoft Edge untuk mendukung animasi *glassmorphism* dan fungsi OCR.
*   **Koneksi**: Diperlukan akses internet aktif untuk sinkronisasi data ke cloud database.

---

## BAB 2: MEMULAI CEPAT

### 2.1 Login Pertama Kali
Langkah-langkah untuk masuk ke dalam sistem:
1.  Buka browser Anda dan masukkan alamat portal **SIMPEL NU**.
2.  Anda akan melihat layar login dengan tema hijau NU yang elegan.
3.  Masukkan **Username** dan **Password** yang telah didaftarkan oleh Admin IT.
4.  Klik tombol emas bertuliskan **"Masuk ke Sistem"**.

[SCREENSHOT: Layar Login Aplikasi]

> [!IMPORTANT]
> Jangan bagikan kredensial login Anda kepada siapa pun untuk menjaga keamanan arsip surat dan integritas skor kegiatan.

### 2.2 Navigasi Dasar
Setelah masuk, Anda akan menemui antarmuka dengan struktur sebagai berikut:
*   **Sidebar Navigasi**: Terletak di sisi kiri (PC) atau bagian atas (Mobile). Digunakan untuk berpindah antar modul (Dashboard, Surat, Kegiatan, dll).
*   **Header Panel**: Menampilkan nama modul yang sedang dibuka dan informasi akun Anda.
*   **Main Content**: Area kerja utama tempat Anda melihat data atau mengisi formulir.

[SCREENSHOT: Tampilan Keseluruhan Antarmuka / Dashboard Utama]

---

## BAB 3: PANDUAN FITUR

### 3.1 Dashboard
Dashboard adalah pusat informasi cepat. Di sini Anda bisa melihat:
*   **Ringkasan Statistik**: Total surat yang telah diarsipkan dan jumlah anggota aktif.
*   **Shortcut Cepat**: Tombol pintas untuk langsung membuat surat tugas atau input kegiatan tanpa harus membuka menu satu per satu.
*   **Nuansa Visual**: Desain menggunakan gradasi hijau gelap dengan aksen emas, mencerminkan identitas kebanggaan Nahdlatul Ulama.

[SCREENSHOT: Area Dashboard dengan Widget Statistik]

### 3.2 Manajemen Data (Surat Digital)
Modul ini adalah jantung dari sistem kearsipan. Terbagi menjadi tiga bagian utama:

#### A. Arsip Surat
Tempat menyimpan dan mencari surat-surat lama. Surat dikategorikan berdasarkan entitas: **IPNU**, **IPPNU**, dan **Gabungan**.
[SCREENSHOT: Tabel Daftar Arsip Surat]

#### B. Pembuatan Surat Otomatis
Anda tidak perlu lagi mengetik surat secara manual di Microsoft Word. Cukup isi formulir:
1.  Pilih jenis surat (contoh: **Surat Undangan**).
2.  Sistem akan secara otomatis menentukan **Nomor Surat** berikutnya berdasarkan database.
3.  Isi detail acara, tanggal, dan tujuan surat.
4.  Klik **"Generate PDF"** untuk mengunduh surat dengan kop dan format yang sudah sempurna.
[SCREENSHOT: Formulir Input Pembuatan Surat Baru]

#### C. Scanner OCR
Fitur canggih untuk mengubah dokumen fisik menjadi digital. Cukup foto surat fisik Anda, dan sistem akan mengekstrak teksnya secara otomatis untuk disimpan ke arsip digital.
[SCREENSHOT: Fitur Scanner / Upload Gambar OCR]

### 3.3 Laporan (Kegiatan & Skor)
Fitur ini digunakan untuk memantau keaktifan anggota melalui sistem poin.

#### Bagi Anggota (User):
1.  Buka menu **"Input Kegiatan"**.
2.  Pilih kegiatan yang sedang berlangsung.
3.  Klik tombol **"Konfirmasi Hadir"**. Status Anda akan berubah menjadi "Menunggu Validasi".
[SCREENSHOT: Halaman Daftar Kegiatan bagi User]

#### Bagi Admin:
1.  Buka menu **"Reward Anggota"**.
2.  Tinjau daftar kehadiran yang diajukan oleh pengurus.
3.  Klik **"Approve"** untuk memberikan poin secara otomatis ke profil anggota tersebut.
[SCREENSHOT: Panel Validasi Kehadiran bagi Admin]

#### Leaderboard:
Setiap kehadiran bernilai poin tertentu. Anggota yang mencapai target **70 Poin** akan mendapatkan gelar **"Anggota Terbest"** dan berhak mendapatkan sertifikat digital otomatis dari sistem.
[SCREENSHOT: Papan Peringkat / Leaderboard Anggota]

### 3.4 Pengaturan & Profil
Di sini Anda dapat memperbarui foto profil dan informasi kontak agar database pengurus tetap akurat. Jika sudah selesai menggunakan sistem, pastikan untuk menekan tombol **"Logout"** di bagian bawah sidebar.

---

## BAB 4: ADMINISTRASI

### 4.1 Manajemen Pengguna (Admin)
Admin memiliki otoritas untuk menambah anggota baru, mengubah jabatan, atau menonaktifkan akun yang sudah tidak bertugas. Data ini sangat krusial karena terhubung langsung dengan sistem tandatangan digital pada surat.
[SCREENSHOT: Halaman Manajemen Data Pengurus]

### 4.2 Backup & Restore
Seluruh data disimpan di infrastruktur cloud yang aman. Admin disarankan untuk melakukan pengecekan arsip secara berkala setiap akhir masa khidmah untuk memastikan data tidak ada yang terlewat.

---

## BAB 5: TROUBLESHOOTING & FAQ

### 5.1 Troubleshooting
1.  **Halaman Blank Putih**: Biasanya terjadi karena koneksi internet terputus saat memuat aset gambar. Coba tekan `Ctrl + R` untuk refresh.
2.  **Surat Tidak Bisa Diunduh**: Pastikan browser Anda memberikan izin *Pop-up* untuk aplikasi ini.
3.  **OCR Tidak Terbaca**: Pastikan foto dokumen tegak lurus, tidak blur, dan pencahayaan cukup.

### 5.2 FAQ
*   **Apakah aplikasi ini bisa diakses di luar Sidorejo?**  
    Bisa, selama Anda memiliki koneksi internet dan akun yang valid.
*   **Bagaimana jika saya salah input poin?**  
    Admin dapat melakukan koreksi data melalui panel database atau menu validasi ulang.

---

## BAB 6: LAMPIRAN

### 6.1 Glosarium
*   **OCR**: *Optical Character Recognition* (Teknologi konversi gambar teks menjadi data teks).
*   **Glassmorphism**: Gaya desain UI transparan seperti kaca yang digunakan pada SIMPEL NU.
*   **Leaderboard**: Papan peringkat prestasi anggota.

### 6.2 Kontak Dukungan
Hubungi Departemen IT Ranting Sidorejo jika Anda menemui kendala teknis yang tidak dapat diatasi sendiri.
*   **WhatsApp**: 08xx-xxxx-xxxx (Admin Utama)
*   **Email**: it.ranting@sidorejo.nu.id

---
**© 2025 SIMPEL NU SIDOREJO - Mengabdi dengan Teknologi.**
