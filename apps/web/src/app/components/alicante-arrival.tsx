import type {Locale} from '../../lib/i18n/config';
import {localizedHref} from '../../lib/i18n/routing';
import styles from './alicante-arrival.module.css';

const copy={
 pl:{ticket:'za zwykły bilet jednorazowy C6 na osobę. Bilet kupisz w autobusie; przygotuj odliczoną gotówkę.',checked:'Cena sprawdzona',source:'Źródło: Alicante City & Beach',
  title:'Jak dojechać z lotniska Alicante do centrum?',answer:'Autobus C6 łączy terminal ALC z centrum Alicante. Do TRAM przesiądziesz się w mieście, m.in. przy Luceros — pociąg ani tramwaj nie odjeżdża bezpośrednio z terminala.',
  timetable:'C6: rozkład, przystanki i komunikaty',fare:'Aktualna cena biletu C6',compare:'Porównaj dojazd',transport:'Transport',cost:'Koszt',route:'Trasa i czas',
  rows:[['Autobus C6','Bilet dla każdej osoby; aktualna taryfa u operatora.','Do centrum, potem dojście lub przesiadka. Czas zależy od przystanku, oczekiwania i ruchu.'],['Taxi','Cena za przejazd; sprawdź taryfę i dopłatę lotniskową.','Pod konkretny adres. Czas zależy od ruchu i położenia noclegu.'],['Transfer zamówiony wcześniej','Wycena dla daty, grupy i bagażu; porównaj cenę całkowitą.','Uzgodnione miejsce odbioru i adres; sprawdź oczekiwanie po opóźnieniu lotu.']],
  taxi:'Oficjalne informacje o taxi',contents:'W tym poradniku',topics:['C6 i przesiadka na TRAM','Czy z lotniska odjeżdża pociąg?','Dojazd do Benidormu','Powrót i wczesny odlot'],weekend:'Zaplanuj weekend w Alicante',flights:'Sprawdź loty do Alicante',
  nightTitle:'Późny przylot i zakup biletu',night:'Otwórz rozkład C6 dla swojej daty i kierunku, także po północy. Sprawdź zakup i płatność u operatora; nie zakładaj, że karta miejska obejmuje linię lotniskową. Powrót zaplanuj od wymaganej godziny odprawy, z zapasem na oczekiwanie i dojazd.'},
 en:{ticket:'per person for a standard C6 single ticket. Buy it on the bus; have the exact cash fare ready.',checked:'Fare checked',source:'Source: Alicante City & Beach',
  title:'How do you get from Alicante Airport to the centre?',answer:'The C6 bus connects the ALC terminal with central Alicante. Change to TRAM in the city, including at Luceros — no train or tram leaves directly from the terminal.',
  timetable:'C6 timetable, stops and service notices',fare:'Current C6 ticket fare',compare:'Compare transport options',transport:'Transport',cost:'Cost',route:'Route and time',
  rows:[['C6 bus','A ticket for each person; check the current operator fare.','To the centre, then walk or change. Allow for the stop, waiting and traffic.'],['Taxi','Price per ride; check the tariff and airport supplement.','To your address. Journey time depends on traffic and location.'],['Prebooked transfer','Quote for your date, group and luggage; compare the total.','Agreed pickup point and address; check waiting terms if your flight is delayed.']],
  taxi:'Official airport taxi information',contents:'In this guide',topics:['C6 and changing to TRAM','Is there a train from the airport?','Getting to Benidorm','Return journey and early departures'],weekend:'Plan a weekend in Alicante',flights:'Check flights to Alicante',
  nightTitle:'Late arrivals and buying a ticket',night:'Open the C6 timetable for your date and direction, including after midnight. Check the operator’s ticket and payment rules; do not assume a city pass includes the airport service. Work backwards from your required check-in time, allowing for waiting and travel.'},
 ru:{ticket:'за обычный разовый билет C6 на человека. Билет продаётся в автобусе; подготовьте точную сумму наличными.',checked:'Цена проверена',source:'Источник: Alicante City & Beach',
  title:'Как добраться из аэропорта Аликанте в центр?',answer:'Автобус C6 соединяет терминал ALC с центром Аликанте. На TRAM пересаживаются в городе, в том числе у Luceros: прямого поезда или трамвая из терминала нет.',
  timetable:'C6: расписание, остановки и изменения движения',fare:'Актуальная цена билета C6',compare:'Сравните способы доезда',transport:'Транспорт',cost:'Стоимость',route:'Маршрут и время',
  rows:[['Автобус C6','Билет на каждого пассажира; актуальный тариф у оператора.','До центра, затем пешком или с пересадкой. Учитывайте остановку, ожидание и пробки.'],['Такси','Цена за поездку; проверьте тариф и аэропортовую доплату.','До вашего адреса. Время зависит от движения и расположения жилья.'],['Заказанный трансфер','Расчёт на вашу дату, группу и багаж; сравнивайте итоговую сумму.','Согласованные место встречи и адрес; уточните ожидание при задержке рейса.']],
  taxi:'Официальная информация о такси',contents:'В этом путеводителе',topics:['C6 и пересадка на TRAM','Есть ли поезд из аэропорта?','Дорога в Бенидорм','Обратная дорога и ранний вылет'],weekend:'Спланировать выходные в Аликанте',flights:'Посмотреть перелёты в Аликанте',
  nightTitle:'Поздний прилёт и покупка билета',night:'Откройте расписание C6 на свою дату и направление, включая время после полуночи. Проверьте покупку и способы оплаты у оператора: городской проездной не обязательно действует на аэропортовой линии. Обратную дорогу рассчитывайте от требуемого времени регистрации с запасом на ожидание и доезд.'},
 uk:{ticket:'за звичайний разовий квиток C6 на людину. Квиток продають в автобусі; підготуйте точну суму готівкою.',checked:'Ціну перевірено',source:'Джерело: Alicante City & Beach',
  title:'Як дістатися з аеропорту Аліканте до центру?',answer:'Автобус C6 сполучає термінал ALC із центром Аліканте. На TRAM пересідають у місті, зокрема біля Luceros: прямого поїзда чи трамвая з термінала немає.',
  timetable:'C6: розклад, зупинки та зміни руху',fare:'Актуальна ціна квитка C6',compare:'Порівняйте способи доїзду',transport:'Транспорт',cost:'Вартість',route:'Маршрут і час',
  rows:[['Автобус C6','Квиток на кожного пасажира; актуальний тариф в оператора.','До центру, потім пішки або з пересадкою. Врахуйте зупинку, очікування й затори.'],['Таксі','Ціна за поїздку; перевірте тариф та аеропортову доплату.','До вашої адреси. Час залежить від руху й розташування житла.'],['Замовлений трансфер','Розрахунок на вашу дату, групу й багаж; порівнюйте підсумок.','Узгоджені місце зустрічі й адреса; уточніть очікування за затримки рейсу.']],
  taxi:'Офіційна інформація про таксі',contents:'У цьому путівнику',topics:['C6 і пересадка на TRAM','Чи є поїзд з аеропорту?','Дорога до Бенідорма','Зворотна дорога й ранній виліт'],weekend:'Спланувати вихідні в Аліканте',flights:'Переглянути перельоти до Аліканте',
  nightTitle:'Пізній приліт і купівля квитка',night:'Відкрийте розклад C6 на свою дату й напрямок, включно з часом після опівночі. Перевірте купівлю та способи оплати в оператора: міський проїзний не обов’язково діє на аеропортовій лінії. Зворотну дорогу розраховуйте від потрібного часу реєстрації із запасом на очікування та доїзд.'},
} as const;

export function AlicanteArrival({locale='pl'}:{locale?:Locale}){
 const text=copy[locale];
 return <div className={styles.guide} data-alicante-arrival>
  <section aria-labelledby="alicante-quick-answer"><h2 id="alicante-quick-answer">{text.title}</h2><p>{text.answer}</p>
   <p><strong>4,70 €</strong> {text.ticket}</p>
   <p className="muted">{text.checked}: <time dateTime="2026-11-07">2026-11-07</time> · <a href="https://alicanteturismo.com/como-llegar-a-alicante/">{text.source}</a></p>
   <ul><li><a href="https://alicante.vectalia.es/linea/linea-c-6alicante-aeropuerto/">{text.timetable}</a></li><li><a href="https://alicante.vectalia.es/bonos-y-tarifas/">{text.fare}</a></li></ul>
  </section>
  <nav aria-label={text.contents}><ul>{text.topics.map((topic,index)=><li key={topic}><a href={`#alicante-section-${index}`}>{topic}</a></li>)}</ul></nav>
  <section aria-labelledby="alicante-transport"><h2 id="alicante-transport">{text.compare}</h2>
   <table><caption>{text.title}</caption><thead><tr><th scope="col">{text.transport}</th><th scope="col">{text.cost}</th><th scope="col">{text.route}</th></tr></thead>
    <tbody>{text.rows.map(row=><tr key={row[0]}><th scope="row">{row[0]}</th><td>{row[1]}</td><td>{row[2]}</td></tr>)}</tbody>
   </table><p><a href="https://www.aena.es/en/alicante-elche-miguel-hernandez/how-to-get-there/taxi.html">{text.taxi}</a></p>
  </section>
  <section aria-labelledby="alicante-night"><h2 id="alicante-night">{text.nightTitle}</h2><p>{text.night}</p></section>
  <ul><li><a href={localizedHref('/info/alicante-weekend',locale)}>{text.weekend}</a></li><li><a href={localizedHref('/deals?destination=alicante',locale)}>{text.flights}</a></li></ul>
 </div>;
}
