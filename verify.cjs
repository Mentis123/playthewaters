const { chromium } = require('@playwright/test');
(async () => {
const base='http://localhost:3200';
const browser = await chromium.launch();
const p = await (await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(base+'/',{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
const dir='/Users/neo-chan/.claude/jobs/382b2fc2/tmp/';
console.log('1. after goto /  -> url:', p.url());  // expect /game
await p.screenshot({path:dir+'fix-1.png'});
// tap-to-begin primary
await p.getByTestId('tap-to-begin').click({force:true}); await p.waitForTimeout(700);
console.log('2. after tap1 -> credit visible:', await p.getByText('Build yours at Vibe Academy').isVisible().catch(()=>false));
await p.screenshot({path:dir+'fix-2.png'});
// tap-to-begin credit -> begin game
await p.getByTestId('tap-to-begin').click({force:true}); await p.waitForTimeout(2500);
const splashGone = await p.getByTestId('tap-to-begin').isHidden().catch(()=>true);
console.log('3. after tap2 -> splash hidden:', splashGone, '| canvas:', await p.locator('canvas').count(), '| game-state:', await p.getByTestId('game-route').getAttribute('data-game-state').catch(()=>'n/a'));
await p.screenshot({path:dir+'fix-3.png'});
console.log('pageerrors:', errs.length? errs : 'none');
await browser.close();
})();
