import type {Deal} from "./api.ts";

const percent = (value:number) => new Intl.NumberFormat("pl-PL", {maximumFractionDigits:2}).format(value);
const positive = (value:string|null|undefined) => value != null && value.trim() !== "" && Number.isFinite(Number(value)) && Number(value)>0;

/** Present the saved comparison only; never rescore or use the legacy discount field. */
export function priceAssessment(deal:Pick<Deal,"score_explanation"|"flight_price_pln"|"price_per_person_pln">) {
  const score=deal.score_explanation;
  const count=score?.sample_count;
  const knownCount=typeof count === "number" && Number.isInteger(count) && count>=0;
  const difference=score?.price_difference_percent;
  const comparable=score?.status === "CURRENT" && knownCount && count>=5 &&
    positive(score.current_price_pln) && positive(score.median_price_pln) &&
    Number(score.current_price_pln)===Number(deal.flight_price_pln) &&
    Number(score.current_price_pln)===Number(deal.price_per_person_pln) &&
    difference != null && difference.trim()!=="" && Number.isFinite(Number(difference));
  let summary="Brak wiarygodnego porównania tej ceny z historią.";
  if(comparable) {
    const value=Number(difference);
    summary=value===0 ? "Cena na poziomie mediany porównywalnych obserwacji." :
      `Cena ${percent(Math.abs(value))}% ${value>0 ? "poniżej" : "powyżej"} mediany porównywalnych obserwacji.`;
  } else if(score?.status === "PROVISIONAL") {
    summary="Ocena wstępna — za mało danych do porównania ceny.";
  } else if(score?.status === "LEGACY") {
    summary="Ocena według poprzedniej metody — porównanie wymaga odświeżenia.";
  }
  const samples=knownCount ? `Liczba obserwacji: ${count}.` : "Liczba obserwacji nieznana.";
  const sufficiency=comparable ? `${samples} Próg porównania: 5; próbka nie obejmuje całego rynku.` :
    `${samples} Brak wystarczającej, zgodnej bazy porównawczej.`;
  return {summary,sufficiency,comparable,median:comparable ? score.median_price_pln : null};
}

export function priceObservation(deal:Pick<Deal,"score_explanation"|"last_verified_at">) {
  const score=deal.score_explanation;
  const current=score?.status === "CURRENT" || score?.status === "PROVISIONAL";
  const valid=(value:string|null|undefined):value is string => !!value && Number.isFinite(Date.parse(value));
  const timestamp=current && valid(score.observed_at) ? score.observed_at :
    valid(deal.last_verified_at) ? deal.last_verified_at : null;
  const basis=current && valid(score.observed_at) ? score.observation_basis : null;
  const label=basis === "SOURCE" ? "Obserwacja ceny u źródła" :
    basis === "FIRST_SEEN" ? "Pierwszy zapis tej ceny w HopTrip" : "Czas zapisanej obserwacji";
  return {timestamp,label,basis};
}
