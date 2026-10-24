'use client';

import Link from 'next/link';

import { LURE_LABELS, isLureId } from '@/game/gear/gear';
import type { WallLine } from '@/game/wall/wall';

const LIGHT_LABELS = { dawn: 'dawn', day: 'day', dusk: 'dusk', night: 'night' } as const;

// A4 the wall (docs/alpha/A4_RUBRIC.md): a record board, one line per species,
// heaviest first. Used on the pond (overlay) and at /wall. An empty wall says
// so plainly and never hints at how many species there are.
export function WallBoard({
  lines,
  onClose,
  highlight
}: {
  lines: WallLine[];
  onClose?: () => void;
  highlight?: string | null;
}) {
  return (
    <section className="wall-board" data-testid="wall-board" aria-label="The wall">
      <header className="wall-head">
        <span className="wall-kicker">kept from these waters</span>
        <h2 className="wall-title">The Wall</h2>
      </header>
      {lines.length === 0 ? (
        <p className="wall-empty">Nothing kept yet. Keep a fish and it goes up here.</p>
      ) : (
        <ol className="wall-lines">
          {lines.map((line) => (
            <li
              key={line.species}
              className={`wall-line${line.legend && line.released ? ' wall-line--legend' : ''}${highlight === line.catchId ? ' wall-line--new' : ''}`}
              data-testid="wall-line"
            >
              <span className="wall-name">{line.name}</span>
              <span className="wall-weight">{line.weight}</span>
              <span className="wall-meta">
                {line.legend && line.released ? 'let go · ' : ''}{line.lengthCm} cm · {line.water} · {LIGHT_LABELS[line.light]} · {isLureId(line.lure) ? LURE_LABELS[line.lure].toLowerCase() : 'lure'}
              </span>
            </li>
          ))}
        </ol>
      )}
      <footer className="wall-foot">
        <Link href="/journal" className="wall-link">
          Every catch →
        </Link>
        {onClose ? (
          <button type="button" className="wall-close" onClick={onClose} data-testid="wall-close">
            Back to the water
          </button>
        ) : null}
      </footer>
    </section>
  );
}
