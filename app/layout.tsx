import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'SOCIAL DOWNLOADER - Baixe vídeos do TikTok e Instagram',
  description: 'Baixe vídeos do TikTok e Instagram de forma rápida, segura e sem marca d\'água.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
