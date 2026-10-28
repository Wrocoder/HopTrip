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
   "HopTrip helps you compare flight prices from Poland. We publish recorded price observations, not a guarantee that seats are available.",
   "We compare a price with the history for the same route, departure month and length of stay. A small number of observations reduces confidence in the comparison. The provider's cache may contain outdated data.",
   "The score considers price, the difference from the median, freshness and history coverage. When flight convenience is unknown, we use a neutral value. The score alone does not replace checking baggage, connections and ticket conditions.",
   "Flight prices are per person. Accommodation and transfers need to be checked separately; we do not add estimates without a confirmed offer.",
  ]},
  partners:{title:"Affiliate partnerships",paragraphs:[
   "Some buttons use affiliate links. We may receive a commission after a booking. A link is available only when the partnership with the programme is active and approved.",
   "HopTrip does not accept payments or issue tickets. Check the final price, seller and contract terms on the website you visit.",
   "Price data and the affiliate programme are separate integrations. A price in the catalog does not mean a purchase link is available. An inactive partnership disables the button.",
  ]},
  contact:{title:"Contact",paragraphs:[
   "Contact us about an incorrect offer, the service or your personal data. The contact email address is shown below.",
   "When reporting an error, include the page address, date and a description of the problem. Do not send card numbers, identity documents or passenger details that we do not need to reply.",
   "HopTrip does not sell tickets, accept payments or manage bookings. Contact the seller named in your booking confirmation about ticket changes, refunds and purchase complaints.",
  ]},
 },
 ru:{
  about:{title:"О HopTrip",paragraphs:[
   "HopTrip помогает сравнивать цены на перелёты из Польши. Мы публикуем сохранённые наблюдения цен, а не гарантию наличия мест.",
   "Мы сравниваем цену с историей того же маршрута, месяца вылета и длительности поездки. Небольшое число наблюдений снижает надёжность сравнения. Кеш поставщика может содержать устаревшие данные.",
   "Оценка учитывает цену, разницу с медианой, свежесть и полноту истории. Если удобство перелёта неизвестно, используем нейтральное значение. Сама оценка не заменяет проверку багажа, пересадок и условий билета.",
   "Цена перелёта указана на человека. Жильё и трансферы нужно проверять отдельно; мы не добавляем оценки расходов без подтверждённого предложения.",
  ]},
  partners:{title:"Партнёрство",paragraphs:[
   "Некоторые кнопки ведут по партнёрским ссылкам. После бронирования мы можем получить комиссию. Доступность ссылки зависит от действующего и одобренного сотрудничества с программой.",
   "HopTrip не принимает платежи и не выдаёт билеты. Окончательную цену, продавца и условия договора проверяйте на сайте, на который переходите.",
   "Данные о ценах и партнёрская программа — отдельные интеграции. Наличие цены в каталоге не означает, что ссылка на покупку доступна. Если сотрудничество неактивно, кнопка отключается.",
  ]},
  contact:{title:"Контакты",paragraphs:[
   "Напишите нам о неверном предложении, работе сервиса или своих персональных данных. Контактный email указан ниже.",
   "Сообщая об ошибке, укажите адрес страницы, дату и описание проблемы. Не отправляйте номера карт, документы, удостоверяющие личность, или данные пассажиров, которые не нужны для ответа.",
   "HopTrip не продаёт билеты, не принимает платежи и не обслуживает бронирования. По вопросам изменения билета, возвратов и претензий к покупке обращайтесь к продавцу, указанному в подтверждении бронирования.",
  ]},
 },
 uk:{
  about:{title:"Про HopTrip",paragraphs:[
   "HopTrip допомагає порівнювати ціни на перельоти з Польщі. Ми публікуємо збережені спостереження цін, а не гарантію наявності місць.",
   "Ми порівнюємо ціну з історією того самого маршруту, місяця вильоту й тривалості подорожі. Невелика кількість спостережень знижує надійність порівняння. Кеш постачальника може містити застарілі дані.",
   "Оцінка враховує ціну, різницю з медіаною, свіжість і повноту історії. Якщо зручність перельоту невідома, використовуємо нейтральне значення. Сама оцінка не замінює перевірку багажу, пересадок та умов квитка.",
   "Ціну перельоту вказано на людину. Житло й трансфери потрібно перевіряти окремо; ми не додаємо оцінок витрат без підтвердженої пропозиції.",
  ]},
  partners:{title:"Партнерство",paragraphs:[
   "Деякі кнопки ведуть за партнерськими посиланнями. Після бронювання ми можемо отримати комісію. Доступність посилання залежить від чинної та схваленої співпраці з програмою.",
   "HopTrip не приймає платежів і не видає квитків. Остаточну ціну, продавця й умови договору перевіряйте на сайті, на який переходите.",
   "Дані про ціни й партнерська програма — окремі інтеграції. Наявність ціни в каталозі не означає, що посилання на купівлю доступне. Якщо співпраця неактивна, кнопка вимикається.",
  ]},
  contact:{title:"Контакти",paragraphs:[
   "Напишіть нам про неправильну пропозицію, роботу сервісу або свої персональні дані. Контактний email наведено нижче.",
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
