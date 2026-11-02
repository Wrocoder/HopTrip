import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {stateText} from '../src/lib/i18n/state-copy';
import {catalogText} from '../src/lib/i18n/catalog-copy';
import {eventCopy,eventUx} from '../src/lib/i18n/event-copy';
import {alertText} from '../src/lib/i18n/alert-copy';
import configuration from '../playwright.config';

const servers=configuration.webServer;
if(!Array.isArray(servers)||!servers[0]?.url)throw new Error('Fixture API server URL is required');
const apiOrigin=new URL(servers[0].url).origin;

for(const locale of ['pl','en','ru','uk'] as const)test(`API contract failures recover without broken UI in ${locale}`,async({page,request},info)=>{
 test.setTimeout(120000);
 if(info.project.name==='mobile')await page.setViewportSize({width:320,height:844});
 const pageErrors:string[]=[];page.on('pageerror',error=>pageErrors.push(error.message));
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.goto(localizedHref('/deals?origin=WRO&budget=987652&sort=price',locale));
 const failure=page.locator('[data-state="error"]');
 await expect(failure).toContainText(catalogText(locale,'Nie udało się pobrać ofert'));
 await expect(page.locator('.result-count,.deal-card')).toHaveCount(0);
 await expect(page.locator('.filters input[name="budget"]')).toHaveValue('987652');
 await failure.getByRole('link',{name:catalogText(locale,'Spróbuj ponownie'),exact:true}).click();
 await expect(failure).toBeVisible();await expect(page).toHaveURL(/origin=WRO&budget=987652&sort=price$/);
 await page.goto(localizedHref('/deals/invalid-contract-fixture?returnTo=%2Fdeals%3Forigin%3DWRO',locale));
 await expect(failure.getByRole('heading',{level:1})).toHaveText(stateText(locale,'Nie możemy teraz wczytać tej oferty.'));
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^noindex/);
 await expect(page.locator('.offer-detail,.deal-price')).toHaveCount(0);
 expect((await request.post(`${apiOrigin}/__test__/catalog-state?unavailable=true`)).ok()).toBe(true);
 try{
  for(const path of ['/from/WRO','/destinations/milan']){
   await page.goto(localizedHref(path,locale));
   await expect(failure.getByRole('heading',{level:1})).toHaveText(stateText(locale,'Nie udało się wczytać strony'));
   await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^noindex/);
   await expect(page.locator('.deal-card')).toHaveCount(0);
  }
 }finally{expect((await request.post(`${apiOrigin}/__test__/catalog-state?unavailable=false`)).ok()).toBe(true);}
 await failure.getByRole('link',{name:new RegExp(stateText(locale,'Wróć do katalogu lotów'))}).click();
 await expect(page.locator('.deal-card').first()).toBeVisible();
 let validEvents=false;
 await page.route('**/api/v1/deals/browser-deal/events?**',route=>route.fulfill({json:validEvents?{status:'EMPTY',events:[]}:{status:'READY',events:null}}));
 await page.goto(localizedHref('/deals/browser-deal#trip-events',locale));
 await expect(page.locator('#budget-end')).toBeEnabled();
 await page.locator('#budget-end').fill(await page.locator('#budget-start').inputValue());
 const events=page.locator('#trip-events');await expect(events.getByRole('status')).toContainText(eventCopy[locale].unavailable);
 await expect(events.getByRole('heading',{level:3})).toHaveCount(0);
 validEvents=true;await events.getByRole('button',{name:new RegExp(eventUx[locale].retry)}).click();
 await expect(events.getByRole('status')).toContainText(eventCopy[locale].empty);
 expect((await new AxeBuilder({page}).include('#trip-events').analyze()).violations).toEqual([]);
 let validAlert=false;
 await page.route('**/api/v1/alerts/manage',route=>route.fulfill({json:validAlert?{status:'ACTIVE',filters:{origin:'WRO',budget:'222.00',duration_min:0,duration_max:14,destination:null,departure_from:null,departure_to:null,weekend:false,frequency:'weekly'}}:{status:'ACTIVE',filters:null}}));
 await page.route('**/api/v1/alerts/confirm',route=>route.fulfill({json:{token:null}}));
 await page.goto(localizedHref('/alerts/confirm#token=test-only-intercepted',locale));
 const confirm=page.locator('.alert-panel');
 await confirm.getByRole('button',{name:alertText(locale,'Potwierdzam zapis'),exact:true}).click();
 await expect(confirm.getByRole('status')).toHaveText(alertText(locale,'Nie udało się wykonać operacji. Spróbuj ponownie później.'));
 await expect(confirm.getByRole('link',{name:alertText(locale,'Zarządzaj alertem'),exact:true})).toHaveCount(0);
 await page.goto(localizedHref('/alerts/manage#token=test-only-intercepted',locale));
 const alert=page.locator('.alert-panel'),show=alert.getByRole('button',{name:alertText(locale,'Pokaż ustawienia'),exact:true});
 await show.click();await expect(alert.getByRole('status')).toHaveText(alertText(locale,'Nie udało się wykonać operacji. Spróbuj ponownie później.'));
 await expect(alert.locator('form')).toHaveCount(0);await expect(show).toBeEnabled();
 validAlert=true;await show.click();await expect(alert.locator('form')).toBeVisible();
 await expect(alert.getByRole('spinbutton',{name:alertText(locale,'Budżet na lot na osobę (PLN)'),exact:true})).toHaveValue('222.00');
 expect((await new AxeBuilder({page}).include('.alert-panel').analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(pageErrors).toEqual([]);
 if(locale==='pl')await alert.screenshot({path:info.outputPath('recovered-alert.png'),scale:'css'});
});
