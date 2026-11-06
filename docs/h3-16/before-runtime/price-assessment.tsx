import type {Locale} from "../../lib/i18n/config";
import {catalogText,type CatalogKey} from "../../lib/i18n/catalog-copy";
import type {Deal} from "../../lib/api";
import {priceAssessment,priceObservation} from "../../lib/price-assessment";
import {dateTime,money} from "../../lib/i18n/format";
import {scoreText} from "../../lib/i18n/score-copy";
import {cardCopy} from '../../lib/i18n/card-copy';

export function PriceSummary({deal,locale="pl",compact=false}:{deal:Deal;locale?:Locale;compact?:boolean}) {
  const assessment=priceAssessment(deal,locale);
  return <p className="price-summary"><strong>{assessment.summary}</strong>
    {assessment.scope && <> {compact?cardCopy[locale].sample:assessment.scope}</>}</p>;
}

export function PriceAssessment({deal,locale="pl"}:{deal:Deal;locale?:Locale}) {
  const t=(source:CatalogKey)=>catalogText(locale,source);
  const assessment=priceAssessment(deal,locale);
  const observation=priceObservation(deal,locale);
  return <div className="price-assessment" role="group" aria-label={t("Cena na tle historii")}>
    <p className="price-comparison"><strong>{assessment.summary}</strong>
      {assessment.median && <> {t("Mediana:")} {money(assessment.median,locale)}.</>}</p>
    <p className="price-samples">{assessment.sufficiency}</p>
    <details><summary>{t("Zakres i wiarygodność porównania")}</summary>
      <p>{scoreText(locale,"grouping")}</p>
    </details>
    <p className="price-observation">{observation.label}: {observation.timestamp ?
      <><time dateTime={observation.timestamp}>{dateTime(observation.timestamp,locale)}</time> ({t("czas w Polsce")}).</> : t("czas nieznany.")}
      {!observation.basis && <> {t("Źródło czasu nieznane.")}</>}</p>
    <p className="price-availability">{t("Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.")}</p>
  </div>;
}
