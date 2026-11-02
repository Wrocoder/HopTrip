# SEC-01 — Security and Privacy Review

Дата: 2026-10-30. Объём: текущий checkout, изолированные тесты и пять публичных GET для заголовков. Зависимость AUD-01 выполнена. Следующие задачи roadmap не реализовывались.

Машиночитаемая сводка: [results.json](results.json). Статус SEC-01: DONE в пределах описанного review и исправлений checkout.

## Исправленные находки

| ID / серьёзность | Проверенное доказательство | Изменение и результат |
|---|---|---|
| S01 / Critical upstream | Lock содержал certifi 2026.7.22 с GHSA-6q48-6c7w-9gw2: доверие скомпрометированной цепочке CA при дополнительных условиях атаки | certifi 2026.10.23. Повторный аудит lock без известных уязвимостей. Работающий production образ не проверен и не обновлялся |
| S02 / Moderate upstream | pytest 8.4.2: GHSA-6w46-j5rx-g56g / CVE-2025-71176, локальная атака через временные каталоги на UNIX | pytest 9.0.3, dev constraint >=9.0.3,<10.0. Все 666 backend tests прошли с этой версией; Windows-прогон сам UNIX exploit не воспроизводит |
| S03 / High potential exposure | Scratch Docker COPY с синтетическими canary: старый root context экспортировал 7/9 приватных путей, web — 9/9 | Оба .dockerignore закрывают env, monitor.env, operator.json и локальные служебные каталоги. После исправления 0/9 в обоих контекстах; публичная web fixture operator.json сохранена. Факт утечки реальных secrets не установлен |
| S04 / Medium diagnostic disclosure | Два новых теста до исправления воспроизвели вывод синтетических значений в строке Settings ValidationError | hide_input_in_errors=True. Оба теста и полный backend suite прошли. Это защита текстовых diagnostics; при использовании structured errors() по-прежнему нужен include_input=False |

Первичные источники: [certifi advisory](https://github.com/certifi/python-certifi/security/advisories/GHSA-6q48-6c7w-9gw2), [pytest 9.0.3 release](https://github.com/pytest-dev/pytest/releases/tag/9.0.3), [pytest advisory](https://github.com/advisories/GHSA-6w46-j5rx-g56g). Справка по [Docker build context](https://docs.docker.com/build/concepts/context/) и [Pydantic configuration](https://docs.pydantic.dev/latest/api/config/#pydantic.config.ConfigDict.hide_input_in_errors).

Lock изменён только в двух pin-строках. Обновлённые pytest/certifi установлены в ignored .cache/sec01-updated и подставлялись через PYTHONPATH; установленный SDK пользователя не переустанавливался. Для устранения риска в работающей среде потребуется отдельный обычный release с пересборкой образа. SEC-01 не даёт оснований считать production уже исправленным.

## Проверка всех 12 областей

| Область | Проверенное поведение и источники кода | Остаточные риски / границы |
|---|---|---|
| Secrets | config.py: SecretStr и production validation default admin/DB credentials; текстовые errors исправлены. Логи запросов используют metadata; provider logger скрывает Ticketmaster API key. Ограниченный pattern scan: 1048 текущих неигнорируемых текстовых файлов, 0 совпадений | Это не полный credential scanner: private env, process environment, git history и внешние хранилища не читались. Rotation и активные credentials не проверены |
| API input | Pydantic bounds/literals, ограниченные filters, SQLAlchemy parameter binding; SecurityMiddleware ограничивает body 64 KiB на защищённых mutating paths. Admin token compare_digest | Нет penetration test или полного fuzzing. Публичные GET каталога не получают общий mutation rate limit |
| External URLs | affiliate_adapters/stored.py проверяет provider/program, HTTPS/exact host, port, userinfo, control characters, tracking parameter. /go повторяет policy/availability перед 307. Ticketmaster nested URL и сохранённые event links имеют allowlist | Trust deploy-config provider base URLs остаётся; пользовательский arbitrary server fetch target в просмотренных путях не обнаружен. Live affiliate кабинеты/переходы не проверялись |
| CSP | Public / и /deals: CSP и Report-Only отсутствуют. /api/v1/editor/: строгая self policy, frame-ancestors none, base-uri none. X-Frame-Options DENY/nosniff присутствуют на sampled 200 responses | Medium hardening gap публичного web. Нужна отдельная проверка Next nonce/hash, inline bootstrap и consent-on scripts перед CSP rollout; доказанного XSS нет. HSTS также не наблюдался, инфраструктура не менялась |
| Rate limits | In-memory buckets, socket peer, login 5/min, public mutation default 120/min; uvicorn --no-proxy-headers. Header XFF не становится доверенным сам по себе | Medium availability gap: за Caddy клиенты могут делить bucket; multi-process quotas не общие, public GET не покрыты. Нужны ingress/trusted-proxy решение и нагрузочная проверка; production config менять не разрешено |
| Dependencies | npm audit: 0 vulnerabilities, metadata total 409; pip-audit: 42 pinned packages, два уникальных advisory до, 0 после | Feed вернул дубли: 4 entries означают 2 уникальные уязвимости. OS/base images, pip/setuptools SDK, внешние scripts и production inventory не аудировались; zero known не означает отсутствие новых уязвимостей |
| User content | React escaping; JSON-LD заменяет < на Unicode escape; editor textContent и HTML escaping в SVG; shared drafts ограничены allowlist/размером/числом элементов и перепроверяются | Shared URLs — переносимые незашифрованные пользовательские копии, не подписанная бронь; данные доступны получателю ссылки. Полный stored-XSS pentest не проводился |
| Analytics consent | Optional off по умолчанию, expiry 180 days, analytics session 30 min; withdrawal очищает session и при необходимости reload. Browser consent tests прошли | Backend принимает недоверенные public analytics events: rate/bounds не являются криптографическим доказательством согласия. Технические affiliate click records возможны без optional analytics session; правовое основание требует review |
| Personal information | Email хранится plaintext для доставки; operator identity читается runtime, страницы private/no-store; bearer management links используют fragment и HMAC, access проверяется constant-time. Private editor: PBKDF2, hashed sessions, expiry, HttpOnly/SameSite/Secure, Origin + CSRF для mutation | DB/disk/backup encryption и реальные ACL не проверены. Stable bearer link даёт доступ его владельцу; browser localStorage и копии trip URLs могут раскрывать бюджет/предпочтения |
| Email consent | Literal true для signup, double opt-in, confirmation TTL 48 h, consent version/request/confirmed timestamps, STOPPED unsubscribe; backend journey/preferences/digest tests и browser journey с fake mail | Реальные SMTP/списки/активные флаги не проверены; production delivery не активировалась. Повторное согласие и доказательства оснований должен оценить специалист |
| Third-party trackers | Drive emrld.ltd загружается после marketing consent и только на разрешённых страницах; исключены deals/info/alerts/trip/saved; локальные tests проверяют отсутствие запросов до согласия | Third-party JavaScript после opt-in имеет supply-chain risk. Production consent-on, состав cookies партнёра, DPA/transfers и vendor changes не исследованы |
| Deletion / retention | apply_retention удаляет raw analytics по default 90 days, очищает session/source/campaign старых clicks, сохраняет финансовые ключи; вызывается maintenance/pipeline | Medium privacy gap: автоматической TTL для pending/stopped DealAlert и delivery history / self-service erasure не найдено. Backup retention неизвестен. Массовое удаление без согласованной политики не выполнялось |

Строгая CSP — дополнительный слой защиты; её отсутствие само по себе не доказывает XSS: [OWASP CSP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html). Публичный editor login UI с HTTP 200 ожидаем; это не выдача приватных данных. Public admin route вернул 404, не доказательство доступности внутреннего admin API. Chrome сообщил navigation error для пустого 404; HTTP response сохранён отдельно.

## Вопросы для профессионального review

- Правовые основания технических click logs, analytics и marketing tracking, состав consent текста и доказательства его версии.
- Сроки pending/stopped subscription и delivery history, запросы удаления/доступа, исключения для финансовых записей, сроки резервных копий и процедура удаления из них.
- Договоры с email/hosting/affiliate vendors, международная передача, информация об операторе и полнота privacy/cookie disclosures на всех языках.

Это вопросы, требующие решения владельца продукта и специалиста. Код и тесты не подтверждают юридическое соответствие. Публичные CSP, proxy quotas и retention policy остаются явно открытыми действиями; они не исправлялись случайным изменением инфраструктуры или удалением данных. Подтверждённая Critical dependency закрыта в checkout; её действующее deployment-состояние неизвестно.

## Проверки и воспроизводимость

Python всегда запускался через SDK, возвращённый PyCharm get_python_environment. Для backend процессов: APP_ENV=test, DATABASE_URL=sqlite://, выключенные реальные delivery/sync/editor flags, PYTHONPATH=.cache/sec01-updated;apps/api. Полные команды ниже предполагают PowerShell и актуальный SDK path вместо $sdk.

```powershell
& $sdk -m pytest apps/api/tests -m 'not postgres' -q --junitxml=docs/sec01/backend-updated.xml
& $sdk -m pytest apps/api/tests -m postgres -q --junitxml=docs/sec01/postgres.xml
& $sdk -m ruff check apps/api
& $sdk -m mypy apps/api/app
& $sdk -m piptools compile --extra=dev --strip-extras --no-emit-index-url --upgrade-package=certifi==2026.10.23 --upgrade-package=pytest==9.0.3 --output-file=requirements.lock pyproject.toml
# Auditor installed separately into .cache/sec01-tools:
& $sdk -m pip_audit -r requirements.lock --no-deps --disable-pip --format=json --output=docs/sec01/python-audit-after.json
# From apps/web:
npm audit --json
npm run test:unit
npm run lint
npm run build
# From repository root, unique names, no existing workspace overwritten:
./docs/sec01/check-docker-context.ps1 -WorkspaceName sec01-docker-probe-new
./docs/aud05/prepare-e2e.ps1 -WorkspaceName aud05-sec01-new
node docs/sec01/inspect.cjs
# From the resulting isolated apps/web; HOPTRIP_TEST_PYTHON=$sdk, PLAYWRIGHT_CHANNEL=chrome:
node node_modules/@playwright/test/cli.js test consent.spec.ts alerts.spec.ts --reporter=json
```

PostgreSQL command требует отдельной одноразовой БД, а не приведённого sqlite URL. В этой сессии: postgres:16-alpine, hoptrip_test, random loopback port 61500, label hoptrip.audit=SEC-01, без host volumes. Alembic upgrade head до 0018; затем 11 PostgreSQL tests. Контейнер остановлен после проверки label, --rm удалил его. На production Alembic не запускался.

Для pip-audit PYTHONPATH указывал на .cache/sec01-tools. Первоначальная TLS trust ошибка решена REQUESTS_CA_BUNDLE с экспортом публичных Windows trust roots через ssl; TLS verification не отключалась. Audit фиксирует lock без dependency resolution, поэтому предупреждение --no-deps/full hashes сохранено; lock не имеет hashes.

| Проверка | Результат / доказательство |
|---|---|
| Новые config regression tests до fix | 2 failed: синтетическое значение попало в diagnostic |
| Backend с pytest 9.0.3 и certifi 2026.10.23 | 655 passed, 11 deselected, 2 deprecation warnings, 62.45 s — [XML](backend-updated.xml) |
| PostgreSQL с обновлёнными пакетами | 11 passed, 655 deselected, 2 warnings, 21.22 s — [XML](postgres.xml); вместе 666 различных tests |
| Предварительный backend на SDK pytest 8 | 655 passed — [XML](backend.xml); не суммируется повторно |
| Ruff / mypy | Passed / no issues in 100 source files |
| Web Node unit / ESLint / build | 110 passed / passed / passed, включая TypeScript и 61 static/SSG pages |
| Docker scratch probes | [Before/after](docker-context.json): safe file сохранён, приватные canaries исключены |
| Package audits | [Python до](python-audit-before.json), [после](python-audit-after.json), [npm](npm-audit.json) |
| Secrets / public headers | [Pattern scope/results](secret-patterns.json), [5 responses](public-headers.json); публичный сбор не принимал consent и не отправлял формы |
| Browser | 24 cases: 23 passed, 1 unexpected; целевой повтор 1 passed, unexpected=0, errors=[] (14.41 s). Полный 436-case suite не запускался |

Browser fixture использует собственную SQLite, fake SMTP и порты 3125/8125. Обнаружена ошибка вспомогательного копирования AUD-05: alerts_site_url в скопированном Python fixture остался 3100. prepare-e2e.ps1 теперь заменяет порты также в копии e2e_app.py; runtime исходник fixture не изменён. Первый незавершённый запуск прерван; его оставшиеся дочерние серверы остановлены только после проверки command line и дерева процессов. Повторная подготовка на занятом audit-порту была отклонена; чужие 3100/8100 не останавливались.

После исправления helper выполнены 24 browser cases: 23 passed, 1 unexpected desktop failure, errors=[] — [полный JSON](e2e-initial.json). Первый signup увидел unavailable state до формы; mobile и localized flows прошли. Причина недоступности в этом первом запросе не доказана: alertStatus также fail-closed при fetch error. Нельзя приписывать это установленной настройке: fixture явно включает alerts. Пробный запуск с ALERTS_ENABLED=true остановился до cases из-за startup validation без real credentials — [setup JSON](e2e-recheck-setup.json). Поэтому целевой повтор использует обычный false при загрузке Settings и безопасный fixture override; реальные SMTP credentials не требуются. [Повтор desktop signup journey](e2e-recheck.json): 1 passed, unexpected=0, errors=[], 14.41 s. Исходный failure не скрывается и весь первый набор не назван зелёным.

## Release / откат / ограничения

Изменены config diagnostics, build ignore и два dependency pins; DB schema, API contract, UI, локализации и affiliate tracking не менялись. Rollback миграций не нужен. При проблемах release следует сохранить patched certifi/pytest и устранить несовместимость; возврат уязвимого certifi не является безопасным rollback. Для .dockerignore допустимы только точечные исключения проверенного публичного файла с повтором canary test, без включения реальных env/PII.

Существующие пользовательские изменения master plan, Playwright baseline и AUD artifacts сохранены. Появившиеся IDE modules/.iml не исправлялись в рамках SEC-01. После build next-env.d.ts восстановлен к исходным dev imports. Автоматическая проверка отклонила удаление пустого служебного apps/web/docs/sec01 с причиной «blocked by policy»; обход не применялся, пустой каталог оставлен.

SEC-01 завершает review и исправления в checkout с явно перечисленными остаточными рисками. Production deployment, реальная доставка, внешний penetration test и юридическая сертификация не проводились. DATA-03 не начата.
