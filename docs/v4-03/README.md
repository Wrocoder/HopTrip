# V4-03 — отдельный рейтинг удобства поездки

Дата: 2026-11-07. **V4-03 DONE локально.** [Результаты проверок](verification.json). Deployment не выполнялся.

## Поведение

Добавлен `trip_quality_score` (целое 0–100 или null) и подробная `trip_quality` версии `trip-quality-v1`. Это **модель удобства**, не историческая привлекательность цены, не live availability и не подтверждённое время прогулок. Функция принимает FlightFacts, FlightQuality, WeekendAssessment и ConnectionAssessment; цены/медианы/исторический score в её входах отсутствуют.

Общий каталог получил явную сортировку `sort=recommended` («Polecane / Recommended / Рекомендуемые / Рекомендовані»). Она вычисляется по всей отфильтрованной выборке до offset/limit/total. Цена используется только при равенстве удобства. Старые `price`, `departure`, `score`, `destination_time`, legacy weekend, exact weekend и текущая цена по умолчанию сохранены. Новые рекомендации главной не переводились автоматически на иной порядок.

## Правила scoring v1

| Компонент | Вес default | Процент от веса |
|---|---:|---|
| Полнота данных | 15 | COMPLETE: 100%; PARTIAL: 50%; критически неполный source не получает числовой score вообще |
| Время в пути | 20 | Сумма реального elapsed outbound + return, включая пересадки, но без пребывания: до 240 мин — 100%; от 1440 мин — 0%; между границами линейное убывание. При прилёте домой в 00:00–06:00 (06:00 не включается, локальное время дома) процент умножается на 50% |
| Время на месте | 30 | Дневное модельное время V4-01 / 1680 мин, максимум 100%; при ночном прилёте или раннем возврате процент умножается на 50% |
| Пересадки | 15 | 100% минус штрафы за каждую: 20 п.п. базовый, ещё 40 за long, 25 за night, 50 за risky; минимум 0% |
| Аэропорты | 10 | 100% минус 50 п.п. за разные аэропорты назначения/обратного вылета и 50 за разные аэропорты исходного вылета/прилёта домой |
| Рабочие часы/отпуск | 10 | might_require_leave=false: 100%; true: 0%; unknown: нет баллов и явная неизвестность |

Время в пути используется только при полной валидной хронологии, известных локальных датах всех четырёх endpoint и фактических, не расчётных arrival times. Daytime используется только при таком же качестве времени и известной оценке пребывания V4-01. Это модель окна 08:00–22:00 с условными буферами, **не реальное sightseeing time**; поле `destination_time.usable_city_minutes` не менялось.

Для пересадок полные баллы доступны только при KNOWN connection assessment. PARTIAL (например, неизвестная зона) и UNKNOWN дают 0, а не оптимистичное отсутствие риска. Защита/самостоятельный трансфер остаются UNKNOWN по V4-02, не выводятся из carrier/ticket link и не объявляются гарантированными. Airport gap внутри journey сохраняет строгую CRITICAL_INCOMPLETE классификацию, поэтому не получает score.

Каждый процент ограничивается 0–100. Баллы компонента: `floor(weight * percent / 100)`. Итог: `floor(100 * sum(points) / sum(weights))`. Веса не перераспределяются при неизвестных данных: неизвестный компонент имеет 0 points и `known=false`. Причины UNKNOWN_* доступны в explanation. Неполнота source обозначается отдельно PARTIAL_SOURCE_DATA.

- KNOWN: все шесть компонент известны и source COMPLETE.
- PARTIAL: source PARTIAL или часть данных неизвестна; score остаётся числовым, неизвестное не получает нейтральных баллов.
- UNKNOWN: source/контекст критически неполон или противоречив; score=null, components пустой. Такие оферты сохраняются в каталоге, в конце Recommended.

PARTIAL не является запретом выдачи и не означает среднюю безопасность. Числовой 0 отличается от null и сортируется выше отсутствующей оценки. Статусы описывают данные модели; даже KNOWN/100 не подтверждает bookability, защищённость пересадки, фактическую скорость трансферов или отсутствие отпуска с учётом дороги.

## Конфигурация

`Settings.trip_quality_policy` / JSON-переменная `TRIP_QUALITY_POLICY`. Можно переопределить отдельные поля:

```text
TRIP_QUALITY_POLICY={"weights":{"usable_time":40,"travel":25},"target_usable_minutes":1800,"good_travel_minutes":240,"bad_travel_minutes":1440}
```

Неуказанные веса/пороги используют defaults. Все веса 0–100, их сумма должна быть положительной; длительности travel 0–20160 / 1–20160, bad > good; target usable 1–10080. Процентные коэффициенты/штрафы 0–100. Все параметры и веса возвращаются в explanation: `weights`, `good_travel_minutes`, `bad_travel_minutes`, `target_usable_minutes`, `inconvenient_stay_percent`, `night_home_travel_percent`, `connection_penalty_percent`, `long_connection_penalty_percent`, `night_connection_penalty_percent`, `risky_connection_penalty_percent`, `airport_change_penalty_percent`.

Это начальная продуктовая политика для последующей проверки пользователями, не вывод из реальных исследований. Production env не менялся. Калькулятор бюджета, модель цены/история и notifications не изменялись.

## Порядок, точность и совместимость

Recommended: numeric score DESC; null в конце; ties — flight price/person PLN ASC, departure date ASC, ID ASC. Все прежние SQL-фильтры применяются до оценки. Exact weekend/custom work hours входят в ту же оценку, что возвращается в list; detail без custom query использует прежние defaults.

Переиспользован batch metadata snapshot: deals/components/offers/airports/aliases получаются одним SQL, без N+1 на весь candidate scan. Предел — **500 отфильтрованных кандидатов**, прежний MAX_WEEKEND_CANDIDATES. При превышении возвращается 422/TRIP_QUALITY_QUERY_TOO_BROAD; нет молчаливого усечения и неверного total. Можно сузить запрос или выбрать price. При старом сервере/ответе без нового metadata клиент показывает отдельную ошибку TRIP_QUALITY_UNSUPPORTED, а не выдаёт старый price-order за Recommended.

Score рассчитывается при чтении, без нового DB column, миграции, backfill или изменения `deal_score`/price history. API list и include_total envelope сохранены. Старые payloads без нового поля допустимы для прежних сортировок. Client contract проверяет границы score, шесть уникальных компонент, max weights, unknown points=0, воспроизводимую сумму и совпадение top-level score с explanation.

На card/detail показан отдельный локализованный «индекс удобства (модель)» с PARTIAL/UNKNOWN. Объяснение Recommended перечисляет шесть критериев и отделяет историческую цену. Query/пагинация/история, noindex/canonical для non-default sort сохраняются существующей системой SEO.

## Файлы

Новые runtime:

- `apps/api/app/schemas/trip_quality.py`, `apps/api/app/services/trip_quality.py`.
- `apps/web/src/lib/trip-quality.ts`.

Изменённые runtime:

- API `config.py`, `schemas/deal.py`, `services/catalog.py`, `services/weekend_catalog.py`, `api/catalog.py`.
- Web `src/lib/api.ts`, `api-contract.ts`, `i18n/filter-copy.ts`; `src/app/components/filters.tsx`, `flight-schedule.tsx`; `src/app/deals/page.tsx`.

Тесты:

- Новые API `test_trip_quality.py`, `test_recommended_sort.py` (25 cases).
- Новые web `trip-quality.test.mjs`, `trip-quality.spec.ts`.
- Дополнены `api-response.test.mjs`, `api-client-contract.test.mjs`, `sorting.spec.ts` (5 options вместо 4).
- Test-only ответы для cap/unsupported в `apps/api/tests/e2e_app.py`; реальные cap/filters/order проверены backend integration, не заменены mock.
- Этот отчёт, V4 progress и verification. Исходные затронутые существующие файлы сохранены локально в `.cache/v4-03-before`; пользовательские изменения не откатывались.

## Проверки

| Проверка | Результат |
|---|---|
| До реализации | 12 новых unit FAIL: trip quality model отсутствовала |
| Focused API regression | 59 PASS до добавления ещё четырёх critical-context cases; проверены V4-01/destination sort compatibility |
| Полный API | Первоначально 1318 PASS/18 PG skip; после обнаруженного night-home counterexample **1319 PASS, 18 PostgreSQL SKIP**, две прежние deprecation warnings; финальный focused 25 PASS |
| Node full suite | **356 PASS**; после дополнительного old-API guard assertion targeted client suite 17 PASS |
| Ruff | PASS, весь apps/api |
| mypy | PASS, 126 source files |
| ESLint | PASS |
| Production build/TypeScript | PASS, 61 static entries |
| Browser | Первый набор **38/38 PASS**, Recommended + прежние sorting/destination_time/connections; после night-home коэффициента финальный Recommended **12/12 PASS**, без skip/flaky |
| Итог browser | **38 уникальных cases PASS по последним результатам**: 26 прежних сортировок/предупреждений из первого набора + 12 финальных Recommended; это не полный inventory |

Unit/integration покрывают шесть критериев, configurable weights/env/invalid policy, отсутствие влияния цены/history, missing/estimated/DST, airport changes, night/early, connection flags, отпуск, критические контексты, score=0 против null, глобальную пагинацию/total/tie-breaks, пользовательские часы, candidate cap/сужение фильтров, one-query batch и list/detail parity. Исторические DB score/version/components не меняются при чтении.

Визуальная проверка EN320 первого прогона выявила высокий score у возвращения домой после полуночи: дополнительные часы на месте могли полностью компенсировать неудобство. Добавленный regression воспроизвёл 98 > 94 для такого примера при одинаковой длительности перелётов. Введён отдельный `night_home_travel_percent=50` с причиной NIGHT_HOME_ARRIVAL; финальный focused набор подтверждает снижение score. Browser теперь дополнительно проверяет, что fixture с вечерним возвращением выше понедельничного ночного. Обновлены формула, applied policy, клиентский контракт и проверки; модель не стала ценовой оценкой.

Финальный EN320 screenshot просмотрен: первая рекомендуемая fixture возвращается в воскресенье, индекс 95/100; прежняя с ночным понедельничным возвращением больше не получает преимущество. Проверены четыре языка, правильный global order первой/следующей страниц, reload/history, detail/back context, ошибки cap/unsupported с возможностью выбрать price, server-rendered labels/selected sort/canonical/noindex без JavaScript, 320px и scoped axe без нарушений. Генерируемый `next-env.d.ts` восстановлен точно к состоянию перед задачей; fixture-серверы завершены.

Команды из корня (web — из apps/web):

```text
.venv/Scripts/python.exe -m pytest -q --tb=short -p no:cacheprovider --junitxml=.cache/v4-03-api.xml
.venv/Scripts/python.exe -m ruff check apps/api
.venv/Scripts/python.exe -m mypy
node --experimental-strip-types --test --test-reporter=dot tests/*.test.mjs
npm run lint
npm run build
```

Browser: существующий Playwright, local-only fixture servers, предварительно проверенный PyCharm SDK Python3.12.10 через HOPTRIP_TEST_PYTHON, PLAYWRIGHT_CHANNEL=chrome; первый набор `trip-quality.spec.ts sorting.spec.ts destination-time.spec.ts connections.spec.ts`, финальный — `trip-quality.spec.ts`. Полные локальные артефакты — `.cache/v4-03-api.xml`, `.cache/v4-03-api-final.xml`, `.cache/v4-03-browser.json`, `.cache/v4-03-browser-final.json`.

Не выполнялись PG, полный browser inventory/WebKit, live provider checks, Lighthouse/field CWV или пользовательская оценка весов. Продуктовый score — явная модель, а не доказательство роста конверсии. Production/DB/paid integrations не менялись, уведомления не отправлялись, deployment не выполнялся.

## Откат и следующий шаг

Вернуть только перечисленные runtime/test-файлы к состоянию перед V4-03, сохранив V4-01/02 и пользовательские правки; DB downgrade не нужен. Прежний price default остаётся доступным. Следующая отдельная задача после V4-03 — **V4-04: партнёрские переходы**; в этом запуске она не начинается.
