import type {Deal} from "../../lib/api";
import {priceAssessment,priceObservation} from "../../lib/price-assessment";
import {dateTime,money} from "../../lib/pl";

export function PriceSummary({deal}:{deal:Deal}) {
  const assessment=priceAssessment(deal);
  return <p className="price-summary"><strong>{assessment.summary}</strong>
    {assessment.comparable && <> Próba kierunku, nie identycznych taryf.</>}</p>;
}

export function PriceAssessment({deal}:{deal:Deal}) {
  const assessment=priceAssessment(deal);
  const observation=priceObservation(deal);
  return <div className="price-assessment" aria-label="Cena na tle historii">
    <p className="price-comparison"><strong>{assessment.summary}</strong>
      {assessment.median && <> Mediana: {money(assessment.median)}.</>}</p>
    <details><summary>Zakres i wiarygodność porównania</summary>
      <p className="price-samples">{assessment.sufficiency}</p>
      <p>Porównujemy zapisane ceny lotu na osobę w PLN, osobno dla lotów w jedną stronę i z powrotem.
        Grupa obejmuje tego samego dostawcę, lotnisko wylotu, kierunek, miesiąc i długość pobytu.
        Lotniska docelowe i warunki taryfy mogą się różnić. To nie jest potwierdzona oszczędność ani ocena wygody lotu.</p>
    </details>
    <p className="price-observation">{observation.label}: {observation.timestamp ?
      <><time dateTime={observation.timestamp}>{dateTime(observation.timestamp)}</time> (czas w Polsce).</> : "czas nieznany."}
      {!observation.basis && <> Źródło czasu nieznane.</>}</p>
    <p className="price-availability">Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.</p>
  </div>;
}
