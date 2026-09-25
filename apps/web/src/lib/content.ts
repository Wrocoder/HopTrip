import type {InfoContent} from "./info-types";
import {travelGuides} from "./travel-guides";
import {airportGuides} from "./airport-guides";
import {destinationGuides} from "./destination-guides";
import {moreDestinationGuides} from "./more-destination-guides";
export type {InfoContent} from "./info-types";

export const content:Record<string,InfoContent> = {
 ...travelGuides,...airportGuides,...destinationGuides,...moreDestinationGuides,
 "trip-budget":{
  title:"Jak policzyć budżet całej podróży",
  description:"Cena lotu na osobę a koszt wyjazdu: wspólne noclegi, dojazdy, dodatki i niewiadome.",
  draft:false,reviewedAt:"2026-09-23",category:"planning",
  paragraphs:["Filtr budżetu w HopTrip dotyczy ceny lotu na osobę. Nie jest limitem kosztu całego wyjazdu. Przed wyborem porównaj pełne koszty obu wariantów dla tej samej liczby podróżnych i tych samych dat."],
  sections:[
   {title:"Oddziel koszty na osobę od wspólnych",paragraphs:[
    "Zapisz osobno bilety lotnicze dla wszystkich pasażerów, potrzebny bagaż i wybrane dodatki. Jeśli sprawdzasz cenę tylko dla jednej osoby, potwierdź u sprzedawcy kwotę dla całej grupy — nie zakładaj, że każde kolejne miejsce kosztuje tyle samo.",
    "Nocleg rozlicz według ceny całej rezerwacji i liczby nocy. Pokoju dla dwóch osób nie mnożysz ponownie przez dwie osoby. Dopisz dojazd do lotniska wylotu, transport po przylocie w obie strony i wydatki na miejscu. Każdą pozycję oznacz jako koszt wspólny albo na osobę.",
   ]},
   {title:"Przykład rachunku, nie oferta",paragraphs:[
    "Wyłącznie przykład obliczeniowy: bilety dla dwóch osób łącznie 600 PLN, nocleg łącznie 900 PLN, dojazdy łącznie 200 PLN i pozostałe wydatki 300 PLN dają 2000 PLN za wyjazd, czyli 1000 PLN na osobę przy równym podziale. Wszystkie liczby są umowne; nie opisują dostępnej podróży.",
    "Jeśli cena biletu obejmuje tylko wylot, dodaj osobno powrót. Jeśli obejmuje podróż w obie strony, nie dodawaj powrotu drugi raz. Sprawdź też, które dodatki są już zawarte w podsumowaniu sprzedawcy.",
   ]},
   {title:"Nie zamieniaj brakującej ceny w zero",paragraphs:[
    "Przy każdej pozycji zapisz źródło, datę sprawdzenia i walutę. Nieznany koszt oznacz jako do sprawdzenia. Suma znanych pozycji jest wtedy tylko częścią budżetu, a nie gotową ceną wyjazdu.",
    "Nie dodawaj bezpośrednio kwot w różnych walutach. Przed porównaniem potrzebujesz wspólnej waluty i jawnego sposobu przeliczenia. HopTrip obecnie porównuje loty w PLN i nie wylicza kosztu noclegów ani wymiany walut.",
   ]},
   {title:"Porównaj czas i koszty razem",paragraphs:[
    "Dla każdego wariantu sprawdź, czy godziny lotów pasują do dojazdu i noclegu. Jeśli potrzebujesz dodatkowej nocy, parkingu lub innego transferu, dopisz je do tego wariantu. Niższa cena samego lotu nie przesądza o niższym koszcie wyjazdu.",
    "Przed płatnością ponownie sprawdź wszystkie rezerwacje, końcowe kwoty i wybrane dodatki. Zapisana obserwacja ceny w HopTrip nie blokuje ceny u sprzedawcy.",
   ]},
  ],related:["one-way-round-trip","price-comparison","price-freshness"],
 },
 "one-way-round-trip":{
  title:"Lot w jedną stronę czy w obie strony",
  description:"Jak porównać zakres podróży, daty i lotniska bez podwójnego liczenia powrotu.",
  draft:false,reviewedAt:"2026-09-23",category:"planning",
  paragraphs:["Przed porównaniem kwot ustal, co obejmuje każda z nich. Cena wylotu i cena podróży z powrotem opisują inny zakres. Sam niski wynik w katalogu nie mówi, ile zapłacisz za całą zaplanowaną trasę."],
  sections:[
   {title:"Najpierw daty i zakres ceny",paragraphs:[
    "W HopTrip oferty bez daty powrotu są porównywane w osobnej grupie historii. Przy podróży z powrotem sprawdź obie daty i długość pobytu. Nie traktuj ceny za jeden kierunek jako ceny wyjazdu w obie strony.",
    "Po przejściu do partnera upewnij się, że formularz pokazuje te same daty, liczbę osób i zakres podróży. Potwierdź cenę końcową całego wybranego wariantu; sam opis na karcie HopTrip nie zastępuje podsumowania rezerwacji.",
   ]},
   {title:"Dwa osobne bilety policz tylko raz",paragraphs:[
    "Jeśli porównujesz dwa oddzielne bilety w jedną stronę z jednym wariantem obejmującym powrót, zsumuj oba osobne bilety i potrzebne dodatki. Zestaw tę sumę z końcową kwotą wariantu w obie strony dla tych samych osób.",
    "Przykład wyłącznie obliczeniowy: wylot 180 PLN i powrót 220 PLN dają 400 PLN przed dodatkami. Wariant w obie strony za umowne 390 PLN wymaga jeszcze porównania bagażu, godzin i warunków. Te kwoty nie są ofertami i nie dowodzą, który sposób zakupu jest zwykle tańszy.",
   ]},
   {title:"Sprawdź konkretne lotniska",paragraphs:[
    "Porównaj kody lotnisk każdego odcinka, a nie tylko nazwę miasta. Zapisz, skąd wylatujesz i dokąd wracasz. Jeżeli lotniska się różnią, uwzględnij sposób dotarcia do domu lub odbioru samochodu.",
    "Daty podróży zestaw z liczbą potrzebnych noclegów i czasem dojazdu. Długość pobytu używana w porównaniu cen nie jest gwarancją określonej liczby pełnych dni na miejscu.",
   ]},
   {title:"Warunki sprawdzaj dla wybranego biletu",paragraphs:[
    "Sprawdź bagaż, zasady zmian i anulowania dla każdego kupowanego odcinka oraz sprzedawcę i zakres rezerwacji. Nie zakładaj wspólnych warunków tylko dlatego, że oba loty znalazły się w tym samym wyszukiwaniu.",
    "Ten poradnik wyjaśnia sposób porównania kosztów. Nie określa warunków konkretnej taryfy ani ochrony przy zakłóceniu podróży; te informacje trzeba sprawdzić w dokumentach wybranej rezerwacji.",
   ]},
  ],related:["trip-budget","price-comparison","partners"],
 },
 "price-comparison":{
  title:"Jak porównujemy ceny lotów",
  description:"Co oznacza porównanie z medianą w HopTrip i co sprawdzić, zanim wybierzesz lot.",
  draft:false,reviewedAt:"2026-09-21",
  paragraphs:["Niska cena i dobry wybór podróży nie zawsze oznaczają to samo. HopTrip porównuje zapisane ceny lotów, ale decyzja wymaga też sprawdzenia dat, lotnisk i warunków biletu. Oto jak czytać nasze porównanie."],
  sections:[
   {title:"Co trafia do porównania",paragraphs:[
    "Grupujemy obserwacje od tego samego dostawcy dla lotniska wylotu, kierunku, miesiąca i roku wyjazdu oraz długości pobytu. Loty bez daty powrotu mają osobną grupę. Cena weekendowego wyjazdu nie jest więc porównywana z pobytem trwającym dwa tygodnie.",
    "Taka grupa nie gwarantuje jednak identycznego bagażu, godzin lotu, przewoźnika ani warunków zmiany rezerwacji. Przed zakupem sprawdź te elementy u sprzedawcy; historyczne porównanie ich nie wyrównuje.",
   ]},
   {title:"Jak rozumieć procent poniżej mediany",paragraphs:[
    "Mediana opisuje środek zapisanej próby cen. Procent poniżej mediany pokazuje różnicę między bieżącą obserwacją a tą wartością. Nie jest rabatem przyznanym przez sprzedawcę ani obietnicą najniższej ceny na rynku.",
    "Przykład wyłącznie obliczeniowy: przy medianie 400 PLN i obserwacji 300 PLN różnica wynosi 25%. Te kwoty nie są ofertą podróży. Gdy brakuje porównania historycznego, nie mamy podstaw do wskazania oszczędności; zero w tym polu nie dowodzi, że cena jest typowa.",
   ]},
   {title:"Ocena pomaga uporządkować oferty",paragraphs:[
    "Wynik 0–100 łączy pozycję ceny w historii, różnicę wobec mediany, świeżość i liczebność próby. Nie jest prawdopodobieństwem udanego zakupu. Nieznane parametry wygody otrzymują neutralną ocenę, a nie potwierdzenie dogodnego lotu.",
    "Zacznij od swojego lotniska, terminu i długości pobytu. Potem sprawdź cenę na osobę, czas obserwacji i cenę końcową po przejściu do partnera. Osobno uwzględnij nocleg, dojazdy oraz potrzebne dodatki — obecny katalog dotyczy lotów.",
   ]},
  ],related:["price-freshness","price-history","trip-budget","one-way-round-trip"],
 },
 "price-freshness":{
  title:"Co oznacza świeżość oferty",
  description:"Dlaczego zapisana cena może się zmienić, kiedy oferta znika i co sprawdzić u partnera.",
  draft:false,reviewedAt:"2026-09-21",
  paragraphs:["Cena widoczna w HopTrip jest zapisaną obserwacją. Nie rezerwujemy miejsc i nie potwierdzamy ceny na żywo przy każdym otwarciu karty. Nawet niedawno zaobserwowana kwota może różnić się od tej dostępnej w chwili zakupu."],
  sections:[
   {title:"Pobranie danych nie jest nowym sprawdzeniem ceny",paragraphs:[
    "Dostawca może zwrócić wcześniej zapisaną cenę. Jeżeli przekazuje czas obserwacji, zachowujemy tę informację. Samo ponowne pobranie tych samych danych nie sprawia, że oferta staje się świeższa.",
    "Gdy źródło nie podaje czasu obserwacji, znamy jedynie moment pierwszego otrzymania tej ceny. Nie wiemy, jak długo istniała wcześniej u dostawcy. Powtórne otrzymanie identycznego wpisu bez nowego czasu nie potwierdza jego aktualności.",
   ]},
   {title:"Kiedy przestajemy pokazywać ofertę",paragraphs:[
    "Obecny limit publikacji wynosi 48 godzin od zachowanego momentu obserwacji. Krótszy termin ważności podany przez źródło ma pierwszeństwo. Oferta znika również po czasie wylotu lub po jej wyłączeniu.",
    "Jeśli znamy tylko dzień wylotu, bez godziny, zamykamy ofertę na początku tego dnia według UTC. To ostrożna granica publikacji, a nie informacja o godzinie startu samolotu.",
    "Kontrola dostępności działa także przy otwieraniu szczegółów i przy próbie przejścia do partnera. Dlatego wcześniej otwarta karta lub zapisany link mogą już nie pozwalać na przejście. Odśwież katalog, aby zobaczyć dostępne propozycje.",
   ]},
   {title:"Co sprawdzić po przejściu",paragraphs:[
    "Porównaj lotniska, daty, kierunek podróży, liczbę pasażerów i końcową kwotę. Sprawdź także bagaż i warunki wybranego biletu. Jeżeli cena się zmieniła, punktem odniesienia przed zakupem są dane sprzedawcy.",
    "Ważność wpisu w HopTrip oznacza, że mieści się on w naszych zasadach publikacji. Nie oznacza zablokowanej ceny, dostępnego miejsca ani gotowej rezerwacji.",
   ]},
  ],related:["price-comparison","price-history"],
 },
 "price-history":{
  title:"Co mówi, a czego nie mówi historia cen",
  description:"Jak powstaje historia HopTrip, dlaczego powtórzenia nie są nowymi danymi i jak czytać małą próbę.",
  draft:false,reviewedAt:"2026-09-21",
  paragraphs:["Historia HopTrip obejmuje obserwacje, które otrzymaliśmy i zapisaliśmy. Nie jest pełnym archiwum wszystkich cen dostępnych w sprzedaży. Jej zasięg zależy od dostawcy, obsługiwanych tras i okresu zbierania danych."],
  sections:[
   {title:"Jedna odpowiedź nie zawsze daje nową obserwację",paragraphs:[
    "Ponowne dostarczenie tej samej oferty, ceny i czasu obserwacji nie zwiększa próby. Jeśli źródło poda nowy czas obserwacji, ta sama kwota może utworzyć kolejny wpis. Bez czasu źródłowego powtórzenie tej samej ceny traktujemy zachowawczo.",
    "Liczba obserwacji nie oznacza więc liczby wyszukiwań, pasażerów ani sprzedanych biletów. Kilka zapisów może dotyczyć tego samego lotu w różnych chwilach; nie należy uznawać ich za niezależne badanie całego rynku.",
   ]},
   {title:"Mała próba daje ograniczone porównanie",paragraphs:[
    "Dla zgodnej grupy trasy i terminu wyliczamy medianę oraz zakres cen. Przy niewielu wpisach pojedyncza cena ma duży wpływ na wynik. Na nowej trasie historia może dopiero powstawać.",
    "Wskaźnik pokrycia historii w ocenie rośnie wraz z liczbą zapisów i osiąga swój limit przy 30 obserwacjach. Nie oznacza to 100% pewności ani gwarancji reprezentatywnej próby. Brakujące loty i warunki taryf nadal ograniczają porównanie.",
   ]},
   {title:"Jak wykorzystać historię przy wyborze",paragraphs:[
    "Traktuj cenę poniżej mediany jako powód, by przyjrzeć się ofercie. Zestaw ją z aktualnymi warunkami biletu, świeżością wpisu i własnymi wymaganiami. Nie porównuj automatycznie lotu w jedną stronę z podróżą z powrotem.",
    "Historia opisuje przeszłe zapisy, nie przewiduje ceny jutro. Na jej podstawie nie obiecujemy, że czekanie obniży koszt ani że widoczna oferta jest najtańsza u wszystkich sprzedawców. Ostateczne dane sprawdzisz po przejściu do partnera.",
   ]},
  ],related:["price-comparison","price-freshness"],
 },
 about:{title:"O HopTrip",draft:false,paragraphs:[
   "HopTrip pomaga porównywać ceny lotów z Polski. Publikujemy zapisane obserwacje cen, a nie gwarancję dostępności miejsca.",
   "Porównujemy cenę z historią tej samej trasy, miesiąca wyjazdu i długości pobytu. Mała liczba obserwacji obniża pewność porównania. Pamięć podręczna dostawcy może zawierać nieaktualne dane.",
   "Ocena uwzględnia cenę, różnicę wobec mediany, świeżość i pokrycie historii. Gdy nie znamy wygody lotu, przyjmujemy neutralny wynik. Sam wynik nie zastępuje sprawdzenia bagażu, przesiadek i warunków biletu.",
   "Cena lotu jest ceną na osobę. Noclegi i dojazdy wymagają osobnego sprawdzenia; nie dodajemy szacunków bez potwierdzonej oferty.",
 ]},
 partners:{title:"Współpraca partnerska",draft:false,paragraphs:[
   "Niektóre przyciski prowadzą przez link partnerski. Po rezerwacji możemy otrzymać prowizję. Dostępność linku zależy od aktywnej, zatwierdzonej współpracy z programem.",
   "HopTrip nie przyjmuje płatności i nie wystawia biletów. Ostateczną cenę, sprzedawcę i warunki umowy sprawdzasz na stronie, na którą przechodzisz.",
   "Dane cenowe i program partnerski to oddzielne integracje. Obecność ceny w katalogu nie oznacza, że link do zakupu jest dostępny. Nieaktywna współpraca wyłącza przycisk.",
 ]},
 contact:{title:"Kontakt",draft:true,paragraphs:["Przed publikacją operator musi podać swoją nazwę, adres do kontaktu i kanał zgłaszania błędnych ofert. Obecnie nie udostępniamy formularza zbierającego wiadomości."]},
 privacy:{title:"Prywatność",draft:true,paragraphs:[
   "Analityka HopTrip i Travelpayouts Drive są domyślnie wyłączone. Możesz osobno włączyć je w ustawieniach prywatności, odrzucić oba cele albo później wycofać zgodę. Odmowa nie blokuje dostępu do ofert. Wybór zapisujemy w localStorage pod kluczem hoptrip.consent.v1 na 180 dni.",
   "Po zgodzie na analitykę zapisujemy losowy identyfikator sesji w localStorage (hoptrip.session.v2), czas aktywności i oznaczenia źródła/kampanii. Po 30 minutach bezczynności przy kolejnym użyciu powstaje nowy identyfikator; sam wpis nie znika automatycznie po tym czasie. Zdarzenia obejmują odsłony, oferty, wyszukiwania, filtry i przejścia do partnerów. Wycofanie zgody usuwa identyfikator z tej przeglądarki i zatrzymuje nowe zdarzenia.",
   "Zdarzenia analityczne starsze niż 90 dni usuwamy podczas zadań utrzymaniowych. Ze starszych zapisów przejść partnerskich usuwamy kontekst sesji i kampanii; same zapisy rozliczeniowe mogą pozostać. Bez zgody na analitykę przejście nie jest łączone z sesją przeglądarki, ale zachowujemy techniczny zapis przekierowania.",
   "Po osobnej zgodzie marketingowej ładujemy Travelpayouts Drive z emrld.ltd. Skrypt może odczytywać stronę i zmieniać linki na partnerskie; połączenie przekazuje dostawcy dane techniczne, w tym adres IP. Wycofanie zgody odświeża stronę i blokuje kolejne załadowanie Drive. Wcześniej zapisane dane stron trzecich można usunąć w ustawieniach przeglądarki.",
   "Nie zbieramy płatności ani danych rezerwacji. Po przejściu do partnera obowiązują jego zasady. Nie dodajemy adresu email ani danych rezerwacji do linków partnerskich.",
   "Przed publikacją należy uzupełnić administratora danych, podstawy przetwarzania, kontakt, odbiorców i okresy przechowywania oraz zweryfikować konfigurację analityki.",
 ]},
 terms:{title:"Zasady korzystania",draft:true,paragraphs:[
   "Ceny mogą ulec zmianie od chwili obserwacji. Rezerwacji dokonuje się poza HopTrip, na warunkach wybranego sprzedawcy.",
   "Przed zakupem sprawdź kierunek, lotnisko, daty, liczbę pasażerów, bagaż oraz warunki zwrotu. Porównanie historyczne nie gwarantuje najniższej ceny.",
   "Przed publikacją należy uzupełnić dane operatora, procedurę kontaktu i właściwe postanowienia regulaminu.",
 ]},
};

export function getInfoContent(slug:string):InfoContent | undefined {
 return Object.hasOwn(content,slug) ? content[slug] : undefined;
}

export function publishedInfoPages() {
 return Object.entries(content).filter(([,page])=>!page.draft);
}

const planningReasons:Record<string,string>={
 baggage:"Sprawdź bagaż przed odprawą i porównaj pełną cenę biletu.",
 connections:"Zaplanuj czas między lotami i rozróżnij jedną rezerwację od osobnych biletów.",
 "trip-budget":"Dolicz dojazd, nocleg i opłaty do budżetu całej podróży.",
};
const destinationConnections:Record<string,string[]>={
 "barcelona-airports":["madrid-airport","valencia-airport"],
 "lisbon-airport":["porto-airport"],
 "budapest-airport":["vienna-airport","prague-airport"],
 "paris-airports":["amsterdam-airport"],
 "london-airports":["copenhagen-airport","stockholm-airports"],
};
export function relatedInfoPages(slug:string) {
 const page=getInfoContent(slug);
 if(!page || page.draft) return [];
 const suggestions=page.category==="airports" ? Object.keys(planningReasons) :
  page.category==="destinations" ? ["trip-budget","connections"] : [];
 return [...new Set([...suggestions,...(page.related ?? []),...(destinationConnections[slug] ?? [])])].filter(key=>key!==slug).flatMap(key=>{
  const related=getInfoContent(key);
  return related && !related.draft ? [{slug:key,page:related,reason:planningReasons[key] ?? related.description}] : [];
 });
}
