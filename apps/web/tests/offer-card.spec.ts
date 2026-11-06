import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {catalogText} from '../src/lib/i18n/catalog-copy';
import {qualityReasonText} from '../src/lib/i18n/quality-copy';
import {localizedHref} from '../src/lib/i18n/routing';
import {offerDeadline} from '../src/lib/offer-expiry';
import type {Deal} from '../src/lib/api';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{
 await request.post('http://127.0.0.1:8100/__test__/quality?scenario=reset');
 await request.post('http://127.0.0.1:8100/__test__/compact-card?scenario=normal');
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: card exposes price, CTA and material warnings for every quality state`,async({page,request},info)=>{
 test.setTimeout(120000);
 for(const scenario of ['complete','partial','critical'] as const){
  const response=await request.post(`http://127.0.0.1:8100/__test__/quality?scenario=${scenario}`);
  const {quality}=await response.json();
  await page.goto(localizedHref('/deals?offset=12',locale));
  const card=page.locator('.flight-offer-card').filter({has:page.locator(`a.deal-card-link[href^="${localizedHref('/deals/browser-13',locale)}"]`)});
  await expect(card).toHaveCount(1);
  await expect(card.locator('.deal-origin')).toContainText('WRO');
  await expect(card.locator('.deal-price')).toContainText(catalogText(locale,'za osobę · w obie strony'));
  await expect(card.locator('.card-cta')).toHaveText(new RegExp(catalogText(locale,'Zobacz szczegóły lotu')));
  await expect(card.locator('.price-summary')).toBeVisible();
  await expect(card.locator('.price-freshness > p').nth(1)).toBeVisible();
  await expect(card.locator('.card-cost-scope')).toBeVisible();
  await expect(card.locator('.trip-details')).not.toHaveAttribute('open','');
  if(scenario==='complete')await expect(card.locator('.flight-quality')).toHaveCount(0);
  else await expect(card.locator('.flight-quality')).toBeVisible();
  if(scenario==='critical')for(const reason of quality.reasons)
   await expect(card.locator('.flight-quality').getByText(qualityReasonText(locale,reason),{exact:true})).toBeVisible();
  expect((await new AxeBuilder({page}).include('.flight-offer-card').analyze()).violations).toEqual([]);
  if(locale==='pl')await card.screenshot({path:info.outputPath(`${scenario}.png`)});
  const summary=card.locator('.trip-details > summary');await summary.focus();await summary.press('Enter');
  await expect(card.locator('.flight-facts')).toBeVisible();
  await summary.press('Enter');
  if(scenario==='partial'){
   await page.setViewportSize({width:320,height:844});
   await card.locator('.deal-card-link h2').evaluate(el=>{el.textContent='Synthetic very long destination — Santiago de Compostela / Łódź / Подорож';});
   expect(await card.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 }
 const card=page.locator('.flight-offer-card').filter({has:page.locator(`a.deal-card-link[href^="${localizedHref('/deals/browser-13',locale)}"]`)});
 await card.locator('.card-cta').click();
 await expect(page).toHaveURL(new RegExp('/deals/browser-13(?:\\?|$)'));
});

test('an open card announces expiry without requiring technical details',async({page,request})=>{
 await page.clock.install({time:new Date()});
 const deals:Deal[]=await(await request.get('http://127.0.0.1:8100/api/v1/deals?origin=WRO')).json();
 const deal=deals[0],deadline=offerDeadline(deal);
 expect(deadline).toBeTruthy();
 await page.goto('/deals?origin=WRO');
 const card=page.locator('.flight-offer-card').filter({has:page.locator(`a.deal-card-link[href^="/deals/${deal.slug}?"]`)});
 await expect(card).toBeVisible();
 await page.clock.fastForward(Math.max(1,Date.parse(deadline!)-await page.evaluate(()=>Date.now())+1000));
 await expect(card.locator('.price-freshness')).toHaveAttribute('data-expired','true');
 await expect(card.locator('.price-expired')).toBeVisible();
 await expect(card.locator('.trip-details')).not.toHaveAttribute('open','');
});
