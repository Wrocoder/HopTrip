import {arrivalCopy,arrivalSources,arrivalUi,type ArrivalSlug} from '../../lib/airport-arrival';
import type {Locale} from '../../lib/i18n/config';
import {localizedHref} from '../../lib/i18n/routing';
import styles from './airport-arrival.module.css';

export function AirportArrival({slug,locale='pl'}:{slug:ArrivalSlug;locale?:Locale}){
 const text=arrivalCopy[slug][locale],ui=arrivalUi[locale];
 const city=slug==='malaga-airport'?'malaga':'lisbon',plan=city==='malaga'?'malaga-weekend':'lisbon-3-days';
 return <div className={styles.guide} data-airport-arrival={slug}>
  <section aria-labelledby={`${slug}-answer`}><h2 id={`${slug}-answer`}>{text.title}</h2><p>{text.answer}</p><p>{text.ticket}</p>
   <p className="muted">{ui.checked}: <time dateTime="2026-11-07">2026-11-07</time></p>
   <ul aria-label={ui.sources}>{arrivalSources[slug].map(source=><li key={source.href}><a href={source.href}>{source.label}</a></li>)}</ul>
  </section>
  <nav aria-label={ui.contents}><ul>{text.topics.map((topic,index)=><li key={topic}><a href={`#${slug}-section-${index}`}>{topic}</a></li>)}</ul></nav>
  <section aria-labelledby={`${slug}-compare`}><h2 id={`${slug}-compare`}>{ui.compare}</h2>
   <table><caption>{text.title}</caption><thead><tr><th scope="col">{ui.transport}</th><th scope="col">{ui.cost}</th><th scope="col">{ui.route}</th></tr></thead>
    <tbody>{text.rows.map(row=><tr key={row[0]}><th scope="row">{row[0]}</th><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody>
   </table>
  </section>
  <section aria-labelledby={`${slug}-details`}><h2 id={`${slug}-details`}>{ui.details}</h2><p>{text.detail}</p></section>
  <ul><li><a href={localizedHref(`/info/${plan}`,locale)}>{ui.plan}</a></li><li><a href={localizedHref(`/deals?destination=${city}`,locale)}>{ui.flights}</a></li></ul>
 </div>;
}
