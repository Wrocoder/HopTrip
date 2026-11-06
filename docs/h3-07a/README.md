# H3-07a — контракт времени между прилётом и обратным вылетом

Дата: 2026-11-03. **H3-07a DONE; H3-07 IN_PROGRESS.** По §1.2 V3 задача сложности L разделена: эта часть вводит серверный контракт достоверности; следующий отдельный запуск H3-07b подключает сортировку и компактное отображение. До H3-07b сортировка и UI прежние.

## Основание и объём

В `flight_facts.py` уже вычислялся `destination_interval_minutes`, а проверенные сегменты задавали конечный outbound arrival и первый return departure. Не требовалась вторая модель маршрута. Однако голое число не задаёт quality gate, признак расчётного прилёта и явное отсутствие оценки времени в городе. Это статически подтверждённый пробел контракта, а не воспроизведённая ошибка текущей сортировки: сортировки по времени ещё нет.

Добавлен `DealRead.destination_time` версии `destination-time-v1` на основе существующих FlightFacts, классификатора flight quality и общей UTC-функции `trip_timeline.elapsed`. Объект вычисляется общим serializer для list/detail, не хранится в БД. Legacy `flight_facts.destination_interval_minutes` сохранён; его арифметика переиспользует ту же функцию elapsed. Для надёжной будущей сортировки нужно использовать новый объект, а не legacy число.

## API-контракт

| Поле | Семантика |
|---|---|
| version / scope | `destination-time-v1` / `AIRPORT_ARRIVAL_TO_RETURN_DEPARTURE` |
| status | `KNOWN`: валидный маршрут/аэропорты/времена/зоны и нерасчётный outbound arrival; `ESTIMATED`: прилёт вычислен по длительности; `UNKNOWN`: недостаточные или противоречивые сведения |
| airport_interval_minutes | Полные неотрицательные минуты между конечным outbound arrival и первым return departure; UTC elapsed, не разность календарных дат. При UNKNOWN — null |
| arrival_airport / departure_airport / airport_change | Известные конечные аэропорты интервала и явная смена аэропорта. При UNKNOWN — null |
| reason | Для UNKNOWN: UNVERIFIED_ITINERARY, MISSING_AIRPORTS, MISSING_OR_INVALID_TIMES или UNKNOWN_TIMEZONE |
| sort_eligible | Вычисляемый признак достоверного **аэропортового интервала**: KNOWN + минуты + endpoints. Не обещает удобство, отсутствие отпуска или время в городе |
| usable_city_minutes / city_time_status | В v1 строго null / UNKNOWN: подтверждённых transfer estimates и допущений для такого расчёта нет |
| buffers_applied | В v1 строго false: аэропортовые/багажные/трансферные буферы не вычитаются |

Перед расчётом применяется существующий `flight_quality.recommendation_eligible`: критическая несовместимость source/deal или metadata не позволяет публиковать достоверный интервал. Это проверка пригодности данных, не подтверждение живого тарифа. Затем требуются IATA endpoints, offset-aware timestamps, непротиворечивый outbound departure → arrival → return departure и известные IANA zones обоих концов. Смена аэропорта сама по себе не делает elapsed неизвестным; она явно обозначена и не превращается в придуманную длительность трансфера.

Известный нулевой интервал остаётся 0 и может быть eligible как измерение; это не рекомендация поездки. Отсутствующий/отрицательный интервал — null, не 0. Расчётный прилёт даёт ESTIMATED с числом, но sort_eligible=false. Оценка конечного прилёта домой не влияет на достоверность интервала в пункте назначения. KNOWN означает сведения проверенного расписания, а не факт выполнения рейса.

Синтетические примеры: прилёт 04.05 в 01:30 и обратный вылет в 21:30 в одной зоне дают 1200 минут и 0 календарных ночей. Маршрут с суточной пересадкой WRO→FRA→STN прибывает 02.11 в 16:00Z, обратный вылет LTN — 04.11 в 22:30Z: интервал 3270 минут; сама пересадка и дорога домой не прибавляются. В обоих случаях city time неизвестно. Это тестовые значения, не предложения.

## Совместимость и следующий шаг

Изменение API additive: прежние response envelope, даты/ночи/таймлайн, фильтры и default price sort сохранены. Старый frontend игнорирует дополнительное поле. Сохранённые планы v1, share/SEO/affiliate URLs, бюджеты, consent, отправки и зависимости не менялись. Миграции, feature flag и внешние данные не требуются. Новых пользовательских строк в этой части нет.

H3-07b должна добавить optional sort с детерминированным fallback: UNKNOWN/ESTIMATED никогда не превосходят известное время за счёт null/ошибочных дат. Политику сортировки до pagination/total необходимо проверить на реальном query engine, включая cap существующих exact weekend modes; нельзя сортировать только текущую страницу. Отображение PL/EN/RU/UK должно точно называть аэропортовый интервал и раскрывать unknown city time/airport change, не подменять nights/transit/no-leave. H3-08 отдельно отвечает за sourced transfer metadata; текущая v1 не разрешает придумывать city time.

## Проверки

- Новые 24 сценария `test_destination_time.py`: 20h/midnight, spring/fall DST, same-day/zero/subminute, missing/naive/reversed timestamps, unknown zones/IATA, estimated arrival, независимый home arrival, quality gate, airport switch, запрет unsupported city values/buffers, настоящий путь generate → list/detail с длительной пересадкой, отсутствие flight metadata. Целевой набор с flight_facts/trip_timeline: **65 passed**, [JUnit](targeted.xml), [лог](targeted.txt).
- Полный API: **1043 passed /18 skipped**, [JUnit](api.xml), [лог](api.txt). PostgreSQL не проверен; сохранены 2 deprecation warnings Starlette/httpx и anyio BlockingPortal.
- Frontend unit: **241 passed**, [лог](node.txt), включая контракты и старый fallback; прежнее предупреждение MODULE_TYPELESS_PACKAGE_JSON.
- Ruff всего apps/api: pass, [лог](ruff.txt). Mypy apps/api/app: **120 source files, no issues**, [лог](mypy.txt). IDE build success с limited diagnostics. Production frontend build/ESLint не повторялись: web runtime в этой части не изменён; dev compilation проверена браузером.
- Browser `local-flight-time.spec.ts`: **2 passed**, Chrome desktop/mobile, [JSON](browser.json), [лог](browser.txt). Проверены midnight +day, estimated label, ручной бюджет и совместимость share/stale-plan. Изолированная копия `.cache/aud05-h3-07a-20261103`, prepare-e2e.ps1, 3125/8125, fixture SQLite и PyCharm SDK Python 3.12.10. Это regression текущего UI, не проверка будущего отображения destination_time. WebKit, полный browser sweep, CWV и production не проверялись.

Команды из корня после python-tools SDK preflight: `.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider apps/api/tests --junitxml=docs/h3-07a/api.xml`; `-m ruff check --no-cache apps/api`; `-m mypy apps/api/app --cache-dir .cache/h3-07a-mypy`. Node в apps/web: `npm run test:unit`. Browser в изолированной копии: `npm run test:e2e -- local-flight-time.spec.ts --reporter=json`, с HOPTRIP_TEST_PYTHON из SDK, PLAYWRIGHT_CHANNEL=chrome и PLAYWRIGHT_JSON_OUTPUT_NAME в docs/h3-07a.

## Откат

Удалить только destination_time schema/service, поле/импорт в DealRead, вызов/импорт в catalog serializer и новые тесты; вернуть только замену legacy interval на elapsed в flight_facts.py. Сохранить trip_timeline и все предыдущие H3-изменения в общих файлах. БД не менялась, backfill не нужен. Общий checkout содержит накопленные незакоммиченные изменения; сброс файлов целиком неприемлем. PR/commit/deploy, реальные партнёрские переходы и отправки не выполнялись. Следующий отдельный запуск — **H3-07b**, здесь остановка.
