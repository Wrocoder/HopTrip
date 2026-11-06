import {cache} from 'react';
import Link from 'next/link';
import type {Metadata} from 'next';
import {getDestinations} from '../../lib/api';
import {destinationLabel} from '../../lib/destinations';
import {destinationBrowseHref,destinationGroups,directoryQuery} from '../../lib/destination-directory';
import {directoryCopy} from '../../lib/i18n/directory-copy';
import {locales,openGraphLocales,type Locale} from '../../lib/i18n/config';
import {languageAlternates,localizedHref} from '../../lib/i18n/routing';
import {ApiUnavailable} from '../components/api-unavailable';
import {OfferState} from '../components/offer-state';
import styles from './directory.module.css';

export const dynamic='force-dynamic';
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>;locale?:Locale};
const load=cache(async()=>{try{return {destinations:await getDestinations(),failed:false};}catch{return {destinations:[],failed:true};}});
export async function generateMetadata({searchParams,locale='pl'}:Props):Promise<Metadata>{
 const raw=await searchParams,{failed}=await load(),copy=directoryCopy[locale],canonical=localizedHref('/destinations',locale);
 return {title:copy.title,description:copy.description,alternates:{canonical,languages:languageAlternates('/destinations',locales)},
  robots:{index:!failed&&Object.keys(raw).length===0,follow:true},
  openGraph:{title:copy.title,description:copy.description,url:canonical,locale:openGraphLocales[locale],type:'website'}};
}
export default async function DestinationsPage({searchParams,locale='pl'}:Props){
 const query=directoryQuery((await searchParams).q),{destinations,failed}=await load(),copy=directoryCopy[locale];
 const path='/destinations',href=localizedHref(path,locale);
 if(failed)return <ApiUnavailable locale={locale} path={path+(query?'?'+new URLSearchParams({q:query}):'')}/>;
 const groups=destinationGroups(destinations,query,locale),count=groups.reduce((sum,group)=>sum+group.destinations.length,0);
 return <main className={'page-shell '+styles.directory}>
  <header className="page-heading"><h1>{copy.heading}</h1><p className="lead">{copy.description}</p><p>{copy.note}</p></header>
  <form className={styles.search} action={href} method="get" role="search" aria-label={copy.submit}>
   <label htmlFor="directory-query">{copy.search}<input id="directory-query" name="q" type="search" defaultValue={query} maxLength={100}/></label>
   <button type="submit" className="button">{copy.submit}</button><Link prefetch={false} href={href}>{copy.clear}</Link>
  </form>
  <p role="status">{copy.count.replace('{count}',String(count))}</p>
  {groups.length>0?<>
   <nav aria-label={copy.countries} className={styles.countries}>{groups.map(group=><a key={group.code} href={'#country-'+group.code}>{group.label}</a>)}</nav>
   {groups.map(group=><section key={group.code} className={styles.group} aria-labelledby={'country-'+group.code}>
    <h2 id={'country-'+group.code} tabIndex={-1}>{group.label}</h2>
    <ul className={styles.cities}>{group.destinations.map(destination=><li key={destination.id}>
     <Link prefetch={false} data-destination-slug={destination.slug} href={destinationBrowseHref(destination,locale)}>{destinationLabel(destination,locale)}</Link>
    </li>)}</ul>
   </section>)}
  </>:<OfferState kind="empty" title={query?copy.noMatch:copy.empty}/>}
 </main>;
}
