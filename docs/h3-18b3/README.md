# H3-18b3 — открытие дополнительных сведений предложения

2026-11-06. **H3-18b3 DONE локально; H3-18 IN_PROGRESS.** Одна часть по §1.2 V3: `offer_details_opened → DEAL_DETAILS_OPEN`, отдельно от посещения страницы `DEAL_VIEW`. Завершённый бюджет и последующая аналитическая отчётность здесь не реализуются.

## Основание и изменение

До изменения уже работали TripDetails на общих DealCard/странице, ScoreTrigger с нативным dialog и ScoreDetails с нативным расчётом. Отсутствовало событие открытия; [новый API-тест до правки](api-before.txt) воспроизвёл422 literal_error. [Baseline v1](../h3-18a/taxonomy.json) и [v2](../h3-18b2/taxonomy.json) сохранены как история; текущая [taxonomy v3](taxonomy.json) содержит16 wire events.

Реализация ограничена шестью существующими runtime-файлами и одним новым:

- Одинаковое additive имя в API `EventName` и web `analyticsEvents`; в `session.ts` оно добавлено в прежний класс viewEvents.
- Небольшой client `OfferDetailsDisclosure` рендерит тот же `<details>` с прежним className/children. У TripDetails и score-calculation отслеживается только собственный `toggle` в открытое состояние; вложенный target отсекается. Содержимое остаётся серверным slot, полный Deal не передаётся новому client boundary.
- ScoreTrigger вызывает прежний `track` после успешного `showModal()`. Закрытие/Escape, возврат фокуса, модифицированные клики и anchor fallback прежние.

[Delta существующих runtime-файлов](runtime-delta.patch); новый файл — `apps/web/src/app/components/offer-details-disclosure.tsx`. UI strings/CSS, SEO, источники данных, storage/consent/session identities, модели БД и зависимости не менялись. Новый класс события дедупликации использует прежнюю реализацию транспорта; отдельного listener/provider/SaaS нет.

## Определение и ограничения

Первое наблюдаемое открытие любой из трёх основных поверхностей даёт одно событие на **предложение + URL visit + текущую анонимную сессию**. Повторное открытие/вторая поверхность того же предложения не добавляют запись, даже спустя секунду. Другое предложение или новое наблюдаемое посещение могут добавить; hash отдельно не сбрасывает visit. Событие не является счётчиком всех раскрытий и не различает поверхности. Budget/events/accommodation/privacy disclosures в scope не входят.

Данные: прежние случайные event/session IDs, public deal_slug (API разрешает в deal_id), bounded page_type/source/campaign. Нет текста, label, surface fingerprint, URL/query/hash/token, сумм/дат/плана. API redaction/unrelated-context validation/event_id uniqueness сохранены. Общий публичный POST по-прежнему не доказывает consent или реальность взаимодействия.

Consent проверяет прежний track при отправке. Denied/revoked не отправляют; grant не воспроизводит уже открытые блоки. Native HTML и dialog работают при отказе/сбое аналитики. Best effort/no retry: заблокированное открытие остаётся дедуплицированным в этом посещении. Это toggle/showModal после hydration, не доказательство чтения: программное раскрытие тоже может вызвать toggle, раннее действие до hydration может потеряться. Без JS нативные details и ссылка на `#score` работают без аналитики.

Protected `summary.by_event.DEAL_DETAILS_OPEN` показывает новое имя. Прежние usage `detail_opening` и `ordered-session-funnel-v1` сохраняют определение через DEAL_VIEW; новый event не выдаётся за посещение. PRODUCT_EVENTS включает новое имя в received events/sessions автоматически — периоды с разным покрытием несопоставимы без оговорок. Отдельная disclosure→partner стадия здесь не добавлена. Новым клиентам нужен API с новым allowlist; старый API возвращает422 только аналитике, раскрытие не блокируется. При разрешённом rollout сначала API, затем web; откат web до сужения API. Миграции не нужны: БД хранит строковое имя.

## Проверки и исходные неудачи

| Проверка | Результат | Evidence |
|---|---|---|
| API / Node baseline | 81 / 323 passed | [API](api-baseline.txt), [Node](node-baseline.txt) |
| API analytics/usage/funnel + новые6 cases | **87 passed**, 2 warnings | [лог](api.txt), [JUnit](api.xml) |
| Все Node tests | **325 passed**, 0 skipped | [лог](node.txt) |
| Начальный browser feature run | 6 passed / 10 failed | [JSON](browser.json), [лог](browser.txt) |
| Исправленные10 feature +16 regression | **26 passed**, retries0 | [JSON](browser-final.json), [лог](browser-final.txt) |
| Уникальные latest browser cases | **32 passed**:16 feature +16 regression | [verification](verification.json) |
| Предыдущая сборка: диагностическое воспроизведение axe | 2/2 expected-finding cases, desktop/mobile | [лог](landmark-before.txt), [desktop raw](landmark-before-desktop.json), [mobile raw](landmark-before-mobile.json) |
| Fresh production build / final TypeScript | PASS / PASS | [build](build.txt), [types](types-final.txt) |
| Full ESLint + final affected lint / Ruff / mypy | PASS / PASS / 122 source files PASS | [lint](lint.txt), [final lint](lint-final.txt), [Ruff](ruff.txt), [mypy](mypy.txt) |
| Полный API suite | **1132 passed / 1 failed / 18 PostgreSQL skipped**, 2 warnings | [лог](full-api.txt), [JUnit](full-api.xml) |

Первый browser run: **7** cases упали на axe `landmark-unique`, когда одновременно раскрыты две карточки с прежними одинаковыми aria-label секций. На предыдущей production-сборке **T0SP041Yg88N0Xkfu_QAW**, без нового события/client wrapper, те же labels дают тот же finding в desktop/mobile: [diagnostic source](landmark-before.spec.ts). Это предсуществующий открытый остаток **H3-17**, не исправление доступности в этой задаче. В обычном feature-case axe выполняется при одной раскрытой карточке, без отключения правил; проверка второго предложения и дедупликации остаётся отдельным действием. Две открытые карточки не объявляются axe-clean.

Ещё **1** case слишком рано фокусировал summary после второго Escape; добавлено ожидание закрытого dialog/возвращённого фокуса. **2** JS-disabled cases ожидали pointer stability summary после hash navigation и истекли по timeout; использованы native focus + Enter вместо pointer click, без force/увеличения timeout/CSS overrides. Менялся только тест. Все затронутые10 cases повторены, начальные6 успешных не повторялись. Добавлены16 прежних regression:8 price-explanations/keyboard/dialog/axe/320px и8 Save→Update→reload→Duplicate/privacy. Итог32 — совокупность явно указанных прогонов, не один first-run green.

Feature покрывает4locale и desktop/mobile: настоящий POST202, ровно один event на оферту через разные поверхности, второй slug, переход catalog→detail без автособытия, прямой score calculation, close/rerender/dedup, denied/grant/revoke без backfill, blocked fetch без поломки toggle/dialog/focus, native SSR fallback без JS. Новый Node case проверяет reopen спустя2s, observed URL return, payload redaction и best-effort failure; прежняя API/frontend parity assertion обновлена15→16, прежний TRIP_UPDATE test сохранён. [PL card](card-pl-desktop.png) и [EN dialog](dialog-en-mobile.png) просмотрены; это не полный visual audit.

Полный API **не зелёный**: прежний `test_real_api_to_queue_to_mock_telegram_journey` использует вылет **2026-11-06T09:00Z**, уже прошедший во время запуска. Такое же падение было до этой части; H3-18b2 сохранила [pre-change reproduction](../h3-18b2/telegram-before.txt) и [future-departure control](../h3-18b2/telegram-future-fixture.txt). Telegram runtime/test не менялись и не объявлены исправленными. Два предупреждения — прежние Starlette/httpx и anyio deprecation.

## Окружение и воспроизведение

Только синтетические данные/SQLite/mock delivery, Google Chrome desktop/mobile emulation, PyCharm Python3.12.10. Fresh isolated `.cache/aud05-h3-18b3-20261106`, API8125/site3125; сборка **ipeMMw0Z17AQQjfsoNFEK**. Runner проверяет `next start`, `NODE_ENV=production`, no reuse и served BUILD_ID. Build/start имеют одинаковые API/site env. [Паритет676 source/dependency/public файлов](source-parity.json),3 web test sources совпадают после нормализации test ports/BOM/newlines; copy Next config добавляет только workspace turbopack.root. Изменений runtime после build нет; последующие изменения только в тестовых ожиданиях.

Команды из корня, используя SDK после Python preflight:

```powershell
.venv/Scripts/python.exe -m pytest apps/api/tests/test_details_open_analytics.py apps/api/tests/test_trip_update_analytics.py apps/api/tests/test_product_analytics.py apps/api/tests/test_usage_dashboard.py apps/api/tests/test_ordered_funnel.py apps/api/tests/test_funnel_analytics.py -q
.venv/Scripts/python.exe -m pytest -q
.venv/Scripts/python.exe -m ruff check apps/api/app/schemas/analytics.py apps/api/tests/test_details_open_analytics.py
.venv/Scripts/python.exe -m mypy apps/api/app
node docs/h3-18b3/verify.mjs
```

Web: `npm run test:unit`, `npm run lint`; в isolated copy `npm run build`, `npm run typecheck`. Browser: `HOPTRIP_TEST_PYTHON=<SDK>`, `PLAYWRIGHT_CHANNEL=chrome`, `HOPTRIP_H3_PRODUCTION=1`, `npm run test:e2e -- details-open-analytics.spec.ts --trace=off --reporter=line,json`. Финальный subset/regression: три файла details-open-analytics/h3-explanations/trip-update-analytics и grep `modal and native|JavaScript disabled|price explanations before/after|successful Update alone`. Подготовка — прежний prepare-e2e.ps1 -Production с тремя imported test fixtures, airport JSON и synthetic operator; новых пакетов/серверной архитектуры нет. IDE result — `ide-build.json`, limited diagnostics; фактические CLI build/types подтверждают компиляцию.

## Откат и остаток

Без нового feature flag. Откат — только delta шести существующих runtime-файлов и новый wrapper; убрать новые тесты/вернуть parity count при сужении allowlist. Не восстанавливать общие файлы из HEAD: накопленные H3/IDE изменения и ранее разрешённая очистка сохранены. Исторические analytics rows можно оставить; storage/retention не менялись.

Production data/deploy/реальные уведомления/партнёрские транзакции не выполнялись. Нет заявлений об uplift/реальном baseline/CWV. WebKit/manual screen reader/physical devices/full E2E не выполнялись. Следующая отдельная **H3-18b4 — определить честное завершение бюджета и событие budget_calculated**; затем разрезы/возвраты/сравнимые реальные baseline/after. H3-17 IN_PROGRESS, включая duplicate landmarks; H3-14 BLOCKED внешними условиями; Telegram fixture clock — отдельный тестовый долг. Здесь остановка до следующей задачи.
