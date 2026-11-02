# ANALYTICS-01 — Product Analytics Event Taxonomy

Дата: 2026-11-02. Только ANALYTICS-01; AUD-02/SEC-01 DONE. Задача переиспользует существующую first-party аналитику. Новый провайдер, SDK, dashboard, эксперимент, schema migration и production activation не создаются. [Полный словарь](TAXONOMY.md), [существующий контракт](../hoptrip-analytics-contract.md).

## Подтверждённое состояние и решения

В репозитории уже были11 event names, session/consent helpers, scoped trackers, API validation/event_id uniqueness, admin summary и профильные unit/API/browser tests. SEARCH/SEARCH_RESULT, DEAL_IMPRESSION/DEAL_VIEW, PARTNER_CLICK, BUDGET_USE, TRIP_SAVE, ALERT_CONFIRMED и ACTIVITY_CLICK не дублируются lower_case aliases из плана.

Подтверждены три отсутствовавших сигнала и неоднозначность фильтров: saved removal и ticket event links не вызывали track, signup отправлял только ALERT_CONFIRMED после подтверждения, FILTER_USE не отличал apply/remove/reset. Добавлены:

- TRIP_REMOVE только после successful saved-store mutation; absent/corrupt/write failure не считаются. Без saved plan token/contents. Undo не объявляется новой save conversion.
- EVENT_CLICK на обеих существующих доступных ticket-link ветках TripEvents (single и ticket_options), только deal_slug/common envelope. URL/target/rel/availability/partner attribution не меняются. Cancelled link остаётся скрытым.
- ALERT_STARTED при явном browser-valid signup submit, один раз за visit, с текущим analytics consent. API failure может дать start, но не confirmation. Manage/confirm не создают start; email/preferences/hash/token в track не передаются. Existing ALERT_CONFIRMED trigger прежний.
- Optional validated filter.action=apply/remove/reset на прежнем FILTER_USE; backend хранит его отдельно в metadata. Нет второго wire event для reset. Legacy FILTER_USE без action принимается. Added page_type=saved одинаков на4 языках; остальные envelope/search/partner/activity allowlists прежние.

Frontend имена типизированы общим AnalyticsEventName, backend Literal содержит тот же набор14 имён. API context rules сохраняются: filter только у FILTER_USE; search/partner/activity не относятся к новым actions. Согласие проверяется в existing track; маркетинговое согласие не заменяет analytics. Нет новых строк UI и новых переводов: существующие4 locale actions используют те же handlers.

## Границы и безопасность

Изменены8 runtime files: session/analytics-context,4 UI components (filters/saved-trips/alert-form/trip-events) и2 API analytics files. Existing tests localized-alerts/seo-growth обновлены только в ожидаемой последовательности START→CONFIRMED; прежние privacy/SEO/error checks сохранены. Добавлены3 профильных test files. SQL model/migrations, DB settings, SMTP/Telegram workers/credentials, scoring/freshness, affiliate URLs, cookies/plan storage/consent mechanics, service content/SEO и предыдущие задачи не меняются.

Session UUID не является человеком; backend endpoint не является доказательством consent. Best-effort delivery может терять запросы; fast identical actions merge на1секунду. Старые FILTER_USE без action не классифицируются задним числом. Start/confirmation нельзя надёжно связывать по email/token или считать exact cohort funnel; Telegram opt-ins в browser dataset отсутствуют. Детальные denominators и совместимость описаны в [TAXONOMY.md](TAXONOMY.md).

## Проверки

- [Unit](unit.txt):215/215 passed, включая4 новых privacy/dedupe/locale/failure tests. [API](api.txt), [JUnit](api.xml):41/41 passed,14 новых cases;2 existing TestClient/httpx/anyio deprecation warnings. Только isolated SQLite dependency overrides.
- [ESLint](lint.txt), [TypeScript](typecheck.txt), [Ruff](ruff.txt), [mypy110](mypy.txt), [isolated production-mode build](build.txt) passed. npm предупреждает о внешней env option min-release-age; package/env config не меняется.
- [Initial desktop](e2e-desktop-initial.json):5pass/1fail/11not-run,61.80s. В новом EN test все ожидаемые actions уже наблюдались, но итоговое сравнение числа response events с отправленными requests дало21/22 после быстрой полной навигации. [Sanitized trace network evidence](initial-network-diagnostic.json) показывает22 requests,21status202 и один SEARCH_RESULT со status−1 (ответ не наблюдался); это не доказательство записи/потери на сервере. Runtime не менялся. Тест теперь ожидает завершения ответов до каждой полной навигации, сохраняя требование202 для всех наблюдаемых событий. Отдельно документирована best-effort граница; retry или production guarantee не добавлены.
- [Desktop после исправления ожидания ответов](e2e-desktop-navigationfix.json) (также e2e-desktop.json):12passed/1timeout/4not-run,179.81s. Все8 новых cases и4 existing funnel/localized-alert cases прошли. Следующий existing seo-growth scenario закрывал already-open details и ждал hidden input. Две временные setup corrections выявили также stale .empty-state selector (фактически виден current empty heading), а затем нестабильный sort URL; причина последнего не установлена. [Первый focused diagnostic](e2e-seo-desktop-initial.json):0pass/1fail/4not-run,29.76s; [следующий](e2e-seo-desktop-navigation.json):0/1/4,26.63s. Обе временные UI-test правки отменены; текст первых3 SEO cases совпадает с исходным с учётом EOL. Их успешность не заявляется. В acceptance включены только2 профильных analytics cases этого файла, оба проверены отдельно.
- [Focused existing SEO-growth desktop](e2e-seo-desktop.json):2/2 passed,17.07s; [mobile](e2e-mobile.json):12/12 passed,158.23s. В обоих unexpected/skipped/flaky0, errors=[], retries0. Вместе с12 успешными desktop cases предыдущего run — **26 уникальных accepted project/scenario:16 новых +10 existing**. Это составной acceptance, не один полностью зелёный17-case desktop run; initial/повторы не суммируются.
- Новые real-browser journeys PL/EN/RU/UK проверяют filter apply/remove/reset→SEARCH, budget/save/repeated save, single/variant ticket popup и cancelled links, successful remove/failed write, HTML validation/signup start/confirmation, failed API/retry start dedupe, refusal/withdrawal/session cleanup/no private payload. Реальные analytics HTTP202 проверяются перед переходами в positive journeys; network-error case проверяет сохранение перехода при отказе аналитики. Existing localized-alerts сохраняет6 scoped axe scans без violations; новых DOM/text/layout изменений нет. Это Chromium mobile emulation, не physical Safari/full-suite/WCAG certification.
- [Verification](verification.json), [скрипт](verify.cjs), [закрытие своих портов](ports.json). Проверены before-manifest scope, source/test/fixture parity,14 frontend/backend event names, legacy compatibility, local links/JSON/added whitespace; global git diff --check содержит только97 прежних trailing spaces user master plan, его hash unchanged.

## Изолированная проверка и воспроизведение

Исходная рабочая копия имеет много прежних незакоммиченных изменений. Перед ANALYTICS-01 snapshot сохранено2152 tracked/untracked source/doc files; delta сравнивается с этим состоянием, не с HEAD. Мастер-план не редактируется. [Task patch](changes.patch) показывает только8 runtime files и5 изменённых/новых test files; документы отдельно в scope verification.

Из корня проекта (Python executable предварительно получен через python-tools/get_python_environment):

```powershell
& .venv/Scripts/python.exe -m pytest apps/api/tests/test_analytics.py apps/api/tests/test_funnel_analytics.py apps/api/tests/test_activity_analytics.py apps/api/tests/test_seo_growth.py apps/api/tests/test_product_analytics.py -q
& .venv/Scripts/python.exe -m ruff check apps/api/app/api/analytics.py apps/api/app/schemas/analytics.py apps/api/tests/test_product_analytics.py
& .venv/Scripts/python.exe -m mypy apps/api/app
```

Из `apps/web`: `npm run test:unit`, `npm run lint`, `node node_modules/typescript/bin/tsc --noEmit`. Не подменять SDK системным Python и не устанавливать зависимости ради этих проверок.

Browser workspace подготовлен `docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-analytics01`, добавлены7 прежних untracked CSS/public/script assets. Изолированные Next build/start, свои .next/SQLite/public operator fixture/3125/8125/reuseExistingServer=false; чужие3100/8100/процессы не переиспользуются и не останавливаются. Root Playwright config/API fixture не меняются; isolated fixture заменяет обе mail boundaries на in-memory mail. SMTP/digest/Telegram/editor/event-sync flags disabled; fixture ticket search не вызывает реального provider. Все external https destinations в новых tests fulfilled locally. Browser фазам требуется SDK preflight для guarded uvicorn fixture, без installs. Installed Next16.4.3 Analytics/Playwright guides прочитаны до реализации.

## Rollback и завершение

Согласованно вернуть web producers/type union и additive API allowlist/optional context по [patch](changes.patch); подробности очередности в словаре. Stored historical records не удалять/не переименовывать. Production rollback/schema migration или изменение affiliate tracking не выполнялись.

ANALYTICS-01 DONE; четыре roadmap documents обновлены. Следующая eligible GROW-03; ANALYTICS-02 также доступна по зависимости. Ни одна не начата; остановка.
