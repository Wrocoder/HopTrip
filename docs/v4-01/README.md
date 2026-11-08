# V4-01 — пригодность коротких поездок и выходных

Дата: 2026-11-07. **V4-01 DONE локально.** [Краткие результаты проверок](verification.json). Публикация не выполнялась.

## Изменение поведения

Прежний календарный weekend-фильтр мог рекомендовать слишком короткое пребывание, ночной прилёт или поездку с отпуском/возвращением в понедельник. Добавлена отдельная оценка `weekend_assessment.stay` (`weekend-stay-v1`), не меняющая смысл `calendar-v1`, `flexible-v1`, `no-leave-v1` и legacy `weekend=true`.

Оценка использует подтверждённый itinerary того же билета, фактические прилёт в пункт назначения, обратный вылет и прилёт домой. Интервалы считаются через UTC; дневное окно определяется по часовому поясу аэропорта назначения. Неизвестные часы/зоны, неподтверждённый источник, некорректная хронология, расчётный прилёт, разные/неизвестные аэропорты пребывания дают UNKNOWN. При известном локальном времени ночной прилёт/ранний возврат отмечаются и для расчётного расписания, но оно не становится подтверждённым.

## Начальная продуктовая политика

Это **допущения отбора**, не сведения провайдера о трансферах, доступности достопримечательностей или фактическом времени в городе.

| Правило | Default |
|---|---|
| Минимум прилёт → обратный вылет | 1440 минут / 24 часа, включительно |
| Минимум модельного дневного времени | 720 минут / 12 часов, включительно |
| Резерв после прилёта / до вылета | По 120 минут |
| Дневное окно | 08:00–22:00, местное время назначения |
| Ночной прилёт | 00:00 включительно — 06:00 не включительно |
| Ранний обратный вылет | До 08:00, не включительно |
| Граница модели | До 7 календарных дней пребывания; более длинные поездки не сертифицируются |

Модельное время — сумма пересечений дневных окон с интервалом после вычитания резервов. Сон исключается; реальный транспорт, очереди и доступность города не известны. `destination_time.usable_city_minutes` остаётся неизвестным: новая модель не выдаётся за подтверждённое время прогулок.

Оба минимальных порога и оба резерва настраиваются через `Settings.weekend_stay_policy`. Переменная окружения принимает JSON:

```text
WEEKEND_STAY_POLICY={"min_airport_minutes":1440,"min_usable_minutes":900,"arrival_buffer_minutes":120,"departure_buffer_minutes":120}
```

Можно задавать поля частично. Минимумы ограничены 0–10080 минутами, резервы 0–1440; отрицательные значения отвергаются. Применённая политика возвращается в API. Serializer и batch weekend scan используют одну конфигурацию. Production env не редактировался.

## Отбор и интерфейс

- Все три подборки главной и отдельная секция коротких поездок требуют `stay.eligibility=ELIGIBLE` в дополнение к прежним quality/route/price/expiry/nights guards. Старые API-ответы без новой оценки не дают подтверждённой рекомендации.
- Weekend-подборка дополнительно требует `calendar=ELIGIBLE` и `no_leave=ELIGIBLE`: известное возвращение в исходный аэропорт до конца воскресенья, без пересечения рабочих часов пн.–пт. 09:00–17:00 в зоне вылета. Это не гарантия отсутствия отпуска с учётом дороги. Остальные подборки не обещают поездку без отпуска; прежнее предупреждение остаётся.
- Неподходящие оферты сохраняются в общем поиске и detail pages. Ночные/ранние/слишком короткие поездки имеют видимые предупреждения вне свёрнутых деталей, на PL/EN/RU/UK. Текст раскрывает модель и условные резервы.
- Сохранены query-параметры, SEO URLs, формы ответов/pagination, сортировки, история цены, budget/save/share и партнёрские переходы. Вложенное поле additive и необязательное для старых payloads; присутствующие некорректные поля отвергаются web-контрактом.
- Подборки по-прежнему проверяют первые 100 кандидатов и показывают до трёх результатов; это не полный подсчёт пригодных поездок. При недостатке данных подборки могут стать меньше/пустыми; остаётся переход к полной выдаче.

## Файлы этого изменения

Backend:

- `apps/api/app/schemas/weekend.py` — policy и additive stay assessment.
- `apps/api/app/services/weekend.py` — UTC/daytime calculation и причины пригодности.
- `apps/api/app/config.py` — конфигурация policy.
- `apps/api/app/services/catalog.py`, `weekend_catalog.py` — общая policy для detail/list/batch.

Web:

- `apps/web/src/lib/weekend-stay.ts` — тип, guard и четыре языка предупреждений.
- `apps/web/src/lib/api.ts`, `api-contract.ts` — additive contract.
- `apps/web/src/lib/home-collections.ts`, `short-trip-selection.ts` — guard обеих секций главной.
- `apps/web/src/app/components/flight-schedule.tsx` — предупреждения на card/detail.
- `apps/web/src/lib/i18n/collection-copy.ts` — критерии подборок на четырёх языках.

Тесты:

- Новые `apps/api/tests/test_weekend_recommendations.py`, `apps/web/tests/weekend-stay.test.mjs`, `weekend-recommendations.spec.ts`.
- Дополнены web `home-collections.test.mjs`, `origin-selection.test.mjs`, `api-response.test.mjs`, `home-collection-visual.spec.ts`, `home-hierarchy.spec.ts`, `short-trips.spec.ts` (актуальная подпись известных ночей на месте).
- `apps/api/tests/weekend_browser_fixtures.py`, `e2e_app.py` — opt-in night/early/short; synthetic short trips получили explicit same-ticket segments вместо REST-estimated arrivals. Сценарий «одна рекомендация» выбирает подходящий результат до усечения.
- Документы: этот отчёт и `docs/HOPTRIP_V4_PROGRESS.md`. Пользовательские правки сохранены; локальные снимки существующих затронутых файлов находятся в `.cache/v4-01-before`.

## Проверки

| Проверка | Результат |
|---|---|
| Новый backend regression до реализации | 20 failures: отсутствовали stay assessment/policy |
| Новые unit/API integration | 22 кейса; final targeted набор вместе с legacy/batch/fixture lifecycle — 76 PASS |
| Полный API | 1258 PASS, 18 PostgreSQL SKIP, две существующие deprecation warnings; после добавленного boundary case и явного Field(default=...) — targeted 76 PASS |
| Полный Node | 343 PASS, exit 0 |
| Ruff | PASS, весь apps/api |
| mypy | PASS, 122 source files; positional Field defaults исправлены на явные default= |
| ESLint | PASS |
| Production build/TypeScript | PASS, 61 static entries; повтор после окончательного short-trip guard |
| Первый browser regression | 52 PASS / 2 FAIL из 54: fixture «одно предложение» обрезал calendar results до оферты, требующей отпуска. Подготовка fixture исправлена, проверки пригодности не ослаблены |
| Повторная browser-регрессия | 58 PASS / 2 FAIL из 60: исправленный fixture прошёл; оба failure — устаревшее ожидание подписи «2 noce» вместо текущего «Noce na miejscu: 2» в short-trips.spec.ts |
| Финальный targeted browser | 2/2 PASS после приведения ожидания подписи известных ночей к текущему интерфейсу; проверки количества/исключения длинных поездок сохранены |
| Итог по последним результатам | **80 уникальных browser cases PASS**: 20 legacy weekend/catalog contract из первого прогона + 60 из второго с заменой двух устаревших результатов финальным 2/2. Это не единый clean-run полного inventory |

Backend-проверки защищают DST весной/осенью, UTC→local date/clock, minimum thresholds и границы 06:00/08:00, buffered daytime против airport interval, unknown/estimated данные, airport changes, хронологию, policy через env и согласованность list/detail/batch. Integration подтверждает сохранение неудобных оферт в поиске.

Первый browser-run также проверил прежние режимы/рабочие часы/URL history/legacy landing в четырёх языках. Новый UI-test проверяет видимость предупреждений без раскрытия деталей, 320px overflow и axe в четырёх языках; loader-test использует реальный локальный API. Повтор прошёл для домашней иерархии/коллекций, origin/session history, no-JS ссылок, expiry и photo fallback. Последний test-only diff дополнительно прошёл targeted ESLint. Сгенерированный Next файл `next-env.d.ts` восстановлен точно к состоянию перед задачей. Локальные fixture-серверы завершены.

Не запускались PostgreSQL, полный browser inventory, WebKit, Lighthouse/field CWV, live providers/SMTP/Telegram. Новых persistence/concurrency операций нет; миграции не нужны. Production, доставка уведомлений и платные интеграции не менялись.

Воспроизведение из корня репозитория (web-команды — из `apps/web`):

```text
.venv/Scripts/python.exe -m pytest -q --tb=short -p no:cacheprovider
.venv/Scripts/python.exe -m pytest apps/api/tests/test_weekend_recommendations.py apps/api/tests/test_weekend_assessment.py apps/api/tests/test_weekend_catalog.py apps/api/tests/test_e2e_fixture_lifecycle.py -q -p no:cacheprovider
.venv/Scripts/python.exe -m ruff check apps/api
.venv/Scripts/python.exe -m mypy
node --experimental-strip-types --test --test-reporter=dot tests/*.test.mjs
npm run lint
npm run build
```

Browser: существующий `playwright.config.ts`, локальные fixture API/Next, переменная `HOPTRIP_TEST_PYTHON` указывает на предварительно проверенный SDK `.venv/Scripts/python.exe`; `PLAYWRIGHT_CHANNEL=chrome`. Выборка 1: `weekend-recommendations.spec.ts weekend.spec.ts home-collection-contract.spec.ts home-collection-visual.spec.ts`. Выборка 2: `home-collection-visual.spec.ts home-hierarchy.spec.ts origin-selection.spec.ts short-trips.spec.ts weekend-recommendations.spec.ts`. Финальный повтор: `short-trips.spec.ts --grep 'six short trips'`. Сеть партнёров и реальные сообщения не используются. Полные JSON второго/финального прогонов — локальные `.cache/v4-01-browser-final.json` и `.cache/v4-01-browser-short-final.json`; краткий итог сохранён в verification.json рядом с отчётом.

## Откат и следующий шаг

Оценка рассчитывается при чтении и не хранится в БД. Откат: вернуть только перечисленные runtime/test-файлы к состоянию перед V4-01, сохранив прежние пользовательские изменения; БД откатывать не нужно. Старые клиенты игнорируют additive поле, старые серверы остаются читаемыми новым web, но не дают endorsement в рекомендациях.

После приёмки следующая отдельная задача — **V4-02, проблемные пересадки**. В этом запуске она не реализуется.
