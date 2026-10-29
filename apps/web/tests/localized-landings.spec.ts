import {test,expect as baseExpect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import translations from '../src/lib/i18n/landing-copy.json';
import {localeNames} from '../src/lib/i18n/config';
import {shell} from '../src/lib/i18n/shell';
const expect=baseExpect.configure({timeout:15000});

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

for(const locale of ['en','ru','uk'] as const){
 test(`${locale}: all seven landing pages, links, SEO and mobile layout`,async({page,request})=>{
  test.setTimeout(180000);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const checked=new Set<string>();
  for(const [path,copy] of Object.entries(translations)){
   const response=await page.goto(`/${locale}${path}`);expect(response?.status()).toBe(200);
   await expect(page.locator('html')).toHaveAttribute('lang',locale);
   await expect(page).toHaveTitle(copy[locale].title);
   await expect(page.locator('link[rel=canonical]')).toHaveCount(1);
   await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',`http://127.0.0.1:3100/${locale}${path}`);
   await expect(page.locator('link[rel=alternate][hreflang]')).toHaveCount(5);
   await expect(page.locator('meta[name=robots]')).not.toHaveAttribute('content',/noindex/);
   await expect(page.locator('h1')).toHaveCount(1);
   await expect(page.locator('.catalog-intro')).toContainText(copy[locale].sections[0].text);
   for(const link of await page.locator('.catalog-intro a').all()){
    const href=(await link.getAttribute('href'))!;
    if(!href.startsWith(`/${locale}/`))await expect(link).toContainText(shell[locale].polish);
    if(!checked.has(href)){expect((await request.get(href)).status(),href).toBe(200);checked.add(href);}
   }
   expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
   await page.setViewportSize({width:320,height:850});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
 });

 test(`${locale}: landing filters and language switches preserve search conditions`,async({page})=>{
  test.setTimeout(120000);
  await page.goto(`/${locale}/city-break?origin=WRO`);
  await expect(page.locator('input[name=duration_min]')).toHaveValue('2');
  await expect(page.locator('input[name=duration_max]')).toHaveValue('4');
  await page.locator('input[name=budget]').fill('300');
  await page.locator('form.filters button[type=submit]').click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/city-break\\?origin=WRO&budget=300$`));
  await expect(page.locator('input[name=duration_min]')).toHaveValue('2');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content',/noindex/);
  const next=locale==='en'?'ru':'en';
  await page.locator('.language-switcher').getByRole('link',{name:localeNames[next],exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/${next}/city-break\\?origin=WRO&budget=300$`));
  await expect(page.locator('input[name=duration_max]')).toHaveValue('4');
  await expect(page.locator('input[name=budget]')).toHaveValue('300');
  await page.goto(`/${locale}/routes/krakow-rome?origin=WRO&destination=milan`);
  await expect(page.locator('input[name=origin]')).toHaveValue('KRK');
  await expect(page.locator('input[name=destination]')).toHaveValue('rome');
  await expect(page.locator('input[name=origin]')).toHaveAttribute('readonly','');
  await page.goto(`/${locale}/tanie-loty-na-weekend?weekend=false`);
  await expect(page.locator('input[name=weekend]')).toHaveValue('true');
  await page.goto(`/${locale}/from/warszawa`);
  await expect(page.locator('select[name=origin]')).toHaveValue('WAW,WMI');
  await page.locator('select[name=origin]').selectOption('WMI');
  await page.locator('form.filters button[type=submit]').click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/from/warszawa\\?origin=WMI$`));
  await page.goto(`/${locale}/from/WRO`);
  await page.locator(`.catalog-intro a[href="/${locale}/city-break?origin=WRO"]`).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/city-break\\?origin=WRO$`));
 });
}

test('only reviewed landing pages are published; Polish alternates are reciprocal',async({page,request})=>{
 test.setTimeout(90000);
 for(const path of Object.keys(translations)){
  await page.goto(path);
  for(const locale of ['en','ru','uk'])await expect(page.locator(`link[hreflang=${locale}]`)).toHaveAttribute('href',`http://127.0.0.1:3100/${locale}${path}`);
 }
 for(const path of ['/en/from/WAW','/ru/destinations/rome','/uk/routes/unknown','/de/city-break','/pl/city-break'])expect((await request.get(path)).status(),path).toBe(404);
});
