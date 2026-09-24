# Задачи HopTrip без ожидания внешних доступов

Обновлено: 2026-09-23. Основание: [аудит](project-audit-and-plan.md) и
[MasterPrompt](../doc/MasterPrompt.md). Действия владельца по аккаунтам, домену и
партнёрским ссылкам — в [отдельной инструкции](owner-action-guide.md).

**Текущий результат:** реализованы локальные изменения I01–I18 и подготовлена внешняя
приёмка. Проверки и ограничения приведены в [отчёте реализации](implementation-status.md).
Для I04 применён безопасный вариант миграции: диагностика дублей и остановка вместо
автоматического удаления существующих записей. I13 теперь включает все 25 страниц локально;
это не подтверждение публикации на внешнем домене.

Все задачи ниже можно реализовать и проверить локально без affiliate approval,
production domain, Oracle-доступа и настоящего provider token. Обычная установка
зависимостей может требовать интернет. У задач есть **внутренние зависимости**:
«не зависит от внешних факторов» не означает «выполняется в любом порядке».

## Как пользоваться

1. Выберите задачу со статусом READY или завершёнными зависимостями.
2. Сделайте один законченный объём, выполните указанные проверки, запишите результат.
3. Отметьте чекбокс только после проверки критериев готовности; добавьте commit/PR,
   если вы используете Git для фиксации изменений.
4. Если появились токен/approval, отдельно проведите реальную приёмку. Локальный тестовый
   адаптер не подтверждает работу внешней системы.

Готовые исправления F01–F07 из аудита не нужно делать повторно. На момент создания списка
было 35 passing Python tests. Ниже сохранены описания задач; текущие отметки и журнал
отражают выполненную локальную реализацию, отдельно от реальных внешних интеграций.
Тестовые цены допускаются только в tests/изолированном тестовом окружении: в публичную
production выдачу они не попадают.

## Очередь

Колонка READY/TODO сохраняет первоначальные зависимости; чекбокс отражает текущую локальную готовность.
Приоритет P0 — до первого реального запуска; P1 — до привлечения трафика и оценки метрик.

| Готово | ID | Задача | Приоритет | Начальный статус / зависимости |
| --- | --- | --- | --- | --- |
| [x] | I01 | Рабочие lint/typecheck/CI и тестовая PostgreSQL | P0 | READY |
| [x] | I02 | Публикация полезного сайта без provider token | P0 | READY |
| [x] | I03 | Актуальный контракт и надёжность data adapter | P0 | READY |
| [x] | I04 | Идемпотентные offers и observations | P0 | TODO: I03 |
| [x] | I05 | Защита pipeline от конкуренции и повторов | P0 | TODO: I01, I04 |
| [x] | I06 | Свежесть и lifecycle сделок | P0 | TODO: I03, I04 |
| [x] | I07 | Отображение airport/city codes в направления | P0 | READY |
| [x] | I08 | Связать affiliate program, компонент и клик | P0 | READY; DB проверки после I01 |
| [x] | I09 | Контракт affiliate adapter и локальный link flow | P0 | TODO: I08 |
| [x] | I10 | Рабочий публичный путь и CTA | P0 | TODO: I06, I07, I09, I11 |
| [x] | I11 | Money DTO, локализация и общие компоненты | P0 | READY |
| [x] | I12 | Полезные фильтры и пагинация | P1 | TODO: I11 |
| [x] | I13 | SEO, контент и страницы доверия | P1 | Каркас READY; итоговая проверка после I10 |
| [x] | I14 | Настоящие сессии и события воронки | P1 | TODO: I08, I10 |
| [x] | I15 | Корректные метрики и импорт конверсий | P1 | TODO: I08; полная воронка после I14 |
| [x] | I16 | Production auth и защита публичных endpoints | P0 | READY; согласовать с I02 |
| [x] | I17 | Score breakdown и минимальная модерация | P1 | TODO: I04, I06 |
| [x] | I18 | Локальная репетиция deploy, backup и restore | P0 | TODO: I01, I02, I05, I16 |

Удобный порядок для последовательной работы:
**I01 → I02 → I11 → I03 → I04 → I05 → I06 → I07 → I08 → I09 → I10 → I16 → I18**,
затем **I12–I15 и I17** до привлечения трафика. I13 можно начать с контента раньше.
I16 также можно выполнить сразу после I02.

## I01. Рабочие проверки и тестовая БД

**Проблема:** `npm run lint` падает; CI нет, SQLite не проверяет PostgreSQL concurrency,
NULL constraints и timezone. Python dependencies не зафиксированы lockfile.

**Сделать:** настроить frontend lint, явный typecheck, backend checks с конфигурацией в
репозитории; выбрать способ фиксации Python dependencies. Добавить изолированную PostgreSQL
для интеграционных тестов и workflow lint/types/tests/build/migrations. Подготовить browser
test harness. Не использовать рабочую БД для тестов.

**Файлы:** `apps/web/package.json`, lint config, `pyproject.toml`, dependency lock,
`apps/api/tests/`, тестовый Compose, `.github/workflows/ci.yml`.

**Критерии:** clean install и все заявленные команды проходят; тестовая БД создаётся
с миграций. Workflow подготовлен локально; запуск в GitHub требует push и проверяется отдельно.
Тесты не зависят от сегодняшней даты или настоящих токенов.

## I02. Bootstrap сайта без внешних секретов

**Проблема:** production Compose требует provider token и affiliate host даже до запуска
worker. Это мешает опубликовать полезный сайт для рассмотрения партнёром.

**Сделать:** разделить готовность web/catalog, источника данных и монетизации. Позволить
запуск web/API/DB без внешнего токена; worker остаётся opt-in. `/system/status` должен
показывать состояния подсистем. Не ослаблять требования к DB password и admin token.
Согласовать single-step migrations с I18.

**Файлы:** production Compose, `config.py`, `api/admin.py`, `schemas/affiliate.py`, env examples,
operations и tests.

**Готово, если:** окружение с настоящими локальными DB/admin секретами, но без provider
token/affiliate host запускается и честно показывает пустой каталог. Нет fake prices,
случайных provider запросов и активного неработающего CTA. Это снимает зависимость заявки
партнёру от уже выданного affiliate approval.

## I03. Контракт и устойчивость data adapter

**Проблема:** код использует `/v2/prices/latest`, первую страницу и неполную валидацию.
Официальная документация рекомендует `/aviasales/v3/prices_for_dates` вместо старых методов.
[Источник и параметры](https://support.travelpayouts.com/hc/en-us/articles/203956163-Aviasales-Data-API).

**Сделать:** сопоставить существующий SearchQuery с выбранным текущим endpoint, документировать
mapping полей, currency/market, timestamp, one-way/round-trip и price basis. Обновить adapter
и записать sanitised fixtures по документированному контракту. Добавить bounded pagination,
finite positive price, проверку дат/структуры ответа, обработку 401/403/429/5xx/timeouts,
Retry-After и malformed items. Разделить постоянные и временные ошибки.

**Файлы:** `providers/base.py`, `providers/travelpayouts.py`, `jobs/pipeline.py`, provider tests,
`docs/providers.md`.

**Готово, если:** HTTP transport mocks подтверждают параметры, страницы, заголовки и поведение
при ошибках. Отсутствие токена даёт configuration state; неподтверждённые timestamps не
выдумываются. **За пределами задачи:** реальная доступность PLN/market и аккаунта.

## I04. Идемпотентность данных и истории

**Проблема:** batch duplicate offer уже исправлен, но нет DB unique ключа и повторный
cached response увеличивает историю/уверенность. Retry после commit может повторить запись.

**Сделать:** определить identity предложения и независимого наблюдения по контракту I03.
Добавить unique(provider, external_id), безопасный upsert и ключ observations, разделяющий
повторную доставку и новое наблюдение источника. Перед миграцией проверять существующие дубли read-only preflight. При дублях
останавливать миграцию без удаления: разбор canonical записей и сохранения истории требует
отдельного плана для конкретной БД. Это безопасное уточнение первоначального плана. Исправить уникальность nullable duration bucket в PostgreSQL.

**Файлы:** offer/statistics models, migrations, ingestion/statistics services, DB tests.

**Готово, если:** повтор того же ответа не увеличивает независимый sample_count, новое
наблюдение сохраняется даже при прежней цене; два concurrent writers не создают offer
дубликаты. Migration и повторный pipeline проверены на изолированной PostgreSQL.

## I05. Один логический запуск pipeline

**Сделать:** добавить PostgreSQL advisory lock либо lease; связать попытки retry одним
run ID, хранить next_retry_at и отличать skipped/busy от failed. Обработать аварийное
завершение и зависший RUNNING. Использовать классификацию ошибок I03.

**Файлы:** `services/jobs.py`, `models/job.py`, runner/scheduler, migration и tests.

**Готово, если:** параллельные scheduler/CLI не исполняют одинаковую работу одновременно;
lock освобождается после сбоя; retry после сохранения ingestion не портит историю.
Проверить конкурентные процессы на локальной PostgreSQL, не только mock lock.

## I06. Свежесть и жизненный цикл

**Сделать:** развести fetched/source-observed/verified, использовать expiry/TTL источника,
не обновлять подтверждение цены при повторном скачивании старого кэша. Учитывать уже
прошедший вылет, точные/date-only даты, статус STALE/EXPIRED и отказ источника.
Cleanup должен работать независимо от успеха нового ingestion. Сохранить единый read-time
guard из аудита и не перезаписывать редакторскую видимость.

**Файлы:** models/schemas offers/deals, `services/availability.py`, ingestion/deals, jobs, tests.

**Готово, если:** тесты с фиксированными часами покрывают TTL boundary, expiry, departed,
старый cache, worker outage, DST/date-only. Обновление metadata не превращает старую цену
в новую; public list/detail/redirect согласованы.

## I07. Airport/city aliases

**Сделать:** добавить явный mapping provider code → city/airport → Destination; сохранить
различие аэропорта вылета и города. Предусмотреть несколько аэропортов одного направления,
отчёт unresolved/ambiguous codes и счётчики пропусков. Не создавать новые города автоматически.

**Файлы:** `models/location.py`, migrations, ingestion, catalog schemas/API, tests.

**Готово, если:** на fixtures несколько airport aliases одного города дают один Destination,
неизвестный и неоднозначный код не привязывается случайно. Реальный каталог разрешённых
маршрутов и лицензия данных проверяются отдельно; механизм не требует доступа к ним.

## I08. Affiliate domain и approval policy

**Сделать:** связать DealComponent с AffiliateProgram, AffiliateClick с program/provider;
добавить program-level capabilities/target config и защищённое управление записями.
Проверять APPROVED + active у обеих сущностей перед редиректом. Учитывать старые компоненты
без привязки как недоступные для monetization. Перенести policy из route handler в service.

**Файлы:** affiliate/deal/click models, migrations, schemas, admin/affiliate API, новый service.

**Готово, если:** APPROVED в изолированном fixture разрешает только свой host;
SUSPENDED/REJECTED/disabled/непривязанный компонент блокируется немедленно. Click сохраняет
однозначную программу и источник. Подставное approval не включается в production seed.

## I09. Affiliate adapter и локальная цепочка ссылок

**Сделать:** определить `build_deep_link`, tracking ID, capabilities и error contract.
Для документированного partner-link API можно подготовить request/response adapter с
HTTP mocks; не придумывать контракт неподдерживаемого провайдера. Настройки host/SubID
делать per-program. Добавить явную availability/reason/internal redirect path в API.

**Файлы:** `affiliate_adapters/`, affiliate service, component schema, redirect tests.

**Готово, если:** тестовый transport строит ожидаемую ссылку и tracking ID; unsafe scheme,
userinfo, чужой host, malformed URL и неподдерживаемый tracking отвергаются. No-link state
не создаёт активную кнопку. **За пределами задачи:** проверка реального sample link из
[шага 9 инструкции владельца](owner-action-guide.md), реальный кабинет и attribution.

## I10. Главная → маршрут → сделка → CTA

**Сделать:** получать реальные записи API на главной; общий DealCard с городами, аэропортом,
датами, one-way/round-trip и ценой; карточки вместо count на route pages. Detail показывает
маршрут, даты, price breakdown, last checked, ограничения и affiliate disclosure. CTA использует
только внутренний redirect path из I09. Обработать загрузку/пусто/API error/404.

**Файлы:** `apps/web/src/app/`, shared components, `src/lib/api.ts`, deal/catalog schemas.

**Готово, если:** браузерный E2E на отдельной fixture БД проходит WRO → deal → CTA → локальный
mock redirect и записанный click. Отдельные проверки empty/no-link/expired/mobile/keyboard.
Fixture сервер не используется публичным production окружением.

## I11. Деньги, типы, локализация

**Сделать:** согласовать API Decimal serialization и TypeScript DTO; выбрать money string
с явным format/parser либо документированный другой формат. Синхронизировать nullable
и отсутствующие поля. Вынести польские тексты, форматы дат/денег и общие компоненты;
объяснения score представить переводимыми кодами/параметрами.

**Файлы:** schemas, scoring, `src/lib/api.ts`, новый translation catalog, components.

**Готово, если:** OpenAPI/DTO и typecheck согласованы; строки `0.00`, null и дробные суммы
не дают ложных скидок/NaN; вся UI-копия доступна в польском каталоге. Другие языки пока
не переводить — подготовить структуру.

## I12. Фильтры и pagination

**Сделать:** добавить budget, dates, duration, origin/destination и ограниченную пагинацию
в API и UI. Определить, что budget означает цену на человека, а flight-only не полный trip.
Сохранять фильтры при смене страницы, валидировать диапазоны, отделять bad input от API outage.

**Файлы:** catalog API, query schemas, frontend filters/API helper, tests.

**Готово, если:** API и browser tests подтверждают совместные фильтры, boundaries, empty
и переход на следующую страницу. Нет тысяч автоматически индексируемых query combinations.
Погода и сложный family search не входят в эту задачу.

## I13. SEO и полезный контент

**Сделать:** site URL config с локальным значением, canonical/OG/deal metadata, корректный
404, noindex для неподходящих страниц и sitemap только разрешённых URL. Подготовить
структуру about/contact/privacy/terms/disclosure и план 20–30 содержательных страниц.
Для редакционных текстов хранить источники; не заполнять страницы фиктивными ценами.

**Файлы:** metadata/robots/sitemap/route pages, content catalog, `docs/seo.md`.

**Готово локально:** metadata и sitemap проверяются на localhost/test domain; неизвестный
slug даёт 404; содержательный шаблон не превращается в массовый SEO filler. Тексты без
данных оператора помечены черновиками и не попадают в sitemap. **Отдельный внешний шаг:**
заполнить настоящие реквизиты и проверить production hostname перед публикацией.

## I14. Сессии и события

**Сделать:** определить время сессии и правила обновления, общий session ID для page view,
deal impression/view, filter и outbound click. Убрать общее `anonymous-session` для всех
переходов; определить поведение при отказе storage. Обрабатывать network failures,
дубли browser effects, source/campaign. Ограничить собираемые данные и retention.

**Файлы:** analytics models/schemas/API, web tracker/CTA, tests, tracking documentation.

**Готово, если:** fake-clock/browser tests показывают одну сессию на путь, новую после
таймаута, согласованные view/click IDs и работу UI без localStorage. Нет идентифицирующих
данных в SubID и client-created подтверждений бронирования.

## I15. Метрики и конверсии

**Сделать:** считать revenue/1000 sessions до финального округления, добавить период,
определить raw-event vs session CTR и attributed vs unattributed conversions. Сохранять
известный click/deal при обновлении статуса без этих полей; проверять совпадение provider.
Укрепить JSON import и при необходимости подготовить CSV parser с fixtures.

**Файлы:** `api/analytics.py`, conversion service/schemas/models, admin API, tests.

**Готово, если:** 1 PLN / 3000 sessions даёт 0.33 PLN/1000, repeated upsert не создаёт дубль,
status update не теряет атрибуцию, cancelled/rejected не считаются confirmed revenue.
Фикстуры подтверждают periods и несколько currencies без выдуманного FX.
Реальные provider reports/webhooks подключаются отдельной задачей после доступа.

## I16. Защита конфигурации и endpoints

**Сделать:** запретить пустой/default admin token в production; constant-time comparison;
явный configurable CORS, необходимые security headers, bounded input/payloads и rate limits
для публичных write/redirect endpoints. Продумать trusted proxy адреса. Секреты не должны
попадать в logs/errors/status. Сохранить bootstrap без travel token из I02.

**Файлы:** settings/admin/main, proxy configuration, analytics/affiliate services, tests.

**Готово, если:** локальный production config с default admin secret отклоняется; валидный
admin secret и отсутствующий travel token допускают bootstrap. Проверены auth failures,
лимиты, CORS и headers без реального домена. Нет отключения security ради passing tests.

## I17. Score breakdown и модерация

**Сделать:** хранить score version/components, объяснить sample count/coverage и неизвестную
convenience. Добавить минимальные protected deal list/search/visibility/featured actions;
не позволять regeneration отменять решение редактора. Не строить большой CMS.

**Файлы:** scoring/deal models/services/schemas, migrations, admin endpoints, tests;
`docs/deal-scoring.md`, `docs/price-history.md`.

**Готово, если:** score воспроизводим из сохранённых входов/версии, скудная история не
подаётся как сильное доказательство скидки; manually hidden остаётся hidden после нового
ingestion. Admin действия недоступны без авторизации.

## I18. Репетиция эксплуатации без Oracle

**Сделать:** выделить один migration step для API/worker; подготовить healthchecks,
request/job IDs и диагностические логи. Backup писать во временный файл с атомарным
завершением; предусмотреть расписание/retention, проверку dump, `pg_restore --exit-on-error`.
Протестировать base/production/shared-proxy config и взаимодействие сетей локально.

**Файлы:** Compose, entrypoint, backup/restore scripts, local integration harness, runbook.

**Готово, если:** на отдельном локальном Compose project/volume создаётся тестовая БД,
backup восстанавливается в другую БД, совпадают контрольные записи; повреждённый dump
даёт ошибку, частичный backup не объявляется успешным. Никаких операций над рабочим volume.
Настоящие DNS/TLS, offsite credentials, monitoring destination и Oracle deploy — отдельная
приёмка после handoff владельца.

## Что не включать в задачи «без внешних факторов»

| Внешнее действие | Что можно подготовить заранее |
| --- | --- |
| Покупка домена, DNS и VM | I02, I13, I18 |
| Проверка настоящего Data API/PLN/coverage | I03–I07 и fixture tests |
| Подтверждение программы и правил ссылки | I08–I10 и mock transport |
| Проверка отчёта реальной комиссии | I14–I15 и import fixtures |
| Реквизиты оператора и финальные тексты сайта | Структура и черновики I13 |
| Реальный deploy/HTTPS/backup destination | Локальный rehearsal I18 |

Отели, второй партнёр, Telegram, alerts и новые рынки не добавлять в критический путь.
Сначала закончить проверяемый flight-only сценарий.

## Шаблон задания для следующей работы

```text
Выполни задачу I__ из docs/independent-development-tasks.md.
Проверь текущее состояние кода и зависимости задачи.
Реализуй описанный объём, проверь критерии готовности и обнови статус.
Внешние запросы к provider не нужны: используй изолированные fixtures/mocks.
Не подключай фиктивные цены к production и не отмечай реальную интеграцию работающей.
В отчёте укажи изменённые файлы, проверки и оставшуюся внешнюю приёмку.
```

## Журнал выполнения

Редакционное дополнение 2026-09-23: завершены 18 оставшихся материалов, итого 25 из 25.
Добавлены официальные источники по разделам, дата проверки, переходы к каталогу
и группировка `/info`. Реестр и правила дальнейшей актуализации — docs/seo.md.
Фактические аккаунты/одобрения, домен, реквизиты оператора и production остаются внешними шагами.
Проверки: lint/typecheck/production build passed, полный Playwright desktop/mobile —
58 passed (Edge), включая существующий путь от аэропорта до партнёрского перехода.

Дополнение от 2026-09-23: ещё две статьи (бюджет и one-way/round-trip), итого 7 из 25.
Token-free команда проверки HTTP-доступности сайта/API и возраста backup готова
для подключения к мониторингу; 22 теста прошли. Инструкции — operations.md;
расписание, доставка уведомлений и offsite остаются внешними шагами.
Обновлены blocker-resolution.md и шаблон release-acceptance.md.
Новые страницы проверены frontend lint/typecheck/production build и целевым Playwright на desktop/mobile.

Дополнение I13 от 2026-09-21: три польские статьи о сравнении, свежести и истории цен,
раздел `/info`, связанные ссылки, metadata/sitemap и исправление неизвестных slug
с именами свойств Object. Готовы 5 из 25 страниц SEO-плана в локальном приложении;
публикация на внешнем домене остаётся отдельным шагом.

| ID | Дата | Изменение / commit | Проверка | Внешняя приёмка, если нужна |
| --- | --- | --- | --- | --- |
| I01 | 2026-09-20 | ESLint CLI, TS, mypy/Ruff, lockfile, CI, PostgreSQL, Playwright | Сборки Windows/Linux Docker; см. итоговые команды | — |
| I02 | 2026-09-20 | Без токена запускаются migrate/API/web; worker opt-in | production-like bootstrap, пустой каталог | — |
| I03 | 2026-09-20 | v3 adapter, pagination, timestamps, typed failures | HTTP mocks, malformed/429/5xx/timeout | Настоящий provider/program/report |
| I04 | 2026-09-20 | DB uniqueness, observation key, locked insert, preflight | PostgreSQL concurrent writers; legacy дубли не удаляются | — |
| I05 | 2026-09-20 | Advisory lock, общий run ID, retry/recovery | Отдельные процессы PostgreSQL | — |
| I06 | 2026-09-20 | Source/fetch/TTL/departure lifecycle, maintenance | TTL, cache повтор, departure, скрытая сделка | — |
| I07 | 2026-09-20 | Alias model и однозначное разрешение | несколько аэропортов, unknown/ambiguous | — |
| I08 | 2026-09-20 | Program/component/click FK и approval policy | APPROVED, отзыв approval, unconfigured | Настоящий provider/program/report |
| I09 | 2026-09-20 | StoredLinkAdapter, SubID, reasons, internal path | Unsafe URL и tracking contract; реальная ссылка отдельно | Настоящий provider/program/report |
| I10 | 2026-09-20 | Главная, route cards, detail, CTA | Desktop/mobile browser E2E | Настоящий provider/program/report |
| I11 | 2026-09-20 | Decimal string DTO, pl catalog, shared components | TS, дробная цена в API/браузере | — |
| I12 | 2026-09-20 | Budget/date/duration/route + bounded pagination | API boundaries + browser next/empty/invalid | — |
| I13 | 2026-09-23 | Metadata/noindex/sitemap/trust drafts, все 25 страниц локально | Browser metadata/sitemap/unknown routes; реестр editorial | Реквизиты, публикация, hostname, актуализация источников |
| I14 | 2026-09-20 | 30 min sessions, impressions/events, fallback, retention | Browser session path/rotation/storage; retention unit | — |
| I15 | 2026-09-20 | Окна, precise revenue, attribution-safe upsert | 1/3000 → 0.33, currencies/status/updates | Настоящий provider/program/report |
| I16 | 2026-09-20 | Prod secrets/auth/CORS/headers/body/rate/redacted logs | Auth/input/headers, production bootstrap | — |
| I17 | 2026-09-20 | flight-v2 components, sample count, protected moderation | Hidden survives regeneration; API auth | — |
| I18 | 2026-09-20 | Single migrate, atomic dump, empty-target restore, runbook | Isolated restore checksum, corruption/failure checks, proxy networks | Oracle, DNS/TLS, offsite |
