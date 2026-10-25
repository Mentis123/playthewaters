import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { PwaRegister } from '@/components/pwa/PwaRegister';
import { PwaUpdatePrompt } from '@/components/pwa/PwaUpdatePrompt';
import { QrTap } from '@/components/ui/QrTap';
import './globals.css';

export const metadata: Metadata = {
  // Absolute base for share previews (A4 catch links' og:image).
  metadataBase: new URL('https://playthewaters.vercel.app'),
  title: 'The Waters',
  description: 'Six waters, one shore. A fishing game for your phone, in the browser.',
  manifest: '/manifest.webmanifest',
  applicationName: 'The Waters',
  // The site's link preview: the painted shoreline (public/art/PROMPTS.md
  // `og`) with the title set over its dark left side, saved once as a JPEG
  // (public/og-title.jpg, ~150 KB; chat apps drop large previews). Catch links
  // have their own (src/app/c/[code]/opengraph-image.tsx).
  openGraph: {
    title: 'The Waters',
    description: 'Six waters, one shore. A fishing game for your phone, in the browser.',
    siteName: 'The Waters',
    images: [{ url: '/og-title.jpg', width: 1200, height: 630, alt: 'The Waters: six waters, one shore' }]
  },
  twitter: { card: 'summary_large_image', images: ['/og-title.jpg'] },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'The Waters'
  },
  // Art pass: iOS ignores SVG home-screen icons, so the painted PNGs lead.
  icons: {
    icon: [
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#1b2328'
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegister />
        <PwaUpdatePrompt />
        <QrTap />
      </body>
    </html>
  );
}
