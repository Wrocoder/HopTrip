# Очистка сервера HopTrip — 2026-11-02

Статус: DONE. Прямое разрешение владельца: удалить устаревшие и ненужные серверные артефакты, включая неиспользуемый кэш. Очистка выполнена без перезапуска работающих контейнеров. Production SHA остался `5a04ffa00f12ddeabaeb45adb20c58bed2194b05`; нового деплоя приложения не было.

## Результат

| Показатель | До | После |
|---|---:|---:|
| Занято на диске | 36,18 GB | 16,92 GB |
| Доступно для записи | 11,12 GB | 30,39 GB |
| Использование диска | 77% | 36% |
| Образы по `docker system df` | 153 / 10,95 GB | 18 / 2,949 GB |
| Записи build-кэша | 389 / 15,39 GB | 142 / 5,073 GB |
| Работающие контейнеры | 6 | 6, прежние ID/образы/mounts |
| Тома Docker | 3 | 3, прежние имена и mounts |

Фактическое увеличение доступного места: **19 264 520 192 байта = 19,26 GB / 17,94 GiB**, уже с учётом нового архива восстановления. Это разность `df -B1` до очистки и финального замера; фоновые сервисы продолжали работать. Строки Docker images/build cache могут иметь общие слои, поэтому их размеры не суммировались для расчёта освобождённого места. Список тегов и `docker system df` дают разные представления объектов образов: после очистки 24 тега / 15 различных ID в списке тегов и 18 объектов по system df.

Удалено:

- 180 явно перечисленных старых Docker-тегов HopTrip; оставлены также два старых alias-тега, указывающих на защищённый образ отката. Удаление по тегу через `docker image rm --no-prune`, без `--force` и без автоматического удаления родительских образов.
- 40 старых копий release source и две завершённые release-preflight копии; проверенный размер этих 42 каталогов до удаления — 3 453 034 496 байт. В план не вошли используемые контейнерами, current и rollback каталоги.
- Неиспользуемые private build-cache records, к которым не обращались семь дней: `docker buildx prune --builder default --filter until=168h --filter 'private=""' --force`. Docker сообщил `Total: 10.32GB`; 37 active cache records остались.
- Успешно завершённый пять недель назад `hoptrip-migrate-1`, exit0. Работающие сервисы не останавливались. Выполнен также штатный `apt-get clean` для скачанных package archives; отдельный объём ему не приписывается, пакеты не удалялись.

## Что сохранено и как проверялось

Перед удалением инвентаризированы filesystem usage, контейнеры/их реальные image IDs, mounts, Compose working/config paths, теги образов, volumes, systemd/timers, ссылки в системных конфигурациях и открытые release/preflight файлы. Операция держала тот же `/opt/hoptrip/deploy.lock`, что и штатный деплой. Смена deployed SHA, container ID/image/running state или потеря защищённого образа останавливали дальнейшие действия.

Сохранены три release source:

1. Текущий `5a04ffa…-20261102T201841Z`.
2. Предыдущий `a9187b7…-20261102T192118Z`: на него фактически ссылаются Caddy bind mounts и Compose labels API/workers.
3. Более ранний `2395f16…-20261029T215719Z`: previous-source для второго сохранённого комплекта отката.

Полные пути и подтверждения — в [verification.json](verification.json). Сохранены latest images, реальные IDs всех работающих контейнеров, два rollback-набора `20261102T201841Z`/`20261102T192118Z`, recovered-baseline images и источник Caddy. Protected image metadata проверялись между пакетами удаления и после build-cache prune. Весь прежний `/opt/hoptrip/backups` сохранён: scheduled/deploy DB dumps, source archives, recovery exports и закрытые конфигурационные копии. Тома PostgreSQL, Caddy data/config, `/etc/hoptrip`, production env, операционные scripts/timers и журналы не очищались. Runtime Next image cache в работающем web-контейнере не удалялся.

Удаляемые каталоги проверялись через `realpath -e`: только прямые дети `/opt/hoptrip/releases` или `/opt/hoptrip/release-preflight`, без symlink в самом target, вне keep-list/current и без вложенных mount targets. Применялось `rm -r --one-file-system` только к зафиксированному списку. Не использовались `docker system prune -a`, volume prune или ручное удаление файлов Docker/containerd storage. Не добавлены автоматическая очистка, cron или новая retention policy для БД/backup.

## Архив восстановления

До удаления создан:

`/opt/hoptrip/backups/cleanup-20261102T210349Z/application-images.tar.gz`

211 544 762 байта, mode600, каталог mode700. SHA-256:

`bda469d1a637ba2fb48f189423ffcf0f14ea4c2945bcb4d76be2af004d331943`

Это `docker image save` для четырёх текущих application tags и четырёх immediate rollback tags: пять разных manifest entries, восемь требуемых RepoTags, общие образы не дублируются. Проверены `gzip -t`, чтение tar-list/manifest и SHA-256 после очистки. Архив хранится только на сервере, в Git не включён; live container ENV не экспортировался. Новые local snapshot tags не отправлялись в registry.

При необходимости восстановить image metadata: `sudo docker image load -i /opt/hoptrip/backups/cleanup-20261102T210349Z/application-images.tar.gz`. Дальнейший откат приложения выполняется со штатными сохранёнными release source/Compose files и нужными rollback tags. Для этой очистки нет изменений схемы и не нужен database downgrade. Удалённый кэш можно пересобрать; старые source copies доступны в сохранённых source archives/Git. Само восстановление и перезапуск сейчас не выполнялись.

## Проверки и замечания

- Первый preflight остановился до tagging/archive/deletions: уже отсутствовали metadata образа старого завершённого migrate-контейнера. Состояние всех шести работающих image IDs было валидно; для них проверки сохранены. Завершённый migrate исключён из требования о сохранении ненужного image ID и удалён позднее с проверкой прежнего container ID/exit0. Причина прежней потери metadata не установлена. Пустой каталог первого preflight не содержал backup-файлов и удалён через `rmdir`; диагностические логи сохранены локально.
- Первый чрезмерно строгий cache filter `shared=false/inuse=false` вернул `0B`; этот результат не объявляется очисткой кэша. Read-only previews выявили, что boolean selectors в установленном BuildKit представлены наличием поля с пустой строкой; сравнение с литералом `false` не совпадает. После проверки первичного исходника применён валидный quoted-empty selector `private=""`; ненужный inuse selector убран, active records не были удалены.
- После последнего prune: все42 удалённых каталога отсутствуют; три keep directories и все20 ранее защищённых тегов сохранились. Контейнеры, image IDs и mounts шести работающих сервисов совпали с before; все три volumes сохранились.
- 12/12 штатных monitor checks passed с `--check-only` — без инициирования уведомлений.
- [Финальный public smoke](public-smoke.json): home PL/EN/RU/UK, catalog/saved/privacy, реальная offer detail и calculator focus HTTP200; HSTS/base CSP, public admin404,320px без overflow; JS/CSP/external errors=[].
- [Финальный article smoke](article-smoke.json): обложка и лицензия на4 локалях×1280/320px, inline glacier load,31 фактический WebP SHA-256 совпал; errors=[]. Ранние smoke runs до последнего cache prune сохранены локально, повторные результаты не суммируются.
- Все четыре runtime delivery flags false; public alerts/Telegram status также enabled=false/delivery_enabled=false. Email/digest/персональный Telegram не включались. Операционный monitoring сохранён, принудительная отправка сообщений не запускалась.
- Browser TEMP на F:, existing Chrome; PyCharm SDK preflight выполнен перед server Python checks. Локальные Python toolchain commands/installs не запускались: для существующего server monitor использован установленный `/usr/bin/python3`, для чтения flags — `/usr/local/bin/python` действующего API container. Backend/schema/web source не менялись; unit/build/pytest/полный E2E suite для одной ops-очистки не запускались. Проверен работающий production.

Основания для команд: [Docker image rm](https://docs.docker.com/reference/cli/docker/image/rm/), [Docker buildx prune](https://docs.docker.com/reference/cli/docker/buildx/prune/), [BuildKit v0.32.2 boolean selector adapter](https://github.com/moby/buildkit/blob/v0.32.2/cache/manager.go#L1535). Локальные raw inventory/plan/guarded scripts/stdout/stderr: `.cache/server-cleanup/`. Закрытый server audit и журналы удаления — рядом с архивом восстановления.
