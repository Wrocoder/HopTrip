import type {Locale} from './config';
export const freshnessCopy:Record<Locale,Record<"delivery"|"deliveryNote"|"details"|"hidden"|"rule"|"notLive"|"expired"|"refresh"|"zone"|"unknown",string>>={
  "pl": {
    "delivery": "Pobrano rekord",
    "deliveryNote": "Ponowne pobranie nie oznacza nowej obserwacji ceny.",
    "details": "Pochodzenie i czas wycofania oferty",
    "hidden": "Wycofanie z katalogu najpóźniej",
    "rule": "Limit od obserwacji: {hours} h. Skracamy go przy zbliżającym się wylocie; wcześniejsze wygaśnięcie także obowiązuje.",
    "notLive": "Dostępność i ostateczną cenę sprawdź u partnera. Bez potwierdzenia na żywo.",
    "expired": "Upłynął czas prezentacji tej oferty. Sprawdź katalog ponownie.",
    "refresh": "Odśwież stronę",
    "zone": "czas w Polsce",
    "unknown": "czas nieznany"
  },
  "en": {
    "delivery": "Record retrieved",
    "deliveryNote": "Retrieving again does not mean a new price observation.",
    "details": "Price origin and catalogue expiry",
    "hidden": "Hidden from the catalogue no later than",
    "rule": "Maximum time since observation: {hours} h. The limit shortens as departure approaches; an earlier expiry also applies.",
    "notLive": "Check availability and the final price with the partner. Not verified live.",
    "expired": "This offer has reached its display deadline. Check the catalogue again.",
    "refresh": "Refresh page",
    "zone": "Poland time",
    "unknown": "time unknown"
  },
  "ru": {
    "delivery": "Запись загружена",
    "deliveryNote": "Повторная загрузка не означает новое наблюдение цены.",
    "details": "Происхождение цены и срок показа",
    "hidden": "Скрытие из каталога не позднее",
    "rule": "Срок от наблюдения: {hours} ч. Он сокращается при приближении вылета; более раннее истечение срока также учитывается.",
    "notLive": "Наличие мест и окончательную цену уточняйте у партнёра. Проверки в реальном времени нет.",
    "expired": "Срок показа предложения истёк. Проверьте каталог снова.",
    "refresh": "Обновить страницу",
    "zone": "время в Польше",
    "unknown": "время неизвестно"
  },
  "uk": {
    "delivery": "Запис завантажено",
    "deliveryNote": "Повторне завантаження не означає нове спостереження ціни.",
    "details": "Походження ціни та строк показу",
    "hidden": "Приховування з каталогу не пізніше",
    "rule": "Строк від спостереження: {hours} год. Він скорочується з наближенням вильоту; раніше закінчення строку також враховується.",
    "notLive": "Наявність місць і остаточну ціну уточнюйте в партнера. Перевірки в реальному часі немає.",
    "expired": "Строк показу пропозиції минув. Перевірте каталог знову.",
    "refresh": "Оновити сторінку",
    "zone": "час у Польщі",
    "unknown": "час невідомий"
  }
};
