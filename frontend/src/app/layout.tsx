import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://allaboutskin.vercel.app'),
  title: {
    default: "Allabout.skin — Mobile App & Auditoría Científica de Skincare",
    template: "%s | Allabout.skin",
  },
  description: "Plataforma de bienestar y formulación cosmética. Guía de ingredientes, análisis de fórmulas y seguimiento personalizado de Skin Cycling.",
  openGraph: {
    title: "Allabout.skin — Mobile App & Auditoría Científica de Skincare",
    description: "Plataforma de bienestar y formulación cosmética. Guía de ingredientes, análisis de fórmulas y seguimiento personalizado de Skin Cycling.",
    url: "https://allaboutskin.vercel.app",
    siteName: "Allabout.skin",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Allabout.skin — Auditoría Científica de Skincare & Skin Cycling",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Allabout.skin — Mobile App & Auditoría Científica de Skincare",
    description: "Plataforma de bienestar y formulación cosmética. Guía de ingredientes, análisis de fórmulas y seguimiento personalizado de Skin Cycling.",
    images: ["/og-image.jpg"],
  },
};

import AppLayoutClient from "@/components/navigation/AppLayoutClient";

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#2D2825]">
        <AppLayoutClient>{children}</AppLayoutClient>
        <Analytics />
      </body>
    </html>
  );
}


