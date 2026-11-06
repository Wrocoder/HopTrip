import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {timelineCopy} from '../src/lib/trip-timeline';
const expected={
 pl:{scope:'Cena dotyczy lotu. Nocleg nie jest wliczony.',baggage:'Bagaż do sprawdzenia',old:'Bez noclegu'},
 en:{scope:'The price covers the flight. Accommodation is not included.',baggage:'Check baggage allowance',old:'Accommodation excluded · check baggage'},
 ru:{scope:'Цена указана за перелёт. Проживание не включено.',baggage:'Багаж нужно уточнить',old:'Без жилья'},
 uk:{scope:'Ціну вказано за переліт. Проживання не включено.',baggage:'Багаж слід уточнити',old:'Без житла'},
};
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));});
test.afterEach(async({request})=>{await request.post('http://127.0.0.1:8100/__test__/weekend-fixtures?enabled=false');});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: flight price excludes accommodation for 0, 1 and 3 nights`,async({page,request},info)=>{
 test.setTimeout(90000);
 const copy=expected[locale];
 for(const nights of [0,1,3]){
  expect((await request.post(`http://127.0.0.1:8100/__test__/weekend-fixtures?enabled=true&nights=${nights}`)).ok()).toBe(true);
  await page.goto(localizedHref('/deals?destination=weekend-fixture',locale));
  const card=page.locator('.deal-card');await expect(card).toHaveCount(1);
  await expect(card.locator('.card-cost-scope')).toHaveText(copy.scope);
  await expect(card.locator('.card-baggage-scope')).toHaveText(copy.baggage);
  await expect(card).toContainText(`${timelineCopy[locale].nights}: ${nights}`);
  await expect(card).not.toContainText(copy.old);
  if(nights===3){
   expect((await new AxeBuilder({page}).include('.deal-grid').analyze()).violations).toEqual([]);
   await page.setViewportSize({width:320,height:844});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await card.screenshot({path:info.outputPath('inclusion-card-320.png')});
  }
  await card.locator('a.deal-card-link').click();
  await expect(page.locator('.detail-summary .flight-cost-scope')).toHaveText(copy.scope);
  await expect(page.locator('.detail-summary .flight-baggage-scope')).toHaveText(copy.baggage);
  await expect(page.locator('.page-heading')).toContainText(`${timelineCopy[locale].nights}: ${nights}`);
  await expect(page.locator('.detail-summary')).not.toContainText(copy.old);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
