import type {Deal} from "../../lib/api";
import {getMessages} from "../../lib/i18n/messages";
import type {Locale} from "../../lib/i18n/config";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import {FlightFacts} from "./flight-facts";
import {PriceAssessment} from "./price-assessment";
import {qualityNotice} from '../../lib/flight-quality';
import {qualityText,qualityReasonText} from '../../lib/i18n/quality-copy';

export function TripDetails({deal,locale="pl",qualityDetails=false,includePrice=true}:{deal:Deal;locale?:Locale;qualityDetails?:boolean;includePrice?:boolean}) {
  const pl=getMessages(locale),t=(source:CatalogKey)=>catalogText(locale,source);
  const notice=qualityDetails ? qualityNotice(deal) : null;
  return <details className="trip-details">
    <summary>{t(includePrice ? "Szczegóły lotu i ceny" : "Pełne dane lotu i bagaż")}</summary>
    <div className="trip-details-content">
      {includePrice && <section aria-label={t("Cena i aktualność")}>
        <h3>{t("Cena i aktualność")}</h3>
        <PriceAssessment deal={deal} locale={locale}/>
        <p className="deal-note">{pl.flightOnly}</p>
      </section>}
      <section aria-label={t("Lot i bagaż")}>
        <h3>{t("Lot i bagaż")}</h3>
        {notice?.status==='PARTIAL' && <div className="card-quality-details"><strong>{qualityText(locale,'partial')}</strong><ul>{notice.reasons.map(reason=><li key={reason}>{qualityReasonText(locale,reason)}</li>)}</ul></div>}
        <FlightFacts deal={deal} locale={locale}/>
      </section>
    </div>
  </details>;
}
