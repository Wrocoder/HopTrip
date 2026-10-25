import type {Locale} from "../../lib/i18n/config";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import type {Deal} from "../../lib/api";
import {priceAssessment,priceObservation} from "../../lib/price-assessment";
import {dateTime,money} from "../../lib/i18n/format";

export function PriceSummary({deal,locale="pl"}:{deal:Deal;locale?:Locale}) {
  const t=(source:CatalogKey)=>catalogText(locale,source);
  const assessment=priceAssessment(deal,locale);
  return <p className="price-summary"><strong>{assessment.summary}</strong>
    {assessment.comparable && <> {t("Próba kierunku, nie identycznych taryf.")}</>}</p>;
}

export function PriceAssessment({deal,locale="pl"}:{deal:Deal;locale?:Locale}) {
  const t=(source:CatalogKey)=>catalogText(locale,source);
  const assessment=priceAssessment(deal,locale);
  const observation=priceObservation(deal,locale);
  return <div className="price-assessment" aria-label={t("Cena na tle historii")}>
    <p className="price-comparison"><strong>{assessment.summary}</strong>
      {assessment.median && <> {t("Mediana:")} {money(assessment.median,locale)}.</>}</p>
    <details><summary>{t("Zakres i wiarygodność porównania")}</summary>
      <p className="price-samples">{assessment.sufficiency}</p>
      <p>{t("Porównujemy zapisane ceny lotu na osobę w PLN, osobno dla lotów w jedną stronę i z powrotem. Grupa obejmuje tego samego dostawcę, lotnisko wylotu, kierunek, miesiąc i długość pobytu. Lotniska docelowe i warunki taryfy mogą się różnić. To nie jest potwierdzona oszczędność ani ocena wygody lotu.")}</p>
    </details>
    <p className="price-observation">{observation.label}: {observation.timestamp ?
      <><time dateTime={observation.timestamp}>{dateTime(observation.timestamp,locale)}</time> ({t("czas w Polsce")}).</> : t("czas nieznany.")}
      {!observation.basis && <> {t("Źródło czasu nieznane.")}</>}</p>
    <p className="price-availability">{t("Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.")}</p>
  </div>;
}
