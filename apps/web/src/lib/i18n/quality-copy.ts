import type {Locale} from './config.ts';
import type {FlightQualityReason} from '../api.ts';

const index=(locale:Locale)=>({pl:0,en:1,ru:2,uk:3}[locale]);
export const qualityLabels={
 partial:['Niepełne dane lotu','Partial flight details','Неполные данные перелёта','Неповні дані перельоту'],
 critical:['Sprawdź trasę przed wyborem','Check the itinerary before choosing','Проверьте маршрут перед выбором','Перевірте маршрут перед вибором'],
 scope:['Kompletność danych nie potwierdza dostępności u sprzedawcy.','Data completeness does not confirm availability with the seller.','Полнота данных не подтверждает наличие у продавца.','Повнота даних не підтверджує наявність у продавця.'],
 details:['Jakich danych brakuje?','Which details need checking?','Какие данные нужно проверить?','Які дані потрібно перевірити?'],
 selection:['W tej sekcji pomijamy loty z brakującymi lub sprzecznymi kluczowymi danymi trasy. Pełny katalog może zawierać takie loty z ostrzeżeniem.','This section omits flights with missing or conflicting essential itinerary details. The full catalog may include them with a warning.','В этой подборке исключены перелёты без ключевых данных маршрута или с противоречиями. В полном каталоге они могут отображаться с предупреждением.','У цій добірці виключено перельоти без ключових даних маршруту або із суперечностями. У повному каталозі вони можуть відображатися з попередженням.'],
} as const;
export const qualityReasons:Record<FlightQualityReason,readonly string[]>={
 UNVERIFIED_SOURCE:['Nie można potwierdzić danych trasy ze źródła.','The source itinerary cannot be verified.','Данные маршрута источника не подтверждены.','Дані маршруту джерела не підтверджені.'],
 MISSING_ORIGIN:['Brak potwierdzonego lotniska wylotu.','The departure airport is unknown.','Не указан подтверждённый аэропорт вылета.','Не вказано підтверджений аеропорт вильоту.'],
 MISSING_DESTINATION:['Brak potwierdzonego lotniska przylotu.','The arrival airport is unknown.','Не указан подтверждённый аэропорт прилёта.','Не вказано підтверджений аеропорт прильоту.'],
 MISSING_RETURN_AIRPORTS:['Lotniska powrotu wymagają potwierdzenia.','The return airports need confirmation.','Аэропорты обратного перелёта требуют подтверждения.','Аеропорти зворотного перельоту потребують підтвердження.'],
 MISSING_DATES:['Brakuje daty podróży w danych źródłowych.','A travel date is missing from the source.','В исходных данных отсутствует дата поездки.','У вихідних даних відсутня дата подорожі.'],
 INVALID_DATES:['Daty lub godziny źródła są niepoprawne albo sprzeczne.','The source dates or times are invalid or conflicting.','Даты или время источника некорректны либо противоречивы.','Дати або час джерела некоректні чи суперечливі.'],
 AIRPORT_MISMATCH:['Lotniska nie zgadzają się z trasą.','The airports conflict with the itinerary.','Аэропорты не согласуются с маршрутом.','Аеропорти не узгоджуються з маршрутом.'],
 INVALID_DURATION:['Czas lotu wymaga ponownego sprawdzenia.','The flight duration needs checking.','Длительность перелёта требует проверки.','Тривалість перельоту потребує перевірки.'],
 CONFLICTING_METADATA:['Dane źródłowe opisują sprzeczne szczegóły podróży.','The source contains conflicting itinerary details.','В исходных данных противоречивые сведения о поездке.','У вихідних даних суперечливі відомості про подорож.'],
 MISSING_TIMES:['Nie wszystkie godziny podróży są znane.','Some flight times are unknown.','Не все часы перелёта известны.','Не всі години перельоту відомі.'],
 ESTIMATED_TIMES:['Część godzin przylotu jest obliczona, nie potwierdzona rozkładem.','Some arrival times are calculated rather than confirmed by a schedule.','Часть времени прилёта рассчитана, а не подтверждена расписанием.','Частину часу прильоту розраховано, а не підтверджено розкладом.'],
 UNKNOWN_TIMEZONE:['Nie wszystkie strefy lotnisk są znane; sprawdź oznaczenia UTC.','Some airport time zones are unknown; check the UTC labels.','Не все часовые пояса аэропортов известны; проверьте пометки UTC.','Не всі часові пояси аеропортів відомі; перевірте позначки UTC.'],
 UNKNOWN_STOPS:['Liczba przesiadek wymaga sprawdzenia.','The number of connections needs checking.','Количество пересадок требует проверки.','Кількість пересадок потребує перевірки.'],
 UNKNOWN_CARRIER:['Nie wszyscy przewoźnicy są znani.','Some operating carriers are unknown.','Не все перевозчики известны.','Не всі перевізники відомі.'],
};
export const qualityText=(locale:Locale,key:keyof typeof qualityLabels)=>qualityLabels[key][index(locale)];
export function qualityReasonText(locale:Locale,reason:string):string {
 return (qualityReasons[reason as FlightQualityReason]??qualityReasons.UNVERIFIED_SOURCE)[index(locale)];
}
