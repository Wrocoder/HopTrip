"use client";
import {Component} from "../../lib/api";
import {pl} from "../../lib/pl";
import {publicApi,sessionContext} from "../../lib/session";
import {analyticsAllowed} from "../../lib/consent";
export function Outbound({component}:{component:Component}) {
  if (!component.available || !component.redirect_path) return <p>{pl.noLink}</p>;
  const path=component.redirect_path;
  return <a className="cta" href={publicApi(path)} onClick={event=>{
    event.currentTarget.href=publicApi(path);
    if(!analyticsAllowed()) return;
    const session=sessionContext();
    const query=new URLSearchParams({session_id:session.id});
    if(session.source)query.set("source",session.source);
    if(session.campaign)query.set("campaign",session.campaign);
    event.currentTarget.href=publicApi(path)+"?"+query;
  }}>{pl.cta}</a>;
}
