# UI-04 — Accessibility Audit and Fixes

Дата:2026-11-01. UI-04 DONE; UI-01 DONE. Production не менялся, UI-05 не начата. Цель — продвижение к WCAG2.2AA в проверенных сценариях, не заявление о полной conformant accessibility всего сайта.

## Проверенная область и находки

Изучены shared styles/tokens, формы поиска/жилья/бюджета/событий/alerts, consent, saved/shared plans, price presentation, native dialog и существующие accessibility/mobile tests. Проверены основные templates и интерактивные состояния,4 языка PL/EN/RU/UK. Отдельные editor/admin и все editorial URLs не проверялись.

[Baseline](baseline.json):24 полных axe scans PL1440/RU320 — home/catalog/budget/info/saved-empty/alerts/detail с synthetic events/input errors/saved-populated/shared/dialog/filter-error. violations0/missing ARIA ID refs0. Однако incomplete требует ручного разбора:16 состояний color-contrast и6 состояний aria-prohibited-attr. Нулевой violations не равен отсутствию проблем.

| Находка до fix | Проверка | Изменение |
|---|---|---|
| Удаление последнего planned event оставляло DOM focus на BODY | [Before JSON](remove-focus-before.json), [failing regression](e2e-focus-before.json), [context](removal-before-context.md) | После committed removal focus на #planned-events, если остаются элементы, иначе #calculator |
| `aria-label` на small EUR annotation и generic div сравнения не поддерживается ролью | axe incomplete aria-prohibited-attr, реальные HTML nodes в baseline | EUR explanation — доступный текст; comparison — именуемая group |
| Общий `.deal-price span` применил бы caption layout к новому вложенному тексту | Статическая проверка CSS перед финальным запуском | Caption selector ограничен direct child; inline EUR presentation сохранено |

Первая находка подтверждает отсутствие явной цели DOM focus; не объявляется доказанным поведение всех browser sequential-focus starting points или конкретного screen reader до исправления.

## Исправления

- [PlannedEvents](../../apps/web/src/app/components/planned-events.tsx): ref помечает локальное remove action; effect после commit переводит focus на существующую именованную секцию. Восстановление storage/обычное редактирование не захватывают focus. После последнего удаления секция events отсутствует, calculator остаётся доступной целью. Таймеров, изменения hash/history, нового undo/feedback copy нет.
- [Price](../../apps/web/src/app/components/price.tsx): видимое «≈ EUR» имеет aria-hidden, полное прежнее localized пояснение NBP/date/rate доступно как текст .sr-only. Tooltip title сохранён. Неподдерживаемый aria-label удалён. Нет придуманного EUR при отсутствии rate/price; loading/freshness/rounding/network loader прежние.
- [PriceAssessment](../../apps/web/src/app/components/price-assessment.tsx): role=group делает существующий label допустимым именем группы. Числа/ограничения/порог сравнения и disclosure не менялись; новый landmark не добавлен.
- [CSS](../../apps/web/src/app/globals.css): уже существующий visually-hidden helper сделан общим; price caption rule применён только к direct child, чтобы вложенный visible EUR span оставался inline. Это не display:none для доступного текста и не маскировка overflow страницы.

Видимые строки/переводы, API/Python/fixtures/DB/quote/scoring/budget/affiliate/SEO/consent/storage payload contracts не менялись. Новых dependencies нет. Все новые event/rate values — явно synthetic tests, не новые product данные.

## Проверка требований UI-04

| Область | Фактическая проверка / предел |
|---|---|
| Contrast | Axe+разбор incomplete;21 существующая token pair в Node; live foreground/gradient endpoints/control border/SVG arrow ratios без округления. Не field-wide visual contrast certification |
| Input labels | Видимые input/select/textarea/button имеют accessible name; ID references существуют; native labels/legends сохранены |
| Keyboard | Skip→content, native combobox существующих regressions, Enter/Shift+Tab/Escape вmodal, removal обоих вариантов |
| Focus | Consent choose→settings; modal close→trigger; planned removal→events/calculator; forced colors visible outline |
| Dialog | Native :modal/background isolation, named dialog/close, browser UI boundary допускается без custom trap |
| Errors | Filter error/invalid field focused; budget/event invalid inputs связаны с видимыми translated descriptions; axe на error states |
| Icon buttons | Score close имеет localized name и44×44; стрелки/крестики, дублируемые текстом действия, декоративны |
| Target sizes | Измерены visible buttons и modal close; baseline UI-03 target matrix сохранена.24×24AA с исключениями отличается от product preference44px |
| Screen-reader semantics | Browser accessibility snapshots: named group, plain EUR explanation, calculator context. Реальные NVDA/JAWS/VoiceOver не запускались |
| Reduced motion | prefers-reduced-motion убирает card hover transform; forced-colors сохраняет системный focus без custom shadow |

Нормативный контекст: [W3C error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html) требует текстового описания обнаруженной ошибки; [ARIA1.2](https://www.w3.org/TR/wai-aria-1.2/) ограничивает именование generic roles. [Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) —3:1 для необходимых визуальных cues, с исключениями; [target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) —24CSSpx либо соответствующие условия spacing/equivalent/inline/native controls. Маленький checkbox отдельно от активирующего label не объявляется автоматически нарушением. Product44px policy UI-01/03 не подменяется утверждением о44px во всех AA случаях.

## Incomplete checks и ручная оценка

- Non-text-only стрелки/ⓘ/× имеют aria-hidden и сопровождаются именованным текстовым действием; не заменяют единственную подпись.
- Select background-image — существующая SVG стрелка: foreground/border/background и primary stroke проверяются computed styles/ratios. Gradient section — min contrast по обоим известным endpoints и solid surfaces; это консервативная оценка данных цветов, не raster sampling всего сайта.
- Короткие date labels/counts используют те же проверенные text colors. Modal sticky header/scroll clipping требует просмотра текущего viewport; incomplete overlaps не скрывались exclusions и сохраняются в raw reports.
- Неподдерживаемые generic aria-label исправлены; final tests требуют отсутствия incomplete, кроме разобранного color-contrast. Незавершённый color-contrast не выдаётся за автоматически пройденное правило.

## Исполненные проверки

[Node](unit.txt):190 passed.2 новых deterministic server-render cases — все4 localized EUR explanations как text alternative и отсутствие annotation при missing rate/price; rate4/date fixture, без network. Они используют прежний настоящий approximation helper, не добавляют fake rate в продукт. Прежние188 cases включают21 contrast pair, money/validation/price/store contracts. [ESLint](lint.txt), [Next build](build.txt), [TypeScript](typecheck.txt) passed; generated next-env.d.ts восстановлен к dev/types imports.

Этапы сохранены отдельно:

- [Первый collector](e2e-audit.json):0/2,24 scans завершены; consent-stage setup failed, поскольку init script заново записывал consent при reload. [Исправленный collector](collect.spec.ts) открывает settings штатно; initial consent реально проверяется final tests. Это не полностью зелёный baseline run.
- [Before removal regression](e2e-focus-before.json):0/1,19.87s, реальный focus BODY до product fix.
- [После focus fix](e2e-focus-only.json):20/20,267.19s,errors=[],retries0. Этот прогон предшествует двум semantic fixes, не объявляется финальным для них.
- [Color-check stage](e2e-colors-initial.json):0passed/1failed/27not-run,29.67s, max-failures1. [Context](contrast-checker-context.md): checker не расширял minified #fff в #ffffff, поэтому ошибочно дал text ratio3.454. Trace показывает исходные colors; product palette не менялась. Parser исправлен, anchors white/white=1 и black/white=21 обязательны; raw colors пишутся до assertions.

[Окончательный acceptance](e2e-acceptance.json):28/28 passed,370.67s,unexpected0,skipped0,flaky0,errors=[],retries0.8 новых core cases (4 locales×desktop/mobile), прежние planned-events6/consent6/price-labels8. Фокус после удаления первого и последнего event, exact250.25→230.25→200.25PLN known totals, ошибки/labels/dialog/consent/reduced-motion/forced-colors/сохранение и прежние price/affiliate/session contracts прошли. Повторы не суммируются; full E2E suite не заявляется.

[64 full-page scans](audits.json):violations0/missing ID refs0, non-color incomplete0. В56 states остаётся разобранный color-contrast incomplete; это не64 автоматически пройденных contrast tests. [Computed samples](colors.json):8 profiles, min selected text5.8037687589:1, border3.5693186899:1, arrow7.6802002350:1, без округления перед сравнением. [Targets](targets.json):152 button samples min48px width/44px height, modal close отдельно44×44; это не подсчёт всех уникальных targets сайта. [Accessibility trees](semantics.json):полное EUR explanation доступно текстом во всех8 profiles, group иcalculator context проверены. [Сводка](checks.json).

Просмотрены [consent320](consent-mobile.png), [dialog320](dialog-mobile.png), [price desktop](price-desktop.png)/[mobile](price-mobile.png), [focus320](removal-focus-mobile.png). EUR остаётся inline и видимые суммы/сноски читаемы; tiny shared helper не выносит доступный текст в display:none. Local dev indicator иsynthetic fixture data не часть production UI. Actual screen-reader speech/physical devices не проверены.

[Source parity](source-parity.json):566 runtime/public/Docker files isolated copy совпали с checkout. [Финальная сверка](verification.json):test parity, JSON/local Markdown links/whitespace, master-plan hash сохранён, next-env.d.ts без diff. [Свои3125/8125](ports.json) закрыты; чужие3100/8100 и прежние пользовательские/IDE изменения сохранены.

## Воспроизведение / безопасность

Из корня: `npm --prefix apps/web run test:unit`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run build`; затем `npx tsc --noEmit` в apps/web. Root build закончить до browser acceptance/copy; вернуть generated next-env.d.ts к прежним dev/types imports, проверить отсутствие diff.

Создать свежую `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-ui04-new`. Helper включает TS/TSX, но не untracked CSS/public: явно скопировать design-tokens.css, saved-trips.module.css, destination-card.module.css и4 media/destinations files в соответствующие paths. Private/env allowlist не расширять; source/asset hashes сверить. Collector/focus-before specs из этого каталога копировались в isolated tests для before-change evidence; после fix они не воспроизводят прежний дефект.

До fixture startup запросить PyCharm get_python_environment по apps/api/tests/e2e_app.py: .venv/Python3.12.10,pip, без installs. В isolated apps/web: HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, APP_ENV=test, DATABASE_URL=sqlite://, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. Guarded HOPTRIP_E2E synthetic app/fake event responses/disposable SQLite, свои3125/8125/.next,reuse=false. Чужие3100/8100 не трогать.

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)accessibility-review\.spec\.ts$' '(^|/)planned-events\.spec\.ts$' '(^|/)consent\.spec\.ts$' '(^|/)price-labels\.spec\.ts$' --max-failures=1 --output=test-results-ui04-complete --reporter=json
```

Chrome desktop/mobile emulation320,4 locales; не Safari/physical devices/full-site WCAG conformance. Optional real EUR branch в браузере проверяется только если опубликована conversion, обе availability branches детерминированно проверяются в Node. Никаких реальных bookings/emails/рассылок/paid APIs/production writes; alert page только читалась, signup не выполнялся. Backend/PG/Ruff/mypy/Docker build не запускались: соответствующие runtime/config/assets/dependencies не менялись. Одна read-only screenshot попытка вне runner получила connection refused после его остановки; final captures выполняются внутри guarded tests.

## Release / rollback

Согласованный web release включает focus effect и price markup/CSS helper/selector. Rollback только UI-04 delta, не всего dirty checkout/предыдущих задач. При откате EUR markup сохранить доступный text alternative либо возвращать styling согласованно; удаление sr-only helper отдельно сделает пояснение видимым. API/DB/storage/cookie migrations не нужны. Форматы drafts/tokens и affiliate URLs не меняются. Production deployment не выполнялся; открытые вкладки используют загруженный bundle.

UI-04 DONE. Progress/Audit/Decisions/Test Plan обновлены. Production не менялся. UI-05 не начата; остановка после UI-04.
