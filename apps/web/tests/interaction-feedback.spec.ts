import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {tripText} from '../src/lib/i18n/trip-copy';
import {budgetText} from '../src/lib/i18n/budget-copy';
import {savedTripCopy} from '../src/lib/i18n/saved-trip-copy';
import {stateText} from '../src/lib/i18n/state-copy';
import {filterText} from '../src/lib/i18n/filter-copy';
import {catalogText} from '../src/lib/i18n/catalog-copy';
import {planEditorCopy} from '../src/lib/i18n/plan-editor-copy';
import {savedPlansKey as savedTripsKey} from '../src/lib/saved-plans';

type ClipboardHarness={writes:string[];settle:(ok:boolean)=>void};
const copying={pl:'Kopiujemy link…',en:'Copying link…',ru:'Копируем ссылку…',uk:'Копіюємо посилання…'};
const reset='Wyczyszczono kalkulator. Zapisane wyjazdy i udostępnione linki pozostają bez zmian.';
test.setTimeout(90000);
test.beforeEach(async({page},info)=>{
 if(info.project.name==='mobile')await page.setViewportSize({width:320,height:844});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{
  localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
  const harness:ClipboardHarness={writes:[],settle:()=>{}};
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:(value:string)=>new Promise<void>((resolve,reject)=>{
   harness.writes.push(value);harness.settle=ok=>ok?resolve():reject(new DOMException('Synthetic clipboard denial','NotAllowedError'));
  })}});
  Object.assign(window,{clipboardHarness:harness});
 });
});

for(const locale of ['pl','en','ru','uk'] as const){
 test(`clipboard progress, recovery and stale completions in ${locale}`,async({page},info)=>{
  const t=(s:Parameters<typeof tripText>[1])=>tripText(locale,s);
  await page.goto(localizedHref('/deals/browser-deal#trip-save',locale));
  const actions=page.locator('#trip-save'),share=actions.getByRole('button',{name:t('Udostępnij'),exact:true});
  const save=actions.getByRole('button',{name:t('Zapisz wyjazd'),exact:true}),feedback=actions.locator('[aria-live="polite"]');
  await expect(save).toBeEnabled();await save.click();
  await expect(page).toHaveURL(/#local=/);await expect(page.getByTestId('saved-plan-state')).toHaveText(savedTripCopy[locale].saved);
  await share.click();await expect(feedback).toHaveText(copying[locale]);
  await expect(share).toBeDisabled();await expect(share).toHaveAttribute('aria-busy','true');
  expect(await page.evaluate(()=>(window as typeof window&{clipboardHarness:ClipboardHarness}).clipboardHarness.writes.length)).toBe(1);
  if(locale==='pl')await actions.screenshot({path:info.outputPath('copying.png')});
  await page.evaluate(()=>(window as typeof window&{clipboardHarness:ClipboardHarness}).clipboardHarness.settle(true));
  await expect(share).toBeEnabled();await expect(share).toHaveAttribute('aria-busy','false');
  await expect(feedback).toHaveText(t('Link skopiowany. Odbiorca otrzyma niezależną kopię planu.'));
  const original=await page.locator('#trip-share-link').inputValue();
  await share.click();await expect(feedback).toHaveText(copying[locale]);
  await page.evaluate(()=>(window as typeof window&{clipboardHarness:ClipboardHarness}).clipboardHarness.settle(false));
  await expect(feedback).toHaveText(t('Skopiuj link z pola poniżej. Odbiorca otrzyma niezależną kopię planu.'));
  await expect(share).toBeEnabled();await page.locator('#trip-share-link').focus();
  expect(await page.locator('#trip-share-link').evaluate((el:HTMLInputElement)=>el.selectionEnd!-el.selectionStart!)).toBe(original.length);
  await share.click();await expect(feedback).toHaveText(copying[locale]);
  // Editing the snapshot must hide feedback for the old version, even if the
  // clipboard promise completes afterwards. No timers or real clipboard needed.
  await page.locator('#budget-hotel').fill('123');
  await expect(feedback).toBeEmpty();await expect(share).toBeEnabled();
  await page.evaluate(()=>(window as typeof window&{clipboardHarness:ClipboardHarness}).clipboardHarness.settle(true));
  await expect(feedback).toBeEmpty();await expect(page.getByTestId('share-version')).toHaveText(savedTripCopy[locale].linkOld);
  await share.click();await expect(feedback).toHaveText(copying[locale]);
  // Updating supersedes an in-flight copy message for the same snapshot.
  await actions.getByRole('button',{name:planEditorCopy[locale].update,exact:true}).click();await expect(feedback).toHaveText(planEditorCopy[locale].updated);
  await page.evaluate(()=>(window as typeof window&{clipboardHarness:ClipboardHarness}).clipboardHarness.settle(false));
  await expect(feedback).toHaveText(planEditorCopy[locale].updated);
  await expect(share).toHaveAttribute('aria-busy','false');
  expect((await new AxeBuilder({page}).include('#trip-save').analyze()).violations).toEqual([]);
 });

 test(`calculator reset confirmation and storage failure in ${locale}`,async({page},info)=>{
  const b=(s:string)=>budgetText(locale,s),t=(s:Parameters<typeof tripText>[1])=>tripText(locale,s);
  await page.goto(localizedHref('/deals/browser-deal#calculator',locale));
  const actions=page.locator('#trip-save'),save=actions.getByRole('button',{name:t('Zapisz wyjazd'),exact:true});
  await expect(save).toBeEnabled();await page.locator('#budget-hotel').fill('321');await save.click();
  await expect(page.getByTestId('saved-plan-state')).toHaveText(savedTripCopy[locale].saved);
  const saved=await page.evaluate(key=>localStorage.getItem(key),savedTripsKey);
  expect(saved).not.toBe(null);
  await actions.getByRole('button',{name:t('Udostępnij'),exact:true}).click();
  await page.evaluate(()=>(window as typeof window&{clipboardHarness:ClipboardHarness}).clipboardHarness.settle(true));
  const link=await page.locator('#trip-share-link').inputValue();
  const storage=page.locator('#calculator > p[aria-live="polite"]');
  await page.getByRole('button',{name:b('Wyczyść kalkulator'),exact:true}).click();
  await expect(storage).toHaveText(b(reset));await expect(page.locator('#budget-hotel')).toHaveValue('');
  await expect(page.locator('#budget-flight')).toHaveValue('');
  expect(await page.evaluate(key=>localStorage.getItem(key),savedTripsKey)).toBe(saved);
  await expect(page.locator('#trip-share-link')).toHaveValue(link);
  await expect(page.getByTestId('share-version')).toHaveText(savedTripCopy[locale].linkOld);
  if(locale==='pl')await storage.screenshot({path:info.outputPath('reset.png')});
  await page.reload();await expect(page.locator('#budget-hotel')).toHaveValue('');
  await expect(actions.getByRole('button',{name:planEditorCopy[locale].update,exact:true})).toBeEnabled();await page.locator('#budget-hotel').fill('456');
  const before=await page.evaluate(()=>Object.fromEntries(Object.entries(sessionStorage).filter(([key])=>key.startsWith('hoptrip.plan-draft.v1:'))));
  await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){
   if(key.startsWith('hoptrip.plan-draft.v1:'))throw new DOMException('Synthetic quota','QuotaExceededError');return original.call(this,key,value);
  };});
  await page.getByRole('button',{name:b('Wyczyść kalkulator'),exact:true}).click();
  await expect(storage).toHaveText(planEditorCopy[locale].sessionError);
  await expect(storage).not.toHaveText(b(reset));
  expect(await page.evaluate(()=>Object.fromEntries(Object.entries(sessionStorage).filter(([key])=>key.startsWith('hoptrip.plan-draft.v1:'))))).toEqual(before);
  await expect(page.locator('#budget-hotel')).toHaveValue('');
  expect((await new AxeBuilder({page}).include('#calculator').analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });

 test(`search, validation, filter application and clearing feedback in ${locale}`,async({page},info)=>{
  await page.goto(localizedHref('/?origin=WRO',locale));
  const form=page.locator('.hero form');
  await form.locator('[name="origin"]').fill('Test-only invalid airport');
  await form.locator('button[type="submit"]').click();
  await expect(form.getByRole('alert')).toHaveText(filterText(locale,'Nie znaleziono lotniska. Sprawdź nazwę miasta lub kod IATA.'));
  await expect(form.locator('[name="origin"]')).toBeFocused();
  await form.locator('[name="origin"]').fill('WRO');await form.locator('[name="budget"]').fill('300');
  let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/*',async route=>{if(route.request().method()==='POST'&&route.request().headers()['next-action'])await gate;await route.continue();});
  try{
   await form.locator('button[type="submit"]').click();
   await expect(form).toHaveAttribute('aria-busy','true');
   await expect(form.getByRole('status')).toHaveText(stateText(locale,'Stosujemy wybrane filtry…'));
   await expect(form.locator('button[type="submit"]')).toBeDisabled();
   if(locale==='pl')await form.screenshot({path:info.outputPath('searching.png')});
   release();await expect(page).toHaveURL(/\/deals\?origin=WRO&budget=300$/);
  }finally{release();await page.unrouteAll({behavior:'wait'});}
  await expect(page.locator('.result-count')).toHaveAttribute('role','status');
  await expect(page.locator('.result-count')).toContainText(catalogText(locale,'Liczba ofert:'));
  await expect(page.locator('.active-filters')).toContainText('300');
  await page.getByRole('link',{name:filterText(locale,'Wyczyść wszystkie filtry'),exact:true}).click();
  await expect(page).toHaveURL(new URL(localizedHref('/deals',locale),info.project.use.baseURL!).href);
  await expect(page.locator('.active-filters')).toContainText(filterText(locale,'Brak dodatkowych filtrów.'));
  await expect(page.locator('.filters')).toHaveAttribute('aria-busy','false');
 });
}
