"use client";
import {useLocale} from "./locale-provider";
import {tripText,type TripKey} from "../../lib/i18n/trip-copy";
import {Component,type FlightFacts} from "../../lib/api";
import {flightBookingContext} from '../../lib/flight-booking-context';
import {decisionCopy} from '../../lib/trip-decision';

import {publicApi,sessionContext,track} from "../../lib/session";
import {analyticsAllowed} from "../../lib/consent";
import {useTripDraft} from "./trip-draft";
import {passengerInstruction} from "../../lib/passenger-label";
import {useOfferExpired} from './use-offer-expired';
import {freshnessCopy} from '../../lib/i18n/freshness-copy';
import Link from 'next/link';
import {stateText} from '../../lib/i18n/state-copy';
import {localizedHref} from '../../lib/i18n/routing';
import {partnerContextCopy} from '../../lib/i18n/partner-context-copy';
export function Outbound({component,dealSlug,hiddenAfter,facts}:{component:Component;dealSlug?:string;hiddenAfter?:string|null;facts?:FlightFacts}) {
 const {locale,messages:pl}=useLocale();
 const t=(source:TripKey)=>tripText(locale,source);
  const plan=useTripDraft();
  const expired=useOfferExpired(hiddenAfter);
  if(expired)return <div className="price-expired"><p>{freshnessCopy[locale].expired}</p><button className="button button-secondary" onClick={()=>window.location.reload()}>{freshnessCopy[locale].refresh}</button><p><Link prefetch={false} href={localizedHref('/deals',locale)}>{stateText(locale,'Wróć do katalogu lotów')}</Link></p></div>;
  if (!component.available || !component.redirect_path) return <div className="partner-unavailable" role="status"><p>{component.reason==="PROGRAM_UNAVAILABLE" ? t("Oferta partnera jest obecnie niedostępna. Spróbuj ponownie później.") : pl.noLink}</p><Link prefetch={false} href={localizedHref('/deals',locale)}>{stateText(locale,'Wróć do katalogu lotów')}</Link></div>;
  const path=component.redirect_path;
  const bookingContext=component.component_type==='FLIGHT'?flightBookingContext(facts,locale):null;
  return <div data-testid={component.component_type==='FLIGHT'&&plan?'flight-search-limitation':undefined}>{component.component_type==='FLIGHT'&&(bookingContext||plan)&&<p className="partner-limitation">{bookingContext&&<strong data-testid="flight-airport-check">{bookingContext} </strong>}{plan&&decisionCopy[locale].parameters}</p>}{component.component_type!=='FLIGHT'&&<p className="partner-context-limitation">{partnerContextCopy[locale]}</p>}<a className="cta" rel="sponsored noopener noreferrer" href={publicApi(path)} onClick={event=>{
    event.currentTarget.href=publicApi(path);
    if(!analyticsAllowed()) return;
    const category=component.component_type==="FLIGHT" ? "flight" : component.component_type==="HOTEL" ? "stay" : component.component_type==="ACTIVITY" ? "activity" : null;
    if(category)track("PARTNER_CLICK",dealSlug,undefined,{partner:{category,provider:"catalog"}});
    const session=sessionContext();
    const query=new URLSearchParams({session_id:session.id});
    if(session.source)query.set("source",session.source);
    if(session.campaign)query.set("campaign",session.campaign);
    event.currentTarget.href=publicApi(path)+"?"+query;
  }}>{component.partner_name ? `${t(component.component_type==="FLIGHT" ? "Sprawdź lot" : "Sprawdź ofertę")} — ${component.partner_name}` : pl.cta}</a>
  {component.component_type==='FLIGHT'&&plan&&<p className="booking-passengers"><strong>{plan.ready?passengerInstruction(plan.draft.input.people,plan.draft.adultsOnly===true,locale):t('U partnera ustaw skład grupy.')}</strong></p>}
  </div>;
}
