import { REVIEW } from '@/game/tour/review';

// The review tour (docs/alpha/TOUR.md): /ab's checks walked through inside the
// game. Each stop sets the scene (through the game's own review hooks), points
// at the thing, says in one line what to judge, and asks its check. Pure data:
// a new chapter's tour is a new list, written with its rubric, before the build.
//
// NEVER put a legend's conditions in a stop's line: this file is served.

// What a stop points at: a DOM element (CSS selector), or a shore thing whose
// screen position the scene writes every frame.
export type TourPoint = { selector: string } | { shore: 'path' | 'bench' | 'sinker' | 'glint' };

// What the game reports to the tour (GameClient's review probe).
export type TourProbe = {
  started: boolean;
  water: string;
  state: string;
  walking: boolean;
  bagOpen: boolean;
  // The kept fish's catch ids, joined: changes on a keep or a swap.
  kept: string;
  foundSinker: boolean;
  seenBench: boolean;
  snagged: boolean;
  lureId: string;
  rodId: string;
};

// Counted from the game's own telemetry stream since the stop began.
export type TourCounts = { casts: number; shares: number; castsByLure: Record<string, number> };

// The game's review hooks a stop may call to set its scene.
export type TourSetup =
  | { kind: 'gear'; rodId?: string; lureId?: string }
  | { kind: 'catch' }
  | { kind: 'bag'; open: boolean; scrollTo?: string }
  | { kind: 'surface-legend' };

export type TourDone =
  | { kind: 'started' }
  | { kind: 'cast'; lureId?: string }
  | { kind: 'kept' }
  | { kind: 'bag-open' }
  | { kind: 'share' }
  | { kind: 'found-sinker' }
  | { kind: 'seen-bench' }
  | { kind: 'water'; water: string }
  | { kind: 'snagged' };

export type TourStop = {
  id: string;
  title: string;
  line: string;
  // Shown while the stop is done (or for look-only stops, straight away).
  after?: string;
  point?: TourPoint;
  // A point held back until the reviewer asks ("Show me"): for checks that
  // are about finding the thing unaided.
  reveal?: TourPoint;
  setup?: TourSetup[];
  // Do stops wait for the reviewer to do the thing; look stops have no done.
  done?: TourDone;
  // Move on by itself once done (the title tap only).
  autoNext?: boolean;
  check?: string;
};

export type Tour = { id: string; chapter: string; title: string; stops: TourStop[] };

const lure = (label: string) => ({ selector: `[data-testid="gear-select"] [aria-label="${label}"]` });

export const TOUR_A5_1: Tour = {
  id: 'A5.1',
  chapter: REVIEW.chapter,
  title: REVIEW.title,
  stops: [
    {
      id: 'title',
      title: 'The start',
      line: 'The credit sits on the title now. Tap anywhere to fish: nothing else should come first.',
      point: { selector: '[data-testid="credit-line"]' },
      done: { kind: 'started' },
      autoNext: true
    },
    {
      id: 'arrive',
      title: 'Arriving',
      line: 'The water’s name fades in over the pond. That was the whole way in.',
      check: 'start'
    },
    {
      id: 'clean',
      title: 'One button',
      line: 'The four small buttons are now one bag, top right. Look at the pond with it.',
      point: { selector: '[data-testid="open-bag"]' },
      check: 'clean'
    },
    {
      id: 'lure-natural',
      title: 'Natural lure',
      line: 'Natural is tied on. Cast once and listen to it land.',
      point: lure('Natural'),
      setup: [{ kind: 'gear', rodId: 'long', lureId: 'natural' }],
      done: { kind: 'cast', lureId: 'natural' },
      after: 'An ordinary splash. Next: the popper.'
    },
    {
      id: 'lure-popper',
      title: 'Popper',
      line: 'The popper is tied on. Cast once: it should land loud.',
      point: lure('Popper'),
      setup: [{ kind: 'gear', lureId: 'popper' }],
      done: { kind: 'cast', lureId: 'popper' }
    },
    {
      id: 'lure-quiet',
      title: 'Quiet lure',
      line: 'The quiet lure is tied on. Cast once: it should barely make a sound. While you drag, the lure shows at the aim point.',
      point: lure('Quiet'),
      setup: [{ kind: 'gear', lureId: 'quiet' }],
      done: { kind: 'cast', lureId: 'quiet' },
      check: 'lures'
    },
    {
      id: 'rod',
      title: 'Short rod',
      line: 'The short rod is on. Cast as far as you can: it reaches the edge of the dark and stops there.',
      point: { selector: '[data-testid="gear-select"] [aria-label="Short rod"]' },
      setup: [{ kind: 'gear', rodId: 'short', lureId: 'natural' }],
      done: { kind: 'cast' },
      check: 'rod'
    },
    {
      id: 'keep',
      title: 'Keep one',
      line: 'A fish, landed for you. Tap Keep.',
      point: { selector: '[data-testid="result-keep"], [data-testid="result-confirm-swap"]' },
      setup: [{ kind: 'gear', rodId: 'long', lureId: 'natural' }, { kind: 'catch' }],
      done: { kind: 'kept' }
    },
    {
      id: 'bag',
      title: 'The bag',
      line: 'Open the bag. The wall, trophies, logbook and finds are in it.',
      point: { selector: '[data-testid="open-bag"]' },
      done: { kind: 'bag-open' },
      check: 'bag'
    },
    {
      id: 'shares',
      title: 'Shares',
      line: 'Share a trophy, your wall, or "Fish my pond". Each should end with #PlayTheWaters and open the game for whoever taps it.',
      point: { selector: '[data-testid="bag-share-wall"]' },
      setup: [{ kind: 'bag', open: true }],
      done: { kind: 'share' },
      check: 'shares'
    },
    {
      id: 'about',
      title: 'About',
      line: 'Your name and links, at the bottom of the bag. Check where each one goes.',
      point: { selector: '[data-testid="bag-about"]' },
      setup: [{ kind: 'bag', open: true, scrollTo: '[data-testid="bag-about"]' }],
      check: 'credit'
    },
    {
      id: 'a5-path',
      title: 'A5 · The way on',
      line: 'There is a way to another water from here. Is it visible without a label?',
      reveal: { shore: 'path' },
      setup: [{ kind: 'bag', open: false }],
      check: 'a5-path'
    },
    {
      id: 'a5-find',
      title: 'A5 · Something old',
      line: 'Something old lies under this bank and catches the light now and then. When you spot it, cast onto it.',
      reveal: { shore: 'glint' },
      done: { kind: 'found-sinker' },
      check: 'a5-find'
    },
    {
      id: 'a5-walk',
      title: 'A5 · The walk',
      line: 'Tap the path to walk to the lily pond.',
      point: { shore: 'path' },
      done: { kind: 'water', water: 'lily' },
      check: 'a5-walk'
    },
    {
      id: 'a5-looks',
      title: 'A5 · The lily pond',
      line: 'Compare it with photo 04: brown still water, pad islands, reeds, a forested far shore.',
      check: 'a5-looks'
    },
    {
      id: 'a5-pads',
      title: 'A5 · Pads',
      line: 'Cast onto a lily pad. The lure should snag; one tap frees it.',
      done: { kind: 'snagged' },
      check: 'a5-pads'
    },
    {
      id: 'a5-bench',
      title: 'A5 · The bench',
      line: 'There is a bench on this shore with something carved on it. Find it and read it.',
      reveal: { shore: 'bench' },
      done: { kind: 'seen-bench' },
      check: 'a5-bench'
    },
    {
      id: 'a5-legend',
      title: 'A5 · The old fish',
      line: 'Something very big lives here and shows itself now and then. Watch for it, and try to catch it however you would expect to.',
      setup: [{ kind: 'surface-legend' }],
      check: 'a5-legend'
    },
    {
      id: 'end',
      title: 'That’s the tour',
      line: 'Your answers are saved on /ab, with anything you skipped.'
    }
  ]
};

export const TOURS: Record<string, Tour> = { [TOUR_A5_1.id]: TOUR_A5_1 };

export function tourFor(id: string | null): Tour | null {
  return id && Object.prototype.hasOwnProperty.call(TOURS, id) ? TOURS[id] : null;
}

// A stop is done when its condition holds against the probe and the counts
// gathered since the stop began. Look stops are never "done": the reviewer
// answers and moves on.
export function stopDone(stop: TourStop, probe: TourProbe, counts: TourCounts, keptAtStart: string): boolean {
  const done = stop.done;
  if (!done) return false;
  switch (done.kind) {
    case 'started':
      return probe.started;
    case 'cast':
      return done.lureId ? (counts.castsByLure[done.lureId] ?? 0) > 0 : counts.casts > 0;
    case 'kept':
      return probe.kept !== keptAtStart;
    case 'bag-open':
      return probe.bagOpen;
    case 'share':
      return counts.shares > 0;
    case 'found-sinker':
      return probe.foundSinker;
    case 'seen-bench':
      return probe.seenBench;
    case 'water':
      return probe.water === done.water && !probe.walking;
    case 'snagged':
      return probe.snagged;
  }
}

// Every check the review asks is asked by some stop (a tour that skips one
// would let a chapter pass /ab with an unreviewed item).
export function uncheckedChecks(tour: Tour, checkIds: string[]): string[] {
  const asked = new Set(tour.stops.map((s) => s.check).filter(Boolean));
  return checkIds.filter((id) => !asked.has(id));
}
