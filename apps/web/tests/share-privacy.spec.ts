import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {encodeTrip,tripPath} from '../src/lib/shared-trip';
import {emptyBudget} from '../src/lib/trip-budget';
import {localizedHref} from '../src/lib/i18n/routing';
import {tripText} from '../src/lib/i18n/trip-copy';
import {sharePrivacyCopy} from '../src/lib/i18n/share-privacy-copy';
const snapshot=(slug='browser-deal',food='37.42',start='2030-05-01')=>encodeTrip({version:1,offer:{slug,origin:'WRO',destination:'Barcelona',start,end:'2030-05-03',price:'100.25',observedAt:''},draft:{version:1,input:{...emptyBudget,people:'2',food,flight:'100.25'},start:'2030-05-01',end:'2030-05-03',context:'',review:true}})!;
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:true,marketing:true,at:Date.now()})));
});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: fragment payload stays outside requests and previews; new sharing and saved opening work`,async({page},info)=>{
 const token=snapshot(),requests:{url:string;headers:Record<string,string>;body:string}[]=[];
 page.on('request',request=>requests.push({url:request.url(),headers:request.headers(),body:request.postData()??''}));
 const response=await page.goto(localizedHref(tripPath(token),locale));
 await expect(page.locator('#budget-food')).toHaveValue('37.42');
 await expect(page.getByRole('main').getByRole('status').first()).toContainText(tripText(locale,'Oferta jest w katalogu, ale zapisane ceny i daty mogą się różnić. Sprawdź aktualne warunki u partnera.'));
 expect((await response!.text()).includes(token)).toBe(false);
 await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content',sharePrivacyCopy[locale].title+' | HopTrip');
 await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content',sharePrivacyCopy[locale].description);
 await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content',new URL(localizedHref('/trip',locale),page.url()).href);
 await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content','no-referrer');
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex.*nofollow/);
 await page.locator('#budget-food').fill('38.42');await page.reload();await expect(page.locator('#budget-food')).toHaveValue('38.42');
 await page.getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true}).click();
 await page.getByRole('button',{name:tripText(locale,'Udostępnij'),exact:true}).click();
 const link=new URL(await page.locator('#trip-share-link').inputValue());expect(link.search).toBe('');expect(link.hash.startsWith('#plan=')).toBe(true);
 await page.goto(localizedHref('/saved',locale));const saved=page.locator('main a[href*="/trip#local="]');await expect(saved).toHaveCount(1);await saved.click();await expect(page.locator('#budget-food')).toHaveValue('38.42');
 expect(requests.length).toBeGreaterThan(0);for(const request of requests){expect(JSON.stringify(request)).not.toContain(token);expect(request.body).not.toContain('37.42');expect(request.url).not.toContain('plan=');}
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl')await page.locator('#trip-save').screenshot({path:info.outputPath('share-320.png'),scale:'css',animations:'disabled'});
});
test('native sections, skip link, reload, Back/Forward and language switching retain the plan',async({page})=>{
 const token=snapshot();await page.goto(tripPath(token));await expect(page.locator('#budget-food')).toHaveValue('37.42');
 await page.locator('.trip-navigation a[href="#calculator"]').focus();await page.keyboard.press('Enter');
 await expect(page).toHaveURL(new RegExp('#plan='+token+'&section=calculator$'));await page.reload();await expect(page.locator('#budget-food')).toHaveValue('37.42');
 await page.locator('.trip-navigation a[href="#trip-flight"]').click();await expect(page).toHaveURL(/&section=trip-flight$/);
 await page.goBack();await expect(page).toHaveURL(/&section=calculator$/);await expect(page.locator('#budget-food')).toHaveValue('37.42');
 await page.goForward();await expect(page).toHaveURL(/&section=trip-flight$/);
 await page.locator('.skip-link').focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/&section=content$/);
 await page.locator('.language-switcher').getByRole('link',{name:'Українська',exact:true}).click();await expect(page.locator('#budget-food')).toHaveValue('37.42');expect(page.url()).toContain('/uk/trip#plan='+token);
});
test('local editing is available during catalog failure and a late response cannot replace a different fragment',async({page})=>{
 let release:()=>void=()=>{};const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/api/v1/deals/browser-deal',async route=>{const response=await route.fetch();await gate;await route.fulfill({response});});
 await page.goto(tripPath(snapshot()));await expect(page.locator('#budget-food')).toHaveValue('37.42');
 await page.locator('#budget-food').fill('39.42');await expect(page.locator('#budget-food')).toHaveValue('39.42');
 await page.evaluate(hash=>{location.hash=hash;},tripPath(snapshot('missing-offer','41.42')).slice(5));
 await expect(page.locator('#budget-food')).toHaveValue('41.42');await expect(page.getByRole('main').getByRole('status').first()).toContainText('nie jest już dostępna');
 release();await expect(page.getByRole('link',{name:'Sprawdź ofertę w katalogu',exact:true})).toHaveCount(0);await expect(page.locator('#budget-food')).toHaveValue('41.42');
 await page.route('**/api/v1/deals/offline-offer',route=>route.abort());
 await page.goto(tripPath(snapshot('offline-offer')));await expect(page.locator('#budget-food')).toHaveValue('37.42');await expect(page.getByRole('main').getByRole('status').first()).toContainText('Nie udało się sprawdzić');
 await page.locator('#budget-food').fill('42.42');await page.reload();await expect(page.locator('#budget-food')).toHaveValue('42.42');
 await page.goto(tripPath(snapshot('missing-offer','37.42','2020-05-01')));await expect(page.getByRole('main').getByRole('status').first()).toContainText('już minął');
});
test('malformed fragment variants never request an offer and never fall back to a previous plan',async({page})=>{
 const token=snapshot(),requests:string[]=[];page.on('request',request=>{if(/\/api\/v1\/deals\//.test(request.url()))requests.push(request.url());});
 for(const hash of ['#plan=broken','#plan='+token+'&plan='+token,'#plan='+token+'&section=../bad','#plan='+token+'&email=private']){
  await page.goto('/trip'+hash);await expect(page.getByRole('heading',{level:1})).toHaveText('Nie można odczytać planu');await expect(page.locator('#calculator')).toHaveCount(0);
 }
 expect(requests).toEqual([]);
});
test('legacy query links still render without JavaScript; fragment links explain the JavaScript requirement',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});try{
  const page=await context.newPage(),token=snapshot();await page.goto('/trip?plan='+token);await expect(page.locator('#budget-food')).toHaveValue('37.42');
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content',sharePrivacyCopy.pl.description);
  await page.goto(tripPath(token));await expect(page.getByRole('main')).toContainText(sharePrivacyCopy.pl.javascript);await expect(page.locator('#budget-food')).toHaveCount(0);
 }finally{await context.close();}
});
