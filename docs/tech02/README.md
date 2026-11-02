# TECH-02 — API Contract and Error Handling Audit

Дата:2026-11-01. Статус: DONE. AUD-01 DONE. Выполняется только TECH-02; TECH-03 не начата.

## Проверенные области

| Требование | Результат проверки / изменение |
|---|---|
| Request/response validation | Backend FastAPI/Pydantic ограничивает query/body и сериализует catalog/location/events; alerts endpoints имеют небольшие acknowledgement/settings objects. Web раньше принимал `response.json() as T` без runtime guards. Новые [api-contract.ts](../../apps/web/src/lib/api-contract.ts) и [api.ts](../../apps/web/src/lib/api.ts) проверяют реально используемую структуру до передачи компонентам. Полный JSON Schema/code generation не вводится |
| Error consistency | Backend detail бывает string, object с code, Pydantic list; middleware/proxy может вернуть не-JSON. HTTP status сохраняется, code берётся только из detail.code, тело/диагностика не отображаются. NETWORK_ERROR/status0, TIMEOUT/504, INVALID_RESPONSE/502 — внутренние web errors, не изменение HTTP API envelope. Только настоящий HTTP404 detail становится null;200 null — unavailable |
| Missing optional fields | Отсутствующие aliases/optional facts/quality/freshness/score metadata допускаются; исходный объект не дополняется выдуманными ценами/временем. Неверный тип present field отклоняется. Events допускают отсутствие checked_at/partial/pagination/flight_fit, сохраняя прежний honest unknown UI; events array и нужные поля rows/options проверяются. Invalid currency/fit reasons container больше не доходят до render |
| Pagination | Catalog: safe integers, offset0..10000,limit1..100, items<=limit, непустая страница не выходит за total, metadata соответствует запрошенному offset/explicit limit. Empty page после total остаётся валидной. Event page1..84, positive page_size, counts/metadata types проверены. Изменения backend ordering, CTE snapshot/count, offset API и defaults не вводились |
| Redundant requests | Detail уже имеет request-scoped React.cache. В двух landing loaders metadata и body повторяли registry read; установленный Next dedupe-fetch.js явно opt-out при options.signal, который есть у web API requests. Load outcome registry+offers теперь общий через React.cache(value) для metadata/body; failed outcome тоже разделяется. Нет process/global/user-spanning response cache и cross-request stale values; network/performance gains численно не измерялись |
| Unhandled failures | Catalog/home используют существующие allSettled/recovery; detail/shared plan/preview уже обрабатывают failures. [Airport](../../apps/web/src/app/from/[iata_code]/page.tsx)/[destination](../../apps/web/src/app/destinations/[slug]/page.tsx) теперь возвращают [ApiUnavailable](../../apps/web/src/app/components/api-unavailable.tsx) с retry/catalog и noindex/canonical при API outage; реальные missing registry records остаются404 вне catch. [TripEvents](../../apps/web/src/app/components/trip-events.tsx) отклоняет malformed200 через прежний локальный error/retry. [AlertForm](../../apps/web/src/app/components/alert-form.tsx) валидирует reply до изменения UI status/token/settings |
| Retries/timeouts | Сохранены8s server GET,15s event fetch с cleanup AbortController/150ms coalescing и20s alert mutation. Нет автоматических retry GET/POST/PATCH, повторов signup/confirm или retry storms. UI retry — явное действие пользователя. NBP loader уже проверяет rate, timeout2s, coalesces concurrent requests и имеет1min failure backoff/7day freshness; не менялся. Analytics consent-aware fire-and-forget catches failure и не блокирует переходы; не менялась |

Типовые проверки соответствуют текущему API. Unknown additive fields допускаются. Это consumer validation, не замена backend validation/scoring/quality/availability/business rules или полная валидация всех семантических свойств JSON. Несовместимые новые типы/обязательные поля/enum versions требуют согласованного изменения reader. Нет coercion цен в0, fallback fake inventory, новых источников, paid APIs или dependencies.

## Изменённые файлы и сохранённое поведение

Семь web runtime files: api.ts, api-contract.ts, TripEvents, AlertForm, ApiUnavailable и два landing routes. В test-only [e2e_app.py](../../apps/api/tests/e2e_app.py) добавлены malformed200 fixtures: budget987652 и slug invalid-contract-fixture. Production API/app/schemas/DB/config не менялись.

Три новых test files: [API client](../../apps/web/tests/api-client-contract.test.mjs), [response guards](../../apps/web/tests/api-response.test.mjs), [browser recovery](../../apps/web/tests/api-contract-recovery.spec.ts). Progress/Audit/Decisions/Test Plan и этот каталог содержат evidence. Request query allowlist/encoded slug/no-store, цены в исходных decimal strings, filtering/order/SQL, affiliate URL/tracking, consent, private tokens, drafts/saved/share, локализации и опубликованные SEO routes сохранены. Новая панель использует прежние тексты PL/EN/RU/UK; CSS/словари/assets не менялись.

## Фактические проверки

- [Before Node](unit-before.txt):10 tests,2 passed/8 failed. Подтверждены принятие malformed200 page/registry,200 null как404, truthy alert flag, raw JSON/network/timeout exceptions и некорректная pagination. Это реальные failing boundary assertions, не browser-before reproduction render crash.
- [Final Node](unit.txt):209/209, включая19 новых client/shape tests. [Промежуточный guard run](unit-contract.txt):17/17 до добавления body-abort/query tests; не суммируется с209. No network: fetch mocks, синтетические цены только в test fixture.
- [Backend выборка](pytest.txt):67 passed,2 existing FastAPI/Starlette deprecation warnings,10.37s. Catalog/catalog-results/events/event-browsing/alert-journey/alert-preferences, local SQLite/disabled campaigns. [Ruff](ruff.txt):passed для изменённой fixture. Mypy/full backend/PG/migrations не запускались: app/schema/runtime backend не менялись.
- [Build](build.txt), [TypeScript](typecheck.txt), [ESLint](lint.txt):passed. Обычные61 static/SSG pages; generated next-env восстановлен. [Первый lint](lint-initial.txt) нашёл запрещённое имя local binding module в новом test loader; исправлено на loaded. Dependencies не обновлялись, Docker build не требуется.
- [Browser final](e2e-acceptance.json): Final browser 50/50,428.24s,unexpected0,skipped0,flaky0,errors=[],retries0. 8 новых recovery cases на4 locales×desktop/mobile + прежние offer-states/event-context/alerts/localized-alerts. 16 новых scoped axe scans без violations; не полный E2E suite.
- [Verification](verification.json) и [порты](ports.json): source/test parity, master/next-env, links/JSON checked; screenshots recovered desktop/mobile просмотрены. Собственные servers завершены; port incident ниже сохранён.

## Ранние browser этапы и инцидент изоляции

[Контекст](initial-check-context.md) содержит все изменения setup без ослабления assertions:

- [Smoke](e2e-smoke.json):0/1,36.24s — one-way fixture без конца периода показывала корректную date error, запрос не выполнялся. Тест теперь задаёт end=start после readiness.
- [Port setup](e2e-port-setup.json):6 passed/1 failed/43 not-run,49.00s. После копирования нового spec был потерян port rewrite. Два test-control POST ушли на8100 и получили404: [offline trace summary](port-setup-requests.json). Тестовый переключатель там не выполнился; чужой процесс не останавливался. У middleware могли остаться обычные logs/rate counters двух запросов. Не утверждается, что порт8100 вообще не затрагивался.
- Исправление: новый spec берёт apiOrigin из первого webServer.url изолированной Playwright config и проверяет control response.ok. Жёсткого API address в нём больше нет; копирование spec не может вернуть control URL на8100. Собственные API/web конфигурации остаются8125/3125,reuseExistingServer=false.
- [Locale setup](e2e-locales-setup.json):7 passed/1 failed/42 not-run,65.51s — EN test запросил непереведённую /destinations/barcelona. Исправлен test path на существующий /destinations/milan с четырьмя опубликованными локализациями. Новые страницы/translations/rewrites не создавались. Результаты этапов не суммируются с финальным прогоном.

## Воспроизведение

Изолированная копия `.cache/aud05-tech02` подготовлена [prepare-e2e.ps1](../aud05/prepare-e2e.ps1). Untracked CSS/public скопированы явно: design-tokens.css, saved-trips.module.css, destination-card.module.css,3 WebP+CREDITS.md. Own .next/SQLite/loopback servers; fixture guard HOPTRIP_E2E=1 и отдельная временная БД. SDK до каждого Python/fixture вызова получен через python-tools/get_python_environment: Python3.12.10, `.venv/Scripts/python.exe`, pip, без installs.

В isolated apps/web: HOPTRIP_TEST_PYTHON этому SDK; PLAYWRIGHT_CHANNEL=chrome; APP_ENV=test; DATABASE_URL=sqlite://; ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. Mail sink/example.test/интерцепты в guarded fixture, без SMTP/реальных кампаний/production writes. Для нового spec нельзя отдельно подставлять иной API URL — он читает isolated config. Старые tests, скопированные helper, сохраняют его штатную port normalization.

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)api-contract-recovery\.spec\.ts$' '(^|/)offer-states\.spec\.ts$' '(^|/)event-context\.spec\.ts$' '(^|/)alerts\.spec\.ts$' '(^|/)localized-alerts\.spec\.ts$' --max-failures=1 --output=test-results-tech02-acceptance --reporter=json
```

Chrome desktop/mobile emulation320, четыре языка. Не physical devices/Safari/real screen-reader speech/full-site WCAG conformance. Таймауты unit проверяют classification через synthetic abort, не8s real network latency. Live public site/production services/PG/Docker/deploy не проверялись и не менялись.

## Release / rollback

Выпускать согласованную web-сборку guards/client consumers/landing outcome+panel. API schema/migration/storage/cookie changes отсутствуют; additive server fields принимаются. Rollback только TECH-02 runtime delta, не весь dirty checkout; не удалять предыдущие TECH-01/UI fixes. Test-only malformed fixture не входит в production app. Без cleanup пользовательских данных, изменения credentials или инфраструктуры. При восстановлении старого reader возвращается прежнее принятие unchecked JSON; это осознанная граница rollback.

Optional-metadata run [14pass/1fail/35not-run](e2e-optional-metadata.json),105.03s: guard был слишком строг к checked_at=invalid, для которого существовал unknown-check fallback. Исправлен только этот display-only guard; events/prices/pagination остаются проверенными, regression test не менялся. TECH-02 DONE; TECH-03 не начата.
