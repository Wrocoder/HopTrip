# UI-03 — Mobile UX Optimization

Дата:2026-11-01. UI-03 DONE; UX-01/DEAL-01/DEAL-02/TRIP-01 DONE. Production не менялся, UI-04 не начата.

## Что проверено до изменений

Изучены существующие global/scoped responsive styles, AirportSelect/DestinationSelect, FilterForm, navigation, dialog, trip widgets/local draft/returnTo contracts и прежние mobile/viewport tests. Новая компоновка всей страницы не требовалась: native даты/поля, responsive cards, progressive disclosure, focus и общий trip draft уже существовали.

[Collector](collect.spec.ts), [baseline JSON](before.json): PL/RU ×320/375/390/768/1440px ×home/catalog/detail =30 page states. В этих состояниях document width равен viewport; видимые даты имеют font16px/height≈50px. На375/390 hero date inputs149.5/157px, в остальных layouts шире; это измерение, не доказательство native picker clipping. Поэтому формы дат и их breakpoint не переписывались.

Подтверждены проблемы:

- Language links≈35.05px высотой, первый≈41.05px шириной — меньше принятой в UI-01 compact touch target44px.
- На375×400 keyboard ArrowUp выбирал последнюю airport option, но listbox находился y412.91–672.91, активная строка y619.88–695.06, scrollTop0: пункт был вне списка и окна. aria-activedescendant менялся без прокрутки. Оба combobox использовали одинаковый механизм.

Первый collector завершился после30 состояний ошибкой неоднозначного `.airport-select input` (origin+destination). [Исходный JSON](e2e-audit-initial.json)/[context](initial-audit-context.md). Locator уточнён по name, продукт ещё не менялся. [Полный повтор baseline](e2e-audit.json):1/1,42.40s,errors=[],retries0. Это сбор текущего состояния, не acceptance без замечаний.

## Изменения

[Общий hook](../../apps/web/src/app/components/use-active-option.ts) вызывается из [AirportSelect](../../apps/web/src/app/components/airport-select.tsx) и [DestinationSelect](../../apps/web/src/app/components/destination-select.tsx). При expanded/active он прокручивает реальный option в ближайшую видимую область с instant/nearest, оставляя DOM focus в text input. Учитываются реальные размеры/scroll containers, без fixed scroll offsets, таймеров, новых keyboard bindings или дублированной логики выбора. Мышь/Enter/Escape, matching, validation, onBlur submit ownership и URL/cookie policy прежние.

[globals.css](../../apps/web/src/app/globals.css): list max-height=min(260px,40dvh), overscroll containment/scroll padding; language links минимум44×44px; back link и existing preset help summary минимум44px. Focus/scroll не меняет search/plan state. Нет overflow:hidden для маскировки размеров, нового sticky overlay, закрытых предупреждений или замены native dates/selects.

Остальные navigation/search/filter/card/detail/budget/modal layouts переиспользованы и проверяются в matrix. Content/4 locale copy/SEO/indexability/affiliate/consent/API/Python/fixture/DB/calculations/storage contracts не менялись, новых dependencies нет. Изменение — поведение прокрутки активной подсказки и размеры целей, не новая data/business policy.

## Проверки

[Node](unit.txt):188 passed; новых mirror-CSS unit tests нет. [ESLint](lint.txt), [build](build.txt), дополнительный [TypeScript](typecheck.txt) прошли. Generated next-env.d.ts восстановлен к прежним dev/types imports; root build завершён до browser acceptance.

Первый [smoke](e2e-smoke.json):4/5 passed,27.31s — все4 locale picker cases прошли; новый full workflow упал на hit-test. [Повтор с ожиданием](e2e-flow.json):0/1,19.33s. [Диагностика](e2e-diagnostic.json):0/1,16.15s показала duration_min в закрытом advanced details; elementFromPoint попадал в следующий catalog paragraph. Начальная гипотеза о незавершённой прокрутке не подтвердилась. [Исходный context](initial-workflow-context.md). Тест теперь сначала открывает disclosure, затем проверяет поля; hit/geometry/query/суммы assertions сохранены. Product form не переписан под test setup. [Focused workflow](e2e-flow-final.json):1/1,24.50s,errors=[],retries0.

[Финальный acceptance](e2e-final.json):38/38 passed,542.20s,unexpected0,skipped0,flaky0,errors=[],retries0.24 новых cases (20 workflow+4 picker),14 прежних (filter-workflow6/navigation4/origin-selection4). Все5 widths×4 locales прошли полный workflow. Query, native dates/values, exact budget/save/share/reload, unchanged partner href иreturn context assertions сохранены. [20 workflows/100 width measurements](workflow.json), [8 активных options в4 locales](pickers.json): активный пункт вlist/viewport, focus остаётся на input. Повторы и baseline не суммируются с38; full suite не заявляется.

Просмотрены baseline и новые captures поиска [320](home-320.png)/[375](home-375.png)/[390](home-390.png)/[768](home-768.png)/[1440](home-1440.png), [picker375×400](picker-short.png), calculator768/1440. Поля/кнопки/даты читаемы, overflow не выявлен в проверенных состояниях. Снимки используют CSS pixels/animations disabled; synthetic fixture values и локальный dev indicator не относятся к production UI.

На длинном [element screenshot calculator768](calculator-768.png) снова появился skip-link поверх содержимого. Отдельный [probe](focus-probe.spec.ts), [результат1/1](e2e-focus.json),13.81s,errors=[],retries0: live DOM до/после capture показывает skipFocused=false/top−844px/bottom−790.41px, focus на Share button/затем budget-flight; link не вviewport. [Обычный viewport capture](probe-viewport.png) перекрытия не показывает, но [element capture](probe-element.png)/[после явного input focus](probe-focused-element.png) всё ещё содержит надпись. [Замеры](focus-probe.json) и обе формы evidence сохранены. Это согласуется с capture artifact; единственная точная причина не установлена. Не заявляется, что все длинные captures исправлены, или что проведена проверка compositor/physical devices. Runtime skip-link mechanism UI-01 не менялся. Первый read-only probe попытался открыть уже остановленную fixture и получил connection refused; фактическая проверка выполнена отдельным guarded runner, counts отдельно от38.

[Source parity](source-parity.json):566 runtime/public/Docker files isolated copy совпали с checkout. [Сверка](verification.json): browser tests parity, JSON/Markdown links/whitespace, master-plan hash сохранён, next-env.d.ts без diff. [Собственные порты](ports.json) закрыты; чужие3100/8100, master plan/IDE и предыдущие изменения не затрагивались. Docker build не повторялся: Dockerfile/assets/dependencies unchanged, frontend build выполнен.

| Область UI-03 | Проверка в workflow / прежних regressions |
|---|---|
| Navigation | Visible/hit-tested site links,44px language targets, native detail anchors, explicit return/Back/Forward |
| Airport/destination | Real matching + keyboard selection, visible active option in short viewport, focus/Enter/Escape |
| Date selection | Actual fixture departure dates, stay/end sync, native values/Escape/16px font/geometry |
| Search/filter panel | Touch submit/server action/URL, open advanced fields, price sort, applied filters; prior draft/pending/reset ownership |
| Cards | Actual approved flight link, price dialog entry, destination context preserved |
| Detail | Focusable sections, reachable partner CTA, source seller href unchanged after planning |
| Calculator | Exact known subtotal646.90PLN, people/dates/selected hotel mode, short viewport/hit test, reload/save/share fallback |
| Dialogs/keyboard | Native score modal bounds/close target/Escape/return focus; combobox virtual focus stays on input |
| Layout | Document width vs viewport in5 workflow phases, before/after captures; no clipping/masking added |

## Воспроизведение и безопасность

Из корня: `npm --prefix apps/web run test:unit`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run build`; `npx tsc --noEmit` в apps/web. Вернуть generated next-env.d.ts к прежним dev/types imports и проверить diff. Root build не запускать одновременно с browser; static lint/tsc не используют .next из browser copy.

Создать свежую `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-ui03-new`. Helper включает untracked TS/TSX, но не CSS/public: явно скопировать design-tokens.css, saved-trips.module.css, destination-card.module.css и4 public media/destinations files в соответствующие paths. Для baseline скопировать collect.spec.ts из этого каталога в isolated tests/ui03-audit.spec.ts до изменений. В уже подготовленную baseline copy после build перенесены только UI-03 source/tests; runtime hashes проверяются отдельно. Private/env allowlist не расширять.

Перед каждым fixture startup получить PyCharm SDK через get_python_environment по apps/api/tests/e2e_app.py: использована .venv/Python3.12.10, pip, без installs. В isolated apps/web: HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, APP_ENV=test, DATABASE_URL=sqlite://, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. Guarded HOPTRIP_E2E synthetic fixture/disposable SQLite, свои3125/8125/.next, reuse=false. Чужие3100/8100 не трогать.

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)mobile-workflow\.spec\.ts$' '(^|/)mobile-picker\.spec\.ts$' '(^|/)navigation\.spec\.ts$' '(^|/)origin-selection\.spec\.ts$' '(^|/)filter-workflow\.spec\.ts$' --project=desktop --output=test-results-ui03-acceptance --reporter=json
```

Workflow overrides viewport/isMobile/hasTouch для5 ширин;320/375/390/768 используют touch и реальные tap действия,1440 — pointer. Engine — headless Chrome, project name desktop не означает отсутствие overrides.4 locales во всех5 widths. Высота400px — проверка уменьшенной видимой области, не настоящий OS keyboard. Native inputmode/значения/Escape/focus/hit-tested reachability проверяются; физические iOS/Android клавиатуры, Safari/WebKit и screen reader не объявляются проверенными. Clipboard в тесте принудительно использует существующий selectable link fallback и не изменяет clipboard пользователя.

Backend/PG/Ruff/mypy/full E2E не запускались: API/Python/fixtures unchanged. Нет реальных бронирований/сообщений другим людям/кампаний/paid APIs/credentials или production writes. Scoped axe не является полной UI-04/WCAG сертификацией.

## Release / rollback

Согласованный web bundle: оба combobox и общий hook плюс CSS. Rollback только UI-03 delta: убрать вызовы/imports нового hook и его файл, вернуть прежние listbox/target rules; не откатывать весь dirty checkout/предыдущие задачи. Нет API rollout, DB/storage migration или cookie cleanup. Существующие drafts/URL/сохранённые snapshots продолжают использовать прежние форматы. Открытая вкладка меняет поведение после загрузки нового bundle; production deployment не выполнялся.

UI-03 DONE. Progress/Audit/Decisions/Test Plan обновлены. Production не менялся. UI-04 не начата; остановка после UI-03.
