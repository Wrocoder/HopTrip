# HopTrip — исходное состояние (HT-00)

Дата: 2026-10-10. Основа: main, e9e791006e4a66cc147ded23e3e64cf846f9e588.
Публичные проверки: 15:23 UTC и последующая проверка первого экрана.
Задача только документирует состояние; код и production не изменены.

## Архитектура и карта реализации

| Область | Реальная реализация | Состояние / ограничения |
| --- | --- | --- |
| Стек | apps/web/package.json, pyproject.toml, docker-compose*.yml | Next.js 16.3.6 / React 19 / TypeScript; FastAPI, SQLAlchemy, PostgreSQL; worker ingestion |
| Главная | apps/web/src/app/page.tsx | Hero с поиском; блок бюджета перед 6 предложениями; ссылки аэропортов и направлений |
| Поиск и выдача | apps/web/src/app/components/filters.tsx; apps/web/src/app/deals/page.tsx; apps/api/app/api/catalog.py | URL-фильтры, даты вылета, бюджет, ночи, offset; 12 карточек на страницу. Нет общего total и выбора сортировки |
| Вылет | components/airport-select.tsx; lib/airports.ts; app/services/airports.py | Подсказки, регистр, пробелы, диакритика, польские алиасы, различение нескольких аэропортов |
| Направления | app/data/destinations.json; app/services/destinations.py; app/models/location.py | Destination + DestinationAlias для кодов CITY/AIRPORT провайдера. Это ещё не разрешение пользовательских названий в поиске |
| Карточки | components/catalog.tsx; deals/[slug]/page.tsx; lib/api.ts | Тип поездки, даты, вылет с IATA, город назначения, PLN на человека, балл; нет часов обоих плеч и кода конкретного аэропорта назначения |
| Бюджет | components/trip-budget-calculator.tsx; lib/trip-budget.ts | React useState, целые гроши, сумма группы/человека, неизвестное отдельно от нуля, за ночь/весь срок; нет persistence |
| Транспорт / гайды | components/reference-costs.tsx, airport-transfer.tsx, destination-guides.tsx; lib/reference-costs.ts; lib/content.ts | Уже имеются подсказки с источниками и редакционные материалы; не заменять новым параллельным каталогом |
| Оценка | app/services/scoring.py, score_explanation.py; components/score-details.tsx | flight-v3: история цены 60, число наблюдений 25, свежесть 15; не комфорт и не вероятность покупки |
| Перелёты / партнёр | app/services/partner_links.py, affiliate.py; app/api/affiliate.py; components/outbound.tsx | Travelpayouts / Aviasales, политика одобренной программы, /go, запись клика; доступность и цена подтверждаются у продавца |
| Жильё | lib/accommodation-links.ts; components/trip-accommodation.tsx | Stay22 Allez, AID hoptrip, изменяемые даты/взрослые, campaign hoptrip_accommodation; прямой внешний href, нет события stay в HopTrip |
| Активности | components/destination-activities.tsx, activity-link.tsx; lib/destination-activities.ts, activity-expansion.json | Tiqets/официальные ссылки, ACTIVITY_CLICK с контекстом; фактическую доступность на даты не обещает |
| Аналитика | lib/session.ts, consent.ts; app/api/analytics.py; app/schemas/analytics.py; app/api/admin.py | PAGE_VIEW, DEAL_IMPRESSION, DEAL_VIEW, SEARCH, FILTER_USE, ACTIVITY_CLICK; event_id и дедупликация, UTM; нет полноценного search-result контракта |
| Согласия | components/consent-controls.tsx; lib/consent.ts; layout.tsx | Раздельные analytics/marketing. Без analytics sessionContext очищает ID; /go без session_id не добавляет аналитический контекст |
| SEO | robots.ts, sitemap.ts, lib/catalog-pages.ts, layout.tsx; preview/[kind]/[key], share/[slug] | Метаданные, OG, allowlist посадочных страниц; фильтры noindex/follow с canonical на свой URL; /share — редакционный материал, не сохранённый бюджет |
| Подписки | feature/email-alerts: app/api/alerts.py, services/alerts.py, alert_mail.py, jobs/alerts.py | В отдельной ветке. В main остались модель и применённая миграция 0014, а не работающая публичная подписка |
| Операционные уведомления | scripts/monitor.py, notify-activity.py, setup-notifications.py | Уведомления владельцу/оператору; не считать их персональными подписками путешественников |
| События | feature/ticketmaster, docs/events-provider-access.md | Есть предыдущий пилот и реализация вне main; коммерческий доступ и ответ партнёра не подтверждены |

Пути components/ и lib/ в таблице относительно apps/web/src/app и apps/web/src;
пути app/ — относительно apps/api. Полную структуру смотреть по соответствующим каталогам.

## Источник цен и расписание

TravelpayoutsDataProvider вызывает /aviasales/v3/prices_for_dates. Это сохранённые
цены, а не live inventory. Нормализатор принимает departure_at/depart_date,
return_at/return_date, price/value, found_at, expires_at; сохраняет исходный payload.
RawTravelOffer и TravelOffer имеют depart_at, return_at, departure_precision,
source_observed_at, fetched_at, last_verified_at. DATE и TIME различаются;
дата без времени становится началом UTC-дня технически, это не час рейса.
Временное значение без timezone отклоняется. return_at нельзя трактовать как
прибытие в город назначения. airline, flight_number, transfers участвуют в identity
и могут присутствовать в raw_payload, но их покрытие реальными записями не измерено.
Отдельного нормализованного расписания прибытия обоих плеч/багажа нет.

Публичная DealRead отдаёт даты, ночи, travelers, город назначения и вылет IATA,
но не depart_at/return_at и не airline/flight_number/arrival timestamps.
Фронтенд Deal также не использует часть уже доступных полей (например nights).
HT-06 сначала проверяет покрытие сырого payload, затем выбирает честное отображение.
Время загрузки/первой записи нельзя называть проверкой наличия билетов.

## Воспроизведение внешнего аудита

Проверено через Edge headless / Playwright; необязательное согласие не принималось.
Ссылки партнёров в этой задаче не нажимались; покупок и отправки сообщений не было.

| Наблюдение | Проверка 2026-10-10 | Вывод |
| --- | --- | --- |
| Milan / milan / Mediolan | GET /api/v1/deals?origin=WRO&destination=...&limit=1: milan → 200 и 1 запись; Milan, %20MILAN%20, Mediolan, unknown-city → 404 Destination not found | Воспроизводится. API сравнивает Destination.slug == destination без alias lookup; UI только trim, raw ввод попадает в URL |
| Ошибка в интерфейсе | /deals?origin=WRO&destination=Milan показывает Sprawdź lotnisko, kierunek oraz zakres dat, budżetu i długości pobytu. | Ошибка слишком общая; отдельной подсказки направления нет |
| Рабочая выдача | /deals?origin=WRO&destination=milan: 9 карточек на момент проверки | Это моментальный результат, не стабильная величина для теста |
| Английские названия | Карточка Wroclaw (WRO) → Milan. /airports: WAW Warsaw, POZ Poznan; польские aliases уже есть | Единый слой отображения отсутствует; селектор вылета уже использует польский alias |
| Предложения ниже первого экрана | 1440×900: верх первой карточки около 1065 px от начала документа, после отказа от optional cookies также около 1065 px | Воспроизводится; docs/hoptrip-baseline-home.png — исходный первый экран |
| Сортировка/число | Код выдаёт list, сортировка score DESC, trip_start, id; UI только pagination | Нет total; сортировка устойчива, но не выбирается пользователем |
| Расписание/аэропорт назначения | Карточка и DealRead не содержат полного расписания | Подтверждено по контракту; нельзя вывести нужные часы только косметикой |
| Исторические 150/158 zł, 90/100, 06:05 | Не воспроизводились переходом к продавцу | Исторические цифры не используются как текущие; разница текущих цен не измерена |
| Оценка | В текущей карточке пояснение про цену, выборку и свежесть; явно исключён комфорт | Уже реализовано; HT-09 улучшает подачу без изменения математики |
| Потеря бюджета | /deals/flight-2130-2026-10-22: в #budget-food введено 77; после reload значение пустое | Воспроизводится; сохранение — HT-10 |
| Stay22 | На указанной странице есть 1 ссылка; в предыдущей ручной проверке владельца Booking получил Malaga/даты/2 взрослых/PLN, Hub показал 1 клик | Атрибуция конкретной кампании и комиссии не подтверждена |
| Tiqets | Раздел Muzea i atrakcje есть; на выбранной странице Milan не найдено href с tp.media | Это не отсутствие Tiqets во всём продукте; есть каталог ранее подготовленных ссылок и ActivityLink |
| SEO фильтров | canonical https://hoptrip.pl/deals?origin=WRO&destination=milan; robots noindex, follow | Фактически проверен один тип страницы, не весь SEO-аудит |

Для ручного повторения: открыть /deals?origin=WRO, последовательно ввести варианты
направления, сохраняя остальные фильтры; сравнить ошибку/выдачу. На странице поездки
ввести расход питания, обновить. Для первого экрана использовать 1440×900,
отклонить optional cookies, прокрутить в начало; сравнивать одинаковый viewport.

## Локальный запуск и проверки

Прочитаны README.md, docs/local-development.md, docs/branches-and-deployment.md,
apps/web/AGENTS.md и весь список HT-00…HT-24. Новая серия ведётся отдельно от
исторического журнала I01–I18; прежние результаты не обнуляются.

Вариант без реальных токенов, из корня:

```powershell
docker compose -f docker-compose.rehearsal.yml up -d --build --wait
# Web: http://localhost:58080; API: http://localhost:58000
# Отдельная БД rehearsal, тестовые параметры из compose.
docker compose -f docker-compose.rehearsal.yml down
```

Браузерные тесты самостоятельно поднимают изолированный SQLite API (8100) и Next
(3100), задают HOPTRIP_E2E=1; production БД не используется. Windows:

```powershell
$env:HOPTRIP_TEST_PYTHON = 'C:\Users\DmitriyKiselev\PycharmProjects\HopTrip\.venv\Scripts\python.exe'
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm --prefix apps/web run test:e2e -- accommodation.spec.ts
```

Перед Python-командами заново получить SDK через get_python_environment по
python-tools; путь выше — ранее подтверждённый SDK, не универсальный путь.
Стандартный dev: локальная .env из .env.example, docker compose up -d db,
установка requirements.lock и editable package, локальные Alembic migrations,
uvicorn из apps/api и npm ci/npm run dev из apps/web; детали в local-development.md.
Запускать только с локальными реквизитами. Worker opt-in.

Проверки: Ruff, mypy, pytest (PostgreSQL через отдельный TEST_DATABASE_URL),
npm run test:unit, lint, typecheck, build; Playwright; audit:seo и audit:experience.
Не запускать Next build/typegen одновременно с тестовым dev-сервером в одном .next.
В HT-00 эти полные наборы заново не запускались, поскольку изменена документация.
Ранее для Stay22: 19 unit, 2 desktop/mobile E2E, lint и build прошли. В Actions
38042140780 job checks завершился success; deploy failure относится к пустым
DEPLOY_* настройкам, а не к тестам приложения.

## Доступы, ограничения и состояние Git

До HT-00: изменена .idea/modules.xml; untracked три .iml, stay22.md и исходный
hoptrip_sequential_tasks_prompt.md. Эти файлы не изменялись. Ни commit, ни push,
ни deploy, ни production migration в HT-00 не выполнялись.

Production ранее вручную опубликован на e9e7910. Автодеплой не настроен:
GitHub secrets DEPLOY_SSH_KEY/DEPLOY_KNOWN_HOSTS и vars DEPLOY_HOST/DEPLOY_USER
отсутствовали при диагностике. Автоматическая проверка отклонила добавление SSH
ключа; требуется отдельное явное разрешение владельца. HT-00 эту работу не продолжает.

Viator аккаунт/API не подтверждены; EVENTIM заявка подготовлена, отправка не
подтверждена; Ticketmaster коммерческий сценарий ожидает ответа. Наличие ключа
данных не равно разрешению на коммерческий показ. Доход, выплаты, retention,
Search Console, полевые Core Web Vitals и полноценный мобильный аудит не измерены.
Админ-статистика и приватные кабинеты в HT-00 не запрашивались.
Скриншот и численные наблюдения — моментальный baseline, не обещание цены/наличия.

## Результат

HT-00 DONE: карта компонентов, подтверждённые дефекты, ограничения источников и
воспроизводимые команды записаны. Следующий ID: HT-01 (поиск направлений).
