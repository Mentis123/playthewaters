import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { PwaRegister } from '@/components/pwa/PwaRegister';
import { PwaUpdatePrompt } from '@/components/pwa/PwaUpdatePrompt';
import './globals.css';

export const metadata: Metadata = {
  // Absolute base for share previews (A4 catch links' og:image).
  metadataBase: new URL('https://playthewaters.vercel.app'),
  title: 'The Waters',
  description: 'Six waters, one shore. A fishing game for your phone, in the browser.',
  manifest: '/manifest.webmanifest',
  applicationName: 'The Waters',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'The Waters'
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }]
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
      </body>
    </html>
  );
}
