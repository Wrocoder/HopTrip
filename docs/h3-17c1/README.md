# H3-17c1 — стабильный Telegram journey и API gate перед релизом

**DONE локально, 2026-11-06; H3-17 IN_PROGRESS.** Выполнена одна запрошенная часть подготовки релиза: устранение падавшего теста и проверка полного API, включая PostgreSQL. [Verification](verification.json), [текущий release checklist](../HOPTRIP_H3_RELEASE_READINESS.md).

## Причина и минимальное исправление

Проблема воспроизведена: [before.txt](before.txt), [JUnit](before.xml) —1failed на ожидаемой digest-отправке после изменения бюджета. Тест test_real_api_to_queue_to_mock_telegram_journey использовал datetime.now(UTC), а общий helper offer —фиксированный вылет2026-11-06T09:00Z. После вылета production availability predicate правильно исключает такое предложение; сломан fixture clock, не доставка. Кроме того, реальные timestamps webhook могли обогнать заранее вычисленные секунды dispatcher при медленном выполнении теста.

Изменён только **apps/api/tests/test_telegram.py**, [diff](test-delta.patch), [before](test_telegram.before.py.txt):

- Два явных clock cases: прежний fixture NOW=2026-10-12T07:00Z и2031-12-31T22:59:55Z (полночь Нового года в Warsaw наступает через5секунд).
- Только на время каждого case datetime в telegram_subscriptions заменяется тестовым FrozenDatetime. Реальный API webhook, authentication, receive_update, queue, availability/matching, dispatcher и SQL выполняются; sender остаётся прежним in-memory Sender. Патч автоматически снимается pytest monkeypatch.
- Вылет задаётся как now+25days, timestamps свежести/expiry согласованы с clock. Общий helper и другие tests не переписывались.
- Сохранены subscribe→confirm→нет совпадений при budget190→set budget230→digest→stop. Дополнительно проверены SENT digest с ожидаемым deal ID и отсутствие повторной отправки на следующем tick. Проверки не удалялись/не ослаблялись, skip/xfail не добавлялись.

Production behavior/API/schema/DB migrations/dependencies/notification flags не менялись. [Manifest](before-source.json), [parity](parity-summary.json): **677runtime/dependency files неизменны**. Нет разрешения реальной доставки из-за тестовых settings; все сообщения synthetic/in-memory.

## Проверки

| Проверка | Результат |
|---|---|
| Новый clock journey | **2passed**, [лог](clock.txt), [JUnit](clock.xml) |
| Telegram + alert digest regression | **113passed**, [лог](notifications-final.txt), [JUnit](notifications-final.xml) |
| Полный API, с PostgreSQL | **1255passed,0failed,0skipped**,2 прежних deprecation warnings: [лог](full-api.txt), [JUnit](full-api.xml) |
| PostgreSQL checks внутри полного набора | **18passed**, включая конкурирующие Telegram/alert workers/updates, pipeline/ingestion/statistics/migration tests; ранее эти18cases пропускались без TEST_DATABASE_URL |
| Чистая DB migration | upgrade head→**0021_telegram_alerts**, [лог](migrations.txt) |
| Ruff | PASS для изменённого test file: [лог](ruff.txt) |
| IDE build | success с limited diagnostics: [JSON](ide-build.json), не замена frontend production build |

Настроенный PyCharm SDK Python3.12.10 использован после environment preflight. Один ранний targeted запуск ссылался на отсутствующий test_alerts.py и не выполнил tests ([лог](notifications.txt)); исправленный набор Telegram/digests дал113pass. Verification helper уточнён под фактический classname apps.api.tests.test_postgres вJUnit; это не падение теста приложения. Full run после финальной правки теста прошёл без повтора/xfail.

## Изолированный PostgreSQL и очистка

Использован уже локально доступный image **postgres:16-alpine**, --pull=never; отдельный контейнер hoptrip-h3-17c1-pg-20261106 с ownership label H3-17c1, loopback-only127.0.0.1:54955, DB **hoptrip_test** и tmpfs на /var/lib/postgresql/data. Нет production connections/volumes/учётных данных. [Параметры](postgres.json). Применены существующие Alembic migrations, новые миграции не создавались. Обычные API tests используют isolated SQLite,18postgres cases — disposable schemas отдельнойPGБД; fixture отказывается работать с database name, отличным отhoptrip_test.

После полного набора оставшихся test schemas0. Ownership label и точный созданный container ID проверены, контейнер остановлен и удалён; tmpfs не сохраняется, постоянный том не создавался. [Cleanup](postgres-cleanup.json). Docker engine/чужие контейнеры/кэшированныйimage не изменялись.

Node suite/ESLint/Next build/mypy заново не запускались: runtime/web/dependencies не менялись, новый Python test проверен Ruff и реальным pytest. Последние b9 проверки332Node/84browser/48report/production build/types/mypy остаются историческим evidence и не объявляются новыми прогонамиc1. Staging/WebKit/manualSR/physical devices/fieldCWV/release images/production monitoring здесь не проверялись.

## Подготовка дальнейшего релиза

[Release readiness](../HOPTRIP_H3_RELEASE_READINESS.md) теперь явно отделяет закрытый local API gate от остальных условий. Release commit/PR не создан: [checkout snapshot](checkout.json) фиксирует HEAD d928246561da713c4dd1f2a4c7fbdafb39a305ab и накопленный dirty state, включая разрешённую пользователем очистку docs/images. Нужны review/freeze кандидата и проверка его конкретных артефактов, deployer/static overlay, staging и rollback. Локальное исправление теста не означает, что production готов или что H3-14 можно включить.

## Воспроизведение и откат

Из корня после SDK preflight, executable .venv/Scripts/python.exe:

```powershell
.venv/Scripts/python.exe -m pytest apps/api/tests/test_telegram.py::test_real_api_to_queue_to_mock_telegram_journey -q
.venv/Scripts/python.exe -m pytest apps/api/tests/test_telegram.py apps/api/tests/test_alert_digests.py -q
.venv/Scripts/python.exe -m ruff check apps/api/tests/test_telegram.py
node docs/h3-17c1/verify.mjs
```

Для полного набора требуется **новый изолированный** PG16 с DB hoptrip_test, не существующая рабочая БД. DATABASE_URL/TEST_DATABASE_URL направить туда, применить .venv/Scripts/python.exe -m alembic upgrade head изapps/api, затем .venv/Scripts/python.exe -m pytest apps/api/tests -q --junitxml=docs/h3-17c1/full-api.xml изкорня. Динамический порт в выполненном прогоне54955; после cleanup он больше не используется. Docker settings/image hash сохранены вpostgres.json.

Rollback: вернуть только test-delta.patch и новые docs/progress/decisions additions. Не восстанавливать общие dirty файлы изHEAD; сохранить предыдущие H3/.idea/разрешённую очистку. DB/API rollback не нужен. Нет production deploy/реальных уведомлений/affiliate transactions/paid APIs/установки зависимостей. Следующий отдельный шаг H3-17c2 — review/freeze release candidate и репетиция его артефактов; здесь остановка.
