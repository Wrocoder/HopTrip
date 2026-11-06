import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
for(const locale of ['ru','uk'])test(`${locale}: measure the reported partial first-screen flight CTA`,async({page},info)=>{
 await page.setViewportSize({width:1366,height:900});await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.goto('/'+locale+'/deals/browser-deal?returnTo='+encodeURIComponent('/deals?origin=WRO&sort=price&offset=12'));await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));
 const data=await page.locator('#trip-booking a.cta').evaluate(element=>{const box=element.getBoundingClientRect();return {top:box.top,bottom:box.bottom,height:box.height,viewport:innerHeight,visibleRatio:Math.max(0,Math.min(innerHeight,box.bottom)-Math.max(0,box.top))/box.height};});
 expect(data.visibleRatio).toBeGreaterThan(0);expect(data.visibleRatio).toBeLessThan(1);expect(data.bottom).toBeGreaterThan(data.viewport);
 writeFileSync(info.outputPath('geometry.json'),JSON.stringify({locale,...data},null,2));await page.screenshot({path:info.outputPath('first-screen.png'),scale:'css'});
});
