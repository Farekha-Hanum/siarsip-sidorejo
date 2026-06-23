import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

interface CertificateData {
  nama: string;
  skor: number;
  tanggal: string;
}

export async function generateMemberCertificate(data: CertificateData) {
  // 1. Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();
  
  // 2. Add a new page (A4 Landscape: 841.89 x 595.28)
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // 3. Embed fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // 4. Draw Background Border (Minimalist Blue & Gold)
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.1, 0.2, 0.4), // Dark Blue
    borderWidth: 4,
  });

  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.8, 0.6, 0.2), // Gold
    borderWidth: 1,
  });

  // 5. Draw Header
  page.drawText("SERTIFIKAT PENGHARGAAN", {
    x: width / 2 - 150,
    y: height - 120,
    size: 24,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.4),
  });

  page.drawText("Diberikan Kepada:", {
    x: width / 2 - 50,
    y: height - 160,
    size: 14,
    font: fontItalic,
    color: rgb(0.4, 0.4, 0.4),
  });

  // 6. Member Name
  const nameWidth = fontBold.widthOfTextAtSize(data.nama, 36);
  page.drawText(data.nama, {
    x: width / 2 - nameWidth / 2,
    y: height - 220,
    size: 36,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // 7. Middle Text
  const middleText = `Sebagai pengakuan atas keaktifan dan dedikasi luar biasa dalam Program SIMPEL NU Sidorejo`;
  page.drawText(middleText, {
    x: width / 2 - 200,
    y: height - 260,
    size: 12,
    font: fontRegular,
  });

  const predikat = data.skor >= 70 ? "ANGGOTA TERBEST (EXCELLENT)" : "ANGGOTA AKTIF";
  page.drawText(`Dengan Total Skor: ${data.skor} Poin - Predikat: ${predikat}`, {
    x: width / 2 - 140,
    y: height - 290,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.4),
  });

  // 8. Signature Area
  const sigDate = `Sidorejo, ${data.tanggal}`;
  page.drawText(sigDate, { x: width - 250, y: 150, size: 12, font: fontRegular });
  page.drawText("Admin PRNU Sidorejo", { x: width - 250, y: 130, size: 12, font: fontBold });
  page.drawText("( ____________________ )", { x: width - 250, y: 60, size: 12, font: fontBold });

  // 9. Logo Placeholder (Minimalist circle)
  page.drawCircle({
    x: 100,
    y: 100,
    size: 40,
    color: rgb(0.8, 0.6, 0.2),
    opacity: 0.2,
  });
  page.drawText("NU", { x: 88, y: 92, size: 20, font: fontBold, color: rgb(0.1, 0.3, 0.1) });

  // 10. Save the PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
