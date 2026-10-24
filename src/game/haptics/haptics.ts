// Central haptics gate. Every vibration in the game goes through vibrate() so
// two policies hold everywhere at once:
//  - the player's haptics preference (settings strip / prefsStore), and
//  - prefers-reduced-motion, which collapses multi-pulse patterns to a single
//    short pulse (06_MOBILE_WEB_CONSTRAINTS: "haptics dampened to single
//    pulses under reduced motion").
//
// iOS has no navigator.vibrate. Since iOS 18 a programmatic click on an
// <input type="checkbox" switch> fires the native toggle tick, so that is the
// fallback: one tick per call (patterns collapse to one tick; iOS 26.5 stopped
// multi-tick retriggering anyway). Unverified on device whether a tick fires
// outside a user gesture; the fallback is silent if it does not.
let enabled = true;
let iosSwitch: HTMLInputElement | null = null;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

export function hapticsEnabled(): boolean {
  return enabled;
}

function iosTick(): void {
  if (typeof document === 'undefined') return;
  if (!iosSwitch) {
    iosSwitch = document.createElement('input');
    iosSwitch.type = 'checkbox';
    iosSwitch.setAttribute('switch', '');
    iosSwitch.setAttribute('aria-hidden', 'true');
    iosSwitch.tabIndex = -1;
    iosSwitch.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
    document.body.appendChild(iosSwitch);
  }
  try {
    iosSwitch.click();
  } catch {
    // Not supported: stay silent.
  }
}

export function vibrate(pattern: number | readonly number[]): void {
  if (!enabled || typeof navigator === 'undefined') {
    return;
  }

  const first = typeof pattern === 'number' ? pattern : pattern[0] ?? 0;

  if (typeof navigator.vibrate !== 'function') {
    if (first > 0) iosTick();
    return;
  }

  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    if (first > 0) {
      navigator.vibrate(Math.min(first, 20));
    }
    return;
  }

  navigator.vibrate(typeof pattern === 'number' ? pattern : [...pattern]);
}
