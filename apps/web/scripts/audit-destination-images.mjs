// Inventory and decode checks; --live also reads public catalog/static resources.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import {destinationImage,destinationImages} from '../src/lib/destination-imagery.ts';
const args=process.argv.slice(2),live=args.includes('--live');
const output=path.resolve(args.find(x=>x.startsWith('--output='))?.slice(9)??'../../docs/v5-04/inventory.json');
const root=new URL('../public/',import.meta.url);
const catalog=JSON.parse(await readFile(new URL('../../api/app/data/destinations.json',import.meta.url),'utf8')).destinations;
const report={date:new Date().toISOString(),local_catalog_count:catalog.length,mapped_count:Object.keys(destinationImages).length,
 unmapped_catalog:catalog.filter(d=>!destinationImage(d.slug)).map(d=>d.slug),assets:[],live:null};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const sources=[...new Set(Object.values(destinationImages).map(image=>image.src))];
for(const src of sources){
 const asset={src};report.assets.push(asset);
 try{
  const bytes=await readFile(new URL(src.slice(1),root));const meta=await sharp(bytes).metadata();
  await sharp(bytes).resize(1,1).raw().toBuffer();
  const image=Object.values(destinationImages).find(image=>image.src===src);
  const credits=await readFile(new URL(src.startsWith('/media/articles/')?'media/articles/CREDITS.md':'media/destinations/CREDITS.md',root),'utf8');
  Object.assign(asset,{bytes:bytes.length,sha256:sha(bytes),format:meta.format,width:meta.width,height:meta.height,
   dimensions_match:meta.width===image.width&&meta.height===image.height,
   within_budget:bytes.length<=(src.startsWith('/media/articles/')?360000:200000),
   credit_present:[image.title,image.author,image.licenseUrl].every(text=>credits.includes(text)),
   localized_alt:['pl','en','ru','uk'].every(locale=>image.alt[locale]?.length>10),decode:'PASS'});
 }catch(error){asset.error=error.message;}
}
if(live){
 const base='https://hoptrip.pl';report.live={base,catalog_status:null,destinations:[],assets:[]};
 try{
  const response=await fetch(`${base}/api/v1/destinations`,{signal:AbortSignal.timeout(30000)});
  report.live.catalog_status=response.status;
  if(!response.ok)throw new Error(`Catalog HTTP ${response.status}`);
  const destinations=(await response.json()).filter(d=>d.is_active);
  report.live.destinations=destinations.map(d=>({slug:d.slug,src:destinationImage(d.slug)?.src??null}));
  const queue=[...new Set(report.live.destinations.map(d=>d.src).filter(Boolean))];
  await Promise.all(Array.from({length:4},async()=>{
   while(queue.length){
    const src=queue.shift(),asset={src};report.live.assets.push(asset);
    try{
     const response=await fetch(base+src,{signal:AbortSignal.timeout(20000)});asset.status=response.status;
     asset.content_type=response.headers.get('content-type');asset.cache_control=response.headers.get('cache-control');asset.etag=response.headers.get('etag');
     if(response.ok){
      const bytes=Buffer.from(await response.arrayBuffer());const meta=await sharp(bytes).metadata();
      await sharp(bytes).resize(1,1).raw().toBuffer();
      Object.assign(asset,{bytes:bytes.length,sha256:sha(bytes),format:meta.format,width:meta.width,height:meta.height,decode:'PASS',
       matches_local:sha(bytes)===report.assets.find(a=>a.src===src)?.sha256});
     }
    }catch(error){asset.error=error.message;}
   }
  }));
 }catch(error){report.live.error=error.message;}
}
report.local_pass=report.unmapped_catalog.length===0&&report.assets.every(a=>a.decode==='PASS'&&a.dimensions_match&&a.within_budget&&a.credit_present&&a.localized_alt);
report.live_pass=live&&!report.live.error&&report.live.destinations.length>0&&report.live.assets.length>0&&report.live.destinations.every(d=>d.src)&&report.live.assets.every(a=>a.status===200&&a.decode==='PASS'&&a.matches_local);
await mkdir(path.dirname(output),{recursive:true});await writeFile(output,JSON.stringify(report,null,2));
console.log(JSON.stringify({output,local_catalog:report.local_catalog_count,mappings:report.mapped_count,local_assets:report.assets.length,
 local_pass:report.local_pass,live_destinations:report.live?.destinations.length,live_assets:report.live?.assets.length,live_pass:report.live_pass,
 live_failures:report.live?.assets.filter(a=>a.status!==200||a.decode!=='PASS'||!a.matches_local).map(a=>({src:a.src,status:a.status,error:a.error,matches_local:a.matches_local}))},null,2));
if(!report.local_pass||live&&!report.live_pass)process.exitCode=1;
