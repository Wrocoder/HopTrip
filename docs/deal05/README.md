# DEAL-05 — состояния поиска и восстановление

Дата: 2026-10-31. Выполнена только DEAL-05 после DEAL-02 DONE. DEAL-06 не начата.

## Проверено до изменений

Каталог уже различал пустой результат, ошибку параметров, сбой API и выход за последнюю страницу. Работали Suspense, блокировка формы во время перехода, client-side expiry и запрет перехода к продавцу после истечения срока. Однако пустая выдача предлагала только одно ослабление условий; initial loading, home selection, not-found и error boundary имели разное оформление. На detail сбой API попадал в общий boundary без сохранённого пути возврата. В expiry/partner-unavailable не было явного перехода к актуальному каталогу.

Изучены общий FilterForm, HomeOrigin, catalog/detail/API contract, существующие browser tests и установленная документация Next по loading/error/fetching/metadata. Поддержку direct/stops/time filters и неподтверждённые предложения не добавляем.

## Поведение

| Состояние | Сообщение и следующее действие |
|---|---|
| Initial catalog load | Локализованный Suspense status; подождать или перейти на главную |
| Loading offers | Отдельный статус загрузки; условия остаются в URL, ссылка на главную |
| Filter update | Видимый status, aria-busy и disabled controls; старый URL остаётся применённым до перехода |
| Empty catalog | До трёх ослаблений активных ограничений; другие условия сохраняются |
| Offset за последней страницей | Честный total и переход к первой странице с теми же фильтрами |
| Invalid filters | Исправить условия с фокусом на форме или открыть чистый каталог |
| API failure / 502,503,504 | Ошибка отделена от нулевой выдачи; повтор с теми же условиями или чистый каталог |
| Detail API failure | Сообщение без цены/booking CTA; повтор detail и возврат к allowlisted filtered catalog, noindex |
| Missing detail / not-found | Нейтральное «недоступно», без утверждения о причине; каталог и существующие home actions |
| Home selection loading/error/empty | Общий state panel; retry без сброса draft, каталог, выбор аэропорта или поиск без ограничения 2–4 ночи |
| Offer expires in open tab | Прежнее expiry warning и блокировка seller link; актуальный поиск по origin/destination без старых дат, каталог/refresh |
| Partner unavailable | Прежняя причина без booking link; переход в каталог |
| Uncaught route error | Локализованный boundary: reset или каталог; внутренние исключения пользователю не выводятся |

Общий OfferState задаёт consistent panel, heading, status/alert и переносимые actions с targets минимум44px. Тексты PL/EN/RU/UK. Существующий catalog Suspense покрывает initial load и получение выдачи; глобальный loading boundary не добавляется.

searchRecovery рассматривает budget, обе границы departure, destination, weekend, обе границы duration и origin в этом порядке; UI показывает первые3 доступных действия. Каждое снимает только свою группу и offset, сохраняет остальные условия и sort, ведёт в общий каталог. Снятие лимита цены расширяет допустимый бюджет без выдуманного нового значения; снятие границ дат расширяет диапазон без обещания наличия рейсов. Нет активных ограничений — ссылка на пояснение обновления данных. URL не меняется до выбора действия. Origin preference cookie этим действием не удаляется: это прежняя семантика ослабления applied URL, а не Reset All.

Metadata и body detail используют один request-scoped React.cache outcome. Сбой не сохраняется между запросами; notFound вызывается вне catch. Retry использует обычный anchor для нового запроса, returnTo проходит прежнюю проверку searchReturnPath. Новые recovery Links имеют prefetch=false. Успешный detail, API/query/SQL, score/history, search validation, origin navigation handoff и available affiliate click handler сохранены.

## Проверки

- Node unit:153 passed, включая8 новых проверок recovery ownership, bounds, false/true weekend aliases, zero budget, sort и неизменности входа — [log](unit.txt).
- ESLint с max-warnings=0 — [log](lint.txt); Next build/TypeScript,61 static/SSG pages — [log](build.txt).
- Ruff для изменённой test-only e2e_app.py: passed — [log](ruff.txt). Python через SDK PyCharm, без установки пакетов. Backend/PG/mypy не запускались: production backend не менялся.
- Первый browser набор:31/34 passed,3 unexpected, errors=[],300.53s — [JSON](e2e.json). Все14 новых cases прошли; также прошли8 existing origin-selection cases, проверяющих cookie/URL/drafts/Back и stale-response masking. Два affiliate journey остановились на ссылке аэропорта внутри свёрнутого UX-03 disclosure: [desktop](initial-catalog-desktop-error.md), [mobile](initial-catalog-mobile-error.md). Test setup теперь сначала открывает список; tracking/session/sub_id assertions сохранены. [Localized desktop state case](initial-localized-catalog-desktop-error.md) получил API error вместо empty; причина fetch failure не установлена, никаких assertions для его обхода не ослабляли.
- Финальный browser набор:28/28 passed, unexpected=0, errors=[], retries0,232.86s — [JSON](e2e-final.json). Все3 ранних failed cases повторены с сохранёнными assertions;14 новых cases также прошли. Другая изолированная копия без промежуточного root loading включает404 assertion во всех4 locale cases, existing SEO/canonical tests и новые exact expiry recovery assertions. Повторы не суммируются.
- [Source parity](source-parity.json):549 runtime-файлов apps/api/app + apps/web/src изолированной копии совпали с checkout. [Финальная сверка](verification.json): JSON читаются, Markdown links разрешаются, новые авторские файлы без trailing whitespace; git diff --check исключает прежний пользовательский master plan. next-env.d.ts без diff; свои fixture servers завершены, чужие3100/8100 не трогали.

Browser fixture явно требует HOPTRIP_E2E=1, использует собственные SQLite/.next и3125/8125. Новые synthetic503 detail/list toggle и read-only serialized view с PROGRAM_UNAVAILABLE существуют только в test app. Toggle reset в finally; partner view не изменяет DB. Реальные SMTP/editor/sync отключены, paid integrations не запускались. Порты тестовых исходников меняются только в изолированной копии.

Воспроизведение: из корня `npm --prefix apps/web run test:unit`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run build`. После окончания build подготовить новый workspace через `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-deal05-new`; существующие каталоги не перезаписывать. Для Python-команд предварительно получить SDK через PyCharm get_python_environment. Затем `SDK -m ruff check apps/api/tests/e2e_app.py`. Для browser в изолированном apps/web задать HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, APP_ENV=test, DATABASE_URL=sqlite:// и ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. Не запускать build параллельно с browser. Финальная выборка:

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)offer-states\.spec\.ts$' '(^|/)catalog-results\.spec\.ts$' '(^|/)price-freshness\.spec\.ts$' '(^|/)catalog\.spec\.ts$' '(^|/)localized-catalog\.spec\.ts$' --grep 'honest recovery|initial loading|blocked partner|home failure|total, sorting|empty, invalid|observation and seller|delivery time|airport to deal to partner|catalog canonical' --reporter=json
```

Просмотрены [empty desktop](empty.png), [API error desktop](api-error.png) и [API error320px](api-error-320.png). DOM/axe checks выполняются отдельно от просмотра снимков. [HTTP probe](seo-probe.json) финального runtime: missing localized detail404 с noindex.

## Release, откат и ограничения

Release — согласованный web bundle; прежние backend prerequisites roadmap остаются в силе. Новых миграций, API contracts, dependencies и сохранённых пользовательских настроек нет. Откатить только DEAL-05 изменения state/recovery modules, их imports/render branches, scoped CSS и tests/fixture additions. Не восстанавливать весь HEAD: checkout содержит предыдущие задачи и пользовательские изменения. DB/cookie/localStorage cleanup не требуется.

Headless Chrome с synthetic data не подтверждает production API availability, реальные устройства или полное WCAG соответствие. Общий uncaught boundary проверен кодом/линтером/сборкой, принудительное неизвестное исключение в browser не создавалось. Промежуточный глобальный loading boundary дал HTTP200 для missing detail при noindex; он удалён, чтобы сохранить прежний404. Финальные browser/HTTP проверки подтвердили404, noindex и прежние canonical/alternates. Full E2E/backend suite не объявляется пройденным. Предыдущие наблюдения API/cold-entry reliability остаются открытыми.

Production, инфраструктура, credentials, реальные кампании и affiliate configuration не менялись. Пользовательские master plan/IDE и предыдущие задачи сохраняются. DEAL-05 DONE. DEAL-06 не начата; остановка.
