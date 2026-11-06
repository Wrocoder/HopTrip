# H3-18b2 — аналитика явного Update плана

2026-11-06. **H3-18b2 DONE локально; H3-18 IN_PROGRESS.** Scope по §1.2 V3 ограничен одним отсутствовавшим событием `trip_updated → TRIP_UPDATE`. Открытие дополнительных сведений и завершённый бюджет — следующие отдельные части.

## Основание и минимальное изменение

H3-12 уже реализовала постоянный ID/revision и явный Update, а H3-18a зафиксировала отсутствие аналитического события. Историческая формулировка v1 «Update ещё нет» больше не описывает продукт. До изменения новый API-тест воспроизвёл **422 literal_error** для `TRIP_UPDATE`: [api-before.txt](api-before.txt). Старый baseline сохранён: [taxonomy v1](../h3-18a/taxonomy.json); текущее сопоставление — [taxonomy v2](taxonomy.json).

Три runtime-изменения: дополнить одинаковые allowlist в `apps/api/app/schemas/analytics.py` и `apps/web/src/lib/analytics-context.ts`; после успешного `store.mutate(update)` в `trip-actions.tsx` вызвать прежний `track("TRIP_UPDATE")` только при `status=updated` и возвращённом плане. [Точный delta относительно начала выполнения](runtime-delta.patch). Все прежние H3/IDE изменения и разрешённые удаления сохранены.

| Исход действия | Новое событие |
|---|---|
| Изменённый snapshot успешно записан в существующий ID | TRIP_UPDATE, при действующем analytics consent |
| Открытие, reload, ввод в draft, Share | Нет |
| already/no-op, busy/pending, conflict/absent, quota/error | Нет |
| Save / Duplicate | Прежний TRIP_SAVE, без TRIP_UPDATE |
| Delete / Undo | Прежнее поведение, без TRIP_UPDATE |

Новых строк UI нет: все существующие подписи, сообщения и четыре языка сохранены. API модель БД использует строковое имя события, поэтому миграции не требуются. Schema/storage/writer/locks/shared links и бизнес-логика не менялись.

## Согласие, приватность и совместимость

Согласие проверяет прежний `track` непосредственно после commit, включая ожидание Web Lock. Если согласие отозвано во время ожидания, запись выполняется, событие не отправляется. Принятие согласия не воспроизводит прошлые изменения. Ошибка аналитики не блокирует локальный Update.

Браузер отправляет только прежние случайные `event_id`, `anonymous_session_id`, имя события и bounded `metadata.page_type=saved_trip` (также возможны прежние разрешённые source/campaign). Нет ID плана, revision, token, share URL, дат, бюджета, заметок или нового visitor ID. Общие правила redaction, no-referrer, session idle30min, consent expiry/revocation и транспорт не менялись. API-тест подтверждает отбрасывание подложенных plan/budget/token metadata и отказ от unrelated search/partner/filter/activity contexts.

Действуют прежние action dedup1000ms, server event_id uniqueness и best-effort/no-retry. Два быстрых независимых Update могут объединиться: без передачи ID плана их ключи одинаковы. Это наблюдаемый счётчик, не надёжный журнал всех изменений. Публичный POST не доказывает согласие или реальность локального commit.

Существующий защищённый `summary.by_event.TRIP_UPDATE` возвращает новый счётчик отдельно от TRIP_SAVE. Usage `PRODUCT_EVENTS` включает событие в received events/sessions автоматически; новая стадия search funnel или метрика returning не добавляется. Население usage может расшириться — нельзя сравнивать периоды с разным покрытием как одинаковые. Старые клиенты совместимы с новым API; новый web на старом API получит422 только для аналитики, локальный Update сохранится. При последующем разрешённом rollout сначала API, затем web; откат web до сужения API allowlist.

## Проверки

| Проверка | Результат | Evidence |
|---|---|---|
| API baseline до изменения | 64 passed | [лог](api-baseline.txt), [JUnit](api-baseline.xml) |
| Node baseline | 13 passed | [лог](node-baseline.txt) |
| API analytics/usage/funnel + новые6 cases | **81 passed**, 2 warnings | [лог](api.txt), [JUnit](api.xml) |
| Все Node tests | **323 passed**, 0 skipped | [лог](node.txt) |
| Первый новый browser набор | 12 passed / 2 failed | [JSON](browser.json), [лог](browser.txt) |
| Исправленный consent case + новый revoke-during-lock | 4/4 passed, desktop/mobile | [JSON](browser-consent-final.json), [лог](browser-consent-final.txt) |
| Уникальные browser cases по последнему результату | **16 passed**, retries0 | [verification](verification.json) |
| Fresh production build / TypeScript | PASS / PASS после финального test delta | [build](build.txt), [types](types-final.txt) |
| Full ESLint + final affected lint | PASS | [lint](lint.txt), [final](lint-final.txt) |
| Ruff / mypy | PASS / 122 source files PASS | [ruff](ruff.txt), [mypy](mypy.txt) |
| Полный API suite | **1126 passed / 1 failed / 18 PG skipped**, 2 warnings | [лог](full-api.txt), [JUnit](full-api.xml) |

Полный API suite **не зелёный**: независимое падение `test_telegram.py::test_real_api_to_queue_to_mock_telegram_journey`. Фикстура `offer()` по умолчанию вылетает **2026-11-06 09:00 UTC**; прогон выполнен после этого времени. Обновление last_verified_at не переносит вылет. Истёкший рейс правильно исключается из digest.

Сбой повторён отдельно [на текущем коде](telegram-recheck.txt) и [в изолированной копии с pre-change analytics schema](telegram-before.txt), с тем же ожиданием sent1/фактом0. Диагностический прогон с **единственным изменением входной фикстуры: departure=now+7days** прошёл1/1 ([лог](telegram-future-fixture.txt), [environment](telegram-probe-environment.json), [probe source](telegram-date-probe.py)). Это локальный probe с mock Sender; исходники теста Telegram и runtime не изменены. Этот проход не заменяет результат полного suite и не считается исправлением теста. Предупреждения — прежние Starlette/httpx и anyio deprecation.

Два первоначальных browser failures: ожидание `toBeDisabled()` могло принять pending Update за завершённый, затем тест читал revision3 вместо4. Только в consent case добавлена проверка `aria-busy=false` после каждой записи; приложение не менялось. Повторены затронутые2 случая; добавлены2 revoke-during-lock. Остальные12 успешных случаев не повторялись, поэтому итог16 — совокупность явно указанных прогонов, не один first-run green.

Браузер проверил: четыре языка, настоящий POST202 нового события на fixture API, одно событие на успешный Update, стабильный ID/revision, opening/edit/share/reload/duplicate без лишнего Update; denial/revocation/no replay; отзыв во время lock wait; quota/reload recovery; ad blocker не отменяет запись; pending/already/conflict. Случай `already` принудительно подставляет identical snapshot под блокировкой, чтобы проверить эту редкую ветку. Реальных планов/пользователей не использовалось. Нового UI нет; новый axe/визуальный sweep/WebKit/manual screen reader не выполнялись и здесь не заявляются.

Изолированная production-копия `.cache/aud05-h3-18b2-20261106`, API8125/site3125, PyCharm Python3.12.10, Chrome desktop/mobile. Сборка **T0SP041Yg88N0Xkfu_QAW**, runner `next start`, `NODE_ENV=production`, no reuse, served BUILD_ID guard. [Паритет675 source/dependency/public файлов](source-parity.json); временный Next config добавляет только workspace turbopack.root. Собственные fixture-серверы завершены Playwright; чужие процессы не останавливались. На подготовке исправлены неверно названные пути копирования test helpers; финальная копия содержит все3 импортируемых fixture модуля, airport JSON и synthetic operator. Dependencies не устанавливались, исходный `.next` не перезаписывался.

Основные команды из корня, с настроенным SDK перед каждым Python invocation:

```powershell
.venv/Scripts/python.exe -m pytest apps/api/tests/test_trip_update_analytics.py apps/api/tests/test_product_analytics.py apps/api/tests/test_usage_dashboard.py apps/api/tests/test_ordered_funnel.py apps/api/tests/test_funnel_analytics.py -q
.venv/Scripts/python.exe -m pytest -q
.venv/Scripts/python.exe -m ruff check apps/api/app/schemas/analytics.py apps/api/tests/test_trip_update_analytics.py
.venv/Scripts/python.exe -m mypy apps/api/app
node docs/h3-18b2/verify.mjs
```

Web commands в `apps/web`: `npm run test:unit`, `npm run lint`. В изолированной copy: `npm run build`, `npm run typecheck`, `npm run test:e2e -- trip-update-analytics.spec.ts --trace=off --reporter=line,json`. Build и start используют одинаковые `NEXT_PUBLIC_API_URL=http://127.0.0.1:8125`, `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3125`; Playwright — `HOPTRIP_TEST_PYTHON=<SDK>`, `PLAYWRIGHT_CHANNEL=chrome`, `HOPTRIP_H3_PRODUCTION=1`. Final subset: `--grep 'denial and revocation|consent revoked while'`. IDE build result — `ide-build.json`, диагностика ограничена; compiler proof — фактические CLI build/types.

## Откат и следующий запуск

Без нового feature flag. Удалить только три runtime-добавления из [delta](runtime-delta.patch) и новые тесты; не восстанавливать общие файлы целиком из HEAD, не трогать предыдущие H3/IDE и разрешённую очистку. Исторические аналитические записи можно оставить: rollback не удаляет данные и не меняет retention.

Production не опрашивался и не изменялся; deploy, реальные уведомления/партнёрские транзакции и KPI/uplift не выполнялись/не измерялись. **Далее отдельная H3-18b3 — `offer_details_opened`**, затем отдельное определение завершённого бюджета, разрезы/возвраты и сравнимые реальные baseline/after. H3-17 остаётся IN_PROGRESS по operational/manual/field gates; H3-14 BLOCKED внешними условиями. Датозависимый Telegram-тест требует самостоятельного исправления fixture clock. Следующая задача здесь не начинается.

