// Where the pond's light was when the player last left (23_ALPHA_CANON §3).
// SSR-guarded and failure-tolerant like the other stores: losing it only
// means the next visit is treated as a first visit.
const STORAGE_KEY = 'thewaters.light.v1';

export function getStoredPhase(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { phase?: unknown };
    return typeof parsed.phase === 'number' && Number.isFinite(parsed.phase) ? parsed.phase : null;
  } catch {
    return null;
  }
}

export function storePhase(phase: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ phase, savedAt: Date.now() }));
  } catch {
    // Storage full or blocked: the light simply won't be remembered.
  }
}
