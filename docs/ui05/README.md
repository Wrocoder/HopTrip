# UI-05 — Feedback and Microinteractions

Дата: 2026-11-01. Статус: DONE. Зависимость UI-01 DONE. Выполнена только UI-05; TECH-01 не начата.

## Проверенное поведение и границы изменений

Использованы существующие client components, dictionaries, live regions и native disabled controls. Framework: Next 16.4.3 / React 19, TypeScript; backend FastAPI в этой задаче не меняется. Прочитаны `apps/web/AGENTS.md`, установленные Next guides `forms.md` и `use-client.md`, предыдущие решения и регрессии.

| Действие | Проверено / изменение UI-05 |
|---|---|
| Сохранение плана | Уже есть подтверждение, duplicate/capacity/corrupt/write-error feedback и saved/unsaved snapshot state. Переиспользованы, без нового toast |
| Удаление сохранённого плана | Уже есть сообщение, отмена последнего удаления и управление фокусом. Переиспользованы; drafts и shared links не удаляются |
| Применение фильтров | Уже есть pending status, disabled form, applied chips, committed sort и result count с role=status. Проверяются, новые routing/analytics rules не вводятся |
| Копирование ссылки | Подтверждён дефект: пока clipboard promise ожидает завершения, остаётся предыдущая save-success надпись. Теперь отдельный localized pending text, disabled/aria-busy на share button; после завершения прежний success либо поле ручного копирования |
| Начало поиска | Уже есть aria-busy/pending status, недоступная submit-кнопка и переход к результатам. Проверяются с управляемой задержкой Server Action |
| Ошибка | Сохраняются inline filter alert/focus, calculator field/summary errors, clipboard fallback, local-storage warnings и OfferState error/retry. Реальные ошибки не заменяются success message |
| Сброс | Фильтры уже показывают applied chips/count и reset semantics. Калькулятор раньше выдавал общий autosave status: добавлено подтверждение очистки после успешного localStorage write, отдельно от сохранённых snapshots/links |

Копирование привязано к exact token. Существующий operation counter защищает от позднего completion после другого save/share; новый pending state очищается только соответствующей операцией. Правки плана скрывают feedback прежнего token. Поле ссылки доступно сразу и после clipboard denial; URL/selection/read-only и stale-link marker прежние. Save во время ожидания copy сохраняет своё подтверждение. Уведомления не исчезают по таймеру.

`TripDraftProvider.save` получил необязательное внутреннее действие `'reset'`, остальные callers прежние. Успех сброса устанавливается только после `localStorage.setItem`; при исключении остаётся прежнее предупреждение о потере новых изменений после reload. Как и раньше, in-memory inputs очищаются даже при недоступной persistent storage. Никакого удаления коллекции saved trips, browser data, других drafts или отзыва shared links.

Новые тексты на PL/EN/RU/UK. `aria-live=polite` / `aria-atomic=true` используют постоянные DOM regions. Новых анимаций, таймеров, CSS, dependencies или визуального framework нет; существующая reduced-motion policy сохранена. Не заявляется реальная проверка речи NVDA/JAWS/VoiceOver.

## Изменённые файлы

- [TripActions](../../apps/web/src/app/components/trip-actions.tsx): clipboard pending и operation-safe completion.
- [TripDraftProvider](../../apps/web/src/app/components/trip-draft.tsx): action-specific reset confirmation после успешного write.
- [Calculator](../../apps/web/src/app/components/trip-budget-calculator.tsx): reset action и atomic live message.
- [budget-copy](../../apps/web/src/lib/i18n/budget-copy.ts), [saved-trip-copy](../../apps/web/src/lib/i18n/saved-trip-copy.ts): два новых сообщения на четырёх языках.
- [Browser tests](../../apps/web/tests/interaction-feedback.spec.ts): три сценария × четыре языка × desktop/mobile, отдельная регрессия before и проверка прежнего поведения.
- Progress/Audit/Decisions/Test Plan и этот каталог: проверенные результаты и границы.

## Проверки

- [Before clipboard regression](e2e-before.json): 0/1, 21.79 s, errors=[], unexpected=1. Ожидалось «Kopiujemy link…», фактически оставалось прежнее save-success. Test harness держит promise незавершённым; это воспроизведённая runtime-проблема, не отсутствие browser clipboard permission.
- [Node unit](unit.txt): 190/190. Новые unit, дублирующие UI state implementation, не добавлялись: важные новые состояния проверяются в браузере.
- [ESLint](lint.txt), [TypeScript](typecheck.txt), [production build](build.txt): passed. Первый lint завершился из-за одного неиспользуемого test parameter; [контекст и оговорка о raw log](lint-initial-context.md). Исправлен только test harness. Build выполнил штатные 61 static/SSG страницы, deployment не выполнялся.
- [Browser acceptance](e2e-acceptance.json): 58/58, 360.79 s, unexpected=0, skipped=0, flaky=0, errors=[], retries=0. Новые 24 cases (три сценария × четыре языка × два профиля), прежние SavedTripWorkflow 18 и TripBudget 16. Before run и final не суммируются. Это выбранный regression set, не полный E2E suite.
- Новые cases: pending/success/denial clipboard и ручной выбор ссылки; hidden stale feedback после правки token; save supersedes pending copy; reset persistence/saved collection/share-link invariants; synthetic quota warning без ложного success и без persistent overwrite; filter alert/focus/held action/pending/committed result/clear. 16 новых scoped axe scans (#trip-save / #calculator) без violations. Все новые cases с reducedMotion=reduce; overflow проверен для calculator на desktop/mobile320. Прежние cases включают duplicate/capacity/corrupt storage/remove/undo/cross-tab/shared-plan/budget/date/integer totals guards.
- Просмотрены все шесть PL captures: [copy desktop](copying-desktop.png), [copy mobile](copying-mobile.png), [reset desktop](reset-desktop.png), [reset mobile](reset-mobile.png), [search desktop](searching-desktop.png), [search mobile](searching-mobile.png). Текст читаем, переносы/controls сохранены. Element screenshots, mobile320 CSS px при device scale factor; не field CWV measurement или проверка системного clipboard/dialog.
- [Финальная сверка](verification.json), [source parity](source-parity.json), [порты](ports.json): 566 runtime/public/Docker files совпали с isolated copy, новый test source совпал; Markdown links/JSON/whitespace проверены, master plan и next-env.d.ts byte-identical исходному task snapshot. Собственные 3125/8125 закрыты; чужие 3100/8100 не трогали. Пользовательские IDE/master plan/предыдущие изменения сохранены. Скрипт проверки: `node docs/ui05/verify.cjs` из repo root после guarded run; port inventory собирается отдельно штатным Get-NetTCPConnection.

## Воспроизведение и безопасность

Изолированная копия `.cache/aud05-ui05`, подготовлена [prepare-e2e.ps1](../aud05/prepare-e2e.ps1). В fresh workspace helper дополнить явным копированием `design-tokens.css`, `saved-trips.module.css`, `destination-card.module.css`, public/media/destinations (3 WebP + CREDITS.md): untracked CSS/public helper автоматически не включает. Приложение использует собственные `.next`, SQLite и loopback 3125/8125 с reuseExistingServer=false. Порты 3100/8100 не переиспользуются и чужие процессы не останавливаются.

Перед каждым fixture startup запрашивался PyCharm `get_python_environment` по `apps/api/tests/e2e_app.py`: Python 3.12.10, `.venv/Scripts/python.exe`, pip. Без installs. В isolated apps/web задать `HOPTRIP_TEST_PYTHON` этому SDK, `PLAYWRIGHT_CHANNEL=chrome`, `APP_ENV=test`, `DATABASE_URL=sqlite://`, `ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EDITOR_ENABLED/EVENTS_SYNC_ENABLED=false`.

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)interaction-feedback\.spec\.ts$' '(^|/)saved-trip-workflow\.spec\.ts$' '(^|/)trip-budget\.spec\.ts$' --max-failures=1 --output=test-results-ui05-complete --reporter=json
```

New tests используют управляемые synthetic clipboard success/denial и quota exception, не системный clipboard и не реальные пользовательские данные. Chrome desktop / mobile emulation 320×844, четыре языка, reducedMotion=reduce. Это не physical-device/Safari/full browser matrix или production smoke. Consent заранее выключен в test-only storage. Никаких forms signup, email/Telegram campaigns, paid APIs или booking.

Backend/pytest/PG/Ruff/mypy/Docker build не запускаются: соответствующие runtime, конфигурация, assets и dependencies не менялись. Существующие unit/readers/calculations и выбранные browser regressions проверяются; полный E2E suite не заявляется.

## Release / rollback

Выпускать согласованную web-сборку компонентов и переводов. API/DB/storage/token/cookie migrations нет. Формулы бюджета, поведение reset, SEO URLs, affiliate parameters, источник/цены/наблюдения, analytics/consent и сохранённые v1 payloads прежние. Rollback только пяти runtime-файлов UI-05 delta; не откатывать весь dirty checkout и предыдущие задачи. Открытые вкладки продолжают использовать загруженный bundle до reload. Production/credentials/infrastructure не менялись.
