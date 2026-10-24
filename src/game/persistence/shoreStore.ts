import { isWaterId, nextVisitCount, type VisitCounts, type WaterId } from '@/game/waters/waters';

// A5: where along the shore you are, what you have found, and how many times
// you have come to each water (the legend contract counts visits, never the
// clock). SSR-guarded and failure-tolerant like the other stores.
const STORAGE_KEY = 'thewaters.shore.v1';

export type Shore = {
  water: WaterId;
  visits: VisitCounts;
  // Finds (canon §5): set once, never unset.
  foundSinker: boolean;
  // Waters whose card has been shown (the first arrival).
  seenCards: WaterId[];
  // The old sinking lure is tied on (outside the gear strip).
  sinkerTied: boolean;
};

export function emptyShore(): Shore {
  return { water: 'home', visits: {}, foundSinker: false, seenCards: [], sinkerTied: false };
}

export function migrateShore(parsed: unknown): Shore {
  const value = parsed as Partial<Shore> | null;
  if (!value || typeof value !== 'object') return emptyShore();
  const visits: VisitCounts = {};
  if (value.visits && typeof value.visits === 'object') {
    for (const [key, count] of Object.entries(value.visits)) {
      if (isWaterId(key) && Number.isInteger(count) && (count as number) >= 0) visits[key] = count as number;
    }
  }
  return {
    water: isWaterId(value.water) ? value.water : 'home',
    visits,
    foundSinker: value.foundSinker === true,
    seenCards: Array.isArray(value.seenCards) ? value.seenCards.filter(isWaterId) : [],
    sinkerTied: value.foundSinker === true && value.sinkerTied === true
  };
}

export function loadShore(): Shore {
  if (typeof window === 'undefined') return emptyShore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? migrateShore(JSON.parse(raw)) : emptyShore();
  } catch {
    return emptyShore();
  }
}

export function saveShore(shore: Shore): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shore));
  } catch {
    // Storage blocked: the shore is remembered for this page only.
  }
}

// Arriving at a water counts one visit to it.
export function arriveAt(shore: Shore, water: WaterId): Shore {
  return { ...shore, water, visits: nextVisitCount(shore.visits, water) };
}
