import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';
import {tripText} from '../src/lib/i18n/trip-copy';
import {planEditorCopy} from '../src/lib/i18n/plan-editor-copy';

for(const locale of ['pl','en','ru','uk'] as const)for(const width of [320,375,390,768,1440])test(`${locale} ${width}: responsive filter, dialog and saved plan`,async({page,context},info)=>{
 test.setTimeout(90000);
 await page.setViewportSize({width,height:900});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await context.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const states:unknown[]=[];
 const scan=async(state:string)=>{
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  states.push({state,overflow,violations:audit.violations,incomplete:audit.incomplete});
  writeFileSync(info.outputPath('responsive-states.json'),JSON.stringify({locale,width,states,errors},null,2));
  expect(overflow).toBe(false);expect(audit.violations).toEqual([]);
 };
 await page.goto(localizedHref('/deals',locale));
 await page.locator('input[name="budget"]').fill('1000');await page.locator('.filters button[type="submit"]').click();
 await expect(page).toHaveURL(/budget=1000/);await expect(page.locator('.deal-card').first()).toBeVisible();
 const trigger=page.locator('.score-trigger').first();await trigger.focus();await page.keyboard.press('Enter');
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.locator('.score-close')).toBeFocused();
 await scan('filtered-dialog');await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();
 await page.goto(localizedHref('/deals/browser-deal',locale));await expect(page.locator('#budget-flight')).toBeEnabled();
 await page.locator('#budget-hotel').fill('200');await scan('budget');
 await page.locator('#trip-save').getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true}).click();
 await expect(page).toHaveURL(/\/trip#local=/);await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy[locale].saved);
 await scan('saved-editor');expect(errors).toEqual([]);
 if(locale==='pl'&&(width===320||width===1440))await page.screenshot({path:info.outputPath(`saved-${width}.png`),fullPage:true,animations:'disabled'});
});
