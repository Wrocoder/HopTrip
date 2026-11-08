import type {Destination} from '../../lib/api';
import type {Locale} from '../../lib/i18n/config';
import {destinationCopy,destinationSeasons} from '../../lib/i18n/destination-copy';
import {localizedHref} from '../../lib/i18n/routing';
import {countryLabel} from '../../lib/country-label';
import {destinationArrivalSummary} from '../../lib/destination-arrival-summary';

export function DestinationPlanning({destination,locale}:{destination:Destination;locale:Locale}){
 const copy=destinationCopy[locale],season=destinationSeasons[destination.slug],arrival=destinationArrivalSummary(destination.slug,locale);
 return <section className="rationale" data-destination-planning aria-labelledby="destination-planning-heading">
  <h2 id="destination-planning-heading">{copy.planning}</h2>
  <p>{copy.country}: {countryLabel(destination.country_code,locale)??'—'} ({destination.country_code})</p>
  {!!destination.iata_codes?.length&&<p>{copy.codes}: {destination.iata_codes.join(', ')}</p>}
  <p>{arrival?.summary??copy.airportNote}</p>
  {arrival&&<p><a data-destination-arrival href={arrival.href}>{arrival.title}</a></p>}
  <h3>{copy.season}</h3>
  {season&&<><p>{season.text[locale]}</p><p><a href={season.href}>{copy.source}</a></p></>}
  <p>{copy.seasonNote}</p>
  <h3>{copy.events}</h3><p>{copy.eventsNote}</p>
  <a href={localizedHref('/info/concert-trip',locale)}>{copy.eventsGuide}</a>
 </section>;
}
