export type InfoContent = {
 title:string;
 description?:string;
 draft:boolean;
 reviewedAt?:string;
 paragraphs:string[];
 sections?:{title:string;paragraphs:string[]}[];
 related?:string[];
};

export const content:Record<string,InfoContent> = {
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
  ],related:["price-freshness","price-history"],
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
   "Projekt mechanizmu analityki: losowy identyfikator sesji w pamięci przeglądarki, odświeżany po 30 minutach bezczynności. Zdarzenia obejmują odsłony, oferty, filtry i przejścia do partnerów.",
   "Do identyfikatora przekazywanego partnerowi nie dodajemy adresu e-mail ani danych rezerwacji. Po przejściu obowiązują zasady partnera.",
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
