# GROW-01 — Complete Flight Alerts

Дата: 2026-11-02. Только GROW-01. AUD-02/DATA-01/SEC-01 DONE. Статус: DONE для реализации и изолированной технической проверки. Production-доставка/новые кампании не включались; реальная почта, production DB и инфраструктура не использовались. GROW-02 не начата.

## Что уже существовало и что исправлено

Подписки не создавались заново. Переиспользованы `DealAlert`/`AlertDelivery`, HMAC capabilities, API, scheduler, SMTP transport, формы и четыре локали. `ALERTS_ENABLED` и `ALERTS_DIGEST_ENABLED` по умолчанию false; runtime production settings в этой задаче не проверялись и не менялись.

| Требование | Проверенное поведение / результат |
|---|---|
| Backend и модели | Одна подписка на нормализованный email; PENDING/ACTIVE/STOPPED, filters, consent_version, requested/confirmed/stopped/last_digest timestamps. Delivery journal хранит deal IDs, статус и дату. Схема/миграции не менялись |
| Создание и валидация | Explicit consent=true, один подтверждённый registry origin, активный destination, положительный budget на полёт/человека, согласованные даты/ночи, daily/weekly. Generic202 response, signup cooldown24h и daily cap; PostgreSQL advisory lock сериализует cap. Анонимная повторная заявка не меняет active filters |
| Подтверждение | PENDING не получает digest; HMAC confirm purpose отделён от manage, TTL48h; explicit POST после нажатия кнопки. confirmed_at нужен worker независимо от status. Неправильный token404, просроченный/STOPPED confirm410 |
| Предпочтения | POST manage читает, PATCH меняет только ACTIVE subscription. Origin/destination/dates/budget/nights/weekend/frequency сохраняются после reload. Старые ссылки и schema не менялись |
| Отписка | POST unsubscribe идемпотентен, ставит STOPPED и stopped_at; доступен даже при выключенном signup. Проверка после reservation отменяет письмо при stop/изменении filters. Отписка во время уже начавшегося SMTP не отзывает принятое сервером письмо |
| Дедупликация | До SMTP коммитится RESERVED с deal IDs и last_digest_at. SENT/UNCERTAIN/RESERVED/CANCELLED исключают эти IDs из следующих попыток. После timeout/аварии не выполняется автоматический retry того же digest; это at-most-once attempt, а не гарантия доставки |
| Частота | Daily либо weekly по Europe/Warsaw и локальной дате, с configurable day/hour/minute; DST23/25h покрыт тестами. До5 новых подходящих лотов. Нет matches — нет письма и расходования слота. Отменённая после reserve попытка сохраняет слот и dedup history: безопасный пропуск предпочтительнее повторной отправки |
| Свежесть и качество | **Исправлено:** `recommendation_eligible` исключает CRITICAL_INCOMPLETE из рекомендаций по email, как в других product recommendations. PARTIAL допустим с honest missing facts. Existing availability query учитывает deal/source expiry, age и departure. **Исправлено:** после reserve повторно проверяются именно сохранённые IDs, фильтры, доступность и качество с новым временем; неполный набор отменяется целиком без подстановки других лотов. Текст письма формируется из повторно проверенных данных |
| Операционные логи | **Добавлено:** фиксированные сообщения signup/mail-submitted/confirmed/preferences-updated/stopped/retention-cleaned/digest-submitted/cancel-reason. Никаких email, alert IDs, tokens, filters или SMTP exception text. Существующий scheduler сохраняет агрегированные sent/uncertain/skipped/cancelled counters |
| Retention при остановленной доставке | **Добавлено:** `app.jobs.alert_scheduler --cleanup-only` выполняет existing cleanup один раз без запуска loop/SMTP. PENDING старше7дней и STOPPED старше30дней удаляются вместе с их delivery rows. Активная история сохраняется для дедупликации. Порог означает eligibility для удаления при запуске cleanup, а не обещание фонового удаления точно в срок |

После выбора до пяти лотов набор ещё раз проверяется перед передачей в SMTP. Это чтение текущей БД, не блокировка inventory продавца и не гарантия цены. Изменения после последнего чтения либо во время SMTP всё ещё возможны; письмо сохраняет предупреждение о наблюдаемой цене, неизвестном багаже/пересадках, отдельных расходах и необходимости проверки у продавца.

## Точный объём файлов

- [services/alert_digests.py](../../apps/api/app/services/alert_digests.py): eligibility, reservation revalidation, fresh clock, body after revalidation и безопасные логи.
- [services/alerts.py](../../apps/api/app/services/alerts.py), [api/alerts.py](../../apps/api/app/api/alerts.py): lifecycle logs без изменения API response/payload.
- [jobs/alert_scheduler.py](../../apps/api/app/jobs/alert_scheduler.py): optional `--cleanup-only`, обычный режим прежний.
- [test_alert_safety.py](../../apps/api/tests/test_alert_safety.py):11 новых случаев. [test_alert_digests.py](../../apps/api/tests/test_alert_digests.py): positive helper теперь содержит явно синтетические подтверждённые поля itinerary; реальные данные не добавляются. Негативные unknown/missing-return случаи проверяются отдельно, eligibility не подменяется mock-значением.
- Этот отчёт, evidence в `docs/grow01/` и четыре roadmap documents. [Патч существующих файлов](changes.patch) сравнивается с начальным snapshot, а не со всем ранее изменённым git tree.

UI/copy/PL/EN/RU/UK, indexed URLs, filters, pricing/scoring/history, saved plans, budget, accommodation, events, affiliate/consent/analytics contracts остаются прежними. Public signup не включается ради прохождения тестов; isolated fixture явно включает его и перехватывает **обе** mail boundaries в память. Root E2E fixture/config не менялись.

## Технический privacy review

| Проверка | Evidence / ограничение |
|---|---|
| Consent и адрес | Unchecked required checkbox, literal true backend, confirmation/consent timestamps; no digest до verified address. Management link — bearer capability владельца email, не login/password-account |
| Токены и доступ | HMAC constant-time comparison, purpose separation, fragment вместо query, POST для confirm/manage/unsubscribe. Передача fragment в JSON body нужна для API authorization; private pages noindex/nofollow и API no-store. Секрет ключа и токены не логируются. Ссылку всё равно нужно беречь: она остаётся в email/browser history и даёт доступ получателю |
| Tracking / third parties | Existing browser tests: при сохранённом consent private alert routes не запускают optional trackers; email/token не добавляются в analytics payload. SMTP получает адрес для доставки; «не передаём партнёрам предложений» не означает отсутствие почтового обработчика |
| Data minimization / logs | Хранятся только existing email/settings/state/consent/delivery fields, новых PII fields нет. Test sentinel email/ID/tokens/budget/SMTP password отсутствуют в lifecycle logs. HTTP middleware не пишет request body/query, SMTP exceptions подавляются как прежде |
| Retention | Существующие7/30-day правила переиспользованы, появилась возможность выполнять их без delivery. При остановленном worker требуется отдельно организованный владельцем запуск cleanup; cron/production policy не создавались. Active history пока хранится до удаления подписки, очистка/backup encryption/права доступа production не проверялись |
| Локализация и ожидания | Формы и ошибки доступны PL/EN/RU/UK; email по-прежнему только PL, это явно сказано в non-PL UI. Paused state объясняет, что сохранение/подтверждение не запускает подборки. Письмо не выдается за бронь или пакет с гостиницей |

Это технический review поведения в checkout, не юридическая сертификация. Перед реальным включением доставки владельцу нужны проверенные SMTP sender/домен/ключ и operator contacts, актуальные privacy disclosures/основания обработки/почтовый vendor и retention/backup policy. Existing public privacy text сейчас говорит о paused delivery; его необходимо согласовать с фактическим состоянием до включения. Эти действия здесь не выполнялись. Реальные SMTP deliverability, DPA/transfers, права на production DB/backups и ingress/multi-process rate limits остаются вне подтверждённого результата SEC-01/GROW-01. Встроенный per-process лимит не назван общей распределённой квотой.

## Проверки и исходные результаты

| Проверка | Результат |
|---|---|
| Before новых regression cases | [11 failed](before.txt), [JUnit](before.xml),1.52s. В том числе отсутствующие новые CLI/log requirements; это не11 независимых production incidents |
| Focused alerts suite после runtime fix | [72 passed](focused.txt), [JUnit](focused.xml),6.41s. Затем logger namespace и secret sentinel уточнены; финальная полная проверка ниже включает эти изменения |
| Полный backend, кроме PostgreSQL | [789 passed,15 deselected](backend.txt), [JUnit](backend.xml),77.64s. Включает11 новых случаев, existing SMTP/confirmation/preferences/journey/digest/quality/freshness/contract regressions |
| PostgreSQL | [15 passed](postgres.txt), [JUnit](postgres.xml),17.28s. В том числе два конкурирующих workers дают одну SMTP попытку и один journal record. Отдельная одноразовая hoptrip_test/schema, loopback54457, postgres:16-alpine, label GROW-01, без host mounts. Контейнер остановлен после проверки label; [instance](postgres-instance.json), [cleanup](postgres-stopped.json) |
| Ruff / mypy | [Ruff passed](ruff.txt) по6 изменённым Python files; [mypy passed](mypy.txt),101 source files |
| Изолированная web production build | [Passed](build.txt). Runtime web не менялся, build нужен для browser verification текущих private routes |
| Desktop browser | [9/9](e2e-desktop.json),32.78s,errors=[],retries0 |
| Mobile browser | [9/9](e2e-mobile.json),44.49s,errors=[],retries0 |
| Integrity / scope | [verification.json](verification.json): source parity, unchanged master/web/config, selected test normalization, links/JSON/added whitespace, final task status и отсутствие своих listeners |

Итого804 различных backend tests и18 различных browser scenarios. Focused72/before11 не прибавляются повторно. Два existing deprecation warnings TestClient/httpx/anyio сохранены. Полный web E2E suite/physical devices/field metrics не проверялись; web unit/lint отдельно не повторялись при неизменном frontend. SDK PyCharm Python3.12.10 использован без установки пакетов.

Первая попытка `alembic -c apps/api/alembic.ini upgrade head` из корня завершилась `Path doesn't exist: alembic`: [исходный лог](postgres-migration.txt). Повтор из `apps/api` прошёл до0020: [финальный лог](postgres-migration-final.txt). Миграции не изменялись и применялись только к disposable DB. Ошибка cwd не названа ошибкой schema или скрыта успешным повтором.

Browser использует existing `alerts.spec.ts` и `localized-alerts.spec.ts`: реальная форма→fake mailbox→confirm→manage→PATCH→reload→stop, delivery paused/enabled status, disabled signup, invalid/expired/error statuses, filter/locale switching, private SEO, отсутствие токенов в tracking и внешних запросов. Scans на signup/manage:8 scoped axe checks без violations; это не полная WCAG-сертификация. Сохранены8 panel captures; просмотрены4: [PL320 signup](signup-pl320.png), [EN settings desktop](settings-en-desktop.png), [RU mobile](settings-ru-mobile.png), [UK mobile](settings-uk-mobile.png). Остальные4 доступны в isolated test-results; просмотр всех8 не заявляется. Long synthetic email прокручивается внутри native input; это не layout overflow.

## Воспроизведение и эксплуатация

Из корня, после получения SDK через python-tools, с `APP_ENV=test`, `DATABASE_URL=sqlite://`, `ALERTS_ENABLED=false`, `ALERTS_DIGEST_ENABLED=false`, `EDITOR_ENABLED=false`, `EVENTS_SYNC_ENABLED=false`:

```powershell
& $sdk -m pytest apps/api/tests -m 'not postgres' -q
& $sdk -m ruff check apps/api/app/api/alerts.py apps/api/app/services/alerts.py apps/api/app/services/alert_digests.py apps/api/app/jobs/alert_scheduler.py apps/api/tests/test_alert_digests.py apps/api/tests/test_alert_safety.py
& $sdk -m mypy apps/api/app
```

PostgreSQL tests требуют отдельной `hoptrip_test` и явного `TEST_DATABASE_URL`, проверяемого fixture; существующую рабочую БД не подставлять. Browser preparation: `docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-grow01`, дополнительные7 untracked public/CSS/script files скопированы по allowlist. Isolated config использует3125/8125, `reuseExistingServer=false`, `next start`, local API/site URLs и public operator fixture. Python fixture защищён `HOPTRIP_E2E=1`, используется отдельная SQLite и memory mailbox. До запуска проверены свободные audit ports; чужие3100/8100 не использовались и не останавливались.

После local build из isolated `apps/web`:

```powershell
node node_modules/@playwright/test/cli.js test '(^|/)alerts\.spec\.ts$' '(^|/)localized-alerts\.spec\.ts$' --project=desktop --max-failures=1 --reporter=json
node node_modules/@playwright/test/cli.js test '(^|/)alerts\.spec\.ts$' '(^|/)localized-alerts\.spec\.ts$' --project=mobile --max-failures=1 --reporter=json
```

`& $sdk -m app.jobs.alert_scheduler --cleanup-only` с `PYTHONPATH=apps/api` — новая команда для **явно выбранной** БД. Она меняет данные по existing retention rules и не отправляет email. В этой задаче она проверялась только на isolated fixture DB, production command не выполнялся. Для остановленной доставки расписание cleanup не возникает автоматически; его внедрение в реальные операции требует отдельного решения владельца. Нормальный scheduler без флага сохраняет прежний enabled gate.

## Release / rollback / риски

Это локальный change set без deployment. Обычный API release не требует migrations/API-client/storage/cookie изменений; новые arguments обратно совместимы. Сохранить `AlertDelivery`/last_digest_at при любом rollback: удаление RESERVED/UNCERTAIN/CANCELLED ради повтора может привести к нежелательной повторной отправке. Код откатывается только по GROW-01 delta четырёх runtime files; previous tasks не сбрасываются. Новые tests и helper обновляются согласованно. Обратного восстановления записей, уже удалённых approved retention run, автоматически нет.

Не включать реальные flags/worker до отдельной проверки настроек, реального sender и privacy review. Технические проверки здесь используют fake SMTP, не доказывают реальную доставку и не разрешают кампании. Исторические source observations и PARTIAL itineraries всё равно требуют проверки у продавца; качество данных не означает booking availability. Changed/expired reservation может пропустить письмо и занять frequency slot; автоматического recovery для этого случая нет по существующей политике at-most-once.

Master plan, root next-env и прежние пользовательские/IDE изменения сохраняются. Global `git diff --check` включает прежние пользовательские trailing spaces master plan; added-text проверяется отдельно, master hash неизменен. GROW-02 не начата; остановка.
