# Состояние реализации HopTrip

Проверено 2026-09-23. Основание: [MasterPrompt](../doc/MasterPrompt.md),
[исходный аудит](project-audit-and-plan.md) и [18 внутренних задач](independent-development-tasks.md).

## Результат

Редакционное дополнение 2026-09-23: завершены оставшиеся 18 польских материалов —
багаж, пересадки, посредники, WRO/WAW/WMI/KRK/GDN/KTW/POZ и восемь направлений.
Итого **25 из 25 страниц плана доступны в приложении**, а не опубликованы на внешнем домене.
У новых текстов по 2–3 официальных источника рядом с соответствующими разделами,
дата проверки, связанные статьи и переходы к существующему каталогу.
`/info` разделён на методику, планирование, аэропорты и направления.
Реестры — `travel-guides.ts`, `airport-guides.ts`, `destination-guides.ts`;
карта материалов и порядок актуализации — [seo.md](seo.md).
Индексация шаблонов маршрутов и черновиков contact/privacy/terms не открывалась.
Проверки этого дополнения: frontend lint/typecheck/production build — passed;
полный Playwright desktop/mobile через Edge — **58 passed**, включая прежние 18
и 40 новых проверок реестра, индекса и статей. Backend в этом дополнении не менялся;
новый внешний CI и публикация не выполнялись.

Дополнение от 2026-09-23: добавлены две польские статьи `/info/trip-budget` и
`/info/one-way-round-trip`, связанные с каталогом статей и sitemap. Промежуточный итог
до редакционного дополнения выше составлял 7 из 25 страниц. Черновики реквизитов не объявлены готовыми.
Добавлена команда `app.jobs.check_operations`: HTTP-проверки сайта/API и возраста
backup, JSON и exit code для будущего мониторинга. Расписание и доставка уведомлений
на VM не настроены. Свежесть файла не заменяет restore drill или проверку offsite-копии.
Исправлено смешение локальной репетиции и production в blocker-resolution.md;
добавлен незаполненный шаблон release-acceptance.md.

Проверки дополнения: 22 теста мониторинга passed, Ruff/mypy passed,
frontend lint/typecheck/production build passed; целевой Playwright desktop/mobile — 2 passed (Edge).
Это проверки нового локального объёма, не повтор всего PostgreSQL-набора или внешний CI.

Дополнение UI от 2026-09-21: выполнен редизайн по [UI.md](UI.md).
Главная, каталог, детали, статьи и системные состояния используют общие токены,
локальные Fraunces/DM Sans и адаптивные компоненты. Переходы и бизнес-логика сохранены.
Сопоставление требований и реализации — [ui-implementation.md](ui-implementation.md).
Дополнительно: компактные раскрываемые фильтры, метки применённых условий,
снятие/сброс и активный пункт меню; проверена синхронизация формы с URL и возврат назад.
У провайдера добавлены сохраняемые по каждому origin счётчики обработки и причины
остановки пагинации, изоляция переполнения даты и проверка ASCII-кодов/лимита страниц.
Описание отчёта — [providers.md](providers.md).

Реализован локальный flight-only путь: загрузка cached цен → история → оценка →
главная/маршрут/сделка → разрешённый партнёрский переход → клик/отчёт.
Фикстуры используются только в тестах. Наличие работающих тестов не подтверждает
доступ к настоящему Data API, одобрение программы или получение комиссии.

| Задачи | Реализация |
| --- | --- |
| I01 | ESLint вместо next lint, TS, Ruff/mypy, Python/npm lockfiles, CI, отдельная PostgreSQL и Playwright |
| I02 | Bootstrap API/web без travel token, отдельные website/data/monetization состояния, opt-in worker |
| I03–I04 | Data API v3, bounded pagination, проверка payload/dates/money, typed errors, unique offer/observation keys |
| I05–I07 | PostgreSQL advisory lock, общий run ID, retry/recovery; TTL/departure lifecycle; airport/city aliases |
| I08–I09 | Program/component/click связи, active+APPROVED policy, точный host, stored-link/SubID adapter |
| I10–I12 | Главная и route cards, detail/CTA, PLN string DTO, польские тексты, совместные фильтры и pagination |
| I13 | Canonical/OG/noindex/sitemap/404, страницы о сервисе и партнёрах, trust drafts, план 25 содержательных страниц |
| I14–I15 | Сессии 30 минут, видимые impressions, единый view/click ID, storage fallback, retention, точные метрики и upsert |
| I16–I17 | Production secrets, constant-time auth, headers/CORS/body/rate limits, score components и модерация |
| I18 | Одноразовый migrate, изолированный Docker rehearsal, атомарный backup и restore в пустую БД |

I04 выполнена с безопасным уточнением: миграция 0013 **не удаляет старые дубли**.
Read-only preflight перечисляет их; при конфликте unique constraints миграция
откатывается. Проверка на legacy fixture подтвердила сохранение обеих записей и
ревизии 0012. Конкретные дубли существующей БД требуют отдельного разбора после backup.
Первоначальный вариант автоматического удаления был отклонён автоматической проверкой.

I09 использует готовую одобренную ссылку; HTTP API генерации ссылок не заявлено реализованным.
I13 включает редакционный план и все 25 страниц в локальном приложении: about/partners,
пять статей о методике и бюджете, три общих руководства, семь аэропортов и восемь направлений. Добавлены `/info`, связанные статьи,
отдельные метаданные и sitemap из реестра опубликованных текстов. Исправлен сбой
при slug `constructor`/`toString`/`__proto__`: теперь используется проверка собственных ключей.
Это не 25 опубликованных на внешнем домене статей. Контакты/privacy/terms
остаются явно помеченными черновиками без реквизитов оператора.

## Проверки

| Проверка | Результат |
| --- | --- |
| Backend pytest с TEST_DATABASE_URL | 93 passed; PostgreSQL concurrency, process lock, migrations и rollback входят в набор |
| Ruff | Passed |
| mypy | Passed |
| Frontend lint / typecheck / production build | Passed |
| Playwright | 18 passed (2026-09-21): desktop/mobile, путь WRO → deal → local partner, click/session, filters, no-link, expired/404, storage, статьи/SEO, неизвестные info slug, UI на 320 px, снятие условий/возврат назад и меню |
| Чистая Docker сборка Linux amd64 | API из requirements.lock; web через npm ci и Next production build |
| Миграции новой БД | 0001 → 0013_integrity_and_affiliates |
| Bootstrap без внешнего токена | Website READY, data/monetization NOT_CONFIGURED, публичный каталог пуст |
| Compose base / production / shared-proxy | Конфигурации валидны |
| Сеть proxy | Отдельный контейнер в rehearsal edge достиг API через hoptrip-caddy; web и readiness HTTP 200 |
| Backup/restore | Отдельная целевая БД: 7 airports, 10 destinations, 0 deals; одинаковый checksum каталога и revision |
| Отказы backup/restore | Повреждённый dump и непустая БД отвергнуты; failed backup не публикует .dump/.partial |

Браузерные проверки 2026-09-20 и 2026-09-21 выполнены через установленный Edge (Chromium):
скачивание отдельного Chromium с CDN завершалось timeout.
Первый [CI на GitHub](https://github.com/Wrocoder/HopTrip/actions/runs/35653548610)
прошёл backend, миграции, lint/typecheck/build; 16/18 browser-тестов прошли.
Два сбоя касались перехвата вымышленного partner.example после редиректа в Chromium.
Тест исправлен: проверяет настоящий 307/URL/SubID и перенаправляет на локальную fixture.
При ошибке CI теперь сохраняет browser traces/screenshots на 7 дней.
Повторный [CI для a371e6b](https://github.com/Wrocoder/HopTrip/actions/runs/35654309550)
завершился **Success**: 93 backend-теста, 18 browser-тестов desktop/mobile на Linux Chromium,
Ruff/mypy, миграции и frontend lint/typecheck/build прошли. Это подтверждение
проверенной ревизии кода, не развёртывание на VM и не проверка реальных партнёров.
Тестовые API/web останавливаются Playwright после прогона.
Есть deprecation warnings зависимостей Starlette/httpx и ESLint 9; текущие проверки проходят.
При прогоне 2026-09-21 устаревший локальный `.next` возвращал 404 для существующих
маршрутов. После остановки тестового сервера и очистки только build cache повторный
полный прогон прошёл: 12/12. Порядок восстановления описан в local-development.md.
Дополнение со статьями проверено lint/typecheck и production build Linux Docker;
backend-код в дополнении со статьями не менялся. Последующее дополнение провайдера
проверено отдельным полным прогоном: 79 passed после миграции перезапущенной тестовой БД.

## Что проверить с настоящими доступами

1. Право использовать и хранить cached цены, реальные PLN/market/coverage и sample response.
2. Одобрение конкретной программы/Project, sample link, допустимый SubID и реальный click attribution.
3. Реальный отчёт о commission/status и сопоставление с кликом.
4. Реквизиты оператора и окончательные контактные/privacy/terms тексты.
5. Домен, DNS/TLS, Oracle VM, при необходимости ARM64 build, offsite backup и alerts.
6. Проверка статей на production hostname, актуальности источников и отдельное решение
   об индексации маршрутов; зелёный CI для выпускаемой ревизии.

Отели, второй партнёр, Telegram и полноценная сборка стоимости всей поездки —
последующие этапы MasterPrompt, не входят в выполненные 18 задач flight-only.

## Где смотреть и как продолжать

- [Действия владельца по шагам](owner-action-guide.md): домен, VM, аккаунт, токен, ссылка, handoff.
- [Задачи и журнал I01–I18](independent-development-tasks.md).
- [Запуск, миграция, admin API, backup/restore](operations.md).
- [Контракт provider](providers.md), [история цен](price-history.md), [оценка](deal-scoring.md),
  [аналитика](tracking.md), [редакционный план](seo.md).

Отдельный локальный rehearsal: http://localhost:58080, API http://localhost:58000.
Он использует собственную временную БД. Исходные контейнеры проекта и их данные
не обновлялись; перед обновлением нужен preflight/backup по runbook.
