import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';
import {encodeTrip,savedTripsKey} from '../src/lib/shared-trip';
import {emptyBudget} from '../src/lib/trip-budget';

test.setTimeout(90000);
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

for(const locale of ['pl','en','ru','uk'] as const)test(`shared visual controls, modal and trip focus in ${locale}`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(localizedHref('/deals?origin=WRO',locale));
 await page.mouse.move(0,0);
 const primary=page.locator('.filters button[type="submit"]');
 await expect(primary).toBeEnabled();
 await expect(primary).toHaveCSS('background-color','rgb(36, 92, 64)');
 await expect(primary).toHaveCSS('color','rgb(255, 255, 255)');
 await expect(primary).toHaveCSS('border-radius','10px');
 expect((await primary.boundingBox())!.height).toBeGreaterThanOrEqual(48);
 const card=page.locator('.deal-card').first();
 await expect(card).toHaveCSS('border-radius','16px');
 const trigger=card.locator('.score-trigger');
 await trigger.focus();await page.keyboard.press('Enter');
 const dialog=page.locator('.score-dialog[open]');
 await expect(dialog).toBeVisible();await expect(dialog).toHaveCSS('border-radius','24px');
 await expect(dialog.locator('.score-close')).toBeFocused();
 await page.keyboard.press('Shift+Tab');
 const firstTab=await page.evaluate(()=>({inside:!!document.activeElement?.closest('dialog[open]'),browser:!document.hasFocus()&&document.activeElement===document.body}));
 expect(firstTab.inside||firstTab.browser).toBe(true);
 // Native Chrome may visit browser chrome at the boundary; page controls stay inert.
 if(firstTab.browser)await page.keyboard.press('Shift+Tab');
 expect(await page.evaluate(()=>!!document.activeElement?.closest('dialog[open]'))).toBe(true);
 expect((await new AxeBuilder({page}).include('.score-dialog[open]').analyze()).violations).toEqual([]);
 if(locale==='pl')await dialog.screenshot({path:info.outputPath('dialog.png'),scale:'css',animations:'disabled'});
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
 const departure=new Date();departure.setUTCDate(departure.getUTCDate()+1);
 await page.locator('.filters input[name="departure_from"]').fill(departure.toISOString().slice(0,10));
 const submitted=page.waitForResponse(r=>r.request().method()==='POST'&&!!r.request().headers()['next-action']);
 await primary.click();await submitted;await expect(page).toHaveURL(/departure_from=/);
 await expect(primary).toBeEnabled();
 await page.goto(localizedHref('/deals/browser-deal',locale));
 await expect(page.locator('#budget-start')).toBeEnabled();
 const day=await page.locator('#budget-start').inputValue();
 const end=new Date(`${day}T12:00:00Z`);end.setUTCDate(end.getUTCDate()+2);
 await page.locator('#budget-end').fill(end.toISOString().slice(0,10));
 for(const selector of ['#stay-checkin','#budget-flight','#budget-hotel-basis']){
  const field=page.locator(selector);
  await expect(field).toHaveCSS('border-radius','10px');await expect(field).toHaveCSS('border-top-color','rgb(117, 139, 129)');
  await expect(field).toHaveCSS('background-color','rgb(252, 253, 251)');
  expect((await field.boundingBox())!.height).toBeGreaterThanOrEqual(48);
 }
 const secondary=page.locator('#calculator button[aria-controls="budget-details"][aria-pressed="false"]');
 await page.mouse.move(0,0);
 await expect(secondary).toHaveCSS('background-color','rgb(255, 255, 255)');
 await expect(secondary).toHaveCSS('color','rgb(36, 92, 64)');
 await secondary.focus();await expect(secondary).toHaveCSS('outline-width','3px');
 await page.locator('#budget-flight').fill('-1');
 await expect(page.locator('#budget-flight')).toHaveCSS('border-top-color','rgb(161, 38, 34)');
 const disabled=page.locator('#trip-save button').first();await expect(disabled).toBeDisabled();
 await disabled.hover({force:true});await expect(disabled).toHaveCSS('transform','none');
 await page.locator('#budget-flight').fill('100');
 await page.setViewportSize({width:320,height:844});
 const skip=page.locator('.skip-link');
 await skip.focus();await expect(skip).toBeInViewport();
 await page.locator('#budget-flight').focus();await expect(skip).not.toBeInViewport();
 await expect(skip).toHaveCSS('transform','none');await expect(skip).toHaveCSS('transition-duration','0s');
 const focus=await page.evaluate(()=>{
  const skip=document.querySelector('.skip-link')!,field=document.querySelector('#budget-flight')!;
  return {activeId:document.activeElement?.id,skipRect:skip.getBoundingClientRect().toJSON(),skipTop:getComputedStyle(skip).top,outline:getComputedStyle(field).outline,shadow:getComputedStyle(field).boxShadow};
 });
 writeFileSync(info.outputPath(`focus-${locale}.json`),JSON.stringify(focus,null,2));
 expect((await new AxeBuilder({page}).include('#calculator').include('#accommodation').analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl')await page.locator('#calculator').screenshot({path:info.outputPath('calculator-320.png'),scale:'css',animations:'disabled'});
 expect(errors).toEqual([]);
});

test('empty/error/notice states, reduced motion and forced-colors keep shared cues',async({page},info)=>{
 await page.goto('/deals?budget=1');
 const empty=page.locator('.offer-state[data-state="empty"]');
 await expect(empty).toBeVisible();await expect(empty).toHaveCSS('border-top-style','dashed');
 // Exercise the shipped loading-line CSS without a public demo route or timed provider call.
 await empty.evaluate(el=>{const line=document.createElement('div');line.className='loading-line';line.setAttribute('aria-hidden','true');el.append(line);});
 await page.emulateMedia({reducedMotion:'reduce'});
 expect(await page.locator('.loading-line').evaluate(el=>getComputedStyle(el,'::after').animationName)).toBe('none');
 await page.goto('/deals/unavailable-fixture');
 const error=page.locator('.offer-state[data-state="error"]');
 await expect(error).toBeVisible();await expect(error).toHaveCSS('background-color','rgb(255, 241, 237)');
 await expect(error).toHaveCSS('border-left-color','rgb(161, 38, 34)');
 const token=encodeTrip({version:1,offer:{slug:'missing-offer',origin:'Warsaw',destination:'Barcelona',start:'2020-01-01',end:'2020-01-03',price:'100',observedAt:''},
  draft:{version:1,input:{...emptyBudget,flight:'100'},start:'2020-01-01',end:'2020-01-03',context:'',review:true}})!;
 await page.evaluate(({key,token})=>localStorage.setItem(key,JSON.stringify([token])),{key:savedTripsKey,token});
 await page.goto('/saved');
 const saved=page.locator('main > ul > li');await expect(saved).toHaveCSS('border-radius','16px');
 const warning=saved.locator('p').filter({hasText:'Data zapisanego lotu już minęła.'});
 await expect(warning).toHaveCSS('color','rgb(109, 67, 14)');await expect(warning).toHaveCSS('background-color','rgb(255, 247, 231)');
 await page.setViewportSize({width:320,height:844});
 await page.locator('main h2').focus();await expect(page.locator('.skip-link')).not.toBeInViewport();
 await page.locator('main').screenshot({path:info.outputPath('saved-focus-320.png'),scale:'css',animations:'disabled'});
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
 await page.goto('/deals');await page.keyboard.press('Tab');await expect(page.locator('.skip-link')).toBeFocused();
 await expect(page.locator('.skip-link')).toBeInViewport();await page.keyboard.press('Enter');
 await expect(page.locator('#content')).toBeFocused();await expect(page.locator('.skip-link')).not.toBeInViewport();
 await page.emulateMedia({forcedColors:'active'});
 const select=page.locator('.sort-control select');await select.focus();
 await expect(select).toHaveCSS('outline-style','solid');await expect(select).toHaveCSS('outline-width','3px');await expect(select).toHaveCSS('box-shadow','none');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
