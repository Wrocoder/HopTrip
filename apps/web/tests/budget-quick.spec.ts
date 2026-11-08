import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {budgetQuickCopy} from '../src/lib/i18n/budget-quick-copy';
import {budgetProfileCopy} from '../src/lib/i18n/budget-profile-copy';
import {budgetText} from '../src/lib/i18n/budget-copy';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.route('https://api.nbp.pl/**',route=>route.fulfill({json:{table:'A',code:'EUR',rates:[{mid:4,effectiveDate:new Date().toISOString().slice(0,10)}]}}));
});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: quick input, honest totals and independent profile comparison preserve the plan`,async({page},info)=>{
 test.setTimeout(120000);
 const copy=budgetQuickCopy[locale],profiles=budgetProfileCopy[locale],t=(key:string)=>budgetText(locale,key);
 await page.goto(localizedHref('/deals/browser-deal#calculator',locale));
 const quick=page.getByTestId('budget-quick-start');await expect(quick).toContainText(copy.progress.replace('{count}','1'));
 const beforeHash=new URL(page.url()).hash;
 await quick.getByRole('button',{name:`${copy.fill}: ${t('Nocleg')}`,exact:true}).click();
 await expect(page.locator('#budget-hotel')).toBeFocused();expect(new URL(page.url()).hash).toBe(beforeHash);
 await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');await page.locator('#budget-people').fill('2');
 await page.locator('#budget-hotel-basis').selectOption('stay');await page.locator('#budget-hotel_total').fill('900');
 await page.locator('#budget-food').fill('40');await page.locator('#budget-transfers').fill('100');
 await expect(quick).toContainText(copy.progress.replace('{count}','4'));
 await expect(page.getByTestId('budget-total')).toContainText(/1\D?640[,.]50/);
 const result=page.getByTestId('budget-total').locator('xpath=../..');
 await expect(result.getByRole('heading')).toContainText(t('Suma znanych kosztów'));
 expect(await result.evaluate(el=>Boolean(el.compareDocumentPosition(document.getElementById('budget-profiles')!)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
 await page.getByRole('button',{name:t('Szczegółowy budżet'),exact:true}).click();
 for(const key of ['baggage','local_transport','activities','other','taxes','buffer'])await page.locator(`#budget-${key}`).fill('0');
 await expect(result.getByRole('heading')).toContainText(t('Budżet według wpisanych kosztów'));
 for(const key of ['hotel_total','food','transfers'])await page.locator(`#budget-${key}`).fill('');
 const select=page.getByRole('group',{name:profiles.title});
 for(const [id,hotel,food,transfers] of [['economy',['100','150'],['20','30'],['50','80']],['comfort',['200','250'],['40','50'],['100','150']]] as const){
  await select.getByRole('button',{name:profiles.names[id],exact:true}).click();await page.locator('#profile-hotel-basis').selectOption('night');
  for(const [key,range] of [['hotel',hotel],['food',food],['transfers',transfers]] as const){
   await page.locator(`#profile-${key}-min`).fill(range[0]);await page.locator(`#profile-${key}-max`).fill(range[1]);
  }
 }
 const comparison=page.getByTestId('budget-profile-comparison');
 await expect(comparison.locator('[data-profile="economy"]')).toContainText(/770[,.]50.*960[,.]50/);
 await expect(comparison.locator('[data-profile="comfort"]')).toContainText(/1\D?140[,.]50.*1\D?350[,.]50/);
 await expect(comparison.locator('[data-profile="standard"]')).toContainText(copy.empty);
 await expect(select.getByRole('button',{name:profiles.names.comfort,exact:true})).toHaveAttribute('aria-pressed','true');
 await page.reload();await expect(comparison.locator('[data-profile="economy"]')).toContainText(/770[,.]50.*960[,.]50/);
 await expect(page.locator('#budget-flight')).toHaveValue('200.25');
 await expect(quick).toContainText(copy.progress.replace('{count}','1'));
 for(const width of [320,375,390,768,1440]){
  await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(comparison.getByRole('row')).toHaveCount(4);
 }
 expect((await new AxeBuilder({page}).include('#calculator').analyze()).violations).toEqual([]);
 if(locale==='ru'){
  await comparison.screenshot({path:info.outputPath('profile-comparison-ru-1440.png'),scale:'css'});
  await page.setViewportSize({width:320,height:844});await comparison.screenshot({path:info.outputPath('profile-comparison-ru-320.png'),scale:'css'});
 }
});
