import {test,expect} from '@playwright/test';
import {emptyBudget} from '../src/lib/trip-budget';
import {budgetText} from '../src/lib/i18n/budget-copy';

test('321 PLN, travellers and selected tickets survive an invalid date, reload and language changes',async({page})=>{
 test.setTimeout(60000);
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(input=>{
  const key='hoptrip.budget.v1:deal:browser-13';
  if(localStorage.getItem(key))return;
  localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
  localStorage.setItem(key,JSON.stringify({version:1,input,start:'2028-02-28',end:'2028-03-01',context:'legacy',review:false,adultsOnly:true,
   events:[{id:'recovery',name:'Recovery concert',venue:'Venue',date:'2028-02-29',time:'20:00',timezone:'Europe/London',quantity:'2',unitPricePln:'50',
    url:'https://ticketmaster.evyy.net/c/7853869/1958975/23899?u=https%3A%2F%2Fwww.ticketmaster.co.uk%2Fevent%2Frecovery'}]}));
 },{...emptyBudget,people:'3',nights:'2',days:'3'});
 await page.route('**/api/v1/deals/*/events?**',route=>route.fulfill({json:{status:'EMPTY',events:[],checked_at:null,partial:false}}));
 await page.goto('/deals/browser-13');
 await page.locator('#budget-hotel').fill('321');
 await page.locator('#budget-start').fill('10000-01-01');
 await page.reload();
 const message='Przywrócono kwoty, podróżnych i wydarzenia. Popraw daty pobytu, aby wznowić obliczenia i wyszukiwanie.';
 for(const [locale,name] of [['pl','Polski'],['en','English'],['ru','Русский'],['uk','Українська']] as const){
  if(locale!=='pl')await page.locator('.language-switcher').getByRole('link',{name,exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  await expect(page.getByText(budgetText(locale,message),{exact:true})).toBeVisible();
  await expect(page.locator('#budget-hotel')).toHaveValue('321');
  await expect(page.locator('#budget-people')).toHaveValue('3');
  await expect(page.locator('#budget-start')).toHaveValue('10000-01-01');
  await expect(page.getByRole('heading',{name:'Recovery concert',exact:true})).toBeVisible();
  await expect(page.getByTestId('budget-total')).toHaveCount(0);
 }
 await page.locator('#budget-start').fill('2028-02-29');
 await expect(page.locator('#budget-nights')).toHaveValue('1');
 await expect(page.getByTestId('budget-total')).toBeVisible();
 await page.reload();
 await expect(page.locator('#budget-hotel')).toHaveValue('321');
 await expect(page.locator('#budget-start')).toHaveValue('2028-02-29');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('hoptrip.budget.v1:deal:browser-13')!));
 expect(saved.input.people).toBe('3');expect(saved.events[0].quantity).toBe('2');expect(saved.events[0].unitPricePln).toBe('50');
 expect(errors).toEqual([]);
});
