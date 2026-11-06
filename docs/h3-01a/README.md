# H3-01a — серверная оценка weekend-v1, 2026-11-03

Часть H3-01: **DONE** после приведённых проверок. Общая H3-01 остаётся **IN_PROGRESS** до подключения режимов к фильтрации, URL и интерфейсу в H3-01b. Коммит/deploy не выполнялись.

## Аудит и границы

Существующий `/api/v1/deals?weekend=true` выбирает пятницу/субботу → то же воскресенье по Deal.trip_start/trip_end и наличию обратного рейса. Он не проверяет часы и фактический прилёт. Presets/chips/reset уже существуют в web; alert matching имеет прежний календарный контракт. Менять boolean молча нельзя. H3-02 уже предоставляет валидированные времена, зоны аэропортов и отдельный timeline.

В этом запуске введены чистые серверные правила и additive поле `DealRead.weekend_assessment` для всех существующих catalog serializers. Запросы, сортировка, пагинация и legacy weekend не меняются. Новые параметры ещё не принимаются как режим фильтра. H3-01b должна подключить этот predicate **до** offset/limit и вычисления total, а не фильтровать готовую страницу в браузере. Потребуется отдельное решение по эффективному SQL/производительности без N+1 полного каталога.

## Контракт и продуктовые допущения

`weekend-v1` возвращает calendar/flexible/no_leave со значениями ELIGIBLE, INELIGIBLE, UNKNOWN; actual_return_local_date, airport_arrival_day_offset, confidence KNOWN/ESTIMATED/UNKNOWN, might_require_leave bool|null, work_hours, work_timezone и machine-readable reasons. Unknown не равен false/доказанному удобству. Дата относится к фактическому аэропорту обратного прилёта, offset — к локальной дате обратного вылета, а не к ночам пребывания. Новая схема не требует миграции БД.

| Режим | Строгое правило v1 |
|---|---|
| calendar | Вылет пятница/суббота, обратный вылет в воскресенье, разница локальных дат 1–2 дня |
| flexible | Вылет четверг/пятница/суббота, обратный вылет воскресенье/понедельник, разница 1–4 дня; другой weekend не подходит |
| no_leave | Calendar + подтверждённая полная хронология + тот же аэропорт возвращения + фактический прилёт в то же воскресенье + отсутствие пересечения интервала поездки с рабочими часами |

Рабочие дни — понедельник–пятница, 09:00–17:00, зона исходного аэропорта. `WorkHours` принимает иной возрастающий дневной интервал без timezone; ночные/равные часы отклоняются. Настройка пока доступна серверной функции, UI/HTTP-параметры — следующий этап. Учет праздничных дней/индивидуального графика не заявляется.

Пересечение интервала от исходного вылета до возвращения с рабочими часами даёт might_require_leave=true. При известных временах и отсутствии пересечения false относится только к этому допущению. Например, понедельник 01:00 может не пересекать рабочие часы, но всё равно **INELIGIBLE** для консервативного no_leave v1, требующего воскресного прилёта. Точная граница 17:00 пятницы допускается, поскольку дорога до аэропорта неизвестна; будущая UI-подпись обязана раскрывать ограничение.

Calculated arrivals не подтверждают no_leave (UNKNOWN, если прочие условия подходят). Неизвестная зона/время, повреждённый порядок сегментов, неизвестный или другой конечный аэропорт также не подтверждают этот режим. CRITICAL_INCOMPLETE/source/context quality gate не допускает сертификации ни одного режима. Интервалы проверяются в UTC, даты/рабочие часы — в правильной IANA zone. Scan пересечений ограничен семью днями; это не фильтрация произвольных длительных поездок.

`airport_times_only=true` и reason COMMUTE_AND_BORDER_TIME_UNKNOWN явно ограничивают вывод: дом/работа пользователя, дорога, регистрация, багаж, паспортный контроль неизвестны. Совпадение IATA не доказывает близость к дому. No-leave не является гарантией путешествия без отпуска.

Web принимает additive response как прежде и пока не показывает новые коды. Пользовательских строк на английском не добавлено; PL/EN/RU/UK имена, пояснения, chips и доступные состояния обязательны в H3-01b. Saved/share v1, SEO URLs, аналитика, consent, рассылки и dependencies сохранены.

## Проверки и evidence

SDK: PyCharm Python 3.12.10, `.venv/Scripts/python.exe`, pip; dependencies не менялись.

| Проверка | Результат |
|---|---|
| `-m pytest -q -p no:cacheprovider apps/api/tests/test_weekend_assessment.py apps/api/tests/test_trip_filters.py` | **44 passed**, [вывод](targeted.txt), [JUnit](targeted.xml) |
| `-m pytest -q -p no:cacheprovider --junitxml=docs/h3-01a/api.xml` | **976 passed /18 skipped**, 48.34s; [вывод](api.txt), [JUnit](api.xml) |
| `-m ruff check apps/api --no-cache` | PASS, [вывод](ruff.txt) |
| `-m mypy apps/api/app --cache-dir .cache/h3-01a-mypy` | PASS, 117 source files, [вывод](mypy.txt) |
| `npm run test:unit` | **226 passed**, [вывод](node.txt); additive API compatibility |
| `npm run test:e2e -- local-flight-time.spec.ts --reporter=json` | **2 passed**, desktop/mobile Chrome, [JSON](browser.json), [вывод](browser.txt); isolated dev copy `.cache/aud05-h3-01a-20261103`, loopback 3125/8125 |
| IDE build_project изменённых Python файлов | isSuccess=true, limited build diagnostics |

Проверены пятница утром/вечером и точная граница работы, суббота, воскресный прилёт, воскресный вылет/понедельничный прилёт, понедельник до/после работы, flexible Thursday/Monday, другой weekend, оба DST перехода, UTC пятница/локальная суббота, неизвестные/naive/неправильно упорядоченные времена, estimated, другой аэропорт, quality gate, настройка часов, API detail/list/total и старый weekend с пагинацией. Browser regression подтверждает видимость ночного прилёта +1 и сохранение ручного бюджета после sharing/reload; для expired snapshot действует прежний fallback.

Ограничения: 18 PostgreSQL cases skipped; два прежних Starlette/httpx и anyio deprecation warnings. Реальные данные/рассылки/партнёры и KPI не проверялись. Web runtime не менялся; новая production-сборка web не требовалась. Браузерный regression не доказывает готовность будущего UI режимов.

## Файлы и rollback

Новые `apps/api/app/schemas/weekend.py`, `services/weekend.py`, `tests/test_weekend_assessment.py`; additive поле в schemas/deal.py и вызов после quality assessment в services/catalog.py; H3 docs. Для rollback удалить только эти файлы/поле/импорт/вызов и запись о части. Сохранить H3-02 timeline, H3-04 проверки и предыдущие изменения в тех же файлах. Общий reset запрещён: checkout содержит пользовательские изменения и прошлые задачи. Feature flag/DB rollback не требуется.

## Следующее выполнение

Только **H3-01b**: API filter modes/version/work-hours, эффективная и точная пагинация, web query/пресеты/активные chips/reset/back/reload, landing pages и PL/EN/RU/UK. Явно сохранить старый boolean default, не переопределять вручную заданные фильтры пресетом; проверить Friday AM/PM, Sunday/Monday и unknown в браузере. H3-03 в этот запуск не начинается.
