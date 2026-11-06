'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useSavedTrips} from './use-saved-trips';
import {SharedTripView} from './shared-trip-view';
import {decodeTrip} from '../../lib/shared-trip';
import {getDeal,type Deal} from '../../lib/api';
import type {SavedPlan} from '../../lib/saved-plans';
import {planSeedKey,readPlanSeed} from '../../lib/plan-editor';
import {planEditorCopy} from '../../lib/i18n/plan-editor-copy';
import {sharePrivacyCopy} from '../../lib/i18n/share-privacy-copy';
import {savedTripCopy} from '../../lib/i18n/saved-trip-copy';
import {localizedHref} from '../../lib/i18n/routing';
import type {Locale} from '../../lib/i18n/config';
export function LocalSavedTrip({id,locale,section}:{id:string;locale:Locale;section:string|null}){
 const store=useSavedTrips(),copy=planEditorCopy[locale];
 const record=store.plans.find(plan=>plan.id===id);
 const [seed,setSeed]=useState<SavedPlan|null|undefined>(undefined);
 const [catalog,setCatalog]=useState<{token:string;deal:Deal|null;failed:boolean}|null>(null);
 useEffect(()=>{
  if(!store.ready||seed!==undefined)return;
  let initial=record??null;
  try{if(initial)sessionStorage.setItem(planSeedKey(id),JSON.stringify(initial));else initial=readPlanSeed(sessionStorage.getItem(planSeedKey(id)),id);}catch{}
  // Freeze the opening snapshot. Cross-tab updates must not remount or erase edits.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setSeed(initial);
 },[store.ready,record,seed,id]);
 const token=seed?.token,trip=token?decodeTrip(token):null,slug=trip?.offer.slug;
 useEffect(()=>{
  if(!token||!slug)return;
  let active=true;void getDeal(slug).then(deal=>{if(active)setCatalog({token,deal,failed:false});},()=>{if(active)setCatalog({token,deal:null,failed:true});});return()=>{active=false;};
 },[token,slug]);
 useEffect(()=>{if(!section||!seed)return;const frame=requestAnimationFrame(()=>{const target=document.getElementById(section);target?.focus({preventScroll:true});target?.scrollIntoView({block:'start'});});return()=>cancelAnimationFrame(frame);},[section,seed]);
 if(!store.ready||seed===undefined)return <main className="page-shell"><h1>{copy.title}</h1><p role="status">{sharePrivacyCopy[locale].loading}</p></main>;
 if(!seed||!trip)return <main className="page-shell"><h1>{copy.missing}</h1><p>{store.readError?copy.loadError:store.corrupt?savedTripCopy[locale].corrupt:copy.missingHint}</p><Link href={localizedHref('/saved',locale)}>{savedTripCopy[locale].listTitle}</Link></main>;
 const checked=catalog!==null&&catalog.token===seed.token;
 return <SharedTripView trip={trip} token={seed.token} localPlan={{id:seed.id,revision:seed.revision}} current={checked?catalog.deal:null} failed={checked&&catalog.failed} checking={!checked} locale={locale}/>;
}
