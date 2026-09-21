# Эксплуатация и локальная приёмка

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

CI workflow подготовлен, но проверка в GitHub требует push.

## Bootstrap и миграции

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

## Существующий внешний proxy

production + shared-proxy подключает Caddy к default и external HOPTRIP_EDGE_NETWORK.
Upstream внешнего proxy: hoptrip-caddy:80. Реальные DNS/TLS/Oracle/ARM64, offsite и alerting
проверяются после handoff владельца; локальная репетиция их не заменяет.
