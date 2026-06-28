const { chromium } = require('@playwright/test');
(async () => {
const base = 'https://reelmobile.vercel.app';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const logs = [];
page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', e => logs.push(`[PAGEERROR] ${e.message}`));
page.on('requestfailed', r => logs.push(`[REQFAIL] ${r.url()} ${r.failure()?.errorText}`));
const dir='/Users/neo-chan/.claude/jobs/382b2fc2/tmp/';
console.log('GET /', (await page.goto(base+'/', {waitUntil:'networkidle'}).catch(e=>'ERR '+e.message)) && page.url());
await page.waitForTimeout(1000);
await page.screenshot({ path: dir+'live-1.png' });
console.log('title:', await page.title(), 'bodylen:', (await page.locator('body').innerText().catch(()=>'')).length);
// advance
await page.locator('.splash-title-screen').click({force:true}).catch(e=>console.log('c1',e.message));
await page.waitForTimeout(900);
const stage = await page.locator('.splash-credit-screen').count();
console.log('reached credit screen:', !!stage);
await page.screenshot({ path: dir+'live-2.png' });
await page.locator('.splash-hint').last().click({force:true}).catch(e=>console.log('c2',e.message));
await page.waitForTimeout(3000);
console.log('url after start:', page.url());
await page.screenshot({ path: dir+'live-3.png' });
console.log('canvas:', await page.locator('canvas').count());
// direct game
console.log('GET /game', await page.goto(base+'/game',{waitUntil:'networkidle'}).then(r=>r.status()).catch(e=>'ERR '+e.message));
await page.waitForTimeout(3000);
await page.screenshot({ path: dir+'live-4.png' });
console.log('game canvas:', await page.locator('canvas').count());
console.log('=== LOGS ==='); console.log(logs.slice(0,40).join('\n'));
await browser.close();
})();
