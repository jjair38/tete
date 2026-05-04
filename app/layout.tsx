import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Social Save | Baixar Vídeo do TikTok e Instagram Sem Marca d'Água",
  description: "O melhor downloader gratuito para vídeos do TikTok e Instagram. Baixe vídeos em HD sem marca d'água de forma rápida e segura.",
  keywords: ["baixar video tiktok", "download instagram reels", "sem marca d'agua", "tiktok downloader", "instagram saver"],
  authors: [{ name: "Social Save Team" }],
  openGraph: {
    title: "Social Save - Downloader Profissional",
    description: "Baixe vídeos do TikTok e Instagram em segundos.",
    type: "website",
    locale: "pt_BR",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased bg-[#0f0f0f] text-white`}>
        {children}
      </body>
    </html>
  );
}
