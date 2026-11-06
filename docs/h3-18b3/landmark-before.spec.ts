// Diagnostic only. Copy into the preserved H3-18b2 workspace's tests directory.
import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync,readFileSync} from 'node:fs';
test('pre-change two-card landmarks reproduce without disclosure tracking',async({page},info)=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.goto('/deals');await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
 for(const index of [0,1]){const details=page.locator('.deal-card').nth(index).locator('.trip-details');await details.locator(':scope > summary').click();await expect(details).toHaveAttribute('open','');}
 const axe=await new AxeBuilder({page}).include('.trip-details[open]').analyze();
 expect(axe.violations.map(row=>row.id)).toEqual(['landmark-unique']);
 writeFileSync('../../../../docs/h3-18b3/landmark-before-'+info.project.name+'.json',JSON.stringify({build:readFileSync('.next/BUILD_ID','utf8').trim(),violations:axe.violations},null,2));
});
