import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
test('Russian guides fit 320px',async({page},testInfo)=>{
 test.setTimeout(120000);await page.setViewportSize({width:320,height:850});
 const diagnostics=[];
 for(const slug of ['rome-airports','athens-airport','london-airports','porto-airport','prague-airport','prague-weekend','rome-3-days']){
  await page.goto(`/ru/info/${slug}`);
  diagnostics.push({slug,...await page.evaluate(()=>({width:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth).map(e=>({tag:e.tagName,class:e.className,text:e.textContent?.slice(0,100),width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right}))}))});
 }
 await writeFile(testInfo.outputPath('overflow.json'),JSON.stringify(diagnostics,null,2));
 expect(diagnostics.filter(d=>d.width>320)).toEqual([]);
});
