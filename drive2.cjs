const { chromium } = require('@playwright/test');
(async () => {
const base = 'http://localhost:3199';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const logs = [];
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', e => logs.push(`[PAGEERROR] ${e.message}`));
const dir='/Users/neo-chan/.claude/jobs/382b2fc2/tmp/';
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
// stage1: force click title
await page.locator('.splash-title-screen').click({ force:true });
await page.waitForTimeout(900);
console.log('stage after click1:', await page.locator('.splash-credit-screen').count() ? 'credit' : 'title');
// stage2: force click the Tap to start button
await page.locator('.splash-hint').last().click({ force:true });
await page.waitForTimeout(2000);
console.log('url after force-click start:', page.url());
// try clicking the credit div area too
if(!page.url().includes('/game')){
  await page.locator('.splash-credit-screen').click({ force:true, position:{x:195,y:650} });
  await page.waitForTimeout(2000);
  console.log('url after force-click div:', page.url());
}
await page.screenshot({ path: dir+'shot-5-after-force.png' });
console.log('=== LOGS ==='); console.log(logs.join('\n'));
await browser.close();
})();
