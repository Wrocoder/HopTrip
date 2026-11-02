import {test,expect,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';
import {savedTripsKey} from '../src/lib/shared-trip';

async function fit(control:Locator) {
 await control.scrollIntoViewIfNeeded();
 const r=await control.boundingBox();expect(r!.x).toBeGreaterThanOrEqual(-1);
 expect(r!.width).toBeGreaterThan(0);expect(r!.height).toBeGreaterThanOrEqual(44);
 expect(await control.evaluate(el=>el.getBoundingClientRect().right<=innerWidth+1)).toBe(true);
 const probe=()=>control.evaluate(el=>{
  const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
  return{reachable:hit===el||!!hit&&el.contains(hit),field:el.getAttribute('name')??el.id,hit:hit?.outerHTML.slice(0,300),top:r.top,bottom:r.bottom,viewport:innerHeight};
 });
 try{await expect.poll(async()=>(await probe()).reachable).toBe(true);}
 catch{throw new Error('Unreachable control: '+JSON.stringify(await probe()));}
}

for(const width of [320,375,390,768,1440])test.describe(`${width}px`,()=>{
 test.use({viewport:{width,height:844},hasTouch:width<1000,isMobile:width<1000,deviceScaleFactor:1});
 for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: mobile discovery, planning and return context`,async({page,request},info)=>{
  test.setTimeout(120000);
  await page.addInitScript(()=>{
   localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
   Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('test-only clipboard fallback');}}});
  });
  const activate=async(control:Locator)=>width<1000?control.tap():control.click();
  const metrics:unknown[]=[];
  const overflow=async(state:string)=>{
   const size=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
   metrics.push({state,...size});expect(size.document).toBeLessThanOrEqual(size.viewport);
  };
  const dealResponse=await request.get('http://127.0.0.1:8100/api/v1/deals/browser-deal');expect(dealResponse.ok()).toBe(true);
  const deal=await dealResponse.json(),start=deal.trip_start as string;
  const endDate=new Date(`${start}T12:00:00Z`);endDate.setUTCDate(endDate.getUTCDate()+2);const end=endDate.toISOString().slice(0,10);
  await page.goto(localizedHref('/?origin=WRO',locale));
  for(const link of await page.locator('.site-nav a,.language-switcher a').all())await fit(link);
  const hero=page.locator('.hero-search'),origin=hero.locator('input[name="origin"]'),destination=hero.locator('input[name="destination"]');
  await origin.fill('WRO');await origin.press('ArrowDown');await origin.press('Enter');
  await destination.fill('Barcelona');await destination.press('ArrowDown');await destination.press('ArrowDown');await destination.press('Enter');
  await expect(destination).toHaveAttribute('data-destination-slug','barcelona');
  await hero.locator('input[name="departure_from"]').fill(start);await hero.locator('input[name="departure_to"]').fill(start);
  await hero.locator('input[name="budget"]').fill('500');
  await activate(hero.locator('.advanced-filters > summary'));
  await expect(hero.locator('.advanced-filters')).toHaveAttribute('open','');
  for(const field of await hero.locator('input:not([type="hidden"])').all()){
   await fit(field);expect(await field.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  }
  await overflow('home');if(locale==='pl')await hero.screenshot({path:info.outputPath(`home-${width}.png`),scale:'css',animations:'disabled'});
  await activate(hero.locator('button[type="submit"]'));
  await page.waitForURL(/\/deals\?/);await expect(page.locator('.sort-control select')).toBeEnabled();
  const selected={origin:'WRO',destination:'barcelona',departure_from:start,departure_to:start,budget:'500'};
  for(const [key,value] of Object.entries(selected))expect(new URL(page.url()).searchParams.get(key)).toBe(value);
  const sort=page.locator('.sort-control select');await sort.selectOption('price');await expect(page).toHaveURL(/sort=price/);
  const applied=new URL(page.url());
  for(const field of await page.locator('.filters input:not([type="hidden"]),.filters select').all())if(await field.isVisible())await fit(field);
  await overflow('catalog');
  const card=page.locator('.deal-card').filter({has:page.locator(`a.deal-card-link[href^="${localizedHref('/deals/browser-deal?',locale)}"]`)});
  await expect(card).toHaveCount(1);const trigger=card.locator('.score-trigger');await trigger.focus();await page.keyboard.press('Enter');
  const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();
  await fit(dialog.locator('.score-close'));const box=await dialog.boundingBox();expect(box!.height).toBeLessThanOrEqual(844);expect(box!.x+box!.width).toBeLessThanOrEqual(width+1);
  await page.keyboard.press('Escape');await expect(trigger).toBeFocused();await activate(card.locator('.deal-card-link'));
  await page.waitForURL(/\/deals\/browser-deal\?/);
  await expect(page.locator('#budget-start')).toBeEnabled();await fit(page.locator('.back-link'));await overflow('detail');
  for(const id of ['trip-booking','accommodation','trip-events','calculator']){
   const link=page.locator(`.trip-navigation a[href="#${id}"]`);await link.focus();await page.keyboard.press('Enter');await expect(page.locator('#'+id)).toBeFocused();
  }
  await fit(page.locator('#trip-booking .cta'));const sellerHref=await page.locator('#trip-booking .cta').getAttribute('href');
  await page.locator('#stay-checkin').fill(start);await page.locator('#stay-checkout').fill(end);
  await page.locator('#budget-people').fill('2');await page.locator('#budget-flight').fill('123,45');
  await page.locator('#budget-hotel-basis').selectOption('stay');await page.locator('#budget-hotel_total').fill('400');
  await page.locator('#budget-food').fill('0');await page.locator('#budget-transfers').fill('0');
  await expect(page.getByTestId('budget-total')).toContainText(/646[,.]90/);
  await expect(page.locator('#budget-end')).toHaveValue(end);await expect(page.locator('#budget-nights')).toHaveValue('2');
  await expect(page.locator('#trip-events input[type="date"]').nth(1)).toHaveValue(end);
  await expect(page.locator('#trip-booking .cta')).toHaveAttribute('href',sellerHref!);
  // A shorter viewport checks occlusion/reachability; this does not summon an OS keyboard.
  await page.setViewportSize({width,height:400});
  for(const field of [page.locator('#stay-checkout'),page.locator('#budget-hotel-basis'),page.locator('#budget-flight')]){
   const value=await field.inputValue();await field.focus();await fit(field);await field.press('Escape');await expect(field).toHaveValue(value);
  }
  await expect(page.locator('#budget-flight')).toHaveAttribute('inputmode','decimal');await overflow('short-viewport');
  await page.setViewportSize({width,height:844});
  const actions=page.locator('#trip-save .trip-actions button');await activate(actions.nth(0));
  await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)??'[]').length,savedTripsKey)).toBe(1);
  await activate(actions.nth(1));const shared=page.locator('#trip-share-link');await expect(shared).toHaveValue(/\/trip\?plan=/);await fit(shared);
  if(width===320||width===1440)expect((await new AxeBuilder({page}).include('.site-header').include('#calculator').include('#accommodation').include('#trip-events').analyze()).violations).toEqual([]);
  if(locale==='pl')await page.locator('#calculator').screenshot({path:info.outputPath(`calculator-${width}.png`),scale:'css',animations:'disabled'});
  await page.reload();await expect(page.locator('#budget-flight')).toHaveValue('123,45');await expect(page.getByTestId('budget-total')).toContainText(/646[,.]90/);
  await activate(page.locator('.back-link'));await expect(page).toHaveURL(applied.href);
  for(const [key,value] of Object.entries(selected))expect(new URL(page.url()).searchParams.get(key)).toBe(value);
  await page.goBack();await expect(page.locator('#budget-flight')).toHaveValue('123,45');await expect(page.locator('#budget-end')).toHaveValue(end);
  await page.goForward();await expect(page).toHaveURL(applied.href);await overflow('return');
  writeFileSync(info.outputPath(`workflow-${locale}-${width}.json`),JSON.stringify(metrics,null,2));
 });
});
