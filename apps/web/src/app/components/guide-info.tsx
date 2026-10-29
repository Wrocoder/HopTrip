import {Suspense} from 'react';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getInfoContent,relatedInfoPages} from '../../lib/content';
import {locales,openGraphLocales,type Locale} from '../../lib/i18n/config';
import {hasGuideTranslation} from '../../lib/i18n/guide-slugs';
import {translatedGuideContent} from '../../lib/i18n/guide-content';
import {availableHref,localizedHref,languageAlternates,pageLocales} from '../../lib/i18n/routing';
import {guideUi,type GuideUiKey} from '../../lib/i18n/guide-ui';
import {editorialCard} from '../../lib/i18n/editorial-card';
import {editorialCopy} from '../../lib/i18n/editorial-copy';
import {shell} from '../../lib/i18n/shell';
import {getMessages} from '../../lib/i18n/messages';
import {destinationForGuide} from '../../lib/guide-destinations';
import {cityLabel} from '../../lib/cities';
import {GuideFlights} from './guide-flights';
import {TripBudgetCalculator} from './trip-budget-calculator';
import {AirportTransfer} from './airport-transfer';
import {DestinationActivities} from './destination-activities';

function guide(slug:string,locale:Locale){
 const source=getInfoContent(slug);
 if(!source||source.draft||source.noindex||!hasGuideTranslation(slug))notFound();
 return translatedGuideContent(slug,source,locale);
}
export function guideMetadata(slug:string,locale:Locale):Metadata {
 const page=guide(slug,locale),path=`/info/${slug}`,url=localizedHref(path,locale),description=page.description??page.paragraphs[0];
 return {title:page.title,description,alternates:{canonical:url,languages:languageAlternates(path,locales)},robots:{index:true,follow:true},
  openGraph:{title:page.title,description,url,locale:openGraphLocales[locale],type:'website',images:[]},
  twitter:{card:'summary',title:page.title,description,images:[]}};
}
export function GuideInfo({slug,locale}:{slug:string;locale:Locale}){
 const page=guide(slug,locale),text=editorialCopy[locale],t=(key:GuideUiKey,values?:Record<string,string>)=>guideUi(locale,key,values);
 const destination=destinationForGuide(slug),base=process.env.NEXT_PUBLIC_SITE_URL??'http://localhost:3000';
 const crumbs=[{name:t('home'),href:localizedHref('/',locale)},{name:text.title,href:localizedHref('/info',locale)},{name:page.title,href:localizedHref(`/info/${slug}`,locale)}];
 const breadcrumbs={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:new URL(c.href,base).href}))};
 const link=(href:string,label:string)=>{
  const local=href.startsWith('/')&&!href.startsWith('//'),translated=!local||pageLocales(href).includes(locale);
  return <a href={local?availableHref(href,locale):href} {...(local?{hrefLang:translated?locale:'pl'}:{})}>{label}{!translated&&` (${shell[locale].polish})`}</a>;
 };
 return <main className="page-shell">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbs).replace(/</g,'\\u003c')}}/>
  <nav className="breadcrumbs" aria-label={t('breadcrumbs')}><ol>{crumbs.map((c,i)=><li key={c.href}>{i===crumbs.length-1?<span aria-current="page">{c.name}</span>:<a href={c.href}>{c.name}</a>}</li>)}</ol></nav>
  <article className="deal-detail"><h1>{page.title}</h1>
   {page.reviewedAt&&<p className="muted">HopTrip · {text.reviewed} <time dateTime={page.reviewedAt}>{page.reviewedAt}</time></p>}
   {page.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
   {slug==='trip-budget'&&<TripBudgetCalculator/>}
   {page.sections?.map((section,i)=><section key={i}><h2>{section.title}</h2>{section.paragraphs.map((p,j)=><p key={j}>{p}</p>)}
    {section.links&&<ul>{section.links.map(item=><li key={item.href}>{link(item.href,item.label)}</li>)}</ul>}
    {section.sourceIds&&<ul aria-label={`${t('sources')}: ${section.title}`}>{section.sourceIds.map(id=>{const source=page.sources?.[id];return source?<li key={id}><a href={source.href}>{source.label}</a></li>:null;})}</ul>}
   </section>)}
   <AirportTransfer slug={slug} locale={locale}/>
   {page.sources&&<section aria-label={t('updates')}><h2>{t('updatesTitle')}</h2><p>{t('updatesText',{date:page.reviewedAt??''})}</p></section>}
   {page.routes&&<nav aria-label={t('routes')}><h2>{t('catalog')}</h2><p>{t('catalogNote')}</p><ul>{page.routes.map(item=><li key={item.href}>{link(item.href,item.label)}</li>)}</ul></nav>}
   {destination&&<DestinationActivities slug={destination.slug} locale={locale}/>}
   {slug==='islandia-wieloryby-lodowce-atrakcje'&&<><p>{t('icelandPickup')}</p><DestinationActivities slug="reykjavik" locale={locale}/></>}
   {!!relatedInfoPages(slug).length&&<nav aria-label={text.related}><h2>{text.related}</h2><ul>{relatedInfoPages(slug).map(({slug:key,page:related})=>{
    const card=editorialCard(key,related,locale),reason=({baggage:'baggageReason',connections:'connectionsReason','trip-budget':'budgetReason'} as const)[key as 'baggage'|'connections'|'trip-budget'];
    return <li key={key}>{link(`/info/${key}`,card.title)}{(reason||card.description)&&<p className="related-reason">{reason?t(reason):card.description}</p>}</li>;
   })}</ul><a href={localizedHref('/deals',locale)}>{getMessages(locale).deals}</a></nav>}
  </article>
  {destination&&<Suspense fallback={<p role="status">{t('flightsLoading',{city:cityLabel(destination.name,destination.slug,locale)})}</p>}><GuideFlights destination={destination} locale={locale}/></Suspense>}
 </main>;
}
