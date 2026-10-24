import type { Metadata } from 'next';

import { PlaytestResults } from '@/components/dev/PlaytestResults';

export const metadata: Metadata = {
  title: 'Playtest results · The Waters',
  robots: { index: false, follow: false }
};

export default function PlaytestResultsPage() {
  return <PlaytestResults />;
}
