import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

export function verifyReleaseCache(report){
 const failures=[];
 const rows=[...(report.rows??[]),...(report.browser??[])];
 const ids=[...new Set(rows.flatMap(row=>row.buildIds))];
 if(ids.length!==1||rows.some(row=>row.buildIds?.length!==1))failures.push('Missing or mixed Next Build IDs');
 if(report.rows?.length!==84||report.browser?.length!==4)failures.push('Incomplete HTTP/browser matrix');
 if(rows.some(row=>row.status!==200||!row.headers?.['cache-control']?.includes('no-store')))failures.push('HTML status/cache policy');
 const groups=new Map();
 for(const row of report.rows??[]){
  if(row.lang!==row.locale||!row.h1?.length)failures.push('Locale or heading missing: '+row.pathname);
  const group=groups.get(row.pathname)??[];group.push(row);groups.set(row.pathname,group);
 }
 for(const [pathname,group] of groups){
  const signatures=group.map(row=>JSON.stringify({h1:row.h1,lang:row.lang,canonical:row.canonical,codeAssets:row.assets.filter(url=>/\.(js|css)(\?|$)/.test(url)).sort()}));
  if(group.length!==3||new Set(signatures).size!==1)failures.push('Request modes differ: '+pathname);
 }
 const assets=new Map((report.assets??[]).map(asset=>[asset.url,asset]));
 for(const url of new Set(rows.flatMap(row=>row.assets))){
  const asset=assets.get(url),type=asset?.headers?.['content-type']??'';
  if(!asset||asset.status!==200||!asset.bytes||!asset.headers?.['cache-control']?.includes('immutable')||url.endsWith('.js')&&!/javascript|ecmascript/i.test(type)||url.endsWith('.css')&&!type.includes('text/css'))failures.push('Invalid/missing asset: '+url);
 }
 const browser=report.browser??[];
 if(new Set(browser.map(row=>JSON.stringify(row.visibleH1))).size!==1||browser.some(row=>row.visibleCards<1))failures.push('Browser city-break rendering differs or is empty');
 if(report.errors?.length)failures.push('Request errors recorded');
 return {valid:failures.length===0,buildIds:ids,failures,releaseShaVerified:false,afterDeployInvalidationVerified:false,productionRollbackVerified:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const file=process.argv[2];if(!file)throw Error('Usage: verify-release-cache.mjs RESULTS_JSON');
 const result=verifyReleaseCache(JSON.parse(await readFile(file,'utf8')));
 await writeFile(path.join(path.dirname(file),'checks.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));if(!result.valid)process.exitCode=1;
}
