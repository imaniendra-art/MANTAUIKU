import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/NextAuthProvider";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXTAUTH_URL || "https://mantauiku.stimiyapmi.ac.id";

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MANTAUIKU | Sistem Penjaminan Mutu & Monitoring IKU STIMI YAPMI Makassar",
    template: "%s | MANTAUIKU STIMI YAPMI",
  },
  description:
    "Portal Resmi Lembaga Penjaminan Mutu (LPM) STIMI YAPMI Makassar. Monitoring capaian 12 IKU Permendiktisaintek, Audit Mutu Internal (AMI Siklus IX), Akreditasi LAMEMBA 9 Kriteria, dan Tracer Study CDC.",
  keywords: [
    "MANTAUIKU",
    "LPM STIMI YAPMI",
    "STIMI YAPMI Makassar",
    "Indikator Kinerja Utama",
    "IKU Kemendiktisaintek",
    "Akreditasi LAMEMBA",
    "Audit Mutu Internal",
    "Tracer Study",
  ],
  authors: [{ name: "Lembaga Penjaminan Mutu STIMI YAPMI Makassar" }],
  creator: "STIMI YAPMI Makassar",
  publisher: "LPM STIMI YAPMI Makassar",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    title: "MANTAUIKU - Sistem Penjaminan Mutu & Monitoring IKU STIMI YAPMI Makassar",
    description:
      "Sistem Terpadu Penjaminan Mutu & Monitoring IKU Lembaga Penjaminan Mutu (LPM) STIMI YAPMI Makassar.",
    siteName: "MANTAUIKU STIMI YAPMI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
