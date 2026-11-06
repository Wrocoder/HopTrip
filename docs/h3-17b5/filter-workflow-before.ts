import {test,expect,type Locator,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {filterText} from '../src/lib/i18n/filter-copy';
import {catalogText} from '../src/lib/i18n/catalog-copy';
import {getMessages} from '../src/lib/i18n/messages';
import {localizedHref} from '../src/lib/i18n/routing';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
async function apply(page:Page,button:Locator){
 const reply=page.waitForResponse(r=>r.request().method()==='POST' && !!r.request().headers()['next-action']);
 await button.click();await reply;
 await expect(page.locator('.filters')).toHaveAttribute('aria-busy','false');
}
async function openAdvanced(form:Locator){
 const details=form.locator('.advanced-filters');
 if(await details.getAttribute('open')===null)await details.locator('summary').click();
}

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: visible primary filters preserve manual overrides, history and reset semantics`,async({page},info)=>{
 test.setTimeout(120000);
 const t=(s:string)=>filterText(locale,s),m=getMessages(locale);
 await page.goto(localizedHref('/deals?origin=WRO&budget=300&sort=price',locale));
 const form=page.locator('.filters'),budget=page.locator('input[name="budget"]');
 const quickBudget=form.getByRole('button',{name:t('Loty do 300 zł'),exact:true});
 const nights=form.getByRole('button',{name:t('2–3 noce'),exact:true});
 await openAdvanced(form);
 for(const name of ['departure_from','departure_to','duration_min','duration_max'])await expect(form.locator(`[name="${name}"]`)).toBeVisible();
 await budget.fill('150');await expect(quickBudget).toHaveAttribute('aria-pressed','false');
 // Applying this preset resolves to the current URL; the edited field must
 // still become 300, without relying on a route-key remount.
 await apply(page,quickBudget);await expect(budget).toHaveValue('300');
 await expect(quickBudget).toHaveAttribute('aria-pressed','true');
 await budget.fill('125');
 await openAdvanced(form);
 await form.locator('[name="duration_min"]').fill('5');await form.locator('[name="duration_max"]').fill('8');
 await form.locator('[name="departure_from"]').fill('2030-05-01');
 await apply(page,nights);
 await expect(budget).toHaveValue('125');
 expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({origin:'WRO',budget:'125',duration_min:'2',duration_max:'3',departure_from:'2030-05-01',sort:'price'});
 await apply(page,nights);
 await expect(form.locator('[name="duration_min"]')).toHaveValue('');
 await expect(form.locator('[name="duration_max"]')).toHaveValue('');
 const noNights=page.url();await page.goBack();await expect(nights).toHaveAttribute('aria-pressed','true');
 await page.goForward();await expect(page).toHaveURL(noNights);
 await form.locator('[name="duration_min"]').fill('4');await form.locator('[name="duration_max"]').fill('6');
 await budget.fill('200');await apply(page,form.getByRole('button',{name:m.filter,exact:true}));
 await page.reload();await expect(budget).toHaveValue('200');
 await expect(form.locator('[name="duration_min"]')).toHaveValue('4');
 await budget.fill('210');
 await form.locator('[name="sort"]').selectOption('departure');
 await expect(page).toHaveURL(/budget=210/);await expect(form).toHaveAttribute('aria-busy','false');
 expect(new URL(page.url()).searchParams.get('sort')).toBe('departure');
 await page.locator('.filter-chips a').filter({hasText:m.budget}).click();
 await expect(page).not.toHaveURL(/budget=/);
 expect(new URL(page.url()).searchParams.get('duration_min')).toBe('4');
 await expect(page.getByRole('heading',{name:catalogText(locale,'Brak aktualnych ofert'),exact:true})).toBeVisible();
 expect((await new AxeBuilder({page}).include('.filter-panel').analyze()).violations).toEqual([]);
 if(locale==='pl')await page.locator('.filter-panel').screenshot({path:info.outputPath('filters.png')});
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl')await page.locator('.filter-panel').screenshot({path:info.outputPath('filters-320.png')});
 await page.getByRole('link',{name:t('Wyczyść wszystkie filtry'),exact:true}).click();
 await expect(page).toHaveURL(new URL(localizedHref('/deals?sort=departure',locale),info.project.use.baseURL).href);
 await expect(page.locator('.active-filters')).toContainText(t('Brak dodatkowych filtrów.'));
 expect((await page.context().cookies()).find(c=>c.name==='hoptrip.origin.v1')).toBeUndefined();
});

test('a full search wins over a delayed earlier origin preference response',async({page})=>{
 test.setTimeout(60000);
 await page.goto('/');let held=false;let release!:()=>void;
 const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/*',async route=>{
  if(route.request().method()==='POST' && route.request().headers()['next-action']){held=true;await gate;}
  await route.continue();
 });
 try{
  const origin=page.locator('#home-origin');await origin.fill('WRO');await origin.press('ArrowDown');await origin.press('Enter');
  await expect.poll(()=>held).toBe(true);
  await expect(page.locator('.hero form')).toHaveAttribute('aria-busy','false');
  await page.locator('input[name="destination"]').fill('Mediolan');
  await page.locator('input[name="budget"]').fill('300');
  await page.locator('.hero button[type="submit"]').click();
  await expect(page.locator('.hero form')).toHaveAttribute('aria-busy','true');
  release();
  await expect(page).toHaveURL(/\/deals\?origin=WRO&destination=milan&budget=300$/,{timeout:15000});
  await expect(page.locator('input[name="budget"]')).toHaveValue('300');
  await page.goBack();
  await expect(page.locator('.hero')).toBeVisible();
  await expect(page.locator('.catalog-section')).toHaveAttribute('aria-busy','false');
 }finally{release();await page.unrouteAll({behavior:'wait'});}
});

test('removing a fixed landing constraint opens the general catalog without losing unrelated conditions',async({page})=>{
 await page.goto('/city-break?origin=WRO&sort=price');
 await expect(page.locator('input[name="duration_min"]')).toHaveValue('2');
 await expect(page.locator('input[name="duration_min"]')).toHaveAttribute('readonly','');
 await page.locator('.filter-chips a').filter({hasText:'Pobyt od'}).click();
 await expect(page).toHaveURL(/\/deals\?/);
 expect(Object.fromEntries(new URL(page.url()).searchParams)).toMatchObject({origin:'WRO',duration_max:'4',sort:'price'});
 expect(new URL(page.url()).searchParams.has('duration_min')).toBe(false);
 await page.goto('/from/warszawa?budget=250&sort=price');
 await page.getByRole('link',{name:/Usuń filtr: Skąd/}).click();
 await expect(page).toHaveURL(/\/deals\?/);
 expect(Object.fromEntries(new URL(page.url()).searchParams)).toEqual({budget:'250',sort:'price'});
});
