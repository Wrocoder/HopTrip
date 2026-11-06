# H3-04a — достоверность сохранённого сравнения цены

Дата: 2026-11-03. **H3-04a DONE.** Базовый HEAD: `d928246561da713c4dd1f2a4c7fbdafb39a305ab`.
Часть H3-04: проверка расчёта и согласованности API/UI. Общая H3-04 остаётся IN_PROGRESS: политика ранжирования и её пользовательские названия относятся к следующему отдельному запуску H3-04b.

## Воспроизведение и изменение

До исправления новый `test_comparison_contract.py` дал **9 failed / 4 passed**:

- При отсутствующем `flight_price_pln` или `historical_baseline_pln` проверка соответствия snapshot пропускалась. API возвращал CURRENT с якобы подтверждённой историей.
- Расчёт для одной цены оставался CURRENT, когда `price_per_person_pln` содержал другую цену. Frontend уже отклонял такое сравнение, API — нет.
- Отдельно сохранённый `discount_percent=99` выдавался даже при проверенном расчёте с разницей 50%, 0% или −50%.
- Массив, строка или число в JSON `score_components` вызывали ошибку валидации ответа вместо доступного предложения с нейтральным пояснением.

Исправлено:

1. `services/score_explanation.py`: modern flight-v4 snapshot требует совпадения сохранённой цены с **обоими** полями flight_price_pln и price_per_person_pln, а медианы — с historical_baseline_pln, включая NULL. JSON не-объект отклоняется. Существующая проверка формулы, суммы, частей, версии, sample_count и времени расчёта сохранена.
2. `schemas/deal.py`: повреждённый не-объект score_components нормализуется в `{}` в ответе; объяснение отдельно получает UNAVAILABLE. Данные в БД не исправляются и не удаляются.
3. `services/catalog.py`: compatibility discount_percent выводится из проверенного signed price_difference_percent: max(0.00, difference) только для CURRENT, иначе null. Сырой DB discount не считается доказательством. Это воспроизведение сохранённого расчёта, без пересчёта по текущему времени.
4. `score-copy.ts`: нейтральное пояснение PL/EN/RU/UK описывает несогласованные/неполные данные, а не объявляет любой такой расчёт «старым». Маршруты, DOM/layout, SEO и consent не менялись.

## Проверенная методика и границы

Версии остаются `flight-v4` и `route-utc-v1`, новые коэффициенты и пороги не вводятся.

- История группируется по provider, origin airport, destination, product type, месяцу/году вылета в UTC и интервалу дней между вылетами в UTC. One-way/NULL duration — отдельная группа. Это выборка направления, не одинаковые тарифы: аэропорты назначения, пересадки, багаж и авиакомпания не являются полным критерием эквивалентности.
- В статистику проходят положительные конечные `observed_price_pln`, с известным маршрутом, временем наблюдения не в будущем и неотрицательной известной длительностью. NULL PLN не участвует. Исторические просроченные наблюдения сохраняются: срок действия текущего предложения не является сроком хранения истории. Скользящего окна давности исторической выборки сейчас нет.
- Генератор использует cache только с route-utc-v1, sample_count > 0 и calculated_at <= времени генерации. CURRENT означает воспроизводимый snapshot с положительной медианой и минимум **5 наблюдениями**, а не проверенную доступность билета. Прежний порог 5 — правило продукта, не доказательство статистической репрезентативности. Максимум вклада истории достигается при 30 наблюдениях.
- Формула: price = clamp(50 + signed_difference_percent, 0, 100) × 0.6, history = min(n/30, 1) × 25, freshness — до 15 с линейным спадом за 48 часов. При недостаточной истории price = 30. Части округляются до 0.1, сумма до целого HALF_UP. Наличие provisional 45 выше current 19 воспроизводится эталоном; исправление этой политики оставлено H3-04b.
- Время расчёта воспроизводится из snapshot. Текущая доступность отдельно ограничивается существующими 6/24/48h, expires_at и departure; она не заменяется сохранённым статусом CURRENT. Source observation и first-seen не равны повторному получению данных. При несогласованном snapshot источник timestamp больше не восстанавливается из него; связанный проверенный TravelOffer остаётся отдельным источником provenance.
- `PlnOnlyConverter` в jobs/pipeline/price_refresh принимает только PLN, курс 1; другие валюты без конвертации не получают цену PLN и не участвуют в подборе/медиане. EUR approximation в интерфейсе не используется для скоринга. Лицензированный FX-источник не добавлен.
- Публичная методика `/info/price-comparison`, `/info/price-history`, `/info/price-freshness` уже описывает выборку, пороги, ограничения и timestamps. Изменённое пояснение соответствует существующему правилу «согласованный расчёт»; веса и тексты сортировки пока прежние.

Это проверка внутренней согласованности, не подтверждение качества исходного поставщика или идентичности тарифов. Поля score_components/deal_score/historical_baseline_pln остаются для совместимости; сырые поля не заменяют score_explanation при показе сравнения.

## Контракт и эталоны

Форма API v1, enum статусов и URL не меняются; миграций, dependencies и feature flags нет. Изменяется поведение только несогласованных данных и устаревшего compatibility discount. Исправление распространяется на detail, list, paged list, departure и destination endpoints через общий serializer. Цена и доступность предложения сохраняются при потере объяснения.

Общий синтетический [fixture](../../apps/api/tests/fixtures/h3-price-comparisons.json) читается API-тестом и Node-тестом priceAssessment во всех четырёх языках:

| Цена / медиана PLN | n | Статус | Балл | Разница | UI сравнение |
|---|---|---|---|---|---|
| 200 / 400 | 5 | CURRENT | 79 | 50% | Да |
| 400 / 400 | 30 | CURRENT | 70 | 0% | Да |
| 600 / 400 | 5 | CURRENT | 19 | −50% | Да |
| 200 / 400 | 4 | PROVISIONAL | 48 | null | Нейтрально |
| 200 / null | 0 | PROVISIONAL | 45 | null | Нейтрально |

Эти цифры — тестовые значения, не предложения или измеренные KPI. Существующие тесты также проверяют нулевые/отрицательные/nonfinite цены, различие cohort, будущие наблюдения, stale history, UTC-month boundary и сохранённое время расчёта. Два ранее неполных unit fixtures дополнены ценовыми полями, которые всегда устанавливает реальный генератор; старые assertions формулы сохранены.

## Проверки

- Новый тест до исправления: 9 failed / 4 passed. После исправления первоначальный целевой набор: **79 passed**, [JUnit](api-tests.xml).
- После добавления общих reference fixtures весь API: **926 passed / 18 skipped**, [JUnit](api-full.xml). Команда из корня: `.venv/Scripts/python.exe -m pytest -q -p no:cacheprovider --junitxml=docs/h3-04a/api-full.xml`. PostgreSQL tests skipped; 2 прежних deprecation warnings. Перед каждым Python-запуском SDK подтверждён через python-tools: Python 3.12.10, `.venv/Scripts/python.exe`.
- `node --experimental-strip-types --test tests/price-assessment.test.mjs` в apps/web: **11 passed**, включая shared fixture, 4 locale. Прежний MODULE_TYPELESS_PACKAGE_JSON warning.
- Ruff изменённых Python-файлов — pass; `mypy apps/api/app --cache-dir .cache/h3-04a-mypy` — **113 source files, no issues**. ESLint изменённых web-файлов — pass.
- Изолированный `npm run build` — **exit 0**, TypeScript и 61 static page прошли. IDE build success с limited diagnostics, не замена реальным проверкам выше.
- Browser: `npm run test:e2e -- price-labels.spec.ts sorting.spec.ts --reporter=json` — **16 passed**, [JSON](browser.json). Chrome desktop/mobile × PL/EN/RU/UK: card/detail, CURRENT/PROVISIONAL/LEGACY/UNAVAILABLE, раскрытие расчёта, keyboard/focus, axe dialog/filter panel, ширина 320 px; сортировка, pagination, reload/back/forward и неподдерживаемое значение. Это regression существующих сценариев, не новый алгоритм сортировки. Next start сообщил прежнее предупреждение об output:standalone; Docker runtime не проверялся.

Изоляция browser/build: `docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-h3-04a-20261103`, копия в .cache, fixture SQLite, порты 3125/8125. HOPTRIP_API_URL и NEXT_PUBLIC_API_URL — http://127.0.0.1:8125, NEXT_PUBLIC_SITE_URL — http://127.0.0.1:3125, HOPTRIP_OPERATOR_FILE — tests/fixtures/operator.json из копии. Только в копии Playwright запускает `npm run start` вместо dev после production build. `HOPTRIP_TEST_PYTHON` — подтверждённый SDK, `PLAYWRIGHT_CHANNEL=chrome`; JSON отчёт пишется в docs/h3-04a/browser.json.

Production данные, внешние цены, подписки и партнёрские транзакции не использовались; deployment/PR/commit не создавались. Полный browser suite и field CWV не проверяются этой частью.

## Откат и следующий шаг

Откат — вернуть изменения трёх API-файлов и score-copy.ts, затем соответствующие тесты/fixture и документацию. Изменений БД нет; автоматическая регенерация данных не запускалась. Риск совместимости: ранее неполные flight-v4 записи теперь получают UNAVAILABLE и null discount до штатного корректного пересчёта. Не восстанавливать недостающие данные догадками.

Следующий отдельный запуск **H3-04b**: выбрать явную политику сравнимых предложений и fallback, сохранить старые sort URLs, синхронизировать label/методику, проверить все catalog endpoints, ties/pagination и зафиксировать эффект на эталонном порядке. Полный H3-04 пока не DONE.
