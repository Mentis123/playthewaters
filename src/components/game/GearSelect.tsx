'use client';

import { STRIP_LURE_IDS, LURE_LABELS, ROD_IDS, ROD_LABELS, type LureId, type RodId } from '@/game/gear/gear';
import type { GearSelection } from '@/game/persistence/gearStore';

function rodGlyph(id: RodId) {
  // The glyph IS the cast curve (22_THE_GEAR): a long shallow arc that reaches, vs
  // a short steep arc that lands near. No skeuomorphic rod imagery.
  const path = id === 'long' ? 'M3 19 Q14 9 25 16' : 'M8 20 Q13 7 18 18';
  return (
    <svg viewBox="0 0 28 28" width="24" height="24" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function lureGlyph(id: LureId) {
  // Abstract procedural marks (moonlit palette), not tackle imagery (14_DO_NOT_BUILD).
  return (
    <svg viewBox="0 0 28 28" width="24" height="24" aria-hidden="true">
      {id === 'natural' ? (
        <ellipse cx="14" cy="14" rx="8" ry="3.4" fill="currentColor" />
      ) : id === 'popper' ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="14" cy="14" r="2.2" fill="currentColor" stroke="none" />
          <path d="M7 14a7 7 0 0 1 14 0" />
          <path d="M4 14a10 10 0 0 1 20 0" opacity="0.55" />
        </g>
      ) : id === 'old_sinker' ? (
        // The found lure: the heavy teardrop that goes to the bottom.
        <path d="M14 6 C18 12 18 18 14 22 C10 18 10 12 14 6 Z" fill="currentColor" />
      ) : (
        // The quiet lure: a small dull nymph, barely a mark (no longer a
        // teardrop sinker; the only sinking lure is the one you find).
        <g fill="currentColor">
          <ellipse cx="14" cy="14" rx="2.6" ry="5" />
          <path d="M14 9 L11.5 6 M14 9 L16.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}

export function GearSelect({
  gear,
  onSelect,
  explainerOpen,
  onExplainerOpenChange
}: {
  gear: GearSelection;
  onSelect: (next: GearSelection) => void;
  explainerOpen: boolean;
  onExplainerOpenChange: (open: boolean) => void;
}) {
  // Minimal pre-cast picker (22_THE_GEAR): idle-only, no chrome, no modal, no labels.
  // The lone exception to "no labels" is an opt-in explainer behind a small ? — it
  // describes the *trade* each piece makes (never a stat or a tier), so the strip can
  // stay wordless without the gear reading as arbitrary on first encounter. Open-state
  // is owned by the parent because opening it pauses the pond (the runtime reads it).
  return (
    <div className="gear-select" data-testid="gear-select">
      <button
        type="button"
        className={`gear-help${explainerOpen ? ' open' : ''}`}
        aria-label="What do rods and lures do?"
        aria-expanded={explainerOpen}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => onExplainerOpenChange(!explainerOpen)}
      >
        ?
      </button>
      {explainerOpen ? (
        <div
          className="gear-explainer"
          role="dialog"
          aria-label="Rods and lures"
          data-testid="gear-explainer"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <p className="gear-explainer-lead">Pick before you cast. Each piece trades something — none is just better.</p>
          <h3>Rods</h3>
          <ul>
            <li><span className="gear-explainer-glyph" aria-hidden="true">{rodGlyph('long')}</span><span><b>Long</b> — reaches the far dark. The whole gamble.</span></li>
            <li><span className="gear-explainer-glyph" aria-hidden="true">{rodGlyph('short')}</span><span><b>Short</b> — lands near and exact, but never reaches the dark.</span></li>
          </ul>
          <h3>Lures</h3>
          <ul>
            <li><span className="gear-explainer-glyph" aria-hidden="true">{lureGlyph('natural')}</span><span><b>Natural</b> — an even read of the water.</span></li>
            <li><span className="gear-explainer-glyph" aria-hidden="true">{lureGlyph('popper')}</span><span><b>Popper</b> — a loud draw that pulls fish in, and spooks them just as fast.</span></li>
            <li><span className="gear-explainer-glyph" aria-hidden="true">{lureGlyph('quiet')}</span><span><b>Quiet</b> — a small draw; place it true and it won&rsquo;t scare a thing.</span></li>
          </ul>
        </div>
      ) : null}
      <div className="gear-row" role="group" aria-label="Rod">
        {ROD_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={`gear-glyph${gear.rodId === id ? ' selected' : ''}`}
            aria-pressed={gear.rodId === id}
            aria-label={ROD_LABELS[id]}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onSelect({ ...gear, rodId: id })}
          >
            {rodGlyph(id)}
          </button>
        ))}
      </div>
      <div className="gear-row" role="group" aria-label="Lure">
        {STRIP_LURE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={`gear-glyph${gear.lureId === id ? ' selected' : ''}`}
            aria-pressed={gear.lureId === id}
            aria-label={LURE_LABELS[id]}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onSelect({ ...gear, lureId: id })}
          >
            {lureGlyph(id)}
          </button>
        ))}
      </div>
    </div>
  );
}
