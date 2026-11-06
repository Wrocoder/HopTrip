import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync,readFileSync} from 'node:fs';
import config from '../playwright.config';
test('H3-17b4 contrast attribution',async({page,request},info)=>{
 test.setTimeout(120000);
 const servers=config.webServer;if(!Array.isArray(servers))throw Error('servers');
 expect(servers[1].command).toContain('npm run start --');expect(servers[1].env?.NODE_ENV).toBe('production');
 const build=readFileSync('.next/BUILD_ID','utf8').trim();expect(await(await request.get('/deals')).text()).toContain(build);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.route('**/*',route=>['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
 const records:any[]=[];
 for(const path of ['/','/deals','/deals/browser-deal']){
  await page.setViewportSize({width:390,height:900});await page.goto(path);await page.evaluate(()=>document.fonts.ready);
  const result=await new AxeBuilder({page}).withRules(['color-contrast']).analyze();
  const styles=await page.evaluate(()=>[document.documentElement,document.body,...document.querySelectorAll('.deal-card, .deal-price, .country-flag')].slice(0,12).map(el=>({tag:el.tagName,class:el.className,bg:getComputedStyle(el).backgroundColor,image:getComputedStyle(el).backgroundImage,color:getComputedStyle(el).color,before:{content:getComputedStyle(el,'::before').content,image:getComputedStyle(el,'::before').backgroundImage,opacity:getComputedStyle(el,'::before').opacity,zIndex:getComputedStyle(el,'::before').zIndex}})));
  records.push({path,violations:result.violations,incomplete:result.incomplete,styles});
 }
 writeFileSync(info.outputPath('contrast-probe.json'),JSON.stringify({build,records},null,2));
});
