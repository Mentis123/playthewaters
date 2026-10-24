const { chromium } = require('@playwright/test');
(async () => {
const browser = await chromium.launch();
const p = await (await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
await p.goto('https://reelmobile.vercel.app/game',{waitUntil:'networkidle'}); await p.waitForTimeout(2500);
const info = await p.evaluate(() => {
  const el = document.querySelector('.splash-title-screen');
  const chain = [];
  let n = el;
  while(n){ chain.push(n.tagName+'.'+([...n.classList].join('.')||'')); n=n.parentElement; }
  const cs = el ? getComputedStyle(el) : null;
  return {
    found: !!el,
    outer: el ? el.outerHTML.slice(0,260) : null,
    parentChain: chain,
    style: cs ? {position:cs.position, inset:cs.inset||cs.top, zIndex:cs.zIndex, opacity:cs.opacity, display:cs.display, pointerEvents:cs.pointerEvents, visibility:cs.visibility} : null,
    rect: el ? el.getBoundingClientRect() : null,
  };
});
console.log(JSON.stringify(info,null,1));
await browser.close();
})();
