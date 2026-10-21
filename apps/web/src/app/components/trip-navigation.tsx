import type {Locale} from "../../lib/i18n/config";
import {tripText,type TripKey} from "../../lib/i18n/trip-copy";
export function TripNavigation({hasAccommodation=true,locale="pl"}:{hasAccommodation?:boolean;locale?:Locale}) {
 const t=(source:TripKey)=>tripText(locale,source);
 return <nav className="trip-navigation" aria-label={t("Sekcje planu podróży")}>
  <a href="#trip-flight">{t("Lot")}</a>
  {hasAccommodation && <a href="#accommodation">{t("Nocleg")}</a>}
  <a href="#calculator">{t("Budżet")}</a>
  <a href="#trip-save">{t("Zapisz")}</a>
 </nav>;
}
