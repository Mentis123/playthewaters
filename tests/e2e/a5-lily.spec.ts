import { expect, test, type Page } from '@playwright/test';

import { encodeCatchLink } from '../../src/game/share/catchLink';

// A5 behaviour checks (docs/alpha/A5_RUBRIC.md): the walk, the lily pond's
// pads, the two finds, the legend and the link. Driven through the ?debug=1
// hooks so the checks do not depend on winning fights.

type Point = { x: number; y: number };
type Shore = {
  water: string;
  state: string;
  snagged: boolean;
  lureId: string;
  targets: { path: Point | null; bench: Point | null; sinker: Point | null };
  legend: { present: boolean; spooked: boolean; pos: { x: number; z: number } } | null;
  species: string;
  saved: { water: string; foundSinker: boolean; sinkerTied: boolean; seenCards: string[]; visits: Record<string, number> };
};
type Probe = { calls: number; triangles: number };

async function enter(page: Page, query: string) {
  await page.goto(`/game${query}${query.includes('?') ? '&' : '?'}debug=1`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('tap-to-begin').first().tap();
  await page.getByTestId('tap-to-begin').first().tap();
  await page.waitForFunction(() => Boolean((window as unknown as { __watersDebug?: unknown }).__watersDebug), null, { timeout: 15_000 });
  await page.waitForTimeout(1500);
}
const shore = (page: Page) => page.evaluate(() => (window as unknown as { __watersDebug: { shore: () => Shore } }).__watersDebug.shore());
const castAt = (page: Page, x: number, z: number) =>
  page.evaluate(([x, z]) => (window as unknown as { __watersDebug: { castAt: (x: number, z: number) => void } }).__watersDebug.castAt(x, z), [x, z]);
async function tapPoint(page: Page, point: Point | null) {
  expect(point, 'target on screen').not.toBeNull();
  await page.touchscreen.tap(point!.x, point!.y);
}

test('the walk: the path leads to the lily pond and back, and the shore remembers', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await enter(page, '?light=day');
  let s = await shore(page);
  expect(s.water).toBe('home');
  await tapPoint(page, s.targets.path);
  await expect(page.getByTestId('water-card')).toBeVisible({ timeout: 4000 });
  await page.waitForTimeout(4200);
  s = await shore(page);
  expect(s.water).toBe('lily');
  expect(s.state).toBe('scouting');
  expect(s.saved.seenCards).toContain('lily');
  const probe = (await page.evaluate(() => (window as Window & { __waters?: Probe }).__waters))!;
  expect(probe.calls).toBeLessThan(100);
  expect(probe.triangles).toBeLessThan(80_000);
  // Remembered on the next visit, and no second water card.
  await enter(page, '?light=day');
  s = await shore(page);
  expect(s.water).toBe('lily');
  await expect(page.getByTestId('water-card')).toHaveCount(0);
  await tapPoint(page, s.targets.path);
  await page.waitForTimeout(4600);
  expect((await shore(page)).water).toBe('home');
  expect(errors).toEqual([]);
});

test('a cast onto a pad snags; one tap frees it', async ({ page }) => {
  await enter(page, '?water=lily&light=day');
  await castAt(page, 1.3, -3.9);
  await page.waitForTimeout(1200);
  let s = await shore(page);
  expect(s.snagged).toBe(true);
  await page.touchscreen.tap(195, 300);
  await page.waitForTimeout(400);
  s = await shore(page);
  expect(s.snagged).toBe(false);
  expect(s.state).toBe('scouting');
  // Open water does not snag.
  await castAt(page, 0, -1.6);
  await page.waitForTimeout(1200);
  expect((await shore(page)).snagged).toBe(false);
});

test('the finds: the old sinking lure under the home bank, and the bench', async ({ page }) => {
  await enter(page, '?water=home&light=day');
  await castAt(page, -0.7, 1.95);
  await expect(page.getByTestId('found-card')).toContainText('old sinking lure');
  await page.getByTestId('found-close').tap();
  let s = await shore(page);
  expect(s.saved.foundSinker).toBe(true);
  await tapPoint(page, s.targets.sinker);
  await page.waitForTimeout(300);
  s = await shore(page);
  expect(s.lureId).toBe('old_sinker');
  // Never in the strip: three lure glyphs, none shown as chosen while it is
  // tied on, and choosing one unties it.
  const lures = page.getByRole('group', { name: 'Lure' }).getByRole('button');
  await expect(lures).toHaveCount(3);
  await expect(page.getByRole('group', { name: 'Lure' }).locator('[aria-pressed="true"]')).toHaveCount(0);
  await lures.first().tap();
  await page.waitForTimeout(300);
  expect((await shore(page)).lureId).not.toBe('old_sinker');
  await enter(page, '?water=lily&light=day');
  s = await shore(page);
  await tapPoint(page, s.targets.bench);
  await expect(page.getByTestId('bench-plank')).toContainText('OLD MOSSBACK');
});

test('the legend: never the wrong lure, the old one lying still, and a careless cast costs the visit', async ({ page }) => {
  test.setTimeout(90_000);
  await enter(page, '?water=lily&legend=1&sinker=1&light=dawn');
  let s = await shore(page);
  expect(s.legend?.present).toBe(true);
  const pos = s.legend!.pos;
  // The old lure, tied on, lying still beside it: it comes.
  await tapPoint(page, s.targets.sinker);
  expect((await shore(page)).lureId).toBe('old_sinker');
  await castAt(page, pos.x - 1.1, pos.z + 0.4);
  await page.waitForFunction(
    () => (window as unknown as { __watersDebug: { shore: () => Shore } }).__watersDebug.shore().species === 'old_mossback',
    null,
    { timeout: 25_000 }
  );
  // A cast on top of it, another visit: gone for the visit.
  await enter(page, '?water=lily&legend=1&light=dawn');
  s = await shore(page);
  await castAt(page, s.legend!.pos.x, s.legend!.pos.z);
  await page.waitForTimeout(1200);
  expect((await shore(page)).legend?.spooked).toBe(true);
});

test('a catch link from the lily pond opens the lily pond', async ({ page }) => {
  const code = encodeCatchLink({ seed: 'a5-link', spawnIndex: 0, phase: 0.5, species: 'moss_bass', sizeScore: 0.5, hook: { x: 0, z: -2 }, lure: 'natural', water: 'lily' });
  await page.goto(`/c/${code}?debug=1`);
  await page.getByTestId('arrival-go').tap();
  await page.waitForTimeout(800);
  expect((await shore(page)).water).toBe('lily');
});
