# HopTrip — проверенная архитектура (AUD-01)

Дата: 2026-10-30. Основа: локальное дерево на HEAD `2395f1631b2c202c07bfc50dd5585f3abe31c404`.
Метод: статическое чтение исходников, моделей, маршрутов, Compose, Dockerfile, CI и тестовых конфигураций. Это аудит репозитория, а не подтверждение состояния работающего production.

## Дополнение 2026-11-02 — изображения статей

Проверено: прежний UI-02 обслуживал три homepage destination cards; фотографии
в article body отсутствовали. Теперь 49 явных cover mappings (196 языковых страниц),
31 Commons source и две inline иллюстрации ледников. Публичная атрибуция и отдельные
лицензии не заменяются общей ссылкой «из Pinterest». В реестре оригиналы проверены
по Commons SHA-1, адаптации по SHA-256; EXIF/XMP отсутствуют, total4043902bytes.
У 31 выбранных записей Commons Restrictions пустое; это не гарантия всех возможных
локальных/личных прав. [Источники, результаты и границы](article-imagery/README.md).

## Границы и структура

Просмотрен реестр отслеживаемых файлов (`git ls-files`) и корневые каталоги, затем реализации основных границ приложения. Чтение каждого изображения, шрифта или исторического отчёта не требовалось.

| Область | Назначение и доказательство |
|---|---|
| `apps/web` | Next.js App Router, React, TypeScript; страницы, компоненты, библиотеки и тесты |
| `apps/api` | FastAPI, модели SQLAlchemy, схемы Pydantic, сервисы, провайдеры, jobs, Alembic и тесты |
| `infrastructure` | Caddy и systemd service/timer для эксплуатации |
| `scripts` | Deploy, backup/restore, мониторинг, проверки ссылок и уведомления |
| `.github/workflows` | Основные и расширенные проверки CI |
| `docs`, `doc`, `stay22.md` | Исторические отчёты, инструкции, спецификации; `docs/architecture.md` уже описывает базовую архитектуру, этот отчёт дополняет её актуальными границами |
| `docker-compose*.yml` | Базовое окружение и production/domain/staging/shared-proxy/test/rehearsal/build-ca варианты |
| `.idea` | Конфигурация IDE, не отдельный компонент runtime |
| `.worktrees`, `backups`, `.cache`, `.venv`, `node_modules`, `.next`, кеши проверок | Локальные копии, артефакты и зависимости; не источник архитектуры текущего checkout |

В начале сессии `git status --short` показывал `AM docs/HOPTRIP_MASTER_PLAN.md`. Эти пользовательские изменения сохранены. Трекер и журнал решений с именами из нового мастер-плана отсутствовали. Исторические `docs/implementation-status.md` и `docs/hoptrip-roadmap-status.md` не считаются статусами задач нового плана.

## Стек и основные модули

`apps/web/package.json`: Next.js **16.4.3**, React/React DOM **19.0.0**, TypeScript, ESLint 9; зависимости закреплены также в `package-lock.json`. `next.config.ts` задаёт standalone build и HTTP-заголовки. UI использует CSS и CSS modules, локальные шрифты и SVG-флаги.

`pyproject.toml`: Python **>=3.12**, FastAPI, Uvicorn, HTTPX, SQLAlchemy 2, psycopg 3, Alembic, pydantic-settings; точные зависимости сборки — `requirements.lock`. Это модульный backend с общей БД, а не набор независимых микросервисов. API и воркеры используют один пакет `app` и один образ.

| Граница | Ключевые файлы и ответственность |
|---|---|
| HTTP API | `apps/api/app/main.py` регистрирует health, catalog, events, alerts, analytics, affiliate, admin, editor |
| Каталог и представление | `api/catalog.py`, `services/catalog.py`, `availability.py`, `flight_facts.py`, `price_freshness.py`; фильтрация ORM и сериализация DTO |
| Получение рейсов | `providers/travelpayouts.py`, `travelpayouts_routes.py`; `services/ingestion.py`, `price_refresh.py`, `route_enrichment.py` |
| Статистика и предложения | `services/statistics.py`, `scoring.py`, `score_explanation.py`, `deals.py` |
| События | `providers/ticketmaster.py`, `services/event_sync.py`, `events.py`, `event_grouping.py`, `event_flight_fit.py` |
| Партнёрские ссылки | `services/affiliate.py`, `partner_links.py`, `affiliate_adapters/stored.py`, `api/affiliate.py` |
| Подписки | `services/alerts.py`, `alert_mail.py`, `alert_digests.py`, `api/alerts.py` |
| Частный редактор | `api/editor.py`, `services/editor_auth.py`, `editorial.py`, `editor_rehearsal.py`, статический интерфейс `app/editor/` |
| Web | `src/app/`, `src/app/components/`, `src/lib/api.ts`, `src/lib/i18n/`; страницы и клиентские формы используют общие библиотеки |
| Локальные планы | `src/lib/shared-trip.ts`, `budget-draft.ts`, `trip-budget.ts`, `components/saved-trips.tsx`: браузерное хранилище и сериализация плана в URL |

## HTTP-контракты и страницы

Пути проверены по декораторам роутеров и их регистрации в `main.py`; это статическая карта, OpenAPI работающего сервера не запрашивался.

| Метод / путь | Назначение |
|---|---|
| GET `/health`, `/health/ready` | Живость / готовность |
| GET `/api/v1/deals`, `/api/v1/deals/{slug}` | Каталог и детали; список поддерживает origin/destination, даты, бюджет, длительность, weekend, round_trip, сортировку, offset/limit; `include_total` меняет форму на страницу с total |
| GET `/api/v1/departures/{iata_code}/deals`, `/api/v1/destinations/{slug}/deals` | Подборки по аэропорту и направлению |
| GET `/api/v1/airports`, `/api/v1/destinations` | Справочники |
| GET `/api/v1/deals/{slug}/events` | События для рейса, проживания либо явно заданных дат; проверяет флаг EVENTS_ENABLED |
| GET `/go/{slug}/{component}` | Повторная проверка доступности и партнёрской политики, запись клика, redirect 307 с no-store |
| POST `/api/v1/analytics/events` | Сбор валидируемых событий |
| GET `/api/v1/admin/analytics/summary` | Закрытая агрегация аналитики |
| GET `/api/v1/alerts/status`; POST `/api/v1/alerts` | Статус и регистрация подписки |
| POST `/api/v1/alerts/confirm`, `/manage`, `/unsubscribe`; PATCH `/api/v1/alerts/manage` | Подтверждение, чтение/обновление предпочтений, отмена |
| `/api/v1/admin/*` | Провайдеры, программы, состояние системы, jobs, conversions, deals/components; `require_admin` проверяет X-Admin-Token через compare_digest |
| `/api/v1/editor/*` | login/session/logout, UI/assets, sources/events, items/media, revise/approve/reject, rehearsal и dry-run; общий флаг enabled и отдельная сессионная авторизация |

Web-маршруты: `/`, `/deals`, `/deals/[slug]`, `/from/[iata_code]`, `/from/warszawa`, `/destinations/[slug]`, `/city-break`, `/tanie-loty-na-weekend`, `/routes/krakow-rome`, `/info` и статьи, `/saved`, `/trip`, `/alerts`. Есть route handlers `/preview/[kind]/[key]`, `/share/[slug]`, генераторы `robots.ts`/`sitemap.ts` и локализованные `[locale]`-страницы.

`src/proxy.ts` определяет язык по URL и перезаписывает служебный заголовок. `i18n/config.ts` содержит pl/ru/en/uk; `routing.ts` ограничивает доступность переводов конкретными путями. Наличие четырёх языков не означает перевод всех маршрутов.

## Данные и потоки

`db/session.py` создаёт синхронный SQLAlchemy engine с `pool_pre_ping` и `SessionLocal`; API получает сессию через `Depends(get_db)`, jobs открывают её непосредственно. Закрытие сессии централизовано, commit выполняется в сервисах/обработчиках. Отдельного универсального repository layer нет: ORM-запросы присутствуют также в API.

| Домен | Модели (`apps/api/app/models/`) |
|---|---|
| География | Airport, Destination, DestinationAlias |
| Источник и цены | DataProvider, TravelOffer, PriceObservation, RouteStatistics |
| Публикуемое предложение | Deal, DealComponent |
| Монетизация | AffiliateProvider, AffiliateProgram, ProviderCapability, AffiliateClick, AffiliateConversion |
| Эксплуатация | JobRun/JobStatus, AnalyticsEvent |
| Уведомления | DealAlert, AlertDelivery |
| События | LocalEvent, EventWindow |
| Редактор | EditorialItem, EditorialRevision, EditorialApproval, EditorialAudit, EditorialRehearsal, EditorSession |

У TravelOffer есть FK источника/аэропорта/направления, уникальность `(data_provider_id, external_id)`, цена Numeric/Decimal, исходная валюта, source_observed_at, fetched_at, expires_at, raw_payload и отдельные route_details. PriceObservation хранит историю и уникальный observation_key. Схема меняется Alembic; есть пара ревизий 0016 с merge 0017 и последующая 0018. Миграции в этой сессии не запускались.

Поток рейсов (`jobs/pipeline.py`): Travelpayouts по настроенным аэропортам → discovery направлений → refresh существующих цен → ingestion → enrichment маршрутов → пересчёт статистики → генерация deals → синхронизация ссылок. `services/jobs.py` оборачивает процесс PostgreSQL advisory lock, записывает попытки JobRun и повторяет только transient ошибки. Expire/retention выполняются перед получением данных; коммиты по этапам означают, что весь pipeline не является одной атомарной транзакцией.

Поток чтения: браузер → Next.js / FastAPI → SQLAlchemy → PostgreSQL → DTO. `src/lib/api.ts` выбирает `HOPTRIP_API_URL`, затем `NEXT_PUBLIC_API_URL`, использует `cache: no-store`, timeout 8 секунд; TypeScript-типы DTO заданы вручную. Поиск каталога читает сохранённые наблюдения, а не обещает живой поиск авиакомпании на каждый запрос.

События: Ticketmaster → отдельная синхронизация → LocalEvent/EventWindow → подбор по городу/датам и пригодности относительно рейса → API → UI. Подписки используют БД и SMTP; локальные сохранённые планы используют localStorage (`hoptrip.saved-trips.v1`) и проверяемый URL-токен, отдельная серверная учётная запись для них не требуется.

## Внешние зависимости и ограничения

| Интеграция | Подтверждённая реализация / предел доказательства |
|---|---|
| Travelpayouts Data API v3 | HTTPX-адаптер кешированных цен, настройка market и токена; route enrichment отдельным адаптером. Историческое наблюдение не доказывает live inventory |
| Aviasales / Travelpayouts links | Построение/хранение партнёрских ссылок отделено от источника цен; включение зависит от flags и конфигурации программы |
| Stay22 | `src/lib/accommodation-links.ts` строит allez/roam URL с городом, датами, adults, campaign; это переход к поиску жилья, не API подтверждённых цен отелей |
| Ticketmaster Discovery и affiliate redirect | `providers/ticketmaster.py`, `event_sync.py`; ключ, квоты, флаги и валидация ticket URL. Реальная доступность ключа/партнёрского кабинета не проверялась |
| Редакционные активности | `destination-activities.ts` + `activity-expansion.json`: статические подборки с исходными и affiliate URL, явно отделённые от live inventory |
| SMTP | `alert_mail.py` и настройки SMTP; реальная отправка не запускалась |
| Операционные уведомления | systemd + `scripts/monitor.py`, `notify-activity.py`, `notify-storage.py`; состояние внешних каналов и таймеров на сервере не проверялось |

Backend `PlnOnlyConverter` принимает только PLN, наличие полей FX не доказывает интеграцию сервиса курсов. Статусы approval партнёров, реальные credentials и активные production-флаги из репозитория не устанавливаются.

## Фоновые процессы и окружения

Базовый Compose содержит db, migrate, api, web и профили worker/events/alerts. Внешний брокер очередей для этой схемы не используется; планирование реализовано собственными циклами.

- `jobs/scheduler.py`: pipeline по интервалу; при PIPELINE_SCHEDULE_TIMEZONE — календарное расписание с проверкой успешных JobRun и catch-up. Production override задаёт Europe/Warsaw и интервал по умолчанию 7200 секунд.
- `jobs/event_scheduler.py`: ежедневное окно 06:00 Europe/Warsaw, persisted catch-up, защита от частых повторов после ошибок; требует EVENTS_SYNC_ENABLED.
- `jobs/alert_scheduler.py`: проверка дайджестов каждую минуту, требует ALERTS_ENABLED и ALERTS_DIGEST_ENABLED; eligibility сохраняется на уровне подписки.
- CLI `jobs/`: ingest, maintenance, price refresh/check, route enrichment, sync destinations, preflight, operations/partner checks и editor rehearsal.
- `infrastructure/systemd/*.timer`: backup 02:15 UTC, monitor каждые 5 минут, activity каждую минуту, links 07:00 Warsaw, storage 08:00 Warsaw; `scripts/systemd/` — rehearsal каждую минуту. Наличие unit-файлов не подтверждает их установку.

`config.py` использует pydantic-settings, `.env`, env vars и кеш настроек; валидирует production credentials и параметры включённых alerts/editor. Проверены только шаблоны/исходники конфигурации, секретные файлы и окружение процессов не читались. `NEXT_PUBLIC_*` передаются при сборке web; внутренний API URL и operator JSON задаются runtime. Изменение публичных адресов требует учитывать пересборку.

## Сборка, deployment и проверки

API Dockerfile: Python 3.12-slim, установка requirements.lock, запуск скопированного пакета через PYTHONPATH/Uvicorn. Web Dockerfile: Node 22-alpine, npm ci, next build, standalone server.js. Compose migrate выполняет `alembic upgrade head` до старта API/воркеров. Production override скрывает host ports БД/API/web; Caddy маршрутизирует `/api/*`, `/health*`, `/go/*` на API, остальное на web. Domain Caddy закрывает публичный admin; базовый Caddy отличается, поэтому важен набор overrides. Shared-proxy добавляет edge network; staging — отдельный Caddyfile.

`scripts/deploy-production.sh` принимает полный SHA текущего main, блокирует параллельный deploy, получает source release, строит образы, выполняет preflight, останавливает writers, делает проверяемый pg_dump, запускает миграции и postflight; хранит предыдущие образы. Rollback возвращает образы приложения без downgrade БД. Скрипт выбирает worker/events profiles; alerts-worker не входит в список запускаемых новых сервисов. Автоматический deploy workflow в двух отслеживаемых GitHub workflow отсутствует; способ вызова deploy за пределами репозитория не подтверждён.

| Проверки в репозитории | Настройка и примеры |
|---|---|
| Backend | pytest, FastAPI TestClient, SQLite StaticPool fixture с dependency override; отдельные PostgreSQL tests и TEST_DATABASE_URL; тесты ingestion, pricing, scoring, jobs, affiliate, alerts, events, editor |
| Web unit | Node test runner и experimental-strip-types; `tests/*.test.mjs` для дат, бюджета, ссылок, i18n, сериализации |
| Browser E2E | Playwright, один worker, desktop и mobile, Chromium по умолчанию, опциональный WebKit; локальные FastAPI fixture-server 8100 и Next dev 3100 |
| Качество | Ruff, mypy; ESLint, next typegen + tsc; build |
| Дополнительные | axe/Playwright и scripts audit:seo/audit:experience; shell test deploy и PowerShell test Ticketmaster |
| CI | `ci.yml`: PostgreSQL 16, Ruff/mypy, deploy shell test, Alembic, pytest; web unit/lint/build. `extended.yml`: ручной запуск, E2E и Docker rehearsal SEO/accessibility |

В AUD-01 выполнены статические проверки наличия файлов/контрактов и проверка diff. Runtime-тесты, lint/typecheck/build, browser и сетевые проверки не запускались: изменяется только документация, их запуск не нужен для проверки архитектурной карты и не должен превращаться в AUD-05. Это не заявление об успешной регрессии или отсутствии ошибок сборки.

## Архитектурные риски и неопределённости

1. **Прокси и rate limits:** SecurityMiddleware хранит лимиты в памяти процесса и использует socket peer; Uvicorn запускается без proxy headers. За Caddy пользователи могут делить bucket. Это риск из кода, степень влияния на production не измерена.
2. **Связность и транзакции:** API/воркеры делят схему и сервисы; синхронные ORM-операции присутствуют в async pipeline, стадии коммитятся отдельно. Масштабирование и восстановление после частичного сбоя требуют сохранения locking/idempotency; дефект под нагрузкой не воспроизводился.
3. **Дрейф контрактов:** web DTO вручную повторяют API-схемы, `response.json() as Promise<T>` не валидирует ответ runtime. Наличие расхождения в конкретном поле в этом аудите не утверждается.
4. **Свежесть и провайдеры:** кешированные цены и расписания зависят от внешних источников/квот. Наличие timestamp/guard не подтверждает live цену; отдельные DATA-задачи должны проверить корректность политики.
5. **Deployment:** откат образов не откатывает миграции, поэтому необходима обратная совместимость схемы; порядок Compose overrides определяет доступность admin и портов. Реальное окружение сервера не проверено.
6. **Тестовая репрезентативность:** SQLite и fixture API не заменяют PostgreSQL/провайдеры; расширенные browser/SEO проверки запускаются отдельным ручным workflow. Текущий результат CI и полнота покрытия не устанавливались.
7. **Локальное хранение:** saved trips зависят от устройства и URL-токена; наличие такого плана не резервирует рейс и не подтверждает актуальную цену. Облачная синхронизация в описанном потоке отсутствует.

## Приёмка AUD-01

Архитектура, основные сервисы, endpoints, модели, потоки данных, jobs, интеграции, окружения, deployment и тестовые инструменты сопоставлены с файлами. Изменены только этот отчёт и новый прогресс-трекер. Production-конфигурация, данные, инфраструктура и код приложения не изменялись; миграции, отправки и deploy не выполнялись. Решений о смене архитектуры не принималось, поэтому отдельный DECISIONS и TEST_PLAN не создавались. Следующая задача по порядку — AUD-02; она не начата.

---

## AUD-02 — инвентаризация существующих функций

Дата: 2026-10-30. AUD-01 выше сохранён как результат предыдущей сессии. Ниже — отдельный результат AUD-02 того же checkout. Критерий приёмки: все основные функции сопоставлены с существующим кодом. Изменений поведения, интерфейса, переводов и production нет.

Метод: чтение реализаций и тестов, запуск web unit и выбранных backend-тестов с локальными fixtures. «Реализовано» означает наличие проверенного пути в исходниках; включение флагов, действительность внешнего партнёрства и работа production не подтверждались. Браузерные spec-файлы перечислены как существующие, но в этой сессии не запускались. Указанные пробелы — границы выполненной проверки/кандидаты на тесты, а не измерение покрытия всего проекта.

В пунктах 1–22 пути web указаны относительно `apps/web/src/`, backend — относительно `apps/api/app/`; тесты — относительно `apps/web/tests/` или `apps/api/tests/`. Повторное использование одного компонента не считается дублирующей реализацией. Копии в `.worktrees`, backups и `.next` исключены.

### 1. Главная страница

- **Поведение и код:** `app/page.tsx`: hero с FilterForm, до шести round-trip предложений на 2–4 ночи, выбор аэропорта, переходы к подборкам, бюджету, аэропортам и направлениям; обработка ошибок и пустой выдачи. `app/[locale]/page.tsx` вызывает общую страницу.
- **Источник:** API deals/airports/destinations, URL origin и cookie `hoptrip.origin.v1`; предложения не создаются на клиенте.
- **Ограничения:** сначала запрашиваются до 100 предложений, затем выполняется дополнительная фильтрация и slice(0,6); это не отдельный запрос top-6 по всей базе. Наличие отдельных hero и short-trip selectors подтверждено, их удобство не оценивалось.
- **Повторы:** фильтры и DealGrid общие с каталогом; отдельная фильтрация 2–4 ночей на главной пересекается с city-break policy.
- **Тесты/пробел:** unit `home-guides.test.mjs`; есть `home-layout.spec.ts`, `localized-home.spec.ts`. В этой сессии cookie persistence и взаимодействие двух селекторов в браузере не проверены.
- **Действие:** сохранять существующую главную; UX-01/UX-02 должны начать с проверки управления origin и полноты подборки.

### 2. Поиск рейсов

- **Поведение и код:** `app/deals/page.tsx`, `lib/api.ts`, `lib/search-policy.ts`; backend `api/catalog.py`: поиск по сохранённому каталогу, 12 результатов на страницу с total, нормализация параметров, ошибки неверных фильтров и ссылки восстановления.
- **Источник:** Deal/DealComponent/TravelOffer в БД после Travelpayouts pipeline; `include_total=true`, offset/limit. Запрос не является live поиском авиакомпании.
- **Ограничения:** offset до 10000; backend limit до 100. `round_trip` есть в API, но не входит в `searchKeys` публичного URL; city-break добавляет его отдельно. Ссылка «назад» в деталях ведёт на `/deals` без переноса фильтров.
- **Повторы:** специализированные страницы используют общую DealsPage; backend departure/destination endpoints имеют отдельные запросы подборок.
- **Тесты/пробел:** запущены `test_catalog.py`, `test_catalog_results.py`; есть `catalog-results.spec.ts`, `catalog.spec.ts`. Browser back/forward с сохранением поиска здесь не проверялся.
- **Действие:** использовать имеющийся API; при будущих изменениях явно согласовать восстановление URL состояния.

### 3. Выбор аэропорта

- **Поведение и код:** `components/airport-select.tsx`, `lib/airports.ts`, `app/actions/origin-preference.ts`, `lib/origin-preference.ts`; backend `services/airports.py`: подсказки по названию/коду, клавиатура, отказ от неявного выбора неоднозначного города. Warsaw grouping WAW/WMI реализован в Filters/API.
- **Источник:** `/api/v1/airports`, aliases и переводы; preference cookie на 180 дней, только один IATA-код.
- **Ограничения:** grouped origin `WAW,WMI` не проходит normalizedOrigin и не сохраняется как одиночное предпочтение; при недоступном справочнике остаётся ручной ввод.
- **Повторы:** AirportSelect, select коротких поездок на главной и Warsaw select — разные controls над общими данными; это точки будущей синхронизации, не доказанный дефект.
- **Тесты/пробел:** прошли `airports.test.mjs`, `test_airport_search.py`; есть `airport-search.spec.ts`. Cookie и grouped origin после reload не проверены браузером.
- **Действие:** AUD-02 не заменяет работающий поиск; UX-02 должен определить ожидаемую персистентность группы аэропортов.

### 4. Направление, фильтры и сортировка

- **Поведение и код:** `components/destination-select.tsx`, `filters.tsx`, `lib/destinations.ts`, `trip-filters.ts`, `search-policy.ts`; backend `api/catalog.py`: destination slug/alias/IATA, бюджет на человека, включительный диапазон дат вылета, ночи, weekend, active chips/reset; sort score/price/departure со стабильным id tie-break.
- **Источник:** справочники и Deal; URL хранит выбранные условия. Presets: weekend, 2–3 ночи, до 300 PLN; повторное нажатие удаляет их условия, не восстанавливает прежние значения.
- **Ограничения:** публичных фильтров direct/max-stops/time нет в текущей форме и сигнатуре catalog endpoint; даты относятся к вылету, не к возвращению. Reset сохраняет sort. Три доступных sort не включают duration/time-at-destination.
- **Повторы:** scenarioFilters задаёт ограничения подборок, Filters применяет их и при submit; backend повторно валидирует входы. Это границы валидации, не повод удалить одну из них.
- **Тесты/пробел:** прошли `destinations.test.mjs`, `search-policy.test.mjs`, `trip-filters.test.mjs`, `test_destination_search.py`, `test_trip_filters.py`, `test_catalog_results.py`; существуют `trip-filters.spec.ts`, `destination-search.spec.ts`. Browser history не запускался.
- **Действие:** DEAL-02/03 должны расширять текущие политики только после согласования доступных данных.

### 5. Карточки предложений

- **Поведение и код:** `components/catalog.tsx` экспортирует DealCard/DealGrid: маршрут, флаг, даты, тип билета, цена, свежесть, компактное расписание, время на месте, раскрываемые сведения и история.
- **Источник:** Deal DTO и общие Price/FlightSchedule/TripDetails/PriceFreshness; приблизительный EUR из NBP показывается через Price отдельно от базовой PLN.
- **Ограничения:** полные flight_facts могут отсутствовать; текст предупреждает об этом. Польская карточка использует ScoreTrigger, другие языки — PriceSummary и ссылку на детали.
- **Повторы:** одна общая карточка для главной/подборок; подтверждена разная композиция price-score по языкам, не отдельный полный дизайн карточки.
- **Тесты/пробел:** прошли unit для flight-facts, price-assessment, price-freshness; есть `compact-cards.spec.ts`, `localized-catalog.spec.ts`. Длинные названия и мобильные размеры не проверялись визуально в этой сессии.
- **Действие:** DEAL-01 должен улучшать DealCard, сохраняя состояния неполных данных.

### 6. Детали рейса

- **Поведение и код:** `app/deals/[slug]/page.tsx`, `components/trip-navigation.tsx`, `flight-schedule.tsx`, `flight-facts.tsx`, `trip-details.tsx`, `outbound.tsx`: сведения о рейсе, partner CTA, жильё, бюджет, история, активности, события и guides внутри общего TripDraftProvider.
- **Источник:** `/api/v1/deals/{slug}`; availability guard backend `services/availability.py`; 404 при недоступной записи. Клиентский `use-offer-expired.ts` ограничивает CTA по deadline.
- **Ограничения:** дата/цена сохранённой оферты не меняется при редактировании проживания; временные оферты не заменяют подтверждение у партнёра. Качество расписания зависит от route evidence.
- **Повторы:** общий набор flight/price компонентов с карточкой; metadata и page отдельно запрашивают deal, влияние на запросы не измерялось.
- **Тесты/пробел:** прошли `test_catalog.py`, `test_price_freshness.py`; есть `flight-facts.spec.ts`, `price-freshness.spec.ts`, `trip-navigation.spec.ts`. Истечение CTA при открытой вкладке здесь не воспроизводилось.
- **Действие:** TRIP-01 должен перестраивать существующую композицию, сохраняя shared draft и предупреждения.

### 7. Историческое сравнение цен

- **Поведение и код:** backend `services/statistics.py`, `scoring.py`, `score_explanation.py`; web `lib/price-assessment.ts`, `components/score-details.tsx`, `price-assessment.tsx`: flight-v3, веса price/history/freshness 60/25/15, минимум 5 наблюдений для CURRENT; PROVISIONAL/LEGACY/UNAVAILABLE имеют отдельное представление.
- **Источник:** PriceObservation → RouteStatistics по provider/origin/destination/product/month/duration → сохранённый breakdown Deal; UI проверяет согласованность цены и медианы, не пересчитывает score.
- **Ограничения:** это выборка наблюдений, не весь рынок; дата загрузки не равна source timestamp. График полной временной серии не следует из имеющейся сводки медианы.
- **Повторы:** формула на backend, проверка согласованности и описание на frontend; переводы и pl-диалог имеют разные пути отображения.
- **Тесты/пробел:** прошли `test_scoring.py`, `price-assessment.test.mjs`, `score-copy.test.mjs`; есть `scoring.spec.ts`. Статистическая репрезентативность реальной базы не измерялась.
- **Действие:** DATA-02/DEAL-06 должны валидировать и упрощать существующую методологию, не вводить новую без доказательств.

### 8. Предложения выходного дня

- **Поведение и код:** `app/tanie-loty-na-weekend/page.tsx` — wrapper DealsPage; `lib/search-policy.ts` фиксирует weekend; `api/catalog.py` оставляет пятницу/субботу с возвратом в воскресенье и длительностью 1–2 дня.
- **Источник:** текущий доступный каталог и даты Deal/признак возврата.
- **Ограничения:** календарные условия сами по себе не гарантируют удобные часы и поездку без отпуска.
- **Повторы:** переиспользуются FilterForm/DealGrid; weekend preset и landing используют одну семантику.
- **Тесты/пробел:** прошли `trip-filters.test.mjs`, `test_trip_filters.py`; есть `short-trips.spec.ts`. Расписание конкретного реального предложения не проверялось.
- **Действие:** сохранить маршрут и правила, проверять точность дат в DATA-03.

### 9. City break

- **Поведение и код:** `app/city-break/page.tsx`, `lib/search-policy.ts`, `app/deals/page.tsx`: общий каталог на 2–4 ночи, round_trip=true; locked bounds видны в фильтрах.
- **Источник:** Deal API, редакционные catalog/landing descriptions.
- **Ограничения:** city break 2–4 ночи отличается от preset 2–3 ночи; не следует объединять их незаметно.
- **Повторы:** wrapper, а не отдельная поисковая система; фильтрация главной частично повторяет условия.
- **Тесты/пробел:** прошли `search-policy.test.mjs`, `test_trip_filters.py`; есть `short-trips.spec.ts`, `localized-landings.spec.ts`. Реальное наличие всех направлений не проверено.
- **Действие:** сохранять различие подборок при UX-03.

### 10. Поиск жилья

- **Поведение и код:** `components/trip-accommodation.tsx`, `trip-draft.tsx`, `lib/accommodation-links.ts`: Stay22 получает город, checkin/checkout, взрослых, PLN; даты и люди общие с бюджетом.
- **Источник:** начальные даты из Deal, затем локальный draft и ручные изменения; цена жилья вводится вручную, не загружается из Stay22.
- **Ограничения:** checkout должен быть позже checkin, максимум 50 взрослых; требуется подтверждённый adultsOnly; дети и возраст задаются у партнёра. Предзаполнение из дат рейса требует проверки локального прилёта.
- **Повторы:** один TripAccommodation используется в оферте и копии плана; общий draft предотвращает две независимые модели проживания.
- **Тесты/пробел:** прошли `accommodation-links.test.mjs`, `budget-draft.test.mjs`; есть `accommodation.spec.ts`, `stay-mobile-layout.spec.ts`. Фактическое принятие параметров внешним сайтом не проверялось.
- **Действие:** TRIP-02 должен сохранять shared state и явно отделять поиск жилья от котировки.

### 11. Калькулятор бюджета

- **Поведение и код:** `components/trip-budget-calculator.tsx`, `trip-draft.tsx`, `reference-costs.tsx`, `lib/trip-budget.ts`, `budget-draft.ts`: расходы на человека/группу/ночь/день, ночь либо весь stay для hotel, известная сумма и незаполненные затраты, события, автосохранение draft отдельно для поездки.
- **Источник:** цена рейса и даты Deal, пользовательские PLN, справочные reference-costs; NBP в `lib/exchange-rate.ts` используется для ориентировочного пересчёта, не фиксации банковского курса.
- **Ограничения:** пустое поле остаётся неизвестным, ноль вводится явно; одинаковая цена билета для всех — допущение расчёта. One-way не определяет полный stay. Внешние цены не подтверждаются пересчётом.
- **Повторы:** общий калькулятор на оферте, `/info/trip-budget` и `/trip`; провайдер создаётся только если нет вышестоящего общего контекста.
- **Тесты/пробел:** прошли `trip-budget.test.mjs`, `budget-draft.test.mjs`, `reference-costs.test.mjs`, `exchange-rate.test.mjs`; есть `trip-budget.spec.ts`, `budget-recovery.spec.ts`. Взаимодействие с мобильной клавиатурой не проверялось.
- **Действие:** TRIP-03 должен улучшать текущую форму, сохраняя семантику неизвестных и общих сумм.

### 12. События

- **Поведение и код:** `components/trip-events.tsx`, `event-flight-notice.tsx`, `planned-events.tsx`; backend `api/events.py`, `services/events.py`, `event_grouping.py`, `event_flight_fit.py`: категории, дни, страницы, связанные варианты билетов, оценка совместимости с рейсом, добавление в план.
- **Источник:** сохранённые LocalEvent/EventWindow от Ticketmaster sync, город/время рейса и stay draft; independent dates — отдельный режим.
- **Ограничения:** EVENTS_ENABLED, поддержка города, возраст окна и partial/unavailable; цена from не подтверждает наличие. Совпадение дат не гарантирует физическую достижимость venue. Билетные цены в плане пользователь подтверждает в PLN.
- **Повторы:** TripEvents общий для оферты и сохранённого плана; backend и frontend разделяют ответственность fit/display, типы DTO описаны вручную.
- **Тесты/пробел:** прошли `test_events.py`, `test_event_flight_fit.py`, `event-dates.test.mjs`, `planned-events.test.mjs`; есть `event-results.spec.ts`, `planned-events.spec.ts`. Live Ticketmaster и sold-out после sync не проверялись.
- **Действие:** TRIP-04 должен использовать существующий каталог/план и честные статусы свежести.

### 13. Активности и достопримечательности

- **Поведение и код:** `components/destination-activities.tsx`, `activity-link.tsx`, `activity-budget-link.tsx`, `lib/destination-activities.ts`, `activity-expansion.json`: редакционные подборки с условиями, источниками и официальными/affiliate переходами.
- **Источник:** статические подборки с checkedAt, исходными URL и отдельным affiliateHref; не live inventory.
- **Ограничения:** только предусмотренные города; стоимость не переносится автоматически в бюджет. Актуальность конкретного внешнего продукта здесь не подтверждалась.
- **Повторы:** общая подборка используется в поездке/контенте, ссылка ActivityBudgetLink меняет контекст навигации; это reuse.
- **Тесты/пробел:** есть `activities.spec.ts`, backend `test_activity_links.py`, `test_activity_analytics.py` (не запускались здесь). Непрерывная внешняя проверка URL не выполнялась.
- **Действие:** сохранять provenance и checkedAt; проверки внешних ссылок проводить отдельно от этой инвентаризации.

### 14. Сохранённые поездки

- **Поведение и код:** `components/trip-actions.tsx`, `saved-trips.tsx`, `lib/shared-trip.ts`, `app/saved/page.tsx`: сохранение/удаление, максимум 20 токенов, сообщения об отказе storage; текущие цены не перезаписывают snapshot.
- **Источник:** localStorage `hoptrip.saved-trips.v1`, валидируемые encoded plans; `app/trip/page.tsx` пробует загрузить текущую оферту отдельно.
- **Ограничения:** device-local, без аккаунта/облачной синхронизации; истёкшая оферта оставляет бюджет, но не подтверждает бронирование.
- **Повторы:** хранится тот же формат, что используется для share, не отдельная модель «избранного» на backend.
- **Тесты/пробел:** прошли `shared-trip.test.mjs`, `local-budget-recovery.test.mjs`; есть `shared-trip.spec.ts`, `localized-trips.spec.ts`. Очистка browser storage и длительное хранение реальным браузером в этой сессии не проверены.
- **Действие:** TRIP-05 должен улучшать существующее локальное сохранение без обязательной регистрации.

### 15. Обмен планами

- **Поведение и код:** `lib/shared-trip.ts`, `components/trip-actions.tsx`, `app/trip/page.tsx`: encode/decode allowlist, ссылка `/trip?plan=...`, clipboard с fallback полем, независимая копия с review.
- **Источник:** snapshot оферты, draft, выбранных событий; текущая оферта читается отдельно и может отсутствовать.
- **Ограничения:** токен до 6000 символов; ссылка содержит открываемые получателем сведения, это не шифрование и не резервирование. После правок share создаётся заново.
- **Повторы:** save/share используют одну сериализацию; `/share/[slug]` — отдельный handler для публичного перехода оферты, не хранилище персонального draft.
- **Тесты/пробел:** прошли `shared-trip.test.mjs`, `planned-events.test.mjs`; есть `shared-trip.spec.ts`. Clipboard permissions и получение больших URL в мессенджерах не проверялись.
- **Действие:** сохранять allowlist и различие snapshot/current; UX обратной связи оценить в TRIP-05.

### 16. Email-алерты

- **Поведение и код:** `app/alerts/page.tsx`, `app/alerts/[mode]/page.tsx`, `components/alert-form.tsx`; backend `api/alerts.py`, `services/alerts.py`, `alert_digests.py`, `alert_mail.py`, `jobs/alert_scheduler.py`: double opt-in, предпочтения, управление, отмена и отдельная доставка дайджестов.
- **Источник:** DealAlert/AlertDelivery, доступные Deal, подписанные capability-токены и SMTP; статус API управляет доступностью формы.
- **Ограничения:** ALERTS_ENABLED и SMTP обязательны для регистрации, ALERTS_DIGEST_ENABLED — для worker доставки; Warsaw group в каталоге предлагает выбрать отдельный аэропорт. Отсутствие формы при disabled — предусмотренное поведение, не доказательство отсутствующего backend.
- **Повторы:** одна AlertForm обслуживает signup/manage; доставка отделена от регистрации. Это не две конкурирующие реализации.
- **Тесты/пробел:** прошли `test_alert_preferences.py`, `test_alert_journey.py` с подменённым SMTP; есть `alerts.spec.ts`, `localized-alerts.spec.ts`. Реальная доставка/активные production flags не проверены.
- **Действие:** GROW-01 должен валидировать существующий полный путь, не создавать подписки заново и не включать рассылку в рамках аудита.

### 17. Уведомления и редакционный процесс

- **Поведение и код:** `scripts/notify-activity.py`, `notify-storage.py`, `monitor.py`, systemd timers — эксплуатационные уведомления; backend `api/editor.py`, `services/editorial.py`, `editor_rehearsal.py`, `app/editor/` — подготовка/approval и репетиции материалов.
- **Источник:** JobRun, результаты checks и редакционные сущности. Это отдельные контуры от email-подписок пользователей.
- **Ограничения:** наличие скриптов Telegram/операционных уведомлений не доказывает реализацию персональных Telegram flight alerts; её соответствие GROW-02 в AUD-02 не подтверждено. Rehearsal/dry-run не означает публикацию кампании.
- **Повторы:** notifications и user alerts имеют разные получателей и источники; не объединять без решения.
- **Тесты/пробел:** есть `test_activity_notifications.py`, `test_storage_notifications.py`, `test_editorial.py`, `editorial.spec.ts` (здесь не запускались). Live-отправки не выполнялись.
- **Действие:** GROW-02 отдельно определить пользовательский Telegram flow; сохранить границы операционного канала и редактора.

### 18. SEO-страницы

- **Поведение и код:** `app/from/[iata_code]/page.tsx`, `destinations/[slug]/page.tsx`, city/weekend/route wrappers; `lib/catalog-pages.ts`, `search-policy.ts`, `app/sitemap.ts`, `robots.ts`, preview handlers: metadata, canonical, locale alternates и индексируемые подборки.
- **Источник:** редакционные catalog definitions + API deals и справочники; sitemap строится из published pages/переведённых путей, не из каждой временной оферты.
- **Ограничения:** фильтрованные URL имеют отдельную index/canonical policy; наличие metadata не доказывает индексирование Google. Staging/domain Caddy добавляют собственные ограничения.
- **Повторы:** landing wrappers переиспользуют каталог; отдельные airport/destination страницы имеют свои запросы и metadata.
- **Тесты/пробел:** прошли `search-policy.test.mjs`, `seo-audit.test.mjs`, `test_seo_growth.py`; есть `technical-seo.spec.ts`, `local-seo.spec.ts`. Lighthouse/Search Console и rendered SEO здесь не измерялись.
- **Действие:** сохранить URL; базовые измерения — AUD-04, изменения — SEO-01 и далее.

### 19. Guides и информационный контент

- **Поведение и код:** `lib/content.ts`, `travel-guides.ts`, `airport-guides.ts`, `destination-guides.ts` и тематические collections, `app/info/[slug]/page.tsx`, `components/guide-info.tsx`, `guide-flights.tsx`: статьи, related links, flights/activities и calculator по контексту.
- **Источник:** versioned editorial content, reviewedAt/draft flags и связанный каталог; legal/operator details обрабатываются отдельно.
- **Ограничения:** дата review в коде не доказывает актуальность внешних тарифов; переводы ограничены guide-slugs. Нет основания автоматически генерировать недостающие статьи.
- **Повторы:** collections собираются через spread в content; возможный конфликт одинаковых slug нужно проверять явно, в этой сессии конфликт не установлен.
- **Тесты/пробел:** прошли `home-guides.test.mjs`, `legal-translations.test.mjs`; есть `localized-editorial.spec.ts`, `guide-mobile-layout.spec.ts`. Полная фактологическая проверка статей не выполнялась.
- **Действие:** SEO-04 использовать существующий контент и проверять review/provenance перед правками.

### 20. Аналитика

- **Поведение и код:** `lib/session.ts`, `analytics-context.ts`, trackers, Filters/TripActions; backend `api/analytics.py`, schemas/models: PAGE_VIEW, SEARCH/SEARCH_RESULT, DEAL_VIEW/IMPRESSION, PARTNER_CLICK, FILTER_USE, BUDGET_USE, TRIP_SAVE, события активностей/подтверждения; event_id и клиентское подавление повторов, агрегаты за admin token.
- **Источник:** пользовательские действия при analytics consent; session localStorage с таймаутом 30 минут; клики/конверсии в БД.
- **Ограничения:** часть посетителей не даёт согласие; данные не являются полным трафиком. URL alerts ограничивает отправку, ошибка аналитики не блокирует действие. Реальный funnel baseline не получен.
- **Повторы:** PARTNER_CLICK на клиенте и AFFILIATE_CLICK на redirect отражают разные этапы; их нельзя безусловно суммировать как уникальные переходы.
- **Тесты/пробел:** прошли `analytics-context.test.mjs`, `test_analytics.py`, `test_funnel_analytics.py`; есть `funnel-analytics.spec.ts`. Фактическая полнота production-событий не проверена.
- **Действие:** ANALYTICS-01/02 должны начать с определения метрик и проверки существующих событий.

### 21. Consent и партнёрские переходы

- **Поведение и код:** `components/consent-controls.tsx`, `lib/consent.ts`, `drive-policy.ts`, `components/outbound.tsx`; backend `api/affiliate.py`, `services/affiliate.py`, `affiliate_adapters/stored.py`: отдельные analytics/marketing consent, отказ/настройки, Drive после marketing consent на разрешённых страницах, проверка affiliate policy перед 307.
- **Источник:** consent localStorage на 180 дней; AffiliateProgram/Provider и допустимые HTTPS hosts, сохранённый outbound URL; Stay22 и редакционные ссылки имеют самостоятельные переходы.
- **Ограничения:** Drive включается по публичному site URL; legal/alerts/managed pages его исключают. Withdrawal загруженного скрипта требует reload. Даже без analytics consent backend фиксирует технический affiliate click без session/source/campaign. Approval в БД не равен проверенному статусу внешнего кабинета.
- **Повторы:** consent управляет опциональным трекингом, backend policy — допустимостью redirect; два слоя нужны. Каталог, Stay22 и curated activities имеют разные adapters/маршруты.
- **Тесты/пробел:** прошли `drive-policy.test.mjs`, `test_affiliate.py`, `test_partner_links.py`; есть `consent.spec.ts`, `catalog.spec.ts`. Внешний Drive и attribution в кабинете не проверялись.
- **Действие:** SEC-01/GROW-03 должны сохранить разделение consent и технического redirect; tracking не менять без проверки влияния.

### 22. Локализация и навигация

- **Поведение и код:** `lib/i18n/config.ts`, `routing.ts`, `messages.ts`, тематические copy modules, `src/proxy.ts` (от корня web), `components/locale-provider.tsx`, `language-switcher.tsx`, `site-nav.tsx`: pl/en/ru/uk, язык из URL, общие страницы, перевод labels и metadata.
- **Источник:** локальные словари и allowlist translatedPaths/guide-slugs; `[locale]` wrappers.
- **Ограничения:** publishedLocales по умолчанию только pl; pageLocales разрешает четыре языка на выбранных путях, fallback ведёт на польскую страницу. Наличие словарей не доказывает полноту переводов всех маршрутов.
- **Повторы:** wrappers используют общие страницы; переводные модули разделены по доменам, несколько путей price-score presentation требуют согласованности.
- **Тесты/пробел:** прошли `i18n.test.mjs`, `localized-catalog.test.mjs`, `localized-trips.test.mjs`, `localized-filters.test.mjs`; есть localized-* browser specs. Полный browser matrix четырёх языков не запускался.
- **Действие:** сохранять все языки и allowlist, до расширения маршрутов проверять полную цепочку переходов.

### Проверки AUD-02 и границы результата

Выполнено на Windows, Python 3.12.10 из SDK PyCharm `.venv/Scripts/python.exe`:

```text
npm run test:unit  (cwd apps/web)
110 passed, 0 failed, 0 skipped

<SDK python> -m pytest -q apps/api/tests/test_catalog.py apps/api/tests/test_catalog_results.py apps/api/tests/test_airport_search.py apps/api/tests/test_destination_search.py apps/api/tests/test_trip_filters.py apps/api/tests/test_scoring.py apps/api/tests/test_price_freshness.py apps/api/tests/test_affiliate.py apps/api/tests/test_partner_links.py apps/api/tests/test_events.py apps/api/tests/test_event_flight_fit.py apps/api/tests/test_alert_preferences.py apps/api/tests/test_alert_journey.py apps/api/tests/test_analytics.py apps/api/tests/test_funnel_analytics.py apps/api/tests/test_seo_growth.py
212 passed, 2 warnings (7.55s)
```

Для pytest заданы APP_ENV=test, ALERTS_ENABLED=false, ALERTS_DIGEST_ENABLED=false, EVENTS_ENABLED=false, EVENTS_SYNC_ENABLED=false, EDITOR_ENABLED=false; тестовые override/fixtures включают нужные сценарии локально, SMTP заменён в journey-тесте. Production, реальные рассылки, ingestion и миграции не запускались.

Предупреждения: npm unknown env config `min-release-age`, Node MODULE_TYPELESS_PACKAGE_JSON; backend — deprecation Starlette TestClient/httpx и anyio BlockingPortal. Они не приводили к падению выбранных тестов и не исправлялись в аудите.

E2E, lint/typecheck/build, визуальные/доступностные измерения и live-интеграции не запускались: меняется документация, критерием AUD-02 является карта имеющихся функций. Эти результаты не подменяют AUD-03/04/05 и не доказывают полную регрессию. Новые тесты не добавлялись, так как поведение не менялось.

Критерий AUD-02 выполнен: все перечисленные мастер-планом функции сопоставлены с кодом, источниками, ограничениями, повторным использованием/пересечениями, существующими тестами и дальнейшими действиями. Дублирующая реализация не создавалась. Следующая задача по порядку — AUD-03; она не начата.

---

## AUD-03 — текущий UX/UI: проверенные наблюдения

Дата: 2026-10-30. Зависимость AUD-02 выполнена. Результат задачи — этот отчёт и доказательства, без изменения интерфейса. Предыдущие разделы AUD-01/02 остаются историей соответствующих сессий.

Среда: локальный Next dev, Google Chrome headless через Playwright, fixture FastAPI с отдельной временной SQLite, основной язык pl. Данные оферт на снимках синтетические и не описывают реальные цены/доступность. Ни production, ни платные API, ни рассылки не запускались. Ориентировочный EUR использует существующий публичный NBP loader. Условия и запуск: [aud03/README.md](aud03/README.md); машинные результаты: [evidence.json](aud03/evidence.json).

### Покрытые сценарии

| Сценарий / область AUD-03 | Проверка и результат |
|---|---|
| Поиск → фильтрация → сортировка → страницы | catalog-results E2E desktop/mobile: total, URL, reload, back, изменение условий и сброс пагинации проходят |
| Выдача → оферта → возврат | Дополнительный браузерный сценарий выявил F01 ниже; это именно ссылка приложения, а не browser Back |
| Оферта → проживание → бюджет | Визуально просмотрены детали и блок Stay22; поля дат и adults доступны, подписи и предупреждения читаемы; расчёт и копии плана дополнительно покрыты shared-trip E2E |
| Save → reload → share → независимая копия → remove | shared-trip E2E проходит, включая недоступный localStorage/clipboard и устаревшую/отсутствующую оферту |
| Loading / invalid / unavailable / empty | catalog-results E2E и capture script различают эти состояния; есть retry, очистка неверных условий, снятие budget и возврат на первую страницу |
| Первый визит / consent | consent E2E: optional off, withdrawal, expired/blocked storage, managed pages; панель отказа видна и доступна. Снимок [consent-390](aud03/consent-390.png) |
| Карточки и согласованность | Общий DealCard, одинаковая структура и цены в первых desktop-карточках; данные one-way/round-trip и история различаются ожидаемо. Неполные flight facts не выдаются за известные часы. Неравные высоты из-за данных сами по себе не объявляются дефектом |
| Мобильная компоновка / иерархия | 6 страниц × 320/390/768/1440 px: во всех 24 состояниях scrollWidth ≤ viewport width; F02 ниже описывает вертикальную компоновку |
| Доступность / клавиатура | 12 axe scans (6 страниц при 390 и 1440) с тегами wcag2a/aa, wcag21aa, wcag22aa: 0 violations. First Tab — skip-link, Enter фокусирует #content, Escape закрывает price dialog и возвращает фокус |
| Навигация | Основные ссылки доступны без вложенных меню, active section различима; секции оферты имеют якоря. City-break/weekend находятся в дополнительных ссылках/футере; необходимость переноса в main nav остаётся гипотезой |
| Подписи / объяснения / дубли controls | Проверены формы и тексты состояний, чтение Filters/Home/DealPage/TripBudgetCalculator; F03 и P01/P02 ниже отделяют подтверждённый факт от предполагаемой реакции пользователя |

Снимки визуально просмотрены для home 320/1440, catalog 320/1440, deal 390, stay 390, budget 390, saved 390 и consent 390; остальные изображения и DOM-метрики сохранены для сверки. Viewport — CSS-пиксели; 768/1440 не являются проверкой физического планшета/desktop. Высота capture viewport 900 px, отдельного сценария focus/consent — 844 px. Native date appearance зависит от locale браузера/ОС.

### Подтверждённые проблемы

Серьёзность: **P1** — заметная потеря контекста основного сценария; **P2** — дополнительная прокрутка/затруднение сканирования; **P3** — небольшая редакционная избыточность. Это серьёзность наблюдения, не изменение приоритета задач мастер-плана.

**F01 · P1 · Потеря условий при возврате из оферты.**

- Страницы: `/deals?origin=WRO&budget=220&sort=price` → `/deals/browser-deal` → ссылка «← Aktualne okazje».
- Воспроизведение: открыть указанный каталог, нажать первую карточку, затем `.back-link` в деталях. Итог в `checks.afterDetailBack`: URL `/deals`, origin и budget пустые, sort=`score`. `checks.detailBackHref` равен `/deals`.
- Причина подтверждена чтением `apps/web/src/app/deals/[slug]/page.tsx`: ссылка формируется на фиксированный `/deals`, контекст выдачи не передаётся. Это отличается от browser Back, который сохраняет URL и проходит существующий тест.
- Последствие: выбранные условия нужно вводить снова; пользователь может получить другой набор/порядок оферт. Рекомендация для DEAL-01/TRIP-01: обеспечить безопасный возврат к исходному внутреннему URL и добавить отдельный E2E именно для ссылки приложения. В AUD-03 исправление не выполняется.

**F02 · P2 · Первая карточка ниже первого экрана на узких ширинах.**

- Страницы: `/` и `/deals?origin=WRO&sort=price&budget=220`, после отказа от optional consent; никаких раскрытых advanced filters.
- DOM-координаты верхней границы первой карточки от начала страницы:

| Ширина × высота | Главная | Каталог |
|---|---:|---:|
| 320 × 900 | 1161 px | 1417 px |
| 390 × 900 | 973 px | 1131 px |
| 768 × 900 | 796 px | 823 px |
| 1440 × 900 | 728 px | 640 px |

- Доказательства: `pages[].metrics.firstCardY` в evidence, [home-320](aud03/home-320.png), [catalog-320](aud03/catalog-320.png), [home-1440](aud03/home-1440.png), [catalog-1440](aud03/catalog-1440.png). На мобильном шапка, вводный текст, вертикальная форма, presets и дополнительные элементы предшествуют офертам. Overflow при этом не обнаружен.
- Последствие, подтверждённое геометрией: для начала просмотра предложений нужна прокрутка. Снижение конверсии/непонимание пользователя **не измерены**. Рекомендация UX-01/03 и UI-03: проверить более компактную иерархию, сохраняя подписи, доступные цели и предупреждения; оценить на пользователях, не просто уменьшать шрифт.

**F03 · P3 · Повтор сообщения в состоянии ошибки API.**

- Страница: `/deals?budget=987653` только в локальном fixture; это специально зарезервированный тестовый сценарий отказа.
- Результат `checks.apiFailure`: заголовок «Nie udało się pobrać ofert», затем абзац с той же фразой и предложением повторить попытку, затем retry-link. Факт повторения воспроизведён; ошибки самого retry не обнаружены.
- Код: `apps/web/src/app/deals/page.tsx` выводит heading плюс `pl.error`. Рекомендация DEAL-05: сделать heading и инструкцию взаимодополняющими, не удалять retry. То, что повтор раздражает пользователей, здесь не измерялось.

### Потенциальные проблемы — не воспроизведённые пользовательские ошибки

**P01 · Возможная путаница двух аэропортовых controls на главной.** В `app/page.tsx` есть hero FilterForm и отдельный select под «Zmień lotnisko krótkiego wyjazdu». Они решают разные действия: поиск каталога и подборку коротких поездок. Их наличие подтверждено кодом и snapshot desktop; потеря данных либо ошибочный выбор пользователя не воспроизведены. Разные несохранённые значения могут потребовать пояснения. Следующий UX-02 должен проверить синхронизацию после редактирования/submit/reload до решения об объединении.

**P02 · Семантика «Wyczyść wszystkie filtry» и сортировки.** `checks.afterReset` показывает `/deals?sort=price`: условия origin/budget удалены, порядок price сохранён. Код `components/filters.tsx` делает это намеренно. Сортировка может не считаться фильтром, поэтому это не заявляется функциональным дефектом. Следует уточнить ожидания пользователей и подпись/правило reset в DEAL-02.

**P03 · Плотность объяснений и общие предупреждения.** В карточке и деталях повторяются цена/свежесть/flight-only и осторожные формулировки; budget/stay также повторяют, что пересчёт не подтверждает цену. Это обязательный контекст доверия, не основание механически удалить предупреждения. Проблема чрезмерной нагрузки остаётся гипотезой до пользовательской проверки; progressive disclosure уже есть в TripDetails, advanced filters и budget costs.

### Продуктовые гипотезы

- Более компактная шапка и раскрытие части дополнительных условий могут ускорить переход от ввода к карточке. Подтверждена только геометрия F02, влияние на скорость/конверсию неизвестно.
- Прямые пункты «На выходные»/«Направления» в основной навигации могут улучшить обнаружение подборок; текущие ссылки уже доступны. Проверять сравнением заданий навигации, не добавлять меню без исследования.
- Текстовое историческое сравнение может быть понятнее числовой оценки; сейчас польский диалог и переводные карточки отличаются способом раскрытия. Не заявляется, что текущая оценка вводит пользователей в заблуждение.

### Проверки и ограничения

1. Первый Playwright-запуск с default Chromium: **18 launch failures**, browser binary отсутствовал, до UI-assertions не дошло. Это ограничение окружения. Повтор выбранных `catalog-results.spec.ts consent.spec.ts shared-trip.spec.ts` с `PLAYWRIGHT_CHANNEL=chrome`, SDK Python 3.12.10 и отключёнными реальными alerts/sync: **16 passed (2.0m)**, desktop/mobile. В первый набор также входил trip-navigation.spec.ts; он повторно не запускался и не объявляется успешным.
2. `node docs/aud03/run-audit.cjs`: итог **24 page/viewport состояния, 12 axe scans, violations=[], errors=[]**, keyboard/состояния подтверждены в JSON. Скрипт собирает факты, включая существующие F01/F02; нулевой exit не означает отсутствия UX-проблем. Промежуточный прогон потребовал ожидания завершения навигации/Suspense; другой завершился timeout на price trigger после медленного ответа. В окончательном прогоне ожидания исправлены, один reload для отсутствующего trigger допускается; измерений производительности из этого не делается.
3. Автоматический axe оставляет incomplete-проверки для ручной оценки. Screen reader, реальный touch/клавиатура телефона, WebKit, полный язык matrix, пользовательское исследование, production и внешняя бронь не проверялись. Нельзя утверждать полное соответствие WCAG или отсутствие иных проблем.
4. Flight/event data — из fixtures; реальные доступность/цены/источники не оценивались. В логах встречаются стандартные предупреждения npm min-release-age/NO_COLOR, они не повлияли на успешный повторный E2E.
5. Lint/typecheck/build не запускались: production-код не менялся; новые обязательные CI-тесты не добавлялись. Вспомогательный скрипт относится только к доказательствам аудита. Следующая задача AUD-04 не начата, performance/SEO baseline не выполнялся.

Результат AUD-03: все заявленные области UX/UI рассмотрены; для подтверждённых проблем записаны серьёзность, страницы, воспроизведение и доказательства, для остального явно указан уровень неопределённости. Исправления, deploy и изменения production не выполнялись.

---

## AUD-04 — baseline производительности и SEO

Дата: 2026-10-30. Выбрана следующая незавершённая задача, зависимость AUD-01 выполнена. Изменения ограничены отчётом, трекером и доказательствами. Runtime baseline получен чтением **публичного https://hoptrip.pl**; локальная production-сборка проверена отдельно и не развёртывалась. Commit deployment не установлен, поэтому runtime-числа нельзя приписать HEAD локального checkout.

Метод, окружение, точные команды и ограничения: [aud04/README.md](aud04/README.md). Исходные отчёты и сводка: [Lighthouse](aud04/lighthouse-summary.json), [SEO-контракт](aud04/seo-contract.json), [сеть/API/рендеринг/bundle](aud04/baseline.json).

### Lighthouse и Core Web Vitals

Lighthouse 13.6.0, Chrome 156.0.8078.48, Windows x64 / i7-1355U. По одному последовательному navigation-прогону на URL/device, первый визит без принятия optional consent. Время UTC: 10:44:00–10:44:40. Это лабораторный снимок, не стабильная медиана и не field p75.

| Страница / профиль | Performance | Accessibility | Best practices | SEO | LCP, ms | CLS | TBT, ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| Главная, mobile | 80 | 100 | 100 | 100 | 1317 | 0.3005 | 235 |
| Каталог, mobile | 96 | 100 | 100 | 100 | 1719 | 0 | 48 |
| Главная, desktop | 94 | 100 | 100 | 100 | 349 | 0.1473 | 0 |
| Каталог, desktop | 85 | 100 | 100 | 100 | 361 | 0.2987 | 0 |

Mobile — 412×823, DPR 1.75, simulated RTT 150 ms, throughput 1638.4 Kbps, CPU slowdown ×4; desktop — 1350×940, DPR 1, RTT 40 ms, throughput 10240 Kbps, CPU ×1. Полные настройки и User-Agent находятся в JSON. Базовые сетевые условия вне симуляции/география узла не установлены.

**INP недоступен:** пользовательские взаимодействия и RUM/CrUX не собирались. TBT выше не заменяет INP. Field LCP/CLS также не установлены, поэтому соответствие всего сайта Core Web Vitals не заявляется.

Подтверждённые наблюдения:

- В трёх прогонах есть существенный CLS. Lighthouse `cls-culprits-insight` указывает на `#content` главной, на footer и другие сдвигаемые элементы каталога. Это пострадавшие узлы, а не доказанная первопричина. Позднее появление consent/streamed content — кандидаты на проверку; причинность не установлена. Последующие TECH-03/UI-03 должны воспроизвести сдвиги перед исправлением, не скрывая обязательные предупреждения.
- Все четыре отчёта содержат `label-content-name-mismatch` для `.score-badge`/`.score-trigger`: видимая подпись включает символ ⓘ, а доступное имя имеет другое полное содержание. Итог Accessibility 100 не означает отсутствия замечаний: этот audit имеет отдельный результат score=0, узлы сохранены в raw JSON. Требуется ручная оценка label-in-name, включая символ; независимая WCAG-сертификация не выполнялась. AUD-03 использовал другую среду/axe и более ограниченный набор проверок, его результаты не переинтерпретируются.
- Отмечен `bf-cache` audit. Это сигнал для изучения заголовков/политики, не основание убирать no-store у динамических цен или персональных страниц без оценки свежести/приватности.

### JavaScript, запросы и изображения

Из Lighthouse navigation, байты фактически переданных ресурсов (не распакованный размер JS):

| Страница / профиль | Запросы в отчёте | Всего, bytes | JS, bytes | Изображения, bytes |
|---|---:|---:|---:|---:|
| Главная, mobile | 27 | 528147 | 173239 | 21153 |
| Каталог, mobile | 27 | 535472 | 173403 | 21176 |
| Главная, desktop | 35 | 536251 | 173248 | 24379 |
| Каталог, desktop | 37 | 543013 | 173403 | 24683 |

Отдельный CDP-прогон без throttling и с отключённым cache дал следующие значения; наблюдение завершалось на networkidle. Это другой метод и viewport, числа не должны совпадать с Lighthouse. Поздние lazy-ресурсы вне окна не включены.

| Страница | Ширина | Responses | Encoded bytes | JS bytes | Image bytes |
|---|---:|---:|---:|---:|---:|
| Главная | 390 | 26 | 519820 | 173248 | 15222 |
| Каталог | 390 | 26 | 529483 | 173376 | 15245 |
| Статья price-comparison | 390 | 26 | 516782 | 202879 | 0 |
| Детали актуальной оферты | 390 | 32 | 543412 | 220415 | 353 |
| Главная | 1440 | 35 | 531726 | 173248 | 24379 |
| Каталог | 1440 | 43 | 542896 | 173376 | 24338 |
| Статья price-comparison | 1440 | 26 | 516769 | 202876 | 0 |
| Детали актуальной оферты | 1440 | 32 | 544059 | 220415 | 353 |

Измеренная оферта: `/deals/flight-3311-2026-11-15`; URL зафиксирован для воспроизводимости, будущая доступность не гарантируется. Таблица не содержит обещаний о цене/расписании. Размер 0 у изображений статьи означает отсутствие наблюдённого image-transfer в данном окне, не отсутствие любых визуальных элементов на сайте.

**Локальный bundle:** после успешного `npm run build` в `.next/static/chunks` найдено 20 JS-файлов, сумма **1 020 057 bytes raw / 334 748 bytes gzip** (каждый файл сжат отдельно стандартным zlib). Build ID `o9BLCsqqC6BvXnTFBHnuy`. Это сумма всех chunks локальной сборки, а не загрузка одной страницы и не размер развёрнутой версии. Пофайловый inventory сохранён в baseline.json. Build прошёл TypeScript и генерацию 61 static/SSG страниц.

### Задержка публичного API

Финальный последовательный collect начат в 10:46:35 UTC после завершения SEO-crawl; пять GET на endpoint, время до полного тела ответа, один request context. Все sample statuses 200. Величины включают сеть клиента и не являются чистой серверной latency БД.

| Endpoint | n | Median, ms | p95/max, ms |
|---|---:|---:|---:|
| `/health/ready` | 5 | 46.4 | 51.4 |
| `/api/v1/deals?include_total=true&limit=12` | 5 | 120.7 | 122.3 |
| `/api/v1/deals/flight-3311-2026-11-15` | 5 | 59.4 | 61.7 |

p95 по пяти значениям равен максимуму; это не оценка промышленного SLA. Нагрузочного теста не было.

### Robots, sitemap, metadata, canonical и hreflang

Существующий `apps/web/scripts/audit-seo.mjs` выполнен против публичного сайта с текущим локальным SEO-контрактом: **244 URL / 244 expected, failures=[]**, по **61** на pl/en/ru/uk. Проверяются HTTP 200, уникальность title/description, language/h1, metadata/OG/Twitter, canonical, hreflang reciprocity, preview PNG, breadcrumbs, приватные/noindex пути, неизвестные статьи/share URLs и robots.

Дополнительно сохранены 14 выборочных DOM/HTTP снимков metadata:

- `robots.txt` вернул 200: Allow `/`, Disallow `/api/` и `/go/`, Sitemap `https://hoptrip.pl/sitemap.xml`. Публичный сайт не закрыт staging-правилом Disallow `/`. Код `infrastructure/Caddyfile.staging` отдельно задаёт noindex/nofollow; его фактическое развёртывание не менялось и не проверялось.
- Sitemap вернул 200, содержит 244 уникальных URL после нормализации URL. Главная `https://hoptrip.pl` и вариант со слешем считаются одним URL. Отсутствие временных оферт/личных планов — ожидаемая политика.
- Главная, `/deals`, `/en/deals`, `/ru/deals`, `/uk/deals`, `/from/WRO`, `/destinations/milan`, `/info/price-comparison`: index/follow, self-canonical, ожидаемый язык. Для переведённых путей полная взаимность hreflang проверена контрактом.
- `/deals?origin=WRO`: noindex/follow и canonical с этим параметром; это существующая политика, не массовое удаление URL. Сам запрос не публикуется в sitemap.
- `/saved`, `/trip`, `/alerts`: noindex/nofollow; `/info/privacy`: noindex/follow также в X-Robots-Tag; временная оферта: noindex/follow. Приватные планы не были созданы и никакие пользовательские токены не использовались.
- Структурированные данные: у просмотренной статьи валидный JSON-LD BreadcrumbList, у главной/каталога/временной оферты JSON-LD в выборке нет. Существующий контракт проверяет breadcrumbs опубликованных статей/переводов и отсутствие неподходящей разметки на приватных страницах. Отсутствие Product/Offer/rating schema само по себе не объявляется дефектом; значения нельзя выдумывать.

Результат контракта не означает фактическую индексацию Google или соответствие всего контента поисковому спросу: Search Console, crawling Googlebot и demand/CTR не получены. Вся уникальность/полнота SEO здесь оценена по существующему контракту, не независимым перечнем всех возможных URL.

### Серверный HTML и зависимость от JavaScript

С отключённым JavaScript проверены главная, каталог, статья и детали оферты (HTTP 200):

- Главная: h1 и шесть карточек присутствуют в видимом main. Статья и детали оферты также имеют видимый серверный текст/h1.
- `/deals`: h1 и 12 карточек присутствуют в HTML, но main с контентом скрыт; видимым остаётся отдельный main с «Ładowanie ofert». Это зафиксировано `noJavaScript[].mainRegions` в baseline.json. Для показа streamed-каталога браузеру нужен JavaScript, несмотря на наличие HTML.
- Вывод ограничен данным no-JS сценарием. Нельзя из него заключить, что Google не индексирует каталог: поисковый рендеринг здесь не измерен. Рекомендация для SEO-01/TECH-03 — отдельно проверить fallback и crawl/render до изменений Suspense/индексации.

### Проверки, ограничения и безопасность

- `npm run build` — успешно. Generated next-env.d.ts возвращён к исходным dev-imports, чтобы не оставить побочную правку приложения.
- `node --experimental-strip-types --test tests/seo-audit.test.mjs tests/search-policy.test.mjs tests/i18n.test.mjs` — **14 passed**, 0 failures. Проверяют локальный контракт/URL-policy/i18n; production-страницы дополнительно прошли browser SEO-аудит.
- Четыре Lighthouse-прогона — exit 0, runtimeError отсутствует, runWarnings=[]; collect — 14 pages, 8 network samples, errors=[]. Вспомогательные скрипты проверены node --check. Новых обязательных CI-тестов нет, поскольку поведение приложения не менялось.
- Локальный fixture на исходном порту 8100 не стартовал из-за занятого порта; перенесён на 8124, не затрагивая чужие процессы. Локальный web start на 3124 отклонён автоматической проверкой («blocked by policy»), не обходился; поэтому локальный production runtime **не проверен**. Его нельзя смешивать с публичным baseline. Fixture остановлен, deploy не выполнялся.
- Первоначальный collect остановился на неоднозначном main в no-JS каталоге; окончательный сбор фиксирует все regions и их видимость. Четыре Lighthouse-файла и baseline.json содержат только завершённые итоговые измерения.
- INP/field CWV, повторная статистика Lighthouse, реальные устройства, consent-on/маркетинговый режим, нагрузка, origin-only latency без сети и deployed commit недоступны/не измерены. Это явные границы baseline, предусмотренные AUD-04; значения не угадываются.

Критерии AUD-04 выполнены: фактические измерения записаны с датой, средой, устройством и методом; недоступные показатели отмечены. Исправления производительности, SEO, доступности и следующий regression baseline **AUD-05 не начаты**.

---

## AUD-05 — стратегия тестов и регрессионный baseline

Дата: 2026-10-30. Зависимости AUD-01/AUD-02 выполнены; выбран только AUD-05. Тест-план: [HOPTRIP_TEST_PLAN.md](HOPTRIP_TEST_PLAN.md). Команды/изоляция: [aud05/README.md](aud05/README.md). Исторические формулировки предыдущих разделов относятся к их сессиям.

### Инвентаризация и стратегия

Обнаружены **54 backend test-файла**, **31 Node unit-файл**, **58 Playwright spec-файлов** с учётом нового baseline-spec. После исправления discovery полная Playwright-инвентаризация содержит **436 cases** по desktop/mobile, без ошибок загрузки. Это число включает параметризованные и потенциально skipped cases, не является процентом покрытия или заявлением о полном прогоне.

- Backend: pytest, TestClient, SQLite fixtures, HTTPX/SMTP mocks; PostgreSQL marker отдельно проверяет схему, уникальность и многопроцессные/параллельные операции.
- Web unit: Node test runner/TypeScript strip-types, чистые даты/деньги/i18n/URL/contracts, serialization и unknown costs.
- Browser: Playwright, fixture API, desktop/mobile emulation, сохранение и восстановление состояния, отдельные axe/keyboard проверки. Chrome выбран, поскольку bundled Chromium отсутствовал в предыдущих сессиях.
- CI: основной workflow запускает backend quality/tests и web unit/lint/build; extended workflow отдельно и вручную запускает E2E и rehearsal SEO/accessibility. Статус реального удалённого CI в AUD-05 не проверялся.

Тест-план сопоставляет **все E2E-01..E2E-24** мастер-плана с файлами, слоями проверки и пробелами. Отдельно выделены partner attribution, alerts UI, реальные устройства, screen reader, live-провайдеры, маркетинговый режим и будущая CRITICAL_INCOMPLETE classification; их полная проверка не приписывается частичному browser-прогону. Строки/ветви coverage не измерялись.

### Проверенная проблема тестового контура и изменение

До изменения unrestricted `playwright test --list` импортировал не только browser specs, но и `.test.mjs` Node-тесты. Unit-модули с TypeScript require-hook влияли на callback fixtures Playwright; воспроизведены **129 discovery errors**, сообщение `First argument must use the object destructuring pattern: _a`, 0 discovered cases.

Исправление в `apps/web/playwright.config.ts`: добавлен только `testMatch: '**/*.spec.ts'`. Unit runner `npm run test:unit` продолжает запускать `.test.mjs` отдельно. Повтор полного discovery: **0 ошибок, 436 cases**. Доказательства: [до](aud05/preexisting-discovery.json), [после](aud05/inventory-summary.json), [полный список](aud05/e2e-inventory.json). Это изменение тестовой инфраструктуры, не маршрутов/компонентов приложения.

### Новые сфокусированные проверки

`apps/web/tests/roadmap-baseline.spec.ts`:

1. Origin preference: глобальный поиск сохраняет HttpOnly cookie; главная восстанавливает оба controls; выбор другого аэропорта коротких поездок переживает reload; reset удаляет cookie и последующая главная остаётся без origin. В существующих просмотренных airport tests такого полного цикла не было.
2. Известная потеря фильтров **AUD-03 F01**: возврат через ссылку приложения должен сохранить выбранный поиск. Перед этим утверждением установлен `test.fail` с объяснением; подготовка до него не маскируется. Expected failure не считается успешным сохранением контекста. После будущего исправления тест даст unexpected pass и потребует убрать аннотацию. Само исправление продуктовой логики не выполнялось.

### Изоляция и воспроизводимость

Основной backend-набор запущен с DATABASE_URL=sqlite:// и выключенными flags, PostgreSQL-набор — против одноразового postgres:16-alpine контейнера `hoptrip-aud05-20261030`, label AUD-05, DB hoptrip_test, случайный loopback-порт 53148, без host volumes. Alembic применялся только к этой fixture-БД; production не затрагивался. Контейнер остановлен после тестов.

Занятые 3100/8100 не переиспользовались. Browser-прогон выполнен в отдельной `.cache/aud05-isolated` копии с портами 3125/8125, собственным .next и временной SQLite; node_modules подключены junction. Только временная Next config получила filesystem root для Turbopack. [Сверка исходников](aud05/isolation-source-check.json): **539 runtime-файлов**, 0 различий с checkout. Снимки старых specs с фиксированными ../../docs также пишутся внутри временной копии. Сборочный каталог и процессы пользователя не очищались.

### Первоначальные проблемы подготовки и существующие падения

- Прямой E2E запуск остановлен до тестов из-за занятого 8100. Первый старт временной копии потребовал настройки Turbopack root для junction; это устранено только в helper/временной конфигурации.
- Первый PostgreSQL-прогон: 10 pass и failure migration_head, потому что Alembic ещё не был применён к новой пустой БД. После `alembic upgrade head` все 11 прошли; это ошибка подготовки baseline, не дефект миграций.
- В первом расширенном browser-прогоне существующие desktop airport-search и catalog-results не дождались изменения URL/счётчика за 5 секунд. Первоначальные ошибки сохраняются в baseline; повтор отдельных сценариев оценивается отдельно, без изменения product logic и без сокрытия неуспешного первого запуска.

### Итоговые проверки

| Проверка | Результат |
|---|---|
| pytest `-m 'not postgres'` | 653 passed, 11 deselected, 2 deprecation warnings; 30.52 s |
| Alembic в одноразовой БД | Upgrade до 0018_editorial_rehearsal успешно |
| pytest `-m postgres` после миграций | 11 passed, 653 deselected, 2 warnings; 17.92 s |
| Web Node unit | 110 passed, 0 failures |
| Ruff / mypy | Passed / no issues in 100 source files |
| Web ESLint | Полный lint до правки тестов и отдельный lint изменённых TS-файлов — passed |
| Production build | Passed, включая TypeScript и 61 static/SSG страниц; не развёртывался |
| E2E первый расширенный прогон | 100 случаев: 96 обычных PASS, 2 expected failure F01, 2 unexpected desktop failures; CLI сообщает 98 passed / 2 failed (11.7m), поскольку expected failures включены в принятые runner результаты |
| E2E целевой повтор desktop | 4 случая: 3 обычных PASS (два старых теста и новый cookie-cycle), 1 expected failure F01; unexpected=0, 32.9 s |
| Полное E2E discovery | 436 cases, errors=[]; не полный browser-прогон |

Backend в сумме: **664 различных теста прошли** по двум отдельным наборам, а не два полных прогона одного набора. Результаты [SQLite/API](aud05/backend.xml), [PostgreSQL](aud05/postgres.xml), [первый E2E log](aud05/e2e-initial.txt), [JSON целевого повтора](aud05/e2e-recheck.json), [сводка](aud05/results.json) сохранены. Контексты первоначальных падений: [airport](aud05/airport-initial-error.txt), [catalog](aud05/catalog-initial-error.txt).

Оба первоначальных падения существующих desktop-тестов не повторились при отдельном запуске **без изменения их кода**. Сценарии также прошли на mobile в первом наборе. Это риск нестабильности, а не доказательство отсутствия проблемы: причины не установлены, retries в config остаются 0, исходный неуспешный прогон не скрыт. F01 повторно подтверждён именно URL-assertion, а не ошибкой подготовки. Новый cookie-cycle прошёл desktop/mobile в первом наборе и desktop в повторе.

Дополнительные ограничения: полный 436-case suite, WebKit, operational shell/PowerShell tests, реальные устройства и внешняя доставка/партнёрские кабинеты не запускались. Это не утверждение о полном зелёном CI. Проверенная стратегия, gaps и набор для последующих изменений находятся в тест-плане.

Runtime source и production не менялись. После build восстановлены только автогенерируемые dev-imports next-env.d.ts к исходному виду. Dependencies/lock-файлы не менялись. Playwright завершил принадлежащие ему серверы; одноразовый PostgreSQL-контейнер остановлен с проверкой label. Технические предупреждения npm min-release-age/NO_COLOR и deprecations TestClient/anyio не приводили к падению unit/backend/quality проверок и не исправлялись в аудите.

AUD-05 завершён как инвентаризация и фиксация regression baseline: критические сценарии имеют документированную стратегию, пробелы и существующие неуспешные результаты явно сохранены; добавлены две сфокусированные проверки и устранена ошибка discovery. Это **не** заявление, что F01 исправлен или первый E2E-прогон был полностью успешен. Следующая задача по рекомендованному порядку — **SEC-01**; она не начата.

## SEC-01 — Security and Privacy Review (2026-10-30)

Проверены все 12 областей master plan: secrets, API validation, external URLs, CSP, rate limits, dependencies, user content, analytics consent, PII, email consent, trackers и deletion/retention. Полная матрица с evidence, остаточными рисками, профессиональными legal questions и командами находится в [sec01/README.md](sec01/README.md).

Подтверждены и исправлены четыре технические находки: vulnerable certifi/pytest pins, приватные пути в Docker build contexts и вывод input values в текстовых Settings errors. Upstream Critical certifi закрыта в checkout; реальное состояние deployed image неизвестно. Реальные secrets не выводились, production и credentials не изменялись.

Проверки на обновлённых пакетах: 655 backend + 11 PostgreSQL passed (666 различных tests); web unit 110; Ruff/mypy/ESLint/build passed. Python audit после fix: 42 packages, 0 known vulnerabilities; npm audit 0. Scratch Docker before/after подтвердил исключение синтетических private canaries. Новые config regressions проверены красными до fix и зелёными после.

Browser consent/alerts/localized-alerts: 23 pass и 1 initial unavailable-state failure из 24, отдельный desktop signup/confirm/manage/stop — pass. Причина исходного failure не доказана; результат не скрыт. Исправлен только helper временного копирования email URL, не runtime fixture. Полный E2E suite не запускался.

Публичные GET подтверждают отсутствие CSP на sampled home/deals и строгую editor CSP; admin URL даёт 404. Нет доказанного XSS/auth bypass. Открыты public CSP/HSTS rollout, rate limit scope за reverse proxy, сроки/удаление subscriptions и backups, professional consent/vendor/legal review. Нулевые package/secret pattern findings не доказывают полную безопасность. SEC-01 завершён как review и исправления checkout; DATA-03 не начата.

## DATA-03 — Flight Date, Airport, and Timezone Validation (2026-10-30)

Обнаружены и исправлены подтверждённые ошибки route/date validation: несвязанные пересадки и участки origin=destination, ответ provider для другого запрошенного маршрута, невозможная дата/offset как валидные часы и подсчёт trip_duration по UTC dates. Последний мог отфильтровать однодневную поездку с вылетом сразу после местной полуночи как двухдневную. Запрошенные city/airport codes сопоставляются по явным полям; неизвестные связи аэропорта и города не выдумываются.

Общий backend parser требует calendar timestamp с offset и проверяет UTC representability, web formatter использует существующий validCalendarDate и clock bounds. Date-only остаётся датой. Сохранены source offset fallback, DST/overnight conversion, явное UTC при unknown timezone, независимые return airports и REST/GQL semantics. Модель IATA existence, live расписание и физическая правдоподобность каждого маршрута полностью не доказаны: используются syntax/reference/active DB mapping и существующие defensive duration bounds.

Добавлен 41 backend case и web regression; красные фазы воспроизвели 12 основных и 2 query-guard failures. Финальный non-PG suite 696 pass; web 111; E2E 14/14 desktop/mobile; Ruff/mypy/lint/build passed. Отдельные 11 PostgreSQL tests прошли до финального provider query guard, который проверен финальным non-PG набором. Промежуточные результаты не суммируются. [Матрица требований, raw results и команды](data03/README.md).

Ни production, ни схема БД не менялись. Миграции применены только в disposable hoptrip_test, контейнер завершён. Нет массового backfill старых offers или observations. Historical cohort UTC keys оставлены для явного review DATA-02; DATA-01 freshness не реализовывалась. Только DATA-03 завершена; следующая DATA-01 не начата.

## DATA-01 — Flight Freshness and Expiration (2026-10-30)

Все восемь требуемых областей сопоставлены с кодом и tests в [data01/README.md](data01/README.md). Существующая защита уже скрывала stale/expired source на чтении и отключала CTA в открытой вкладке; интервалы 6/24/48 h freshness и 1/4/12 h refresh сохранены. Provider failure/повторная доставка не объявляются live verification или новым наблюдением.

Подтверждён и исправлен дефект deadline при A → B → A: mutable offer терял ранний source expiry A, хотя first-seen сохранялся. Nullable expires_at в PriceObservation и row locks удерживают earliest effective deadline независимо от текущей цены. Защита exact-trip snapshot от broad overwrite теперь также учитывает более ранний deadline той же observation_key, не заменяя цену или ticket. Legacy returned quote с неизвестным прежним expiry консервативно остаётся историческим/недоступным; known current expiry и действительно новое source observation имеют отдельные проверенные пути.

Миграция 0019 additive, без удаления/backfill; новое приложение требует её применения перед запуском. [DATA-01-01](HOPTRIP_DECISIONS.md) фиксирует модель, legacy policy и последствия rollback. Проверен upgrade/downgrade/upgrade populated history в generated test schema; production migration/deploy не выполнялись. Исторические prices/timestamps остаются для statistics, cohorts/median/score не менялись.

Финальные результаты: 703 non-PG + 13 PostgreSQL = 716 различных backend tests passed, web unit 111, E2E 4/4 desktop/mobile, Ruff/mypy passed. Red phases и первоначальный PG head expectation failure сохранены отдельно. Нет UI-изменений, новые web lint/build не запускались. Миграции/гонки проверялись только в disposable hoptrip_test, контейнер и собственные fixture-серверы завершены. DATA-01 завершена; DATA-02 не начата.

## DATA-02 — Historical Price and Scoring Validation (2026-10-30)

Проверены median/quartiles, cohort keys, date/itinerary scope, sample thresholds, invalid/missing data, percentage signs, freshness и ranking arithmetic. [Полный отчёт](data02/README.md) содержит точные формулы/ограничения и reproducible evidence.

Исправлены подтверждённые дефекты aggregation (nonpositive/nonfinite/future/missing-route history и оставшийся cache пустой группы), discount claim при sample<5 и принятие неверного score snapshot только по сумме. route-utc-v1 certifies derived cache после настоящего recalc; nullable migration 0020 не выдумывает trust для старых rows. flight-v4 сохраняет веса 60/25/15 и воспроизводит snapshot на saved calculation time; не пересчитывает ranking при чтении. Old v3/unverified/provisional data не получают CURRENT price advantage.

UTC dates нормализуются при последующем ingestion и совпадают с statistics lookup; historical keys/rows массово не менялись. Существующая UTC month/date-interval methodology сохранена намеренно: полных timezone/payload данных всей PriceObservation history нет. Cards/score/full methodology PL/EN/RU/UK честно описывают broad destination cohort, UTC/local night differences и зависимые/повторные observations вместо обещания идентичных тарифов или гарантированной экономии. Sample coverage/confidence — индекс n/30, не вероятность репрезентативности.

Финальные gates: 733 non-PG + 15 PostgreSQL = 748 различных backend passed; web unit 112, Ruff/mypy/lint/build passed, E2E 6/6 desktop/mobile (включая четыре locale methodology pages/320 px). Initial E2E errors и intermediate repeats разделены; причина первого desktop API-error state не установлена, полный browser suite не заявлен пройденным. Миграция, preserved-cache sentinel и PostgreSQL NaN проверены только в disposable hoptrip_test; production не менялся.

Для release требуется 0020 и штатный recalc statistics + generation fresh deals; rollback оставляет additive column. Ни deletion history, ни fake local-date backfill не выполнялись. Только DATA-02 завершена; следующая DEAL-04 не начата.

## DEAL-04 — Flight Data Quality Classification (2026-10-30)

Подтверждено: отдельные flight facts/structured legs проверки существовали, общего quality status и общего recommendation gate не было. Реализован read-only classifier flight-quality-v1: COMPLETE, PARTIAL, CRITICAL_INCOMPLETE; provenance, обязательные route/date facts, chronology, duration и canonical/context conflicts проверяются централизованно. Подтверждённые legs могут заполнить недостающее redundant REST поле; valid open-jaw остаётся допустимым. Политика и ограничения — [отчёт DEAL-04](deal04/README.md), решение [DEAL-04-01](HOPTRIP_DECISIONS.md).

Partial/critical предупреждения общие для flight summary и локализованы PL/EN/RU/UK. Критические записи остаются в стандартном каталоге/detail/history и под прежними redirect gates, но исключены из home/guide automatic selections; API featured маскируется без изменения DB flag. First-100 window может не охватывать все eligible records. Это полнота route/timing profile, не live inventory, fare/baggage guarantee или статистическая confidence; freshness/availability/score сохраняют свои отдельные правила. Email/editorial flows не активировались и не переписывались.

761 non-PG + 15 PostgreSQL = 776 различных backend passed; web unit115, Ruff/mypy101/lint/build passed. Новые quality browser scenarios прошли desktop/mobile, включая четыре языка/320 px и scoped axe. Initial12/14 выявил contrast defect и исправлен. После fix13/14: один desktop open-jaw detail locator не найден, причина не установлена; final focused8/8 (quality/open-jaw/origin preference), без изменения locator/product для обхода. Отчёты разделены; полного E2E pass не заявлено.

Новых миграций нет. Прежний head0020 и persistence regression проверены в disposable PostgreSQL16 hoptrip_test без volumes, label DEAL-04; контейнер остановлен/удалён после проверки label. 543 runtime-файла isolated copy совпали с checkout; собственные 3125/8125 servers завершены. Production, affiliate tracking, source/history и пользовательские изменения сохранены. Backend-first release и rollback только DEAL-04 описаны в отчёте. DEAL-04 завершена, UX-01 не начата.

## UX-01 — Redesign Homepage Hero (2026-10-30)

Проверено исходное состояние: общий FilterForm уже имел matching/validation, но даты были скрыты, presets создавали дополнительные search actions, Anywhere обозначался только empty-field hint, а главная восстанавливала только origin. Обновлены copy и представление общей формы: одна primary action, явный Anywhere, видимые departure bounds, optional flight budget и дополнительная длина пребывания. PL/EN/RU/UK сохранены. API, scoring, flight-quality gates, источники/история и SEO canonical routes не менялись.

AUD-03 F01 исправлен для card и full score links: allowlisted returnTo сохраняет filters/sort/offset через detail/reload/new-tab; canonical и seller/shared-plan links не заимствуют search context. Server action выполняет optional origin save и internal catalog redirect в одной операции. Validation/FormData идут до React transition; pending controls блокируются, invalid focus сохраняется. Cookie contract прежний; UX-02 selected-origin unification не выполнялась.

120 web unit, ESLint/build/TypeScript/61 static/SSG pages passed. Основная browser acceptance 24/24, включая held-POST pending regression, invalid focus, четыре языка и return/reset. Дополнительные runs проверили 16 px/44 px controls, вертикальные dates на 320 px, полный stay/events/budget/save/share/mobile/partner journey и affiliate/session/click tracking. Score new-tab через home/search — 2/2. Initial/intermediate failures и cold direct-entry API-error state сохранены; причина последнего не установлена. Финальный score setup через hero не объявляется исправлением cold-entry reliability. Полного browser-suite pass не заявлено.

Наблюдаемые ограничения: на коротком mobile viewport форма прокручивается вертикально; data hints остаются aria-described при визуальном скрытии. Независимый origin selector коротких поездок и порядок нижних секций оставлены для UX-02/03. 544 runtime-файла isolated copy совпали с checkout. DB migrations/backend suites/production release не выполнялись; собственные fixture servers завершены. Политика, tests, screenshots и rollback — [отчёт UX-01](ux01/README.md), решение [UX-01-01](HOPTRIP_DECISIONS.md). UX-01 завершена; UX-02 не начата.

## UX-02 — единый airport selection

Дата: 2026-10-31. До изменения подтверждены два независимых home controls и существующая preference cookie. Главная теперь использует URL/проверенный cookie fallback и один hero AirportSelect; подборка показывает тот же код и кнопку фокуса. Коммит выбора обновляет URL/cookie/SSR recommendations; destination/date/budget drafts сохраняются. Invalid text не переписывает committed origin. Переводы PL/EN/RU/UK обновлены.

Карточки сохранены Server Components; другой-origin snapshot скрыт. Обнаруженная браузером гонка cookie RSC против новых links устранена порядком save → navigate; текст AirportSelect привязан к коду выбора, чтобы Back не показывал последний label. Прежние quality/2–4-night/count gates сохранены. Существующие catalog/Warsaw/alerts semantics описаны в [UX-02 report](ux02/README.md). API runtime/DB/production не менялись; synthetic fixture дополнена фактами для прохождения существующего quality gate. Ограничение cold direct catalog entry из UX-01 этой задачей не считается закрытым.

## UX-03 — иерархия главной

Проверено 2026-10-31: после существующих search/recommendations теперь явно отделены коллекции, направления, планирование, how-to и руководства. Все airport/destination registry links и locale fallbacks сохранены, аэропорты находятся в native details. Направления не объявлены популярными без данных. Убраны повторные нижние пояснения; существующая подборка2–4 ночи остаётся единственной. Нижние sections серверные, без новых API fetch/client modules, Link prefetch=false. API, metadata, root navigation, scoring/quality/affiliate logic не менялись. Подробности: [UX-03](ux03/README.md).

Открытое наблюдение UX-03-F01: home-layout desktop/mobile при быстром заполнении нескольких полей после origin draft получил home?origin=WRO вместо catalog URL. Origin runtime в UX-03 не менялся. Setup с chooseOrigin дожидается уже завершённого выбора и не является доказательством исправления быстрого ввода во время pending origin transition. Причина не исследована этой задачей. Отдельно hero locale desktop получил отсутствие card и timeout; API/cold-entry reliability не объявляется исправленной. Raw evidence в ux03/e2e.json.

## UX-04 — navigation

Проверено 2026-10-31: прежняя шапка смешивала offers/saved/calculator/info, weekend и directions находились ниже. Теперь пять primary journeys с существующими маршрутами, /info в footer; legal/secondary links не удалены. Directions используют home anchor UX-03 и выделяются также на destination landing. Planner не выдуман: budget calculator имеет точный label. Path/hash active policy исключает prefix collisions и не подсвечивает primary на справочных страницах. Ни route files, ни metadata/API/DB/affiliate logic не менялись. [Отчёт UX-04](ux04/README.md).

## DEAL-01 — shared flight card

Проверено2026-10-31: DealCard/DealGrid уже единые; default перегружен полными clock/carrier/interval и повторными пояснениями, PL не показывал PriceSummary. Теперь компактнее отступы, явный CTA, history summary на4 языках. Full clocks/metadata в прежних details, material unknown/estimated/date-shift/airport/expiry предупреждения остаются видимы. PARTIAL reasons в общем disclosure, all critical reasons снаружи. Card-only режим не меняет detail schedule. API/DB/scoring/affiliate tracking не менялись. Intermediate899.55/769.78px и selector/API failures сохранены в [DEAL-01](deal01/README.md), height bound730 не ослаблен. Cold-entry reliability не объявляется исправленной.

## DEAL-02 — filter workflow и закрытый controlled UX-03-F01

Проверено2026-10-31: API не поддерживает direct/stops/time controls, поэтому таких кнопок нет. Каталог открывает date/night fields по умолчанию, presets reflect draft fields, same-URL preset обновляет свои значения без remount, applied chips/count/empty и reset retaining sort описаны явно. Backend/query/SEO/card/affiliate policies не менялись.

UX-03-F01 воспроизведён на прежних3 filter/origin modules: delayed-response test0/2 оставался на home?originWRO вместо полного поиска. Valid full-search handoff теперь отменяет origin-only navigation и suppress home refresh; acceptance22/22 включает тот же сценарий и Back. Это закрытие конкретного воспроизведения, API/cold-entry reliability остаётся открытой. [Raw evidence и ограничения](deal02/README.md).

## DEAL-05 — понятные состояния и recovery

Проверено2026-10-31: catalog error/empty/offset recovery, Suspense и expiry guards уже существовали. Улучшены shared panel/actions, pending status, три независимых ослабления активных ограничений, detail API failure с сохранением validated returnTo, home retry и expiry/blocked-partner catalog links. Error не подменяется пустой выдачей; новых matching offers/prices нет. Тексты PL/EN/RU/UK. Production backend/query/score/affiliate handler не менялись, synthetic routes только в guarded E2E app.

Промежуточный root loading boundary при missing detail дал HTTP200 с noindex; он удалён, initial catalog load остаётся в прежнем Suspense. Финальные404/SEO и state acceptance28/28 passed,232.86s; [DEAL-05](deal05/README.md). Первый browser набор31/34: два outdated collapsed-airport setups и один API failure вместо expected empty; последний не объявляется устранённым reliability defect. Все14 новых cases прошли в первом наборе; окончательные результаты и ограничения — в отчёте. Предыдущие API/cold-entry observations остаются открытыми.

## DEAL-06 — comparison entry и sample context

Проверено2026-10-31: prominent card score уже отсутствовал; оставались numeric accessible name PL и number в collapsed calculation heading, count был в дополнительном раскрытии, non-PL link сразу вёл на detail. Теперь общие localized modal/close, neutral summary для insufficient/legacy, current observation count/scope перед раскрытием, exact score только в деталях. Backend formulas/snapshots/ranking/affiliate не менялись.

Одно публичное read-only API чтение100 из221 offers дало77 CURRENT/23 PROVISIONAL; CURRENT sample count quantiles5/9/15/28/107, signed-percent quantiles−24.07/−2.52/0/7.60/64.29. Это selected published sample, не данные для новой significance шкалы. Новые economic thresholds отвергнуты; existing <1PLN — точность текста, не market norm. [Evidence/ограничения](deal06/README.md). UI fixtures не выдаются за реальные distributions, production DB/ingestion не затрагивались.

DEAL-06 acceptance: unit156/lint/build passed; E2E20/20, cards15/16 и final targeted2/2 с сохранёнными bounds. Cold API failure и obsolete pre-DEAL-02 viewport setup отделены от исправлений продукта; raw contexts в отчёте. DEAL-06 DONE, DEAL-03 не начата.

## DEAL-03 — проверка сортировки и точные названия

Проверено2026-10-31: API уже поддерживает3 stable SQL orders с final unique id, global filtering до pagination, list/envelope parity и single-request count/page snapshot. Не изменялось. Уточнены PL/EN/RU/UK labels и applied-rule descriptions: composite saved score, numeric PLN/person, card departure date без clock tie-break. Invalid URL не получает выдуманный applied order. Existing form submission/drafts/offset/history/returnTo/SEO policies сохранены.

Normalized complete journey duration для всей выдачи нет; nights не является временем полёта, destination interval включает sleep/transfers и не является usable time. Новые unsupported orders и ranking по отсутствующим данным не добавлены. Backend tests14 pass, включая9 новых cases на NULL/zero journey data, repeated paginated ties/list-envelope parity и422 вместо silent fallback. [Evidence и browser результаты](deal03/README.md). Production backend/SQL/score/storage/affiliate unchanged.

DEAL-03 acceptance: API14/unit158/Ruff/ESLint/build passed; browser26/26, errors=[],310.57s,4 locales/320px. Global order/pagination/held applied state и unchanged affiliate/SEO regression подтверждены. API reliability вне этого набора не сертифицируется. DEAL-03 DONE; TRIP-01 не начата.

## TRIP-01 — hierarchy и критические предупреждения

Проверено2026-10-31: полная detail функциональность уже существовала, но budget/methodology предшествовали activities/events, PriceAssessment повторял observation/availability в TripDetails, часть critical reasons была скрыта, nav не имел booking/methodology/attractions. Теперь flight/partner decision precedes planning, full methodology последняя; все critical reasons без disclosure. Классификация и booking approval/expiry policies не менялись.

Source fields/airports/clocks и card defaults сохранены, full flight facts в details. Только detail duplicate comparison удалён, timestamps/limitations остаются в основных соответствующих местах. Conditional nav сохраняет shared-page defaults. Перестановка прежних widgets не является изменением TRIP-02/03/04/05 logic. [Raw runs и verified limitations](trip01/README.md). Initial36 cases:26 pass,10 failures из ошибочного approved-link assumption для schedule fixture и outdated card-carrier expectation; после исправления tests12/12. First-fold проверка выявила русский desktop CTA ratio0.754, padding уплотнён без скрытия текста/изменения targets. Все этапы сохранены.

TRIP-01 acceptance: final12/12,156.54s и narrow2/2,26.72s,errors=[],retries0. All critical reasons,4 locales,320px, first-fold checks, shared plan/state/affiliate/expiry preserved. Runtime549 parity; direct viewport measurements ограничены fixtures. Ранние failures и промежуточные reports сохранены, full suite не заявляется. TRIP-01 DONE; TRIP-02 не начата.

## TRIP-02 — accommodation context

Проверено2026-10-31: Stay22 уже сохранял destination/date/adult context и общий draft/budget, но local schedule требовал ручного копирования, summary исчезал при invalid input, отсутствие quote было в disclosure. Теперь видимые local-date hints и explicit apply action, always-ready selected summary с missing/unconfirmed markers, accessible quote note. Исходные URL/aid/campaign/lang/currency и click/consent handlers сохранены.

Read-only synthetic probe: outbound1May, arrival2May, return departure4May, home arrival5May → hint2–4May, без hotel night до возвращения домой. Unknown-zone/one-way/same-day handling подтверждено, даты/quotes не выдумываются. Unit168 и browser30/30 проверили local conversion/DST/date line/strict boundaries и shared costs/people/manual reload/share/provider parameters. [Raw evidence](trip02/README.md). Live provider/production DB/quotes не проверялись и не менялись; TRIP-03 не начата.

## TRIP-03 — calculator modes и additive costs

Проверено2026-10-31: существующие integer-grosz PLN formulas, flight prefill, per-person/group/night/day basis, independent hotel modes, local draft/shared snapshot/events/reference FX уже работали. Основные четыре поля и disclosure тоже существовали. Добавлены явные quick/detailed controls с одним расчётом, separate group taxes/fees и emergency buffer, confidence/unknown labels, hidden-error recovery с focus. Режим не исключает суммы/events из итога и не переписывает деньги. Подтверждённых оплаченных сумм в контракте нет; manual amounts не объявляются verified prices. One-way return/checkout не выдумываются.

v1 reader допускает отсутствие только новых taxes/buffer как unknown; старый other/reserve сохраняется без автоматического распределения. Raw legacy shared/saved tokens проверены отдельно от нового encoder. Новый bundle читает старые планы; старый writer не понимает новые суммы, rollback должен сохранить additive reading/calculation. API/DB/affiliate/score policies не менялись.

Unit173, ESLint/build/TypeScript pass. Initial browser34/44:8 new cases с неверным ожиданием итога для one-way без checkout,2 existing anchor cases с ранним click/consent; raw failures сохранены, точная причина anchor race отдельно не доказана. После корректной подготовки тестов и финального UI/copy/focus финальные44/44,307.48s,errors=[],retries0. Отдельный visual mobile repeat1/1,21.97s исправил DPR3 capture artifact через scale=css, без изменения продукта/assertions. 4 locales,320px, scoped axe, exact budget/event/save/share/consent/local recovery checks. [Доказательства и ограничения](trip03/README.md). Full backend/PG/full E2E не заявляются; production unchanged. TRIP-04 не начата.

## TRIP-04 — достоверный event context и законченные multi-day

Проверено2026-10-31: events/date sync/other dates/day/page/ticket grouping/selected-event budget/share уже существовали. В payload OTHER был, но query/UI filter отсутствовал; timezone не показывался явно, отсутствие check timestamp не обозначалось. Single-day past start фильтровался, но multi-day с известным завершением сегодня мог оставаться в выдаче. Три новых воспроизводимых API failures до fix подтверждают два ended-event случая и OTHER422; после118 event API/provider/grouping/fit/sync/scheduler tests passed.

Теперь OTHER входит в query/UI, карточки показывают timezone/source/sale confidence и unknown metadata. Inactive/unknown sale не получает purchase/add actions, включая отдельные ticket options; provider по-прежнему исключает unavailable statuses, offsale не выдаётся за sold out. Missing images по-прежнему обслуживаются текстовой карточкой без img requests; curated attractions source/official/partner/duration links сохранены. Нет новых данных о наличии, ценах или venue travel time.

Общий event_end_instant сохраняет прежнюю fit validation и применяется к API eligibility до grouping/count/page/flight_fit. Exact aware end<=now исключён, unknown/naive/contradictory конец не угадывается. Node177, Ruff/mypy/ESLint/build/TypeScript pass. Первый browser runner прерван из-за нового exact-label locator, source context/interruption metadata сохранены без полного summary; после role locator correction финальные64/64,397.50s,errors=[],retries0. 4 locales/320px/scoped axe и прежние events/attractions/consent/save/share assertions прошли. [Доказательства и ограничения](trip04/README.md). Source parity553, master plan сохранён, production unchanged; TRIP-05 не начата.

## TRIP-05 — saved snapshots и безопасный local feedback

Проверено2026-11-01: v1 local snapshots/share URLs/clipboard fallback и copy:token drafts уже работали; shared page сохраняла настройки при invalid/missing/unavailable/past source. Недостатки: exact duplicate tokens, empty вместо corrupted collection, overwrite риск старого writer, mount-only list, отсутствие remove success/undo, устаревший feedback/link после edits. Duplicate retrieval воспроизведён новым unit case до fix (1 failed).

Теперь readSavedTripsState даёт distinct valid tokens и corrupt flag, fail-closed changeSavedTrips не изменяет нечитаемые/unsupported данные; legacy token array/key/limits прежние. Storage hook читает fresh collection и обновляет UI по собственным/storage/focus/pageshow events. Undo восстанавливает только последний удалённый snapshot в текущем instance, не отменяя другие serial changes. Это не атомарная simultaneous cross-tab transaction и не cloud sync. Saved/dirty/already/versioned link feedback привязан к текущему snapshot; карточки и пояснения различают saved snapshot и отдельно restored local draft. Старые ссылки не отзываются удалением. Past/source availability не выдумываются.

Node183, ESLint/build/TypeScript pass; основной Playwright48/48,396.12s,errors=[],retries0, новые18+прежние30. Visual repeats1/1 (26.29s) и1/1 (23.92s) не суммируются с48. 4 locales,320px/scoped axe и manual money/date/adults/events/save/share/local restore/blocked storage/clipboard/capacity/quota/two-tab guards проверены. На mobile screenshot global skip-link перекрывает часть h1 даже после focus/animation control; причина отдельно не установлена, global navigation не менялась и не объявлена исправленной. [Доказательства/пределы](trip05/README.md). Runtime parity556/master plan preserved/свои порты закрыты. Production unchanged; UI-01 не начата.

## UI-01 — проверенные design roles и shared focus

Проверено2026-11-01: green brand/local fonts/native components/global classes уже были. .button-secondary применялся без variant definition, widgets расходились в hex/radius/shadow, global focus-visible не включал select/textarea. Выбранные input/event borders дали contrast1.2374/1.9967:1 на соседних surfaces. Это точечные вычисления, не blanket conclusion о декоративных borders или всех элементах сайта.

Теперь canonical semantic tokens/совместимые aliases и [design guide](HOPTRIP_DESIGN_SYSTEM.md); globals и6 scoped modules используют общие роли colors/type/spacing/radii/shadows/control/card/state/focus. Actual secondary variant,48/44px controls,contrast border, native invalid/disabled/forced-colors/reduced-motion presentation. Runtime только CSS; filter/server actions/budget/save/share/consent/affiliate/API/DB contracts сохранены. Новые images/провайдеры/данные не вводились.

Node186,21 contrast pairs, ESLint/build/TypeScript прошли. Initial browser32/40:30 старых cases прошли,8 новых остановились на ошибочном ожидании native modal Tab boundary. Probe показал no document focus/BODY при modal, затем focus внутри. Repeat2/10 выявил literal CSS-module locator. Исправлены tests без изменения product dialog/assertions данных. Final acceptance10/10,104.95s,errors=[],retries0;4 locales×desktop/mobile и2 state/media cases. Ранние failure evidence сохранены, full suite не заявляется.

Новый skip-link fixed-offscreen mechanism подтверждён keyboard/8 live focus measurements/320px desktop/mobile captures: после ухода focus overlay не воспроизводится, Tab/Enter доступен. Это не установление единственной причины TRIP-05 artifact. Scoped axe не обнаружил violations в проверенных состояниях; physical-device/screen-reader/full WCAG не проверены. [Доказательства, ограничения и rollback](ui01/README.md).557 runtime files parity/master plan preserved/next-env.d.ts без diff/свои порты закрыты. Production unchanged; UI-02 не начата.

## UI-02 — local licensed destination imagery

Проверено2026-11-01: homepage direction links/4 locales/route guards уже существовали, public photo catalog отсутствовал. Docker standalone runner не копировал public. Добавлены максимум3 editorial cards для API-known Barcelona/Rome/Budapest, остальные links сохранены как текстовые; dense flight cards без новых photos. Источники Commons и CC BY3.0/2.5 verified, attribution/title/source/license/crop notice доступны в native details/public credits; Budapest author отмечен Commons как assumed Padrag. Изображения не выданы за live offer views.

3локальных WebP960×600,244698bytes total, metadata stripped; оригиналы/crops просмотрены. Next Image sizes/srcset/lazy, stable8:5,4 locale alt, реальный error→neutral fallback с прежней ссылкой; без visitor requests к media vendors. Docker public COPY нужен для фактической доставки файлов. API/Python/fixtures/DB/pricing/score/affiliate/consent/storage/SEO не менялись.

Node188/ESLint/build/TypeScript passed. Initial browser прерван по nested has test locator timeout; context/metadata сохранены без полного summary. Final26/26,114.46s,errors=[],retries0:12 новых+14 прежних home/consent cases,4 locales/320px/scoped axe/keyboard/held-image readiness/unchanged frame geometry.3assets/credits и responsive responses прошли;1440/768/320 captures и fallback просмотрены. Budapest проверен наasset/HTTP уровне, fixture cities не дополнялись. Field LCP/INP/full WCAG не измерены.

Initial Docker npm ci generic failure сохранён; повтор с existing public CA BuildKit mount прошёл без отключения TLS, единственная причина первого failure не доказана. Actual network-none standalone smoke:public3+credits200/hash parity/optimizer384px200/WebP11–19KB; контейнер остановлен. [Доказательства, ограничения, rollback](ui02/README.md). Свои порты закрыты/master plan preserved/next-env.d.ts без diff. Production unchanged; UI-03 не начата.

## UI-03 — keyboard options и mobile targets

Baseline2026-11-01: PL/RU×320/375/390/768/1440×home/catalog/detail,30 page states. В проверенных состояниях document width=viewport, видимые dates font16px/height≈50px; native date clipping не доказан. Language links35.05px height/первый41.05px width, ниже existing44px target. На375×400 active airport option после ArrowUp:619.88–695.06px, list412.91–672.91px, scrollTop0 — пункт вне viewport и обрезан list. [Замеры/исходные tests](ui03/README.md).

Общий useActiveOption теперь прокручивает active item instant/nearest без переноса DOM focus; оба existing combobox сохраняют matching/selection/keyboard/blur/server-action ownership. List max=min(260px,40dvh), scroll padding/overscroll containment; languages44×44, back/help summary≥44. Другие layouts и native controls переиспользованы, horizontal overflow не маскируется. API/Python/fixtures/DB/prices/affiliate/SEO/consent/storage contracts не менялись. Node188/ESLint/build/TypeScript прошли; браузерная матрица описана в [отчёте](ui03/README.md). Full UI-04/WCAG/physical-device/OS keyboard validation не выполнялась.

Final browser38/38,542.20s,errors=[],retries0:24новых+14прежних,20полных5width×4locale workflows,100width measurements,8active option geometries. Early collector locator/hidden-advanced-field test failures сохранены; assertions не ослаблялись. Native forms/values/date sync/exact646.90PLN/save/share/reload/partner href/return context проверены, физическая keyboard QA не заявляется.

Long calculator capture снова содержит skip-link overlay. Separate probe1/1,13.81s: DOM top−844px/bottom−790.41px/skip not focused до/после, viewport screenshot clean, element captures всё ещё снадписью. Это согласуется с capture artifact, точнаяпричина не доказана; global skip CSS не менялся. [Доказательства/ограничения/rollback](ui03/README.md).566runtime/public/Docker parity/master plan preserved/next-env.d.ts без diff/свои порты закрыты. Production unchanged; UI-04 не начата.

## UI-04 — accessibility audit и подтверждённые fixes

Проверено2026-11-01:24 baseline full-page states PL1440/RU320, violations0/missing ARIA refs0. Incomplete не проигнорирован: unsupported generic aria-label на EUR small/comparison div подтверждён исходниками иaxe HTML. Отдельный before regression0/1 фиксирует BODY focus после last-event removal. Это отсутствие явной DOM focus цели, не декларация поведения каждого screen reader.

После удаления focus возвращается к существующему planned section/calculator; restore/обычные edits focus не забирают. EUR explanation теперь plain accessible text со старым tooltip, comparison — named group. Global visually-hidden helper иcaption direct-child scope сохраняют visible inline display. Pricing/rate freshness/unknown fallback/formulas/source data/API/DB/affiliate/SEO/consent/storage formats прежние.4 языка, новых dependencies/visible copy нет.

Node190/ESLint/build/TypeScript passed. Initial collector0/2 из-за consent init-script setup,24 scans сохранены; focus-only20/20 доsemantic fixes. Color-check stage0passed/1failed/27not-run: short-hex parser bug, исправлен без изменения палитры. Final28/28,370.67s,errors=[],retries0,8новых+20прежних.64 scans:violations0/refs0/non-color incomplete0;56 color incomplete states reviewed, не названы автоматически passed. Live selected min text5.80/border3.57/arrow7.68,152 button samples min48×44/modal44×44,8 accessibility-tree profiles. Manual/browser keyboard иvisual QA не заменяют NVDA/JAWS/VoiceOver/physical devices/full-site WCAG certification. [Evidence, standards, limits иrollback](ui04/README.md).566 files parity/master plan preserved/свои порты закрыты. Production unchanged; UI-05 не начата.

## UI-05 — подтверждённая обратная связь действий

Дата: 2026-11-01. Только UI-05, [отчёт и evidence](ui05/README.md).

- Save/remove/undo, filter pending/applied/result count/reset, search pending/validation, calculator errors/storage warnings и OfferState errors/retry уже реализованы. Новые дублирующие уведомления не требуются.
- Clipboard before regression 0/1 (21.79s) реально подтвердил stale save-success во время ожидания clipboard. Исправлено localized pending/disabled/aria-busy/atomic live message. Completion относится к исходному token/operation; edit скрывает старое сообщение, save сохраняет своё подтверждение. Denial оставляет ручное копирование, не success.
- Reset раньше выдавал общий autosave text (подтверждено исходником). Теперь successful write выдаёт отдельный текст очистки; exception сохраняет warning. Проверены saved collection/share link invariants и неизменность persistent draft при synthetic quota failure. In-memory reset policy прежняя.
- Node190, ESLint/build/TypeScript passed. Final E2E58/58 (24 новых +34 прежних), errors=[],retries0;16 новых scoped axe scans без violations. PL/EN/RU/UK, desktop/mobile320, reduced motion,6 reviewed screenshots. Initial lint warning и потеря raw log при архивации документированы; полный E2E suite/реальный OS clipboard/screen-reader speech/physical Safari не заявляются.
-566 runtime/public/Docker files и новый spec byte-identical isolated copy; source scope и outputs в verification.json. Master plan/next-env.d.ts и предыдущие изменения сохранены. Свои3125/8125 закрыты; чужие3100/8100 не трогали. API/DB/affiliate/consent/форматы данных/цены и production прежние. UI-05 DONE; TECH-01 не начата.

## TECH-01 — проверенная консолидация компонентов

Дата:2026-11-01. AUD-02 DONE; [инвентаризация8 областей и evidence](tech01/README.md).

- Flight cards/filter forms/pricing/state panels/loading уже shared. Native alert selectors и departure/stay/event/subscription dates имеют разные constraints, validation и ownership; одинаковый HTML не является основанием объединить бизнес-смысл.
- Подтверждён дубль open/active/focus/keyboard/ARIA и listbox markup AirportSelect/DestinationSelect. Теперь общий useCombobox/ComboboxOptions, два реальных consumers; useActiveOption прежний. Labels/IDs/input attrs/DOM hierarchy/copy/CSS и domain-specific draft/slug/origin/blur/cookie policies сохранены.
- Before contract2/2; main44/44,301.26s,errors=[],retries0; fresh comparison2/2,23.49s.16 новых scoped axe scans без violations,4 locales/desktop/mobile320 плюс существующий375×400/URL/history/race/cookie/filter regression. Node190/ESLint/build/TypeScript passed.
- Отличие main mobile картинки объяснено изменением SQLite fixture registry: short-trips disabled cleanup удаляет WAW, до mobile contract после desktop origin-selection остаются3 airports вместо4. [Контекст](tech01/fixture-context.md) и исходные данные сохранены. Fresh fixture before/after metadata совпали, обе PNG пары byte-identical. Это не production fact и не исправление fixture; повторы не суммируются.6 captures просмотрены.
- 567 runtime/public/Docker files/test source совпали с isolated copy; master plan/next-env/use-active-option unchanged, links/JSON/whitespace checked. Свои3125/8125 закрыты, чужие3100/8100 не трогали. Backend/DB/affiliate/SEO/consent/storage/prices/production прежние. Full E2E/real screen reader/physical Safari/performance gains не заявляются. TECH-01 DONE, TECH-02 не начата.


## TECH-02 — API boundaries и failure recovery

- Проверены request/response validation,error formats,optional fields,pagination,redundancy,unhandled failures,retries/timeouts. [Подробные7 областей](tech02/README.md).
- Исправлены unchecked JSON/truthy status/null-as404, browser events/render и alert reply state changes до проверки ответа. Landing metadata/body делят cached outcome только внутри request, имеют локализованный failure/noindex/retry. Backend HTTP schemas/price/scoring/affiliate/consent/storage unchanged.
- Node209/API67/Ruff/ESLint/build/TypeScript passed. Final browser 50/50,428.24s,unexpected0,skipped0,flaky0,errors=[],retries0. 8 новых recovery cases на4 locales×desktop/mobile + прежние offer-states/event-context/alerts/localized-alerts. 16 новых scoped axe scans без violations; не полный E2E suite.
- Optional checked_at invalid string сохраняет прежний unknown UI. Исходные failures/исправления и два ошибочных control POST на8100(status404) явно сохранены; blanket isolation не заявляется. Source/port/screenshot evidence в отчёте. Production не менялся; TECH-03 не начата.


## TECH-03 — измеренная стоимость подсказок

Подтверждён полный обход registry перед slice12. Две функции теперь bounded по найденным результатам, без cache/mutation. Node211/ESLint/TypeScript/build passed; E2E24/24,161.74s,unexpected0,skipped0,flaky0,errors=[],retries0. Before/after paired high-match airport227.61→5.64ms, destination67.77→2.08ms за3 operations; no-match216.22→216.30 /66.36→66.28ms. Synthetic500 rows, не field CWV. Исходный browser visibility failure сохранён, cause unknown, unchanged repeat passed. Source/rollback/ограничения: [отчёт](tech03/README.md).

## SEO-01 — видимый каталог в initial HTML

Дата:2026-11-01. Before browser без JS подтвердил два main/h1: loading fallback и скрытый Suspense result (0/1,24.93s). После удаления локального boundary каталог ожидает API и отдаёт видимый результат/ошибку с одним h1. Существующий query key перенесён на results component; filter pending/recovery сохранены. Цена изменения — возможное увеличение TTFB/времени перехода, количественное улучшение скорости или индексации не заявляется.

Проверены sitemap/robots/canonical/hreflang/title/description/headings/schema/internal links/status/rendering/query policy. Финальный browser20/20,264.65s,errors=[],retries0;244/244 sitemap pages и51 editorial link HTTP200. Ordinary-UA/no-JS каталог в4 локалях, BreadcrumbList на320px сверяется с rendered breadcrumbs. Существующие URLs/noindex/metadata/affiliate policies сохранены; schema/цены/рейтинги не выдумывались. Node211/ESLint/TypeScript/build passed. Исходный recovery timeout сохранён, единственная причина не установлена. [Evidence/ограничения/rollback](seo01/README.md). SEO-01 DONE, SEO-02 не начата; production не менялся.

## SEO-02 — полезность airport landings

Дата:2026-11-01. WRO/KRK/Warszawa уже содержали уникальные практические intro и связанные airport/weekend/budget guides. Пробелы: не было navigation по направлениям показанной выборки и явного объяснения пустого списка на отдельном airport route. Before browser0/1 подтверждает отсутствие нового блока. Теперь registry facts и destination links используют уже загруженные records/offers, сохраняют origin и search context; новых маршрутов, цен и обещаний доступности нет. Empty observations не выдаются за отсутствие рейсов у перевозчиков, failed API остаётся error/noindex.

Node211/ESLint/TypeScript/build passed.32 уникальных browser scenarios passed по21 desktop+3 technical repeat+8 mobile.16 новых cases на4 локалях/desktop/mobile,24 новых scoped axe scans без violations. Полный technical repeat3/3,261.60s,244/244 pages и51 editorial link HTTP200; whole-audit budget180→300s после двух deadline failures, assertions/API deadlines сохранены. Два mobile catalog unavailable outcomes после CTA не воспроизвелись в sanitized isolated probe2/2; финальный mobile8/8 на исходном API client. Причина failures и общая API reliability не объявляются исправленными. [Raw stages,6 captures,source verification и rollback](seo02/README.md). URLs/indexation/API/DB/production прежние; SEO-03 не начата.

## SEO-03 — destination content при отсутствии offers

Дата:2026-11-02, начато01/11. Existing reviewed Milan landing и city guide links уже были, но getDeals=[] давал пустую сетку. Before0/1 подтверждает отсутствие empty panel. Теперь honest empty observation copy/CTA, city-specific published guide descriptions, registry facts/seasonal-date planning и прямой доступ к existing curated attractions в guide. Новых providers/fetches/nearby routes/цен/availability claims нет. Ошибка API и неизвестный record остаются existing unavailable/noindex/404.

Visual QA уточнил IATA label: поле destination.iata_codes не является гарантированным списком конкретных airport records. Подпись4 locale стала «коды направления (IATA)», значения не менялись. Final rebuild/lint/tsc и acceptance10/10,44.41s после изменения прошли; этот повтор не суммируется с19 уникальными scenarios. Финальные captures просмотрены повторно.

ActivityContext.page ограничен info/deals: новое размещение сохраняет partner tracking через существующую guide page вместо изменения analytics schema. Events endpoint требует deal/date context; landing не фабрикует календарь. Milan/Barcelona seasonal source provenance и direct403 ограничения описаны в [отчёте](seo03/README.md); число градусов/датированные events не переносились. Search Console источник/export не обнаружен, noindex/publication policy сохранена после content review.

Node211/ESLint/TypeScript/isolated build passed. Desktop14/14,124.77s;mobile5/5,21.57s,errors=[],retries0.19 уникальных cases,10 новых,8 новых scoped axe scans;244/244 sitemap pages+51 editorial link HTTP200. Ordinary-UA/no-JS навигация с empty/active состояниями и guide attraction target работает.2 viewport captures/source parity573 подтверждены. Local production-mode test не является rollout, performance comparison или исправлением прежней API reliability. Production и предыдущие задачи сохранены; SEO-04 не начата.

## SEO-04 — проверка существующих guides и контекстных CTA

Дата:2026-11-02. [Inventory](seo04/INVENTORY.md) охватывает46 guides/184 языковые версии,7 областей; title/intro всех46 просмотрены, факты сверены выборочно. Подтверждены11 primary CTA, терявших город при переходе в общий catalog. Два дополнительных общих links Rome/Lisbon были intentional alternatives, оставлены как прежде. После исправления11 routes и direct Vienna notice URL все46 text hashes, dates/числа/metadata/переводы сохраняются.8 коротких статей и3 повторяющихся checklist paragraphs не стали основанием для неподтверждённого SEO rewrite.

Historical destination-level search signal использован для приоритета просмотра существующих материалов; точные query volumes/позиции HopTrip недоступны. Source review не объявлен полной проверкой46 guides, reviewedAt не сдвигался. Источники, sampling и ограничения — в [отчёте](seo04/README.md).

Node211/ESLint/TypeScript/build passed. Final desktop9/9,93.82s;mobile5/5,22.94s,errors=[],retries0;14 уникальных cases,8 scoped axe scans без violations.244/244 pages+51 editorial link HTTP200. Initial false-positive classification/test assumption и ES5 inventory diagnostic сохранены; Rome/Lisbon restored byte-identical.2 captures/source parity573 подтверждены; provider/production/индексирование и previous tasks сохранены. SEO-05 не начата.

## SEO-05 — поисковый спрос и возможности контента

Дата: 2026-11-02. [Таблица 12 возможностей](seo05/OPPORTUNITIES.md) охватывает все пять focus areas; [метод/ограничения](seo05/README.md), [реестр источников](seo05/sources.json). Все целевые URL уже существуют. Покрытие повторно сопоставляется с текущими content/catalog modules и SEO inventory; текущая функциональность не считается отсутствующей из-за старых планов.

Доступен исторический destination-level сигнал Google Polska от07.07.2026 для Alicante/Málaga, не частотность точных фраз и не зимний прогноз. Прочитаны три origin pages LOT: это конкурентный контент, не доказательство спроса/ранга/difficulty. Search Console/Keyword Planner data не получены; Drive search вернул tool unavailable, а не пустую выдачу. Trends Explore недоступен через web tool, ряд не получен. Все неизвестные метрики null; кандидатные фразы и сезонность по смыслу запроса отделены от измеренных данных. Проверка sources/coverage описана в отчёте, не выдана за live production crawl.

Первыми проверяются существующие Alicante/Málaga guides; origin/weekend pages следуют по прямой связи с продуктом. Budget/event/seasonal/route hypotheses имеют условия проверки до изменения. Не создаются near-identical landings, не обещаются пакетные поездки по цене flight filter, не публикуются события без официальных дат/статуса и существующего supported deal context. Код приложения, indexation, production, платные API и реальные кампании не меняются. Результаты документальных проверок — [verification.json](seo05/verification.json); runtime suite не запускался. GROW-01 не начата.

## GROW-01 — жизненный цикл и безопасность flight alerts

Дата:2026-11-02. Existing subscription models/API/UI/SMTP transport и worker уже покрывают create/confirm/manage/update/stop, частоту и persisted dedup. [Полная проверка10 требований](grow01/README.md). В письма ранее могли попадать CRITICAL_INCOMPLETE itineraries: matching использовал только trip type/freshness. Между RESERVED commit и SMTP не проверялись изменившиеся лоты, body строился до commit, batch now оставался прежним. Новые regression cases воспроизвели эти gaps. Теперь recommendation_eligible и повторный matching именно reserved IDs исключают неподходящие данные; при изменении набора CANCELLED, без замены/повтора и без удаления history. Body строится по revalidated data, PARTIAL честно сохраняет unknown facts.

Добавлены фиксированные lifecycle/cancel/cleanup события без PII/capabilities; existing warning не раскрывает SMTP exceptions. Cleanup-only переиспользует7/30-day eligibility при disabled delivery, сохраняя ACTIVE history. Это отдельная команда, не автоматически установленный cron и не обещание удаления в срок при остановленных jobs. Technical privacy review проверяет consent, bearer token/POST/private SEO/no-store/tracking/locale expectations; real SMTP/vendor/production backup/ACL/legal certification не проверены, flags/production не менялись. Existing privacy paused copy должна соответствовать состоянию до будущего включения.

Before11fail;focused72pass;final backend789+PG15pass, Ruff/mypy101/build pass. Browser18unique pass,4locales/desktop-mobile/8scoped axe checks,errors=[],retries0.4captures просмотрены. PG только hoptrip_test, existing migrations до0020; первоначальная ошибка Alembic cwd сохранена. Контейнер остановлен по label, свои3125/8125 закрыты, чужие3100/8100 сохранены. [Evidence/scope/rollback](grow01/README.md). GROW-02 не начата.

## GROW-02 — персональные Telegram flight alerts

Дата:2026-11-02. [Проверка всех9 требований/источники/ограничения](grow02/README.md). Existing Telegram operational scripts работают с другим назначением; их настройки/получатели сохранены. Новый private-only webhook authenticates secret header, chat.id=from.id/is_bot=false/fresh date; /start не подписывает, /subscribe pending требует /confirm24h, /set сохраняет остальные настройки, /stop доступен после command cap.4locale copy, immutable own-chat routing, отдельные consent/history/flags/worker. Raw inbound body/username не хранятся, service text очищается после terminal outcome; active digest IDs сохраняются.

Shared candidate_deals сохраняет GROW-01 freshness/quality/filters, max_connections проверяет known counts обоих flights. Перед попыткой RESERVED commit, затем current consent/filters/exact IDs revalidation. PostgreSQL advisory lock и attempted_at/cooldown обеспечивают multi-worker dedup/pacing;429 known rejection допускает до3attempts с глобальным ожиданием,403stop, uncertain/crash без blind retry. Официальный Update допускает random ID после недели: receipt expiry/epoch handling поддерживает это без повторной активации STOPPED старой командой. Additive0021 не меняет старые таблицы; rollback drop destructive только для Telegram и не применялся к production.

Initial PG выявил parent/outbox FK ordering — explicit flush исправляет атомарную вставку. Head assertions/tests clock исправлены отдельно, прежние catalogue preservation checks не ослаблены. Final861+18=879backend,72new Telegram+3new PG;Ruff/mypy110/build passed. Existing email E2E18unique/4locales,errors=[],retries0,8scoped axe checks без violations. Late Telegram-only receipt diff к browser copy явно отделён; final Python/PG проверяют текущий код. Нет claims о live Telegram GUI/delivery или legal compliance. Оба disposable PG containers stopped, свои audit ports закрыты. Real bots/webhooks/production/monitor/credentials/paid APIs не затрагивались. GROW-03/GROW-04 не начаты.

## GROW-04 — проверенные объяснения и доступность trust pages

Дата:2026-11-02. Проверены все9 областей задачи; [полная матрица/источники/границы](grow04/README.md). Подтверждены устаревшее About-объяснение convenience score и безусловное privacy-сообщение о paused email, отсутствие описания personal Telegram flow и несовпадение contact intro с unavailable fallback. Исправлена фактическая copy наPL/EN/RU/UK. Первый browser test также подтвердил, что PL generic InfoPage не имеет существующего localized main service nav: общий блок переиспользован на8 PL service pages, без изменения guides/metadata/breadcrumbs.

Freshness6/24/48/source expiry, partner disclosures, unknown/planned costs и error recovery сверены с кодом; без новых seller availability/market minimum/price guarantee. Telegram operational count notices отделены от personal bot commands/replies. Retention описана как cleanup eligibility7/30days, без обещания немедленного удаления/автоматического cron. Telegram privacy primary source прочитан; EUR-Lex вернул anti-bot, legal bases/rights/terms/исходная дата и прежние provider/transfer statements не пересматривались и не объявлены подтверждёнными. Dedicated activation review GROW-01/02 сохраняется.

Node211/lint/tsc/build passed;19unique browser accepted составным набором,244 pages+54 links HTTP200,4locales/24new scoped axe/4viewed captures. Initial PL-nav failure и second isolated-port test failure сохранены; исправленные4trust desktop прошли. [Raw evidence и scope](grow04/verification.json). API/DB/config/score/affiliate/consent/delivery/monitor/production unchanged. Только GROW-04;ANALYTICS-01/GROW-03 не начаты.

## ANALYTICS-01 — фактическая таксономия и пропуски действий

Дата:2026-11-02. Подтверждены11 existing first-party wire names, consent/session helpers, API allowlists/event_id uniqueness, admin summary и профильные tests. Master-plan concepts не означают отсутствие этих функций. Не хватало successful saved removal, ticket event link activation и explicit signup start; FILTER_USE не различал apply/remove/reset. Добавлены3 события и optional bounded filter action;14 frontend/backend names согласованы.13 proposed concepts полностью сопоставлены в [словаре](analytics01/TAXONOMY.md).

Новые producers не передают email/preferences/capabilities, saved plan или ticket URL/event details. Только consented current actions; legacy consent/session/dedupe/referrer/API behavior reused, automatic personal-page tracking suppression сохраняется. Start — submit intent даже при failed API, confirmation — successful response; по ним нельзя вывести exact cohort/cross-device conversion. Historical filter events остаются unclassified. Affiliate/commission metrics и URLs не переопределены; admin by_event generic сохраняет новые names без dashboard/migration.

Node215/API41/Ruff/mypy110/ESLint/TypeScript/build passed.26unique browser acceptance составлен из12desktop+2focused analytics+12mobile;16new/10existing. Initial missing response после полной навигации устранён ожиданием ответов в новом тесте. Existing city-break UI test показал stale details/empty selector и нестабильный sort URL: diagnostics сохранены, временные test corrections отменены, первые3 SEO cases исходные; успешность этого сценария не заявляется.4locales/consent withdrawal/no private payload/network/storage negative paths и6existing scoped axe scans проверены. [Результаты/scope/ограничения](analytics01/README.md). Только ANALYTICS-01; production и следующие GROW-03/ANALYTICS-02 не затрагивались.

## GROW-03 — affiliate context и проверка переходов

Дата:2026-11-02. [8-area review](grow03/README.md) сверяет destinations/parameters/dates/passengers/disclosures/consent/unavailable states. Static69cities/78items,40affiliate/38official-only/allHTTPS; это не число опубликованных pages/live tickets. Verified source identity/tracking policy и Stay22 explicit dates/adults сохранены; изменённый flight plan не обещает передачу продавцу. Confirmed localized ActivityLink API422 и missing deal association исправлены нормализацией analytics path без URL/API-schema changes. Middle-click event tickets теперь используют тот же consented callback, как primary.

55API/215unit/lint/tsc/Ruff fixture/build и28unique browser accepted,16new/12existing;24 scoped axe/4locales/320px. Initial mobile response collector navigation loss исправлен на intent collection; API receipt отдельно. Ранние isolation failures привели к реальному Tiqets popup и WAF403, возможная partner click attribution не исключена; покупка не выполнялась. Final native destinations loopback после assertion original href; fixture-only /go server boundary сохраняет policy/journal. Live redirect resolution/price/conversion не заявлены. [Evidence/incident/scope](grow03/README.md). Production DB/infra/credentials/campaigns и следующие задачи не менялись.

## ANALYTICS-02 — actual stored usage и границы измерения

Дата:2026-11-02. Existing protected summary покрывал financial/event counts, отдельной usage dashboard не было. Added read-only JSON+HTML, existing admin auth, 4locales/no scripts/resources/raw IDs, bounded UTC windows/rows. Core SEARCH/RESULT/DETAIL/PARTNER/SAVE/BUDGET/EVENT journeys агрегируются из received rows с explicit denominators; no-data/unavailable не baseline0. First observed page type — только landing proxy; visitor/device identifiers отсутствуют, поля не добавлены. POST/summary/consent/DB/retention прежние.

68API/32new/Ruff5/mypy113 passed;9browser renders/full-page axe0violations/4locales/320px/keyboard/2viewed captures. Только synthetic TestClient data, no production baseline/trends/partner traffic. [Review/definitions/limits](analytics02/README.md). [Roadmap reconciliation](analytics02/roadmap-state.json):43/43DONE, no remaining IDs. [Operational/release/known-test follow-ups](analytics02/REMAINING.md) отдельно; production rollout и real campaigns не выполнялись.
