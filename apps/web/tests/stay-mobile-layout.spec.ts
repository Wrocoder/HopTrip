import {test,expect,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function contained(input:Locator){
 const geometry=await input.evaluate(node=>{
  const field=node.closest('fieldset')!.getBoundingClientRect(),rect=node.getBoundingClientRect();
  const center=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
  return {left:rect.left,right:rect.right,fieldLeft:field.left,fieldRight:field.right,viewport:innerWidth,
   width:rect.width,height:rect.height,hit:center===node||node.contains(center)};
 });
 expect(geometry.left).toBeGreaterThanOrEqual(geometry.fieldLeft-1);
 expect(geometry.right).toBeLessThanOrEqual(geometry.fieldRight+1);
 expect(geometry.right).toBeLessThanOrEqual(geometry.viewport);
 expect(geometry.width).toBeGreaterThanOrEqual(180);expect(geometry.height).toBeGreaterThanOrEqual(44);
 expect(geometry.hit).toBe(true);
}
for(const width of [320,375,390,430])test(`stay dates remain contained and usable at ${width}px`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:844});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.goto('/deals/browser-13');
 await expect(page.locator('#stay-checkin')).toBeEnabled();
 await page.getByRole('navigation',{name:'Sekcje planu podróży'}).getByRole('link',{name:'Nocleg',exact:true}).click();
 const stay=page.locator('#accommodation');await expect(stay).toBeFocused();
 await page.addStyleTag({content:'nextjs-portal{display:none}'});
 await stay.screenshot({path:testInfo.outputPath(`stay-section-${width}.png`)});
 await page.locator('#stay-checkin').fill('2027-01-15');
 await page.locator('#stay-checkout').fill('2027-01-17');
 for(const input of [page.locator('#stay-checkin'),page.locator('#stay-checkout')]){
  await input.focus();await input.scrollIntoViewIfNeeded();await contained(input);
  const value=await input.inputValue();await input.press('Escape');
  await page.locator('#stay-adults').click();await expect(input).toHaveValue(value);
 }
 await page.locator('#stay-checkout').fill('2027-01-18');
 await expect(page.locator('#budget-end')).toHaveValue('2027-01-18');
 await expect(page.locator('#budget-nights')).toHaveValue('3');
 await expect(page.locator('#trip-events').getByLabel('Do',{exact:true})).toHaveValue('2027-01-18');
 await page.locator('#stay-checkout').focus();
 await stay.screenshot({path:testInfo.outputPath(`stay-field-focus-${width}.png`)});
 const styles=await page.locator('#stay-checkout').evaluate(node=>{
  const s=getComputedStyle(node);return {appearance:s.appearance,outline:s.outline,shadow:s.boxShadow,
   radius:s.borderRadius,width:node.getBoundingClientRect().width,scroll:node.scrollWidth,client:node.clientWidth};
 });
 await testInfo.attach('focused-date-metrics',{body:JSON.stringify(styles),contentType:'application/json'});
 expect((await new AxeBuilder({page}).include('#accommodation').analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
