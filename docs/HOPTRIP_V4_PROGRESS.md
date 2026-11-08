# HopTrip V4 — аудит и трекер прогресса

Дата аудита: **2026-11-07**, Europe/Warsaw. Требования: [HOPTRIP_V4_PLAN.md](HOPTRIP_V4_PLAN.md).

**Контроль продолжения 2026-11-08: следующей допустимой неполной локальной задачи нет.** Повторно прочитаны план и трекер; все 14 строк V4-01–V4-14 имеют DONE с ранее зафиксированными локальными границами. [Снимок статусов](v4-closeout/task-statuses.json). По текущей команде выполнена Node-регрессия: **379 PASS, 0 FAIL, 0 SKIP**, exit 0; [лог](v4-closeout/node.txt). Код приложения и статусы задач не менялись; новая задача не добавлялась. Локальный DONE не означает завершённый production rollout или подтверждённый эффект на реальных пользователях. Остановка после проверки доступности следующей задачи.

**Продолжение 2026-11-08: V4-14 DONE локально; 14 из 14 задач имеют локальное завершение.** Подготовлены пять нейтральных пользовательских сценариев, критерии/метрики, правила исследования и пустой шаблон наблюдений. Исправлена подтверждённая экспертная неточность: пустой saved-list теперь называет существующий пункт навигации к сохранению вместо калькулятора; точность направления 0/4 → 4/4 локалей, без заявления об ускорении людей. Свежие Node **379 PASS**, lint/tsc/build PASS; **44 unique browser PASS по последним результатам**, с явной историей исходной ошибки продукта и ошибочного ожидания нового теста. **Реальных участников 0**: понятность/время/конверсия не валидированы на людях и остаются отдельным follow-up при доступности участников. [Отчёт](v4-14/README.md), [протокол](v4-14/RESEARCH_PROTOCOL.md), [проверки](v4-14/verification.json). Дальнейшей локальной задачи V4 нет; production/deploy/рассылки не затрагивались.

**История предыдущего выполнения: V4-13 DONE локально; завершено 13 из 14 задач.** Проверены 40 страниц/200 геометрий (320/375/390/768/1440, PL/EN/RU/UK), 20 сквозных сценариев/60 состояний, desktop/mobile accessibility, контраст, ARIA/keyboard/dialogs/forms/planning и 64 CLS-замера. Исправлены production guards и гонка сохранения в тесте; app sources не менялись. По последним результатам **65 unique browser PASS** с явной историей двух отказов и ручных повторов; Node **379 PASS**, ESLint/tsc/build PASS. Lighthouse до/после: performance 98–100, accessibility 100; final CLS 0, LCP 265–1175 мс. Это lab, не field CWV/INP; screen reader/WebKit/физические устройства не заявляются. [Отчёт](v4-13/README.md), [проверки](v4-13/verification.json). Следующая допустимая задача — **V4-14**, она не начиналась.

**История предыдущего выполнения: V4-12 DONE локально; завершено 12 из 14 задач.** Исправлена приёмка keepalive после save/navigation: вместо количества Page-ответов проверяется запись каждого event_id ровно один раз через локальный fixture endpoint; редактор ожидается до следующего перехода. Полная production browser-приёмка **116/116 PASS**, 0 skipped/flaky (desktop/mobile, PL/EN/RU/UK); свежие API **85 PASS**, Node **379 PASS**, ESLint/tsc/Ruff PASS. Build и mypy предыдущего выполнения остаются применимыми: production-код в этом продолжении не менялся. [Итог](v4-12/COMPLETION.md), [проверки](v4-12/verification.json). Реальные сравнимые KPI — внешний follow-up; rollout/production DB/отправки не выполнялись. Следующая допустимая задача — **V4-13**, она не начиналась.

**История предыдущего выполнения: V4-11 DONE локально; завершено 11 из 14 задач.** Аудированы существующие email/Telegram lifecycle, matching, dedup, unsubscribe/stop, privacy и delivery gates. Email теперь повторно проверяет подтверждение и текущую версию согласия перед отправкой; доказаны 4 регрессии до исправления и 2 PG-сценария отзыва из другой сессии. Полный API 1370 PASS/0 skip (20 PG); focused 155 PASS; Node 377 PASS; Ruff/mypy/ESLint/build/финальный tsc PASS; browser 18/18 PASS. [Отчёт V4-11](v4-11/README.md), [проверки](v4-11/verification.json), [готовность и границы активации](v4-11/readiness.json). Все defaults доставки остаются false; реальной активации, отправок и deploy нет. Следующая допустимая задача — **V4-12**; она не начиналась. Предыдущие части: [V4-01](v4-01/README.md), [V4-02](v4-02/README.md), [V4-03](v4-03/README.md), [V4-04](v4-04/README.md), [V4-05](v4-05/README.md), [V4-06](v4-06/README.md), [V4-07](v4-07/README.md), [V4-08](v4-08/README.md), [V4-09](v4-09/README.md), [V4-10](v4-10/README.md). Первоначальный аудит ниже сохранён как история.

**История незавершённой приёмки 2026-11-08: V4-12 IN_PROGRESS.** Проверена уже существующая реализация viewport-когорт; исправлена переносимость browser-проверки Referer (Chrome возвращает пустую строку). Свежие результаты: API 85 PASS, Node 379 PASS, ESLint/tsc/build/Ruff/mypy PASS, viewport browser 16/16 PASS без skip/flaky. Общая browser-приёмка не завершена: product-analytics воспроизводит timeout flush после сохранения/навигации (строки 47/74, PL/EN/RU desktop). Прерванные прогоны не считаются PASS; потеря серверных событий не установлена. [Итог запуска](v4-12/CONTINUATION.md). Следующая работа — завершить V4-12; V4-13 не начиналась.

## Границы и результат первоначального аудита

Первичный аудит завершён. Проверены текущие исходники V4-01–V4-14, существующие тесты, зависимости и исторические отчёты. Код приложения, тесты, конфигурация и зависимости не изменялись. Единственный созданный файл — `docs/HOPTRIP_V4_PROGRESS.md`.

Аудируется **текущая рабочая копия**, включая изменённые и untracked-файлы, а не только HEAD `d928246`. В дереве уже было много изменений API/web/docs и удалений исторических документов; они сохранены. Этот checkout нельзя автоматически считать идентичным опубликованному релизу: H3/SEO-отчёты описывают отдельные clean checkout и другие SHA. Исторические PASS не являются свежим подтверждением текущего дерева или production.

Большинство задач имеет готовую основу. Главные функциональные пробелы P0: минимальная пригодная длительность поездки, анализ пересадок и самостоятельный рейтинг удобства. `FlightQuality` — проверка полноты/согласованности источника, а не требуемый `trip_quality_score`. Сортировка `destination_time` — интервал между аэропортовыми событиями, а не полезное время в городе и не комплексная рекомендация.

Статусы: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `NOT_APPLICABLE`. `TODO` означает, что V4-доработка/полная приёмка ещё не началась; это **не отсутствие существующей реализации**. При первоначальном аудите DONE не присваивался: выборочные проверки не покрывали все критерии V4. Текущие результаты V4-01 отражены в обновлённой строке ниже и отдельном отчёте. Внешние gates не должны мешать доступной локальной работе.

## Общий трекер

Строки V4-01/02/03/04/05/06/07/08/09/10/11 обновлены по реализации; остальные описывают первоначальный аудит. Полный список файлов и проверки реализации находятся в связанных отчётах.

| ID | Приоритет | Статус | Текущая реализация | Основной остаток / проблема | Изменённые файлы | Проверки этого запуска | Зависимости / блокеры | Завершение |
|---|---|---|---|---|---|---|---|---|
| V4-01 | P0 | DONE | Stay assessment, defaults 24ч airport/12ч daytime, резервы, night/early; обе секции рекомендаций главной; no-leave weekend | Функциональные критерии проверены; модель не гарантирует реальное время прогулок; при missing data подборки могут быть пустыми | API policy/schema/services; web contracts/guards/copy/schedule; tests/docs; [полный список](v4-01/README.md) | 1258 API PASS/18 PG skip; final targeted 76 PASS; 343 Node PASS; Ruff/mypy/ESLint/build PASS; 80 unique browser cases по последним результатам, [детали повторов](v4-01/README.md) | Blockers нет; реальные расписания/наличие подтверждаются у провайдера; deploy не выполнялся | DONE локально |
| V4-02 | P0 | DONE | UTC-интервалы; long ≥360 мин; night/airport-change/short-transfer; protection UNKNOWN; видимые предупреждения в 4 локалях | Критерии проверены; текущий provider contract не позволяет подтверждать защиту/MCT; missing evidence остаётся UNKNOWN | Новые connection schema/service/UI/tests; config/catalog/route validator/enrichment/API contract; [полный список](v4-02/README.md) | 1294 API PASS/18 PG skip; 349 Node PASS; Ruff/mypy/ESLint/build PASS; 36 unique browser cases по последним результатам; [повторы](v4-02/verification.json) | Blockers нет; live provider acceptance/deploy не выполнялись | DONE локально |
| V4-03 | P0 | DONE | trip_quality_score 0–100/null, 6 настраиваемых компонентов, Recommended до пагинации; unknown без нейтральных баллов; night-home penalty | Критерии проверены; веса/окна/буферы являются моделью, не гарантией удобства или наличия | Новые schema/service/copy/tests; API/catalog/batch/config/filters/summary/contracts; [полный список](v4-03/README.md) | 1319 API PASS/18 PG skip; focused 25 PASS; 356 Node PASS; Ruff/mypy/ESLint/build PASS; 38 unique browser PASS по последним результатам, final Recommended 12/12 | Blockers нет; V4-01/02 использованы; deploy не выполнялся | DONE локально |
| V4-04 | P0 | DONE | Aviasales ticket/context binding; JSON guards; запрет неоднозначных компонентов; аудит Stay22/Tiqets/Welcome Pickups/Ticketmaster; tracking/disclosures сохранены | Локальные критерии проверены; opaque passenger fields сохраняются без угадывания; наличие и комиссия подтверждаются у провайдера | Новый booking_context и 27 тестов; affiliate/partner_links/API redirect; E2E fixture/spec; docs; [список](v4-04/README.md) | 1346 API PASS/18 PG skip; Node 356 PASS; Ruff/mypy/ESLint/build PASS; browser final 16/16, все 38 unique PASS по последним результатам | Локальных blockers нет; существующие adapters и календарные модели V4-01/02; live chain/кабинеты отдельно; миграция/активация не требуются | DONE локально |
| V4-05 | P1 | DONE | +8 точных mapping, реальные размеры; 34 WebP сверены с манифестами/credits; responsive/lazy и 404/network/decode fallback проверены | 43 из 69 направлений без проверенного фото сохраняют ссылки; live production/source pages не проверялись | destination-imagery/card; Node/Playwright; guarded read-only fixture; docs; [список](v4-05/README.md) | Node 357 PASS; focused 7 PASS; ESLint/build/финальный tsc PASS; Ruff fixture PASS; browser final 8/8, все 42 unique PASS по последним результатам | Локальных blockers нет; existing licensed assets, Next/sharp/Playwright/SDK; новых зависимостей, миграции и активации нет | DONE локально |
| V4-06 | P1 | DONE | Длительность с UTC/estimated guards; методика и интервал в details; единый абзац условий; критические предупреждения/модель/цена снаружи | Локальная матрица проверена; снижение высоты 24/24, это не доказательство роста конверсии/CWV | Card/schedule/details; flight-facts/stay/copy/CSS; 6 Node и 10 UI случаев; docs; [список](v4-06/README.md) | Node 363 PASS; focused 21 PASS; ESLint/build/tsc PASS; baseline 8/8; browser final 10/10, все 60 unique PASS; 320/375/390/768/1440 и 4 локали | Локальных blockers нет; V4-01–05 использованы; новых зависимостей, API/миграций/активации нет | DONE локально |
| V4-07 | P1 | DONE | Четыре раздела в offer/shared/local; отдельный save рядом с бюджетом; price history внутри flight; локализованная навигация и недоступное planning state | Локальные критерии проверены; nested инструменты сохранены, исследование с пользователями/CWV не выполнялось | Deal/shared/navigation/copy; calculator/actions/CSS; Node и browser specs/docs; [список](v4-07/README.md) | Node 367 PASS; ESLint/build/tsc PASS; browser 52/64, повтор 18/18; дополнительные layout/сенсорный повторы; все 66 unique PASS по последним результатам, 4 локали/5 ширин/axe | Локальных blockers нет; V4-06 и V4-08 использованы; saved/share/events/старые якоря/returnTo сохранены; новых пакетов/API/миграций/активации нет | DONE локально |
| V4-08 | P1 | DONE | Начальный сценарий 4 статей, известная сумма до профилей; независимое сравнение личных диапазонов, адаптивность, guards конверсии | Локальные критерии проверены; личные диапазоны не являются рыночной ценой, будущие тарифы не гарантируются | Calculator/CSS, quick/copy, comparison/profiles/estimates, reference guards; tests/docs; [список](v4-08/README.md) | Node 367 PASS; focused 15 PASS; ESLint/build/tsc PASS; browser 65/66, повтор 10/10, все 66 unique PASS по последним результатам; 4 локали/5 ширин/axe | Локальных blockers нет; existing budget/draft/provenance/share и даты V4-01; новых пакетов, API/миграций/активации нет | DONE локально |
| V4-09 | P1 | DONE | Общие ISO/Intl-имена стран; 355 EN/RU-исправлений в 43 guides; RU-навигация и короткая UK-подсказка | Локальные критерии проверены; независимая вычитка носителями и язык внешних партнёров не гарантируются | Country helper/components/directory; guide/trip/filter copy; Node/browser tests; [список](v4-09/README.md) | Node 371 PASS; focused 18 PASS; ESLint/build/tsc PASS; browser final 22/22 без skipped/flaky; 4 локали/5 ширин/axe; [история](v4-09/verification.json) | Локальных blockers нет; V4-01–08 и existing i18n использованы; routes/SEO policies/source facts сохранены; новых пакетов/API/миграций/активации нет | DONE локально |
| V4-10 | P1 | DONE | Инвентарь 69 направлений; 19 со статьями/50 generic noindex; 17 airport intro; Reykjavík; сбой цен изолирован | Локальные критерии проверены; GSC Inspection 15 PENDING и эффект после recrawl остаются внешними follow-up | Destination loader/summary/page/planning/guide mapping; Node/browser/docs; [список](v4-10/README.md) | Node 377 PASS; focused 24; ESLint/build/tsc PASS; browser final 42/42 без skipped/flaky; полная sitemap и 69 SSR × 2; 4 локали/5 ширин/axe | Локальных blockers нет; V4-05/09 использованы; routes/SEO policy сохранены; новых пакетов/API/миграций/активации нет | DONE локально; внешние измерения открыты |
| V4-11 | P1 | DONE | Существующий email/Telegram lifecycle проверен; email consent/confirmation проверяются до резерва и после него; privacy, dedup и stop сохранены | Локальные критерии проверены; реальные SMTP/bot staging и активация требуют отдельной команды | Email digest; test helper; 4 SQLite + 2 PG регрессии; browser widths/docs; [список](v4-11/README.md) | API 1370 PASS/0 skip (20 PG); focused 155 PASS; Node 377 PASS; Ruff/mypy/ESLint/build/tsc PASS; browser 18/18, 4 локали/5 ширин/axe | Локальных blockers нет; изолированный PG16 удалён; все defaults false; API/модели/миграции/пакеты не менялись; реальных отправок нет | DONE локально; активация не выполнялась |
| V4-12 | P1 | DONE | Существующие события/consent/dedup; viewport-когорты и dashboard | Реальные KPI после отдельно разрешённого rollout; аппаратный тип устройства не измеряется | API/web аналитика; fixture tracking и browser oracle; [отчёт](v4-12/COMPLETION.md) | Свежие API 85, Node 379, browser 116 PASS/0 skip/flaky; ESLint/tsc/Ruff PASS; прежние build/mypy применимы | Локальных блокеров нет; production не менялся | DONE локально |
| V4-13 | P1 | DONE | 200 геометрий, 60 интерактивных состояний, axe/контраст/ARIA/клавиатура, desktop/touch, CLS/LCP/Lighthouse | Локальная приёмка завершена; field INP/CWV и реальные устройства/screen reader — внешние follow-up; transient catalog failure сохранён | 4 existing specs guards/race + v4-responsive; [отчёт](v4-13/README.md) | 65 unique browser PASS по последним результатам, 2 отказа/повторы в истории; Node 379; ESLint/tsc/build PASS; LHR 8 замеров; CLS 64 | Локальных блокеров нет; V4-01–12 использованы; production/deploy не менялись | DONE локально |
| V4-14 | P2 | DONE | Экспертный проход; 5 сценариев и протокол; исправлена неверная подсказка сохранения в 4 языках | Участники не предоставлены: человеческие метрики N/A; реальные сессии и эффект — follow-up, автоматизация не заменяет исследование | SavedTrips/trip-copy; usability-guidance; [отчёт/протокол](v4-14/README.md) | 44 unique browser PASS по последним результатам, история отказов/повторов сохранена; Node 379; lint/tsc/build PASS | V4-01–13 использованы; локальных блокеров нет; внешние сессии по доступности участников | DONE локально |

## Проверяемые основания первоначального аудита

### V4-01 — выходные поездки

- Реализованы [weekend.py](../apps/api/app/services/weekend.py), [trip_timeline.py](../apps/api/app/services/trip_timeline.py), [destination_time.py](../apps/api/app/services/destination_time.py), [weekend_catalog.py](../apps/api/app/services/weekend_catalog.py), контракты [weekend.py](../apps/api/app/schemas/weekend.py). Время сравнивается через UTC, локальные даты — через ZoneInfo; неизвестные/расчётные данные явно различаются.
- `calendar-v1`, `flexible-v1`, `no-leave-v1` доступны через [catalog API](../apps/api/app/api/catalog.py). Последний режим проверяет возвращение домой, исходный аэропорт и рабочие часы, но не дорогу в аэропорт/на работу. Legacy `weekend=true` сохраняет отдельную семантику.
- [home-collections.ts](../apps/web/src/lib/home-collections.ts) использует `calendar-v1` для weekend-подборки. `calendar` определяется по дням вылетов до проверки полного timeline/прилёта домой. Поэтому ELIGIBLE в этом режиме не означает достаточное пребывание или отсутствие отпуска. `recommendation_eligible` допускает PARTIAL: это не строгая пригодность поездки.
- Минимального полезного времени/конфигурации порога в изученной цепочке нет. Интервал прилёт→обратный вылет включает сон, трансферы и регистрацию. `duration_min` фильтрует `Deal.nights`, а не часы пребывания. Не заменять его смысл без решения о совместимости.
- Защита уже есть: `test_weekend_assessment.py`, `test_weekend_catalog.py`, `test_destination_time.py`, `test_trip_timeline.py`, web `weekend.spec.ts`, `destination-time.spec.ts`. До DONE нужны новые границы overnight/раннего возврата/min stay, DST, unknown и сохранение неподходящих оферт в общем поиске.

### V4-02 — пересадки

- [flight_routes.py](../apps/api/app/services/flight_routes.py) принимает сегменты только того же билета с проверкой дат/аэропортов/цены. [flight_facts.py](../apps/api/app/services/flight_facts.py) публикует legs и зоны; не вычисляет прибытие пересадочного рейса из airborne duration. Это правильная основа для следующего шага.
- Нет отдельного connection assessment с длительностью, ночной пересадкой, порогом 6 часов, риском короткого трансфера и prominеnt card warning. Сейчас [flight-facts.tsx](../apps/web/src/app/components/flight-facts.tsx) показывает сегменты в подробностях.
- Валидация уже отклоняет разрыв аэропортов между legs как неподтверждённый surface transfer. Поэтому для предупреждений об airport change нужно отличать подтверждённую смену от повреждённых данных; нельзя просто ослабить validator. Разные аэропорты outbound/return также не равнозначны смене аэропорта на пересадке.
- Наличие flight legs не доказывает защищённость стыковки. Self-transfer/protected должны оставаться unknown без источника. Нужны отдельные unit/API/UI тесты интервалов в UTC, DST, неизвестных зон и порогов; текущий Node flight-quality их не проверяет.

### V4-03 — качество поездки

- [flight_quality.py](../apps/api/app/services/flight_quality.py) классифицирует COMPLETE/PARTIAL/CRITICAL_INCOMPLETE и объясняет отсутствие/конфликт данных. Историческая оценка цены находится в существующих scoring/score_explanation, её нельзя переименовать в удобство.
- [catalog API](../apps/api/app/api/catalog.py) поддерживает `score`, `price`, `departure`, `destination_time`; default — `price`. Для itinerary scan есть явный предел 500 кандидатов с ошибкой слишком широкого запроса, а не молчаливым усечением. Новое ранжирование должно учитывать эту архитектуру и pagination/total.
- `trip_quality_score` и `Recommended` в текущем контракте не обнаружены. Нужны документированные веса/пороги, unknown-policy, детерминированные tie-breakers и тесты отдельно от price attractiveness. Использовать результаты V4-01/02; старые sort-параметры сохранить.

### V4-04 — партнёрские переходы

Обновление после реализации: проверка контекста, обработка повреждённого JSON и неоднозначных компонентов завершены. Свежая локальная матрица и ограничения внешней приёмки — в [отчёте V4-04](v4-04/README.md). Ниже сохранён первоначальный аудит.

- [affiliate.py](../apps/api/app/services/affiliate.py), [partner_links.py](../apps/api/app/services/partner_links.py), stored adapter: approved/active provider, capabilities, allowed hosts, tracking и повторная проверка привязки Aviasales к исходному ticket URL на чтении/redirect.
- [accommodation-links.ts](../apps/web/src/lib/accommodation-links.ts): Stay22 передаёт город, checkin/checkout, взрослых 1–50, AID/campaign, PLN; не принимает невозможные даты. Это поиск жилья, не подтверждение цены/наличия. Дети/номера уточняются у партнёра; `lang=pl` фиксирован и требует оценки в V4-09.
- [static-affiliate-url.ts](../apps/web/src/lib/static-affiliate-url.ts) проверяет формы Tiqets/transfer ссылок и сохраняет opaque attribution. Статическая ссылка на activity не обещает перенос параметров плана. Нельзя добавлять неподдерживаемые даты/пассажиров.
- [Партнёрский аудит](hoptrip-partner-audit.md) содержит прежние реальные примеры переходов и ограничения атрибуции. Их не повторяли; старый HTTP 200 не доказывает текущую bookability. Нужны fresh mocked integration/E2E для разных аэропортов/сложного возврата/expired offers/invalid redirect и отдельная ручная проверка согласованных live-переходов. Брони/комиссии не подтверждены.
- Существующие тесты: `test_affiliate.py`, `test_partner_links.py`, `test_flight_link_binding.py`, web `affiliate-context.spec.ts`, `flight-link-binding.spec.ts`, `accommodation-links.test.mjs`.

### V4-05 — изображения

Обновление после реализации: inventory всех 34 файлов и 69 seed-направлений, восемь дополнительных соответствий и проверка fallback завершены. Актуальные результаты и границы приёмки — в [отчёте V4-05](v4-05/README.md). Ниже сохранён первоначальный аудит.

- [destination-imagery.ts](../apps/web/src/lib/destination-imagery.ts) централизует allowlist городов с локальными WebP, alt в четырёх языках, автором, source/license. [destination-card.tsx](../apps/web/src/app/components/destination-card.tsx) задаёт размеры/sizes/lazy и fallback при отсутствии/ошибке; [article-photo.tsx](../apps/web/src/app/components/article-photo.tsx) имеет отдельную обработку фото статей и credits.
- Свежие 3 unit-теста подтверждают существующий allowlist, локальные assets, размеры/декодирование и атрибуцию. Это не полный inventory всех направлений и не сетевой browser-test. Нужно проверить unknown destinations, 404/decode failures, все места использования/viewport и визуальную пригодность fallback. Новый генератор изображений или библиотека для этой задачи не требуется.

### V4-06 — карточки

Обновление после реализации: длительность пути, перенос методики в native details, сохранность критических сведений и сравнение 24 состояний завершены. Актуальные результаты — в [отчёте V4-06](v4-06/README.md). Ниже сохранён первоначальный аудит.

- [catalog.tsx](../apps/web/src/app/components/catalog.tsx): направление, даты, цена, цена только за перелёт, freshness, FlightSchedule; [trip-details.tsx](../apps/web/src/app/components/trip-details.tsx) сворачивает факты/багаж, ScoreTrigger открывает объяснения отдельно. Нельзя считать карточки полностью отсутствующей реализацией.
- Нет предупреждений V4-02 и рейтинга V4-03; плотность/дублирование требуется проверить на текущем UI, не объявлять визуальной ошибкой по чтению JSX. Сохранить критические предупреждения снаружи disclosure и различие observed/confirmed. Переиспользовать `offer-card.spec.ts`, `h3-card.spec.ts`, price/freshness/quality specs и axe при нескольких открытых карточках.

### V4-07 — страница поездки

**Обновление 2026-11-08: DONE локально.** Четыре основные секции реализованы для предложения, общей копии и локального редактора; сохранение отделено от бюджета, старые якоря и общий draft сохранены. Актуальные проверки и история повторов — в [отчёте](v4-07/README.md) и [verification.json](v4-07/verification.json). Пункты ниже описывают первоначальный аудит.

- [deals/[slug]/page.tsx](../apps/web/src/app/deals/[slug]/page.tsx) уже объединяет полёт/CTA/жильё/активности/события/бюджет/save; [trip-navigation.tsx](../apps/web/src/app/components/trip-navigation.tsx) имеет самостоятельные якоря для большего числа блоков, включая методологию.
- Требуемые четыре группы ещё не являются текущей структурой навигации. Нужна ограниченная перегруппировка после V4-08 с сохранением якорей/истории поиска, событий и общей TripDraft state. Покрытие: `trip-navigation.spec.ts`, `plan-lifecycle.spec.ts`, `shared-trip.spec.ts`; новый прогон не выполнялся.

### V4-08 — бюджет

**Обновление 2026-11-08: DONE локально.** Начальный сценарий, независимое сравнение профилей и проверки справочников реализованы; результаты и ограничения — в [отчёте](v4-08/README.md) и [verification.json](v4-08/verification.json). Пункты ниже описывают первоначальный аудит до реализации.

- [trip-budget-calculator.tsx](../apps/web/src/app/components/trip-budget-calculator.tsx), `trip-budget.ts`, `budget-estimates.ts`, `budget-provenance.ts`, `budget-completion.ts`: ввод людей/жилья/еды/трансферов, подробный расчёт, economy/standard/comfort, editable ranges, источники и различие неизвестного/нуля/полного бюджета. Модель сохранённых планов и shared links уже переносит оценки.
- [9 свежих тестов](../apps/web/tests/budget-estimates.test.mjs) подтверждают групповые множители, приоритет точных сумм, validation/restore, неизвестные расходы и отсутствие вымышленных market estimates. Это не проверка всего калькулятора и справочных оценок.
- Не наполнять профили произвольными «средними ценами». Проверить актуальность/coverage существующих `reference-costs.ts`, простоту первого расчёта, ручные overrides, смену дат/состава, one-way и полную маркировку total/partial. Уже есть `budget-modes.spec.ts`, `budget-profiles.spec.ts`, `budget-provenance.spec.ts`, `trip-budget.spec.ts`.

### V4-09 — локализация

**Обновление 2026-11-08: DONE локально.** Исправлены имена стран и смысловые ошибки EN/RU-путеводителей, RU-навигация и UK-подсказка. Итоговые 371 Node и 22 browser PASS, совместимость и границы — в [отчёте](v4-09/README.md) и [verification.json](v4-09/verification.json). Ниже сохранён первоначальный аудит.

- Существующая система `src/lib/i18n`: config/messages/copy/registry/routing/Intl format. Свежие 6 [i18n tests](../apps/web/tests/i18n.test.mjs) проверяют словари, маршруты, форматы и сохранение PLN/дат. Валюта PLN — осознанный контракт, локализация не требует придумывать курсы валют.
- Полнота ключей не доказывает качество текста: например, английские guide translations содержат неестественные формулировки; нужен review человеком по четырём языкам. Отдельно проверить страны, динамические предупреждения и пустые/ошибочные состояния. Stay22 всегда запрашивает польский язык; конечный язык партнёра не гарантирован, что отмечено и в прежнем аудите.
- Не менять индексируемые slugs и hreflang при исправлении copy. Существуют `localized-*`, `country-flags.test.mjs`, `legal-translations.test.mjs`, `polish-locale.spec.ts`; они не запускались целиком.

### V4-10 — destinations и SEO

**Обновление 2026-11-08: DONE локально.** Все 69 seed-направлений инвентаризированы; добавлена доступная редакционная информация и изолирован сбой цен. Нормальная SEO-политика сохранена; полная sitemap, ссылки и 69 SSR-страниц проверены в двух проектах. [Отчёт](v4-10/README.md), [проверки](v4-10/verification.json). GSC и сравнение эффекта после переобхода остаются внешними follow-up. Ниже сохранён первоначальный аудит.

- Есть directory, destination guides, полезные alternatives/recovery при слабой выдаче, localized destination routes и SEO policy. Основа: `src/app/destinations`, `destination-directory.ts`, `destination-recovery.ts`, `catalog-pages.ts`, sitemap/robots и `scripts/audit-seo.mjs`.
- [SEO batch report](seo-growth-20261107/batch/README.md) фиксирует прежний production audit 248 URL и 4 локали, внутренние ссылки/metadata, сохранение намеренного noindex Rome/filtered search. Это исторические результаты, не новые измерения V4. Два открытых этапа SEO: actual GSC URL Inspection и сопоставимое сравнение после recrawl.
- Не генерировать массовые однотипные страницы и не менять indexability по отсутствию live GSC. Нужен fresh inventory содержимого, альтернатив, canonical/hreflang/sitemap/robots и доступных GSC evidence. Existing `destination-recovery.spec.ts`, `destination-landings.spec.ts`, `technical-seo.spec.ts`, `seo-journey-batch.spec.ts` переиспользовать.

### V4-11 — уведомления

**Обновление 2026-11-08: DONE локально.** Существующая подсистема проверена; исправлена повторная проверка согласия email. Полный API, 20 PG и 18 browser PASS. [Отчёт](v4-11/README.md), [готовность](v4-11/readiness.json). Реальная доставка не активирована; defaults и внешние настройки не менялись. Ниже сохранён первоначальный аудит.

- Email: `api/alerts.py`, `services/alerts.py`, `alert_matching.py`, `alert_digests.py`, `alert_mail.py`. Есть confirmation/manage/unsubscribe, consent version, matching и at-most-once SMTP attempts. Telegram: subscription/delivery services, webhook, queue и stop. Не создавать вторую подсистему.
- В [config.py](../apps/api/app/config.py) defaults выключены; отдельные flags защищают signup/digest/Telegram delivery, есть валидация их сочетаний. Production env в аудите не читался. [Release readiness](HOPTRIP_H3_RELEASE_READINESS.md) исторически отмечает персональную доставку выключенной.
- [H3-17c1](h3-17c1/README.md) описывает mock Telegram journey и 113 notification regression PASS, полный API 1255 включая 18 PG. Это прошлые прогоны, не свежая delivery-проверка.
- Локально можно продолжать `test_alert_journey.py`, `test_alert_safety.py`, `test_alert_digests.py`, `test_telegram.py` с fake sender/clock и одноразовым PG. Внешний gate: тестовое окружение доставки, credentials/настройки оператора и отдельное явное разрешение реальной активации. Никаких реальных уведомлений из аудита не отправлено.

### V4-12 — аналитика

- [schemas/analytics.py](../apps/api/app/schemas/analytics.py), `api/analytics.py`, `usage_metrics.py`, [usage_dashboard.py](../apps/api/app/services/usage_dashboard.py), web consent/session lifecycle уже покрывают SEARCH/FILTER_USE/DEAL_VIEW/PARTNER_CLICK/TRIP_SAVE/BUDGET_CALCULATED/ALERT_STARTED/ALERT_CONFIRMED, а также details/update и ordered funnel.
- Воронка ограничена порядком полученных событий, не доказывает точную search attribution/booking. Сохранение и расчёт бюджета не следует заменять событиями простого просмотра. Существуют origin/locale cohorts; H3 отмечает незавершёнными mobile/desktop-разрез и реальные сопоставимые baseline/after. Это отдельный остаток измерений, а не основание внедрять новую аналитику.
- Нужна свежая contract-проверка consent denial/withdrawal/expiry, дедупликации и payload без лишних персональных данных. Существуют `test_ordered_funnel.py`, `test_product_analytics.py`, `test_budget_calculated_analytics.py`, `consent-session-navigation.spec.ts`, `product-analytics.spec.ts`. KPI в этом запуске не собирались.

### V4-13 — mobile, accessibility, performance

**Обновление 2026-11-08: DONE локально.** Свежая responsive/a11y/lab-приёмка и before/after завершены; история отказов, повторы, external gates и точные измерения — в [отчёте](v4-13/README.md) и [verification.json](v4-13/verification.json). Ниже сохранён первоначальный аудит.

- [h3-baseline.spec.ts](../apps/web/tests/h3-baseline.spec.ts) уже использует **320, 375, 390, 768, 1440 px**, 4 локали и 10 маршрутов; Playwright/axe проверяют overflow/assets/focus/доступность. Есть mobile journey, dialogs, filters, cards и planning specs.
- [h3-lighthouse.spec.ts](../apps/web/tests/h3-lighthouse.spec.ts) работает opt-in с явным CLI и локальной production build. Имеются [ранняя матрица](h3-17a/summary.json), [CLS before/after](h3-17b2/lighthouse-comparison.json), [свежий исторический SEO lab report](seo-growth-20261107/batch/README.md). Lab score не заменяет field CWV/INP.
- Для DONE нужен свежий baseline текущего дерева и повтор затронутых journey после V4-изменений; проверить WebKit, ручной screen reader/клавиатуру, touch/физические устройства и полевые данные при их наличии. Старые отчёты прямо оставляют часть этих gates открытыми. Не объявлять их дефектами приложения без воспроизведения.

### V4-14 — usability

**Обновление 2026-11-08: DONE локально.** Подготовлен протокол реальных сессий, выполнен экспертный проход, исправлена и измерена точность подсказки сохранения; все связанные проверки пройдены по последним результатам. Реальных участников в запуске не было. [Отчёт](v4-14/README.md), [протокол](v4-14/RESEARCH_PROTOCOL.md). Ниже сохранён первоначальный аудит.

- [HOPTRIP_TEST_PLAN.md](HOPTRIP_TEST_PLAN.md) описывает 24 критических journey; существующие specs покрывают search→offer→budget→save/share. Это хорошая основа сценариев, но автоматическая регрессия не является пользовательским исследованием.
- Подготовить сценарии: найти выходные без отпуска; сравнить дешёвую неудобную и более удобную поездки; собрать бюджет на двоих с неизвестной ценой жилья; сохранить/восстановить/поделиться; понять expired offer и вернуть прежний поиск. Перед сессиями задать task success, время, ошибки, число шагов и критерий улучшения.
- Доказательств реальных сессий с участниками в изученных материалах не обнаружено. Подготовка возможна без участников; внешняя зависимость — их доступность для реального исследования. Изменения UX выполнять только по наблюдаемым проблемам; синтетические тесты не выдавать за рост конверсии.

## Зависимости и совместимость

- Backend: Python **>=3.12**, FastAPI, httpx, SQLAlchemy 2, psycopg, Alembic, Pydantic settings; [pyproject.toml](../pyproject.toml), `requirements.lock`. Web: Next **16.4.3**, React **19.0.0**, TypeScript, Node test runner; Playwright **^1.63.0**, axe **^4.13.0**, [package.json](../apps/web/package.json), `package-lock.json`. Это проверка манифестов, не свежая проверка установленного SDK/всех версий или advisory scan. Пакеты не устанавливались.
- CI уже выполняет Ruff/mypy/Alembic/pytest с PG16 и Node22 unit/lint/build: [.github/workflows/ci.yml](../.github/workflows/ci.yml). Browser/axe/Lighthouse — отдельные проверки; PASS обычного CI их не заменяет. Новая тестовая/i18n/аналитическая библиотека для найденных пробелов пока не обоснована.
- Источники: cached Travelpayouts observations и exact-ticket route enrichment, airport timezone reference, Ticketmaster, Stay22, Tiqets. Missing data должно оставаться unknown; нельзя смешивать сегменты разных билетов. REST `return_at` и GraphQL return arrival имеют разную семантику.
- Сохранить API list/`include_total` envelope, `price|departure|score|destination_time`, legacy weekend и opt-in weekend modes, PLN/money strings, saved/share версии, существующие SEO URLs. Миграции до `0021_telegram_alerts` присутствуют; новые миграции для V4 пока не обоснованы и не применялись. Не редактировать исторические оценки цен ради нового quality ranking.
- [apps/web/AGENTS.md](../apps/web/AGENTS.md) требует перед будущими web-правками читать релевантные локальные Next docs. В аудите web-код не писался.

## Рекомендуемый порядок реализации

Каждый пункт — отдельное выполнение с обновлением этой таблицы и остановкой, как требует V4-план. Стрелки здесь означают рекомендации, а не разрешение автоматически начать работу.

1. **V4-01** — следующий P0: определить полезное время/пороги и дополнить eligibility на готовом timeline. **V4-02** — затем пересадки на валидированных сегментах. Оба формируют входы для **V4-03** (отдельный score/Recommended).
2. **V4-04** — аудит и регрессия партнёрских flows до изменения CTA/UI; можно было бы выполнять независимо от формулы ranking, но сохраняем правило одной задачи за запуск.
3. **V4-12**, затем baseline-часть **V4-13** — подтвердить существующие события/consent и снять исходные UX/performance метрики до новых UI-правок. Эти измерительные задачи могут оставаться IN_PROGRESS до итогового сравнения.
4. **V4-05 → V4-06 → V4-08 → V4-07** — assets, карточки, бюджет, затем итоговое объединение detail page. Бюджет раньше V4-07, чтобы не перегруппировать интерфейс дважды. Все изменения переводить сразу в существующей системе.
5. **V4-09 → V4-10** — полный языковой review новых и старых состояний, затем content/SEO inventory с сохранением индексируемых URL. GSC gates фиксировать отдельно, локальные проверки не откладывать из-за них.
6. **V4-11** — fresh mock/PG lifecycle и подготовка staging; активацию оставить за отдельным разрешением. Локальная работа независима от V4-05–10 и при необходимости может быть поднята выше; реальные отправки не являются тестовым средством.
7. Завершить **V4-13** после изменений: полная responsive/a11y/regression матрица и before/after. **V4-14** — сценарии, участники, наблюдения и отдельные измеримые улучшения; затем итоговые измерения V4-12 при сопоставимых периодах. Подготовить сценарии V4-14 можно раньше без изменения приложения.

Критическая цепочка функциональности: **V4-01 + V4-02 → V4-03 → V4-06**. Измерительная цепочка: **V4-12 + baseline V4-13 → UI → итог V4-13/V4-14**. Внешние gates GSC, provider acceptance, delivery activation и field CWV не должны искусственно блокировать весь backlog.

## Проверки именно этого аудита

- Прочитаны V4-план, применимые web-инструкции, текущие исходники/тесты и локальные H3/SEO/partner evidence. Выполнены read-only поиски и `git status`/`git rev-parse`; существующие изменения не откатывались.
- Из `apps/web` выполнено:

```text
node --experimental-strip-types --test --test-reporter=dot tests/weekend.test.mjs tests/destination-time.test.mjs tests/flight-quality.test.mjs tests/destination-imagery.test.mjs tests/budget-estimates.test.mjs tests/i18n.test.mjs tests/static-affiliate-url.test.mjs
```

Результат: **37 PASS, exit 0** (7 + 5 + 3 + 3 + 9 + 6 + 4). Node-тесты проверяли существующую реализацию, не будущие acceptance V4. Они не обращались к live-провайдерам и не отправляли уведомления.

- **Не выполнялись:** Python/API/PG тесты, lint/typecheck/build, браузерный sweep, Lighthouse/CWV, production/GSC, реальные partner redirects/атрибуция, SMTP/Telegram delivery, пользовательские сессии. Прочитанные старые логи перечислены выше как история. Отсутствие свежего прогона не означает failure.
- Инфраструктура, базы, workers, production env и флаги не менялись; deploy/внешние сообщения не выполнялись.

**Первоначальный аудит завершился без реализации. Затем отдельными выполнениями реализованы и проверены локальные этапы V4-01–V4-14 — см. актуальные строки и отчёты выше. Следующей локальной задачи V4 нет; реальные пользовательские сессии и остальные внешние follow-up остаются отдельной работой. Остановка после одной задачи.**

## Остаток после локального завершения V4

Контроль 2026-11-08: доступность новых участников, полевых данных, кабинетов провайдеров и отдельного разрешения на rollout в этом запуске не установлена. Эти пункты не превращены в новые задачи и не считаются выполненными:

| Область | Внешнее продолжение | Готовые материалы |
|---|---|---|
| V4-14 | Реальные сессии по доступности участников; фактические время, ошибки, понимание local/share и бюджета | [Протокол](v4-14/RESEARCH_PROTOCOL.md), [пустой шаблон](v4-14/observation-template.csv) |
| V4-12/13 | Сопоставимые реальные KPI и field CWV/INP; физические устройства, WebKit и ручной screen reader | [Измерения](v4-12/MEASUREMENT.md), [границы lab-проверок](v4-13/README.md) |
| V4-10 | GSC URL Inspection и сопоставимый эффект после переобхода | [SEO-отчёт](v4-10/README.md) |
| V4-04/11 | Live partner acceptance/атрибуция; отдельно разрешённая активация уведомлений и проверка реальной доставки | [Интеграции](v4-04/README.md), [готовность уведомлений](v4-11/readiness.json) |

Свежая проверка этого контрольного запуска ограничена Node-набором. Browser/API/PG, lint/typecheck/build, production/GSC, реальные сообщения и deployment не выполнялись; прежние результаты остаются историей соответствующих задач. Наличие локальных тестов не закрывает перечисленные внешние проверки.