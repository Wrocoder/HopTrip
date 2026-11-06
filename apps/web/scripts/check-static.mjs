import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export function staticUrls(html){return [...new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^" ]+)"/g)].map(match=>match[1].replaceAll('&amp;','&')))];}
export async function checkStatic(base,manifest,previousHtml,expectedBuild=null){
 const origin=new URL(base);if(origin.protocol!=='https:'&&!(origin.protocol==='http:'&&['127.0.0.1','localhost'].includes(origin.hostname)))throw Error('Use HTTPS or loopback');
 const inventory=new Map(manifest.files.map(file=>[file.url,file.sha256]));
 const selected=new Set(staticUrls(previousHtml));
 for(const route of ['/','/deals','/saved','/trip']){
  const response=await fetch(new URL(route,origin),{signal:AbortSignal.timeout(15000),redirect:'error',headers:{'Cache-Control':'no-cache'}});
  if(response.status!==200||!response.headers.get('cache-control')?.includes('no-store'))throw Error(`Unsafe HTML response: ${route}`);
  const html=await response.text();if(expectedBuild&&!html.includes(expectedBuild))throw Error(`Wrong HTML build: ${route}`);
  for(const url of staticUrls(html))selected.add(url);
 }
 if(!selected.size)throw Error('No static asset references');
 const results=[];
 for(const url of selected){
  if(!url.startsWith('/_next/static/')||url.includes('..')||url.includes('\\')||!inventory.has(url))throw Error(`Unseeded static URL: ${url}`);
  const response=await fetch(new URL(url,origin),{signal:AbortSignal.timeout(15000),redirect:'error'});
  if(response.status!==200||!response.headers.get('cache-control')?.includes('immutable'))throw Error(`Unavailable static URL: ${url}`);
  const type=response.headers.get('content-type')??'';
  if((url.endsWith('.js')&&!/javascript|ecmascript/i.test(type))||(url.endsWith('.css')&&!type.includes('text/css')))throw Error(`Invalid static MIME: ${url}`);
  const digest=createHash('sha256');let bytes=0;
  for await(const chunk of response.body){bytes+=chunk.length;if(bytes>32*1024*1024)throw Error('Static asset too large');digest.update(chunk);}
  if(digest.digest('hex')!==inventory.get(url))throw Error(`Corrupt static URL: ${url}`);
  results.push({url,bytes});
 }
 return {checked:results.length,results};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [base,manifest,html,mode]=process.argv.slice(2);if(!base||!manifest||!html||(mode&&mode!=='--image-build'))throw Error('Usage: check-static.mjs BASE MANIFEST PREVIOUS_HTML [--image-build]');
 const expected=mode?(await readFile(path.resolve('.next/BUILD_ID'),'utf8')).trim():null;
 console.log(JSON.stringify(await checkStatic(base,JSON.parse(await readFile(manifest,'utf8')),await readFile(html,'utf8'),expected)));
}
