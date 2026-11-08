import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';
import {budgetText} from '../src/lib/i18n/budget-copy';
import {localizedHref} from '../src/lib/i18n/routing';
import {shell} from '../src/lib/i18n/shell';
import {costFields,emptyBudget} from '../src/lib/trip-budget';
import {encodeTrip} from '../src/lib/shared-trip';

type Locale='pl'|'en'|'ru'|'uk';
type WireEvent={event_name:string;metadata:Record<string,unknown>};
test.setTimeout(60000);
test.beforeAll(async({request},info)=>{
 if(process.env.HOPTRIP_H3_PRODUCTION!=='1')return;
 const runner=readFileSync(info.config.configFile!,'utf8');expect(runner).toContain('npm run start --');expect(runner).toContain("NODE_ENV:'production'");expect(runner).not.toContain('reuseExistingServer:true');
 expect(await (await request.get('/info/trip-budget')).text()).toContain(readFileSync('.next/BUILD_ID','utf8').trim());
});

async function setup(page:Page,analytics=true){
 await page.addInitScript(analytics=>{if(!localStorage.getItem('hoptrip.consent.v1'))localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics,marketing:false,at:Date.now()}));},analytics);
 const events:WireEvent[]=[],errors:string[]=[];
 page.on('request',request=>{if(request.url().endsWith('/api/v1/analytics/events')&&request.method()==='POST')events.push(request.postDataJSON());});
 page.on('pageerror',error=>errors.push(error.message));
 return {events,errors,completed:()=>events.filter(event=>event.event_name==='BUDGET_CALCULATED')};
}
const summary=(page:Page,locale:Locale='pl')=>page.getByText(budgetText(locale,'Rozbicie kosztów całej grupy'),{exact:true});
async function toggle(page:Page,open:boolean,locale:Locale='pl'){
 const control=summary(page,locale);await control.focus();await expect(control).toBeFocused();await page.keyboard.press('Enter');
 if(open)await expect(control.locator('..')).toHaveAttribute('open','');else await expect(control.locator('..')).not.toHaveAttribute('open','');
}
async function fillComplete(page:Page,locale:Locale='pl'){
 await expect(page.locator('#budget-flight')).toBeEnabled();
 await page.getByRole('button',{name:budgetText(locale,'Szczegółowy budżet'),exact:true}).click();
 for(const field of costFields)await page.locator('#budget-'+field.key).fill('0');
}

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: explicit complete breakdown counts once; input/reload/restore do not auto-complete`,async({page},info)=>{
 const {events,errors,completed}=await setup(page);await page.goto(localizedHref('/info/trip-budget',locale));
 await fillComplete(page,locale);expect(completed()).toEqual([]);
 await expect(page.locator('#calculator [role=status]')).not.toContainText(budgetText(locale,'Budżet niepełny. Do uzupełnienia:'));
 const accepted=page.waitForResponse(response=>response.url().endsWith('/api/v1/analytics/events')&&response.request().postDataJSON().event_name==='BUDGET_CALCULATED');
 await toggle(page,true,locale);expect((await accepted).status()).toBe(202);await expect.poll(()=>completed().length).toBe(1);
 expect(completed()[0].metadata).toEqual({page_type:'budget',locale,viewport:expect.stringMatching(/^(small|medium|large)$/)});expect(Object.keys(completed()[0]).sort()).toEqual(['anonymous_session_id','event_id','event_name','metadata']);
 expect(events.filter(event=>event.event_name==='BUDGET_USE')).toHaveLength(1);
 await toggle(page,false,locale);await toggle(page,true,locale);expect(completed()).toHaveLength(1);
 expect((await new AxeBuilder({page}).include('#calculator').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='ru')await page.locator('#calculator').screenshot({path:info.outputPath('complete-budget-320.png'),animations:'disabled'});
 await page.reload();await expect(page.locator('#budget-food')).toHaveValue('0');await expect(page.locator('#budget-food')).toBeEnabled();expect(completed()).toHaveLength(1);
 await toggle(page,true,locale);await expect.poll(()=>completed().length).toBe(2);expect(errors).toEqual([]);
});

test('partial/open calculations, invalid values/dates and unreviewed changes do not complete',async({page})=>{
 const {completed,errors}=await setup(page);await page.goto('/info/trip-budget');await expect(page.locator('#budget-flight')).toBeEnabled();
 await page.locator('#budget-flight').fill('100');await toggle(page,true);expect(completed()).toEqual([]);
 await fillComplete(page);await expect(summary(page).locator('..')).toHaveAttribute('open','');expect(completed()).toEqual([]);
 await page.locator('#budget-food').fill('-1');await expect(summary(page)).toHaveCount(0);expect(completed()).toEqual([]);
 await page.locator('#budget-food').fill('0');await page.locator('#budget-start').fill('2030-05-03');await page.locator('#budget-end').fill('2030-05-01');await expect(summary(page)).toHaveCount(0);
 await page.locator('#budget-end').fill('2030-05-05');await expect(page.getByTestId('budget-review')).toBeVisible();await toggle(page,true);expect(completed()).toEqual([]);
 await page.getByRole('button',{name:budgetText('pl','Kwoty sprawdzone dla tego planu'),exact:true}).click();await expect(page.getByTestId('budget-review')).toHaveCount(0);expect(completed()).toEqual([]);
 await toggle(page,false);await toggle(page,true);await expect.poll(()=>completed().length).toBe(1);expect(errors).toEqual([]);
});

test('denial/revocation suppress completion and grant does not replay the open breakdown',async({page})=>{
 const {events,completed,errors}=await setup(page,false);await page.goto('/info/trip-budget');await fillComplete(page);await toggle(page,true);expect(completed()).toEqual([]);
 await page.getByRole('button',{name:shell.pl.settings,exact:true}).click();await page.locator('.consent-panel input[type=checkbox]').first().check();await page.getByRole('button',{name:shell.pl.save,exact:true}).click();
 await expect.poll(()=>events.filter(event=>event.event_name==='PAGE_VIEW').length).toBe(1);expect(completed()).toEqual([]);
 await toggle(page,false);await toggle(page,true);await expect.poll(()=>completed().length).toBe(1);
 await page.getByRole('button',{name:shell.pl.settings,exact:true}).click();await page.getByRole('button',{name:shell.pl.reject,exact:true}).click();
 await page.reload();await expect(page.locator('#budget-food')).toBeEnabled();await toggle(page,true);expect(completed()).toHaveLength(1);
 expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();expect(errors).toEqual([]);
});

test('blocked analytics leaves calculation and breakdown usable without retries',async({page})=>{
 const {completed,errors}=await setup(page);await page.goto('/info/trip-budget');await fillComplete(page);
 await page.route('**/api/v1/analytics/events',async route=>{if(route.request().postDataJSON().event_name==='BUDGET_CALCULATED')await route.abort('blockedbyclient');else await route.continue();});
 await toggle(page,true);await expect.poll(()=>completed().length).toBe(1);await expect(page.getByTestId('budget-total')).toBeVisible();
 await toggle(page,false);await toggle(page,true);expect(completed()).toHaveLength(1);expect(errors).toEqual([]);
});

test('a restored shared plan with unknown ticket price stays incomplete and exposes no plan data',async({page})=>{
 const {completed,errors}=await setup(page);
 const input={...emptyBudget,...Object.fromEntries(costFields.map(field=>[field.key,'0']))};
 const ticket={id:'private-ticket',name:'Private synthetic event',venue:'Private venue',date:'2030-05-02',time:null,timezone:'Europe/Warsaw',url:'https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.pl%2Fevent%2Fsynthetic',quantity:'1',unitPricePln:''};
 const token=encodeTrip({version:1,offer:{slug:'browser-deal',origin:'WRO',destination:'Barcelona',start:'2030-05-01',end:'2030-05-03',price:'0',observedAt:''},draft:{version:1,input,start:'2030-05-01',end:'2030-05-03',context:'',review:false,events:[ticket]}})!;
 expect(token).toBeTruthy();await page.goto('/trip#plan='+token);await expect(page.locator('#budget-food')).toBeEnabled();expect(completed()).toEqual([]);
 await page.getByRole('button',{name:budgetText('pl','Kwoty sprawdzone dla tego planu'),exact:true}).click();await expect(page.getByTestId('budget-review')).toHaveCount(0);
 await toggle(page,true);expect(completed()).toEqual([]);await page.locator('#planned-private-ticket-price').fill('0');await expect(summary(page).locator('..')).toHaveAttribute('open','');expect(completed()).toEqual([]);
 await toggle(page,false);await toggle(page,true);await expect.poll(()=>completed().length).toBe(1);
 expect(completed()[0].metadata).toEqual({page_type:'saved_trip',locale:'pl',viewport:expect.stringMatching(/^(small|medium|large)$/)});expect(Object.keys(completed()[0]).sort()).toEqual(['anonymous_session_id','event_id','event_name','metadata']);
 expect(JSON.stringify(completed())).not.toMatch(/private|Private|token|plan=|deal_slug|total|quantity|price/);expect(JSON.stringify(completed())).not.toContain(token);expect(errors).toEqual([]);
});
