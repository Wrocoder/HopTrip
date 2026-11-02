# UI-01 — Design System

Дата: 2026-11-01. UI-01 DONE; AUD-03, UX-01, DEAL-01 имеют статус DONE. UI-02 Destination Imagery и UI-03 mobile redesign не начаты. Проверен локальный checkout, production не менялся.

## Проверенное исходное состояние

В globals.css уже были зелёная палитра HopTrip, локальные DM Sans/Fraunces, shared .button/.cta, badges/cards, native ScoreTrigger dialog, OfferState и reduced-motion rules. Поэтому новая UI library/React abstraction не нужна. Изучены глобальные styles, шесть feature modules, реальные consumers/catalog/detail/saved/consent, keyboard handlers и прежние Node/Playwright cases; перед изменениями прочитана установленная Next документация CSS.

Пробелы: отдельные widgets повторяли hex/radius/shadow и расходились в геометрии controls; класс .button-secondary применялся, но собственного variant definition не имел. Граница поля #DFE7DF на #FCFDFB имела вычисленный contrast1.2374:1, event control #A8BCB4 на white —1.9967:1. Это измерение выбранных границ, не заключение о всех декоративных borders. Общий focus-visible не включал select/textarea, trip input использовал другой focus mechanism. Mobile skip-link overlay был наблюдением TRIP-05; исходная причина тогда не установлена.

## Изменения

Канонические semantic colors, typography, spacing, radii, shadows, control/target sizes, focus и motion находятся в [design-tokens.css](../../apps/web/src/app/design-tokens.css). Подробная спецификация и правила повторного применения: [HOPTRIP_DESIGN_SYSTEM.md](../HOPTRIP_DESIGN_SYSTEM.md). Существующие brand aliases сохранены; синяя starting palette из плана не вводится вместо действующего бренда. Выбраны роли, проверенные на контраст, а не новые названия без использования.

- [globals.css](../../apps/web/src/app/globals.css): primary/secondary/disabled buttons, native text fields/select/textarea, focus/forced-colors, cards16px/panels24px, pills, consent actions, error/unavailable/empty/loading presentation, modal scrim и reduced-motion card hover.
- Шесть CSS modules: accommodation, calculator, events, planned events, destination activities и saved trips используют общие control/card/semantic state roles. Feature layout, responsive breakpoints и отдельные typography sizes не унифицированы насильно; это основа системы, не утверждение, что каждый CSS literal удалён.
- Controls48px, compact actions минимум44px; shared control radius10px и contrast boundary #758B81. Secondary — surface/primary text/видимая граница, pressed mode отличается фоном, не имитирует focus outline. Disabled native behavior сохранён, hover movement убран.
- Focus3px с separating shadow, включая select/textarea/tabindex; forced-colors — системный Highlight/no shadow. Skip-link скрывается fixed top:-100vh, показывается при focus без transform/transition и снова уходит за экран после перехода в content. Его href/target/handlers сохранены.

Runtime изменения ограничены CSS: TSX/JS handlers, тексты четырёх языков, расчёты/валидация, source data/quality, filter URL/server actions, SEO metadata, consent/session/affiliate tracking, local drafts/tokens/keys и API/DB contracts не менялись. Loading CSS проверяется test-only markup существующего класса, без публичного demo route/нового async data path. Изображения/paid providers не добавлены.

## Проверки

[Node](unit.txt):186 passed, в том числе3 новых meaningful cases — contract/aliases и21 unrounded contrast pair (14 text≥4.5:1,7 control/focus≥3:1). [Contrast before/after](contrast.json). [ESLint](lint.txt), [Next build](build.txt) и дополнительный [TypeScript](typecheck.txt) прошли;61 static/SSG pages. Build завершён до browser startup; generated next-env.d.ts восстановлен к исходному dev/types import.

Первый [browser run](e2e-initial.json):32/40 passed,8 failed,354.30s,errors=[],retries0. Все30 прежних cases consent6/detail-layout10/event-flight-fit2/price-assessment6/shared-trip6 прошли. Из10 новых cases прошли2 state/media cases;8 locale/project cases остановились на новом предположении о native dialog focus. Это не полностью зелёный прогон.

[Read-only focus probe](modal-focus-probe.json) показал при первом Shift+Tab document.hasFocus=false/active BODY при всё ещё modal dialog, а при следующем — последний link внутри dialog. Затем Tab проходит обратную границу, Escape возвращает trigger focus. Это согласуется с переходом фокуса к browser UI; конкретный элемент browser chrome DOM-пробой не определён. [Исходный failure context](initial-modal-context.md) сохранён. Новый test допускает только focus внутри dialog либо отсутствие document focus с active BODY; следующий Shift+Tab обязан вернуть focus внутрь. Product dialog/native background isolation не переписан под ошибочное ожидание теста.

[Промежуточный repeat](e2e-locator.json):2/10 passed,8 failed,164.10s,errors=[],retries0. После modal проверки cases дошли до настоящих stay/budget controls, затем новый test искал буквальный .modes, хотя CSS Modules создаёт scoped имя. [Context](initial-locator-context.md) сохранён. Locator заменён существующими aria-controls/aria-pressed, computed style requirements и functional assertions не ослаблены; runtime CSS после исходного build не менялся.

Финальный [acceptance](e2e-acceptance.json):10/10 passed,104.95s,unexpected0,skipped0,flaky0,errors=[],retries0. Восемь cases PL/EN/RU/UK×desktop/mobile проверяют реальный search submit/server action/query, primary/secondary/card/modal/control geometry/colors, keyboard/Escape/return focus, aria-invalid/disabled hover, skip-link show/hide, computed focus, scoped axe и320px overflow. Ещё2 cases проверяют actual empty/API503/saved-past warning presentation, reduced-motion loading CSS probe, native keyboard skip-to-content и forced-colors select focus. Все30 прежних cases прошли в initial run; итоговые10 проверяют новые сценарии целиком. Это не единый зелёный full-suite run, результаты повторов не суммируются.

Просмотрены [dialog desktop](dialog-desktop.png)/[mobile](dialog-mobile.png), [calculator320 desktop](calculator-320-desktop.png)/[mobile](calculator-320-mobile.png), [saved320 desktop](saved-focus-320-desktop.png)/[mobile](saved-focus-320-mobile.png). Text/buttons/states читаемы, горизонтальный overflow отсутствует в проверенных состояниях; длинный modal сохраняет scroll. Local dev indicator на снимках не часть production UI. На новых saved/calculator captures overlay skip-link не воспроизводится. [Восемь focus measurements](focus.json): budget-flight focused, skip top−844px и bottom<0, transform none/transition0; keyboard Tab всё ещё показывает skip, Enter фокусирует content и скрывает link. Это подтверждает результат нового механизма в выбранных сценариях, не доказывает единственную исходную причину TRIP-05 screenshot artifact и не заменяет physical-device QA.

[Source parity](source-parity.json):557 runtime files apps/api/app+apps/web/src совпали с checkout, включая два явно скопированных CSS. [Финальная сверка](verification.json): test parity, JSON/local Markdown links/whitespace, master-plan hash, next-env.d.ts без diff. [Собственные порты](ports.json) закрыты, чужие3100/8100 не трогали. Пользовательские master plan/IDE и предыдущие задачи сохранены.

## Воспроизведение и безопасность

Из корня: `npm --prefix apps/web run test:unit`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run build`; затем `npx tsc --noEmit` в apps/web. Не запускать build одновременно с browser. После build восстановить generated next-env.d.ts к прежнему dev/types import и проверить отсутствие diff.

Создать свежую isolated copy `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-ui01-new`, не перезаписывать существующую. Helper не включает untracked CSS: явно скопировать публичные source files apps/web/src/app/design-tokens.css и apps/web/src/app/components/saved-trips.module.css в одноимённые пути копии. Проверить source hashes; private/env files не добавлять в allowlist.

Перед Python fixture запросить PyCharm get_python_environment для apps/api/tests/e2e_app.py. Использован SDK .venv/Python3.12.10, pip, без installs. В isolated apps/web: HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, APP_ENV=test, DATABASE_URL=sqlite://, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. Guarded HOPTRIP_E2E fixture использует синтетические данные/disposable SQLite и свой .next/3125/8125, reuse=false. Чужие3100/8100 не трогать.

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)design-system\.spec\.ts$' '(^|/)detail-layout\.spec\.ts$' '(^|/)price-assessment\.spec\.ts$' '(^|/)consent\.spec\.ts$' '(^|/)shared-trip\.spec\.ts$' '(^|/)event-flight-fit\.spec\.ts$' --reporter=json
```

Focused repeats: только exact design-system spec, отдельные `--output=test-results-ui01-final` и `--output=test-results-ui01-acceptance`, чтобы не удалить initial contexts/screenshots. Повторы не суммировать. Chrome desktop/mobile emulation, scoped axe и вычисленный contrast не заменяют physical-device/screen-reader/full-site WCAG audit. Backend runtime и fixture unchanged; pytest/PostgreSQL/Ruff/mypy/full E2E не запускались. Реальные бронирования/кампании/рассылки/paid API/production writes не выполнялись.

## Release / rollback

Согласованный web CSS bundle: tokens импортируются globals, modules рассчитывают на те же variables. При rollback убрать только UI-01 CSS delta/новый import и вернуть прежние значения/rules из снимка до этой задачи; не откатывать весь dirty checkout или предыдущие задачи. Не удалять saved-trips.module.css целиком: он создан в TRIP-05. Документацию/tests откатывать согласованно. DB migrations, storage/cookie cleanup, API rollout не нужны. Открытая вкладка использует свой загруженный bundle; mixed/частичный CSS rollout не проверялся.

UI-01 DONE. Progress/Audit/Decisions/Test Plan обновлены. Production не менялся. UI-02 не начата; остановка после UI-01.
