# SEO-01 — Technical SEO Improvements

Дата:2026-11-01. SEO-01 DONE, AUD-04 DONE. Только SEO-01, SEO-02 не начата.

## Подтверждённая проблема и изменение

До fix обычный Chromium без JavaScript получал два main/h1: loading fallback и скрытые результаты Suspense. [Before regression](e2e-before.json):0/1,24.93s, expected1 heading/received2. Это подтверждает прежнее наблюдение AUD-04; фактическое индексирование Google или потеря позиций не устанавливались.

В [deals/page.tsx](../../apps/web/src/app/deals/page.tsx) удалён только локальный Suspense вокруг async DealResultsPage. Initial server response ждёт API и содержит видимый каталог, единственный main/h1, GET form/results/recovery links без зависимости от JS activation. Query-based key сохранён на results component: прежний remount при смене search context не теряется. Нет UA sniffing или отдельной версии для ботов. Начальный loading-screen сознательно заменён ожиданием готового ответа; это может увеличить TTFB и время клиентского перехода. Существующие8s API deadlines, ошибки, filter transition/pending/disabled и явные retries сохраняются. Home/guide streaming не менялся, новый глобальный loading.tsx не вводился.

[Google JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) различает crawling/rendering/indexing и отмечает пользу server rendering для ботов, которые не исполняют JS. Здесь исправляется наблюдаемая видимость initial HTML; результат в Search Console, ranking или трафик не заявляется.

## Проверенные области

| Область | Проверка / политика |
|---|---|
| Sitemap | Существующий inventory и sitemap generator сохранены: уникальные опубликованные URL без private/query variants; browser crawl проверяет реальные ответы каждой sitemap page |
| Robots | Allow /, disallow /api/ и /go/; private/noindex страницы остаются доступны краулеру для чтения directives. Массового noindex не вводится |
| Canonical | Существующая searchSeo policy сохраняет filters/pagination, убирает tracking/defaults; canonical один. /from/wro сохраняет canonical /from/WRO без смены публичного URL policy |
| Hreflang | pageLocales/translatedPaths и reciprocal languageAlternates сохранены; unit SEO inventory checks и фактические alternates на четырёх каталогах/локалях. Непереведённые страницы не объявляются переведёнными |
| Title/description | Crawl проверяет unique/nonempty title+description на sitemap pages; генераторы и editorial copy не изменены |
| Headings | Исправлен duplicate initial main/h1 в каталоге без JS; crawl требует1 h1 для каждой опубликованной страницы |
| Structured data | Существующий BreadcrumbList сверяется с rendered breadcrumb names/positions/canonical на PL/EN/RU/UK,320px,no JS. Новых schema values/ratings/prices нет |
| Internal links | Sitemap crawl собирает editorial links и проверяет HTTP200; обычные href/локализации сохраняются |
| Redirects/status | Известные nonexistent/expired paths, private directives и no booking links проверяются существующими technical SEO tests; никаких новых redirect chains или URL migrations |
| Rendering | Новый seo-rendering.spec.ts: ordinary UA/no JavaScript, PL/EN/RU/UK, /deals,/city-break, delayed API case. Видимы form/result count, один h1, отсутствует loading fallback |
| Pagination/query | Existing canonical/noindex policy и URL params сохранены; offer-state regression проверяет reset/recovery и delayed interactive filter updates |

Изменены один runtime-файл, существующий [offer-states test](../../apps/web/tests/offer-states.spec.ts) (намеренно обновлено ожидание initial loading) и добавлены [no-JS tests](../../apps/web/tests/seo-rendering.spec.ts)/[structured tests](../../apps/web/tests/seo-structured.spec.ts). Никаких изменений sitemap URL inventory, robots, metadata copy, score/data/affiliate/storage/consent/backend или dependencies.

## Проверки и ограничения

- [Unit](unit.txt):211/211; [ESLint](lint.txt), [build](build.txt), [TypeScript](typecheck.txt):passed. Штатные61 static/SSG pages, next-env восстановлен; deployment не выполнялся.
- [Первый broad run](e2e-initial.json):2passed/1failed/13not-run,60.64s, reset recovery не дошёл до result-count за5s. После этого query-based key перенесён со снятого Suspense на results component. Не объявляется доказанной единственная причина первоначального timeout; повтор проверяет behavior без ослабления assertion.
- [Финальный browser run](e2e.json):20/20,264.65s,unexpected0,skipped0,flaky0,errors=[],retries0. Catalog SEO2 +offer states7 +ordinary-UA/no-JS rendering4 +structured data4 +technical SEO3. Повторы не суммируются; полный product E2E suite не запускался.
- [Sitemap crawl](sitemap-audit.json):244/244 страниц и51 уникальная editorial ссылка вернули200; проверены rendered headings/title/description/canonical/robots. [No-JS captures](no-script-1.json) для четырёх локалей и [статусы unavailable/missing](unavailable-statuses.json) сохранены. [Снимок](no-script.png) просмотрен: видимы один заголовок и фильтры; наличие результатов подтверждено browser assertions, нижняя часть каталога вне этого viewport.
- [Source verification](verification.json):569 runtime/public/Docker файлов совпали с isolated copy, новые tests совпали; existing offer-states отличается только нормализацией test ports. Master plan и next-env.d.ts совпали с исходными snapshots. Свои3125/8125 закрыты; чужие3100/8100 не трогали. JSON/локальные Markdown links/добавленный whitespace проверены.

Test-only guarded fixture/SQLite/.next/3125/8125,reuseExistingServer=false. Подготовка docs/aud05/prepare-e2e.ps1 плюс явные untracked CSS/public; при синхронизации offer-states.spec.ts сохранена normalization8100→8125/3100→3125 и проверено отсутствие8100 в isolated source. SDK get_python_environment: Python3.12.10 из .venv, без installs. Consent false/campaigns disabled, no production writes/paid APIs/real messages. Backend/Python fixtures/config/dependencies unchanged: pytest/PG/Ruff/mypy/Docker build не запускались.

Команда в isolated apps/web с HOPTRIP_TEST_PYTHON=SDK,PLAYWRIGHT_CHANNEL=chrome,APP_ENV=test,DATABASE_URL=sqlite:// и отключёнными alerts/digests/editor/event-sync:

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)seo-rendering\.spec\.ts$' '(^|/)seo-structured\.spec\.ts$' '(^|/)technical-seo\.spec\.ts$' '(^|/)catalog-seo\.spec\.ts$' '(^|/)offer-states\.spec\.ts$' --project=desktop --max-failures=1 --output=test-results-seo01-final --reporter=json
```

SEO crawler viewport независим: desktop project, structured-data cases явно320px. Это не full product E2E, physical-device/accessibility certification, Search Console/live index или production rollout. Rollback только local Suspense/imports/results key и связанное test expectation; metadata/URLs/DB/storage migrations отсутствуют. Откат вернёт зависимость каталога от JS activation и старый initial loading behavior. SEO-02 не начата.
