// The five-strangers playtest (docs/alpha/A3_RUBRIC.md §3.2). Pure helpers
// for /playtest and /playtest/results. Answers are stored by the personal
// site's API (adamrappaport /api/waters-feedback), which has a database.

export const FEEDBACK_ENDPOINT = 'https://adamrappaport.vercel.app/api/waters-feedback';

export const HABITS = ['homes', 'lights', 'spook', 'still'] as const;
export type HabitId = (typeof HABITS)[number];

export const HABIT_LABELS: Record<HabitId, string> = {
  homes: 'Homes (same places)',
  lights: 'Feeding lights (time of day)',
  spook: 'The spook rule',
  still: 'The still lure'
};

// Keyword HINTS for which habit an open answer mentions. A hint, not a
// verdict: the owner confirms from the quote (the gate is a human judgement).
const PATTERNS: Record<HabitId, RegExp> = {
  homes: /\b(same (place|places|spot|spots|area|areas)|stones?|rocks?|reeds?|the deep|deep water|corner|edges?|hang(s|ing)? (out|around)|stay(s|ed)? (near|in|by|around)|always (in|near|at|by)|home|territor\w*|patrol\w*)/i,
  lights: /\b(night|nighttime|dark(er)?|daytime|in the day|dawn|dusk|sunset|sunrise|evening|morning|time of day|when it got|light changed|as it got)/i,
  spook: /\b(spook\w*|scare\w*|frighten\w*|bolt\w*|dart\w*|ran off|ran away|swam off|swam away|fled|flee\w*|startl\w*|on top of|too close|right on)/i,
  still: /\b(stay(ed|s)? still|keep (it )?still|kept (it )?still|left it alone|leave it alone|don'?t (move|twitch|touch)|stopped moving|wait(ed|ing)?|patien\w*|ring|circle)/i
};

export function habitsMentioned(text: string): HabitId[] {
  return HABITS.filter((habit) => PATTERNS[habit].test(text));
}

export type GateTally = { counts: Record<HabitId, number>; testers: number; passing: HabitId[] };

// The canon's gate: a habit named, untold, by at least three of five people.
export function gateTally(openAnswers: string[], needed = 3): GateTally {
  const counts = { homes: 0, lights: 0, spook: 0, still: 0 } as Record<HabitId, number>;
  for (const answer of openAnswers) {
    for (const habit of habitsMentioned(answer)) counts[habit] += 1;
  }
  return { counts, testers: openAnswers.length, passing: HABITS.filter((h) => counts[h] >= needed) };
}

// A coarse device label, never the full user agent.
export function deviceLabel(ua: string, width: number, height: number): string {
  const kind = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'other';
  return `${kind} ${width}x${height}`;
}
