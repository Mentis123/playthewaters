import type { Metadata } from 'next';

import { AbGate } from '@/components/dev/AbGate';

export const metadata: Metadata = {
  title: 'Blind gate · The Waters',
  robots: { index: false, follow: false }
};

export default function AbPage() {
  return <AbGate />;
}
