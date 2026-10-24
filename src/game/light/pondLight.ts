import { TUNING } from '@/game/tuning/tuning';

// The drifting light (23_ALPHA_CANON §3), as pure data and arithmetic: no
// React, no three.js. The scene samples it every frame into a reused object.

export type LightName = 'dawn' | 'day' | 'dusk' | 'night';
export const LIGHT_NAMES: readonly LightName[] = ['dawn', 'day', 'dusk', 'night'];

export type Rgb = [number, number, number];

const COLOR_FIELDS = [
  'skyZenith', 'skyHorizon', 'fog', 'waterShallow', 'waterDeep', 'waterFar',
  'treeline', 'bank', 'ambient', 'key'
] as const;
const NUMBER_FIELDS = [
  'ambientIntensity', 'keyIntensity', 'exposure', 'glint', 'sheen', 'caustic', 'reflect',
  'celestialElevation', 'celestialAzimuth', 'sunVisibility', 'moonVisibility', 'stars'
] as const;

type ColorField = (typeof COLOR_FIELDS)[number];
type NumberField = (typeof NUMBER_FIELDS)[number];

// Colours are sRGB 0..1; the renderer converts them to linear.
export type LightSample = { [K in ColorField]: Rgb } & { [K in NumberField]: number } & {
  phase: number;
  name: LightName;
};

export function hexToRgb(hex: string): Rgb {
  const value = parseInt(hex.replace('#', ''), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

type ParsedKey = { [K in ColorField]: Rgb } & { [K in NumberField]: number };

const PARSED: ParsedKey[] = LIGHT_NAMES.map((name) => {
  const raw = TUNING.light.keys[name];
  const out = {} as ParsedKey;
  for (const field of COLOR_FIELDS) out[field] = hexToRgb(raw[field]);
  for (const field of NUMBER_FIELDS) out[field] = raw[field];
  return out;
});

export function wrapPhase(phase: number): number {
  const wrapped = phase % 1;
  return wrapped < 0 ? wrapped + 1 : wrapped;
}

export function phaseOf(name: LightName): number {
  return LIGHT_NAMES.indexOf(name) / LIGHT_NAMES.length;
}

export function nearestLight(phase: number): LightName {
  const index = Math.round(wrapPhase(phase) * LIGHT_NAMES.length) % LIGHT_NAMES.length;
  return LIGHT_NAMES[index];
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Blend weight toward the next key: held at 0 for the first `plateau` of a
// quarter, at 1 for the last `plateau`, smooth between. Continuous across the
// quarter boundary because the next quarter starts holding the key we just
// reached.
export function blendWeight(fraction: number, plateau = TUNING.light.plateau): number {
  return smoothstep(plateau, 1 - plateau, fraction);
}

export function createLightSample(): LightSample {
  const sample = { phase: 0, name: 'dawn' } as LightSample;
  for (const field of COLOR_FIELDS) sample[field] = [0, 0, 0];
  for (const field of NUMBER_FIELDS) sample[field] = 0;
  return sampleLightInto(0, sample);
}

// Allocation-free: writes into `out` and returns it.
export function sampleLightInto(phase: number, out: LightSample): LightSample {
  const p = wrapPhase(phase);
  const scaled = p * LIGHT_NAMES.length;
  const index = Math.floor(scaled) % LIGHT_NAMES.length;
  const next = (index + 1) % LIGHT_NAMES.length;
  const w = blendWeight(scaled - Math.floor(scaled));
  const a = PARSED[index];
  const b = PARSED[next];

  for (const field of COLOR_FIELDS) {
    const target = out[field];
    target[0] = a[field][0] + (b[field][0] - a[field][0]) * w;
    target[1] = a[field][1] + (b[field][1] - a[field][1]) * w;
    target[2] = a[field][2] + (b[field][2] - a[field][2]) * w;
  }
  for (const field of NUMBER_FIELDS) {
    out[field] = a[field] + (b[field] - a[field]) * w;
  }
  out.phase = p;
  out.name = nearestLight(p);
  return out;
}

export function advancePhase(phase: number, dtSeconds: number, rate = TUNING.light.cyclePerSecond): number {
  return wrapPhase(phase + Math.max(0, dtSeconds) * rate);
}

// Where a visit begins. A first visit opens before the dusk turn; a return
// visit jumps forward far enough to land on a different light.
export function startPhaseForVisit(stored: number | null, rng: () => number): number {
  if (stored === null || !Number.isFinite(stored)) {
    return TUNING.light.firstVisitPhase;
  }
  const { returnJumpMin, returnJumpMax } = TUNING.light;
  return wrapPhase(stored + returnJumpMin + rng() * (returnJumpMax - returnJumpMin));
}

export function isLightName(value: string | null | undefined): value is LightName {
  return value === 'dawn' || value === 'day' || value === 'dusk' || value === 'night';
}

// Celestial direction in world space: azimuth 0 is straight ahead over the far
// water (-z), positive azimuth to the right. Writes into `out` [x, y, z].
export function celestialDirection(elevationDeg: number, azimuthDeg: number, out: Rgb): Rgb {
  const el = (elevationDeg * Math.PI) / 180;
  const az = (azimuthDeg * Math.PI) / 180;
  out[0] = Math.sin(az) * Math.cos(el);
  out[1] = Math.sin(el);
  out[2] = -Math.cos(az) * Math.cos(el);
  return out;
}
