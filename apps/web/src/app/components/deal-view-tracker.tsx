"use client";
import {useEffect,useRef} from "react";
import {usePathname,useSearchParams} from "next/navigation";
import {track} from "../../lib/session";
export function DealViewTracker({dealSlug}:{dealSlug:string}) {
 useEffect(()=>{track("DEAL_VIEW",dealSlug);},[dealSlug]);return null;
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
