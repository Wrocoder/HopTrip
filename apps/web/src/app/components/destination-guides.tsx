import Link from "next/link";
import {guidesForDestination} from "../../lib/guide-destinations";
import type {Locale} from "../../lib/i18n/config";
import {tripText} from "../../lib/i18n/trip-copy";
import {hasGuideTranslation} from '../../lib/i18n/guide-slugs';
import {getInfoContent} from '../../lib/content';
import {editorialCard} from '../../lib/i18n/editorial-card';
import {localizedHref} from '../../lib/i18n/routing';

export function DestinationGuides({slug,locale="pl"}:{slug:string;locale?:Locale}) {
 const guides=guidesForDestination(slug);
 if(!guides.length) return null;
 const label=tripText(locale,"Zaplanuj pobyt"),PolishLink=locale==="pl" ? Link : "a";
 return <nav aria-label={label}><h2>{label}</h2><ul>
  {guides.map(guide=>{
   const translated=locale==='pl'||hasGuideTranslation(guide.slug),language=translated?locale:'pl';
   const card=editorialCard(guide.slug,getInfoContent(guide.slug)!,language);
   return <li key={guide.slug}><PolishLink lang={language} hrefLang={language} href={localizedHref(`/info/${guide.slug}`,language)}>{card.title}{!translated&&` (${tripText(locale,'po polsku')})`}</PolishLink></li>;
  })}
 </ul></nav>;
}
