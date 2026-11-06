# H3-18b8 — согласие при hydration и жизненный цикл сессии

**DONE локально; H3-18 IN_PROGRESS.** Scope: один подтверждённый P1 из [аудита b7](../h3-18b7/README.md). Дата2026-11-06. Реальные KPI/retention не измеряются. [Итоговая verification](verification.json).

## Что было и что меняется

ConsentControls получает пустой server snapshot из useSyncExternalStore. Во время первой hydration analytics=false не обязательно означает фактический отказ. Прежний effect clearSession удалял hoptrip.session.v2 даже с действующим stored consent. [Новый regression test на прежней production-сборке](browser-before.json) воспроизводит **1failed**: после reload ID не совпадает с первоначальным. Исторический b7 подтвердил8/8 Save→auto-open разрывов.

Изменён **один runtime-файл**, apps/web/src/app/components/consent-controls.tsx: effect проверяет analyticsAllowed() непосредственно перед clearSession/track вместо использования промежуточного render analytics. Render snapshot по-прежнему управляет UI и зависимостью effect. Track также сохраняет собственную проверку consent. Поэтому действующий выбор не очищает сессию на hydration; отсутствующее/повреждённое/просроченное/будущее согласие и фактический отказ по-прежнему запрещают отправку и очищают ID. Повторный effect PAGE_VIEW дедуплицируется прежним механизмом.

SessionContext, session key/UUID algorithm,30-minute sliding timeout,180-day consent lifetime, allowlists, no-referrer/no-retry/dedup, marketing Drive effect и тексты4locale не менялись. Никаких новых event fields/visitor IDs/DB/schema/API/deps/flags. [Точная правка](runtime-delta.patch), [до изменения](consent-controls.before.tsx.txt).

## Acceptance / проверки

Новый apps/web/tests/consent-session-navigation.spec.ts содержит15cases × desktop/mobile =30проверок:

- PL/EN/RU/UK: один session ID и один PAGE_VIEW на документ при initial load/reload/Save auto-open/полном переходе в saved; source/campaign сохраняются.
- Настоящий PL Next Link оставляет документ, четыре language-switcher anchors меняют документ; ID/source/campaign сохраняются, по одному PAGE_VIEW на переход.
- Denied stale ID удаляется; grant даёт новую сессию; действия до grant/после revoke не воспроизводятся; повторный grant после reload создаёт новый ID.
- Absent/expired/future/malformed consent:0requests и удаление существующей сессии.
- Сессия29мин сохраняется при reload;30мин меняет ID. Это устраняет hydration confound из b7 expiry probe.
- Storage event из другой вкладки: revoke подавляет tracking и очищает shared ID, regrant создаёт общую новую сессию без replay.
- Заблокировано только session storage: in-document memory fallback, после full reload новый ID. Заблокирован весь localStorage: без consent0events; явный grant действует в памяти документа, после reload снова требуется согласие. Калькулятор работает в обоих случаях.
- Заблокирован transport: отсутствие retry при consent rerender, калькулятор работает, reload не сбрасывает действующую сессию.

Дополнительно прежние saved-revisit audit14, TRIP_UPDATE16 и consent6cases (включая axe consent-panel и marketing boundary): всего **66cases**, без отключения тестов/правил axe. Новые session tests требуют202 для наблюдаемых ответов; отдельно ожидают ответы всех событий, кроме TRIP_SAVE, чьё keepalive немедленно теряет исходный документ и не обещает наблюдаемого Page.response. Synthetic blocked-transport case намеренно abort. Проверки работают с реальным production React hydration, а не mock-компонентом. В init script меняются только синтетические тестовые данные/условия storage; отдельный document nonce доказывает client/full navigation.

| Проверка | Результат / evidence |
|---|---|
| Before production | **1failed**, ожидаемое несовпадение ID после reload: [JSON](browser-before.json), [лог](browser-before.txt) |
| After production, initial | **64passed/2failed**: [JSON](browser.json), [лог](browser.txt); обе ошибки в новых mobile tests, исходные контексты в [initial-errors](initial-errors/) |
| После уточнения test synchronization | **10/10passed**, повтор всех affected (8Save journeys +2cross-tab): [JSON](browser-final.json), [лог](browser-final.txt). **66unique latest passed** =30new +36regression; не green first run |
| Node unit | **331passed**,0skipped: [лог](node.txt) |
| API contract / saved-revisit / origin / engagement / usage / funnel | **104passed**,2 прежних deprecation warnings: [JUnit](api.xml), [лог](api.txt) |
| ESLint / TypeScript | Full lint PASS [лог](lint.txt); tsc --noEmit --incremental false PASS [лог](types.txt); финальные affected проверки PASS: [lint](lint-final.txt), [types](types-final.txt) |
| Fresh Next production build | **PASS**, qP2Xrg9nIoRzElLcG3RHK: [лог](build.txt) |
| Source/build parity | **677runtime files +4browser specs** соответствуют isolated copy, runtime delta ровно1component: [summary](parity-summary.json), [manifest](source-parity.json) |
| IDE build | success с limited diagnostics: [JSON](ide-build.json), не замена Next build |

Первое mobile-падение —5s timeout полного response counter после Save/navigation. Начальная трасса не позволяет установить, какой именно ответ не был наблюдаем. Обязательный Page.response для keepalive Save не следует из best-effort контракта; test helper теперь различает captured action/observable acknowledgement, сохраняет transport.json с event names/statuses/failures, требует остальные responses и проверяет все наблюдаемые202. Второе — ожидание grant PAGE_VIEW в фоновой вкладке после слишком быстрого revoke→grant: общий session key уже удалён другой вкладкой, но это ещё не доказывает выполнение React effect в первой. Тест foregrounds вкладку и через test-only removeItem observer ждёт реальную локальную clearSession, затем проверяет regrant. Runtime после initial run не менялся. [Первоначальный spec](consent-session-navigation.initial.spec.ts.txt) сохранён; итоговый повтор включает все10затронутых cases, не весь ранее успешный набор.

Fresh .cache/aud05-h3-18b8-20261106 подготовлена прежним prepare-e2e.ps1 -Production; fixed8125/3125, existing node_modules junction, отдельная новая .next. Before использует сохранённую b7/b4 сборку tX41skKr_3OJY_fpf8cjU, её web source совпадает с before manifest; после — новая сборка текущего runtime. Синтетические fixture API/operator JSON, не production. Сохранены real command outputs и before failure. Служебные ошибочные запуски ESLint из корня и grep с начальным ^ исправлены запуском из web и корректным фильтром; приложение ими не менялось.

FullAPI/Ruff/mypy не повторялись: Python runtime/test files не менялись. Последний fullAPI b6 —1187pass/1known Telegram fixture-date fail/18PGskip, это не новый результатb8. Исторические b7 artifacts не переписаны. ManualSR/WebKit/physical devices/fieldCWV/staging не проверялись; H3-17/H3-14 gates прежние. Это не полный UI/SEO/performance audit.

## Границы выводов

Исправление устраняет подтверждённый сброс, но не восстанавливает старые события и не доказывает production coverage. Для сравнения периодов учитывать границу session fix; старые funnel/cohort denominators могут отличаться из-за churn. Стабильность ID доказана на проверенных journeys при доступном хранилище, не означает полноту аналитики/идентификацию человека/объединение устройств. Hash-only gap и отсутствие plan/cause в PAGE_VIEW остаются; Save auto-open не revisit, returning_visitors остаётся unavailable/null.

## Воспроизведение / rollback

Из корня: node docs/h3-18b8/parity.mjs и node docs/h3-18b8/verify.mjs после сбора [trace JSON](traces/).8/8 прежних auto-open traces теперь показывают sameAnonymousSessionAcrossAutoOpen=true и sessionRemovals=[];2ambiguity cases имеют1session на5views, но смысловое отсутствие plan/cause сохраняется. Node/lint из apps/web. Python — только через настроенный PyCharm SDK после environment preflight:

```powershell
.venv/Scripts/python.exe -m pytest apps/api/tests/test_saved_revisit_observability.py apps/api/tests/test_origin_cohorts.py apps/api/tests/test_engagement_usage.py apps/api/tests/test_usage_dashboard.py apps/api/tests/test_ordered_funnel.py -q --junitxml=docs/h3-18b8/api.xml
```

В isolated web: HOPTRIP_API_URL/NEXT_PUBLIC_API_URL=http://127.0.0.1:8125, NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3125, HOPTRIP_OPERATOR_FILE=synthetic operator fixture; npm run build. Браузер: HOPTRIP_TEST_PYTHON=SDK, PLAYWRIGHT_CHANNEL=chrome, HOPTRIP_H3_PRODUCTION=1, PLAYWRIGHT_JSON_OUTPUT_NAME=путь отчёта; npm run test:e2e -- consent-session-navigation.spec.ts saved-revisit-observability.spec.ts trip-update-analytics.spec.ts consent.spec.ts --trace=off --reporter=line,json. Повтор10affected: consent-session-navigation.spec.ts --grep 'accepted session survives|consent storage events'. После test-only изменений новая сборка не требовалась, final tsc/lint выполнены отдельно.

Rollout не выполнен. Для отката вернуть только import/effect из runtime-delta.patch и убрать новый spec/docs additions. Не заменять общие dirty файлы изHEAD; сохранить prior H3/.idea/разрешённую очистку. API/DB rollback не требуется; новые сессии не склеивать задним числом. Нет deploy/real notifications/affiliate transactions/paid APIs/dependency install. Следующая отдельная часть H3-18 — privacy-safe locale cohorts, затем device и сопоставимые реальные периоды; не начаты здесь.
