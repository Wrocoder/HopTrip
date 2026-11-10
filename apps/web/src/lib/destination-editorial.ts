import type {Locale} from './i18n/config.ts';

type Passage={source:string;publisher:string;text:Record<Locale,string>};
type Profile={reviewed:string;logistics:Passage;season:Passage};
// Editorial city context only: never a dated transfer estimate for an offer.
export const destinationEditorial:Record<string,Profile>={
 berlin:{reviewed:'2026-11-09',logistics:{source:'https://ber.berlin-airport.de/en/orientation/getting-here/public-transport.html',publisher:'BER',text:{
  pl:'Na BER stacja kolejowa znajduje się pod Terminalem 1, na poziomie U2. Do miasta kursują FEX, pociągi regionalne i autobusy. Sprawdź połączenie na godzinę lądowania i adres noclegu.',
  en:'At BER, the railway station is below Terminal 1 on level U2. FEX, regional trains and buses serve the city. Check connections for your landing time and accommodation address.',
  ru:'На BER железнодорожная станция находится под терминалом 1, уровень U2. В город идут FEX, региональные поезда и автобусы. Проверьте маршрут на время прилёта и адрес жилья.',
  uk:'На BER залізнична станція розташована під терміналом 1, рівень U2. До міста курсують FEX, регіональні поїзди й автобуси. Перевірте маршрут на час прильоту та адресу житла.'}},
 season:{source:'https://www.visitberlin.de/en/time-zone-time-visit-and-weather-berlin',publisher:'visitBerlin',text:{
  pl:'Od maja do września dłuższe dni sprzyjają spacerom po Berlinie. Zimą zaplanuj część pobytu w muzeach; przed wyborem konkretnego muzeum sprawdź godziny i rezerwację wejścia.',
  en:'From May to September, longer days suit walks around Berlin. In winter, plan some museum time; check opening hours and admission reservations for the museum you choose.',
  ru:'С мая по сентябрь длинные дни подходят для прогулок по Берлину. Зимой запланируйте посещение музеев; часы работы и необходимость бронирования входа проверьте у выбранного музея.',
  uk:'З травня до вересня довгі дні підходять для прогулянок Берліном. Узимку заплануйте відвідування музеїв; години роботи й потребу бронювання входу перевірте в обраного музею.'}}},
 aalesund:{reviewed:'2026-11-09',logistics:{source:'https://www.avinor.no/en/airport/alesund/info/public-transportation/',publisher:'Avinor',text:{
  pl:'Z lotniska Ålesund (AES) autobus jedzie do centrum i Moa. Avinor opisuje obsługę większości głównych przylotów i odlotów, nie każdego lotu. Sprawdź swój kurs w Entur lub Vy.',
  en:'From Ålesund Airport (AES), an airport bus serves the centre and Moa. Avinor describes service for most major arrivals and departures, not every flight. Check your departure in Entur or Vy.',
  ru:'Из аэропорта Олесунна (AES) автобус идёт в центр и Moa. Avinor указывает обслуживание большинства основных прилётов и вылетов, без гарантии для каждого рейса. Проверьте свой автобус в Entur или Vy.',
  uk:'З аеропорту Олесунна (AES) автобус прямує до центру та Moa. Avinor вказує обслуговування більшості основних прильотів і вильотів, без гарантії для кожного рейсу. Перевірте свій автобус в Entur або Vy.'}},
 season:{source:'https://www.fjordnorway.com/en/inspiration/when-is-the-best-time-to-visit-the-fjords',publisher:'Fjord Norway',text:{
  pl:'Planując wycieczkę z Ålesund nad fiordy, uwzględnij zmienną pogodę także latem. Jesienią dni są krótsze. To wskazówki dla regionu fiordów, nie prognoza dla miasta ani potwierdzenie rejsu.',
  en:'For a fjord excursion from Ålesund, allow for changeable weather even in summer. Autumn days are shorter. This is regional fjord guidance, not a city forecast or a confirmed cruise.',
  ru:'Планируя поездку из Олесунна к фьордам, учитывайте переменчивую погоду даже летом. Осенью дни короче. Это сведения о регионе фьордов, не прогноз для города и не подтверждение круиза.',
  uk:'Плануючи поїздку з Олесунна до фіордів, ураховуйте мінливу погоду навіть улітку. Восени дні коротші. Це відомості про регіон фіордів, не прогноз для міста й не підтвердження круїзу.'}}},
};
export const editorialCopy={
 pl:{transport:'Dojazd i ograniczenia',source:'Źródło',reviewed:'Sprawdzono'},
 en:{transport:'Transport and limitations',source:'Source',reviewed:'Reviewed'},
 ru:{transport:'Транспорт и ограничения',source:'Источник',reviewed:'Проверено'},
 uk:{transport:'Транспорт і обмеження',source:'Джерело',reviewed:'Перевірено'},
};
