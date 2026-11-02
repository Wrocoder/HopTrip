import type {Airport,Deal,Filters} from '../../lib/api';
import {airportLabel} from '../../lib/airports';
import {cityLabel} from '../../lib/cities';
import type {Locale} from '../../lib/i18n/config';
import {airportCopy} from '../../lib/i18n/airport-copy';
import {localizedHref} from '../../lib/i18n/routing';
import {searchUrl} from '../../lib/search-policy';

// Reuse the rendered offer window: this is neither a route registry nor a new
// recommendation feed, and needs no extra API requests.
export function AirportContext({airports,deals,filters,locale}:{airports:Airport[];deals:Deal[];filters:Filters;locale:Locale}) {
 const copy=airportCopy[locale],codes=(filters.origin??'').split(',');
 const records=airports.filter(airport=>codes.includes(airport.iata_code));
 const destinations=[...new Map(deals.filter(deal=>codes.includes(deal.origin_code)).map(deal=>[deal.destination_slug,deal])).values()];
 const search={...filters,offset:undefined};
 return <section className="rationale" data-airport-context aria-labelledby="airport-context-heading">
  <h2 id="airport-context-heading">{copy.airport}</h2>
  <ul>{records.map(airport=><li key={airport.iata_code}>{airportLabel(airport,locale)} · {airport.name}</li>)}</ul>
  <p>{copy.note}</p>
  <p><a className="text-link" data-airport-search href={localizedHref(searchUrl('/deals',search),locale)}>{copy.search}</a></p>
  <h3>{copy.destinations}</h3><p>{copy.scope}</p>
  {destinations.length ? <nav className="route-link-grid" aria-label={copy.destinations} data-airport-destinations>
   {destinations.map(deal=><a key={deal.destination_slug} href={localizedHref(searchUrl('/deals',{...search,destination:deal.destination_slug}),locale)}>{cityLabel(deal.destination_city,deal.destination_slug,locale)}</a>)}
  </nav> : <p>{copy.noDestinations}</p>}
 </section>;
}
