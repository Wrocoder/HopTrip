import {test,expect,type Locator} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';

async function activeGeometry(input:Locator) {
 return input.evaluate(el=>{
  const option=document.getElementById(el.getAttribute('aria-activedescendant')??'');
  if(!option)return null;
  const list=option.closest('[role="listbox"]')!,r=option.getBoundingClientRect(),lr=list.getBoundingClientRect();
  return{rect:r.toJSON(),list:lr.toJSON(),scroll:list.scrollTop,focused:document.activeElement===el,
   visible:r.top>=Math.max(lr.top,0)&&r.bottom<=Math.min(lr.bottom,innerHeight)&&r.left>=0&&r.right<=innerWidth};
 });
}
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
for(const locale of ['pl','en','ru','uk'] as const)test(`visible keyboard options and touch navigation in ${locale}`,async({page},info)=>{
 await page.setViewportSize({width:375,height:400});await page.goto(localizedHref('/deals',locale));
 const measurements=[];
 for(const name of ['origin','destination']){
  const input=page.locator(`.filters input[name="${name}"]`);
  await input.fill('');await input.press('ArrowUp');
  await expect.poll(async()=>(await activeGeometry(input))?.visible).toBe(true);
  await expect(input).toBeFocused();measurements.push({name,...await activeGeometry(input)});
  const value=await input.inputValue();await input.press('Escape');await expect(input).toHaveValue(value);await expect(input).toHaveAttribute('aria-expanded','false');
  await input.press('ArrowDown');await expect.poll(async()=>(await activeGeometry(input))?.visible).toBe(true);
  await input.press('Enter');await expect(input).toHaveAttribute('aria-expanded','false');await expect(input).not.toHaveValue('');
 }
 for(const link of await page.locator('.language-switcher a').all()){
  const r=await link.boundingBox();expect(r!.height).toBeGreaterThanOrEqual(44);expect(r!.width).toBeGreaterThanOrEqual(44);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 writeFileSync(info.outputPath(`picker-${locale}.json`),JSON.stringify(measurements,null,2));
 if(locale==='pl'){
  const input=page.locator('.filters input[name="origin"]');await input.fill('');await input.press('ArrowUp');
  await page.screenshot({path:info.outputPath('picker-short.png'),scale:'css',animations:'disabled'});
 }
});
