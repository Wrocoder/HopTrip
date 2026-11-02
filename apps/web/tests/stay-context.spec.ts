import {localOutbound} from './local-outbound';
import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {stayText} from '../src/lib/i18n/stay-copy';
import {tripText} from '../src/lib/i18n/trip-copy';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: local stay dates are explicit and preserve people, money and the outbound context`,async({page,context},info)=>{
 test.setTimeout(120000);
 const s=(key:Parameters<typeof stayText>[1])=>stayText(locale,key);
 await page.goto(localizedHref('/deals/stay-context-overnight#accommodation',locale));
 const stay=page.locator('#accommodation'),link=stay.locator('a[rel*="sponsored"]');
 await expect(page.locator('#stay-checkin')).toBeEnabled();
 // Offer/departure dates remain the default until the user explicitly accepts local dates.
 await expect(page.locator('#stay-checkin')).toHaveValue('2030-05-01');
 await expect(page.locator('#stay-checkout')).toHaveValue('2030-05-04');
 await expect(stay).toContainText(s('Przylot obliczono z czasu lotu. Potwierdź datę i rozkład u partnera.'));
 await expect(stay.locator('aside time').first()).toHaveAttribute('datetime','2030-05-02');
 await expect(stay.locator('aside time').last()).toHaveAttribute('datetime','2030-05-04');
 const flightDates=await page.locator('.page-heading .lead').textContent();
 await page.locator('#stay-adults').fill('2');
 await page.locator('#budget-hotel-basis').selectOption('stay');await page.locator('#budget-hotel_total').fill('900');
 await stay.getByRole('button',{name:s('Użyj tych dat pobytu'),exact:true}).click();
 await expect(page.locator('#stay-checkin')).toHaveValue('2030-05-02');
 await expect(page.locator('#stay-checkout')).toHaveValue('2030-05-04');
 await expect(page.locator('#budget-nights')).toHaveValue('2');await expect(page.locator('#budget-days')).toHaveValue('3');
 await expect(page.locator('#budget-people')).toHaveValue('2');await expect(page.locator('#budget-hotel_total')).toHaveValue('900');
 await expect(page.locator('.page-heading .lead')).toHaveText(flightDates!);
 await expect(stay.getByRole('button',{name:s('Użyj tych dat pobytu'),exact:true})).toHaveCount(0);
 const check=async(checkin:string,checkout:string)=>{
  const url=new URL((await link.getAttribute('href'))!);
  expect(url.origin+url.pathname).toBe('https://www.stay22.com/allez/roam');
  expect(Object.fromEntries(url.searchParams)).toEqual({aid:'hoptrip',address:'Barcelona',checkin,checkout,adults:'2',campaign:'hoptrip_accommodation',lang:'pl',currency:'PLN'});
 };
 await check('2030-05-02','2030-05-04');
 await expect(page.locator('#stay-price-note')).toHaveText(s('Cenę i dostępność noclegu sprawdź w Stay22. HopTrip nie pobiera wyceny; kwoty w budżecie wpisujesz ręcznie.'));
 await expect(link).toHaveAttribute('aria-describedby','stay-summary stay-price-note');
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('#accommodation').analyze()).violations).toEqual([]);
 if(locale==='pl')await stay.screenshot({path:info.outputPath('local-stay-320.png'),scale:'css'});
 // A manual choice stays authoritative across reload and sharing.
 await page.locator('#stay-checkin').fill('2030-05-03');await page.locator('#stay-checkout').fill('2030-05-06');
 await page.reload();await expect(page.locator('#stay-checkin')).toHaveValue('2030-05-03');
 await expect(page.locator('#stay-checkout')).toHaveValue('2030-05-06');
 await expect(page.locator('#budget-hotel_total')).toHaveValue('900');await check('2030-05-03','2030-05-06');
 await page.getByRole('button',{name:tripText(locale,'Udostępnij'),exact:true}).click();
 await page.goto(await page.locator('#trip-share-link').inputValue());
 await expect(page.locator('#stay-checkin')).toHaveValue('2030-05-03');
 await expect(page.locator('#budget-hotel_total')).toHaveValue('900');await check('2030-05-03','2030-05-06');
 await context.route('https://www.stay22.com/**',route=>route.fulfill({contentType:'text/html',body:'<h1>Local Stay22 destination</h1>'}));
 const restore=await localOutbound(link,'stay');const opened=context.waitForEvent('page');await link.click();const destination=await opened;
 await expect(destination.getByRole('heading')).toHaveText('Local Stay22 destination');
 await destination.close();await restore();
});

test('unknown zones, one-way travel and same-day return never invent a searchable hotel night',async({page})=>{
 test.setTimeout(120000);
 const s=(key:Parameters<typeof stayText>[1])=>stayText('pl',key),stay=page.locator('#accommodation');
 await page.goto('/deals/stay-context-unknown-zone');
 await expect(page.locator('#stay-checkin')).toBeEnabled();
 await expect(stay.locator('aside')).toHaveCount(0);
 await expect(page.locator('#stay-checkin')).toHaveValue('2030-05-01');
 await expect(page.locator('#stay-schedule')).toContainText('UTC');
 await page.goto('/deals/stay-context-one-way');
 await expect(page.locator('#stay-summary')).toContainText(s('Wybierz datę'));
 await expect(stay.locator('a[rel*="sponsored"]')).toHaveCount(0);
 await stay.getByRole('button',{name:s('Użyj tych dat pobytu'),exact:true}).click();
 await expect(page.locator('#stay-checkin')).toHaveValue('2030-05-02');
 await expect(page.locator('#stay-checkout')).toHaveValue('');
 await expect(page.locator('#budget-nights')).toHaveValue('');
 await page.goto('/deals/stay-context-same-day');
 await stay.getByRole('button',{name:s('Użyj tych dat pobytu'),exact:true}).click();
 await expect(page.locator('#stay-checkin')).toHaveValue('2030-05-02');
 await expect(page.locator('#stay-checkout')).toHaveValue('2030-05-02');
 await expect(page.locator('#budget-nights')).toHaveValue('0');
 await expect(stay.locator('a[rel*="sponsored"]')).toHaveCount(0);
 await expect(page.locator('#stay-summary')).toContainText('Barcelona');
 await page.locator('#stay-checkout').fill('2030-05-03');
 await expect(stay.locator('a[rel*="sponsored"]')).toBeVisible();
});
