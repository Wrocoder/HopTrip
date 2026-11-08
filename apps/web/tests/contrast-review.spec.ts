import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync,writeFileSync} from 'node:fs';

import {availableHref} from '../src/lib/i18n/routing';

function conservativeContrast(el:Element){
     type Color=[number,number,number,number];
     const parse=(value:string):Color=>{
      const match=value.match(/^rgba?\(([^)]+)\)$/);if(!match)throw Error('Unsupported color:'+value);
      const channels=match[1].split(',').map(Number);if(channels.length===3)channels.push(1);
      if(channels.length!==4||channels.some(value=>!Number.isFinite(value)))throw Error('Invalid color:'+value);
      return channels as Color;
     };
     const layers:Element[]=[];for(let current:Element|null=el;current;current=current.parentElement)layers.unshift(current);
     let low:number[]|null=null,high:number[]|null=null,opaqueAfterBody=false;const evidence:unknown[]=[];
     for(const layer of layers){
      const style=getComputedStyle(layer);
      if(style.opacity!=='1'||style.filter!=='none'||style.backdropFilter!=='none'||style.mixBlendMode!=='normal'||style.backgroundBlendMode!=='normal'||style.textShadow!=='none'||style.webkitTextFillColor!==style.color)throw Error('Unsupported compositing:'+layer.tagName);
      for(const pseudo of ['::before','::after']){
       const paint=getComputedStyle(layer,pseudo);if(paint.content==='none'||paint.content==='normal')continue;
       if(layer!==document.body||pseudo!=='::before'||paint.zIndex!=='-1'||paint.position!=='fixed')throw Error('Unsupported pseudo overlay');
      }
      const color=parse(style.backgroundColor);
      if(color[3]===1){low=color.slice(0,3);high=color.slice(0,3);if(layer!==document.body&&layer!==document.documentElement)opaqueAfterBody=true;}
      else if(color[3]>0){if(!low||!high)throw Error('No opaque canvas');low=low.map((value,i)=>color[i]*color[3]+value*(1-color[3]));high=high.map((value,i)=>color[i]*color[3]+value*(1-color[3]));}
      if(style.backgroundImage!=='none'){
       if(style.backgroundImage.startsWith('linear-gradient(')){
        const colors=[...style.backgroundImage.matchAll(/rgba?\([^)]+\)/g)].map(match=>parse(match[0]));
        if(!/^linear-gradient\([\d.]+deg,\s*rgba?\([^)]+\)(?:\s+[\d.]+%)?,\s*rgba?\([^)]+\)(?:\s+[\d.]+%)?\)$/.test(style.backgroundImage)||colors.length!==2||colors.some(color=>color[3]!==1))throw Error('Unsupported gradient:'+style.backgroundImage);
        low=[0,1,2].map(i=>Math.min(...colors.map(color=>color[i])));high=[0,1,2].map(i=>Math.max(...colors.map(color=>color[i])));
        opaqueAfterBody=true;
        evidence.push({kind:'OPAQUE_TWO_STOP_GRADIENT',image:style.backgroundImage});
       }else if(layer===el&&el.tagName==='SELECT'){
        const match=style.backgroundImage.match(/^url\("(data:image\/svg\+xml,[^"]+)"\)$/);if(!match)throw Error('Unsupported select image');
        const svg=new DOMParser().parseFromString(decodeURIComponent(match[1].split(',').slice(1).join(',')),'image/svg+xml').documentElement;
        const size=[Number(svg.getAttribute('width')),Number(svg.getAttribute('height'))];
        const right=style.backgroundPositionX.match(/^calc\(100% - ([\d.]+)px\)$/);
        const painted=style.backgroundSize.match(/^([\d.]+)px ([\d.]+)px$/);
        if(!right||!painted||style.appearance!=='none'||style.backgroundRepeat!=='no-repeat'||!size.every(value=>value>0)||svg.querySelectorAll('*').length!==1||svg.firstElementChild?.tagName!=='path')throw Error('Unsupported select arrow geometry');
        const reserved=Number.parseFloat(style.paddingRight),imageEnd=Number(right[1])+Number(painted[1]);if(reserved<imageEnd)throw Error('Arrow overlaps text content box');
        evidence.push({kind:'SVG_OUTSIDE_TEXT_CONTENT',intrinsicSize:size,paintedSize:[Number(painted[1]),Number(painted[2])],rightInset:Number(right[1]),reserved});
       }else if(layer===document.body){
        throw Error('Unsupported body image');
       }else throw Error('Unsupported background image:'+style.backgroundImage);
      }
     }
     if(!low||!high||!opaqueAfterBody)throw Error('No opaque background bound above body texture');
     const foreground=parse(getComputedStyle(el).color);if(foreground[3]!==1)throw Error('Unsupported translucent foreground');
     const lum=(color:number[])=>color.slice(0,3).map(value=>{const channel=value/255;return channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4;}).reduce((value,channel,i)=>value+channel*[.2126,.7152,.0722][i],0);
     const fg=lum(foreground),lo=lum(low),hi=lum(high);const minimum=fg>=lo&&fg<=hi?1:Math.min((Math.max(fg,lo)+.05)/(Math.min(fg,lo)+.05),(Math.max(fg,hi)+.05)/(Math.min(fg,hi)+.05));
     return {foreground,low,high,minimum,evidence};

}

test.skip(process.env.HOPTRIP_H3_PRODUCTION!=='1','Contrast review requires the isolated production runner.');
const paths=['/','/deals','/tanie-loty-na-weekend','/city-break','/destinations/barcelona','/destinations/milan','/deals/browser-deal','/saved','/info/trip-budget','/alerts'];

test.beforeEach(async({page,request},info)=>{
 const config=readFileSync(info.config.configFile!,'utf8');expect(config).toContain('npm run start --');expect(config).toContain("NODE_ENV:'production'");

 const build=readFileSync('.next/BUILD_ID','utf8').trim();expect(await(await request.get('/deals')).text()).toContain(build);
 await info.attach('execution-mode',{body:JSON.stringify({configFile:info.config.configFile,configSource:config,build}),contentType:'application/json'});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.route('**/*',route=>['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: classify every contrast review item without hiding axe results`,async({page},info)=>{
 test.setTimeout(240000);
 const width=info.project.name==='mobile'?390:1440;await page.setViewportSize({width,height:900});
 const records:unknown[]=[],errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  for(const path of paths){
   const href=availableHref(path,locale);expect((await page.goto(href))?.status()).toBe(200);await page.evaluate(()=>document.fonts.ready);
   const audit=await new AxeBuilder({page}).withRules(['color-contrast']).analyze();
   const reviews:unknown[]=[];
   records.push({path,href,width,project:info.project.name,violations:audit.violations,incomplete:audit.incomplete,reviews});
   for(const rule of audit.incomplete)for(const node of rule.nodes){
    expect(node.target).toHaveLength(1);expect(typeof node.target[0]).toBe('string');
    const target=String(node.target[0]),element=page.locator(target);await expect(element).toHaveCount(1);
    const keys=[...node.any,...node.all,...node.none].map(check=>(check.data as {messageKey?:string}|null)?.messageKey);expect(keys.length).toBeGreaterThan(0);
    if(keys.every(key=>key==='nonBmp')){
     await expect(element).toHaveAttribute('aria-hidden','true');expect((await element.textContent())?.trim()).toMatch(/^[→ⓘ]$/u);
     const control=element.locator('xpath=ancestor::*[self::a or self::button][1]');await expect(control).toHaveCount(1);await expect(control).toHaveAccessibleName(/[\p{L}\p{N}]/u);
     reviews.push({target,classification:'DECORATIVE_WITH_NAMED_CONTROL',keys,html:node.html});
     continue;
    }
    if(keys.includes('shortTextContent')){
     expect(await element.evaluate(el=>el.tagName)).toBe('LABEL');
     const label=await element.evaluate(el=>[...el.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).map(node=>node.textContent).join('').trim());
     expect(label).toMatch(/^[СЗ]$/u);await expect(element.locator('input[type="date"]')).toHaveAccessibleName(label);
    }
    expect(keys.every(key=>key==='bgGradient'||key==='bgImage'||key==='shortTextContent'),target+':'+JSON.stringify(keys)).toBe(true);
    const bound=await element.evaluate(conservativeContrast);
    // Use the normal-text threshold even for large headings.
    expect(bound.minimum,target).toBeGreaterThanOrEqual(4.5);
    reviews.push({target,classification:'CONSERVATIVE_CONTRAST_BOUND',keys,...bound,html:node.html});
   }
   expect(audit.violations).toEqual([]);
   if(locale==='pl'&&path==='/deals/browser-deal')await page.locator('#trip-events').screenshot({path:info.outputPath('event-gradient.png'),animations:'disabled'});
  }
  expect(errors).toEqual([]);
 }finally{writeFileSync(info.outputPath('contrast-review.json'),JSON.stringify({locale,width,project:info.project.name,records,errors},null,2)+'\n');}
});

test('contrast bounds reject low contrast and unsupported compositing',async({page},info)=>{
 await page.goto('/deals/browser-deal');await page.evaluate(()=>document.fonts.ready);
 const title=page.locator('#trip-events-title');const original=await title.getAttribute('style');
 const restore=()=>title.evaluate((el,style)=>{if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);},original);
 const baseline=await title.evaluate(conservativeContrast);expect(baseline.minimum).toBeGreaterThanOrEqual(4.5);
 let lowContrast=0;
 try{
  await title.evaluate(el=>{(el as HTMLElement).style.color='#bbbbbb';});
  lowContrast=(await title.evaluate(conservativeContrast)).minimum;expect(lowContrast).toBeLessThan(4.5);await restore();
  await title.evaluate(el=>{(el as HTMLElement).style.opacity='0.5';});
  await expect(title.evaluate(conservativeContrast)).rejects.toThrow('Unsupported compositing');await restore();
  await title.evaluate(el=>{(el as HTMLElement).style.backgroundImage='linear-gradient(145deg,rgb(237,244,235),rgb(248,250,246)),url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27/%3E")';});
  await expect(title.evaluate(conservativeContrast)).rejects.toThrow(/Unsupported (gradient|compositing)/);
 }finally{await restore();}
 expect((await title.evaluate(conservativeContrast)).minimum).toBe(baseline.minimum);
 await info.attach('negative-controls',{body:JSON.stringify({baseline:baseline.minimum,lowContrast,translucentAncestorRejected:true,multipleBackgroundRejected:true,restored:true}),contentType:'application/json'});
});
