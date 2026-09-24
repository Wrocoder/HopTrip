import type {InfoContent} from "./info-types";

export const airportGuides:Record<string,InfoContent> = {
 "wro-airport":{
  title:"Wylot z Wrocławia: dojazd na WRO",
  description:"Autobusy 106, 129 i nocny 206, dojście do terminala i plan powrotu po późnym lądowaniu.",
  draft:false,reviewedAt:"2026-09-23",category:"airports",
  paragraphs:["Przy wylocie z WRO zaplanuj dojazd od konkretnego adresu, a nie tylko od centrum Wrocławia. Inny wariant będzie odpowiedni po przyjeździe pociągiem, inny z północnej części miasta. Sprawdź też powrót: pora lądowania może zmienić dostępne połączenia."],
  sections:[
   {title:"Z dworca i z innych dzielnic",paragraphs:[
    "Lotnisko leży około 10 km od centrum. Jego strona wskazuje dzienną linię 106 w rejon Dworca Głównego, linię 129 w kierunku Poświętnego i nocną 206. Podawany dla 106 przejazd całej trasy około 40–50 minut zależy od ruchu; nie jest czasem od drzwi domu do odprawy.",
    "Jeżeli przyjeżdżasz koleją, dodaj wyjście z peronu i dojście do właściwego przystanku. Podróżny jadący z zachodnich dzielnic nie powinien automatycznie wracać na Dworzec Główny: sprawdź trasę 129 względem swojego adresu.",
   ],sourceIds:[0]},
   {title:"Sprawdź kierunek, nie tylko numer",paragraphs:[
    "Miejski rozkład dla przystanku Port Lotniczy pokazuje kierunek, numer słupka i datę obowiązywania. W wykazie odjazdów występują też warianty kursów. Przed wejściem porównaj tablicę pojazdu z celem podróży; sam numer 106 lub 206 nie opisuje całej trasy każdego kursu.",
   ],sourceIds:[1]},
   {title:"Od przystanku do bramki",paragraphs:[
    "Rozpisz kolejno przyjazd pod terminal, nadanie bagażu, kontrolę bezpieczeństwa i dojście do bramki. Godzina startu samolotu nie jest godziną zamknięcia tych etapów. Wymagany zapas i termin odprawy ustal z linią dla swojego lotu; do czasu jazdy dolicz opóźnienie autobusu.",
   ]},
   {title:"Powrót nocą i odbiór samochodem",paragraphs:[
    "Dla późnego przylotu zacznij od rozkładu 206 na właściwą noc, uwzględniając zmianę daty po północy. Do godziny lądowania dodaj odbiór walizki i wyjście z terminala. Jeśli ktoś cię odbiera, ustal punkt spotkania i sprawdź aktualne zasady postoju; cena biletu lotniczego nie obejmuje tego kosztu.",
   ],sourceIds:[0,1]},
  ],sources:[
   {label:"Port Lotniczy Wrocław — dojazd i komunikacja",href:"https://airport.wroclaw.pl/pasazer/odwoze-odbieram/dojazd-do-lotniska/"},
   {label:"Wrocław — rozkład przystanku Port Lotniczy",href:"https://www.wroclaw.pl/komunikacja/przystanek-port-lotniczy-linia-106-kierunek-dworzec-glowny-dworcowa-slupek-17530"},
  ],routes:[{label:"Loty z Wrocławia (WRO)",href:"/from/WRO"}],related:["baggage","trip-budget","poz-airport"],
 },
 "waw-airport":{
  title:"Lotnisko Chopina: dojazd i wylot z WAW",
  description:"Kolej do Warszawy Lotniska Chopina, autobusy i różne poziomy terminala przy przylocie i odlocie.",
  draft:false,reviewedAt:"2026-09-23",category:"airports",
  paragraphs:["WAW to Lotnisko Chopina, a WMI to Warszawa-Modlin. Nie są terminalami jednego portu. Najpierw sprawdź kod na bilecie; wyszukiwanie dojazdu tylko do „lotniska w Warszawie” może skierować cię w niewłaściwe miejsce."],
  sections:[
   {title:"Kolej: wybierz właściwą stację w centrum",paragraphs:[
    "Miasto podaje odległość WAW około 8 km od centrum i podziemną stację Warszawa Lotnisko Chopina przy terminalu. S2 przejeżdża przez Warszawę Śródmieście, a S3 przez Warszawę Centralną. To rozróżnienie ma znaczenie, gdy przesiadasz się z pociągu dalekobieżnego lub umawiasz odbiór.",
    "Sprawdź rozkład na swój dzień, zwłaszcza przy robotach kolejowych. W planie podróży zachowaj pełną nazwę stacji docelowej zamiast samego słowa „Warszawa”.",
   ],sourceIds:[0]},
   {title:"Autobus po przylocie odjeżdża z innego poziomu",paragraphs:[
    "Do wyboru są m.in. dzienna 175 i nocna N32. Według informacji miejskiej autobusy dowożące pasażerów zatrzymują się przy odlotach na górnym poziomie, a do miasta zabierają ich z dolnego poziomu przylotów. Po lądowaniu kieruj się na przystanek odjazdowy, nie za samochodami pod odloty.",
   ],sourceIds:[0]},
   {title:"Bilet kolejowy wymaga sprawdzenia zakresu",paragraphs:[
    "SKM wyjaśnia, że bilet 20-minutowy nie wystarcza na całą podróż między Warszawą Centralną a lotniskiem. Zasady uznawania biletów w SKM i Kolejach Mazowieckich mają wyjątki zależne od linii i odcinka. Dobierz bilet do rzeczywistego połączenia, a nie wyłącznie do wyglądu pociągu.",
   ],sourceIds:[1]},
   {title:"Wczesny wylot albo dalsza podróż",paragraphs:[
    "Porównaj pierwszy dostępny kurs z terminem nadania bagażu. Nocny autobus może być osobnym wariantem, nie prostym przedłużeniem rozkładu kolei. Przy przejeździe między WAW i WMI zaplanuj oddzielny transfer i ponowną odprawę; potraktuj go jako część całego budżetu i czasu podróży.",
   ]},
  ],sources:[
   {label:"Warszawa 19115 — dojazd na Lotnisko Chopina",href:"https://warszawa19115.pl/web/guest/-/dojazd-na-lotnisko?inheritRedirect=true"},
   {label:"SKM Warszawa — bilety i połączenie lotniskowe",href:"https://skm.warszawa.pl/en/faq-2/"},
  ],routes:[{label:"Loty z Lotniska Chopina (WAW)",href:"/from/WAW"}],related:["wmi-airport","connections","baggage"],
 },
 "wmi-airport":{
  title:"Warszawa-Modlin: jak zaplanować wylot z WMI",
  description:"Pociąg do Modlina i autobus do terminala, Bilet Lotniskowy oraz kontrola całego czasu dojazdu.",
  draft:false,reviewedAt:"2026-09-23",category:"airports",
  paragraphs:["Przy porównywaniu WMI z WAW dolicz osobno dojazd. Tańszy lot nie przesądza o niższym koszcie wyjazdu z Warszawy. Modlin wymaga własnego planu transportu, a przy wariancie kolejowym także przesiadki przed terminalem."],
  sections:[
   {title:"Stacja Modlin nie jest terminalem",paragraphs:[
    "Koleje Mazowieckie wskazują brak bezpośredniego połączenia kolejowego z terminalem. Jedziesz do stacji Modlin, a następnie przesiadasz się do autobusu lotniskowego KM. Przystanek przy stacji znajduje się przed budynkiem dworca, a przy lotnisku — przy wejściu oznaczonym jako Przyloty.",
    "W kalkulacji czasu uwzględnij oba odcinki i oczekiwanie między nimi. Wyszukanie tylko pociągu do stacji Modlin daje niepełny plan dojazdu na lot.",
   ],sourceIds:[0]},
   {title:"Sprawdź, co obejmuje kupiony bilet",paragraphs:[
    "Oferta Bilet Lotniskowy KM obejmuje przejazd pociągiem między stacjami Warszawy i Modlinem oraz autobusem do portu. Przy innym bilecie kolejowym przejazd autobusowy trzeba sprawdzić osobno. Aktualna strona KM podaje, że kierowca autobusu nie sprzedaje biletów — zaplanuj zakup wcześniej.",
   ],sourceIds:[0]},
   {title:"Autokar może zmienić liczbę przesiadek",paragraphs:[
    "Lotnisko wymienia również bezpośrednie połączenia autokarowe z Warszawą i kursy do innych miast. Porównaj dokładny przystanek, zasady rezerwacji i czas przyjazdu pod terminal z wariantem kolejowym. Wybór operatora nie powinien opierać się na samym napisie „Warszawa” w wyszukiwarce.",
   ],sourceIds:[1]},
   {title:"Powrót po północy",paragraphs:[
    "Sprawdź ostatni autobus do stacji i dalszy pociąg jako jedną podróż. Po opóźnionym lądowaniu dostępność pierwszego odcinka nie gwarantuje, że zdążysz na drugi. Przygotuj alternatywę dla całej grupy i porównaj jej koszt z ewentualnym noclegiem; nie zakładaj, że terminal zastąpi zarezerwowany pokój.",
   ]},
  ],sources:[
   {label:"Koleje Mazowieckie — Bilet Lotniskowy i przesiadka",href:"https://lotniskowy.mazowieckie.com.pl/pl"},
   {label:"Warszawa-Modlin — opcje dojazdu",href:"https://www.modlinairport.pl/strona/dojazd"},
  ],routes:[{label:"Loty z Warszawy-Modlina (WMI)",href:"/from/WMI"}],related:["waw-airport","trip-budget","connections"],
 },
 "krk-airport":{
  title:"Kraków Airport: pociąg, autobus i wylot z KRK",
  description:"Stacja przy terminalu, SKA1 oraz autobusy aglomeracyjne — jak ułożyć dojazd na konkretny lot.",
  draft:false,reviewedAt:"2026-09-23",category:"airports",
  paragraphs:["Dojazd na KRK warto zaplanować razem z przesiadką z kolei dalekobieżnej lub komunikacji miejskiej. Nie kończ planu na Krakowie Głównym: do terminala pozostaje jeszcze odcinek lotniskowy oraz czas potrzebny na odprawę."],
  sections:[
   {title:"SKA1 i kładka do terminala",paragraphs:[
    "Lotnisko wskazuje linię SKA1 na trasie Wieliczka Rynek-Kopalnia — Kraków Główny — Kraków Airport. Stacja przy lotnisku znajduje się za parkingiem wielopoziomowym i jest połączona z terminalem zadaszoną kładką. Ten odcinek pieszy należy doliczyć do czasu na przyjazd.",
    "Jeśli łączysz dwa pociągi, porównaj perony i margines przesiadki na Krakowie Głównym. Bilet dalekobieżny nie jest sam w sobie potwierdzeniem opłacenia dalszego odcinka SKA1.",
   ],sourceIds:[0]},
   {title:"Autobus: sprawdź strefę i właściwy kurs",paragraphs:[
    "Strona portu wymienia linie 209 i 300 oraz nocną 902 jako połączenia aglomeracyjne. Sprawdź trasę i ważność biletu dla pełnego przejazdu do lotniska; nie przenoś automatycznie zasad biletu używanego tylko w centrum.",
    "Przy zmianach organizacji ruchu kieruj się aktualnym rozkładem operatora podlinkowanym przez lotnisko. Starsze poradniki mogą wskazywać inne numery linii.",
   ],sourceIds:[1]},
   {title:"Bagaż i wejście do terminala",paragraphs:[
    "Zaplanuj drogę od pociągu lub autobusu do stanowiska swojej linii. Bagaż rejestrowany oznacza dodatkowy etap przed kontrolą bezpieczeństwa. Dla dużej walizki lub pomocy w poruszaniu się sprawdź wcześniej dostępność właściwej trasy i wymagania zgłoszenia asysty u przewoźnika.",
   ]},
   {title:"Późny powrót nie musi pasować do kolei",paragraphs:[
    "Porównaj godzinę wyjścia z terminala z ostatnim pociągiem, a następnie z nocną 902. Sprawdź również dalszą drogę od końcowego przystanku do domu. Podróż planuj na właściwy dzień tygodnia: przylot przed północą i wyjście po północy mogą oznaczać dwa różne dni rozkładowe.",
   ],sourceIds:[1]},
  ],sources:[
   {label:"Kraków Airport — dojazd pociągiem",href:"https://krakowairport.pl/en/train-en"},
   {label:"Kraków Airport — autobusy publiczne",href:"https://krakowairport.pl/en/passenger/transport-en/directions/from-to-krakow-airport/public-buses-en"},
  ],routes:[{label:"Loty z Krakowa (KRK)",href:"/from/KRK"}],related:["ktw-airport","baggage","trip-budget"],
 },
 "gdn-airport":{
  title:"Gdańsk Airport: dojazd z Trójmiasta na GDN",
  description:"Kolej przez Wrzeszcz, warianty do Gdyni oraz autobusy dzienne i nocny N3.",
  draft:false,reviewedAt:"2026-09-23",category:"airports",
  paragraphs:["W Trójmieście wybór dojazdu zależy od tego, czy ruszasz z Gdańska, Sopotu, czy Gdyni. Nie traktuj wszystkich połączeń kolejowych jako jednej trasy do centrum. Sprawdź pełną relację do stacji Gdańsk Port Lotniczy."],
  sections:[
   {title:"Wrzeszcz jako punkt przesiadki",paragraphs:[
    "Lotnisko opisuje przejazd z Gdańska Głównego i Śródmieścia z przesiadką we Wrzeszczu. Dla Sopotu i Gdyni możliwe są różne warianty, w tym bezpośrednie połączenia lub przesiadka; do Gdyni istnieje też trasa przez Osową. Wybierz konkretny kurs, nie tylko nazwę końcowego miasta.",
   ],sourceIds:[0]},
   {title:"Od pociągu do terminala",paragraphs:[
    "Stacja kolejowa znajduje się bezpośrednio przed terminalem, a z budynku prowadzi na nią zadaszona kładka. Jeśli odbierasz kogoś po przylocie, ustal spotkanie po odbiorze bagażu, a nie na peronie o planowanej godzinie lądowania.",
    "Przy dojeździe z innego miasta uwzględnij margines na opóźnienie pierwszego pociągu. Krótka trasa piesza na lotnisku nie usuwa ryzyka wcześniejszej przesiadki.",
   ],sourceIds:[0]},
   {title:"Autobusy do różnych części miasta",paragraphs:[
    "Port wskazuje linię 110 do Wrzeszcza, 120 do Łostowic Świętokrzyskiej i 210 przez centrum. Przystanki znajdują się naprzeciwko terminala przy parkingu P1. Te warianty mają różne trasy, dlatego wybór według najbliższego odjazdu może oznaczać dłuższy dalszy dojazd.",
   ],sourceIds:[1]},
   {title:"Nocny N3: sprawdź kierunek całej trasy",paragraphs:[
    "N3 łączy lotnisko z rejonem Gdańska Głównego i Wrzeszcza różnymi odcinkami trasy. Sprawdź kierunek na przystanku i dalsze przesiadki, zamiast zakładać dzienny czas przejazdu. Przy podróży do Sopotu lub Gdyni zweryfikuj również ostatni etap; autobus do Gdańska nie kończy jeszcze twojej podróży.",
   ],sourceIds:[1]},
  ],sources:[
   {label:"Gdańsk Airport — kolej i przesiadki",href:"https://www.airport.gdansk.pl/przed-podroza/dojazd-na-lotnisko/pociag"},
   {label:"Gdańsk Airport — autobusy i N3",href:"https://www.airport.gdansk.pl/przed-podroza/dojazd-na-lotnisko/autobus"},
  ],routes:[{label:"Loty z Gdańska (GDN)",href:"/from/GDN"}],related:["baggage","trip-budget","connections"],
 },
 "ktw-airport":{
  title:"Katowice Airport w Pyrzowicach: dojazd na KTW",
  description:"Autobus AP, połączenia metropolitalne i dojście ze stacji Pyrzowice Lotnisko do terminali.",
  draft:false,reviewedAt:"2026-09-23",category:"airports",
  paragraphs:["Port KTW znajduje się w Pyrzowicach. Przy planowaniu wyjazdu z Katowic, Gliwic lub Częstochowy zacznij od własnego miejsca startu: dojazd przez centrum Katowic nie jest jedyną możliwością. Porównaj trasę autobusu i kolei dla godziny odprawy."],
  sections:[
   {title:"AP i linie z innych miast",paragraphs:[
    "ZTM wskazuje AP na relacji Katowice Sądowa — Pyrzowice Port Lotniczy. Inne połączenia obejmują M19 z rejonu Sosnowca i Będzina, M14 przez Gliwice, Zabrze i Bytom oraz M11 i M116. Pełny przebieg i aktualne przystanki sprawdź przed zakupem biletu.",
    "Jeżeli przyjeżdżasz pociągiem do Katowic, dolicz dojście do miejsca odjazdu AP. Nazwa miasta na bilecie kolejowym nie oznacza, że autobus lotniskowy odjeżdża bezpośrednio z twojego peronu.",
   ],sourceIds:[0]},
   {title:"Kolej kończy się spacerem do terminala",paragraphs:[
    "Według portu stacja Pyrzowice Lotnisko leży około 500 metrów od terminali; prowadzi do nich utwardzony chodnik. Lotnisko publikuje obsługujące stację połączenia kolejowe i odsyła do rozkładów. Uwzględnij drogę pieszą, szczególnie z dużym bagażem i przy deszczu.",
   ],sourceIds:[1]},
   {title:"Ustal właściwy terminal przed przyjazdem",paragraphs:[
    "Na potwierdzeniu i tablicy lotniska sprawdź miejsce odprawy swojego lotu. Osoba odwożąca powinna znać nie tylko nazwę portu, ale też punkt wysadzenia. Przy powrocie umów spotkanie dopiero po wyjściu z odbioru bagażu; terminal odlotu i punkt odbioru nie muszą być tym samym miejscem.",
   ]},
   {title:"Porównanie z Krakowem i późny powrót",paragraphs:[
    "Jeśli wybierasz między KTW i KRK, policz oba przejazdy, parking oraz czas po przylocie. Nie zakładaj, że dzienne połączenie kolejowe będzie dostępne nocą. Sprawdź konkretny kurs i wariant rezerwowy przed rezerwacją lotu; oszczędność na bilecie może zniknąć po dodaniu transportu dla całej grupy.",
   ]},
  ],sources:[
   {label:"ZTM — linie do lotniska w Pyrzowicach",href:"https://www.metropoliaztm.pl/en/s/linie-lotniskowe-2022"},
   {label:"Katowice Airport — stacja i połączenia kolejowe",href:"https://www.katowice-airport.com/en/for-passengers/directions/train"},
  ],routes:[{label:"Loty z Katowic (KTW)",href:"/from/KTW"}],related:["krk-airport","trip-budget","baggage"],
 },
 "poz-airport":{
  title:"Poznań-Ławica: dojazd i powrót z POZ",
  description:"Linie 159, 148 i nocna 222, przystanki przy terminalu oraz plan dojazdu z dworca.",
  draft:false,reviewedAt:"2026-09-23",category:"airports",
  paragraphs:["Dla podróży z POZ rozdziel dwa plany: dojazd przed odprawą i powrót po odebraniu bagażu. W dzień może pasować autobus do centrum, ale wieczorem potrzebny będzie rozkład nocny i sprawdzenie dalszej drogi do domu."],
  sections:[
   {title:"Ławica i połączenie z miastem",paragraphs:[
    "Lotnisko wskazuje autobusy 159, 148 i nocny 222. Przystanki są przy terminalu lub w jego pobliżu; port opisuje odjazd od odlotów i dalszy przystanek przy przylotach w kierunku miasta. Sprawdź nazwę przystanku odpowiednią dla tego, czy odlatujesz, czy właśnie przyleciałeś.",
   ],sourceIds:[0]},
   {title:"Dojazd z dworca to więcej niż czas jazdy",paragraphs:[
    "Port podaje orientacyjny czas do centrum około 20–25 minut i odsyła do rozkładu 159 dla relacji z Dworcem Głównym. Do swojego planu dodaj wyjście z peronu, dojście do autobusu, oczekiwanie i margines na ruch uliczny. Podany czas nie gwarantuje dotarcia przed zamknięciem odprawy.",
   ],sourceIds:[0]},
   {title:"Nocna 222 ma własny rozkład",paragraphs:[
    "ZTM publikuje 222 z datami obowiązywania, kierunkami i listą przystanków. Przy nocnym przylocie użyj rozkładu na faktyczny dzień odjazdu z lotniska, także jeśli jest to już dzień po dacie na bilecie lotniczym. Nie zakładaj, że nocna linia powtarza przebieg dziennej 159.",
   ],sourceIds:[1]},
   {title:"Zakup biletu i wariant awaryjny",paragraphs:[
    "Przed przyjazdem sprawdź aktualne kanały sprzedaży, ważność biletu i sposób kasowania w ZTM. Jeżeli planujesz taxi po ostatnim autobusie, dodaj koszt całego przejazdu do budżetu grupy. Przy odbiorze samochodem ustal miejsce spotkania i zasady postoju; nie umawiaj podjazdu dokładnie na godzinę lądowania.",
    "Porównując POZ z WRO, uwzględnij też dojazd między miastami i ewentualny nocleg przed porannym lotem. Sama cena lotu nie obejmuje żadnej z tych pozycji.",
   ]},
  ],sources:[
   {label:"Poznań-Ławica — dojazd do centrum",href:"https://poznanairport.pl/przed-podroza/dojazd-na-lotnisko/dojazd-do-centrum/"},
   {label:"ZTM Poznań — aktualny rozkład linii 222",href:"https://www.ztm.poznan.pl/rozklad-jazdy/?linia=222"},
  ],routes:[{label:"Loty z Poznania (POZ)",href:"/from/POZ"}],related:["wro-airport","trip-budget","baggage"],
 },
};
