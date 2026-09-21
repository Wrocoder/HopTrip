# Аудит HopTrip и план реализации

> Этот файл сохраняет исходный аудит. Последующие исправления I01–I18 и текущие проверки
> описаны в [implementation-status.md](implementation-status.md).

Дата: 2026-09-20. Основание: [MasterPrompt](../doc/MasterPrompt.md), код репозитория,
[внешние блокеры](blocker-resolution.md), локальные проверки. Исходный commit: `03c6711`.
Статусы ниже учитывают исправления этого аудита. Внешние аккаунты, условия партнёров
и Oracle VM в рамках проверки не проверялись.

Практические следующие шаги: [инструкция владельцу](owner-action-guide.md) и
[отдельные внутренние задачи](independent-development-tasks.md). Эти документы дополняют
аудит; создание чеклистов само по себе не означает выполнение перечисленных задач.

## 1. Вывод

Есть работающая техническая основа, но **business MVP из §82 MasterPrompt ещё не готов**.
Основные переиспользуемые части: FastAPI/SQLAlchemy/Alembic, каталоги, отделённый источник
данных, адаптер Travelpayouts, история цен, статистика, flight-only deals, scheduler,
защищённые admin API, redirect allowlist, хранение кликов и конверсий, Next.js и Compose.

Недостаточно просто получить токен и развернуть текущую версию. Главная всегда показывает
заглушку; карточки не называют маршрут; страницы аэропортов/направлений показывают лишь
количество предложений; кнопки бронирования нет. Redirect не связан со статусом конкретной
партнёрской программы. Аналитика пока не измеряет полноценную сессию посетителя.

Проверенная локальная БД: 0 `travel_offers`, 0 `deals`; revision `0012_provider_capabilities`.
Это подтверждает запуск основы, но не загрузку реальных цен, работу партнёрских ссылок
или получение комиссии. Отсутствие трафика само по себе не блокирует разработку.

## 2. Сопоставление с фазами MasterPrompt

| Фаза | Фактически сделано | Что требуется для завершения |
| --- | --- | --- |
| 0. Discovery | Архитектура, начальный registry, настоящий аудит и план | Проверить условия одного выбранного источника и программы; существующая provider matrix не доказывает доступ |
| 1. Foundation | API, web, PostgreSQL, 12 миграций, 7 аэропортов, 10 направлений, admin API; локальный стек работает | Повторить clean-install в CI; нет полноценного admin UI |
| 2. Real data | Travelpayouts adapter, normalization, offers, CLI | Реальный разрешённый ответ → PostgreSQL; валидация, пагинация, mapping город/аэропорт, корректная свежесть |
| 3. History | Наблюдения, median/percentiles/count/confidence, job history/retries/scheduler | Идемпотентность истории, защита от конкуренции, реальные повторные циклы, ограничения статистики |
| 4. Deal engine | Flight-only deal, компоненты, объяснение score, фильтрация свежести | Полный lifecycle, хранение составляющих score, защита редакторской видимости; отели не обязательны для первого запуска |
| 5. Website | SSR list/detail, route pages, базовый CSS, origin/destination filter | Реальная главная, маршрут/даты/карточки на всех страницах, budget/duration, понятные ошибки и mobile acceptance |
| 6. Affiliate | Allowlisted HTTPS redirect, click audit, optional sub-ID | Связать provider/program/component/click, проверять approval в redirect, link builder, доступный CTA, первый реальный переход |
| 7. Second provider | Только общая модель программ | Вторая одобренная программа после запуска первой |
| 8. Accommodation | Поля hotel/total и общий тип offer | Реальный hotel adapter, occupancy/ночёвки/налоги, сборка trip deal |
| 9. SEO | SSR, title/description у route pages, sitemap, robots | Canonical/OG, deal metadata, корректные 404/noindex, 20–30 содержательных страниц, полезный контент |
| 10. Analytics | DEAL_VIEW, клики, JSON import конверсий, PLN summary | Сессии, page views/impressions/filters, согласованная атрибуция, provider metrics, корректные периоды и знаменатели |
| 11. Expansion | Onboarding states и PATCH | Реальные заявки после полезного сайта/трафика |
| 12. Distribution | Не реализовано | Publication + независимый Telegram adapter, дедупликация и tracking source; отложить |
| 13. Deployment | Compose/Caddy, shared proxy, backup/restore scripts, runbook | Реальный deploy, worker, HTTPS, мониторинг, backup schedule/retention/offsite, проверенное восстановление |

Наличие таблицы, endpoint или собравшейся страницы не означает завершения продуктовой фазы.

## 3. Исправлено в ходе аудита

| ID | Дефект и изменение | Проверка |
| --- | --- | --- |
| F01 | API list/detail/route lists и `/go` полагались на сохранённые `status/is_visible`. При остановленном worker старые цены оставались доступны. В `services/availability.py` введён общий запрос: ACTIVE, visible, проверка за последние 48 часов, `expires_at > now` либо NULL | 4 сценария: expired/stale/inactive/hidden; проверены все списки, detail и redirect; свежая сделка остаётся доступна |
| F02 | `services/deals.py` выбирал baseline того же месяца без совпадения длительности. Теперь длительность сравнивается точно, включая NULL для one-way; чужая статистика не используется | Round-trip и one-way; отсутствие подходящего bucket даёт отсутствие baseline, а не выдуманную скидку |
| F03 | Повторная генерация меняла Deal, но оставляла прежнюю цену DealComponent. Теперь компонент создаётся/обновляется с сохранением affiliate metadata; flight generator принимает только FLIGHT | Цена Deal и компонента меняется согласованно, компонент не дублируется, metadata сохраняется |
| F04 | В production `SessionLocal(autoflush=False)` повтор одного external ID внутри batch создавал несколько TravelOffer. После обработки offer добавлен flush | Тест с двумя одинаковыми записями и отключённым autoflush: один offer. Это не решает конкуренцию процессов и дедупликацию PriceObservation |
| F05 | В shared-proxy override Caddy терял default network, где находятся API/web. Добавлено подключение к обеим сетям | Проверен итоговый Compose JSON: Caddy имеет default + edge, API/web — default |
| F06 | Dockerfile web игнорировал lockfile и выполнял `npm install`. Теперь копирует package-lock и использует `npm ci` | Изменение проверено по Dockerfile; новый image и ARM64 build в этом аудите не запускались |
| F07 | TypeScript incremental check создаёт `tsconfig.tsbuildinfo` | Добавлено исключение в `.gitignore` |

Изменения не требуют миграций и не изменяют существующие production данные.

## 4. Открытые дефекты и пробелы

Приоритеты: **P0** — до первого реального монетизируемого запуска;
**P1** — до привлечения трафика и интерпретации бизнес-метрик;
**P2** — после проверки первого сценария. Задачи ниже ещё не выполнены.

### P0: достоверность данных и monetization

1. **Approval не управляет переходами.** `api/affiliate.py` проверяет глобальный host allowlist,
   но DealComponent и AffiliateClick не содержат provider/program FK. Отключение программы
   в admin не отключает её сохранённую ссылку. Нужны явная связь, проверка APPROVED + active
   для provider и program при каждом переходе и единая проверка доступности CTA.
   Контракт sub-ID/allowlist должен принадлежать программе, а не всему приложению.
2. **Генератора ссылок нет.** Используется `metadata_json.outbound_url`, который ingestion
   не заполняет. Создать AffiliateAdapter и mapping data offer → approved booking target.
   Внешний формат подключать только после подтверждения программы; frontend получает
   внутренний redirect path и доступность компонента. В API сейчас path использует slug,
   а не числовой ID из примера MasterPrompt — выбрать и документировать единый контракт.
3. **История не идемпотентна.** Каждый `ingest_offers` добавляет PriceObservation, даже
   для того же cached offer; retry после commit ingestion повторно увеличивает sample_count.
   Нет unique(provider_id, external_id) у TravelOffer и межпроцессного lock у pipeline.
   Нужны определение observation identity, unique/upsert, идентификатор логического запуска,
   PostgreSQL advisory lock или lease, тест сбоя после первого commit и двух workers.
   `RouteStatistics` unique с nullable duration тоже требует учёта PostgreSQL NULL semantics.
4. **Свежесть источника смешана с временем загрузки.** Ingestion ставит `last_verified_at=now`
   на каждый cached ответ. Повторное скачивание не доказывает новую проверку цены у источника.
   Разделить fetched/source-observed/verified, установить fallback TTL по документированному
   контракту. Отсеивать уже вылетевшие предложения, обновлять EXPIRED независимо от успешного
   ingestion; текущий read-time guard проверяет TTL/expiry, но не время вылета.
5. **Неполный provider adapter.** Запрашивается только первая страница (`limit=100`),
   не валидируются finite positive price, порядок дат и структура body; naive даты получают
   UTC без доказанной семантики источника. Ошибка одного origin останавливает весь сбор.
   Добавить fixture HTTP-тесты, пагинацию с лимитом, классификацию retryable ошибок,
   явные date-only/local-time правила, счётчики отклонённых записей.
6. **Потеря направлений.** `Destination.iata_code` — единственный код и точное совпадение;
   seed смешивает city и airport codes (например, LON и FCO). Другие аэропорты/городские
   aliases пропускаются. Нужна подтверждённая таблица aliases/airport→destination и отчёт
   unresolved routes. Не создавать автоматически фиктивные города из неизвестных кодов.
7. **Пользовательский путь не завершён.** `app/page.tsx` всегда статичен; route pages выводят
   только count; list показывает «Lot z Polski», detail — «Wyjazd <date>». Нет origin/destination
   названий, полного периода, itinerary, CTA и disclosure. Требуются реальные карточки,
   разбор стоимости, возврат/one-way, цена только перелёта, время проверки и предупреждение
   об изменении цены. Нельзя показывать кнопку, ведущую к заведомому 503.
8. **Production bootstrap слишком связан с Travelpayouts.** Production Compose требует токен
   и affiliate host даже для web/API без worker. Разделить content/catalog bootstrap и
   монетизированный запуск. Отсутствующий affiliate партнёр не должен блокировать разрешённые
   данные, полезный контент или подготовку сайта для заявки (§3–8, §26).
9. **Защита и эксплуатация.** `require_admin` принимает default development token даже при
   production; system-status лишь предупреждает. Нужен fail-closed guard конфигурации и
   constant-time token comparison. Нет rate limits публичных записей событий/кликов,
   общего набора security headers и полной проверки redirect edge cases. CORS зафиксирован
   на localhost; same-origin Caddy работает без cross-origin CORS, другие origins нужно
   задавать явно. API и worker оба выполняют Alembic entrypoint: вынести миграции в один шаг.

### P1: измеримость, качество и выпуск

10. **Сессии и воронка.** `deal-view-tracker.tsx` хранит UUID бессрочно в localStorage;
    это идентификатор браузера, не сессия. Нет событий homepage/page view/impression,
    filter usage не отправляется. `/go` без ID объединяет всех в `anonymous-session`.
    Ввести срок сессии, общий client tracker и передачу того же ID в CTA, отказоустойчивость
    при недоступном storage/network. Клики должны учитывать provider/program/source/campaign.
11. **Неточность метрик.** `api/analytics.py` считает all-time raw clicks/views: CTR может
    превышать 100%, unattributed conversions входят в booking conversion. Revenue/1000
    сначала округляет revenue/session до копеек, затем умножает: 1 PLN / 3000 sessions
    превращается в 0 вместо 0.33 PLN/1000. Определить event vs session metrics, периоды,
    cohorts/attribution, округлять только конечный результат. JSON import есть;
    provider feed/webhook/CSV и reconciliation отсутствуют. При обновлении conversion
    без click/deal текущий handler может стереть ранее сохранённую атрибуцию.
12. **Score/confidence.** Weights централизованы — это стоит сохранить. Но convenience=100
    по умолчанию без itinerary, отдельные score components не сохраняются, confidence —
    только min(count,30)/30. Повтор cached данных искусственно повышает уверенность.
    Документировать ограничения, хранить score version/components, считать независимые
    наблюдения и временное покрытие. Рассчёт всех observations загружается в память;
    позднее перейти к ограниченным buckets/SQL aggregation без потери долговечной истории.
13. **Редакторские действия.** Нет admin deals list/search/visibility/featured и admin UI.
    Генератор всегда выставляет is_visible по expiry, поэтому будущая ручная модерация
    будет перезаписываться. Разделить editorial visibility и вычисляемую eligibility.
    Onboarding сейчас позволяет менять seeded записи, но нет создания новой программы
    через admin API; capabilities есть у provider, но не у отдельных network programs.
14. **SEO и доверие.** Нет canonical/OG/deal metadata/structured data, фильтры свободно
    индексируются, неизвестные origin/destination возвращают страницу с HTTP 200.
    Sitemap включает каталог независимо от полезности содержимого. 7 + 10 + 2 = 19
    базовых URL не равны 20–30 полезным страницам. Нужны настоящий 404, политика noindex,
    about/contact/disclosure, содержательные landing pages. Privacy/cookies/terms отсутствуют;
    тексты должны соответствовать реальному оператору и данным, а не выдуманным реквизитам.
15. **i18n и API contract.** Польские строки разбросаны в React и scoring; нет translation
    catalog. Decimal в Pydantic отдаётся строкой, а TS Deal объявляет number; `status` есть
    в TS, но отсутствует в DealRead. Нужен явный money DTO/parser или генерация типов,
    shared formatting/components; будущие языки не нужно реализовывать сейчас.
16. **Checks/CI.** `npm run lint` реально падает на `next lint`; нет ESLint config,
    отдельной команды typecheck, CI, browser E2E, PostgreSQL integration suite и настроенного
    backend type checker. SQLite tests не проверяют PostgreSQL constraints/timezone/concurrency.
    Нужны работающий lint, pinned tool config, PostgreSQL service и critical browser flow.
    У Python широкие диапазоны зависимостей без lock; web Docker теперь использует lockfile.
17. **Operations.** Нет scheduled backup, retention, offsite copy и подтверждённого restore.
    Backup пишет сразу в финальный файл, который может остаться частичным после ошибки;
    restore не использует `--exit-on-error`. Нужны атомарное завершение backup, проверка
    dump, восстановление в отдельную БД, контроль результата. Нет request IDs/structured
    application logs и алертов на failed/stuck jobs. `system/status=READY` проверяет наличие
    строк конфигурации, а не настоящие данные, программу, рабочую ссылку или deploy readiness.

### P2: развитие после первого запуска

Реальные отели и полный trip cost, второй провайдер, Telegram/Publication, email/push/alerts,
расширенные discovery routes и погода. Другие рынки, booking engine и распределённая
инфраструктура сейчас не нужны. PLN-only достаточно, если выбранный источник отдаёт PLN;
отсутствие FX не блокирует этот сценарий.

## 5. План следующих итераций

| Этап | Работы и файлы | Зависимость | Критерий приёмки |
| --- | --- | --- | --- |
| A. Целостность данных | `models/offer.py`, `services/ingestion.py`, `services/jobs.py`, `services/deals.py`, `providers/travelpayouts.py`, новые миграции; P0.3–6 | Можно делать без аккаунтов на fixtures | Два workers/retry не создают дубли; реальные временные метки не омолаживаются; история сохраняется; departed/expired не публикуются; PostgreSQL tests |
| B. Affiliate domain | FK в component/click, per-program config/capabilities, `services/affiliate.py`, `affiliate_adapters/`, admin CRUD, миграции; P0.1–2 | Общий контракт без доступа; конкретный builder — после approval | SUSPENDED немедленно блокирует CTA и redirect; click однозначно связан с program/deal; чужой host никогда не принимается |
| C. Публичный продукт | `schemas/deal.py`, `src/lib/api.ts`, shared cards/CTA/formatting/i18n, homepage/list/detail/origin/destination; P0.7 и P1.15 | A; для CTA — B | Главная → WRO → маршрут → цены/даты → working CTA; отсутствие источника или ссылки объясняется; mobile и ошибки проверены |
| D. SEO и измерение | metadata/sitemap/404/noindex, 20–30 полезных страниц, legal/contact; session/events/metrics/conversions; P1.10–14 | C; реквизиты оператора для текстов | Измеримая сессия → view → click; проверяемые PLN metrics; только полезные URL индексируются; disclosure рядом с CTA |
| E. Release checks | ESLint/typecheck, `.github/workflows/ci.yml`, PostgreSQL tests, browser E2E, Python dependency lock, auth/rate limits/logs | Делать вместе с A–D | Clean install, lint, types, tests, build; критический browser flow с тестовым адаптером без внешнего бронирования |
| F. Первый реальный запуск | Production Compose/migration step, link config, worker, backup scripts/runbook | A–E; разрешённые данные, один affiliate, VM/domain | Реальная цена → offer → history → deal → approved URL + saved click; цикл worker обновляет цены; HTTPS/backup/restore подтверждены |
| G. Проверка бизнеса | Provider feed или подтверждённый ручной импорт, reconciliation, traffic funnel | Реальный трафик и доступные отчёты | Клики/бронирования/комиссия связаны и сверены, затем решение об отелях/втором провайдере/Telegram |

Для нового исполнения начинать с A; B (общий контракт), проверки E и контент можно готовить
независимо от получения секретов. Не завершать сразу все фазы одним большим изменением.

## 6. Архитектура и данные

Сохранить один FastAPI service + worker из того же пакета + PostgreSQL + Next.js + Caddy.
Не нужны Redis/Kafka/Kubernetes. Вынести orchestration/conversion/affiliate policy из HTTP
handlers в application services; domain/provider contracts держать независимыми.

Существующие связи: DataProvider → TravelOffer / PriceObservation / RouteStatistics;
Airport + Destination → route buckets / offers / deals; Deal → DealComponent → TravelOffer;
AffiliateProvider → AffiliateProgram; Deal → AffiliateClick; AffiliateConversion → Click/Deal.
Route сейчас выражен парой FK, отдельной таблицы нет — это допустимо для первого MVP.

Добавить: DestinationAlias (тип city/airport + source/code), Component → AffiliateProgram,
Click → Provider/Program, observation identity/source timestamp, уникальный ключ offer,
job run/lock/retry metadata, score components/version. Будущая Publication связывает Deal
с каналом независимо от scoring. Секреты остаются в окружении, в БД — configuration references.

TravelDataProvider уже отделён от AffiliateProvider: сохранить это решение. Доступ к
affiliate links не означает search/price/conversion API. Не разрешать монетизацию только
потому, что технический запрос данных прошёл успешно.

## 7. Внешние зависимости

Конкретные шаги — в [blocker-resolution.md](blocker-resolution.md). Нужны подтверждения
разрешённого источника цен, программы/каналов/рынка, target/deep-link формата и attribution.
Travelpayouts — единственный имеющийся data adapter, не доказанно доступная программа.
Trip.com/DiscoverCars/Omio/Amadeus в документации — кандидаты, не подтверждённые интеграции.
Полные актуальные условия (limits, traffic, commission, cookie window, payout, licensing)
нужно фиксировать из официальных источников при выборе; текущий аудит их не подтверждает.

Без аккаунтов доступны A–E с тестовыми данными только в tests. До approval конкретного
builder хранить `PENDING_EXTERNAL_CONFIGURATION`; не подставлять фиктивные production цены.
FX, второй партнёр и provider conversion API не обязательны для первого PLN flight-only
запуска: ручной подтверждённый импорт конверсий уже имеет базовый API.

## 8. Результаты проверок и ограничения

| Проверка | Результат 2026-09-20 |
| --- | --- |
| pytest, интерпретатор `.venv/Scripts/python.exe` | 35 passed: 27 прежних + 8 регрессионных; два dependency deprecation warnings |
| Ruff | Passed после исправлений |
| `npm exec -- tsc --noEmit` | Passed |
| `npm run build` | Passed, Next.js 16.3.5 |
| `npm run lint` | Failed: `next lint` воспринимается как каталог `lint`; открытая задача E |
| Alembic offline `upgrade head --sql` | Passed, 479 строк SQL, head `0012_provider_capabilities` |
| Compose base / production / shared-proxy | Parsed; проверена общая сеть Caddy/API/web; использованы только тестовые placeholders |
| Работающий локальный стек | DB healthy; readiness/catalog/home/deals HTTP 200; offers=0, deals=0 |

Запущенные Docker-контейнеры построены до аудита: smoke checks не доказывают наличие в них
новых исправлений. Код проверен локальными тестами; контейнеры не пересобирались и не
перезапускались. Не выполнены real-provider run, браузерный E2E, PostgreSQL concurrency
tests, fresh Docker/ARM64 build, Oracle deploy, restore drill и новый dependency security audit.
Не трактовать отсутствие этих проверок как успешную приёмку.

## 9. Условие готовности первого MVP

- [ ] Разрешённая реальная PLN цена из WRO сохранена вместе с источником и историей.
- [ ] Worker повторяет сбор без дублей и ложного обновления свежести.
- [ ] Главная/маршрут/сделка показывают направление, даты, цену перелёта и ограничения стоимости.
- [ ] Одобренная активная программа формирует корректную ссылку; кнопка создаёт связанный click.
- [ ] Suspended/stale/expired/неразрешённый URL не дают активного перехода.
- [ ] Есть session → view → click и проверяемый импорт/отчёт комиссии.
- [ ] Есть полезные индексируемые страницы, контакты и понятное affiliate disclosure.
- [ ] CI и browser flow проходят; production admin configuration защищена.
- [ ] Oracle HTTPS, worker, health monitoring, scheduled backup и отдельный restore drill подтверждены.

Документация §89 дополняется вместе с соответствующей реализацией: `data-model.md`,
`provider-capabilities.md`, `affiliate-onboarding.md`, `deal-scoring.md`, `price-history.md`,
`affiliate-tracking.md`, `seo.md`, `oracle-vm-deployment.md`. Сейчас отдельные сведения есть
в этом аудите и существующих runbooks; не создавать пустые документы ради списка файлов.
