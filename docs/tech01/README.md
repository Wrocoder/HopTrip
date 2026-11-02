# TECH-01 — Shared Component Refactoring

Дата: 2026-11-01. Статус: DONE. AUD-02 DONE. Только TECH-01; TECH-02 не начата.

## Инвентаризация восьми областей

Проверены текущее дерево Next 16.4.3 / React 19 / TypeScript, компоненты, их реальные consumers, strict build и существующие unit/browser tests. Прочитаны `apps/web/AGENTS.md`, установленные Next guides `use-client.md` / `forms.md`, roadmap/progress/decisions. Backend FastAPI, контракты и инфраструктура этой задачей не меняются. Совпадение native HTML input само по себе не считается причиной объединить разные бизнес-правила.

| Область master plan | Проверенные исходники / решение |
|---|---|
| Flight cards | [DealCard/DealGrid](../../apps/web/src/app/components/catalog.tsx) уже общие для home, catalog/landing и [GuideFlights](../../apps/web/src/app/components/guide-flights.tsx). Editorial [DestinationCard](../../apps/web/src/app/components/destination-card.tsx) представляет город, не flight offer; не объединяем разные сущности |
| Airport selectors | [AirportSelect](../../apps/web/src/app/components/airport-select.tsx) используется общей FilterForm. Его keyboard/open/active/ARIA/list markup дублировали [DestinationSelect](../../apps/web/src/app/components/destination-select.tsx). Вынесены в [combobox.tsx](../../apps/web/src/app/components/combobox.tsx). [AlertForm](../../apps/web/src/app/components/alert-form.tsx) имеет required native select для одной subscription, не free-text origin preference; contract сохранён |
| Date selectors | [FilterForm](../../apps/web/src/app/components/filters.tsx) уже переиспользует dateFields для hero/catalog; departure bounds отличаются от stay dates в [Accommodation](../../apps/web/src/app/components/trip-accommodation.tsx)/[Calculator](../../apps/web/src/app/components/trip-budget-calculator.tsx), independent event dates и subscription bounds. Общие calendar-date/budget-draft/changeStayDate validators уже существуют. Различные min/max/strict checkout/optional dates/controlled и URL drafts не скрываем за новым универсальным DateRange |
| Filter controls | Одна FilterForm для home/catalog/landing, общий preset/search policy. Alert filters представляют отдельный сохранённый subscription payload; calculator и events не являются flight filters. Не вводим вторую форму или новый framework |
| Pricing labels | [Price](../../apps/web/src/app/components/price.tsx), [PriceSummary/PriceAssessment](../../apps/web/src/app/components/price-assessment.tsx), [PriceFreshness](../../apps/web/src/app/components/price-freshness.tsx), общие format/price-assessment helpers уже используются повторно. PLN observation, optional EUR estimate, historical comparison и manual budget amounts имеют разный смысл; не объединяем их в одну неоднозначную цену |
| Warning messages | [FlightQualityNotice](../../apps/web/src/app/components/flight-quality.tsx), PriceFreshness, [OfferState](../../apps/web/src/app/components/offer-state.tsx), словари и CSS tokens уже общие. Inline form errors, event fit и source warnings имеют свои ID/aria-describedby, disclosure и timing; не заменяем их одним generic alert |
| Empty states | OfferState используется home/catalog/detail/errors; DealGrid fallback, saved-trips empty и guide results содержат разные recovery links/context. Общая панель уже есть; отдельные тексты пустой feature не дублируют её бизнес-поведение |
| Loading states | [LoadingDeals](../../apps/web/src/app/components/loading-deals.tsx) использует OfferState. Home recommendation loading тоже OfferState; draft restore и event fetch — локальные async states своих widgets. Сохранены роли, copy и отдельные busy boundaries |

## Реализация и сохранённые контракты

Новый `useCombobox` хранит open/active, общий focus/change/close/choose, стрелки с wrap, Enter/Escape, input ARIA attributes и использует прежний [useActiveOption](../../apps/web/src/app/components/use-active-option.ts) для instant/nearest scroll без переноса DOM focus. `ComboboxOptions` — общий ul/li с прежними listbox/option, IDs, hidden, selected и mouse-down prevention. Два реальных consumers; нет async data layer, form schema, portal, UI library или произвольной системы виджетов.

AirportSelect сохраняет draft.value/text/dirty/locale, matching/normalization, custom validity, optional onSelect, origin cookie/navigation policy и submit-related blur guard. DestinationSelect сохраняет own text/selectedSlug, data-destination-slug, matching on blur и nullable Anywhere option только в hero. Business choose callbacks не перемещены в generic layer. Native input attrs/labels/hints/limits, translations и direct DOM hierarchy прежние. Extra React component не добавляет wrapper element.

Изменены только два consumer source и добавлен `combobox.tsx`; `use-active-option.ts`, CSS, словари, формы и services не исправлялись. Нет изменений sorting/scoring/freshness/data sources/flight prices, storage/cookie formats, affiliate tracking, consent, SEO URLs или APIs. Существующие пользовательские и предыдущие roadmap изменения сохраняются.

## Валидация

- [До рефакторинга](e2e-before.json): 2/2 (PL desktop/mobile), 47.60s, errors=[], unexpected=0, retries=0. Это проходящий public interaction contract до extraction, не воспроизведение нового дефекта. Четыре baseline scoped axe scans без violations.
- [Node unit](unit.txt): 190/190. Существующие matching/search/normalization/locale tests сохранены. Unit tests, повторяющие внутренние setters, не добавлялись.
- [ESLint](lint.txt), [TypeScript](typecheck.txt), [build](build.txt): passed. Обычный npm min-release-age configuration warning не является lint/type error; новых dependencies/installs нет. Build включает штатные 61 static/SSG страницы, без deployment.
- [combobox-contract.spec.ts](../../apps/web/tests/combobox-contract.spec.ts):4 locales×2 profiles; оба поля, wrap в обе стороны, Escape/no mutation, Enter selection без submit/navigation, mouse/tap с input focus, ID refs/error recovery, hero Anywhere/slug-on-blur, scoped axe и overflow. Запускается вместе с airport-search/mobile-picker/origin-selection/filter-workflow regressions.
- [Основной browser run](e2e-acceptance.json):44/44,301.26s,unexpected=0,skipped=0,flaky=0,errors=[],retries=0. Новые ComboboxContract8 + прежние AirportSearch8/MobilePicker8/OriginSelection8/FilterWorkflow12. Все4 locales, desktop1440/mobile320 в новом контракте; прежние short-viewport375×400 geometry, cookie/pending/race/history/filter reset и query preservation scenarios прошли.16 новых scoped axe scans без violations; не полная WCAG certification или весь E2E suite.
- [Fresh comparison](e2e-comparison.json):2/2,23.49s,errors=[],retries=0. Потребовалась одинаковая исходная SQLite fixture: existing short-trips cleanup удаляет WAW между desktop и mobile projects основного набора. [Подтверждённый контекст](fixture-context.md), [before/main/fresh metadata](contracts.json) сохранены. Основной main mobile с3 airport options не выдаётся за тот же registry, что before с4. Fixture и product runtime ради сравнения не менялись, assertions не ослаблялись; before/final/fresh не суммируются.
- Просмотрены6 captures: [before desktop](picker-before-desktop.png), [before mobile](picker-before-mobile.png), [main desktop](picker-main-desktop.png), [main mobile](picker-main-mobile.png), [fresh after desktop](picker-after-desktop.png), [fresh after mobile](picker-after-mobile.png). Before/fresh metadata совпадают (сравнение публичных значений не учитывает generated ID); обе PNG before/fresh пары реально byte-identical. Это доказательство для двух конкретных состояний, не автоматический visual baseline всего сайта. Next dev indicator присутствует; данные synthetic fixture.
- [Финальная сверка](verification.json), [runtime parity](source-parity.json), [порты](ports.json):567 runtime/public/Docker files совпали, новый spec совпал; use-active-option.ts и master plan/next-env.d.ts byte-identical исходному snapshot. JSON/Markdown links/whitespace checked, свои3125/8125 закрыты, чужие3100/8100 не трогали. Существующие IDE/master-plan/предыдущие изменения сохранены. `node docs/tech01/verify.cjs` воспроизводит сверку артефактов после guarded run/port inventory.

## Воспроизведение и безопасность

Изолированная копия `.cache/aud05-tech01` подготовлена [prepare-e2e.ps1](../aud05/prepare-e2e.ps1) с отдельными .next/SQLite, 3125/8125 и reuseExistingServer=false. Helper включает новые TS/TSX, но untracked CSS/public копируются явно: design-tokens.css, saved-trips.module.css, destination-card.module.css, три WebP и CREDITS.md в public/media/destinations. Runtime/test hashes сверяются с checkout. Чужие 3100/8100 не переиспользуются и не останавливаются.

До каждого fixture startup получен SDK через PyCharm get_python_environment по apps/api/tests/e2e_app.py: Python3.12.10, `.venv/Scripts/python.exe`, pip. Без installs. В isolated apps/web: HOPTRIP_TEST_PYTHON этому SDK, PLAYWRIGHT_CHANNEL=chrome, APP_ENV=test, DATABASE_URL=sqlite://, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. Test-only guarded app, synthetic fixture records, consent off, без email/Telegram campaigns/paid APIs/реальных бронирований/production writes.

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)combobox-contract\.spec\.ts$' '(^|/)mobile-picker\.spec\.ts$' '(^|/)airport-search\.spec\.ts$' '(^|/)origin-selection\.spec\.ts$' '(^|/)filter-workflow\.spec\.ts$' --max-failures=1 --output=test-results-tech01-complete --reporter=json
```

Baseline: только combobox-contract.spec.ts с `--grep 'contract in pl$'`, без source extraction в isolated copy. Before и final counts не суммируются. Chrome desktop/mobile emulation, не physical devices/OS keyboard/Safari/реальная screen-reader speech или полная WCAG certification. Новый контракт использует reducedMotion=reduce; прежний UI-03 short-viewport regression проверяет375×400 и actual active-option geometry.

Backend/pytest/PG/Ruff/mypy/Docker build не запускаются: соответствующие runtime/config/assets/dependencies не менялись. Полный E2E suite/новые performance gains не заявляются.

## Release / rollback

Согласованная web-сборка включает два selector consumers и общий combobox module. Rollback только TECH-01 delta: вернуть прежние два selector source, затем удалить новый module, если больше нет consumers. Не удалять use-active-option и предыдущие UI-03/04/05 исправления, не откатывать весь dirty checkout. API/DB/storage/cookie migrations или cleanup не нужны. Production/credentials/infrastructure не менялись; загруженные вкладки продолжают старый bundle до reload.
