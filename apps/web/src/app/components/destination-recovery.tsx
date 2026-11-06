'use client';
import type {ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import type {DestinationRecoveryData} from '../../lib/destination-recovery';
import {offerDeadline} from '../../lib/offer-expiry';
import {useOfferExpired} from './use-offer-expired';
import {destinationRecoveryCopy} from '../../lib/i18n/destination-recovery-copy';
import type {Locale} from '../../lib/i18n/config';
import {localizedHref} from '../../lib/i18n/routing';

export function DestinationRecovery({data,slug,locale,children}:{data:DestinationRecoveryData;slug:string;locale:Locale;children:ReactNode}){
 const copy=destinationRecoveryCopy[locale],router=useRouter();
 const deadlines=data.offers.map(offerDeadline).filter((value):value is string=>!!value);
 const deadline=deadlines.length?new Date(Math.min(...deadlines.map(Date.parse))).toISOString():null;
 const expired=useOfferExpired(deadline),state=data.status==='ERROR'?'error':expired?'expired':data.status==='EMPTY'?'empty':'ready';
 return <section className="rationale" data-destination-recovery data-recovery-state={state} aria-labelledby="destination-recovery-title">
  <h2 id="destination-recovery-title">{copy.title}</h2><p>{copy.intro}</p><p>{copy.flex}</p>
  <nav className="route-link-grid" aria-label={copy.search}>
   <a href={localizedHref('/deals?'+new URLSearchParams({destination:slug}),locale)}>{copy.search}</a>
   <a href={localizedHref('/destinations',locale)}>{copy.directory}</a>
   {data.alertsActive&&<a href={localizedHref('/alerts',locale)}>{copy.alerts}</a>}
  </nav>
  {state==='ready'?children:<p role={state==='error'?'alert':'status'}>{state==='error'?copy.error:state==='expired'?copy.expired:copy.empty}</p>}
  {(state==='error'||state==='expired')&&<button type="button" className="button button-secondary" onClick={()=>router.refresh()}>{copy.refresh}</button>}
 </section>;
}
