import type {Metadata} from "next";

export type CatalogPage={
  path:string;title:string;description:string;heading:string;intro:string;
  sections:{title:string;text:string}[];links:{href:string;label:string}[];
};

// Only these reviewed, permanent landing pages are opened to indexing.
export const catalogPages:CatalogPage[]=[
  {path:"/deals",title:"Okazje lotnicze z Polski — wybierz lot | HopTrip",
    description:"Wybierz lotnisko w Polsce, daty i budżet na osobę. Porównaj zapisane oferty lotów, długość pobytu i świeżość ceny przed rezerwacją.",
    heading:"Jak wybrać okazję lotniczą",intro:"Zacznij od lotniska, z którego wygodnie dojedziesz na wylot. Następnie ustaw budżet na lot na osobę i opcjonalny zakres dat. Długość pobytu filtrujemy w nocach.",
    sections:[
      {title:"Porównuj ten sam zakres podróży",text:"Lot w jedną stronę i lot w obie strony mają różny zakres. Otwórz ofertę i sprawdź oznaczenie trasy, daty oraz potrzebny bagaż. Cena w katalogu nie obejmuje automatycznie noclegu ani dojazdów."},
      {title:"Cena ma datę obserwacji",text:"Oferty pochodzą z zapisanych obserwacji, a nie z rezerwacji w czasie rzeczywistym. W szczegółach znajdziesz datę sprawdzenia i wyjaśnienie oceny. Dostępność oraz końcową cenę potwierdź po przejściu do sprzedawcy."},
    ],links:[{href:"/from/WRO",label:"Loty z Wrocławia"},{href:"/destinations/milan",label:"Loty do Mediolanu"},{href:"/info/trip-budget",label:"Policz budżet całej podróży"}]},
  {path:"/from/WRO",title:"Loty z Wrocławia (WRO) — weekend i krótki wyjazd | HopTrip",
    description:"Zaplanuj krótki wyjazd z Wrocławia: wybierz loty z WRO na 2–4 noce lub weekend, ustaw daty i limit ceny lotu, sprawdź dojazd oraz budżet pobytu.",
    heading:"Krótki wyjazd z WRO: od czego zacząć?",intro:"Na dwa–cztery noclegi liczy się czas na miejscu, nie tylko cena biletu. Zacznij od długości pobytu albo kalendarzowego weekendu, a w wynikach dopasuj daty i budżet lotu na osobę. Poniższe skróty zachowują lotnisko WRO. Lista ofert niżej nie jest jeszcze zawężona do tych warunków.",
    sections:[
      {title:"Najpierw dojazd, potem godzina wylotu",text:"Dolicz dojazd do WRO, odprawę i transfer po przylocie. Sprawdź godziny obu lotów, zanim zarezerwujesz nocleg. Filtr weekendu oznacza wylot w piątek lub sobotę i powrót w najbliższą niedzielę; sam nie gwarantuje wyjazdu bez urlopu."},
      {title:"Dopasuj długość wyjazdu do budżetu",text:"Krótki wyjazd może ograniczyć koszt noclegu, ale sam tani lot nie wycenia całej podróży. Po wyborze oferty otwórz kalkulator i uzupełnij noclegi, transport, jedzenie oraz bagaż. Brakujące ceny pozostają nieznane."},
    ],links:[{href:"/deals?origin=WRO&duration_min=2&duration_max=4",label:"Z WRO na 2–4 noce"},{href:"/deals?origin=WRO&weekend=true",label:"Weekend z WRO: pt./sob. → niedz."},{href:"/deals?origin=WRO",label:"Ustaw daty i budżet dla WRO"},{href:"/info/wro-airport",label:"Poradnik lotniska Wrocław"},{href:"/info/trip-budget",label:"Kalkulator kosztów podróży"},{href:"/info",label:"Przewodniki: dojazd i plan pobytu"}]},
  {path:"/destinations/milan",title:"Loty do Mediolanu — okazje i plan wyjazdu | HopTrip",
    description:"Znajdź lot do Mediolanu z Polski. Porównaj daty, sprawdź właściwe lotnisko oraz zaplanuj transfer, nocleg i weekend w mieście.",
    heading:"Wybierz lot do Mediolanu i zaplanuj pobyt",intro:"Wybierając Mediolan, porównuj nie tylko cenę lotu, ale też dokładny port przylotu i godziny podróży. Nazwa kierunku nie zastępuje sprawdzenia lotniska na bilecie. Oferta lotnicza i plan zwiedzania to dwa kroki tej samej podróży.",
    sections:[
      {title:"Sprawdź lotnisko i czas na miasto",text:"Przed rezerwacją sprawdź kod lotniska, trasę do noclegu i powrót na odlot. Poradnik lotnisk Mediolanu pomaga rozdzielić te warianty. Nie dopasowuj transferu wyłącznie do nazwy miasta w katalogu."},
      {title:"Zostaw miejsce na nocleg i zwiedzanie",text:"Dla krótkiego pobytu zacznij od planu dwóch dni i wybierz najważniejsze punkty. Dopasuj godziny wejść do przylotu, a wydarzenie wybierz dopiero po sprawdzeniu jego daty i miejsca. Cena biletu na koncert nie jest częścią ceny lotu."},
    ],links:[{href:"/deals?destination=milan",label:"Ustaw daty i budżet dla Mediolanu"},{href:"/info/milan-airports",label:"Lotniska Mediolanu i dojazd"},{href:"/info/milan-weekend",label:"Mediolan na dwa dni"}]},
];

export const catalogPage=(path:string)=>catalogPages.find(page=>page.path===path);

export function socialMetadata({title,description,path,image,index=false}:{title:string;description:string;path:string;image:string;index?:boolean}):Metadata {
  return {title,description,alternates:{canonical:path},robots:{index,follow:true},
    openGraph:{title,description,url:path,locale:"pl_PL",type:"website",images:[{url:image,width:1200,height:630,alt:title}]},
    twitter:{card:"summary_large_image",title,description,images:[{url:image,alt:title}]}};
}
