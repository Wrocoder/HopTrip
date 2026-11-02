import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {budgetText} from '../src/lib/i18n/budget-copy';
import {emptyBudget} from '../src/lib/trip-budget';

test.setTimeout(60000);

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

for(const locale of ['pl','en','ru','uk'] as const)test(`quick and detailed budgets retain all costs in ${locale}`,async({page},testInfo)=>{
 const t=(source:string)=>budgetText(locale,source);
 await page.setViewportSize({width:320,height:844});
 await page.goto(`${locale==='pl'?'':`/${locale}`}/deals/browser-deal#calculator`);
 const modes=page.getByRole('group',{name:t('Tryb kalkulatora')});
 const quick=modes.getByRole('button',{name:t('Szybki budżet'),exact:true});
 const detailed=modes.getByRole('button',{name:t('Szczegółowy budżet'),exact:true});
 await expect(quick).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#budget-flight')).toHaveValue('200.25');
 await expect(page.locator('#budget-taxes')).not.toBeVisible();
 await page.locator('#budget-start').fill('2030-05-01');
 await page.locator('#budget-end').fill('2030-05-03');
 await page.locator('#budget-people').fill('2');
 await page.locator('#budget-hotel-basis').selectOption('stay');
 for(const [key,value] of Object.entries({hotel_total:'900',transfers:'100',food:'40'}))await page.locator(`#budget-${key}`).fill(value);
 await expect(page.getByTestId('budget-total')).toContainText(/1\D?640[,.]50/);
 await expect(page.locator('#calculator').getByRole('status')).toContainText(t('Budżet niepełny. Do uzupełnienia:'));
 await page.locator('#calculator').screenshot({path:testInfo.outputPath(`quick-${locale}.png`),scale:'css'});
 await detailed.focus();await page.keyboard.press('Enter');
 await expect(detailed).toHaveAttribute('aria-pressed','true');
 for(const [key,value] of Object.entries({baggage:'20',local_transport:'10',activities:'30',other:'50',taxes:'12,34',buffer:'100'}))await page.locator(`#budget-${key}`).fill(value);
 await expect(page.getByTestId('budget-total')).toContainText(/1\D?922[,.]84/);
 await expect(page.getByTestId('budget-person')).toContainText(/961[,.]42/);
 await expect(page.locator('#calculator').getByRole('status')).not.toContainText(t('Budżet niepełny. Do uzupełnienia:'));
 await page.locator('#calculator').screenshot({path:testInfo.outputPath(`detailed-${locale}.png`),scale:'css'});
 await quick.click();
 await expect(page.locator('#budget-taxes')).not.toBeVisible();
 await expect(page.getByTestId('budget-total')).toContainText(/1\D?922[,.]84/);
 await page.reload();await detailed.click();
 await expect(page.locator('#budget-taxes')).toHaveValue('12,34');
 await expect(page.locator('#budget-flight')).toHaveValue('200.25');
 await expect(page.getByTestId('budget-total')).toContainText(/1\D?922[,.]84/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('#calculator').analyze()).violations).toEqual([]);
});

test('hidden invalid detailed costs can be reached and corrected from quick budget',async({page})=>{
 await page.goto('/info/trip-budget#calculator');
 const modes=page.getByRole('group',{name:'Tryb kalkulatora'});
 await modes.getByRole('button',{name:'Szczegółowy budżet',exact:true}).click();
 await page.locator('#budget-taxes').fill('-1');
 await modes.getByRole('button',{name:'Szybki budżet',exact:true}).click();
 await expect(page.getByTestId('budget-total')).toHaveCount(0);
 await expect(page.locator('#calculator')).toContainText('Błąd w dodatkowych kosztach.');
 await page.locator('#calculator > p').filter({hasText:'Błąd w dodatkowych kosztach.'}).getByRole('button').click();
 await expect(page.locator('#budget-taxes')).toBeVisible();
 await expect(page.locator('#budget-taxes')).toBeFocused();
 await expect(page.locator('#budget-taxes')).toHaveAttribute('aria-invalid','true');
 await page.locator('#budget-taxes').fill('0');
 await expect(page.getByTestId('budget-total')).toContainText('0,00');
 await page.getByRole('button',{name:'Wyczyść kalkulator',exact:true}).click();
 await expect(page.locator('#budget-taxes')).toHaveValue('');
 await expect(page.locator('#budget-buffer')).toHaveValue('');
});

test('legacy plan and new taxes/buffer survive save/share without reallocating old contingency',async({page,browser})=>{
 const input:Partial<typeof emptyBudget>={...emptyBudget,flight:'100',people:'3',other:'50'};
 delete input.taxes;delete input.buffer;
 const old={version:1,input,start:'2030-05-01',end:'2030-05-03',context:'legacy',review:false};
 await page.addInitScript(d=>localStorage.setItem('hoptrip.budget.v1:deal:browser-deal',JSON.stringify(d)),old);
 await page.goto('/deals/browser-deal#calculator');
 const modes=page.getByRole('group',{name:'Tryb kalkulatora'});
 await modes.getByRole('button',{name:'Szczegółowy budżet',exact:true}).click();
 await expect(page.locator('#budget-other')).toHaveValue('50');
 await expect(page.locator('#budget-taxes')).toHaveValue('');
 await expect(page.locator('#budget-buffer')).toHaveValue('');
 await expect(page.getByTestId('budget-total')).toContainText('350,00');
 await page.locator('#budget-taxes').fill('12,34');await page.locator('#budget-buffer').fill('100');
 await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
 await page.getByRole('button',{name:'Udostępnij',exact:true}).click();
 const url=await page.locator('#trip-share-link').inputValue();
 const context=await browser.newContext();
 try{
  const copy=await context.newPage();await copy.goto(url);
  await expect(copy.getByTestId('budget-total')).toContainText('462,34');
  await copy.getByRole('group',{name:'Tryb kalkulatora'}).getByRole('button',{name:'Szczegółowy budżet',exact:true}).click();
  await expect(copy.locator('#budget-other')).toHaveValue('50');
  await expect(copy.locator('#budget-taxes')).toHaveValue('12,34');
  await copy.locator('#budget-buffer').fill('200');
  await expect(copy.getByTestId('budget-total')).toContainText('562,34');
 }finally{await context.close();}
 await page.goto('/saved');await page.locator('main a[href^="/trip?plan="]').first().click();
 await expect(page.getByTestId('budget-total')).toContainText('462,34');
});
