import type {InfoContent} from "./info-types";

export const travelGuides:Record<string,InfoContent> = {
 baggage:{
  title:"Bagaż: co naprawdę obejmuje cena biletu",
  description:"Mała torba, walizka kabinowa i bagaż rejestrowany: jak porównać limity i dopłaty przed zakupem.",
  draft:false,reviewedAt:"2026-09-23",category:"planning",
  paragraphs:["Słowo „podręczny” nie wystarcza do porównania dwóch biletów. Zapisz liczbę sztuk, wymiary, wagę i miejsce przewozu każdej torby. Dopiero potem sprawdź, czy tańszy wariant pozwala zabrać rzeczy potrzebne na wyjazd."],
  sections:[
   {title:"Torba pod fotelem i walizka nad głową",paragraphs:[
    "Ryanair podaje małą torbę osobistą 40 × 30 × 20 cm jako element wszystkich taryf. Opcja Priority & 2 Cabin Bags dodaje walizkę do 10 kg o wymiarach 55 × 40 × 20 cm. To dwa różne zakresy bagażu, mimo że oba dotyczą kabiny.",
    "LOT podaje podstawowy limit jednej sztuki do 8 kg i 55 × 40 × 23 cm oraz dodatkowego przedmiotu osobistego do 2 kg; wyższe klasy mają inne limity. Te przykłady pokazują, dlaczego nie należy przenosić zasad jednej linii na inną. Ostateczny zakres sprawdź w swojej rezerwacji.",
   ],sourceIds:[0,1]},
   {title:"Bagaż rejestrowany nie jedzie z tobą w kabinie",paragraphs:[
    "W ofercie Ryanair również torba 10 kg może być bagażem rejestrowanym: oddajesz ją przed kontrolą bezpieczeństwa, a odbierasz po przylocie. Sama waga nie mówi więc, gdzie przewożona jest walizka.",
    "Przy porównaniu dopisz czas na nadanie i odbiór. Jeśli podróż zawiera osobną rezerwację kolejnego lotu, sprawdź obowiązek ponownego nadania; nie zakładaj automatycznego transferu walizki.",
   ],sourceIds:[0]},
   {title:"Jak policzyć dopłatę",paragraphs:[
    "Sprawdź potrzebny bagaż dla każdego pasażera i każdego kierunku. Porównaj sumę biletu i dodatków z ceną pakietu, który już je zawiera. Nie dodawaj ponownie bagażu wliczonego w pakiet; nie traktuj nieznanej dopłaty jako zera.",
    "Zmierz zapakowaną torbę wraz z wystającymi elementami i porównaj ją z zasadami przewoźnika. Sprawdź także ograniczenia dotyczące zawartości. Limit wymiarów nie jest jednocześnie potwierdzeniem, że każdy przedmiot można przewieźć.",
   ]},
   {title:"Co pokazuje HopTrip",paragraphs:[
    "Historyczne porównanie ceny lotu nie wyrównuje automatycznie warunków bagażu. Zanim uznasz ofertę za lepszą, otwórz jej podsumowanie u sprzedawcy i zapisz wybrany zakres. Ceny dodatków zależą od konkretnej rezerwacji; nie podajemy uniwersalnej dopłaty.",
   ]},
  ],sources:[
   {label:"Ryanair — zasady bagażu",href:"https://help.ryanair.com/hc/en-ie/articles/12888036565521-Ryanair-s-Bag-Policy"},
   {label:"LOT — limity bagażu podręcznego",href:"https://www.lot.com/is/en/help-center/baggage/what-is-the-limit-of-the-carry-on-baggage"},
  ],related:["connections","trip-budget","price-comparison"],routes:[{label:"Porównaj aktualne loty",href:"/deals"}],
 },
 connections:{
  title:"Przesiadki: jedna rezerwacja czy osobne bilety",
  description:"Odbiór bagażu, zmiana terminala i ponowna odprawa — co sprawdzić przed wyborem przesiadki.",
  draft:false,reviewedAt:"2026-09-23",category:"planning",
  paragraphs:["Dwie godziny między lotami mogą oznaczać zupełnie inną podróż zależnie od rodzaju rezerwacji. Najpierw ustal, czy kupujesz połączenie z przesiadką, czy dwa odrębne bilety. Nie wyciągaj tego wniosku tylko z jednej płatności u pośrednika."],
  sections:[
   {title:"Przykład: samodzielna przesiadka na Heathrow",paragraphs:[
    "Heathrow opisuje osobno pasażerów z odrębnymi biletami: przejście przez kontrolę graniczną, odbiór bagażu, ponowna odprawa i kontrola bezpieczeństwa. To szerszy proces niż przejście do następnej bramki. Przy zmianie terminala dochodzi jeszcze transport między budynkami.",
    "To przykład zasad konkretnego lotniska, nie uniwersalny schemat dla wszystkich portów. Przed zakupem sprawdź wymagania wjazdowe i tranzytowe właściwe dla dokumentów podróżnych oraz dokładną procedurę lotniska.",
   ],sourceIds:[0]},
   {title:"Bagaż sprawdź na potwierdzeniu i przy nadaniu",paragraphs:[
    "Schiphol wskazuje, że przy dwóch osobnych biletach bagaż trafia do odbioru i trzeba nadać go ponownie. Przy połączonej podróży transfer bagażu często odbywa się automatycznie, ale należy potwierdzić go z linią.",
    "Zapisz docelowe lotnisko z przywieszki bagażowej i upewnij się, czy masz karty pokładowe na dalsze odcinki. Podróż wyłącznie z torbą podręczną nie usuwa automatycznie kontroli dokumentów ani wymogu odprawy.",
   ],sourceIds:[1]},
   {title:"Nie ma jednego bezpiecznego czasu dla każdego lotu",paragraphs:[
    "Heathrow uzależnia potrzebny czas od trasy, przewoźnika, terminali i bagażu. Minimalny czas podawany przez linię dla połączonego biletu nie jest obietnicą, że zdążysz na dowolne dwa osobno kupione loty.",
    "Policz drogę od wyjścia z pierwszego samolotu do zamknięcia odprawy lub bramki drugiego. Zostaw miejsce na opóźnienie, kolejki i zmianę terminala. Przesiadka wymagająca zmiany lotniska to dodatkowy przejazd przez miasto, a nie transfer w terminalu.",
   ],sourceIds:[0]},
   {title:"Przed płatnością ustal plan na zakłócenie",paragraphs:[
    "Sprawdź, kto i na jakich warunkach pomoże, jeśli pierwszy lot się opóźni. Jeżeli sprzedawca oferuje własną ochronę przesiadki, przeczytaj jej zakres i sposób zgłoszenia. Nie utożsamiaj jej automatycznie z warunkami przewoźnika. Dodaj możliwy nocleg i transfer do porównania wariantów.",
   ]},
  ],sources:[
   {label:"Heathrow — rodzaj połączenia i czas przesiadki",href:"https://www.heathrow.com/connecting-flights?CMP=SO-PaxInfo-HRW080"},
   {label:"Schiphol — transfer i osobne bilety",href:"https://www.schiphol.nl/en/prepare-for-your-flight-at-schiphol/smooth-transfers/"},
  ],related:["baggage","booking-with-agents","london-airports"],routes:[{label:"Sprawdź loty i ich szczegóły",href:"/deals"}],
 },
 "booking-with-agents":{
  title:"Zakup biletu u pośrednika: co sprawdzić",
  description:"Sprzedawca, numer rezerwacji, dane kontaktowe i obsługa zmian — praktyczna lista przed zapłatą.",
  draft:false,reviewedAt:"2026-09-23",category:"planning",
  paragraphs:["Strona z porównaniem, sprzedawca biletu i linia wykonująca lot mogą być różnymi podmiotami. HopTrip pokazuje obserwacje cen i odsyła do partnera. Przed płatnością ustal, kto sprzedaje wybraną podróż i gdzie będziesz ją później obsługiwać."],
  sections:[
   {title:"Porównaj końcowy koszyk",paragraphs:[
    "Zapisz nazwę sprzedawcy, walutę płatności, wszystkie odcinki, pasażerów i dodatki. Sprawdź, czy usługi takie jak odprawa, elastyczna zmiana lub pomoc pośrednika są dobrowolne i co dokładnie obejmują. Zestaw całą kwotę z alternatywnym kanałem zakupu dla tych samych warunków.",
    "Przy dwóch lotach zapytaj, czy stanowią jedną podróż na połączonym bilecie, czy osobne rezerwacje. Jedno podsumowanie zamówienia nie wystarcza do potwierdzenia zasad przesiadki.",
   ]},
   {title:"Miej dostęp do rezerwacji przewoźnika",paragraphs:[
    "Ryanair informuje, że rezerwacje oznaczone jako dokonane przez nieautoryzowanego pośrednika mogą wymagać weryfikacji pasażera. Opisuje także problemy, gdy agent przekazuje własny e-mail lub dane płatności zamiast danych podróżnego. To zasady tej linii i wskazanego kanału sprzedaży, nie stwierdzenie dotyczące każdego pośrednika.",
    "Po zakupie sprawdź, czy dostałeś numer rezerwacji linii, a nie tylko numer zamówienia sklepu. Zweryfikuj nazwiska i działający kontakt do siebie. Procedury wymagające dokumentów wykonuj wyłącznie w oficjalnym kanale wskazanym przez przewoźnika.",
   ],sourceIds:[0]},
   {title:"Obsługa zmiany zależy od kanału zakupu",paragraphs:[
    "LOT przy swojej procedurze anulowania w ciągu 24 godzin odsyła klientów, którzy kupili przez agencję lub innego sprzedawcę, do wystawcy biletu w celu sprawdzenia możliwości jej zastosowania. Nie zakładaj zatem, że opcja widoczna na stronie linii działa identycznie u każdego agenta.",
    "Przed zapłatą znajdź kontakt, godziny obsługi oraz zasady opłat pośrednika i przewoźnika. Zachowaj potwierdzenie oraz warunki wybranej taryfy. Ta strona nie obiecuje określonego zwrotu ani nie rozstrzyga indywidualnej reklamacji.",
   ],sourceIds:[1]},
   {title:"Gdzie kończy się rola HopTrip",paragraphs:[
    "Prowizja partnerska nie oznacza, że wystawiamy bilet albo zmieniamy rezerwację. Kwestie zakupu wyjaśniaj w kanale wskazanym na potwierdzeniu. Różnicę między zapisaną ceną a aktualnym koszykiem oceń przed płatnością — oferta w katalogu nie rezerwuje miejsca.",
   ]},
  ],sources:[
   {label:"Ryanair — rezerwacje przez nieautoryzowanych agentów",href:"https://help.ryanair.com/hc/en-gb/sections/12489282913169"},
   {label:"LOT — warunki procedury anulowania w ciągu 24 godzin",href:"https://www.lot.com/th/en/explore/ticket-changes-and-refunds/24-hour-risk-free-cancellation"},
  ],related:["partners","connections","price-freshness"],routes:[{label:"Wróć do katalogu lotów",href:"/deals"}],
 },
};
