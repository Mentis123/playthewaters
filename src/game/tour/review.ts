// The review for the chapter in review mode (AGENTS.md /ab rule). One source
// for the /ab page and the in-game tour (docs/alpha/TOUR.md): the same checks,
// answered in either place, stored under the same key on this device.
//
// NEVER put a legend's conditions in any text here: this file is served.

export type Answer = 'yes' | 'no';

export type ReviewCheck = { id: string; text: string };

export const REVIEW: { chapter: string; title: string; rubric: string; reviewing: string; steps: string[]; checks: ReviewCheck[] } = {
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

export const REVIEW_STATE_KEY = `thewaters.review.${REVIEW.chapter}`;

export function loadAnswers(): Record<string, Answer> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(REVIEW_STATE_KEY) ?? '{}') as Record<string, Answer>;
  } catch {
    return {};
  }
}

export function saveAnswer(id: string, value: Answer): Record<string, Answer> {
  const next = { ...loadAnswers(), [id]: value };
  try {
    window.localStorage.setItem(REVIEW_STATE_KEY, JSON.stringify(next));
  } catch {
    // Private mode: answers last for this page load.
  }
  return next;
}
