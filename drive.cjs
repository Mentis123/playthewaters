const { chromium } = require('@playwright/test');
(async () => {
const base = 'http://localhost:3199';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const logs = [];
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', e => logs.push(`[PAGEERROR] ${e.message}`));
page.on('requestfailed', r => logs.push(`[REQFAIL] ${r.url()} ${r.failure()?.errorText}`));
const dir = '/Users/neo-chan/.claude/jobs/382b2fc2/tmp/';

console.log('--- loading / ---');
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: dir+'shot-1-splash.png' });
console.log('url:', page.url(), 'title:', await page.title());

await page.locator('.splash-title-screen').click({ timeout: 4000 }).catch(e=>console.log('no title screen:', e.message));
await page.waitForTimeout(700);
await page.screenshot({ path: dir+'shot-2-credit.png' });

await page.locator('.splash-hint').last().click({ timeout: 4000 }).catch(e=>console.log('no start btn:', e.message));
await page.waitForTimeout(3000);
console.log('after start url:', page.url());
await page.screenshot({ path: dir+'shot-3-game.png' });

console.log('--- direct /game ---');
await page.goto(base + '/game', { waitUntil: 'networkidle' }).catch(e=>console.log('game nav err', e.message));
await page.waitForTimeout(3000);
await page.screenshot({ path: dir+'shot-4-game-direct.png' });
const bodyText = (await page.locator('body').innerText().catch(()=>'')).slice(0,400);
console.log('game body text:', JSON.stringify(bodyText));
console.log('canvas count on /game:', await page.locator('canvas').count());

console.log('=== CONSOLE/ERRORS ===');
console.log(logs.join('\n'));
await browser.close();
})();
