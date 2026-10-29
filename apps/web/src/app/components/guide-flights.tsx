import Link from "next/link";
import {getDeals} from "../../lib/api";
import {DealGrid} from "./catalog";
import type {Locale} from '../../lib/i18n/config';
import {localizedHref} from '../../lib/i18n/routing';
import {guideUi,type GuideUiKey} from '../../lib/i18n/guide-ui';
import {cityLabel} from '../../lib/cities';

export async function GuideFlights({destination,locale='pl'}:{destination:{slug:string;name:string};locale?:Locale}) {
 const city=cityLabel(destination.name,destination.slug,locale);
 const t=(key:GuideUiKey)=>guideUi(locale,key,{city});
 const href=locale==='pl'?`/destinations/${destination.slug}`:localizedHref(`/deals?destination=${encodeURIComponent(destination.slug)}`,locale);
 let deals;
 try {
  deals=await getDeals({destination:destination.slug,limit:"3"});
 } catch {
  return <section aria-label={t('flightsRegion')}><h2>{t('flights')}</h2>
   <p>{t('flightsError')}</p><Link href={href}>{t('retry')}</Link></section>;
 }
 return <section aria-label={t('flightsRegion')}><h2>{t('flights')}</h2>
  <p>{t('flightsNote')}</p><DealGrid deals={deals} locale={locale}/>
  <Link className="text-link" href={href}>{t('allFlights')}</Link>
 </section>;
}
