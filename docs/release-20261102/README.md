# Релиз roadmap — 2026-11-02

Разрешение владельца: завершить необходимые release checks и задеплоить;
email и личный Telegram оставить выключенными. 43 задачи master plan выполнены
локально; этот отчёт отделяет проверку релиза от прежних task-level acceptance.

## До релиза

- Local HEAD/origin/main и production: `2395f1631b2c202c07bfc50dd5585f3abe31c404`.
- Production DB: `0018_editorial_rehearsal`. Новые 0019–0021 добавляют nullable
  поля и отдельные Telegram tables; historical unknowns не заполняются выдуманными данными.
- Установленный deploy script совпадает с проверенным исходником:
  SHA256 `54870c75db94c69192b992d89bb8d931630e7ad28638c23f192394499bec8114`.
- Email выключен; личные delivery workers не запущены. Existing events worker сохранён.
- На VM очищен только неиспользуемый build cache старше 168 часов с keep-storage
  8GB: освобождено 7.423GB, свободно около 16GB. Images/volumes/backups не удалялись.
- Рабочие изменения и исходный Git index сохранены в локальном ignored
  `.cache/release-20261102`; IDE файлы исключаются из коммита и сохраняются на месте.

## Проверки

- API: 907 non-PostgreSQL passed; PostgreSQL 18 passed после подготовки test DB
  миграциями. Первоначальный PG run: 17 passed / 1 failed (пустая DB без
  alembic_version); это ошибка порядка подготовки среды, не скрытая regression.
- Node unit: 215 passed. Ruff, mypy (113 modules), ESLint, production web build passed.
- Старый SEO growth test воспроизведён: закрывал уже открытый details, затем
  заполнял скрытое поле. Исправлены details handling, устаревший empty-state
  selector и уточнённый текст интервала. После исправления 10/10 desktop/mobile passed.
- Native popup test helpers теперь подставляют loopback перед кликом и возвращают
  исходный href после него. Исходные URL/assertions сохраняются; SMTP обеих
  веток fixture заменён in-memory. Real partner navigation не нужна для acceptance.
- Полный браузерный прогон: выполняется; окончательный результат будет записан ниже.

### Follow-up review

- `17307acc3524b3b5ebac819d7c0ee7eb49e9f660` опубликован;
  [CI API/web/checks](https://github.com/Wrocoder/HopTrip/actions/runs/41475778401) successful.
- После двух общих navigation timeouts и нескольких отложенных UI состояний
  параллельность ограничена двумя отдельными средами. Остановлены только процессы
  проверенных собственных runner trees; их неполные отчёты не считаются passed.
  Focused unchanged repeat дат:4/4 mobile; catalog subscription:2/2 desktop/mobile.
- Старые assertions обновлены под `returnTo`, текущий 404 и loading при применении
  фильтров (`aria-busy`/status) вместо удалённого SEO-01 initial SSR placeholder.
  Селекторы ограничены нужными видимыми trip/related sections. Catalog test больше
  не требует цену первой карточки в первых900px после expanded filters: отдельно
  проверяет primary filter action в viewport и цену после обычной прокрутки.
- Новая fixture-only opt-out header позволяет policy tests прочитать original307
  при `maxRedirects:0`, затем они сами заменяют переход loopback-адресом. Обычные
  browser /go redirects остаются внутри fixture; production такого bypass не имеет.
- Подтверждены отсутствующие production HSTS/CSP. Подготовлены HSTS30days только
  основного домена без preload/subdomains и базовая CSP object/base/frame/form.
  Inline Next bootstrap остаётся разрешённым; strict nonce policy не заявляется.
  Caddy validate passed; adapted config требует отсутствующий upstream CSP,
  сохраняя более строгие policies. [Семантика default header](https://caddyserver.com/docs/caddyfile/directives/header).
  Первое диагностическое assertion предположило неверную JSON shape адаптера;
  actual output проверен, затем проверка исправлена. Конфигурация при этом не менялась.

## Доставка и границы

Email, digest и личный Telegram не активируются; sender/bot/webhook не настраиваются,
campaigns не запускаются. Существующий operational monitoring — отдельная система.
GSC/Keyword Planner/Trends exports и field CWV не заменяются синтетическими данными.
Returning visitors/device split недоступны в текущем privacy-preserving event contract.

## Deployment

Ещё не выполнен. Требуются проверенный опубликованный commit, CI, штатный backup,
миграции deploy script, health/smoke и проверка фактических flags после запуска.

Deploy script сохраняет running application images и previous-source, делает pg_dump
при остановленных writers и проверяет pg_restore --list. При failure восстанавливает
прежние приложения без database downgrade. Новые nullable fields/tables допускают
такой откат без удаления данных.

Caddy требует отдельного `compose up -d --no-deps caddy` из final release: старый
контейнер держит bind mount прежнего release path. Сначала validate на установленном
образе; затем recreate с существующими TLS/data volumes и HTTPS smoke. Откат Caddy —
тот же compose command из сохранённого previous-source. HSTS сохраняется в клиентах
до30дней; продолжать обслуживать HTTPS при любом rollback, не переходить на HTTP.
