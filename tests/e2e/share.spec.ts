import { expect, test, type Page } from '@playwright/test';

// Owner, 25 Oct 2026: every share ends with #PlayTheWaters, and three fingers
// anywhere bring up a QR of the game.

async function captureShares(page: Page) {
  await page.addInitScript(() => {
    const shared: Array<{ text?: string; url?: string }> = [];
    (window as unknown as { __shared: typeof shared }).__shared = shared;
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: { text?: string; url?: string }) => {
        shared.push({ text: data.text, url: data.url });
      }
    });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
  });
}
const shared = (page: Page) => page.evaluate(() => (window as unknown as { __shared: Array<{ text?: string }> }).__shared);

async function threeFingers(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  const touchPoints = [{ x: 120, y: 300 }, { x: 200, y: 320 }, { x: 280, y: 300 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

test('three fingers on the title bring up a QR of the game, and its share carries the hashtag', async ({ page }) => {
  await captureShares(page);
  await page.goto('/game', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('qr-note')).toBeVisible();
  await threeFingers(page);
  await expect(page.getByTestId('qr-tap')).toBeVisible();
  await expect(page.getByTestId('qr-tap').locator('img')).toHaveAttribute('alt', /playthewaters\.vercel\.app/);
  await page.getByTestId('qr-share').tap();
  const texts = await shared(page);
  expect(texts.at(-1)?.text).toMatch(/#PlayTheWaters$/);
});

test('a catch share ends with #PlayTheWaters and carries the catch link', async ({ page }) => {
  await captureShares(page);
  await page.goto('/game?debug=1', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('tap-to-begin').first().tap();
  await page.waitForFunction(() => Boolean((window as unknown as { __watersDebug?: unknown }).__watersDebug), null, { timeout: 15_000 });
  await page.evaluate(() => (window as unknown as { __watersDebug: { forceCatch: (t: number) => void } }).__watersDebug.forceCatch(0.7));
  await page.locator('.result-share').waitFor();
  await page.locator('.result-share').tap();
  await expect.poll(async () => (await shared(page)).length, { timeout: 10_000 }).toBeGreaterThan(0);
  const text = (await shared(page)).at(-1)?.text ?? '';
  expect(text).toMatch(/\/c\/[A-Za-z0-9_-]+/);
  expect(text).toMatch(/#PlayTheWaters$/);
});
