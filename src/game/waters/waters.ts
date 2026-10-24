import type { SpeciesId } from '@/game/fish/species';
import type { LightName } from '@/game/light/pondLight';

// A5 (23_ALPHA_CANON §2): a water is DATA on one engine. Casting, the fight
// and the reveal never branch on which water this is; only what is read from
// here does. Pure: no DOM, no three.

export type WaterId = 'home' | 'lily';
export const WATER_IDS: readonly WaterId[] = ['home', 'lily'];

export function isWaterId(value: unknown): value is WaterId {
  return value === 'home' || value === 'lily';
}

export type PadIsland = {
  // Centre (pond metres), radius of the island, pads in it, drift (metres of
  // slow sway) and phase.
  x: number;
  z: number;
  radius: number;
  pads: number;
  drift: number;
  phase: number;
};

export type WaterDef = {
  id: WaterId;
  name: string; // shown on the water card and the wall
  // Which species live here, with their spawn weights (replaces the global
  // spawnWeight for this water). An empty list falls back to the global table.
  species: Partial<Record<SpeciesId, number>>;
  // Homes (A3 habits) for this water, by id; species prefer them in order.
  homes: Record<string, { x: number; z: number; radius: number }>;
  speciesHomes: Partial<Record<SpeciesId, string[]>>;
  // Water body: colours (sRGB hex) and how far you can see into it, as a
  // multiplier on the home pond's clarity (1 = as home).
  water: { deep: string; far: string; shallow: string; clarity: number };
  pads: PadIsland[];
  // Reed islands: drawn as clumps of reeds standing in the water.
  reedIslands: Array<{ x: number; z: number; radius: number }>;
  // The light this water's legend shows at (canon §3: every legend only at
  // some lights).
  legendLights: LightName[];
};

export const WATERS: Record<WaterId, WaterDef> = {
  home: {
    id: 'home',
    name: 'the home pond',
    species: {},
    homes: {},
    speciesHomes: {},
    water: { deep: '', far: '', shallow: '', clarity: 1 },
    pads: [],
    reedIslands: [],
    legendLights: []
  },
  lily: {
    id: 'lily',
    name: 'the lily pond',
    // Photo 04: bass and pike in the cover, minnows in the open, a carp or two.
    species: { moss_bass: 34, reed_pike: 26, moon_minnow: 24, bronze_carp: 16 },
    homes: {
      pads_left: { x: -2.4, z: -2.2, radius: 1.3 },
      pads_right: { x: 2.3, z: -3.4, radius: 1.4 },
      pads_near: { x: 1.6, z: 0.4, radius: 0.9 },
      reeds_island: { x: -0.6, z: -4.6, radius: 1.2 },
      open: { x: 0, z: -1.2, radius: 3.0 }
    },
    speciesHomes: {
      moss_bass: ['pads_left', 'pads_right', 'pads_near'],
      reed_pike: ['reeds_island', 'pads_right'],
      moon_minnow: ['open', 'pads_near'],
      bronze_carp: ['pads_right', 'open'],
      old_kingfish: ['open']
    },
    water: { deep: '#3a3422', far: '#24221a', shallow: '#4d4a33', clarity: 0.55 },
    pads: [
      { x: -2.4, z: -2.2, radius: 1.05, pads: 22, drift: 0.12, phase: 0.0 },
      { x: 2.3, z: -3.4, radius: 1.25, pads: 26, drift: 0.1, phase: 1.7 },
      { x: 1.6, z: 0.4, radius: 0.7, pads: 11, drift: 0.14, phase: 3.1 },
      { x: -1.2, z: -5.0, radius: 0.55, pads: 8, drift: 0.08, phase: 4.4 },
      { x: 3.4, z: -0.9, radius: 0.45, pads: 6, drift: 0.1, phase: 5.2 }
    ],
    reedIslands: [
      { x: -0.6, z: -4.6, radius: 0.9 },
      { x: -3.6, z: 0.2, radius: 0.6 }
    ],
    legendLights: ['dawn', 'dusk']
  }
};

// Pad island centre at time t (seconds): a slow figure-of-eight sway.
export function padIslandCentre(island: PadIsland, tSeconds: number, out: { x: number; z: number }) {
  const w = tSeconds * 0.07 + island.phase;
  out.x = island.x + Math.sin(w) * island.drift;
  out.z = island.z + Math.sin(w * 2) * island.drift * 0.5;
  return out;
}

const _centre = { x: 0, z: 0 };

// Is a point covered by a pad island at time t? `pad` widens or narrows the
// test (fish under the edge of a pad are hidden a little before its rim).
export function padCoverAt(water: WaterDef, x: number, z: number, tSeconds: number, grow = 0): number {
  for (let i = 0; i < water.pads.length; i += 1) {
    const island = water.pads[i];
    padIslandCentre(island, tSeconds, _centre);
    const dx = x - _centre.x;
    const dz = z - _centre.z;
    const r = island.radius + grow;
    if (dx * dx + dz * dz < r * r) return i;
  }
  return -1;
}

// --- visits (the legend contract: rare by visit count, never by clock) ---

export type VisitCounts = Partial<Record<WaterId, number>>;

export function nextVisitCount(counts: VisitCounts, water: WaterId): VisitCounts {
  return { ...counts, [water]: (counts[water] ?? 0) + 1 };
}
