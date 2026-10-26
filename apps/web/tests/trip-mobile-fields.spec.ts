import {test,expect,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {encodeTrip} from '../src/lib/shared-trip';
import {emptyBudget} from '../src/lib/trip-budget';

async function reachable(control:Locator){
 await control.scrollIntoViewIfNeeded();
 const box=await control.evaluate(node=>{
  const r=node.getBoundingClientRect(),p=node.parentElement!.getBoundingClientRect();
  const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
  return {left:r.left,right:r.right,width:r.width,height:r.height,parentLeft:p.left,parentRight:p.right,
   viewport:innerWidth,hit:hit===node||node.contains(hit)};
 });
 expect(box.left).toBeGreaterThanOrEqual(box.parentLeft-1);
 expect(box.right).toBeLessThanOrEqual(box.parentRight+1);
 expect(box.right).toBeLessThanOrEqual(box.viewport);
 expect(box.height).toBeGreaterThanOrEqual(44);expect(box.hit).toBe(true);
}

for(const width of [320,375,390,430])test(`all trip fields and focus frames fit at ${width}px`,async({page},testInfo)=>{
 test.setTimeout(60000);await page.setViewportSize({width,height:844});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.route('**/api/v1/deals/*/events?**',route=>route.fulfill({json:{status:'READY',partial:false,checked_at:null,events:[{
  id:'mobile-controls',name:'Koncert — długi tytuł wydarzenia',venue:'Sala koncertowa',city:'Barcelona',category:'MUSIC',
  start_date:'2027-01-15',end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',
  url:'https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Fmobile',price_from:null,currency:null,
 }]}}));
 await page.goto('/deals/browser-13');await expect(page.locator('#budget-start')).toBeEnabled();
 await page.getByRole('button',{name:'Dodaj do planu: Koncert — długi tytuł wydarzenia',exact:true}).click();
 await page.locator('#calculator details').evaluateAll(nodes=>nodes.forEach(node=>{if(node.querySelector('input,select'))(node as HTMLDetailsElement).open=true;}));
 await page.addStyleTag({content:'nextjs-portal{display:none} html{scroll-behavior:auto}'});
 const inputs=page.locator(':is(#accommodation,#calculator,#trip-events) input:not([type="checkbox"]), :is(#accommodation,#calculator,#trip-events) select');
 expect(await inputs.count()).toBeGreaterThan(20);
 for(const control of await inputs.all()){
  if(!await control.isVisible())continue;
  const before=await control.inputValue();await control.focus();await reachable(control);
  if(await control.getAttribute('type')==='date')expect((await control.boundingBox())!.width).toBeGreaterThanOrEqual(180);
  await control.press('Escape');await expect(control).toHaveValue(before);
 }
 const nav=page.getByRole('navigation',{name:'Sekcje planu podróży'});
 for(const [link,id] of [['Nocleg','#accommodation'],['Budżet','#calculator'],['Wydarzenia','#trip-events']]){
  await nav.getByRole('link',{name:link,exact:true}).click();await expect(page.locator(id)).toBeFocused();
 }
 await page.locator('#budget-start').fill('2027-01-15');await page.locator('#budget-end').fill('2027-01-18');
 await expect(page.locator('#stay-checkout')).toHaveValue('2027-01-18');
 await expect(page.locator('#budget-nights')).toHaveValue('3');
 await expect(page.locator('#trip-events').getByLabel('Do',{exact:true})).toHaveValue('2027-01-18');
 for(const control of [page.locator('#budget-end'),page.locator('#budget-hotel-basis'),page.locator('#budget-flight'),page.locator('#planned-events').getByLabel('Cena jednego biletu (PLN)')]){
  await control.focus();await reachable(control);
  await page.screenshot({path:testInfo.outputPath(`field-${await control.getAttribute('id')}-${width}.png`)});
 }
 for(const button of await page.locator(':is(#calculator,#trip-events) button').all())if(await button.isVisible())await reachable(button);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('#calculator').include('#accommodation').include('#trip-events').analyze()).violations).toEqual([]);
});

const shared=encodeTrip({version:1,offer:{slug:'missing-offer',origin:'Wrocław',destination:'Londyn',start:'2027-01-15',end:'2027-01-17',price:'100',observedAt:''},
 draft:{version:1,input:{...emptyBudget,people:'1',flight:'100'},start:'2027-01-15',end:'2027-01-17',context:'',review:true}});
for(const path of ['/info/trip-budget','/trip?plan='+shared])test(`standalone/shared budget fields fit: ${path.split('?')[0]}`,async({page})=>{
 await page.setViewportSize({width:320,height:844});await page.goto(path);
 await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
 await page.addStyleTag({content:'html{scroll-behavior:auto}'});
 await expect(page.locator('#budget-start')).toBeEnabled();
 await page.locator('#calculator details').evaluateAll(nodes=>nodes.forEach(node=>{if(node.querySelector('input,select'))(node as HTMLDetailsElement).open=true;}));
 await page.locator('#budget-start').fill('2027-01-15');await page.locator('#budget-end').fill('2027-01-18');
 await expect(page.locator('#budget-nights')).toHaveValue('3');
 for(const control of await page.locator('#calculator input:not([type="checkbox"]),#calculator select').all())if(await control.isVisible()){
  await control.focus();await reachable(control);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
