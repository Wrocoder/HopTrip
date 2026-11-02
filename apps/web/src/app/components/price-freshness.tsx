'use client';
import type {Deal} from '../../lib/api';
import type {Locale} from '../../lib/i18n/config';
import {intlLocales} from '../../lib/i18n/config';
import {dateTime} from '../../lib/i18n/format';
import {priceObservation} from '../../lib/price-assessment';
import {offerDeadline} from '../../lib/offer-expiry';
import {freshnessCopy} from '../../lib/i18n/freshness-copy';
import {useOfferExpired} from './use-offer-expired';
import Link from 'next/link';
import {stateText} from '../../lib/i18n/state-copy';
import {localizedHref} from '../../lib/i18n/routing';
import {searchUrl} from '../../lib/search-policy';
import {normalizedOrigin} from '../../lib/origin-preference';

export function PriceFreshness({deal,locale='pl',id,compact=false}:{deal:Deal;locale?:Locale;id?:string;compact?:boolean}){
 const t=freshnessCopy[locale],observation=priceObservation(deal,locale),deadline=offerDeadline(deal);
 const expired=useOfferExpired(deadline);
 const stamp=(value:string|null|undefined)=>value&&Number.isFinite(Date.parse(value)) ?
  <time dateTime={value}>{compact ? new Intl.DateTimeFormat(intlLocales[locale],{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Warsaw'}).format(new Date(value)) : dateTime(value,locale)}</time> : t.unknown;
 return <div className="price-freshness" id={id} data-expired={expired}>
  <p>{observation.label}: {stamp(observation.timestamp)} ({t.zone}).</p>
  <p>{t.notLive}</p>
  {expired&&<div role="status" className="price-expired"><strong>{t.expired}</strong><p><Link prefetch={false} href={localizedHref(searchUrl('/deals',{origin:normalizedOrigin(deal.origin_code),destination:deal.destination_slug}),locale)}>{stateText(locale,'Sprawdź aktualne loty')}</Link></p></div>}
  {!compact&&<details><summary>{t.details}</summary>
   <p>{t.delivery}: {stamp(deal.price_freshness?.fetched_at)} ({t.zone}). {t.deliveryNote}</p>
   <p>{t.hidden}: {stamp(deadline)} ({t.zone}). {t.rule.replace('{hours}',String(deal.price_freshness?.max_age_hours??48))}</p>
  </details>}
 </div>;
}
