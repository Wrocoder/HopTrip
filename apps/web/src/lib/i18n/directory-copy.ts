import type {Locale} from './config.ts';
type Copy={title:string;heading:string;description:string;search:string;submit:string;clear:string;countries:string;other:string;count:string;empty:string;noMatch:string;note:string;all:string;home:string};
export const directoryCopy:Record<Locale,Copy>={
 pl:{title:'Katalog kierunków z Polski — miasta i kraje | HopTrip',heading:'Wszystkie kierunki',description:'Przeglądaj kierunki według krajów. Znajdź miasto po nazwie lub kodzie lotniska, a potem sprawdź daty i oferty lotów z Polski.',
  search:'Miasto lub kod lotniska',submit:'Szukaj kierunku',clear:'Pokaż wszystkie kierunki',countries:'Przejdź do kraju',other:'Pozostałe kierunki',count:'Liczba kierunków: {count}.',
  empty:'Katalog kierunków jest obecnie pusty.',noMatch:'Nie znaleziono pasujących kierunków. Zmień nazwę lub pokaż wszystkie kierunki.',
  note:'Obecność kierunku w katalogu nie oznacza dostępności lotu. Daty, cenę i rozkład sprawdź w ofertach.',all:'Zobacz wszystkie kierunki →',home:'Pomysły na kierunek. Pełną listę miast znajdziesz w katalogu.'},
 en:{title:'Destinations from Poland — cities and countries | HopTrip',heading:'All destinations',description:'Browse destinations by country. Find a city by name or airport code, then check dates and flight offers from Poland.',
  search:'City or airport code',submit:'Find a destination',clear:'Show all destinations',countries:'Jump to a country',other:'Other destinations',count:'Destinations: {count}.',
  empty:'The destinations directory is currently empty.',noMatch:'No matching destinations. Try another name or show all destinations.',
  note:'A listing in this directory does not mean a flight is available. Check offers for dates, price and schedule.',all:'See all destinations →',home:'Destination ideas. Find the full list of cities in the directory.'},
 ru:{title:'Направления из Польши — города и страны | HopTrip',heading:'Все направления',description:'Смотри направления по странам. Найди город по названию или коду аэропорта, затем проверь даты и предложения перелётов из Польши.',
  search:'Город или код аэропорта',submit:'Найти направление',clear:'Показать все направления',countries:'Перейти к стране',other:'Другие направления',count:'Направлений: {count}.',
  empty:'Каталог направлений сейчас пуст.',noMatch:'Подходящих направлений нет. Измени название или покажи все направления.',
  note:'Наличие направления в каталоге не означает наличие перелёта. Даты, цену и расписание проверь в предложениях.',all:'Все направления →',home:'Идеи направлений. Полный список городов доступен в каталоге.'},
 uk:{title:'Напрямки з Польщі — міста та країни | HopTrip',heading:'Усі напрямки',description:'Переглядай напрямки за країнами. Знайди місто за назвою або кодом аеропорту, а потім перевір дати й пропозиції перельотів із Польщі.',
  search:'Місто або код аеропорту',submit:'Знайти напрямок',clear:'Показати всі напрямки',countries:'Перейти до країни',other:'Інші напрямки',count:'Напрямків: {count}.',
  empty:'Каталог напрямків зараз порожній.',noMatch:'Відповідних напрямків немає. Зміни назву або покажи всі напрямки.',
  note:'Наявність напрямку в каталозі не означає наявність перельоту. Дати, ціну й розклад перевір у пропозиціях.',all:'Усі напрямки →',home:'Ідеї напрямків. Повний список міст доступний у каталозі.'},
};
