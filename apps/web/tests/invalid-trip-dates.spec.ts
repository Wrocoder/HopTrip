import {test,expect} from '@playwright/test';
import {dateCopy} from '../src/lib/i18n/date-copy';

for(const locale of ['pl','en','ru','uk'] as const){
 test(`${locale}: all six shared date fields recover from a five-digit year`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const requests:URL[]=[];
  await page.route('**/api/v1/deals/*/events?**',route=>{
   requests.push(new URL(route.request().url()));
   return route.fulfill({json:{status:'EMPTY',events:[],checked_at:null,partial:false}});
  });
  await page.goto(`${locale==='pl'?'':`/${locale}`}/deals/browser-13`);
  await page.locator('#stay-checkin').fill('2028-02-28');
  await page.locator('#stay-checkout').fill('2028-03-01');
  await page.locator('#stay-adults').fill('2');
  await page.locator('#budget-hotel').fill('321');
  const fields=['#stay-checkin','#stay-checkout','#budget-start','#budget-end','#trip-events input[type=date] >> nth=0','#trip-events input[type=date] >> nth=1'];
  for(const [index,selector] of fields.entries()){
   const field=page.locator(selector);
   await field.fill('10000-01-01');
   await expect(field).toHaveAttribute('aria-invalid','true');
   await expect(page.locator('#event-dates-error')).toHaveText(dateCopy[locale].invalid);
   await expect(page.locator('#accommodation a[href*="stay22"]')).toHaveCount(0);
   await expect(page.getByTestId('budget-total')).toHaveCount(0);
   await expect(page.locator('#budget-hotel')).toHaveValue('321');
   await field.fill(index%2===0?'2028-02-29':'2028-03-01');
   await expect(page.getByTestId('budget-total')).toBeVisible();
   await expect(page.locator('#accommodation a[href*="stay22"]')).toHaveCount(1);
  }
  await page.locator('#budget-end').fill('');
  await expect(page.locator('#event-dates-error')).toBeVisible();
  await expect(page.locator('#accommodation a[href*="stay22"]')).toHaveCount(0);
  await page.locator('#budget-end').fill('2028-02-28');
  await expect(page.locator('#budget-end')).toHaveAttribute('aria-invalid','true');
  await page.locator('#budget-end').fill('2028-03-01');
  await expect(page.locator('#budget-nights')).toHaveValue('1');
  await expect.poll(()=>requests.some(url=>url.searchParams.get('start_date')==='2028-02-29'&&url.searchParams.get('end_date')==='2028-03-01')).toBe(true);
  expect(requests.every(url=>[url.searchParams.get('start_date'),url.searchParams.get('end_date')].every(date=>/^\d{4}-\d{2}-\d{2}$/.test(date!)))).toBe(true);
  expect(errors).toEqual([]);
 });
}
