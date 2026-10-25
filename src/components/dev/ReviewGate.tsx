'use client';

import { useEffect, useState } from 'react';


// /ab in review mode (AGENTS.md /ab rule). A chapter that adds features rather
// than a look cannot be judged by a blind pair, so /ab becomes a guided review:
// what changed, what to do, and the starred rubric items as yes/no. A4 is the
// first such chapter (docs/alpha/A4_RUBRIC.md). Picks stay on this device.
const REVIEW = {
  chapter: 'A5.1',
  title: 'The tackle bag, the credit, the gear',
  rubric: 'docs/alpha/HOME_PLAN.md',
  reviewing:
    'Four things since A5. (1) The title is the start: one tap and you are at the water; the Vibe Academy screen is gone and the credit is on the title ("Made by Mentis · A Birb Labs artefact"), on every share card and in About. ' +
    '(2) The four small buttons at the top right are now one tackle bag: the wall, trophies to share, a logbook, what you have found, "Fish my pond", the QR, sound and vibration, leave, and About (your site, LinkedIn, X, Vibe Academy). ' +
    '(3) Gear: the Sinker is now Quiet (it no longer sinks; only the lure you find does), the short rod reaches a little further and its line is no longer weaker, each lure lands with its own splash and sound, and the lure you are throwing is drawn at the aim point. ' +
    '(4) The water\u2019s name fades in when you arrive. Every share ends with #PlayTheWaters.',
  steps: [
    'Open the game from the link below. One tap on the title: you are at the water, and its name fades in.',
    'Catch something and keep it. Open the bag (top right).',
    'In the bag: share a trophy, share your wall, and "Fish my pond". Each share should end with #PlayTheWaters and open the game for whoever taps it.',
    'Check About: your name and links go where you want them.',
    'Cast with each lure: the popper lands loud, the quiet lure barely makes a sound, and the lure shows at the aim point while you drag.',
    'Try the short rod: it reaches the edge of the dark and stops there.',
    'A5 still needs your review too: walk to the lily pond (the soft light at the home pond\u2019s left edge), find the brass glint under the home bank, read the bench, and try the legend shortcut below.'
  ],
  checks: [
    { id: 'start', text: 'One tap on the title and I am fishing; nothing feels missing without the old credit screen.' },
    { id: 'credit', text: 'My credit is visible enough on the title, the share cards and in About, and the links go where I want.' },
    { id: 'bag', text: 'The bag feels like mine: the wall, trophies, logbook and finds are where I would look for them.' },
    { id: 'shares', text: 'Every share I tried ended with #PlayTheWaters and opened the game.' },
    { id: 'lures', text: 'I can tell the three lures apart by how they land, without reading anything.' },
    { id: 'rod', text: 'The short rod now feels like a real choice, not a weaker rod.' },
    { id: 'clean', text: 'The pond looks cleaner with one button instead of four.' },
    // A5 is not reviewed yet: its starred checks stay on the page.
    { id: 'a5-path', text: 'A5 · At the home pond, the way to somewhere else is visible but not labelled.' },
    { id: 'a5-walk', text: 'A5 · Tapping the path walks you to the lily pond and back, without feeling like a loading screen.' },
    { id: 'a5-looks', text: 'A5 · The lily pond reads as photo 04: brown still water, pad islands, reeds, a forested far shore.' },
    { id: 'a5-pads', text: 'A5 · Pads hide fish, and a cast onto a pad snags; one tap frees it.' },
    { id: 'a5-find', text: 'A5 · The sinking lure can be found by looking, with no marker or hint.' },
    { id: 'a5-bench', text: 'A5 · The bench\u2019s carved line is readable and feels like a found thing.' },
    { id: 'a5-legend', text: 'A5 · The legend makes itself known now and then, and cannot be caught the wrong way.' }
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
