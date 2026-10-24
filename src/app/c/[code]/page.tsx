import type { Metadata } from 'next';
import { Suspense } from 'react';

import { GameClient } from '@/components/game/GameClient';
import { SPECIES_STORY_LABELS } from '@/game/fish/species';
import { trophyLengthCm } from '@/game/fish/trophy';
import { decodeCatchLink, lightWord } from '@/game/share/catchLink';

// A4 the link (docs/alpha/A4_RUBRIC.md): /c/<code> regrows the sender's pond.
// The code carries everything; the server stores nothing. A code that does
// not decode renders the normal game (the title screen), never an error.
type Props = { params: { code: string } };

export function generateMetadata({ params }: Props): Metadata {
  const link = decodeCatchLink(params.code);
  if (!link) return { title: 'The Waters', robots: { index: false } };
  const name = SPECIES_STORY_LABELS[link.species];
  const title = `A ${trophyLengthCm(link.species, link.sizeScore)} cm ${name}, ${lightWord(link.phase)}`;
  const description = 'Caught on The Waters, a fishing game. Tap to fish the same pond.';
  return {
    title: `${title} · The Waters`,
    description,
    robots: { index: false },
    openGraph: { title, description, siteName: 'The Waters', type: 'website' },
    twitter: { card: 'summary_large_image', title, description }
  };
}

export default function CatchLinkPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <GameClient arrivalCode={params.code} />
    </Suspense>
  );
}
