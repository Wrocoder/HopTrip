import {analyticsPageType,campaignLabel,sourceLabel,type EventContext} from "./analytics-context.ts";
import {analyticsAllowed} from "./consent.ts";
const KEY = "hoptrip.session.v2";
const TIMEOUT = 30 * 60 * 1000;
type Session = {id:string;touched:number;source?:string;campaign?:string};
let memory:Session|null=null;
export function clearSession() {
 memory=null;sent.clear();viewEvents.clear();
 try {localStorage.removeItem(KEY);} catch {}
}
export function sessionContext(now=Date.now()):Session {
 if(!analyticsAllowed()) {clearSession();return {id:"anonymous",touched:now};}
 let previous=memory;
 try {
   const stored=JSON.parse(localStorage.getItem(KEY) ?? "null");
   if (stored && typeof stored.id==="string" && /^[a-f0-9-]{36}$/.test(stored.id) && typeof stored.touched==="number") previous=stored;
 } catch {}
 const query=new URLSearchParams(location.search);
 const fresh=!previous || now<previous.touched || now-previous.touched>=TIMEOUT;
 memory=fresh ? {id:crypto.randomUUID(),touched:now,
   source:sourceLabel(query.get("utm_source")),campaign:campaignLabel(query.get("utm_campaign"))}
   : {...previous!,touched:now};
 memory.source=sourceLabel(memory.source);memory.campaign=campaignLabel(memory.campaign);
 try {localStorage.setItem(KEY,JSON.stringify(memory));} catch {}
 return memory;
}
export function sessionId(now=Date.now()):string {return sessionContext(now).id;}
export function publicApi(path:string):string {
 return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/,"")+path;
}
const sent=new Map<string,number>();
const viewEvents=new Set<string>();
let visit="";
export type ActivityContext={city:string;activity_id:string;page:string;link_kind:"affiliate"|"official"};
function sendEvent(event_name:string,deal_slug?:string,activity?:ActivityContext,context:EventContext={}) {
 const route=location.pathname+location.search;
 if(visit!==route){visit=route;viewEvents.clear();}
 if(location.pathname.startsWith("/alerts") && event_name!=="ALERT_CONFIRMED")return;
 if(!analyticsAllowed()) return;
 const session=sessionContext();
 const key=[event_name,deal_slug,activity?.activity_id,JSON.stringify(context),location.pathname,location.search,session.id].join("|");
 const view=["PAGE_VIEW","DEAL_VIEW","DEAL_IMPRESSION","SEARCH_RESULT","BUDGET_USE","ALERT_CONFIRMED"].includes(event_name);
 if(view && viewEvents.has(key))return;
 if(view)viewEvents.add(key);
 const now=Date.now();
 if(!view && now-(sent.get(key)??0)<1000)return;
 for(const [k,time] of sent)if(now-time>60000)sent.delete(k);
 sent.set(key,now);
 void fetch(publicApi("/api/v1/analytics/events"),{
   method:"POST",headers:{"Content-Type":"application/json"},keepalive:true,referrerPolicy:"no-referrer",
   body:JSON.stringify({event_id:crypto.randomUUID(),event_name,deal_slug,activity,...context,
     anonymous_session_id:session.id,source:session.source,metadata:{campaign:session.campaign,page_type:analyticsPageType(location.pathname)}}),
 }).catch(()=>undefined);
}
export function track(event_name:string,deal_slug?:string,activity?:ActivityContext,context:EventContext={}) {
 try {sendEvent(event_name,deal_slug,activity,context);} catch { /* Analytics must not block navigation. */ }
}
