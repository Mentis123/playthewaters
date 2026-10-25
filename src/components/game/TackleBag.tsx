'use client';

import { useMemo, useState } from 'react';

import { IosInstallHint } from '@/components/pwa/IosInstallHint';
import { OfflineStatus } from '@/components/pwa/OfflineStatus';
import { QrCard } from '@/components/ui/QrTap';
import { SPECIES_ART, speciesLabel } from '@/game/fish/trophy';
import { isLegend, SPECIES_IDS, type SpeciesId } from '@/game/fish/species';
import { getJournal } from '@/game/persistence/catchJournal';
import type { Catch } from '@/game/persistence/sessionStore';
import { sharePond, shareCatchEntry, shareWall } from '@/game/share/shares';
import { formatWeight, loadWall, wallLines, weightGrams, WATER_NAMES } from '@/game/wall/wall';
import type { WaterId } from '@/game/waters/waters';
import { AUTHOR } from '@/lib/author';

// A5.1 the tackle bag (docs/alpha/HOME_PLAN.md): the pond is the home; this
// is everything that is yours, one tap away. The wall, the logbook, trophies
// to share, what you have found, bringing someone, settings, and who made it.
// Opened over a paused pond; nothing here plays the game for you.

type ShareState = Record<string, 'working' | 'done' | 'failed'>;

export function TackleBag({
  water,
  where,
  seed,
  foundSinker,
  seenBench,
  prefs,
  onTogglePref,
  onOpenWall,
  onOpenBench,
  onLeave,
  onClose
}: {
  water: WaterId;
  where: string;
  seed: string;
  foundSinker: boolean;
  seenBench: boolean;
  prefs: { audio: boolean; haptics: boolean };
  onTogglePref: (key: 'audio' | 'haptics') => void;
  onOpenWall: () => void;
  onOpenBench: () => void;
  onLeave: () => void;
  onClose: () => void;
}) {
  const [shares, setShares] = useState<ShareState>({});
  const wall = useMemo(() => loadWall(), []);
  const lines = useMemo(() => wallLines(wall), [wall]);
  const journal = useMemo(() => getJournal(), []);
  const byId = useMemo(() => new Map(journal.catches.map((c) => [c.id, c])), [journal]);
  const recent = useMemo(() => [...journal.catches].sort((a, b) => b.at - a.at).slice(0, 5), [journal]);

  // The shelf: your heaviest keeper from each water, and any legend.
  const trophies = useMemo(() => {
    const best = new Map<string, { catchId: string; species: SpeciesId; sizeScore: number; water: WaterId; grams: number }>();
    for (const keeper of wall.keepers) {
      if (keeper.released && !keeper.legend) continue;
      const key = keeper.legend ? `legend-${keeper.species}` : keeper.water;
      const grams = weightGrams(keeper.species, keeper.sizeScore);
      const current = best.get(key);
      if (!current || grams > current.grams) {
        best.set(key, { catchId: keeper.catchId, species: keeper.species, sizeScore: keeper.sizeScore, water: keeper.water, grams });
      }
    }
    return [...best.values()].sort((a, b) => b.grams - a.grams);
  }, [wall]);

  const run = async (key: string, task: () => Promise<unknown>) => {
    setShares((s) => ({ ...s, [key]: 'working' }));
    try {
      const result = await task();
      setShares((s) => ({ ...s, [key]: result === 'failed' ? 'failed' : 'done' }));
    } catch {
      setShares((s) => ({ ...s, [key]: 'failed' }));
    }
  };
  const label = (key: string, idle = 'Share') =>
    shares[key] === 'working' ? 'Sharing…' : shares[key] === 'done' ? 'Shared ✓' : shares[key] === 'failed' ? 'Try again' : idle;

  const shareCatch = (c: Catch | undefined, key: string) => {
    if (!c) return;
    void run(key, () => shareCatchEntry(c));
  };

  return (
    <div
      className="bag-overlay"
      data-testid="tackle-bag"
      role="dialog"
      aria-label="Your tackle bag"
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onClick={onClose}
    >
      <div className="bag-sheet" onClick={(event) => event.stopPropagation()}>
        <header className="bag-head">
          <span className="bag-where">{where}</span>
          <button type="button" className="bag-close" onClick={onClose} aria-label="Back to the water" data-testid="bag-close">
            Back to the water
          </button>
        </header>

        <section className="bag-section">
          <h3>The wall</h3>
          {lines.length === 0 ? (
            <p className="bag-empty">Nothing kept yet. Keep a fish and it goes up here.</p>
          ) : (
            <ol className="bag-lines">
              {lines.slice(0, 3).map((line) => (
                <li key={line.species} className={line.legend && line.released ? 'is-legend' : undefined}>
                  <span>{line.name}</span>
                  <span className="bag-weight">{line.weight}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="bag-actions">
            <button type="button" className="bag-btn" onClick={onOpenWall} data-testid="bag-open-wall">
              The whole wall
            </button>
            <button type="button" className="bag-btn" onClick={() => void run('wall', () => shareWall(lines))} data-testid="bag-share-wall">
              {label('wall', 'Share my wall')}
            </button>
          </div>
        </section>

        {trophies.length > 0 ? (
          <section className="bag-section">
            <h3>Trophies</h3>
            <div className="bag-shelf">
              {trophies.map((t) => {
                const art = SPECIES_ART[t.species];
                const legend = isLegend(t.species);
                const key = `trophy-${t.catchId}`;
                return (
                  <div key={t.catchId} className={`bag-plate${legend ? ' is-legend' : ''}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {art ? <img src={art} alt="" /> : <div className="bag-plate-blank" />}
                    <span className="bag-plate-name">{speciesLabel(t.species)}</span>
                    <span className="bag-plate-meta">{formatWeight(t.grams)} · {WATER_NAMES[t.water]}</span>
                    <button type="button" className="bag-btn" onClick={() => shareCatch(byId.get(t.catchId), key)} disabled={!byId.get(t.catchId)} data-testid="bag-share-trophy">
                      {label(key)}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="bag-section">
          <h3>Logbook</h3>
          {recent.length === 0 ? (
            <p className="bag-empty">No catches yet. The first one goes here.</p>
          ) : (
            <ol className="bag-log">
              {recent.map((c) => {
                const known = (SPECIES_IDS as string[]).includes(c.species);
                const key = `log-${c.id}`;
                return (
                  <li key={c.id}>
                    <span className="bag-log-what">
                      {speciesLabel(c.species)}
                      {known ? ` · ${formatWeight(weightGrams(c.species as SpeciesId, c.sizeScore))}` : ''}
                    </span>
                    <span className="bag-log-meta">
                      {c.water ? WATER_NAMES[c.water] : 'the home pond'} · {new Date(c.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <button type="button" className="bag-btn bag-btn--small" onClick={() => shareCatch(c, key)} data-testid="bag-share-log">
                      {label(key)}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
          <a className="bag-link" href="/journal">Every catch →</a>
        </section>

        {foundSinker || seenBench ? (
          <section className="bag-section">
            <h3>Found</h3>
            <ul className="bag-found">
              {foundSinker ? (
                <li>
                  <span className="bag-found-sinker" aria-hidden="true" />
                  <span>An old sinking lure, from under the home pond&apos;s bank.</span>
                </li>
              ) : null}
              {seenBench ? (
                <li>
                  <span className="bag-found-bench" aria-hidden="true" />
                  <button type="button" className="bag-link-btn" onClick={onOpenBench}>
                    The words on the lily pond&apos;s bench
                  </button>
                </li>
              ) : null}
            </ul>
          </section>
        ) : null}

        <section className="bag-section">
          <h3>Bring someone</h3>
          <div className="bag-actions">
            <button type="button" className="bag-btn" onClick={() => void run('pond', () => sharePond(seed, water))} data-testid="bag-share-pond">
              {label('pond', 'Fish my pond')}
            </button>
          </div>
          <QrCard />
          <p className="bag-note">Three fingers anywhere, any time: this code, to show someone.</p>
        </section>

        <section className="bag-section">
          <h3>Settings</h3>
          <div className="bag-actions">
            <button type="button" className="bag-btn" aria-pressed={prefs.audio} onClick={() => onTogglePref('audio')}>
              Sound {prefs.audio ? 'on' : 'off'}
            </button>
            <button type="button" className="bag-btn" aria-pressed={prefs.haptics} onClick={() => onTogglePref('haptics')}>
              Vibration {prefs.haptics ? 'on' : 'off'}
            </button>
            <button type="button" className="bag-btn" onClick={onLeave} data-testid="leave-pond">
              Leave the water
            </button>
          </div>
          <OfflineStatus />
          <IosInstallHint />
        </section>

        <section className="bag-section bag-about" data-testid="bag-about">
          <h3>About</h3>
          <p>
            <i>The Waters</i> is made by{' '}
            <a href={AUTHOR.url} target="_blank" rel="noreferrer">
              {AUTHOR.fullName} ({AUTHOR.name})
            </a>
            .
          </p>
          <p className="bag-about-links">
            <a href={AUTHOR.url} target="_blank" rel="noreferrer">Site</a>
            <a href={AUTHOR.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a href={AUTHOR.x} target="_blank" rel="noreferrer">X</a>
          </p>
          <p>
            A Birb Labs artefact. Learn to build things like this at{' '}
            <a href={AUTHOR.academy} target="_blank" rel="noreferrer">Vibe Academy</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
