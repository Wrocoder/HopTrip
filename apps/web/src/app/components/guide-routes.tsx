import type {InfoLink} from '../../lib/info-types';
import type {Locale} from '../../lib/i18n/config';
import {availableHref,localizedHref,pageLocales} from '../../lib/i18n/routing';
import {guideUi} from '../../lib/i18n/guide-ui';
import {shell} from '../../lib/i18n/shell';
import {journeyGuideRoutes} from '../../lib/guide-journey';

export function GuideRoutes({slug,routes,locale='pl'}:{slug:string;routes:InfoLink[];locale?:Locale}){
 const journey=journeyGuideRoutes.includes(slug);
 return <nav aria-label={guideUi(locale,'routes')} data-guide-journey={journey?slug:undefined}>
  <h2>{guideUi(locale,'catalog')}</h2><p>{guideUi(locale,'catalogNote')}</p>
  <ul>{routes.map(route=>{
   const local=route.href.startsWith('/')&&!route.href.startsWith('//'),translated=!local||pageLocales(route.href).includes(locale);
   return <li key={route.href}><a href={local?availableHref(route.href,locale):route.href} {...(local?{hrefLang:translated?locale:'pl'}:{})}>{route.label}{!translated&&` (${shell[locale].polish})`}</a></li>;
  })}
   {journey&&!routes.some(route=>route.href.startsWith('/info/trip-budget'))&&<li><a href={localizedHref('/info/trip-budget#calculator',locale)}>{guideUi(locale,'budgetLink')}</a></li>}
  </ul>
 </nav>;
}
