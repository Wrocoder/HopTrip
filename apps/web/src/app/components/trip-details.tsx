import type {Deal} from "../../lib/api";
import {getMessages} from "../../lib/i18n/messages";
import type {Locale} from "../../lib/i18n/config";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import {FlightFacts} from "./flight-facts";
import {PriceAssessment} from "./price-assessment";

export function TripDetails({deal,locale="pl"}:{deal:Deal;locale?:Locale}) {
  const pl=getMessages(locale),t=(source:CatalogKey)=>catalogText(locale,source);
  return <details className="trip-details">
    <summary>{t("Szczegóły lotu i ceny")}</summary>
    <div className="trip-details-content">
      <section aria-label={t("Cena i aktualność")}>
        <h3>{t("Cena i aktualność")}</h3>
        <PriceAssessment deal={deal} locale={locale}/>
        <p className="deal-note">{pl.flightOnly}</p>
      </section>
      <section aria-label={t("Lot i bagaż")}>
        <h3>{t("Lot i bagaż")}</h3>
        <FlightFacts deal={deal} locale={locale}/>
      </section>
    </div>
  </details>;
}
