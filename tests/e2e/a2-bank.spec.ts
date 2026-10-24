import { expect, test } from '@playwright/test';

// A2 behaviour checks (docs/alpha/A2_RUBRIC.md items 21 and the gate baseline).

async function enterPond(page: import('@playwright/test').Page, query = '') {
  await page.goto(`/game${query}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('tap-to-begin').tap();
  await page.getByTestId('tap-to-begin').tap();
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForFunction(() => Boolean((window as Window & { __waters?: unknown }).__waters), null, { timeout: 15_000 });
}

test('the leave glyph returns to the title, and the pond can be entered again', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await enterPond(page, '?light=day');
  await page.getByTestId('leave-pond').tap();
  await expect(page.getByRole('img', { name: 'The Waters' })).toBeVisible();
  await expect(page.getByTestId('leave-pond')).toHaveCount(0);
  await page.getByTestId('tap-to-begin').tap();
  await page.getByTestId('tap-to-begin').tap();
  await expect(page.getByTestId('leave-pond')).toBeVisible();
  expect(errors).toEqual([]);
});

test('?look=a1 renders the A1 baseline and says so in the read-back', async ({ page }) => {
  await enterPond(page, '?look=a1&light=dusk');
  await page.waitForTimeout(800);
  const probe = (await page.evaluate(() => (window as Window & { __waters?: { look: string; triangles: number } }).__waters))!;
  expect(probe.look).toBe('a1');
  // A1 has no bank geometry; A2's stones and weeds are several thousand triangles.
  expect(probe.triangles).toBeLessThan(2000);
});

test('the default look is the bank chapter, inside budget', async ({ page }) => {
  await enterPond(page, '?light=dusk');
  await page.waitForTimeout(800);
  const probe = (await page.evaluate(() => (window as Window & { __waters?: { look: string; triangles: number; calls: number } }).__waters))!;
  expect(probe.look).toBe('alpha');
  expect(probe.triangles).toBeGreaterThan(2000);
  expect(probe.triangles).toBeLessThan(80_000);
  expect(probe.calls).toBeLessThan(100);
});
