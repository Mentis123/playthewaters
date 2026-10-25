import { expect, test, type Page } from '@playwright/test';

import { createInitialFish } from '../../src/game/fish/fishStateMachine';
import { seededRandom } from '../../src/game/math/vec';
import { encodeCatchLink } from '../../src/game/share/catchLink';

// A4 behaviour checks (docs/alpha/A4_RUBRIC.md): the link, keep or release,
// one keeper per visit, the wall. Catches are forced through the ?debug=1 hook
// so the check does not depend on winning a fight.

type Probe = { firstFrameMs: number; phase: number; calls: number; triangles: number };
type WallLine = { name: string; weight: string; light: string; lure: string };
type Debug = {
  forceCatch: (tension?: number) => void;
  wall: () => WallLine[];
  fish: () => { fish: Array<{ species: string; x: number; z: number }> };
};

const LINK = {
  seed: 'a4-e2e-pond',
  spawnIndex: 2,
  phase: 0.5,
  species: 'reed_pike' as const,
  sizeScore: 0.6,
  hook: { x: 0.4, z: -3.1 },
  lure: 'popper' as const,
  kept: true
};

async function caught(page: Page) {
  await page.evaluate(() => (window as unknown as { __watersDebug: Debug }).__watersDebug.forceCatch(0.7));
  await page.getByTestId('result-keep').and(page.locator(':not([disabled])')).waitFor({ timeout: 15_000 });
}

test('a catch link opens the sender’s pond and light behind an arrival card', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(`/c/${encodeCatchLink(LINK)}?debug=1`);
  await expect(page.getByTestId('arrival-card')).toContainText('Your friend caught a');
  await expect(page.getByTestId('arrival-card')).not.toContainText('popper');
  await page.waitForFunction(() => ((window as Window & { __waters?: Probe }).__waters?.firstFrameMs ?? 0) > 0, null, { timeout: 15_000 });
  const probe = (await page.evaluate(() => (window as Window & { __waters?: Probe }).__waters))!;
  // The canon gate is < 2 s on a phone; this software-GL runner gets headroom.
  test.info().annotations.push({ type: 'firstFrameMs', description: String(probe.firstFrameMs) });
  expect(probe.firstFrameMs).toBeLessThan(4000);
  expect(Math.abs(probe.phase - 0.5)).toBeLessThan(0.02);
  // The canvas is visible before "Fish here" (it is hidden behind the title screens otherwise).
  await expect(page.locator('.game-canvas')).toHaveCSS('opacity', '1');
  // The same pond: the sender's seed and spawn regrow the same primary fish.
  // The same pond: the sender's seed and spawn regrow the same primary fish,
  // in the same place (fish do not move before "Fish here").
  const visitor = await page.evaluate(() => (window as unknown as { __watersDebug: Debug }).__watersDebug.fish().fish[0]);
  const expected = createInitialFish(seededRandom(`${LINK.seed}-spawn-${LINK.spawnIndex}`));
  expect(visitor.species).toBe(expected.instance.species);
  expect(Math.abs(visitor.x - expected.position.x)).toBeLessThan(1e-6);
  expect(Math.abs(visitor.z - expected.position.z)).toBeLessThan(1e-6);
  expect(errors).toEqual([]);
});

test('a broken link falls back to the title screen without an error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('/c/bm90LWEtbGluaw');
  await expect(page.getByText('Tap to fish')).toBeVisible();
  expect(errors).toEqual([]);
});

test('keep, a swap in the same visit, let go, and the wall', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(`/c/${encodeCatchLink(LINK)}?debug=1`);
  await page.getByTestId('arrival-go').tap();

  await caught(page);
  await page.getByTestId('result-keep').tap();
  await expect(page.getByTestId('result-kept')).toContainText('On the wall');
  let wall = await page.evaluate(() => (window as unknown as { __watersDebug: Debug }).__watersDebug.wall());
  expect(wall).toHaveLength(1);
  expect(wall[0].weight).toMatch(/lb|oz/);
  await page.getByTestId('result-cast-on').tap();

  // A second Keep in the same visit asks first, and survives a reload.
  await page.reload();
  await page.getByTestId('arrival-go').tap();
  await caught(page);
  await page.getByTestId('result-keep').tap();
  await expect(page.getByTestId('result-confirm')).toContainText('one fish per visit');
  await page.getByTestId('result-confirm-swap').tap();
  await expect(page.getByTestId('result-kept')).toContainText('went back in the water');
  wall = await page.evaluate(() => (window as unknown as { __watersDebug: Debug }).__watersDebug.wall());
  expect(wall).toHaveLength(1);
  await page.getByTestId('result-cast-on').tap();

  await caught(page);
  await page.getByTestId('result-release').tap();
  await expect(page.getByTestId('pond-note')).toHaveText('Let go.');
  wall = await page.evaluate(() => (window as unknown as { __watersDebug: Debug }).__watersDebug.wall());
  expect(wall).toHaveLength(1);

  await page.waitForTimeout(3500);
  await page.getByTestId('open-bag').tap();
  await page.getByTestId('bag-open-wall').tap();
  await expect(page.getByTestId('wall-line')).toHaveCount(1);
  await page.getByTestId('wall-close').tap();
  await expect(page.getByTestId('wall-board')).toHaveCount(0);

  await page.goto('/wall');
  await expect(page.getByTestId('wall-line')).toHaveCount(1);
  expect(errors).toEqual([]);
});
