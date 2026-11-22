import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface CertificateData {
  nama: string;
  skor: number;
  tanggal: string;
  gender?: "laki-laki" | "perempuan" | "ipnu" | "ippnu" | string;
  organisasi?: "IPNU" | "IPPNU" | string;
  ketuaNama?: string;
  ketuaNia?: string;
  sekretarisNama?: string;
  sekretarisNia?: string;
  nomorSertifikat?: string;
}

/**
 * Intelligent helper to detect whether user is IPPNU (female/perempuan) or IPNU (male/laki-laki).
 */
export function detectIsFemale(user: {
  nama_lengkap?: string;
  organisasi?: string;
  assigned_dashboard?: string;
  gender?: string;
  jenis_kelamin?: string;
}): boolean {
  const g = (user.gender || user.jenis_kelamin || "").toLowerCase();
  if (g.includes("perempuan") || g.includes("putri") || g.includes("wanita") || g === "f" || g === "p") return true;
  if (g.includes("laki") || g.includes("pria") || g.includes("putra") || g === "m" || g === "l") return false;

  const org = (user.organisasi || "").toUpperCase();
  if (org === "IPPNU") return true;
  if (org === "IPNU") return false;

  const dash = (user.assigned_dashboard || "").toLowerCase();
  if (dash === "ippnu") return true;
  if (dash === "ipnu") return false;

  const name = (user.nama_lengkap || "").toLowerCase();
  const femaleKeywords = [
    "putri", "melati", "siti", "hanum", "feni", "zilfi", "wilda", "ani",
    "azzani", "ayu", "nabila", "fatimah", "aisyah", "nurul", "lestari",
    "rahma", "rahmawaty", "dewi", "wati", "anisa", "annisa", "zahra",
    "tri", "shofi", "fitri", "nadia", "safitri", "intan", "khadijah",
    "fithri", "nayla", "tiara", "salma", "cantika", "mutia", "marlina",
    "anggun", "suci", "amelia", "amel", "diana", "lia", "eka", "lidyana",
    "lisa", "falasifa", "aunila",
  ];
  const words = name.split(/[\s,._-]+/);
  return words.some((w) => femaleKeywords.includes(w));
}

/**
 * Helper to fetch image bytes in both browser and server environments
 */
async function loadLogoBytes(logoPath: string): Promise<Uint8Array | null> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(logoPath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = await res.arrayBuffer();
      return new Uint8Array(buffer);
    } catch (e) {
      console.warn("Could not fetch logo in browser:", logoPath, e);
      return null;
    }
  }
  return null;
}

/**
 * Draw luxury geometric corner ornaments
 */
function drawCornerOrnaments(page: any, width: number, height: number) {
  const gold      = rgb(0.80, 0.64, 0.22);
  const darkGreen = rgb(0.06, 0.22, 0.14);

  const corners = [
    { x: 38, y: height - 38, dx: 1,  dy: -1 }, // Top-Left
    { x: width - 38, y: height - 38, dx: -1, dy: -1 }, // Top-Right
    { x: 38, y: 38, dx: 1,  dy:  1 }, // Bottom-Left
    { x: width - 38, y: 38, dx: -1, dy:  1 }, // Bottom-Right
  ];

  corners.forEach(({ x, y, dx, dy }) => {
    // Outer gold bracket L-shape
    page.drawLine({ start: { x, y }, end: { x: x + dx * 28, y }, color: gold, thickness: 2 });
    page.drawLine({ start: { x, y }, end: { x, y: y + dy * 28 }, color: gold, thickness: 2 });

    // Inner parallel bracket
    page.drawLine({ start: { x: x + dx * 4, y: y + dy * 4 }, end: { x: x + dx * 24, y: y + dy * 4 }, color: darkGreen, thickness: 1 });
    page.drawLine({ start: { x: x + dx * 4, y: y + dy * 4 }, end: { x: x + dx * 4, y: y + dy * 24 }, color: darkGreen, thickness: 1 });

    // Decorative diamond at corner
    const cx = x + dx * 14;
    const cy = y + dy * 14;
    page.drawLine({ start: { x: cx, y: cy + dy * 4 }, end: { x: cx + dx * 4, y: cy }, color: gold, thickness: 1.5 });
    page.drawLine({ start: { x: cx + dx * 4, y: cy }, end: { x: cx, y: cy - dy * 4 }, color: gold, thickness: 1.5 });
    page.drawLine({ start: { x: cx, y: cy - dy * 4 }, end: { x: cx - dx * 4, y: cy }, color: gold, thickness: 1.5 });
    page.drawLine({ start: { x: cx - dx * 4, y: cy }, end: { x: cx, y: cy + dy * 4 }, color: gold, thickness: 1.5 });
  });
}

/**
 * Draw gold divider line with central diamond
 */
function drawGoldDivider(page: any, centerX: number, y: number, length: number) {
  const gold = rgb(0.80, 0.64, 0.22);
  const half = length / 2;
  page.drawLine({ start: { x: centerX - half, y }, end: { x: centerX - 12, y }, color: gold, thickness: 1 });
  page.drawLine({ start: { x: centerX + 12, y }, end: { x: centerX + half, y }, color: gold, thickness: 1 });
  page.drawLine({ start: { x: centerX, y: y + 4 }, end: { x: centerX + 4, y }, color: gold, thickness: 1.5 });
  page.drawLine({ start: { x: centerX + 4, y }, end: { x: centerX, y: y - 4 }, color: gold, thickness: 1.5 });
  page.drawLine({ start: { x: centerX, y: y - 4 }, end: { x: centerX - 4, y }, color: gold, thickness: 1.5 });
  page.drawLine({ start: { x: centerX - 4, y }, end: { x: centerX, y: y + 4 }, color: gold, thickness: 1.5 });
}

export async function generateMemberCertificate(data: CertificateData) {
  // ── 1. Create document ──────────────────────────────────────────────────
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage([841.89, 595.28]); // A4 Landscape
  const { width, height } = page.getSize();

  // ── 2. Determine gender & org (IPPNU = Times New Roman, IPNU = Arial) ───────
  const isFemale =
    data.organisasi === "IPPNU" ||
    data.gender === "perempuan" ||
    data.gender === "ippnu" ||
    detectIsFemale({ nama_lengkap: data.nama, organisasi: data.organisasi, gender: data.gender });

  const orgName  = isFemale ? "IKATAN PELAJAR PUTRI NAHDLATUL ULAMA" : "IKATAN PELAJAR NAHDLATUL ULAMA";
  const orgShort = isFemale ? "PR IPPNU" : "PR IPNU";
  const sebutan  = isFemale ? "Rekanita" : "Rekan";
  const kodeOrg  = isFemale ? "7455" : "7354";

  // ── 3. Uniform Typography (IPNU = Arial/Helvetica, IPPNU = Times New Roman) ──
  const fontBold    = await pdfDoc.embedFont(isFemale ? StandardFonts.TimesRomanBold   : StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(isFemale ? StandardFonts.TimesRoman       : StandardFonts.Helvetica);
  const fontItalic  = await pdfDoc.embedFont(isFemale ? StandardFonts.TimesRomanItalic : StandardFonts.HelveticaOblique);

  // ── 4. Color palette ─────────────────────────────────────────────────────
  const darkGreen = rgb(0.05, 0.20, 0.12); // #0d3320
  const softGold  = rgb(0.82, 0.66, 0.22); // #d2a838
  const textDark  = rgb(0.10, 0.15, 0.12);
  const textMuted = rgb(0.35, 0.40, 0.36);

  // ── 5. Parchment background ───────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.995, 0.992, 0.98) });

  // ── 6. Multi-layer borders ────────────────────────────────────────────────
  page.drawRectangle({ x: 18, y: 18, width: width - 36, height: height - 36, borderColor: darkGreen, borderWidth: 6 });
  page.drawRectangle({ x: 26, y: 26, width: width - 52, height: height - 52, borderColor: softGold,  borderWidth: 1.5 });
  page.drawRectangle({ x: 31, y: 31, width: width - 62, height: height - 62, borderColor: darkGreen, borderWidth: 0.75 });

  // ── 7. Corner ornaments ───────────────────────────────────────────────────
  drawCornerOrnaments(page, width, height);

  // Default signatures
  const ketuaNama      = data.ketuaNama      || (isFemale ? "Feni Lidyana"             : "Ahmad Hanafi");
  const ketuaNia       = data.ketuaNia       || `11.26.${kodeOrg}.001`;
  const sekretarisNama = data.sekretarisNama || (isFemale ? "Siti Yulia Farekha Hanum" : "M. Rizqi Pratama");
  const sekretarisNia  = data.sekretarisNia  || `11.26.${kodeOrg}.002`;

  // ── 8. Load logos ─────────────────────────────────────────────────────────
  const logoFileName = isFemale ? "/logo-ippnu.png" : "/logo-ipnu.png";
  const logoBytes    = await loadLogoBytes(logoFileName);
  const sealBytes    = await loadLogoBytes("/logo-baru.png"); // SIMPEL NU stamp

  let logoImg: any = null;
  let sealImg: any = null;
  if (logoBytes) try { logoImg = await pdfDoc.embedPng(logoBytes); } catch {}
  if (sealBytes) try { sealImg = await pdfDoc.embedPng(sealBytes); } catch {}

  // ── 9. Watermark logo (very faint, centred) ───────────────────────────────
  if (logoImg) {
    page.drawImage(logoImg, {
      x: width / 2 - 130, y: height / 2 - 140,
      width: 260, height: 260, opacity: 0.05,
    });
  }

  // ── 10. Header Logo (Di sebelah kiri, ukuran diperbesar) ────────────────────
  const logoSize = 82;
  const logoX    = 68;
  const logoY    = height - 130;

  if (logoImg) {
    page.drawImage(logoImg, {
      x: logoX,
      y: logoY,
      width: logoSize,
      height: logoSize,
    });
  }

  // ── 11. Header Text KOP (3 Baris: Warna, Jenis & Ukuran Font Sama) ───────
  const t1 = "PIMPINAN RANTING";
  const t2 = orgName;
  const t3 = "DESA SIDOREJO KECAMATAN TIRTO KABUPATEN PEKALONGAN";

  const kopFontSize = 15;
  const w1 = fontBold.widthOfTextAtSize(t1, kopFontSize);
  const w2 = fontBold.widthOfTextAtSize(t2, kopFontSize);
  const w3 = fontBold.widthOfTextAtSize(t3, kopFontSize);

  // Pusatkan teks KOP di area antara logo dan batas kanan agar seimbang & mudah dibaca
  const rightLimit  = width - 68;
  const textCenterX = (logoX + logoSize + rightLimit) / 2;

  page.drawText(t1, { x: textCenterX - w1 / 2, y: logoY + 54, size: kopFontSize, font: fontBold, color: darkGreen });
  page.drawText(t2, { x: textCenterX - w2 / 2, y: logoY + 31, size: kopFontSize, font: fontBold, color: darkGreen });
  page.drawText(t3, { x: textCenterX - w3 / 2, y: logoY + 8,  size: kopFontSize, font: fontBold, color: darkGreen });

  // ── Garis Pembatas KOP Resmi (Garis Ganda Hijau NU & Emas) ──────────────────
  const divY = logoY - 10;
  page.drawLine({ start: { x: 68, y: divY },       end: { x: width - 68, y: divY },       color: darkGreen, thickness: 1.5 });
  page.drawLine({ start: { x: 68, y: divY - 2.5 }, end: { x: width - 68, y: divY - 2.5 }, color: softGold,  thickness: 0.75 });

  const center = (text: string, y: number, size: number, font: any, color: any) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: width / 2 - w / 2, y, size, font, color });
  };

  // ── 12. Title ─────────────────────────────────────────────────────────────
  center("SERTIFIKAT ANGGOTA TERGIAT", divY - 36, 25, fontBold, darkGreen);

  // Nomor surat diperbesar dan diperjelas menggunakan font bold
  const currentYear = new Date().getFullYear();
  const noSertif = data.nomorSertifikat || `Nomor: 072/${orgShort}/SIMPEL-NU/X/${currentYear}`;
  center(noSertif, divY - 54, 11.5, fontBold, textDark);

  // ── 13. Recipient intro ───────────────────────────────────────────────────
  center(
    `Diberikan dengan penuh apresiasi dan kehormatan kepada ${sebutan}:`,
    divY - 82, 12, fontItalic, textMuted,
  );

  // ── 14. Recipient name ────────────────────────────────────────────────────
  let nameSize = 34;
  let wNama    = fontBold.widthOfTextAtSize(data.nama, nameSize);
  if (wNama > width - 160) {
    nameSize = 28;
    wNama    = fontBold.widthOfTextAtSize(data.nama, nameSize);
  }
  page.drawText(data.nama, {
    x: width / 2 - wNama / 2, y: divY - 120,
    size: nameSize, font: fontBold, color: textDark,
  });

  const nameDivY = divY - 130;
  drawGoldDivider(page, width / 2, nameDivY, Math.max(wNama + 60, 260));

  // ── 15. Description (Diperbesar agar jelas terbaca) ────────────────────────
  const desc1 = "Sebagai pengakuan atas keaktifan, dedikasi, dan loyalitas luar biasa dalam mengikuti";
  const desc2 = "seluruh rangkaian kegiatan dan program kerja organisasi pada Sistem SIMPEL NU Sidorejo";
  const descSize = 12.5;
  center(desc1, nameDivY - 26, descSize, fontRegular, textDark);
  center(desc2, nameDivY - 43, descSize, fontRegular, textDark);

  // ── 16. Predikat badge (Dipertebal & Diperbesar agar terlihat jelas) ───────
  const badgeW = 480, badgeH = 36;
  const badgeX = width / 2 - badgeW / 2;
  const badgeY = nameDivY - 92;
  page.drawRectangle({ x: badgeX, y: badgeY, width: badgeW, height: badgeH, color: darkGreen, borderColor: softGold, borderWidth: 1.5 });
  const predikat = data.skor >= 70 ? "ANGGOTA TERGIAT (EXCELLENT)" : "ANGGOTA AKTIF BERDEDIKASI";
  center(
    `PREDIKAT: ${predikat}  |  TOTAL: ${data.skor} POIN`,
    badgeY + 12, 12, fontBold, rgb(1.0, 0.92, 0.45),
  );

  // ── 17. Signatures ────────────────────────────────────────────────────────
  // KIRI = KETUA, KANAN = SEKRETARIS  (posisi dibalik sesuai permintaan)
  const sigY    = 135;
  const leftX   = 185;
  const rightX  = width - 185;

  // Date
  center(`Ditetapkan di: Sidorejo, ${data.tanggal}`, sigY + 22, 10, fontItalic, textMuted);

  function drawSignature(
    centerX: number,
    jabatan: string,
    nama: string,
    nia: string,
  ) {
    const jW = fontBold.widthOfTextAtSize(jabatan, 11);
    page.drawText(jabatan, { x: centerX - jW / 2, y: sigY, size: 11, font: fontBold, color: darkGreen });
    const nW = fontBold.widthOfTextAtSize(nama, 12);
    page.drawText(nama, { x: centerX - nW / 2, y: sigY - 55, size: 12, font: fontBold, color: textDark });
    // Underline
    const half = Math.max(nW / 2 + 10, 80);
    page.drawLine({ start: { x: centerX - half, y: sigY - 58 }, end: { x: centerX + half, y: sigY - 58 }, color: textDark, thickness: 1 });
    // NIA
    const niaStr = `NIA. ${nia}`;
    const niaW = fontRegular.widthOfTextAtSize(niaStr, 9);
    page.drawText(niaStr, { x: centerX - niaW / 2, y: sigY - 70, size: 9, font: fontRegular, color: textMuted });
  }

  // KIRI = KETUA
  drawSignature(leftX,  `Ketua ${orgShort},`,      ketuaNama,      ketuaNia);
  // KANAN = SEKRETARIS
  drawSignature(rightX, `Sekretaris ${orgShort},`, sekretarisNama, sekretarisNia);

  // ── 18. Center circular stamp – logo SIMPEL NU asli ──────────────────────
  const stampCX = width / 2;
  const stampCY = sigY - 26;
  const stampR  = 34; // radius

  if (sealImg) {
    // White circle backdrop for the logo
    page.drawCircle({ x: stampCX, y: stampCY, size: stampR + 4, color: rgb(1, 1, 1), opacity: 0.70 });
    // Thin gold ring border
    page.drawCircle({ x: stampCX, y: stampCY, size: stampR + 4, borderColor: softGold, borderWidth: 1.5 });
    // Logo image clipped to a square that matches the circle diameter
    const sz = (stampR + 4) * 2;
    page.drawImage(sealImg, {
      x: stampCX - sz / 2,
      y: stampCY - sz / 2,
      width:  sz,
      height: sz,
      opacity: 0.78, // sedikit transparan
    });
  } else {
    // Fallback text-stamp
    page.drawCircle({ x: stampCX, y: stampCY, size: stampR + 4, color: rgb(0.97, 0.95, 0.90) });
    page.drawCircle({ x: stampCX, y: stampCY, size: stampR + 4, borderColor: softGold, borderWidth: 1.5 });
    page.drawCircle({ x: stampCX, y: stampCY, size: stampR,     borderColor: darkGreen, borderWidth: 0.75 });
    const st1 = "SIMPEL NU"; const w1 = fontBold.widthOfTextAtSize(st1, 6.5);
    page.drawText(st1, { x: stampCX - w1 / 2, y: stampCY + 4, size: 6.5, font: fontBold, color: darkGreen });
    const st2 = "TERVERIFIKASI"; const w2 = fontBold.widthOfTextAtSize(st2, 5);
    page.drawText(st2, { x: stampCX - w2 / 2, y: stampCY - 4, size: 5, font: fontBold, color: softGold });
    const st3 = "SIDOREJO"; const w3 = fontRegular.widthOfTextAtSize(st3, 4);
    page.drawText(st3, { x: stampCX - w3 / 2, y: stampCY - 12, size: 4, font: fontRegular, color: textMuted });
  }

  // ── 19. Save ───────────────────────────────────────────────────────────────
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
