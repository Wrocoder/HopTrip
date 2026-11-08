import {getInfoContent} from './content';
import {guidesForDestination} from './guide-destinations';
import {translatedGuideContent} from './i18n/guide-content';
import {availableHref,pageLocales} from './i18n/routing';
import type {Locale} from './i18n/config';

// One existing editorial introduction, not a second city article or new facts.
export function destinationArrivalSummary(slug:string,locale:Locale){
 const guide=guidesForDestination(slug).find(guide=>/-airports?$/.test(guide.slug));
 if(!guide)return null;
 const source=getInfoContent(guide.slug);
 if(!source||!pageLocales('/info/'+guide.slug).includes(locale))return null;
 const page=translatedGuideContent(guide.slug,source,locale),summary=page.paragraphs[0];
 return summary?{title:page.title,summary,href:availableHref('/info/'+guide.slug,locale)}:null;
}
