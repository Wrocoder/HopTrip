"use client";
import {pl} from "../../lib/pl";
import {tripText,type TripKey} from "../../lib/i18n/trip-copy";
import {Component} from "../../lib/api";

import {publicApi,sessionContext,track} from "../../lib/session";
import {analyticsAllowed} from "../../lib/consent";
import {useTripDraft} from "./trip-draft";
import {passengerInstruction} from "../../lib/passenger-label";
import {useOfferExpired} from './use-offer-expired';
import {freshnessCopy} from '../../lib/i18n/freshness-copy';
export function Outbound({component,dealSlug,hiddenAfter}:{component:Component;dealSlug?:string;hiddenAfter?:string|null}) {
 const locale="pl" as const;
 const t=(source:TripKey)=>tripText(locale,source);
  const plan=useTripDraft();
  const expired=useOfferExpired(hiddenAfter);
  if(expired)return <div className="price-expired"><p>{freshnessCopy[locale].expired}</p><button className="button button-secondary" onClick={()=>window.location.reload()}>{freshnessCopy[locale].refresh}</button></div>;
  if (!component.available || !component.redirect_path) return <p>{component.reason==="PROGRAM_UNAVAILABLE" ? t("Oferta partnera jest obecnie niedostępna. Spróbuj ponownie później.") : pl.noLink}</p>;
  const path=component.redirect_path;
  return <>{component.component_type==="FLIGHT" && plan && <p className="partner-limitation" data-testid="flight-search-limitation">
    <strong>{plan.ready ? passengerInstruction(plan.draft.input.people,plan.draft.adultsOnly===true,locale) : t("U partnera ustaw skład grupy.")}</strong>{" "}
    {t("Link otwiera daty tej oferty. Nie przekazujemy zmian dat ani liczby pasażerów z planu. Sprawdź cenę u partnera.")} </p>}<a className="cta" rel="sponsored noopener" href={publicApi(path)} onClick={event=>{
    event.currentTarget.href=publicApi(path);
    if(!analyticsAllowed()) return;
    const category=component.component_type==="FLIGHT" ? "flight" : component.component_type==="HOTEL" ? "stay" : component.component_type==="ACTIVITY" ? "activity" : null;
    if(category)track("PARTNER_CLICK",dealSlug,undefined,{partner:{category,provider:"catalog"}});
    const session=sessionContext();
    const query=new URLSearchParams({session_id:session.id});
    if(session.source)query.set("source",session.source);
    if(session.campaign)query.set("campaign",session.campaign);
    event.currentTarget.href=publicApi(path)+"?"+query;
  }}>{component.partner_name ? `${t(component.component_type==="FLIGHT" ? "Sprawdź lot" : "Sprawdź ofertę")} — ${component.partner_name}` : pl.cta}</a></>;
}
