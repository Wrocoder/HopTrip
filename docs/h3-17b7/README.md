# H3-17b7 — сохранение static assets между релизами

2026-11-06. **H3-17b7 DONE в коде и локальной репетиции. H3-17 IN_PROGRESS. F03 локально устранён; включение на staging/production не выполнялось.** API/DB/locale/SEO/consent/affiliate/budget/saved и пользовательский интерфейс не менялись.

## Реализация

- Новый `docker-compose.static-cache.yml` монтирует постоянный external volume `hoptrip_next_static` в `/app/.next/static`. Он создаётся preseed helper,не принадлежит lifecycle Compose и не удаляется project down. Deployer применяет этот overlay последним и для нового релиза, и для rollback на предыдущий образ.
- После build, **до остановки сервисов**, deployer копирует предыдущие static assets и сохраняет HTML четырёх страниц. Helper из нового образа добавляет в том предыдущие и новые файлы. Одинаковый URL с разными байтами, symlink или небезопасный тип файла останавливает публикацию; существующие байты никогда не перезаписываются. Сначала проверяются все конфликты.
- Новый entrypoint заполняет кеш из встроенного `static-seed` до импорта обычного standalone `server.js`. При первом запуске с пустым томом seed создаётся автоматически. Production compose требует отдельный mounted volume через `HOPTRIP_STATIC_VOLUME_REQUIRED=1`; старый установленный deployer без overlay не сможет незаметно включить незащищённый новый образ.
- Static postflight читает только два read-only файла (manifest/previous HTML), а не backup с DB dump. Проверяются старые ссылки и ресурсы четырёх новых страниц:HTTP200,immutable,MIME JS/CSS,SHA256,HTML no-store и BUILD_ID **нового образа**. Ошибка вызывает существующий rollback. Том сохраняется, поэтому старый образ может отдавать chunks уже показанного нового релиза.
- Никакой автоматической очистки кеша нет:это append-only архив. Нужны мониторинг размера тома/backup и отдельная согласованная политика удаления; необоснованный TTL мог бы снова сломать старые вкладки.

## Проверки

[Машинная сводка](verification.json).

| Проверка | Результат |
|---|---|
| Node | **321/321**,включая7новых tests:merge/idempotence/rollback,коллизии до записи,symlinks,seed-before-server,required-volume guard,HTTP/hash/MIME/cache/build failures. [Лог](node.txt) |
| Bash syntax/deploy doubles | **6/6** Linux/WSL scenarios:success,services/preflight/postflight failures,static-preflight failure до stop,static-postflight rollback;overlay обязателен на обоих up. Native flock;никаких реальных Docker/SSH/curl deployments в этом suite. [Лог](deploy-tests.txt) |
| Docker build | Реальный финальный image build **PASS**. [Build](docker-build-final.txt),[image digest](image-id.txt) |
| Реальный container startup | Новый образ запустился с отдельным тестовым томом;пустой том наполнился до server import,idempotence added0 подтверждён. Без обязательного тома образ ожидаемо отказал до server startup. [Seed](empty-volume-seed.json),[negative guard](missing-volume.txt) |
| Container postflight | **50ресурсов**,включая старыеA/B и текущиеDocker chunks:HTTP/hash/MIME/cache PASS. Checker выполнен и снаружи,и внутриLinuxNode22 с --image-build. [Host](docker-postflight.json),[image](docker-image-postflight.json) |
| A→B и rollback | Финальные2production executions:серверB и старый серверA оба отдают30URLs из объединённого A/B HTML,включая все13старых,которые ранее частично404. [B](release-b-final.json),[A](rollback-a-final.json) |
| Статика конфигурации | Compose render/syntax,ESLint,TypeScript,git whitespace PASS;IDE build success with limited diagnostics. [Compose](compose-config.json),[lint](lint.txt),[types](types.txt) |

Дополнительно выполнен настоящий `docker compose up` с **тем же** static-cache overlay,тестовым именем external volume и новым образом. Production mount guard прошёл;image-build/hash postflight успешен;тестовый project остановлен через down без удаленияexternalтома. [Compose smoke](compose-smoke.txt),[postflight](compose-postflight.json).

**Выявленное уточнение:**если добавить файлы после старта Next,старый URL оставался404 до рестарта ([probe](pre-restart.json)). Поэтому preseed выполняется до переключения,а entrypoint — до server import. Первоначальный postflight сразу после Docker restart также застал незавершённый startup;после readiness проверка прошла. В рабочем deploy static-postflight следует после readiness/root/preview проверок.

Первоначально Docker daemon был выключен;Docker Desktop запущен скрыто,после чего выполнен реальный build/smoke. Git Bash не обеспечил POSIX atomic symlink rename,поэтому authoritative deploy suite выполнен в WSL Linux,а не объявлен пройденным по Windows-эмуляции. После завершения API helper через Ctrl+C остались дочерние SDK процессы:они остановлены только после проверки известных PID/commandline;один ранний PW startup успел увидеть занятый8125 ([лог](release-b-startup-race.txt)). Чужие серверы не переиспользовались/не останавливались.

## Локальная репетиция

Использованы сохранённые A/B builds17b3/17b6. Их исходные `.next/static` сохранены как `static-before-17b7`,а тестовые static paths связаны с общим `.cache/h3-17b7-retained` после проверки абсолютных workspace boundaries/reparse points. [Manifest](static-manifest.json):315files. Старый набор13URL взят из настоящего snapshot17b6;previous-html — синтетический список этих и реально полученных B asset references,не утверждение о сохранённой живой вкладке.

Docker image `hoptrip-h3-17b7-local:20261106`,тестовый том `hoptrip_h3_17b7_static_20261106`,публикация только127.0.0.1:3137;production-том `hoptrip_next_static` **не создавался/не изменялся**. Контейнерный smoke использовал HOSTNAME=0.0.0.0 для внутреннего loopback probe;это test environment override. Synthetic API8125,PyCharm Python3.12.10 после python-tools preflight;все Playwright runs reuseExistingServer=false. Первый API helper кратко запускался на0.0.0.0,затем заменён loopback-only fixture;финальные container/PW проверки использовали127.0.0.1. Контейнер с ownership label и созданные API helpers остановлены;images/test volume/артефакты оставлены для review. Docker engine и чужие контейнеры не останавливались.

## Активация и rollback

Это **подготовленный результат для review**,не установленное production-изменение. Root-owned `/usr/local/sbin/hoptrip-deploy` не обновляется из CI автоматически. Перед следующим разрешённым rollout оператор должен установить проверенную версию `scripts/deploy-production.sh`,проверить overlay/место на диске и пройти staging со своей domain-конфигурацией. Не запускать production deploy старым установленным скриптом в расчёте,что одного нового образа достаточно. Новый volume guard специально блокирует этот случай.

Основные локальные команды: `npm run test:unit` и affected ESLint в apps/web; `bash scripts/tests/deploy-production.test.sh` в Linux; `docker build -f apps/web/Dockerfile -t hoptrip-h3-17b7-local:20261106 apps/web`; Compose config сbase/production/static-cache overlay; `npm run test:e2e -- static-retention.spec.ts --project=desktop --trace=off --reporter=line,json` с HOPTRIP_H3_PRODUCTION=1,HOPTRIP_STATIC_MANIFEST/HOPTRIP_PREVIOUS_HTML иSDK. Назначения manifest/HTML исключительно test/admin inputs;entrypoint/postflight CLI реализованы в apps/web/scripts.

Runtime rollback в новом deployer сохраняет тот же overlay/том;возврат старого образа не удаляет ресурсы нового. При отзыве самой защиты нельзя удалять том/overlay во время жизни старых вкладок. Изменения для отката кода ограничены Dockerfile/production env flag/deploy additions/new overlay и3runtime helpers;не возвращать общие файлы из HEAD и не затрагивать другие H3 изменения. МиграцийDB нет. Нет root installer update,реального rollout,credentials changes,уведомлений или внешних партнёрских транзакций в этом выполнении.

## Остаток

F03: **MITIGATED_LOCAL / PENDING_STAGING_ACTIVATION**,не подтверждённое исправление действующего сайта. Не выполнены production TLS/CDN/host overrides,полный mounted-browser navigation across restart,полный E2E/WebKit/manualSR/physical devices/fieldCWV. F02React dev diagnostic остаётсяOPEN/P2. H3-17 остаётсяIN_PROGRESS по release gates;H3-14externallyblocked. Следующая независимая задача для продолжения — **H3-18b**;операторская активация H3-17 должна проходить отдельно с явным разрешением. Здесь остановка.
