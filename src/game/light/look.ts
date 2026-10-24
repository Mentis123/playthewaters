import { isLightName, type LightName } from '@/game/light/pondLight';

// Which look the scene renders. `alpha` is the A1 water and drifting light;
// `classic` is the v0.4 scene, kept verbatim as the blind-gate baseline
// (docs/alpha/A1_RUBRIC.md). Pure: callers pass location.search.
export type Look = 'alpha' | 'classic';

export function readLook(search: string): Look {
  return new URLSearchParams(search).get('look') === 'classic' ? 'classic' : 'alpha';
}

// `?light=dawn|day|dusk|night` pins the light and stops the drift: for review,
// captures (frozen light, so an A/B does not measure the time of day) and the
// blind gate.
export function readLightOverride(search: string): LightName | null {
  const value = new URLSearchParams(search).get('light');
  return isLightName(value) ? value : null;
}

// Blind gate (docs/alpha/A1_RUBRIC.md §2). /ab hands out opaque per-session
// tokens (`?pond=<token>`) so the address bar never says which look is which;
// the token resolves through localStorage to the real query. Unknown tokens
// resolve to nothing, so a stale link falls back to the default look.
export const AB_STORAGE_KEY = 'thewaters.ab.v1';

export type AbArm = { look: Look; light: LightName };
export type AbTable = { tokens: Record<string, AbArm> };

export function resolveAbSearch(search: string, readTable: () => string | null): string {
  const params = new URLSearchParams(search);
  const token = params.get('pond');
  if (!token) return search;
  let table: AbTable | null = null;
  try {
    const raw = readTable();
    table = raw ? (JSON.parse(raw) as AbTable) : null;
  } catch {
    table = null;
  }
  const arm = table?.tokens?.[token];
  params.delete('pond');
  if (arm) {
    if (arm.look === 'classic') params.set('look', 'classic');
    params.set('light', arm.light);
  }
  const rest = params.toString();
  return rest ? `?${rest}` : '';
}
