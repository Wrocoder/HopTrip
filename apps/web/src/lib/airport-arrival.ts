import type {Locale} from './i18n/config.ts';

export type ArrivalSlug='malaga-airport'|'lisbon-airport';
export const arrivalSlugs:readonly ArrivalSlug[]=['malaga-airport','lisbon-airport'];
export function hasArrivalGuide(slug:string):slug is ArrivalSlug{return arrivalSlugs.includes(slug as ArrivalSlug);}
type Copy={title:string;answer:string;ticket:string;detail:string;rows:readonly (readonly [string,string,string])[];topics:readonly string[]};
export const arrivalSources={
 'malaga-airport':[
  {label:'Aena · C1',href:'https://www.aena.es/en/malaga-costa-del-sol/getting-there/trains.html'},
  {label:'Renfe · Cercanías Málaga',href:'https://www.renfe.com/es/es/cercanias/cercanias-malaga/tarifas/billetes'},
  {label:'EMT · Express Aeropuerto',href:'https://www.emtmalaga.es/linea-express-aeropuerto'},
 ],
 'lisbon-airport':[
  {label:'Metro Lisboa · contactless',href:'https://www.metrolisboa.pt/en/ride-on-metro-lisboa-with-contactless-payment-card/'},
  {label:'Metro Lisboa · tarifas',href:'https://www.metrolisboa.pt/en/buy/'},
  {label:'Lisbon Airport · Terminal 2',href:'https://www.lisbonairport.pt/en/lis/access-parking/getting-to-and-from-the-airport/terminal-2'},
  {label:'Lisbon Airport · transport',href:'https://www.lisbonairport.pt/en/lis/access-parking/getting-to-and-from-the-airport/public-transportation'},
 ],
} as const;

export const arrivalCopy:Record<ArrivalSlug,Record<Locale,Copy>>={
 'malaga-airport':{
  pl:{title:'Jak dojechać z lotniska Malaga do centrum?',answer:'Wybierz C1 w kierunku Málaga Centro Alameda. Aena podaje około 12 minut jazdy do centrum i 8 minut do María Zambrano; dolicz dojście i oczekiwanie. Fuengirola leży w przeciwnym kierunku.',
   ticket:'Renfe: zwykły bilet w jedną stronę dla 1–2 stref kosztuje 1,80 € na osobę; cena zależy od stref. Przy płatności Cronos odbij tę samą kartę na wejściu i wyjściu.',
   detail:'Autobus Express Aeropuerto kosztuje 4 € za przejazd. EMT umożliwia zakup w autobusie gotówką lub kartą VISA/MASTERCARD. Sprawdź rozkład na datę lotu; czas jazdy C1 nie jest całym czasem transferu.',
   rows:[['C1','Taryfa strefowa Renfe','Kierunek Centro Alameda; María Zambrano dla dalszego pociągu.'],['Express Aeropuerto','4 € za przejazd na osobę','Wybierz przystanek najbliższy noclegowi; uwzględnij ruch.'],['Taxi / transfer','Cena za kurs lub wycena dla grupy','Porównaj adres, bagaż i warunki oczekiwania.']],
   topics:['C1 i kierunek jazdy','María Zambrano czy Centro Alameda?','Autobus i dalszy dojazd','Późny przylot i powrót']},
  en:{title:'How do you get from Malaga Airport to the centre?',answer:'Take C1 towards Málaga Centro Alameda. Aena lists about 12 minutes on the train to the centre and 8 to María Zambrano; add walking and waiting. Fuengirola is in the opposite direction.',
   ticket:'Renfe: an ordinary single for 1–2 zones costs €1.80 per person; the fare depends on zones. With Cronos, tap the same bank card at entry and exit.',
   detail:'The Express Aeropuerto bus costs €4 per single journey. EMT accepts cash or VISA/MASTERCARD on board. Check the timetable for your date; C1 running time is not the full transfer time.',
   rows:[['C1','Renfe zone-based fare','Towards Centro Alameda; María Zambrano for onward trains.'],['Express Aeropuerto','€4 per single journey per person','Choose the stop for your accommodation; allow for traffic.'],['Taxi / transfer','Price per ride or group quote','Compare the address, luggage and waiting terms.']],
   topics:['C1 and direction','María Zambrano or Centro Alameda?','Buses and onward travel','Late arrivals and return']},
  ru:{title:'Как добраться из аэропорта Малаги в центр?',answer:'Садитесь на C1 в сторону Málaga Centro Alameda. Aena указывает около 12 минут в поезде до центра и 8 до María Zambrano; добавьте путь до станции и ожидание. Fuengirola — противоположное направление.',
   ticket:'Renfe: обычный билет в одну сторону для 1–2 зон стоит 1,80 € на человека; цена зависит от зон. При оплате Cronos приложите ту же банковскую карту на входе и выходе.',
   detail:'Автобус Express Aeropuerto стоит 4 € за одну поездку. EMT принимает в автобусе наличные или VISA/MASTERCARD. Проверьте расписание на дату рейса: время движения C1 не равно всему времени трансфера.',
   rows:[['C1','Зональный тариф Renfe','В сторону Centro Alameda; María Zambrano для дальнейшего поезда.'],['Express Aeropuerto','4 € за поездку на человека','Выберите остановку у жилья; учитывайте пробки.'],['Такси / трансфер','Цена за машину или расчёт на группу','Сравните адрес, багаж и условия ожидания.']],
   topics:['C1 и направление','María Zambrano или Centro Alameda?','Автобус и дальнейшая дорога','Поздний прилёт и возвращение']},
  uk:{title:'Як дістатися з аеропорту Малаги до центру?',answer:'Сідайте на C1 у напрямку Málaga Centro Alameda. Aena вказує близько 12 хвилин у поїзді до центру й 8 до María Zambrano; додайте шлях до станції та очікування. Fuengirola — протилежний напрямок.',
   ticket:'Renfe: звичайний квиток в один бік для 1–2 зон коштує 1,80 € на людину; ціна залежить від зон. За оплати Cronos прикладіть ту саму банківську картку на вході й виході.',
   detail:'Автобус Express Aeropuerto коштує 4 € за одну поїздку. EMT приймає в автобусі готівку або VISA/MASTERCARD. Перевірте розклад на дату рейсу: час руху C1 не дорівнює всьому часу трансферу.',
   rows:[['C1','Зональний тариф Renfe','У напрямку Centro Alameda; María Zambrano для подальшого поїзда.'],['Express Aeropuerto','4 € за поїздку на людину','Оберіть зупинку біля житла; врахуйте затори.'],['Таксі / трансфер','Ціна за машину або розрахунок на групу','Порівняйте адресу, багаж і умови очікування.']],
   topics:['C1 і напрямок','María Zambrano чи Centro Alameda?','Автобус і подальша дорога','Пізній приліт і повернення']},
 },
 'lisbon-airport':{
  pl:{title:'Jak dojechać z lotniska Lizbona do centrum?',answer:'Z lotniska odjedziesz metrem ze stacji Aeroporto. Sprawdź przesiadkę i dojście do noclegu. Przed odlotem z T2 zaplanuj dodatkowo bezpłatny shuttle z T1.',
   ticket:'Metro contactless: 1,92 € za podróż na osobę. Każdy pasażer potrzebuje własnej obsługiwanej karty lub urządzenia; na wejściu i wyjściu użyj tego samego nośnika. Inne bilety mają osobne taryfy.',
   detail:'Shuttle T1–T2 jest bezpłatny; ANA podaje około 3 minut samej jazdy. T2 jest zamknięty 00:30–03:30. Dolicz oczekiwanie, dojście i odprawę; przed podróżą sprawdź aktualne godziny.',
   rows:[['Metro','1,92 € przy płatności contactless','Przesiadka zależy od celu; osobna karta lub urządzenie na pasażera.'],['Taxi / TVDE','Cena za przejazd lub wycena w aplikacji','Sprawdź miejsce odbioru i całkowitą kwotę.'],['Shuttle T1–T2','Bezpłatny','Transfer między terminalami, nie autobus do miasta.']],
   topics:['Lotnisko i nocleg','Metro i Oriente','Terminal 2 i shuttle','Późny przylot i powrót']},
  en:{title:'How do you get from Lisbon Airport to the centre?',answer:'Take the Metro from Aeroporto station. Check the interchange and walk to your accommodation. For a T2 departure, allow for the free shuttle from T1.',
   ticket:'Metro contactless: €1.92 per journey per person. Each passenger needs their own supported card or device; use the same one at entry and exit. Other tickets have separate fares.',
   detail:'The T1–T2 shuttle is free; ANA lists about 3 minutes of driving. T2 closes 00:30–03:30. Add waiting, walking and check-in; verify current hours before travelling.',
   rows:[['Metro','€1.92 with contactless payment','Change according to your destination; one card or device per passenger.'],['Taxi / TVDE','Price per ride or an app quote','Check the pickup point and total cost.'],['T1–T2 shuttle','Free','Between terminals, not a bus to the city.']],
   topics:['Airport and accommodation','Metro and Oriente','Terminal 2 and shuttle','Late arrivals and return']},
  ru:{title:'Как добраться из аэропорта Лиссабона в центр?',answer:'Воспользуйтесь метро со станции Aeroporto. Проверьте пересадку и путь пешком до жилья. При вылете из T2 дополнительно заложите бесплатный автобус от T1.',
   ticket:'Метро contactless: 1,92 € за поездку на человека. Каждому нужна своя поддерживаемая карта или устройство; на входе и выходе используйте один и тот же носитель. Для других билетов действуют отдельные тарифы.',
   detail:'Автобус T1–T2 бесплатный; ANA указывает около 3 минут движения. T2 закрыт с 00:30 до 03:30. Добавьте ожидание, путь пешком и регистрацию; перед поездкой уточните актуальные часы.',
   rows:[['Метро','1,92 € при оплате contactless','Пересадка зависит от адреса; отдельная карта или устройство на пассажира.'],['Такси / TVDE','Цена за машину или расчёт в приложении','Уточните место встречи и итоговую сумму.'],['Автобус T1–T2','Бесплатно','Между терминалами, не маршрут в город.']],
   topics:['Аэропорт и жильё','Метро и Oriente','Терминал 2 и автобус','Поздний прилёт и возвращение']},
  uk:{title:'Як дістатися з аеропорту Лісабона до центру?',answer:'Скористайтеся метро зі станції Aeroporto. Перевірте пересадку й піший шлях до житла. За вильоту з T2 додатково закладіть безплатний автобус від T1.',
   ticket:'Метро contactless: 1,92 € за поїздку на людину. Кожному потрібна своя підтримувана картка або пристрій; на вході й виході використовуйте той самий носій. Для інших квитків діють окремі тарифи.',
   detail:'Автобус T1–T2 безплатний; ANA вказує близько 3 хвилин руху. T2 зачинений з 00:30 до 03:30. Додайте очікування, піший шлях і реєстрацію; перед поїздкою уточніть актуальні години.',
   rows:[['Метро','1,92 € за оплати contactless','Пересадка залежить від адреси; окрема картка або пристрій на пасажира.'],['Таксі / TVDE','Ціна за машину або розрахунок у застосунку','Уточніть місце зустрічі й підсумкову суму.'],['Автобус T1–T2','Безплатно','Між терміналами, не маршрут до міста.']],
   topics:['Аеропорт і житло','Метро й Oriente','Термінал 2 і автобус','Пізній приліт і повернення']},
 },
};

export const arrivalUi={
 pl:{checked:'Informacje sprawdzone',sources:'Oficjalne źródła i aktualizacje',contents:'W tym poradniku',compare:'Porównaj dojazd',transport:'Transport',cost:'Koszt',route:'Trasa i warunki',details:'Bilet, godziny i powrót',plan:'Zaplanuj krótki pobyt',flights:'Sprawdź loty do miasta'},
 en:{checked:'Information checked',sources:'Official sources and updates',contents:'In this guide',compare:'Compare transport',transport:'Transport',cost:'Cost',route:'Route and conditions',details:'Tickets, hours and return',plan:'Plan a short stay',flights:'Check flights to the city'},
 ru:{checked:'Сведения проверены',sources:'Официальные источники и обновления',contents:'В этом путеводителе',compare:'Сравните транспорт',transport:'Транспорт',cost:'Стоимость',route:'Маршрут и условия',details:'Билеты, часы работы и возвращение',plan:'Спланировать короткую поездку',flights:'Посмотреть перелёты в город'},
 uk:{checked:'Відомості перевірено',sources:'Офіційні джерела й оновлення',contents:'У цьому путівнику',compare:'Порівняйте транспорт',transport:'Транспорт',cost:'Вартість',route:'Маршрут і умови',details:'Квитки, години роботи й повернення',plan:'Спланувати коротку поїздку',flights:'Переглянути перельоти до міста'},
} satisfies Record<Locale,Record<string,string>>;
