import type { Metadata } from 'next';

import { AbGate } from '@/components/dev/AbGate';
import { ReviewGate } from '@/components/dev/ReviewGate';

// Which /ab the current chapter needs (AGENTS.md /ab rule): 'blind' for a
// look (two hidden ponds, pick one), 'review' for features (a guided review).
const MODE: 'blind' | 'review' = 'review';

export const metadata: Metadata = {
  title: 'Review · The Waters',
  robots: { index: false, follow: false }
};

export default function AbPage() {
  return MODE === 'review' ? <ReviewGate /> : <AbGate />;
}
