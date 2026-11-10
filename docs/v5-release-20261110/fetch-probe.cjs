// Opt-in loopback diagnostic; captures outer Next fetch as well as native errors.
// No credentials, query strings, bodies, offer/session IDs or error messages logged.
const {appendFileSync}=require('node:fs');
const {AsyncLocalStorage}=require('node:async_hooks');
const {channel}=require('node:diagnostics_channel');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const file=process.env.HOPTRIP_FETCH_PROBE_LOG;
if(file&&process.env.HOPTRIP_FETCH_PROBE==='1'){
 const validators=import(pathToFileURL(path.resolve('src/lib/api-contract.ts')).href);
 // Handle import errors immediately, even if this process never calls fetch.
 validators.catch(()=>undefined);
 const record=row=>{try{appendFileSync(file,JSON.stringify({at:new Date().toISOString(),pid:process.pid,...row})+'\n');}catch{}};
 let tick=performance.now();
 setInterval(()=>{const now=performance.now();if(now-tick>1000)record({event:'loop-delay',elapsedMs:Math.round(now-tick)});tick=now;},250).unref();
 const active=new AsyncLocalStorage(),wrapped=new WeakMap();
 const safeCode=value=>typeof value==='string'&&/^[A-Z_0-9]{1,60}$/.test(value)?value:undefined;
 const nativeStarts=new WeakMap();
 const nativeEndpoint=request=>String(request?.origin)==='http://127.0.0.1:8100'&&['/api/v1/deals','/api/v1/airports','/api/v1/destinations'].includes(request.path.split('?')[0])?request.path.split('?')[0]:undefined;
 channel('undici:request:create').subscribe(({request})=>{
  const endpoint=nativeEndpoint(request);if(endpoint){nativeStarts.set(request,Date.now());record({event:'native-create',endpoint});}
 });
 channel('undici:request:headers').subscribe(({request,response})=>{
  const endpoint=nativeEndpoint(request);if(endpoint)record({event:'native-headers',endpoint,status:response.statusCode,elapsedMs:Date.now()-(nativeStarts.get(request)??Date.now())});
 });
 channel('undici:request:error').subscribe(({request,error})=>{
  const endpoint=nativeEndpoint(request);if(endpoint)record({event:'native-error',endpoint,code:safeCode(error?.code),elapsedMs:Date.now()-(nativeStarts.get(request)??Date.now())});
 });
 function wrap(fn){
  if(wrapped.has(fn))return wrapped.get(fn);
  const proxy=new Proxy(fn,{apply(target,self,args){
   let url;try{url=new URL(typeof args[0]==='string'||args[0] instanceof URL?args[0]:args[0].url);}catch{return Reflect.apply(target,self,args);}
   const endpoint=url.pathname;
   if(active.getStore()||url.origin!=='http://127.0.0.1:8100'||!['/api/v1/deals','/api/v1/airports','/api/v1/destinations'].includes(endpoint))return Reflect.apply(target,self,args);
   return active.run(true,async()=>{
    const started=Date.now();
    try{
     const response=await Reflect.apply(target,self,args);
     const row={event:'response',endpoint,status:response.status,elapsedMs:Date.now()-started};
     record(row);
     // Clone only for this isolated fixture diagnostic; never consume caller body.
     void response.clone().json().then(async body=>{
      const v=await validators;
      const valid=endpoint==='/api/v1/airports'?v.isAirports(body):endpoint==='/api/v1/destinations'?v.isDestinations(body):url.searchParams.get('include_total')==='true'?v.isDealResults(body):v.isDeals(body);
      record({event:'contract',endpoint,status:response.status,valid,elapsedMs:Date.now()-started});
     }).catch(()=>record({event:'body-or-validator-error',endpoint,status:response.status}));
     return response;
    }catch(error){
     record({event:'fetch-error',endpoint,elapsedMs:Date.now()-started,name:safeCode(error?.name?.toUpperCase()),code:safeCode(error?.code),causeCode:safeCode(error?.cause?.code)});
     throw error;
    }
   });
  }});
  wrapped.set(fn,proxy);wrapped.set(proxy,proxy);return proxy;
 }
 let current=wrap(globalThis.fetch);
 Object.defineProperty(globalThis,'fetch',{configurable:true,enumerable:true,get:()=>current,set:value=>{current=wrap(value);}});
 record({event:'preload',node:process.version});
}
