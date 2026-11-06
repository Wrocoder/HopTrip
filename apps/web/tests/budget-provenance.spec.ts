import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {budgetOriginCopy} from '../src/lib/i18n/budget-origin-copy';
import {budgetText} from '../src/lib/i18n/budget-copy';
import {referenceText} from '../src/lib/i18n/reference-copy';
import {localizedHref} from '../src/lib/i18n/routing';
import {emptyBudget} from '../src/lib/trip-budget';
import {referenceCosts} from '../src/lib/reference-costs';

test.setTimeout(90000);
const rateResponse=()=>({table:'A',code:'EUR',rates:[{mid:4,effectiveDate:new Date().toISOString().slice(0,10)}]});
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.route('https://api.nbp.pl/**',route=>route.fulfill({json:rateResponse()}));
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: observed and reference amounts retain provenance; manual edits, zero and reset remain honest`,async({page},info)=>{
 const copy=budgetOriginCopy[locale],origin=(key:string)=>page.locator(`[data-budget-origin="${key}"]`),analytics:string[]=[];
 page.on('request',request=>{if(request.url().includes('/api/v1/analytics/events'))analytics.push(request.url());});
 await page.goto(localizedHref('/deals/browser-deal#calculator',locale));await expect(page.locator('#budget-flight')).toBeEnabled();
 await expect(origin('flight')).toHaveAttribute('data-source','OFFER');await expect(origin('flight')).toContainText(copy.OFFER);
 await expect(page.locator('#budget-flight')).toHaveAttribute('aria-describedby',/budget-flight-origin/);
 await origin('flight').locator('summary').focus();await page.keyboard.press('Enter');await expect(origin('flight').getByRole('link')).toHaveAttribute('href',localizedHref('/deals/browser-deal',locale));
 await expect(origin('flight')).toContainText(copy.note);
 await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');await page.locator('#budget-people').fill('2');
 await page.locator('#budget-hotel').fill('0');await expect(origin('hotel')).toHaveAttribute('data-source','MANUAL');await expect(origin('food')).toHaveAttribute('data-source','UNKNOWN');
 await expect(page.getByTestId('budget-total')).toContainText(/400[,.]50/);
 await page.locator('.reference-costs > summary').focus();await page.keyboard.press('Enter');
 await page.getByRole('button',{name:referenceText(locale,'apply'),exact:true}).click();
 await expect(page.locator('#budget-local_transport')).toHaveValue('52.00');await expect(origin('local_transport')).toHaveAttribute('data-source','REFERENCE');
 await expect(origin('local_transport')).toContainText(copy.REFERENCE);await expect(page.getByTestId('budget-total')).toContainText(/504[,.]50/);
 await origin('local_transport').locator('summary').focus();await page.keyboard.press('Enter');
 await expect(origin('local_transport').getByRole('link')).toHaveAttribute('href',referenceCosts[2].source);await expect(origin('local_transport')).toContainText(copy.rate);
 await page.reload();await expect(origin('flight')).toHaveAttribute('data-source','OFFER');
 await page.getByRole('group',{name:budgetText(locale,'Tryb kalkulatora')}).getByRole('button',{name:budgetText(locale,'Szczegółowy budżet'),exact:true}).click();
 await expect(origin('local_transport')).toHaveAttribute('data-source','REFERENCE');await expect(page.getByTestId('budget-total')).toContainText(/504[,.]50/);
 await origin('flight').locator('summary').focus();await page.keyboard.press('Enter');
 await origin('local_transport').locator('summary').focus();await page.keyboard.press('Enter');
 expect((await new AxeBuilder({page}).include('#calculator').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl')await page.locator('#calculator').screenshot({path:info.outputPath('provenance-320.png'),scale:'css',animations:'disabled'});
 await page.locator('#budget-flight').fill('200,25');await expect(origin('flight')).toHaveAttribute('data-source','MANUAL');
 await page.locator('#budget-local_transport').fill('0');await expect(origin('local_transport')).toHaveAttribute('data-source','MANUAL');
 await expect(page.getByTestId('budget-total')).toContainText(/400[,.]50/);
 const raw=await page.evaluate(()=>JSON.parse(localStorage.getItem('hoptrip.budget.v1:deal:browser-deal')!));expect(raw.provenance).toBeUndefined();
 await page.locator('#budget-local_transport').fill('');await expect(origin('local_transport')).toHaveAttribute('data-source','UNKNOWN');
 await page.locator('#budget-local_transport').fill('-1');await expect(origin('local_transport')).toHaveAttribute('data-source','INVALID');await expect(page.getByTestId('budget-total')).toHaveCount(0);
 await page.getByRole('button',{name:budgetText(locale,'Wyczyść kalkulator'),exact:true}).click();await page.reload();
 await expect(page.locator('#budget-flight')).toHaveValue('');await expect(origin('flight')).toHaveAttribute('data-source','UNKNOWN');expect(analytics).toEqual([]);
});

for(const action of ['manual','reset'] as const)test(`late reference conversion cannot overwrite ${action}`,async({page})=>{
 let release!:()=>void,started=false;const gate=new Promise<void>(resolve=>release=resolve);
 await page.route('https://api.nbp.pl/**',async route=>{started=true;await gate;await route.fulfill({json:rateResponse()});});
 try{
  await page.goto('/info/trip-budget#calculator');
  await page.getByRole('group',{name:'Tryb kalkulatora'}).getByRole('button',{name:'Szczegółowy budżet',exact:true}).click();
  await page.locator('.reference-costs > summary').focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:referenceText('pl','apply'),exact:true}).click();
  await expect.poll(()=>started).toBe(true);
  if(action==='manual')await page.locator('#budget-local_transport').fill('77');else await page.getByRole('button',{name:'Wyczyść kalkulator',exact:true}).click();
  release();await expect(page.locator('.reference-costs')).toContainText(budgetOriginCopy.pl.changed);
  await expect(page.locator('#budget-local_transport')).toHaveValue(action==='manual'?'77':'');
  await expect(page.locator('[data-budget-origin="local_transport"]')).toHaveAttribute('data-source',action==='manual'?'MANUAL':'UNKNOWN');
 }finally{release();}
});

test('legacy amounts and damaged source annotations remain readable and are never inferred to be live quotes',async({page})=>{
 const old={version:1,input:{...emptyBudget,people:'2',flight:'200.25',other:'23.45',hotel:'0'},start:'2030-05-01',end:'2030-05-03',context:'legacy',review:false};
 await page.addInitScript(draft=>{if(!localStorage.getItem('hoptrip.budget.v1:deal:browser-deal'))localStorage.setItem('hoptrip.budget.v1:deal:browser-deal',JSON.stringify(draft));},old);
 await page.goto('/deals/browser-deal#calculator');await expect(page.getByTestId('budget-total')).toContainText(/423[,.]95/);
 await expect(page.locator('[data-budget-origin="flight"]')).toHaveAttribute('data-source','MANUAL');
 await page.evaluate(()=>{const key='hoptrip.budget.v1:deal:browser-deal',draft=JSON.parse(localStorage.getItem(key)!);draft.provenance={version:'budget-provenance-v1',fields:{flight:{kind:'OFFER',amount:'999',offerSlug:'browser-deal',observedAt:'2026-11-04T00:00:00Z'}}};localStorage.setItem(key,JSON.stringify(draft));});
 await page.reload();await expect(page.getByTestId('budget-total')).toContainText(/423[,.]95/);await expect(page.locator('[data-budget-origin="flight"]')).toHaveAttribute('data-source','MANUAL');
 await page.locator('#budget-food').fill('0');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hoptrip.budget.v1:deal:browser-deal')!).provenance)).toBeUndefined();
});

test('new v1 save/share preserves source snapshots; editing a copy never rewrites the saved original',async({page,browser})=>{
 await page.goto('/deals/browser-deal#calculator');await expect(page.locator('#budget-flight')).toBeEnabled();
 await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');
 await page.locator('.reference-costs > summary').focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:referenceText('pl','apply'),exact:true}).click();
 await expect(page.locator('#budget-local_transport')).toHaveValue('52.00');
 await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();await expect(page).toHaveURL(/#local=/);await page.getByRole('button',{name:'Udostępnij',exact:true}).click();
 const url=await page.locator('#trip-share-link').inputValue(),context=await browser.newContext();
 try{
  const copy=await context.newPage();await copy.route('https://api.nbp.pl/**',route=>route.fulfill({json:rateResponse()}));await copy.goto(url);
  await expect(copy.locator('[data-budget-origin="flight"]')).toHaveAttribute('data-source','OFFER');
  await copy.getByRole('group',{name:'Tryb kalkulatora'}).getByRole('button',{name:'Szczegółowy budżet',exact:true}).click();
  await expect(copy.locator('[data-budget-origin="local_transport"]')).toHaveAttribute('data-source','REFERENCE');
  await copy.locator('#budget-flight').fill('350');await expect(copy.locator('[data-budget-origin="flight"]')).toHaveAttribute('data-source','MANUAL');
  await copy.reload();await expect(copy.locator('#budget-flight')).toHaveValue('350');
 }finally{await context.close();}
 await page.goto('/saved');await page.locator('main a[href^="/trip#local="]').first().click();await expect(page.locator('#budget-flight')).toHaveValue('200.25');
 await expect(page.locator('[data-budget-origin="flight"]')).toHaveAttribute('data-source','OFFER');
});
