import type {InfoContent} from "./info-types";

export const destinationGuides:Record<string,InfoContent> = {
 "barcelona-airports":{
  title:"Barcelona: BCN, Girona czy Reus",
  description:"Różne lotniska, odległości i bilety na dojazd — jak porównać rzeczywisty koszt podróży do Barcelony.",
  draft:false,reviewedAt:"2026-09-23",category:"destinations",
  paragraphs:["Wynik wyszukiwania z nazwą Barcelona może oznaczać bardzo różny dojazd. Przed porównaniem cen zapisz kod lotniska w każdym kierunku i adres noclegu. Nie zakładaj, że oferta do Girona lub Reus ma taki sam transfer jak lot do El Prat."],
  sections:[
   {title:"Odległość zmienia plan krótkiego wyjazdu",paragraphs:[
    "Turisme de Barcelona podaje około 16 km dla Barcelona-El Prat (BCN), 95 km dla Girona-Costa Brava (GRO) i 108 km dla Reus (REU). Wymienia też Lleida-Alguaire (ILD), około 170 km na zachód, jako dalszą możliwość dojazdu do regionu. To odległości orientacyjne, nie czas przejazdu do hotelu.",
    "Dla GRO, REU i ILD sprawdź konkretny transport dalekobieżny i ostatni kurs po lądowaniu. Przy krótkim pobycie porównaj nie tylko koszt, lecz także część dnia zajętą przez transfer w obie strony.",
   ],sourceIds:[0]},
   {title:"BCN: terminal i metro L9 Sud",paragraphs:[
    "El Prat ma terminale T1 i T2. Metro L9 Sud obsługuje oba; dalszy dojazd do wybranej części miasta może wymagać przesiadki. TMB wskazuje m.in. połączenia z L1 na Torrassa, L5 na Collblanc i L3 na Zona Universitària. Wybierz przesiadkę według adresu noclegu.",
   ],sourceIds:[0,1]},
   {title:"Zwykły bilet nie zawsze obejmuje stację lotniskową",paragraphs:[
    "TMB wyłącza stacje Aeroport T1 i T2 z ważności T-casual; istnieje osobny bilet lotniskowy i inne produkty obejmujące te stacje. Sprawdź właściwy bilet przed wejściem do metra. Bilet na metro i bilet na autokar z odległego lotniska to różne wydatki.",
   ],sourceIds:[2]},
   {title:"Termin, późny przylot i wyjazd poza miasto",paragraphs:[
    "Dla terminu wakacyjnego, świątecznego lub dużego wydarzenia sprawdź nocleg i dojazd równocześnie z lotem; sama pora roku nie dowodzi niższej ceny. Jeśli celem jest Costa Brava lub Costa Daurada, porównaj transfer do konkretnej miejscowości zamiast zawsze jechać przez centrum Barcelony. Przy powrocie upewnij się, że jedziesz na właściwe lotnisko i terminal.",
   ]},
  ],sources:[
   {label:"Turisme de Barcelona — lotniska i odległości",href:"https://bid.barcelonaturisme.com/wv3/en/page/33/plane.html"},
   {label:"TMB — dojazd z lotniska linią L9 Sud",href:"https://www.tmb.cat/en/visit-barcelona/public-transport/metro-airport"},
   {label:"TMB — ważność biletów na stacjach lotniskowych",href:"https://www.tmb.cat/en/barcelona-fares-metro-bus"},
  ],routes:[{label:"Loty do Barcelony w katalogu",href:"/destinations/barcelona"}],related:["trip-budget","baggage","one-way-round-trip"],
 },
 "rome-airports":{
  title:"Rzym: Fiumicino i Ciampino bez pomyłki",
  description:"Pociąg z FCO, autobus z CIA i dalsza droga od Termini — porównanie dwóch wariantów przylotu.",
  draft:false,reviewedAt:"2026-09-23",category:"destinations",
  paragraphs:["Fiumicino (FCO) i Ciampino (CIA) to dwa różne porty obsługujące Rzym. Przy krótkim pobycie punktem odniesienia powinien być adres noclegu, a nie sam napis Roma. Sprawdź również kod lotniska na bilecie powrotnym."],
  sections:[
   {title:"Fiumicino: lotnisko poza centrum",paragraphs:[
    "Turismo Roma opisuje Fiumicino jako port położony około 30 km od stolicy w stronę morza. Przy porównaniu z noclegiem oblicz drogę do konkretnej dzielnicy: odległość do Rzymu nie jest odległością do każdego hotelu.",
   ],sourceIds:[0]},
   {title:"Leonardo Express kończy przejazd na Termini",paragraphs:[
    "Trenitalia podaje bezpośredni przejazd Leonardo Express między Fiumicino i Roma Termini trwający około 32 minut; stacja znajduje się na lotnisku. Ten czas dotyczy pociągu, nie odbioru walizki, oczekiwania ani dalszej drogi od Termini.",
    "Nie rezerwuj aktywności w mieście wyłącznie na podstawie tych 32 minut. Sprawdź aktualne godziny kursowania, a przy powrocie dodaj dojście ze stacji do właściwej odprawy.",
   ],sourceIds:[1]},
   {title:"Ciampino: sprawdź cały łańcuch dojazdu",paragraphs:[
    "ADR wskazuje połączenia autobusowe z lotniska Ciampino do stacji kolejowej Ciampino oraz Roma Anagnina. Nazwa stacji Ciampino nie oznacza, że wysiadasz bezpośrednio przy bramce lotniczej. Wariant autobus plus pociąg lub metro wymaga uwzględnienia przesiadki i właściwych biletów.",
    "Porównaj również dostępne autokary z lotniska z połączeniem przesiadkowym. Licz czas do twojego noclegu, a nie tylko do pierwszej stacji w Rzymie.",
   ],sourceIds:[2]},
   {title:"Wieczór, święta i program zwiedzania",paragraphs:[
    "Przy późnym lądowaniu sprawdź ostatni kurs i możliwość zameldowania. Dla świąt i wybranego sezonu zweryfikuj godziny otwarcia atrakcji oraz dostępność rezerwacji przed dopasowaniem lotów. Nie zakładaj, że wcześniejszy przylot automatycznie daje pełny dzień zwiedzania; bagaż i transfer też zajmują czas.",
   ]},
  ],sources:[
   {label:"Turismo Roma — położenie Fiumicino",href:"https://www.turismoroma.it/en/node/53203"},
   {label:"Trenitalia — Leonardo Express",href:"https://www.trenitalia.com/it/regionale/collegamenti-regionale/leonardo-express.html"},
   {label:"Aeroporti di Roma — autobusy z Ciampino",href:"https://www.adr.it/web/aeroporti-di-roma-en/pax-cia-bus"},
  ],routes:[{label:"Loty do Rzymu w katalogu",href:"/destinations/rome"}],related:["trip-budget","connections","milan-airports"],
 },
 "lisbon-airport":{
  title:"Lizbona: dojazd z LIS i powrót do terminala",
  description:"Lotnisko blisko miasta, metro oraz osobny transfer do Terminala 2 przed odlotem.",
  draft:false,reviewedAt:"2026-09-23",category:"destinations",
  paragraphs:["W Lizbonie krótka odległość od lotniska nie oznacza, że można pominąć plan transferu. Sprawdź stację najbliższą noclegowi i terminal odlotu. Powrót może wymagać dodatkowego odcinka, którego nie było w twoim planie po przylocie."],
  sections:[
   {title:"LIS i ostatni odcinek do noclegu",paragraphs:[
    "Visit Lisboa podaje około 7 km między lotniskiem a centrum. Ta orientacyjna odległość nie uwzględnia końcowego dojścia z walizką. Przed rezerwacją pokoju sprawdź trasę pieszą od przystanku, dostęp do budynku i możliwość późnego zameldowania.",
   ],sourceIds:[0]},
   {title:"Metro i dalsza podróż przez Oriente",paragraphs:[
    "Lotnisko wskazuje połączenie metrem i możliwość dojazdu do stacji kolejowej Oriente. Jeżeli po lądowaniu jedziesz dalej pociągiem, sprawdź dokładną stację odjazdu i zapas między lądowaniem a rezerwacją kolejową. Dla noclegu w mieście dobierz przesiadkę do adresu, zamiast zakładać, że każdy hotel leży przy linii lotniskowej.",
   ],sourceIds:[1]},
   {title:"Terminal 2 to dodatkowy etap przed odlotem",paragraphs:[
    "ANA opisuje Terminal 2 jako terminal odlotowy. Z Terminala 1 kursuje do niego bezpłatny autobus. Sprawdź terminal na bilecie i dolicz oczekiwanie oraz transfer; dojazd transportem publicznym do lotniska nie kończy jeszcze drogi do odprawy w T2.",
    "Operator podaje także nocną przerwę w działaniu T2 i godziny kursowania shuttle. Przed bardzo wczesnym lotem sprawdź je ponownie; nie traktuj terminala jako całodobowego noclegu.",
   ],sourceIds:[2]},
   {title:"Plan na wieczór i termin pobytu",paragraphs:[
    "Dla późnego przylotu sprawdź ostatni transport do swojego noclegu i koszt alternatywy. Przy wyjeździe w święta lub na wydarzenie porównaj dostępność pokoi i dojazdu przed wyborem biletu. Letni lub zimowy termin sam w sobie nie gwarantuje ani ceny, ani godzin kursowania; przejrzyj rozkład na konkretną datę.",
   ]},
  ],sources:[
   {label:"Visit Lisboa — położenie lotniska",href:"https://www.visitlisboa.com/en/traveller-information"},
   {label:"Lisbon Airport — transport publiczny",href:"https://www.lisbonairport.pt/en/lis/access-parking/getting-to-and-from-the-airport/public-transportation"},
   {label:"Lisbon Airport — Terminal 2 i shuttle",href:"https://www.lisbonairport.pt/en/lis/access-parking/getting-to-and-from-the-airport/terminal-2"},
  ],routes:[{label:"Loty do Lizbony w katalogu",href:"/destinations/lisbon"}],related:["trip-budget","baggage","price-freshness"],
 },
 "athens-airport":{
  title:"Ateny: z ATH do centrum czy do portu",
  description:"Metro, nocny autobus i dojazd do Pireusu — osobne plany dla zwiedzania Aten i dalszego rejsu.",
  draft:false,reviewedAt:"2026-09-23",category:"destinations",
  paragraphs:["Przy przylocie do Aten ustal najpierw cel pierwszego przejazdu: nocleg w mieście czy port. Nie rezerwuj dalszego promu tak, jakby odbiór walizki i transfer nie zabierały czasu. Bilet lotniczy i rejs wymagają oddzielnego sprawdzenia warunków."],
  sections:[
   {title:"Lotnisko i aktualne ograniczenia dojazdu",paragraphs:[
    "Oficjalny przewodnik Aten podaje odległość ATH około 33 km na południowy wschód od miasta. Publikuje też informacje o wieczornych pracach na linii metra 3. Dlatego sam schemat sieci nie wystarcza: sprawdź komunikaty na swój dzień i pełną trasę do noclegu.",
   ],sourceIds:[0]},
   {title:"Metro lub autobus do centrum",paragraphs:[
    "Lotnisko wskazuje metro 3 łączące ATH z centrum i Pireusem oraz autobus X95 do Syntagmy. OASA podaje całodobową obsługę linii Airport Express. Bilet, przystanek i rozkład dobierz do wybranego środka transportu; nie zakładaj identycznej taryfy dla metra i autobusu.",
   ],sourceIds:[1,2]},
   {title:"Pireus, Rafina i Lavrio to różne cele",paragraphs:[
    "AIA wymienia do Pireusu metro, kolej podmiejską i X96. Dla Rafiny wskazuje autobus regionalny, a dla Lavrio przejazd przez Markopoulo z przesiadką. Najpierw odczytaj port na bilecie promowym, a dopiero później wybierz trasę. Dojazd do Pireusu nie rozwiązuje transferu do pozostałych portów.",
    "Dolicz także drogę od końcowego przystanku do wskazanego miejsca wejścia na statek. Sprawdź termin zamknięcia odprawy promowej i wariant po opóźnionym locie.",
   ],sourceIds:[1]},
   {title:"Sezon i nocleg między etapami",paragraphs:[
    "Jeżeli planujesz rejs sezonowy, potwierdź jego datę, godzinę i port u operatora przed zakupem lotu. Przy napiętym połączeniu rozważ w kalkulacji oddzielny nocleg, zamiast ukrywać ryzyko w zbyt krótkim transferze. Dla pobytu w Atenach zacznij plan dnia od realnej godziny dotarcia do hotelu, nie godziny lądowania.",
   ]},
  ],sources:[
   {label:"This is Athens — położenie ATH i komunikaty dojazdu",href:"https://accessible.thisisathens.org/getting-around/airport-transportation-metro-bus-taxi"},
   {label:"Athens International Airport — transport i porty",href:"https://www.aia.gr/en/traveller/transportation-airport/public-transportation-airport"},
   {label:"OASA — całodobowe autobusy Airport Express",href:"https://www.oasa.gr/en/visit-athens/airport-express-bus-lines/"},
  ],routes:[{label:"Loty do Aten w katalogu",href:"/destinations/athens"}],related:["connections","trip-budget","one-way-round-trip"],
 },
 "paris-airports":{
  title:"Paryż: CDG, Orly i Beauvais w jednym porównaniu",
  description:"RER B, metro 14 i odległe Beauvais — dolicz właściwy transfer do ceny lotu.",
  draft:false,reviewedAt:"2026-09-23",category:"destinations",
  paragraphs:["Nazwa Paryż nie określa jednego lotniska ani jednej taryfy dojazdu. Porównując bilety, rozdziel Charles de Gaulle (CDG), Orly (ORY) i Beauvais (BVA). Zapisz też terminal i miejsce przyjazdu transportu do miasta."],
  sections:[
   {title:"Trzy porty, różne odległości",paragraphs:[
    "Paris je t’aime podaje orientacyjnie około 25 km dla CDG, 14 km dla Orly i 85 km dla Beauvais. Wymienia również Le Bourget, obsługujące głównie lotnictwo biznesowe. W typowym porównaniu biletów pasażerskich skup się na kodzie lotniska faktycznie wskazanym w ofercie.",
    "Te liczby nie są czasem dojazdu. Przy BVA policz dłuższy przejazd i dalszą drogę od przystanku autokaru do noclegu, zanim porównasz oszczędność na samym locie.",
   ],sourceIds:[0]},
   {title:"CDG i Orly: sprawdź bilet lotniskowy",paragraphs:[
    "Île-de-France Mobilités wskazuje RER B dla CDG oraz metro 14 lub Orlyval dla Orly. Produkt Paris Region <> Airports jest przeznaczony na takie przejazdy. Sprawdź ważność posiadanego biletu lub abonamentu; nie zakładaj, że zwykły bilet miejski obejmuje stację lotniskową.",
   ],sourceIds:[1]},
   {title:"Beauvais wymaga osobnego planu",paragraphs:[
    "Przewodnik miasta opisuje połączenia Aérobus oraz wariant kolejowy przez stację Beauvais z dodatkowym odcinkiem autobusowym. Przed rezerwacją sprawdź aktualny punkt przyjazdu shuttle w Paryżu, warunki zakupu i kurs dla godziny twojego lotu. Nie przenoś taryfy kolejowej CDG/ORY na BVA.",
   ],sourceIds:[0]},
   {title:"Późny przylot i termin wydarzenia",paragraphs:[
    "Przy wieczornym locie porównaj ostatni transfer z godziną zameldowania. Jeśli wylot i powrót są z różnych portów, zachowaj dwa osobne plany dojazdu. W terminach świąt i wydarzeń sprawdź nocleg, rezerwacje atrakcji i komunikaty o pracach w sieci; sezon nie jest dowodem, że dany wariant będzie tańszy.",
   ]},
  ],sources:[
   {label:"Paris je t’aime — lotniska, odległości i transfery",href:"https://parisjetaime.com/article/venir-a-paris-en-avion-guide-aeroports-acces-transferts-a1961"},
   {label:"Île-de-France Mobilités — Paris Region <> Airports",href:"https://www.iledefrance-mobilites.fr/en/titres-et-tarifs/detail/ticket-paris-region-aeroports"},
  ],routes:[{label:"Loty do Paryża w katalogu",href:"/destinations/paris"}],related:["trip-budget","london-airports","one-way-round-trip"],
 },
 "london-airports":{
  title:"Londyn: sześć lotnisk i różne drogi do miasta",
  description:"Heathrow, Gatwick, Stansted, Luton, City i Southend — wybierz według dojazdu do noclegu.",
  draft:false,reviewedAt:"2026-09-23",category:"destinations",
  paragraphs:["Lot do Londynu porównuj razem z przejazdem do konkretnej dzielnicy. Kod lotniska może zmienić koszt, liczbę przesiadek i godzinę dotarcia do noclegu. Przy dwóch różnych lotniskach w jednej podróży przygotuj osobne plany dojazdu."],
  sections:[
   {title:"Zacznij od sześciu kodów",paragraphs:[
    "Oficjalny przewodnik wymienia Heathrow (LHR), Gatwick (LGW), Stansted (STN), Luton (LTN), London City (LCY) i Southend (SEN). City leży około 9,5 km od centrum, ale bliskość na mapie nie przesądza o najlepszej trasie do każdego hotelu. Sprawdź adres docelowy zamiast ogólnego hasła „centrum”.",
   ],sourceIds:[0]},
   {title:"Transport kolejowy ma różne zakończenia",paragraphs:[
    "Heathrow obsługują Piccadilly line, Elizabeth line i Heathrow Express. Gatwick ma połączenia kolejowe, Stansted — Stansted Express, Luton — kolej wraz z DART, City — DLR, a Southend — pociągi Greater Anglia. W Luton uwzględnij dodatkowy odcinek DART między terminalem a koleją.",
    "Porównaj czas i koszt aż do noclegu, nie tylko do stacji końcowej pociągu lotniskowego. Sprawdź także terminal lotu na Heathrow przed wyborem połączenia.",
   ],sourceIds:[0]},
   {title:"Oyster i płatność kartą nie są jednym biletem na wszystko",paragraphs:[
    "TfL opisuje użycie Visitor Oyster m.in. na połączeniach Heathrow, Gatwick i London City. Nie należy z tego wyciągać wniosku, że każda usługa do każdego lotniska ma taką samą taryfę lub przyjmuje ten sam nośnik. Przed przejazdem sprawdź operatora, ważność biletu i sposób wejścia oraz wyjścia.",
   ],sourceIds:[1]},
   {title:"Weekend, noc i przesiadka między lotniskami",paragraphs:[
    "Dla weekendu lub święta sprawdź prace kolejowe i ostatnie połączenie na swoją datę. Przy podróży między dwoma lotniskami dolicz cały przejazd, kontrolę dokumentów i nową odprawę; to nie transfer wewnątrz terminala. Wymagania wjazdowe sprawdź osobno dla własnych dokumentów. Wybrany sezon nie gwarantuje ani niskiej ceny, ani dojazdu o każdej porze.",
   ]},
  ],sources:[
   {label:"Visit London — sześć lotnisk i połączenia",href:"https://www.visitlondon.com/traveller-information/travel-to-london/airport"},
   {label:"Transport for London — dojazdy z lotnisk i Visitor Oyster",href:"https://visitorshop.tfl.gov.uk/en/london-airport-transfers"},
  ],routes:[{label:"Loty do Londynu w katalogu",href:"/destinations/london"}],related:["connections","trip-budget","booking-with-agents"],
 },
 "milan-airports":{
  title:"Mediolan: Linate, Malpensa czy Bergamo",
  description:"Metro z LIN, pociąg z MXP i shuttle z BGY — jak doliczyć dojazd do porównania lotów.",
  draft:false,reviewedAt:"2026-09-23",category:"destinations",
  paragraphs:["Trzy lotniska używane przy podróży do Mediolanu nie są zamienne pod względem dojazdu. Wybierz adres noclegu lub miejsce spotkania, a potem porównaj każdą trasę od terminala. Przy krótkim pobycie różnica w czasie może być równie ważna jak cena biletu."],
  sections:[
   {title:"Odległości: LIN, MXP i BGY",paragraphs:[
    "YesMilano podaje około 7 km od centrum dla Linate (LIN), 45 km dla Malpensy (MXP) i 50 km dla Bergamo Orio al Serio (BGY). To przybliżenia dla miasta, nie gwarantowana długość przejazdu do hotelu. Jeżeli jedziesz do Bergamo, nie planuj automatycznie transferu przez Mediolan.",
   ],sourceIds:[0]},
   {title:"Linate: M4 i dalsza przesiadka",paragraphs:[
    "Linate jest połączone z miastem linią metra M4. ATM opisuje jej trasę między lotniskiem a San Cristoforo, w tym San Babila. Dobierz przesiadkę do miejsca docelowego; sama informacja „lotnisko ma metro” nie oznacza przejazdu bez zmiany do każdego dworca.",
   ],sourceIds:[1]},
   {title:"Malpensa i Bergamo: sprawdź punkt przyjazdu",paragraphs:[
    "YesMilano wskazuje Malpensa Express i połączenia z Milano Centrale, Cadorna oraz Porta Garibaldi, a dla Bergamo — autokary shuttle. Przed zakupem sprawdź, do której stacji jedzie konkretny kurs i gdzie znajduje się twój nocleg. Dla MXP dopasuj też stację terminalową do lotu.",
    "Nie dodawaj biletu metra do oferty shuttle ani odwrotnie bez sprawdzenia warunków. Policz każdy potrzebny etap w obie strony dla całej grupy.",
   ],sourceIds:[0]},
   {title:"Targi, weekend i późny powrót",paragraphs:[
    "Jeśli podróżujesz na targi lub wydarzenie, sprawdź jego dokładną lokalizację i nocleg przed wyborem lotniska. Dla weekendu i terminu świątecznego sprawdź rozkład oraz ostatni kurs. Przy późnym przylocie dopisz do budżetu realną alternatywę dojazdu; nie zakładaj, że niższa cena lotu oznacza niższy koszt całego pobytu.",
   ]},
  ],sources:[
   {label:"YesMilano — trzy lotniska i odległości",href:"https://www.yesmilano.it/en/traveller-information/how-get-milano"},
   {label:"ATM — linia M4 San Cristoforo–Linate",href:"https://www.atm.it/en/ViaggiaConNoi/InfoTraffico/Pages/M4passengerserviceinformation2.aspx?c=print"},
  ],routes:[{label:"Loty do Mediolanu w katalogu",href:"/destinations/milan"}],related:["rome-airports","trip-budget","baggage"],
 },
 "budapest-airport":{
  title:"Budapeszt: 100E czy 200E z lotniska BUD",
  description:"Bezpośredni autobus do centrum i wariant z przesiadką — różnice w biletach i nocnym dojeździe.",
  draft:false,reviewedAt:"2026-09-23",category:"destinations",
  paragraphs:["Dojazd z BUD warto wybrać przed lądowaniem, bo linie 100E i 200E mają różne zadania i zasady biletowe. Porównaj przejazd do adresu noclegu. Taniej wyglądający pierwszy odcinek może wymagać dodatkowego biletu i przesiadki."],
  sections:[
   {title:"100E do centrum",paragraphs:[
    "BKK opisuje 100E Airport Express jako bezpośrednie połączenie z Deák Ferenc tér przez Kálvin tér, działające przez całą dobę. Podawane około 40 minut dotyczy przejazdu do centrum, nie wyjścia z samolotu ani dojścia do hotelu. Sprawdź aktualny przystanek i odstęp między kursami na porę lądowania.",
   ],sourceIds:[0]},
   {title:"200E i dalsza droga",paragraphs:[
    "BKK wskazuje również całodobową linię 200E z normalnymi zasadami biletów i abonamentów. Nie jest ona zamiennikiem 100E w sensie bezpośredniego dowozu do tego samego punktu centrum. Zaplanuj dalszą przesiadkę w aktualnym planerze, szczególnie po zakończeniu kursowania metra.",
   ],sourceIds:[1]},
   {title:"Nie pomyl biletów lotniskowych",paragraphs:[
    "Zwykły Airport shuttle bus single ticket jest przeznaczony na pojedynczy przejazd 100E bez przesiadki i nie daje prawa do dalszych linii. BKK opisuje też osobną dopłatę dla posiadaczy wybranych abonamentów. Sprawdź warunki swojego produktu; nie zakładaj, że każdy bilet opisany jako lotniskowy działa w 100E i 200E.",
   ],sourceIds:[2]},
   {title:"Noc, termin pobytu i całkowity koszt",paragraphs:[
    "Całodobowy autobus nie oznacza, że każdy dalszy transport do noclegu kursuje z tą samą częstotliwością. Dla nocnego przylotu sprawdź cały przejazd w BudapestGO i godzinę zameldowania. Przy terminie wydarzenia lub święta sprawdź komunikaty oraz nocleg równocześnie z lotem; nie zakładamy sezonowych oszczędności bez danych.",
    "Koszty podawane w forintach zapisz oddzielnie od ceny lotu w PLN, zanim zastosujesz jawny kurs przeliczenia. HopTrip nie dolicza automatycznie transferu ani wymiany walut do ceny widocznej w katalogu.",
   ]},
  ],sources:[
   {label:"BKK — 100E Airport Express",href:"https://bkk.hu/en/travel-information/airport-express/"},
   {label:"BKK — całodobowe połączenia 100E i 200E",href:"https://bkk.hu/en/visiting-budapest/247-connection-between-the-airport-and-the-city-centre/"},
   {label:"BKK — ważność biletu Airport shuttle bus",href:"https://bkk.hu/en/tickets-and-passes/prices/airport-shuttle-bus-single-ticket/"},
  ],routes:[{label:"Loty do Budapesztu w katalogu",href:"/destinations/budapest"}],related:["trip-budget","price-comparison","one-way-round-trip"],
 },
};
