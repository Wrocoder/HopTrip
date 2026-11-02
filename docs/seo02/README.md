# SEO-02 — Airport Landing Pages

Дата:2026-11-01. SEO-02 DONE, SEO-01 DONE. Только SEO-02; SEO-03 не начата.

## Проверенное исходное состояние

WRO и KRK уже имеют отдельные практические intro/airport guide/budget/weekend/city-break ссылки, Warszawa — форму с объединением WAW/WMI и объяснение разных аэропортов. Эти тексты и URL сохранены. Новые страницы, расписания, тарифы трансферов и обещания доступности не добавлялись.

Подтверждённые пробелы: в landing pages не было навигации по направлениям из текущей выборки; отдельный airport route при пустом массиве показывал пустую сетку без объяснения. [Before browser](e2e-before.json):0passed/1failed,35.05s — блок airport context отсутствует; errors содержит штатную остановку max-failures=1. Это не проверка live Google indexing или реальных перевозчиков.

## Изменение

- [AirportContext](../../apps/web/src/app/components/airport-context.tsx) использует уже загруженные airport records и окно показанных offers. Airport city/code/name берутся из registry. Направления только из этой выборки, без дополнительного запроса, рейтинга популярности или обещания полного расписания. Цена по-прежнему observation, наличие подтверждает продавец.
- Каждая direction link ведёт в локализованный `/deals` с тем же origin; на Warszawa сохраняются текущие даты/бюджет/сортировка и выбранный WAW/WMI/union. При переходе к новой выборке сбрасывается offset. Отдельная CTA ведёт в поиск с сохранёнными условиями. Это явный переход по обычному href, без скрытой смены current search.
- [Airport route](../../apps/web/src/app/from/[iata_code]/page.tsx) показывает явное localized empty state, различает отсутствие observations и отсутствие рейсов у перевозчиков, предлагает поиск с тем же origin и выбор другого аэропорта. Ошибка API остаётся existing error/noindex/recovery, неизвестный аэропорт — existing404. Заголовок и observation notice применяются ко всем отдельным airport pages.
- [Warszawa catalog](../../apps/web/src/app/deals/page.tsx) использует тот же context после результатов только при успешном API outcome. Existing filters/union constraints/пагинация/empty/error UI сохранены. Registry facts не придумываются при missing optional registry response.
- [Copy](../../apps/web/src/lib/i18n/airport-copy.ts) на PL/EN/RU/UK; native anchors/headings/lists и существующие rationale/route-link-grid/text-link styles. Existing airport guides, WRO/KRK unique practical copy, weekend rules, связанных руководств и CTA достаточно — они переиспользованы без дублирующей выдачи рекомендаций.

Индексация, sitemap inventory, title/description/canonical/hreflang, social previews и прежние URLs не меняются. WAW/WMI и прочие отдельные airports сохраняют свою прежнюю publication/noindex/locale policy. Backend/fixtures/config/dependencies/affiliate/consent/storage/calculation contracts не изменены.

| Требование | Проверенное покрытие |
|---|---|
| Airport information | Existing WRO: время доезда/отправления и общий бюджет; KRK: Balice/варианты доезда/ранний вылет; Warszawa: WAW и WMI раздельно. Новый блок добавляет текущие registry code/name, airport guides сохранены |
| Flight offers | Existing getDeals/DealGrid для отдельного порта; getDealResults/filters/pagination для Warszawa. Нет live availability claim; сохранены price freshness/quality notices |
| Destination links | Направления дедуплицируются из показанных offers; link ведёт в поиск с origin и destination, без offset. Нет hardcoded обещания маршрута или гарантии всех направлений |
| Weekend context | Existing WRO/KRK links с origin и Warsaw union WAW,WMI links в city-break/календарный weekend; пояснения длительности, доезда и часов сохранены |
| Related guides | Existing wro-airport/krk-airport/waw-airport/wmi-airport и budget guide links. Новые фактические утверждения о тарифах/расписании не вносились |
| Search CTA | Явная локализованная ссылка в `/deals` с airport/search context; existing search form и links не удалены |

## Проверки

[Browser acceptance](../../apps/web/tests/airport-landings.spec.ts):4 locales×desktop/mobile, main cases явно320px на mobile, no-JS cases — viewport проекта390px. Registry facts/actual destination selection/canonical/robots, search CTA keyboard, destination URL navigation/origin preservation, scoped axe/overflow. No-JS empty/API error/recovery cases, Warsaw selected WMI+budget+offset semantics. Synthetic local fixtures, не реальные цены/расписание.

- [Unit](unit.txt):211/211. [ESLint](lint.txt), [TypeScript](typecheck.txt), [production build](build.txt) passed. Runtime после build не менялся; next-env.d.ts восстановлен к snapshot. Финальные lint/tsc включают изменения browser tests.
- [Mobile acceptance](e2e-mobile-acceptance.json):8/8,128.32s,unexpected0,skipped0,flaky0,errors=[],retries0, API client без диагностики. Вместе с21 passed из desktop и3 technical repeat проверены32 уникальных project/scenario, без суммирования повторов. Из них16 новых cases и24 новых scoped axe scans без violations. Это несколько отдельных прогонов, не один полностью зелёный broad run и не full product suite.
- [Sitemap evidence](sitemap-audit.json):244 pages и51 editorial link HTTP200. [Verification](verification.json):571 runtime/public/Docker файлов совпали с isolated copy; new test совпал, technical spec отличается только test-port normalization. Master plan/next-env.d.ts unchanged, JSON/links/добавленный whitespace checked. Свои3125/8125 закрыты. Предыдущие пользовательские/IDE изменения сохранены.
- 6 captures desktop/mobile для WRO/KRK/Warszawa просмотрены; screenshot scope — новый context, не полная страница. Mobile KRK element capture в initial и acceptance не показывал верх блока, промежуточный unchanged capture был полным. Дополнительный [viewport probe](e2e-visual.json):1/1,14.22s,errors=[],retries0, отдельно от32. После явного позиционирования обычный [viewport](mobile-KRK-viewport.png) и [context](mobile-KRK-context-verified.png) показывают h2 целиком; [DOM measurements](visual-heading.json):y40.89–105.39,display:block,visibility:visible,overflow:false. Runtime не менялся; единственная причина capture limitation не установлена. Оба дополнительных captures просмотрены; [probe source](visual-probe.spec.ts) копируется в isolated tests для воспроизведения. [Desktop](desktop-airport-KRK.png).

[Smoke](e2e-smoke.json):0passed/1failed,115.07s. После WRO/KRK/Warszawa context checks последняя exact-URL assertion ждала завершения keyboard navigation только5s; в error snapshot уже виден правильный `/deals?origin=WAW%2CWMI`. Статическая build проверка частично шла параллельно; скорость этим прогоном не оценивается. Добавлен обычный page.waitForURL перед exact assertion, параметры и результат проверки не изменены. Единственная причина задержки не установлена; runtime не менялся после этого сбоя.

[Broad desktop](e2e-desktop.json):21passed/1timeout/2not-run,515.18s. Все8 новых desktop cases и13 прежних catalog/offer-state/no-JS cases прошли. Full sitemap audit достиг общего180s deadline. [Отдельный неизменённый повтор](e2e-technical.json):0passed/1timeout/2not-run,203.52s — тот же deadline. Raw reports и traces сохранены; это не объявляется полностью зелёным прогоном или исправлением производительности. Browser trace показывает продолжавшуюся навигацию по большому inventory; единственная причина стоимости не установлена.

В [technical-seo.spec.ts](../../apps/web/tests/technical-seo.spec.ts) общий бюджет полного обхода увеличен180→300s для244 URL плюс editorial links. Это бюджет всей проверки, не latency SLA. Assertions, their5s deadlines, HTTP status/canonical/noindex/title/description/h1 checks и API timeout8s не ослаблены; application runtime после первых browser stages не менялся. [Финальный technical run](e2e-technical-final.json):3/3,261.60s,unexpected0,skipped0,flaky0,errors=[],retries0.244/244 pages и51 editorial link HTTP200.

[Первый mobile run](e2e-mobile.json):1passed/1failed/6not-run,76.15s. EN после keyboard CTA в `/en/deals?origin=KRK` получил existing unavailable/error UI вместо result-count; airport/destination suggestions тоже unavailable. [Unchanged repeat](e2e-mobile-final.json):1passed/1failed/6not-run,57.73s — тот же вид error UI уже для origin=WRO. Причина API outcome не установлена; это не исправлено как часть SEO-02 и не объявляется отсутствием flight inventory. Новый context не выполняет API calls.

[Диагностический прогон](e2e-probe.json):PL+EN2/2,49.48s,errors=[], без error logs. Только в isolated api.ts временно логировались path/status/error name/cause code, без payloads/headers/secrets; проблема не воспроизвелась. После завершения probe исходный API client восстановлен byte-identical с checkout. Финальный8/8 запущен без instrumentation и без изменения assertions/runtime; API reliability в целом не объявляется исправленной. Probe и предыдущие повторы не суммируются с32.

Изоляция: `docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-seo02`, явное включение прежних untracked CSS/public assets, отдельные SQLite/.next/3125/8125, reuseExistingServer=false. Fixture SDK получен get_python_environment: Python3.12.10 `.venv/Scripts/python.exe`, без installs. APP_ENV=test,DATABASE_URL=sqlite://,alerts/digests/editor/event-sync disabled, consent false. Control URL derived from isolated Playwright config; каждый POST/DELETE обязан быть ok. Чужие3100/8100 не используются.

Команда в isolated apps/web при HOPTRIP_TEST_PYTHON=SDK и PLAYWRIGHT_CHANNEL=chrome:

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)airport-landings\.spec\.ts$' --project=desktop --max-failures=1 --output=test-results-seo02-desktop --reporter=json
node node_modules/@playwright/test/cli.js test '(^|/)technical-seo\.spec\.ts$' --project=desktop --max-failures=1 --output=test-results-seo02-technical-final --reporter=json
node node_modules/@playwright/test/cli.js test '(^|/)airport-landings\.spec\.ts$' --project=mobile --max-failures=1 --output=test-results-seo02-mobile-acceptance --reporter=json
```

Full product suite/physical devices/Search Console/traffic/ranking/field CWV не заявляются. Соответствующие Python runtime/fixtures/config и Docker assets не менялись: pytest/PG/Ruff/mypy/Docker build не запускались. Deployment/production writes/paid APIs/credentials/real campaigns не выполнялись.

## Release / rollback

Согласованный web bundle только двух consumers, AirportContext и airport-copy. Без API/DB/storage migration/backfill/cleanup. Для rollback вернуть два consumers к SEO-02 snapshot и удалить только два новых runtime modules; отдельный SEO-02 browser spec убрать или восстановить прежние ожидания. Общий бюджет technical SEO test можно вернуть к180s; это вернёт наблюдавшийся риск незавершённого обхода. Изменения SEO-01 и предыдущих задач сохраняются. Откат вернёт отсутствие destination navigation и явного airport empty state. SEO-03 не начата.
