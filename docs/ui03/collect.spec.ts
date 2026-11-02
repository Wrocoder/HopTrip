import {test} from '@playwright/test';
import {writeFileSync} from 'node:fs';

test('UI-03 before-change viewport measurements',async({page},info)=>{
 test.setTimeout(180000);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const measurements=[];
 for(const locale of ['pl','ru'])for(const width of [320,375,390,768,1440]){
  await page.setViewportSize({width,height:844});
  for(const path of ['/','/deals?origin=WRO','/deals/browser-deal']){
   await page.goto(`${locale==='pl'?'':`/${locale}`}${path}`);
   if(path.includes('browser-deal'))await page.locator('#budget-start').waitFor({state:'visible'});
   measurements.push({locale,width,path,...await page.evaluate(()=>({
    scrollWidth:document.documentElement.scrollWidth,
    fields:[...document.querySelectorAll<HTMLInputElement>('input[type="date"],.language-switcher a')].filter(e=>e.getBoundingClientRect().height>0).map(e=>{
     const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{id:e.id,name:e.getAttribute('name'),text:e.textContent?.slice(0,40),width:r.width,height:r.height,font:s.fontSize};
    }),
   }))});
   if(locale==='pl'&&[375,390].includes(width)&&!path.includes('browser-deal'))await page.locator('.filter-panel').screenshot({path:info.outputPath(`before-${width}-${path==='/'?'home':'catalog'}.png`),scale:'css',animations:'disabled'});
  }
 }
 await page.setViewportSize({width:375,height:400});await page.goto('/deals');
 const airport=page.locator('input[name="origin"]');await airport.fill('');await airport.focus();await airport.press('ArrowUp');
 const listbox=page.locator('[role="listbox"]').filter({has:page.locator('[aria-selected="true"]')});
 const combo=await listbox.evaluate(list=>{
  const active=list.querySelector('[aria-selected="true"]')!,lr=list.getBoundingClientRect(),ar=active.getBoundingClientRect();
  return{list:lr.toJSON(),active:ar.toJSON(),scrollTop:list.scrollTop,viewport:innerHeight,activeVisible:ar.top>=lr.top&&ar.bottom<=Math.min(lr.bottom,innerHeight)};
 });
 await page.locator('.filter-panel').screenshot({path:info.outputPath('before-airport-keyboard.png'),scale:'css',animations:'disabled'});
 writeFileSync(info.outputPath('before.json'),JSON.stringify({measurements,combo},null,2));
});
