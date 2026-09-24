import type {InfoContent} from "./info-types";

// Reviewed against airport, transport operator and official tourism sources.
export const moreDestinationGuides:Record<string,InfoContent>={
 "madrid-airport":{
  title:"Madryt: terminal MAD, metro i dalsza podróż",
  description:"Linia 8, kolej przy T4 i przesiadka na pociąg dalekobieżny — zaplanuj trasę od właściwego terminala.",
  draft:false,reviewedAt:"2026-09-24",category:"destinations",
  paragraphs:["Przy podróży do Madrytu zapisz nie tylko kod MAD, lecz także terminal i adres noclegu. Połączenie wygodne z T4 nie musi być równie proste po przylocie do T1. Jeżeli dalej jedziesz koleją, potrzebujesz nazwy konkretnego dworca, a nie tylko celu „Madryt”."],
  sections:[
   {title:"Metro 8: początek trasy, nie dojazd do każdego hotelu",paragraphs:["Oficjalny przewodnik Madrytu wskazuje linię 8 między lotniskiem a Nuevos Ministerios, z obsługą części T1–T3 i T4. Sprawdź dalszą przesiadkę według dzielnicy noclegu. W planie uwzględnij wyjście z hali przylotów i dojście do stacji, nie tylko przejazd metrem."],sourceIds:[0]},
   {title:"Sprawdź dopłatę lotniskową",paragraphs:["Przewodnik miasta wymienia osobną dopłatę lotniskową w taryfie metra. Przed zakupem sprawdź, czy wybrany produkt ją obejmuje. Nie porównuj ceny samego przejazdu miejskiego z pełną ceną transferu; dla kilku osób policz wszystkie bilety w obie strony."],sourceIds:[0]},
   {title:"Kolej jest przy T4",paragraphs:["Hiszpański portal turystyczny wskazuje T4 jako jedyny terminal MAD ze stacją kolei Cercanías. Dla innego terminala trzeba uwzględnić transfer. Przed zakupem dalszego pociągu sprawdź jego dworzec, aktualną trasę kolei lotniskowej i komunikaty o zmianach: nazwy Atocha i Chamartín nie oznaczają tego samego miejsca."],sourceIds:[1]},
   {title:"Późny przylot i krótki pobyt",paragraphs:["Zestaw godzinę wyjścia z lotniska z ostatnim transportem do hotelu i możliwością zameldowania. Rezerwując pierwszy dzień zwiedzania, zostaw miejsce na opóźnienie i odbiór walizki. W okresie wydarzeń lub świąt sprawdź nocleg i powrotny transfer przed wyborem lotu; niższa cena biletu nie przesądza o koszcie całego wyjazdu."]},
  ],sources:[
   {label:"Madrid Turismo — metro i bilety lotniskowe",href:"https://www.esmadrid.com/en/getting-around-madrid-metro"},
   {label:"Spain.info — dojazd do Madrid-Barajas",href:"https://www.spain.info/en/aeroplane/adolfo-suarez-madrid-barajas-airport/"},
  ],routes:[{label:"Sprawdź aktualny katalog lotów",href:"/deals"}],related:["barcelona-airports","valencia-airport","baggage"],
 },
 "valencia-airport":{
  title:"Walencja: z VLC do centrum i nad morze",
  description:"Metro 3 i 5, nocleg przy plaży lub w centrum oraz osobny plan powrotu na lotnisko.",
  draft:false,reviewedAt:"2026-09-24",category:"destinations",
  paragraphs:["W Walencji najpierw wybierz adres pobytu: historyczne centrum i nocleg blisko morza wymagają innego ostatniego odcinka podróży. Kod VLC oznacza lotnisko Walencji; nie przenoś na nie rozkładów z Alicante. Do porównania lotów dodaj transport do drzwi noclegu."],
  sections:[
   {title:"Dwie linie metra z lotniska",paragraphs:["Aena wskazuje linie Metrovalencia 3 i 5. Obie łączą lotnisko z centrum, a linia 5 prowadzi w stronę portu. Dobierz stację i ewentualną przesiadkę do dokładnego adresu, zamiast wysiadać automatycznie na pierwszej stacji w mieście."],sourceIds:[0]},
   {title:"Przystanek nad morzem to nie każda plaża",paragraphs:["Visit València również wymienia linie 3 i 5 jako połączenia lotniskowe. Informacja o dojeździe w stronę portu nie jest obietnicą wysiadki pod hotelem przy plaży. Sprawdź mapę ostatniego odcinka, dojście z bagażem i dostępność windy, jeśli jest potrzebna."],sourceIds:[1]},
   {title:"Bilet dobierz do całej trasy",paragraphs:["Przed zapłatą wybierz na automacie lub w oficjalnym planerze rzeczywistą stację docelową. Sprawdź objęcie lotniska przez bilet miejski lub kartę turystyczną; samo słowo „metro” nie potwierdza zakresu taryfy. Do kosztu rodzinnego wyjazdu dodaj oddzielnie bilety i ewentualne nośniki dla podróżnych."]},
   {title:"Godzina lotu i plan pobytu",paragraphs:["Dla wieczornego przylotu sprawdź ostatni kurs w konkretnym dniu. Przy wczesnym powrocie porównaj pierwszy transport z terminem odprawy. Jeżeli plan obejmuje wydarzenie, centrum i plażę, sprawdź dojazdy między tymi punktami przed wyborem noclegu; sezon nie gwarantuje oszczędności."]},
  ],sources:[
   {label:"Aena Valencia — linie metra",href:"https://www.aena.es/es/valencia/como-llegar/metro.html"},
   {label:"Visit València — dojazd z lotniska",href:"https://www.visitvalencia.com/en/plan-your-trip-to-valencia/to-get-to-valencia/airport"},
  ],routes:[{label:"Sprawdź aktualny katalog lotów",href:"/deals"}],related:["alicante-airport","madrid-airport","baggage"],
 },
 "alicante-airport":{
  title:"Alicante: autobus C6 i dalsza droga po Costa Blanca",
  description:"Dojazd z ALC do Alicante, przesiadka na TRAM i wybór transferu do innej miejscowości wybrzeża.",
  draft:false,reviewedAt:"2026-09-24",category:"destinations",
  paragraphs:["Lotnisko Alicante-Elche (ALC) może być początkiem pobytu w Alicante albo wyjazdu do innej miejscowości Costa Blanca. Rozdziel te scenariusze: autobus do centrum nie zawsze jest najlepszym pierwszym etapem do hotelu poza miastem. Zapisz pełną nazwę miejscowości i adres."],
  sections:[
   {title:"C6 do miasta",paragraphs:["Aena opisuje C6 jako połączenie terminala z centrum Alicante, z przystankami przy ważnych punktach miasta i kolei. Na Alfonso X El Sabio oraz Plaza de los Luceros można przesiąść się na TRAM. Przed wejściem sprawdź przystanek najbliższy noclegowi i aktualny rozkład operatora."],sourceIds:[0]},
   {title:"TRAM wymaga dojazdu autobusem",paragraphs:["Strona Aena o kolei i tramwaju wskazuje C6 jako łącznik lotniska ze stacją Luceros. To nie bezpośredni pociąg spod terminala. Planując dalszą drogę wybrzeżem, uwzględnij oczekiwanie i zmianę środka transportu; sprawdź też, czy wybrane połączenie wymaga kolejnych przesiadek."],sourceIds:[1]},
   {title:"Benidorm i inne miejscowości: porównaj transfer bez centrum",paragraphs:["Lotnisko wymienia również autobusy regionalne, w tym bezpośrednie połączenie do Benidormu. Dla konkretnego noclegu porównaj ten wariant z dojazdem przez Alicante. Sprawdź punkt wysiadania, rezerwację oraz ostatni kurs; obecność trasy na stronie nie gwarantuje kursu po każdym locie."],sourceIds:[0]},
   {title:"Powrót z miejscowości wypoczynkowej",paragraphs:["Pierwszy autobus z hotelowej okolicy może nie pasować do porannego odlotu. Zanim kupisz bilet, rozpisz drogę powrotną i wariant po opóźnieniu. Dla wakacji sprawdź warunki noclegu i transferu osobno: oferta lotnicza nie obejmuje automatycznie całego pobytu ani dowozu do recepcji."]},
  ],sources:[
   {label:"Aena Alicante — C6 i autobusy regionalne",href:"https://www.aena.es/en/alicante-elche-miguel-hernandez/how-to-get-there/bus.html"},
   {label:"Aena Alicante — połączenie z TRAM",href:"https://www.aena.es/es/alicante-elche-miguel-hernandez/como-llegar/tren-tram.html"},
  ],routes:[{label:"Loty do Alicante w katalogu",href:"/destinations/alicante"}],related:["valencia-airport","malaga-airport","baggage"],
 },
 "malaga-airport":{
  title:"Malaga: kolej C1, centrum i Costa del Sol",
  description:"AGP, María Zambrano i Fuengirola — wybierz właściwy kierunek dojazdu zamiast automatycznie jechać do centrum.",
  draft:false,reviewedAt:"2026-09-24",category:"destinations",
  paragraphs:["Po przylocie do Málaga-Costa del Sol (AGP) możesz jechać do Malagi lub dalej na wybrzeże. Najważniejsze jest położenie noclegu względem transportu. Nie zakładaj, że każdy kurort opisany jako Costa del Sol znajduje się przy jednej linii kolejowej."],
  sections:[
   {title:"C1 kursuje w dwóch przydatnych kierunkach",paragraphs:["Aena wskazuje linię C1 między Málaga Centro Alameda a Fuengirolą. Kierunek do miasta i kierunek na wybrzeże to różne warianty. Zanim wejdziesz na peron, porównaj nazwę stacji docelowej z adresem noclegu; do rozkładowego przejazdu dolicz odbiór bagażu i dojście."],sourceIds:[0]},
   {title:"María Zambrano i Centro Alameda to różne cele",paragraphs:["Lotnisko wskazuje María Zambrano jako punkt przesiadki na szybkie pociągi AVE. Jeżeli dalej jedziesz koleją, sprawdź właśnie dworzec podany na bilecie. Dla spaceru po centrum dogodniejszy punkt wysiadania może być inny; porównaj końcowe dojście zamiast wybierać stację wyłącznie po nazwie miasta."],sourceIds:[0]},
   {title:"Autobus do miasta albo poza trasę kolei",paragraphs:["Aena opisuje miejską linię ekspresową A oraz połączenia międzymiastowe. Dla noclegu poza zasięgiem C1 sprawdź konkretny autobus i przystanek końcowy. Nie łącz automatycznie dwóch osobno kupionych przejazdów w jeden gwarantowany transfer."],sourceIds:[1]},
   {title:"Wieczór i pobyt na wybrzeżu",paragraphs:["Sprawdź ostatni kurs do swojej miejscowości i pierwszy kurs powrotny na datę lotu. Jeśli połączenie jest napięte, porównaj koszt wcześniejszego powrotu lub noclegu bliżej lotniska. Termin plażowy, miejski weekend i wycieczka po Andaluzji wymagają różnych budżetów transportu; nie oceniaj ich tylko ceną lotu."]},
  ],sources:[
   {label:"Aena Málaga — linia kolejowa C1",href:"https://www.aena.es/en/malaga-costa-del-sol/getting-there/trains.html"},
   {label:"Aena Málaga — autobusy miejskie i regionalne",href:"https://www.aena.es/en/malaga-costa-del-sol/getting-there/bus.html"},
  ],routes:[{label:"Loty do Malagi w katalogu",href:"/destinations/malaga"}],related:["alicante-airport","madrid-airport","one-way-round-trip"],
 },
 "porto-airport":{
  title:"Porto: metro E, Andante i ostatni odcinek do noclegu",
  description:"Dojazd z OPO, dobór stref Andante i walidacja biletu przy przesiadkach.",
  draft:false,reviewedAt:"2026-09-24",category:"destinations",
  paragraphs:["W Porto wybierz nocleg razem z trasą od przystanku do wejścia. Sama informacja o bliskości centrum nie opisuje drogi z walizką. Przy podróży do Vila Nova de Gaia lub dalej poza miasto zaplanuj oddzielnie ostatni odcinek oraz powrót na OPO."],
  sections:[
   {title:"Fioletowa linia E z lotniska",paragraphs:["ANA wskazuje linię metra E jako połączenie lotniska z siecią miasta. Częstotliwość zależy od pory i dnia tygodnia. Wybierz przesiadkę według adresu, a aktualny kurs potwierdź w rozkładzie; nie traktuj mapy metra jako obietnicy połączenia o dowolnej godzinie."],sourceIds:[0]},
   {title:"Andante: trasa wyznacza strefy",paragraphs:["Operator Andante wyjaśnia, że dla podróży okazjonalnej liczą się strefa startowa, cel i strefy po drodze. Dobierz zakres biletu do całego przejazdu. Andante Azul może być używany przez jedną osobę naraz, więc kilka doładowanych przejazdów nie zastępuje kart dla całej grupy."],sourceIds:[1]},
   {title:"Waliduj również przy zmianie linii",paragraphs:["Andante wymaga walidacji na początku podróży i przy zmianie linii lub środka transportu. Załadowany bilet nie oznacza jeszcze rozpoczętej podróży. Przed wejściem sprawdź potwierdzenie walidatora; przy przesiadce nie zakładaj, że poprzednie odbicie wystarcza."],sourceIds:[1]},
   {title:"Późny przylot i dalsza kolej",paragraphs:["Lotnisko wymienia też autobusy miejskie i połączenia dalekobieżne. Dla dalszej podróży sprawdź punkt odjazdu konkretnego przewoźnika; nocleg w Porto i bilet do innego miasta to osobne plany. Wieczorem uwzględnij zameldowanie oraz końcowe dojście, a przed wyjazdem w święta ponownie sprawdź rozkłady."],sourceIds:[0]},
  ],sources:[
   {label:"Porto Airport — metro i transport publiczny",href:"https://www.portoairport.pt/en/opo/access-parking/getting-to-and-from-the-airport/public-transportation"},
   {label:"Andante — strefy, karty i walidacja",href:"https://andante.pt/perguntas-frequentes/"},
  ],routes:[{label:"Sprawdź aktualny katalog lotów",href:"/deals"}],related:["lisbon-airport","baggage","one-way-round-trip"],
 },
 "vienna-airport":{
  title:"Wiedeń: dojazd z VIE podczas zmian na kolei",
  description:"Remont 2026–2027, CAT by bus, skrócona S7 i kolej do Hauptbahnhof — sprawdź aktualny wariant transferu.",
  draft:false,reviewedAt:"2026-09-24",category:"destinations",
  paragraphs:["Dojazd z lotniska Wiedeń (VIE) wymaga teraz szczególnej uwagi: starszy opis bezpośredniego pociągu do Wien Mitte może nie odpowiadać twojej dacie. Zacznij od aktualnego komunikatu, a dopiero potem wybierz nocleg i bilet. Nie przenoś czasów przejazdu sprzed remontu do nowego planu."],
  sections:[
   {title:"Prace od września 2026 do października 2027",paragraphs:["WienTourismus informuje o zamknięciu centralnego odcinka kolejowego od 7 września 2026 do końca października 2027. Termin i zakres trzeba ponownie sprawdzić przed podróżą. Samo zobaczenie S7 lub CAT na starszej mapie nie potwierdza obecnego dojazdu do Wien Mitte."],sourceIds:[0]},
   {title:"CAT działa jako autobus",paragraphs:["Operator opisuje w okresie prac usługę CAT by bus między Wien Mitte/Landstraße a lotniskiem. To zastępczy autokar, nie przejazd pociągiem zwykłą trasą. Sprawdź miejsce odjazdu i rozkład autobusu; do planu dodaj ryzyko ruchu drogowego."],sourceIds:[1]},
   {title:"Hauptbahnhof albo S7 do St. Marx",paragraphs:["Komunikat CAT wskazuje połączenia kolejowe między lotniskiem a Wien Hauptbahnhof oraz skróconą S7 do St. Marx, skąd dalsza droga wymaga przesiadki. Wybierz wariant według adresu noclegu lub dworca dalszego pociągu. Bilet na jedną usługę nie potwierdza ważności w pozostałych."],sourceIds:[1]},
   {title:"Dwa plany: przylot i powrót",paragraphs:["Sprawdź osobno dojazd po lądowaniu i kurs na lot powrotny, szczególnie przy późnym przylocie lub święcie. Jeśli dalej jedziesz koleją, pozostaw zapas na zmianę środka transportu i znalezienie peronu. Oszczędność na noclegu poza centrum porównaj z liczbą przesiadek podczas prac."]},
  ],sources:[
   {label:"WienTourismus — aktualne połączenia lotniskowe",href:"https://www.wien.info/en/travel-info/arrival-departure/airport-to-center"},
   {label:"City Airport Train — zamknięcie linii i alternatywy",href:"https://www.cityairporttrain.com/en/info-service/main-line-closure/"},
  ],routes:[{label:"Sprawdź aktualny katalog lotów",href:"/deals"}],related:["prague-airport","budapest-airport","baggage"],
 },
 "prague-airport":{
  title:"Praga: trolejbus 59 czy Airport Express",
  description:"PRG, przesiadka na metro A i osobna taryfa autobusu na główny dworzec kolejowy.",
  draft:false,reviewedAt:"2026-09-24",category:"destinations",
  paragraphs:["Po przylocie do Pragi wybierz wariant według celu: nocleg przy metrze lub dalszy pociąg z głównego dworca. Są to różne trasy i zasady biletowe. Zapisz terminal powrotu oraz stację najbliższą noclegowi przed porównaniem kosztu całego wyjazdu."],
  sections:[
   {title:"59 do Nádraží Veleslavín i metro A",paragraphs:["Port lotniczy wskazuje trolejbus 59 z terminali 1 i 2 do Nádraží Veleslavín, z przesiadką na metro A. To dwa etapy przejazdu. Starsze instrukcje mogą wymieniać autobus 119; aktualną linię i komunikaty sprawdź na stronie lotniska."],sourceIds:[0]},
   {title:"Airport Express na główny dworzec",paragraphs:["Airport Express łączy lotnisko z Praha hlavní nádraží. Lotnisko wskazuje odjazd z Terminala 1 i przystanek przy budynku dworca od ulicy Wilsonova. Nie pomyl tego punktu z dowolnym wejściem do stacji metra lub peronem kolejowym; dolicz dojście na dalszy pociąg."],sourceIds:[1]},
   {title:"Zwykły bilet miejski nie wystarcza na AE",paragraphs:["Według lotniska standardowe bilety komunikacji miejskiej nie obowiązują w Airport Express. Dla 59 z metrem i dla AE sprawdź osobno taryfę. Jeśli korzystasz z oferty łączonej z koleją, sprawdź warunki tego produktu zamiast kupować dodatkowy bilet bez potrzeby."],sourceIds:[1]},
   {title:"Wieczór i dalsza podróż",paragraphs:["Przy późnym lądowaniu sprawdź cały łańcuch dojazdu, łącznie z dalszym metrem; autobus z lotniska sam nie dowodzi dostępności ostatniej przesiadki. Na dzień powrotu wybierz godzinę przyjazdu do właściwego terminala. Weekendowy rozkład i termin wydarzenia warto zestawić z noclegiem przed rezerwacją lotu."]},
  ],sources:[
   {label:"Prague Airport — trolejbus i autobusy miejskie",href:"https://www.prg.aero/en/public-transport-buses"},
   {label:"Prague Airport — Airport Express i bilety",href:"https://www.prg.aero/en/airport-express"},
  ],routes:[{label:"Sprawdź aktualny katalog lotów",href:"/deals"}],related:["vienna-airport","budapest-airport","one-way-round-trip"],
 },
 "amsterdam-airport":{
  title:"Amsterdam: Schiphol, pociąg i autobus 397",
  description:"Stacja pod terminalem AMS, dojazd autobusem i nocny N97 — wybierz połączenie do swojej dzielnicy.",
  draft:false,reviewedAt:"2026-09-24",category:"destinations",
  paragraphs:["Ten poradnik dotyczy Schiphol (AMS). Jeżeli oferta wskazuje inne lotnisko w Holandii, sprawdź jego własny dojazd zamiast przypisywać mu transfer Schiphol. Porównaj trasę do konkretnego noclegu: najkrótszy przejazd do dworca nie zawsze daje najkrótszą drogę do hotelu."],
  sections:[
   {title:"Stacja kolejowa pod terminalem",paragraphs:["Schiphol opisuje stację kolejową bezpośrednio pod terminalem. Sprawdź tablicę odjazdów oraz docelową stację w planerze NS; lotnisko ma połączenia również poza Amsterdam. Nie wsiadaj do pierwszego pociągu tylko dlatego, że odjeżdża ze stacji lotniskowej."],sourceIds:[0]},
   {title:"397 i nocny N97",paragraphs:["Lotnisko wskazuje Amsterdam Airport Express 397 oraz nocny Niteliner N97 jako połączenia autobusowe z Amsterdamem. Porównaj przystanek przyjazdu z adresem hotelu. Wariant nocny sprawdź oddzielnie: inny numer nie oznacza identycznego rozkładu i wszystkich tych samych warunków."],sourceIds:[1]},
   {title:"Bilet kolejowy i produkt miejski",paragraphs:["Przy zakupie sprawdź, czy produkt obejmuje konkretny pociąg lub autobus lotniskowy oraz dalszy przejazd po mieście. Nie wyciągaj tego wniosku z samej nazwy Amsterdam. Zapisz też sposób wejścia i wyjścia z transportu oraz zasady dla dzieci i grupy przed porównaniem sumy kosztów."]},
   {title:"Weekend i podróż poza Amsterdam",paragraphs:["W dniu podróży sprawdź prace kolejowe, peron i ostatnie połączenie. Jeśli nocujesz w innym mieście, wyszukaj dojazd z AMS bez narzucania przesiadki w centrum Amsterdamu. Dla wczesnego odlotu porównaj dostępność transportu nocnego z kosztem alternatywy; godzina lądowania nie jest godziną dotarcia do hotelu."]},
  ],sources:[
   {label:"Schiphol — podróż pociągiem",href:"https://www.schiphol.nl/en/from-to-schiphol/by-public-transport/train/"},
   {label:"Schiphol — autobusy 397 i N97",href:"https://www.schiphol.nl/en/from-to-schiphol/by-public-transport/bus/"},
  ],routes:[{label:"Sprawdź aktualny katalog lotów",href:"/deals"}],related:["connections","paris-airports","london-airports"],
 },
 "copenhagen-airport":{
  title:"Kopenhaga: metro czy pociąg z CPH",
  description:"Dwie drogi z Terminala 3, wybór kierunku pociągu i plan podróży do Kopenhagi lub Szwecji.",
  draft:false,reviewedAt:"2026-09-24",category:"destinations",
  paragraphs:["Lotnisko Kopenhaga (CPH) obsługuje zarówno podróże do miasta, jak i dalsze przejazdy przez region. Przed zejściem na peron ustal, po której stronie cieśniny znajduje się twój nocleg. Metro i pociąg to różne warianty, choć oba są dostępne przy Terminalu 3."],
  sections:[
   {title:"Metro przy Terminalu 3",paragraphs:["CPH wskazuje stację metra w bezpośrednim przedłużeniu Terminala 3. Sprawdź stację najbliższą noclegowi i potrzebne przesiadki. Po przylocie kieruj się oznakowaniem metra; sam znak transportu publicznego nie rozstrzyga, który peron prowadzi do wybranego celu."],sourceIds:[0]},
   {title:"Pociągi do Danii i Szwecji",paragraphs:["Strona lotniska opisuje połączenia kolejowe przy Terminalu 3, w tym do centrum Kopenhagi i do Szwecji. Sprawdź nazwę końcowego kierunku na tablicy odjazdów, zamiast wybierać pociąg wyłącznie według godziny. Dla dalszej kolei dobierz odpowiednią stację przesiadki i bilet na cały potrzebny odcinek."],sourceIds:[1]},
   {title:"Transport miejski a podróż przez granicę",paragraphs:["Bilet do hotelu w Kopenhadze i bilet do miejscowości w Szwecji nie są tym samym zakupem. Sprawdź zakres produktu, walutę rozliczenia i wymagania dotyczące twoich dokumentów w oficjalnych źródłach właściwych dla podróży. Ten poradnik nie ustala indywidualnych warunków wjazdu."]},
   {title:"Późne lądowanie i powrót",paragraphs:["Przed wieczornym lotem sprawdź nie tylko pierwszy przejazd z CPH, lecz także ostatni odcinek do noclegu. Dla porannego powrotu uwzględnij dojście ze stacji do odprawy. Termin wydarzenia lub święto mogą zmienić dostępność noclegu i rozkład; policz cały plan przed oceną ceny biletu lotniczego."]},
  ],sources:[
   {label:"Copenhagen Airport — metro",href:"https://www.cph.dk/en/parking-transport/bus-train-metro-taxi/metro"},
   {label:"Copenhagen Airport — pociągi",href:"https://www.cph.dk/en/parking-transport/bus-train-metro-taxi/train"},
  ],routes:[{label:"Sprawdź aktualny katalog lotów",href:"/deals"}],related:["stockholm-airports","baggage","one-way-round-trip"],
 },
 "stockholm-airports":{
  title:"Sztokholm: Arlanda i Skavsta to różne transfery",
  description:"Stacje Arlandy, opłata za dostęp do Arlanda Central i osobny dojazd ze Skavsty.",
  draft:false,reviewedAt:"2026-09-24",category:"destinations",
  paragraphs:["Przy wyszukiwaniu Sztokholmu zacznij od kodu na bilecie. Ten poradnik porównuje Arlandę (ARN) i Skavstę (NYO), a nie wszystkie lotniska regionu. Jeśli oferta pokazuje inny kod, sprawdź osobno jego transport. Nie traktuj nazwy miasta jako obietnicy podobnego czasu dojazdu."],
  sections:[
   {title:"Arlanda: ekspres i kolej podmiejska",paragraphs:["Swedavia rozróżnia Arlanda Express ze stacjami Arlanda South i Arlanda North oraz kolej podmiejską zatrzymującą się na Arlanda Central w SkyCity. To nie jeden produkt i nie jeden peron. Dobierz stację do przewoźnika i terminala lotu, a trasę do końcowego adresu."],sourceIds:[0]},
   {title:"Sprawdź opłatę stacyjną",paragraphs:["Przy wsiadaniu lub wysiadaniu na Arlanda Central obowiązuje opłata stacyjna; Swedavia zaleca sprawdzić, czy zawarto ją w bilecie. Nie dopisuj jej automatycznie do każdego produktu kolejowego ani nie zakładaj, że zwykły bilet miejski obejmuje wszystko. Porównuj pełne warunki wybranego przejazdu."],sourceIds:[0]},
   {title:"Skavsta: autobus lub przejazd przez Nyköping",paragraphs:["Skavsta publikuje warianty autokarowe i dojazd lokalny do Nyköping z dalszą koleją. Nie ma tu takiego samego planu wejścia do pociągu jak na Arlandzie. Sprawdź operatora i rozkład na swój lot oraz czas przesiadki, jeśli wybierasz połączenie przez miasto."],sourceIds:[1]},
   {title:"Dwa różne lotniska w jednej rezerwacji podróży",paragraphs:["Jeśli przylot i powrót mają różne kody, przygotuj dwa transfery zamiast biletu powrotnego na tę samą trasę. Po późnym lądowaniu sprawdź ostatni autokar i zameldowanie; zimą lub podczas prac dodaj zapas do planu. Ceny lotów porównuj po uwzględnieniu dojazdu w SEK oraz czasu spędzonego poza miastem."]},
  ],sources:[
   {label:"Swedavia Arlanda — pociągi i opłata stacyjna",href:"https://www.swedavia.com/arlanda/trains/"},
   {label:"Stockholm Skavsta — autobus, kolej i taxi",href:"https://www.skavsta.se/en/getting-to-and-from/bus-train-taxi/"},
  ],routes:[{label:"Sprawdź aktualny katalog lotów",href:"/deals"}],related:["copenhagen-airport","baggage","one-way-round-trip"],
 },
};
