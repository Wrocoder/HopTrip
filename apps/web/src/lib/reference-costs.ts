import type {EurRate} from "./exchange-rate";

export type ReferenceCost={id:string;city:string;label:string;euroCents:number;notes:string;source:string;checkedAt:string};
export const referenceCosts:ReferenceCost[]=[
  {id:"milan-day",city:"milan",label:"Mediolan: bilet ATM na 24 godziny",euroCents:760,
    notes:"Bilet normalny Mi1–Mi3 na osobę. Sprawdź strefy swojej trasy; nie obejmuje transferu z Malpensy ani Bergamo.",
    source:"https://www.atm.it/en/ViaggiaConNoi/Biglietti/Pages/tickets_milan.aspx",checkedAt:"2026-10-07"},
  {id:"milan-three-days",city:"milan",label:"Mediolan: bilet ATM na 3 dni",euroCents:1550,
    notes:"Bilet normalny Mi1–Mi3 na osobę, na trzy kolejne dni do końca kursowania trzeciego dnia. To nie bilet na 72 godziny. Bez transferu z Malpensy i Bergamo.",
    source:"https://www.atm.it/en/ViaggiaConNoi/Biglietti/Pages/tickets_milan.aspx",checkedAt:"2026-10-07"},
  {id:"barcelona-ten",city:"barcelona",label:"Barcelona: T-casual, 10 przejazdów, 1 strefa",euroCents:1300,
    notes:"Bilet na jedną osobę. Nie działa na stacjach Aeroport T1/T2 linii L9 Sud. Nośnik biletu i pozostałe przejazdy mogą kosztować dodatkowo.",
    source:"https://www.tmb.cat/en/barcelona-fares-metro-bus/transport-ticket-fares",checkedAt:"2026-10-07"},
];

export function referenceGrosz(cost:ReferenceCost,quantity:number,rate:EurRate,now=Date.now()):number|null {
  const checked=Date.parse(cost.checkedAt+"T00:00:00Z"),published=Date.parse(rate.date+"T00:00:00Z");
  if(!Number.isInteger(quantity)||quantity<1||quantity>365||!Number.isFinite(rate.plnPerEuro)||rate.plnPerEuro<=0||
    !Number.isFinite(checked)||checked>now||now-checked>90*86400000||!Number.isFinite(published)||published>now||now-published>7*86400000)return null;
  return Math.round(cost.euroCents*quantity*Math.round(rate.plnPerEuro*10000)/10000);
}
