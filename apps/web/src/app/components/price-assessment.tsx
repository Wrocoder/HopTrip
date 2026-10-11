import type {Deal} from "../../lib/api";
import {priceAssessment,priceObservation} from "../../lib/price-assessment";
import {dateTime,money} from "../../lib/pl";

export function PriceAssessment({deal}:{deal:Deal}) {
  const assessment=priceAssessment(deal);
  const observation=priceObservation(deal);
  return <div className="price-assessment" aria-label="Cena na tle historii">
    <p className="price-comparison"><strong>{assessment.summary}</strong>
      {assessment.median && <> Mediana: {money(assessment.median)}.</>}</p>
    <p className="price-samples">{assessment.sufficiency}</p>
    <p className="price-observation">{observation.label}: {observation.timestamp ?
      <><time dateTime={observation.timestamp}>{dateTime(observation.timestamp)}</time> (czas w Polsce).</> : "czas nieznany."}
      {!observation.basis && <> Źródło czasu nieznane.</>}</p>
    <p className="price-availability">Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.</p>
  </div>;
}
