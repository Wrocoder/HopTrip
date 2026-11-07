import type {CatalogPage} from "../../lib/catalog-pages";
import type {Locale} from "../../lib/i18n/config";
import {landingText} from "../../lib/i18n/landing-copy";
import {localizedHref,pathLocale} from "../../lib/i18n/routing";
import type {Filters} from '../../lib/api';

export function CatalogLinks({page,locale='pl',filters}:{page:CatalogPage;locale?:Locale;filters?:Filters}){
 return <nav className="route-link-grid" aria-label={landingText(locale,"Zaplanuj podróż")}>{page.links.map(link=>{
  const url=new URL(link.href,'https://hoptrip.invalid');
  const path=localizedHref(url.pathname,'pl');
  if(filters&&['/city-break','/deals','/tanie-loty-na-weekend'].includes(path)){
   for(const key of ['origin','destination','departure_from','departure_to','budget','sort','round_trip'] as const){
    if(filters[key]&&!url.searchParams.has(key))url.searchParams.set(key,filters[key]!);
   }
   if(path==='/tanie-loty-na-weekend')for(const key of ['duration_min','duration_max','work_start','work_end'] as const){if(filters[key]&&!url.searchParams.has(key))url.searchParams.set(key,filters[key]!);}
  }
  const href=url.pathname+url.search+url.hash;
  return <a key={link.href} href={href} hrefLang={pathLocale(href)}>{link.label}</a>;
 })}</nav>;
}
export function CatalogIntro({page,linksFirst=false,showIntro=true,showLinks=true,locale="pl"}:{page:CatalogPage;linksFirst?:boolean;showIntro?:boolean;showLinks?:boolean;locale?:Locale}) {
  const links=showLinks?<CatalogLinks page={page} locale={locale}/>:null;
  return <section className="rationale catalog-intro" aria-label={page.heading}>
    <h2>{page.heading}</h2>
    {linksFirst && links}
    {showIntro && <p>{page.intro}</p>}
    {page.sections.map(section=><div key={section.title}><h3>{section.title}</h3><p>{section.text}</p></div>)}
    {!linksFirst && links}
  </section>;
}
