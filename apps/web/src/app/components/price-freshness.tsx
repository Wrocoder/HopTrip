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
import {cardCopy} from '../../lib/i18n/card-copy';

export function PriceMetadata({deal,locale='pl'}:{deal:Deal;locale?:Locale}){
 const t=freshnessCopy[locale],deadline=offerDeadline(deal);
 const stamp=(value:string|null|undefined)=>value&&Number.isFinite(Date.parse(value))?<time dateTime={value}>{dateTime(value,locale)}</time>:t.unknown;
 return <div className="card-price-origin">
  <p>{t.delivery}: {stamp(deal.price_freshness?.fetched_at)} ({t.zone}). {t.deliveryNote}</p>
  <p>{t.hidden}: {stamp(deadline)} ({t.zone}). {t.rule.replace('{hours}',String(deal.price_freshness?.max_age_hours??48))}</p>
 </div>;
}

export function PriceFreshness({deal,locale='pl',id,compact=false}:{deal:Deal;locale?:Locale;id?:string;compact?:boolean}){
 const t=freshnessCopy[locale],observation=priceObservation(deal,locale),deadline=offerDeadline(deal);
 const expired=useOfferExpired(deadline);
 const c=cardCopy[locale];
 const stamp=(value:string|null|undefined,full=false)=>value&&Number.isFinite(Date.parse(value)) ?
  <time dateTime={value}>{compact&&!full ? new Intl.DateTimeFormat(intlLocales[locale],{dateStyle:'short',timeZone:'Europe/Warsaw'}).format(new Date(value)) : dateTime(value,locale)}</time> : t.unknown;
 return <div className="price-freshness" id={id} data-expired={expired}>
  <p>{compact?(observation.basis==='SOURCE'?c.source:observation.basis==='FIRST_SEEN'?c.first:c.unknown):observation.label}: {stamp(observation.timestamp)}{!compact&&` (${t.zone})`}.</p>
  <p>{compact?c.notLive:t.notLive}</p>
  {expired&&<div role="status" className="price-expired"><strong>{t.expired}</strong><p><Link prefetch={false} href={localizedHref(searchUrl('/deals',{origin:normalizedOrigin(deal.origin_code),destination:deal.destination_slug}),locale)}>{stateText(locale,'Sprawdź aktualne loty')}</Link></p></div>}
  {!compact&&<details><summary>{t.details}</summary><PriceMetadata deal={deal} locale={locale}/></details>}
 </div>;
}
