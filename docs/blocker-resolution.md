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

## Audit status: 2026-09-24

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

No periodic worker enabled. Link generation was a one-off operational backfill,
not a new automatic pipeline stage. Next: implement tested recurring link generation,
expand explicit destination aliases, then enable bounded scheduled ingestion.
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
- [x] Verify 37 sitemap URLs and 35 previews on hoptrip.pl after deployment.
- [ ] Review date-sensitive facts before opening indexing.
- [x] Deploy to Oracle VM and verify public DNS/TLS, redirects and API readiness.
- [x] Verify one bounded real-data ingestion on the VM.
- [ ] Configure offsite backups, retention and monitoring delivery; verify a production restore drill.

The probe implementation is ready; no monitoring schedule or notification destination has
been installed on a server. See [operations.md](operations.md#проверка-доступности-и-возраста-backup)
for invocation and limits, and [release-acceptance.md](release-acceptance.md) for the release record.

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
