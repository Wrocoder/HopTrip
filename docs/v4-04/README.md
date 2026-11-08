# V4-04 — партнёрские переходы

Дата: 2026-11-07, Europe/Warsaw. **DONE локально.** Проверена текущая рабочая копия после V4-01–03. Миграция, новые зависимости и активация сервисов не требуются. Результаты: [verification.json](verification.json).

## Исправления

Aviasales уже проверял approved/active программу, allowlist, исходный ticket URL, marker/trs/sub_id и точное совпадение вложенной ссылки. Найдены дополнительные проблемы:

- URL не изменился, но маршрут, тип продукта или даты источника противоречат сохранённому предложению либо карточке поездки.
- При двух компонентах одного типа, включая `FLIGHT`/`flight`, `/go` выбирал произвольный первый компонент.
- Старый JSON источника или компонента содержит массив, строку или число: чтение/синхронизация могли завершаться исключением.

Добавлена общая проверка для синхронизации и чтения/redirect: known mapped origin/destination, аэропорт отправления, допустимые destination aliases, timestamp вылета, календарные даты поездки и явные даты payload. Используются существующие `AIRPORT_MISMATCH`/`INVALID_DATES` и `trip_dates`: ночное прибытие домой не меняет дату обратного вылета.

При противоречии API не выдаёт ссылку, `/go` отвечает 503 без Location, успешного AffiliateClick и AnalyticsEvent. Синхронизация удаляет старый outbound_url и учитывает invalid_sources без вызова конвертера. Повреждённый JSON компонента закрывает переход; синхронизация может восстановить компонент из корректного источника. Однотипные дубликаты закрывают переход с `AMBIGUOUS_COMPONENT` на чтении и `/go`.

Отсутствующие данные старых предложений остаются неизвестными. Проверка не угадывает закрытую грамматику Aviasales, состав пассажиров по суффиксу пути или защищённость пересадки. Разные аэропорты прямого и обратного рейса допустимы. Неполное расписание само по себе не доказывает неверность исходной ссылки.

## Матрица интеграций

| Интеграция | Параметры и tracking | Границы и отказы |
|---|---|---|
| Aviasales / Travelpayouts | Исходный ticket path/query, повторяющиеся параметры, opaque t и source passenger fields; marker, trs, placement sub_id; только display currency приводится к PLN существующим адаптером | Проверены маршрут, даты, aliases, неправильный target/tracking, expired/departed offers. Правка людей/дат в TripDraft не меняет билет; UI просит проверить параметры и цену у партнёра. |
| Stay22 | aid=hoptrip, address города, checkin/checkout, adults 1–50, campaign=hoptrip_accommodation, lang=pl, currency=PLN | Проверены календарь, checkout > checkin, Unicode, границы месяцев. Children/rooms/return_arrival не отправляются; при неподдерживаемом составе или ошибке CTA отсутствует. Конечный язык/валюта продавца не гарантируются. |
| Tiqets | 40 affiliate URLs в реестре 78 активностей для 69 направлений: tiqets.tpx.gr либо tp.media/r с единственным https Tiqets target; tracking не переписывается | Неверный affiliate URL скрывается, отдельная официальная ссылка остаётся. Даты, люди и язык выбираются у партнёра. Реестр не является live inventory. |
| Welcome Pickups | Три ранее подтверждённые редакционные ссылки tpx.gr для Malaga, Alicante, Prague | Неверная ссылка скрывается. Рейс, люди и время трансфера автоматически не передаются; UI сообщает об этом. |
| Ticketmaster | URL из Discovery с допустимым affiliate path/ID и единственным target на разрешённом Ticketmaster host | Проверены unsafe/untracked URLs, unavailable statuses, даты/география и ошибки источника. Поиск события не подтверждает выбранный билет или наличие мест. Browser использует synthetic event и loopback destination. |
| Другие stored-link программы | Approved/active provider/program, capability, https/host allowlist; click tracking при разрешённом tracking_param | Неверные URL, отключённые программы и неоднозначные компоненты закрывают переход. Aviasales placement sub_id не заменяется per-click ID. |

UI сохраняет `sponsored noopener noreferrer` и предупреждения о проверке параметров у партнёра. Analytics consent управляет событиями; отказ и сетевой сбой аналитики не блокируют навигацию. Проверяются обычные/средние клики, affiliate/official links и отсутствие URL/личных данных в аналитическом payload.

## Проверки

- До исправлений: **19 FAIL / 3 PASS** из первых 22 новых backend сценариев, `.cache/v4-04-before.xml`. Затем добавлены ещё пять сценариев дат/маршрута: всего **27 новых тестов**.
- Финальный API: **1346 PASS / 18 PostgreSQL SKIP**, два существующих deprecation warnings — `.cache/v4-04-api-final.xml`. Новые 27 отдельно: `.cache/v4-04-context.xml`; профильный набор до последнего structured-return сценария: **85 PASS**, `.cache/v4-04-focused.xml`.
- Node: **356 PASS**, включая полный реестр static affiliate links и валидацию Stay22. Ruff для API и нового теста, mypy для 127 source files, ESLint и Next build/type checks: **PASS**.
- Browser: первый прогон **30 PASS / 8 FAIL**, `.cache/v4-04-browser.json`; все восемь падений — synthetic Aviasales fixture без своих marker/trs. После исправления повтор `flight-link-binding.spec.ts` + `partner-boundaries.spec.ts`: **16/16 PASS**, `.cache/v4-04-browser-final.json`. По последним результатам **38/38 unique PASS** без flaky/skips: также `affiliate-context.spec.ts` и `accommodation.spec.ts`. PL/EN/RU/UK, desktop/mobile, локальные API/SQLite, перехваченные либо loopback переходы; реальные партнёрские сайты не открываются.
- Маршруты: WRO–BCN; KRK–LON/STN с возвратом LTN–WAW; GDN–PAR/BVA с возвратом CDG–GDN; structured STN/LTN return с прилётом домой на следующие сутки. Тесты сохраняют исходные ссылки и не доказывают реальный тариф на эти маршруты.

Browser fixture дополнен конфликтом дат при неизменном ticket URL. Его исходные часы deal/offer выровнены. Первый browser запуск обнаружил отсутствие изоляции synthetic tracking-конфигурации: marker/trs теперь явно задаются только в fixture и восстанавливаются после сценария; повтор прошёл. Сгенерированный `next-env.d.ts` восстановлен до состояния перед задачей; локальные серверы завершились после тестов.

## Изменённые файлы

- [booking_context.py](../../apps/api/app/services/booking_context.py) — новая проверка контекста.
- [affiliate.py](../../apps/api/app/services/affiliate.py), [partner_links.py](../../apps/api/app/services/partner_links.py), [API redirect](../../apps/api/app/api/affiliate.py) — применение проверки, безопасный JSON, неоднозначные компоненты.
- [test_booking_context.py](../../apps/api/tests/test_booking_context.py) — 27 новых сценариев.
- [e2e_app.py](../../apps/api/tests/e2e_app.py), [flight-link-binding.spec.ts](../../apps/web/tests/flight-link-binding.spec.ts) — локальный конфликт даты и изоляция synthetic tracking.
- [HOPTRIP_V4_PROGRESS.md](../HOPTRIP_V4_PROGRESS.md), этот отчёт и verification.json.

## Ограничения

Внешняя цепочка redirect сегодня не открывалась. HTTP 200 и сохранность URL не подтверждают наличие билетов, финальную цену или комиссию. Opaque passenger/ticket fields проверены как сохранность данных поставщика, без независимого подтверждения их семантики. Исторический `docs/hoptrip-partner-audit.md` не объявляется свежей проверкой.

Не выполнялись реальные бронирования, проверка кабинетов/начисления комиссии, PostgreSQL-прогон, deployment, активация интеграций или рассылки. Конечные параметры, наличие и атрибуция в кабинете подтверждаются у провайдера. Следующая отдельная задача — V4-05; она не выполнялась.
