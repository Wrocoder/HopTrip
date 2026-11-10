import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';

// Explicit diagnostic, not an automatic retry of a failed release test.
test('repeated EN catalog opening preserves a populated local SSR result',async({page,context,request},info)=>{
 test.skip(process.env.HOPTRIP_CATALOG_PROBE!=='1'||info.project.name!=='mobile','Opt-in local diagnostic only');
 test.setTimeout(180000);
 expect(new URL(String(info.project.use.baseURL)).hostname).toBe('127.0.0.1');
 await page.setViewportSize({width:320,height:844});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await context.route('**/*',route=>['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
 const rows:unknown[]=[];
 for(let index=0;index<50;index++){
  if(index%10===0)await page.waitForTimeout(5200);
  const response=await page.goto('/en/deals');
  await expect(page.locator('.deal-card,main [data-state="error"]').first()).toBeVisible();
  const row={index,at:new Date().toISOString(),status:response?.status(),cards:await page.locator('.deal-card').count(),error:await page.locator('main [data-state="error"]').count(),api:[] as unknown[]};
  if(row.error){
   await page.screenshot({path:info.outputPath('catalog-error.png')});
   for(const path of ['/health','/api/v1/airports','/api/v1/destinations','/api/v1/deals?include_total=true&limit=1']){
    const r=await request.get('http://127.0.0.1:8100'+path);row.api.push({path,status:r.status()});
   }
  }
  rows.push(row);writeFileSync(info.outputPath('catalog-probes.json'),JSON.stringify(rows,null,2));
  expect(row.status).toBe(200);expect(row.error,JSON.stringify(row)).toBe(0);expect(row.cards).toBeGreaterThan(0);
 }
});
