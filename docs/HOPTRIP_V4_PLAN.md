# HopTrip.pl — V4 Product Improvement Plan

You are a senior full-stack engineer, UX/UI designer, QA engineer, and product architect working on the existing HopTrip.pl application.

## Goal

Improve HopTrip from a cheap-flight search platform into a service that helps users discover **affordable, convenient, and realistic short trips**.

Prioritize trip quality, clarity, user experience, conversion, and reliability over adding unnecessary features.

## 1. Required improvements

### P0 — Core functionality and reliability

**V4-01. Improve weekend trip recommendations**
- Evaluate actual arrival and return times, not just departure dates.
- Detect inconvenient overnight arrivals, early returns, and insufficient time at the destination.
- Distinguish genuine weekend trips from trips requiring additional vacation days.
- Exclude unsuitable offers from recommended collections, but preserve them in general search.
- Make minimum usable-trip-duration thresholds configurable.

**V4-02. Detect problematic connections**
- Calculate connection durations using correct timezones.
- Highlight long layovers (configurable threshold, initially 6 hours).
- Detect overnight connections, different airports, and potentially risky transfers.
- Show prominent warnings on flight cards.
- Never assume a self-transfer or protected connection unless confirmed by the provider.

**V4-03. Introduce trip quality ranking**
- Keep historical price attractiveness separate from trip convenience.
- Introduce a configurable `trip_quality_score` based on data completeness, travel time, usable destination time, connections, airport changes, and vacation requirements.
- Handle missing data conservatively.
- Add a user-friendly `Recommended` sorting option.
- Preserve `Lowest price`, `Nearest departure`, and other existing sorting options.
- Document scoring rules and add unit tests.

**V4-04. Validate affiliate booking flows**
- Audit Aviasales, Stay22, Tiqets, and other existing integrations.
- Validate origin, destination, travel dates, passenger parameters, and redirect URLs.
- Test different airports and complex return routes.
- Preserve tracking parameters and affiliate disclosures.
- Handle unavailable offers and invalid redirects.
- Do not claim final booking availability without provider confirmation.

### P1 — UX/UI improvements

**V4-05. Fix destination images**
- Audit missing and broken images.
- Implement a centralized image mapping and graceful fallback.
- Use properly licensed images, responsive sizes, and lazy loading.
- Prevent broken images or technical placeholders from degrading layouts.

**V4-06. Simplify flight cards**
- Prioritize destination, dates, price, duration, route convenience, and important warnings.
- Move detailed technical explanations into expandable sections.
- Clearly distinguish observed flight prices from confirmed prices.
- Make cards consistent across desktop and mobile.

**V4-07. Simplify trip detail pages**
- Reorganize information into four sections:
  1. Flight and booking
  2. Accommodation and activities
  3. Total trip budget
  4. Save and share
- Reduce repeated instructions and unnecessary text.
- Maintain all existing functionality and clearly visible critical warnings.

**V4-08. Improve budget calculator**
- Create a simple initial calculation based on travelers, accommodation, food, and transfers.
- Keep the existing detailed calculator available.
- Improve existing economy, standard, and comfort profiles.
- Use editable estimates or ranges only when supported by reliable data.
- Clearly distinguish known costs, estimates, and missing expenses.
- Never present flight-only cost as total trip cost.

**V4-09. Fix localization**
- Audit Polish, English, Russian, and Ukrainian translations.
- Localize country names, dates, currencies, buttons, warnings, and navigation consistently.
- Eliminate untranslated or mixed-language UI elements.
- Preserve existing localized routes and SEO metadata.

**V4-10. Improve destination pages and SEO**
- Identify thin, generic, or empty destination pages.
- Add genuinely useful destination information and available flight alternatives.
- Avoid generating low-value duplicate content.
- Audit canonical, hreflang, sitemap, robots, metadata, and internal linking.
- Preserve existing indexed URLs.
- Make indexation decisions based on content quality and Search Console evidence when available.

### P1 — Growth, monitoring, and testing

**V4-11. Complete price alerts**
- Audit existing email and Telegram subscription implementations.
- Enable subscriptions only after validating confirmation, delivery, filtering, deduplication, and unsubscribe flows.
- Respect user consent and privacy requirements.
- Do not send real notifications during testing.

**V4-12. Improve product analytics**
- Track search, filter usage, offer views, affiliate clicks, saved trips, budget calculations, and subscriptions.
- Create or improve a conversion funnel dashboard.
- Respect analytics consent.
- Prevent duplicate tracking and unnecessary collection of personal information.

**V4-13. Complete mobile and accessibility testing**
- Run responsive tests at 320, 375, 390, 768, and 1440px.
- Check forms, filters, navigation, dialogs, cards, and trip planning.
- Run Lighthouse, Core Web Vitals checks, and accessibility tests.
- Fix verified issues without unnecessary redesign.
- Record before/after measurements.

### P2 — User validation

**V4-14. Validate usability**
- Prepare realistic user scenarios for finding, comparing, planning, and saving trips.
- Identify unnecessary steps and confusing interactions.
- Use real user testing when participants are available.
- Implement measurable improvements based on observed evidence, not assumptions.

---

## 2. Mandatory implementation rules

1. **Inspect the existing repository before writing code.** Identify already implemented functionality and avoid duplicating it.
2. Preserve existing APIs, database models, SEO routes, integrations, and localization unless changes are necessary and justified.
3. Implement changes incrementally in dependency order, **one task at a time**.
4. Write or update unit, integration, and E2E tests for affected functionality.
5. Handle missing flight information, timezones, DST, overnight flights, and airport differences correctly.
6. Never fabricate prices, schedules, availability, events, or other real-world data.
7. Avoid unnecessary dependencies, major rewrites, and unrelated refactoring.
8. Do not modify production databases, deploy automatically, activate notifications, or change paid integrations without explicit approval.
9. Keep the application performant, responsive, accessible, and visually consistent.
10. Report progress in Russian.

## 3. Progress tracking

Create or update:

`docs/HOPTRIP_V4_PROGRESS.md`

For each task, track:

- ID and priority
- Current implementation status
- Problems found
- Files changed
- Tests performed
- Dependencies and blockers
- Completion status

Use statuses: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `NOT_APPLICABLE`.

Mark a task `DONE` only when its implementation and applicable tests are verified.

## 4. Execution workflow

For every execution:

1. Read this V4 plan and the progress file.
2. Identify the next eligible incomplete task.
3. Inspect relevant existing code.
4. Implement only that task.
5. Run applicable tests, lint, type checks, and build.
6. Review the changes for regressions.
7. Update the progress file.
8. Report in Russian what changed, what was tested, and what remains.
9. **Stop. Do not automatically start the next task.**

If implementation requires a database migration, external service activation, or potentially destructive operation, document the approach and wait for explicit authorization.

## 5. Definition of Done

The V4 implementation should result in:

- More convenient and realistic trip recommendations.
- Clear warnings about long or risky connections.
- Separate price and trip-quality assessments.
- Accurate affiliate links.
- Cleaner and more attractive UI.
- More useful destination pages.
- Simpler trip planning and budgeting.
- Reliable notifications when enabled.
- Consistent localization.
- Measurable conversion and performance.
- Passing regression tests.

## First action

Start with a **read-only audit** of V4-01 through V4-14 against the current repository.

Create the progress tracker, identify already implemented functionality, confirm dependencies, and recommend the implementation order.

**Do not modify application code during the initial audit. Report findings in Russian and stop.**