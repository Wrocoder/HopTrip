'use client';
import {useEffect,useRef,useState} from 'react';
import {readTripFragment,readLocalPlanFragment,tripSectionHash,type TripFragment} from '../../lib/trip-fragment';
import {getDeal,type Deal} from '../../lib/api';
import {sharePrivacyCopy} from '../../lib/i18n/share-privacy-copy';
import type {Locale} from '../../lib/i18n/config';
import {SharedTripView,InvalidSharedTrip} from './shared-trip-view';
import {LocalSavedTrip} from './local-saved-trip';
type PlanLocation={kind:'shared';shared:TripFragment}|{kind:'local';id:string;section:string|null};

export function FragmentTrip({locale}:{locale:Locale}){
 const [fragment,setFragment]=useState<PlanLocation|null|undefined>(undefined);
 const remembered=useRef<PlanLocation|null>(null);
 const [catalog,setCatalog]=useState<{token:string;deal:Deal|null;failed:boolean}|null>(null);
 useEffect(()=>{
  const read=()=>{
   const readHash=(hash:string):PlanLocation|null=>{const shared=readTripFragment(hash),local=readLocalPlanFragment(hash);return shared?{kind:'shared',shared}:local?{kind:'local',...local}:null;};
   let next=readHash(location.hash);
   // Native in-page links replace the hash. Retain the payload in that history
   // entry so section navigation, reload, Back and copied addresses still work.
   const anchor=location.hash.slice(1);
   if(!next&&remembered.current&&/^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/.test(anchor)&&document.getElementById(anchor)){
    const current=remembered.current;
    const hash=current.kind==='shared'?tripSectionHash(current.shared.token,anchor):'#local='+current.id+'&section='+anchor;
    history.replaceState(history.state,'',location.pathname+location.search+hash);
    next=readHash(hash);
   }
   remembered.current=next;setFragment(next);
  };
  read();window.addEventListener('hashchange',read);window.addEventListener('popstate',read);
  return()=>{window.removeEventListener('hashchange',read);window.removeEventListener('popstate',read);};
 },[]);
 const shared=fragment?.kind==='shared'?fragment.shared:null;
 const token=shared?.token,slug=shared?.trip.offer.slug;
 useEffect(()=>{
  if(!token||!slug)return;
  let active=true;
  // Only the public offer slug is requested; the plan stays in the browser.
  void getDeal(slug).then(deal=>{if(active)setCatalog({token,deal,failed:false});},()=>{if(active)setCatalog({token,deal:null,failed:true});});
  return()=>{active=false;};
 },[token,slug]);
 const section=fragment?.kind==='local'?fragment.section:shared?.section;
 const localId=fragment?.kind==='local'?fragment.id:null;
 useEffect(()=>{
  if(!section)return;
  const frame=requestAnimationFrame(()=>{const target=document.getElementById(section);target?.focus({preventScroll:true});target?.scrollIntoView({block:'start'});});
  return()=>cancelAnimationFrame(frame);
 },[token,localId,section]);
 if(fragment===undefined)return <main className="page-shell"><h1>{sharePrivacyCopy[locale].title}</h1><p role="status">{sharePrivacyCopy[locale].loading}</p><p>{sharePrivacyCopy[locale].javascript}</p></main>;
 if(!fragment)return <InvalidSharedTrip locale={locale}/>;
 if(fragment.kind==='local')return <LocalSavedTrip key={fragment.id} id={fragment.id} section={fragment.section} locale={locale}/>;
 const checked=catalog?.token===fragment.shared.token;
 return <SharedTripView key={fragment.shared.token} trip={fragment.shared.trip} token={fragment.shared.token} current={checked?catalog.deal:null} failed={checked&&catalog.failed} checking={!checked} locale={locale}/>;
}
