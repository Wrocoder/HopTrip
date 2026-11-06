import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile,writeFile} from 'node:fs/promises';
import {localizedHref} from '../src/lib/i18n/routing';
import {qualityReasonText} from '../src/lib/i18n/quality-copy';
const api='http://127.0.0.1:8100',before=process.env.HOPTRIP_CARD_PHASE==='before';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));});
test.afterEach(async({request})=>{await request.post(`${api}/__test__/quality?scenario=reset`);await request.post(`${api}/__test__/compact-card?scenario=normal`);});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: card hierarchy preserves critical information`,async({page,request},info)=>{
 test.setTimeout(120000);const metrics=[],initialViewport=page.viewportSize()!;
 for(const scenario of ['complete','partial','critical'] as const){
  await page.setViewportSize(initialViewport);
  const response=await request.post(`${api}/__test__/quality?scenario=${scenario}`);expect(response.ok()).toBe(true);
  const {quality}=await response.json();
  await page.goto(localizedHref('/deals?offset=12',locale));await page.evaluate(()=>document.fonts.ready);
  const card=page.locator('.flight-offer-card').filter({has:page.locator(`a.deal-card-link[href^="${localizedHref('/deals/browser-13',locale)}"]`)});
  await expect(card).toHaveCount(1);await expect(card.locator('.deal-price')).toContainText(/PLN|zł/);
  await expect(card.locator('.card-cta')).toBeVisible();await expect(card.locator('.card-cost-scope')).toBeVisible();
  await expect(card.locator('.home-arrival')).toBeVisible();await expect(card.locator('.trip-details')).not.toHaveAttribute('open','');
  if(scenario==='critical')for(const reason of quality.reasons)await expect(card.locator('.flight-quality').getByText(qualityReasonText(locale,reason),{exact:true})).toBeVisible();
  metrics.push({locale,project:info.project.name,scenario,height:(await card.boundingBox())!.height});
  if(!before&&process.env.HOPTRIP_CARD_BASELINE){
   const baseline=JSON.parse(await readFile(process.env.HOPTRIP_CARD_BASELINE,'utf8')) as {locale:string;project:string;scenario:string;height:number}[];
   const previous=baseline.find(row=>row.locale===locale&&row.project===info.project.name&&row.scenario===scenario)!;
   expect(metrics.at(-1)!.height).toBeLessThan(previous.height);
  }
  if(!before){
   await expect(card.locator('.price-eur')).toHaveCount(0);
   const details=card.locator('.trip-details');await expect(details).not.toHaveAttribute('open','');
   await details.locator(':scope > summary').focus();await page.keyboard.press('Enter');await expect(details.locator('.price-observation time')).toBeVisible();await expect(details.locator('.card-price-origin')).toBeVisible();await page.keyboard.press('Enter');
   const positions=await card.evaluate(el=>({condition:el.querySelector('.card-baggage-scope')!.getBoundingClientRect().y,cta:el.querySelector('.card-cta')!.getBoundingClientRect().y}));
   expect(positions.cta).toBeLessThan(positions.condition);
  }
  if(scenario==='partial')await card.screenshot({path:info.outputPath(`card-${before?'before':'after'}.png`)});
  if(!before&&scenario==='partial'){
   await card.locator('.trip-details > summary').focus();await page.keyboard.press('Enter');await expect(card.locator('.flight-facts')).toBeVisible();
   await page.keyboard.press('Enter');expect((await new AxeBuilder({page}).include('.deal-grid').analyze()).violations).toEqual([]);
   await card.locator('.deal-card-link h2').evaluate(el=>el.textContent='Santiago de Compostela — bardzo długa nazwa kierunku');
   await card.locator('.deal-price').evaluate(el=>el.textContent='999 999,99 PLN');
   await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await card.screenshot({path:info.outputPath('card-long-320.png')});
  }
 }
 const path=info.outputPath('metrics.json');await writeFile(path,JSON.stringify(metrics));await info.attach('metrics',{path,contentType:'application/json'});
});
