import type {Deal} from "../../lib/api";
import {getMessages} from "../../lib/i18n/messages";
import type {Locale} from "../../lib/i18n/config";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import {FlightFacts} from "./flight-facts";
import {PriceAssessment} from "./price-assessment";
import {qualityNotice} from '../../lib/flight-quality';
import {qualityText,qualityReasonText} from '../../lib/i18n/quality-copy';
import {weekendCopy} from '../../lib/weekend';
import {PriceMetadata} from './price-freshness';
import {AirportContextDetails} from './airport-warnings';
import {OfferDetailsDisclosure} from './offer-details-disclosure';
import {DestinationTimeSummary} from './destination-time';
import {stayWarnings,stayModelBasis} from '../../lib/weekend-stay';

export function TripDetails({deal,locale="pl",qualityDetails=false,includePrice=true}:{deal:Deal;locale?:Locale;qualityDetails?:boolean;includePrice?:boolean}) {
  const pl=getMessages(locale),t=(source:CatalogKey)=>catalogText(locale,source);
  const notice=qualityDetails ? qualityNotice(deal) : null;
  return <OfferDetailsDisclosure slug={deal.slug} className="trip-details">
    <summary>{t(includePrice ? "Szczegóły lotu i ceny" : "Pełne dane lotu i bagaż")}</summary>
    <div className="trip-details-content">
      {includePrice && <section role="group" aria-label={t("Cena i aktualność")}>
        <h3>{t("Cena i aktualność")}</h3>
        <PriceAssessment deal={deal} locale={locale}/>
        {qualityDetails&&<PriceMetadata deal={deal} locale={locale}/>}
        <p className="deal-note">{pl.flightOnly}</p>
      </section>}
      <section role="group" aria-label={t("Lot i bagaż")}>
        <h3>{t("Lot i bagaż")}</h3>
        {notice?.status==='PARTIAL' && <div className="card-quality-details"><strong>{qualityText(locale,'partial')}</strong><ul>{notice.reasons.map(reason=><li key={reason}>{qualityReasonText(locale,reason)}</li>)}</ul></div>}
        <FlightFacts deal={deal} locale={locale}/>
        {qualityDetails&&<DestinationTimeSummary deal={deal} locale={locale}/>}
        {qualityDetails&&stayWarnings(deal,locale,false).length>0&&<p className="stay-model-basis">{stayModelBasis(locale)}</p>}
        {qualityDetails&&deal.weekend_assessment?.might_require_leave!=null&&<p className="card-work-hours">
         {weekendCopy[locale].start}: {deal.weekend_assessment.work_hours.start} · {weekendCopy[locale].end}: {deal.weekend_assessment.work_hours.end} · {deal.weekend_assessment.work_timezone}
        </p>}
      </section>
      <AirportContextDetails deal={deal} locale={locale}/>
    </div>
  </OfferDetailsDisclosure>;
}
