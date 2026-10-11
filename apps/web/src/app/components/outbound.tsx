"use client";
import {Component} from "../../lib/api";
import {pl} from "../../lib/pl";
import {publicApi,sessionContext,track} from "../../lib/session";
import {analyticsAllowed} from "../../lib/consent";
export function Outbound({component,dealSlug}:{component:Component;dealSlug?:string}) {
  if (!component.available || !component.redirect_path) return <p>{component.reason==="PROGRAM_UNAVAILABLE" ? "Oferta partnera jest obecnie niedostępna. Spróbuj ponownie później." : pl.noLink}</p>;
  const path=component.redirect_path;
  return <a className="cta" rel="sponsored noopener" href={publicApi(path)} onClick={event=>{
    event.currentTarget.href=publicApi(path);
    if(!analyticsAllowed()) return;
    const category=component.component_type==="FLIGHT" ? "flight" : component.component_type==="HOTEL" ? "stay" : component.component_type==="ACTIVITY" ? "activity" : null;
    if(category)track("PARTNER_CLICK",dealSlug,undefined,{partner:{category,provider:"catalog"}});
    const session=sessionContext();
    const query=new URLSearchParams({session_id:session.id});
    if(session.source)query.set("source",session.source);
    if(session.campaign)query.set("campaign",session.campaign);
    event.currentTarget.href=publicApi(path)+"?"+query;
  }}>{component.partner_name ? `Sprawdź ${component.component_type==="FLIGHT" ? "lot" : "ofertę"} — ${component.partner_name}` : pl.cta}</a>;
}
