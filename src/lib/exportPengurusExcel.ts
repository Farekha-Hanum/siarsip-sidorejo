import * as XLSX from "xlsx";

export interface PengurusItem {
  id: number;
  nia?: string | null;
  nama_lengkap: string;
  jabatan: string;
  alamat?: string | null;
  nomor_telepon?: string | null;
  tanggal_bergabung?: string | null;
  organisasi?: string | null;
  created_at?: string;
}

export function exportPengurusToExcel(members: PengurusItem[]) {
  // Pisahkan pengurus IPNU dan IPPNU
  const ipnuMembers = members.filter(
    (m) => (m.organisasi || "IPNU").toUpperCase() === "IPNU"
  );
  const ippnuMembers = members.filter(
    (m) => (m.organisasi || "").toUpperCase() === "IPPNU"
  );

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const mapToRows = (list: PengurusItem[]) => {
    return list.map((m, idx) => ({
      "No": idx + 1,
      "NIA (Nomor Induk Anggota)": m.nia || "-",
      "Nama Lengkap": m.nama_lengkap || "-",
      "Jabatan": m.jabatan || "-",
      "Organisasi": (m.organisasi || "IPNU").toUpperCase(),
      "Nomor Telepon / WA": m.nomor_telepon || "-",
      "Alamat": m.alamat || "-",
      "Tanggal Bergabung": formatDate(m.tanggal_bergabung),
    }));
  };

  const workbook = XLSX.utils.book_new();

  // Kolom lebar agar tampilan Excel rapi dan tidak terpotong
  const colWidths = [
    { wch: 6 },  // No
    { wch: 22 }, // NIA
    { wch: 32 }, // Nama Lengkap
    { wch: 26 }, // Jabatan
    { wch: 14 }, // Organisasi
    { wch: 20 }, // Nomor Telepon / WA
    { wch: 45 }, // Alamat
    { wch: 22 }, // Tanggal Bergabung
  ];

  // 1. Sheet Pengurus IPNU
  const ipnuData = mapToRows(ipnuMembers);
  const wsIpnu = XLSX.utils.json_to_sheet(
    ipnuData.length > 0
      ? ipnuData
      : [
          {
            "No": "-",
            "NIA (Nomor Induk Anggota)": "-",
            "Nama Lengkap": "(Belum ada data pengurus IPNU)",
            "Jabatan": "-",
            "Organisasi": "IPNU",
            "Nomor Telepon / WA": "-",
            "Alamat": "-",
            "Tanggal Bergabung": "-",
          },
        ]
  );
  wsIpnu["!cols"] = colWidths;
  XLSX.utils.book_append_sheet(workbook, wsIpnu, "IPNU");

  // 2. Sheet Pengurus IPPNU
  const ippnuData = mapToRows(ippnuMembers);
  const wsIppnu = XLSX.utils.json_to_sheet(
    ippnuData.length > 0
      ? ippnuData
      : [
          {
            "No": "-",
            "NIA (Nomor Induk Anggota)": "-",
            "Nama Lengkap": "(Belum ada data pengurus IPPNU)",
            "Jabatan": "-",
            "Organisasi": "IPPNU",
            "Nomor Telepon / WA": "-",
            "Alamat": "-",
            "Tanggal Bergabung": "-",
          },
        ]
  );
  wsIppnu["!cols"] = colWidths;
  XLSX.utils.book_append_sheet(workbook, wsIppnu, "IPPNU");

  // 3. Sheet Rekapitulasi (Semua Pengurus)
  const allData = mapToRows(members);
  if (allData.length > 0) {
    const wsAll = XLSX.utils.json_to_sheet(allData);
    wsAll["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(workbook, wsAll, "Semua Pengurus");
  }

  // Nama file dengan tanggal otomatis
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const filename = `Data_Pengurus_IPNU_IPPNU_Sidorejo_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
