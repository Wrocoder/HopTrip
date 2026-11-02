import type {Locale} from './config.ts';
import type {EventSaleState} from '../event-presentation.ts';

type Copy={sale:Record<EventSaleState,string>;zone:string;unknownZone:string;unknownVenue:string;unknownCity:string;unknownCheck:string;availability:string};
export const eventContextCopy:Record<Locale,Copy>={
 pl:{sale:{onsale:'W źródle: w sprzedaży — dostępność do sprawdzenia',rescheduled:'Termin zmieniony — potwierdź u organizatora.',offsale:'Sprzedaż nieaktywna — brak potwierdzonej dostępności',unknown:'Status sprzedaży nieznany'},
  zone:'Strefa czasu wydarzenia',unknownZone:'Strefa czasu do potwierdzenia',unknownVenue:'Miejsce do potwierdzenia',unknownCity:'Miasto do potwierdzenia',unknownCheck:'Czas sprawdzenia nieznany',
  availability:'Dane katalogu, nie dostępność na żywo. Status sprzedaży i cena od nie gwarantują wolnych biletów; potwierdź je u sprzedawcy. Nieaktywnej lub nieznanej sprzedaży nie dodajemy z listy do planu.'},
 en:{sale:{onsale:'Source lists tickets on sale — check availability',rescheduled:'Date changed — confirm with the organiser.',offsale:'Sales inactive — availability unconfirmed',unknown:'Sales status unknown'},
  zone:'Event time zone',unknownZone:'Time zone to be confirmed',unknownVenue:'Venue to be confirmed',unknownCity:'City to be confirmed',unknownCheck:'Check time unknown',
  availability:'Catalogue data, not live availability. Sales status and a starting price do not guarantee tickets; confirm with the seller. Inactive or unknown sales cannot be added from the list to the plan.'},
 ru:{sale:{onsale:'По данным источника в продаже — наличие нужно проверить',rescheduled:'Дата изменена — уточните у организатора.',offsale:'Продажи неактивны — наличие не подтверждено',unknown:'Статус продажи неизвестен'},
  zone:'Часовой пояс события',unknownZone:'Часовой пояс уточняется',unknownVenue:'Место уточняется',unknownCity:'Город уточняется',unknownCheck:'Время проверки неизвестно',
  availability:'Данные каталога, а не наличие в реальном времени. Статус продажи и цена от не гарантируют билетов; уточните у продавца. Неактивные или неизвестные продажи нельзя добавить из списка в план.'},
 uk:{sale:{onsale:'За даними джерела у продажу — наявність потрібно перевірити',rescheduled:'Дату змінено — уточніть в організатора.',offsale:'Продажі неактивні — наявність не підтверджено',unknown:'Статус продажу невідомий'},
  zone:'Часовий пояс події',unknownZone:'Часовий пояс уточнюється',unknownVenue:'Місце уточнюється',unknownCity:'Місто уточнюється',unknownCheck:'Час перевірки невідомий',
  availability:'Дані каталогу, а не наявність у реальному часі. Статус продажу та ціна від не гарантують квитків; уточніть у продавця. Неактивні або невідомі продажі не можна додати зі списку до плану.'},
};
