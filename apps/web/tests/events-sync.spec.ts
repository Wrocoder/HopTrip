import {test,expect,type Page,type Route} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {emptyBudget} from '../src/lib/trip-budget';

const region=(page:Page)=>page.getByRole('region',{name:'Wydarzenia w terminie podróży'});
const response=(end:string)=>({status:'READY',events:[{
 id:end,name:`Wydarzenie ${end}`,category:'MUSIC',venue:'Sala',city:'Barcelona',
 start_date:end,end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',
 url:'https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2F1',
 price_from:null,currency:null,
}],checked_at:null,partial:false});

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test('stay edits update budget, event search and restored/shared dates together',async({page},testInfo)=>{
 const calls:URL[]=[];
 await page.route('**/api/v1/deals/*/events?**',(route:Route)=>{
  const url=new URL(route.request().url());calls.push(url);
  return route.fulfill({json:response(url.searchParams.get('end_date')!)});
 });
 await page.goto('/deals/browser-13');
 await page.locator('#stay-checkin').fill('2026-10-27');
 await page.locator('#stay-checkout').fill('2026-10-29');
 await expect(region(page).getByText('Wydarzenie 2026-10-29',{exact:true})).toBeVisible();
 await page.locator('#budget-hotel').fill('200');
 await page.locator('#stay-checkout').fill('2026-10-30');
 await expect(page.locator('#budget-end')).toHaveValue('2026-10-30');
 await expect(page.locator('#budget-nights')).toHaveValue('3');
 await expect(page.locator('#budget-days')).toHaveValue('4');
 await expect(region(page).getByLabel('Do',{exact:true})).toHaveValue('2026-10-30');
 await expect(region(page).locator('p').filter({hasText:/^Twój pobyt/})).toContainText('30 paź');
 await expect(region(page).getByText('Wydarzenie 2026-10-30',{exact:true})).toBeVisible();
 expect(calls.at(-1)!.searchParams.get('date_mode')).toBe('stay');
 await page.reload();
 await expect(page.locator('#stay-checkout')).toHaveValue('2026-10-30');
 await expect(page.locator('#budget-hotel')).toHaveValue('200');
 await expect(region(page).getByText('Wydarzenie 2026-10-30',{exact:true})).toBeVisible();
 // Editing the synced event dates also edits the existing shared stay draft.
 await region(page).getByLabel('Do',{exact:true}).fill('2026-10-31');
 await expect(page.locator('#stay-checkout')).toHaveValue('2026-10-31');
 await expect(page.locator('#budget-nights')).toHaveValue('4');
 await expect(region(page).getByText('Wydarzenie 2026-10-31',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Udostępnij',exact:true}).click();
 await page.goto(await page.locator('#trip-share-link').inputValue());
 await expect(region(page).getByLabel('Do',{exact:true})).toHaveValue('2026-10-31');
 await expect(region(page).getByText('Wydarzenie 2026-10-31',{exact:true})).toBeVisible();
 await expect(page.locator('#budget-hotel')).toHaveValue('200');
 expect((await new AxeBuilder({page}).include('[aria-labelledby="trip-events-title"]').analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await region(page).screenshot({path:testInfo.outputPath('events-synced.png')});
});

test('other dates stay independent while use-trip-dates reads the latest stay',async({page})=>{
 const calls:URL[]=[];
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const url=new URL(route.request().url());calls.push(url);
  return route.fulfill({json:response(url.searchParams.get('end_date')!)});
 });
 await page.goto('/deals/browser-13');
 await page.locator('#stay-checkin').fill('2026-10-27');
 await page.locator('#stay-checkout').fill('2026-10-29');
 await expect(region(page).getByText('Wydarzenie 2026-10-29',{exact:true})).toBeVisible();
 await region(page).getByRole('button',{name:'Inne daty',exact:true}).click();
 await region(page).getByLabel('Do',{exact:true}).fill('2026-10-30');
 await expect(page.locator('#stay-checkout')).toHaveValue('2026-10-29');
 await expect(page.locator('#budget-nights')).toHaveValue('2');
 await region(page).getByRole('button',{name:'Pokaż wydarzenia',exact:true}).click();
 await expect(region(page).getByText('Wydarzenie 2026-10-30',{exact:true})).toBeVisible();
 expect(calls.at(-1)!.searchParams.get('date_mode')).toBe('other');
 // Stay changes do not overwrite an independent search or its results.
 await page.locator('#budget-end').fill('2026-10-31');
 await expect(region(page).getByLabel('Do',{exact:true})).toHaveValue('2026-10-30');
 await expect(region(page).locator('p').filter({hasText:/^Twój pobyt/})).toContainText('31 paź');
 await region(page).getByRole('button',{name:'Użyj dat podróży',exact:true}).click();
 await expect(region(page).getByLabel('Do',{exact:true})).toHaveValue('2026-10-31');
 await expect(region(page).getByText('Wydarzenie 2026-10-31',{exact:true})).toBeVisible();
 expect(calls.at(-1)!.searchParams.get('date_mode')).toBe('stay');
});

test('late responses cannot replace newer stay results even if fetch ignores abort',async({page})=>{
 await page.addInitScript(()=>{
  const original=window.fetch.bind(window);
  const deferred=window as typeof window & {oldStarted?:boolean;releaseOld?:()=>void};
  window.fetch=(input,init)=>{
   const url=new URL(typeof input==='string'?input:input instanceof Request?input.url:input.href,location.href);
   if(!url.pathname.endsWith('/events'))return original(input,init);
   const end=url.searchParams.get('end_date');
   const data={status:'READY',events:[{id:end,name:`Wydarzenie ${end}`,category:'MUSIC',venue:'Sala',city:'Barcelona',start_date:end,end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',url:'https://ticketmaster.evyy.net/c/7853869/123/456',price_from:null,currency:null}],checked_at:null,partial:false};
   const result=()=>new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
   if(end==='2026-10-29')return new Promise(resolve=>{deferred.oldStarted=true;deferred.releaseOld=()=>resolve(result());});
   return Promise.resolve(result());
  };
 });
 await page.goto('/deals/browser-13');
 await page.locator('#stay-checkin').fill('2026-10-27');
 await page.locator('#stay-checkout').fill('2026-10-29');
 await page.waitForFunction(()=>Boolean((window as typeof window & {oldStarted?:boolean}).oldStarted));
 await page.locator('#stay-checkout').fill('2026-10-30');
 await expect(region(page).getByText('Wydarzenie 2026-10-30',{exact:true})).toBeVisible();
 await page.evaluate(async()=>{
  (window as typeof window & {releaseOld:()=>void}).releaseOld();
  await new Promise(resolve=>setTimeout(resolve,0));
 });
 await expect(region(page).getByText('Wydarzenie 2026-10-29',{exact:true})).toHaveCount(0);
 await expect(region(page).getByText('Wydarzenie 2026-10-30',{exact:true})).toBeVisible();
});

test('restored dates are used for the first request and long stays are not truncated',async({page})=>{
 await page.addInitScript(input=>{
  localStorage.setItem('hoptrip.budget.v1:deal:browser-13',JSON.stringify({version:1,input,
   start:'2026-10-27',end:'2026-10-29',context:'restored-fixture',review:true,adultsOnly:true}));
 },{...emptyBudget,people:'1'});
 const calls:URL[]=[];
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const url=new URL(route.request().url());calls.push(url);
  return route.fulfill({json:response(url.searchParams.get('end_date')!)});
 });
 await page.goto('/deals/browser-13');
 await expect(region(page).getByText('Wydarzenie 2026-10-29',{exact:true})).toBeVisible();
 expect(calls[0].searchParams.get('end_date')).toBe('2026-10-29');
 await page.locator('#stay-checkout').fill('2026-12-05');
 await expect(region(page).getByLabel('Do',{exact:true})).toHaveValue('2026-12-05');
 await expect(region(page).getByText(/Wybierz poprawny okres do 31 dni/)).toBeVisible();
 await expect(region(page).getByRole('listitem')).toHaveCount(0);
 await expect(page.locator('#budget-nights')).toHaveValue('39');
 await region(page).getByRole('button',{name:'Inne daty',exact:true}).click();
 await region(page).getByLabel('Do',{exact:true}).fill('2026-10-30');
 await region(page).getByRole('button',{name:'Pokaż wydarzenia',exact:true}).click();
 await expect(region(page).getByText('Wydarzenie 2026-10-30',{exact:true})).toBeVisible();
 await expect(page.locator('#stay-checkout')).toHaveValue('2026-12-05');
 await expect(page.locator('#budget-nights')).toHaveValue('39');
});
