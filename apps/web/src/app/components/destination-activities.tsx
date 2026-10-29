import {activitiesForDestination} from "../../lib/destination-activities";
import styles from "./destination-activities.module.css";
import {ActivityLink} from "./activity-link";
import {ActivityBudgetLink} from "./activity-budget-link";
import {date} from "../../lib/pl";
import type {Locale} from "../../lib/i18n/config";
import {tripText} from "../../lib/i18n/trip-copy";
import {activityText} from '../../lib/i18n/activity-copy';
import {activityUi,type ActivityUiKey} from '../../lib/i18n/activity-ui';
import {cityLabel} from '../../lib/cities';

export function DestinationActivities({slug,inTrip=false,locale="pl"}:{slug:string;inTrip?:boolean;locale?:Locale}) {
  const source=activitiesForDestination(slug);
  if(!source)return null;
  const translate=(value:string)=>activityText(locale,value);
  const selection={...source,city:cityLabel(source.city,slug,locale),heading:source.heading?translate(source.heading):undefined,
   items:source.items.map(item=>({...item,title:translate(item.title),category:translate(item.category),description:translate(item.description),beforeBooking:translate(item.beforeBooking),
    audience:item.audience?translate(item.audience):undefined,duration:item.duration?translate(item.duration):undefined}))};
  const t=(key:ActivityUiKey,values?:Record<string,string>)=>activityUi(locale,key,values);
  return <section id="destination-activities" tabIndex={-1} className={styles.section} aria-labelledby="destination-activities-title">
    <p className="eyebrow">{tripText(locale,'Pomysły na pobyt')} · {selection.city}</p>
    <h2 id="destination-activities-title">{selection.heading ?? t('museums')}</h2><p>{t('intro')}</p>
    <ul className={styles.grid}>
      {selection.items.map(item=><li key={item.id} className={styles.card}>
        <span className="badge">{item.category}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        {item.audience && <p><strong>{t('audience')}</strong> {item.audience}</p>}
        {item.duration && <p><strong>{t('duration')}</strong> {item.duration}</p>}
        <p className={styles.note}>{item.beforeBooking}</p>
        {item.checkedAt && <p className="muted">{t('reviewed',{date:date(item.checkedAt,locale)})}</p>}
        <div className={styles.booking}>
          <p className="muted">{t(item.freeEntry?'free':item.kind==='visit'?'official':'price')}</p>
          {item.affiliateHref && <p className="muted">{t('affiliate')}</p>}
          <ActivityLink city={slug} activityId={item.id} affiliate={Boolean(item.affiliateHref)}
            className="button button-secondary" href={item.affiliateHref ?? item.href} target="_blank"
            rel={item.affiliateHref ? "sponsored noopener noreferrer" : "noopener noreferrer"}
            aria-label={`${t(item.kind==='visit'?'visit':'buyTiqets')}: ${item.title} (${t('newTab')})`}>
            {t(item.kind==='visit'?'visit':'buy')}
          </ActivityLink>
          {item.durationSource && <p><ActivityLink city={slug} activityId={item.id} affiliate={false}
            href={item.durationSource} target="_blank" rel="noopener noreferrer">{t('durationSource')}</ActivityLink></p>}
        </div>
      </li>)}
    </ul>
    <p className="muted">{t('exclude')}</p>
    {(slug==="barcelona" || selection.heading) && <>
      {slug==="barcelona" && <p className="muted">{t('snapshot',{date:date(selection.checkedAt,locale)})}</p>}
      <p>{t('costs')}</p>
      <ActivityBudgetLink inTrip={inTrip}/>
    </>}
  </section>;
}
