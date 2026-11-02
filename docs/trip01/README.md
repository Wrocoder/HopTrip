# TRIP-01 — перелёт и переход к партнёру перед планированием

Дата:2026-10-31. Только TRIP-01, зависимость DEAL-01 DONE. TRIP-02 не начата.

## Проверено до изменений

Detail уже содержал flight summary, partner CTA, accommodation, budget/save/share, methodology, activities/events и related guides. Порядок был flight → accommodation → budget/save → methodology → activities/events. TripDetails на detail повторял полное сравнение цены, timestamp и availability disclaimer, которые уже есть в PriceFreshness и ScoreDetails. У критической source quality часть причин на detail оставалась в disclosure. Навигация не имела прямых booking/methodology/attractions anchors.

Изучены detail/metadata/error paths, shared /trip, FlightSchedule/FlightFacts/FlightQualityNotice, TripDetails, Outbound, TripDraftProvider, stay/budget/actions/events и существующие unit/browser tests. Прочитана установленная документация Next по server/client composition. Business logic не заменялась.

## Структура и поведение

1. Destination/origin, offer dates, тип перелёта; видимые цена/база, sample summary и freshness.
2. Краткое расписание с независимыми outbound/return airports, clocks, stops, estimated/UTC/day-shift/open-jaw notices. Полные facts/connections/carriers/baggage остаются в native details.
3. Все причины CRITICAL_INCOMPLETE видны без disclosure. PARTIAL сохраняет прежний краткий warning с дополнительными причинами в details. Classification/recommendation/availability policies не менялись.
4. Именованный booking section с прежними component prices, Outbound CTA/blocked/expired state, passenger/date limitations и affiliate disclosure.
5. Accommodation, затем attractions/events и related guides.
6. Существующий budget с save/share в конце; detailed price methodology — последняя секция.

Белый detail panel и сокращённые отступы отделяют flight decision от планирования. Header/section headings/booking плотнее, без ограничения высоты warnings. Nav targets остаются минимум44px. На обычном desktop booking расположен рядом с summary; mobile сохраняет summary перед booking. Native partner anchor позволяет перейти к CTA без чтения остальных секций.

Новые nav links условны: booking/methodology только на detail, attractions только при существующей подборке, events по существующему supported flag. Все targets уникальны и focusable. Shared /trip defaults не получают отсутствующие booking/score anchors. #trip-flight/#accommodation/#calculator/#trip-save/#score и новые #trip-booking/#destination-activities сохраняют native navigation, returnTo/locale остаются прежними.

Повтор PriceAssessment убран только из detail TripDetails через includePrice=false. Видимые PriceSummary и PriceFreshness сохранены; полная signed comparison/observation/sample/methodology доступна в #score. На карточках прежний TripDetails по умолчанию не менялся. Отдельный повторный budget jump заменён уже существующим пунктом «Бюджет» в nav — тот же #calculator и поля.

Outbound handler, gates/expiry, approved URLs/session attribution, TripDraftProvider, TripAccommodation, TripBudgetCalculator, TripActions, event selection/calculation и share serialization не переписывались. Переупорядочены их вызовы внутри того же provider. API/DB/schema/score/source dates/prices, metadata/canonical/404/noindex paths и dependencies сохранены. TRIP-02/03/04/05 functional redesign не выполнялся.

## Проверки и сохранённые ранние результаты

- [Node unit](unit.txt):160 passed,2 новых cases: conditional/localized nav targets/shared defaults и все critical reasons вне disclosure при сохранённой card/default policy.
- [ESLint](lint.txt), [build](build.txt):passed, TypeScript/61 static/SSG pages. [Первый lint](lint-initial.txt) выявил запрещённое Next имя переменной module в новом test helper; переименовано, unit/lint/build повторены успешно. Python/API/fixture не менялись; backend/PG/Ruff/mypy не запускались.
- [Первый browser набор](e2e.json):26/36 passed,10 unexpected, errors=[],194.67s. В8 новых cases ошибочно ожидался approved CTA у schedule fixture browser-13 без affiliate_program_id: [контекст](initial-detail-fixture-error.md). Test разделён: blocked/recovery проверяется на ней, viewport CTA/plan flow — на approved browser-deal. Два старых round-trip tests ожидали carrier в collapsed card, хотя DEAL-01 перенёс его в details: [контекст](initial-card-carrier-error.md). Carrier/stops/clocks assertions сохранены в соответствующем раскрытии, card summary остаётся компактным.
- [Повтор](e2e-recheck.json):12/12 passed, unexpected0, errors=[], retries0,158.83s. Включены8 новых locales×desktop/mobile,2 corrected round-trip cases и2 existing planned-ticket variants/share/budget cases. Все10 ранних failed cases перепроверены. Первая grep-выборка не выбрала planned-events case; он явно включён в повтор, не выдаётся за первый запуск.
- После просмотра desktop snapshot сокращены header/nav/booking spacing. [Проверка размещения](e2e-final.json):17/18 passed, unexpected1, errors=[], retries0,185.42s. First-fold assertion выявил неполную видимость русского desktop CTA (ratio0.754): [контекст](desktop-ru-first-fold-error.md). Внутренний padding booking дополнительно уменьшен; targets44px, full-text warnings и limits сохранены. Проверка ждёт scrollY=0 перед измерением. [Финальный acceptance](e2e-acceptance.json):12/12 passed, unexpected0, errors=[], retries0,156.54s. Все8 новых locale cases, actual affiliate journey и open-tab expiry прошли на финальном CSS. Дополнительная [проверка самого detail на320px](e2e-narrow.json):2/2 passed,26.72s; в каждом проекте все4 языка, все critical reasons вне disclosure, nav targets≥44px, axe и отсутствие horizontal overflow. Повторы не суммируются.

Новые8 browser cases проверяют complete/partial/critical, все critical reasons без закрытого ancestor, сохранённый flight disclosure, отсутствие duplicate PriceAssessment перед booking, порядок planning sections, unique/focusable nav targets, keyboard flight/partner/score/save, unavailable vs approved CTA, returnTo, source flight href при изменениях stay/adults, shared costs/save/share/reload, shared-page nav defaults, axe и overflow320px. Existing regressions охватывают structured return/open-jaw/unknown airport+UTC, freshness/expiry/seller guard, card/detail observation consistency и methodology, one-way budget navigation, adults/stay synchronization, actual affiliate session/sub_id.

## Воспроизводимость и безопасность

Из корня: `npm --prefix apps/web run test:unit`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run build`. После окончания build подготовить новую копию: `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-trip01-new`. Не перезаписывать существующий workspace и не запускать build одновременно с browser.

Перед fixture invocation получить Python SDK через PyCharm get_python_environment. В isolated apps/web задать HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, APP_ENV=test, DATABASE_URL=sqlite://, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. Existing E2E app требует HOPTRIP_E2E=1, использует собственную SQLite/.next/3125/8125, synthetic fares/schedules и fake event provider. Доставка и платные интеграции не активировались; actual partner redirect test направлен на локальный fixture endpoint. Новых Python routes/DB mutations вне существующих test scenarios нет.

[Source parity](source-parity.json) фиксирует549 runtime files apps/api/app + apps/web/src, совпавших с финальной acceptance копией. [Финальная сверка](verification.json): JSON/Markdown links/whitespace passed, metadata/fetch prefix неизменен после нормализации line endings, next-env.d.ts без diff. Browser raw JSON сохраняются по стадиям, retries0; повторные cases не суммируются и весь suite не объявляется пройденным.

Просмотрены финальные [desktop first screen](acceptance-desktop-available-first-screen.png), [mobile first screen](acceptance-mobile-available-first-screen.png) и [critical detail320px](mobile-critical-detail-320.png). Source-quality fixture с blocked partner и approved flight fixture показаны отдельно; screenshots содержат browser focus ring/локальный Dev indicator. Финальная выборка:

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)detail-layout\.spec\.ts$' '(^|/)price-freshness\.spec\.ts$' '(^|/)catalog\.spec\.ts$' --grep 'flight decision precedes|delivery time|airport to deal to partner' --reporter=json
node node_modules/@playwright/test/cli.js test '(^|/)detail-layout\.spec\.ts$' --grep 'critical flight detail and navigation fit' --reporter=json
```

При нескольких запусках использовать отдельные output directories либо заранее копировать нужные screenshots; здесь narrow run использует собственный output. Новое narrow spec отдельно прошло ESLint после build; [финальный tsc --noEmit](typecheck.txt) также passed со всеми test-файлами. Runtime после финального build не менялся.

## Release / rollback / ограничения

Release согласованным web bundle; прежние backend prerequisites roadmap остаются в силе. Rollback только TRIP-01 detail composition/navigation/component props/dictionaries/scoped CSS и соответствующих tests. Не восстанавливать весь HEAD: в checkout есть предыдущие задачи и пользовательские изменения. Schema/storage keys и snapshot encoding прежние; DB/cookie/localStorage cleanup не нужен.

Critical предупреждения не превращены в новую блокировку partner policy. У отсутствующих/истёкших/blocked links остаются прежние gates и recovery. Synthetic viewport measurements относятся к проверенным fixture names/locales, не обещают идентичного first fold для любой длины реального текста. Headless Chrome/mobile emulation не подтверждают реальные устройства, conversion, usability study или полное WCAG соответствие. Предыдущие API/cold-entry observations остаются открытыми.

Production/credentials/paid APIs/реальные campaigns не затрагивались. Пользовательские master plan/IDE и предыдущие задачи сохранены. Progress/Audit/Decisions/Test Plan обновлены; next-env.d.ts без diff, свои3125/8125 завершены, чужие3100/8100 не трогали. TRIP-01 DONE; TRIP-02 не начата, остановка.
