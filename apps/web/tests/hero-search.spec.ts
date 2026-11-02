import {test,expect as baseExpect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {homeText} from '../src/lib/i18n/home-copy';
import {filterText} from '../src/lib/i18n/filter-copy';
import {getMessages} from '../src/lib/i18n/messages';
import {chooseOrigin} from './origin-helpers';
const expect=baseExpect.configure({timeout:15000});

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test('hero has one primary search, visible flexible dates and an explicit anywhere choice',async({page},testInfo)=>{
 await page.goto('/');
 await page.screenshot({path:testInfo.outputPath('hero.png'),fullPage:false});
 const hero=page.locator('.hero');
 await expect(hero.getByRole('heading',{level:1})).toHaveText('Tanie podróże zaczynają się tutaj.');
 await expect(hero.locator('form')).toHaveCount(1);
 await expect(hero.locator('button[type="submit"]')).toHaveCount(1);
 await expect(hero.locator('.trip-presets')).toHaveCount(0);
 await expect(hero.locator('input[name="departure_from"]')).toBeVisible();
 await expect(hero.locator('input[name="departure_to"]')).toBeVisible();
 await hero.getByRole('combobox',{name:'Dokąd',exact:true}).focus();
 await hero.getByRole('option',{name:'Dokądkolwiek',exact:true}).click();
 await expect(hero.getByRole('combobox',{name:'Dokąd',exact:true})).toHaveValue('');
 expect((await new AxeBuilder({page}).include('.hero').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 for(const input of await hero.locator('input:not([type="hidden"])').all())if(await input.isVisible()){
  expect(await input.evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  expect((await input.boundingBox())!.height).toBeGreaterThanOrEqual(44);
 }
 await page.screenshot({path:testInfo.outputPath('hero-320.png')});
 await hero.screenshot({path:testInfo.outputPath('hero-320-full.png')});
});

test('origin-only and destination-budget searches use the existing catalog filters',async({page})=>{
 await page.goto('/');
 await chooseOrigin(page,'WRO');
 let release=()=>{};
 const allowed=new Promise<void>(resolve=>{release=resolve;});
 const actionUrl=page.url();
 await page.route(actionUrl,async route=>{if(route.request().method()==='POST')await allowed;await route.continue();});
 try{
  await page.locator('.hero button[type="submit"]').click();
  await expect(page.locator('.hero form')).toHaveAttribute('aria-busy','true');
  await expect(page.getByRole('combobox',{name:'Skąd',exact:true})).toBeDisabled();
  await expect(page.locator('.hero button[type="submit"]')).toBeDisabled();
  release();await expect(page).toHaveURL(/\/deals\?origin=WRO$/);
 }finally{release();await page.unroute(actionUrl);}
 await expect(page.locator('.deal-card')).not.toHaveCount(0);
 await page.goto('/');
 await page.getByRole('combobox',{name:'Dokąd',exact:true}).fill('Mediolan');
 await page.locator('.hero input[name="budget"]').fill('300');
 await page.locator('.hero button[type="submit"]').click();
 await expect(page).toHaveURL(/origin=WRO&destination=milan&budget=300$/);
 await expect(page.locator('input[name="budget"]')).toHaveValue('300');
});

test('flexible departure bounds and every filter survive detail, reload and return',async({page})=>{
 await page.goto('/?origin=WRO&budget=220&departure_from=2030-05-01&departure_to=2030-05-10&sort=price');
 await expect(page.locator('.hero input[name="budget"]')).toHaveValue('220');
 await expect(page.locator('.hero input[name="departure_from"]')).toHaveValue('2030-05-01');
 // Fixture dates are relative to today; select an inclusive range around them.
 const from=new Date();from.setUTCDate(from.getUTCDate()+1);
 const to=new Date();to.setUTCDate(to.getUTCDate()+90);
 await page.locator('.hero input[name="departure_from"]').fill(from.toISOString().slice(0,10));
 await page.locator('.hero input[name="departure_to"]').fill(to.toISOString().slice(0,10));
 await page.locator('.hero button[type="submit"]').click();
 await expect(page).toHaveURL(/\/deals\?/);
 const search=page.url();
 expect(new URL(search).searchParams.get('departure_to')).toBe(to.toISOString().slice(0,10));
 expect(new URL(search).searchParams.get('sort')).toBe('price');
 await page.locator('.deal-card-link').first().click();
 await expect(page.locator('.back-link')).toBeVisible();
 await page.reload();
 await page.locator('.back-link').click();
 await expect(page).toHaveURL(search);
 await expect(page.locator('input[name="budget"]')).toHaveValue('220');
});

test('invalid routes, inverted dates and negative budget stay on the hero',async({page})=>{
 await page.goto('/');
 await page.getByRole('combobox',{name:'Skąd',exact:true}).fill('No such airport');
 await page.locator('.hero button[type="submit"]').click();
 await expect(page.locator('.hero [role="alert"]')).toContainText('Nie znaleziono lotniska');
 await expect(page.getByRole('combobox',{name:'Skąd',exact:true})).toBeFocused();
 await page.getByRole('combobox',{name:'Skąd',exact:true}).fill('WRO');
 await page.locator('.hero input[name="departure_from"]').fill('2030-05-10');
 await page.locator('.hero input[name="departure_to"]').fill('2030-05-01');
 await page.locator('.hero button[type="submit"]').click();
 await expect(page.locator('.hero [role="alert"]')).toContainText('Koniec zakresu dat');
 await page.locator('.hero input[name="departure_to"]').fill('2030-05-20');
 await page.locator('.hero input[name="budget"]').fill('-1');
 await page.locator('.hero button[type="submit"]').click();
 expect(await page.locator('.hero input[name="budget"]').evaluate((node:HTMLInputElement)=>node.validity.rangeUnderflow)).toBe(true);
 await expect(page).toHaveURL(/\/\?origin=WRO$/);
});

test('all four languages retain translated search and return context',async({page})=>{
 test.setTimeout(120000);
 for(const locale of ['pl','en','ru','uk'] as const){
  const prefix=locale==='pl'?'':`/${locale}`;
  await page.goto(`${prefix}/?origin=WRO`);
  await expect(page.locator('#hero-title')).toHaveText(homeText(locale,'Tanie podróże zaczynają się tutaj.'));
  const destination=page.getByRole('combobox',{name:getMessages(locale).to,exact:true});
  await destination.focus();await destination.press('ArrowDown');await destination.press('Enter');
  await expect(destination).toHaveValue('');
  await expect(destination).toHaveAttribute('placeholder',filterText(locale,'Dokądkolwiek'));
  await page.locator('.hero input[name="budget"]').fill('220');
  await page.getByRole('button',{name:filterText(locale,'Znajdź tani lot'),exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`${prefix}/deals\\?origin=WRO&budget=220$`));
  const search=page.url();
  await page.locator('.deal-card-link').first().click();
  await expect(page.locator('.back-link')).toHaveAttribute('href',`${prefix}/deals?origin=WRO&budget=220`);
  await expect(page.locator('link[rel="canonical"]')).not.toHaveAttribute('href',/returnTo/);
  await page.locator('.back-link').click();await expect(page).toHaveURL(search);
 }
});
