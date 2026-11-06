import {test,expect} from '@playwright/test';
import {localizedHref} from '../src/lib/i18n/routing';
import {timelineCopy} from '../src/lib/trip-timeline';
import {encodeTrip} from '../src/lib/shared-trip';
import {emptyBudget} from '../src/lib/trip-budget';
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: card detail and saved plan agree on unknown return`,async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.goto(localizedHref('/deals?origin=WRO&budget=220&sort=price&offset=12',locale));
 const card=page.locator('.deal-card').filter({has:page.locator('a.deal-card-link[href*="/deals/browser-13"]')});
 await expect(card.locator('.home-arrival')).toHaveText(timelineCopy[locale].returnUnknown);
 await page.goto(localizedHref('/deals/browser-13',locale));
 await expect(page.locator('.detail-summary .home-arrival')).toHaveText(timelineCopy[locale].returnUnknown);
 const token=encodeTrip({version:1,offer:{slug:'browser-13',origin:'Wrocław',destination:'Barcelona',start:'2090-01-15',end:'2090-01-17',price:'213',observedAt:''},
  draft:{version:1,input:{...emptyBudget,hotel:'123'},start:'2090-01-15',end:'2090-01-17',context:'',review:true}});
 expect(token).not.toBeNull();
 await page.goto(localizedHref(`/trip?plan=${token}`,locale));
 await expect(page.locator('.flight-schedule-compact .home-arrival')).toHaveText(timelineCopy[locale].returnUnknown);
 await expect(page.locator('.timeline-nights')).toContainText(timelineCopy[locale].nights);
 await expect(page.locator('#budget-hotel')).toHaveValue('123');
 await expect(page.locator('#budget-start')).toHaveValue('2090-01-15');
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
