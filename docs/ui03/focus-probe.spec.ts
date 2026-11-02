import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
test.use({viewport:{width:768,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
test('UI-03 live focus and element capture probe',async({page},info)=>{
 await page.addInitScript(()=>{localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('test-only');}}});});
 await page.goto('/deals/browser-deal');await expect(page.locator('#budget-flight')).toBeEnabled();
 const day=await page.locator('#budget-start').inputValue(),end=new Date(day+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+2);
 await page.locator('#budget-end').fill(end.toISOString().slice(0,10));
 await page.setViewportSize({width:768,height:400});await page.locator('#budget-flight').focus();await page.locator('#budget-flight').scrollIntoViewIfNeeded();await page.keyboard.press('Escape');
 await page.setViewportSize({width:768,height:844});await page.locator('#trip-save .trip-actions button').nth(1).tap();
 const probe=()=>page.evaluate(()=>{const e=document.querySelector('.skip-link')!,s=getComputedStyle(e);return {activeTag:document.activeElement?.tagName,activeId:document.activeElement?.id,activeClass:document.activeElement?.className,skipFocused:e.matches(':focus'),top:s.top,rect:e.getBoundingClientRect().toJSON(),height:innerHeight,visualHeight:visualViewport?.height,scrollY};});
 const data={before:await probe(),afterElement:null as unknown,focused:null as unknown,afterFocused:null as unknown};
 await page.locator('#calculator').screenshot({path:info.outputPath('probe-element.png'),scale:'css',animations:'disabled'});data.afterElement=await probe();
 await page.locator('#budget-flight').focus();await page.locator('#budget-flight').scrollIntoViewIfNeeded();data.focused=await probe();
 await page.screenshot({path:info.outputPath('probe-viewport.png'),scale:'css',animations:'disabled'});
 await page.locator('#calculator').screenshot({path:info.outputPath('probe-focused-element.png'),scale:'css',animations:'disabled'});data.afterFocused=await probe();
 writeFileSync(info.outputPath('focus-probe.json'),JSON.stringify(data,null,2));
 await expect(page.locator('#budget-flight')).toBeFocused();await expect(page.locator('.skip-link')).not.toBeInViewport();
});
