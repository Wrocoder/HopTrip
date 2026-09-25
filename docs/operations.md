# Эксплуатация и локальная приёмка

## Автоматические предложения — 2026-09-25

На hoptrip.pl включён worker: первый запуск немедленный, следующий через 3600 секунд
после завершения предыдущего. `restart: unless-stopped` восстанавливает процесс после
сбоя/перезагрузки Docker; вручную остановленный контейнер сам не запускается.
Семь вылетов, `PROVIDER_MAX_PAGES=1`, до 700 входных строк за попытку.
`TRAVELPAYOUTS_LINKS_ENABLED=true`, публичные `TRAVELPAYOUTS_MARKER=779959` и
`TRAVELPAYOUTS_PROJECT_ID=577569`; токен только в защищённом `.env.production`.
Сначала в БД должен быть настроен APPROVED/active Aviasales с разрешённым tp.media,
адаптером stored_link, capability AFFILIATE_LINK и tracking_param=NULL.
Pipeline не одобряет программу автоматически и не меняет ручную привязку к иной программе.

Получение данных, обновление ссылок и повторы защищены общей блокировкой PostgreSQL.
API ссылок вызывается пакетами до 10 с паузой; завершённые пакеты сохраняются.
При изменении исходной ссылки старая удаляется до обращения к партнёру, поэтому
сбой конвертации не оставляет CTA на предыдущие даты/цену. Неизменённые ссылки не пересоздаются.
Логи worker содержат счётчики, история job_runs — результаты/статус попыток.
Повтор неизменённой кешированной цены не продлевает свежесть; предел показа 48 часов.
Удаление старой аналитики выполняется перед запросом к поставщику даже при его отказе.

Команды на VM из `/opt/hoptrip`:

```sh
sudo docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml -f docker-compose.domain.yml --profile worker up -d --no-deps api worker
sudo docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml -f docker-compose.domain.yml --profile worker logs --tail 30 worker
```

Приёмка: первый запуск 75 deals, links_updated=9/unchanged=66; повтор — 0 новых
наблюдений, 75 unchanged links. Оба SUCCEEDED, API ready. Это проверка двух запусков,
не длительное наблюдение расписания. Отдельной доставки уведомлений о сбоях пока нет.
Backup: `backups/hoptrip-20260925T063829Z-2499178.dump`.
Перед обновлением сохранены image `hoptrip-api:before-auto-20260925`, env
`.env.before-auto-20260925` (600) и исходные backend/Compose файлы
`/tmp/hoptrip-before-auto.tar.gz` (временный архив, не долговременный backup).
Для отката сначала остановить worker, восстановить env/исходники и прежний API image,
пересоздать API. Миграций в этом изменении нет, откат БД не требуется.

## Oracle staging — 2026-09-24

Адрес: https://app.141-144-246-78.sslip.io, VM `141.144.246.78`, Ubuntu 24.04 ARM64.
Каталог `/opt/hoptrip`, env `.env.production` (600), project `hoptrip`.
Текущие исходники переданы из рабочего дерева, а не из опубликованного Git commit.

```sh
cd /opt/hoptrip
sudo docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml -f docker-compose.staging.yml ps
sudo docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml -f docker-compose.staging.yml up -d --build --wait
sudo env COMPOSE_FILE=docker-compose.yml:docker-compose.production.yml:docker-compose.staging.yml COMPOSE_ENV_FILE=.env.production sh scripts/backup-db.sh
```

Staging Caddy получает сертификат без контактного email; `ACME_EMAIL` в env содержит
`unused-by-staging-caddyfile` только для интерполяции базового production Compose.
В staging Caddyfile это значение не используется и в ACME не передаётся.
Перед переходом на production Caddyfile задать реальный ACME email и постоянный домен.
Для staging всегда применять третий Compose-файл: он запрещает индексацию и закрывает
публичный административный API. Не удалять volumes при обновлении.

Проверены HTTPS, HTTP→HTTPS 308, API readiness и расширенный SEO-аудит: 27 URL,
ошибок нет. Первая локальная копия БД создана и прочитана через `pg_restore --list`;
это не restore drill. Backup schedule, offsite и alerting ещё не настроены.
Worker выключен, действующих provider/affiliate credentials нет.

## Изолированные проверки

Рабочая БД и её volume не используются для тестов.

- docker compose -f docker-compose.test.yml up -d --wait — PostgreSQL на 127.0.0.1:55432.
- DATABASE_URL и TEST_DATABASE_URL для проверок:
  postgresql+psycopg://hoptrip_test:local-test-only@127.0.0.1:55432/hoptrip_test.
- Из apps/api: python -m alembic upgrade head.
- Из корня: python -m ruff check apps/api; python -m mypy; python -m pytest -q.
- В apps/web: npm ci; npm run lint; npm run typecheck; npm run build.
- Browser: npx playwright install chromium; npm run test:e2e.
  На Windows HOPTRIP_TEST_PYTHON задаёт путь SDK Python; PLAYWRIGHT_CHANNEL=msedge
  использует установленный Edge, если CDN Chromium недоступен.
- Backend browser fixture запускается только с HOPTRIP_E2E=1, в tests/e2e_app.py.
  Серверы 127.0.0.1:8100/3100, отдельная временная SQLite БД; production импортирует app.main.

Предыдущий успешный CI записан в implementation-status.md. Для нового выпуска
нужен успешный запуск именно его ревизии; локальные изменения ещё не проверены GitHub.

## Bootstrap и миграции

### Локальная сборка web за HTTPS-проверкой Avast

На Windows 2026-09-24 `npm ci` в `node:22-alpine` завершался сообщением
`Exit handler never called!`. Диагностика с `--loglevel verbose --fetch-retries=0`
показала первопричину: `UNABLE_TO_VERIFY_LEAF_SIGNATURE` при загрузке с npm registry.
Windows успешно проверила цепочку `npmjs.org → Avast Web/Mail Shield Root`;
контейнер не имел доверия к этому локальному корневому сертификату.

Для такой среды предусмотрен необязательный `docker-compose.build-ca.yml`:

```powershell
$env:HOPTRIP_BUILD_CA_FILE = Join-Path $env:TEMP 'hoptrip-npm-build-ca.pem'
docker compose -f docker-compose.rehearsal.yml -f docker-compose.build-ca.yml up -d --build --wait
```

PEM-файл должен содержать доверенный корневой CA вашей среды. При диагностике он
экспортирован из цепочки, успешно проверенной Windows, в указанный временный файл.
Если файл удалён или сертификат Avast заменён, повторно экспортировать актуальный
доверенный CA в PEM (без приватного ключа) и указать его путь.
Не брать сертификат из непроверенного соединения. Сертификат не хранится в репозитории.

Docker передаёт файл как BuildKit secret `npm_ca` только в шаг `npm ci`.
`NODE_EXTRA_CA_CERTS` добавляет доверие в этом процессе; файл и настройка не копируются
в итоговый image. TLS-проверка не отключается. Без override сборка и GitHub CI
используют обычное хранилище доверия Node. Этот override относится только к web/npm.

API image устанавливает зависимости из `requirements.lock` и запускает скопированные
исходники через `PYTHONPATH=/app/apps/api`. Дополнительная установка локального пакета
не нужна: она запрашивала незакреплённый build backend из PyPI и блокировала сборку
при ошибке проверки сертификата. Проверка TLS остаётся включённой. Сборка image,
миграции и readiness проверены в Docker rehearsal 2026-09-23.

Base Compose имеет одноразовый migrate; API и opt-in worker ждут его успешного завершения.
entrypoint.sh только запускает команду. Для существующего развёртывания:
сделать backup; выполнить python -m app.jobs.preflight; остановить старые writers;
запустить migrate из нового image; затем обновить API/web/worker.
0013 ничего не удаляет: при существующих дублях уникальные ограничения откатывают миграцию.
Downgrade — через проверенный backup, а не silent drop новых данных.

В production обязательны нестандартный DB password и ADMIN_TOKEN не короче 32 символов;
значения replace-with-* из примера отвергаются. Для URL используйте URL-safe секреты
либо percent-encoding. Provider token для сайта не обязателен.
Worker включается --profile worker после внешней приёмки источника.

GET /health — процесс; /health/ready — соединение с БД.
GET /api/v1/admin/system/status с X-Admin-Token показывает отдельные website/data/monetization
состояния; CONFIGURED_UNVERIFIED не означает успешную внешнюю приёмку.

## Одобрение и управление

GET /api/v1/admin/providers и /programs возвращают ID.
PATCH /providers/{id}: onboarding_status, is_active, capabilities.
POST /programs: provider_id, code, name; PATCH /programs/{id}: onboarding_status,
is_active, capabilities_json, allowed_hosts, tracking_param, adapter_code=stored_link.
Capabilities для перехода — AFFILIATE_LINK на обеих сущностях.
PATCH /components/{id}: affiliate_program_id, outbound_url.
ID компонентов доступны в /api/v1/deals/{slug}; для скрытых сделок —
protected GET /api/v1/admin/deals.
Нельзя отмечать реальные программы APPROVED без подтверждения кабинета.
Старые AFFILIATE_ALLOWED_HOSTS и AFFILIATE_TRACKING_QUERY_PARAM не разрешают переходы:
политика перенесена в записи конкретных программ.

Модерация: PATCH /admin/deals/{id}, is_visible/is_featured.
Jobs: GET /admin/jobs — run_id, attempt, next_retry_at, итог/счётчики.
Один PostgreSQL advisory lock на logical pipeline, отдельная connection переживает commits.
В SQLite fallback lock только в одном процессе — production требует PostgreSQL.

## Расписание и диагностика

Worker использует PIPELINE_INTERVAL_SECONDS; retries только transient, delay/Retry-After до 300 с.
При успешном захвате lock старый RUNNING/RETRYING считается прерванным.
Команда без внешнего токена: python -m app.jobs.maintenance — lifecycle + analytics retention.
Запускать ежедневно, включая этап bootstrap; не ждать успешного ingestion.
Пример cron в каталоге проекта:
0 3 * * * cd /srv/hoptrip && docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml run --rm --no-deps api python -m app.jobs.maintenance

API пишет request_id/method/status, без query и body. /admin/jobs хранит тип ошибки
без provider payload. Caddy access logs выключены, чтобы не записывать SubID/admin headers.
Не включайте необработанные access logs перед проверкой redaction.

SecurityMiddleware: max body 64 KiB, public/admin writes и redirects ограничены
PUBLIC_RATE_LIMIT (120/мин по умолчанию), ограничен размер памяти buckets.
Один API process. Proxy headers отключены; нельзя доверять произвольному X-Forwarded-For.
За Caddy квота применяется к его socket peer (общая на ingress).
Перед масштабированием перенести лимиты на доверенный edge/shared store.
CORS_ORIGINS задаётся явно; production Compose использует HTTPS домен.

## Backup и восстановление

Скрипты используют стандартные COMPOSE_FILE / COMPOSE_PROJECT_NAME и COMPOSE_ENV_FILE.
Для production:
COMPOSE_FILE=docker-compose.yml:docker-compose.production.yml COMPOSE_ENV_FILE=.env.production sh scripts/backup-db.sh

Backup создаётся как .partial с umask 077, проверяется pg_restore --list и атомарно
переименовывается. При ошибке .partial удаляется. Автоматическое удаление старых копий
не включено. План: ежедневный dump, 14 ежедневных + 4 еженедельных проверенных копии;
offsite место, ключи и финальный retention выбирает владелец.
Пример cron аналогичен maintenance с запуском backup-db.sh.

Создать новую пустую БД отдельно и выполнить:
COMPOSE_FILE=docker-compose.yml:docker-compose.production.yml COMPOSE_ENV_FILE=.env.production sh scripts/restore-db.sh backups/<file>.dump EMPTY_TARGET_DATABASE

Restore отклоняет непустую БД, проверяет dump, использует --exit-on-error --single-transaction.
Сравнить alembic_version, counts и содержимое важных таблиц. Только после проверки
переключать приложение на восстановленную БД. Скрипт не выполняет --clean по рабочей БД.

## Локальная репетиция

docker compose -f docker-compose.rehearsal.yml up -d --build --wait
создаёт hoptrip-rehearsal, tmpfs PostgreSQL, один migrate, API production без travel token,
web и внутренний Caddy. HTTP: localhost:58080; отдельный API localhost:58000.
Это локальные тестовые секреты, не настройки настоящего сервера.
Для backup/restore этой среды COMPOSE_FILE=docker-compose.rehearsal.yml,
COMPOSE_PROJECT_NAME=hoptrip-rehearsal.
Восстановление выполнялось в hoptrip_restore_test, а не поверх источника.
После остановки tmpfs БД исчезает — нужны локальные dumps для повторного исследования.

## Проверка доступности и возраста backup

`app.jobs.check_operations` не обращается к Travelpayouts, не требует admin token,
не меняет БД и не отправляет уведомления. Команда возвращает одну строку JSON:
`ok` и состояния `website`, `api_readiness`, `backup_freshness`.
Код завершения: 0 — запрошенные проверки прошли, 1 — отказ, 2 — неверные аргументы.
Без `--backup-dir` backup явно имеет статус `SKIPPED`, даже при `ok:true`.

Из установленного Python-окружения проекта (URL локального rehearsal):

```sh
python -m app.jobs.check_operations --site-url http://localhost:58080 --api-url http://localhost:58000 --backup-dir ./backups --max-backup-age-hours 30
```

Для сервера можно использовать Python из API image, без отдельной установки на VM.
Из каталога проекта, с уже заполненным production env:

```sh
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.production.yml run --rm --no-deps -v /srv/hoptrip/backups:/backups:ro api python -m app.jobs.check_operations --site-url https://YOUR_HOST --api-url https://YOUR_HOST --backup-dir /backups
```

Подставить реальный hostname и каталог backup; для shared-proxy добавить третий Compose-файл.
Сначала пересобрать API image с новой командой. Origin содержит схему и host/port,
без пути, query или credentials. Проверяется `/` сайта и `/health/ready` API.
Редиректы считаются отказом, HTTPS проверяет сертификат; env proxy не используется.
`--timeout-seconds` (по умолчанию 10) ограничивает ожидание сетевой операции.

Проверка сайта требует HTTP 200 и `text/html`; это проверка HTTP-доступности,
не полноценный браузерный сценарий. API должен вернуть 200 и `{"status":"ready"}`.
В stdout не попадают URL, тело ответа, исключения, содержимое backup или секреты.

Backup: учитываются только непустые обычные файлы формата
`hoptrip-YYYYMMDDTHHMMSSZ-PID.dump`, который создаёт backup-db.sh.
Symlink, `.partial` и чужие имена не учитываются. Возраст считается по mtime;
mtime из будущего даёт `FUTURE_TIMESTAMP`. Не обновлять mtime старых dump-файлов.
Свежий файл не доказывает валидность dump, наличие offsite-копии или успешное восстановление.
Для этого остаётся отдельный restore drill.

Рекомендуемый шаблон подключения после получения VM: запуск каждые 5 минут,
backup ежедневно, допустимый возраст 30 часов. Выбранный мониторинг должен обрабатывать
ненулевой exit code **и отсутствие очередного запуска**; cron сам по себе не гарантирует
доставку уведомления. Внешняя проверка с другой машины нужна для обнаружения падения всей VM.
Расписание, получатель уведомлений и offsite-хранилище ещё не настроены.
После подключения проверить намеренный отказ на тестовом URL и доставку сообщения.

## Существующий внешний proxy

production + shared-proxy подключает Caddy к default и external HOPTRIP_EDGE_NETWORK.
Upstream внешнего proxy: hoptrip-caddy:80. Реальные DNS/TLS/Oracle/ARM64, offsite и alerting
проверяются после handoff владельца; локальная репетиция их не заменяет.

## CI на GitHub

[Workflow checks](https://github.com/Wrocoder/HopTrip/actions/workflows/ci.yml)
запускается при push и pull request. Определение: `.github/workflows/ci.yml`.
Ubuntu runner использует Python 3.12, Node 22, lockfiles, отдельную PostgreSQL 16,
миграцию до head, pytest/Ruff/mypy, frontend lint/typecheck/build и Playwright Chromium.
Сверять результат нужно с SHA выпускаемой версии. Deployment в workflow отсутствует.

E2E API запускает только `tests/e2e_app.py` с `HOPTRIP_E2E=1`, отдельной SQLite
и локальной страницей партнёра. Тест читает настоящий 307 от `/go`, проверяет
HTTPS destination и SubID, затем подменяет только Location на localhost для
браузерного перехода. SubID должен соответствовать ровно одному клику той же сессии.
Реальный партнёр, DNS и внешняя атрибуция этим тестом не проверяются.

При сбое скачайте artifact `playwright-failure-details` со страницы запуска
(retention 7 дней), распакуйте его и из `apps/web` откройте нужный trace:

```text
npx playwright show-trace <путь-к-распакованному-тесту>/trace.zip
```

Trace содержит тестовые URL и DOM. Workflow использует фикстуры без настоящих
доступов; не подключать эти сценарии к production-БД или реальным партнёрским токенам.
