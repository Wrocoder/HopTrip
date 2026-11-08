"""Fixed, localized viewport comparisons; never render raw event metadata."""

from html import escape

from app.schemas.analytics import AnalyticsLocale
from app.schemas.usage import ViewportCohortReport

COPY = {
    'title': ('Szerokość okna przy pierwszej obserwacji', 'Viewport at first observation',
              'Ширина окна при первом наблюдении', 'Ширина вікна за першого спостереження'),
    'note': (
        'Small: poniżej 768 CSS px; medium: 768–1023; large: od 1024. To okno, nie typ urządzenia. Pierwsze odebrane zdarzenie ustala kohortę w okresie; zmiana rozmiaru jej nie przenosi. Brak lub błędna wartość pozostaje unknown; starszych danych nie uzupełniamy. Nie zbieramy dokładnej szerokości ani User-Agent.',
        'Small: below 768 CSS px; medium: 768–1023; large: 1024 and above. This measures a viewport, not hardware. The first received event fixes the cohort in this period; resizing does not move it. Missing or invalid values stay unknown; legacy data is not backfilled. Exact width and User-Agent are not collected.',
        'Small: менее 768 CSS px; medium: 768–1023; large: от 1024. Это окно, не тип устройства. Первое полученное событие определяет когорту за период; изменение размера её не переносит. Пропуск или неверное значение остаётся unknown; старые данные не дополняются. Точная ширина и User-Agent не собираются.',
        'Small: менше 768 CSS px; medium: 768–1023; large: від 1024. Це вікно, не тип пристрою. Перша отримана подія визначає когорту за період; зміна розміру її не переносить. Пропуск або хибне значення лишається unknown; старі дані не доповнюються. Точна ширина та User-Agent не збираються.',
    ),
    'rules': (
        'Lejek zachowuje kolejność i kliknięcie tej samej oferty; odsetek dotyczy poprzedniego etapu. Działania: sesje ze zdarzeniem / wszystkie sesje kohorty, także bez PAGE_VIEW. Potwierdzenie alertu nie jest przypisane do konkretnego zapisu. To odebrane zdarzenia, nie osoby, rezerwacje ani dowód braku użycia. Porównuj okresy o takim samym pokryciu zbierania.',
        'The funnel preserves order and the same-offer click; rates use the previous stage. Actions: sessions with the event / all cohort sessions, including those without PAGE_VIEW. Alert confirmation is not attributed to a particular signup. These are received events, not people, bookings or proof of no usage. Compare periods with matching collection coverage.',
        'Воронка сохраняет порядок и клик по тому же предложению; доля считается от предыдущей ступени. Действия: сессии с событием / все сессии когорты, включая сессии без PAGE_VIEW. Подтверждение уведомлений не связано с конкретной заявкой. Это полученные события, не люди, брони или доказательство отсутствия использования. Сравнивайте периоды с одинаковым сбором.',
        'Воронка зберігає порядок і клік за тією самою пропозицією; частка рахується від попереднього етапу. Дії: сесії з подією / усі сесії когорти, зокрема без PAGE_VIEW. Підтвердження сповіщень не пов’язане з конкретною заявкою. Це отримані події, не люди, бронювання чи доказ відсутності використання. Порівнюйте періоди з однаковим збиранням.',
    ),
    'funnel': ('Lejek według szerokości okna', 'Funnel by viewport', 'Воронка по ширине окна', 'Воронка за шириною вікна'),
    'actions': ('Działania według szerokości okna', 'Actions by viewport', 'Действия по ширине окна', 'Дії за шириною вікна'),
    'viewport': ('Grupa okna', 'Viewport group', 'Группа окна', 'Група вікна'),
    'sessions': ('Sesje', 'Sessions', 'Сессии', 'Сесії'),
    'share': ('Udział wszystkich sesji', 'Share of all sessions', 'Доля всех сессий', 'Частка всіх сесій'),
    'small': ('Small — wąskie', 'Small — narrow', 'Small — узкое', 'Small — вузьке'),
    'medium': ('Medium — średnie', 'Medium — medium', 'Medium — среднее', 'Medium — середнє'),
    'large': ('Large — szerokie', 'Large — wide', 'Large — широкое', 'Large — широке'),
    'unknown': ('Unknown — brak danych', 'Unknown — not observed', 'Unknown — нет данных', 'Unknown — немає даних'),
    'page_view': ('Strona', 'Page view', 'Просмотр страницы', 'Перегляд сторінки'),
    'search': ('Wyszukiwanie', 'Search', 'Поиск', 'Пошук'),
    'positive_results': ('Niepusty wynik', 'Nonempty result', 'Непустой результат', 'Непорожній результат'),
    'deal_view': ('Oferta', 'Offer view', 'Просмотр предложения', 'Перегляд пропозиції'),
    'partner_click': ('Kliknięcie tej samej oferty', 'Same-offer click', 'Клик по тому же предложению', 'Клік за тією самою пропозицією'),
    'filter_use': ('Użycie filtrów', 'Filter use', 'Использование фильтров', 'Використання фільтрів'),
    'trip_save': ('Zapis planu', 'Plan saved', 'Сохранение плана', 'Збереження плану'),
    'budget_completion': ('Pełny budżet', 'Budget completed', 'Полный бюджет', 'Повний бюджет'),
    'alert_started': ('Prośba o alert', 'Alert requested', 'Запрос уведомлений', 'Запит сповіщень'),
    'alert_confirmed': ('Potwierdzenie alertu', 'Alert confirmed', 'Подтверждение уведомлений', 'Підтвердження сповіщень'),
    'empty': ('Brak obserwacji do porównania.', 'No observations to compare.', 'Нет наблюдений для сравнения.', 'Немає спостережень для порівняння.'),
}


def render_viewports(report: ViewportCohortReport | None, locale: AnalyticsLocale) -> str:
    if report is None:
        return ''
    index = {'pl': 0, 'en': 1, 'ru': 2, 'uk': 3}[locale]

    def text(key: str) -> str:
        return escape(COPY[key][index])

    def rate(value) -> str:
        return '—' if value is None else f'{value:.2f}%'.replace('.', ',' if locale != 'en' else '.')

    def table(key: str, headings: list[str], rows: list[str]) -> str:
        if not rows:
            return f'<p class="notice">{text("empty")}</p>'
        headers = ''.join(f'<th scope="col">{text(name)}</th>' for name in headings)
        return (f'<div class="table-scroll" role="region" aria-label="{text(key)}" tabindex="0">'
                f'<table><caption>{text(key)}</caption><thead><tr>{headers}</tr></thead>'
                f'<tbody>{"".join(rows)}</tbody></table></div>')

    funnels, actions = [], []
    for row in report.rows:
        first = f'<th scope="row">{text(row.viewport)}</th><td>{row.sessions}</td>'
        steps = ''.join(f'<td>{step.sessions}<br>{rate(step.percent)}</td>'
                        for step in row.ordered_funnel.steps)
        funnels.append(f'<tr data-viewport="{row.viewport}">{first}'
                       f'<td>{rate(row.percent)}</td>{steps}</tr>')
        cells = ''.join(f'<td>{item.numerator} / {item.denominator}<br>{rate(item.percent)}</td>'
                        for item in row.metrics)
        actions.append(f'<tr data-viewport="{row.viewport}">{first}{cells}</tr>')
    funnel_table = table('funnel', ['viewport', 'sessions', 'share', 'page_view', 'search',
                                  'positive_results', 'deal_view', 'partner_click'], funnels)
    action_table = table('actions', ['viewport', 'sessions', 'filter_use', 'trip_save',
                                    'budget_completion', 'alert_started', 'alert_confirmed'], actions)
    return (f'<section data-viewport-cohorts="{report.version}"><h2>{text("title")}</h2>'
            f'<p class="notice">{text("note")}</p><p>{text("rules")}</p>'
            f'{funnel_table}{action_table}</section>')
