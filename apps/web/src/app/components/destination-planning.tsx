import type {Destination} from '../../lib/api';
import type {Locale} from '../../lib/i18n/config';
import {destinationCopy,destinationSeasons} from '../../lib/i18n/destination-copy';
import {localizedHref} from '../../lib/i18n/routing';
import {countryLabel} from '../../lib/country-label';
import {destinationArrivalSummary} from '../../lib/destination-arrival-summary';
import {destinationEditorial,editorialCopy} from '../../lib/destination-editorial';

export function DestinationPlanning({destination,locale}:{destination:Destination;locale:Locale}){
 const copy=destinationCopy[locale],season=destinationSeasons[destination.slug],arrival=destinationArrivalSummary(destination.slug,locale);
 const profile=destinationEditorial[destination.slug],ec=editorialCopy[locale];
 const source=(passage:NonNullable<typeof profile>['logistics'])=><p><a href={passage.source} rel="noopener noreferrer">{ec.source}: {passage.publisher}</a> · {ec.reviewed}: <time dateTime={profile.reviewed}>{profile.reviewed}</time></p>;
 return <section className="rationale" data-destination-planning aria-labelledby="destination-planning-heading">
  <h2 id="destination-planning-heading">{copy.planning}</h2>
  <p>{copy.country}: {countryLabel(destination.country_code,locale)??'—'} ({destination.country_code})</p>
  {!!destination.iata_codes?.length&&<p>{copy.codes}: {destination.iata_codes.join(', ')}</p>}
  {profile?<div data-destination-editorial><h3>{ec.transport}</h3><p>{profile.logistics.text[locale]}</p>{source(profile.logistics)}</div>:<p>{arrival?.summary??copy.airportNote}</p>}
  {arrival&&<p><a data-destination-arrival href={arrival.href}>{arrival.title}</a></p>}
  <h3>{copy.season}</h3>
  {profile?<><p data-destination-season>{profile.season.text[locale]}</p>{source(profile.season)}</>:season&&<><p>{season.text[locale]}</p><p><a href={season.href}>{copy.source}</a></p></>}
  <p>{copy.seasonNote}</p>
  <h3>{copy.events}</h3><p>{copy.eventsNote}</p>
  <a href={localizedHref('/info/concert-trip',locale)}>{copy.eventsGuide}</a>
 </section>;
}
