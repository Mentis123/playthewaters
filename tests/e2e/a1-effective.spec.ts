import { expect, test } from '@playwright/test';

// A1 effective-state read-back (23_ALPHA_CANON §10). Reads what the renderer
// ACTUALLY did from window.__waters — never the tuning table — on the iPhone
// 13 profile (DPR 3). Birb's rule: "effective is READ BACK, never echoed."

type Probe = {
  look: string;
  light: string;
  frozen: boolean;
  toneMapping: number;
  dpr: number;
  drawingBuffer: [number, number];
  calls: number;
  triangles: number;
};

const NEUTRAL_TONE_MAPPING = 7; // THREE.NeutralToneMapping
const DPR_CAP = 2; // TUNING.performance.pixelRatioCap
const BUDGET = { calls: 100, triangles: 80_000 };

export function effectiveFailures(probe: Probe | null, expected: { light: string; viewport: { width: number; height: number }; deviceDpr: number }): string[] {
  if (!probe) return ['window.__waters missing: the A1 light driver never ran'];
  const failures: string[] = [];
  const dpr = Math.min(expected.deviceDpr, DPR_CAP);
  if (probe.look !== 'alpha') failures.push(`look ${probe.look}`);
  if (probe.light !== expected.light) failures.push(`light ${probe.light} != ${expected.light}`);
  if (!probe.frozen) failures.push('light not frozen under ?light=');
  if (probe.toneMapping !== NEUTRAL_TONE_MAPPING) failures.push(`toneMapping ${probe.toneMapping}`);
  if (Math.abs(probe.dpr - dpr) > 1e-6) failures.push(`dpr ${probe.dpr} != ${dpr}`);
  const [w, h] = probe.drawingBuffer;
  if (Math.abs(w - Math.round(expected.viewport.width * dpr)) > 2 || Math.abs(h - Math.round(expected.viewport.height * dpr)) > 2) {
    failures.push(`drawing buffer ${w}x${h}`);
  }
  if (!(probe.calls > 0 && probe.calls < BUDGET.calls)) failures.push(`draw calls ${probe.calls}`);
  if (!(probe.triangles > 0 && probe.triangles < BUDGET.triangles)) failures.push(`triangles ${probe.triangles}`);
  return failures;
}

test('the oracle can fail: a planted wrong DPR and a missing probe are both caught', () => {
  const good: Probe = { look: 'alpha', light: 'dusk', frozen: true, toneMapping: 7, dpr: 2, drawingBuffer: [780, 1688], calls: 26, triangles: 710 };
  const expected = { light: 'dusk', viewport: { width: 390, height: 844 }, deviceDpr: 3 };
  expect(effectiveFailures(good, expected)).toEqual([]);
  expect(effectiveFailures({ ...good, dpr: 1, drawingBuffer: [390, 844] }, expected).length).toBeGreaterThan(0);
  expect(effectiveFailures({ ...good, toneMapping: 4 }, expected).length).toBeGreaterThan(0);
  expect(effectiveFailures(null, expected).length).toBeGreaterThan(0);
});

for (const light of ['dawn', 'day', 'dusk', 'night']) {
  test(`effective renderer state at ${light}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto(`/game?light=${light}`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('tap-to-begin').tap();
    await expect(page.locator('canvas')).toBeVisible();
    await page.waitForFunction(() => Boolean((window as Window & { __waters?: unknown }).__waters), null, { timeout: 15_000 });
    await page.waitForTimeout(800);
    const probe = (await page.evaluate(() => (window as Window & { __waters?: unknown }).__waters)) as Probe;
    const viewport = page.viewportSize() ?? { width: 390, height: 844 };
    const deviceDpr = await page.evaluate(() => window.devicePixelRatio);
    expect(effectiveFailures(probe, { light, viewport, deviceDpr })).toEqual([]);
    expect(errors).toEqual([]);
  });
}
