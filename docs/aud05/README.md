# AUD-05 — регрессионный baseline

Дата: 2026-10-30. Стратегия: [HOPTRIP_TEST_PLAN.md](../HOPTRIP_TEST_PLAN.md). Проверенные результаты: [HOPTRIP_AUDIT.md](../HOPTRIP_AUDIT.md), раздел AUD-05. Продуктовая логика не меняется; тесты используют только синтетические fixtures и локальную БД.

## Окружение и изоляция

Windows, Python 3.12.10 из SDK PyCharm `.venv/Scripts/python.exe`, Node 24.13.0, Google Chrome через PLAYWRIGHT_CHANNEL=chrome. Точные timings/status — в итоговых артефактах. Состояние удалённого CI не проверялось.

Для backend запусков заданы APP_ENV=test, DATABASE_URL=sqlite://, TEST_DATABASE_URL пустой (кроме PostgreSQL-набора), ALERTS_ENABLED/ALERTS_DIGEST_ENABLED/EVENTS_ENABLED/EVENTS_SYNC_ENABLED/EDITOR_ENABLED=false. Отдельные тесты локально включают flags через fixture overrides; внешние HTTP/SMTP заменены mocks. Ни рассылка, ни реальные кампании не выполнялись.

PostgreSQL: одноразовый Docker-контейнер `hoptrip-aud05-20261030`, label `hoptrip.audit=AUD-05`, postgres:16-alpine, без host volumes, порт только на 127.0.0.1, БД `hoptrip_test`. В этом прогоне Docker назначил порт 53148. Пароль `aud05-local-test-only` — исключительно локальная fixture-строка, не credential приложения/production. Alembic выполнен только в этой БД. После проверки контейнер остановить; `--rm` удаляет его временные данные.

Порты 3100/8100 заняты существующими процессами, reuseExistingServer не включался. [prepare-e2e.ps1](prepare-e2e.ps1) копирует отслеживаемые app/test-файлы и новый baseline-spec в `.cache/aud05-isolated`, подключает установленные node_modules через junction, меняет только test URLs/CLI ports на 3125/8125. Временная Next config получает turbopack.root для доступа к связанным зависимостям. Исходные next.config.ts, env-файлы, .next и уже запущенные серверы не изменяются. Любые старые tests со снимками в ../../docs пишут только во временную копию.

## Повторение

Перед каждой Python-командой получить executable через skill python-tools; ниже `<SDK>` означает возвращённый абсолютный путь. Задать безопасные flags, описанные выше.

```text
<SDK> -m pytest -q -m "not postgres" --junitxml=.cache/aud05-pytest.xml
<SDK> -m ruff check apps/api
<SDK> -m mypy
```

В apps/web: `npm run test:unit`, `npm run lint`; production build отдельно от работающих browser tests — `npm run build`. Build включает TypeScript. Генерируемые изменения next-env.d.ts в исходном checkout не включать в результат аудита.

Для PostgreSQL создать новую одноразовую БД (не production):

```powershell
docker run --rm -d --name hoptrip-aud05-20261030 --label hoptrip.audit=AUD-05 -e POSTGRES_DB=hoptrip_test -e POSTGRES_USER=hoptrip_test -e POSTGRES_PASSWORD=aud05-local-test-only -p 127.0.0.1::5432 postgres:16-alpine
docker port hoptrip-aud05-20261030 5432
docker exec hoptrip-aud05-20261030 pg_isready -U hoptrip_test -d hoptrip_test
```

Применить `<SDK> -m alembic upgrade head` из apps/api с DATABASE_URL на **только что созданный** localhost container. Затем `<SDK> -m pytest -q -m postgres` из корня с TEST_DATABASE_URL этой БД; DATABASE_URL можно снова вернуть к sqlite://. Без Alembic тест migration_head закономерно упадёт — так было в первом подготовительном прогоне, это не поломка миграции.

Для browser baseline:

1. `./docs/aud05/prepare-e2e.ps1`. Для повторения выбрать новый WorkspaceName, например `-WorkspaceName aud05-repeat`; скрипт отказывается перезаписывать существующий каталог и ничего рекурсивно не удаляет.
2. Перейти в `.cache/<WorkspaceName>/apps/web`, задать HOPTRIP_TEST_PYTHON=<SDK>, PLAYWRIGHT_CHANNEL=chrome и безопасные flags. HOPTRIP_E2E и URL-окружение локальных серверов задаются существующей Playwright config.
3. Выполнить команду выборки ниже. Playwright сам поднимает и завершает принадлежащие этому прогону fixture-серверы; данные API в отдельной временной SQLite.

```text
npx playwright test roadmap-baseline.spec.ts catalog-results.spec.ts airport-search.spec.ts destination-search.spec.ts trip-filters.spec.ts flight-facts.spec.ts price-freshness.spec.ts shared-trip.spec.ts accommodation.spec.ts trip-budget.spec.ts events.spec.ts planned-events.spec.ts consent.spec.ts localized-catalog.spec.ts hydration.spec.ts --reporter=line
```

CLI-аргументы Playwright — regex-фильтры путей, поэтому events.spec.ts также выбирает localized-events.spec.ts и т.п.; итоговая выборка — 100 browser cases, а не утверждение о запуске ровно 15 файлов. В полном inventory 436 cases; все они в AUD-05 не запускались.

## Новые проверки и известные ограничения

`apps/web/tests/roadmap-baseline.spec.ts` добавляет полный cookie-cycle предпочтения аэропорта и отдельный тест потери фильтров F01. Для F01 test.fail устанавливается только перед известной регрессионной проверкой; подготовка должна пройти нормально. Expected failure не считается PASS и не отключает проверку навсегда: при исправлении неожиданное прохождение потребует удалить аннотацию.

`playwright.config.ts` теперь содержит testMatch=**/*.spec.ts. Раньше unrestricted discovery импортировал Node unit .test.mjs, включая require-hook TypeScript, и ломал распознавание callback fixtures. До изменения: 129 discovery errors, 0 discovered tests; после: errors=[], 436 cases. [preexisting-discovery.json](preexisting-discovery.json) и [inventory-summary.json](inventory-summary.json) сохраняют эти результаты, [e2e-inventory.json](e2e-inventory.json) — итоговый полный список.

Ограничения baseline: Chrome headless и mobile emulation, не реальные устройства; live booking, SMTP/партнёрские кабинеты/marketing scripts не проверены; проценты покрытия строк не измерены. Shell/PowerShell operational tests и полный E2E-suite вне выбранного набора не объявляются пройденными. Остальные требования и gaps — в тест-плане.

## Итоговые результаты

[results.json](results.json): 664 backend-теста по двум раздельным наборам, 110 web unit, Ruff/mypy/ESLint/build — прошли. [backend.xml](backend.xml), [postgres.xml](postgres.xml), [build-output.txt](build-output.txt) содержат доказательства.

[Первый E2E-прогон](e2e-initial.txt): 96 обычных PASS, два expected failure F01, два неожиданных desktop failure (airport-search и catalog-results); line reporter включает expected failures в «98 passed». [Целевой повтор](e2e-recheck.json): 3 обычных PASS и один expected failure F01, unexpected=0. Код двух старых тестов не менялся; успешный повтор не стирает первоначальные падения. Их причины остаются неустановленными, риск нестабильности отмечен в аудите.

[isolation-source-check.json](isolation-source-check.json) подтверждает совпадение 539 runtime-файлов. Подготовленный контейнер удалён Docker через --rm после остановки; локальные серверы тестов завершены. Временная копия оставлена для проверки результатов, без удаления пользовательских каталогов.
