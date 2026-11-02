"use client";

import {useCallback,useEffect,useMemo,useOptimistic,useRef,useTransition,type ReactNode} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {type Airport,type Destination,type Filters} from '../../lib/api';
import {normalizedOrigin,selectedOrigin} from '../../lib/origin-preference';
import {getMessages} from '../../lib/i18n/messages';
import {homeText,type HomeKey} from '../../lib/i18n/home-copy';
import {qualityText} from '../../lib/i18n/quality-copy';
import {localizedHref} from '../../lib/i18n/routing';
import type {Locale} from '../../lib/i18n/config';
import {rememberOrigin} from '../actions/origin-preference';
import {FilterForm} from './filters';
import {OfferState} from './offer-state';
import {stateText} from '../../lib/i18n/state-copy';
import {searchUrl} from '../../lib/search-policy';

type Props={airports:Airport[];destinations:Destination[];initialOrigin:string;initialFilters:Filters;
 count:number;children:ReactNode;initialFailed:boolean;locale:Locale};

export function HomeOrigin({airports,destinations,initialOrigin,initialFilters,count,children,initialFailed,locale}:Props){
 const router=useRouter(),query=useSearchParams(),[pending,startTransition]=useTransition();
 const queryOrigin=query.has('origin') ? (query.getAll('origin').length===1 ? query.get('origin') : []) : undefined;
 const baseOrigin=selectedOrigin(queryOrigin,initialOrigin,null);
 const [origin,setOrigin]=useOptimistic(baseOrigin);
 const latest=useRef(0);
 const searching=useRef(false);
 const onSearch=useCallback(()=>{searching.current=true;latest.current++;},[]);
 const select=useCallback((value:string)=>{
  searching.current=false;
  const next=normalizedOrigin(value),url=new URL(window.location.href);
  if(!url.searchParams.has('origin')){
   url.searchParams.set('origin',origin);
   window.history.replaceState(null,'',url.pathname+url.search+url.hash);
  }
  url.searchParams.set('origin',next);
  const request=++latest.current;
  startTransition(async()=>{
   setOrigin(next);
   // Cookie writes re-render the current route. Navigate after that response so
   // an older snapshot cannot replace links for the newly selected airport.
   try{await rememberOrigin(next);}catch{/* Preference storage is optional. */}
   if(request===latest.current)router.push(url.pathname+url.search+url.hash,{scroll:false});
  });
 },[origin,router,setOrigin]);
 const selection=useMemo(()=>({value:origin,select,onSearch}),[origin,select,onSearch]);
 const current=origin===initialOrigin;
 // Back may restore a cached snapshot from before a cookie write.
 useEffect(()=>{if(!pending && !searching.current && baseOrigin!==initialOrigin)router.refresh();},[pending,baseOrigin,initialOrigin,router]);
 const pl=getMessages(locale);
 const t=(key:HomeKey,values?:Record<string,string|number>)=>homeText(locale,key,values);
 const catalogHref=localizedHref('/deals?'+new URLSearchParams({origin,duration_min:'2',duration_max:'4'}),locale);
 const formQuery=new URLSearchParams(query.toString());formQuery.delete('origin');
 return <>
  <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow"><span className="status-dot"/>{t('Loty z Polski · HopTrip')}</p><h1 id="hero-title">{t('Tanie podróże zaczynają się tutaj.')}</h1><p className="lead">{t('Znajdź lot, sprawdź wydarzenia i zaplanuj wyjazd w jednym miejscu.')}</p></div>
   <FilterForm key={formQuery.toString()} filters={{...initialFilters,origin}} airports={airports} destinations={destinations} hero originSelection={selection}/>
  </section>
  <section className="catalog-section" aria-labelledby="current-deals" aria-busy={!current}>
   <div className="section-heading"><div><p className="eyebrow">{t('Wylot:')} {origin || t('dowolne lotnisko')}</p><h2 id="current-deals">{t('Krótkie wyjazdy · 2–4 noce')}</h2></div><span className="badge">{pl.perPerson} · PLN</span></div>
   <p className="catalog-note">{qualityText(locale,'selection')}</p>
   <button type="button" className="button button-secondary" onClick={()=>document.getElementById('home-origin')?.focus()}>{t('Zmień lotnisko')}</button>
   <p className="field-hint">{t('Lotnisko wybierasz w wyszukiwarce. Ten sam wybór stosujemy do propozycji poniżej i zapamiętujemy na tym urządzeniu.')}</p>
   {!current ? <OfferState kind="loading" heading="h3" title={pl.loading}><p>{stateText(locale,'Pobieramy oferty. Warunki wyszukiwania pozostają w adresie strony.')}</p></OfferState> : initialFailed ? <OfferState kind="error" heading="h3" title={pl.error} actions={<><button type="button" onClick={()=>router.refresh()}>{pl.retry}</button><Link prefetch={false} href={catalogHref}>{stateText(locale,'Wróć do katalogu lotów')}</Link></>}/> : <>
    {count>0 && children}
    {count ? <p role="status">{t('Liczba propozycji na 2–4 noce: {count}.',{count})}</p> : <OfferState kind="empty" heading="h3" title={pl.empty} actions={<><button type="button" onClick={()=>document.getElementById('home-origin')?.focus()}>{stateText(locale,'Wybierz inne lotnisko')}</button><Link prefetch={false} href={localizedHref(searchUrl('/deals',{origin}),locale)}>{stateText(locale,'Sprawdź inne długości pobytu')}</Link></>}><p>{origin ? t('Brak aktualnych lotów na 2–4 noce z tego lotniska. Wybierz inne lotnisko lub sprawdź katalog z inną długością pobytu.') : t('Brak aktualnych lotów na 2–4 noce. Sprawdź katalog z inną długością pobytu.')}</p></OfferState>}
    {count>0 && count<6 && <p>{t('Obecnie pokazujemy mniej propozycji spełniających te warunki. Sprawdź ponownie później lub zmień lotnisko.')}</p>}
   </>}
   <p>{pl.flightOnly} {t('Sprawdź godziny lotów i potrzebne dni urlopu.')}</p>
   <p><Link href={catalogHref}>{t('Zobacz wszystkie loty na 2–4 noce →')}</Link></p>
  </section>
 </>;
}
