import Link from "next/link";
import {guidesForDestination} from "../../lib/guide-destinations";
import type {Locale} from "../../lib/i18n/config";
import {tripText} from "../../lib/i18n/trip-copy";
import {hasGuideTranslation} from '../../lib/i18n/guide-slugs';
import {getInfoContent} from '../../lib/content';
import {editorialCard} from '../../lib/i18n/editorial-card';
import {availableHref,localizedHref} from '../../lib/i18n/routing';
import {activitiesForDestination} from '../../lib/destination-activities';
import {destinationCopy} from '../../lib/i18n/destination-copy';

export function DestinationGuides({slug,locale="pl",summaries=false}:{slug:string;locale?:Locale;summaries?:boolean}) {
 const guides=guidesForDestination(slug);
 if(!guides.length) return null;
 const label=tripText(locale,"Zaplanuj pobyt"),PolishLink=locale==="pl" ? Link : "a";
 return <nav aria-label={label} data-destination-guides><h2>{label}</h2><ul>
  {guides.map(guide=>{
   const translated=locale==='pl'||hasGuideTranslation(guide.slug),language=translated?locale:'pl';
   const card=editorialCard(guide.slug,getInfoContent(guide.slug)!,language);
   return <li key={guide.slug}><PolishLink lang={language} hrefLang={language} href={localizedHref(`/info/${guide.slug}`,language)}>{card.title}{!translated&&` (${tripText(locale,'po polsku')})`}</PolishLink>{summaries&&card.description&&<p className="related-reason" lang={language}>{card.description}</p>}</li>;
  })}
 </ul>{summaries&&activitiesForDestination(slug)&&<p><a data-destination-attractions href={availableHref(`/info/${guides[0].slug}#destination-activities`,locale)}>{destinationCopy[locale].attractions}</a></p>}</nav>;
}
