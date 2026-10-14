import type {Deal} from "../../lib/api";
import {pl} from "../../lib/pl";
import {FlightFacts} from "./flight-facts";
import {PriceAssessment} from "./price-assessment";

export function TripDetails({deal}:{deal:Deal}) {
  return <details className="trip-details">
    <summary>Szczegóły lotu i ceny</summary>
    <div className="trip-details-content">
      <section aria-label="Cena i aktualność">
        <h3>Cena i aktualność</h3>
        <PriceAssessment deal={deal}/>
        <p className="deal-note">{pl.flightOnly}</p>
      </section>
      <section aria-label="Lot i bagaż">
        <h3>Lot i bagaż</h3>
        <FlightFacts deal={deal}/>
      </section>
    </div>
  </details>;
}
