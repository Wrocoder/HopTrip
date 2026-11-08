import {test,expect,type Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';
import {shell} from '../src/lib/i18n/shell';

type Event={event_name:string;anonymous_session_id:string;metadata:{locale:string;page_type:string;campaign?:string};source?:string};
test.use({locale:'de-DE'});
test.skip(process.env.HOPTRIP_H3_PRODUCTION!=='1','Requires an isolated production fixture');
test.beforeAll(async({request},info)=>{
 const runner=readFileSync(info.config.configFile!,'utf8');expect(runner).toContain('npm run start --');expect(runner).toContain("NODE_ENV:'production'");expect(runner).not.toContain('reuseExistingServer:true');
 expect(await (await request.get('/saved')).text()).toContain(readFileSync('.next/BUILD_ID','utf8').trim());
});
async function capture(page:Page,analytics=true){
 await page.addInitScript(analytics=>{if(!localStorage.getItem('hoptrip.consent.v1'))localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics,marketing:false,at:Date.now()}));},analytics);
 const events:Event[]=[],statuses:number[]=[],errors:string[]=[];
 page.on('request',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.method()==='POST')events.push(r.postDataJSON());});
 page.on('response',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.request().method()==='POST')statuses.push(r.status());});
 page.on('pageerror',e=>errors.push(e.message));
 const flush=async()=>{await expect.poll(()=>statuses.length===events.length).toBe(true);expect(statuses.every(s=>s===202)).toBe(true);expect(errors).toEqual([]);};
 return {events,errors,flush};
}
test('wire language follows rendered routes and the language switcher, independently of browser language',async({page},info)=>{
 const {events,flush}=await capture(page);
 for(const [index,locale] of (['pl','en','ru','uk'] as const).entries()){
  await page.goto(localizedHref('/saved?utm_source=newsletter&utm_campaign=test&private=synthetic-secret',locale));await expect(page.locator('html')).toHaveAttribute('lang',locale);await expect.poll(()=>events.length).toBe(index+1);await flush();
  expect(events[index].metadata).toEqual({page_type:'saved',campaign:'test',locale,viewport:expect.stringMatching(/^(small|medium|large)$/)});expect(events[index].source).toBe('newsletter');
 }
 await page.locator('.language-switcher a[lang="en"]').click();await expect(page.locator('html')).toHaveAttribute('lang','en');await expect.poll(()=>events.length).toBe(5);await flush();
 expect(events[4].metadata.locale).toBe('en');expect(await page.evaluate(()=>navigator.language)).toBe('de-DE');
 expect(new Set(events.map(e=>e.anonymous_session_id)).size).toBe(1);expect(events.every(e=>e.event_name==='PAGE_VIEW')).toBe(true);expect(JSON.stringify(events)).not.toMatch(/synthetic-secret|userAgent|Accept-Language|navigator/);
 writeFileSync(info.outputPath('locale.json'),JSON.stringify({renderedAndWireLanguages:events.map(e=>e.metadata.locale),browserLanguage:'de-DE',distinctSessions:1,statuses:202},null,2));
});
test('denial and revocation suppress language metadata; grant records only the current page',async({page},info)=>{
 const {events,flush}=await capture(page,false);await page.goto('/ru/saved');await expect(page.locator('.privacy-settings')).toBeVisible();expect(events).toEqual([]);
 await page.getByRole('button',{name:shell.ru.settings,exact:true}).click();await page.locator('.consent-panel input').first().check();await page.getByRole('button',{name:shell.ru.save,exact:true}).click();await expect.poll(()=>events.length).toBe(1);await flush();expect(events[0].metadata.locale).toBe('ru');
 await page.goto('/uk/saved');await expect.poll(()=>events.length).toBe(2);await flush();expect(events[1].metadata.locale).toBe('uk');expect(events[1].anonymous_session_id).toBe(events[0].anonymous_session_id);
 await page.getByRole('button',{name:shell.uk.settings,exact:true}).click();await page.getByRole('button',{name:shell.uk.reject,exact:true}).click();await expect.poll(()=>page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
 await page.goto('/en/saved');await expect(page.locator('.privacy-settings')).toBeVisible();expect(events).toHaveLength(2);
 writeFileSync(info.outputPath('consent.json'),JSON.stringify({deniedEvents:0,grantLanguage:'ru',afterNavigation:'uk',revokedEvents:0,noReplay:true},null,2));
});
test('blocked language analytics stays best effort and preserves navigation and session',async({page},info)=>{
 const {events,errors}=await capture(page);await page.route('**/api/v1/analytics/events',route=>route.abort('failed'));
 await page.goto('/en/saved');await expect.poll(()=>events.length).toBe(1);expect(events[0].metadata.locale).toBe('en');
 await page.getByRole('button',{name:shell.en.settings,exact:true}).click();await page.getByRole('button',{name:shell.en.save,exact:true}).click();await expect(page.locator('.consent-panel')).toHaveCount(0);expect(events).toHaveLength(1);
 await page.goto('/uk/saved');await expect.poll(()=>events.length).toBe(2);expect(events[1].metadata.locale).toBe('uk');expect(events[1].anonymous_session_id).toBe(events[0].anonymous_session_id);expect(errors).toEqual([]);
 writeFileSync(info.outputPath('blocked.json'),JSON.stringify({attempts:2,noRetry:true,navigationWorks:true,distinctSessions:1},null,2));
});
