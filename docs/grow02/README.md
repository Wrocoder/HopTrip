# GROW-02 — Telegram Flight Notifications

Дата: 2026-11-02. Только GROW-02; GROW-01 DONE. Реализованы персональные подписки через команды в личном чате, а не новый web frontend. Результат проверен локально с synthetic chats/offers и имитацией Telegram transport. Реальный бот, webhook, получатели и production delivery не настраивались; секреты и инфраструктура не менялись. GROW-03/GROW-04 не начаты.

## Исходное состояние и границы

В [старом документе](../telegram-notifications.md) и scripts уже описан отдельный эксплуатационный бот для мониторинга/сводок в группе. Это не персональные flight subscriptions. Его token/chat/thread, poller и настройки не переиспользованы и не изменены. Для новой функции нужен **отдельный бот**, один на БД, с одинаковой конфигурацией всех API/worker процессов. [Telegram различает webhook и getUpdates как взаимоисключающие способы получения updates](https://core.telegram.org/bots/api#getting-updates); переключение существующего monitor bot могло бы нарушить его работу. Никакого setWebhook/deleteWebhook/getUpdates/getMe или sendMessage к реальному Telegram в этой сессии не выполнялось.

Сохранены email signup/confirm/manage/stop, журнал дедупликации, SMTP, private routes, PL/EN/RU/UK, поиск/скоринг/история, бюджет/сохранения/отели/события, affiliate/consent/analytics и индексируемые URL. Website и dependency files не менялись. Existing schedule Europe/Warsaw переиспользуется обоими каналами; consent, last_digest_at и delivery history раздельны.

## Пользовательский сценарий

Пример синтаксиса, **не предложение реальных перелётов**:

```text
/start
/subscribe origin=WRO budget=250 destination=anywhere duration_min=2 duration_max=4 frequency=weekly
/confirm
/settings
/set budget=230 max_connections=1 departure_from=2030-06-01 departure_to=2030-06-30
/stop
```

`/start` и `/help` объясняют команды и дают privacy link. `/subscribe` сохраняет PENDING и показывает полные условия с отдельным запросом согласия. Только `/confirm` в течение24h записывает ACTIVE/opted_in_at/consent_version. При paused delivery статус явно объясняется. Одни лишь открытие бота или `/start` не разрешают flight notifications. Служебные ответы на запросы пользователя разрешены до opt-in, но не содержат автоматически подобранных рейсов.

`/settings` показывает только условия собственного чата; `/set` изменяет переданные поля ACTIVE subscription, сохраняя остальные. `/stop` идемпотентно отключает подписку и отменяет ещё не зарезервированные ответы/подборки. Он меняет состояние даже после исчерпания command quota. Повторное включение требует нового `/subscribe` и `/confirm`; старый `/confirm` сам по себе STOPPED не возобновляет. Уже начавшийся сетевой запрос нельзя отозвать.

Origin — один registry airport; destination — активный slug либо anywhere. Budget относится к полёту на человека, без пакета с проживанием. Departure range даёт гибкий диапазон вылета, без выдуманного расширения дат. Duration/weekend/frequency валидируются прежней схемой. Новый max_connections проверяет **оба** перелёта; неизвестное количество пересадок не удовлетворяет явному лимиту. При отсутствии лимита PARTIAL itinerary допускается с missing-facts предупреждением, CRITICAL_INCOMPLETE исключается. Возврат в ближайшее воскресенье не обещает поездку без отпуска.

Ответы и сообщения переведены на PL/EN/RU/UK, выбираются по Telegram language_code; неподдерживаемый язык использует PL. Английские имена команд/параметров — общий синтаксис, а не идентификаторы получателей. Email по-прежнему следует прежней PL-only политике. Native Telegram UI/реальные устройства не тестировались; проверены тексты, protocol payloads и все четыре locale ветки.

## Проверка всех требований

| Требование | Реализация и проверенное поведение |
|---|---|
| Subscription flow | `/subscribe` → PENDING → отдельный `/confirm`; валидные настройки показываются перед opt-in. No digest для PENDING/STOPPED/opted_in_at=null/неверной consent version/невалидных сохранённых фильтров |
| Chat/user association | Только `message`, private chat, positive64-bit chat_id=from.id, is_bot=false и свежая дата. Группы, каналы, edited messages, чужой адресат @bot, другой user и malformed input игнорируются. Chat ID не берётся из `/subscribe` parameters или public web form |
| Explicit opt-in | Сохраняются consent version и время подтверждения. Команды проверяются через webhook secret, random/anonymous public payload не активирует подписку. Оба feature flags по умолчанию false |
| Management | Собственные `/settings`, частичный `/set`, `/stop`; нет bearer capability в ссылке или отдельного идентификатора получателя, который мог бы подменить пользователь |
| Deduplication | TelegramUpdate receipts и last_update_id защищают от повторной/устаревшей обработки. PostgreSQL advisory transaction lock общий для commands/worker. Перед API attempt коммитится RESERVED; deal IDs после SENT/UNCERTAIN/RESERVED/CANCELLED повторно не подбираются. Свежая повторная observation того же deal не создаёт повторную рассылку |
| Rate limiting | Existing HTTP body/rate middleware + persistent quota10 commands/chat/min по умолчанию. Ответов в очереди не больше10 на чат. Один attempt/tick, интервал≥1s (default1.1) общий для всех workers и чатов. Daily/weekly локальные календарные правила/DST переиспользованы из GROW-01 |
| Failures | Подтверждённый429 даёт глобальный persisted cooldown/retry_after, максимум3 попытки. После третьей отмены cooldown всё равно соблюдается.403 останавливает подписку и отменяет очередь. Timeout/5xx/malformed ack/неизвестная ошибка → UNCERTAIN без слепого повторения; crash оставляет RESERVED. Это at-most-once attempt для неоднозначных исходов, не exactly-once delivery |
| Unsubscribe/disable | STOPPED исключается worker; состояние/filters повторно проверяются после reserve. Telegram delivery можно приостановить отдельно от команд; весь worker выключается telegram_enabled=false. Cleanup доступен отдельно, не требует отправки |
| Logging | Только названия операций и aggregate counters; ни bot/webhook secrets, ни full API URL, chat/user IDs, filters/raw commands/provider descriptions не подставляются в собственные логи. Транспорт использует urllib с fixed HTTPS host и запретом redirects, без httpx INFO request logger, который мог бы записать token-bearing URL |

### Повторный отбор перед отправкой

Новый `alert_matching.py` извлекает existing GROW-01 origin/destination/budget/dates/nights/weekend/round-trip/quality/freshness selection. Email consumer сохраняет прежние правила и свою историю. Telegram добавляет только max_connections и собственный journal.

После reservation проверяются именно зарезервированные IDs, текущий opt-in, неизменные filters, availability/quality и новое время. При потере хотя бы одного match отменяется вся подборка, без замены другими лотами и без очистки истории. Body формируется по повторно проверенным наблюдениям. До5 matches, дата/время observation, неизвестные пересадки, цена PLN/человека, отдельные расходы и final seller verification указаны явно. Данные могут измениться после последнего чтения и во время API call; это не reservation у продавца. Отклонение слишком длинного сообщения безопасно прекращает отправку, не обрезая обещанный набор.

### Длительная неактивность updates

[Официальная документация Update](https://core.telegram.org/bots/api#update) допускает случайный следующий update_id после недели без updates. Поэтому вечное монотонное сравнение не используется: старый receipt может быть заменён после7дней, а lower ID допускается после такого перерыва. Перед этим проверяется свежесть самого message (до24h, future skew≤5min). После первого нового update снова действует порядок и anti-replay. Проверены оба варианта — с retention cleanup и без него, а также PostgreSQL UTC timestamps. Старое подтверждение не возобновляет STOPPED.

## API, данные и эксплуатация

- GET `/api/v1/telegram/status` — enabled/delivery_enabled, без credentials.
- POST `/api/v1/telegram/webhook` — secret header `X-Telegram-Bot-Api-Secret-Token`, constant-time compare; disabled503, неверный secret403. Success200 подтверждает обработку/постановку ответа в очередь, а не фактическую доставку. Веб-запрос не вызывает Telegram API.
- Новый `app.jobs.telegram_scheduler`: обычный loop, `--once` для одного tick, `--cleanup-only` для existing-style retention. Loop не запускается при выключенном telegram_enabled. Даже при paused flight delivery нужны worker ticks для запрошенных служебных ответов.
- `telegram_subscriptions`: chat/user association, locale, validated filters, status, consent/timestamps, last update/digest. `telegram_updates`: только ID/chat/received_at, без raw inbound body. `telegram_deliveries`: requested replies либо deal IDs/filter snapshot, status/attempt timestamps/attempt count. Текст служебного ответа очищается после окончательного исхода; при known429 хранится до retry.
- Cleanup: PENDING старше7дней и STOPPED старше30дней удаляются с их journal. Receipts и service replies старше7дней удаляются; ACTIVE digest history остаётся для дедупликации. Нужен отдельно организованный владельцем запуск: cron/systemd в задаче не создавались. Это пороги eligibility, не обещание удаления в срок при остановленных jobs.

Миграция [0021](../../apps/api/alembic/versions/0021_telegram_alerts.py) только добавляет три таблицы/indexes, не меняя email/catalogue tables. [Roundtrip](migration.json):0020 → synthetic existing email →0021 → synthetic Telegram →0020 →0021; старый email сохранён. Выполнено только в disposable loopback hoptrip_test. Никаких production migrations.

Новые настройки: `TELEGRAM_ENABLED=false`, `TELEGRAM_DELIVERY_ENABLED=false`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_SITE_URL`, `TELEGRAM_COMMANDS_PER_MINUTE=10`, `TELEGRAM_SEND_INTERVAL_SECONDS=1.1`. Включённая функция требует валидный отдельный token/secret/username/HTTPS site origin (localhost HTTP только для тестов). Это независимо от SMTP и email flags. Schedule day/hour/minute берётся из существующих `ALERTS_DIGEST_*`; интервалы/истории по пользователям независимы между каналами.

## Primary protocol references

Проверены2026-11-02, без запросов с реальными credentials:

- [Telegram setWebhook](https://core.telegram.org/bots/api#setwebhook): secret header и доставка updates. Webhook registration в этой задаче не выполнялась.
- [Telegram sendMessage](https://core.telegram.org/bots/api#sendmessage) и [ResponseParameters](https://core.telegram.org/bots/api#responseparameters): plain text, bounded message, retry_after. Код явно передаёт `allow_paid_broadcast=false`, не задаёт parse_mode и отключает link previews.
- [Telegram FAQ](https://core.telegram.org/bots/faq#how-do-i-avoid-hitting-limits): ограничения отправки. Собственный предел выбран консервативнее максимальной пропускной способности сервиса, без paid broadcasts.

## Проверки и честная история прогонов

| Проверка | Результат / evidence |
|---|---|
| Первый focused run | [114 passed](focused-initial.txt), [XML](focused-initial.xml),7.01s; ранние Telegram cases + существующие email safety/digest/journey |
| Initial full non-PG | [856pass/1fail/17deselected](backend.txt), [XML](backend.xml),43.64s. Test API journey пытался dispatch раньше newly queued due_at |
| Intermediate API repeat | [0/1](api-journey.txt), [XML](api-journey.xml): first dispatch уточнён, но второй tick ещё не выдерживал1.1s. Исправлены только тестовые часы, rate limiter не ослаблялся |
| Initial PG | [14pass/3fail](postgres.txt), [XML](postgres.xml),35.63s.2 новых tests обнаружили настоящий parent/outbox FK ordering bug; explicit flush сохраняет атомарную транзакцию. Старый editor upgrade test ожидал0020 вместо нового head; expectation обновлён, catalog preservation assertions сохранены |
| Intermediate successful runs | [Telegram68](telegram-final.txt), [backend859](backend-final.txt), [PG17](postgres-final.txt); содержат ещё не все поздние edge cases, не суммируются с final |
| Final non-PG acceptance | [861 passed](backend-acceptance.txt), [XML](backend-acceptance.xml),41.22s.72 новых Telegram cases включены, прежние789 сохранены;17 PG cases были deselected до добавления последнего PG-only случая |
| Final PostgreSQL acceptance | [18 passed](postgres-acceptance.txt), [XML](postgres-acceptance.xml),23.27s.3 новых cases: concurrent duplicate updates, concurrent senders, ID reset after inactivity. Прежний email concurrency и migration/catalogue tests проходят |
| Ruff / mypy | [Ruff passed](ruff-acceptance.txt), [mypy passed](mypy-acceptance.txt),110 source files. Initial2 import-order и2 optional-variable typing diagnostics сохранены и исправлены: [Ruff](ruff-initial.txt), [mypy](mypy-initial.txt) |
| Migration | [Roundtrip](migration.txt), [JSON](migration.json), [epoch DB upgrade](migration-epoch.txt). Только disposable DB, старый email/catalogue preserved |
| Web production build | [Passed](build.txt), frontend unchanged; нужна для email browser regression |
| Email browser regression | [Desktop9/9](e2e-desktop.json),32.21s, [mobile9/9](e2e-mobile.json),41.80s;18unique,unexpected/skipped/flaky0,errors=[],retries0.4 locales,320px signup/private tracking/SEO/manage/stop;8 existing scoped axe checks без violations |
| Source/scope/cleanup | [verification.json](verification.json), [ports](ports.json). Оба своих PG containers остановлены по label; свои3125/8125 закрыты, чужие3100/8100 не использовались и не останавливались |

Итого879 различных backend cases и18 browser scenarios. Повторы и initial failures не прибавляются. Два existing TestClient/httpx/anyio deprecation warnings сохранены. PyCharm SDK3.12.10, без installs. Первый environment lookup по новому, ещё не проиндексированному IDE файлу вернул file not found; далее interpreter подтверждался по существующим config/conftest того же модуля, использовался тот же SDK path.

Браузер проверяет **сохранность email flow**, не UI реального Telegram. Новая Telegram цепочка webhook→queue→mock transport проходит в API integration tests с реальными serializer/DB/filters. После browser runs добавлен только receipt epoch handling в Telegram-only module; он покрыт финальными Python/PG acceptance, shared email/web source прежний. Это различие отражено в verification, не скрыто искусственной source parity. Полный web E2E suite/новый public crawl/Telegram deliverability/physical devices не заявляются. Web unit/lint отдельно не повторялись: frontend не менялся.

## Воспроизведение и запуск после отдельного решения владельца

После получения SDK через python-tools, в безопасной тестовой среде с `APP_ENV=test`, `DATABASE_URL=sqlite://`, email/Telegram/editor/events-sync flags false:

```powershell
& $sdk -m pytest apps/api/tests -m 'not postgres' -q
& $sdk -m ruff check apps/api/app apps/api/tests/test_telegram.py apps/api/tests/test_postgres.py apps/api/alembic/versions/0021_telegram_alerts.py
& $sdk -m mypy apps/api/app
```

PG tests допускают только явную `TEST_DATABASE_URL` с database=hoptrip_test и отдельными disposable schemas. В этой сессии первый container был на loopback53842; [второй instance](postgres-epoch-instance.json) имеет свой random loopback port. [Первый stop](postgres-stopped.json), [второй stop](postgres-epoch-stopped.json). Host volumes отсутствовали. Existing migration steps после исправления application flush не менялись.

Email browser copy подготовлена existing `docs/aud05/prepare-e2e.ps1`, workspace aud05-grow02, дополнительно7 untracked CSS/public/script files. Local Next build/site/API/operator fixture,3125/8125,reuse=false. Обе SMTP boundaries в isolated fixture перехвачены в память; Telegram flags false и secrets empty. Root fixture/config не менялись. Desktop initial до flush тоже9/9; он сохранён отдельно и не суммируется с финальными18. Эти runs не проверяют будущий live webhook/Ingress.

Рабочие команды нового worker, **не выполненные с реальными credentials**:

```text
PYTHONPATH=apps/api <SDK> -m app.jobs.telegram_scheduler --once
PYTHONPATH=apps/api <SDK> -m app.jobs.telegram_scheduler
PYTHONPATH=apps/api <SDK> -m app.jobs.telegram_scheduler --cleanup-only
```

До production activation владелец должен выбрать отдельный bot token, проверить username/site origin, секрет webhook и ingress/TLS, развернуть additive schema/API/worker, определить retention/backup/ACL/vendor disclosures и актуализировать privacy information про chat/user IDs и Telegram как канал доставки. Нужен отдельно разрешённый smoke со своим opt-in chat. Все эти действия здесь не выполнялись; live bot credentials не запрашивались. Existing public privacy text не объявляется достаточным для нового сбора данных без такого review. Технические тесты не являются юридической сертификацией или согласием аудитории на кампанию.

## Release / rollback / ограничения

Обычный API release и additive upgrade0021, оба flags остаются false до отдельного решения. Для безопасного возврата остановить новый worker/flags и вернуть только GROW-02 consumer/helper/router/config/import delta; новые таблицы можно оставить неиспользуемыми. Не удалять active delivery history и RESERVED/UNCERTAIN ради повторной отправки. Downgrade0020 **удаляет Telegram tables/data**, поэтому это не штатный production rollback; он тестировался только в disposable DB. Email data при нём сохраняется.

Предел throughput консервативный, одна очередь на один personal bot/DB; multi-bot routing, group subscriptions, inline buttons и website channel selector не добавлялись. Неоднозначные/отменённые reservations могут пропустить подборку и занять frequency slot. Не отправленный из-за known429 digest повторно проверяется до каждой попытки, но при изменении набора отменяется. Цены/availability после чтения всё равно требуют seller verification.

Файлы: новый router/schema/models/migration, command/text/transport/delivery services и worker; shared matching extraction с прежним email consumer; model registry/config/main, Telegram tests и3 PG cases; `docs/grow02/` и четыре roadmap documents. Master plan/monitor scripts/старые Telegram settings/предыдущие пользовательские изменения сохранены. Global git diff --check содержит прежние master trailing spaces; новый текст проверяется отдельно.

Следующая доступная задача — GROW-04 (TRIP-01/SEC-01 DONE). GROW-03 пока ожидает ANALYTICS-01. Ни одна из них не начата; остановка.
