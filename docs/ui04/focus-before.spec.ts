import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
test('UI-04 removal keyboard focus before fix',async({page},info)=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.route('**/api/v1/deals/*/events?**',route=>route.fulfill({json:{status:'READY',partial:false,checked_at:null,events:[{
  id:'focus-fixture',name:'Test-only focus event',venue:'Fixture venue',city:'Barcelona',category:'MUSIC',
  start_date:new URL(route.request().url()).searchParams.get('start_date'),end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',
  url:'https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Ffocus',price_from:null,currency:null,
 }]}}));
 await page.goto('/deals/browser-deal');await expect(page.locator('#budget-flight')).toBeEnabled();
 const start=await page.locator('#budget-start').inputValue(),end=new Date(start+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+2);
 await page.locator('#budget-end').fill(end.toISOString().slice(0,10));
 await page.locator('#trip-events button[aria-label$=": Test-only focus event"]').click();
 const remove=page.locator('#planned-events button');await remove.focus();await page.keyboard.press('Enter');
 await expect(page.locator('#planned-events')).toHaveCount(0);
 const after=await page.evaluate(()=>({tag:document.activeElement?.tagName,id:document.activeElement?.id,body:document.activeElement===document.body}));
 writeFileSync(info.outputPath('remove-focus-before.json'),JSON.stringify(after,null,2));
 await expect(page.locator('#calculator')).toBeFocused();
});
