# H3-01b — точная серверная фильтрация weekend-v1, 2026-11-03

**H3-01b DONE:** закрывает серверную интеграцию. Общая H3-01 остаётся IN_PROGRESS; следующий отдельный запуск **H3-01c** подключает UI/URL/landing/presets на четырёх языках. Разделение уточнено после изучения пагинации: текущий SQL по Deal dates не эквивалентен проверке сегментов и зон. Фильтрация уже полученной страницы дала бы неверные total и пропуски результатов. Поэтому backend correctness и browser UX проверяются последовательно. Коммит/deploy не выполнялись.

## Контракт

Существующий `/api/v1/deals` принимает opt-in параметры:

| Параметр | Значения / смысл |
|---|---|
| `weekend_mode` | `calendar-v1`, `flexible-v1`, `no-leave-v1`; отсутствие сохраняет прежнее поведение |
| `work_start`, `work_end` | Локальные часы работы в зоне исходного аэропорта, только с `no-leave-v1`; default 09:00/17:00; Pydantic time без timezone, возрастающий дневной интервал |
| `weekend` | Старый boolean с прежними датами вылетов. `true` вместе с новым mode → 422, чтобы один режим не сужал другой незаметно |

Пример: `/api/v1/deals?weekend_mode=no-leave-v1&work_start=07:00&work_end=15:00&origin=WRO&budget=300&include_total=true&limit=12&offset=0`.

Версия встроена в значения mode; assessment сохраняет `weekend-v1`. Ответы list и items/total/offset/limit совместимы. `weekend_assessment` выбранной страницы отражает **переданные** часы работы. Детальная страница без этих параметров продолжает показывать default assessment; никакие пользовательские настройки на сервере не сохраняются.

Чистый predicate H3-01a используется без новой трактовки: calendar — Friday/Saturday → same Sunday; flexible — Thursday/Friday/Saturday → Sunday/Monday в пределах 1–4 дней; no-leave дополнительно требует полную подтверждённую хронологию, Sunday arrival в тот же аэропорт и отсутствие пересечения рабочих часов. Unknown/estimated и другой аэропорт не подтверждают no-leave. Это оценка airport times, не гарантия с учётом дороги, регистрации и border time.

Ошибки HTTP 422 с `detail.code`:

- `CONFLICTING_WEEKEND_FILTERS`: legacy true вместе с новым mode.
- `WORK_HOURS_REQUIRE_NO_LEAVE`: часы без no-leave.
- `INVALID_WORK_HOURS`: равные/обратные/с timezone часы; malformed time и неизвестный mode также получают штатный validation 422.
- `WEEKEND_QUERY_TOO_BROAD`: после обычных SQL-фильтров остаётся более **500 кандидатов**; уточнить origin/destination/dates/budget/duration. Не зависит от limit/offset или числа совпадений нового режима. Legacy запросы этого ограничения не имеют.

## Точность, ресурсные границы и совместимость

Обычные freshness/availability/origin/destination/date/price/duration/round-trip SQL-фильтры сохраняются. Новый mode оценивает кандидатов **до** offset/limit и total. Deal dates не используются как замена времени сегментов для новых weekend predicates; обычный явно заданный date/duration filter продолжает иметь свой прежний смысл.

`weekend_catalog.py` получает одним SQL snapshot CTE кандидатов и joined компоненты, source offers, origin/destination и provider-scoped destination aliases. Candidate limit применяется **до** fan-out join, поэтому несколько alias/компонентов не отрезают маршрут. Quality gate использует тот же classifier и правила контекста, что serializer: несколько FLIGHT компонентов, несовпадение контекста, повреждённая/чужая source metadata не сертифицируются. Совпадение batch assessment с публичным serializer проверяется тестом.

Оценка кандидатов не вызывает полный serializer на каждом предложении и не создаёт N+1 SQL-запросов по каталогу. Полный существующий serializer вызывается только для выбранной страницы (максимум 100 элементов) с прежними component/affiliate правилами. После join восстанавливается price/departure/score order с прежними tie-break полями. Total вычисляется по всем точным совпадениям, в том числе при пустой странице и offset за концом.

Лимит 500 — явная ресурсная граница точной неперсистентной оценки, **не** отсечение выдачи с неполным total. При 501+ кандидате API не возвращает частичный list/page. Это осознанное ограничение новой opt-in возможности. Его нельзя скрыть или заменить пустым результатом в UI H3-01c. Перед расширением лимита нужны реальные данные и измерения; возможный persisted index потребует отдельного решения/миграции и поддержки work hours. Произвольный полный каталог пока не поддерживается новым mode.

UI, query forwarding web-клиента, SEO/canonical/hreflang, presets/chips, saved/share v1, alerts matching/dispatch, consent, analytics и dependencies в этой части не меняются. Старые ссылки и boolean остаются прежними. Новых пользовательских строк нет, только машинные значения и OpenAPI descriptions. H3-01c обязана подключить PL/EN/RU/UK и не обещать no-leave гарантию.

## Проверки

SDK PyCharm: Python 3.12.10 `.venv/Scripts/python.exe`. Dependencies не устанавливались.

| Проверка | Результат / evidence |
|---|---|
| `-m pytest -q -p no:cacheprovider tests/test_weekend_catalog.py tests/test_weekend_assessment.py tests/test_trip_filters.py` (пути относительно apps/api) | **65 passed** до добавления четырёх sort/fan-out cases; они включены в итоговый полный прогон. [Вывод](targeted-final.txt), [JUnit](targeted-final.xml) |
| Полный `-m pytest -q -p no:cacheprovider --junitxml=docs/h3-01b/api.xml` | **1001 passed /18 skipped**, 102.85s; [вывод](api.txt), [JUnit](api.xml) |
| `-m ruff check apps/api --no-cache` | PASS, [вывод](ruff.txt) |
| `-m mypy apps/api/app --cache-dir .cache/h3-01b-mypy` | PASS, 118 source files; [вывод](mypy.txt) |
| `npm run test:unit` | **226 passed**, [вывод](node.txt) |
| Browser Chrome desktop/mobile: `npm run test:e2e -- filter-workflow.spec.ts local-flight-time.spec.ts --reporter=json` | Первый прогон **6 passed /8 failed**: устаревшее ожидание раскрытых advanced fields; [JSON](browser.json), [вывод](browser.txt) |
| Browser после test-only fix: `npm run test:e2e -- filter-workflow.spec.ts --reporter=json` | **12 passed**, [JSON](browser-final.json), [вывод](browser-final.txt). Два local-flight-time cases passed в первом прогоне, итого подтверждены 14 уникальных scenarios |
| ESLint изменённого `tests/filter-workflow.spec.ts` | exit 0, [вывод](eslint.txt) |
| Query-count probe `-m pytest -q -s -p no:cacheprovider ...test_candidate_sql_count_is_constant_and_does_not_serialize_full_catalog` | 1 и 51 кандидат — по **одному SQL**; 51 candidates 0.067s локально. [Вывод](query-count.txt). Не production latency/SLA |
| IDE build_project изменённых файлов | isSuccess=true, limited diagnostics |

Новые 25 API/service cases покрывают выбор позднего подходящего результата после дешёвых неподходящих, следующую/пустую страницы, list/page parity, total, три сортировки, SQL filter intersections, legacy boolean, flexible Monday, custom/default work hours без утечки настроек, неизвестный/estimated прилёт, другой аэропорт, конфликтующие компоненты, ошибки параметров, cap/refinement и alias join fan-out. H3-01a tests покрывают DST, UTC/local dates и границы рабочего времени.

Первый новый тестовый прогон: 7 failures /14 passed. Причина — fixture сохраняла offset datetime напрямую в SQLite (offset терялся), а у unknown fixture не были явно заданы return airports; quality gate корректно отвергала такие данные. Исправлена только синтетическая fixture: UTC перед сохранением, явные аэропорты. [Исходный результат](targeted.txt) сохранён. Первый mypy выявил конфликт локального имени `item` с прежним SQL alias в функции; переменная сериализованного ответа переименована. [Исходный mypy](mypy-first.txt) сохранён. Итоговый полный прогон зелёный.

Browser выполнялся в `.cache/aud05-h3-01b-20261103`, существующий prepare-e2e workflow, loopback 3125/8125, dev server; чужие процессы не останавливались. Восемь старых locale cases требовали немедленной видимости полей дат, хотя они находятся в закрытом `.advanced-filters`. [SHA256 формы](filter-source-parity.json) совпадает с изолированной копией до этой задачи. Исправлен только test helper: пользовательским кликом открыть summary перед проверкой/вводом. Ожидания history/reload/presets/manual overrides/reset/axe/320px не ослаблены. После этого все 12 filter-workflow cases passed. Исходный отчёт не перезаписан.

В dev-логе повторного browser прогона есть React `use()` suspension diagnostic во время сценария delayed origin preference; сценарий прошёл. Причина и влияние на production здесь не установлены. Зафиксировано для проверки в H3-01c/H3-17b; отсутствие browser console errors не заявляется. В production web build это выполнение не проверяло данный симптом.

Ограничения: PostgreSQL 18 skipped; прежние два deprecation warnings Starlette/httpx и anyio. Production size/latency, реальные партнёры/рассылки, WebKit/CWV не проверялись. Web runtime не менялся, новая production-сборка web не требовалась. Результаты browser regression приведены в этом каталоге; они не доказывают готовность нового UI.

## Rollback и следующий запуск

Изменены `apps/api/app/api/catalog.py`, `schemas/weekend.py` (WeekendMode), новый `services/weekend_catalog.py`, `tests/test_weekend_catalog.py`, test-only helper в `apps/web/tests/filter-workflow.spec.ts` и H3 docs. Нет DB migrations/backfill, flags, deployment, реальных сообщений или партнёрских операций.

Rollback: удалить только новый service/tests, alias WeekendMode и новую ветку/параметры/imports endpoint; при полном откате test delta убрать helper открытия advanced fields и два его вызова. Сохранить H3-01a assessment, H3-02 timeline, H3-04 сортировку и все прежние пользовательские изменения; общий reset к HEAD недопустим.

Следующий отдельный запуск — **H3-01c**. Подключить mode/work hours и assessment к web API validation/types; URL/reload/back; явные допущения и состояние too-broad на PL/EN/RU/UK; legacy default/landing semantics; неперезаписывающие presets, chips/reset. Проверить end-to-end реальные API modes на синтетических known/unknown/DST/Sunday/Monday cases. Только после этого оценивать DONE общей H3-01; H3-03 ещё не начинается.
