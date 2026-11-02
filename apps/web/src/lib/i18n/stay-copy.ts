import type {Locale} from './config.ts';
export const stayCopy={
 'Daty pobytu wybierasz niezależnie od dat lotu. Sprawdź miejscowe daty przylotu i wylotu powrotnego.':['Choose stay dates separately from flight dates. Check the local arrival and return departure dates.','Даты проживания выбираются отдельно от дат перелёта. Проверьте местные даты прилёта и обратного вылета.','Дати проживання обираються окремо від дат перельоту. Перевірте місцеві дати прильоту та зворотного вильоту.'],
 'Miejscowe daty według rozkładu:':['Local dates from the schedule:','Местные даты по расписанию:','Місцеві дати за розкладом:'],
 'przylot':['arrival','прилёт','приліт'],
 'wylot powrotny':['return departure','обратный вылет','зворотний виліт'],
 'Przylot obliczono z czasu lotu. Potwierdź datę i rozkład u partnera.':['Arrival was calculated from flight duration. Confirm the date and schedule with the partner.','Прилёт рассчитан по длительности рейса. Подтвердите дату и расписание у партнёра.','Приліт розраховано за тривалістю рейсу. Підтвердьте дату й розклад у партнера.'],
 'Użyj tych dat pobytu':['Use these stay dates','Подставить эти даты проживания','Підставити ці дати проживання'],
 'Daty możesz zmienić; sprawdź dojazd i godzinę zameldowania.':['You can edit the dates; check transfers and check-in times.','Даты можно изменить; проверьте трансфер и время заселения.','Дати можна змінити; перевірте трансфер і час заселення.'],
 'Wybierz datę':['Choose a date','Выберите дату','Оберіть дату'],
 'Potwierdź dorosłych':['Confirm adults','Подтвердите взрослых','Підтвердьте дорослих'],
 'Cenę i dostępność noclegu sprawdź w Stay22. HopTrip nie pobiera wyceny; kwoty w budżecie wpisujesz ręcznie.':['Check accommodation prices and availability in Stay22. HopTrip does not retrieve a quote; budget amounts are entered manually.','Цену и наличие жилья проверьте в Stay22. HopTrip не получает котировку; суммы в бюджете вводятся вручную.','Ціну й наявність житла перевірте у Stay22. HopTrip не отримує котирування; суми в бюджеті вводяться вручну.'],
} as const;
export type StayKey=keyof typeof stayCopy;
export const stayText=(locale:Locale,key:StayKey)=>locale==='pl'?key:stayCopy[key][({en:0,ru:1,uk:2} as const)[locale]];
