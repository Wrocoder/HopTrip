import type {Locale} from "./config";
import {getInfoContent} from "../content";
import type {InfoContent} from "../info-types";
import {legalTranslations} from "./legal-translations";
import {priceGuide} from "./price-guide";
import {priceDataGuides} from "./price-data-guides";

export const serviceSlugs=["about","partners","contact","privacy","terms","price-comparison","price-freshness","price-history"] as const;
export type ServiceSlug=typeof serviceSlugs[number];
export function isServiceSlug(slug:string):slug is ServiceSlug {
 return (serviceSlugs as readonly string[]).includes(slug);
}
type Translation={title:string;paragraphs:string[]};
const translations:Record<Exclude<Locale,"pl">,Record<Exclude<ServiceSlug,"privacy"|"terms"|"price-comparison"|"price-freshness"|"price-history">,Translation>>={
 en:{
  about:{title:"About HopTrip",paragraphs:[
   "HopTrip helps you choose a flight and plan a short trip from Poland. We publish recorded price observations, not a guarantee that seats are available.",
   "Choose an airport and dates, compare flights, then open the details: check airports, times and when the price was observed. Match accommodation, transfers and your itinerary to the specific flight.",
   "Flight prices come from the Travelpayouts cache. Fetching data or opening a card does not confirm the price or available seats with the seller. Check final terms after visiting the partner.",
   "The current score describes price against recorded destination history, observation count and data freshness. It does not rate flight convenience, baggage or the airline, and does not guarantee the lowest market price. The “How we compare flight prices” page explains the comparison scope and limitations.",
   "Flight prices are per person. Calculate accommodation, transfers and other expenses separately; amounts you enter in the calculator are a plan, not a confirmed offer. Unknown costs do not mean zero. HopTrip does not accept payments or issue tickets.",
 ]},
  partners:{title:"Affiliate partnerships",paragraphs:[
   "Some buttons use affiliate links. We may receive a commission after a booking. A link is available only when the partnership with the programme is active and approved.",
   "HopTrip does not accept payments or issue tickets. Check the final price, seller and contract terms on the website you visit.",
   "Price data and the affiliate programme are separate integrations. A price in the catalog does not mean a purchase link is available. An inactive partnership disables the button.",
  ]},
  contact:{title:"Contact",paragraphs:[
   "Contact us about an incorrect offer, the service or your personal data. Use the email address if it is visible in the contact block. If the address is temporarily unavailable, try again later.",
   "When reporting an error, include the page address, date and a description of the problem. Do not send card numbers, identity documents or passenger details that we do not need to reply.",
   "HopTrip does not sell tickets, accept payments or manage bookings. Contact the seller named in your booking confirmation about ticket changes, refunds and purchase complaints.",
  ]},
 },
 ru:{
  about:{title:"О HopTrip",paragraphs:[
   "HopTrip помогает выбрать перелёт и спланировать короткую поездку из Польши. Мы публикуем сохранённые наблюдения цен, а не гарантию наличия мест.",
   "Выберите аэропорт и даты, сравните перелёты и откройте подробности: проверьте аэропорты, время рейсов и момент наблюдения цены. Подберите проживание, трансферы и план поездки под конкретный перелёт.",
   "Цены перелётов поступают из кеша Travelpayouts. Загрузка данных или открытие карточки не подтверждает цену и наличие мест у продавца. Окончательные условия проверьте после перехода к партнёру.",
   "Текущая методика оценки описывает цену на фоне сохранённой истории направления, число наблюдений и свежесть данных. Она не оценивает удобство перелёта, багаж или авиакомпанию и не гарантирует минимальную цену на рынке. Раздел «Как мы сравниваем цены на перелёты» объясняет границы и ограничения сравнения.",
   "Цена перелёта указана на человека. Проживание, трансферы и другие расходы считайте отдельно в калькуляторе; введённые вами суммы — план, а не подтверждённое предложение. Неизвестные расходы не означают ноль. HopTrip не принимает платежи и не выдаёт билеты.",
 ]},
  partners:{title:"Партнёрство",paragraphs:[
   "Некоторые кнопки ведут по партнёрским ссылкам. После бронирования мы можем получить комиссию. Доступность ссылки зависит от действующего и одобренного сотрудничества с программой.",
   "HopTrip не принимает платежи и не выдаёт билеты. Окончательную цену, продавца и условия договора проверяйте на сайте, на который переходите.",
   "Данные о ценах и партнёрская программа — отдельные интеграции. Наличие цены в каталоге не означает, что ссылка на покупку доступна. Если сотрудничество неактивно, кнопка отключается.",
  ]},
  contact:{title:"Контакты",paragraphs:[
   "Напишите нам о неверном предложении, работе сервиса или своих персональных данных. Используйте email, если он показан в контактном блоке. Если адрес временно недоступен, попробуйте позже.",
   "Сообщая об ошибке, укажите адрес страницы, дату и описание проблемы. Не отправляйте номера карт, документы, удостоверяющие личность, или данные пассажиров, которые не нужны для ответа.",
   "HopTrip не продаёт билеты, не принимает платежи и не обслуживает бронирования. По вопросам изменения билета, возвратов и претензий к покупке обращайтесь к продавцу, указанному в подтверждении бронирования.",
  ]},
 },
 uk:{
  about:{title:"Про HopTrip",paragraphs:[
   "HopTrip допомагає вибрати переліт і спланувати коротку подорож із Польщі. Ми публікуємо збережені спостереження цін, а не гарантію наявності місць.",
   "Виберіть аеропорт і дати, порівняйте перельоти та відкрийте подробиці: перевірте аеропорти, час рейсів і момент спостереження ціни. Доберіть проживання, трансфери й план подорожі під конкретний переліт.",
   "Ціни перельотів надходять із кешу Travelpayouts. Завантаження даних або відкриття картки не підтверджує ціну й наявність місць у продавця. Остаточні умови перевірте після переходу до партнера.",
   "Поточна методика оцінки описує ціну на тлі збереженої історії напрямку, кількість спостережень і свіжість даних. Вона не оцінює зручність перельоту, багаж або авіакомпанію й не гарантує найнижчої ціни на ринку. Розділ «Як ми порівнюємо ціни на перельоти» пояснює межі й обмеження порівняння.",
   "Ціну перельоту вказано на людину. Проживання, трансфери та інші витрати рахуйте окремо в калькуляторі; введені вами суми — план, а не підтверджена пропозиція. Невідомі витрати не означають нуль. HopTrip не приймає платежів і не видає квитків.",
 ]},
  partners:{title:"Партнерство",paragraphs:[
   "Деякі кнопки ведуть за партнерськими посиланнями. Після бронювання ми можемо отримати комісію. Доступність посилання залежить від чинної та схваленої співпраці з програмою.",
   "HopTrip не приймає платежів і не видає квитків. Остаточну ціну, продавця й умови договору перевіряйте на сайті, на який переходите.",
   "Дані про ціни й партнерська програма — окремі інтеграції. Наявність ціни в каталозі не означає, що посилання на купівлю доступне. Якщо співпраця неактивна, кнопка вимикається.",
  ]},
  contact:{title:"Контакти",paragraphs:[
   "Напишіть нам про неправильну пропозицію, роботу сервісу або свої персональні дані. Скористайтеся email, якщо він показаний у контактному блоці. Якщо адреса тимчасово недоступна, спробуйте пізніше.",
   "Повідомляючи про помилку, вкажіть адресу сторінки, дату й опис проблеми. Не надсилайте номери карток, документи, що посвідчують особу, або дані пасажирів, які не потрібні для відповіді.",
   "HopTrip не продає квитків, не приймає платежів і не обслуговує бронювання. Щодо зміни квитка, повернень і претензій до купівлі звертайтеся до продавця, зазначеного в підтвердженні бронювання.",
  ]},
 },
};
export function serviceContent(slug:ServiceSlug,locale:Locale):InfoContent {
 const original=getInfoContent(slug)!;
 if(locale==="pl")return original;
 if(slug==="price-comparison")return {...original,...priceGuide[locale]};
 if(slug==="price-freshness" || slug==="price-history")return {...original,...priceDataGuides[locale][slug]};
 if(slug==="privacy" || slug==="terms")return {...original,...legalTranslations[locale][slug]};
 const translated=translations[locale][slug];
 return {...original,...translated,description:translated.paragraphs[0]};
}
export const serviceLabels:Record<Locale,{contact:string;unavailable:string;links:string;catalog:string;privacy:string;terms:string;polish:string}>={
 pl:{contact:"Kontakt z HopTrip",unavailable:"Dane kontaktowe są chwilowo niedostępne. Spróbuj ponownie później.",links:"Informacje o serwisie",catalog:"Wróć do ofert lotów",privacy:"Prywatność",terms:"Zasady korzystania",polish:"po polsku"},
 en:{contact:"Contact HopTrip",unavailable:"Contact details are temporarily unavailable. Try again later.",links:"About the service",catalog:"Back to flight offers",privacy:"Privacy",terms:"Terms of use",polish:"in Polish"},
 ru:{contact:"Связаться с HopTrip",unavailable:"Контактные данные временно недоступны. Попробуйте позже.",links:"О сервисе",catalog:"Вернуться к предложениям перелётов",privacy:"Конфиденциальность",terms:"Условия использования",polish:"на польском"},
 uk:{contact:"Зв’язатися з HopTrip",unavailable:"Контактні дані тимчасово недоступні. Спробуйте пізніше.",links:"Про сервіс",catalog:"Повернутися до пропозицій перельотів",privacy:"Конфіденційність",terms:"Умови використання",polish:"польською"},
};
