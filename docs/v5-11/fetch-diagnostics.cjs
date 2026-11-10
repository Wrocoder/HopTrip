// Local-only preload. No request/response mutation and no headers, query or body logging.
const {channel}=require('node:diagnostics_channel');
const {appendFileSync}=require('node:fs');
const file=process.env.HOPTRIP_E2E_DIAGNOSTICS_LOG;
if(file){
 const starts=new WeakMap();
 const local=request=>String(request?.origin)==='http://127.0.0.1:8100';
 const record=data=>{try{appendFileSync(file,JSON.stringify({at:new Date().toISOString(),pid:process.pid,...data})+'\n');}catch{/* Diagnostics must not alter application behavior. */}};
 record({event:'preload',node:process.version});
 channel('undici:request:create').subscribe(({request})=>{if(local(request))starts.set(request,Date.now());});
 channel('undici:request:headers').subscribe(({request,response})=>{
  if(local(request)&&response.statusCode>=400)record({event:'http-error',path:request.path.split('?')[0],status:response.statusCode,elapsedMs:Date.now()-(starts.get(request)??Date.now())});
 });
 channel('undici:request:error').subscribe(({request,error})=>{
  if(local(request))record({event:'request-error',path:request.path.split('?')[0],name:error?.name,code:error?.code,causeCode:error?.cause?.code,elapsedMs:Date.now()-(starts.get(request)??Date.now())});
 });
}
