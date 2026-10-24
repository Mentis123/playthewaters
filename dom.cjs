const { chromium } = require('@playwright/test');
const dump = async (page, label) => {
  const info = await page.evaluate(() => ({
    url: location.href,
    main: document.querySelector('main')?.className || null,
    hasSplashTitle: !!document.querySelector('.splash-title-screen'),
    hasSplashCredit: !!document.querySelector('.splash-credit-screen'),
    hasCanvas: document.querySelectorAll('canvas').length,
    bodyStart: document.body.innerText.slice(0,80).replace(/\n/g,' '),
    topKids: [...document.body.children].map(c=>c.tagName+'.'+(c.className||'').toString().slice(0,30)),
    swController: navigator.serviceWorker?.controller?.scriptURL || 'none',
  }));
  console.log(label, JSON.stringify(info,null,1));
};
(async () => {
const base='https://reelmobile.vercel.app';
const browser = await chromium.launch();
// Context A: fresh, go straight to /game (no SW yet)
const a = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const pa = await a.newPage();
await pa.goto(base+'/game',{waitUntil:'networkidle'}); await pa.waitForTimeout(2500);
await dump(pa,'A fresh-direct-/game:');

// Context B: visit / first (registers SW), wait for SW control, then go /game
const b = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const pb = await b.newPage();
await pb.goto(base+'/',{waitUntil:'networkidle'});
await pb.waitForTimeout(2000); // let SW install+activate
// reload so SW controls this client
await pb.reload({waitUntil:'networkidle'}); await pb.waitForTimeout(1500);
await dump(pb,'B after-/-and-reload (root):');
await pb.goto(base+'/game',{waitUntil:'networkidle'}); await pb.waitForTimeout(2500);
await dump(pb,'B then-/game (SW active):');
await pb.screenshot({path:'/Users/neo-chan/.claude/jobs/382b2fc2/tmp/dom-b-game.png'});
await browser.close();
})();
