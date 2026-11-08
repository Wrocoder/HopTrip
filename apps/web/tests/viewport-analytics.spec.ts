import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {localizedHref} from '../src/lib/i18n/routing';

type Event={event_name:string;anonymous_session_id:string;metadata:Record<string,string>};
test.setTimeout(90000);
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: measured viewport stays bounded, consented and independent of session identity`,async({page})=>{
 await page.setViewportSize({width:390,height:900});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:true,marketing:false,at:Date.now()})));
 const events:Event[]=[],statuses:number[]=[],errors:string[]=[];
 page.on('request',r=>{if(r.url().endsWith('/api/v1/analytics/events')){events.push(r.postDataJSON());expect(r.headers().referer ?? '').toBe('');}});
 page.on('response',r=>{if(r.url().endsWith('/api/v1/analytics/events'))statuses.push(r.status());});
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(localizedHref('/saved?email=private@example.test#token=private-token',locale));
 await expect.poll(()=>events.filter(e=>e.event_name==='PAGE_VIEW').length).toBe(1);
 expect(events[0].metadata).toEqual({page_type:'saved',locale,viewport:'small'});
 await page.setViewportSize({width:768,height:900});
 expect(events.filter(e=>e.event_name==='PAGE_VIEW')).toHaveLength(1);
 await page.goto(localizedHref('/info/trip-budget',locale));
 await expect.poll(()=>events.filter(e=>e.event_name==='PAGE_VIEW').length).toBe(2);
 expect(events.filter(e=>e.event_name==='PAGE_VIEW')[1].metadata.viewport).toBe('medium');
 await page.setViewportSize({width:1440,height:900});await page.goto(localizedHref('/destinations',locale));
 await expect.poll(()=>events.filter(e=>e.event_name==='PAGE_VIEW').length).toBe(3);
 expect(events.filter(e=>e.event_name==='PAGE_VIEW')[2].metadata.viewport).toBe('large');
 expect(new Set(events.map(e=>e.anonymous_session_id)).size).toBe(1);
 expect(JSON.stringify(events)).not.toMatch(/private|email|token|innerWidth|userAgent|screen|1440/);
 await expect.poll(()=>statuses.length).toBe(events.length);expect(statuses.every(status=>status===202)).toBe(true);expect(errors).toEqual([]);
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: synthetic viewport dashboard is readable, keyboard-scrollable and accessible`,async({page},info)=>{
 const html=readFileSync(path.resolve('../../.cache/v4-12-reports',`dashboard-${locale}.html`),'utf8');
 await page.setContent(html);await expect(page.locator('html')).toHaveAttribute('lang',locale);
 const section=page.locator('[data-viewport-cohorts]');await expect(section.locator('table')).toHaveCount(2);await expect(section.locator('tbody tr')).toHaveCount(8);
 for(const width of [320,375,390,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:900});const scroller=section.locator('[role="region"]').first();
 await scroller.focus();await expect(scroller).toBeFocused();await page.keyboard.press('ArrowRight');await expect.poll(()=>scroller.evaluate(node=>node.scrollLeft)).toBeGreaterThan(0);
 if(locale==='ru'){await page.setViewportSize({width:1440,height:1000});await section.screenshot({path:info.outputPath('viewport-dashboard-ru.png'),scale:'css'});}
});
