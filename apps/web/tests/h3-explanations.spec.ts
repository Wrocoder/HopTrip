import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile} from 'node:fs/promises';
import {localizedHref} from '../src/lib/i18n/routing';
import {scoreText} from '../src/lib/i18n/score-copy';
const before=process.env.HOPTRIP_EXPLANATIONS_PHASE==='before';
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: price explanations before/after, one and many offers`,async({page},info)=>{
 test.setTimeout(120000);const metrics=[],viewport=page.viewportSize()!;
 for(const count of [1,12]){
  await page.setViewportSize(viewport);
  await page.goto(localizedHref(count===1?'/deals?budget=200.25':'/deals',locale));await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.deal-card')).toHaveCount(count);
  const card=page.locator('.deal-card').first(),grouping=scoreText(locale,'grouping');
  const repeated=await page.locator('.deal-grid').evaluate((el,text)=>[...el.querySelectorAll('p')].filter(p=>p.textContent===text).length,grouping);
  expect(repeated).toBe(before?count*3:0);
  for(const p of await page.locator('.deal-grid').getByText(grouping,{exact:true}).all())expect(await p.isVisible()).toBe(false);
  const collapsedHeight=(await card.boundingBox())!.height;
  await expect(card.locator('.card-cost-scope')).toBeVisible();await expect(card.locator('.price-freshness')).toBeVisible();
  await card.locator('.trip-details > summary').focus();await page.keyboard.press('Enter');
  await expect(card.locator('.trip-details .price-samples')).toBeVisible();await expect(card.locator('.trip-details .price-observation time')).toBeVisible();
  if(before){await card.locator('.trip-details .price-assessment details > summary').click();await expect(card.locator('.trip-details .price-assessment').getByText(grouping,{exact:true})).toBeVisible();}
  else{await expect(card.locator('.price-methodology-link')).toHaveAttribute('href',localizedHref('/info/price-comparison',locale));await expect(card.locator('.price-assessment details')).toHaveCount(0);}
  const expandedHeight=(await card.boundingBox())!.height;
  if(count===1)await card.screenshot({path:info.outputPath(`card-${before?'before':'after'}.png`)});
  await card.locator('.trip-details > summary').focus();await page.keyboard.press('Enter');
  const trigger=card.locator('.score-trigger');await trigger.focus();await page.keyboard.press('Enter');
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  const dialogHeight=(await dialog.boundingBox())!.height;
  const methodControls=await dialog.locator('.price-assessment details > summary,.score-method:not(.score-calculation) > summary').count();
  expect(methodControls).toBe(before?2:0);
  await expect(dialog.locator('.price-comparison')).toBeVisible();await expect(dialog.locator('.price-samples')).toContainText('24');
  await dialog.locator('.score-calculation > summary').focus();await page.keyboard.press('Enter');await expect(dialog.locator('.score-sum')).toContainText('76/100');
  if(!before){expect((await new AxeBuilder({page}).include('dialog[open]').analyze()).violations).toEqual([]);await expect(dialog.locator('a[href*="/info/price-comparison"]')).toHaveCount(1);}
  if(count===1)await dialog.screenshot({path:info.outputPath(`dialog-${before?'before':'after'}.png`)});
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
  metrics.push({locale,project:info.project.name,count,collapsedHeight,expandedHeight,dialogHeight,methodControls,repeated});
  if(!before){
   await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await card.locator('.trip-details > summary').click();await card.locator('.price-methodology-link').focus();await page.keyboard.press('Enter');
   await expect(page.locator('main')).toContainText(grouping);await expect(page.locator('main')).toContainText(scoreText(locale,'exclusions'));
   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new URL(localizedHref('/info/price-comparison',locale),info.project.use.baseURL).href);
   await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
  }
 }
 await writeFile(info.outputPath('metrics.json'),JSON.stringify(metrics));
});
