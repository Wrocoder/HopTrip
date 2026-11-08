import type {Locale} from "../../lib/i18n/config";
import {tripText} from "../../lib/i18n/trip-copy";
import {tripSectionCopy} from '../../lib/i18n/trip-section-copy';
export function TripNavigation({locale="pl"}:{locale?:Locale}) {
 const copy=tripSectionCopy[locale];
 return <nav className="trip-navigation" aria-label={tripText(locale,"Sekcje planu podróży")}>
  <a href="#trip-flight">{copy.flight}</a>
  <a href="#trip-stay">{copy.stay}</a>
  <a href="#calculator">{copy.budget}</a>
  <a href="#trip-save">{copy.save}</a>
 </nav>;
}
