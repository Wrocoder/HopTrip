# Blocker resolution checklist

## Start here

- **For the owner, in Russian:** [step-by-step action guide](owner-action-guide.md) —
  domain purchase, DNS, existing/new Oracle VM, Travelpayouts account/token/program/link,
  support request and a non-secret handoff template.
- **While waiting for access, in Russian:** [independent development tasks](independent-development-tasks.md) —
  18 scoped tasks with internal dependencies, affected modules and acceptance checks.

Use those two files for execution. This checklist remains the short external reference;
the detailed audit remains the record of code findings.

This checklist turns the open external decisions into concrete actions. Do not commit
`.env`, `.env.production`, API tokens, private keys or payment details.

## Audit status: 2026-09-29

### Постоянный SubID HopTrip — установлен 2026-09-29

Коммит `fbb86f75e319256e37e6227776527c2ce7381817` прошёл полный
[CI 36542210470](https://github.com/Wrocoder/HopTrip/actions/runs/36542210470).
Локально 194 теста прошли, 5 PostgreSQL пропущены; Ruff/mypy успешны.
После CI пересобраны и обновлены API/worker на VM, readiness=ready.
Миграций нет. Web не требовал изменений.

Каждая генерируемая ссылка получает `links[].sub_id=hoptrip_web_deal`.
Проверка требует точную единственную метку вместе с корректными host, project/marker
и исходным маршрутом. Job #102 SUCCEEDED: 281 ссылка обновлена, invalid_sources=0.
Проверены все 281 доступный компонент. Повторная синхронизация под pipeline lock:
updated=0, unchanged=281. Tracking_param=None: метка общая для размещения,
она не идентифицирует посетителя или отдельный клик.

Проверочный переход /go → tp.media/r → Aviasales прошёл (307 → 302), метка
присутствует в ссылке. Сделан один искусственный приёмочный переход с постоянной
меткой; его следует учитывать при оценке трафика за этот день.
Повторный запрос Statistics API с группировкой по SubID подтвердил точную
`hoptrip_web_deal`: redirects_count=1, clicks_count=0, actions_count=0.
Учёт перехода с постоянной меткой проверен; бронирования и индивидуальная
атрибуция клика этим не подтверждаются.

Backup: `backups/hoptrip-20260929T082150Z-661133.dump`.
Прежние образы: hoptrip-api:before-subid-20260929,
hoptrip-worker:before-subid-20260929. Архив прежних apps/api:
`/tmp/hoptrip-api-before-subid-20260929.tgz` (600).
Для отката кода восстановить архив и прежние image tags, пересоздать API/worker
без сборки. Сохранённые ссылки с постоянной меткой совместимы с прежним валидатором;
возвращать БД из backup для отката кода не требуется.

### Проверочная ссылка с SubID — успешно 2026-09-29

Через официальный API создана одна длинная ссылка для существующего доступного
предложения с меткой `ht_probe_20260929_075733`. Ответ HTTP 200, project/marker
и вложенный маршрут проверены. Один тестовый GET дал 302 на Aviasales.
Statistics API уже показывает точную метку: redirects_count=1, clicks_count=0,
actions_count=0. Это искусственный проверочный редирект, не органический трафик.

Учёт редиректа по SubID подтверждён. Production-ссылки и БД не менялись;
атрибуция бронирования и уникального клика приложения пока не проверены.
Следующий на тот момент этап — постоянная метка и приёмка /go — выполнен выше.
Подробности: [результат проверки SubID](subid-integration.md).

### Git/CI завершены, официальный SubID изучен — 2026-09-29

Команда статистики, повтор IMAP и документация зафиксированы в
`405cdb7dc661e8eb9c97d343afd88923fced138b` и отправлены в master.
[CI 36492285117](https://github.com/Wrocoder/HopTrip/actions/runs/36492285117)
успешен целиком. Локально: 185 тестов прошли, 5 PostgreSQL пропущены;
PostgreSQL проверен в CI. Эти изменения ранее установлены/проверены на VM;
нового развёртывания сайта в рамках фиксации не требовалось.

SubID официально поддержан через `links[].sub_id` API генерации ссылок.
Динамический `?sub_id=` документирован для коротких ссылок; автоматическое
применение к нашим длинным tp.media/r не подтверждено. Найдены две зависимости:
текущий sync требует tracking_param=None, а внутренний `ht-...` содержит дефис,
которого нет среди разрешённых символов SubID. Production-ссылки и политику не меняли.
Следующий на момент исследования этап — проверочная ссылка и её статистика —
выполнен позднее, см. запись выше. Полный разбор и критерии:
[SubID integration](subid-integration.md).

### Кратковременный сбой проверки почты — 2026-09-28

Владелец подтвердил получение `HopTrip: FAILED: activity_service`.
Журнал: в 21:48:16 UTC inbox=FAILED после примерно 20 секунд, pipeline_summaries=OK;
все остальные проверки monitor успешны, notification_delivered=true.
В 21:49:04 UTC и последующих запусках inbox=OK: служба восстановилась автоматически.
Точная причина старой ошибки не записана; длительность совместима с таймаутом,
но не доказывает его. Сбой сайта этим событием не зафиксирован.

В `notify-activity.py` добавлена одна повторная попытка только чтения IMAP при
OSError/IMAP abort, с паузой 2 секунды и новым соединением. Ошибки авторизации
и проверки TLS-сертификата не повторяются. Отправка Telegram и продвижение UID
находятся за пределами повтора; постоянная ошибка по-прежнему даёт ненулевой exit.
Журнал теперь включает безопасную категорию ошибки без текста исключения.
14 целевых тестов и Ruff прошли. Скрипт установлен на VM; сайт не перезапускался.
Прежний файл: `/opt/hoptrip/scripts/notify-activity.py.before-retry-20260928`.
После установки запуски 21:52:34 и 21:53:40 UTC: inbox/pipeline_summaries=OK.
Плановый monitor в 21:53:23 UTC: все 8 checks=true, отправка RECOVERED успешна
(notification_delivered=true). Получение incident подтверждено владельцем;
прочтение recovery владельцем пока отдельно не подтверждено.

### Повторяемая проверка отчётности — выполнено 2026-09-28

Добавлена команда `app.jobs.check_partner_statistics`: явные даты (до 31 дня
включительно, без будущих дат), Aviasales campaign=100, только агрегированные
счётчики. Нет записи в БД, импорта конверсий или автоматического подтверждения
атрибуции. Токен читается из окружения; ответы и исключения не выводят секреты
или индивидуальные данные. NO_DATA отличается от отчёта с нулевыми счётчиками.

20 целевых тестов, Ruff и mypy успешны. Эта же команда исполнена через stdin
в действующем API-контейнере: status=OK, показатели совпали с проверкой ниже.
Исходник установлен на VM для повторного запуска, контейнеры не пересобирались.
Инструкция: [проверка статистики](partner-statistics.md).

### Статистика партнёра и восстановление backup — проверено 2026-09-28

С сохранённым на VM токеном проверен официальный Travelpayouts Statistics API:
GET get_fields_list (raw/aggregated, campaign_id=100) и POST execute_query вернули
HTTP 200. В запросе за 2026-09-24–2026-09-28: clicks_count=1, redirects_count=7,
searches_count=6; actions_count, paid/processing/cancelled_actions_count=0.
Это агрегаты Aviasales в аккаунте: фильтра проекта в проверенной схеме нет.
Их нельзя объявлять подтверждением конкретного перехода или бронирования HopTrip.
Доступ к отчётности подтверждён; атрибуция отдельного клика и конверсии остаётся открытой.
SubID в текущие ссылки не добавляется. Токен и индивидуальные данные не выводились;
запросы не меняли конфигурацию, ссылки или БД.
[Официальный контракт статистики](https://support.travelpayouts.com/hc/en-us/articles/360019864079-API-of-affiliate-programs-booking-statistics).

Повторная репетиция восстановления
`backups/hoptrip-20260928T192454Z-338491.dump` через `scripts/restore-drill.sh`
успешна: 976 offers, 976 deals, 155 aliases, миграция 0013_integrity_and_affiliates.
Одноразовый PostgreSQL с --network none удалён после проверки; production-БД не менялась.
Копия остаётся на той же VM, поэтому offsite backup этим не закрыт.

Для подключения offsite-хранилища и внешнего мониторинга ожидается выбор владельца:
имеющиеся сервисы/второй сервер либо подбор нового сервиса. Аккаунты и платные
подписки не создавались. Последующее реальное событие incident/recovery
зафиксировано в разделе о сбое почты выше.

### Flight-v3 — выпуск и приёмка завершены 2026-09-28

Коммит `0e750b28cb9eed497c39d89c0ca2efe09c5c458c` отправлен в master.
[CI релиза](https://github.com/Wrocoder/HopTrip/actions/runs/36471956933) полностью
успешен, включая PostgreSQL, браузерные тесты, production SEO и accessibility.
После CI API/web/worker пересобраны из архива этого коммита и установлены на Oracle VM.
Миграций БД в релизе нет. HTTPS readiness успешен; новый pipeline #89 завершился
SUCCEEDED 2026-09-28 19:31:58 UTC. Все 256 активных предложений используют flight-v3.

На hoptrip.pl повторно проверены диалог и страница предложения при 1280 и 390 px:
три слагаемых, одинаковый расчёт, Escape/возврат фокуса, отсутствие горизонтального
переполнения и ошибок JavaScript; axe диалога — без нарушений. В выборке 12 предложений
API версия, статус пояснения и арифметика оценки корректны.

Прямая проверка до установки выявила, что flight-v3 уже работал в контейнерах
от 2026-09-27; прежняя запись «не опубликовано» была устаревшей. Выпуск 2026-09-28
фиксирует код в GitHub, успешный CI и повторное развёртывание проверенной версии.
Backup и порядок отката: [запись приёмки flight-v3](releases/2026-09-28-flight-v3.md).

**Далее:**

1. Проверить атрибуцию в Travelpayouts, подключить offsite backup
   и внешний мониторинг, подтвердить доставку уведомлений о сбое/восстановлении.
2. Проверить ключевые статьи в Search Console и наблюдать показы/клики;
   далее подтвердить второй источник авиабилетов и доступ TravelLead для туров.
3. Решить с владельцем окончательную форму публичных сведений об операторе.

При подготовке повторно прошли 162 backend-теста (5 PostgreSQL-тестов пропущены),
Ruff, mypy, 5 frontend unit-тестов, lint, typecheck и production build.
Пропущенные локально PostgreSQL-проверки выполнены в успешном CI релиза.

Записи ниже датированы: более позднее подтверждение заменяет прежний статус.

### Понятная оценка предложения — локальная реализация 2026-09-27

Добавлена методика flight-v3: цена относительно медианы до 60 баллов, объём истории
до 25, возраст наблюдения до 15. Убраны повторный учёт цены и условный бонус за
неизвестное удобство рейса. При менее 5 наблюдениях/отсутствии медианы оценка явно
предварительная; нейтральные 30 баллов за цену не выдаются за подтверждённую выгоду.

Нажатие на оценку в карточке открывает пояснение с точным вкладом каждого критерия,
суммой, исходной ценой/медианой и ограничениями. Полный расчёт также находится на
странице предложения; ссылку на этот раздел можно открыть отдельно. Для старых v2 показывается
прежняя методика, если сохранённые компоненты воспроизводят число; иначе сообщается
об отсутствии достоверной расшифровки. Версия и снимок расчёта сохраняются вместе.

Серверные проверки: 162 теста прошли, 5 PostgreSQL-тестов не запускались;
Ruff и mypy успешны. Frontend: lint, typecheck, production build и 5 unit-тестов
успешны. В Edge прошли 18 существующих сценариев каталога/UI и итоговый запуск
6 новых сценариев оценки (desktop/mobile): арифметика, предварительные/старые
оценки, клавиатура/Escape/возврат фокуса, отдельная вкладка, axe и ширина окна.
Скриншоты окна просмотрены. Полная работа сайта без JavaScript не заявляется:
экспериментальная проверка выявила существующее ограничение Next.js loading/streaming.
**Опубликовано и проверено 2026-09-28:** успешный pipeline и flight-v3 у всех
активных предложений подтверждены в записи выпуска выше.
Методика и ограничения: [deal-scoring.md](deal-scoring.md).

### Приблизительная цена в евро рядом с PLN — выполнено 2026-09-27

В карточках каталога, сводке предложения и ценах его компонентов рядом с PLN
отображается эквивалент в EUR меньшим шрифтом, со знаком «≈», округлённый до целого
евро. Источник — [средний курс NBP, таблица A](https://api.nbp.pl/en.html);
PLN делятся на количество PLN за 1 EUR. Подсказка и доступное описание содержат
дату курса и пояснение, что платёжный курс может отличаться. Основная цена,
фильтр бюджета и партнёрские ссылки остаются в PLN.

Сервер получает последний опубликованный курс, включая выходные, кеширует его
на час и объединяет параллельные запросы карточек. Таймаут NBP — 2 секунды;
после ошибки повторная попытка разрешена через минуту. При сбое используется
последний корректный курс не старше 7 дней; без такого курса EUR скрывается.
Цена в PLN выводится независимо через Suspense, запросов к NBP из браузера нет.

Опубликовано на hoptrip.pl. Пять тестов пересчёта, валидации, кеширования и отказов
прошли; добавлена команда `npm run test:unit` и её запуск в CI. Локальные lint и
typecheck, production build на VM успешны. В браузере проверены 12 карточек и
страница предложения на ширинах 1280 и 390 px: EUR присутствует, ошибок JavaScript
и горизонтального переполнения нет; мобильная карточка проверена визуально.

### Индексация проверенной страницы подтверждена Google — 2026-09-26

На новом скриншоте владельца Search Console показывает «URL есть в индексе Google»,
«Эта страница проиндексирована» и успешную проверку HTTPS. Индексация проверенной
страницы подтверждена. Сам URL в кадр не попал: не приписывать это подтверждение
конкретному адресу или всем 37 URL sitemap без дополнительного подтверждения.
Скриншот не подтверждает позиции, показы или переходы из поиска. Далее — проверить
ключевые статьи через «Проверка URL» и отслеживать показы и клики в отчёте эффективности.

### Favicon из значка в header — обновлено 2026-09-26

По последующему запросу владельца изображение с самолётом заменено точной копией
значка `.brand-mark` из header: круг `#245C40` со стрелкой ↗ цвета `#F2CF72`,
с прозрачными углами. Иконки подключены через файловые metadata-конвенции Next.js:
`favicon.ico` (16/32/48 px), `icon.png` (192 px), `apple-icon.png` (180 px).
Изменение опубликовано на hoptrip.pl. Typecheck и production build прошли.
Проверка браузером: главная, статья о багаже и privacy содержат ссылки на иконки;
все три файла возвращают HTTP 200 и совпадают с файлами в репозитории.

### Перенос Telegram в группу — выполнен 2026-09-26

Владелец создал группу и добавил бота и участников. Добавлена команда
`setup-notifications.py --group`: привязка группы/темы по одноразовой команде,
использование существующего токена и смена получателя только после успешного теста.
Все сообщения monitor/activity используют общий chat ID и необязательный thread ID.
11 целевых тестов прошли. Владелец отправил одноразовую команду в целевую группу;
Telegram API подтвердил успешную отправку тестового сообщения, после чего сохранён
новый chat ID в защищённом env. Отдельная тема не выбрана. Новые уведомления о сбоях,
обновлениях предложений и письмах направляются в группу вместо личного чата.
После переключения activity: pipeline_summaries=OK, inbox=OK; все проверки monitor
успешны. Старые письма и уже доставленные сводки не рассылаются повторно.
Инструкция: [telegram-notifications.md](telegram-notifications.md).

### Запрос индексации главной принят Google — предыдущий этап

На предыдущем скриншоте владельца для `https://hoptrip.pl/` показано подтверждение
«Отправлен запрос на индексирование»: URL добавлен в приоритетную очередь сканирования.
В отчёте на момент скриншота остаётся «URL нет в индексе Google / URL неизвестен Google».
Запрос принят, но включение главной в индекс ещё не подтверждено. Повторять запрос
для того же URL не нужно. Следующий шаг — проверить статус позже через «Проверка URL»
и следить за отчётами об индексировании и эффективности. Запись обновлена 2026-09-26.

### Sitemap принят Google — подтверждение 2026-09-25

По скриншоту владельца Search Console: `https://hoptrip.pl/sitemap.xml` имеет статус
«Успешно», отправлен и обработан 25 сентября 2026 г., выявлено 37 страниц.
Отправка и обработка sitemap подтверждены. Это не подтверждает индексацию всех URL.
Следующий шаг — «Проверка URL» для главной и ключевых статей, запрос индексирования
при необходимости. Индексация одной проверенной страницы подтверждена новым скриншотом
выше; охват всех URL и поисковый трафик ещё не подтверждены.

### Удаление персональных данных с сайта — 2026-09-25

По прямому запросу владельца имя, фамилия и почтовый адрес удалены из публичного
блока на contact/privacy/terms и из действующей серверной конфигурации.
В блоке контактов остаётся только email. Код возвращает и отображает только email,
даже если в старой конфигурации присутствуют дополнительные поля.
Юридические страницы сохраняют noindex; индексация статей остаётся открытой.
Полную идентификацию оператора больше не считать завершённой: решение о дальнейшей
форме юридических сведений остаётся за владельцем. Ниже — история запуска до удаления.

### Индексация открыта — 2026-09-25

- Contact/privacy/terms опубликованы без draft-заглушек. Данные владельца читаются
  во время запроса из `/etc/hoptrip/operator.json` на VM (root, 600, read-only mount).
  Почтового адреса нет в репозитории или образе приложения.
- Главная, `/info` и 35 опубликованных материалов открыты для индексации; sitemap
  содержит 37 URL. Общий `noindex` и запрет обхода в robots.txt сняты.
- Contact/privacy/terms сохраняют `noindex`, отсутствуют в sitemap, не имеют share-image.
  Данные владельца отсутствуют в SEO-описаниях и структурированных данных.
  Эти страницы публично доступны посетителям: noindex не является ограничением доступа.
- Drive не загружается на юридических страницах; переход к ним из footer выполняет
  полную навигацию для выгрузки уже запущенного стороннего скрипта.
- `/api/v1/admin/*` по-прежнему возвращает 404. Редиректы www и старого sslip.io — 308.
- Search Console подтверждён владельцем; sitemap принят 2026-09-25. Индексация одной
  проверенной страницы подтверждена 2026-09-26 (см. выше). **Осталось владельцу:**
  проверить ключевые статьи и отчёт эффективности. Доступ к аккаунту Google агенту не предоставлен.
- Индексация всех URL и поисковый трафик пока не подтверждены.
  Подробности: [indexing-launch.md](indexing-launch.md).

Владелец — физическое лицо: **Dmitriy Kysyelyev** (написание предоставлено владельцем
для подготовки публичных страниц). Страна: **Poland / Polska**.
Email: **kontakt@hoptrip.pl**, получение писем подтверждено.
Адрес предоставлен владельцем в переписке; по его прямому указанию не сохранять
его в репозитории, документации, тестах или истории Git. Для сайта использовать
отдельную конфигурацию на сервере вне Git. По последующему запросу адрес и имя
удалены с сайта и из действующей конфигурации; публично остаётся только email.
Не подставлять другое
написание имени или адрес из локальных путей либо профилей.
Название HopTrip само по себе не идентифицирует физическое лицо — оператора.
При подготовке публичных текстов учитывать идентификацию администратора по ст. 13 RODO
и применимость [ст. 5 закона об электронных услугах](https://eli.gov.pl/api/acts/DU/2024/1513/text.html).
Это вопрос публичных обязанностей оператора, а не самостоятельное техническое
требование Google к имени владельца. После завершения публичных страниц общая
блокировка индексации снята; юридические страницы сохраняют noindex.

### Telegram: письма, тестовое сообщение и сводка подтверждены владельцем

Реализация `2acd993` запушена в `master` и установлена на Oracle VM 2026-09-25.
Владелец подтвердил 2026-09-25: при поступлении письма приходит уведомление в бота.
Владелец подтвердил 2026-09-26 получение тестового сообщения и сводки в Telegram.
Приёмка доставки этих сообщений и уведомлений о письмах завершена.

- [x] Сбои сайта/API, backup и загрузки предложений, уведомление о восстановлении:
  `hoptrip-monitor.timer`, каждые 5 минут.
- [x] Результаты успешных обновлений: добавлено/обновлено предложений, новые наблюдения
  цены и пропущенные неизвестные маршруты. «Обновлено» — обработанные существующие
  записи, не обязательно изменившаяся цена.
- [x] Новые письма на `kontakt@hoptrip.pl`: IMAP через TLS, INBOX только для чтения.
  В Telegram передаётся количество, без тела, темы и адреса отправителя.
  `hoptrip-activity.timer` проверяет сводки и почту каждую минуту.
- [x] 8 целевых тестов прошли. На VM проверки сайта/API/backup/pipeline/worker/диска
  успешны; все три таймера включены. Запрос реальной сводки проверен: job #9,
  добавлено 14, обновлено 670, новых наблюдений цены 20, пропущено маршрутов 16.
- [x] Ввести токен и привязать приватный Telegram-чат (подтверждено работающей доставкой).
- [x] Подключить ящик Zimbra и проверить уведомление о новом письме (подтверждение владельца).
- [x] Подтвердить получение тестового сообщения и сводки в Telegram — подтверждено владельцем 2026-09-26.

**Команды владельцу.** Сначала в Windows PowerShell:

```powershell
ssh -i "$env:USERPROFILE\.ssh\domarion_oci_staging_ed25519" ubuntu@141.144.246.78
```

Затем на сервере подключить бота:

```sh
sudo /usr/bin/python3 /opt/hoptrip/scripts/setup-notifications.py
```

Вставить токен (ввод скрыт), открыть указанного бота в личном чате, нажать Start,
отправить показанный код `hoptrip-…`, затем нажать Enter в терминале.
Chat ID определяется автоматически.

Подключить почту:

```sh
sudo /usr/bin/python3 /opt/hoptrip/scripts/setup-notifications.py --mail
```

Enter выбирает `kontakt@hoptrip.pl`; далее нужен пароль самого ящика Zimbra,
не аккаунта OVH. SMTP не нужен: используется `imap.mail.ovh.net:993` с TLS.

Проверить доставку и запустить первую проверку почты:

```sh
sudo systemd-run --wait --pipe --collect --property=EnvironmentFile=/etc/hoptrip/monitor.env /usr/bin/python3 /opt/hoptrip/scripts/monitor.py --test-alert
sudo systemctl start hoptrip-activity.service
```

Ожидаются тестовое сообщение и сводка последнего успешного обновления.
После этого отправить новое письмо на `kontakt@hoptrip.pl`: уведомление ожидается
примерно в течение минуты. Старые письма при первом подключении не рассылаются.
Секреты сохраняются в `/etc/hoptrip/monitor.env` с доступом root, 600; не отправлять
их в чат и не коммитить. Подробности и диагностика: [Telegram setup](telegram-notifications.md).

Ограничения: полное падение VM требует внешнего мониторинга; offsite backup пока
не подключён. Доставка уведомлений о письмах, сводки и тестового сообщения
подтверждена владельцем.

### Предыдущая проверка Google до открытия индексации — 2026-09-25

- Главная и sitemap отвечают HTTP 200, но сервер возвращает `X-Robots-Tag: noindex, nofollow`.
  В robots.txt для `User-agent: *` стоит `Disallow: /`: индексация намеренно закрыта.
- Сначала завершить contact/privacy/terms: данные владельца получены;
  адрес хранить только в конфигурации сервера вне Git, не в исходниках.
  Рабочий `kontakt@hoptrip.pl` подтверждён входящим письмом.
  Доставка ответа из ящика отдельно не подтверждена. Учесть реальную обработку почты,
  Telegram, аналитику и партнёрские инструменты в публичных текстах.
- Затем снять общий запрет индексации, проверить canonical, sitemap, публичные страницы
  и сохранение ограничений технических маршрутов. Порядок согласован владельцем ранее.
- Подтверждение `hoptrip.pl` в Google Search Console выполнено: владелец сообщил
  об успехе 2026-09-25. TXT независимо проверена через 1.1.1.1 и совпадает с выданной
  Google записью. В текущей форме OVH для корня зоны нужен `@` в поле Subdomain.
  TXT оставить в DNS; подтверждение владения не снимает ограничения индексации.
  После открытия отправить sitemap и запросить индексацию основных страниц.
- Для роста трафика: полезные страницы под конкретные запросы, актуальные предложения,
  внутренние ссылки и отслеживание показов/кликов/индексации в Search Console.
  Индексация и отправка sitemap не гарантируют позиции или трафик.
- Дополнительные партнёрки, offsite backup и внешний мониторинг не являются техническими
  условиями Google для индексации. Инструкция: [indexing-launch.md](indexing-launch.md).

### Остальные результаты аудита

Latest operations/privacy step: daily verified backups and five-minute host monitoring
are installed on Oracle VM. Restore drill of the scheduled backup succeeded in an isolated
PostgreSQL container (667 offers, 667 deals, 155 aliases). Retention is enabled only for
scheduled backups. Telegram inbox, test-message and pipeline-summary delivery are confirmed
by the owner; the recipient was switched to a group on 2026-09-26. Incident/recovery
delivery still needs separate acceptance. No offsite copy is verified yet.
Website consent controls deployed: analytics and Drive off by default, separate choices,
reject/save/accept, expiry and withdrawal. 134 backend tests + 82 browser tests passed;
real Drive consent/withdrawal checked on hoptrip.pl. Full evidence: operations.md.
Operator Dmitriy Kysyelyev, country Poland and working inbox kontakt@hoptrip.pl confirmed;
Operator address supplied privately; owner prohibits storing it in the repository.
Contact/privacy/terms are published with noindex; only contact email remains after the owner's
removal request. The operator-identification decision remains open. Public editorial indexing
is open. Search Console steps: [indexing-launch.md](indexing-launch.md).

Latest completed step: reviewed destination catalog expanded from 10 to 68 entries,
155 explicit provider aliases applied with conflict checks and a shared pipeline lock.
2026-09-25 live run: 700 input records, 547 saved offers, 143 updates, 10 unresolved,
no ambiguous/invalid records. 547 links generated, 75 unchanged; 622 available deals.
Catalog dry-run after apply adds zero rows. Milan public API has available booking CTAs.
Pre-change backup: `backups/hoptrip-20260925T065335Z-2505650.dump`.
130 backend tests passed (5 PostgreSQL tests deselected), Ruff/mypy passed;
actual PostgreSQL catalog import and pipeline succeeded on the VM.

Owner wants multiple flight partners and best-value selection. Only Aviasales data
access is currently verified. Owner screenshot of My Programs / Available / Flights
shows Kiwi.com, AirHelp, Aviasales, Compensair and KKday with Generate links.
Kiwi program availability is confirmed visually, but its price API access is not.
AirHelp/Compensair are compensation services; KKday is activities/ancillary travel,
so these cards do not establish five comparable sources of flight prices.
See [multi-partner-flights.md](multi-partner-flights.md) for checked access requirements,
comparison criteria and next integration steps. No cross-provider comparison is live yet.

Real flight offers and route-specific booking links are connected. Flight-v3 is released;
the remaining acceptance work is listed above. Package holidays remain
planned (owner confirmed both product types). hoptrip.pl is deployed with HTTPS and public
editorial indexing is open. Travelpayouts account created, Drive installed
and its script loading verified. Drive dashboard confirmation remains owner-side.
Owner saved the API token on the server; API container recreated on 2026-09-24.
Real ingestion and route-specific affiliate link generation now verified below.
Partner-side attribution and conversion reporting remain unverified.

Keep the token only in the server's protected
`/opt/hoptrip/.env.production` as `TRAVELPAYOUTS_API_TOKEN`. Do not send it in chat.
Owner supplied Aviasales link https://aviasales.tpx.gr/8mYVweU5 and a program overview
screenshot. A HEAD request returned 302 to the Aviasales.com homepage with marker.
Public referral identifiers from the response: marker=779959, trs=577569,
campaign_id=100, p=4114. These are not API credentials. The link contains no route
or dates and must not be attached to a specific priced flight as its booking link.
The screenshot lists Worldwide targeting, English/Russian languages, permitted
content creation, and restrictions on paid search/media buying. This does not
verify Polish-language service or attributed bookings.
Do not invent SubID syntax for the short URL.
Do not infer program approval from Drive installation or the existence of a token.
Completed first real-data run on 2026-09-24:

- Backup: `/opt/hoptrip/backups/hoptrip-20260924T204502Z-2287576.dump`.
- Read-only probes for WRO/WAW: HTTP 200, success=true, 10 offers each,
  currency=pln and market=pl requested. Currency is inferred from the request when
  omitted per item; links also carry expected_price_currency=pln.
- Tracked pipeline: PROVIDER_MAX_PAGES=1 and PIPELINE_MAX_ATTEMPTS=1;
  seven origins, 700 normalized offers, 74 saved offers/observations and 74 deals.
  626 unresolved routes skipped; no invalid/ambiguous/unconvertible offers.
  Each origin reached page_limit: this is a bounded sample, not complete coverage.
- All 74 components received route/date-specific links from the official
  `POST /links/v1/create` (batches up to 10, shorten=false, project/marker above).
  API returned success. Validated HTTPS tp.media, project/marker and semantic
  equality of the embedded target URL; the API reorders query parameters.
  Aviasales program configured APPROVED/active based on the supplied Available
  program and successful link API. Allowed host tp.media; tracking_param=NULL.
- Browser: catalog displays 12 cards on page one; a real detail page loads;
  available booking CTA returns 307 to tp.media with the matching route and IDs.
  No pageerror observed. This verifies our redirect, not a purchase or commission.

Recurring ingestion and link generation deployed on 2026-09-25. Worker starts a run
immediately and waits 3600 seconds after completion before the next run; restart policy
unless-stopped. Seven origins, PROVIDER_MAX_PAGES=1 (up to 700 input rows per attempt).
First scheduled run succeeded: 75 deals, 9 links updated, 66 unchanged, no invalid links.
Immediate manual repeat succeeded: 0 new observations, 72 duplicate observations,
75 unchanged links. That initial sample skipped 628 unresolved routes; the catalog expansion
on 2026-09-25 reduced unresolved routes to 10 in its recorded run (see above).
Backup before deployment: `/opt/hoptrip/backups/hoptrip-20260925T063829Z-2499178.dump`.
API ready after deployment. Backend tests: 127 passed, 5 PostgreSQL tests deselected;
Ruff/mypy passed. Two real PostgreSQL pipeline runs succeeded on the VM.
No per-click SubID modification; verify attribution in the partner dashboard separately.
The source omits found_at/expires_at; observed freshness is first-seen, not a live quote.
The existing 48-hour freshness filter stops displaying stale records without a worker.
Package holidays need a separate TravelLead application and confirmed feed/link access;
there is no implemented package feed adapter yet. See [seo.md](seo.md).

This is an **external-input checklist**, not the complete implementation plan. The repository
audit identified internal blockers; the local implementation and tests now address them. See
[project-audit-and-plan.md](project-audit-and-plan.md) for priorities, implementation scope
and acceptance criteria, and [implementation-status.md](implementation-status.md) for progress.

- [ ] Confirm permitted data access and capture one real provider response securely.
- [ ] Confirm one actual program's approval, link format, market/channel rules and attribution.
- [x] Implement program/component/click binding and approval checks; verify locally with fixtures.
- [x] Complete the public homepage → route → deal → booking CTA path with local E2E coverage.
- [x] Resolve observation deduplication, job concurrency and source-price freshness.
- [x] Prepare production configuration and verify backup/restore in an isolated local rehearsal.
- [x] Add token-free website/API/backup-age probes and tests of failure conditions.
- [x] Publish 35 content pages, including 18 city guides with official sources.
- [x] Verify green CI for flight-v3 revision 0e750b28cb9eed497c39d89c0ca2efe09c5c458c.
- [x] Configure real Aviasales links on 74 flight components; verify internal redirect.
- [ ] Verify attribution with a real partner.
- [ ] Finalize operator/contact/privacy/terms information.
- [x] Enable bounded recurring ingestion and automatic approved partner-link refresh.
- [x] Verify 37 sitemap URLs and 35 previews on hoptrip.pl after deployment.
- [ ] Continue reviewing date-sensitive facts in published content; indexing is already open.
- [x] Deploy to Oracle VM and verify public DNS/TLS, redirects and API readiness.
- [x] Verify one bounded real-data ingestion on the VM.
- [ ] Configure offsite backups, retention and monitoring delivery; verify a production restore drill.
- [x] Install daily local backup schedule and retention; verify isolated restore of a production dump.
- [x] Install five-minute host monitoring of website/API/worker/pipeline/backup/disk.
- [x] Configure Telegram recipient; confirm test-message, inbox and pipeline-summary delivery.
- [ ] Verify delivered failure/recovery messages and configure external VM monitoring.
- [ ] Configure independent offsite backup storage.
- [x] Deploy optional analytics/Drive consent, refusal and withdrawal controls.

Monitoring and backup schedules and the Telegram group recipient are configured. Offsite
storage, external VM monitoring and incident/recovery delivery acceptance remain open.
See [operations.md](operations.md) for invocation, checks and limitations.

Contact/privacy technical inventory and Polish text are prepared in
[privacy-publication-draft.md](privacy-publication-draft.md). Contact/privacy/terms are published,
the contact inbox works and public editorial indexing is open. Following the owner's request,
name and address were removed; the final form of operator identification remains an owner
decision. Owner installation permission for Drive does not establish visitor consent.
The visitor consent interface is implemented and deployed.

Account creation, data API access and affiliate approval are separate milestones. The
locally tested adapter and per-program policy are not evidence of a working commercial integration.
The original code audit did not revalidate provider-console instructions. The separate
owner guide now incorporates official documentation checked on 2026-09-20; account-specific
availability still needs confirmation in the owner's dashboard.

## 1. Travelpayouts data access and affiliate account

1. Open [Travelpayouts](https://www.travelpayouts.com) and create an account.
2. Verify the email address.
3. Create a Project for the HopTrip website. Use the production domain when it exists;
   add Telegram as a separate Project later if it will be a separate traffic source.
4. Open **My Programs**, select your Project and inspect **Available** programs. Travelpayouts
   now connects eligible programs automatically, while others require Project review.
   Select a flight program whose rules allow the intended market/channels; save its ID/status.
   Follow the current [program access guide](https://support.travelpayouts.com/hc/en-us/articles/360021216060-How-to-start-working-with-affiliate-programs)
   for additional access or review.
5. Open **Profile → API token** and copy the token into the local `.env` or production
   `.env.production` as `TRAVELPAYOUTS_API_TOKEN`. Do not regenerate the token after
   deployment unless every environment is updated: the old token becomes invalid.
6. For the selected program, record whether it supports deep links, the exact target URL
   format, the project/`trs` identifier, the partner marker, and the supported sub-ID
   parameter. We need these values to populate each deal component's `outbound_url`.
7. Read the program's traffic and attribution rules. Save the program terms or a link to
   them for the project record.

If a program is under review or unavailable, use the Help Center's **Submit a request**
form or email `support@travelpayouts.com`. Include the project URL, traffic sources,
Polish audience, expected integration method, and the exact questions below. Never include
the API token in the request:

```text
Subject: HopTrip flight-deal website: API, deep links and conversion tracking

Hello,

I am building HopTrip, a Polish flight-deal website at <PROJECT_URL>.
Traffic will come from the website and, later, a separate Telegram project.

Please confirm:
1. Which flight programs may be used for Polish traffic and these channels?
2. Is the cached data API enabled for my account and what are the rate limits?
3. Which deep-link endpoint or link format should be used for flight searches?
4. What are the project/marker identifiers and the supported sub-ID parameter?
5. Is conversion reporting available through an API or webhook, and which fields identify
   the sub-ID and booking?
6. Which attribution, disclosure and promotion rules apply?

Thank you.
```

References:

- [Travelpayouts quick start](https://support.travelpayouts.com/hc/en-us/articles/11394852618642-How-to-use-Travelpayouts-Quick-Start-Guide)
- [How programs are connected](https://support.travelpayouts.com/hc/en-us/articles/360021216060-How-to-start-working-with-affiliate-programs)
- [Where to find the API token](https://support.travelpayouts.com/hc/en-us/articles/13024069738386-Where-to-find-API-token)
- [Partner-link API](https://support.travelpayouts.com/hc/en-us/articles/25289759198226-API-for-Travelpayouts-partner-links)
- [Support contact](https://support.travelpayouts.com/hc/en-us/articles/11680481443730-How-to-contact-Travelpayouts-support)

## 2. Currency policy

Until a policy is accepted, the application intentionally normalizes PLN only. Other
currencies can be stored as raw offers, but are excluded from PLN history and deal generation.
FX is **not a blocker for a PLN-only flight launch**. If non-PLN coverage is required,
evaluate an exchange-rate source such as the ECB reference-rate API and verify its current
contract before implementation:

1. Decide that non-PLN observations are converted to PLN using the latest available ECB
   daily reference rate for the observation date.
2. Decide what happens on weekends or missing dates: use the latest prior ECB rate, or
   reject the observation.
3. Decide rounding (the recommended display/storage precision is two decimal places).
4. Confirm the chosen policy in the project issue or message so the converter can be enabled.

The source is [ECB Data Portal API documentation](https://data.ecb.europa.eu/help/api/data);
the exchange-rate dataflow is `EXR`.

## 3. Oracle VM, DNS and TLS

1. Create or sign in to an [Oracle Cloud account](https://www.oracle.com/cloud/free/).
   Choose the home region carefully because Always Free compute availability is tied to it.
2. In **Compute → Instances**, create a Linux VM. Use the VCN wizard, assign a public IPv4
   address, and upload an SSH public key. Keep the private key only on your computer.
3. In the subnet security rules, allow TCP `22` only from your own fixed IP if possible.
   Allow TCP `80` and `443` from `0.0.0.0/0` and `::/0` if IPv6 is enabled. Do not expose
   PostgreSQL `5432`, API `8000` or web `3000`.
4. At the domain registrar, add an `A` record for the chosen host (for example
   `deals.example.com`) pointing to the VM public IP. Add an `AAAA` record only when IPv6
   is configured and tested. If DNS is managed by OCI, create a public zone and delegate it
   at the registrar.
5. SSH into the VM, install Docker Engine and the Compose plugin, clone the repository, and
   copy `.env.production.example` to `.env.production`.
6. Fill the production file with the domain, ACME email, a URL-safe database password and
   a long admin token. Add the Travelpayouts token after data access is confirmed; the website
   can bootstrap without it. Configure the approved host, SubID and component links through
   the per-program admin API described in `docs/operations.md`.
7. Run the validation and deployment commands from `docs/operations.md`.
8. After HTTPS is issued, run one backup and a restore drill during a maintenance window.

Use Oracle documentation for [creating an instance](https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/launchinginstance.htm),
[security lists](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/securitylists.htm)
and [public DNS](https://docs.oracle.com/en-us/iaas/Content/DNS/Concepts/dnszonemanagement.htm).
Contact Oracle support from the OCI Console for account, quota or capacity problems. Contact
the domain registrar only for registrar or DNS delegation issues.

## 4. What to send back after completing the external steps

Send only non-secret values:

- production domain;
- Travelpayouts program name/code and project/marker identifiers;
- approved affiliate host;
- exact sub-ID parameter;
- link to program terms;
- accepted currency policy;
- VM public IP and SSH username, if deployment assistance is needed.

Keep API tokens, passwords, private keys and payment details on the machine where they are
used. These values unblock the provider-specific acceptance work. Internal tasks I01–I18
have local implementations and recorded checks; their completion does not verify external
accounts or infrastructure. Recheck CI for the release revision, then record real-data
acceptance and deployment evidence separately in `docs/release-acceptance.md`.
A provider conversion feed can follow when available; the existing protected JSON import
can support an initial verified manual reconciliation. Finish with a documented restore drill.
