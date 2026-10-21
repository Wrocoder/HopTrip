import type {Locale} from "./config";
import type {InfoContent} from "../info-types";
type Translation=Pick<InfoContent,"title"|"description"|"paragraphs"|"sections">;
export const priceDataGuides:Record<Exclude<Locale,"pl">,Record<"price-freshness"|"price-history",Translation>>={
 en:{
  "price-freshness":{title:"What offer freshness means",description:"Why a recorded price can change, when an offer disappears and what to check with the partner.",paragraphs:[
   "The price shown in HopTrip is a recorded observation. We do not reserve seats or confirm prices live whenever a card is opened. Even a recently observed amount may differ from the price available at purchase time.",
  ],sections:[
   {title:"Fetching data is not a new price check",paragraphs:[
    "The provider may return a previously recorded price. If it supplies the observation time, we retain that information. Fetching the same data again does not make the offer fresher.",
    "When the source provides no observation time, we know only when we first received that price. We do not know how long it had already existed at the provider. Receiving an identical entry again without a new timestamp does not confirm that it is current.",
   ]},
   {title:"When we stop displaying an offer",paragraphs:[
    "The current publication limit is 48 hours from the retained observation time. An earlier expiry supplied by the source takes priority. An offer also disappears after departure or after it is disabled.",
    "If we know only the departure date, without a time, we close the offer at the start of that day in UTC. This is a cautious publication boundary, not information about the aircraft's departure time.",
    "Availability checks also apply when opening details and attempting to visit the partner. A card opened earlier or a saved link may therefore no longer allow the onward visit. Refresh the catalog to see available options.",
   ]},
   {title:"What to check after following the link",paragraphs:[
    "Compare airports, dates, travel direction, passenger count and the final amount. Also check baggage and the selected ticket's conditions. If the price has changed, the seller's data are the reference before purchase.",
    "A valid HopTrip entry means it meets our publication rules. It does not mean a locked price, an available seat or a completed booking.",
   ]},
  ]},
  "price-history":{title:"What price history does and does not tell you",description:"How HopTrip history is built, why repeated entries are not new data and how to read a small sample.",paragraphs:[
   "HopTrip history includes observations we have received and recorded. It is not a complete archive of every price available for sale. Its coverage depends on the provider, supported routes and the period of data collection.",
  ],sections:[
   {title:"One response does not always add a new observation",paragraphs:[
    "Receiving the same offer, price and observation time again does not increase the sample. If the source supplies a new observation time, the same amount can create another entry. Without a source timestamp, we treat repeated prices conservatively.",
    "Observation count therefore does not mean searches, passengers or tickets sold. Several entries may concern the same flight at different times; they should not be treated as an independent study of the whole market.",
   ]},
   {title:"A small sample limits the comparison",paragraphs:[
    "For a consistent route and travel-period group, we calculate the median and price range. With few entries, a single price has a large effect on the result. History for a new route may only be starting to build.",
    "The history coverage component of the score grows with the number of entries and reaches its limit at 30 observations. This does not mean 100% certainty or guarantee a representative sample. Missing flights and fare conditions still limit the comparison.",
   ]},
   {title:"How to use history when choosing",paragraphs:[
    "Treat a price below the median as a reason to look more closely at an offer. Consider it alongside current ticket conditions, entry freshness and your requirements. Do not automatically compare a one-way flight with a return trip.",
    "History describes past records; it does not predict tomorrow's price. We do not use it to promise that waiting will lower the cost or that the displayed offer is the cheapest among all sellers. Check the final details after visiting the partner.",
   ]},
  ]},
 },
 ru:{
  "price-freshness":{title:"Что означает свежесть предложения",description:"Почему сохранённая цена может измениться, когда предложение исчезает и что проверить у партнёра.",paragraphs:[
   "Цена в HopTrip — сохранённое наблюдение. Мы не резервируем места и не подтверждаем цену в реальном времени при каждом открытии карточки. Даже недавно замеченная сумма может отличаться от цены, доступной на момент покупки.",
  ],sections:[
   {title:"Получение данных — не новая проверка цены",paragraphs:[
    "Поставщик может вернуть ранее сохранённую цену. Если он передаёт время наблюдения, мы сохраняем эту информацию. Повторное получение тех же данных не делает предложение свежее.",
    "Когда источник не сообщает время наблюдения, мы знаем только момент первого получения этой цены. Мы не знаем, как долго она уже существовала у поставщика. Повторное получение одинаковой записи без нового времени не подтверждает её актуальность.",
   ]},
   {title:"Когда мы перестаём показывать предложение",paragraphs:[
    "Текущий срок публикации — 48 часов от сохранённого момента наблюдения. Более короткий срок действия, указанный источником, имеет приоритет. Предложение также исчезает после времени вылета или отключения.",
    "Если известен только день вылета без времени, мы закрываем предложение в начале этого дня по UTC. Это осторожная граница публикации, а не указание времени вылета самолёта.",
    "Проверка доступности действует и при открытии подробностей, и при попытке перейти к партнёру. Поэтому ранее открытая карточка или сохранённая ссылка могут уже не разрешать переход. Обновите каталог, чтобы увидеть доступные варианты.",
   ]},
   {title:"Что проверить после перехода",paragraphs:[
    "Сравните аэропорты, даты, направление поездки, число пассажиров и окончательную сумму. Проверьте также багаж и условия выбранного билета. Если цена изменилась, ориентиром перед покупкой служат данные продавца.",
    "Действующая запись в HopTrip означает, что она соответствует нашим правилам публикации. Это не означает зафиксированную цену, доступное место или готовое бронирование.",
   ]},
  ]},
  "price-history":{title:"Что говорит и чего не говорит история цен",description:"Как формируется история HopTrip, почему повторы не являются новыми данными и как читать небольшую выборку.",paragraphs:[
   "История HopTrip включает наблюдения, которые мы получили и сохранили. Это не полный архив всех цен, доступных в продаже. Её охват зависит от поставщика, поддерживаемых маршрутов и периода сбора данных.",
  ],sections:[
   {title:"Один ответ не всегда добавляет новое наблюдение",paragraphs:[
    "Повторное получение того же предложения, цены и времени наблюдения не увеличивает выборку. Если источник укажет новое время наблюдения, та же сумма может создать ещё одну запись. Без времени от источника мы осторожно относимся к повторению той же цены.",
    "Поэтому число наблюдений не означает количество поисков, пассажиров или проданных билетов. Несколько записей могут касаться одного рейса в разные моменты; их нельзя считать независимым исследованием всего рынка.",
   ]},
   {title:"Малая выборка ограничивает сравнение",paragraphs:[
    "Для согласованной группы маршрута и периода поездки мы рассчитываем медиану и диапазон цен. При малом числе записей одна цена сильно влияет на результат. На новом маршруте история может только начинать формироваться.",
    "Показатель полноты истории в оценке растёт с числом записей и достигает предела при 30 наблюдениях. Это не означает 100% уверенность и не гарантирует репрезентативность выборки. Отсутствующие рейсы и условия тарифов по-прежнему ограничивают сравнение.",
   ]},
   {title:"Как использовать историю при выборе",paragraphs:[
    "Воспринимайте цену ниже медианы как повод присмотреться к предложению. Сопоставьте её с текущими условиями билета, свежестью записи и своими требованиями. Не сравнивайте автоматически перелёт в одну сторону с поездкой туда и обратно.",
    "История описывает прошлые записи, а не предсказывает завтрашнюю цену. На её основе мы не обещаем, что ожидание снизит расходы или что показанное предложение самое дешёвое у всех продавцов. Окончательные данные проверьте после перехода к партнёру.",
   ]},
  ]},
 },
 uk:{
  "price-freshness":{title:"Що означає свіжість пропозиції",description:"Чому збережена ціна може змінитися, коли пропозиція зникає і що перевірити в партнера.",paragraphs:[
   "Ціна в HopTrip — збережене спостереження. Ми не резервуємо місць і не підтверджуємо ціни в реальному часі під час кожного відкриття картки. Навіть нещодавно помічена сума може відрізнятися від ціни, доступної на момент купівлі.",
  ],sections:[
   {title:"Отримання даних — не нова перевірка ціни",paragraphs:[
    "Постачальник може повернути раніше збережену ціну. Якщо він передає час спостереження, ми зберігаємо цю інформацію. Повторне отримання тих самих даних не робить пропозицію свіжішою.",
    "Коли джерело не повідомляє часу спостереження, ми знаємо лише момент першого отримання цієї ціни. Ми не знаємо, як довго вона вже існувала в постачальника. Повторне отримання однакового запису без нового часу не підтверджує його актуальності.",
   ]},
   {title:"Коли ми перестаємо показувати пропозицію",paragraphs:[
    "Поточний строк публікації — 48 годин від збереженого моменту спостереження. Коротший строк дії, зазначений джерелом, має пріоритет. Пропозиція також зникає після часу вильоту або вимкнення.",
    "Якщо відомий лише день вильоту без часу, ми закриваємо пропозицію на початку цього дня за UTC. Це обережна межа публікації, а не зазначення часу вильоту літака.",
    "Перевірка доступності діє і під час відкриття подробиць, і під час спроби перейти до партнера. Тому раніше відкрита картка або збережене посилання можуть уже не дозволяти переходу. Оновіть каталог, щоб побачити доступні варіанти.",
   ]},
   {title:"Що перевірити після переходу",paragraphs:[
    "Порівняйте аеропорти, дати, напрямок подорожі, кількість пасажирів і остаточну суму. Перевірте також багаж і умови вибраного квитка. Якщо ціна змінилася, орієнтиром перед купівлею є дані продавця.",
    "Чинний запис у HopTrip означає, що він відповідає нашим правилам публікації. Це не означає зафіксованої ціни, доступного місця або готового бронювання.",
   ]},
  ]},
  "price-history":{title:"Що говорить і чого не говорить історія цін",description:"Як формується історія HopTrip, чому повтори не є новими даними і як читати невелику вибірку.",paragraphs:[
   "Історія HopTrip охоплює спостереження, які ми отримали й зберегли. Це не повний архів усіх цін, доступних у продажу. Її охоплення залежить від постачальника, підтримуваних маршрутів і періоду збирання даних.",
  ],sections:[
   {title:"Одна відповідь не завжди додає нове спостереження",paragraphs:[
    "Повторне отримання тієї самої пропозиції, ціни й часу спостереження не збільшує вибірки. Якщо джерело вкаже новий час спостереження, та сама сума може створити ще один запис. Без часу від джерела ми обережно ставимося до повторення тієї самої ціни.",
    "Тому кількість спостережень не означає кількості пошуків, пасажирів або проданих квитків. Кілька записів можуть стосуватися одного рейсу в різні моменти; їх не можна вважати незалежним дослідженням усього ринку.",
   ]},
   {title:"Мала вибірка обмежує порівняння",paragraphs:[
    "Для узгодженої групи маршруту й періоду подорожі ми розраховуємо медіану та діапазон цін. За малої кількості записів одна ціна сильно впливає на результат. На новому маршруті історія може лише починати формуватися.",
    "Показник повноти історії в оцінці зростає з кількістю записів і досягає межі за 30 спостережень. Це не означає 100% упевненості й не гарантує репрезентативності вибірки. Відсутні рейси й умови тарифів надалі обмежують порівняння.",
   ]},
   {title:"Як використовувати історію під час вибору",paragraphs:[
    "Сприймайте ціну нижче медіани як привід придивитися до пропозиції. Зіставте її з поточними умовами квитка, свіжістю запису й власними вимогами. Не порівнюйте автоматично переліт в один бік із подорожжю туди й назад.",
    "Історія описує минулі записи, а не передбачає завтрашньої ціни. На її основі ми не обіцяємо, що очікування знизить витрати або що показана пропозиція найдешевша серед усіх продавців. Остаточні дані перевірте після переходу до партнера.",
   ]},
  ]},
 },
};
