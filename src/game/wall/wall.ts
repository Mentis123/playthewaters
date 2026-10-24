import { SPECIES_IDS, SPECIES_STORY_LABELS, type SpeciesId } from '@/game/fish/species';
import { trophyLengthCm } from '@/game/fish/trophy';
import { nearestLight, type LightName } from '@/game/light/pondLight';
import { TUNING } from '@/game/tuning/tuning';

// A4 the wall (23_ALPHA_CANON §4.4, §6.2; docs/alpha/A4_RUBRIC.md).
// Keep or release, one keeper per visit. The wall shows the heaviest KEPT fish
// of each species. Legends released will get their own line in a second colour;
// none exist before A5, so `legend` is carried and nothing draws it yet.
// The pure part (everything but load/save) takes and returns plain data.

import { WATERS, type WaterId } from '@/game/waters/waters';
export type { WaterId };

export type Keeper = {
  catchId: string;
  visitId: string;
  at: number;
  species: SpeciesId;
  sizeScore: number;
  lure: string;
  phase: number;
  water: WaterId;
  legend?: boolean;
  released?: boolean;
};

export type WallData = { schemaVersion: 1; keepers: Keeper[] };

export type WallLine = {
  species: SpeciesId;
  name: string;
  lengthCm: number;
  grams: number;
  weight: string;
  water: string;
  light: LightName;
  lure: string;
  at: number;
  catchId: string;
  legend: boolean;
  // A legend let go: its line is drawn in the second colour (canon §4.4).
  released: boolean;
};

export const WATER_NAMES: Record<WaterId, string> = { home: WATERS.home.name, lily: WATERS.lily.name };

export function emptyWall(): WallData {
  return { schemaVersion: 1, keepers: [] };
}

export function weightGrams(species: SpeciesId, sizeScore: number): number {
  const { a, b } = TUNING.wall.weight[species];
  return a * Math.pow(trophyLengthCm(species, sizeScore), b);
}

export function formatWeight(grams: number): string {
  const totalOz = Math.max(0, Math.round(grams / 28.349523125));
  const lb = Math.floor(totalOz / 16);
  const oz = totalOz % 16;
  if (lb === 0) return `${oz} oz`;
  return oz === 0 ? `${lb} lb` : `${lb} lb ${oz} oz`;
}

export type KeepResult = { wall: WallData; replaced: Keeper | null };

// One keeper per visit: keeping again in the same visit swaps the earlier one
// off the wall. A fish already kept is not added twice.
export function keepFish(wall: WallData, keeper: Keeper): KeepResult {
  if (wall.keepers.some((k) => k.catchId === keeper.catchId)) return { wall, replaced: null };
  const replaced = wall.keepers.find((k) => k.visitId === keeper.visitId && !k.released) ?? null;
  const keepers = wall.keepers.filter((k) => k !== replaced);
  keepers.push(keeper);
  return { wall: { schemaVersion: 1, keepers }, replaced };
}

// Letting a fish go undoes a keep of that same fish (the card lets you change
// your mind); otherwise it writes nothing, except a released legend (A5+).
export function releaseFish(wall: WallData, keeper: Keeper): WallData {
  const keepers = wall.keepers.filter((k) => k.catchId !== keeper.catchId);
  if (keeper.legend) keepers.push({ ...keeper, released: true });
  return { schemaVersion: 1, keepers };
}

export function keeperOfVisit(wall: WallData, visitId: string): Keeper | null {
  return wall.keepers.find((k) => k.visitId === visitId && !k.released) ?? null;
}

// The heaviest kept fish of each species, heaviest first.
export function wallLines(wall: WallData): WallLine[] {
  // One line per species: the heaviest kept. A5: a catch on the old sinking
  // lure never displaces one made without it (canon §5: "no line of their
  // own"), and is marked by its lure. A legend let go keeps its own line, in
  // the second colour; a legend kept outranks it.
  type Best = { keeper: Keeper; grams: number; rank: number };
  const rankOf = (k: Keeper) => (k.released ? 0 : k.lure === 'old_sinker' && !k.legend ? 1 : 2);
  const best = new Map<SpeciesId, Best>();
  for (const keeper of wall.keepers) {
    if (!(SPECIES_IDS as string[]).includes(keeper.species)) continue;
    if (keeper.released && !keeper.legend) continue;
    const grams = weightGrams(keeper.species, keeper.sizeScore);
    const rank = rankOf(keeper);
    const current = best.get(keeper.species);
    if (!current || rank > current.rank || (rank === current.rank && grams > current.grams)) {
      best.set(keeper.species, { keeper, grams, rank });
    }
  }
  return [...best.values()]
    .sort((x, y) => y.grams - x.grams)
    .map(({ keeper, grams }) => ({
      species: keeper.species,
      name: SPECIES_STORY_LABELS[keeper.species],
      lengthCm: trophyLengthCm(keeper.species, keeper.sizeScore),
      grams,
      weight: formatWeight(grams),
      water: WATER_NAMES[keeper.water] ?? keeper.water,
      light: nearestLight(keeper.phase),
      lure: keeper.lure,
      at: keeper.at,
      catchId: keeper.catchId,
      legend: !!keeper.legend,
      released: !!keeper.released
    }));
}

export function migrateWall(parsed: unknown): WallData {
  const value = parsed as Partial<WallData> | null;
  if (value && value.schemaVersion === 1 && Array.isArray(value.keepers)) {
    return {
      schemaVersion: 1,
      keepers: value.keepers.filter(
        (k): k is Keeper =>
          !!k && typeof k.catchId === 'string' && typeof k.visitId === 'string' && (SPECIES_IDS as string[]).includes(k.species)
      )
    };
  }
  return emptyWall();
}

// --- storage (client only, failure-tolerant like the other stores) ---

const STORAGE_KEY = 'thewaters.wall.v1';

export function loadWall(): WallData {
  if (typeof window === 'undefined') return emptyWall();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? migrateWall(JSON.parse(raw)) : emptyWall();
  } catch {
    return emptyWall();
  }
}

export function saveWall(wall: WallData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wall));
  } catch {
    console.warn('[wall] localStorage unavailable; keeper not saved.');
  }
}

// --- the visit (one keeper per visit) ---
// A visit survives a reload or a new tab: it ends when you leave the pond with
// the leave glyph, or after `TUNING.wall.visitIdleMs` away. Owner, 24 Oct 2026:
// a second Keep "doesn't ask about letting the other go", partly because a new
// page load used to start a new visit.

export type VisitRecord = { id: string; lastActive: number };

export function resolveVisit(stored: VisitRecord | null, now: number, newId: string): VisitRecord {
  if (stored && typeof stored.id === 'string' && Number.isFinite(stored.lastActive)
    && now - stored.lastActive >= 0 && now - stored.lastActive < TUNING.wall.visitIdleMs) {
    return { id: stored.id, lastActive: now };
  }
  return { id: newId, lastActive: now };
}

const VISIT_KEY = 'thewaters.visit.v1';

export function touchVisit(newId: string): string {
  let stored: VisitRecord | null = null;
  try {
    stored = JSON.parse(window.localStorage.getItem(VISIT_KEY) ?? 'null') as VisitRecord | null;
  } catch {
    stored = null;
  }
  const visit = resolveVisit(stored, Date.now(), newId);
  try {
    window.localStorage.setItem(VISIT_KEY, JSON.stringify(visit));
  } catch {
    // Private mode: the visit lasts this page load.
  }
  return visit.id;
}

export function endVisit(): void {
  try {
    window.localStorage.removeItem(VISIT_KEY);
  } catch {
    // ignore
  }
}
