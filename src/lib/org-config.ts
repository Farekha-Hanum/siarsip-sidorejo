// ============================================================
// Organization Configuration for SIMPEL NU
// ============================================================

export type OrgType = "ipnu" | "ippnu" | "gabungan";

export type LetterCategory = {
  slug: string;
  label: string;
  kode: string; // Kode untuk penomoran surat
};

export type OrgConfig = {
  type: OrgType;
  name: string;
  fullName: string;
  logo: string;
  kodeOrganisasi: string;
  color: string;       // Primary accent
  colorLight: string;  // Light tint
  letterCategories: LetterCategory[];
  // Header Defaults
  tingkat1: string;
  orgText: string;
  orgText2?: string;
  subOrg: string;
  alamat1: string;
  wilayah: string;
  sekretariat?: string;
  kontakWa?: string;
  kontakEmail?: string;
  kontakWebsite?: string;
};

export const ORG_CONFIGS: Record<OrgType, OrgConfig> = {
  ipnu: {
    type: "ipnu",
    name: "IPNU",
    fullName: "Ikatan Pelajar Nahdlatul Ulama",
    logo: "/logo-ipnu.png",
    kodeOrganisasi: "7354",
    color: "#2d8c5a",
    colorLight: "#e8f5ee",
    tingkat1: "PIMPINAN RANTING",
    orgText: "IKATAN PELAJAR NAHDLATUL ULAMA",
    subOrg: "DESA SIDOREJO",
    alamat1: "KECAMATAN TIRTO",
    wilayah: "PEKALONGAN",
    sekretariat: "Sekretariat: Gedung NU Sidorejo Lt. 1",
    kontakWa: "08123456789",
    kontakEmail: "ipnu.sidorejo@gmail.com",
    letterCategories: [
      { slug: "surat-tugas", label: "Surat Tugas", kode: "ST" },
      { slug: "surat-keterangan", label: "Surat Keterangan", kode: "SK" },
      { slug: "surat-undangan", label: "Surat Undangan", kode: "SU" },
      { slug: "surat-permohonan", label: "Surat Permohonan", kode: "SP" },
    ],
  },
  ippnu: {
    type: "ippnu",
    name: "IPPNU",
    fullName: "Ikatan Pelajar Putri Nahdlatul Ulama",
    logo: "/logo-ippnu.png",
    kodeOrganisasi: "7455",
    color: "#2d8c5a",
    colorLight: "#e8f5ee",
    tingkat1: "PIMPINAN RANTING",
    orgText: "IKATAN PELAJAR PUTRI NAHDLATUL ULAMA",
    subOrg: "DESA SIDOREJO",
    alamat1: "KECAMATAN TIRTO",
    wilayah: "PEKALONGAN",
    sekretariat: "Sekretariat: Gedung NU Sidorejo Lt. 2",
    kontakWa: "08987654321",
    kontakEmail: "ippnu.sidorejo@gmail.com",
    letterCategories: [
      { slug: "surat-mandat", label: "Surat Mandat", kode: "SM" },
      { slug: "surat-keterangan", label: "Surat Keterangan", kode: "SK" },
      { slug: "surat-undangan", label: "Surat Undangan", kode: "SU" },
      { slug: "surat-permohonan", label: "Surat Permohonan", kode: "SP" },
    ],
  },
  gabungan: {
    type: "gabungan",
    name: "Gabungan",
    fullName: "IPNU-IPPNU",
    logo: "/logo-binari.png",
    kodeOrganisasi: "IPNU-IPPNU",
    color: "#2d8c5a",
    colorLight: "#e8f5ee",
    tingkat1: "PANITIA KEGIATAN",
    orgText: "IKATAN PELAJAR NAHDLATUL ULAMA",
    orgText2: "IKATAN PELAJAR PUTRI NAHDLATUL ULAMA",
    subOrg: "DESA SIDOREJO",
    alamat1: "KECAMATAN TIRTO",
    wilayah: "PEKALONGAN",
    sekretariat: "Jl. Raya Sidorejo Rt.05 Rw.02 No.33 Kec. Tirto Kab. Pekalongan 51151",
    kontakWa: "088291260072 / 0882006754145",
    kontakEmail: "ipnuippnusidorejotirto@gmail.com",
    kontakWebsite: "ipnuippnusidorejo.or.id",
    letterCategories: [
      { slug: "permohonan-pemateri", label: "Permohonan Menjadi Pemateri", kode: "PMP" },
      { slug: "undangan", label: "Undangan", kode: "UND" },
      { slug: "pemberitahuan-kegiatan", label: "Pemberitahuan Kegiatan", kode: "PBK" },
      { slug: "izin-tempat", label: "Permohonan Izin Tempat & Fasilitas", kode: "PIT" },
      { slug: "izin-orang-tua", label: "Pemberitahuan & Izin Orang Tua", kode: "PIO" },
      { slug: "permohonan-konsumsi", label: "Permohonan Konsumsi / Bantuan", kode: "PKN" },
      { slug: "proposal-kegiatan", label: "Proposal Kegiatan", kode: "PRP" },
      { slug: "laporan-pertanggungjawaban", label: "Laporan Pertanggungjawaban (LPJ)", kode: "LPJ" },
    ],
  },
};

export function getOrgConfig(org: string): OrgConfig | null {
  if (org in ORG_CONFIGS) {
    return ORG_CONFIGS[org as OrgType];
  }
  return null;
}

export function getLetterCategory(org: string, slug: string): LetterCategory | null {
  const config = getOrgConfig(org);
  if (!config) return null;
  return config.letterCategories.find((c) => c.slug === slug) || null;
}

// Roman numeral converter for month
export function toRoman(num: number): string {
  const lookup: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  for (const [value, symbol] of lookup) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}
