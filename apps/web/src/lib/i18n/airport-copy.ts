import type {Locale} from './config';

export const airportCopy={
 pl:{airport:'Lotnisko i dalszy plan',note:'Sprawdź kod lotniska na bilecie. Dojazd, odprawa i transfer po przylocie wymagają osobnego planu.',
  destinations:'Kierunki w pokazanych ofertach',scope:'To kierunki z ofert widocznych w tym zestawieniu, nie pełny rozkład lotniska. Ceny są zapisanymi obserwacjami; dostępność potwierdź u sprzedawcy.',
  noDestinations:'W tym zestawieniu nie ma teraz kierunków do pokazania.',search:'Ustaw daty i budżet lotu',empty:'Nie znaleźliśmy aktualnych obserwacji lotów z tego lotniska. Nie oznacza to braku połączeń u przewoźników. Sprawdź katalog lub wybierz inne lotnisko.'},
 en:{airport:'Airport and onward planning',note:'Check the airport code on your ticket. Plan airport access, check-in and the arrival transfer separately.',
  destinations:'Destinations in the displayed offers',scope:'These destinations come from the offers shown here, not the airport’s full timetable. Prices are saved observations; confirm availability with the seller.',
  noDestinations:'There are no destinations to show in this selection right now.',search:'Choose flight dates and budget',empty:'We found no current flight observations from this airport. This does not mean airlines have no services. Check the catalog or choose another airport.'},
 ru:{airport:'Аэропорт и дальнейший план',note:'Проверьте код аэропорта в билете. Отдельно спланируйте дорогу до аэропорта, регистрацию и трансфер после прилёта.',
  destinations:'Направления в показанных предложениях',scope:'Это направления из показанных здесь предложений, а не полное расписание аэропорта. Цены взяты из сохранённых наблюдений; наличие уточняйте у продавца.',
  noDestinations:'Сейчас в этой выборке нет направлений для показа.',search:'Выбрать даты и бюджет перелёта',empty:'Мы не нашли актуальных наблюдений перелётов из этого аэропорта. Это не означает отсутствия рейсов у перевозчиков. Проверьте каталог или выберите другой аэропорт.'},
 uk:{airport:'Аеропорт і подальший план',note:'Перевірте код аеропорту в квитку. Окремо сплануйте дорогу до аеропорту, реєстрацію та трансфер після прильоту.',
  destinations:'Напрямки в показаних пропозиціях',scope:'Це напрямки з показаних тут пропозицій, а не повний розклад аеропорту. Ціни взято зі збережених спостережень; наявність уточнюйте у продавця.',
  noDestinations:'Зараз у цій вибірці немає напрямків для показу.',search:'Вибрати дати та бюджет перельоту',empty:'Ми не знайшли актуальних спостережень перельотів із цього аеропорту. Це не означає відсутності рейсів у перевізників. Перевірте каталог або виберіть інший аеропорт.'},
} satisfies Record<Locale,Record<string,string>>;
