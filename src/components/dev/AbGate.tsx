'use client';

import { useEffect, useState } from 'react';

import { AB_STORAGE_KEY, type AbArm, type AbTable } from '@/game/light/look';
import type { LightName } from '@/game/light/pondLight';

// The A1 blind gate (docs/alpha/A1_RUBRIC.md §2). Two rounds, each comparing
// the classic v0.4 look with the A1 look at one light. The page randomises
// which is "Pond 1", hides it behind opaque tokens, and reveals only after
// both picks. Win threshold (stated in the rubric before the build): A1 must
// be picked in both rounds.

// The gate for the chapter under review. Bump `chapter` when a new chapter
// is gated so an old gate's picks are never mixed into a new one.
// `reviewing` and `tryThis` are shown at the top of /ab (owner, 24 Oct 2026:
// "make sure the ab is updated with what it is I'm reviewing"). Write them for
// the person holding the phone: what changed, and what to do in BOTH ponds to
// feel the difference. Never say which pond is which.
const GATE = {
  chapter: 'A3.1',
  title: 'Habits you can actually see',
  rubric: 'docs/alpha/A3_RUBRIC.md',
  baseline: 'a2' as AbArm['look'],
  baselineLabel: 'A2 (the bank, fish wander anywhere)',
  candidateLabel: 'A3 (habits)',
  rounds: ['day', 'night'] as LightName[],
  reviewing:
    'How the fish behave, not the looks. Last time the two ponds felt the same (you were right: the habits were real but too subtle to see). ' +
    'Now, in one pond, a fish you cast right on top of BOLTS with a splash, a V-wake and a tick, and the fish near it scatter; ' +
    'busy fish ripple a lot and idle ones barely at all; and a fish that wants a still lure nudges at it while a ring closes around it. ' +
    'In the other pond none of that happens.',
  tryThis: [
    'Cast right on top of a shadow. You should not be able to miss the difference.',
    'Before casting, watch for 30 seconds: which patches of water are busy?',
    'Land the lure a little short of a fish and leave it completely alone. Watch the lure.',
    'After you have picked both rounds, open the X-ray links at the bottom to see what each pond was doing.'
  ]
};
const ROUNDS = GATE.rounds;
const STATE_KEY = `thewaters.ab.state.${GATE.chapter}`;

type Round = { light: LightName; ponds: [string, string]; pick: 0 | 1 | null };
type GateState = { rounds: Round[]; createdAt: number };

function token(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 9);
}

function freshGate(): { gate: GateState; table: AbTable } {
  const table: AbTable = { tokens: {} };
  const rounds = ROUNDS.map((light): Round => {
    const classic = token();
    const alpha = token();
    table.tokens[classic] = { look: GATE.baseline, light } satisfies AbArm;
    table.tokens[alpha] = { look: 'alpha', light } satisfies AbArm;
    const classicFirst = crypto.getRandomValues(new Uint8Array(1))[0] < 128;
    return { light, ponds: classicFirst ? [classic, alpha] : [alpha, classic], pick: null };
  });
  return { gate: { rounds, createdAt: Date.now() }, table };
}

function save(gate: GateState, table?: AbTable) {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(gate));
    if (table) window.localStorage.setItem(AB_STORAGE_KEY, JSON.stringify(table));
  } catch {
    // Private mode: the gate still works within this page load.
  }
}

function load(): { gate: GateState; table: AbTable } | null {
  try {
    const gate = JSON.parse(window.localStorage.getItem(STATE_KEY) ?? 'null') as GateState | null;
    const table = JSON.parse(window.localStorage.getItem(AB_STORAGE_KEY) ?? 'null') as AbTable | null;
    return gate && table ? { gate, table } : null;
  } catch {
    return null;
  }
}

export function AbGate() {
  const [state, setState] = useState<{ gate: GateState; table: AbTable } | null>(null);

  useEffect(() => {
    const existing = load();
    if (existing) {
      setState(existing);
    } else {
      const fresh = freshGate();
      save(fresh.gate, fresh.table);
      setState(fresh);
    }
  }, []);

  if (!state) return <main className="ab-gate" />;

  const { gate, table } = state;
  const done = gate.rounds.every((round) => round.pick !== null);
  const alphaWins = gate.rounds.filter((round) => round.pick !== null && table.tokens[round.ponds[round.pick]]?.look === 'alpha').length;

  const choose = (roundIndex: number, pick: 0 | 1) => {
    const next: GateState = {
      ...gate,
      rounds: gate.rounds.map((round, i) => (i === roundIndex ? { ...round, pick } : round))
    };
    save(next);
    setState({ gate: next, table });
  };

  const restart = () => {
    const fresh = freshGate();
    save(fresh.gate, fresh.table);
    setState(fresh);
  };

  return (
    <main className="ab-gate">
      <p className="eyebrow">The Waters · blind gate · {GATE.chapter}</p>
      <h1>Which pond is better?</h1>
      <section className="ab-brief" data-testid="ab-brief">
        <h2>
          Reviewing {GATE.chapter}: {GATE.title}
        </h2>
        <p>{GATE.reviewing}</p>
        <p className="ab-try-label">Try this in both ponds</p>
        <ul>
          {GATE.tryThis.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <p className="ab-lede">
        Two rounds. In each, open both ponds, play as long as you like, come back here, and pick one. The page will not say
        which is which until you have picked both rounds.
      </p>
      {gate.rounds.map((round, roundIndex) => (
        <section key={round.light} className="ab-round">
          <h2>
            Round {roundIndex + 1} · {round.light}
          </h2>
          <div className="ab-ponds">
            {round.ponds.map((pond, pondIndex) => (
              <div key={pond} className="ab-pond">
                <a className="ab-open" href={`/game?pond=${pond}`} target="_blank" rel="noopener">
                  Open Pond {pondIndex + 1}
                </a>
                <button
                  type="button"
                  className={round.pick === pondIndex ? 'ab-pick is-picked' : 'ab-pick'}
                  onClick={() => choose(roundIndex, pondIndex as 0 | 1)}
                >
                  {round.pick === pondIndex ? 'Picked' : `Pond ${pondIndex + 1} is better`}
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
      {done ? (
        <section className="ab-result" data-testid="ab-result">
          <h2>{alphaWins === ROUNDS.length ? `${GATE.chapter} passes the blind gate` : `${GATE.chapter} does not pass the blind gate`}</h2>
          <ul>
            {gate.rounds.map((round) => (
              <li key={round.light}>
                {round.light}: you picked {table.tokens[round.ponds[round.pick ?? 0]]?.look === 'alpha' ? GATE.candidateLabel : GATE.baselineLabel}
              </li>
            ))}
          </ul>
          <p>Threshold, set before the build: {GATE.candidateLabel} must win both rounds. Record this in {GATE.rubric}.</p>
          <h2>X-ray (not blind)</h2>
          <p>
            The same ponds with a review lens: dots show what each fish is doing, rings show the homes. Use it to confirm a
            difference exists.
          </p>
          <ul className="ab-xray">
            {gate.rounds.map((round) =>
              round.ponds.map((pond) => (
                <li key={pond}>
                  <a className="ab-open" href={`/game?pond=${pond}&xray=1`} target="_blank" rel="noopener">
                    {round.light}: {table.tokens[pond]?.look === 'alpha' ? GATE.candidateLabel : GATE.baselineLabel}
                  </a>
                </li>
              ))
            )}
          </ul>
          <button type="button" className="ab-pick" onClick={restart}>
            Run it again
          </button>
        </section>
      ) : null}
    </main>
  );
}
