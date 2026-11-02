import {test,expect,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';
import {filterText} from '../src/lib/i18n/filter-copy';

async function activeIndex(input:Locator){
 return input.evaluate(el=>{
  const list=document.getElementById(el.getAttribute('aria-controls')!)!;
  return [...list.children].findIndex(option=>option.id===el.getAttribute('aria-activedescendant'));
 });
}
for(const locale of ['pl','en','ru','uk'] as const)test(`combobox interaction contract in ${locale}`,async({page},info)=>{
 test.setTimeout(90000);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.setViewportSize({width:info.project.name==='mobile'?320:1440,height:900});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(localizedHref('/deals',locale));
 const initial=page.url(),form=page.locator('.filters'),states=[];
 for(const name of ['origin','destination']){
  const input=form.locator(`input[name="${name}"]`),holder=input.locator('..');
  await expect(input).toHaveAccessibleName(/\S/);await input.fill('');await input.focus();
  const id=await input.getAttribute('id'),list=holder.getByRole('listbox',{includeHidden:true});
  expect(await list.getAttribute('id')).toBe(await input.getAttribute('aria-controls'));
  expect(await input.getAttribute('aria-describedby')).toBe(`${id}-hint`);
  await input.press('ArrowUp');const count=await list.getByRole('option').count();expect(count).toBeGreaterThan(1);
  expect(await activeIndex(input)).toBe(count-1);
  await input.press('ArrowDown');expect(await activeIndex(input)).toBe(0);
  await input.press('ArrowUp');expect(await activeIndex(input)).toBe(count-1);
  await expect(list.getByRole('option').last()).toHaveAttribute('aria-selected','true');
  await expect(input).toBeFocused();
  await input.press('Escape');await expect(input).toHaveAttribute('aria-expanded','false');
  await expect(input).not.toHaveAttribute('aria-activedescendant',/./);await expect(input).toHaveValue('');
  await input.press('ArrowDown');expect(await activeIndex(input)).toBe(0);
  await input.press('Enter');await expect(input).toHaveAttribute('aria-expanded','false');
  await expect(input).not.toHaveValue('');await expect(input).toBeFocused();expect(page.url()).toBe(initial);
  await input.fill('');await input.press('ArrowDown');
  if(locale==='pl'&&name==='origin')await page.screenshot({path:info.outputPath('catalog-picker.png'),scale:'css',animations:'disabled'});
  // Pointer selection must not blur the input before the option receives click.
  if(info.project.name==='mobile')await list.getByRole('option').nth(1).tap();
  else await list.getByRole('option').nth(1).click();
  await expect(input).toHaveAttribute('aria-expanded','false');await expect(input).toBeFocused();
  await expect(input).not.toHaveValue('');expect(page.url()).toBe(initial);
  states.push({name,id,options:count,value:await input.inputValue(),focused:await input.evaluate(el=>document.activeElement===el)});
 }
 const origin=form.locator('input[name="origin"]');
 await origin.fill('Test-only invalid airport');await form.locator('button[type="submit"]').click();
 const error=form.getByRole('alert');await expect(error).toBeVisible();await expect(origin).toBeFocused();
 await expect(origin).toHaveAttribute('aria-invalid','true');
 expect((await origin.getAttribute('aria-describedby'))!.split(' ')).toContain(await error.getAttribute('id'));
 await origin.fill('WRO');await expect(origin).toHaveAttribute('aria-invalid','false');await expect(error).toHaveCount(0);
 const catalogAxe=await new AxeBuilder({page}).include('.filter-panel').analyze();expect(catalogAxe.violations).toEqual([]);
 await page.goto(localizedHref('/?origin=WRO',locale));
 const destination=page.locator('.hero input[name="destination"]');
 await destination.focus();const options=page.locator('.hero [role="listbox"]').last();
 await expect(options.getByRole('option').first()).toHaveText(filterText(locale,'Dokądkolwiek'));
 await destination.press('ArrowDown');await destination.press('Enter');
 await expect(destination).toHaveValue('');await expect(destination).toHaveAttribute('data-destination-slug','');
 await expect(destination).toHaveAttribute('aria-expanded','false');await expect(page).toHaveURL(/\/?\?origin=WRO$/);
 await destination.fill('milan');await destination.press('Tab');
 await expect(destination).toHaveAttribute('data-destination-slug','milan');
 await expect(destination).toHaveAttribute('aria-expanded','false');
 const homeAxe=await new AxeBuilder({page}).include('.hero').analyze();expect(homeAxe.violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 writeFileSync(info.outputPath(`contract-${locale}.json`),JSON.stringify({states,axe:[{scope:'catalog',violations:catalogAxe.violations},{scope:'home',violations:homeAxe.violations}]},null,2));
});
