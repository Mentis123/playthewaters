'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { WallBoard } from '@/components/game/WallBoard';
import { loadWall, wallLines, type WallLine } from '@/game/wall/wall';

// A4 the wall as a page (docs/alpha/A4_RUBRIC.md). The same board the pond
// opens; localStorage is client-only, so it reads after mount.
export default function WallPage() {
  const [lines, setLines] = useState<WallLine[] | null>(null);
  useEffect(() => {
    setLines(wallLines(loadWall()));
  }, []);
  return (
    <main className="wall-page">
      {lines ? <WallBoard lines={lines} /> : null}
      <Link href="/game" className="wall-back">
        Back to the water
      </Link>
    </main>
  );
}
