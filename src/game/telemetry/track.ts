import type { Catch, Failure } from '@/game/persistence/sessionStore';

export type TrackEvent =
  | { type: 'session_start' }
  | { type: 'session_end' }
  | { type: 'cast'; rodId?: string; lureId?: string }
  | { type: 'bite_window_open' }
  | { type: 'hook_attempt'; result: 'success' | 'early' | 'late' }
  | { type: 'catch'; catch: Catch }
  | { type: 'failure'; failure: Failure }
  | { type: 'focus_used' }
  | { type: 'gl_context_lost' }
  | { type: 'gl_context_restored' }
  | { type: 'pixel_ratio_degraded'; from: number; to: number }
  | { type: 'install_prompt_shown' }
  | { type: 'install_prompt_accepted' }
  | { type: 'share_initiated' }
  // The 500-entry journal cap rotated the oldest catch off — worth knowing if
  // real players ever hit it before raising the cap or paginating the view.
  | { type: 'journal_rotation' };

export const TRACK_EVENT = 'waters:track';

export function track(event: TrackEvent): void {
  console.log('[track]', event);
  // The review tour (docs/alpha/TOUR.md) listens to the same stream.
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: event }));
  }
}
