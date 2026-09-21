const KEY = "hoptrip.session.v2";
const TIMEOUT = 30 * 60 * 1000;
type Session = {id:string;touched:number;source?:string;campaign?:string};
let memory:Session|null=null;
export function sessionContext(now=Date.now()):Session {
 let previous=memory;
 try {
   const stored=JSON.parse(localStorage.getItem(KEY) ?? "null");
   if (stored && typeof stored.id==="string" && /^[a-f0-9-]{36}$/.test(stored.id) && typeof stored.touched==="number") previous=stored;
 } catch {}
 const query=new URLSearchParams(location.search);
 const fresh=!previous || now<previous.touched || now-previous.touched>=TIMEOUT;
 memory=fresh ? {id:crypto.randomUUID(),touched:now,
   source:query.get("utm_source")?.slice(0,80),campaign:query.get("utm_campaign")?.slice(0,80)}
   : {...previous!,touched:now};
 try {localStorage.setItem(KEY,JSON.stringify(memory));} catch {}
 return memory;
}
export function sessionId(now=Date.now()):string {return sessionContext(now).id;}
export function publicApi(path:string):string {
 return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/,"")+path;
}
const sent=new Map<string,number>();
export function track(event_name:string,deal_slug?:string) {
 const session=sessionContext();
 const key=[event_name,deal_slug,location.pathname,location.search,session.id].join("|");
 const now=Date.now();
 if(now-(sent.get(key)??0)<1000)return;
 for(const [k,time] of sent)if(now-time>60000)sent.delete(k);
 sent.set(key,now);
 void fetch(publicApi("/api/v1/analytics/events"),{
   method:"POST",headers:{"Content-Type":"application/json"},keepalive:true,
   body:JSON.stringify({event_id:crypto.randomUUID(),event_name,deal_slug,
     anonymous_session_id:session.id,source:session.source,metadata:{campaign:session.campaign}}),
 }).catch(()=>undefined);
}
