import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
for(const locale of ['pl','en'] as const)test(`${locale}: price, actual return and primary booking action fit the first screen`,async({page},info)=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:info.project.name==='mobile'?390:1440,height:info.project.name==='mobile'?844:1000});
 await page.goto(localizedHref('/deals/partner-airport-check-fixture',locale));
 await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 const price=page.locator('.detail-summary .deal-price'),cta=page.locator('.booking-card a.cta');
 const returnArrival=page.locator('.detail-summary .home-arrival');
 const measurement={viewport:page.viewportSize(),price:await price.boundingBox(),cta:await cta.boundingBox(),arrival:await returnArrival.boundingBox()};
 writeFileSync(info.outputPath('first-screen.json'),JSON.stringify(measurement,null,2));
 await page.screenshot({path:info.outputPath(`first-screen-${locale}.png`),scale:'css'});
 await expect(price).toBeInViewport({ratio:1});
 await expect(returnArrival).toBeInViewport({ratio:1});
 await expect(cta).toBeInViewport({ratio:1});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
