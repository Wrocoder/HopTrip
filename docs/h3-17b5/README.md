# H3-17b5 — воспроизведение React dev diagnostic

2026-11-05. **Диагностическая часть H3-17b5 DONE; сообщение не исправлено. H3-17 IN_PROGRESS.** Scope по §1.2 V3: воспроизвести прежний conditional-use diagnostic, локализовать стек и сравнить один сценарий в dev/production. H3-14/18 не начинались.

## Результат

| Режим | Функциональный тест | Conditional-use | Pageerror |
|---|---:|---:|---:|
| Next dev |6/6 PASS |6/6 запусков |0 |
| Next start / NODE_ENV=production |6/6 PASS |0/6 запусков |0 |

Это **два project cases (desktop/mobile), каждый повторён трижды в каждом режиме**, а не12уникальных сценариев. Существующие assertions не менялись: задержанный origin preference POST, полный поиск до его завершения, ожидаемый URL с WRO/Milan/300, сохранённый бюджет, Back и отсутствие зависшего loading state.

[Dev reporter](dev-before.json), [dev raw/стеки](dev-artifacts), [production reporter](production.json), [production raw](production-artifacts), [машинная проверка](verification.json). Автоматических retries/skips/flaky нет. Dev PASS означает успешный поиск; диагностическое сообщение сохраняется отдельно и не превращается в «ошибок нет».

## Локализация

**H3-17-F02 / CONFIRMED / OPEN / P2:** сообщение `This library called use()` появляется при перекрытии Server Action сохранения аэропорта и полного поиска. Стек: bundled React `trackUsedThenable → useThenable → use → Next InnerLayoutRouter`. В установленном `next/dist/client/components/layout-router.js:222` deferred RSC читается через useDeferredValue, а ветви deferred/null вызывают use(). В bundled `react-dom-client.development.js:8064` проверяется завершение приостановленного рендера и выводится диагностическая ошибка.

Установленные версии: Next16.4.3, root React19.0.0; фактически в этом стеке Next bundled React **19.3.0-canary-278794d7-20261002**. Root React удовлетворяет локальному peerDependencies Next. [Версии/хэши исходников](verification.json). В HomeOrigin/FilterForm нет прямого вызова use(); там useTransition/useOptimistic, Server Actions и router navigation. Это локализация стека, **не доказательство конкретного upstream-багфикса или отсутствия ошибки интеграции**.

React-проверка development-only. Поэтому отсутствие сообщения в production не доказывает устранение причины. В шести production-повторах не обнаружено функционального сбоя проверенного поиска; весь продукт/другие гонки этим не сертифицированы. Неизвестная первопричина остаётся открытой P2-диагностикой. Пакеты и node_modules не исправлялись; сообщение не подавлялось. Проверенного основания для изменения пользовательского поиска или обновления зависимостей пока нет.

## Изменения и проверки

В существующий `tests/filter-workflow.spec.ts` добавлен **опциональный диагностический сборщик**:

- HOPTRIP_RUNTIME_AUDIT=1 записывает console errors/pageerrors, stack/location и фактический runner command/NODE_ENV; raw JSON и attachment сохраняются после каждого случая.
- HOPTRIP_RUNTIME_ENFORCE=1 вместе с audit проваливает тест при conditional-use сообщении. Использован для production, dev выполнен в observation mode с сохранением всех сообщений.
- Без audit flag обычный workflow сохраняет прежние assertions и поведение. Это test flags, не настройки приложения/аналитики.

[314Node](node.txt), [ESLint](lint.txt), [TypeScript](types.txt) PASS;IDE build success с limited diagnostics. Application/API/schema/SEO/consent/Drive/affiliate/saved/budget/dependencies unchanged по hash в обеих копиях. Новой application build здесь нет:использована неизменённая production17b3 **B03jo9a_4GShaLeB8HAfD** ([его build](../h3-17b3/build.txt)); новый код только test hooks. API unit tests/Ruff/mypy не повторялись, Python runtime/fixtures не менялись.

## Воспроизведение

Dev: fresh `.cache/aud05-h3-17b5-20261105`, обычный prepare-e2e (без -Production), synthetic operator/airport/weekend/destination fixtures. Production: принадлежащая текущим H3 копия17b3, исходники приложения совпадают с dev/root. В обеих собственные API8125/web3125, reuseExistingServer=false; серверы запускаются последовательно и закрываются runner. Перед новым CLI test-results сохранены в отдельный каталог.

Перед каждым fixture CLI получен PyCharm SDK:Python3.12.10, `.venv/Scripts/python.exe`. HOPTRIP_TEST_PYTHON=SDK executable, PLAYWRIGHT_CHANNEL=chrome, HOPTRIP_RUNTIME_AUDIT=1. Для production дополнительно HOPTRIP_RUNTIME_ENFORCE=1.

```text
npm run test:e2e -- filter-workflow.spec.ts --grep "full search wins" --repeat-each=3 --trace=off --reporter=line,json
npm run test:unit
npx --no-install eslint tests/filter-workflow.spec.ts --max-warnings=0
npx --no-install tsc --noEmit --incremental false
```

Production flags/данные/уведомления/партнёрские переходы не затронуты. Нет установки пакетов, удаления документации/изображений, PR/commit/deploy. Предыдущие H3/IDE изменения сохранены.

Rollback: убрать только новые imports и opt-in hooks из filter-workflow по [before](filter-workflow-before.ts); прежние сценарии оставить. Application rollback/migration не нужны. Не восстанавливать общий файл целиком из HEAD.

Следующая отдельная часть **H3-17b6 — оставшиеся SSR/cache release checks**. Open P2 framework diagnostic, historical cross-tab root cause, WebKit/manual screen reader/физические устройства/полевые CWV и полный release gate сохраняются в ограничениях. H3-14 externally blocked,H3-18 отдельно. Здесь остановка.
