import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('round trips show catalogue events automatically',async({page})=>{
 let calls=0;
 await page.route('**/api/v1/deals/browser-13/events?**',route=>{
  calls++;
  return route.fulfill({json:{status:'EMPTY',events:[],partial:false,checked_at:null}});
 });
 await page.goto('/deals/browser-13');
 const section=page.getByRole('region',{name:'Wydarzenia w terminie podróży'});
 await expect(section.getByText(/Nie znaleźliśmy pasujących ofert/)).toBeVisible();
 expect(calls).toBeGreaterThan(0);
});

test('events are fetched on demand with affiliate links and reset when dates change',async({page,context},testInfo)=>{
 let calls=0;
 await context.route('https://ticketmaster.evyy.net/**',route=>route.fulfill({body:'Local ticket fixture'}));
 await page.route('**/api/v1/deals/*/events?**',route=>{
  calls++;
  const params=new URL(route.request().url()).searchParams;
  return route.fulfill({json:{status:'READY',partial:true,checked_at:new Date().toISOString(),events:[{
   id:'fixture',name:'Fixture concert',category:'MUSIC',venue:'Fixture venue',city:'Barcelona',
   start_date:params.get('start_date'),end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',
   status:'onsale',price_from:null,currency:null,
   url:'https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Ffixture',
  }]}});
 });
 await page.goto('/deals/browser-deal');
 await page.getByRole('button',{name:'Odrzuć opcjonalne'}).click();
 const section=page.getByRole('region',{name:'Wydarzenia w terminie podróży'});
 await expect(section).toBeVisible();expect(calls).toBe(0);
 await section.getByRole('button',{name:'Inne daty',exact:true}).click();
 const start=await section.getByLabel('Od',{exact:true}).inputValue();
 await section.getByLabel('Do',{exact:true}).fill(start);
 await section.getByRole('button',{name:'Pokaż wydarzenia'}).click();
 await expect(section.getByText('Fixture concert',{exact:true})).toBeVisible();
 await expect(section.getByText('Cena do sprawdzenia u sprzedawcy')).toBeVisible();
 await expect(section.getByRole('link')).toHaveAttribute('rel',/sponsored/);
 expect(calls).toBe(1);
 const violations=(await new AxeBuilder({page}).include('[aria-labelledby="trip-events-title"]').analyze()).violations;
 expect(violations).toEqual([]);
 await section.screenshot({path:testInfo.outputPath('trip-events.png')});
 await section.getByLabel('Kategoria').selectOption('SPORTS');
 await expect(section.getByText('Fixture concert',{exact:true})).toHaveCount(0);
 const width=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth}));
 expect(width.page).toBeLessThanOrEqual(width.viewport);
});

test('provider failure keeps the flight page usable; empty results have no ticket links',async({page})=>{
 let fail=true;
 await page.route('**/api/v1/deals/*/events?**',route=>route.fulfill({json:{status:fail?'UNAVAILABLE':'EMPTY',events:[],partial:false,checked_at:null}}));
 await page.goto('/deals/browser-deal');
 await page.getByRole('button',{name:'Odrzuć opcjonalne'}).click();
 const section=page.getByRole('region',{name:'Wydarzenia w terminie podróży'});
 await section.getByRole('button',{name:'Inne daty',exact:true}).click();
 await section.getByLabel('Do',{exact:true}).fill(await section.getByLabel('Od',{exact:true}).inputValue());
 await section.getByRole('button',{name:'Pokaż wydarzenia'}).click();
 await expect(section.getByText(/Wydarzenia są chwilowo niedostępne/)).toBeVisible();
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
 fail=false;
 await section.getByRole('button',{name:/Spróbuj ponownie/}).click();
 await expect(section.getByText(/Nie znaleźliśmy pasujących ofert/)).toBeVisible();
 await expect(section.locator('a[href^="https://ticketmaster.evyy.net/"]')).toHaveCount(0);
 await expect(section.getByRole('button',{name:'Zmień okres wyszukiwania'})).toBeVisible();
});
