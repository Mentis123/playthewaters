import type { Metadata } from 'next';

import { PlaytestForm } from '@/components/dev/PlaytestForm';

export const metadata: Metadata = {
  title: 'Playtest · The Waters',
  robots: { index: false, follow: false }
};

export default function PlaytestPage() {
  return <PlaytestForm />;
}
