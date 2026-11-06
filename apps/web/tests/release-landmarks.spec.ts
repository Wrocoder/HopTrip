import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync,readFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';

test.skip(process.env.HOPTRIP_H3_PRODUCTION!=='1','Release checks require the isolated production fixture');
test.beforeAll(async({request})=>{
 expect(readFileSync('playwright.config.ts','utf8')).toContain('command:"npm run start --');
 expect(await (await request.get('/deals')).text()).toContain(readFileSync('.next/BUILD_ID','utf8').trim());
});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: two keyboard-open offer disclosures have no duplicate landmarks`,async({page},info)=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.goto(localizedHref('/deals',locale));const cards=page.locator('.deal-card');await expect.poll(()=>cards.count()).toBeGreaterThanOrEqual(2);
 for(const index of [0,1]){const details=cards.nth(index).locator('.trip-details');await details.locator('summary').first().focus();await page.keyboard.press('Enter');await expect(details).toHaveAttribute('open','');}
 const audit=await new AxeBuilder({page}).include('.trip-details[open]').analyze();
 writeFileSync(info.outputPath('landmarks.json'),JSON.stringify({locale,violations:audit.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}))},null,2));
 expect(audit.violations).toEqual([]);
 for(const index of [0,1])await expect(cards.nth(index).locator('.trip-details-content > section[role="group"]')).toHaveCount(2);
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
