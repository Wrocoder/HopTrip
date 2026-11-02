import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {catalogText} from '../src/lib/i18n/catalog-copy';
import {stateText} from '../src/lib/i18n/state-copy';
import {getMessages} from '../src/lib/i18n/messages';
import {searchReturnPath} from '../src/lib/search-context';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: empty, API failure, invalid search and unavailable detail have honest recovery`,async({page},info)=>{
 test.setTimeout(120000);
 const t=(key:Parameters<typeof stateText>[1])=>stateText(locale,key),c=(key:Parameters<typeof catalogText>[1])=>catalogText(locale,key);
 const initial=localizedHref('/deals?origin=WRO&budget=1&departure_from=2030-05-01&destination=barcelona&duration_min=2&sort=price&offset=12',locale);
 await page.goto(initial);
 const empty=page.locator('[data-state="empty"]');
 await expect(empty).toContainText(c('Brak aktualnych ofert'));
 await expect(empty.getByRole('link')).toHaveCount(3);
 await expect(page).toHaveURL(new URL(initial,info.project.use.baseURL).href);
 if(locale==='pl')await empty.screenshot({path:info.outputPath('empty.png')});
 const dates=empty.getByRole('link',{name:c('Poszerz wyszukiwanie na inne daty'),exact:true});
 const href=new URL((await dates.getAttribute('href'))!,info.project.use.baseURL);
 expect(Object.fromEntries(href.searchParams)).toEqual({origin:'WRO',destination:'barcelona',budget:'1',duration_min:'2',sort:'price'});
 await dates.click();await expect(page).not.toHaveURL(/departure_from=|offset=/);
 await expect(page.locator('input[name="budget"]')).toHaveValue('1');
 await page.goto(localizedHref('/deals?origin=WRO&budget=987653&offset=12&sort=price',locale));
 const error=page.locator('[data-state="error"]');
 await expect(error).toContainText(t('Oferty są chwilowo niedostępne. Spróbuj ponownie z tymi samymi warunkami.'));
 await expect(page.locator('.result-count,.deal-card')).toHaveCount(0);
 const retry=error.getByRole('link',{name:c('Spróbuj ponownie'),exact:true});
 expect(Object.fromEntries(new URL((await retry.getAttribute('href'))!,info.project.use.baseURL).searchParams)).toEqual({origin:'WRO',budget:'987653',offset:'12',sort:'price'});
 await retry.click();await expect(error).toBeVisible();
 await expect(page.locator('input[name="budget"]')).toHaveValue('987653');
 expect((await new AxeBuilder({page}).include('.offer-state').analyze()).violations).toEqual([]);
 if(locale==='pl')await error.screenshot({path:info.outputPath('api-error.png')});
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl')await error.screenshot({path:info.outputPath('api-error-320.png')});
 await page.goto(localizedHref('/deals?sort=invalid',locale));
 await expect(error).toContainText(c('Sprawdź parametry wyszukiwania'));
 await error.getByRole('link',{name:t('Popraw wybrane filtry'),exact:true}).click();
 await expect(page.locator('#search-filters')).toBeFocused();
 await error.getByRole('link',{name:c('Wyczyść parametry wyszukiwania'),exact:true}).click();
 await expect(page.locator('.result-count')).toBeVisible();
 const back=searchReturnPath('/deals?origin=WRO&budget=210&offset=12&sort=price');
 await page.goto(localizedHref('/deals/unavailable-fixture?returnTo='+encodeURIComponent(back),locale));
 await expect(error.getByRole('heading',{level:1})).toHaveText(t('Nie możemy teraz wczytać tej oferty.'));
 await expect(page.locator('.offer-detail,.deal-price')).toHaveCount(0);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^noindex/);
 const detailRetry=error.getByRole('link',{name:getMessages(locale).retry,exact:true});
 expect(new URL((await detailRetry.getAttribute('href'))!,info.project.use.baseURL).searchParams.get('returnTo')).toBe(back);
 await error.getByRole('link',{name:t('Wróć do katalogu lotów'),exact:true}).click();
 await expect(page).toHaveURL(new URL(localizedHref(back,locale),info.project.use.baseURL).href);
 const missing=await page.goto(localizedHref('/deals/does-not-exist',locale));
 expect(missing?.status()).toBe(404);
 const unavailable=page.locator('[data-state="unavailable"]');
 await expect(unavailable).toContainText(t('Ta strona lub oferta nie jest dostępna. Sprawdź aktualny katalog.'));
 await expect(unavailable.getByRole('link',{name:t('Wróć do katalogu lotów'),exact:true})).toHaveAttribute('href',localizedHref('/deals',locale));
});

test('initial server results and a delayed filter update do not fabricate new results',async({page})=>{
 await page.goto('/deals?budget=987654');
 await expect(page.locator('.result-count')).toBeVisible();
 await expect(page.locator('[data-state="loading"]')).toHaveCount(0);
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/*',async route=>{if(route.request().method()==='POST' && route.request().headers()['next-action'])await gate;await route.continue();});
 try{
  await page.locator('input[name="budget"]').fill('1');
  await page.getByRole('button',{name:'Filtruj',exact:true}).click();
  await expect(page.locator('.filter-pending')).toHaveText(stateText('pl','Stosujemy wybrane filtry…'));
  await expect(page.locator('.filters')).toHaveAttribute('aria-busy','true');
  await expect(page.getByRole('button',{name:'Filtruj',exact:true})).toBeDisabled();
  expect(new URL(page.url()).searchParams.get('budget')).toBe('987654');
  release();await expect(page).toHaveURL(/budget=1$/);
  await expect(page.locator('[data-state="empty"]')).toBeVisible();
 }finally{release();await page.unrouteAll({behavior:'wait'});}
});

test('a blocked partner offers recovery without a booking link',async({page})=>{
 await page.goto('/deals/partner-unavailable-fixture');
 const booking=page.locator('.booking-card');
 await expect(booking.locator('.partner-unavailable')).toContainText('Oferta partnera jest obecnie niedostępna');
 await expect(booking.locator('a[rel*="sponsored"]')).toHaveCount(0);
 await expect(booking.getByRole('link',{name:stateText('pl','Wróć do katalogu lotów'),exact:true})).toHaveAttribute('href','/deals');
});

test('home failure can retry without losing airport or search drafts',async({page,request})=>{
 await request.post('http://127.0.0.1:8100/__test__/catalog-state?unavailable=true');
 try{
  await page.goto('/?origin=WRO');
  const selection=page.locator('.catalog-section');
  await expect(selection.locator('[data-state="error"]')).toBeVisible();
  await expect(selection.locator('.deal-card')).toHaveCount(0);
  await page.locator('input[name="budget"]').fill('321');
  await request.post('http://127.0.0.1:8100/__test__/catalog-state?unavailable=false');
  await selection.getByRole('button',{name:'Spróbuj ponownie',exact:true}).click();
  await expect(selection.locator('.deal-card').first()).toBeVisible();
  await expect(page.locator('input[name="budget"]')).toHaveValue('321');
  await expect(page.locator('#home-origin')).toHaveValue(/WRO/);
  await expect(page).toHaveURL(/origin=WRO$/);
 }finally{await request.post('http://127.0.0.1:8100/__test__/catalog-state?unavailable=false');}
});
