import * as XLSX from "xlsx";

export interface KegiatanExportItem {
  id: number;
  nama_kegiatan: string;
  tanggal_kegiatan: string;
  bobot_skor: number;
  deskripsi?: string | null;
}

export interface PartisipasiExportItem {
  id: number;
  id_kegiatan: number;
  id_user: string;
  status_validasi: string;
  skor_didapat: number;
  created_at: string;
  nama_lengkap?: string;
  username?: string;
  organisasi?: string;
}

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

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const translateStatus = (status: string) => {
  if (status === "approved") return "Hadir (Disetujui)";
  if (status === "pending") return "Menunggu Validasi";
  if (status === "rejected") return "Ditolak";
  return status;
};

/**
 * 1. Ekspor Daftar Peserta dari 1 Kegiatan Spesifik
 */
export function exportPesertaKegiatanToExcel(
  kegiatan: KegiatanExportItem,
  participants: PartisipasiExportItem[],
  stats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    partisipasiPersen: number;
    rasioKeberhasilan: number;
    totalAnggota: number;
  }
) {
  const workbook = XLSX.utils.book_new();

  // Header Ringkasan Kegiatan
  const ringkasanRows = [
    { "Keterangan": "NAMA KEGIATAN", "Nilai": kegiatan.nama_kegiatan },
    { "Keterangan": "TANGGAL PELAKSANAAN", "Nilai": formatDate(kegiatan.tanggal_kegiatan) },
    { "Keterangan": "BOBOT SKOR POIN", "Nilai": `${kegiatan.bobot_skor} Poin` },
    { "Keterangan": "TOTAL ANGGOTA RANTING", "Nilai": `${stats.totalAnggota} Anggota` },
    { "Keterangan": "JUMLAH HADIR (DISETUJUI)", "Nilai": `${stats.approved} Orang` },
    { "Keterangan": "MENUNGGU VALIDASI", "Nilai": `${stats.pending} Orang` },
    { "Keterangan": "DITOLAK", "Nilai": `${stats.rejected} Orang` },
    { "Keterangan": "TINGKAT PARTISIPASI RANTING", "Nilai": `${stats.partisipasiPersen}%` },
    { "Keterangan": "RASIO KEBERHASILAN KONFIRMASI", "Nilai": `${stats.rasioKeberhasilan}%` },
    { "Keterangan": "", "Nilai": "" }, // Baris kosong pemisah
  ];

  // Daftar Peserta
  const pesertaRows = participants.map((p, idx) => ({
    "No": idx + 1,
    "Nama Lengkap": p.nama_lengkap || "Anggota",
    "Username": p.username || "-",
    "Organisasi": (p.organisasi || "IPNU/IPPNU").toUpperCase(),
    "Waktu Konfirmasi": formatDateTime(p.created_at),
    "Status Kehadiran": translateStatus(p.status_validasi),
    "Skor Poin": p.skor_didapat || (p.status_validasi === "approved" ? kegiatan.bobot_skor : 0),
  }));

  // Buat worksheet dari data peserta
  const worksheet = XLSX.utils.json_to_sheet(
    pesertaRows.length > 0
      ? pesertaRows
      : [
          {
            "No": "-",
            "Nama Lengkap": "(Belum ada peserta yang mendaftar)",
            "Username": "-",
            "Organisasi": "-",
            "Waktu Konfirmasi": "-",
            "Status Kehadiran": "-",
            "Skor Poin": "-",
          },
        ]
  );

  worksheet["!cols"] = [
    { wch: 6 },  // No
    { wch: 32 }, // Nama Lengkap
    { wch: 22 }, // Username
    { wch: 15 }, // Organisasi
    { wch: 24 }, // Waktu Konfirmasi
    { wch: 22 }, // Status
    { wch: 12 }, // Skor Poin
  ];

  // Sheet 1: Daftar Peserta
  XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Peserta");

  // Sheet 2: Ringkasan Metrik
  const wsSummary = XLSX.utils.json_to_sheet(ringkasanRows.filter((r) => r.Keterangan));
  wsSummary["!cols"] = [{ wch: 32 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(workbook, wsSummary, "Ringkasan Statistik");

  // Unduh File
  const safeTitle = kegiatan.nama_kegiatan.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
  XLSX.writeFile(workbook, `Peserta_${safeTitle}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

/**
 * 2. Ekspor Rekap Seluruh Kegiatan & Partisipasi Organisasi
 */
export function exportSemuaKegiatanToExcel(
  activities: KegiatanExportItem[],
  participations: PartisipasiExportItem[],
  totalAnggota: number
) {
  const workbook = XLSX.utils.book_new();

  // 1. Sheet Rekap Kegiatan
  const rekapData = activities.map((k, idx) => {
    const parts = participations.filter((p) => p.id_kegiatan === k.id);
    const approved = parts.filter((p) => p.status_validasi === "approved").length;
    const pending = parts.filter((p) => p.status_validasi === "pending").length;
    const rejected = parts.filter((p) => p.status_validasi === "rejected").length;
    const partisipasiPersen = Math.min(100, Math.round((approved / (totalAnggota || 1)) * 100));
    const rasioKeberhasilan = parts.length > 0 ? Math.round((approved / parts.length) * 100) : 0;

    return {
      "No": idx + 1,
      "Nama Kegiatan": k.nama_kegiatan,
      "Tanggal": formatDate(k.tanggal_kegiatan),
      "Bobot Skor": `${k.bobot_skor} Poin`,
      "Hadir (Disetujui)": approved,
      "Menunggu Validasi": pending,
      "Ditolak": rejected,
      "Total Terdaftar": parts.length,
      "Tingkat Partisipasi Ranting": `${partisipasiPersen}%`,
      "Rasio Validasi (Keberhasilan)": `${rasioKeberhasilan}%`,
    };
  });

  const wsRekap = XLSX.utils.json_to_sheet(rekapData);
  wsRekap["!cols"] = [
    { wch: 6 },  // No
    { wch: 35 }, // Nama Kegiatan
    { wch: 20 }, // Tanggal
    { wch: 14 }, // Bobot
    { wch: 18 }, // Hadir
    { wch: 18 }, // Menunggu
    { wch: 12 }, // Ditolak
    { wch: 16 }, // Total Terdaftar
    { wch: 26 }, // Partisipasi
    { wch: 28 }, // Rasio
  ];
  XLSX.utils.book_append_sheet(workbook, wsRekap, "Rekap Kegiatan");

  // 2. Sheet Rincian Seluruh Peserta
  const actMap = new Map<number, KegiatanExportItem>();
  activities.forEach((a) => actMap.set(a.id, a));

  const allParticipantsRows = participations.map((p, idx) => {
    const keg = actMap.get(p.id_kegiatan);
    return {
      "No": idx + 1,
      "Nama Kegiatan": keg?.nama_kegiatan || "-",
      "Tanggal Kegiatan": formatDate(keg?.tanggal_kegiatan),
      "Nama Anggota": p.nama_lengkap || "Anggota",
      "Username": p.username || "-",
      "Organisasi": (p.organisasi || "IPNU/IPPNU").toUpperCase(),
      "Waktu Konfirmasi": formatDateTime(p.created_at),
      "Status Validasi": translateStatus(p.status_validasi),
      "Poin Diperoleh": p.skor_didapat || 0,
    };
  });

  const wsPeserta = XLSX.utils.json_to_sheet(
    allParticipantsRows.length > 0
      ? allParticipantsRows
      : [
          {
            "No": "-",
            "Nama Kegiatan": "-",
            "Tanggal Kegiatan": "-",
            "Nama Anggota": "(Belum ada data partisipasi)",
            "Username": "-",
            "Organisasi": "-",
            "Waktu Konfirmasi": "-",
            "Status Validasi": "-",
            "Poin Diperoleh": "-",
          },
        ]
  );
  wsPeserta["!cols"] = [
    { wch: 6 },  // No
    { wch: 32 }, // Nama Kegiatan
    { wch: 20 }, // Tanggal Kegiatan
    { wch: 30 }, // Nama Anggota
    { wch: 20 }, // Username
    { wch: 14 }, // Organisasi
    { wch: 22 }, // Waktu Konfirmasi
    { wch: 20 }, // Status Validasi
    { wch: 15 }, // Poin Diperoleh
  ];
  XLSX.utils.book_append_sheet(workbook, wsPeserta, "Rincian Partisipasi Peserta");

  // Unduh File
  XLSX.writeFile(
    workbook,
    `Rekap_Kegiatan_Partisipasi_IPNU_IPPNU_Sidorejo_${new Date().toISOString().split("T")[0]}.xlsx`
  );
}

