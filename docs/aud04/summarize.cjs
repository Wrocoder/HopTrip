const fs=require('node:fs'),path=require('node:path');
const names=['home-mobile','deals-mobile','home-desktop','deals-desktop'];
const reports=names.map(name=>{
 const r=JSON.parse(fs.readFileSync(path.join(__dirname,name+'.json'),'utf8'));
 if(r.runtimeError)throw new Error(name+': '+r.runtimeError.message);
 const requests=r.audits['network-requests'].details.items;
 const size=type=>requests.filter(i=>i.resourceType===type).reduce((s,i)=>s+i.transferSize,0);
 const metric=id=>({value:r.audits[id]?.numericValue,unit:r.audits[id]?.numericUnit});
 return {name,url:r.finalDisplayedUrl,at:r.fetchTime,lighthouseVersion:r.lighthouseVersion,environment:r.environment,settings:r.configSettings,
  scores:Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k,v.score*100])),
  metrics:Object.fromEntries(['largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index','first-contentful-paint'].map(id=>[id,metric(id)])),
  requests:requests.length,transferBytes:r.audits['total-byte-weight'].numericValue,jsTransferBytes:size('Script'),imageTransferBytes:size('Image'),
  warnings:r.runWarnings,nonpassingBinaryAudits:Object.entries(r.audits).filter(([k,v])=>v.score!==null&&v.score<1&&v.scoreDisplayMode==='binary').map(([id,v])=>({id,title:v.title,nodes:v.details?.items?.length??0}))};
});
fs.writeFileSync(path.join(__dirname,'lighthouse-summary.json'),JSON.stringify(reports,null,2)+'\n');
console.log(JSON.stringify(reports.map(({name,scores,metrics,requests,transferBytes,jsTransferBytes,imageTransferBytes})=>({name,scores,metrics,requests,transferBytes,jsTransferBytes,imageTransferBytes})),null,2));
