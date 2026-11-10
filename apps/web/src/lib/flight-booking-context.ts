import type {FlightFacts} from './api.ts';
import type {Locale} from './i18n/config.ts';

// Show the saved itinerary; do not infer or rewrite the partner's opaque ticket.
export function flightBookingContext(facts:FlightFacts|undefined,locale:Locale):string|null{
 if(!facts)return null;
 const airports=[facts.origin_airport,facts.destination_airport,facts.return_origin_airport,facts.return_destination_airport];
 if(!airports.every(code=>typeof code==='string'&&/^[A-Z]{3}$/.test(code)))return null;
 const [origin,destination,back,home]=airports;
 if(origin===home&&destination===back)return null;
 const routes=`${origin} → ${destination}; ${back} → ${home}`;
 const copy={
  pl:`Sprawdź lotniska: ${routes}. Partner może otworzyć ogólne wyszukiwanie.`,
  en:`Check airports: ${routes}. The partner may open a general search.`,
  ru:`Сверьте аэропорты: ${routes}. Партнёр может открыть общий поиск.`,
  uk:`Звірте аеропорти: ${routes}. Партнер може відкрити загальний пошук.`,
 };
 return copy[locale];
}
