import { expect, test } from '@playwright/test';

// The review tour (docs/alpha/TOUR.md): only with ?tour=, it walks the
// review's stops, points at things, and its answers land on /ab.
test('no tour without ?tour', async ({ page }) => {
  await page.goto('/game');
  await expect(page.getByTestId('tap-to-begin').first()).toBeVisible();
  await expect(page.getByTestId('tour-card')).toHaveCount(0);
  await page.goto('/game?tour=nope');
  await expect(page.getByTestId('tour-card')).toHaveCount(0);
});

test('the tour walks, points, and answers land on /ab', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // /ab opens the tour in a new window, by a plain link (owner, 26 Oct 2026).
  await page.goto('/ab');
  await expect(page.getByTestId('ab-tour-link')).toHaveAttribute('target', '_blank');
  await expect(page.getByTestId('ab-tour-restart')).toHaveAttribute('target', '_blank');
  const [win] = await Promise.all([page.context().waitForEvent('page'), page.getByTestId('ab-tour-link').click()]);
  await win.close();
  await page.goto('/game?water=home&tour=A5.1');
  const card = page.getByTestId('tour-card');
  await expect(card).toHaveAttribute('data-stop', 'title');
  await page.getByTestId('tap-to-begin').first().click();
  await expect(card).toHaveAttribute('data-stop', 'arrive');
  await page.getByTestId('tour-yes').click();
  await page.getByTestId('tour-next').click();
  await expect(card).toHaveAttribute('data-stop', 'clean');
  // The pointer is on the bag, and the bag sits below the card.
  await expect.poll(() => page.getByTestId('tour-ring').evaluate((r) => getComputedStyle(r).opacity)).toBe('1');
  const cardBox = await card.boundingBox();
  const bagBox = await page.getByTestId('open-bag').boundingBox();
  expect(bagBox!.y).toBeGreaterThanOrEqual(cardBox!.y + cardBox!.height);
  // Folding the card keeps the step.
  await page.getByTestId('tour-toggle').click();
  await expect(page.getByTestId('tour-line')).toHaveCount(0);
  await page.getByTestId('tour-toggle').click();
  // Progress survives a reload.
  await page.reload();
  await expect(card).toHaveAttribute('data-stop', 'clean');
  await page.goto('/ab');
  await expect(page.locator('.review-check').first().locator('.is-picked')).toHaveText('Yes');
  expect(errors).toEqual([]);
});
