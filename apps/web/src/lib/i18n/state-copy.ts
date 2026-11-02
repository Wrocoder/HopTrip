import type {Locale} from './config.ts';
export const stateCopy={
 'Pobieramy oferty. Warunki wyszukiwania pozostają w adresie strony.':['Fetching offers. Your search conditions remain in the page URL.','Загружаем предложения. Условия поиска остаются в адресе страницы.','Завантажуємо пропозиції. Умови пошуку залишаються в адресі сторінки.'],
 'Stosujemy wybrane filtry…':['Applying your filters…','Применяем выбранные фильтры…','Застосовуємо вибрані фільтри…'],
 'Wróć do katalogu lotów':['Back to the flight catalog','Перейти в каталог перелётов','Перейти до каталогу перельотів'],
 'Sprawdź aktualne loty':['See current flights','Посмотреть актуальные перелёты','Переглянути актуальні перельоти'],
 'Oferty są chwilowo niedostępne. Spróbuj ponownie z tymi samymi warunkami.':['Offers are temporarily unavailable. Try again with the same search conditions.','Предложения временно недоступны. Повторите поиск с теми же условиями.','Пропозиції тимчасово недоступні. Повторіть пошук із тими самими умовами.'],
 'Wybierz inne lotnisko':['Choose another airport','Выбрать другой аэропорт','Вибрати інший аеропорт'],
 'Sprawdź inne długości pobytu':['Explore other stay lengths','Посмотреть другую длительность поездки','Переглянути іншу тривалість подорожі'],
 'Nie możemy teraz wczytać tej oferty.':['We cannot load this offer right now.','Сейчас не удалось загрузить это предложение.','Зараз не вдалося завантажити цю пропозицію.'],
 'Ta strona lub oferta nie jest dostępna. Sprawdź aktualny katalog.':['This page or offer is unavailable. Check the current catalog.','Эта страница или предложение недоступны. Посмотрите актуальный каталог.','Ця сторінка або пропозиція недоступні. Перегляньте актуальний каталог.'],
 'Nie udało się wczytać strony':['Could not load the page','Не удалось загрузить страницу','Не вдалося завантажити сторінку'],
 'Spróbuj ponownie lub przejdź do katalogu.':['Try again or go to the catalog.','Повторите попытку или перейдите в каталог.','Спробуйте ще раз або перейдіть до каталогу.'],
 'Popraw wybrane filtry':['Edit your filters','Исправить фильтры','Виправити фільтри'],
} as const;
export type StateKey=keyof typeof stateCopy;
export const stateText=(locale:Locale,key:StateKey)=>locale==='pl'?key:stateCopy[key][({en:0,ru:1,uk:2} as const)[locale]];
