# H3-18b9 — когортный разрез по языку страницы

**DONE локально; H3-18 IN_PROGRESS.** Одна часть H3-18, 2026-11-06. [Определение](definition.json), [taxonomy v5](taxonomy.json), [точная правка](runtime-delta.patch), [verification](verification.json). Новых названий событий нет: прежние17wire events сохранены. Реальные KPI/production coverage не измерялись.

## Основание и изменение

Ранее web не отправлял язык, API отбрасывал такой metadata context, а usage/dashboard не содержали locale cohorts. Before test воспроизвёл отсутствие блока: [1failed](api-before.txt). Другие H3-функции не создавались повторно.

Web добавляет **metadata.locale** из существующего pathLocale(location.pathname) после прежних consent checks. Допустимы только `pl/en/ru/uk`. Это язык разрешённого маршрута страницы, не navigator.language/Accept-Language, IP, национальность, предпочтение человека или язык отдельного действия. Query/hash/полный URL не добавляются. Server сохраняет точные строки из bounded allowlist; неверные типы/коды отбрасывает без ошибки события и без угадывания регистра/префикса. Старые клиенты без поля допустимы.

Protected usage API добавляет optional **locale_cohorts**, версия **first-received-locale-cohorts-v1**. Каждая прежняя observed product session в `[start,end)` попадает ровно в одну строку по metadata.locale её **первого полученного продуктового события** (server created_at, затем DB id). PAGE_VIEW не требуется. First missing/invalid/unsupported остаётся unknown; позднее валидное поле не дополняет историю. Поздняя смена языка не переносит/не делит сессию. Это первый наблюдаемый язык внутри выбранного окна, не обязательно начало browser session.

Доля строки = cohort sessions / all observed sessions. Три прежних engagement numerator — distinct cohort sessions с DEAL_DETAILS_OPEN/BUDGET_CALCULATED/TRIP_UPDATE **во всём окне**; denominator — sessions когорты. Повторы считаются один раз. Суммы session counts и соответствующих engagement numerators совпадают с global. Это описательный разрез, не locale-specific ordered funnel, атрибуция поиска/клика/плана, returning visitor или causal uplift. Действие после смены языка остаётся в первоначальной когорте; нельзя объявлять его выполненным на её языке.

Synthetic fixture:10events/5sessions, EN/PL/RU/UK/unknown по1session и20%. EN: disclosure1/completion1/update0, несмотря на поздние RU/UK events; PL:0/0/1; RU:0/0/0; UK:0/0/1 без PAGE_VIEW; legacy unknown:0/0/1, хотя поздний Update содержитPL. [JSON](usage-populated.json). Это тестовые числа, не статистика использования.

## Совместимость и privacy

HTML4locale добавляет таблицу фиксированных кодов/локализованного unknown, counts/shares и3action fractions. Язык admin report query не меняет когорты данных. Empty rows=[] даёт no_data, не пустую таблицу/придуманные группы. Старый UsageReport без locale_cohorts конструируется и рендерится без секции. Old11metrics/page cohorts/ordered funnel/engagement/origin definitions и версии прежние; device/returning остаются unavailable.

Изменены6runtime files: api/analytics.py (sanitizer), schemas/analytics.py (shared AnalyticsLocale literal), schemas/usage.py (optional report), services/usage_metrics.py (aggregate), services/usage_dashboard.py (4locale HTML), web/src/lib/session.ts (context). Данные для отчёта из прежней выборки: новых SQL-запросов/записей от usage, DB migrations, dependencies, services, identifiers или retention rules нет. Ingest по-прежнему пишет существующий JSON metadata. API публичный и не доказывает consent/реальность заявленного языка. Report auth/no-store/noindex/CSP/no-referrer/script-free и fixed-label escaping сохранены.

Consent grant/revocation/no-replay, best-effort/no-retry/dedup и b8 live-consent session fix сохранены; смена языка не создаёт visitor ID. Old API примет event и отбросит locale; old client на новом API попадёт в unknown. При будущем разрешённом rollout — API перед web. Строгие внешние readers должны допускать optional additive report field. Не сравнивать unknown со всеми PL, не восстанавливать старые языки из IP/URL/других событий и не обещать полное покрытие. При сравнении реальных периодов учитывать начало locale collection и b8 session lifecycle boundary.

## Проверки

| Проверка | Итог |
|---|---|
| Новый API43 + existing usage/origin/engagement/funnel/analytics/save audit | **149passed**,2 прежних warnings: [лог](api.txt), [JUnit](api.xml) |
| Полный API | **1235passed/1failed/18PostgreSQL skipped**: [лог](full-api.txt), [JUnit](full-api.xml). Единственный fail — прежний test_real_api_to_queue_to_mock_telegram_journey с уже прошедшим fixture departure2026-11-06T09:00Z; Telegram runtime/test не менялись |
| Полный Node unit | Initial331pass/1test expectation fail: [лог](node.txt). Fixture details-open находится на /ru/deals; после правильного RU expectation **332passed**,0skipped: [лог](node-final.txt) |
| Production browser | **84/84 first-run PASS**:6new wire/privacy/blocked +78existing budget/disclosure/Update/session lifecycle; [JSON](browser.json), [лог](browser.txt), [новые traces](traces/) |
| Report browser4locale ×3states ×4widths | **48PASS**,0axe violations/incomplete/overflow/network/pageerror, keyboard skip-link и horizontal scroll: [JSON](dashboard-browser.json), [лог](dashboard-browser.txt) |
| ESLint / TypeScript / Next production | PASS: [lint](lint.txt), [tsc --noEmit --incremental false](types.txt), [build](build.txt); build **iCUtQkoCxvT-Hp9Yukz8Z** |
| Ruff / mypy | Initial import-order замечание исправлено без поведения; [final Ruff PASS](ruff-final.txt), [mypy122source PASS](mypy.txt) |
| Source parity / IDE | **677runtime files/9web tests** совпадают с isolated copy, ровно6runtime deltas: [manifest](source-parity.json), [summary](parity-summary.json). [IDE](ide-build.json) limited diagnostics |

НовыеAPI-cases: metadata sanitization всех4языков/неверных типов/unsupported strings, no header inference, first missing/no backfill, смена языка, same-time DB order, window bounds/exclusions, без PAGE_VIEW, sums/denominators/repeats, empty/legacy constructor, bounded enum parity и12HTMLlocale/state variants. Старые admin auth/limits/readonly-query/security tests включены в149/full run. Новые Node/browser cases проверяют route-derived context, fallbackPL, одинID при смене языка, browser language de-DE, query/privacy exclusions, denied/granted/revoked/no-replay и blocked transport. В трёх existing browser specs и трёх Node files обновлены только точные metadata expectations для additive locale; privacy assertions сохранены.

Fresh isolated .cache/aud05-h3-18b9-20261106, ports8125/3125; synthetic fixture API/operator, новое production build, без переиспользования серверов/установок deps. Report browser открывает file:// HTML от настоящего TestClient endpoint и synthetic SQLite с meta CSP; это не live admin login, auth/headers покрыты pytest. [RU320](locales-ru-320.png) и [EN1440](locales-en-1440.png) просмотрены: на320 таблица прокручивается внутри focusable region, page overflow нет. Это не полный visual/manualSR/WebKit/physical-device/fieldCWV/staging audit. H3-17/H3-14 gates остаются.

## Воспроизведение и откат

Python через настроенный PyCharm SDK3.12.10 после environment preflight. Пример из корня:

```powershell
$env:HOPTRIP_18B9_EVIDENCE=(Resolve-Path docs/h3-18b9).Path
.venv/Scripts/python.exe -m pytest apps/api/tests/test_locale_cohorts.py apps/api/tests/test_origin_cohorts.py apps/api/tests/test_engagement_usage.py apps/api/tests/test_usage_dashboard.py apps/api/tests/test_ordered_funnel.py apps/api/tests/test_analytics.py apps/api/tests/test_saved_revisit_observability.py -q
node docs/h3-18b9/browser.mjs
node docs/h3-18b9/parity.mjs
node docs/h3-18b9/verify.mjs
```

В isolated web: HOPTRIP_API_URL/NEXT_PUBLIC_API_URL=http://127.0.0.1:8125, NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3125 и synthetic operator fixture; npm run build. E2E: HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, HOPTRIP_H3_PRODUCTION=1, JSON output вdocs/h3-18b9; npm run test:e2e -- locale-analytics.spec.ts consent-session-navigation.spec.ts trip-update-analytics.spec.ts details-open-analytics.spec.ts budget-calculated-analytics.spec.ts --trace=off --reporter=line,json. Unit/lint изapps/web. Один служебный запуск lint с опечаткой directory исправлен; тесты/приложение им не изменялись.

Без новогоflag/deploy. Rollback — согласованно убрать additions из6runtime files/newAPI/newNode/newbrowser tests/docs и вернуть прежние точные metadata expectations. Не откатывать общие dirty файлы изHEAD: сохранить prior H3/.idea/разрешённую очистку. DB schema reversal не нужен; уже сохранённые locale metadata не переписывать/не выдавать за backfilled history. Нет production queries/notifications/affiliate transactions/paid APIs. Следующий отдельный шаг — privacy-safe mobile/desktop разрез после определения контракта; здесь не начат. H3-18 остаётся IN_PROGRESS.
