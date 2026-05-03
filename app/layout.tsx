import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'SOCIAL DOWNLOADER - Baixe vídeos do TikTok e Instagram',
  description: 'Baixe vídeos do TikTok e Instagram de forma rápida, segura e sem marca d\'água.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  const publisherId = "ca-pub-3630961061648944";

  return (
    <html lang="pt-BR">
      <head>
        <meta name="google-adsense-account" content="ca-pub-3630961061648944" />
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
