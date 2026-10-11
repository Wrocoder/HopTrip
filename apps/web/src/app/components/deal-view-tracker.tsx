"use client";
import {useEffect,useRef,useSyncExternalStore} from "react";
import {usePathname,useSearchParams} from "next/navigation";
import {analyticsAllowed,subscribeConsent} from "../../lib/consent";
import {track} from "../../lib/session";
export function DealViewTracker({dealSlug}:{dealSlug:string}) {
 const allowed=useSyncExternalStore(subscribeConsent,analyticsAllowed,()=>false);
 useEffect(()=>{if(allowed)track("DEAL_VIEW",dealSlug);},[dealSlug,allowed]);return null;
}
export function PageTracker() {
 const path=usePathname(),query=useSearchParams().toString();
 useEffect(()=>{track("PAGE_VIEW");},[path,query]);return null;
}
export function Impression({slug}:{slug:string}) {
 const marker=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
   const observer=new IntersectionObserver(entries=>{
     if(entries.some(e=>e.isIntersecting)){track("DEAL_IMPRESSION",slug);observer.disconnect();}
   });
   if(marker.current)observer.observe(marker.current);
   return ()=>observer.disconnect();
 },[slug]);
 return <span aria-hidden="true" ref={marker} style={{display:"inline-block",width:1,height:1}}/>;
}
