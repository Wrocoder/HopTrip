'use client';

import type {ReactNode} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import type {HomeCollection} from '../../lib/home-collections';
import type {Locale} from '../../lib/i18n/config';
import {collectionCopy} from '../../lib/i18n/collection-copy';
import {localizedHref} from '../../lib/i18n/routing';
import {offerDeadline} from '../../lib/offer-expiry';
import {useOfferExpired} from './use-offer-expired';
import styles from './home-collections.module.css';

export function HomeCollectionPreview({collection,locale,children}:{collection:HomeCollection;locale:Locale;children:ReactNode}){
 const copy=collectionCopy[locale],router=useRouter();
 const deadlines=collection.offers.map(offerDeadline).filter((value):value is string=>!!value);
 const deadline=deadlines.length?new Date(Math.min(...deadlines.map(Date.parse))).toISOString():null;
 const expired=useOfferExpired(deadline);
 const state=collection.status==='ERROR'?'error':expired?'unavailable':collection.status==='EMPTY'?'empty':'ready';
 const message=state==='error'?(collection.error==='QUERY_TOO_BROAD'?copy.tooBroad:copy.error):expired?copy.expired:copy.empty;
 return <section className={styles.collection} data-collection={collection.id} data-state={state} aria-labelledby={'collection-'+collection.id}>
  <h3 id={'collection-'+collection.id}>{copy.titles[collection.id]}</h3>
  <p className={styles.criteria}>{copy.criteria[collection.id]}</p>
  {state==='ready'?children:<p role={state==='error'?'alert':'status'}>{message}</p>}
  <div className={styles.actions}>
   <Link prefetch={false} href={localizedHref(collection.href,locale)}>{copy.search}<span className="sr-only">: {copy.titles[collection.id]}</span><span aria-hidden="true"> →</span></Link>
   {(state==='error'||state==='unavailable')&&<button type="button" className="button button-secondary" onClick={()=>router.refresh()}>{copy.refresh}</button>}
  </div>
 </section>;
}
