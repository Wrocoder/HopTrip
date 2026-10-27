import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test('day navigation and pagination reach later events without editing the trip',async({page},testInfo)=>{
 const calls:URLSearchParams[]=[];
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const p=new URL(route.request().url()).searchParams;calls.push(p);
  const day=p.get('event_date'),pageNumber=Number(p.get('page')??1);
  const empty=day==='2026-10-29';
  const total=empty?0:day==='2026-10-30'?1:13;
  const count=total===13?(pageNumber===1?12:1):total;
  return route.fulfill({json:{status:count?'READY':'EMPTY',checked_at:null,partial:false,
   total,page:pageNumber,page_size:12,has_more:total===13&&pageNumber===1,
   events:Array.from({length:count},(_,i)=>({id:`${day??'all'}-${pageNumber}-${i}`,
    name:day==='2026-10-30'?'Koncert ostatniego dnia':pageNumber===2?'Trzynaste wydarzenie':`Koncert ${i+1}`,
    category:'MUSIC',venue:'Sala',city:'London',start_date:day??p.get('start_date'),end_date:null,
    local_time:'20:00:00',timezone:'Europe/London',status:'onsale',price_from:null,currency:null,
    url:'https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.co.uk%2Fevent%2Ffixture'}))}});
 });
 await page.goto('/deals/browser-13');
 await page.locator('#stay-checkin').fill('2026-10-27');
 await page.locator('#stay-checkout').fill('2026-10-30');
 const section=page.locator('#trip-events'),days=section.getByLabel('Przeglądaj dni');
 await expect(section.getByRole('heading',{level:3})).toHaveCount(12);
 await expect(section.getByRole('status')).toContainText('1–12 z 13');
 await section.getByRole('button',{name:'Następna strona',exact:true}).click();
 await expect(section.getByRole('heading',{name:'Trzynaste wydarzenie',exact:true})).toBeVisible();
 await expect(section.getByRole('status')).toContainText('13–13 z 13');
 await expect(section.getByRole('button',{name:'Następna strona',exact:true})).toBeDisabled();
 await days.selectOption('2026-10-28');
 await expect(section.getByRole('heading',{level:3})).toHaveCount(12);
 expect(calls.at(-1)?.get('page')).toBe('1');
 expect(calls.at(-1)?.get('start_date')).toBe('2026-10-27');
 expect(calls.at(-1)?.get('end_date')).toBe('2026-10-30');
 await section.getByRole('button',{name:'Następny dzień',exact:true}).click();
 await expect(days).toHaveValue('2026-10-29');
 await expect(section.getByRole('heading',{name:'Co możesz zrobić dalej?'})).toBeVisible();
 await section.getByRole('button',{name:'Następny dzień',exact:true}).click();
 await expect(section.getByRole('heading',{name:'Koncert ostatniego dnia',exact:true})).toBeVisible();
 await expect(days).toHaveValue('2026-10-30');
 await expect(section.getByRole('button',{name:'Następny dzień',exact:true})).toBeDisabled();
 await expect(page.locator('#stay-checkin')).toHaveValue('2026-10-27');
 await expect(page.locator('#stay-checkout')).toHaveValue('2026-10-30');
 await expect(page.locator('#budget-nights')).toHaveValue('3');
 await section.getByLabel('Kategoria').selectOption('SPORTS');
 await expect(days).toHaveValue('');
 await expect.poll(()=>calls.at(-1)?.get('category')).toBe('SPORTS');
 expect(calls.at(-1)?.get('page')).toBe('1');
 expect(calls.at(-1)?.has('event_date')).toBe(false);
 expect((await new AxeBuilder({page}).include('#trip-events').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});
 await days.selectOption('2026-10-30');
 await expect(section.getByRole('heading',{name:'Koncert ostatniego dnia',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await section.screenshot({path:testInfo.outputPath('event-days-320.png')});
 // Changing shared dates resets the selected day and page; it cannot retain an out-of-range day.
 await page.locator('#stay-checkout').fill('2026-10-28');
 await expect(days).toHaveValue('');
 await expect.poll(()=>calls.at(-1)?.get('end_date')).toBe('2026-10-28');
 await expect(days.locator('option[value="2026-10-30"]')).toHaveCount(0);
});

test('late day responses cannot replace a newly selected day even when fetch ignores abort',async({page})=>{
 await page.addInitScript(()=>{
  const original=window.fetch.bind(window);
  const deferred=window as typeof window & {oldDayStarted?:boolean;releaseOldDay?:()=>void};
  window.fetch=(input,init)=>{
   const url=new URL(typeof input==='string'?input:input instanceof Request?input.url:input.href,location.href);
   if(!url.pathname.endsWith('/events'))return original(input,init);
   const day=url.searchParams.get('event_date')??'all';
   const result=()=>new Response(JSON.stringify({status:'READY',partial:false,total:1,has_more:false,checked_at:null,
    events:[{id:day,name:`Dzień ${day}`,category:'MUSIC',venue:'Sala',city:'Barcelona',start_date:url.searchParams.get('start_date'),end_date:null,
     local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',url:'https://ticketmaster.evyy.net/c/7853869/123/456',price_from:null,currency:null}]}),{status:200});
   if(day==='2026-10-28')return new Promise(resolve=>{deferred.oldDayStarted=true;deferred.releaseOldDay=()=>resolve(result());});
   return Promise.resolve(result());
  };
 });
 await page.goto('/deals/browser-13');
 await page.locator('#stay-checkin').fill('2026-10-27');
 await page.locator('#stay-checkout').fill('2026-10-30');
 const section=page.locator('#trip-events'),days=section.getByLabel('Przeglądaj dni');
 await days.selectOption('2026-10-28');
 await page.waitForFunction(()=>Boolean((window as typeof window & {oldDayStarted?:boolean}).oldDayStarted));
 await days.selectOption('2026-10-30');
 await expect(section.getByRole('heading',{name:'Dzień 2026-10-30',exact:true})).toBeVisible();
 await page.evaluate(async()=>{
  (window as typeof window & {releaseOldDay:()=>void}).releaseOldDay();
  await new Promise(resolve=>setTimeout(resolve,0));
 });
 await expect(section.getByRole('heading',{name:'Dzień 2026-10-28',exact:true})).toHaveCount(0);
 await expect(section.getByRole('heading',{name:'Dzień 2026-10-30',exact:true})).toBeVisible();
});
