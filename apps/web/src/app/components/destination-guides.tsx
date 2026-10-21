import Link from "next/link";
import {guidesForDestination} from "../../lib/guide-destinations";
import type {Locale} from "../../lib/i18n/config";
import {tripText} from "../../lib/i18n/trip-copy";

export function DestinationGuides({slug,locale="pl"}:{slug:string;locale?:Locale}) {
 const guides=guidesForDestination(slug);
 if(!guides.length) return null;
 const label=tripText(locale,"Zaplanuj pobyt"),PolishLink=locale==="pl" ? Link : "a";
 return <nav aria-label={label}><h2>{label}{locale!=="pl" && ` (${tripText(locale,"po polsku")})`}</h2><ul>
  {guides.map(guide=><li key={guide.slug}><PolishLink lang="pl" hrefLang="pl" href={`/info/${guide.slug}`}>{guide.title}</PolishLink></li>)}
 </ul></nav>;
}
