import type {Locale} from './config';

export const destinationCopy={
 pl:{planning:'Termin i plan pobytu',country:'Kraj w katalogu',codes:'Kody kierunku (IATA)',airportNote:'Sprawdź port przylotu na bilecie i dojazd do noclegu. Nazwa miasta nie zastępuje kodu lotniska.',season:'Pora roku i konkretne daty',
  seasonNote:'Sprawdź prognozę przed wyjazdem oraz godziny otwarcia i wyjątki świąteczne dla swoich dat. Zostaw wariant zwiedzania pod dachem; kalendarz sezonowy nie jest prognozą pogody.',source:'Oficjalne informacje o warunkach sezonowych',
  events:'Wydarzenia i atrakcje',eventsNote:'Przed zakupem biletu na wydarzenie ustal datę, miejsce i dojazd. W szczegółach wybranego lotu sprawdzisz wydarzenia dla dat pobytu, jeśli dany kierunek jest obsługiwany.',eventsGuide:'Jak zaplanować wyjazd na koncert',
  attractions:'Zobacz atrakcje w przewodniku po tym mieście',flights:'Obserwacje lotów do tego miasta',search:'Ustaw daty i budżet dla tego kierunku',empty:'Nie mamy teraz aktualnych obserwacji lotów do tego miasta. Nie oznacza to braku połączeń u przewoźników. Poradniki i pomysły na pobyt pozostają dostępne.',other:'Wybierz inny kierunek'},
 en:{planning:'Dates and stay planning',country:'Country in the catalog',codes:'Destination codes (IATA)',airportNote:'Check the arrival airport on your ticket and the transfer to your accommodation. A city name does not replace an airport code.',season:'Season and travel dates',
  seasonNote:'Check the forecast before departure and opening hours and holiday exceptions for your dates. Keep an indoor sightseeing option; a seasonal calendar is not a weather forecast.',source:'Official seasonal information',
  events:'Events and attractions',eventsNote:'Before buying an event ticket, confirm the date, venue and transport. Selected flight details can show events for your stay dates where the destination is supported.',eventsGuide:'Planning a concert trip',
  attractions:'See attractions in this city’s guide',flights:'Flight observations for this city',search:'Choose dates and a budget for this destination',empty:'We have no current flight observations for this city. This does not mean airlines have no services. Guides and stay ideas remain available.',other:'Choose another destination'},
 ru:{planning:'Даты и план пребывания',country:'Страна в каталоге',codes:'Коды направления (IATA)',airportNote:'Проверьте аэропорт прилёта в билете и дорогу до жилья. Название города не заменяет код аэропорта.',season:'Сезон и даты поездки',
  seasonNote:'Перед поездкой проверьте прогноз, часы работы и праздничные исключения для своих дат. Подготовьте вариант прогулки с посещением помещений; сезонный календарь не является прогнозом погоды.',source:'Официальная информация о сезонных условиях',
  events:'События и достопримечательности',eventsNote:'До покупки билета на событие уточните дату, площадку и дорогу. В деталях выбранного перелёта можно посмотреть события на даты пребывания, если направление поддерживается.',eventsGuide:'Как спланировать поездку на концерт',
  attractions:'Посмотреть достопримечательности в путеводителе по этому городу',flights:'Наблюдения перелётов в этот город',search:'Выбрать даты и бюджет для этого направления',empty:'Сейчас у нас нет актуальных наблюдений перелётов в этот город. Это не означает отсутствия рейсов у перевозчиков. Руководства и идеи для пребывания остаются доступны.',other:'Выбрать другое направление'},
 uk:{planning:'Дати та план перебування',country:'Країна в каталозі',codes:'Коди напрямку (IATA)',airportNote:'Перевірте аеропорт прильоту у квитку та дорогу до житла. Назва міста не замінює код аеропорту.',season:'Сезон і дати подорожі',
  seasonNote:'Перед подорожжю перевірте прогноз, години роботи та святкові винятки для своїх дат. Підготуйте варіант огляду міста з відвідуванням приміщень; сезонний календар не є прогнозом погоди.',source:'Офіційна інформація про сезонні умови',
  events:'Події та пам’ятки',eventsNote:'До купівлі квитка на подію уточніть дату, майданчик і дорогу. У деталях вибраного перельоту можна переглянути події на дати перебування, якщо напрямок підтримується.',eventsGuide:'Як спланувати подорож на концерт',
  attractions:'Переглянути пам’ятки в путівнику цим містом',flights:'Спостереження перельотів у це місто',search:'Вибрати дати та бюджет для цього напрямку',empty:'Зараз у нас немає актуальних спостережень перельотів у це місто. Це не означає відсутності рейсів у перевізників. Посібники та ідеї для перебування залишаються доступними.',other:'Вибрати інший напрямок'},
} satisfies Record<Locale,Record<string,string>>;

// Qualitative planning context, not a forecast or dated event inventory.
export const destinationSeasons:{[slug:string]:{href:string;text:Record<Locale,string>}}={
 milan:{href:'https://www2.comune.milano.it/en/web/milano-cambia-aria/-/caldo-estremo-e-notti-tropicali-a-milano',text:{
  pl:'Latem w Mediolanie uwzględnij upał przy planowaniu spacerów. Wariant z muzeum i przerwami pozwala skrócić pobyt na zewnątrz; godziny wejścia sprawdź osobno.',
  en:'Allow for summer heat when planning walks in Milan. A museum visit and breaks can reduce outdoor time; check admission times separately.',
  ru:'Планируя летние прогулки по Милану, учитывайте жару. Посещение музея и перерывы помогут сократить время на улице; часы входа проверяйте отдельно.',
  uk:'Плануючи літні прогулянки Міланом, враховуйте спеку. Відвідування музею та перерви допоможуть скоротити час надворі; години входу перевіряйте окремо.'}},
 barcelona:{href:'https://bid.barcelonaturisme.com/wv3/en/page/5125/climate-in-barcelona.html',text:{
  pl:'Barcelona ma gorące lato, a wiosną i jesienią częściej pada. Dostosuj długość spacerów i zostaw wariant z muzeum; klimat nie gwarantuje pogody w dniu podróży.',
  en:'Barcelona has hot summers and wetter spring and autumn seasons. Adjust walk lengths and keep a museum option; climate does not guarantee weather on your travel day.',
  ru:'В Барселоне жаркое лето, а весна и осень более дождливые. Планируйте длительность прогулок и вариант с музеем; климат не гарантирует погоду в день поездки.',
  uk:'У Барселоні спекотне літо, а весна й осінь більш дощові. Плануйте тривалість прогулянок і варіант із музеєм; клімат не гарантує погоду в день подорожі.'}},
};
