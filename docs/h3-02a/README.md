# H3-02a — вычисляемая хронология поездки

Дата: 2026-11-03. **H3-02a DONE.** Часть H3-02: API-контракт до подключения отображения. Полная H3-02 остаётся IN_PROGRESS.

## Что найдено и сделано

FlightFacts уже содержит независимые outbound/return timestamps, аэропорты, IANA zones, проверенные сегменты и флаги расчётного прилёта. UI уже показывает +1 день и фактический аэропорт возвращения. При этом Deal.nights — разность локальных дат вылетов, а не ночей после прилёта в пункт назначения. Эти понятия нельзя незаметно подменять в существующих filters/saved/affiliate контрактах.

Добавлен `flight_facts.timeline` с `version=trip-timeline-v1` через общий serializer FlightFacts. Объект вычисляется при чтении, без миграций и backfill. Его поля:

| Поле | Семантика |
|---|---|
| local_outbound_departure_date | Дата вылета в зоне первого аэропорта |
| local_destination_arrival_date | Дата прилёта в зоне последнего аэропорта outbound |
| local_return_departure_date | Дата вылета из фактического return-origin |
| local_return_arrival_date | Дата прилёта в фактический return-destination; это может быть другой аэропорт, не исходный |
| nights_at_destination | Число локальных календарных полуночей между прилётом и обратным вылетом, не число оплаченных ночёвок |
| nights_estimated | True, только когда вычислено число ночей и outbound arrival расчётный |
| return_arrival_estimated | True, только когда известна local return arrival date и прилёт расчётный |
| return_arrival_day_offset | Signed разность локальных дат обратного прилёта и вылета; может быть −1 при линии перемены дат |
| outbound_elapsed_minutes / return_elapsed_minutes | Реальный UTC-интервал соответствующего направления, включая пересадки, если конечные timestamps известны |
| journey_elapsed_minutes | Интервал от первого вылета до конечного обратного прилёта, включая пребывание; только при известных непротиворечивых трёх интервалах |

Для локальной даты обязательны offset-aware timestamp и известная IANA zone. Неизвестная зона/naive timestamp → null, без подстановки UTC или даты рекламного заголовка. Elapsed интервалы вычисляются в UTC, округляются вниз до полной минуты; календарные ночи — разностью дат, поэтому DST не превращает ночь в 23/25-часовое деление. Для ночей зоны destination и return-origin должны совпадать; при разных зонах единого календаря пребывания нет, возвращается null. Разные аэропорты с одной зоной допустимы. Zero nights означает известный same-day интервал; null означает неизвестный/противоречивый.

Используются существующие validated_segments. При наличии сегментов outbound zones теперь берутся с первого/последнего проверенного сегмента, согласованно с timestamps. Для direct flight прежняя duration-based оценка сохраняется с флагами estimated; пересадочный REST duration без ground layover не используется для вычисления прилёта. Для elapsed полей источник оценки определяется родительскими outbound_arrival_calculated/return_arrival_calculated, а не трактуется как фактически выполненный рейс.

Пример теста: вылет 03.05 23:30, прилёт 04.05 01:30, обратный вылет 05.05 23:30, прилёт 06.05 01:30. Ночей на месте **1**, обратный day offset **+1**, каждое направление **120 минут**, вся поездка **3000 минут**. Это синтетический пример, не предложение.

## Совместимость и границы

Deal.trip_start/trip_end/nights и destination_interval_minutes не меняют смысла. Сохранённые v1 планы, URL, budget/Stay22 даты, alerts, сортировка, consent и зависимости не меняются. Frontend пока игнорирует новый additive объект; тексты/локализация будут подключены в H3-02b. Несуществующая/неподдерживаемая информация отдаётся как объект v1 с null-полями, не как нули. API enum/response envelope прежние.

H3-02b должна подключить единое отображение card/detail/saved, различать advertised departure dates и timeline, локализовать PL/EN/RU/UK, проверить fallback старого API и уведомления без отправок. Не заменять старые snapshot поля и фильтры ночей автоматически. H3-01 начинается после полного H3-02.

## Проверки

- Целевой набор test_trip_timeline/test_flight_facts/test_return_routes: **72 passed**, [JUnit](api-targeted.xml). Новые сценарии: overnight outbound, Monday arrival, March/October DST, unknown zones, naive/negative/missing интервал, same-day, one-way, date line, разные return airports, validated segments, estimated direct arrival. HTTP public contract содержит version/null fallback. Существующие проверки сегментов, включая неполные/некорректные маршруты, переиспользованы.
- Полный API: **944 passed /18 skipped**, [JUnit](api-full.xml). PostgreSQL не проверен; 2 прежних deprecation warnings.
- Node flight-facts/stay-context: **18 passed**; прежний MODULE_TYPELESS_PACKAGE_JSON warning.
- Ruff — pass. Mypy — **114 source files, no issues**. IDE build success с limited diagnostics. Frontend production build не повторялся: web-код в этой части не изменён.
- Browser local-flight-time.spec.ts: **2 passed**, [JSON](browser.json); desktop/mobile, midnight return, estimated label, бюджет и share/stale-plan fallback. Это regression существующего UI, не подключение нового timeline. Изолированный dev runtime `.cache/aud05-h3-02a-20261103`, через prepare-e2e.ps1, 3125/8125, fixture SQLite, Chrome desktop/mobile, HOPTRIP_TEST_PYTHON — SDK Python 3.12.10 из .venv, подтверждённый python-tools.

Команды API из корня: `.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider --junitxml=docs/h3-02a/api-full.xml`; `-m mypy apps/api/app --cache-dir .cache/h3-02a-mypy`; Ruff изменённых Python-файлов. Browser: `npm run test:e2e -- local-flight-time.spec.ts --reporter=json`, JSON в docs/h3-02a/browser.json. Node из apps/web: `node --experimental-strip-types --test tests/flight-facts.test.mjs tests/stay-context.test.mjs`.

## Откат

Удалить только TripTimeline/timeline из schema, новый trip_timeline.py и вызов/импорт из flight_facts.py, вернуть delta outbound zones, соответствующие tests/docs. Сохранить изменения H3-04a/b в schemas/deal.py. Данные БД не менялись. Production, партнёрские переходы, рассылки, deployment/PR/commit не выполнялись. Полный H3-02 ещё не DONE.
