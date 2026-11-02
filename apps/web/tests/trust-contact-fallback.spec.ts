import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {serviceLabels} from '../src/lib/i18n/service-content';

// Run against an isolated Next process with HOPTRIP_OPERATOR_FILE pointing to a
// nonexistent test file. Do not change a user's real runtime operator configuration.
const missing=process.env.HOPTRIP_TEST_OPERATOR_MODE==='missing';
test(`${missing?'missing':'configured'} operator contact is explained without inventing identity`,async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:320,height:740});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 for(const locale of ['pl','en','ru','uk'] as const){
  await page.goto(localizedHref('/info/contact',locale));
  const region=page.getByRole('region',{name:serviceLabels[locale].contact});
  if(missing){
   await expect(region.getByRole('alert')).toHaveText(serviceLabels[locale].unavailable);
   await expect(region.locator('a[href^="mailto:"]')).toHaveCount(0);
   await expect(page.getByRole('main')).not.toContainText('contact@example.test');
  }else{
   await expect(region.getByRole('alert')).toHaveCount(0);
   await expect(region.getByRole('link')).toHaveAttribute('href','mailto:contact@example.test');
  }
  await expect(region).toHaveAttribute('data-nosnippet');
  await expect(page.getByRole('main')).not.toContainText(/Example Test Operator|Example Street|Test Country/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
  expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
