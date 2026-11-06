import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {budgetProfileCopy} from '../src/lib/i18n/budget-profile-copy';
import {budgetText} from '../src/lib/i18n/budget-copy';
import {localizedHref} from '../src/lib/i18n/routing';
import {emptyBudget} from '../src/lib/trip-budget';
import {referenceText} from '../src/lib/i18n/reference-copy';

test.setTimeout(90000);
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.route('https://api.nbp.pl/**',route=>route.fulfill({json:{table:'A',code:'EUR',rates:[{mid:4,effectiveDate:new Date().toISOString().slice(0,10)}]}}));
});
async function fillProfile(page:import('@playwright/test').Page){
 for(const [key,min,max] of [['hotel','100','150'],['food','20','30'],['transfers','50','80']]){
  await page.locator(`#profile-${key}-min`).fill(min);await page.locator(`#profile-${key}-max`).fill(max);
 }
}
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: personal ranges, exact overrides, profile switching, reload and reset`,async({page},info)=>{
 const copy=budgetProfileCopy[locale],analytics:string[]=[];page.on('request',request=>{if(request.url().includes('/api/v1/analytics/events'))analytics.push(request.url());});
 await page.goto(localizedHref('/deals/browser-deal#calculator',locale));await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');await page.locator('#budget-people').fill('2');await page.locator('#budget-flight').fill('100.25');
 const profiles=page.getByRole('group',{name:copy.title});await expect(page.getByTestId('budget-projection')).toHaveCount(0);
 await profiles.getByRole('button',{name:copy.names.economy,exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.getByTestId('budget-projection')).toContainText(copy.noRanges);await expect(page.locator('#profile-hotel-min')).toHaveValue('');
 await fillProfile(page);await expect(page.getByTestId('projection-total')).toContainText(/570[,.]50.*760[,.]50/);
 await expect(page.getByTestId('projection-person')).toContainText(/285[,.]25.*380[,.]25/);await expect(page.getByTestId('budget-total')).toContainText(/200[,.]50/);
 await expect(page.getByTestId('budget-projection')).toContainText(copy.partial);
 await page.locator('#budget-hotel').fill('0');await expect(page.getByTestId('projection-total')).toContainText(/370[,.]50.*460[,.]50/);
 const exact=await page.evaluate(()=>JSON.parse(localStorage.getItem('hoptrip.budget.v1:deal:browser-deal')!).input);
 await profiles.getByRole('button',{name:copy.names.comfort,exact:true}).click();await expect(page.locator('#profile-food-min')).toHaveValue('');
 await expect(page.getByTestId('budget-projection')).toContainText(copy.noRanges);
 await profiles.getByRole('button',{name:copy.names.economy,exact:true}).click();await expect(page.locator('#profile-food-min')).toHaveValue('20');
 await page.reload();await expect(profiles.getByRole('button',{name:copy.names.economy,exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByTestId('projection-total')).toContainText(/370[,.]50.*460[,.]50/);
 expect((await new AxeBuilder({page}).include('#calculator').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl')await page.locator('#budget-profiles').screenshot({path:info.outputPath('profiles-320.png'),scale:'css',animations:'disabled'});
 await page.getByRole('button',{name:copy.clearAll,exact:true}).click();await expect(page.getByTestId('budget-projection')).toHaveCount(0);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hoptrip.budget.v1:deal:browser-deal')!).input)).toEqual(exact);
 expect(analytics).toEqual([]);
});
test('stay/night basis, dates, corrected invalid ranges and exact-source transport retain honest totals',async({page})=>{
 const copy=budgetProfileCopy.pl;await page.goto('/deals/browser-deal#calculator');await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');await page.locator('#budget-people').fill('2');await page.locator('#budget-flight').fill('100.25');
 await page.getByRole('button',{name:copy.names.standard,exact:true}).click();await fillProfile(page);
 await page.locator('#profile-hotel-basis').selectOption('stay');await expect(page.getByTestId('projection-total')).toContainText(/470[,.]50.*610[,.]50/);
 await page.locator('#profile-hotel-basis').selectOption('night');await page.locator('#budget-end').fill('2030-05-05');await expect(page.getByTestId('projection-total')).toContainText(/850[,.]50.*1\D?180[,.]50/);
 await page.locator('#profile-food-min').fill('99');await expect(page.locator('#profile-food-min')).toHaveAttribute('aria-invalid','true');await expect(page.getByTestId('projection-total')).toHaveCount(0);
 await page.reload();await expect(page.locator('#profile-food-min')).toHaveValue('99');await expect(page.getByRole('button',{name:'Zapisz wyjazd',exact:true})).toBeDisabled();
 await page.locator('#profile-food-min').fill('20');await expect(page.getByTestId('projection-total')).toBeVisible();
 await page.locator('.reference-costs > summary').focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:referenceText('pl','apply'),exact:true}).click();
 await expect(page.locator('#budget-local_transport')).toHaveValue('52.00');await expect(page.getByTestId('projection-total')).toContainText(/954[,.]50.*1\D?284[,.]50/);
 await expect(page.locator('[data-budget-origin="local_transport"]')).toHaveAttribute('data-source','REFERENCE');
});
test('profiles persist in v1 snapshots and saved previews; recipient edits keep the original intact',async({page,browser})=>{
 const copy=budgetProfileCopy.pl;await page.goto('/deals/browser-deal#calculator');await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');await page.locator('#budget-people').fill('2');await page.locator('#budget-flight').fill('100.25');
 await page.getByRole('button',{name:copy.names.economy,exact:true}).click();await fillProfile(page);await expect(page.locator('#trip-save')).toContainText(copy.share);
 await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();await expect(page).toHaveURL(/#local=/);await page.getByRole('button',{name:'Udostępnij',exact:true}).click();const url=await page.locator('#trip-share-link').inputValue();
 const context=await browser.newContext();try{const recipient=await context.newPage();await recipient.goto(url);
  await expect(recipient.getByTestId('projection-total')).toContainText(/570[,.]50.*760[,.]50/);await recipient.locator('#profile-hotel-max').fill('200');
  await expect(recipient.getByTestId('projection-total')).toContainText(/570[,.]50.*860[,.]50/);await recipient.reload();await expect(recipient.locator('#profile-hotel-max')).toHaveValue('200');
 }finally{await context.close();}
 await page.goto('/saved');await expect(page.getByTestId('projection-total')).toContainText(/570[,.]50.*760[,.]50/);
 await page.locator('main a[href^="/trip#local="]').first().click();await expect(page.locator('#profile-hotel-max')).toHaveValue('150');
});
test('legacy drafts remain exact and malformed profile metadata recovers amounts before explicit discard',async({page})=>{
 const draft={version:1,input:{...emptyBudget,flight:'123.45',food:'0'},start:'',end:'',context:'legacy',review:false,estimates:{version:'future'}};
 await page.addInitScript(value=>{if(!localStorage.getItem('hoptrip.budget.v1:standalone'))localStorage.setItem('hoptrip.budget.v1:standalone',JSON.stringify(value));},draft);
 await page.goto('/info/trip-budget#calculator');await expect(page.locator('#budget-flight')).toHaveValue('123.45');await expect(page.getByTestId('budget-total')).toContainText(/246[,.]90/);
 await expect(page.locator('#budget-profiles')).toContainText(budgetProfileCopy.pl.recovery);await expect(page.getByRole('button',{name:budgetProfileCopy.pl.names.economy,exact:true})).toBeDisabled();
 await page.getByRole('button',{name:budgetProfileCopy.pl.clearAll,exact:true}).click();await expect(page.locator('#budget-flight')).toHaveValue('123.45');await expect(page.locator('#budget-food')).toHaveValue('0');
 await page.getByRole('button',{name:budgetProfileCopy.pl.names.economy,exact:true}).click();await page.getByRole('button',{name:budgetProfileCopy.pl.seed,exact:true}).click();
 await expect(page.locator('#profile-food-min')).toHaveValue('0');await expect(page.locator('#profile-food-max')).toHaveValue('0');await expect(page.locator('#profile-hotel-min')).toHaveValue('');
 await page.locator('#profile-food-max').fill('1');await page.getByRole('button',{name:budgetProfileCopy.pl.seed,exact:true}).click();await expect(page.locator('#profile-food-max')).toHaveValue('1');
 await page.getByRole('button',{name:budgetText('pl','Wyczyść kalkulator'),exact:true}).click();await expect(page.getByTestId('budget-projection')).toHaveCount(0);
});
