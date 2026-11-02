import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test('complete, partial and critical source data have distinct presentation and recommendation policy',async({page,request})=>{
 test.setTimeout(120000);
 try{
  for(const [scenario,status] of [['complete','COMPLETE'],['partial','PARTIAL'],['critical','CRITICAL_INCOMPLETE']] as const){
   const response=await request.post(`http://127.0.0.1:8100/__test__/quality?scenario=${scenario}`);
   expect(response.ok()).toBe(true);
   expect((await response.json()).quality.status).toBe(status);
   await page.goto('/deals/browser-13');
   const warning=page.locator('.detail-summary .flight-quality');
   if(scenario==='complete')await expect(warning).toHaveCount(0);
   else await expect(warning).toHaveAttribute('data-quality',status);
   expect((await new AxeBuilder({page}).include('.detail-summary').analyze()).violations).toEqual([]);
   await page.goto('/');
   const recommended=page.locator('a.deal-card-link[href="/deals/browser-13"]');
   await expect(recommended).toHaveCount(scenario==='critical'?0:1);
   await page.goto('/deals');
   const card=page.locator('.deal-card').filter({has:page.locator('a[href="/deals/browser-13"]')});
   await expect(card).toHaveCount(1); // Standard discovery retains the record.
   if(scenario!=='complete')await expect(card.locator('.flight-quality')).toHaveAttribute('data-quality',status);
  }
 }finally{await request.post('http://127.0.0.1:8100/__test__/quality?scenario=reset');}
});

test('critical warnings are localized and readable on narrow screens',async({page,request})=>{
 test.setTimeout(120000);
 await page.setViewportSize({width:320,height:844});
 try{
  await request.post('http://127.0.0.1:8100/__test__/quality?scenario=critical');
  for(const [locale,text] of [['pl','Sprawdź trasę przed wyborem'],['en','Check the itinerary before choosing'],
   ['ru','Проверьте маршрут перед выбором'],['uk','Перевірте маршрут перед вибором']]){
   await page.goto(`${locale==='pl'?'':`/${locale}`}/deals/browser-13`);
   await expect(page.locator('.detail-summary .flight-quality')).toContainText(text);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }finally{await request.post('http://127.0.0.1:8100/__test__/quality?scenario=reset');}
});
