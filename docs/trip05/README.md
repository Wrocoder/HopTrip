# TRIP-05 — сохранённые поездки и версии ссылок

Дата: 2026-11-01. Только TRIP-05; зависимость TRIP-01 DONE. Статус: DONE. UI-01 не начата.

## Проверено до изменений

TripActions уже сохранял до20 v1 encoded snapshots в hoptrip.saved-trips.v1, формировал share URL и поддерживал clipboard fallback. TripDraftProvider отдельно сохранял редактируемый local draft, для копии — под copy:token. SharedTripPage уже различал invalid link, отсутствующую/недоступную/прошедшую оферту, сохранял manual budget/events и показывал копию с noindex/no-referrer. Locale/date/people/adults/hotel modes/taxes/buffer/events уже передавались в существующем allowlist. Это переиспользовано, без новой регистрации или облака.

Недостатки: duplicate tokens возвращались повторно; malformed storage молча выглядел пустым и мог перезаписываться при save. SavedTrips читал коллекцию только при mount, не давал success feedback/undo, а сообщение ошибки удаления не очищалось при следующем успехе. TripActions показывал старое сообщение сохранения после изменения плана, сохранённая share link не имела явного признака устаревшей версии. Карточки не поясняли различие immutable snapshot и отдельного editable draft.

Изучены saved/trip pages, TripActions/SavedTrips, shared encode/decode, BudgetDraft/TripDraftProvider/budget/events, localization/storage consumers, unit/browser tests и установленная Next документация use-client/server-client components. Первый новый [unit case](unit-before.txt) до fix воспроизвёл дубликаты (1 failed).

## Поведение

- Новый readSavedTripsState отличает отсутствие/пустую коллекцию от malformed/unsupported/oversized data, отдаёт только валидные v1 snapshots и убирает exact duplicate tokens. Старый readSavedTrips API остаётся совместимым. Limit20 и token6000 не увеличены. Некорректная коллекция явно обозначена, доступные корректные копии можно открыть; save/remove блокируются без автоматической перезаписи исходных данных. Больше20 raw entries и raw>140000 считаются unsupported, не очищаются.
- Save/remove каждый раз читают актуальную коллекцию. useSavedTrips обновляет UI после собственных writes, storage events другой вкладки, focus/pageshow. Изменение не использует устаревший UI array для overwrite. Это browser-local read-modify-write, не атомарная транзакция между одновременно пишущими процессами: cloud/CAS/Web Locks не добавлены.
- Save feedback относится к текущему encoded snapshot: повторное сохранение той же копии не добавляет запись/analytics event; изменение плана показывает unsaved version, не старый success. Новая версия сохраняется отдельной копией, старые копии не перезаписываются по slug. Guard результата clipboard не позволяет позднему завершению предыдущего действия подменить новое сообщение. Сообщения переводятся при render.
- Share URL остаётся самостоятельной неизменяемой копией. После правок видна старая версия ссылки, её содержимое не меняется молча; повторное Share создаёт новую. Clipboard restriction оставляет selectable readonly field. Share работает и при недоступном/повреждённом saved storage, если сам plan валиден.
- Saved list показывает число копий, stay dates, travellers, group PLN sum/unknown costs, past original flight date и просьбу проверить цены/наличие. Это snapshot data, не live quote. Общий текст объясняет, что при открытии также восстанавливается local calculator draft этой копии, если есть; карточка не объявляется live версией несохранённых правок. Past marker следует прежней UTC-calendar policy shared page, не использует edited stay dates вместо даты исходной оферты. Будущая дата не объявляется подтверждением доступности.
- Remove сообщает результат и предлагает undo последнего удаления в текущем component instance. Фокус переходит к Undo; после восстановления — к заголовку списка. Повторный remove отсутствующей копии объясняется, ошибка storage не скрывает список; следующий успех очищает error. Undo читает свежую коллекцию, не отменяет другие изменения; full/corrupt/unavailable failure сохраняет текущие данные и честное сообщение. Удаление из списка не удаляет local drafts и не отзывает shared links. Undo не переживает reload/navigation и относится только к последнему удалению.
- Local-only explanation видна в save point и списке: профиль браузера/устройство, удаление site data, сохранение ссылки для другой среды. Регистрация, cloud sync, новый backend/API contract не вводились.

Все новые строки PL/EN/RU/UK. Storage keys/version/encoded fields/allowlist, provider/affiliate URLs, consent/session/analytics payload rules и public SEO прежние. TRIP_SAVE отправляется только после нового успешного save, undo отдельный analytics event не добавляет. Сам popup/сообщения другим людям не отправляются: Share только формирует/копирует ссылку, как раньше.

## Файлы

- [shared-trip helpers](../../apps/web/src/lib/shared-trip.ts), [shared storage hook](../../apps/web/src/app/components/use-saved-trips.ts).
- [TripActions](../../apps/web/src/app/components/trip-actions.tsx), [SavedTrips](../../apps/web/src/app/components/saved-trips.tsx), [scoped CSS](../../apps/web/src/app/components/saved-trips.module.css), [4 locale copy](../../apps/web/src/lib/i18n/saved-trip-copy.ts).
- Новые [Node](../../apps/web/tests/saved-trip-store.test.mjs) / [browser](../../apps/web/tests/saved-trip-workflow.spec.ts) cases; docs/trip05 и HOPTRIP_PROGRESS/AUDIT/DECISIONS/TEST_PLAN.

## Проверки

[Node](unit.txt):183 passed,6 новых cases — duplicates/distinct copies, missing vs corrupt collection/fail-closed mutation, capacity/no eviction/remove/undo, fresh sequential cross-tab mutation, exact legacy token/manual unknown/zero/adults/taxes/buffer preservation,4 locale copy. [ESLint](lint.txt) / [Next build/TypeScript](build.txt) passed,61 static/SSG pages. Новые E2E types дополнительно проверены отдельным [tsc --noEmit](typecheck.txt); build не запускался параллельно browser.

[Основной browser JSON](e2e.json):48/48 passed,396.12s,unexpected0,skipped0,flaky0,errors=[],retries0. Новые18 cases:4 locales×desktop/mobile с current snapshot/already/dirty feedback, old/new share URLs, remove/undo/focus, exact costs and reload/local-copy restore; cross-tab updates/fresh writes/undo, corrupt collection guard,20-limit/no eviction/full undo failure, quota remove failure→success, past/missing/503 source snapshot preservation. Прежние30 cases shared-trip/trip-parameters/planned-events/budget-modes/budget-recovery прошли. API/Python runtime/DB не менялись; backend/PostgreSQL/Ruff/mypy не запускались. Для изолированной Python fixture SDK получен через PyCharm python-tools/get_python_environment, Python3.12.10/.venv, без installs. Full E2E suite не заявляется.

Визуальная сверка отдельно от48 cases. [Первый focused mobile repeat](e2e-visual-focus.json):1/1 passed,26.29s; [финальный](e2e-visual.json):1/1 passed,23.92s,errors=[],retries0. Focus heading подтверждён, screenshot использует animations=disabled/CSS pixels; runtime source/assertions арифметики/сохранения не менялись. Основной результат и повторы не суммируются.

Просмотрены [desktop320](saved-320-desktop.png) и [mobile320](saved-320-mobile.png). Карточки/суммы/кнопки читаемы, horizontal overflow отсутствует; scoped axe/main в4 locales не выявил violations. На mobile capture global skip-link остаётся поверх части h1 даже после heading focus/отключения анимаций; причина этого focus/capture поведения отдельно не установлена. Глобальные navigation/CSS не менялись, исправление этого наблюдения не заявляется. Dev indicator относится к локальной среде; physical-device/global-navigation QA не заменяется scoped checks.

[Source parity](source-parity.json):556 runtime files apps/api/app + apps/web/src совпали с checkout, включая явно скопированный новый CSS. [Финальная сверка](verification.json): JSON/Markdown links/whitespace/master-plan hash/next-env.d.ts, [свои порты](ports.json) закрыты. Чужие3100/8100 и пользовательские master plan/IDE/предыдущие задачи не затрагивались.

## Воспроизведение и безопасность

Из корня: `npm --prefix apps/web run test:unit`, `npm --prefix apps/web run lint`, `npm --prefix apps/web run build`. После завершения build восстановить generated next-env.d.ts к прежнему dev/types import и проверить отсутствие diff. Создать свежую копию `./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-trip05-new`; существующие каталоги не перезаписывать. Helper включает untracked TS, новый CSS скопировать явно из apps/web/src/app/components/saved-trips.module.css в одноимённый путь isolated copy. Это конкретный публичный source file, не расширение копирования private/env data. Сопоставить runtime source hashes.

Перед fixture запросить SDK через PyCharm get_python_environment для apps/api/tests/e2e_app.py. В isolated apps/web: HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, APP_ENV=test, DATABASE_URL=sqlite://, ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false. HOPTRIP_E2E=1 guarded fixture использует disposable SQLite/fake providers и собственный .next на3125/8125, reuse=false; чужие3100/8100 не останавливать. Build и подготовку копии завершить до E2E.

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)saved-trip-workflow\.spec\.ts$' '(^|/)shared-trip\.spec\.ts$' '(^|/)trip-parameters\.spec\.ts$' '(^|/)planned-events\.spec\.ts$' '(^|/)budget-modes\.spec\.ts$' '(^|/)budget-recovery\.spec\.ts$' --reporter=json
```

Cases используют синтетические plans/values и отдельные browser contexts. Никакой отправки share URL другому человеку, реальных покупок, paid APIs/рассылок/production mutations. Источник unavailable-fixture возвращает503 только в guarded test app. Headless Chrome/mobile emulation/scoped axe не доказывают физические устройства, конверсию или полную WCAG сертификацию.

## Release / rollback / ограничения

Согласованный web release, без DB migrations/storage migration/cleanup cookies. При откате представления сохранить fail-closed read/write guards из helpers/hook: старый writer мог трактовать повреждённую коллекцию как пустую и перезаписать её. Откатывать только TRIP-05 UI/CSS/copy/tests, не весь HEAD. Существующий v1 token array читается старым клиентом; новые UI состояния не записывают новый формат. Старые уже открытые вкладки со старым bundle не получают новую защиту автоматически. Exact duplicate cleanup происходит лишь в памяти при read и при явном успешном write; повреждённая коллекция текущим bundle не перезаписывается. Строки, не являющиеся валидными планами, не становятся ссылками.

Для corrupted/unsupported storage автоматического ремонта/clear не добавлено: валидные доступные ссылки можно сохранить отдельно; исправление/очистка исходных данных остаётся явным действием владельца браузера. Undo не является backup. Совпадение определяется exact token, не логическим сходством маршрута/сумм; отличающиеся версии и старые raw tokens сохраняются независимо. Максимум20 и6000-character sharing limit прежние; приложение не обещает атомарный simultaneous write между вкладками.

Local draft и saved snapshot остаются разными сущностями; сохранённый или переданный plan не подтверждает актуальное расписание/наличие/цены. SharedTripPage по-прежнему сохраняет edits при missing/unavailable/past offer и просит проверить source у продавца. UI presentation modes и event browse category/day/page остаются временными UI settings по прежней политике. Прежние API/cold-entry observations не объявляются исправленными. UI-01 не начата.

TRIP-05 DONE. Progress/Audit/Decisions/Test Plan обновлены. Production не менялся. Следующая доступная задача — UI-01; она не начата. Остановка после этой задачи.
