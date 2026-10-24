import type { LightName } from '@/game/light/pondLight';
import { TUNING } from '@/game/tuning/tuning';
import type { WaterDef } from '@/game/waters/waters';

// A5: the lily pond's legend (docs/alpha/A5_RUBRIC.md §2, never shown to
// players). Pure rules; the scene draws what these say. Every condition lives
// in TUNING.legend so a review can tune it, and nothing here is ever quoted in
// the UI (the legend contract, canon §4).

export type LegendState = {
  present: boolean; // this visit, at this light
  spooked: boolean; // blown for the rest of the visit
  nextSurfaceAt: number; // ms (performance clock)
  surfacingUntil: number;
};

// Present on odd-numbered visits from the third on (3, 5, 7…). By visit
// count, never by clock.
export function legendThisVisit(visitCount: number): boolean {
  const { firstVisit } = TUNING.legend;
  return visitCount >= firstVisit && (visitCount - firstVisit) % 2 === 0;
}

export function legendAtLight(water: WaterDef, light: LightName): boolean {
  return water.legendLights.includes(light);
}

export function createLegendState(present: boolean, now: number, rng: () => number): LegendState {
  return { present, spooked: false, nextSurfaceAt: now + surfaceGap(rng) * 0.5, surfacingUntil: 0 };
}

export function surfaceGap(rng: () => number): number {
  const { surfaceMinMs, surfaceMaxMs } = TUNING.legend;
  return surfaceMinMs + (surfaceMaxMs - surfaceMinMs) * rng();
}

// Does it take this lure, here, now? The only way in: the old sinking lure,
// dead still for long enough, close enough.
export function legendTakes(args: {
  lureId: string;
  stillMs: number;
  distance: number;
  atLight: boolean;
  state: LegendState;
}): boolean {
  const { lureId, stillMs, distance, atLight, state } = args;
  if (!state.present || state.spooked || !atLight) return false;
  return lureId === 'old_sinker' && stillMs >= TUNING.legend.stillMs && distance <= TUNING.legend.takeRadiusM;
}

// A careless cast close to it costs the visit.
export function legendSpookedBy(splashDistance: number, state: LegendState, atLight: boolean): boolean {
  return state.present && !state.spooked && atLight && splashDistance <= TUNING.legend.spookRadiusM;
}
