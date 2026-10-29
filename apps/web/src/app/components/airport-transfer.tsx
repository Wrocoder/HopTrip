import Link from "next/link";
import {transferForGuide} from "../../lib/airport-transfers";
import styles from "./destination-activities.module.css";
import type {Locale} from '../../lib/i18n/config';
import {guideUi,type GuideUiKey} from '../../lib/i18n/guide-ui';
import {localizedHref} from '../../lib/i18n/routing';
import {eventCityLabel} from '../../lib/cities';

export function AirportTransfer({slug,locale='pl'}:{slug:string;locale?:Locale}) {
 const transfer=transferForGuide(slug);
 if(!transfer) return null;
 const t=(key:GuideUiKey)=>guideUi(locale,key,{city:eventCityLabel(transfer.city,locale)});
 return <aside className={styles.card} aria-label={t('transfer')}>
  <h2>{t('transferTitle')}</h2><p>{t('transferNote')}</p>
  <p><a className="button button-secondary" href={transfer.affiliateHref} target="_blank"
   rel="sponsored noopener noreferrer">{t('transferButton')}</a></p>
  <p className="muted">{t('transferDisclosure')}</p>
  <Link href={localizedHref('/info/trip-budget#calculator',locale)}>{t('transferBudget')}</Link>
 </aside>;
}
