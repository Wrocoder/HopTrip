import type {InfoContent} from "./info-types";

// Personal operator details are deliberately absent. Render them from server configuration.
export const legalContent:Record<string,InfoContent>={
 contact:{title:"Kontakt",description:"Kontakt z operatorem HopTrip i zgłaszanie problemów.",draft:false,noindex:true,paragraphs:[
  "Napisz do nas w sprawie błędnej oferty, działania serwisu lub swoich danych osobowych. Adres email do kontaktu znajduje się poniżej.",
  "Przy zgłoszeniu błędu podaj adres strony, datę i opis problemu. Nie przesyłaj numerów kart, dokumentów tożsamości ani danych pasażerów, których nie potrzebujemy do odpowiedzi.",
  "HopTrip nie sprzedaje biletów, nie przyjmuje płatności i nie obsługuje rezerwacji. Zmiany biletu, zwroty i reklamacje zakupu zgłaszaj sprzedawcy wskazanemu w potwierdzeniu rezerwacji.",
 ]},
 privacy:{title:"Prywatność",description:"Zasady przetwarzania danych i ustawienia prywatności HopTrip.",draft:false,noindex:true,paragraphs:[
  "W sprawach przetwarzania danych przez HopTrip możesz napisać na podany poniżej adres email. Informacja obowiązuje od 25 września 2026 r.",
 ],sections:[
  {title:"Dane, cele i podstawy przetwarzania",paragraphs:[
   "Przy połączeniu z serwisem infrastruktura przetwarza adres IP i dane techniczne żądania. Służą dostarczeniu strony, ograniczaniu nadużyć i diagnozowaniu błędów. Podstawą jest prawnie uzasadniony interes administratora — utrzymanie bezpiecznego serwisu (art. 6 ust. 1 lit. f RODO). Nie prowadzimy kont użytkowników ani formularza płatności.",
   "Jeżeli napiszesz do nas, przetwarzamy adres email, dobrowolnie podane imię i treść korespondencji, aby odpowiedzieć i obsłużyć zgłoszenie. Podstawą jest uzasadniony interes w obsłudze kontaktu i obronie roszczeń (art. 6 ust. 1 lit. f RODO), a przy realizacji obowiązków dotyczących praw osób — obowiązek prawny (art. 6 ust. 1 lit. c RODO). Podanie danych w wiadomości jest dobrowolne; bez adresu zwrotnego nie możemy odpowiedzieć.",
   "Opcjonalna analityka oraz skrypt marketingowy Travelpayouts Drive działają na podstawie oddzielnych zgód (art. 6 ust. 1 lit. a RODO). Odmowa nie ogranicza dostępu do ofert. Nie podejmujemy wobec Ciebie decyzji wywołujących skutki prawne wyłącznie na podstawie automatycznego przetwarzania. Ocena ofert dotyczy cen i tras, nie Twojej sytuacji osobistej.",
  ]},
  {title:"Pamięć przeglądarki i wycofanie zgody",paragraphs:[
   "W localStorage zapisujemy niezbędny wybór prywatności hoptrip.consent.v1 na 180 dni. Ustawienia prywatności w stopce pozwalają odmówić, wybrać cele lub wycofać zgodę. Po upływie tego okresu ponownie pytamy o wybór. Wycofanie nie wpływa na zgodność wcześniejszego przetwarzania.",
   "Po zgodzie na analitykę zapisujemy hoptrip.session.v2: losowy identyfikator sesji, czas aktywności oraz ewentualne oznaczenia źródła i kampanii. Po 30 minutach bezczynności przy kolejnym użyciu powstaje nowy identyfikator; wpis nie znika sam po 30 minutach. Zdarzenia obejmują odsłony, oferty, wyszukiwania, filtry i przejścia do partnerów. To dane pseudonimowe, nie gwarantowanie anonimowe. Wycofanie zgody usuwa identyfikator z przeglądarki i zatrzymuje nowe zdarzenia.",
   "Po osobnej zgodzie marketingowej ładujemy Drive z emrld.ltd. Skrypt może czytać stronę, zmieniać linki i przekazywać dostawcy dane techniczne, w tym IP; może używać własnych cookies i identyfikatorów. Wycofanie zgody powoduje przeładowanie strony i blokuje ponowne ładowanie skryptu. Dane zapisane wcześniej przez strony trzecie można usunąć w ustawieniach przeglądarki. Na stronach kontaktu, prywatności i zasad korzystania Drive nie jest ładowany.",
  ]},
  {title:"Odbiorcy i usługi zewnętrzne",paragraphs:[
   "Hosting i baza danych HopTrip działają w Oracle Cloud w regionie Frankfurt (Niemcy). Pocztę obsługuje OVHcloud Zimbra; zgodnie z informacją dostawcy skrzynki tej usługi są hostowane we Francji. Dostawcy infrastruktury mogą przetwarzać dane w zakresie niezbędnym do świadczenia swoich usług.",
   "Telegram otrzymuje techniczne powiadomienie dla operatora o liczbie nowych wiadomości. Nie przekazujemy do niego treści, tematów ani adresów nadawców. Sprawdzenie skrzynki przez HopTrip nie oznacza wiadomości jako przeczytanej.",
   "Po zgodzie na Drive dostawcą narzędzia jest Travelpayouts. Po kliknięciu linku partnerskiego przeglądarka może przejść przez tp.media do Aviasales lub sprzedawcy. Te podmioty przetwarzają dane zgodnie ze swoimi zasadami, także w związku z przypisaniem prowizji. HopTrip nie dodaje do takich linków Twojego emaila ani danych pasażerów.",
   "Nie wszyscy dostawcy działają wyłącznie w EOG. Polityki i warunki dostawców opisują miejsca przetwarzania oraz stosowane mechanizmy transferu, w tym standardowe klauzule umowne lub inne właściwe zabezpieczenia. Informacje o zabezpieczeniach dotyczących usług wykorzystywanych przez HopTrip możesz uzyskać, kontaktując się z administratorem. Zgoda na marketing nie zastępuje wymaganych zabezpieczeń transferu.",
  ]},
  {title:"Jak długo przechowujemy dane",paragraphs:[
   "Zdarzenia analityczne starsze niż 90 dni usuwamy w zadaniu utrzymaniowym. Z wcześniejszych zapisów przejść partnerskich usuwamy powiązanie z sesją oraz źródłem i kampanią. Bez zgody na analitykę przekierowanie zapisuje tylko techniczny wpis bez identyfikatora sesji przeglądarki.",
   "Techniczne zapisy przejść i rozliczeń przechowujemy w zakresie potrzebnym do uzgodnienia prowizji, wykrywania nadużyć i ustalenia lub obrony roszczeń — do zakończenia rozliczenia i upływu właściwego okresu przedawnienia. Podstawą jest art. 6 ust. 1 lit. f RODO; dokumenty objęte obowiązkiem ustawowym przechowuje się przez wymagany prawem okres na podstawie art. 6 ust. 1 lit. c RODO.",
   "Korespondencję przechowujemy przez czas obsługi sprawy, a następnie tylko w zakresie niezbędnym do wykazania jej przebiegu, wykonania obowiązków prawnych lub obrony roszczeń, do upływu właściwych terminów. Dane techniczne są przetwarzane przez czas konieczny do obsługi połączenia i bezpieczeństwa; zapisy błędów mogą być przechowywane do zakończenia diagnostyki. Przeglądamy potrzebę dalszego przechowywania przy zamykaniu zgłoszeń.",
   "Usunięte dane mogą pozostać w ograniczonych dostępem kopiach zapasowych do zastąpienia lub usunięcia kopii w cyklu retencji. Nie używamy tych kopii do bieżącej analityki; przy odtworzeniu ponownie stosujemy reguły usuwania danych.",
  ]},
  {title:"Twoje prawa",paragraphs:[
   "Możesz żądać dostępu, sprostowania, usunięcia lub ograniczenia przetwarzania danych. W przypadkach przewidzianych przez RODO przysługuje Ci przenoszenie danych, sprzeciw wobec przetwarzania opartego na uzasadnionym interesie oraz wycofanie zgody. Zakres praw zależy od podstawy i okoliczności przetwarzania.",
   "Wyślij żądanie na adres email podany poniżej. Odpowiadamy co do zasady w ciągu miesiąca; gdy przepisy pozwalają przedłużyć termin, informujemy o tym i podajemy przyczynę. Możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl).",
  ]},
 ]},
 terms:{title:"Zasady korzystania",description:"Zasady korzystania z HopTrip i zgłaszania problemów.",draft:false,noindex:true,paragraphs:[
  "Korzystanie z katalogu i poradników HopTrip jest bezpłatne, nie wymaga konta ani subskrypcji. Do korzystania potrzebne są połączenie z internetem i aktualna przeglądarka; interaktywne funkcje wymagają JavaScript. Korzystanie można zakończyć, zamykając stronę.",
  "HopTrip publikuje obserwacje cen lotów i materiały informacyjne. Nie jest sprzedawcą biletów ani organizatorem imprez turystycznych, nie pobiera płatności i nie zawiera w Twoim imieniu umów podróży. Umowę zakupu zawierasz z wybranym sprzedawcą na jego zasadach.",
  "Ceny, dostępność i warunki mogą się zmienić po zapisaniu obserwacji. Przed zakupem sprawdź daty, lotniska, liczbę podróżnych, bagaż, opłaty i zasady zmiany lub zwrotu. Ocena i historia ceny nie gwarantują najniższej ceny na rynku. Linki partnerskie mogą przynieść operatorowi prowizję.",
  "Nie wolno wykorzystywać serwisu do działań bezprawnych, zakłócać jego działania ani obchodzić zabezpieczeń. Zgłoszenia nie powinny zawierać treści bezprawnych ani zbędnych danych innych osób.",
  "Problemy z HopTrip i reklamacje dotyczące działania serwisu zgłaszaj na podany adres email, podając opis, adres strony, datę zdarzenia i sposób odpowiedzi. Odpowiemy w ciągu 14 dni od otrzymania zgłoszenia. Reklamację biletu lub płatności kieruj do właściwego sprzedawcy.",
  "Niniejsze zasady nie ograniczają uprawnień przysługujących konsumentowi na mocy bezwzględnie obowiązujących przepisów. Zmiany zasad publikujemy na tej stronie z datą obowiązywania. Wersja obowiązuje od 25 września 2026 r.",
 ]},
};

export function isLegalPage(slug:string):boolean {return Object.hasOwn(legalContent,slug);}
