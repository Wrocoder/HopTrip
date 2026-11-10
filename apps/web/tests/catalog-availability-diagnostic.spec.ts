import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';

// Diagnostic of received SSR responses, not a replacement for UI acceptance.
test('loopback catalog SSR and direct API responses retain availability across locales',async({request},info)=>{
 test.skip(process.env.HOPTRIP_FETCH_PROBE!=='1','Explicit local diagnostic only');
 test.setTimeout(240000);
 expect(new URL(String(info.project.use.baseURL)).hostname).toBe('127.0.0.1');
 const rows:{index:number;locale:string;status:number;cards:number;error:boolean;elapsedMs:number;api?:{path:string;status:number}[]}[]=[];
 for(let index=0;index<120;index++){
  const locale=['pl','en','ru','uk'][index%4];
  const started=Date.now(),response=await request.get(locale==='pl'?'/deals':`/${locale}/deals`);
  const html=await response.text();
  const row={index,locale,status:response.status(),cards:(html.match(/class="deal-card flight-offer-card"/g)??[]).length,error:html.includes('data-state="error"'),elapsedMs:Date.now()-started,api:[] as {path:string;status:number}[]};
  if(row.error||!row.cards){
   for(const path of ['/api/v1/airports','/api/v1/destinations','/api/v1/deals?include_total=true&limit=12']){
    const api=await request.get('http://127.0.0.1:8100'+path);row.api.push({path,status:api.status()});
   }
  }
  rows.push(row);writeFileSync(info.outputPath('availability.json'),JSON.stringify({synthetic:true,real_user_metrics:false,rows},null,2));
 }
 expect(rows.filter(row=>row.status!==200||row.cards===0||row.error)).toEqual([]);
});
