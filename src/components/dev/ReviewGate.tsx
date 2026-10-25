'use client';

import { useEffect, useState } from 'react';

import { REVIEW, REVIEW_STATE_KEY as STATE_KEY, type Answer } from '@/game/tour/review';


// /ab in review mode (AGENTS.md /ab rule). A chapter that adds features rather
// than a look cannot be judged by a blind pair, so /ab becomes a guided review:
// what changed, what to do, and the starred rubric items as yes/no. A4 is the
// first such chapter (docs/alpha/A4_RUBRIC.md). Picks stay on this device.

// The tour (docs/alpha/TOUR.md); the legend is here at the lily pond so its stop can be judged.
const TOUR_LINK = `/game?water=home&tour=${encodeURIComponent(REVIEW.chapter)}&legend=1`;

function sampleLink(): string {
  return '/game?water=lily';
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

      <section className="ab-round" data-testid="ab-tour">
        <h2>Take the tour</h2>
        <p className="ab-lede">
          The game opens with a card at the top that walks you through every check: it sets each scene up, points at the
          thing, and asks the check right there. Next moves on; tap the card&apos;s top line to fold it away. Your answers
          land on this page. It starts at the home pond and resumes where you left off.
        </p>
        <div className="ab-ponds">
          <div className="ab-pond">
            <a className="ab-open" href={TOUR_LINK} target="_blank" rel="noopener" data-testid="ab-tour-link">
              Start the tour
            </a>
            <button
              type="button"
              className="ab-pick"
              data-testid="ab-tour-restart"
              onClick={() => {
                try {
                  window.localStorage.removeItem(`thewaters.tour.${REVIEW.chapter}`);
                } catch {
                  // Nothing saved.
                }
                window.open(TOUR_LINK, '_blank', 'noopener');
              }}
            >
              From the top
            </button>
          </div>
        </div>
      </section>

      <section className="ab-round">
        <h2>Or open it yourself</h2>
        <p className="ab-lede">
          Start at the home pond (step 1). The game remembers which water you were at; this link always starts at home.
          Finds are remembered too: to look for the glint again, use a private tab.
        </p>
        <div className="ab-ponds">
          <div className="ab-pond">
            <a className="ab-open" href="/game?water=home" target="_blank" rel="noopener">
              The home pond
            </a>
            {link ? (
              <a className="ab-open" href={link} target="_blank" rel="noopener" data-testid="review-sample-link">
                The lily pond
              </a>
            ) : null}
          </div>
        </div>
        <p className="ab-lede">
          Legend shortcut (owner only; never linked from the game): the lily pond at dawn with the legend here and the old lure
          already found. It first surfaces about 15 seconds in.
        </p>
        <div className="ab-ponds">
          <div className="ab-pond">
            <a className="ab-open" href="/game?water=lily&legend=1&sinker=1&light=dawn" target="_blank" rel="noopener" data-testid="review-legend-link">
              Legend at dawn
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
