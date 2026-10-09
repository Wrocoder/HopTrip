import type {InfoContent} from "./info-types";

// Original editorial walking plans, not timed tours or live availability.
const map=(origin:string,waypoints:string[],destination:string)=>
 `https://www.google.com/maps/dir/?${new URLSearchParams({api:"1",origin,waypoints:waypoints.join("|"),destination,travelmode:"walking"})}`;
const prepare=(airport:string)=>({
 title:"Lotnisko, bagaż i budżet",paragraphs:[
  "Plan zakłada dwa pełne dni w mieście. Przy późnym przylocie wybierz tylko wieczorny spacer; przy wczesnym powrocie pomiń drugi dzień. Najpierw ustal godzinę wyjazdu na lotnisko i odbiór bagażu, potem rezerwuj atrakcje.",
  "Przylot przed zameldowaniem lub wyjazd po wymeldowaniu? Zapytaj nocleg o pozostawienie walizki i godziny odbioru. Nie zakładaj, że każde muzeum przyjmie bagaż podróżny.",
  "W kalkulatorze wpisz loty, rzeczywistą liczbę nocy, cenę pokoju za noc dla całej grupy, oba transfery, jedzenie i wybrane bilety. Puste koszty pozostaw nieznane. Do PLN przelicz wydatki w EUR lub CZK według wybranego kursu; nie sumuj różnych walut bez przeliczenia.",
 ],links:[{label:"Dojazd z lotniska i transfer",href:`/info/${airport}`},{label:"Policz budżet całej podróży",href:"/info/trip-budget#calculator"}]
});

export const weekendPilotGuides:Record<string,InfoContent>={
 "malaga-weekend":{
  title:"Malaga w 48 godzin: stare miasto, Alcazaba i morze",
  description:"Plan Malagi na dwa dni: kolejność spacerów i mapy, muzeum Picassa na deszcz, bezpłatne miejsca oraz dojazd i budżet.",
  draft:false,reviewedAt:"2026-10-07",category:"destinations",
  paragraphs:["Pierwszy dzień poświęć historycznemu centrum, drugi — muzeum i wybrzeżu. To nasza propozycja spokojnego weekendu z jedną główną płatną atrakcją dziennie. Pory dnia są orientacyjne: dopasuj kolejność do biletu, pogody i własnego tempa. Mapy otwierają proponowany spacer w Google Maps; sprawdź aktualne przejścia przed wyjściem."],
  sections:[
   {title:"Dzień 1 rano: centrum i okolice katedry",paragraphs:["Kolejność: Plaza de la Constitución → Calle Larios → katedra z zewnątrz → Teatro Romano. Przeznacz poranek na spacer i śniadanie, bez rezerwowania wejścia w każdym punkcie. Oglądanie fasady katedry nie obejmuje zwiedzania jej wnętrza.","Po spacerze zrób przerwę na obiad. Jeśli grupa potrzebuje wolniejszego tempa, zakończ pierwszy blok przy teatrze i odpocznij przed podejściem do twierdzy."],links:[{label:"Mapa spaceru — dzień 1",href:map("Plaza de la Constitución, Málaga",["Calle Larios, Málaga","Catedral de Málaga","Teatro Romano, Málaga"],"Alcazaba, Málaga")}]},
   {title:"Dzień 1 po południu: Alcazaba",paragraphs:["Alcazabę potraktuj jako główną wizytę dnia. Godziny, wejścia i aktualne zasady sprawdź na stronie miejskiego zarządcy. Nie dopisuj automatycznie Gibralfaro: to osobny punkt na wzgórzu, wymagający dodatkowego czasu i sił.","Wieczorem wróć do centrum na kolację. Gdy przylatujesz dopiero po południu, przenieś twierdzę na kolejny dzień i zrezygnuj z jednego muzeum."],sourceIds:[0]},
   {title:"Dzień 2: Picasso, park i Malagueta",paragraphs:["Zacznij od Museo Picasso Málaga, następnie przejdź przez Parque de Málaga w stronę Muelle Uno i promenady przy Malagueta. Zostaw popołudnie na obiad i morze zamiast kolejnego biletu na sztywną godzinę.","Muzeum Picassa mieści się przy Calle San Agustín, blisko katedry i Alcazaby. Sprawdź kalendarz wejść oraz zakres biletu. W sekcji „Muzea i atrakcje” poniżej znajdziesz już dodany wariant z audioprzewodnikiem; nie jest to potwierdzenie wolnych miejsc na twoje daty."],sourceIds:[1],links:[{label:"Mapa spaceru — dzień 2",href:map("Museo Picasso Málaga",["Parque de Málaga","Muelle Uno, Málaga"],"Playa de la Malagueta, Málaga")},{label:"Zobacz bilety i atrakcje",href:"#destination-activities-title"}]},
   {title:"Bezpłatnie i na deszcz",paragraphs:["Wariant bez biletów: spacer po starym mieście, park i promenada. Pomijasz wnętrza muzeów, katedry oraz płatną wizytę w twierdzy; posiłki i dojazdy nadal wymagają budżetu.","Na deszcz zamień dni i wybierz muzeum Picassa zamiast długiego spaceru nad morzem, jeśli są wejścia. Muzeum publikuje także zasady bezpłatnego wstępu, w tym niedzielne ostatnie dwie godziny; sprawdź warunki i nie traktuj tego jako gwarancji wejścia bez kolejki."],sourceIds:[1]},
   prepare("malaga-airport"),
  ],sources:[
   {label:"Miasto Málaga — Alcazaba i Gibralfaro",href:"https://alcazabaygibralfaro.malaga.eu/es/index.html"},
   {label:"Museo Picasso Málaga — bilety, godziny i dojazd",href:"https://www.museopicassomalaga.org/en/visita"},
  ],routes:[{label:"Loty do Malagi",href:"/destinations/malaga"}],related:["malaga-airport","trip-budget","city-break-planning"],
 },
 "alicante-weekend":{
  title:"Alicante w 48 godzin: zamek, stare miasto i plaża",
  description:"Dwa dni w Alicante z mapami spacerów: Santa Bárbara, Santa Cruz, Explanada i MARQ na deszcz. Transfer, bilety i budżet.",
  draft:false,reviewedAt:"2026-10-07",category:"destinations",
  paragraphs:["Na pierwszy dzień proponujemy zamek i stare miasto, na drugi muzeum oraz spacer nad morzem. Plan zostawia przerwy na jedzenie i odpoczynek. Nie obejmuje wycieczki do Benidormu ani na Tabarcę: przy krótkim pobycie oznaczałoby to rezygnację z części Alicante. Mapy w Google Maps pokazują kolejność punktów, a nie zarezerwowaną wycieczkę."],
  sections:[
   {title:"Dzień 1 rano: Santa Bárbara",paragraphs:["Zacznij od Castillo de Santa Bárbara. Wybierz sposób dotarcia do zamku przed wyjściem: piesze podejście na Benacantil i wjazd windą od strony Postiguet to różne warianty. Sprawdź dostępność windy, opłaty i godziny; mapa poniżej przedstawia zejście pieszo, nie drogę do windy.","Na odsłoniętym podejściu uwzględnij pogodę, wodę i własną kondycję. Po zwiedzaniu zostaw czas na zejście i obiad. Nie łącz walizki po przylocie z pierwszym spacerem na wzgórze."],sourceIds:[0]},
   {title:"Dzień 1 po południu: Santa Cruz i Explanada",paragraphs:["Kolejność po zamku: okolice Parque de la Ereta → Barrio de Santa Cruz → ratusz → Explanada de España. W starym mieście zwolnij i wybierz miejsce na posiłek. Schody oraz pochyłe uliczki mogą wymagać innego wariantu dla wózka lub osoby z ograniczoną mobilnością.","Wieczór zostaw na promenadę. Jeśli jest gorąco lub grupa jest zmęczona, pomiń część podejść i zacznij spacer przy ratuszu."],links:[{label:"Mapa spaceru — dzień 1",href:map("Castillo de Santa Bárbara, Alicante",["Parque de la Ereta, Alicante","Barrio de Santa Cruz, Alicante","Ayuntamiento de Alicante"],"Explanada de España, Alicante")}]},
   {title:"Dzień 2: MARQ i Postiguet",paragraphs:["Rano wybierz MARQ — Muzeum Archeologiczne, a po obiedzie spacer w stronę Postiguet i portu. Bilet sprawdź na oficjalnej stronie muzeum; link jest również w sekcji „Muzea i atrakcje” poniżej.","MARQ podaje poniedziałek jako dzień zamknięcia. Jeśli twój pobyt obejmuje poniedziałek, przełóż muzeum na inny dzień lub wybierz sam spacer. Sprawdź też krótsze godziny niedzielne i zakres wystaw objętych biletem."],sourceIds:[1],links:[{label:"Mapa spaceru — dzień 2",href:map("MARQ, Alicante",["Playa del Postiguet, Alicante"],"Explanada de España, Alicante")},{label:"Sprawdź wizytę w MARQ",href:"#destination-activities-title"}]},
   {title:"Bezpłatnie i na deszcz",paragraphs:["Plan bez biletów oprzyj na uliczkach starego miasta, Explanada i spacerze przy Postiguet. Nie doliczaj automatycznie płatnych wycieczek, windy ani muzeum do bezpłatnego wariantu.","Na deszcz zamień czas na plaży na MARQ, o ile jest otwarte. Jeśli muzeum jest zamknięte, zaplanuj krótszy spacer przy poprawie pogody i dłuższą przerwę na posiłek zamiast obiecywać zwiedzanie niedostępnego wnętrza."],sourceIds:[1]},
   prepare("alicante-airport"),
  ],sources:[
   {label:"Alicante — Castillo de Santa Bárbara i dojazd",href:"https://www.alicante.es/es/equipamientos/castillo-santa-barbara"},
   {label:"MARQ — planowanie wizyty",href:"https://www.marqalicante.com/en/organiza-tu-visita/"},
  ],routes:[{label:"Loty do Alicante",href:"/destinations/alicante"}],related:["alicante-airport","trip-budget","city-break-planning"],
 },
 "prague-weekend":{
  title:"Praga w 48 godzin: Stare Miasto, most Karola i zamek",
  description:"Weekend w Pradze z mapami: dwa spacery, Zamek Praski, bezpłatne warianty, Museum Kampa na deszcz i budżet podróży.",
  draft:false,reviewedAt:"2026-10-07",category:"destinations",
  paragraphs:["Pierwszy dzień prowadzi przez Stare Miasto na Kampę, drugi zaczyna się przy Zamku Praskim i schodzi w stronę Malej Strany. To autorski plan dwóch pełnych dni. Ustal godzinę ewentualnego wejścia do zamku przed rezerwacją innych atrakcji. Mapy w Google Maps pomogą zobaczyć kolejność; sprawdź bieżące dojścia i warunki na miejscu."],
  sections:[
   {title:"Dzień 1: Stare Miasto i most Karola",paragraphs:["Kolejność: Rynek Staromiejski → Karlova → most Karola → Kampa. Rano poświęć czas na plac i widok ratusza z zewnątrz, następnie przejdź w stronę Wełtawy. Wejście na wieżę ratusza to osobna opcja, której nie trzeba kupować, aby skorzystać ze spaceru.","Most Karola łączy obie strony historycznego centrum, a schody prowadzą także na Kampę. Nie zatrzymuj całej grupy w wąskim przejściu; na przerwę i obiad wybierz miejsce po zejściu z mostu."],sourceIds:[0],links:[{label:"Mapa spaceru — dzień 1",href:map("Staroměstské náměstí, Praha",["Karlova, Praha","Karlův most, Praha"],"Kampa, Praha")}]},
   {title:"Dzień 2: Zamek Praski i Malá Strana",paragraphs:["Zacznij przy Zamku Praskim, następnie zaplanuj zejście przez Hradčanské náměstí i Nerudovą do Malostranského náměstí. Dojazd na początek dobierz od swojego noclegu; nie musisz najpierw pokonywać całego wzgórza pieszo.","Na oficjalnej stronie zamku sprawdź godziny udostępnienia budynków i aktualne bilety. W naszej sekcji atrakcji jest bilet z krótkim wprowadzeniem: sprawdź miejsce odbioru i zakres, bo wprowadzenie nie oznacza pełnego oprowadzania. Pozostaw popołudnie na odpoczynek lub powrót po bagaż."],sourceIds:[1],links:[{label:"Mapa spaceru — dzień 2",href:map("Pražský hrad, Praha",["Hradčanské náměstí, Praha","Nerudova, Praha"],"Malostranské náměstí, Praha")},{label:"Zobacz bilet do Zamku Praskiego",href:"#destination-activities-title"}]},
   {title:"Bezpłatnie: wybierz spacer bez wnętrz",paragraphs:["Rynek Staromiejski, przejście mostem Karola i spacer po Kampie tworzą wariant bez biletów wstępu. Oglądaj zabudowę z ulicy; wieże, muzea i płatne obiekty zamku wymagają osobnych decyzji.","Zostaw środki na posiłki i transport. Bezpłatny spacer nie oznacza wyjazdu bez wydatków, a dodatkowe przejazdy mogą zmienić budżet nawet przy rezygnacji z muzeów."]},
   {title:"Na deszcz: Museum Kampa",paragraphs:["Zamiast długiego spaceru nad rzeką wybierz Museum Kampa z kolekcją sztuki nowoczesnej. Pasuje do pierwszego dnia, bo znajduje się w tej samej okolicy. Sprawdź aktualne wystawy, godziny i cenę przed wizytą; nie zakładamy, że wstęp jest bezpłatny.","Zwiedzanie zamku również obejmuje odcinki na zewnątrz. Przy złej pogodzie skróć przejścia i wybierz jedno wnętrze zamiast traktować cały kompleks jako plan pod dachem."],sourceIds:[2]},
   prepare("prague-airport"),
  ],sources:[
   {label:"Prague City Tourism — most Karola",href:"https://prague.eu/en/objevujte/charles-bridge-karluv-most/"},
   {label:"Zamek Praski — informacje dla odwiedzających",href:"https://www.hrad.cz/en/prague-castle-for-visitors"},
   {label:"Prague City Tourism — Museum Kampa",href:"https://prague.eu/en/objevujte/museum-kampa/"},
  ],routes:[{label:"Loty do Pragi",href:"/destinations/prague"}],related:["prague-airport","trip-budget","city-break-planning"],
 },
};
