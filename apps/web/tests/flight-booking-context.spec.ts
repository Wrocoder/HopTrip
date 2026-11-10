import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: open-jaw airports are visible at booking and editing guests does not rewrite the flight ticket`,async({page},info)=>{
 await page.goto(localizedHref('/deals/partner-airport-check-fixture',locale));
 const warning=page.getByTestId('flight-airport-check');
 await expect(warning).toBeVisible();
 await expect(warning).toContainText('WRO → STN; LTN → WRO');
 const cta=page.locator('.booking-card a.cta'),before=await cta.getAttribute('href');
 await page.locator('#stay-adults').fill('2');
 await expect(cta).toHaveAttribute('href',before!);
 await expect(page.getByTestId('flight-search-limitation')).toContainText('2');
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('.booking-card').analyze()).violations).toEqual([]);
 await page.locator('.booking-card').screenshot({path:info.outputPath(`airport-check-${locale}-320.png`)});
});
