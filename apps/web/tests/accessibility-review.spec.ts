import {test,expect,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';
import {scoreText} from '../src/lib/i18n/score-copy';
import {plannedEventsCopy} from '../src/lib/i18n/planned-events-copy';
import {catalogText} from '../src/lib/i18n/catalog-copy';

async function namedControls(scope:Locator) {
 const targets=[];
 for(const control of await scope.locator('input:not([type="hidden"]),select,textarea,button').all())if(await control.isVisible()){
  await expect(control).toHaveAccessibleName(/\S/);
  const tag=await control.evaluate(el=>el.tagName),rect=await control.boundingBox();
  targets.push({tag,type:await control.getAttribute('type'),rect});
  if(tag==='BUTTON'){expect(rect!.width).toBeGreaterThanOrEqual(24);expect(rect!.height).toBeGreaterThanOrEqual(24);}
 }
 return targets;
}

for(const locale of ['pl','en','ru','uk'] as const)test(`accessible core states and planned-event removal in ${locale}`,async({page},info)=>{
 test.setTimeout(180000);
 if(info.project.name==='mobile')await page.setViewportSize({width:320,height:844});
 await page.route('**/api/v1/deals/*/events?**',route=>route.fulfill({json:{status:'READY',partial:false,checked_at:null,events:['a','b'].map(id=>({
  id:`a11y-${id}`,name:`Test-only accessibility event ${id}`,venue:'Fixture venue',city:'Barcelona',category:'MUSIC',
  start_date:new URL(route.request().url()).searchParams.get('start_date'),end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',
  url:`https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Fa11y-${id}`,price_from:null,currency:null,
 }))}}));
 const audits:unknown[]=[],trees:unknown[]=[],targets:unknown[]=[];
 const scan=async(state:string)=>{
  const result=await new AxeBuilder({page}).analyze();
  const missing=await page.evaluate(()=>[...document.querySelectorAll('[aria-labelledby],[aria-describedby],[aria-controls],[aria-activedescendant]')].flatMap(el=>
   ['aria-labelledby','aria-describedby','aria-controls','aria-activedescendant'].flatMap(attr=>(el.getAttribute(attr)??'').split(/\s+/).filter(Boolean).filter(id=>!document.getElementById(id)).map(id=>({tag:el.tagName,attr,id})))));
  audits.push({state,violations:result.violations,incomplete:result.incomplete,missing});
  writeFileSync(info.outputPath(`axe-${locale}.json`),JSON.stringify(audits,null,2));
  expect(result.violations).toEqual([]);expect(missing).toEqual([]);
  expect(result.incomplete.filter(rule=>rule.id!=='color-contrast')).toEqual([]);
 };
 await page.goto(localizedHref('/deals',locale));
 const consent=page.locator('.consent-panel');await expect(consent).toBeVisible();targets.push(...await namedControls(consent));await scan('initial-consent');
 if(locale==='pl')await consent.screenshot({path:info.outputPath('consent.png'),scale:'css',animations:'disabled'});
 await consent.locator('.consent-actions button').first().focus();await page.keyboard.press('Enter');
 await expect(consent).toHaveCount(0);await expect(page.locator('.privacy-settings')).toBeFocused();
 await page.goto(localizedHref('/',locale));
 await page.keyboard.press('Tab');await expect(page.locator('.skip-link')).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('#content')).toBeFocused();
 targets.push(...await namedControls(page.locator('main')));await scan('home');
 await page.goto(localizedHref('/deals',locale));await expect(page.locator('.deal-card').first()).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.deal-card').first().hover();await expect(page.locator('.deal-card').first()).toHaveCSS('transform','none');
 const trigger=page.locator('.score-trigger').first();await trigger.focus();await page.keyboard.press('Enter');
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog).toHaveAccessibleName(/\S/);
  await expect(dialog.getByRole('group',{name:catalogText(locale,'Cena na tle historii'),exact:true})).toBeVisible();
 await expect(dialog.locator('.score-close')).toHaveAccessibleName(scoreText(locale,'close'));await expect(dialog.locator('.score-close')).toBeFocused();
  const closeRect=await dialog.locator('.score-close').boundingBox();expect(closeRect!.width).toBeGreaterThanOrEqual(44);expect(closeRect!.height).toBeGreaterThanOrEqual(44);targets.push({tag:'modal-close',rect:closeRect});
  if(locale==='pl')await page.screenshot({path:info.outputPath('dialog.png'),scale:'css',animations:'disabled'});
 expect(await dialog.evaluate(el=>el.matches(':modal'))).toBe(true);await page.keyboard.press('Shift+Tab');
 const boundary=await page.evaluate(()=>({inside:!!document.activeElement?.closest('dialog[open]'),browser:!document.hasFocus()&&document.activeElement===document.body}));
 expect(boundary.inside||boundary.browser).toBe(true);if(boundary.browser)await page.keyboard.press('Shift+Tab');
 expect(await page.evaluate(()=>!!document.activeElement?.closest('dialog[open]'))).toBe(true);
 trees.push({state:'dialog',tree:await dialog.ariaSnapshot()});await scan('modal');
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();
 const origin=page.locator('.filters input[name="origin"]');await origin.fill('missing-airport');await page.locator('.filters button[type="submit"]').click();
 const alert=page.locator('.filters [role="alert"]');await expect(alert).toBeVisible();await expect(origin).toBeFocused();await expect(origin).toHaveAttribute('aria-invalid','true');await expect(origin).toHaveAccessibleDescription(/\S/);
 await scan('filter-error');
 await page.goto(localizedHref('/deals/browser-deal',locale));await expect(page.locator('#budget-flight')).toBeEnabled();
  const eur=page.locator('small.price-eur').first();
  if(await eur.count()){
   await expect(eur).not.toHaveAttribute('aria-label');await expect(eur.locator('[aria-hidden="true"]')).toBeVisible();
   await expect(eur.locator('[aria-hidden="true"]')).toHaveCSS('display','inline');
   await expect(eur.locator('.sr-only')).toHaveText((await eur.getAttribute('title'))!);
   const euroTree=await eur.ariaSnapshot();expect(euroTree).toContain('NBP');trees.push({state:'eur-explanation',tree:euroTree});
  }else trees.push({state:'eur-not-published',note:'Optional conversion; deterministic rate-present and rate-missing branches are tested in Node.'});
 const start=await page.locator('#budget-start').inputValue(),end=new Date(start+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+2);
 await page.locator('#budget-end').fill(end.toISOString().slice(0,10));
 for(const id of ['a','b'])await page.locator(`#trip-events button[aria-label$=": Test-only accessibility event ${id}"]`).click();
 const first=page.locator('#planned-events > ul > li').filter({has:page.getByRole('heading',{name:'Test-only accessibility event a',exact:true})});
 const second=page.locator('#planned-events > ul > li').filter({has:page.getByRole('heading',{name:'Test-only accessibility event b',exact:true})});
 await first.locator('input[inputmode="numeric"]').fill('2');await first.locator('input[inputmode="decimal"]').fill('10');await second.locator('input[inputmode="decimal"]').fill('30');
 await expect(page.getByTestId('budget-total')).toContainText(/250[,.]25/);
  targets.push(...await namedControls(page.locator('main')));await scan('detail-planned');
  if(locale==='pl')await page.locator('.detail-summary').screenshot({path:info.outputPath('price.png'),scale:'css',animations:'disabled'});
 await page.locator('#budget-flight').fill('-1');await first.locator('input[inputmode="numeric"]').fill('0');
 for(const control of [page.locator('#budget-flight'),first.locator('input[inputmode="numeric"]')]){
  await expect(control).toHaveAttribute('aria-invalid','true');await expect(control).toHaveAccessibleDescription(/\S/);
  const ids=(await control.getAttribute('aria-describedby'))!.split(/\s+/);const error=page.locator(`[id="${ids.at(-1)}"]`);await expect(error).toBeVisible();await expect(error).toHaveText(/\S/);
 }
 await scan('detail-errors');
 await page.locator('#budget-flight').fill('200.25');await first.locator('input[inputmode="numeric"]').fill('2');
 await first.getByRole('button',{name:`${plannedEventsCopy[locale].remove}: Test-only accessibility event a`,exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.locator('#planned-events')).toBeFocused();await expect(page.getByTestId('budget-total')).toContainText(/230[,.]25/);
 await second.getByRole('button',{name:`${plannedEventsCopy[locale].remove}: Test-only accessibility event b`,exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page.locator('#planned-events')).toHaveCount(0);await expect(page.locator('#calculator')).toBeFocused();await expect(page.getByTestId('budget-total')).toContainText(/200[,.]25/);
 trees.push({state:'calculator-after-removal',tree:await page.locator('#calculator').ariaSnapshot()});
  const colors=await page.evaluate(()=>{
   const root=getComputedStyle(document.documentElement),token=(name:string)=>root.getPropertyValue(name).trim();
   const rgb=(color:string)=>{
    if(!color.startsWith('#'))return color.match(/[\d.]+/g)!.slice(0,3).map(Number);
    const hex=color.length===4?[...color.slice(1)].map(c=>c+c).join(''):color.slice(1);
    return hex.match(/../g)!.map(n=>parseInt(n,16));
   };
   const lum=(color:string)=>rgb(color).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
   const contrast=(a:string,b:string)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
   const backgrounds=['--color-surface','--color-surface-soft','--color-surface-subtle','--control-background'].map(token);
   const text=[...document.querySelectorAll('#trip-events h2,#trip-events header p,#trip-events form > label,#trip-events select,#budget-hotel-basis')].map(el=>{
    const s=getComputedStyle(el);return{tag:el.tagName,color:s.color,minRatio:Math.min(...backgrounds.map(bg=>contrast(s.color,bg)))};
   });
   const field=getComputedStyle(document.querySelector('#budget-hotel-basis')!);
   return{sanity:{whiteAlias:contrast('#fff','#ffffff'),blackWhite:contrast('#000','#fff')},text,backgrounds,border:{color:field.borderTopColor,background:field.backgroundColor,ratio:contrast(field.borderTopColor,field.backgroundColor)},arrow:{image:field.backgroundImage,ratio:contrast(token('--color-primary'),field.backgroundColor)}};
  });
  writeFileSync(info.outputPath(`manual-colors-${locale}.json`),JSON.stringify(colors,null,2));
  expect(colors.sanity.whiteAlias).toBe(1);expect(colors.sanity.blackWhite).toBe(21);
  for(const sample of colors.text)expect(sample.minRatio).toBeGreaterThanOrEqual(4.5);
  expect(colors.border.ratio).toBeGreaterThanOrEqual(3);expect(colors.arrow.ratio).toBeGreaterThanOrEqual(3);expect(colors.arrow.image).toContain('svg');
 await page.emulateMedia({forcedColors:'active'});await page.locator('#budget-flight').focus();await expect(page.locator('#budget-flight')).toHaveCSS('outline-width','3px');await expect(page.locator('#budget-flight')).toHaveCSS('box-shadow','none');
 await page.emulateMedia({forcedColors:'none'});await scan('after-removal');
 if(locale==='pl')await page.screenshot({path:info.outputPath('removal-focus.png'),scale:'css',animations:'disabled'});
 await page.locator('#trip-save .trip-actions button').first().click();await page.goto(localizedHref('/saved',locale));await scan('saved');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 writeFileSync(info.outputPath(`semantics-${locale}.json`),JSON.stringify(trees,null,2));
  writeFileSync(info.outputPath(`targets-${locale}.json`),JSON.stringify(targets,null,2));
});
