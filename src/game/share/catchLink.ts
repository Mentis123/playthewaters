import { SPECIES_IDS, SPECIES_STORY_LABELS, type SpeciesId } from '@/game/fish/species';
import { trophyLengthCm } from '@/game/fish/trophy';
import { isLureId, type LureId } from '@/game/gear/gear';
import { nearestLight, type LightName } from '@/game/light/pondLight';
import { TUNING } from '@/game/tuning/tuning';

// A4 the link (23_ALPHA_CANON §6.1, docs/alpha/A4_RUBRIC.md). A catch card is
// a link that regrows the sender's pond: the seed and spawn give the same fish,
// the phase gives the same light, the hook point places the silhouette. The
// server stores nothing; everything is in the code. Pure: no DOM, no three.

export type CatchLink = {
  seed: string;
  spawnIndex: number;
  phase: number; // 0..1
  species: SpeciesId;
  sizeScore: number; // 0..1
  hook: { x: number; z: number }; // metres, pond space
  lure: LureId;
  kept?: boolean;
};

const VERSION = 1;
const SEED_RE = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_SPAWN = 100_000;
// Hook points are inside the pond; anything outside this box is not a hook point.
const HOOK_LIMIT_CM = Math.round(Math.max(TUNING.world.pondWidthM, TUNING.world.pondHeightM) * 100);

type Wire = { v: number; s: string; i: number; p: number; f: string; z: number; x: number; y: number; l: string; k?: number };

function toBase64Url(text: string): string {
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code: string): string | null {
  if (!/^[A-Za-z0-9_-]+$/.test(code)) return null;
  const padded = code.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (code.length % 4)) % 4);
  try {
    return atob(padded);
  } catch {
    return null;
  }
}

export function encodeCatchLink(link: CatchLink): string {
  const wire: Wire = {
    v: VERSION,
    s: link.seed,
    i: Math.round(link.spawnIndex),
    p: Math.round(wrap01(link.phase) * 1000) % 1000,
    f: link.species,
    z: Math.round(clamp01(link.sizeScore) * 1000),
    x: Math.round(link.hook.x * 100),
    y: Math.round(link.hook.z * 100),
    l: link.lure
  };
  if (link.kept !== undefined) wire.k = link.kept ? 1 : 0;
  return toBase64Url(JSON.stringify(wire));
}

// Every field is checked on its own: a code that fails any check is not a
// link, and the caller falls back to the title screen. Never throws.
export function decodeCatchLink(code: string | null | undefined): CatchLink | null {
  if (!code || code.length > TUNING.link.maxCodeChars) return null;
  const text = fromBase64Url(code);
  if (!text) return null;
  let wire: Partial<Wire>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    wire = parsed as Partial<Wire>;
  } catch {
    return null;
  }
  if (wire.v !== VERSION) return null;
  if (typeof wire.s !== 'string' || !SEED_RE.test(wire.s)) return null;
  if (!isInt(wire.i, 0, MAX_SPAWN)) return null;
  if (!isInt(wire.p, 0, 999)) return null;
  if (typeof wire.f !== 'string' || !(SPECIES_IDS as string[]).includes(wire.f)) return null;
  if (!isInt(wire.z, 0, 1000)) return null;
  if (!isInt(wire.x, -HOOK_LIMIT_CM, HOOK_LIMIT_CM) || !isInt(wire.y, -HOOK_LIMIT_CM, HOOK_LIMIT_CM)) return null;
  if (typeof wire.l !== 'string' || !isLureId(wire.l)) return null;
  if (wire.k !== undefined && wire.k !== 0 && wire.k !== 1) return null;
  return {
    seed: wire.s,
    spawnIndex: wire.i as number,
    phase: (wire.p as number) / 1000,
    species: wire.f as SpeciesId,
    sizeScore: (wire.z as number) / 1000,
    hook: { x: (wire.x as number) / 100, z: (wire.y as number) / 100 },
    lure: wire.l,
    kept: wire.k === undefined ? undefined : wire.k === 1
  };
}

export function catchLinkPath(link: CatchLink): string {
  return `/c/${encodeCatchLink(link)}`;
}

const LIGHT_WORDS: Record<LightName, string> = {
  dawn: 'at dawn',
  day: 'in the day',
  dusk: 'at dusk',
  night: 'at night'
};

// What was caught and where; never how (canon §4, the legend contract). The
// lure is deliberately absent here: it is part of the "how".
export function arrivalLine(link: CatchLink): string {
  const length = trophyLengthCm(link.species, link.sizeScore);
  const name = SPECIES_STORY_LABELS[link.species];
  const fate = link.kept === undefined ? '' : link.kept ? ', and kept' : ', and let go';
  return `A ${length} cm ${name} was landed here, ${LIGHT_WORDS[nearestLight(link.phase)]}${fate}.`;
}

export function lightWord(phase: number): string {
  return LIGHT_WORDS[nearestLight(phase)];
}

function isInt(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function clamp01(n: number): number {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
}

function wrap01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return ((n % 1) + 1) % 1;
}
