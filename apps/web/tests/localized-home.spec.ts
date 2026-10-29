import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {homeText} from '../src/lib/i18n/home-copy';
import {localeNames} from '../src/lib/i18n/config';
import {shell} from '../src/lib/i18n/shell';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{
  if(!localStorage.getItem('hoptrip.consent.v1'))localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
 });
});

for(const locale of ['en','ru','uk'] as const){
 test(`${locale}: home, search, flight and logo retain language, draft and consent`,async({page})=>{
  test.setTimeout(90000);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`/${locale}?origin=WRO#current-deals`);
  const consent=await page.evaluate(()=>localStorage.getItem('hoptrip.consent.v1'));
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  await expect(page.getByRole('heading',{level:1})).toHaveText(homeText(locale,'Znajdź lot. Zaplanuj krótki wyjazd.'));
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',`http://127.0.0.1:3100/${locale}`);
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^index,/);
  await page.locator('.short-trip-airport > summary').click();
  await page.locator('#short-trip-origin').selectOption('KRK');
  await page.getByRole('button',{name:homeText(locale,'Pokaż krótkie wyjazdy'),exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}\\?origin=KRK$`));
  await page.goto(`/${locale}`);
  await expect(page.locator('#short-trip-origin')).toHaveValue('KRK');
  // The fixture has no short KRK trips; use its WRO offers for the card journey.
  await page.locator('.short-trip-airport > summary').click();
  await page.locator('#short-trip-origin').selectOption('WRO');
  await page.getByRole('button',{name:homeText(locale,'Pokaż krótkie wyjazdy'),exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}\\?origin=WRO$`));
  await page.getByRole('link',{name:homeText(locale,'Zobacz wszystkie loty na 2–4 noce →'),exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/deals\\?origin=WRO&duration_min=2&duration_max=4$`));
  await page.locator('.deal-card-link').first().click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/deals/browser[^/?]*$`));
  const flight=page.url();
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  await page.locator('#budget-hotel').fill('321');
  await page.locator('.site-header .brand').click();
  await expect(page).toHaveURL(new RegExp(`/${locale}$`));
  await expect(page.getByRole('heading',{level:1})).toHaveText(homeText(locale,'Znajdź lot. Zaplanuj krótki wyjazd.'));
  expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
  await page.setViewportSize({width:320,height:850});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.goto(flight);
  await expect(page.locator('#budget-hotel')).toHaveValue('321');
  expect(await page.evaluate(()=>localStorage.getItem('hoptrip.consent.v1'))).toBe(consent);
  expect(errors).toEqual([]);
 });
}

test('home language switching preserves the query and fragment; unpublished links are labelled',async({page,request})=>{
 await page.goto('/?origin=WRO#current-deals');
 for(const locale of ['en','ru','uk','pl'] as const){
  await page.locator('.language-switcher').getByRole('link',{name:localeNames[locale],exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  await expect(page.locator('.site-header .brand')).toHaveAttribute('href',locale==='pl'?'/':`/${locale}`);
  expect(new URL(page.url()).search).toBe('?origin=WRO');expect(new URL(page.url()).hash).toBe('#current-deals');
  if(locale!=='pl')await expect(page.locator('main a[href="/city-break"]')).toContainText(shell[locale].polish);
 }
 const xml=await(await request.get('/sitemap.xml')).text();
 for(const locale of ['en','ru','uk'])expect(xml).toContain(`/${locale}</loc>`);
 for(const path of ['/pl','/de','/ua'])expect((await request.get(path)).status()).toBe(404);
});
