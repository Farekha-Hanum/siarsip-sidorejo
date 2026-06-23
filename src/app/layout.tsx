import type { Metadata } from "next";
import { Bebas_Neue, Outfit, Cinzel, Inter } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SIMPEL NU – Sistem Informasi Pelajar NU",
  description: "Platform digital terintegrasi untuk pelajar Nahdlatul Ulama – manajemen arsip, kegiatan, dan inventaris ranting IPNU-IPPNU.",
  keywords: ["IPNU", "IPPNU", "Nahdlatul Ulama", "pelajar NU", "SIMPEL NU", "arsip digital"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${bebasNeue.variable} ${outfit.variable} ${cinzel.variable} ${inter.variable} antialiased`}>
      <body className="min-h-screen bg-[#f7faf8] text-[#1a3a28] font-sans">
        {children}
      </body>
    </html>
  );
}
