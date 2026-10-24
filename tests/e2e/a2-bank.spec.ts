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

test('A3: the default look has habits on; ?look=a2 is the habit-free baseline', async ({ page }) => {
  await enterPond(page, '?light=night');
  await page.waitForTimeout(600);
  const a3 = (await page.evaluate(() => (window as Window & { __waters?: { look: string; habits: boolean } }).__waters))!;
  expect(a3.look).toBe('alpha');
  expect(a3.habits).toBe(true);
  await enterPond(page, '?look=a2&light=night');
  await page.waitForTimeout(600);
  const a2 = (await page.evaluate(() => (window as Window & { __waters?: { look: string; habits: boolean } }).__waters))!;
  expect(a2.look).toBe('a2');
  expect(a2.habits).toBe(false);
});

test('/ab says what is being reviewed and what to try', async ({ page }) => {
  await page.goto('/ab', { waitUntil: 'domcontentloaded' });
  const brief = page.getByTestId('ab-brief');
  await expect(brief).toBeVisible();
  await expect(brief).toContainText('Reviewing');
  expect(await brief.locator('li').count()).toBeGreaterThan(1);
  // /ab is a blind pair for a look chapter and a guided review for a
  // feature chapter (AGENTS.md /ab rule); check whichever is live.
  const sample = page.getByTestId('review-sample-link');
  if (await sample.count()) {
    expect(await sample.getAttribute('href')).toMatch(/^\/c\//);
    await expect(page.getByTestId('review-checks')).toBeVisible();
  } else {
    const hrefs = await page.locator('a.ab-open').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
    expect(hrefs.length).toBe(4);
    for (const href of hrefs) expect(href).not.toMatch(/look=|light=|classic|alpha/);
  }
});
