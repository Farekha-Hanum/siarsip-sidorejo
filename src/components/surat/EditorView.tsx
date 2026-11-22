"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Download, FileText, Star, CheckCircle, Search, RefreshCcw, Users, Layers } from "lucide-react";
import { ORG_CONFIGS, toRoman, type OrgType } from "@/lib/org-config";
import { saveLetter } from "@/actions/letter";
import { getNextLetterSequence } from "@/actions/letter-count";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditorView({ org }: { org: string }) {
  const config = ORG_CONFIGS[org as OrgType] || ORG_CONFIGS.gabungan;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const jenisSuratParam = searchParams.get("jenis");
  const kodeParam = searchParams.get("kode");

  function parseMarkdown(text: string) {
    if (!text) return "";
    const cleaned = text.replace(/\[\/?center\]/gi, "").replace(/<\/?center>/gi, "");
    let html = cleaned.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
    html = html.replace(/_(.*?)_/g, "<em>$1</em>");
    return html;
  }

  // State Management
  const [noSuratStr, setNoSuratStr] = useState("");
  const [lampiran, setLampiran] = useState("-");
  const [perihal, setPerihal] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [isiSurat, setIsSurat] = useState("");

  // Kop Surat Data
  const isGabungan = org === "gabungan";
  const [kopTingkat1, setKopTingkat1] = useState(
    isGabungan ? "PANITIA KEGIATAN" : config.tingkat1
  );
  const [kopOrgText, setKopOrgText] = useState(config.orgText);
  const [kopOrgText2, setKopOrgText2] = useState(
    config.orgText2 || (isGabungan ? "IKATAN PELAJAR PUTRI NAHDLATUL ULAMA" : "")
  );
  const [kopSubOrg, setKopSubOrg] = useState(
    isGabungan ? "DESA SIDOREJO KECAMATAN TIRTO" : config.subOrg
  );
  const [kopAlamat1, setKopAlamat1] = useState(isGabungan ? "" : config.alamat1);
  const [kopWilayah, setKopWilayah] = useState(config.wilayah);
  const [kopKontakWa, setKopKontakWa] = useState(config.kontakWa || "088291260072/0882006754145");
  const [kopKontakEmail, setKopKontakEmail] = useState(config.kontakEmail || "ipnuippnusidorejotirto@gmail.com");
  const [kopKontakWebsite, setKopKontakWebsite] = useState(config.kontakWebsite || "ipnuippnusidorejo.or.id");
  const [kopSekretariat, setKopSekretariat] = useState(
    config.sekretariat || "Jl. Raya Sidorejo Rt.05 Rw.02 No.33 Kec.Tirto Kab.Pekalongan 51151"
  );

  // Logo States (untuk Gabungan / Custom)
  const [logoKiri, setLogoKiri] = useState<string | null>(isGabungan ? "/logo-binari.png" : null);
  const [logoTengah, setLogoTengah] = useState<string | null>(null);
  const [logoKanan, setLogoKanan] = useState<string | null>(null);
  const [logoMode, setLogoMode] = useState<"kegiatan" | "dual">(isGabungan ? "kegiatan" : "dual");

  // TTD Section
  const [ttdWilayah, setTtdWilayah] = useState(config.wilayah.split(" ").pop() || "Sidorejo");
  const [ttdTanggal, setTtdTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [ttdTanggalHijriah, setTtdTanggalHijriah] = useState("18 Dzulqa'dah 1446 H");

  // Kepanitiaan vs Standar TTD
  const [useKepanitiaanTTD, setUseKepanitiaanTTD] = useState(isGabungan);
  const [ttdPanitiaJudul, setTtdPanitiaJudul] = useState(isGabungan ? "PANITIA BINARI" : "PANITIA KEGIATAN");

  // Penandatangan 1 (Ketua Pelaksana atau Ketua Ranting)
  const [ttd1Jabatan, setTtd1Jabatan] = useState(isGabungan ? "Ketua Pelaksana" : "Ketua");
  const [ttd1Nama, setTtd1Nama] = useState(isGabungan ? "AMIN ROZI" : "");
  const [ttd1Nia, setTtd1Nia] = useState("");

  // Penandatangan 2 (Sekretaris Pelaksana atau Sekretaris Ranting)
  const [ttd2Jabatan, setTtd2Jabatan] = useState(isGabungan ? "Sekretaris" : "Sekretaris");
  const [ttd2Nama, setTtd2Nama] = useState(isGabungan ? "NADA HANIYAH" : "");
  const [ttd2Nia, setTtd2Nia] = useState("");

  // Penandatangan 3 (Mengetahui: Ketua IPNU)
  const [ttd3Jabatan, setTtd3Jabatan] = useState("Ketua IPNU");
  const [ttd3Nama, setTtd3Nama] = useState("M. SAIFULLAH");
  const [ttd3Nia, setTtd3Nia] = useState("");

  // Penandatangan 4 (Mengetahui: Ketua IPPNU)
  const [ttd4Jabatan, setTtd4Jabatan] = useState("Ketua IPPNU");
  const [ttd4Nama, setTtd4Nama] = useState("FENI LIDYANA");
  const [ttd4Nia, setTtd4Nia] = useState("33 26 2103 4070");

  // States for Modals & Data
  const [pengurus, setPengurus] = useState<any[]>([]);
  const [activeSearchSlot, setActiveSearchSlot] = useState<1 | 2 | 3 | 4 | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // TEMPLATES RESMI DARI LPJ BINARI 2025 & FORMAT RANTING SIDOREJO
  const templates: Record<string, any> = {
    PMP: {
      h: "PERMOHONAN MENJADI PEMATERI",
      t: "Ustadz M. Fathurrozi\ndi -\n\tTempat",
      i: `Salam silaturrahim kami sampaikan semoga tetap dalam lindungan Allah SWT. dan selalu dalam risalah Rasulullah SAW. Aamiin.

Sehubungan akan diadakannya kegiatan *BINARI IPNU-IPPNU Ranting Sidorejo*, maka kami selaku panitia memohon kepada Bapak/Ibu/Saudara/i untuk mengisi materi *"Aswaja & Ke-NU-an"* pada :

Hari\t: Jum'at
Tanggal\t: 18 Dzulqa'dah 1446 H
\t  16 Mei 2025 M
Tempat\t: TPQ An-Nidhomiyah Sidorejo
Waktu\t: 21.15 WIB – Selesai

Demikian pemberitahuan ini kami sampaikan, atas perhatiannya, kami ucapkan terima kasih.`
    },
    UND: {
      h: "UNDANGAN",
      t: "Pimpinan Ranting Muslimat Desa Sidorejo\ndi -\n\tTempat",
      i: `Salam silaturrahim kami sampaikan semoga tetap dalam lindungan Allah SWT. dan selalu dalam risalah Rasulullah SAW. Aamiin.

Selanjutnya kami selaku *PANITIA BINARI IPNU-IPPNU Ranting Sidorejo* bermaksud mengadakan kegiatan BINARI (Binaan Sehari) yang akan dilaksanakan insya Allah pada :

Hari\t: Jum'at
Tanggal\t: 18 Dzulqa'dah 1446 H
\t  16 Mei 2025 M
Waktu\t: 13.30 WIB s.d Selesai
Tempat\t: TPQ An-Nidhomiyah Sidorejo

Oleh karena itu kami segenap panitia memohon kehadiran Bapak/Ibu pada acara *Pembukaan Acara BINARI IPNU-IPPNU Ranting Sidorejo*. Demikian permohonan dari kami. Atas kerjasamanya, kami mengucapkan terima kasih.`
    },
    PBK: {
      h: "PEMBERITAHUAN KEGIATAN",
      t: "Pimpinan Anak Cabang IPNU IPPNU Kec. Tirto\ndi -\n\tTirto",
      i: `Puji syukur kehadirat Allah SWT semoga kita senantiasa dalam lindungan-Nya. Sholawat serta salam semoga tetap terlimpah kepada junjungan kita Nabi Agung Muhammad SAW, dan kita mendapat syafaat beliau di yaumil qiyamah nanti. Aamiin.

Berdasarkan hasil rapat Pimpinan Ranting pada tanggal 9 Mei 2025 di Rumah Rekanita Zahratun Nufus, memutuskan akan diadakannya kegiatan *BINARI (Binaan Sehari)* yang akan dilaksanakan insya Allah pada :

Hari\t: Jum'at s/d Sabtu
Tanggal\t: 18–19 Dzulqa'dah 1446 H
\t  16–17 Mei 2025 M
Waktu\t: 13.30 WIB s.d Selesai
Tempat\t: TPQ An-Nidhomiyah Sidorejo

Demikian pemberitahuan ini kami sampaikan, atas perhatiannya, kami ucapkan terima kasih.`
    },
    PIT: {
      h: "PERMOHONAN IZIN TEMPAT DAN FASILITAS",
      t: "Kepala Madrasah / TPQ An-Nidhomiyah\ndi -\n\tTempat",
      i: `Salam silaturrahim kami sampaikan semoga tetap dalam lindungan Allah SWT. dan selalu dalam risalah Rasulullah SAW. Aamiin.

Selanjutnya kami selaku Panitia BINARI IPNU-IPPNU Ranting Sidorejo bermaksud mengadakan kegiatan *BINARI (Binaan Sehari)* untuk siswa/siswi kelas 6 MI Salafiyah Sidorejo dan SD N Sidorejo yang akan dilaksanakan insya Allah pada :

Hari\t: Jum'at s/d Sabtu
Tanggal\t: 18–19 Dzulqa'dah 1446 H
\t  16–17 Mei 2025 M
Tempat\t: TPQ An-Nidhomiyah Sidorejo
Waktu\t: 13.00 WIB – Selesai

Oleh karena itu, kami atas nama Panitia memohon izin tempat berupa Gedung dan segala fasilitas pendukung lainnya demi kelancaran kegiatan tersebut. Demikian surat permohonan ini kami sampaikan, atas perhatian dan izin yang diberikan kami haturkan terima kasih.`
    },
    PIO: {
      h: "PEMBERITAHUAN DAN PERMOHONAN IZIN ORANG TUA",
      t: "Orang Tua / Wali Peserta Binari\ndi -\n\tTempat",
      i: `Salam silaturrahim kami sampaikan semoga tetap dalam lindungan Allah SWT. dan selalu dalam risalah Rasulullah SAW. Aamiin.

Selanjutnya kami selaku Panitia BINARI IPNU-IPPNU Ranting Sidorejo bermaksud mengadakan kegiatan *BINARI (Binaan Sehari)* untuk siswa/siswi kelas 6 MI Salafiyah Sidorejo dan SD N Sidorejo yang akan dilaksanakan insya Allah pada :

Hari\t: Jum'at s/d Sabtu
Tanggal\t: 18–19 Dzulqa'dah 1446 H
\t  16–17 Mei 2025 M
Tempat\t: TPQ An-Nidhomiyah Sidorejo
Waktu\t: 13.00 WIB – Selesai

Oleh karena itu kami segenap panitia memberitahukan dan memohon izin kepada Orang Tua / Wali untuk mengikutsertakan putra/putrinya dalam kegiatan tersebut. Demikian pemberitahuan dan permohonan ini kami sampaikan, atas izin dan kerjasamanya kami ucapkan terima kasih.`
    },
    PKN: {
      h: "PERMOHONAN KONSUMSI",
      t: "Ibu / Sahabat Dermawan\ndi -\n\tTempat",
      i: `Salam silaturrahim kami sampaikan semoga tetap dalam lindungan Allah SWT. dan selalu dalam risalah Rasulullah SAW. Aamiin.

Sehubungan akan diadakannya kegiatan *BINARI IPNU-IPPNU Ranting Sidorejo*, maka kami selaku panitia memohon kepada Ibu / Sahabat untuk memberikan bantuan konsumsi berupa nasi sebanyak ... bungkus pada :

Hari\t: Jum'at
Tanggal\t: 18 Dzulqa'dah 1446 H
\t  16 Mei 2025 M
Tempat\t: TPQ An-Nidhomiyah Sidorejo
Waktu\t: 16.00 WIB

Demikian permohonan ini kami sampaikan, atas perhatian dan keikhlasannya, kami ucapkan terima kasih.`
    },
    PRP: {
      h: "PERMOHONAN BANTUAN DANA & PROPOSAL KEGIATAN",
      t: "Bapak / Ibu / Donatur / Tokoh Masyarakat\ndi -\n\tTempat",
      lamp: "1 (Satu) Berkas",
      i: `Salam silaturrahim teriring doa kami sampaikan semoga Bapak/Ibu senantiasa dalam lindungan Allah SWT, serta sukses dalam menjalankan aktifitas sehari-hari. Aamiin.

Dalam rangka meningkatkan mutu kualitas generasi muda Nahdlatul Ulama serta menanamkan nilai-nilai Aswaja an-Nahdliyyah, kami Pimpinan Ranting IPNU-IPPNU Desa Sidorejo bermaksud menyelenggarakan kegiatan *Binaan Sehari (BINARI) Tahun 2025* dengan tema :
*"Membentuk Generasi Pelajar Nahdliyin yang Unggul, Berkarakter, dan Berakhlakul Karimah"*

yang insya Allah akan dilaksanakan pada :
Hari\t\t: Jum'at s/d Sabtu
Tanggal\t\t: 18–19 Dzulqa'dah 1446 H / 16–17 Mei 2025 M
Waktu\t\t: 13.00 WIB – Selesai
Tempat\t\t: TPQ An-Nidhomiyah Sidorejo

Sehubungan dengan hal tersebut, demi kelancaran dan kesuksesan kegiatan dimaksud, kami memohon bantuan dan partisipasi dana dari Bapak/Ibu/Sahabat. Bersama surat ini kami lampirkan 1 (satu) berkas proposal kegiatan sebagai bahan pertimbangan.

Demikian permohonan ini kami sampaikan, atas perhatian, bantuan, dan keikhlasan Bapak/Ibu kami haturkan terima kasih.`
    },
    PRP_FULL: {
      h: "PROPOSAL KEGIATAN BINAAN SEHARI (BINARI)",
      t: "",
      lamp: "-",
      i: `*PROPOSAL KEGIATAN BINAAN SEHARI (BINARI)*
*PR IPNU & IPPNU DESA SIDOREJO KECAMATAN TIRTO*
*PERIODE 2024–2026*

*A. LATAR BELAKANG*
Pelajar merupakan generasi penerus bangsa dan tonggak perjuangan Nahdlatul Ulama. Di tengah tantangan era digital, pembinaan karakter, moralitas, dan pemahaman ajaran Islam Ahlussunnah wal Jama'ah menjadi kebutuhan mendesak bagi generasi muda. Oleh karena itu, PR IPNU-IPPNU Desa Sidorejo menyelenggarakan program *BINARI (Binaan Sehari)* sebagai wadah kaderisasi dan edukasi yang berkelanjutan.

*B. TEMA KEGIATAN*
*"Membentuk Generasi Pelajar Nahdliyin yang Unggul, Berkarakter, dan Berakhlakul Karimah"*

*C. MAKSUD DAN TUJUAN*
1. Menanamkan nilai-nilai Aswaja an-Nahdliyyah sejak dini kepada pelajar generasi muda.
2. Mempererat ukhuwah Islamiyah dan tali silaturahim antarpelajar se-Desa Sidorejo.
3. Mengenalkan organisasi IPNU dan IPPNU sebagai wadah positif pengembangan potensi diri.
4. Menumbuhkan kesadaran berorganisasi, kedisiplinan, dan jiwa kepemimpinan pelajar.

*D. WAKTU DAN TEMPAT PELAKSANAAN*
Hari / Tanggal\t: Jum'at s/d Sabtu, 16–17 Mei 2025 M (18–19 Dzulqa'dah 1446 H)
Waktu\t\t: 13.00 WIB – Selesai
Tempat\t\t: TPQ An-Nidhomiyah Desa Sidorejo

*E. SASARAN PESERTA*
Siswa/siswi kelas 6 MI Salafiyah Sidorejo, SD N Sidorejo, serta remaja se-Desa Sidorejo (Estimasi 60 peserta).

---

*F. SUSUNAN PANITIA PELAKSANA (ORGANIZING COMMITTEE)*
*Pelindung*\t\t: Pimpinan Ranting Nahdlatul Ulama Desa Sidorejo
*Penasehat*\t\t: Pembina PR IPNU & IPPNU Desa Sidorejo
*Penanggung Jawab*\t: Ketua PR IPNU & Ketua PR IPPNU Desa Sidorejo
*Ketua Pelaksana*\t: Rekan Amin Rozi
*Sekretaris Pelaksana*\t: Rekanita Nada Haniyah
*Bendahara Pelaksana*\t: Rekanita Siti Nafisah
*Seksi Acara*\t\t: Rekan M. Bagus Setiawan & Rekanita Dwi Lestari
*Seksi Perlengkapan*\t: Rekan Ahmad Zaki & Rekan Rizqi Pratama
*Seksi Konsumsi*\t\t: Rekanita Ainun Nabila & Rekanita Zulfa
*Seksi Dokumentasi*\t: Rekan M. Saifullah & Rekan Wildan
*Seksi Keamanan*\t\t: Komandan CBP & KPP Ranting Sidorejo

*G. JADWAL & RANGKAIAN ACARA KEGIATAN*
1. *Jum'at, 16 Mei 2025*
   • 13.00 – 14.00 WIB : Registrasi Peserta & Check-in
   • 14.00 – 15.30 WIB : Pembukaan Resmi & Sambutan-sambutan
   • 15.30 – 16.30 WIB : Sholat Ashar Berjamaah & Ice Breaking
   • 16.30 – 17.45 WIB : Materi 1: Ke-NU-an & Ke-Aswaja-an (Ust. M. Fathurrozi)
   • 17.45 – 19.30 WIB : Ishoma (Sholat Maghrib, Khotmil Qur'an & Sholat Isya')
   • 19.30 – 21.30 WIB : Materi 2: Kepemimpinan & Keorganisasian IPNU-IPPNU
   • 21.30 – 23.00 WIB : Pentas Seni Santri & Api Unggun Pelajar

2. *Sabtu, 17 Mei 2025*
   • 04.00 – 05.30 WIB : Qiyamul Lail, Sholat Subuh & Kuliah Fajar
   • 05.30 – 06.30 WIB : Senam Pagi Ceria & Operasi Semut Bersih Lingkungan
   • 06.30 – 07.30 WIB : Sarapan Pagi Bersama
   • 07.30 – 10.30 WIB : Outbound Edukatif & Fun Games Kerja Sama Tim
   • 10.30 – 11.30 WIB : Bersih Diri & Persiapan Penutupan
   • 11.30 – 12.30 WIB : Upacara Penutupan, Pembagian Sertifikat & Doa Bersama

---

*H. RANCANGAN ANGGARAN BIAYA (RAB)*
*1. Kesekretariatan & Administrasi*
   • Penggandaan Proposal, Kertas F4 & Surat-Menyurat\t: Rp 150.000
   • ID Card Peserta & Panitia (75 pcs x Rp 2.000)\t\t: Rp 150.000
   • Sertifikat Peserta & Piagam Pemateri\t\t\t: Rp 150.000
   *Sub Total\t\t\t\t\t\t\t: Rp 450.000*

*2. Publikasi, Dekorasi & Dokumentasi*
   • Banner Utama Panggung (4 x 2 meter)\t\t\t: Rp 160.000
   • Banner Selamat Datang (3 x 1 meter)\t\t\t: Rp 70.000
   • Dekorasi & Sound System Support\t\t\t: Rp 120.000
   *Sub Total\t\t\t\t\t\t\t: Rp 350.000*

*3. Konsumsi*
   • Snack Pembukaan (Tamu & Peserta 80 box)\t\t: Rp 480.000
   • Makan Berat Peserta & Panitia (3 kali makan x 75)\t\t: Rp 1.575.000
   • Air Mineral Cup & Botol (5 dus)\t\t\t\t: Rp 125.000
   *Sub Total\t\t\t\t\t\t\t: Rp 2.180.000*

*4. Acara & Operasional*
   • Transport & Syahriah Pemateri (2 Orang)\t\t\t: Rp 400.000
   • Cinderamata Pemateri (2 Buah)\t\t\t\t: Rp 150.000
   • Hadiah Lomba Outbound & Doorprize\t\t\t: Rp 250.000
   • P3K & Biaya Tak Terduga\t\t\t\t: Rp 170.000
   *Sub Total\t\t\t\t\t\t\t: Rp 970.000*

*TOTAL ESTIMASI KEBUTUHAN ANGGARAN\t\t: Rp 3.950.000*
*(Terbilang: Tiga Juta Sembilan Ratus Lima Puluh Ribu Rupiah)*

---

*I. SUMBER PENDANAAN*
Rencana sumber pendanaan kegiatan ini dialokasikan dari:
1. Kas PR IPNU & IPPNU Desa Sidorejo\t\t: Rp 500.000
2. Kas Panitia Pelaksana & Iuran Pengurus\t: Rp 450.000
3. Bantuan Pimpinan Ranting NU Sidorejo\t: Rp 500.000
4. Donatur, Sponsorship & Simpatisan yang halal\t: Rp 2.500.000

*J. PENUTUP*
Demikian proposal kegiatan Binaan Sehari (BINARI) ini kami susun dengan sebaik-baiknya sebagai pedoman pelaksanaan dan pertimbangan bagi Bapak/Ibu/Sahabat. Keberhasilan dan kelancaran kegiatan ini tentu tidak terlepas dari pertolongan Allah SWT serta dukungan moril maupun materil dari semua pihak. Atas bantuan, perhatian, dan kerja sama yang terjalin, kami sampaikan terima kasih yang setulus-tulusnya.`
    },
    PRP_COMBO: {
      h: "PERMOHONAN BANTUAN DANA & PROPOSAL KEGIATAN",
      t: "Bapak / Ibu / Donatur / Tokoh Masyarakat\ndi -\n\tTempat",
      lamp: "1 (Satu) Berkas Proposal",
      i: `Salam silaturrahim teriring doa kami sampaikan semoga Bapak/Ibu senantiasa dalam lindungan Allah SWT, serta sukses dalam menjalankan aktifitas sehari-hari. Aamiin.

Dalam rangka meningkatkan mutu kualitas generasi muda Nahdlatul Ulama serta menanamkan nilai-nilai Aswaja an-Nahdliyyah, kami Pimpinan Ranting IPNU-IPPNU Desa Sidorejo bermaksud menyelenggarakan kegiatan *Binaan Sehari (BINARI) Tahun 2025* dengan tema :
*"Membentuk Generasi Pelajar Nahdliyin yang Unggul, Berkarakter, dan Berakhlakul Karimah"*

yang insya Allah akan dilaksanakan pada :
Hari\t\t: Jum'at s/d Sabtu
Tanggal\t\t: 18–19 Dzulqa'dah 1446 H / 16–17 Mei 2025 M
Waktu\t\t: 13.00 WIB – Selesai
Tempat\t\t: TPQ An-Nidhomiyah Sidorejo

Sehubungan dengan hal tersebut, demi kelancaran dan kesuksesan kegiatan dimaksud, kami memohon bantuan dan partisipasi dana dari Bapak/Ibu/Sahabat. Bersama surat ini kami lampirkan 1 (satu) berkas proposal kegiatan sebagai bahan pertimbangan.

Demikian permohonan ini kami sampaikan, atas perhatian, bantuan, dan keikhlasan Bapak/Ibu kami haturkan terima kasih.

---

*PROPOSAL KEGIATAN BINAAN SEHARI (BINARI)*
*PR IPNU & IPPNU DESA SIDOREJO KECAMATAN TIRTO*
*PERIODE 2024–2026*

*A. LATAR BELAKANG*
Pelajar merupakan generasi penerus bangsa dan tonggak perjuangan Nahdlatul Ulama. Di tengah tantangan era digital, pembinaan karakter, moralitas, dan pemahaman ajaran Islam Ahlussunnah wal Jama'ah menjadi kebutuhan mendesak bagi generasi muda. Oleh karena itu, PR IPNU-IPPNU Desa Sidorejo menyelenggarakan program *BINARI (Binaan Sehari)* sebagai wadah kaderisasi dan edukasi yang berkelanjutan.

*B. TEMA KEGIATAN*
*"Membentuk Generasi Pelajar Nahdliyin yang Unggul, Berkarakter, dan Berakhlakul Karimah"*

*C. MAKSUD DAN TUJUAN*
1. Menanamkan nilai-nilai Aswaja an-Nahdliyyah sejak dini kepada pelajar generasi muda.
2. Mempererat ukhuwah Islamiyah dan tali silaturahim antarpelajar se-Desa Sidorejo.
3. Mengenalkan organisasi IPNU dan IPPNU sebagai wadah positif pengembangan potensi diri.
4. Menumbuhkan kesadaran berorganisasi, kedisiplinan, dan jiwa kepemimpinan pelajar.

*D. WAKTU DAN TEMPAT PELAKSANAAN*
Hari / Tanggal\t: Jum'at s/d Sabtu, 16–17 Mei 2025 M (18–19 Dzulqa'dah 1446 H)
Waktu\t\t: 13.00 WIB – Selesai
Tempat\t\t: TPQ An-Nidhomiyah Desa Sidorejo

*E. SASARAN PESERTA*
Siswa/siswi kelas 6 MI Salafiyah Sidorejo, SD N Sidorejo, serta remaja se-Desa Sidorejo (Estimasi 60 peserta).

---

*F. SUSUNAN PANITIA PELAKSANA (ORGANIZING COMMITTEE)*
*Pelindung*\t\t: Pimpinan Ranting Nahdlatul Ulama Desa Sidorejo
*Penasehat*\t\t: Pembina PR IPNU & IPPNU Desa Sidorejo
*Penanggung Jawab*\t: Ketua PR IPNU & Ketua PR IPPNU Desa Sidorejo
*Ketua Pelaksana*\t: Rekan Amin Rozi
*Sekretaris Pelaksana*\t: Rekanita Nada Haniyah
*Bendahara Pelaksana*\t: Rekanita Siti Nafisah
*Seksi Acara*\t\t: Rekan M. Bagus Setiawan & Rekanita Dwi Lestari
*Seksi Perlengkapan*\t: Rekan Ahmad Zaki & Rekan Rizqi Pratama
*Seksi Konsumsi*\t\t: Rekanita Ainun Nabila & Rekanita Zulfa
*Seksi Dokumentasi*\t: Rekan M. Saifullah & Rekan Wildan
*Seksi Keamanan*\t\t: Komandan CBP & KPP Ranting Sidorejo

*G. JADWAL & RANGKAIAN ACARA KEGIATAN*
1. *Jum'at, 16 Mei 2025*
   • 13.00 – 14.00 WIB : Registrasi Peserta & Check-in
   • 14.00 – 15.30 WIB : Pembukaan Resmi & Sambutan-sambutan
   • 15.30 – 16.30 WIB : Sholat Ashar Berjamaah & Ice Breaking
   • 16.30 – 17.45 WIB : Materi 1: Ke-NU-an & Ke-Aswaja-an (Ust. M. Fathurrozi)
   • 17.45 – 19.30 WIB : Ishoma (Sholat Maghrib, Khotmil Qur'an & Sholat Isya')
   • 19.30 – 21.30 WIB : Materi 2: Kepemimpinan & Keorganisasian IPNU-IPPNU
   • 21.30 – 23.00 WIB : Pentas Seni Santri & Api Unggun Pelajar

2. *Sabtu, 17 Mei 2025*
   • 04.00 – 05.30 WIB : Qiyamul Lail, Sholat Subuh & Kuliah Fajar
   • 05.30 – 06.30 WIB : Senam Pagi Ceria & Operasi Semut Bersih Lingkungan
   • 06.30 – 07.30 WIB : Sarapan Pagi Bersama
   • 07.30 – 10.30 WIB : Outbound Edukatif & Fun Games Kerja Sama Tim
   • 10.30 – 11.30 WIB : Bersih Diri & Persiapan Penutupan
   • 11.30 – 12.30 WIB : Upacara Penutupan, Pembagian Sertifikat & Doa Bersama

---

*H. RANCANGAN ANGGARAN BIAYA (RAB)*
*1. Kesekretariatan & Administrasi*
   • Penggandaan Proposal, Kertas F4 & Surat-Menyurat\t: Rp 150.000
   • ID Card Peserta & Panitia (75 pcs x Rp 2.000)\t\t: Rp 150.000
   • Sertifikat Peserta & Piagam Pemateri\t\t\t: Rp 150.000
   *Sub Total\t\t\t\t\t\t\t: Rp 450.000*

*2. Publikasi, Dekorasi & Dokumentasi*
   • Banner Utama Panggung (4 x 2 meter)\t\t\t: Rp 160.000
   • Banner Selamat Datang (3 x 1 meter)\t\t\t: Rp 70.000
   • Dekorasi & Sound System Support\t\t\t: Rp 120.000
   *Sub Total\t\t\t\t\t\t\t: Rp 350.000*

*3. Konsumsi*
   • Snack Pembukaan (Tamu & Peserta 80 box)\t\t: Rp 480.000
   • Makan Berat Peserta & Panitia (3 kali makan x 75)\t\t: Rp 1.575.000
   • Air Mineral Cup & Botol (5 dus)\t\t\t\t: Rp 125.000
   *Sub Total\t\t\t\t\t\t\t: Rp 2.180.000*

*4. Acara & Operasional*
   • Transport & Syahriah Pemateri (2 Orang)\t\t\t: Rp 400.000
   • Cinderamata Pemateri (2 Buah)\t\t\t\t: Rp 150.000
   • Hadiah Lomba Outbound & Doorprize\t\t\t: Rp 250.000
   • P3K & Biaya Tak Terduga\t\t\t\t: Rp 170.000
   *Sub Total\t\t\t\t\t\t\t: Rp 970.000*

*TOTAL ESTIMASI KEBUTUHAN ANGGARAN\t\t: Rp 3.950.000*
*(Terbilang: Tiga Juta Sembilan Ratus Lima Puluh Ribu Rupiah)*

---

*I. SUMBER PENDANAAN*
Rencana sumber pendanaan kegiatan ini dialokasikan dari:
1. Kas PR IPNU & IPPNU Desa Sidorejo\t\t: Rp 500.000
2. Kas Panitia Pelaksana & Iuran Pengurus\t: Rp 450.000
3. Bantuan Pimpinan Ranting NU Sidorejo\t: Rp 500.000
4. Donatur, Sponsorship & Simpatisan yang halal\t: Rp 2.500.000

*J. PENUTUP*
Demikian proposal kegiatan Binaan Sehari (BINARI) ini kami susun dengan sebaik-baiknya sebagai pedoman pelaksanaan dan pertimbangan bagi Bapak/Ibu/Sahabat. Keberhasilan dan kelancaran kegiatan ini tentu tidak terlepas dari pertolongan Allah SWT serta dukungan moril maupun materil dari semua pihak. Atas bantuan, perhatian, dan kerja sama yang terjalin, kami sampaikan terima kasih yang setulus-tulusnya.`
    },
    LPJ: {
      h: "LAPORAN PERTANGGUNGJAWABAN (LPJ)",
      t: "Pimpinan Ranting NU Desa Sidorejo\ndi -\n\tTempat",
      lamp: "1 (Satu) Berkas",
      i: `Puji syukur kita panjatkan kehadirat Allah SWT yang telah melimpahkan rahmat dan hidayah-Nya sehingga kegiatan *BINARI (Binaan Sehari) IPNU-IPPNU Ranting Sidorejo Tahun 2025* telah terlaksana dengan lancar, tertib, dan sukses.

Sebagai wujud amanah dan transparansi pertanggungjawaban organisasi, bersama surat ini kami sampaikan Laporan Pertanggungjawaban (LPJ) pelaksanaan kegiatan beserta realisasi anggaran keuangan dan lembar pengesahan sebagaimana terlampir dalam berkas ini.

Demikian laporan pertanggungjawaban ini kami sampaikan, kami haturkan terima kasih yang sebesar-besarnya kepada seluruh pihak yang telah mendukung kegiatan ini.`
    },
    LPJ_FULL: {
      h: "LAPORAN PERTANGGUNGJAWABAN (LPJ)",
      t: "Pimpinan Ranting NU Desa Sidorejo\ndi -\n\tTempat",
      lamp: "1 (Satu) Berkas",
      i: `Puji syukur kita panjatkan kehadirat Allah SWT yang telah melimpahkan rahmat dan hidayah-Nya sehingga kegiatan *BINARI (Binaan Sehari) IPNU-IPPNU Ranting Sidorejo Tahun 2025* telah terlaksana dengan lancar, tertib, dan sukses.

Sebagai wujud amanah dan transparansi pertanggungjawaban organisasi, bersama surat ini kami sampaikan Laporan Pertanggungjawaban (LPJ) pelaksanaan kegiatan beserta realisasi anggaran keuangan dan lembar pengesahan sebagaimana terlampir dalam berkas ini.

Demikian laporan pertanggungjawaban ini kami sampaikan, kami haturkan terima kasih yang sebesar-besarnya kepada seluruh pihak yang telah mendukung kegiatan ini.

---

*LAPORAN PERTANGGUNGJAWABAN KEGIATAN BINAAN SEHARI (BINARI)*
*PR IPNU & IPPNU DESA SIDOREJO KECAMATAN TIRTO*
*PERIODE 2024–2026*

*A. PENDAHULUAN & GAMBARAN UMUM*
Kegiatan Binaan Sehari (BINARI) Tahun 2025 telah sukses diselenggarakan pada hari Jum'at s.d Sabtu, 16–17 Mei 2025 M (18–19 Dzulqa'dah 1446 H) bertempat di TPQ An-Nidhomiyah Desa Sidorejo. Kegiatan ini diikuti oleh 64 peserta yang terdiri atas siswa/siswi kelas 6 MI Salafiyah Sidorejo, SD N Sidorejo, dan kader pelajar santri se-Desa Sidorejo.

*B. HASIL & CAPAIAN KEGIATAN*
1. Seluruh rangkaian materi Aswaja & Ke-NU-an, Kepemimpinan Pelajar, dan Outbound terlaksana 100% sesuai jadwal.
2. Tingkat kehadiran dan keaktifan peserta mencapai 95% dengan antusiasme yang sangat tinggi.
3. Terbentuknya kesadaran berorganisasi dan minat besar peserta untuk bergabung dalam jenjang kaderisasi Makesta IPNU-IPPNU.

---

*C. REALISASI ANGGARAN PENDAPATAN & PENGELUARAN*

*1. Realisasi Penerimaan Kas & Dana:*
   • Kas PR IPNU & IPPNU Sidorejo\t\t\t: Rp 500.000
   • Kas Panitia & Iuran Pengurus\t\t\t: Rp 450.000
   • Bantuan Pimpinan Ranting NU Sidorejo\t\t: Rp 500.000
   • Bantuan Donatur & Simpatisan Masyarakat\t: Rp 2.500.000
   *Total Penerimaan Kas\t\t\t\t: Rp 3.950.000*

*2. Realisasi Pengeluaran:*
   • Administrasi, Sertifikat & ID Card\t\t: Rp 440.000
   • Publikasi, Banner & Dekorasi\t\t\t: Rp 345.000
   • Konsumsi Peserta & Tamu Undangan\t\t: Rp 2.155.000
   • Syahriah Pemateri, Cinderamata & Hadiah\t: Rp 950.000
   *Total Realisasi Pengeluaran\t\t\t: Rp 3.890.000*

*SALDO AKHIR DANA KEGIATAN\t\t\t: + Rp 60.000 (SILPA Masuk Kas Ranting)*

---

*D. EVALUASI DAN CATATAN REKOMENDASI*
1. Koordinasi kepanitiaan berjalan solid dan tertib berkat dukungan pengurus ranting dan pembina.
2. Kedepannya durasi materi luar ruangan (outbound) disarankan ditambah agar peserta makin akrab.

*E. PENUTUP*
Demikian Laporan Pertanggungjawaban (LPJ) kegiatan Binaan Sehari (BINARI) ini kami susun dengan sebenar-benarnya. Terima kasih atas doa, bimbingan, dan dukungan seluruh jajaran PR NU Sidorejo, Badan Otonom, dan masyarakat Desa Sidorejo.`
    },
    SU: {
      h: "Undangan Pertemuan Rutin",
      t: "Rekan-Rekanita\ndi -\n\tTempat",
      i: `Salam silaturrahmi kami sampaikan, semoga kita semua selalu dalam lindungan-Nya.

Sehubungan dengan akan dilaksanakannya kegiatan Pertemuan Rutin, kami mengharap kehadiran rekan-rekanita pada:

Hari / tanggal : ...
Waktu          : ...
Tempat         : ...

Demikian undangan ini kami sampaikan, atas kehadirannya kami ucapkan terima kasih.`
    },
    ST: {
      h: "SURAT TUGAS",
      t: "",
      i: `_Bismillahirrahmanirrahim_

Yang bertanda tangan dibawah ini, Pimpinan Ranting Ikatan Pelajar Nahdlatul Ulama (PR IPNU) Desa Sidorejo dengan ini memberikan tugas kepada :

1. Nama : Rekan Amin Rozi
   Jabatan : Anggota Kaderisasi
2. Nama : Rekan Alpin
   Jabatan : Anggota Departemen Organisasi

Untuk melaksanakan tugas / menghadiri kegiatan Pelatihan dan Kaderisasi yang diselenggarakan oleh PAC IPNU Kecamatan Tirto pada :
Hari, Tanggal : ...
Waktu         : ...
Tempat        : ...

Demikian surat tugas ini dibuat untuk dapat dilaksanakan dengan penuh tanggung jawab.

_Wallahulmuwaffiq Ilaa aqwamiththariq_`
    },
    SK_IPNU: {
      h: "SURAT KETERANGAN",
      t: "",
      i: `_Bismillahirrahmanirrahim_

Yang bertanda tangan dibawah ini :
1. Nama : M. Saifullah
   Tempat, Tanggal Lahir : Pekalongan, 12 Mei 2004
   Jabatan : Ketua
2. Nama : M. Alpin
   Tempat, Tanggal Lahir : Pekalongan, 18 Agustus 2005
   Jabatan : Sekretaris

Dengan ini menerangkan bahwa :
1. Nama : Akmal Peno
   Tempat, Tanggal Lahir : Pekalongan, 10 Oktober 2008
   Jabatan : Anggota

Nama tersebut adalah benar-benar anggota aktif Pimpinan Ranting Ikatan Pelajar Nahdlatul Ulama (PR IPNU) Desa Sidorejo dan telah mengikuti MAKESTA PR IPNU IPPNU Desa Sidorejo pada tanggal 30 April - 2 Mei 2025 di MI Salafiyah Sidorejo.

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.

_Wallahulmuwaffiq Ilaa aqwamiththariq_`
    },
    SK_IPPNU: {
      h: "SURAT KETERANGAN",
      t: "",
      i: `_Bismillahirrahmanirrahim_

Yang bertanda tangan dibawah ini :
1. Nama : Feni Lidyana
   Tempat, Tanggal Lahir : Pekalongan, 19 Desember 2005
   Jabatan : Ketua
2. Nama : Siti Yulia Farekha Hanum
   Tempat, Tanggal Lahir : Pekalongan, 09 Juli 2004
   Jabatan : Sekretaris

Dengan ini menerangkan bahwa :
1. Nama : Afinatus Tsania
   Tempat, Tanggal Lahir : Pekalongan, 09 Juni 2011
   Jabatan : Anggota

Nama tersebut telah mengikuti MAKESTA PR IPNU IPPNU Desa Sidorejo pada tanggal 30 April - 2 Mei 2025 di MI Salafiyah Sidorejo

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.

_Wallahulmuwaffiq Ilaa aqwamiththariq_`
    },
    SK: {
      h: "SURAT KETERANGAN",
      t: "",
      i: `_Bismillahirrahmanirrahim_

Yang bertanda tangan dibawah ini :
1. Nama : Feni Lidyana
   Tempat, Tanggal Lahir : Pekalongan, 19 Desember 2005
   Jabatan : Ketua
2. Nama : Siti Yulia Farekha Hanum
   Tempat, Tanggal Lahir : Pekalongan, 09 Juli 2004
   Jabatan : Sekretaris

Dengan ini menerangkan bahwa :
1. Nama : Afinatus Tsania
   Tempat, Tanggal Lahir : Pekalongan, 09 Juni 2011
   Jabatan : Anggota

Nama tersebut telah mengikuti MAKESTA PR IPNU IPPNU Desa Sidorejo pada tanggal 30 April - 2 Mei 2025 di MI Salafiyah Sidorejo

Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.

_Wallahulmuwaffiq Ilaa aqwamiththariq_`
    },
    SM: {
      h: "Surat Mandat",
      t: "",
      i: `_Bismillahirrahmanirrahim_

Yang bertanda tangan dibawah ini, Pimpinan Ranting Ikatan Pelajar Putri Nahdlatul Ulama (PR IPPNU) Desa Sidorejo dengan ini memberi mandat kepada :

1.\tNama\t: *Feni Lidyana*
\tJabatan\t: Ketua Umum PR IPPNU Desa Sidorejo

2.\tNama\t: *Siti Yulia Farekha Hanum*
\tJabatan\t: Sekretaris Umum PR IPPNU Desa Sidorejo

Dengan ini menugaskan kepada :
1.\tNama\t: *Wilda Azzani*
\tJabatan\t: Anggota Lembaga Ekonomi

Untuk mengikuti Kegiatan yang diadakan oleh PAC IPNU dan IPPNU Kecamatan Tirto.

Demikian surat mandat ini dibuat untuk dipergunakan sebagaimana mestinya.`
    },
    SP_IPPNU: {
      h: "PERMOHONAN PEMBAIATAN",
      t: "PC IPPNU Kabupaten Pekalongan\ndi –\n\tPekalongan",
      lamp: "1(2)",
      i: `Salam silaturahim kami sampaikan, dengan iringan do'a semoga kita semua tetap dalam lindungan Allah SWT dan selalu dalam risalah Rasulullah SAW, serta diberi kekuatan dan keridloan dalam menjalankan aktifitas sehari-hari, Amin.

Sehubung dengan telah dilaksanakannya Rapat Pengurus Harian Pimpinan Ranting Ikatan Pelajar Putri Nahdlatul Ulama Desa Sidorejo Kecamatan Tirto pada tanggal 07 Maret 2025 di TPQ An-Nahdliyah Desa Sidorejo, Kecamatan Tirto, Maka kami bermaksud mengadakan kegiatan pengkaderan formal dan kami memohonon kepada Pimpinan Cabang Ikatan Pelajar Putri Nahdlatul Ulama untuk membaiat yang insya Allah akan dilaksanakan pada :

Hari\t: Jum'at
Tanggal\t: 4 Dzulqa'dah 1446 H
\t  2 Mei 2025 M
Waktu\t: 04.00 – 04.30 WIB
Tempat\t: MI Salafiyah Sidorejo
Acara\t: MAKESTA (Masa Kesetiaan Anggota)

Demikian permohonan ini kami sampaikan, dengan harapan semoga diperhatikan dan dimaklumi, dan tak lupa kami haturkan terima kasih.

---

*LAMPIRAN PERMOHONAN PEMBAIATAN*

[center]*SUSUNAN ACARA*
*MASA KESETIAAN ANGGOTA*
*IKATAN PELAJAR PUTRI NAHDLATUL ULAMA*
*DESA SIDOREJO KECAMATAN TIRTO*

NO[7%]\tWAKTU[18%]\tKEGIATAN[27%]\tPETUGAS[28%]\tPENANGGUNG JAWAB[20%]
*Rabu, 30 April 2025*
1.\t12.30 – 13.00\t*Registrasi*\tHanum dan Akmal Peno\tHanum
2.\t13.00 – 14.00\t*Pembukaan*\tMc : Putra dan Amel / Dirigen : Naila Rizqi\tAlpin
3.\t14.00 – 14.30\tKontrak Belajar & Pree Test\tTim Pendamping\tAlpin
4.\t14.30 – 15.00\t*ISHOMA*\tAkmal Peno dan Amel\t-
5.\t15.00 – 16.30\tMateri *Aswaja An-Nahdliyah*\tP : Gus Khafid / M : Alpin / N : Henik\tIlmi
6.\t16.30 – 19.00\t*ISHOMA & Yanalil*\tLana dan Amel\t-
7.\t19.00 – 20.30\tMateri *ke NU an*\tP: Pak H. Rupadi / M: Zidta / N: Nela\tIpung
8.\t20.30 - 20.45\tIce breaking\tTrainer\tNela
9.\t20.30 – 21.30\tMateri *Ke Indonesia-an*\tP : Siti Chofifah / M : Amel / N : Putra\tZidta
10.\t21.30 - 22.00\tReview Materi\tTim pendamping\tNela
11.\t22.00 – 04.00\tSweet Dream\tAll panitia\tAll Panitia
*Kamis, 1 Mei 2025*
12.\t04.00 – 04.30\t*SHOLAT*\tLana dan Zahro\tLana dan Zahro
13.\t04.30 – 05.30\tSenam sehat\tDKAC CBP KPP\tUsup dan Amel
14.\t05.30 – 07.00\tMCK\tAll panitia\tAll Panitia
15.\t07.00 – 08.30\tMateri *IPNU IPPNU dan CBP KPP*\tP : PAC IPNU / M : Fadel / N : Putra / P : PAC IPPNU / M :Nisak / N: Nela\tAlpin
16.\t08.30 – 10.00\tMateri *Keorganisasian & Kepemimpinan*\tP : Bu Hidayah / M : Winda / N : Nisak\tNela
17.\t12.00 – 12.30\t*ISHOMA*\tIpul\tIpul
18.\t12.30 – 14.00\tMateri *Studi Gender*\tP : Dewi Khalawatul Widati / M : Akmal / N : Hanum\tAlpin
19.\t14.00 – 14.15\tPOST TES\tTrainer\tTrainer

---

*LAMPIRAN PERMOHONAN PEMBAIATAN*

NO[7%]\tWAKTU[18%]\tKEGIATAN[27%]\tPETUGAS[28%]\tPENANGGUNG JAWAB[20%]
*Kamis, 1 Mei 2025 (Lanjutan)*
25.\t14.30 – 17.00\t*OUTBOND*\tDKAC CBP KPP Kec. Tirto\tSKR
20.\t17.00 – 18.00\t*ISHOMA*\tHenik\tHenik
21.\t18.00 – 18.30\tReview Materi\tTim pendamping\tAlpin
22.\t18.30 – 20.30\t*INAGURASI*\tLalak dan Ilmi\tSie acara
23.\t23.00 – 22.30\t*GC*\tPH dan Pembina\tPH
24.\t22.30 – 01.00\tSWEET DREAM\tAll panitia\tAll panitia
*Jum'at, 2 Mei 2025*
25.\t01.00 – 04.00\t*Caraka Malam*\tPAC & DKAC\tSKR
26.\t04.00 – 04.30\t*Pembaiatan Peserta MAKESTA*\tPC IPNU IPPNU\tPH IPNU IPPNU
27.\t04.30 – 05.30\t*SHOLAT*\tAkmal Peno\tSie acara
29.\t05.30 – 06.30\t*RTL (Rencana Tindak Lanjut)*\tSie Acara\tSie acara
30.\t06.30\t*SAYONARA*\tAll panitia\tAll panitia`
    },
    SP_IPNU: {
      h: "PERMOHONAN PEMBAIATAN",
      t: "PC IPNU Kabupaten Pekalongan\ndi –\n\tPekalongan",
      lamp: "1(2)",
      i: `Salam silaturahim kami sampaikan, dengan iringan do'a semoga kita semua tetap dalam lindungan Allah SWT dan selalu dalam risalah Rasulullah SAW, serta diberi kekuatan dan keridloan dalam menjalankan aktifitas sehari-hari, Amin.

Sehubung dengan telah dilaksanakannya Rapat Pengurus Harian Pimpinan Ranting Ikatan Pelajar Nahdlatul Ulama Desa Sidorejo Kecamatan Tirto pada tanggal 07 Maret 2025 di TPQ An-Nahdliyah Desa Sidorejo, Kecamatan Tirto, Maka kami bermaksud mengadakan kegiatan pengkaderan formal dan kami memohonon kepada Pimpinan Cabang Ikatan Pelajar Nahdlatul Ulama untuk membaiat yang insya Allah akan dilaksanakan pada :

Hari\t: Jum'at
Tanggal\t: 4 Dzulqa'dah 1446 H
\t  2 Mei 2025 M
Waktu\t: 04.00 – 04.30 WIB
Tempat\t: MI Salafiyah Sidorejo
Acara\t: MAKESTA (Masa Kesetiaan Anggota)

Demikian permohonan ini kami sampaikan, dengan harapan semoga diperhatikan dan dimaklumi, dan tak lupa kami haturkan terima kasih.

---

*LAMPIRAN PERMOHONAN PEMBAIATAN*

[center]*SUSUNAN ACARA*
*MASA KESETIAAN ANGGOTA*
*IKATAN PELAJAR NAHDLATUL ULAMA*
*DESA SIDOREJO KECAMATAN TIRTO*

NO[7%]\tWAKTU[18%]\tKEGIATAN[27%]\tPETUGAS[28%]\tPENANGGUNG JAWAB[20%]
*Rabu, 30 April 2025*
1.\t12.30 – 13.00\t*Registrasi*\tHanum dan Akmal Peno\tHanum
2.\t13.00 – 14.00\t*Pembukaan*\tMc : Putra dan Amel / Dirigen : Naila Rizqi\tAlpin
3.\t14.00 – 14.30\tKontrak Belajar & Pree Test\tTim Pendamping\tAlpin
4.\t14.30 – 15.00\t*ISHOMA*\tAkmal Peno dan Amel\t-
5.\t15.00 – 16.30\tMateri *Aswaja An-Nahdliyah*\tP : Gus Khafid / M : Alpin / N : Henik\tIlmi
6.\t16.30 – 19.00\t*ISHOMA & Yanalil*\tLana dan Amel\t-
7.\t19.00 – 20.30\tMateri *ke NU an*\tP: Pak H. Rupadi / M: Zidta / N: Nela\tIpung
8.\t20.30 - 20.45\tIce breaking\tTrainer\tNela
9.\t20.30 – 21.30\tMateri *Ke Indonesia-an*\tP : Siti Chofifah / M : Amel / N : Putra\tZidta
10.\t21.30 - 22.00\tReview Materi\tTim pendamping\tNela
11.\t22.00 – 04.00\tSweet Dream\tAll panitia\tAll Panitia
*Kamis, 1 Mei 2025*
12.\t04.00 – 04.30\t*SHOLAT*\tLana dan Zahro\tLana dan Zahro
13.\t04.30 – 05.30\tSenam sehat\tDKAC CBP KPP\tUsup dan Amel
14.\t05.30 – 07.00\tMCK\tAll panitia\tAll Panitia
15.\t07.00 – 08.30\tMateri *IPNU dan CBP*\tP : PAC IPNU / M : Fadel / N : Putra / P : PAC IPNU / M :Nisak / N: Nela\tAlpin
16.\t08.30 – 10.00\tMateri *Keorganisasian & Kepemimpinan*\tP : Bu Hidayah / M : Winda / N : Nisak\tNela
17.\t12.00 – 12.30\t*ISHOMA*\tIpul\tIpul
18.\t12.30 – 14.00\tMateri *Studi Gender*\tP : Dewi Khalawatul Widati / M : Akmal / N : Hanum\tAlpin
19.\t14.00 – 14.15\tPOST TES\tTrainer\tTrainer

---

*LAMPIRAN PERMOHONAN PEMBAIATAN*

NO[7%]\tWAKTU[18%]\tKEGIATAN[27%]\tPETUGAS[28%]\tPENANGGUNG JAWAB[20%]
*Kamis, 1 Mei 2025 (Lanjutan)*
25.\t14.30 – 17.00\t*OUTBOND*\tDKAC CBP KPP Kec. Tirto\tSKR
20.\t17.00 – 18.00\t*ISHOMA*\tHenik\tHenik
21.\t18.00 – 18.30\tReview Materi\tTim pendamping\tAlpin
22.\t18.30 – 20.30\t*INAGURASI*\tLalak dan Ilmi\tSie acara
23.\t23.00 – 22.30\t*GC*\tPH dan Pembina\tPH
24.\t22.30 – 01.00\tSWEET DREAM\tAll panitia\tAll panitia
*Jum'at, 2 Mei 2025*
25.\t01.00 – 04.00\t*Caraka Malam*\tPAC & DKAC\tSKR
26.\t04.00 – 04.30\t*Pembaiatan Peserta MAKESTA*\tPC IPNU\tPH IPNU
27.\t04.30 – 05.30\t*SHOLAT*\tAkmal Peno\tSie acara
29.\t05.30 – 06.30\t*RTL (Rencana Tindak Lanjut)*\tSie Acara\tSie acara
30.\t06.30\t*SAYONARA*\tAll panitia\tAll panitia`
    }
  };

  async function fetchPengurus() {
    const supabase = createClient();
    const { data } = await supabase.from("data_pengurus").select("*").order("nama_lengkap");
    if (data) setPengurus(data);
  }

  // Auto-generate nomor surat sesuai format LPJ BINARI
  async function generateNumberForTemplate(kode: string) {
    const now = new Date();
    const bulanRoman = toRoman(now.getMonth() + 1);
    const tahun = now.getFullYear();

    if (isGabungan) {
      const seq = await getNextLetterSequence("gabungan");
      const seqStr = String(seq).padStart(3, "0");
      // Format resmi LPJ: 001/PR/Pan.Binari/IPNU-IPPNU/V/2025
      return `${seqStr}/PR/Pan.Binari/IPNU-IPPNU/${bulanRoman}/${tahun}`;
    } else {
      const seq = await getNextLetterSequence(org);
      const seqStr = String(seq).padStart(3, "0");
      const kodeOrg = org === "ipnu" ? "7354" : "7455";
      const kodeSurat = kode === "SK" ? "S.ket" : kode;
      return `${seqStr}/PR/${kodeSurat}/${kodeOrg}/XXIV/${bulanRoman}/${tahun}`;
    }
  }

  // Resolve org-specific template key (SP → SP_IPNU / SP_IPPNU, SK → SK_IPNU / SK_IPPNU)
  function resolveTemplateKey(kode: string): string {
    if (kode === "SP") {
      return org === "ipnu" ? "SP_IPNU" : "SP_IPPNU";
    }
    if (kode === "SK") {
      return org === "ipnu" ? "SK_IPNU" : "SK_IPPNU";
    }
    return kode;
  }

  // Load Initial Data (Draft, Template, atau Nomor Otomatis)
  const targetKode = kodeParam || (isGabungan ? "PMP" : (org === "ipnu" ? "ST" : "SM"));
  const resolvedKode = resolveTemplateKey(targetKode);
  const storageKey = `draft_letter_${org}_${targetKode}`;

  useEffect(() => {
    fetchPengurus();

    (async () => {
      // 1. Cek draft lokal spesifik untuk jenis surat ini
      let hasDraft = false;
      try {
        const draft = localStorage.getItem(storageKey);
        if (draft && !editId) {
          const data = JSON.parse(draft);
          if (data.t !== undefined || data.p !== undefined || data.i !== undefined) {
            // Jika draf di browser pengguna masih versi lama, muat ulang template resmi terbaru
            if (targetKode === "SP" && data.i && !data.i.includes("SAYONARA")) {
              hasDraft = false;
            } else if (targetKode === "SK" && (!data.i || (org === "ipnu" && !data.i.includes("Saifullah")) || (org === "ippnu" && !data.i.includes("Feni Lidyana")) || data.p === "Surat Keputusan" || data.i.includes("MEMUTUSKAN"))) {
              hasDraft = false;
            } else if (targetKode === "ST" && (!data.i || !data.i.includes("Amin Rozi") || !data.i.includes("Wallahulmuwaffiq"))) {
              hasDraft = false;
            } else {
              setTujuan(data.t || "");
              setPerihal(data.p || "");
              setIsSurat(data.i || "");
              if (data.l) setLampiran(data.l);
              if (data.no) setNoSuratStr(data.no);
              hasDraft = true;
            }
          }
        }
      } catch {
        // Skip
      }

      // 2. Jika tidak ada draft tersimpan, muat template resmi
      if (!hasDraft && templates[resolvedKode]) {
        setPerihal(templates[resolvedKode].h);
        setTujuan(templates[resolvedKode].t);
        setIsSurat(templates[resolvedKode].i);
        setLampiran(templates[resolvedKode].lamp || (targetKode === "PRP" ? "1 (Satu) Berkas" : "-"));
        const autoNo = await generateNumberForTemplate(targetKode);
        setNoSuratStr(autoNo);
      } else if (!hasDraft && !noSuratStr) {
        const autoNo = await generateNumberForTemplate(targetKode);
        setNoSuratStr(autoNo);
      }
    })();
  }, [org, targetKode]);

  // Auto-save Draft per Jenis Surat
  useEffect(() => {
    if (tujuan || perihal || isiSurat || noSuratStr) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ t: tujuan, p: perihal, i: isiSurat, no: noSuratStr, l: lampiran })
        );
      } catch {
        // Skip
      }
    }
  }, [tujuan, perihal, isiSurat, noSuratStr, lampiran, storageKey]);

  const handleResetForm = () => {
    if (confirm("Hapus seluruh draf dan kosongkan formulir?")) {
      setTujuan("");
      setPerihal("");
      setIsSurat("");
      setNoSuratStr("");
      setLampiran("-");
      try {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`draft_letter_${org}`);
      } catch {
        // Skip
      }
    }
  };

  const handleReloadFormat = async () => {
    const foundTemplate = templates[resolvedKode] || templates.PRP || templates.PMP;
    if (confirm("Muat ulang format surat? Isian saat ini akan diganti dengan template resmi default!")) {
      setPerihal(foundTemplate.h);
      setTujuan(foundTemplate.t);
      setIsSurat(foundTemplate.i);
      setLampiran(foundTemplate.lamp || (targetKode === "PRP" ? "1 (Satu) Berkas" : "-"));
      const autoNo = await generateNumberForTemplate(targetKode);
      setNoSuratStr(autoNo);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = isiSurat.substring(0, start) + "\t" + isiSurat.substring(end);
      setIsSurat(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0);
    }
  };

  // Auto-indent baris ke-3 (domisili/tempat) pada Tujuan Surat
  const handleTujuanKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const newVal = val.substring(0, start) + "\t" + val.substring(end);
      setTujuan(newVal);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0);
    } else if (e.key === "Enter") {
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const val = target.value;
      const textBeforeCursor = val.substring(0, start);
      const lines = textBeforeCursor.split("\n");
      const currentLine = lines[lines.length - 1].trim().toLowerCase();

      // Jika baris saat ini adalah "di", "di -", "di-", atau baris ke-2: otomatis saat Enter langsung menjorok (\t)
      if (currentLine === "di" || currentLine === "di -" || currentLine === "di-" || lines.length === 2) {
        e.preventDefault();
        const afterCursor = val.substring(start);
        const newVal = textBeforeCursor + "\n\t" + afterCursor.replace(/^\t+/, "");
        setTujuan(newVal);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 2; // setelah \n\t
        }, 0);
      }
    }
  };

  const handleTujuanBlur = () => {
    if (!tujuan) return;
    const lines = tujuan.split("\n");
    let changed = false;
    const formatted = lines.map((line, idx) => {
      // Jika baris sebelumnya adalah "di" atau jika ini baris ke-3 (index 2)
      const prevLine = idx > 0 ? lines[idx - 1].trim().toLowerCase() : "";
      if (prevLine.startsWith("di") || idx === 2) {
        if (!line.startsWith("\t") && !line.startsWith("    ") && line.trim() !== "") {
          changed = true;
          return "\t" + line.trim();
        }
      }
      return line;
    });
    if (changed) {
      setTujuan(formatted.join("\n"));
    }
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("isi-surat-textarea") as HTMLTextAreaElement | null;
    if (!textarea) {
      setIsSurat((prev) => prev + prefix + suffix);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = isiSurat.substring(start, end);
    const replacement = prefix + (selected || "teks") + suffix;
    const updated = isiSurat.substring(0, start) + replacement + isiSurat.substring(end);
    setIsSurat(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 50);
  };

  const insertPageBreak = () => {
    setIsSurat((prev) => {
      const trimmed = prev.trimEnd();
      return trimmed ? `${trimmed}\n\n---\n\n` : "---\n\n";
    });
  };

  const handleSelectPengurus = (p: any, slot: 1 | 2 | 3 | 4) => {
    if (slot === 1) {
      setTtd1Nama(p.nama_lengkap);
      setTtd1Nia(p.nia || "");
      if (!isGabungan) setTtd1Jabatan(p.jabatan || "Ketua");
    } else if (slot === 2) {
      setTtd2Nama(p.nama_lengkap);
      setTtd2Nia(p.nia || "");
      if (!isGabungan) setTtd2Jabatan(p.jabatan || "Sekretaris");
    } else if (slot === 3) {
      setTtd3Nama(p.nama_lengkap);
      setTtd3Nia(p.nia || "");
    } else if (slot === 4) {
      setTtd4Nama(p.nama_lengkap);
      setTtd4Nia(p.nia || "");
    }
    setActiveSearchSlot(null);
    setSearchQuery("");
  };

  const filteredPengurus = pengurus.filter(
    (p) =>
      p.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nia && p.nia.includes(searchQuery)) ||
      (p.jabatan && p.jabatan.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const result = await saveLetter({
        nomor_surat: noSuratStr,
        perihal,
        jenis_surat: "digital",
        tanggal_surat: ttdTanggal,
        kategori_dashboard: org,
        metadata: {
          tujuan,
          lampiran,
          isi_surat: isiSurat,
          kop: {
            tingkat: kopTingkat1,
            org: kopOrgText,
            org2: kopOrgText2 || undefined,
            sub: kopSubOrg,
            alamat: kopAlamat1,
            sekretariat: kopSekretariat,
            wilayah: kopWilayah,
            kontak_wa: kopKontakWa,
            kontak_email: kopKontakEmail,
          },
          tanggal_hijriah: ttdTanggalHijriah,
          ttd_wilayah: ttdWilayah,
          use_kepanitiaan: useKepanitiaanTTD,
          panitia_judul: ttdPanitiaJudul,
          ttd1: { jabatan: ttd1Jabatan, nama: ttd1Nama, nia: ttd1Nia },
          ttd2: { jabatan: ttd2Jabatan, nama: ttd2Nama, nia: ttd2Nia },
          ttd3: { jabatan: ttd3Jabatan, nama: ttd3Nama, nia: ttd3Nia },
          ttd4: { jabatan: ttd4Jabatan, nama: ttd4Nama, nia: ttd4Nia },
          logos: { kiri: logoKiri, tengah: logoTengah, kanan: logoKanan, mode: logoMode },
        },
      });

      if (result.error) {
        alert(result.error);
        setSaving(false);
        return;
      }

      setSaving(false);
      setSuccess(`Surat berhasil disimpan & diarsipkan! Nomor: ${result.nomorSurat}`);
      try {
        localStorage.removeItem(`draft_letter_${org}`);
      } catch {
        // Skip
      }

      setTimeout(() => {
        const basePath = pathname.startsWith("/admin") ? "/admin" : "/user";
        window.location.href = `${basePath}/surat-digital/${org}`;
      }, 1500);
    } catch {
      alert("Terjadi kesalahan saat menyimpan surat. Silakan coba lagi.");
      setSaving(false);
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>, position: "kiri" | "tengah" | "kanan") {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        if (position === "kiri") setLogoKiri(res);
        if (position === "tengah") setLogoTengah(res);
        if (position === "kanan") setLogoKanan(res);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleDownloadPdf = () => {
    const previewEl = document.getElementById("letter-preview");
    if (!previewEl) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Izinkan popup browser untuk mencetak / mendownload PDF.");
      return;
    }

    // Ambil seluruh style & stylesheet dari aplikasi utama agar tampilan cetak identik 100%
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cetak Dokumen - ${noSuratStr || perihal || "Surat_Proposal"}</title>
        <meta charset="utf-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Raleway:wght@400;600;700&display=swap" rel="stylesheet">
        ${styleTags}
        <style>
          @page {
            size: 210mm 330mm; /* Standar Kertas Folio / F4 */
            margin: 0 !important; /* HILANGKAN DEFAULT BROWSER: tanggal, jam, judul dokumen, & footer about:blank */
          }
          * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 210mm !important;
            font-family: ${org === "ipnu" ? "'Arial Narrow', Arial, 'Helvetica Neue', sans-serif" : "'Times New Roman', Times, serif"} !important;
          }
          #letter-preview-container, #letter-preview {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            zoom: 1 !important;
          }
          .space-y-6 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          .sheet-page {
            width: 210mm !important;
            height: 330mm !important;
            max-height: 330mm !important;
            min-height: 330mm !important;
            padding: 8mm 18mm 10mm 18mm !important;
            box-sizing: border-box !important;
            background: white !important;
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            font-family: ${org === "ipnu" ? "'Arial Narrow', Arial, 'Helvetica Neue', sans-serif" : "'Times New Roman', Times, serif"} !important;
            font-size: ${isiFontSize} !important;
            line-height: 1.15 !important;
          }
          .sheet-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .sheet-body {
            display: flex !important;
            flex-direction: column !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
            overflow: hidden !important;
          }
          .sheet-content p {
            line-height: 1.15 !important;
            margin-bottom: 2px !important;
          }
          .sheet-footer {
            margin-top: auto !important;
            padding-top: 4px !important;
            flex-shrink: 0 !important;
            border-top: none !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            border: 1px solid #000 !important;
            border-bottom: 1.5px solid #000 !important;
          }
          th, td {
            border: 1px solid #000 !important;
            border-bottom: 1px solid #000 !important;
          }
          .ttd-section {
            margin-top: 16px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .kop-section {
            margin-bottom: 14px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div style="width: 210mm; margin: 0 auto; background: white;">
          ${previewEl.outerHTML}
        </div>
        <script>
          window.onload = function() {
            var imgs = Array.from(document.images);
            var promises = imgs.map(function(img) {
              if (img.complete) return Promise.resolve();
              return new Promise(function(res) {
                img.onload = res;
                img.onerror = res;
              });
            });
            Promise.all(promises).then(function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            });
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Typography Settings
  const isIpnu = org === "ipnu";
  const kopFontFamily = "'Trajan Pro', 'Cinzel', 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
  const sekretariatFontFamily = isGabungan
    ? "'Times New Roman', Times, serif"
    : "'Averta Semibold', 'Raleway', Arial, sans-serif";
  const isiFontFamily = isIpnu
    ? "'Arial Narrow', Arial, 'Helvetica Neue', sans-serif"
    : "'Times New Roman', Times, serif";

  const kopFontSize = "13.5px";
  const sekretariatFontSize = "9.5px";
  const isiFontSize = "11.5pt";
  const headerColor = "#145c38"; // Hijau Resmi NU Sidorejo

  // Helper untuk Merender KOP Surat Resmi Beserta Logo pada Setiap Halaman (Tanpa Garis Pemisah Sesuai Instruksi)
  const renderKopSurat = () => (
    <div className="kop-section" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px", pageBreakInside: "avoid", breakInside: "avoid" }}>
      {/* Sisi Kiri: Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginTop: "2px" }}>
        {isGabungan ? (
          logoMode === "kegiatan" && logoKiri ? (
            <img src={logoKiri} alt="Logo Kegiatan" style={{ width: "36mm", height: "36mm", objectFit: "contain" }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <img src="/logo-ipnu.png" alt="IPNU" style={{ width: "22mm", height: "22mm", objectFit: "contain" }} />
              <img src="/logo-ippnu.png" alt="IPPNU" style={{ width: "22mm", height: "22mm", objectFit: "contain" }} />
            </div>
          )
        ) : (
          <img src={config.logo} alt={config.name} style={{ width: "32mm", height: "32mm", objectFit: "contain" }} />
        )}
      </div>

      {/* Sisi Kanan: Teks KOP Rata Kanan */}
      <div style={{ flexGrow: 1, textAlign: "right" }}>
        <p style={{ fontFamily: kopFontFamily, fontSize: kopFontSize, fontWeight: "bold", color: headerColor, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {kopTingkat1}
        </p>
        <p style={{ fontFamily: kopFontFamily, fontSize: kopFontSize, fontWeight: "bold", color: headerColor, margin: "1px 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {kopOrgText}
        </p>
        {kopOrgText2 && (
          <p style={{ fontFamily: kopFontFamily, fontSize: kopFontSize, fontWeight: "bold", color: headerColor, margin: "1px 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {kopOrgText2}
          </p>
        )}
        <p style={{ fontFamily: kopFontFamily, fontSize: kopFontSize, fontWeight: "bold", color: headerColor, margin: "1px 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {kopSubOrg} {kopAlamat1}
        </p>

        {/* Alamat, Kontak, & Email */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0px", marginTop: "2px", fontFamily: sekretariatFontFamily, fontSize: sekretariatFontSize, color: "#000" }}>
          <p style={{ margin: 0 }}>{kopSekretariat}</p>
          {kopKontakWa && (
            <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "1px" }}>
              <span>{kopKontakWa}</span>
              <img src="/logo-tlp.png" alt="WA" style={{ width: "10px", height: "10px" }} />
            </div>
          )}
          {kopKontakEmail && (
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <span style={{ color: "#0000EE", textDecoration: "underline" }}>{kopKontakEmail}</span>
              <img src="/logo-email.png" alt="Email" style={{ width: "10px", height: "10px" }} />
            </div>
          )}
          {kopKontakWebsite && (
            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <span style={{ color: "#0000EE", textDecoration: "underline" }}>{kopKontakWebsite}</span>
              <img src="/logo-website.png" alt="Website" style={{ width: "10px", height: "10px" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper untuk Merender Bagian Tanda Tangan (TTD) Resmi
  const renderTtdSection = (_isLembarPengesahan: boolean = false) => (
    <div className="ttd-section" style={{ width: "100%", marginTop: "20px", pageBreakInside: "avoid", breakInside: "avoid" }}>
      {/* Tanggal Hijriah & Masehi Bertingkat di Sisi Kanan */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <div style={{ textAlign: "left", minWidth: "180px" }}>
          <p style={{ margin: "0" }}>
            {ttdWilayah}, {ttdTanggalHijriah || ""}
          </p>
          <p style={{ margin: "0", paddingLeft: `${(ttdWilayah?.length || 8) + 2}ch` }}>
            {formatDate(ttdTanggal)} M
          </p>
        </div>
      </div>

      {useKepanitiaanTTD ? (
        <>
          {/* TINGKAT 1: PANITIA PELAKSANA */}
          <div style={{ textAlign: "center", marginBottom: "4px", fontWeight: "bold", textTransform: "uppercase" }}>
            <p style={{ margin: 0 }}>{ttdPanitiaJudul || "PANITIA BINARI"}</p>
            <p style={{ margin: 0 }}>PR IPNU &amp; IPPNU DESA SIDOREJO KECAMATAN TIRTO</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "36px", marginBottom: "16px" }}>
            <div style={{ textAlign: "center", width: "45%" }}>
              <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0, textTransform: "uppercase" }}>
                {ttd1Nama || "AMIN ROZI"}
              </p>
              <p style={{ fontStyle: "italic", margin: 0 }}>{ttd1Jabatan || "Ketua Pelaksana"}</p>
              {ttd1Nia && <p style={{ fontSize: "9px", margin: 0 }}>NIA: {ttd1Nia}</p>}
            </div>
            <div style={{ textAlign: "center", width: "45%" }}>
              <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0, textTransform: "uppercase" }}>
                {ttd2Nama || "NADA HANIYAH"}
              </p>
              <p style={{ fontStyle: "italic", margin: 0 }}>{ttd2Jabatan || "Sekretaris"}</p>
              {ttd2Nia && <p style={{ fontSize: "9px", margin: 0 }}>NIA: {ttd2Nia}</p>}
            </div>
          </div>

          {/* TINGKAT 2: MENGETAHUI PIMPINAN RANTING */}
          <div style={{ textAlign: "center", marginTop: "14px", marginBottom: "4px" }}>
            <p style={{ margin: 0, fontStyle: "italic" }}>Mengetahui,</p>
            <p style={{ margin: 0, fontWeight: "bold", textTransform: "uppercase" }}>
              PR IPNU &amp; IPPNU DESA SIDOREJO KECAMATAN TIRTO
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "36px" }}>
            <div style={{ textAlign: "center", width: "45%" }}>
              <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0, textTransform: "uppercase" }}>
                {ttd3Nama || "M. SAIFULLAH"}
              </p>
              <p style={{ fontStyle: "italic", margin: 0 }}>{ttd3Jabatan || "Ketua IPNU"}</p>
              {ttd3Nia && <p style={{ fontSize: "9px", margin: 0 }}>NIA: {ttd3Nia}</p>}
            </div>
            <div style={{ textAlign: "center", width: "45%" }}>
              <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0, textTransform: "uppercase" }}>
                {ttd4Nama || "FENI LIDYANA"}
              </p>
              <p style={{ fontStyle: "italic", margin: 0 }}>{ttd4Jabatan || "Ketua IPPNU"}</p>
              {ttd4Nia && <p style={{ fontSize: "9px", margin: 0 }}>NIA: {ttd4Nia}</p>}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Format Standar (2 Tanda Tangan) */}
          <div style={{ textAlign: "center", marginBottom: "4px", fontWeight: "bold", textTransform: "uppercase" }}>
            <p style={{ margin: 0 }}>{kopTingkat1}</p>
            <p style={{ margin: 0 }}>{kopOrgText}</p>
            {kopOrgText2 && <p style={{ margin: 0 }}>{kopOrgText2}</p>}
            <p style={{ margin: 0 }}>{kopSubOrg}</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px" }}>
            <div style={{ textAlign: "center", width: "45%" }}>
              <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0, textTransform: "uppercase" }}>
                {ttd1Nama || "________________"}
              </p>
              <p style={{ fontStyle: "italic", margin: 0 }}>{ttd1Jabatan || "Ketua"}</p>
              {ttd1Nia && <p style={{ fontSize: "9px", margin: 0 }}>NIA: {ttd1Nia}</p>}
            </div>
            <div style={{ textAlign: "center", width: "45%" }}>
              <p style={{ fontWeight: "bold", textDecoration: "underline", margin: 0, textTransform: "uppercase" }}>
                {ttd2Nama || "________________"}
              </p>
              <p style={{ fontStyle: "italic", margin: 0 }}>{ttd2Jabatan || "Sekretaris"}</p>
              {ttd2Nia && <p style={{ fontSize: "9px", margin: 0 }}>NIA: {ttd2Nia}</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );

  function renderPageContent(pageText: string) {
    const lines = pageText.split("\n");
    const elements: React.ReactNode[] = [];
    let tableItems: Array<{ type: "row"; cells: string[] } | { type: "spanning"; text: string }> = [];
    let tableIndex = 0;

    const flushTable = () => {
      if (tableItems.length === 0) return;

      // Hitung jumlah kolom maksimum
      let maxCols = 5;
      tableItems.forEach((item) => {
        if (item.type === "row" && item.cells.length > maxCols) {
          maxCols = item.cells.length;
        }
      });

      // Deteksi baris pertama sebagai Header
      const firstItem = tableItems[0];
      let headerCells: string[] | null = null;
      let bodyItems = tableItems;

      if (firstItem.type === "row") {
        const firstColText = firstItem.cells[0]?.trim().toUpperCase().replace(/[[{].*?[\]}]/g, "") || "";
        const isHeader =
          firstColText === "NO" ||
          firstColText === "NO." ||
          isNaN(parseInt(firstColText.replace(".", "")));
        if (isHeader) {
          headerCells = firstItem.cells;
          bodyItems = tableItems.slice(1);
        }
      }

      // Deteksi custom width dari header (contoh: NO[7%]\tWAKTU[18%]...)
      const customWidths: string[] = [];
      if (headerCells) {
        headerCells.forEach((c) => {
          const match = c.match(/\[([0-9.]+(?:%|px|mm))\]|\{([0-9.]+(?:%|px|mm))\}/);
          if (match) {
            customWidths.push(match[1] || match[2]);
          } else {
            customWidths.push("");
          }
        });
      }

      // Standar proporsi kolom baku agar garis tabel selalu seragam & presisi di setiap halaman
      const getDefaultWidth = (idx: number, total: number) => {
        if (total === 5) {
          // Format Baku: NO (7%), WAKTU (18%), KEGIATAN (27%), PETUGAS (28%), PJ (20%)
          const defaults = ["7%", "18%", "27%", "28%", "20%"];
          return defaults[idx] || `${Math.floor(100 / total)}%`;
        }
        if (total === 4) {
          const defaults = ["8%", "30%", "37%", "25%"];
          return defaults[idx] || `${Math.floor(100 / total)}%`;
        }
        if (total === 3) {
          const defaults = ["10%", "50%", "40%"];
          return defaults[idx] || `${Math.floor(100 / total)}%`;
        }
        if (total === 6) {
          const defaults = ["6%", "18%", "22%", "22%", "16%", "16%"];
          return defaults[idx] || `${Math.floor(100 / total)}%`;
        }
        return `${Math.floor(100 / total)}%`;
      };

      const finalColWidths: string[] = [];
      for (let c = 0; c < maxCols; c++) {
        if (customWidths[c]) {
          finalColWidths.push(customWidths[c]);
        } else {
          finalColWidths.push(getDefaultWidth(c, maxCols));
        }
      }

      elements.push(
        <div key={`table-wrapper-${tableIndex++}`} style={{ margin: "4px 0 8px 0", width: "100%", paddingBottom: "2px" }}>
          <table
            style={{
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
              border: "1px solid #000",
              borderBottom: "1.5px solid #000",
              fontSize: "8.5pt",
              lineHeight: 1.1,
              fontFamily: isiFontFamily,
            }}
          >
            <colgroup>
              {finalColWidths.map((w, idx) => (
                <col key={idx} style={{ width: w }} />
              ))}
            </colgroup>
            {headerCells && (
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6" }}>
                  {headerCells.map((cell, cIdx) => {
                    const cleanCell = cell.replace(/\[[0-9.]+(?:%|px|mm)\]|\{[0-9.]+(?:%|px|mm)\}/g, "").trim();
                    const isCenter = cIdx === 0 || cIdx === 1 || cleanCell.toUpperCase() === "NO" || cleanCell.toUpperCase() === "WAKTU";
                    return (
                      <th
                        key={cIdx}
                        style={{
                          border: "1px solid #000",
                          padding: "3px 4px",
                          fontWeight: "bold",
                          textAlign: isCenter ? "center" : "left",
                          fontSize: "8.5pt",
                          verticalAlign: "middle",
                          wordBreak: "break-word",
                        }}
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(cleanCell) }}
                      />
                    );
                  })}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyItems.map((item, rIdx) => {
                if (item.type === "spanning") {
                  return (
                    <tr key={rIdx} style={{ backgroundColor: "#f9fafb" }}>
                      <td
                        colSpan={maxCols}
                        style={{
                          border: "1px solid #000",
                          borderBottom: "1px solid #000",
                          padding: "3px 4px",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "8.5pt",
                          letterSpacing: "0.02em",
                        }}
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(item.text) }}
                      />
                    </tr>
                  );
                }

                return (
                  <tr key={rIdx}>
                    {Array.from({ length: maxCols }).map((_, cIdx) => {
                      const cell = item.cells[cIdx] || "";
                      const isNo = cIdx === 0;
                      const isWaktu = cIdx === 1;
                      return (
                        <td
                          key={cIdx}
                          style={{
                            border: "1px solid #000",
                            borderBottom: "1px solid #000",
                            padding: "2.5px 3.5px",
                            textAlign: isNo ? "center" : isWaktu ? "center" : "left",
                            fontSize: "8.5pt",
                            verticalAlign: "top",
                            wordBreak: "break-word",
                            lineHeight: 1.1,
                          }}
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(cell.trim()) }}
                        />
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableItems = [];
    };

    lines.forEach((p, i) => {
      const trimmed = p.trim();
      const tabSegments = p.split("\t");
      const nonEmptySegments = tabSegments.filter((s) => s.trim().length > 0);

      // Abaikan baris kosong yang berada di tengah-tengah tabel tanpa menutup tabel secara prematur
      if (trimmed === "" && tableItems.length > 0) {
        const nextLines = lines.slice(i + 1, i + 5);
        const hasNextTableRow = nextLines.some((nl) => {
          const nt = nl.trim();
          return nt.startsWith("*") || /^[0-9]+[.)]/.test(nt) || nl.includes("\t\t");
        });
        if (hasNextTableRow) return;
      }

      // Cek apakah baris ini memuat tanda titik dua ':' (key-value atau data diri)
      const hasColon = trimmed.includes(":") || tabSegments.some((s) => s.trim().startsWith(":"));
      // Cek apakah baris ini adalah baris data diri / biodata (Nama, Jabatan, Tempat, dll.)
      const isBioField = /^(?:[0-9]+[.)]\s*)?(?:Nama|Tempat|Tanggal|Jabatan|Alamat|NIA|TTL|Status)\b/i.test(trimmed);

      // Baris biodata/key-value murni TIDAK BOLEH masuk tabel dan tidak boleh diberi border tabel
      const isPlainKeyValue =
        !trimmed.startsWith("*") &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("[") &&
        (hasColon || isBioField);

      // Deteksi baris tabel data:
      // Tabel HANYA boleh terbentuk jika:
      // 1. Baris header tabel baru (misal memuat 'NO[...]', 'NO\t', '[table]', dsb.)
      // 2. Baris jadwal waktu (misal: "1.\t12.30 – 13.00\tRegistrasi...") yang memuat rentang jam
      // 3. Tabel sudah aktif (tableItems.length > 0) dan baris BUKAN key-value / bio field
      const isHeaderRow =
        nonEmptySegments.length >= 3 &&
        (trimmed.toUpperCase().startsWith("NO") ||
          trimmed.includes("[") ||
          trimmed.includes("{") ||
          trimmed.startsWith("[table]"));

      const isScheduleTimeRow =
        /^[0-9]+[.)]\s*\t/.test(p) &&
        tabSegments.length >= 3 &&
        !hasColon &&
        !isBioField &&
        /[0-9]{2}[.:][0-9]{2}/.test(tabSegments[1] || "");

      const isTableRow =
        !isPlainKeyValue &&
        (isHeaderRow ||
          isScheduleTimeRow ||
          (tableItems.length > 0 && tabSegments.length >= 2 && !hasColon && !isBioField));

      if (isTableRow) {
        tableItems.push({ type: "row", cells: tabSegments });
        return;
      }

      // Deteksi sub-header tanggal (seperti *Rabu, 30 April 2025*, *Kamis, 1 Mei 2025*, dsb.) saat tabel aktif
      const isSubheaderDate =
        trimmed.startsWith("*Rabu") ||
        trimmed.startsWith("*Kamis") ||
        trimmed.startsWith("*Jum'at") ||
        trimmed.startsWith("*Sabtu") ||
        trimmed.startsWith("*Minggu") ||
        trimmed.startsWith("[row]") ||
        trimmed.startsWith("[header]");

      if ((tableItems.length > 0 || /^[0-9]+[.)]\s*\t/.test(lines[i + 1] || "")) && isSubheaderDate) {
        const cleanText = trimmed.replace(/^\[(?:row|header)\]/i, "").trim();
        tableItems.push({ type: "spanning", text: cleanText });
        return;
      }

      flushTable();

      const cleanUpper = trimmed.replace(/[*_]/g, "").trim().toUpperCase();
      const isCenterTitle =
        cleanUpper.startsWith("PROPOSAL KEGIATAN") ||
        cleanUpper.startsWith("LAPORAN PERTANGGUNGJAWABAN KEGIATAN") ||
        cleanUpper.startsWith("PR IPNU & IPPNU") ||
        cleanUpper.startsWith("PERIODE 202") ||
        trimmed.startsWith("[center]") ||
        trimmed.startsWith("<center>");

      if (isCenterTitle) {
        elements.push(
          <p
            key={`center-${i}`}
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: cleanUpper.startsWith("PROPOSAL") || cleanUpper.startsWith("LAPORAN") ? "12pt" : "11pt",
              lineHeight: 1.15,
              marginTop: "2px",
              marginBottom: cleanUpper.startsWith("PERIODE") ? "10px" : "2px",
              whiteSpace: "pre-wrap",
              pageBreakInside: "avoid",
              breakInside: "avoid",
            }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(p) }}
          />
        );
        return;
      }

      // 1. Deteksi Baris Biodata / Data Diri (Nama, Tempat Tanggal Lahir, Jabatan, NIA, dll.)
      const bioMatch = trimmed.match(/^(?:([0-9]+[.)])\s*)?([A-Za-z0-9\s/()–.,-]+?)\s*:\s*(.*)$/);
      const cleanLabel = bioMatch ? bioMatch[2].replace(/[\t:]/g, "").trim() : "";
      const isBioRow =
        bioMatch &&
        /^(?:Nama|Tempat|Tanggal|Jabatan|Alamat|NIA|TTL|Status)\b/i.test(cleanLabel) &&
        !trimmed.startsWith("*") &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("[");

      if (isBioRow && bioMatch) {
        const num = bioMatch[1] || "";
        const val = bioMatch[3].trim();

        elements.push(
          <div
            key={`bio-${i}`}
            style={{
              display: "grid",
              gridTemplateColumns: "22px 165px 14px 1fr",
              margin: "1px 0",
              lineHeight: 1.25,
              pageBreakInside: "avoid",
              breakInside: "avoid",
            }}
          >
            <span style={{ fontWeight: "normal" }}>{num}</span>
            <span>{cleanLabel}</span>
            <span>:</span>
            <span dangerouslySetInnerHTML={{ __html: parseMarkdown(val) }} />
          </div>
        );
        return;
      }

      // 2. Render Baris Key-Value Rapi khusus info jadwal kegiatan (Hari : Jum'at, Tanggal : ..., dll.) Tanpa Border Tabel
      const isScheduleKv =
        bioMatch &&
        /^(?:Hari|Pukul|Tempat)\s*:/i.test(trimmed) &&
        !p.includes("\t\t") &&
        bioMatch[2].trim().length <= 15 &&
        bioMatch[3].trim().length > 0 &&
        !trimmed.startsWith("*") &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("[");

      if (isScheduleKv && bioMatch) {
        elements.push(
          <div
            key={`kv-${i}`}
            style={{
              display: "grid",
              gridTemplateColumns: "85px 14px 1fr",
              margin: "1px 0",
              lineHeight: 1.25,
              pageBreakInside: "avoid",
              breakInside: "avoid",
            }}
          >
            <span>{bioMatch[2].trim()}</span>
            <span>:</span>
            <span dangerouslySetInnerHTML={{ __html: parseMarkdown(bioMatch[3].trim()) }} />
          </div>
        );
        return;
      }

      // 3. Render Baris Nilai Lanjutan Menjorok (seperti "  2 Mei 2025 M" di bawah Tanggal kegiatan)
      const isIndentedContinuation =
        (p.startsWith("\t") || p.startsWith("   ")) &&
        trimmed.length > 0 &&
        !trimmed.includes(":") && // Tidak boleh memuat titik dua agar tidak menjorokkan biodata!
        !trimmed.startsWith("*") &&
        !trimmed.startsWith("-") &&
        !trimmed.startsWith("•");

      if (isIndentedContinuation) {
        elements.push(
          <div
            key={`indent-${i}`}
            style={{
              display: "grid",
              gridTemplateColumns: "85px 14px 1fr",
              margin: "1px 0",
              lineHeight: 1.25,
              pageBreakInside: "avoid",
              breakInside: "avoid",
            }}
          >
            <span />
            <span />
            <span dangerouslySetInnerHTML={{ __html: parseMarkdown(trimmed) }} />
          </div>
        );
        return;
      }

      const hasTab = p.includes("\t");

      elements.push(
        <p
          key={`p-${i}`}
          style={{
            textAlign: hasTab ? "left" : "justify",
            lineHeight: 1.15,
            marginTop: "0px",
            marginBottom: "2px",
            whiteSpace: "pre-wrap",
            minHeight: trimmed === "" ? "0.6em" : "auto",
            pageBreakInside: "avoid",
            breakInside: "avoid",
          }}
          dangerouslySetInnerHTML={{ __html: parseMarkdown(p) }}
        />
      );
    });

    flushTable();
    return elements;
  }

  // Menu Pemilihan Jenis Surat (Jika belum memilih jenis surat)
  if (!jenisSuratParam && !editId && !kodeParam) {
    const letterTypes: Record<string, { label: string; kode: string; desc: string }[]> = {
      gabungan: [
        { label: "Permohonan Menjadi Pemateri", kode: "PMP", desc: "Permohonan pengisi materi BINARI / Diklat / Acara ke Ustadz/Narasumber." },
        { label: "Undangan Kegiatan", kode: "UND", desc: "Undangan menghadiri acara pembukaan ke Banom NU, Muslimat, Fatayat, dll." },
        { label: "Pemberitahuan Kegiatan", kode: "PBK", desc: "Surat pemberitahuan resmi pelaksanaan kegiatan ke PAC IPNU IPPNU / Desa." },
        { label: "Permohonan Izin Tempat & Fasilitas", kode: "PIT", desc: "Permohonan izin peminjaman gedung TPQ, Madrasah, atau Masjid." },
        { label: "Pemberitahuan & Izin Orang Tua", kode: "PIO", desc: "Surat izin dan pemberitahuan resmi kepada wali peserta kegiatan." },
        { label: "Permohonan Konsumsi / Bantuan", kode: "PKN", desc: "Permohonan bantuan logistik, konsumsi, atau snack kegiatan." },
        { label: "Proposal Kegiatan", kode: "PRP", desc: "Pengantar proposal sponsorship, donatur, atau permohonan dana." },
        { label: "Laporan Pertanggungjawaban (LPJ)", kode: "LPJ", desc: "Surat pengantar penyerahan LPJ realisasi kegiatan & keuangan." },
      ],
      ipnu: [
        { label: "Surat Tugas", kode: "ST", desc: "Penugasan anggota untuk menghadiri kegiatan atau delegasi." },
        { label: "Surat Keterangan", kode: "SK", desc: "Keterangan keaktifan atau kepengurusan anggota IPNU." },
        { label: "Surat Undangan", kode: "SU", desc: "Undangan rapat pengurus atau pertemuan rutinan IPNU." },
        { label: "Surat Permohonan", kode: "SP", desc: "Permohonan izin, bantuan, atau rekomendasi organisasi." },
      ],
      ippnu: [
        { label: "Surat Mandat", kode: "SM", desc: "Mandat resmi kepada rekanita untuk mengikuti kegiatan atau diklat." },
        { label: "Surat Keterangan", kode: "SK", desc: "Keterangan keanggotaan atau fungsionaris IPPNU." },
        { label: "Surat Undangan", kode: "SU", desc: "Undangan rutinan selapanan atau pertemuan pengurus IPPNU." },
        { label: "Surat Permohonan", kode: "SP", desc: "Permohonan pemateri, fasilitas, atau kerjasama." },
      ],
    };

    const types = letterTypes[org] || letterTypes.gabungan;

    return (
      <div className="max-w-5xl mx-auto mt-6 p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#1f9a5e]/10 text-[#1f9a5e] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FileText size={32} />
          </div>
          <h1 className="font-extrabold text-2xl md:text-3xl tracking-tight text-[#0d3320]">
            Format Surat {config.name} (Sesuai Arsip LPJ Resmi)
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto text-sm leading-relaxed">
            Pilih jenis surat di bawah ini. Sistem telah menyesuaikan format KOP surat, penomoran resmi, 
            layout 4 tanda tangan (Kepanitiaan &amp; Pimpinan Ranting), serta template redaksi otomatis.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {types.map((type, i) => (
            <motion.a
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              href={`${pathname}?jenis=${encodeURIComponent(type.label)}&kode=${type.kode}`}
              className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#1f9a5e]/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 group-hover:bg-[#1f9a5e] group-hover:text-white transition-colors flex items-center justify-center text-[#1f9a5e] flex-shrink-0">
                <FileText size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-[#0d3320] group-hover:text-[#1f9a5e] transition-colors">
                    {type.label}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {type.kode}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{type.desc}</p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full px-4 md:px-8 mx-auto -mt-2">
      {/* Top Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1f9a5e]/10 flex items-center justify-center text-[#1f9a5e]">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-[#0d3320]">
              Editor Surat Digital {isGabungan ? "Gabungan (Panitia & Ranting)" : config.fullName}
            </h1>
            <p className="text-[10px] uppercase font-bold text-[#1f9a5e] flex items-center gap-1">
              <Star size={10} fill="#f4c430" /> Format Resmi Terverifikasi LPJ BINARI Sidorejo
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReloadFormat} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100">
            <RefreshCcw size={14} /> Muat Ulang Template
          </button>
          <button onClick={handleResetForm} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-100">
            Kosongkan Form
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1f9a5e] hover:bg-[#145c38] transition-all shadow-md active:scale-95">
            <Save size={15} /> {saving ? "Menyimpan..." : "Simpan & Arsipkan"}
          </button>
        </div>
      </motion.div>

      {success && (
        <div className="p-4 rounded-xl bg-[#e0f3e8] border border-[#1f9a5e]/30 text-[#145c38] flex items-center gap-2">
          <CheckCircle size={18} /> <span className="font-bold text-sm">{success}</span>
        </div>
      )}

      {/* 2-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* LEFT: Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="relative z-10 rounded-2xl p-5 space-y-6 bg-white border border-[#1f9a5e]/10 shadow-sm overflow-hidden"
        >
          {/* Section 1: Penomoran & Perihal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#145c38]">1. Dasar Penomoran &amp; Tujuan</h3>
              {isGabungan && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                  Format LPJ BINARI
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#145c38]">Nomor Surat Lengkap</label>
              <input
                type="text"
                value={noSuratStr}
                onChange={(e) => setNoSuratStr(e.target.value)}
                placeholder="001/PR/Pan.Binari/IPNU-IPPNU/V/2025"
                className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#1f9a5e] outline-none font-mono font-semibold"
              />
              <p className="text-[10px] text-gray-400">Contoh format LPJ: <code>001/PR/Pan.Binari/IPNU-IPPNU/V/2025</code></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#145c38]">Perihal (Hal)</label>
                <input
                  type="text"
                  value={perihal}
                  onChange={(e) => setPerihal(e.target.value)}
                  placeholder="Contoh: PERMOHONAN MENJADI PEMATERI"
                  className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-100 outline-none font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#145c38]">Lampiran</label>
                <input
                  type="text"
                  value={lampiran}
                  onChange={(e) => setLampiran(e.target.value)}
                  placeholder="-"
                  className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-100 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#145c38]">Tujuan Surat (Kepada Yth.)</label>
                <span className="text-[10px] text-emerald-700 font-medium">Baris ke-3 (Domisili) otomatis menjorok</span>
              </div>
              <textarea
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                onKeyDown={handleTujuanKeyDown}
                onBlur={handleTujuanBlur}
                rows={3}
                placeholder="PAC IPNU IPPNU KECAMATAN TIRTO&#10;di&#10;&#9;TIRTO"
                className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none font-mono"
                style={{ tabSize: "28px" }}
              />
            </div>
          </div>

          {/* Section 2: Kop Surat */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#145c38] border-b pb-2">2. Pengaturan Kop Surat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={kopTingkat1}
                onChange={(e) => setKopTingkat1(e.target.value)}
                placeholder="Level / Tingkat (PANITIA KEGIATAN)"
                className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none md:col-span-2 font-semibold"
              />
              <input
                type="text"
                value={kopOrgText}
                onChange={(e) => setKopOrgText(e.target.value)}
                placeholder="Organisasi 1 (IKATAN PELAJAR NAHDLATUL ULAMA)"
                className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none font-semibold"
              />
              <input
                type="text"
                value={kopOrgText2}
                onChange={(e) => setKopOrgText2(e.target.value)}
                placeholder="Organisasi 2 (IKATAN PELAJAR PUTRI NAHDLATUL ULAMA)"
                className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none font-semibold"
              />
              <input
                type="text"
                value={kopSubOrg}
                onChange={(e) => setKopSubOrg(e.target.value)}
                placeholder="Wilayah (DESA SIDOREJO KECAMATAN TIRTO)"
                className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none md:col-span-2"
              />
              <input
                type="text"
                value={kopSekretariat}
                onChange={(e) => setKopSekretariat(e.target.value)}
                placeholder="Alamat Lengkap"
                className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none md:col-span-2 text-xs"
              />
              <input
                type="text"
                value={kopKontakWa}
                onChange={(e) => setKopKontakWa(e.target.value)}
                placeholder="Kontak WA (088291260072/0882006754145)"
                className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none text-xs"
              />
              <input
                type="text"
                value={kopKontakEmail}
                onChange={(e) => setKopKontakEmail(e.target.value)}
                placeholder="Email (ipnuippnusidorejotirto@gmail.com)"
                className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none text-xs"
              />
              <input
                type="text"
                value={kopKontakWebsite}
                onChange={(e) => setKopKontakWebsite(e.target.value)}
                placeholder="Website (ipnuippnusidorejo.or.id)"
                className="w-full text-sm p-2 rounded-lg bg-gray-50 border border-gray-200 outline-none text-xs"
              />
            </div>

            {/* Logo Options */}
            {isGabungan && (
              <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#145c38]">Tampilan Logo Kop:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setLogoMode("kegiatan"); setLogoKiri("/logo-binari.png"); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${logoMode === "kegiatan" ? "bg-[#1f9a5e] text-white" : "bg-white text-gray-600 border"}`}
                    >
                      Logo BINARI (LPJ)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLogoMode("dual"); setLogoKiri(null); }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${logoMode === "dual" ? "bg-[#1f9a5e] text-white" : "bg-white text-gray-600 border"}`}
                    >
                      Logo IPNU + IPPNU
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] text-gray-500 block mb-1">Ganti dengan Logo Kegiatan Custom:</label>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoChange(e, "kiri")} className="text-xs w-full" />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Isi Surat */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#145c38]">3. Isi Redaksi Surat</h3>
              {(targetKode === "PRP" || perihal.toUpperCase().includes("PROPOSAL")) && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Format Proposal Aktif
                </span>
              )}
            </div>

            {/* Info Proposal Multi-Halaman */}
            {(targetKode === "PRP" || perihal.toUpperCase().includes("PROPOSAL")) && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-400 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide">
                    ✦ Format Proposal Kegiatan
                  </p>
                  <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                    1 FILE PDF GABUNGAN
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPerihal(templates.PRP_COMBO.h);
                    setTujuan(templates.PRP_COMBO.t);
                    setLampiran(templates.PRP_COMBO.lamp);
                    setIsSurat(templates.PRP_COMBO.i);
                  }}
                  className="w-full p-3 text-left rounded-xl bg-white/80 border border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-extrabold text-emerald-950">
                      📚 Paket Proposal Lengkap Multi-Halaman
                    </p>
                  </div>
                  <p className="text-[10px] text-emerald-900 leading-tight">
                    Surat Pengantar (Hal 1 tanpa nomor) + Naskah Proposal 4 hal (Hal 1–4) → dicetak jadi <strong>1 file PDF</strong>.
                  </p>
                  <span className="mt-1.5 inline-block text-[9px] font-bold text-emerald-700">5 Halaman (Kop di Tiap Halaman)</span>
                </button>
              </div>
            )}

            {/* Info LPJ Multi-Halaman */}
            {(targetKode === "LPJ" || perihal.toUpperCase().includes("PERTANGGUNGJAWABAN")) && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-400 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-blue-950 uppercase tracking-wide">
                    ✦ Format Naskah LPJ
                  </p>
                  <span className="text-[9px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                    1 FILE PDF GABUNGAN
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPerihal(templates.LPJ_FULL.h);
                    setTujuan(templates.LPJ_FULL.t);
                    setLampiran("1 (Satu) Berkas");
                    setIsSurat(templates.LPJ_FULL.i);
                  }}
                  className="w-full p-3 text-left rounded-xl bg-white/80 border border-blue-300 hover:border-blue-500 hover:bg-blue-50 shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-extrabold text-blue-950">
                      📚 Berkas LPJ Lengkap Multi-Halaman
                    </p>
                  </div>
                  <p className="text-[10px] text-blue-900 leading-tight">
                    Surat Pengantar + Pendahuluan + Realisasi Kas &amp; Anggaran Keuangan + Lembar Pengesahan → dicetak jadi <strong>1 file PDF</strong>.
                  </p>
                  <span className="mt-1.5 inline-block text-[9px] font-bold text-blue-700">4 Halaman (Kop di Tiap Halaman)</span>
                </button>
              </div>
            )}

            {/* Toolbar Format & Pemisah Halaman */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => insertFormatting("*", "*")}
                  className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-700 shadow-xs cursor-pointer"
                  title="Format Teks Tebal"
                >
                  B (Tebal)
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("_", "_")}
                  className="px-2.5 py-1 text-xs italic bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-700 shadow-xs cursor-pointer"
                  title="Format Teks Miring"
                >
                  I (Miring)
                </button>
              </div>

              <button
                type="button"
                onClick={insertPageBreak}
                className="px-3 py-1 text-xs font-bold bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 rounded-lg border border-emerald-300 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Bagi naskah menjadi halaman baru (Page Break)"
              >
                ✂ <span>+ Pemisah Halaman (Page Break)</span>
              </button>
            </div>

            <textarea
              id="isi-surat-textarea"
              value={isiSurat}
              onChange={(e) => setIsSurat(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              rows={14}
              placeholder="Tuliskan isi surat atau proposal secara lengkap..."
              className={`w-full p-4 text-sm rounded-2xl bg-gray-50 border border-gray-100 focus:border-[#1f9a5e] outline-none transition-all leading-relaxed ${isIpnu ? "font-sans" : "font-serif"}`}
              style={{ tabSize: "40px", fontFamily: isiFontFamily }}
            />
            <p className="text-[10px] text-gray-500 leading-relaxed">
              💡 <strong>Tips Multi-Halaman:</strong> Gunakan tombol <code className="text-emerald-700 font-bold">+ Pemisah Halaman</code> atau ketik <code className="bg-gray-100 px-1 py-0.5 rounded font-bold">---</code> untuk membagi naskah proposal menjadi halaman 2, 3, 4, dst. Seluruh halaman akan otomatis digabung rapi menjadi <strong>1 file PDF</strong> saat diunduh / dicetak.
            </p>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[10px] text-emerald-800 space-y-1">
              <p className="font-bold flex items-center gap-1 text-[#145c38]">
                📊 <strong>Format &amp; Pengaturan Lebar Kolom Tabel:</strong>
              </p>
              <p className="text-gray-600 leading-relaxed">
                Tabel berkolom tab otomatis dikunci dengan proporsi baku (NO 7%, Waktu 18%, Kegiatan 27%, Petugas 28%, PJ 20%) sehingga garis tabel selalu tegak sejajar di semua halaman.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Untuk mengubah lebar kolom sesuai keinginan, Anda cukup menuliskan persentase pada judul kolom, contoh: <code className="bg-white px-1.5 py-0.5 border border-emerald-200 rounded font-mono font-bold text-emerald-900">NO[8%]&#9;WAKTU[20%]&#9;KEGIATAN[25%]&#9;PETUGAS[27%]&#9;PJ[20%]</code>.
              </p>
            </div>
          </div>

          {/* Section 4: Tanda Tangan */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#145c38]">4. Tanda Tangan</h3>
              {isGabungan && (
                <button
                  type="button"
                  onClick={() => setUseKepanitiaanTTD(!useKepanitiaanTTD)}
                  className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100"
                >
                  <Layers size={12} /> {useKepanitiaanTTD ? "Mode: 4 TTD (Kepanitiaan & Ranting)" : "Mode: 2 TTD (Pimpinan)"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#145c38]">Tempat / Wilayah</label>
                <input type="text" value={ttdWilayah} onChange={(e) => setTtdWilayah(e.target.value)} className="w-full text-sm p-2 rounded-xl border border-gray-200" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#145c38]">Tanggal Masehi</label>
                <input type="date" value={ttdTanggal} onChange={(e) => setTtdTanggal(e.target.value)} className="w-full text-sm p-2 rounded-xl border border-gray-200" />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-bold text-[#145c38]">Tanggal Hijriah</label>
                <input type="text" value={ttdTanggalHijriah} onChange={(e) => setTtdTanggalHijriah(e.target.value)} placeholder="Contoh: 18 Dzulqa'dah 1446 H" className="w-full text-sm p-2 rounded-xl border border-gray-200" />
              </div>
            </div>

            {/* BARIS 1: Panitia Pelaksana (atau Ketua & Sekretaris Ranting) */}
            <div className="p-3 rounded-2xl border border-emerald-100 bg-emerald-50/30 space-y-3">
              {useKepanitiaanTTD && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-emerald-800">Judul Kepanitiaan (Baris Atas):</label>
                  <input
                    type="text"
                    value={ttdPanitiaJudul}
                    onChange={(e) => setTtdPanitiaJudul(e.target.value)}
                    placeholder="PANITIA BINARI"
                    className="w-full text-xs p-2 rounded-lg border border-emerald-200 font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Penandatangan 1 */}
                <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1.5 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-gray-500">
                      {useKepanitiaanTTD ? "Ketua Pelaksana" : "Penandatangan 1"}
                    </label>
                    <button type="button" onClick={() => setActiveSearchSlot(activeSearchSlot === 1 ? null : 1)} className="p-1 hover:bg-[#1f9a5e]/10 text-[#1f9a5e] rounded-md">
                      <Search size={14} />
                    </button>
                  </div>
                  <input type="text" value={ttd1Jabatan} onChange={(e) => setTtd1Jabatan(e.target.value)} placeholder="Jabatan" className="w-full text-xs p-1.5 rounded border border-gray-100" />
                  <input type="text" value={ttd1Nama} onChange={(e) => setTtd1Nama(e.target.value)} placeholder="Nama Lengkap" className="w-full text-xs p-1.5 rounded border border-gray-100 font-bold" />
                  <input type="text" value={ttd1Nia} onChange={(e) => setTtd1Nia(e.target.value)} placeholder="NIA (Opsional)" className="w-full text-xs p-1.5 rounded border border-gray-100" />
                </div>

                {/* Penandatangan 2 */}
                <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1.5 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-gray-500">
                      {useKepanitiaanTTD ? "Sekretaris Pelaksana" : "Penandatangan 2"}
                    </label>
                    <button type="button" onClick={() => setActiveSearchSlot(activeSearchSlot === 2 ? null : 2)} className="p-1 hover:bg-[#1f9a5e]/10 text-[#1f9a5e] rounded-md">
                      <Search size={14} />
                    </button>
                  </div>
                  <input type="text" value={ttd2Jabatan} onChange={(e) => setTtd2Jabatan(e.target.value)} placeholder="Jabatan" className="w-full text-xs p-1.5 rounded border border-gray-100" />
                  <input type="text" value={ttd2Nama} onChange={(e) => setTtd2Nama(e.target.value)} placeholder="Nama Lengkap" className="w-full text-xs p-1.5 rounded border border-gray-100 font-bold" />
                  <input type="text" value={ttd2Nia} onChange={(e) => setTtd2Nia(e.target.value)} placeholder="NIA (Opsional)" className="w-full text-xs p-1.5 rounded border border-gray-100" />
                </div>
              </div>
            </div>

            {/* BARIS 2: Mengetahui Pimpinan Ranting (Ketua IPNU & Ketua IPPNU) */}
            {useKepanitiaanTTD && (
              <div className="p-3 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-blue-800">
                    Mengetahui (Pimpinan Ranting Sidorejo):
                  </label>
                  <span className="text-[10px] text-blue-600">Ketua IPNU &amp; Ketua IPPNU</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Penandatangan 3 (Ketua IPNU) */}
                  <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1.5 relative">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Ketua IPNU</label>
                      <button type="button" onClick={() => setActiveSearchSlot(activeSearchSlot === 3 ? null : 3)} className="p-1 hover:bg-[#1f9a5e]/10 text-[#1f9a5e] rounded-md">
                        <Search size={14} />
                      </button>
                    </div>
                    <input type="text" value={ttd3Jabatan} onChange={(e) => setTtd3Jabatan(e.target.value)} placeholder="Jabatan" className="w-full text-xs p-1.5 rounded border border-gray-100" />
                    <input type="text" value={ttd3Nama} onChange={(e) => setTtd3Nama(e.target.value)} placeholder="Nama Terang" className="w-full text-xs p-1.5 rounded border border-gray-100 font-bold" />
                    <input type="text" value={ttd3Nia} onChange={(e) => setTtd3Nia(e.target.value)} placeholder="NIA (Opsional)" className="w-full text-xs p-1.5 rounded border border-gray-100" />
                  </div>

                  {/* Penandatangan 4 (Ketua IPPNU) */}
                  <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1.5 relative">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase text-gray-500">Ketua IPPNU</label>
                      <button type="button" onClick={() => setActiveSearchSlot(activeSearchSlot === 4 ? null : 4)} className="p-1 hover:bg-[#1f9a5e]/10 text-[#1f9a5e] rounded-md">
                        <Search size={14} />
                      </button>
                    </div>
                    <input type="text" value={ttd4Jabatan} onChange={(e) => setTtd4Jabatan(e.target.value)} placeholder="Jabatan" className="w-full text-xs p-1.5 rounded border border-gray-100" />
                    <input type="text" value={ttd4Nama} onChange={(e) => setTtd4Nama(e.target.value)} placeholder="Nama Terang" className="w-full text-xs p-1.5 rounded border border-gray-100 font-bold" />
                    <input type="text" value={ttd4Nia} onChange={(e) => setTtd4Nia(e.target.value)} placeholder="NIA (Opsional)" className="w-full text-xs p-1.5 rounded border border-gray-100" />
                  </div>
                </div>
              </div>
            )}

            {/* Pop-up Pencarian Pengurus dari Database */}
            <AnimatePresence>
              {activeSearchSlot && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 bg-white border-2 border-emerald-500 rounded-xl shadow-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-800">
                      Pilih dari Database Pengurus (Slot {activeSearchSlot}):
                    </p>
                    <button type="button" onClick={() => setActiveSearchSlot(null)} className="text-xs text-red-500 font-bold">Tutup ✕</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Ketik nama atau jabatan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg outline-none"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                    {filteredPengurus.slice(0, 15).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPengurus(p, activeSearchSlot)}
                        className="p-2 hover:bg-emerald-50 text-xs cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-gray-800">{p.nama_lengkap}</p>
                          <p className="text-[10px] text-gray-500">{p.jabatan} ({p.organisasi || "IPNU"})</p>
                        </div>
                        {p.nia && <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">NIA: {p.nia}</span>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* RIGHT: Real-time Preview (Meniru persis format LPJ BINARI 2025) */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl overflow-hidden shadow-sm bg-white border border-[#1f9a5e]/20 sticky top-20">
          <div className="px-4 py-2 flex items-center justify-between bg-[#f0faf4] border-b border-[#1f9a5e]/10">
            <span className="text-[10px] font-bold text-[#145c38] uppercase tracking-wider flex items-center gap-1.5">
              <Star size={12} fill="#f4c430" /> Preview Otomatis (Format LPJ F4 / Folio)
            </span>
            <button onClick={handleDownloadPdf} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1f9a5e] hover:bg-[#145c38] transition-all shadow-sm">
              <Download size={13} /> Unduh / Cetak PDF
            </button>
          </div>

          <div className="overflow-y-auto overflow-x-hidden bg-gray-100 p-4 max-h-[85vh] flex justify-center w-full">
            {/* Paper Container F4 (210mm x 330mm per page) */}
            <div id="letter-preview-container" style={{ width: "210mm", zoom: 0.72 } as any}>
              <div id="letter-preview" className="space-y-6">
                {(() => {
                  const splitRegex = /(?:^|\n)\s*(?:---|===|\[page_break\]|\[pagebreak\])\s*(?:\n|$)/i;
                  const rawPages = (isiSurat ? isiSurat.split(splitRegex) : [""]).filter(
                    (p, idx) => p.trim().length > 0 || idx === 0
                  );
                  const totalPages = rawPages.length;
                  const hasSuratPengantar = Boolean(tujuan.trim() && totalPages > 1);

                  return rawPages.map((pageText, pIndex) => {
                    const isFirstPage = pIndex === 0;
                    const isLastPage = pIndex === totalPages - 1;

                    return (
                      <div
                        key={pIndex}
                        className="sheet-page shadow-2xl rounded-sm"
                        style={{
                          width: "210mm",
                          height: "330mm",
                          minHeight: "330mm",
                          maxHeight: "330mm",
                          padding: "8mm 18mm 10mm 18mm",
                          background: "white",
                          boxSizing: "border-box",
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          fontFamily: isiFontFamily,
                          fontSize: isiFontSize,
                          lineHeight: 1.15,
                          color: "#000",
                          overflow: "hidden",
                        }}
                      >
                        {/* ── BAGIAN ATAS & ISI (Sheet Body) ── */}
                        <div className="sheet-body" style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>
                          {/* 1. KOP SURAT LENGKAP DENGAN LOGO DI SETIAP HALAMAN (Tanpa Garis Pemisah Sesuai Instruksi) */}
                          {renderKopSurat()}

                          {/* 2. HEADER SURAT (Nomor, Lamp, Hal, & Tujuan) */}
                          {isFirstPage && (
                            <>
                              {tujuan.trim() !== "" ? (
                                <>
                                  <div style={{ display: "grid", gridTemplateColumns: "80px 10px 1fr", rowGap: "2px", marginBottom: "8px" }}>
                                    <span>Nomor</span><span>:</span><span>{noSuratStr || "-"}</span>
                                    <span>Lamp</span><span>:</span><span>{lampiran}</span>
                                    <span>Hal</span><span>:</span><span style={{ fontWeight: "bold" }}>{perihal}</span>
                                  </div>

                                  {/* Tujuan Surat (Kepada Yth.) */}
                                  <div style={{ marginBottom: "12px", marginTop: "4px" }}>
                                    <p style={{ margin: "1px 0" }}>Kepada Yth.</p>
                                    <div style={{ paddingLeft: "0px" }}>
                                      {(() => {
                                        // Bersihkan duplikat 'Kepada Yth.' di baris pertama jika ada
                                        const cleanTujuanLines = tujuan
                                          .split("\n")
                                          .filter((l, idx) => !(idx === 0 && l.trim().toLowerCase().startsWith("kepada yth")));

                                        return cleanTujuanLines.map((line, i) => {
                                          // Otomatis menjorok untuk baris ke-3 (domisili/tempat), baris setelah 'di', atau berawalan tab/spasi
                                          const prevLine = i > 0 ? cleanTujuanLines[i - 1]?.trim().toLowerCase() : "";
                                          const isDomisili =
                                            i === 2 ||
                                            prevLine.startsWith("di") ||
                                            line.startsWith("\t") ||
                                            line.startsWith("    ");

                                          return (
                                            <p
                                              key={i}
                                              style={{
                                                margin: "1px 0",
                                                paddingLeft: isDomisili ? "28px" : "0px",
                                                whiteSpace: "pre-wrap",
                                              }}
                                            >
                                              {line.trim()}
                                            </p>
                                          );
                                        });
                                      })()}
                                    </div>
                                  </div>

                                  {/* Salam Pembuka Standar NU Sidorejo */}
                                  <div style={{ marginBottom: "10px" }}>
                                    <p style={{ margin: "2px 0", textDecoration: "underline" }}>
                                      Assalamu'alaikum Warahmatullahi Wabarakatuh
                                    </p>
                                    <p style={{ margin: "2px 0", fontStyle: "italic", textDecoration: "underline" }}>
                                      Bismillahirrahmanirrahim
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <div style={{ textAlign: "center", marginBottom: "16px", marginTop: "4px" }}>
                                  <p style={{ margin: 0, fontWeight: "bold", textDecoration: "underline", textTransform: "uppercase", fontSize: "13pt" }}>
                                    {perihal}
                                  </p>
                                  {noSuratStr && (
                                    <p style={{ margin: "2px 0 10px 0", fontSize: "10pt", color: "#444" }}>
                                      Nomor : {noSuratStr}
                                    </p>
                                  )}
                                </div>
                              )}
                            </>
                          )}

                          {/* 3. REDAKSI TEKS PER HALAMAN */}
                          <div className="sheet-content" style={{ tabSize: "40px" }}>
                            {(() => {
                              // Bersihkan salam pembuka duplikat jika halaman 1 sudah menampilkan salam standar
                              let contentText = pageText;
                              if (isFirstPage && tujuan.trim() !== "") {
                                const pLines = pageText.split("\n");
                                const filteredLines: string[] = [];
                                let skippingSalam = true;
                                for (const line of pLines) {
                                  const lLower = line.trim().toLowerCase();
                                  if (skippingSalam) {
                                    if (
                                      lLower === "" ||
                                      lLower.includes("assalamu'alaikum") ||
                                      lLower.includes("assalamualaikum") ||
                                      lLower.includes("bismillah")
                                    ) {
                                      continue;
                                    }
                                    skippingSalam = false;
                                  }
                                  filteredLines.push(line);
                                }
                                contentText = filteredLines.join("\n");
                              }
                              return renderPageContent(contentText);
                            })()}
                          </div>

                          {/* 4. PENUTUP & TANDA TANGAN (TTD) */}
                          {/* Case A: Halaman 1 adalah Surat Pengantar (memiliki tujuan) */}
                          {isFirstPage && hasSuratPengantar && (
                            <>
                              <div style={{ marginTop: "10px", marginBottom: "12px", pageBreakInside: "avoid", breakInside: "avoid" }}>
                                <p style={{ margin: "2px 0", fontStyle: "italic", textDecoration: "underline" }}>
                                  Wallahul muwaffiq ila aqwamith thoriq
                                </p>
                                <p style={{ margin: "2px 0", fontStyle: "italic" }}>
                                  Wassalamu'alaikum Warahmatullahi Wabarakatuh
                                </p>
                              </div>
                              {renderTtdSection(false)}
                            </>
                          )}

                          {/* Case B: Single Page Letter (hanya 1 halaman) */}
                          {isFirstPage && totalPages === 1 && (
                            <>
                              {tujuan.trim() !== "" && (
                                <div style={{ marginTop: "10px", marginBottom: "12px", pageBreakInside: "avoid", breakInside: "avoid" }}>
                                  <p style={{ margin: "2px 0", fontStyle: "italic", textDecoration: "underline" }}>
                                    Wallahul muwaffiq ila aqwamith thoriq
                                  </p>
                                  <p style={{ margin: "2px 0", fontStyle: "italic" }}>
                                    Wassalamu'alaikum Warahmatullahi Wabarakatuh
                                  </p>
                                </div>
                              )}
                              {renderTtdSection(false)}
                            </>
                          )}

                          {/* Case C: Halaman Terakhir dari Naskah Proposal / LPJ Multi-Halaman */}
                          {isLastPage && totalPages > 1 && (() => {
                            const isProposalOrLpj =
                              perihal.toUpperCase().includes("PROPOSAL") ||
                              perihal.toUpperCase().includes("LAPORAN") ||
                              perihal.toUpperCase().includes("LPJ") ||
                              targetKode.startsWith("PRP") ||
                              targetKode.startsWith("LPJ");

                            if (isProposalOrLpj) {
                              return <>{renderTtdSection(true)}</>;
                            }
                            if (!hasSuratPengantar) {
                              return <>{renderTtdSection(false)}</>;
                            }
                            return null;
                          })()}
                        </div>

                        {/* ── BAGIAN BAWAH (Sheet Footer & Penomoran Halaman) ── */}
                        <div
                          className="sheet-footer"
                          style={{
                            marginTop: "auto",
                            paddingTop: "4px",
                            flexShrink: 0,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            pageBreakInside: "avoid",
                            breakInside: "avoid",
                          }}
                        >
                          <p style={{ color: "#1f9a5e", fontWeight: "bold", fontSize: "11px", margin: 0, letterSpacing: "0.15em", fontFamily: kopFontFamily }}>
                            BELAJAR, BERJUANG, BERTAQWA
                          </p>
                          <div>
                            {/* Jika naskah 1 adalah Surat Pengantar (hasSuratPengantar && isFirstPage), TIDAK diberi nomor halaman */}
                            {hasSuratPengantar && isFirstPage ? null : (
                              <span style={{ fontSize: "10.5pt", fontFamily: isIpnu ? "'Arial Narrow', Arial, sans-serif" : "'Times New Roman', Times, serif", color: "#374151", fontWeight: "600" }}>
                                {hasSuratPengantar
                                  ? `Halaman ${pIndex}`
                                  : totalPages > 1
                                  ? `Halaman ${pIndex + 1}`
                                  : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
