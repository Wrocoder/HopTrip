import {intlLocales,type Locale} from "./i18n/config.ts";
import {catalogText,catalogTemplate,type CatalogKey} from "./i18n/catalog-copy.ts";
import type {Deal} from "./api.ts";

const amount = (value:number,locale:Locale) => new Intl.NumberFormat(intlLocales[locale], {minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
const positive = (value:string|null|undefined) => value != null && value.trim() !== "" && Number.isFinite(Number(value)) && Number(value)>0;

/** Present the saved comparison only; never rescore or use the legacy discount field. */
export function priceAssessment(deal:Pick<Deal,"score_explanation"|"flight_price_pln"|"price_per_person_pln">,locale:Locale="pl") {
  const t=(source:CatalogKey)=>catalogText(locale,source);
  const score=deal.score_explanation;
  const count=score?.sample_count;
  const knownCount=typeof count === "number" && Number.isInteger(count) && count>=0;
  const difference=score?.price_difference_percent;
  const delta=Number(score?.median_price_pln)-Number(score?.current_price_pln);
  const expectedPercent=delta/Number(score?.median_price_pln)*100;
  const comparable=score?.status === "CURRENT" && knownCount && count>=5 &&
    positive(score.current_price_pln) && positive(score.median_price_pln) &&
    Number(score.current_price_pln)===Number(deal.flight_price_pln) &&
    Number(score.current_price_pln)===Number(deal.price_per_person_pln) &&
    difference != null && difference.trim()!=="" && Number.isFinite(Number(difference)) &&
    Math.abs(Number(difference)-expectedPercent)<=0.005001;
  let summary=t("Brak wiarygodnego porównania tej ceny z historią.");
  if(comparable) {
    // Compare displayed grosz amounts; this is display precision, not a bargain threshold.
    const grosz=Math.round(Number(score.median_price_pln)*100)-Math.round(Number(score.current_price_pln)*100);
    summary=grosz===0 ? t("Cena na poziomie mediany próby.") : Math.abs(grosz)<100 ?
      t("Blisko mediany — różnica mniejsza niż 1 zł.") :
      catalogTemplate(locale,"Cena o {amount} zł {direction} mediany próby.",{amount:amount(Math.abs(grosz)/100,locale),direction:t(grosz>0 ? "poniżej" : "powyżej")});
  } else if(score?.status === "PROVISIONAL") {
    summary=t("Ocena wstępna — za mało danych do porównania ceny.");
  } else if(score?.status === "LEGACY") {
    summary=t("Ocena według poprzedniej metody — porównanie wymaga odświeżenia.");
  }
  const samples=knownCount ? `${t("Liczba obserwacji:")} ${count}.` : t("Liczba obserwacji nieznana.");
  const sufficiency=comparable ? `${samples} ${t("Próg porównania: 5; próbka nie obejmuje całego rynku.")}` :
    `${samples} ${t("Brak wystarczającej, zgodnej bazy porównawczej.")}`;
  return {summary,sufficiency,comparable,median:comparable ? score.median_price_pln : null};
}

export function priceObservation(deal:Pick<Deal,"score_explanation"|"last_verified_at">,locale:Locale="pl") {
  const score=deal.score_explanation;
  const current=score?.status === "CURRENT" || score?.status === "PROVISIONAL";
  const valid=(value:string|null|undefined):value is string => !!value && Number.isFinite(Date.parse(value));
  const timestamp=current && valid(score.observed_at) ? score.observed_at :
    valid(deal.last_verified_at) ? deal.last_verified_at : null;
  const basis=current && valid(score.observed_at) ? score.observation_basis : null;
  const label=catalogText(locale,basis === "SOURCE" ? "Obserwacja ceny u źródła" :
    basis === "FIRST_SEEN" ? "Pierwszy zapis tej ceny w HopTrip" : "Czas zapisanej obserwacji");
  return {timestamp,label,basis};
}
