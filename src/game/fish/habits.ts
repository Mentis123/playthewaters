import { clamp, distance, type Vec2 } from '@/game/math/vec';
import { LIGHT_NAMES, wrapPhase, type LightName } from '@/game/light/pondLight';
import { TUNING } from '@/game/tuning/tuning';
import type { SpeciesId } from '@/game/fish/species';
import { WATERS, type WaterId } from '@/game/waters/waters';

// A3 — habits (23_ALPHA_CANON §4). The home pond made learnable: where each
// fish lives, when it feeds, what a careless cast does to it, and which fish
// want a still lure. Pure data and arithmetic: no React, no three.js.

// A home id: the home pond's (TUNING.habits.homes) or another water's
// (WATERS[id].homes, A5). Fish carry the id; the water resolves it.
export type HomeId = string;
export type Home = { id: HomeId; x: number; z: number; radius: number };

const H = TUNING.habits;
const HOME_HOMES = H.homes as Record<string, { x: number; z: number; radius: number }>;

export function homesOf(water: WaterId = 'home'): Record<string, { x: number; z: number; radius: number }> {
  return water === 'home' ? HOME_HOMES : WATERS[water].homes;
}

export function homeOf(id: HomeId, water: WaterId = 'home'): Home {
  const home = homesOf(water)[id] ?? HOME_HOMES[id] ?? HOME_HOMES.open;
  return { id, x: home.x, z: home.z, radius: home.radius };
}

// A species' home, chosen from its preference list (repeats weight it).
export function homeFor(species: SpeciesId, rng: () => number, water: WaterId = 'home'): HomeId {
  const options = (water === 'home' ? H.speciesHomes[species] : WATERS[water].speciesHomes[species] ?? ['open']) as readonly HomeId[];
  return options[Math.min(options.length - 1, Math.floor(rng() * options.length))];
}

function circularDistance(a: number, b: number): number {
  const d = Math.abs(wrapPhase(a) - wrapPhase(b));
  return Math.min(d, 1 - d);
}

// 0..1: how much this species is feeding at this point of the light cycle.
export function feedingAmount(species: SpeciesId, phase: number): number {
  const lights = H.feedingLights[species] as readonly LightName[];
  let best = 0;
  for (const light of lights) {
    const keyPhase = LIGHT_NAMES.indexOf(light) / LIGHT_NAMES.length;
    const d = circularDistance(phase, keyPhase);
    const t = clamp(1 - d / H.feedingHalfWidth, 0, 1);
    best = Math.max(best, t * t * (3 - 2 * t));
  }
  return best;
}

function clampToFishable(point: Vec2): Vec2 {
  const margin = TUNING.world.pondMarginRatio * TUNING.world.pondWidthM;
  const halfX = TUNING.world.pondWidthM * 0.5 - margin;
  return {
    x: clamp(point.x, -halfX, halfX),
    z: clamp(point.z, TUNING.world.fishableMinZ, TUNING.world.fishableMaxZ)
  };
}

// Where a fish wanders next: inside its home off-feed; wider and nearer the
// bank while feeding.
export function habitWanderTarget(home: Home, feeding: number, rng: () => number): Vec2 {
  const radius = home.radius * (1 + feeding * (H.feedingRoamMul - 1));
  const angle = rng() * Math.PI * 2;
  const reach = Math.sqrt(rng()) * radius;
  return clampToFishable({
    x: home.x + Math.cos(angle) * reach,
    z: home.z + Math.sin(angle) * reach + feeding * H.feedingShoreward
  });
}

export function habitSpeedMultiplier(feeding: number): number {
  return H.speedOffFeed + (H.speedFeeding - H.speedOffFeed) * feeding;
}

export function habitNoticeMultiplier(feeding: number): number {
  return H.noticeOffFeed + (H.noticeFeeding - H.noticeOffFeed) * feeding;
}

export function habitCueIntervalMultiplier(feeding: number): number {
  return H.cueIntervalOffFeed + (H.cueIntervalFeeding - H.cueIntervalOffFeed) * feeding;
}

// Which fish a splash sends bolting: any fish it landed on, then any fish
// close to one of those (they scatter with it, for a shorter hold). Pure:
// positions and per-fish spook radii in, [index, holdMul] out.
export function splashScatter(positions: Vec2[], splash: Vec2, spookRadii: number[], spookable: boolean[]): Array<{ index: number; holdMul: number }> {
  const hit: Array<{ index: number; holdMul: number }> = [];
  positions.forEach((pos, index) => {
    if (spookable[index] && distance(pos, splash) < spookRadii[index]) hit.push({ index, holdMul: 1 });
  });
  if (hit.length === 0) return hit;
  const direct = hit.map((h) => positions[h.index]);
  positions.forEach((pos, index) => {
    if (!spookable[index] || hit.some((h) => h.index === index)) return;
    if (direct.some((d) => distance(d, pos) < H.scatterRadiusM)) hit.push({ index, holdMul: H.scatterHoldMul });
  });
  return hit;
}

// The spook rule: did this splash land on top of the fish?
export function splashSpookRadius(fearRadiusMultiplier: number, lureFearMult: number, feeding: number): number {
  return H.splashSpookRadiusM * fearRadiusMultiplier * lureFearMult * (1 - feeding * H.splashSpookFeedingRelief);
}

export function splashSpooks(fishPos: Vec2, splashPos: Vec2, fearRadiusMultiplier: number, lureFearMult: number, feeding: number): boolean {
  return distance(fishPos, splashPos) < splashSpookRadius(fearRadiusMultiplier, lureFearMult, feeding);
}

// A spooked fish heads for the far dark, off to one side of where it was.
export function spookTarget(fishPos: Vec2, rng: () => number): Vec2 {
  return clampToFishable({
    x: fishPos.x + (rng() * 2 - 1) * H.spookSideReachM,
    z: TUNING.world.fishableMinZ + rng() * H.spookFarBandM
  });
}

export function spookHoldMs(personality: number, rng: () => number): number {
  // Shyer fish (lower personality) stay away longer.
  const shy = clamp(0.5 - personality * 0.5, 0, 1);
  return H.spookHoldMinMs + (H.spookHoldMaxMs - H.spookHoldMinMs) * clamp(shy * 0.7 + rng() * 0.3, 0, 1);
}

// The still lure: how long the lure must be dead still before this fish will
// commit. Feeding makes it less fussy.
export function stillNeededMs(species: SpeciesId, feeding: number): number {
  return H.stillLureMs[species] * (1 - feeding * H.stillFeedingDiscount);
}

// 0..1: how closed the stillness ring is.
export function stillRingAmount(stillMs: number): number {
  return clamp(stillMs / H.stillRingFullMs, 0, 1);
}
