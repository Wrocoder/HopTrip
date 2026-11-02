"""Self-contained, script-free, localized admin report; no identifiers or credentials."""

from html import escape
from typing import Literal

from app.schemas.usage import UsageReport

DashboardLocale = Literal["pl", "en", "ru", "uk"]
LANG_INDEX = {"pl": 0, "en": 1, "ru": 2, "uk": 3}
UI = {
    "title": ("HopTrip — korzystanie z serwisu", "HopTrip — product usage", "HopTrip — использование сервиса", "HopTrip — використання сервісу"),
    "skip": ("Przejdź do raportu", "Skip to report", "К отчёту", "До звіту"),
    "period": ("Okres obserwacji (UTC)", "Observation period (UTC)", "Период наблюдений (UTC)", "Період спостережень (UTC)"),
    "sessions": ("Zaobserwowane sesje", "Observed sessions", "Наблюдаемые сессии", "Спостережувані сесії"),
    "events": ("Odebrane zdarzenia produktu", "Received product events", "Полученные события продукта", "Отримані події продукту"),
    "coverage": ("Tylko odebrane zdarzenia. Zgoda, blokady i sieć ograniczają próbę. Sesja nie oznacza osoby; brak danych nie oznacza zerowej konwersji.", "Received events only. Consent, blockers and the network limit coverage. A session is not a person; missing data does not mean zero conversion.", "Только полученные события. Согласие, блокировки и сеть ограничивают выборку. Сессия не равна человеку; отсутствие данных не означает нулевую конверсию.", "Лише отримані події. Згода, блокування й мережа обмежують вибірку. Сесія не дорівнює людині; відсутність даних не означає нульову конверсію."),
    "no_data": ("Brak obserwacji do obliczenia", "No observations to calculate", "Нет наблюдений для расчёта", "Немає спостережень для розрахунку"),
    "unavailable": ("Dane nie są zbierane", "Data are not collected", "Данные не собираются", "Дані не збираються"),
    "count": ("Licznik / mianownik", "Numerator / denominator", "Числитель / знаменатель", "Чисельник / знаменник"),
    "entry": ("Pierwszy zaobserwowany typ strony", "First observed page type", "Первый наблюдаемый тип страницы", "Перший спостережуваний тип сторінки"),
    "proxy": ("Przybliżenie wejścia: pierwszy PAGE_VIEW odebrany w tym okresie. To typ strony, nie landing URL; obserwacja może zacząć się w środku sesji. Kliknięcia liczymy dopiero po tym wejściu.", "Entry proxy: the first PAGE_VIEW received in this period. This is a page type, not a landing URL; observation may start mid-session. Only later partner clicks count.", "Приближение входа: первый PAGE_VIEW, полученный за этот период. Это тип страницы, не landing URL; наблюдение может начаться в середине сессии. Учитываются только последующие партнёрские клики.", "Наближення входу: перший PAGE_VIEW, отриманий за цей період. Це тип сторінки, не landing URL; спостереження може початися посеред сесії. Враховуються лише наступні партнерські кліки."),
    "page": ("Typ strony", "Page type", "Тип страницы", "Тип сторінки"),
    "partner": ("Sesje z późniejszym kliknięciem partnera", "Sessions with a later partner click", "Сессии с последующим кликом к партнёру", "Сесії з наступним кліком до партнера"),
    "rate": ("Udział", "Rate", "Доля", "Частка"),
    "quality": ("Jakość danych", "Data quality", "Качество данных", "Якість даних"),
    "excluded": ("Pominięte zdarzenia techniczne, nieznane lub bez sesji", "Excluded technical, unknown or placeholder-session events", "Исключённые технические, неизвестные события или сессии-заглушки", "Виключені технічні, невідомі події або сесії-заглушки"),
    "invalid": ("Wyniki wyszukiwania bez poprawnego statusu", "Search results without a valid outcome", "Результаты поиска без корректного исхода", "Результати пошуку без коректного результату"),
    "unlinked": ("Otwarcia szczegółów bez powiązania z ofertą", "Detail views without an offer association", "Открытия подробностей без привязки к предложению", "Відкриття подробиць без прив’язки до пропозиції"),
    "empty": ("W tym okresie nie odebrano zdarzeń produktu.", "No product events were received in this period.", "За этот период события продукта не получены.", "За цей період події продукту не отримані."),
    "limits": ("Nie porównuj różnych definicji i okresów zbierania. Brak identyfikatora wyszukiwania wyklucza dokładną atrybucję. Kliknięcie nie oznacza rezerwacji ani prowizji. Dane przy wejściu publicznym nie stanowią dowodu zgody.", "Compare only matching definitions and collection periods. There is no search identifier for exact attribution. A click is not a booking or commission. Public event submissions do not prove consent.", "Сравнивайте только одинаковые определения и периоды сбора. Идентификатора поиска для точной атрибуции нет. Клик не означает бронь или комиссию. Публичная отправка событий не доказывает согласие.", "Порівнюйте лише однакові визначення й періоди збору. Ідентифікатора пошуку для точної атрибуції немає. Клік не означає бронювання чи комісію. Публічне надсилання подій не доводить згоду."),
}
METRICS = {
    "search_initiation": (("Rozpoczęcie wyszukiwania", "Search initiation", "Начало поиска", "Початок пошуку"),
        ("Sesje z wysłanym wyszukiwaniem / wszystkie zaobserwowane sesje produktu.", "Sessions with a submitted search / all observed product sessions.", "Сессии с отправленным поиском / все наблюдаемые сессии продукта.", "Сесії з надісланим пошуком / усі спостережувані сесії продукту.")),
    "search_success": (("Niepuste wyniki", "Non-empty results", "Непустые результаты", "Непорожні результати"),
        ("Niepuste wyniki / wszystkie poprawnie opisane wyniki, także błędy. Proxy sukcesu: obejmuje bezpośrednie wejścia i paginację, nie tylko wysłane wyszukiwania.", "Non-empty results / all valid outcomes, including errors. A success proxy: includes direct visits and pagination, not only submitted searches.", "Непустые выдачи / все корректно описанные исходы, включая ошибки. Приближение успешности: включает прямые входы и страницы выдачи, а не только отправленные поиски.", "Непорожні видачі / усі коректно описані результати, включно з помилками. Наближення успішності: охоплює прямі входи й сторінки видачі, а не лише надіслані пошуки.")),
    "empty_results": (("Puste wyniki", "Empty results", "Пустые результаты", "Порожні результати"),
        ("Puste wyniki / wyniki załadowane bez błędu. Błąd nie oznacza zera ofert.", "Empty results / successfully loaded results. Errors are not zero offers.", "Пустые выдачи / выдачи, загруженные без ошибки. Ошибка не считается нулём предложений.", "Порожні видачі / видачі, завантажені без помилки. Помилка не вважається нулем пропозицій.")),
    "result_errors": (("Błędy wyników", "Result errors", "Ошибки выдачи", "Помилки видачі"),
        ("Wyniki z błędem / wszystkie poprawnie opisane wyniki.", "Error outcomes / all valid result outcomes.", "Исходы с ошибкой / все корректно описанные исходы выдачи.", "Результати з помилкою / усі коректно описані результати видачі.")),
    "detail_opening": (("Otwarcie szczegółów", "Offer details opened", "Открытие подробностей", "Відкриття подробиць"),
        ("Sesje z otwarciem oferty / wszystkie sesje produktu. To nie CTR wyświetleń kart.", "Sessions with a detail view / all product sessions. This is not impression CTR.", "Сессии с открытием предложения / все сессии продукта. Это не CTR показов карточек.", "Сесії з відкриттям пропозиції / усі сесії продукту. Це не CTR показів карток.")),
    "affiliate_ctr": (("Oferta → partner", "Offer → partner", "Предложение → партнёр", "Пропозиція → партнер"),
        ("Pary (sesja, oferta) z kliknięciem po obejrzeniu szczegółów / wszystkie obejrzane pary. Kliknięcia innej oferty lub przed otwarciem nie liczą się.", "Session–offer pairs with a partner click after a detail view / viewed pairs. Different offers and clicks before the view do not count.", "Пары (сессия, предложение) с кликом после открытия подробностей / просмотренные пары. Другое предложение и клик до просмотра не считаются.", "Пари (сесія, пропозиція) з кліком після відкриття подробиць / переглянуті пари. Інша пропозиція та клік до перегляду не враховуються.")),
    "trip_save": (("Zapisanie planu", "Trip saving", "Сохранение плана", "Збереження плану"),
        ("Sesje z udanym zapisem nowego planu / wszystkie sesje produktu.", "Sessions with a successful new-plan save / all product sessions.", "Сессии с успешным сохранением нового плана / все сессии продукта.", "Сесії з успішним збереженням нового плану / усі сесії продукту.")),
    "budget_usage": (("Użycie kalkulatora", "Budget calculator usage", "Использование калькулятора", "Використання калькулятора"),
        ("Sesje z pierwszą poprawną zmianą pola kalkulatora / wszystkie sesje. Nie oznacza kompletnego budżetu.", "Sessions with a first valid calculator edit / all sessions. Does not imply a complete budget.", "Сессии с первым корректным изменением поля калькулятора / все сессии. Это не признак полного бюджета.", "Сесії з першою коректною зміною поля калькулятора / усі сесії. Це не ознака повного бюджету.")),
    "event_engagement": (("Wydarzenia i atrakcje", "Events and attractions", "События и достопримечательности", "Події та пам’ятки"),
        ("Sesje z kliknięciem wydarzenia lub atrakcji / wszystkie sesje. Sesja liczona raz.", "Sessions with an event or attraction click / all sessions. Each session counts once.", "Сессии с кликом по событию или достопримечательности / все сессии. Каждая сессия учитывается один раз.", "Сесії з кліком по події або пам’ятці / усі сесії. Кожна сесія враховується один раз.")),
    "returning_visitors": (("Powracający odwiedzający", "Returning visitors", "Вернувшиеся посетители", "Відвідувачі, що повернулися"),
        ("Brak trwałego identyfikatora osoby. Nie wnioskuj z sesji ani adresu IP.", "No persistent visitor identifier. Do not infer this from sessions or IP addresses.", "Постоянного идентификатора посетителя нет. Нельзя выводить возвращаемость из сессий или IP.", "Постійного ідентифікатора відвідувача немає. Не можна визначати повернення із сесій або IP.")),
    "device_funnel": (("Mobile / desktop", "Mobile / desktop", "Mobile / desktop", "Mobile / desktop"),
        ("Typ urządzenia nie jest zbierany. Nie klasyfikujemy go na podstawie niepowiązanych żądań.", "Device type is not collected. Unrelated requests are not a source of classification.", "Тип устройства не собирается. Несвязанные запросы не используются для классификации.", "Тип пристрою не збирається. Непов’язані запити не використовуються для класифікації.")),
}
# Fixed labels only: never render arbitrary metadata values.
PAGES = {
    "home": ("Główna", "Home", "Главная", "Головна"),
    "catalog": ("Katalog", "Catalog", "Каталог", "Каталог"),
    "deal": ("Oferta", "Offer", "Предложение", "Пропозиція"),
    "guide": ("Poradnik", "Guide", "Путеводитель", "Путівник"),
    "city_break": ("City break", "City break", "Короткая поездка", "Коротка подорож"),
    "weekend": ("Weekend", "Weekend", "Выходные", "Вихідні"),
    "origin": ("Lotnisko wylotu", "Origin airport", "Аэропорт вылета", "Аеропорт вильоту"),
    "destination": ("Kierunek", "Destination", "Направление", "Напрямок"),
    "route": ("Trasa", "Route", "Маршрут", "Маршрут"),
    "budget": ("Kalkulator", "Calculator", "Калькулятор", "Калькулятор"),
    "saved_trip": ("Plan podróży", "Trip plan", "План поездки", "План подорожі"),
    "saved": ("Zapisane", "Saved trips", "Сохранённые", "Збережені"),
    "alerts": ("Powiadomienia", "Alerts", "Уведомления", "Сповіщення"),
    "unclassified": ("Nieznany typ", "Unclassified type", "Неизвестный тип", "Невідомий тип"),
    "not_observed": ("Nie zaobserwowano wejścia", "Entry not observed", "Вход не наблюдался", "Вхід не спостерігався"),
}


def render_usage(report: UsageReport, locale: DashboardLocale = "pl") -> str:
    index = LANG_INDEX[locale]

    def t(key: str) -> str:
        return escape(UI[key][index])

    def rate(value) -> str:
        return "—" if value is None else escape(f"{value:.2f}".replace(".", "," if locale != "en" else ".")) + "%"

    cards = []
    for item in report.metrics:
        labels, descriptions = METRICS[item.key]
        detail = (f"{item.numerator} / {item.denominator}" if item.status == "available"
                  else t("unavailable" if item.status == "unavailable" else "no_data"))
        cards.append(f'<li data-metric="{escape(item.key)}"><h2>{escape(labels[index])}</h2>'
                     f'<p class="rate">{rate(item.percent)}</p><p>{t("count")}: {detail}</p>'
                     f'<p>{escape(descriptions[index])}</p></li>')
    rows = "".join(f'<tr><th scope="row">{escape(PAGES[row.page_type][index])}</th>'
                   f'<td>{row.sessions}</td><td>{row.partner_sessions if row.partner_sessions is not None else "—"}</td>'
                   f'<td>{rate(row.percent)}</td></tr>' for row in report.page_cohorts)
    empty = f'<p class="notice">{t("empty")}</p>' if not report.observed_events else ""
    return f'''<!doctype html>
<html lang="{locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow,nosnippet"><meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>{t("title")}</title><style>
:root{{color-scheme:light}}*{{box-sizing:border-box}}body{{margin:0;background:#f4f6f4;color:#203332;font:1rem/1.6 system-ui,sans-serif}}
a{{color:#135c42}}a:focus-visible,[tabindex]:focus-visible{{outline:3px solid #704800;outline-offset:4px}}main{{max-width:80rem;margin:auto;padding:1.5rem}}
h1{{font-size:clamp(1.7rem,5vw,2.5rem);line-height:1.25}}h2{{font-size:1.2rem}}p{{overflow-wrap:anywhere}}.skip{{display:block;padding:.5rem 1.5rem}}
.metrics{{list-style:none;margin:1.5rem 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,19rem),1fr));gap:1rem}}
.metrics li,.notice{{border:1px solid #b8c6be;border-radius:.75rem;padding:1rem;background:#fff}}.rate{{font-size:2rem;font-weight:700;margin:.3rem 0}}
.table-scroll{{overflow-x:auto}}table{{width:100%;border-collapse:collapse;background:#fff}}th,td{{text-align:left;padding:.7rem;border-bottom:1px solid #b8c6be}}
caption{{text-align:left;font-weight:700;padding:.5rem 0}}dt{{font-weight:600}}dd{{margin:0 0 .6rem}}
</style></head><body><a class="skip" href="#report">{t("skip")}</a><main id="report" tabindex="-1">
<h1>{t("title")}</h1><p>{t("period")}: {escape(report.start.isoformat())} ≤ t &lt; {escape(report.end.isoformat())}</p>
<p>{t("sessions")}: <strong>{report.observed_sessions}</strong> · {t("events")}: <strong>{report.observed_events}</strong></p>
<p class="notice">{t("coverage")}</p>{empty}<ul class="metrics">{"".join(cards)}</ul>
<h2>{t("entry")}</h2><p>{t("proxy")}</p><div class="table-scroll" role="region" aria-label="{t("entry")}" tabindex="0">
<table><caption>{t("entry")}</caption><thead><tr><th scope="col">{t("page")}</th><th scope="col">{t("sessions")}</th><th scope="col">{t("partner")}</th><th scope="col">{t("rate")}</th></tr></thead><tbody>{rows}</tbody></table></div>
<h2>{t("quality")}</h2><dl><dt>{t("excluded")}</dt><dd>{report.excluded_events}</dd><dt>{t("invalid")}</dt><dd>{report.invalid_results}</dd><dt>{t("unlinked")}</dt><dd>{report.unlinked_detail_views}</dd></dl>
<p>{t("limits")}</p></main></body></html>'''
