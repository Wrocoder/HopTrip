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
  {path:"/from/WRO",title:"Loty z Wrocławia (WRO) — aktualne okazje | HopTrip",
    description:"Porównaj loty z Wrocławia WRO. Wybierz daty i budżet, sprawdź zakres lotu, dojazd na lotnisko i koszt całej podróży.",
    heading:"Zaplanuj wylot z Wrocławia",intro:"Ta strona zbiera aktualnie dostępne w HopTrip oferty z lotniska WRO. W formularzu wystarczy wpisać Wrocław lub WRO; przed zakupem sprawdź też lotnisko przylotu, szczególnie przy kierunkach obsługiwanych przez kilka portów.",
    sections:[
      {title:"Najpierw dojazd, potem godzina wylotu",text:"Do kosztu biletu dolicz dojazd do WRO i powrót z lotniska. Przy wczesnym wylocie albo późnym powrocie sprawdź połączenia w konkretnym dniu. Szczegóły przygotowania do podróży znajdziesz w naszym poradniku o lotnisku we Wrocławiu."},
      {title:"Dopasuj długość wyjazdu do budżetu",text:"Krótki wyjazd może ograniczyć koszt noclegu, ale sam tani lot nie wycenia całej podróży. Po wyborze oferty otwórz kalkulator i uzupełnij noclegi, transport, jedzenie oraz bagaż. Brakujące ceny pozostają nieznane."},
    ],links:[{href:"/deals?origin=WRO",label:"Ustaw daty i budżet dla WRO"},{href:"/info/wro-airport",label:"Poradnik lotniska Wrocław"},{href:"/info/trip-budget",label:"Kalkulator kosztów podróży"}]},
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
