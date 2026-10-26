// Public reads and isolated browser storage. No partner clicks or server writes.
// Windows WebKit is not a physical iPhone; page errors remain release findings.
import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
const require=createRequire(new URL('../apps/web/package.json',import.meta.url));
const {chromium,webkit,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const base='https://hoptrip.pl';
const allControls=process.argv.includes('--all-controls');
const reportName=allControls?'trip-controls-live-check.json':'live-check.json';
const prefix=allControls?'live-all':'live';
const deals=await(await fetch(base+'/api/v1/deals?destination=london&limit=10')).json();
const deal=deals.find(d=>d.events_supported&&d.trip_type==='ROUND_TRIP');
if(!deal)throw Error('No active London round trip');
const out=new URL('../docs/stay-mobile-20261026/',import.meta.url);await mkdir(out,{recursive:true});
const report={checked_at:new Date().toISOString(),physical_device:false,all_controls:allControls,slug:deal.slug,checks:[]};
for(const engine of ['chromium','webkit']){
 const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='chromium'?{channel:'msedge'}:{});
 try{
 for(const width of [320,375,390,430]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,locale:'pl-PL'});
  try{
   await context.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/deals/'+deal.slug,{waitUntil:'load'});
   await page.addStyleTag({content:'html{scroll-behavior:auto}'});
   const stay=page.locator('#accommodation');
   await expect(page.locator('#stay-checkout')).toBeEnabled();
   await page.getByRole('navigation',{name:'Sekcje planu podróży'}).getByRole('link',{name:'Nocleg',exact:true}).tap();
   await expect(stay).toBeFocused();
   const sectionStyle=await stay.evaluate(n=>{const s=getComputedStyle(n);return {shadow:s.boxShadow,radius:s.borderRadius};});
   if(sectionStyle.shadow==='none')throw Error('Focus styling is not deployed');
   await stay.evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
   await page.screenshot({path:new URL(`${prefix}-${engine}-section-${width}.png`,out).pathname.replace(/^\/([A-Z]:)/,'$1')});
   const fields=[];
   if(allControls)await page.locator('#calculator details').evaluateAll(nodes=>nodes.forEach(node=>{if(node.querySelector('input,select'))node.open=true;}));
   const controls=allControls?page.locator(':is(#accommodation,#calculator,#trip-events) input:not([type="checkbox"]), :is(#accommodation,#calculator,#trip-events) select'):page.locator('#stay-checkin,#stay-checkout');
   for(const input of await controls.all()){
    if(!await input.isVisible())continue;
    await input.focus();await input.scrollIntoViewIfNeeded();
    const data=await input.evaluate(n=>{const r=n.getBoundingClientRect(),f=n.parentElement.getBoundingClientRect(),s=getComputedStyle(n),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {id:n.id||n.getAttribute('type'),left:r.left,right:r.right,width:r.width,height:r.height,containerLeft:f.left,containerRight:f.right,viewport:innerWidth,hit:hit===n||n.contains(hit),appearance:s.appearance,shadow:s.boxShadow};});
    const minWidth=await input.getAttribute('type')==='date'?180:44;
    if(data.left<data.containerLeft-1||data.right>data.containerRight+1||data.right>width||data.width<minWidth||data.height<44||!data.hit)throw Error('Field geometry: '+JSON.stringify(data));
    fields.push(data);const before=await input.inputValue();await input.press('Escape');await page.locator('#stay-adults').tap();await expect(input).toHaveValue(before);
   }
   const oldEnd=await page.locator('#stay-checkout').inputValue(),start=await page.locator('#stay-checkin').inputValue();
   const next=new Date(oldEnd+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);const end=next.toISOString().slice(0,10);
   await page.locator('#stay-checkout').fill(end);
   await expect(page.locator('#budget-end')).toHaveValue(end);
   const nights=(Date.parse(end)-Date.parse(start))/86400000;
   await expect(page.locator('#budget-nights')).toHaveValue(String(nights));
   await expect(page.locator('#trip-events').getByLabel('Do',{exact:true})).toHaveValue(end);
   await expect(page.locator('#stay-summary')).toContainText(String(next.getUTCDate()));
   for(const selector of allControls?['#budget-end','#budget-hotel-basis','#budget-flight']:['#stay-checkout']){
    await page.locator(selector).focus();await page.locator(selector).scrollIntoViewIfNeeded();
    await page.screenshot({path:new URL(`${prefix}-${engine}-${selector.slice(1)}-${width}.png`,out).pathname.replace(/^\/([A-Z]:)/,'$1')});
   }
   const axe=new AxeBuilder({page}).include('#accommodation');if(allControls)axe.include('#calculator').include('#trip-events');
   const violations=(await axe.analyze()).violations;
   if(violations.length)throw Error('Axe: '+violations.map(v=>v.id));
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');
   report.checks.push({engine,version:browser.version(),width,start,old_end:oldEnd,end,nights,section_style:sectionStyle,fields,axe:0,page_errors:errors});
   await writeFile(new URL(reportName,out),JSON.stringify(report,null,2)+'\n');
   console.log(JSON.stringify({engine,width,end,nights,layout_and_dates_passed:true,page_errors:errors}));
  }finally{await context.close();}
 }
 }finally{await browser.close();}
}
await writeFile(new URL(reportName,out),JSON.stringify(report,null,2)+'\n');
if(report.checks.some(check=>check.page_errors.length))process.exitCode=1;
