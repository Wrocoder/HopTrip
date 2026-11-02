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

## Доставка и границы

Email, digest и личный Telegram не активируются; sender/bot/webhook не настраиваются,
campaigns не запускаются. Существующий operational monitoring — отдельная система.
GSC/Keyword Planner/Trends exports и field CWV не заменяются синтетическими данными.
Returning visitors/device split недоступны в текущем privacy-preserving event contract.

## Deployment

Ещё не выполнен. Требуются проверенный опубликованный commit, CI, штатный backup,
миграции deploy script, health/smoke и проверка фактических flags после запуска.
