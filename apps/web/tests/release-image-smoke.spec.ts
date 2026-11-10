import {test as base,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';
import {budgetText} from '../src/lib/i18n/budget-copy';
import {tripText} from '../src/lib/i18n/trip-copy';

// The unmodified production-origin bundle is exercised on loopback. Contain
// every browser request so this suite cannot send analytics to production.
const test=base.extend({context:async({context},provide)=>{
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(['127.0.0.1','localhost'].includes(url.hostname))return route.continue();
  if(url.origin!=='https://hoptrip.pl')return route.abort();
  const api=/^\/(?:api\/|go\/|__test__\/)/.test(url.pathname);
  const response=await route.fetch({url:`http://127.0.0.1:${api?8100:3100}${url.pathname}${url.search}`,maxRedirects:0});
  if(url.pathname.startsWith('/go/')){
   expect(response.status()).toBe(307);
   return route.fulfill({status:200,contentType:'text/html',body:'<h1>Local redirect captured</h1>'});
  }
  await route.fulfill({response});
 });
 await provide(context);
}});
test.setTimeout(90000);
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: image catalog, keyboard disclosures, budget and saved persistence`,async({page},info)=>{
 const errors:string[]=[],analytics:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',r=>{if(r.url().endsWith('/api/v1/analytics/events'))analytics.push(r.url());});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 for(let visit=0;visit<3;visit++){
  await page.goto(localizedHref('/deals',locale));
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  await expect(page.locator('.deal-card').first()).toBeVisible();
  await expect(page.locator('main [data-state="error"]')).toHaveCount(0);
 }
 const card=page.locator('.deal-card').first(),trigger=card.locator('.score-trigger');
 await trigger.focus();await page.keyboard.press('Enter');await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
 await card.locator('.trip-details > summary').focus();await page.keyboard.press('Enter');await expect(card.locator('.trip-details')).toHaveAttribute('open','');
 await card.locator('.deal-card-link').click();
 await expect(page.locator('#trip-flight')).toBeVisible();await expect(page.locator('#trip-stay')).toBeAttached();
 await expect(page.locator('.booking-card a.cta')).toHaveAttribute('href',/^https:\/\/hoptrip\.pl\/go\//);
 await page.getByRole('button',{name:budgetText(locale,'Szczegółowy budżet'),exact:true}).click();
 await expect(page.locator('#budget-hotel')).toHaveValue('');
 await page.locator('#budget-people').fill('2');await page.locator('#budget-food').fill('47');
 await page.getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true}).click();
 await expect(page).toHaveURL(/\/trip#local=/);
 await expect(page.locator('#budget-food')).toHaveValue('47');await expect(page.locator('#budget-people')).toHaveValue('2');
 await page.reload();await expect(page.locator('#budget-food')).toHaveValue('47');
 expect(analytics).toEqual([]);expect(errors).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const audit=await new AxeBuilder({page}).analyze();expect(audit.violations).toEqual([]);
 await expect(page.getByRole('banner')).toHaveCount(1);await expect(page.locator('main h1')).toHaveCount(1);
 await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.screenshot({path:info.outputPath('viewport.png'),scale:'css',animations:'disabled'});
 await page.screenshot({path:info.outputPath('saved.png'),fullPage:true,scale:'css',animations:'disabled'});
 writeFileSync(info.outputPath('journey.json'),JSON.stringify({locale,synthetic:true,real_user_session:false,analytics_denied_requests:analytics.length,errors,axe_violations:audit.violations},null,2));
});
test('consented image search-to-flight journey reaches the received ordered funnel',async({page,request},info)=>{
 const start=new Date(Date.now()-500).toISOString();
 const posted:{event_id:string;event_name:string;search?:{filters?:{budget?:string};result_count?:number}}[]=[];
 const accepted=new Set<string>();
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:true,marketing:false,at:Date.now()})));
 page.on('request',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.method()==='POST')posted.push(r.postDataJSON());});
 page.on('response',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.status()===202)accepted.add(r.request().postDataJSON().event_id);});
 await page.goto('/deals?utm_source=test&utm_campaign=test');
 await expect.poll(()=>posted.some(e=>e.event_name==='PAGE_VIEW')).toBe(true);
 await page.locator('input[name="budget"]').fill('300');await page.locator('.filters button[type="submit"]').click();
 await expect.poll(()=>posted.some(e=>e.event_name==='SEARCH_RESULT'&&e.search?.filters?.budget==='300'&&(e.search.result_count??0)>0)).toBe(true);
 await page.locator('.deal-card').first().locator('.deal-card-link').click();
 await expect.poll(()=>posted.some(e=>e.event_name==='DEAL_VIEW')).toBe(true);
 await page.locator('.booking-card a.cta').click();await expect(page.locator('h1')).toHaveText('Local redirect captured');
 // A keepalive POST can be stored even when the old document no longer emits
 // a browser response event. The required contract is the received funnel.
 let snapshotUrl='';
 let usage={observed_sessions:0,observed_events:0,excluded_events:0,ordered_funnel:{steps:[] as {sessions:number}[]}};
 const headers={'X-Admin-Token':'local-stage-admin-secret-20261110'};
 await expect.poll(async()=>{
  const response=await request.get('http://127.0.0.1:8100/api/v1/admin/analytics/usage',{headers,params:{start,end:new Date(Date.now()+500).toISOString()}});
  expect(response.status()).toBe(200);snapshotUrl=response.url();usage=await response.json();
  return usage.ordered_funnel.steps.map(s=>s.sessions);
 }).toEqual([1,1,1,1,1]);
 expect(usage.observed_sessions).toBe(1);
 expect(usage.excluded_events).toBe(1);
 const stored=posted.find(e=>accepted.has(e.event_id));expect(stored).toBeDefined();
 const duplicate=await request.post('http://127.0.0.1:8100/api/v1/analytics/events',{data:stored!});expect(duplicate.status()).toBe(202);
 const after=await(await request.get(snapshotUrl,{headers})).json();
 expect(after.observed_events).toBe(usage.observed_events);
 writeFileSync(info.outputPath('funnel.json'),JSON.stringify({synthetic:true,real_user_metrics:false,duplicate_preserved_count:true,client_attempts:posted.length,client_response_events:accepted.size,usage},null,2));
});
test('four-locale container catalog remains available for 120 SSR responses',async({request},info)=>{
 const rows:{index:number;locale:string;status:number;cards:number;error:boolean}[]=[];
 for(let index=0;index<120;index++){
  const locale=['pl','en','ru','uk'][index%4],r=await request.get(locale==='pl'?'/deals':`/${locale}/deals`),html=await r.text();
  rows.push({index,locale,status:r.status(),cards:(html.match(/class="deal-card flight-offer-card"/g)??[]).length,error:html.includes('data-state="error"')});
 }
 writeFileSync(info.outputPath('catalog.json'),JSON.stringify({synthetic:true,rows},null,2));
 expect(rows.filter(r=>r.status!==200||!r.cards||r.error)).toEqual([]);
});
