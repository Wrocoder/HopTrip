import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {cardCopy} from '../src/lib/i18n/card-copy';
import {flightElapsedMinutes,destinationInterval} from '../src/lib/flight-facts';
import {stayModelBasis} from '../src/lib/weekend-stay';
import type {Deal} from '../src/lib/api';

const fixture='http://127.0.0.1:8100';
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{
 await request.post(`${fixture}/__test__/quality?scenario=reset`);
 await request.post(`${fixture}/__test__/weekend-fixtures?enabled=false`);
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: cards prioritize source journey duration and keep technical data in native details`,async({page,request},info)=>{
 test.setTimeout(120000);
 for(const scenario of ['complete','partial','critical']){
  expect((await request.post(`${fixture}/__test__/quality?scenario=${scenario}`)).ok()).toBe(true);
  const deal:Deal=await(await request.get(`${fixture}/api/v1/deals/browser-13`)).json();
  await page.goto(localizedHref('/deals?offset=12',locale));
  const card=page.locator('.flight-offer-card').filter({has:page.locator(`a.deal-card-link[href^="${localizedHref('/deals/browser-13',locale)}"]`)});
  await expect(card.locator('.deal-price')).toBeVisible();await expect(card.locator('.deal-dates')).toBeVisible();
  await expect(card.locator('.price-freshness')).toContainText(cardCopy[locale].notLive);
  await expect(card.locator('.trip-details .destination-time')).not.toBeVisible();
  await expect(card.locator('.flight-schedule-compact .destination-time')).toHaveCount(0);
  if(scenario==='critical')await expect(card.locator('.flight-duration')).toHaveCount(0);
  else{
   const facts=deal.flight_facts!;
   const minutes=flightElapsedMinutes(facts.outbound_departure,facts.outbound_arrival)!;
   expect(minutes).toBeGreaterThan(0);
   await expect(card.locator('.outbound-leg .flight-duration')).toHaveText(new RegExp(cardCopy[locale].duration));
   await expect(card.locator('.outbound-leg .flight-duration')).toContainText(destinationInterval(minutes,locale)!);
   await expect(card.locator('.outbound-leg .flight-duration')).toHaveAttribute('data-estimated',String(Boolean(facts.outbound_arrival_calculated)));
  }
  const summary=card.locator('.trip-details > summary');await summary.focus();await summary.press('Enter');
  await expect(card.locator('.trip-details .destination-time')).toBeVisible();await expect(card.locator('.flight-facts')).toBeVisible();
  await summary.press('Enter');
  for(const width of [320,375,390,768,1440]){
   await page.setViewportSize({width,height:900});expect(await card.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  if(scenario==='partial'&&locale==='ru'){
   await page.setViewportSize({width:320,height:844});await card.screenshot({path:info.outputPath('card-ru-320.png')});
  }
 }
 expect((await new AxeBuilder({page}).include('.deal-grid').analyze()).violations).toEqual([]);
 await request.post(`${fixture}/__test__/quality?scenario=reset`);
 await request.post(`${fixture}/__test__/weekend-fixtures?enabled=true&recommendations=true`);
 await page.goto(localizedHref('/deals?destination=weekend-fixture&departure_from=2030-11-01',locale));
 const night=page.locator('.deal-card').filter({has:page.locator('a[href*="weekend-fixture-night"]')});
 await expect(night.locator('.stay-warning').first()).toBeVisible();
 await expect(night.locator('.flight-schedule-compact')).not.toContainText(stayModelBasis(locale));
 await expect(night.locator('.stay-model-basis')).not.toBeVisible();
 await night.locator('.trip-details > summary').click();
 await expect(night.locator('.stay-model-basis')).toHaveText(stayModelBasis(locale));
 await expect(night.locator('.stay-model-basis')).toBeVisible();
});

test('duration and disclosure remain usable without JavaScript',async({browser,request},info)=>{
 await request.post(`${fixture}/__test__/quality?scenario=complete`);
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:info.project.use.baseURL});
 try{
  const page=await context.newPage();await page.goto('/en/deals?offset=12');
  const card=page.locator('.deal-card').filter({has:page.locator('a[href^="/en/deals/browser-13"]')});
  await expect(card.locator('.flight-duration').first()).toContainText(cardCopy.en.duration);
  await expect(card.locator('.trip-details .destination-time')).not.toBeVisible();
  await card.locator('.trip-details > summary').click();await expect(card.locator('.trip-details .destination-time')).toBeVisible();
  await expect(card.locator('.price-freshness')).toContainText(cardCopy.en.notLive);
 }finally{await context.close();}
});
