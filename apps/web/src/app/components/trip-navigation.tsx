import type {Locale} from "../../lib/i18n/config";
import {tripText,type TripKey} from "../../lib/i18n/trip-copy";
export function TripNavigation({hasAccommodation=true,hasEvents=false,hasBooking=false,hasActivities=false,hasMethodology=false,locale="pl"}:{hasAccommodation?:boolean;hasEvents?:boolean;hasBooking?:boolean;hasActivities?:boolean;hasMethodology?:boolean;locale?:Locale}) {
 const t=(source:TripKey)=>tripText(locale,source);
 return <nav className="trip-navigation" aria-label={t("Sekcje planu podróży")}>
  <a href="#trip-flight">{t("Lot")}</a>
  {hasBooking && <a href="#trip-booking">{t("Do partnera")}</a>}
  {hasAccommodation && <a href="#accommodation">{t("Nocleg")}</a>}
  {hasActivities && <a href="#destination-activities">{t("Atrakcje")}</a>}
  {hasEvents && <a href="#trip-events">{t("Wydarzenia")}</a>}
  <a href="#calculator">{t("Budżet")}</a>
  <a href="#trip-save">{t("Zapisz")}</a>
  {hasMethodology && <a href="#score">{t("Porównanie ceny")}</a>}
 </nav>;
}
