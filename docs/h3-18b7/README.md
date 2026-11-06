# H3-18b7 — измеримость Save / revisit

**DONE в рамках аудита, 2026-11-06; H3-18 IN_PROGRESS.** Только тесты и документация. Новая метрика возврата не добавлена: текущий контракт её не обосновывает. [Verification](verification.json), [паритет](parity-summary.json).

## Подтверждённое поведение

| Наблюдение | Evidence / ограничение |
|---|---|
| Save → auto-open | TripActions после successful commit отправляет TRIP_SAVE и вызывает window.location.assign(localPlanPath). Во всех8 сочетаниях PL/EN/RU/UK × desktop/mobile затем пришёл PAGE_VIEW(saved_trip), **без ручного возврата**. Такая последовательность не доказывает revisit. |
| Идентичность плана | Browser открыл A, reload A, вернулся к A через локальную страницу без tracker, открыл B и shared A. Семантические поля пяти событий одинаковы. Случайные event_id/anonymous_session_id исключены из сравнения явно; каждый прогон фактически дал **5 разных sessions**. PAGE_VIEW не содержит plan ID, revision, local/shared kind или navigation cause. |
| Hash-only | Shared A → local A изменяет показанный план без нового PAGE_VIEW. PageTracker зависит от pathname/query, без hash. |
| Простой | При принудительном старении touched больше30мин план сохранился, после reload session ID сменился. Browser case **не изолирует timeout от hydration-сброса ниже**. Код sessionContext задаёт30мин, без постоянного visitor ID. |
| Denied | Save, переход в список и настоящее повторное открытие работают;0analytics requests и нет stored session ID. Нулевой received count не означает0usage. |
| Сервер | НовыйAPI-test: произвольные private plan IDs/causes/URL отбрасываются, остаётся bounded page_type. TRIP_REVISIT/PLAN_REOPEN/trip_revisited дают422. Synthetic Save/view/new-session оставляют returning_visitors=unavailable/null. |

[Трассы](traces/) содержат event/page types, псевдонимы сессий и диагностический возраст/stack; без plan tokens/budget payload/реальных пользовательских данных. Browser reporter относится к синтетическому локальному окружению.

## P1: сессия сбрасывается при hydration — CONFIRMED локально

Initial browser run: **20pass/10fail**, [JSON](browser.json), [лог](browser.txt). В8 Save cases ошибочно ожидалось сохранение ID; ещё2case ошибочно сравнивали payload с random session ID. Падения сохранены, это не green first run.

Повторный audit записывает смену ID отдельно. Тестовая обёртка Storage.removeItem вызывает оригинал с прежними аргументами/результатом; в собственный sessionStorage пишет только факт удаления/возраст/path/stack. **8/8** трасс показали удаление существующей hoptrip.session.v2 на /trip при stored analytics=true, согласии и сессии моложе60секунд. Save и auto-open во всех8cases оказались в разных sessions.

Stack сопоставлен с production chunk 3avbpx5l_rll3.js: clearSession (колонка15773), consent effect (колонка1048). ConsentControls использует useSyncExternalStore с server snapshot="", initial analytics=false и effect clearSession. Это объясняет сброс свежей сессии при full document hydration с действующим consent. Unit sessionContext не покрывал этот React путь. Межстраничные funnel/cohort/session denominators могут искажаться; production масштаб не измерен, cross-page consistency не считать доказанной.

**Следующая отдельная H3-18b8:** исправить consent hydration/session lifecycle; проверить стабильность ID/dedup/source/campaign при reload/full/client navigation/locale switch и сохранение denial/revocation/expiry/no-replay/blocked-storage. Исправление runtime **не выполнено вb7**.

## Решение и совместимость

Сохранить returning_visitors **unavailable/null**. PAGE_VIEW(saved_trip), повтор TRIP_SAVE и TRIP_UPDATE не доказывают возврат человека к тому же плану. Даже после session fix отсутствие plan/cause/visitor identity останется ограничением. Возможный future explicit local-reopen event требует отдельного определения, исключения auto-open/reload/share и описания покрытия; здесь tracker не добавлен.

17wire names/taxonomyv4/API/schema/DB/retention/dependencies/consent/UI прежние. Реальных KPI/baseline-after/uplift нет. Сравнение периодов требует одинакового coverage; данные с session churn могут иметь несопоставимые знаменатели.

## Проверки

| Проверка | Результат |
|---|---|
| Новый5case + origin/engagement/usage/funnel API | **104passed**,2 прежних warnings: [лог](api.txt), [JUnit](api.xml) |
| Полный Node unit | **331passed**,0skipped: [лог](node.txt) |
| Production Chromium | **30unique latest passed** =14audit +16existing TRIP_UPDATE regression; initial20pass/10fail, повтор только10affected→10pass: [JSON](browser-final.json), [лог](browser-final.txt) |
| ESLint / TypeScript | Full lint PASS [лог](lint.txt), affected final lint PASS [лог](lint-final.txt); tsc --noEmit --incremental false PASS [лог](types-final.txt) |
| Ruff / IDE | НовыйAPI-test PASS [лог](ruff.txt); [IDE build](ide-build.json) limited diagnostics, не замена Next build |

Fresh isolated .cache/aud05-h3-18b7-20261106; synthetic API/local plans, ports8125/3125. Reused production build **tX41skKr_3OJY_fpf8cjU** изb4 через .next junction: web source/public/package/lock/tsconfig совпадают с build source, **677runtime files** совпадают с текущей copy; финальный spec равен копии. [parity.mjs](parity.mjs), [verify.mjs](verify.mjs). Нового Next build нет: runtime delta этой части0. Python report changes b6 присутствуют в fixture API. Новых установок нет.

FullAPI/mypy не повторялись: Python runtime не менялся. Последний fullAPI **b6**:1187pass/1known Telegram fixture-date fail/18PGskip, не новый результатb7. Вылет2026-11-06T09:00Z уже прошёл; этот тест здесь не исправлялся. Axe/visual/manualSR/WebKit/physical devices/fieldCWV заново не проверялись. H3-17/H3-14 gates остаются открыты.

## Воспроизведение / откат

Из корня, Python через PyCharm SDK3.12.10 после environment preflight:

```powershell
.venv/Scripts/python.exe -m pytest apps/api/tests/test_saved_revisit_observability.py apps/api/tests/test_origin_cohorts.py apps/api/tests/test_engagement_usage.py apps/api/tests/test_usage_dashboard.py apps/api/tests/test_ordered_funnel.py -q
node docs/h3-18b7/parity.mjs
node docs/h3-18b7/verify.mjs
```

В isolated web: HOPTRIP_H3_PRODUCTION=1, PLAYWRIGHT_CHANNEL=chrome, HOPTRIP_TEST_PYTHON=SDK; npm run test:e2e -- saved-revisit-observability.spec.ts trip-update-analytics.spec.ts --trace=off --reporter=line,json. JSON output path направить в docs/h3-18b7. Повтор10affected: --grep 'automatically emits|same observable view shape'. Init instrumentation только в тесте.

Rollback: удалить только новые apps/api/tests/test_saved_revisit_observability.py, apps/web/tests/saved-revisit-observability.spec.ts, b7 docs/additions. Сохранить накопленные H3/.idea/разрешённую очистку; общие dirty файлы изHEAD не восстанавливать. Нет deploy/real notifications/affiliate transactions/paid APIs. Далее отдельнаяb8; здесь остановка.
