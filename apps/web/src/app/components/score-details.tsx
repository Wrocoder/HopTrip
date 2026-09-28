import Link from "next/link";
import type {Deal, ScoreExplanation} from "../../lib/api";
import {money} from "../../lib/pl";

const number = (value:string|number) => new Intl.NumberFormat("pl-PL", {maximumFractionDigits:2}).format(Number(value));
const timestamp = (value:string) => new Intl.DateTimeFormat("pl-PL", {
  dateStyle:"medium", timeStyle:"short", timeZone:"Europe/Warsaw",
}).format(new Date(value));

const labels:Record<string,string> = {
  price:"Cena na tle historii", history:"Liczba obserwacji", freshness:"Świeżość danych",
  flight_price:"Pozycja ceny w historycznym przedziale", historical_discount:"Różnica względem mediany",
  convenience:"Wygoda lotu", confidence:"Liczba obserwacji",
};

function reason(key:string, score:ScoreExplanation):string {
  if(score.status === "LEGACY") {
    const legacy:Record<string,string> = {
      flight_price:"Poprzednia metoda porównywała cenę z kwartylami historii. Przy braku zróżnicowanej próby przyjmowała neutralne 50/100, czyli 17,5 z 35 pkt.",
      historical_discount:"Procent poniżej mediany był mnożony przez wagę 20%. Brak potwierdzonej różnicy oznaczał 0 pkt w tej części.",
      convenience:"W używanym wcześniej modelu nieznana wygoda otrzymywała 7,5 z 15 pkt. Te punkty nie potwierdzają dogodnych godzin, bagażu ani braku przesiadek.",
      freshness:"Punkty zależały od czasu pozostałego do wygaśnięcia oferty podczas obliczenia. Nie mierzyły bezpośrednio wieku obserwacji ceny.",
      confidence:`Wielkość próby przeliczano na maksymalnie 15 pkt; pełny wynik przy 30 obserwacjach. Zapisana liczba obserwacji: ${score.sample_count ?? "nieznana"}. To nie prawdopodobieństwo zakupu.`,
    };
    return legacy[key] ?? "Składnik zapisanej oceny.";
  }
  if(key === "price") {
    if(score.status === "PROVISIONAL") return "Mniej niż 5 obserwacji lub brak poprawnej mediany: przyjmujemy neutralne 30 z 60 pkt. Nie oznacza to potwierdzenia korzystnej ceny.";
    const difference=Number(score.price_difference_percent);
    const comparison=difference === 0 ? "na poziomie mediany" : `${number(Math.abs(difference))}% ${difference > 0 ? "poniżej" : "powyżej"} mediany`;
    return `Cena ${money(score.current_price_pln)}, mediana ${money(score.median_price_pln)}: ${comparison}. Cena równa medianie daje 30 pkt; każde 1% poniżej dodaje 0,6 pkt, a powyżej odejmuje 0,6 pkt. Zakres: 0–60 pkt.`;
  }
  if(key === "history") return `${score.sample_count ?? 0} obserwacji w grupie porównawczej. Przyznajemy 25 × min(liczba obserwacji / 30, 1) pkt. Większa próba daje więcej danych do porównania, ale nie gwarantuje reprezentatywności ani dostępności biletu.`;
  if(key === "freshness") {
    const age=score.observed_at && score.calculated_at ? (Date.parse(score.calculated_at)-Date.parse(score.observed_at))/3600000 : null;
    const ageText=age !== null && age >= 0 ? `Wiek obserwacji w chwili obliczenia: ${number(age)} godz. ` : "Brak poprawnego czasu obserwacji: 0 pkt. ";
    return `${ageText}Maksymalnie 15 pkt dla nowej obserwacji, spadek liniowy do 0 po 48 godzinach. Wygaśnięcie oferty również oznacza 0 pkt. ${score.observation_basis === "FIRST_SEEN" ? "Źródło nie podało czasu znalezienia ceny: liczymy od pierwszego zapisania tej obserwacji w HopTrip. To nie sprawdzenie ceny na żywo." : "Korzystamy z czasu obserwacji otrzymanego od źródła; nie jest to potwierdzenie ceny na żywo."}`;
  }
  return "Składnik zapisanej oceny.";
}

export function ScoreDetails({deal}:{deal:Deal}) {
  const score=deal.score_explanation;
  const unavailable=!score || score.status === "UNAVAILABLE";
  return <div className="score-details">
    <p>Oceniamy ofertę cenową na podstawie zapisanych danych. Wynik nie ocenia linii lotniczej, komfortu ani prawdopodobieństwa zakupu.</p>
    {unavailable ? <p className="score-caution">Dla tej starszej oceny nie zapisano pełnego, zgodnego zestawu składników. Nie możemy rzetelnie odtworzyć punktów. Wyjaśnienie pojawi się po ponownym przeliczeniu oferty.</p> : <>
      {score.status === "PROVISIONAL" && <p className="score-caution"><strong>Ocena wstępna — mało danych.</strong> Neutralne punkty za cenę są założeniem, a nie dowodem okazji.</p>}
      {score.status === "LEGACY" && <p className="score-caution">Poprzednia metoda obliczeń. Poniżej pokazujemy składniki tego zapisanego wyniku; nowa metoda pojawi się po przeliczeniu oferty.</p>}
      <p className="score-sum"><strong>{score.parts.map(part=>number(part.points)).join(" + ")} = {number(score.total_before_rounding!)} pkt</strong><br/>
        Wynik po zaokrągleniu: <strong>{deal.deal_score}/100</strong>.</p>
      <div className="score-parts">{score.parts.map(part=><section className="score-part" key={part.key}>
        <div className="score-part-heading"><h3>{labels[part.key] ?? part.key}</h3><strong>{number(part.points)} / {part.max_points} pkt</strong></div>
        <div className="score-meter" aria-hidden="true"><span style={{width:`${Number(part.points)/part.max_points*100}%`}}/></div>
        <p>{reason(part.key,score)}</p>
      </section>)}</div>
      {score.calculated_at && <p className="muted">Obliczono: <time dateTime={score.calculated_at}>{timestamp(score.calculated_at)}</time> (czas w Polsce). Punkty opisują dane z tej chwili i są odświeżane przy kolejnym przeliczeniu.</p>}
    </>}
    <details className="score-method"><summary>Co porównujemy, a czego nie uwzględniamy?</summary>
      <p>Porównujemy zapisane obserwacje tego samego dostawcy dla lotniska wylotu, kierunku, miesiąca i roku wylotu oraz długości pobytu. Loty w jedną stronę mają osobną grupę. To próbka, a nie pełny rynek; może obejmować obecną cenę i różne taryfy.</p>
      <p>Nie punktujemy bagażu, godzin lotów, przesiadek, opóźnień ani warunków zwrotu, bo nie mamy kompletnych danych. Sprawdź je u sprzedawcy. Prowizja partnerska nie wpływa na ocenę.</p>
    </details>
    <Link className="text-link" href="/info/price-comparison">Pełna metodologia porównania cen →</Link>
  </div>;
}
