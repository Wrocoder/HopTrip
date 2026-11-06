import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';
import {shell} from '../src/lib/i18n/shell';

type WireEvent={event_name:string;deal_slug?:string;metadata:Record<string,unknown>};
test.setTimeout(60000);
test.beforeAll(async({request})=>{
 if(process.env.HOPTRIP_H3_PRODUCTION!=='1')return;
 const runner=readFileSync('playwright.config.ts','utf8');
 expect(runner).toContain('command:"npm run start --');expect(runner).toContain('NODE_ENV:"production"');expect(runner).not.toContain('reuseExistingServer:true');
 expect(await (await request.get('/deals')).text()).toContain(readFileSync('.next/BUILD_ID','utf8').trim());
});

async function setup(page:Page,allowed=true){
 await page.addInitScript(analytics=>{
  if(!localStorage.getItem('hoptrip.consent.v1'))localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics,marketing:false,at:Date.now()}));
 },allowed);
 const events:WireEvent[]=[],errors:string[]=[];
 page.on('request',request=>{if(request.url().endsWith('/api/v1/analytics/events')&&request.method()==='POST')events.push(request.postDataJSON());});
 page.on('pageerror',error=>errors.push(error.message));
 return {events,errors,opened:()=>events.filter(event=>event.event_name==='DEAL_DETAILS_OPEN')};
}

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: modal and native flight disclosures share one offer event per visit`,async({page})=>{
 const {events,errors,opened}=await setup(page);
 await page.goto(localizedHref('/deals',locale));await expect.poll(()=>events.filter(event=>event.event_name==='PAGE_VIEW').length).toBe(1);
 const card=page.locator('.deal-card').first(),trigger=card.locator('.score-trigger'),other=page.locator('.deal-card').nth(1);
 const slug=new URL((await card.locator('.deal-card-link').getAttribute('href'))!,'http://localhost').pathname.split('/').at(-1)!;
 expect(opened()).toEqual([]);
 const accepted=page.waitForResponse(response=>response.url().endsWith('/api/v1/analytics/events')&&response.request().postDataJSON().event_name==='DEAL_DETAILS_OPEN');
 await trigger.focus();await page.keyboard.press('Enter');await expect(page.getByRole('dialog')).toBeVisible();expect((await accepted).status()).toBe(202);
 await expect.poll(()=>opened().length).toBe(1);expect(opened()[0].deal_slug).toBe(slug);expect(opened()[0].metadata).toEqual({page_type:'catalog',locale});
 expect(Object.keys(opened()[0]).sort()).toEqual(['anonymous_session_id','deal_slug','event_id','event_name','metadata']);
 await page.getByRole('dialog').locator('.score-calculation > summary').click();await expect(page.getByRole('dialog').locator('.score-sum')).toBeVisible();
 await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
 await trigger.click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(trigger).toBeFocused();
 const summary=card.locator('.trip-details > summary');await summary.focus();await page.keyboard.press('Enter');await expect(card.locator('.trip-details')).toHaveAttribute('open','');
 expect(opened()).toHaveLength(1);expect(events.filter(event=>event.event_name==='DEAL_VIEW')).toHaveLength(0);
 expect((await new AxeBuilder({page}).include('.trip-details[open]').analyze()).violations).toEqual([]);
 await other.locator('.trip-details > summary').click();await expect.poll(()=>opened().length).toBe(2);
 expect(opened()[1].deal_slug).not.toBe(slug);
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await card.locator('.deal-card-link').click();await expect.poll(()=>events.filter(event=>event.event_name==='DEAL_VIEW'&&event.deal_slug===slug).length).toBe(1);
 expect(opened()).toHaveLength(2);await page.locator('.trip-details > summary').click();await expect.poll(()=>opened().length).toBe(3);
 expect(opened()[2].metadata).toEqual({page_type:'deal',locale});expect(errors).toEqual([]);
});

test('direct score calculation is a disclosure; visit and closure are separate',async({page})=>{
 const {events,errors,opened}=await setup(page);await page.goto('/deals/browser-deal');
 await expect.poll(()=>events.filter(event=>event.event_name==='DEAL_VIEW').length).toBe(1);expect(opened()).toEqual([]);
 const summary=page.locator('#score .score-calculation > summary');await summary.focus();await page.keyboard.press('Enter');
 await expect(page.locator('#score .score-sum')).toBeVisible();await expect.poll(()=>opened().length).toBe(1);
 await page.keyboard.press('Enter');await expect(page.locator('#score .score-sum')).not.toBeVisible();
 await page.locator('.trip-details > summary').click();await expect(page.locator('.trip-details')).toHaveAttribute('open','');
 expect(opened()).toHaveLength(1);expect(errors).toEqual([]);
});

test('denial/revocation prevent sends; consent grant does not replay already open panels',async({page})=>{
 const {events,errors,opened}=await setup(page,false);await page.goto('/deals');
 await page.getByRole('button',{name:shell.pl.settings,exact:true}).click();await page.getByRole('button',{name:shell.pl.reject,exact:true}).click();
 const card=page.locator('.deal-card').first(),summary=card.locator('.trip-details > summary'),trigger=card.locator('.score-trigger');
 await summary.click();await expect(card.locator('.trip-details')).toHaveAttribute('open','');
 await trigger.click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');expect(opened()).toEqual([]);
 await page.getByRole('button',{name:shell.pl.settings,exact:true}).click();await page.locator('.consent-panel input[type=checkbox]').first().check();await page.getByRole('button',{name:shell.pl.save,exact:true}).click();
 await expect.poll(()=>events.filter(event=>event.event_name==='PAGE_VIEW').length).toBe(1);expect(opened()).toEqual([]);
 await summary.click();await expect(card.locator('.trip-details')).not.toHaveAttribute('open','');await summary.click();await expect.poll(()=>opened().length).toBe(1);
 await page.getByRole('button',{name:shell.pl.settings,exact:true}).click();await page.getByRole('button',{name:shell.pl.reject,exact:true}).click();
 await page.locator('.deal-card').nth(1).locator('.trip-details > summary').click();await expect(page.locator('.deal-card').nth(1).locator('.trip-details')).toHaveAttribute('open','');
 expect(opened()).toHaveLength(1);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();expect(errors).toEqual([]);
});

test('blocked analytics preserves native toggles, modal Escape and focus without retries',async({page})=>{
 const {events,errors,opened}=await setup(page);await page.goto('/deals');await expect.poll(()=>events.filter(event=>event.event_name==='PAGE_VIEW').length).toBe(1);
 await page.route('**/api/v1/analytics/events',async route=>{if(route.request().postDataJSON().event_name==='DEAL_DETAILS_OPEN')await route.abort('blockedbyclient');else await route.continue();});
 const card=page.locator('.deal-card').first(),summary=card.locator('.trip-details > summary'),trigger=card.locator('.score-trigger');
 await summary.click();await expect(card.locator('.trip-details')).toHaveAttribute('open','');await expect.poll(()=>opened().length).toBe(1);
 await summary.click();await expect(card.locator('.trip-details')).not.toHaveAttribute('open','');await trigger.click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');await expect(trigger).toBeFocused();expect(opened()).toHaveLength(1);expect(errors).toEqual([]);
});

test('server-rendered disclosures and score anchor work with JavaScript disabled',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:'http://127.0.0.1:3100'});
 try{
  const page=await context.newPage(),events:string[]=[];page.on('request',request=>{if(request.url().includes('/analytics/events'))events.push(request.url());});
  await page.goto('/deals');const card=page.locator('.deal-card').first();await card.locator('.trip-details > summary').click();await expect(card.locator('.trip-details .price-samples')).toBeVisible();
  await card.locator('.score-trigger').click();await expect(page).toHaveURL(/\/deals\/[^/]+#score$/);await expect(page.locator('#score')).toBeVisible();
  const calculation=page.locator('#score .score-calculation > summary');await calculation.focus();await expect(calculation).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('#score .score-sum')).toBeVisible();expect(events).toEqual([]);
 }finally{await context.close();}
});
