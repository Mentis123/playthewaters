'use client';

import { useEffect, useState } from 'react';

import { createRuntime } from '@/components/game/runtime';
import { dailySeed } from '@/game/persistence/sessionStore';
import { catchLinkPath } from '@/game/share/catchLink';

// /ab in review mode (AGENTS.md /ab rule). A chapter that adds features rather
// than a look cannot be judged by a blind pair, so /ab becomes a guided review:
// what changed, what to do, and the starred rubric items as yes/no. A4 is the
// first such chapter (docs/alpha/A4_RUBRIC.md). Picks stay on this device.
const REVIEW = {
  chapter: 'A4',
  title: 'The wall and the link',
  rubric: 'docs/alpha/A4_RUBRIC.md',
  reviewing:
    'Three new things. Every catch now asks Keep or Let go, and you get one keeper per visit. Kept fish go on The Wall, ' +
    'a record board with the heaviest of each species, weight in lb and oz. And Share now sends a link: whoever opens it lands ' +
    'on your pond, with the same fish and the same light, and the silhouette of your fish where you hooked it.',
  steps: [
    'Open the sample link below in a private tab (or on another phone). You should be on a pond in under 2 seconds, with a card saying what was caught there and a dark fish shape in the water.',
    'Tap Start fishing. The shape fades out and you fish that pond.',
    'Catch a fish and press Keep. A note says "On the wall."',
    'Catch another fish in the same visit. The card warns that keeping it puts the first one back. Keep it.',
    'Open the wall: the board glyph at the top right, next to the leave glyph. One line per species, heaviest first.',
    'Catch one more and press Let go. A ring where it went back in, nothing on the wall.',
    'Share a catch, send the link to yourself, and open it on a second phone.'
  ],
  checks: [
    { id: 'fate', text: 'Every catch asks Keep or Let go, and either one goes straight back to fishing.' },
    { id: 'swap', text: 'A second Keep in the same visit replaces the first on the wall, and says so.' },
    { id: 'wall', text: 'The wall shows one line per species: the heaviest kept, with weight, water, light and lure.' },
    { id: 'pond', text: 'A shared link opens the sender’s pond: same fish, same light, the silhouette where it was hooked.' },
    { id: 'fast', text: 'Cold open on a phone: the pond is drawn in under 2 seconds.' },
    { id: 'play', text: 'Casting, bites, the fight and the A3.1 habits feel the same as before.' },
    { id: 'smooth', text: 'No new stutter or heat.' }
  ]
};

type Answer = 'yes' | 'no';
const STATE_KEY = `thewaters.review.${REVIEW.chapter}`;

function sampleLink(): string {
  // Today's pond, first spawn: the primary fish is really there, and the
  // silhouette sits where it starts.
  const seed = dailySeed();
  const runtime = createRuntime(seed, 0);
  return catchLinkPath({
    seed,
    spawnIndex: 0,
    phase: 0.5,
    species: runtime.fish.instance.species,
    sizeScore: 0.72,
    hook: { ...runtime.fish.position },
    lure: 'natural',
    kept: true
  });
}

export function ReviewGate() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [link, setLink] = useState<string | null>(null);

  useEffect(() => {
    setLink(sampleLink());
    try {
      setAnswers(JSON.parse(window.localStorage.getItem(STATE_KEY) ?? '{}') as Record<string, Answer>);
    } catch {
      setAnswers({});
    }
  }, []);

  const answer = (id: string, value: Answer) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify(next));
    } catch {
      // Private mode: answers last for this page load.
    }
  };

  const answered = REVIEW.checks.filter((c) => answers[c.id]).length;
  const yes = REVIEW.checks.filter((c) => answers[c.id] === 'yes').length;
  const done = answered === REVIEW.checks.length;

  return (
    <main className="ab-gate">
      <p className="eyebrow">The Waters · review · {REVIEW.chapter}</p>
      <h1>{REVIEW.title}</h1>
      <section className="ab-brief" data-testid="ab-brief">
        <h2>
          Reviewing {REVIEW.chapter}: {REVIEW.title}
        </h2>
        <p>{REVIEW.reviewing}</p>
        <p className="ab-try-label">Do this</p>
        <ol>
          {REVIEW.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="ab-round">
        <h2>The sample link</h2>
        <p className="ab-lede">Today&apos;s pond at dusk, with a kept fish&apos;s silhouette where it was hooked.</p>
        <div className="ab-ponds">
          <div className="ab-pond">
            {link ? (
              <a className="ab-open" href={link} target="_blank" rel="noopener" data-testid="review-sample-link">
                Open the sample link
              </a>
            ) : null}
            <a className="ab-open" href="/game" target="_blank" rel="noopener">
              Open the game
            </a>
          </div>
        </div>
      </section>

      <section className="ab-round" data-testid="review-checks">
        <h2>Starred checks</h2>
        {REVIEW.checks.map((check) => (
          <div key={check.id} className="review-check">
            <p>{check.text}</p>
            <div className="review-answers">
              {(['yes', 'no'] as Answer[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={answers[check.id] === value ? 'ab-pick is-picked' : 'ab-pick'}
                  onClick={() => answer(check.id, value)}
                >
                  {value === 'yes' ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {done ? (
        <section className="ab-result" data-testid="ab-result">
          <h2>{yes === REVIEW.checks.length ? `${REVIEW.chapter} passes review` : `${REVIEW.chapter}: ${REVIEW.checks.length - yes} starred check(s) failed`}</h2>
          <ul>
            {REVIEW.checks.map((check) => (
              <li key={check.id}>
                {answers[check.id] === 'yes' ? 'Yes' : 'No'}: {check.text}
              </li>
            ))}
          </ul>
          <p>Every starred item must be a yes. Tell Claude the result and it goes in {REVIEW.rubric}.</p>
        </section>
      ) : null}
    </main>
  );
}
