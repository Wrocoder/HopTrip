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

## Audit status: 2026-09-25

Страна владельца подтверждена: **Poland / Polska**. Владелец — физическое лицо;
спрашивает о возможности не публиковать имя и фамилию. Публикация имени/адреса
не согласована, эти данные не подставлять из локальных путей или профилей.
Название HopTrip само по себе не идентифицирует физическое лицо — оператора.
При подготовке публичных текстов учитывать идентификацию администратора по ст. 13 RODO
и применимость [ст. 5 закона об электронных услугах](https://eli.gov.pl/api/acts/DU/2024/1513/text.html).
Это вопрос публичных обязанностей оператора, а не самостоятельное техническое
требование Google к имени владельца. Индексация остаётся закрытой по ранее выбранному
порядку запуска до завершения публичных страниц.

### Telegram: уведомления о письмах подтверждены владельцем

Реализация `2acd993` запушена в `master` и установлена на Oracle VM 2026-09-25.
Владелец подтвердил 2026-09-25: при поступлении письма приходит уведомление в бота.
Доставка почтовых уведомлений проверена; получение сводок и тестового алерта отдельно
пока не подтверждено.

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
- [ ] Подтвердить получение тестового сообщения и сводки в Telegram.

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
не подключён. Доставка уведомлений о письмах подтверждена; сводки и тестовый алерт
остаются отдельными пунктами приёмки.

### Ближайшие шаги для Google — проверка 2026-09-25

- Главная и sitemap отвечают HTTP 200, но сервер возвращает `X-Robots-Tag: noindex, nofollow`.
  В robots.txt для `User-agent: *` стоит `Disallow: /`: индексация намеренно закрыта.
- Сначала завершить contact/privacy/terms: получить имя владельца, страну и адрес для
  публикации/обращений; рабочий `kontakt@hoptrip.pl` подтверждён входящим письмом.
  Доставка ответа из ящика отдельно не подтверждена. Учесть реальную обработку почты,
  Telegram, аналитику и партнёрские инструменты в публичных текстах.
- Затем снять общий запрет индексации, проверить canonical, sitemap, публичные страницы
  и сохранение ограничений технических маршрутов. Порядок согласован владельцем ранее.
- Владелец может уже сейчас подтвердить `hoptrip.pl` в Google Search Console через DNS TXT.
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
scheduled backups. Telegram inbox notification delivery is confirmed by the owner;
incident/recovery and pipeline-summary delivery still need separate acceptance. No offsite
copy is verified yet.
Website consent controls deployed: analytics and Drive off by default, separate choices,
reject/save/accept, expiry and withdrawal. 134 backend tests + 82 browser tests passed;
real Drive consent/withdrawal checked on hoptrip.pl. Full evidence: operations.md.
Country Poland and working inbox kontakt@hoptrip.pl confirmed; operator name/address remain pending. Contact/privacy/terms
remain draft, indexing remains blocked. Search Console steps: [indexing-launch.md](indexing-launch.md).

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

Current priority: connect real flight offers and verified booking links, followed by
package holidays (owner confirmed both product types). hoptrip.pl is deployed with
HTTPS; indexing remains disabled. Travelpayouts account created, Drive installed
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
75 unchanged links. Latest sample skipped 628 unresolved routes; expand explicit aliases next.
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
- [ ] Verify green CI for the exact release revision.
- [x] Configure real Aviasales links on 74 flight components; verify internal redirect.
- [ ] Verify attribution with a real partner.
- [ ] Finalize operator/contact/privacy/terms information.
- [x] Enable bounded recurring ingestion and automatic approved partner-link refresh.
- [x] Verify 37 sitemap URLs and 35 previews on hoptrip.pl after deployment.
- [ ] Review date-sensitive facts before opening indexing.
- [x] Deploy to Oracle VM and verify public DNS/TLS, redirects and API readiness.
- [x] Verify one bounded real-data ingestion on the VM.
- [ ] Configure offsite backups, retention and monitoring delivery; verify a production restore drill.
- [x] Install daily local backup schedule and retention; verify isolated restore of a production dump.
- [x] Install five-minute host monitoring of website/API/worker/pipeline/backup/disk.
- [ ] Configure recipient, verify delivered failure/recovery messages and external VM monitoring.
- [ ] Configure independent offsite backup storage.
- [x] Deploy optional analytics/Drive consent, refusal and withdrawal controls.

Monitoring and backup schedules are installed; notification destination and offsite storage
are still missing. See [operations.md](operations.md) for invocation, checks and limitations.

Contact/privacy technical inventory and Polish text are prepared in
[privacy-publication-draft.md](privacy-publication-draft.md). Publication still needs
confirmed operator details, working contact email and remaining processing/consent details.
The public pages remain draft; indexing remains blocked. Owner installation permission for
Drive does not establish visitor consent. The visitor consent interface is now implemented;
the complete privacy disclosure still needs owner/processing details.

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
