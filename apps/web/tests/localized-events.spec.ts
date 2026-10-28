import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {plannedEventsCopy} from '../src/lib/i18n/planned-events-copy';
import {budgetText} from '../src/lib/i18n/budget-copy';
import {tripText} from '../src/lib/i18n/trip-copy';

for(const locale of ['en','ru','uk'] as const){
 test(`events and their budget remain translated and shareable in ${locale}`,async({page,browser})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  await page.route('**/api/v1/deals/*/events?**',route=>route.fulfill({json:{status:'READY',partial:false,checked_at:null,events:[{
   id:'translated-concert',name:'Test concert',category:'MUSIC',venue:'OVO Arena Wembley',city:'London',
   start_date:new URL(route.request().url()).searchParams.get('start_date'),end_date:null,local_time:'19:00:00',timezone:'Europe/London',status:'onsale',
   url:'https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.co.uk%2Fevent%2Ftest',price_from:null,currency:null,
  }]}}));
  const copy=plannedEventsCopy[locale];
  await page.goto(`/${locale}/deals/browser-13`);
  await page.locator('#budget-flight').fill('100');
  await page.locator('#trip-events').getByRole('button',{name:`${copy.add}: Test concert`,exact:true}).click();
  const selected=page.locator('#planned-events');
  await expect(selected.getByRole('heading',{level:3})).toHaveText(copy.title);
  await expect(selected).toContainText(copy.unknown);
  await expect(page.locator('#calculator')).toContainText(copy.budgetLine);
  await page.getByText(budgetText(locale,'Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa'),{exact:true}).click();
  await expect(page.locator('#budget-activities-hint')).toHaveText(copy.remaining);
  await selected.getByLabel(copy.quantity,{exact:true}).fill('2');
  await selected.getByLabel(copy.unitPrice,{exact:true}).fill('120.29');
  await expect(page.getByTestId('budget-total')).toHaveText(/340[,.]58/);
  await page.getByText(budgetText(locale,'Rozbicie kosztów całej grupy'),{exact:true}).click();
  await expect(page.locator('#calculator dt').filter({hasText:copy.budgetLine})).toHaveCount(1);
  await expect(page.locator('#calculator dt').filter({hasText:'Wydarzenia w planie'})).toHaveCount(0);
  await page.reload();
  await expect(selected.getByLabel(copy.unitPrice,{exact:true})).toHaveValue('120.29');
  await expect(page.getByTestId('budget-total')).toHaveText(/340[,.]58/);
  await page.getByRole('button',{name:tripText(locale,'Udostępnij'),exact:true}).click();
  const link=await page.locator('#trip-share-link').inputValue();
  expect(new URL(link).pathname).toBe(`/${locale}/trip`);
  const recipient=await browser.newContext({viewport:{width:320,height:850}});
  try{
   const other=await recipient.newPage();
   await other.goto(link);
   await expect(other.locator('#planned-events h3')).toHaveText(copy.title);
   await expect(other.getByTestId('budget-total')).toHaveText(/340[,.]58/);
   await expect(other.locator('#planned-events').getByLabel(copy.quantity,{exact:true})).toHaveValue('2');
   expect((await new AxeBuilder({page:other}).include('#calculator').analyze()).violations).toEqual([]);
   expect(await other.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }finally{await recipient.close();}
  expect(errors).toEqual([]);
 });
}
