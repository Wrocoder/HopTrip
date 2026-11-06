# HopTrip — Post-Release Product Improvement Plan (H3)

**Target:** Existing HopTrip application (`https://hoptrip.pl/`)  
**Audience:** Cortex / autonomous coding assistant  
**Version:** 3.0, 2026-11-02  
**Status:** Implementation specification; verify against the current repository before changes  
**Suggested repository path:** `docs/HOPTRIP_H3_IMPLEMENTATION_PLAN.md`  
**Project language:** Existing code conventions; **report all findings and progress to the user in Russian**.

> The observations that motivated this roadmap come from a public-site audit, not a complete source-code or browser-level examination. Treat them as hypotheses to reproduce, not proof of defects. Never create a duplicate feature just because this specification mentions it.

---

## 0. Mission and success criteria

Turn HopTrip from a feature-rich flight listing into a trustworthy, fast, low-friction product for finding **practical short trips from Poland**. The differentiator is not only the ticket price, but the actual dates, convenience, time in the destination, realistic approximate budget, events, and the ability to return to a trip.

The primary user flow is:

**Origin / trip intent → Search results → Understand price and itinerary → Select offer → Verify booking at partner → Plan accommodation, events, budget → Save / revisit / subscribe.**

The release is successful when:
- Users can distinguish a weekend departing Sunday from a trip that *arrives home Monday*.
- An offer's displayed duration and actual travel itinerary agree, including layovers and timezone offsets.
- Missing historical-price information never masquerades as a good deal or yields misleading ranking.
- Cards expose key decisions in seconds: destination, dates, cost, journey conditions, next action.
- Planning and saved-trip flows remain correct and easy to understand.
- No new external-data, consent, affiliate, accessibility, or SEO regressions are introduced.
- Relevant funnels, errors, freshness, and conversions can be measured without fabricating KPI improvements.

### Key product principles

1. **Truth over aesthetics.** Do not invent flight, event, transfer, hotel, or budget data.
2. **Clear by default; details on demand.** Technical formulae and caveats can be expanded, but material restrictions must remain visible.
3. **Preserve existing work.** Avoid rewriting architecture or duplicating existing features.
4. **One task, one reviewable change.** Never implement all 18 tasks in a single run.
5. **Real local-time correctness.** Timezone offsets, overnight flights, and DST are part of the product logic, not edge-case decoration.
6. **Measurable effects.** Add instrumentation where valid, then evaluate results instead of assuming uplift.

---

## 1. Non-negotiable execution protocol

### 1.1 First run is a read-only reconciliation

Before implementing H3 tasks:

1. Read this plan and existing project instructions (`AGENTS.md`, previous `HOPTRIP_MASTER_PLAN.md`, any `HOPTRIP_PROGRESS.md`, architecture docs).
2. Inspect the actual frontend/backend stack, routing, APIs, data sources, DB migrations, jobs, translation mechanism, test tooling, feature flags, deployment process, and analytics/consent logic.
3. Map all 18 tasks to existing modules/components and identify already-implemented behavior.
4. Reproduce alleged issues with stable fixtures or browser tests when possible. Mark each as **CONFIRMED / PARTIAL / NOT REPRODUCED / NEEDS EVIDENCE**.
5. Record pre-change tests, build results, affected routes, and known defects.
6. Create `docs/HOPTRIP_H3_PROGRESS.md` and `docs/HOPTRIP_H3_DECISIONS.md` if absent. Do not overwrite historical documents.
7. Output a short Russian summary; **stop without modifying product behavior**.

### 1.2 Every subsequent run

1. Read this plan, progress and decisions.
2. Select a single eligible task or the task explicitly requested by the user.
3. Inspect current implementation and tests; document what actually exists.
4. Define minimal implementation scope, migrations (if any), API contracts, localization, UX states, rollbacks, and tests.
5. Implement that **one task only**. Split into sub-tasks if it is too large.
6. Run affected tests, lint, type checks, build, and browser checks if available.
7. Inspect diff for unintended changes, stale copy, timezone assumptions, sensitive data, accessibility and SEO regressions.
8. Update the tracker, decisions, and task verification evidence; report in Russian and stop.

**Progress state**: `TODO / IN_PROGRESS / BLOCKED / DONE / NOT_APPLICABLE`. `DONE` requires acceptance criteria and test evidence. If browser tools or external services are unavailable, report the limitation. Do not claim those tests passed.

### 1.3 Safety and compatibility

- No direct production data changes, destructive migrations, production deploys, real notification dispatches, paid API usage, account creation, credentials changes, or external affiliate transactions without explicit permission.
- Treat external providers as untrusted and possibly rate-limited. Use mocks/sandbox or controlled canary testing.
- Preserve existing public SEO URLs, locale URLs, canonical/hreflang rules, bookmarks, saved-plan/share URLs, and affiliate attribution unless a reviewed migration is required.
- Preserve existing privacy consent semantics; do not send analytics before required consent.
- Respect the project's existing architecture and style, avoid speculative dependencies and large refactors.
- Build must be compatible with existing CI and deployment configuration.
- New UI strings must be localized in **PL, EN, RU, UK** using existing i18n conventions; Polish is the primary UX copy.
- Document schema/API versioning and backward compatibility for any changed contracts.
- Use synthetic and explicitly marked values only in tests/stories, never in production travel recommendations.

### 1.4 Artifact format and tracking

At each completed task append/update a tracker row with: `ID | priority | status | implementation PR/commit (if known) | affected files | tests and outputs | behavior changes | feature flag/rollback | blockers | next action`.

Suggested command for first run:

> Read `docs/HOPTRIP_H3_IMPLEMENTATION_PLAN.md`. Execute *only* the read-only repository reconciliation described in section 1.1. Produce the tracker and report in Russian. Stop.

Suggested command for later runs:

> Continue the HopTrip H3 roadmap. Read its plan, progress and decisions. Execute only the next unblocked task; test it, update the tracker, report in Russian, and stop.

---

## 2. Verified-vs-unverified decision framework

**Previously observed on public pages, subject to reproduction:** `Wynik pomocniczy` in sorting; `Bez noclegu` on multi-night flights; Sunday return departures with Monday arrival; long explanations in some listing/details markup; local saved plans/drafts; flight-alert registration possibly unavailable; thin destination pages without current offers.

**Not yet established by a public-text audit:** actual runtime/filter bugs, Core Web Vitals, accessibility performance, frequency of misleading offers, ranking correctness, conversion rates, accuracy of affiliate attribution, email deliverability, full localization, provider availability, or Google indexation.

Every issue must be triaged. `NOT REPRODUCED` means document evidence and avoid changing behavior solely to match this document.

---

## 3. Dependency-aware order

### Foundation (before altering product logic)
- **H3-17a** Baseline browser/mobile/visual/E2E and Lighthouse measurement (subset of H3-17).
- **H3-18a** Validate current analytics and consent, and define baseline events (subset of H3-18).
- **H3-04** Deal-price comparison, sort semantics and missing-score behavior.

### Release A — Trustworthy short trips (P0)
- **H3-02** Display actual arrival-home date and overnight offset.
- **H3-01** Weekend modes and no-leave rules (depends on H3-02).
- **H3-03** Correct misleading lodging label.
- **H3-05** Validate affiliate redirects and propagated dates.

### Release B — Fast decisions (P1)
- **H3-06** Simplify flight cards and progressive disclosure (depends on 02/03/04).
- **H3-07** Time-at-destination calculation and sorting (depends on 02).
- **H3-08** Airport/city transfer awareness (depends on 02, optionally 07).
- **H3-16** Reduce duplicated explanatory UI copy (coordinates with 06).
- **H3-09** Curated dynamic visual collections (depends on 04, 06).
- **H3-10** Usable destinations directory (can run independently, coordinate with 09).

### Release C — Better trip planning (P1)
- **H3-11** Budget presets and concise budget UX.
- **H3-12** Save/edit/copy trip semantics.
- **H3-13** Event fit within itinerary (depends on 02 and 07).

### Release D — Retention and sustainable acquisition (P1)
- **H3-15** Useful destination pages with no active offers (coordinates with 10).
- **H3-14** Production-ready subscription flow (requires privacy, deliverability and operational gates).
- **H3-17b** Full mobile/browser/accessibility/performance regression and optimization.
- **H3-18b** Funnel dashboards, controlled experiments, post-release evaluation.

These are suggested dependencies, not permission to make unrelated changes. Prioritize any confirmed P0 correctness/security regression ahead of aesthetics.

---

# 4. Detailed task specifications

## H3-01 — Clear weekend modes and "without taking leave"
**Priority:** P0 | **Complexity:** L | **Depends:** H3-02, itinerary datetime contract

**Problem:** "Weekend" can mean return flight departs Sunday even when passenger arrives back Monday. A working traveler may unintentionally choose a trip requiring a day off. A Friday morning departure may also require leave.

**Implementation:**
1. Inspect existing weekend presets, filters and query params. Preserve the existing default until a documented behavior change is approved.
2. Introduce distinct *user-facing* modes (final names localized):
   - `Weekend bez urlopu` (works with configurable start/end-of-work-day and actual arrival-home airport timestamp).
   - `Weekend piątek–niedziela` (calendar-day flight departure pattern, clearly warns if airport arrival is Monday).
   - `Elastyczny weekend` (allows nearby Thursday/Monday and makes extra days visible).
3. Define strict per-mode predicate server-side or shared logic, with versioned filter contract. Document unknown time behavior: **unknown itineraries cannot be certified "without leave"**.
4. Make work hours explicit as a product assumption/configuration (e.g. standard weekday schedule) or let users adjust. Do not claim guaranteed no-leave travel: airport commute, immigration and workplace are unknown.
5. Expose useful result information: `actual_return_local_date`, `airport_arrival_day_offset`, `might_require_leave`, `confidence/unknown`.
6. Sync selected mode with URL and all relevant landing pages without breaking SEO-friendly URLs.
7. Ensure fast presets do not silently overwrite manual filters. Show active chips and reset logic.

**Acceptance:** A trip arriving Monday is not silently shown as "back Sunday"; no-leave mode does not falsely accept it. Unknown actual arrival is handled honestly. Existing weekend URLs continue to work.

**Tests:** Friday morning departure; Friday evening departure; Sunday arrival; Sunday departure/Monday arrival; Monday return allowed in flexible mode; flight across DST; missing actual arrival; origin airport different from home city; filtering + URL reload + back button.

## H3-02 — Actual return-home date and trip timeline
**Priority:** P0 | **Complexity:** M | **Depends:** repository/data audit

**Problem:** Offer header dates can reflect outbound/return-leg departure, while real passenger arrival at original airport occurs next day after a layover. "2 nights" in destination is not the same as number of days until returning home.

**Implementation:**
1. Trace route/segment model, schedule timezone and presentation formatting, including multi-leg itinerary.
2. Identify and normalize: departure from origin; arrival in destination; last departure from destination; final arrival at origin airport. Use offset-aware timestamps + correct IANA timezones, not UTC dates or naive datetimes for local display.
3. Distinguish `nights_at_destination`, `local_return_departure_date`, `final_arrival_at_origin_date` and `journey_elapsed_time`.
4. In results/cards/detail show a prominent localized signal when actual origin-airport arrival is after advertised return departure date: e.g. `Powrót do Poznania: poniedziałek 25.01 (+1 dzień)`.
5. If final arrival is not available, show `Godzina/dzień powrotu do potwierdzenia`; never derive arbitrary dates from a departure time.
6. Use a single itinerary formatter shared by card, detail, saved plan and alerts. Backfill or migrate persisted data only if safe and necessary.

**Acceptance:** Card/detail/saved plan use consistent actual return information; `+1 day` is calculated from correct local airport dates and clearly distinguished from duration/nights.

**Tests:** Barcelona→Bergamo→Poznań overnight; connection crossing midnight in different timezones; DST change in March/October; arrival UTC date differing from local date; incomplete segments; two different return airports; duplicate leg records.

## H3-03 — Replace ambiguous "Bez noclegu" copy
**Priority:** P0 | **Complexity:** S | **Depends:** inventory of shared label

**Problem:** `Bez noclegu` appears next to trips with 1–3 nights and may be interpreted as "no overnight stay", when it is intended to mean lodging cost is excluded.

**Implementation:**
1. Search all locales/components for `Bez noclegu` and equivalent strings. Confirm business meaning in every context.
2. Use explicit copy where appropriate: Polish `Cena dotyczy lotu. Nocleg nie jest wliczony.` (short form: `Nocleg osobno`). Translate into EN/RU/UK.
3. Separate trip duration chips from price-inclusion disclaimers and baggage information. Deduplicate repetitive text at listing level without hiding material conditions.
4. Do not relabel a genuinely same-day trip as an overnight stay.

**Acceptance:** No ambiguous inclusion label remains on production flight cards/details; all four languages reviewed; clear difference between stay duration and price coverage.

**Tests:** unit/snapshot copy checks for 0/1/3-night cases; i18n missing-key checks; desktop/mobile overflow.

## H3-04 — Price-history reliability, ranking and visible sorting
**Priority:** P0 | **Complexity:** L | **Depends:** baseline + data source audit

**Problem:** Default sort called `Wynik pomocniczy` is technical and may imply overall trip quality; historical median is sometimes unavailable. The relationship between score, sample size, stale data, missing statistics and search order requires validation.

**Implementation:**
1. Audit exact calculation in ingestion/DB/API/frontend, compare documentation, and check algorithm version/units and sample eligibility.
2. Create deterministic reference fixtures with comparable flight groups, variable sample size, zero/NULL price data, stale values, different dates, connections and currencies.
3. Clearly separate `price_advantage` (vs a *comparable observed sample*) from itinerary convenience; do not market it as market-wide discount or overall trip score.
4. Define explicit eligibility/quality thresholds for showing a historical comparison. Thresholds must be justified by existing methodology/data; do not invent a percentage cutoff.
5. Define deterministic fallback sort for offers with no valid comparison. Options should be human-readable, e.g. cheapest, soonest, most time on-site, best observed sample price advantage *when eligible*.
6. Ensure NULL/missing scores do not outrank valid ones simply because of an implementation artifact; stabilize ties by defined secondary keys and unique ID.
7. Maintain backward compatibility for saved searches/URLs, document any sort-label migration.
8. Make methodology page and tooltips match actual calculation and dataset, including currency conversion policy and timestamp semantics.
9. If default sort is changed, record decision and measure effect. Do not silently conflate "cheapest" and "best deal".

**Acceptance:** Test fixtures match calculation from API to UI; missing medians show a neutral label; default ranking and sorting are truthful, deterministic, explainable; documentation current.

**Tests:** median/no median/insufficient sample; malformed price; stale observation; unequal currencies; equal scores; null sorting; pagination stability; API/UI consistency; regression on historic score fixtures.

## H3-05 — Affiliate link, date and itinerary consistency
**Priority:** P0 | **Complexity:** M | **Depends:** data model inventory, H3-02 where relevant

**Problem:** A click may lose dates, origin, destination, passenger or accommodation context, invalidating the user journey. Outbound click is not a confirmed booking.

**Implementation:**
1. Inventory all affiliate providers and link builders (flight, accommodation, event, attraction) and their allowed URL parameters and attribution rules.
2. Create typed builders and/or centralized validators rather than duplicating string concatenation. Respect current provider agreements and API schemas.
3. Validate date values (departure/return, hotel check-in/out), origin/destination and passenger counts only where provider contract supports them.
4. For any missing or unsupported parameter, disclose limitation rather than fabricating a deep link.
5. Preserve attribution codes and explicit external-site/price-verification disclosure.
6. Check `target`, `rel="noopener noreferrer"`, URL encoding, URL allowlists, expired-offer behavior, and privacy rules.
7. Add synthetic contract tests plus a controlled manual smoke checklist for real partner redirects. Never place test purchases automatically.

**Acceptance:** Generated links contain supported correct parameters, no unsafe URL injection, no silent date mismatch; affiliate disclosures remain visible.

**Tests:** direct/connecting itineraries; midnight return; different airports; missing dates; hotel stays crossing month boundary; Unicode city names; unsupported provider params; expired offer; mobile click.

## H3-06 — Flight card: decision-first UI
**Priority:** P1 | **Complexity:** M/L | **Depends:** H3-02, 03, 04

**Problem:** Cards expose repeated formulas and long technical descriptions instead of quickly answering "Where? When? How much? Is this practical?".

**Implementation:**
1. Find existing card variants, consolidate behavior using current component system; do not create an unnecessary generic UI framework.
2. Default card: destination + airport origin, departure and actual final return, nights/time onsite (when known), total flight price per person with currency/price source, transfer/layover warning, historical comparison if valid, clear CTA.
3. Place methodology, observation counts, FX conversion, technical timestamps and provider metadata in progressive disclosure, unless legally/materially required above the fold.
4. Keep visual hierarchy and localization consistent; do not imply live availability.
5. Support long city names, missing images, unknown baggage, incomplete route, responsive widths and keyboard access.
6. Compare desktop/mobile snapshots before/after and ensure no critical warning becomes hidden in inaccessible details.

**Acceptance:** A first-time user can identify key conditions without expanding details; cards remain compact and consistent across all listing surfaces.

**Tests:** complete/partial offer; night arrival; airport swap; long names; high digits/prices; no historical comparison; accessibility; snapshot tests.

## H3-07 — Usable time at destination and relevant sort
**Priority:** P1 | **Complexity:** L | **Depends:** H3-02

**Problem:** Nights and calendar dates do not express how much time a traveler really has for visiting the destination.

**Implementation:**
1. Define `destination_airport_interval = outbound_final_arrival_in_destination -> inbound_first_departure_from_destination` using actual itinerary segments and timezones.
2. Define `usable_city_time` only if valid transfer estimates and clear assumptions exist. Otherwise show the airport interval, labeled accurately, with `city time unknown` rather than pretending it is precise.
3. If applying buffers for airport arrival, luggage or transfers, store assumptions explicitly; do not invent exact timing or give negative durations.
4. Add a compact display and optional sort `Najwięcej czasu na miejscu`. Sorting must be disabled/fallback when reliable dates are missing.
5. Distinguish time in destination from total transit time and "no leave needed".

**Acceptance:** Relevant itinerary outputs are consistent, explainable and not misleading; unknown values never sort as maximal convenient time.

**Tests:** direct versus connections; 20h window; midnight arrival; DST; missing outbound arrival; same-day return; multiday overnight layover; resort airport vs city distance unknown.

## H3-08 — Airport-to-city transfer warnings
**Priority:** P1 | **Complexity:** L | **Depends:** H3-02; coordinate with H3-07

**Problem:** A cheap flight to BVA/BGY/etc. can create additional transfer costs and time; different return airports amplify the problem.

**Implementation:**
1. Audit existing airport metadata. Add a maintainable airport-to-city relationship model only where needed.
2. Represent airport, target city, distance and travel estimate as separately sourced optional fields, with `source`, `last_verified_at`, and limitations. Avoid unapproved expensive geocoding APIs.
3. Add deterministic warning categories: remote airport, different inbound/outbound airports, early/late arrival, transfer estimate unknown.
4. Show warnings in cards and detail views; link to verified transportation information where available.
5. Never invent live transport fare or schedule; optionally provide a link to official transport website, if verified.
6. Keep static airport metadata cached, with update and error handling.

**Acceptance:** Material airport switches are visible; transfer estimates appear only when based on valid data; metadata absence is handled gracefully.

**Tests:** BGY↔MXP, Paris BVA, city-center airport, multiple airports in same metro region, unknown IATA, stale metadata, localization.

## H3-09 — Dynamic visual trip collections
**Priority:** P1 | **Complexity:** M | **Depends:** H3-04, H3-06

**Problem:** Homepage is useful for people who know where to go, but insufficiently inspiring to undecided users.

**Implementation:**
1. Audit existing curated homepage destinations and image assets/licensing.
2. Add 3–5 collection types drawn from real eligible offers, e.g. Weekend trips, Sea & sun, Under 300 PLN, Direct flights, Upcoming dates.
3. Use existing search/filter engine rather than maintaining a second source of travel availability.
4. Provide card cover photo only when licensed/verified, with fallback, alt text, responsive image sizes and lazy loading.
5. Ensure collections respect selected origin airport and locale. Use truthful empty state or hide a collection without offers.
6. Each collection links into prefiltered search with URL state, including clear budget units and date constraints.

**Acceptance:** Users can explore useful real offers directly from the homepage; no static imagery is misrepresented as current availability; images do not dominate LCP.

**Tests:** no offers; one offer; airport switch; locale; under-budget filter; CTA destination; missing image; image loading; indexable links.

## H3-10 — Destinations directory and navigation
**Priority:** P1 | **Complexity:** M | **Depends:** existing SEO audit; coordinate with 09/15

**Problem:** Very long alphabetical destination lists on homepage are hard to scan, especially on mobile.

**Implementation:**
1. Audit `/destinations` or equivalent, current city/country pages, links, canonical tags, and sitemap coverage.
2. Group destinations in a usable directory (search, alphabetical, countries and/or themes); maintain actual crawlable links.
3. Keep homepage focused on popular/thematic destinations and a visible route to the full directory.
4. Do not orphan or redirect indexed URL paths without a plan, correct 301 mapping and SEO verification.
5. Handle locale-specific slugs, accents, and destination aliases consistently.

**Acceptance:** All existing destination pages remain reachable; mobile navigation is clear; bots/users can access directory links without requiring opaque JS interactions.

**Tests:** link crawl, 404s, canonical/hreflang, keyboard search, empty query, locale switching, browser back.

## H3-11 — Budget calculator: guided presets and honest estimates
**Priority:** P1 | **Complexity:** L | **Depends:** existing calculator inventory

**Problem:** Many empty cost inputs require users to guess lodging, food, and transport without context. A flight-only total can be mistaken for full trip cost.

**Implementation:**
1. Preserve current detailed calculator and reuse known flight cost, traveler count and stay dates.
2. Offer optional editable presets: `Oszczędnie`, `Standardowo`, `Komfortowo` with transparent assumptions and ranges. Define the source of any default city/category estimates; do not hardcode unjustified pseudo-real prices.
3. Separate **known quote**, **user-entered estimate**, **modeled assumption**, **unknown** cost types in state and display.
4. Never treat unknown as zero in a stated *full-trip* estimate; distinguish known subtotal and projected range.
5. Support group vs per-person totals, currency, rounding, overnight dates, optional children where existing model supports them.
6. Enable quick editing and reset of preset to user's own input. Avoid overriding already entered numbers without consent.
7. Persist the budget with trip state under H3-12, preserving old saves where possible.

**Acceptance:** Quick estimate requires few actions, all assumptions are inspectable/editable, no misleading precise total, no double counting of flights.

**Tests:** only flight price; partial costs; multiple travelers; accommodation per night vs total; different currencies; date changes; zero as intentional input; unknown vs zero; save/restore.

## H3-12 — Save/edit/copy lifecycle for trips
**Priority:** P1 | **Complexity:** L | **Depends:** existing saved-trip storage audit; coordinate with 11

**Problem:** Multiple drafts, snapshots and share copies are confusing. Users expect to save, edit and return to the same plan.

**Implementation:**
1. Document current storage format, URL share payload, draft and snapshot behavior, compatibility and privacy implications.
2. Define one clear saved trip identity and actions: Save, Update, Duplicate, Delete, Share. Auto-save changes only if it will not surprise users, and show saving state.
3. Preserve local-only behavior without mandatory registration; explain storage/device limitation in concise language.
4. Handle stale/expired offer or changed source price on reopening: retain user's plan while clearly marking obsolete flight data.
5. Include migration strategy for existing browser saves; never silently delete or corrupt them.
6. Audit shareable URL exposure (query parameters, server logs, third parties). Prefer a privacy-preserving format when feasible, with backwards-compatible shared links.

**Acceptance:** Save → edit budget → return → plan persists. Duplicate creates a separate plan. Existing saved plans can still be opened or explicitly migrated.

**Tests:** save/update/duplicate/delete, reload, offline/local storage limitations, malformed shared link, old save migration, expired flight, multiple tabs conflict, no consent to cloud storage.

## H3-13 — Event fit with actual itinerary
**Priority:** P1 | **Complexity:** M | **Depends:** H3-02, H3-07, existing event integration

**Problem:** An event may fall on one of the advertised trip dates yet be impossible to attend because of flight departure, transport or overnight time offsets.

**Implementation:**
1. Review event provider, event timezone, start/end information and source freshness.
2. Compute actual time window in destination using arrival and return-departure timestamps. If event start/end is known, classify `fits`, `conflicts`, `uncertain`.
3. If travel buffers/venue travel are not verified, label `may fit` rather than guaranteed attendance. Never silently hide all uncertain events.
4. Display an appropriate warning, e.g. `Wydarzenie rozpoczyna się po planowanym wylocie`, and filter options (`Available during trip`, `All events`).
5. Preserve provider attribution, user consent and links; do not imply ticket availability unless sourced.

**Acceptance:** Obviously impossible event times are flagged; date-only matches are not treated as proof of feasibility; unknowns remain clearly marked.

**Tests:** event after return flight; event prior to arrival; timezone mismatch; DST; missing event end; sold-out info; multi-day event; late-night concert.

## H3-14 — Enable verified email/Telegram alert lifecycle
**Priority:** P1 | **Complexity:** L | **Depends:** privacy/security review, data freshness, monitoring

**Problem:** Alert section may be visible while registration is unavailable. This is a retention opportunity but also a consent/deliverability risk.

**Implementation:**
1. Confirm current status of email alerts and Telegram bot. Do not build a second notification pipeline if one exists.
2. Choose an incremental rollout: one channel stable first, other channel behind a feature flag.
3. Validate subscription form, consent, email double opt-in if applicable, token safety, preference editing, frequency cap, deduplication, unsubscribe, bounce/error handling and data retention.
4. Filters must match flight search semantics (origin, dates, destination, maximum PLN amount, constraints). Avoid notifications for expired or critically incomplete offers.
5. Build reliable retry/idempotency for background jobs and audit logs without exposing personal identifiers/tokens.
6. Test with controlled developer accounts and staging provider configuration. **Do not send production bulk notifications or turn on signup without explicit authorization.**
7. If not production-ready, label the page honestly and remove dead-end promotion from high-intent paths.

**Acceptance:** Subscriptions are end-to-end verified, respectful of consent, editable/cancellable, and deduplicated, or remain safely disabled with an explicit blocker.

**Tests:** create/confirm, unsubscribe, duplicate trigger, retry, expiration, unknown flight dates, rate limits, invalid email, Telegram start/chat ownership, privacy-consent cases.

## H3-15 — Useful destination pages with zero offers
**Priority:** P1 | **Complexity:** M | **Depends:** existing SEO/analytics access; coordinate with 10

**Problem:** Some destination pages may contain only generic copy and "no flights", creating poor UX and weak unique value.

**Implementation:**
1. Inventory pages by impressions/clicks/content and current flight-offer coverage; if Search Console unavailable, explicitly state so.
2. Design meaningful empty state: date flexibility, nearby origin airports, relevant similar destinations, useful airport/season guides, opt-in alert when active.
3. Show alternatives only when backed by actual available offers; no fabricated routes or event data.
4. Evaluate indexability of low-value pages individually against actual rendered content and evidence. Do **not** mass-apply `noindex` based only on no current flight price.
5. Preserve structured data accuracy, locale, crawlable links, canonical/hreflang and sitemap policies.

**Acceptance:** A visitor with no offers still has a useful next action; no duplicate filler pages created; SEO changes are justified and reversible.

**Tests:** page with 0/1/many offers; related destinations; index/noindex flags; locale, metadata, SSR HTML, sitemap crawl.

## H3-16 — Remove repeated technical explanations without hiding essential facts
**Priority:** P1 | **Complexity:** M | **Depends:** H3-06

**Problem:** Repeated definitions of median, timestamps, provider caveats and calculation methodology can overwhelm listings and bloat markup; however HTML text extraction does not prove it is all visible.

**Implementation:**
1. Validate what users actually see/click in rendered desktop/mobile pages before classifying anything as visual clutter.
2. Move reusable explanations into one consistent tooltip/help popover or `Jak porównujemy ceny` page while retaining concise per-offer data.
3. Keep material warnings (different airports, stale/estimated schedules, external price verification, price inclusion) directly visible when relevant.
4. Avoid inaccessible hover-only explanations; ensure keyboard/touch accessible disclosures and semantic markup.
5. Preserve meaningful SEO/SSR content; don't remove unique information needed for search crawlability or legal disclosures.

**Acceptance:** Cards become easier to scan; details remain accessible; no information required for informed selection disappears.

**Tests:** visual before/after, keyboard/screen reader, one vs many offers, disclosure open/close, locale text overflow, SEO rendered snapshots.

## H3-17 — Browser/mobile/accessibility/performance quality gate
**Priority:** P1 (baseline subset before UX changes) | **Complexity:** L | **Depends:** current test infrastructure

**Problem:** A public-text audit cannot validate click behavior, mobile touch, keyboard access, speed or runtime defects.

**Implementation:**
1. Establish test harness (reuse existing Playwright/Cypress or comparable). Do not add competing frameworks without reason.
2. Measure baseline and after on routes: home, deals, weekend, city break, destination with/without offers, flight detail, saved, budget, alerts, all locales.
3. Check widths 320, 375, 390, 768, 1440; tap targets, select inputs, mobile keyboard, dialogs, horizontal overflow, filter controls, back navigation, CLS.
4. Run axe/accessibility checks plus keyboard/focus/manual screen-reader checks for critical flows.
5. Measure Lighthouse lab data and, where access exists, real-user Core Web Vitals: LCP target ≤2.5s, INP ≤200ms, CLS ≤0.1 (75th percentile, sufficient sample).
6. Check image responsive sizes/lazy loading, bundle size, network waterfalls, API errors, cache/SSR hydration and production version consistency.
7. Fix high-severity defects in small targeted sub-PRs, measuring before/after. Distinguish baseline problems from regressions.

**Acceptance:** Test report with actual commands, screenshots/metrics and pass/fail; no claimed browser check without execution; critical flows pass on target widths.

**Tests:** all E2E scenarios in section 5 and visual regression. Track untested cases explicitly.

## H3-18 — Analytics funnel and evidence-driven optimization
**Priority:** P1 (baseline subset early) | **Complexity:** M/L | **Depends:** existing analytics + consent architecture

**Problem:** Without reliable data, UI changes and monetization decisions are guesses.

**Implementation:**
1. Audit existing analytics tooling and current consent before instrumenting anything. Reuse the connected provider where suitable.
2. Define a versioned event taxonomy: `search_submitted`, `results_viewed`, `filter_applied`, `offer_viewed`, `offer_details_opened`, `affiliate_clicked`, `budget_started`, `budget_calculated`, `trip_saved`, `trip_updated`, `event_clicked`, `alert_opt_in`.
3. Specify deduplication, anonymous identifiers, event properties with no unnecessary PII, meaningful timestamps, attribution, session semantics, cross-page consistency and opt-out effects.
4. Build basic funnels: visitors→search→results→details→affiliate; save/revisit; budget engagement; events; alert opt-in; split mobile/desktop, locale and origin airport where privacy-safe.
5. Capture baseline before/after comparable periods with seasonality and traffic-source caveats. Do not claim uplift from a one-day spike or low-sample A/B result.
6. Define success measures for H3-01, 06, 07, 09, 11, 12, 14: search success, eligible-weekend offer CTR, offer details conversion, time-to-decision, save and return, opt-in rate.
7. Add dashboards or documented queries using existing analytics resources, avoiding unnecessary third-party SaaS.

**Acceptance:** Events fire once in correct consent conditions; dashboards compute reproducible metrics; no fictitious KPIs; analytics disablement respected.

**Tests:** consent denied/accepted/revoked; dedup navigation; search without results; saved local plan; affiliate redirect; locale changes; client error and ad blocker handling where appropriate.

---

# 5. Cross-cutting E2E and regression matrix

At minimum, create/extend deterministic tests for these cases. Use mocked/synthetic third-party provider responses in CI; do not depend on real-time ticket inventory.

| Case | Expected result | Related tasks |
|---|---|---|
| Friday evening outbound + Sunday evening airport arrival | Eligible under configured no-leave window if assumptions support it | 01,02 |
| Sunday return departure + Monday arrival | Actual return clearly Monday; excluded from strict no-leave | 01,02 |
| Missing final return arrival timestamp | Unknown displayed; no false no-leave certification | 01,02 |
| Multi-leg overnight return BCN→BGY→POZ | Correct final arrival local date and `+1 dzień` | 02,07 |
| DST boundary in Europe/Warsaw | Correct instants and local dates | 01,02,07 |
| Missing sample median | Neutral comparison and deterministic fallback sorting | 04,06 |
| Equal scores, different IDs | Stable ordering and pagination | 04 |
| Origin BGY, return MXP | Visible airport-switch warning | 06,08 |
| Airport far from city center | Warning only with sourced mapping | 08 |
| Trip with 3 nights | `Nocleg osobno`, not `Bez noclegu` | 03 |
| No valid offers in a collection | Honest empty state; no invented deal | 09,15 |
| Empty destination page | Useful next-step alternatives and consistent SEO | 10,15 |
| Budget with only known flight | Partial subtotal clearly distinct from full estimate | 11 |
| User changes preset after manual edits | Explicit override/preservation | 11 |
| Save → edit → reload → reopen | Changes retained and source age indicated | 12 |
| Old local saved plan | Backwards-compatible read/migrate | 12 |
| Event starts after return departure | Flag impossible / not fitting | 13 |
| Event with unknown timezone | Uncertain, not confirmed feasible | 13 |
| Price alert receives duplicate trigger | One notification per rules | 14 |
| Consent denied | No nonessential analytics/notification side effects | 14,18 |
| Affiliate link with late return | Correct supported dates; clear redirect | 05 |
| 320px mobile search and filter | No hidden CTA, overflow or trapped focus | 06,17 |
| Multi-locale routes and copy | PL/EN/RU/UK complete, no broken SEO locale paths | All |

**Additional QA:** missing airport/time; stale offer; concurrent save in two tabs; invalid share URL; keyboard-only filters; slow API; no event image; missing accommodation quote; partner rejected deep link; cache of previous release HTML; locale-specific date formatting; currency format for PLN/EUR; content rendering with JS disabled where SEO relies on SSR.

---

# 6. UX/content acceptance rules

- **Price label:** State whether price refers to flight only, whether round-trip and per-person, and that final partner price may change.
- **Nights:** Nights in destination must not be confused with duration of return travel or accommodation inclusion.
- **Actual arrival:** Display airport arrival time/date based on the final itinerary segment, not return flight departure date.
- **Price comparison:** Always state it is vs comparable historical observations, not guaranteed discount vs market.
- **Unknowns:** Explicitly distinguish unavailable data from false/zero.
- **Confidence:** No unverified "no leave required", "event fits", "best price", "hotel price", or transfer-cost claim.
- **Language:** Polish-first, all four translations, no jargon (`Wynik pomocniczy`) as a main consumer-facing label.
- **Accessibility:** Important information accessible without hover, color alone or mouse.
- **Mobile:** One obvious primary CTA, predictable filter behavior, no layout shift on loading.

---

# 7. Release and measurement gates

For each task/release:

1. **Scope:** Code review, API/DB changes and backward compatibility documented.
2. **Tests:** Lint, typecheck, unit, integration, E2E, build, and manual browser where supported, with real command outputs.
3. **Data integrity:** Check known itinerary, price-history and DST fixture set.
4. **Privacy/security:** No new tracker or notification permission behavior without review.
5. **SEO:** Existing deep links and canonical/hreflang preserved; verify indexable pages after routing changes.
6. **Performance:** Record major before/after on representative pages.
7. **Deployment:** Feature flags and rollback where behavior is risky; controlled release, no automatic production deployment.
8. **Monitoring:** Errors, invalid itinerary counts, stale offer counts, outbound link failures, alert duplicates, and important user funnel events when available.

If a release fails these gates, mark related task `BLOCKED` or `IN_PROGRESS`, not `DONE`.

---

# 8. Scope exclusions

Do **not** use this plan as permission to add: mandatory accounts, direct ticket payments, new microservices, expensive travel APIs, wholesale frontend rewrite, fake urgency messages, mass AI-generated destination pages, speculative recommendation AI, bulk notifications, or unsolicited conversion-tracking tools.

Avoid changing the marketing/legal structure of the product without checking Poland/EU obligations and current affiliate-provider agreements. Flag issues for review; coding alone does not establish legal compliance.

---

# 9. Required end-of-task report (in Russian)

For each task return:

1. **ID and status** — what was done / why not.
2. **Existing behavior confirmed** — actual location and implementation before change.
3. **Changes** — business behavior and UI details.
4. **Files and API/schema changes** — precise list.
5. **Validation** — test commands, pass/fail, screenshots or measurement evidence if available.
6. **Compatibility / migration / rollback** — if applicable.
7. **Risks and open questions** — including unavailable checks.
8. **Progress update** — tracker status and next eligible task.

Do not automatically begin the next task.

---

# 10. Immediate next action

**FIRST RUN: READ-ONLY AUDIT ONLY.**

Inspect the real repo and previous HOPTRIP_MASTER_PLAN implementation, reconcile H3-01 through H3-18 with current behavior, establish a baseline and create the tracker. Especially verify:

- whether actual Monday return arrival is already clearly displayed;
- whether `Bez noclegu` still exists and in what exact context;
- whether `Wynik pomocniczy` is default sort and what score really means;
- whether provider data supports true arrival times;
- whether existing alerts actually work;
- whether mobile browser tests and analytics are already available.

Return the findings in Russian, then **STOP**. Subsequent runs implement one verified task at a time.
