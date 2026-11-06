import type {Deal} from '../../lib/api';
import type {Locale} from '../../lib/i18n/config';
import {airportContextCopy,airportContexts,airportNoticeLines,airportSource} from '../../lib/airport-context';
import {cityLabel} from '../../lib/cities';
export function AirportContextNotice({deal,locale}:{deal:Deal;locale:Locale}){
 return <div className="airport-context-notice">{airportNoticeLines(deal,locale).map((line,i)=><p className="deal-note" key={i}>{i===0&&line!==airportContextCopy[locale].unknown?<strong>{line}</strong>:line}</p>)}</div>;
}
export function AirportContextDetails({deal,locale}:{deal:Deal;locale:Locale}){
 const t=airportContextCopy[locale],contexts=airportContexts(deal),c=deal.airport_context;
 return <section className="airport-context-details"><h3>{t.title}</h3>
  {contexts.length?contexts.map((x,i)=>{const source=airportSource(x.source);return <div key={i}>
   <p>{x.airport??'?'}{x.target_city&&` · ${cityLabel(x.target_city,x.destination_slug,locale)}`}: {x.status==='KNOWN'?`${t.distance}: ≈${x.distance_km} km.`:x.status==='STALE'?t.stale:t.metadataUnknown}</p>
   {source&&<p><a href={source} rel="noopener noreferrer">{t.source}: {new URL(source).hostname}</a>{x.last_verified_at&&` · ${t.reviewed}: ${x.last_verified_at}`}</p>}
  </div>}):<p>{t.metadataUnknown}</p>}
  <p>{t.unknown}</p><p>{t.basis}</p><p>{t.policy}</p>
  {c?.itinerary_verified&&c.warnings.some(x=>x==='ARRIVAL_TIME_UNKNOWN'||x==='RETURN_DEPARTURE_TIME_UNKNOWN')&&<p>{t.clockUnknown}</p>}
 </section>;
}
