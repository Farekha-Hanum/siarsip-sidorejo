import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

interface LetterData {
  nomorSurat: string;
  perihal: string;
  nama: string;
  nik: string;
  keperluan: string;
  tanggal: string;
  signatureBase64: string;
}

export async function generateOfficialLetter(data: LetterData, kopSuratBuffer?: ArrayBuffer) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let topOffset = height - 50;

  // 1. Draw Kop Surat (Image)
  if (kopSuratBuffer) {
    try {
      const kopImage = await pdfDoc.embedPng(kopSuratBuffer);
      const kopDims = kopImage.scale(0.5); // Adjust scale as needed
      page.drawImage(kopImage, {
        x: width / 2 - kopDims.width / 2,
        y: height - kopDims.height - 30,
        width: kopDims.width,
        height: kopDims.height,
      });
      topOffset = height - kopDims.height - 60;
    } catch (e) {
      console.error("Gagal memuat kop surat:", e);
    }
  }

  // Draw Horizontal Line
  page.drawLine({
    start: { x: 50, y: topOffset },
    end: { x: width - 50, y: topOffset },
    thickness: 2,
    color: rgb(0, 0, 0),
  });

  topOffset -= 40;

  // 2. Title
  page.drawText("SURAT KETERANGAN", {
    x: width / 2 - 80,
    y: topOffset,
    size: 16,
    font: fontBold,
  });
  
  topOffset -= 20;
  
  page.drawText(`Nomor: ${data.nomorSurat}`, {
    x: width / 2 - 60,
    y: topOffset,
    size: 11,
    font: fontRegular,
  });

  topOffset -= 60;

  // 3. Body
  const margin = 70;
  const contentWidth = width - margin * 2;
  const bodyText = `Yang bertanda tangan di bawah ini, Pengurus Ranting Nahdlatul Ulama (PRNU) Sidorejo, menerangkan bahwa:`;

  page.drawText(bodyText, {
    x: margin,
    y: topOffset,
    size: 11,
    font: fontRegular,
    maxWidth: contentWidth,
  });

  topOffset -= 50;

  const labels = [
    { label: "Nama", value: data.nama },
    { label: "NIK", value: data.nik },
    { label: "Keperluan", value: data.keperluan },
  ];

  labels.forEach((item) => {
    page.drawText(item.label, { x: margin + 20, y: topOffset, size: 11, font: fontBold });
    page.drawText(`: ${item.value}`, { x: margin + 120, y: topOffset, size: 11, font: fontRegular });
    topOffset -= 25;
  });

  topOffset -= 30;

  const footerText = `Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`;
  page.drawText(footerText, {
    x: margin,
    y: topOffset,
    size: 11,
    font: fontRegular,
    maxWidth: contentWidth,
  });

  topOffset -= 100;

  // 4. Signature
  const tglText = `Sidorejo, ${data.tanggal}`;
  page.drawText(tglText, { x: width - 220, y: topOffset, size: 11, font: fontRegular });
  
  topOffset -= 20;
  page.drawText("Admin PRNU Sidorejo,", { x: width - 220, y: topOffset, size: 11, font: fontBold });

  if (data.signatureBase64) {
    try {
      const sigImage = await pdfDoc.embedPng(data.signatureBase64);
      const sigDims = sigImage.scale(0.4);
      page.drawImage(sigImage, {
        x: width - 200,
        y: topOffset - sigDims.height - 10,
        width: sigDims.width,
        height: sigDims.height,
      });
      topOffset -= sigDims.height + 40;
    } catch (e) {
      console.error("Gagal memuat tanda tangan:", e);
    }
  } else {
    topOffset -= 80;
  }

  page.drawText("( ____________________ )", { x: width - 220, y: topOffset, size: 11, font: fontBold });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
