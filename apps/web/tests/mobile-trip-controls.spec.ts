import {test,expect} from '@playwright/test';

test('event dates keep enough room for a full native date at 320px',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='mobile','Narrow touch context');
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.setViewportSize({width:320,height:844});
 await page.goto('/deals/browser-13');
 const events=page.locator('#trip-events');
 const from=events.getByLabel('Od',{exact:true}),to=events.getByLabel('Do',{exact:true});
 await expect(from).toBeEnabled();
 await events.screenshot({path:testInfo.outputPath('event-dates-320.png')});
 for(const input of [from,to]){
  expect((await input.boundingBox())!.width).toBeGreaterThanOrEqual(180);
  expect(await input.evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(16);
  expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
