'use client';

import { useEffect, useState } from 'react';


// /ab in review mode (AGENTS.md /ab rule). A chapter that adds features rather
// than a look cannot be judged by a blind pair, so /ab becomes a guided review:
// what changed, what to do, and the starred rubric items as yes/no. A4 is the
// first such chapter (docs/alpha/A4_RUBRIC.md). Picks stay on this device.
const REVIEW = {
  chapter: 'A5',
  title: 'The lily pond and the walk',
  rubric: 'docs/alpha/A5_RUBRIC.md',
  reviewing:
    'The second water and the way to it. At the home pond\u2019s left edge a soft light shows through the trees where the bank goes on: tap it and you walk along the bank to the lily pond (and back, from its right edge). ' +
    'The lily pond is brown and still, with pad islands that drift; fish vanish under the pads, and a cast onto a pad snags (one tap frees it). ' +
    'Two things are hidden: something glints under the home pond\u2019s near bank, and the lily pond has an old bench. And the lily pond has a legend.',
  steps: [
    'Open the game. At the home pond, look at the left edge where the water meets the bank: a soft light through the trees. Tap it.',
    'You walk along the bank. The first time, the lily pond\u2019s painting shows for a moment.',
    'Watch the pads for a minute: fish slip under them and vanish. Cast onto a pad: it snags. Tap anywhere to pull it free (the fish near it scatter).',
    'Tap the bench on the left bank. Read it.',
    'Walk back (the light at the lily pond\u2019s right edge). Under the near bank, something brass glints every few seconds. Cast right onto it.',
    'Once found, it rests on a stone on the bank. Tap it to tie it on; tap it again, or pick a lure in the strip, to take it off.',
    'The legend (review shortcut below, so you need not wait for the third visit at dawn): watch for it to surface, tie on the old lure, cast beside the swirl (not on top of it) and leave it completely still.'
  ],
  checks: [
    { id: 'path', text: 'At the home pond, the way to somewhere else is visible but not labelled.' },
    { id: 'walk', text: 'Tapping the path walks you to the lily pond and back, without feeling like a loading screen.' },
    { id: 'looks', text: 'The lily pond reads as photo 04: brown still water, pad islands, reeds, a forested far shore.' },
    { id: 'pads', text: 'Pads hide fish, and you start reading the edges of the pads.' },
    { id: 'snag', text: 'A cast onto a pad snags; one tap frees it; nothing is lost; nearby fish spook.' },
    { id: 'find', text: 'The sinking lure can be found by looking, with no marker or hint.' },
    { id: 'bench', text: 'The bench\u2019s carved line is readable and feels like a found thing, not UI.' },
    { id: 'tell', text: 'The legend makes itself known now and then, unmistakably and unexplained.' },
    { id: 'legend', text: 'It cannot be caught the wrong way, and a cast on top of it costs you the visit.' },
    { id: 'budget', text: 'No stutter, heat or flicker at either water.' }
  ]
};

type Answer = 'yes' | 'no';
const STATE_KEY = `thewaters.review.${REVIEW.chapter}`;

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

      <section className="ab-round">
        <h2>Open</h2>
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
