import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync,writeFileSync} from 'node:fs';
import config from '../playwright.config';
import {localizedHref} from '../src/lib/i18n/routing';
import {weekendCopy} from '../src/lib/weekend';
import {tripText} from '../src/lib/i18n/trip-copy';

const production=process.env.HOPTRIP_H3_PRODUCTION==='1';
test.beforeEach(async({page,request},info)=>{
 const runners=config.webServer;
 if(!Array.isArray(runners))throw new Error('Expected fixture servers');
 await info.attach('execution-mode',{body:JSON.stringify({command:runners[1].command,nodeEnv:runners[1].env?.NODE_ENV??null,productionRequired:production}),contentType:'application/json'});
 if(production){
  const servers=config.webServer;if(!Array.isArray(servers))throw new Error('Expected fixture servers');
  expect(servers[1].command).toContain('npm run start --');expect(servers[1].env?.NODE_ENV).toBe('production');
  const buildId=readFileSync('.next/BUILD_ID','utf8').trim();expect(buildId).toBeTruthy();
  const response=await request.get('/deals');expect(response.status()).toBe(200);expect(await response.text()).toContain(buildId);
 }
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: initial price and seller CTA stay usable across target widths with all filter explanations intact`,async({page},info)=>{
 test.setTimeout(180000);const wc=weekendCopy[locale],rows=[];
 for(const width of [320,375,390,768,1024,1100,1366,1440]){
  await page.setViewportSize({width,height:900});await page.goto(localizedHref('/deals',locale));await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  const price=page.locator('.deal-card .deal-price').first(),cta=page.locator('.deal-card .card-cta').first();await expect(price).toBeVisible();
  const catalog=await price.evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,scrollY,viewport:innerHeight};});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(width>=1366){expect(catalog.scrollY).toBe(0);expect(catalog.top).toBeGreaterThanOrEqual(0);expect(catalog.bottom).toBeLessThanOrEqual(900);await expect(price).toBeInViewport({ratio:1});await expect(cta).toBeInViewport({ratio:1});}
  const group=page.locator('.weekend-options');await expect(group.locator('legend')).toHaveText(wc.mode);await expect(group.getByRole('combobox',{name:wc.mode,exact:true})).toBeVisible();await expect(group.locator('#weekend-rules')).toHaveText(wc.rules);await expect(group.locator('#weekend-rules')).toBeVisible();
  const controlHeights=await page.locator('.filter-panel :is(input:not([type="hidden"]),select,button,summary)').evaluateAll(controls=>controls.filter(el=>el.getClientRects().length>0).map(el=>el.getBoundingClientRect().height));expect(controlHeights.every(height=>height>=44)).toBe(true);
  if(width===1366)await page.screenshot({path:info.outputPath('catalog-first-screen.png'),scale:'css',animations:'disabled'});
  if(width===320||width===1366){
   await group.getByRole('combobox',{name:wc.mode,exact:true}).selectOption('no-leave-v1');await expect(group.getByLabel(wc.start,{exact:true})).toBeVisible();await expect(group.getByLabel(wc.end,{exact:true})).toBeVisible();await expect(group.getByText(wc.assumption,{exact:true})).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await group.getByRole('combobox',{name:wc.mode,exact:true}).selectOption('');
   const advanced=page.locator('.advanced-filters');await advanced.locator('summary').focus();await page.keyboard.press('Enter');await expect(advanced).toHaveAttribute('open','');await expect(advanced.locator('input[name="departure_from"]')).toBeVisible();await advanced.locator('summary').press('Enter');await expect(advanced).not.toHaveAttribute('open','');
   const help=page.locator('.preset-rules');await help.locator('summary').focus();await page.keyboard.press('Enter');await expect(help.locator('.sort-explanation')).toBeVisible();await help.locator('summary').press('Enter');
   expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
  }
  await page.goto(localizedHref('/deals/browser-deal?returnTo='+encodeURIComponent('/deals?origin=WRO&sort=price&offset=12'),locale));await expect(page.locator('#budget-people')).toBeEnabled();await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  if(production)await expect(page.locator('nextjs-portal')).toHaveCount(0);
  const partner=page.locator('#trip-booking a.cta');await expect(partner).toBeVisible();const detail=await partner.evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,scrollY,viewport:innerHeight};});
  if(width>=1366){expect(detail.scrollY).toBe(0);expect(detail.top).toBeGreaterThanOrEqual(0);expect(detail.bottom).toBeLessThanOrEqual(900);await expect(partner).toBeInViewport({ratio:1});}
  if(width===1366)await page.screenshot({path:info.outputPath('detail-first-screen.png'),scale:'css',animations:'disabled'});
  await page.evaluate(()=>{location.hash='trip-booking';});await expect(page.locator('#trip-booking')).toBeFocused();await expect(partner).toBeInViewport({ratio:1});expect(detail.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('#trip-booking')).toContainText(tripText(locale,'Przejście do partnera'));
  if(width===320||width===1366)expect((await new AxeBuilder({page}).include('.detail-layout').include('.trip-navigation').analyze()).violations).toEqual([]);
  rows.push({locale,project:info.project.name,width,height:900,catalog,detail});
 }
 writeFileSync(info.outputPath('geometry.json'),JSON.stringify(rows,null,2)+'\n');
});
