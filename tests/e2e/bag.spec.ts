import { expect, test, type Page } from '@playwright/test';

// A5.1 (docs/alpha/HOME_PLAN.md, ATTRIBUTION.md, GEAR_REVISIT.md): the title
// is the start and credits the author; the tackle bag holds the wall, the
// logbook, trophies, finds, bringing someone, settings and About; every share
// from it is a door and ends with #PlayTheWaters; the quiet lure replaced the
// sinker in the strip.

async function captureShares(page: Page) {
  await page.addInitScript(() => {
    const shared: Array<{ text?: string; url?: string }> = [];
    (window as unknown as { __shared: typeof shared }).__shared = shared;
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (d: { text?: string; url?: string }) => { shared.push({ text: d.text, url: d.url }); } });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
  });
}
const lastShare = async (page: Page) =>
  (await page.evaluate(() => (window as unknown as { __shared: Array<{ text?: string }> }).__shared)).at(-1)?.text ?? '';

test('the title is the start, and credits the author', async ({ page }) => {
  await page.goto('/game', { waitUntil: 'domcontentloaded' });
  const credit = page.getByTestId('credit-line');
  await expect(credit).toContainText('Made by Mentis');
  // The whole line is one link, to the home page, never /links (owner, 26 Oct 2026).
  await expect(credit).toHaveAttribute('href', 'https://adamrappaport.vercel.app');
  await expect(page.locator('a[href*="/links"]')).toHaveCount(0);
  await expect(page.getByText('Build yours at Vibe Academy')).toHaveCount(0);
  await page.getByTestId('tap-to-begin').tap();
  await expect(page.getByTestId('game-route')).toHaveAttribute('data-game-state', 'scouting');
  await expect(page.getByTestId('arrival-title')).toContainText('the home pond');
});

test('the tackle bag: wall, logbook, trophies, found, bring someone, settings, about', async ({ page }) => {
  await captureShares(page);
  await page.goto('/game?debug=1&sinker=1', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('tap-to-begin').tap();
  await page.waitForFunction(() => Boolean((window as unknown as { __watersDebug?: unknown }).__watersDebug), null, { timeout: 15_000 });
  // One glyph top right, not four.
  await expect(page.getByTestId('prefs-strip').getByRole('button')).toHaveCount(1);
  // Catch and keep one, so the bag has something.
  await page.evaluate(() => (window as unknown as { __watersDebug: { forceCatch: (t: number) => void } }).__watersDebug.forceCatch(0.7));
  await page.getByTestId('result-keep').and(page.locator(':not([disabled])')).waitFor({ timeout: 15_000 });
  await page.getByTestId('result-keep').tap();
  await page.getByTestId('result-cast-on').tap();

  await page.getByTestId('open-bag').tap();
  const bag = page.getByTestId('tackle-bag');
  await expect(bag).toBeVisible();
  await expect(bag).toContainText('the home pond');
  await expect(bag.locator('.bag-lines li')).toHaveCount(1);
  await expect(bag.getByTestId('bag-share-trophy')).toHaveCount(1);
  await expect(bag.getByTestId('bag-share-log')).toHaveCount(1);
  await expect(bag).toContainText('An old sinking lure');
  await expect(bag.getByTestId('qr-card')).toBeVisible();
  await expect(bag.getByTestId('bag-about').getByRole('link', { name: /Adam Rappaport/ })).toHaveAttribute('href', 'https://adamrappaport.vercel.app');

  await bag.getByTestId('bag-share-trophy').tap();
  await expect.poll(() => lastShare(page), { timeout: 10_000 }).toMatch(/\/c\/[A-Za-z0-9_-]+.*#PlayTheWaters$/);
  await bag.getByTestId('bag-share-wall').tap();
  await expect.poll(() => lastShare(page), { timeout: 10_000 }).toMatch(/^My wall on The Waters\..*#PlayTheWaters$/);
  await bag.getByTestId('bag-share-pond').tap();
  await expect.poll(() => lastShare(page), { timeout: 10_000 }).toMatch(/\/game\?seed=.*#PlayTheWaters$/);

  await bag.getByTestId('bag-open-wall').tap();
  await expect(page.getByTestId('wall-board')).toBeVisible();
  await page.getByTestId('wall-close').tap();
  await page.getByTestId('open-bag').tap();
  await page.getByTestId('bag-close').tap();
  await expect(page.getByTestId('tackle-bag')).toHaveCount(0);
});

test('the strip is natural, popper and quiet', async ({ page }) => {
  await page.goto('/game', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('tap-to-begin').tap();
  const lures = page.getByRole('group', { name: 'Lure' }).getByRole('button');
  await expect(lures).toHaveCount(3);
  await expect(lures.nth(2)).toHaveAttribute('aria-label', 'Quiet');
});
