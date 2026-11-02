# HopTrip.pl — Master Product, UX/UI, Technical and Growth Implementation Plan

**Project:** HopTrip.pl  
**Website:** https://hoptrip.pl/  
**Document:** `docs/HOPTRIP_MASTER_PLAN.md`  
**Purpose:** Long-term implementation roadmap for Codex  
**Status:** Planning / awaiting repository audit  
**Execution mode:** Incremental, one task at a time

---

# 1. Project Vision

HopTrip is a travel discovery and planning platform focused primarily on affordable flights and short trips from Poland to European destinations.

The product should help users:

1. Discover affordable flights.
2. Find suitable weekend and short-trip opportunities.
3. Understand whether a flight price is attractive compared with available historical observations.
4. Evaluate practical flight details and restrictions.
5. Find relevant accommodation.
6. Discover concerts, sporting events, attractions, and other activities during their trip.
7. Estimate the total trip budget.
8. Save, share, and revisit travel plans.
9. Eventually subscribe to personalized price alerts.

## 1.1 Product positioning

**HopTrip should evolve from a flight-deals listing into an easy-to-use short-trip discovery and planning platform.**

The primary user journey should be:

Discover destination → Compare flight offers → Select trip → Check accommodation and events → Estimate total cost → Save or proceed to booking.

The product must feel simple to casual travelers, even though its internal data processing, price analysis, and travel planning logic may be complex.

## 1.2 Target users

Primary:

- People living in Poland who want inexpensive short trips around Europe.
- Travelers with flexible destinations and dates.
- People interested in weekend or 2–3-night city breaks.
- Budget-conscious travelers looking for flights, accommodation, and activities.

Secondary:

- Travelers searching for flights from a specific Polish airport.
- Users comparing travel opportunities before selecting a destination.
- Users looking for events or experiences at a destination.

## 1.3 Design philosophy

Follow these principles throughout implementation:

1. Simplicity before complexity.
2. The most important information must be visible immediately.
3. Advanced details should be available through progressive disclosure.
4. Never sacrifice factual accuracy for visual attractiveness.
5. Minimize unnecessary clicks and repeated data entry.
6. Prefer understandable language over technical terminology.
7. Ensure consistency across pages and languages.
8. Mobile usability is a first-class requirement.
9. Preserve user trust through transparent pricing and restrictions.
10. Make it easy for users to return to previously explored trips.

---

# 2. Mandatory Codex Working Rules

These instructions apply to every task in this roadmap.

## 2.1 Inspect before implementation

Before modifying anything:

- Read the repository structure.
- Identify the technology stack.
- Inspect existing components and services.
- Understand how the relevant feature currently works.
- Identify reusable components.
- Check existing tests.
- Review related configuration and API contracts.
- Read the latest roadmap progress.

Do not assume the application architecture.

Do not assume that a feature is missing solely because this document proposes improving it.

If a feature is already implemented, inspect its quality and improve it only if necessary.

## 2.2 One task at a time

Never implement the entire roadmap in one execution.

Default behavior:

1. Read the roadmap.
2. Read the progress tracker.
3. Select the next eligible task.
4. Analyze dependencies.
5. Implement that task only.
6. Run applicable tests.
7. Review the diff.
8. Update progress.
9. Summarize the work.
10. Stop.

A task may be split into smaller subtasks if necessary.

Do not automatically continue to the next task.

An explicit user instruction may select a specific task instead of the next one.

If the selected task requires prerequisites, identify them before implementation.

## 2.3 Preserve existing functionality

Do not break:

- Existing flight search.
- Current flight filtering.
- Price history and score calculations.
- Saved flights and trips.
- Accommodation search.
- Budget calculator.
- Existing event integrations.
- Existing alerts implementation, if any.
- Affiliate links.
- Localization.
- Existing indexed SEO URLs.
- Existing analytics and privacy controls.

Changes to behavior must be deliberate, documented, and tested.

## 2.4 Never invent data

Never generate fake real-world flight prices, availability, schedules, destinations, hotel prices, events, discounts, or reviews.

For live product data:

- Use the existing validated data sources.
- Respect data freshness.
- Handle missing values honestly.
- Preserve source provenance.
- Do not label historical observations as confirmed real-time prices.

Synthetic fixtures are permitted in automated tests, clearly marked examples, and isolated development environments.

## 2.5 Production safety

Do not:

- Modify production databases directly.
- Delete production data.
- Run destructive migrations.
- Change production infrastructure without explicit authorization.
- Expose secrets.
- Modify authentication credentials.
- Activate real email or Telegram campaigns during development.
- Introduce paid external APIs without approval.
- Change affiliate tracking without validating the impact.

Database migrations must be backward compatible wherever practical.

Document rollback instructions for changes that affect persistence, API contracts, or infrastructure.

## 2.6 Keep changes maintainable

- Follow established project conventions.
- Prefer existing libraries when appropriate.
- Avoid introducing unnecessary dependencies.
- Avoid duplicated components.
- Maintain clear separation of concerns.
- Use shared types and validation where relevant.
- Preserve strict typing if already used.
- Avoid broad unrelated refactoring.
- Do not replace working services unnecessarily.

## 2.7 Localization

Preserve all existing supported locales:

- Polish
- English
- Russian
- Ukrainian

Do not introduce untranslated hardcoded UI strings.

Polish is the primary market language.

Use translation resources according to the project's existing implementation.

## 2.8 Communication

Technical code and identifiers should follow existing repository conventions.

Codex should provide implementation summaries and task progress reports in Russian.

Do not claim that tests were successful unless they actually ran.

Do not claim that a feature was verified in the browser without browser testing.

---

# 3. Roadmap Management

Maintain these files:

- `docs/HOPTRIP_MASTER_PLAN.md` — this specification.
- `docs/HOPTRIP_PROGRESS.md` — execution status.
- `docs/HOPTRIP_AUDIT.md` — verified current-state findings.
- `docs/HOPTRIP_DECISIONS.md` — significant architectural and product decisions.
- `docs/HOPTRIP_TEST_PLAN.md` — regression and acceptance test scenarios.

Create files only when necessary and avoid duplicating existing project documentation.

## 3.1 Task status

Each task must have one status:

- `TODO`
- `IN_PROGRESS`
- `BLOCKED`
- `DONE`
- `NOT_APPLICABLE`

`DONE` requires passing the relevant acceptance criteria and reporting test results.

`NOT_APPLICABLE` requires a documented explanation.

## 3.2 Progress tracker structure

Use the following fields:

| Field | Description |
|---|---|
| Task ID | Unique task identifier |
| Title | Short descriptive name |
| Priority | P0 / P1 / P2 |
| Status | Current status |
| Dependencies | Required prerequisite tasks |
| Files changed | Relevant files |
| Tests | Executed test commands and results |
| Notes | Important decisions or limitations |

## 3.3 Definition of Done

A task is complete only when:

1. The relevant code has been implemented.
2. Existing behavior is preserved unless intentionally changed.
3. Applicable automated tests pass.
4. New tests cover important behavior changes.
5. UI changes are checked at relevant viewport sizes where browser tooling is available.
6. Localization is updated.
7. Accessibility has been considered.
8. There are no unexplained build or lint failures.
9. Documentation and progress are updated.
10. A concise summary is provided.

If validation cannot be performed, report the limitation and do not mark the task fully complete.

---

# 4. PHASE 0 — Repository Audit and Preparation

**Priority:** P0  
**Objective:** Understand the actual implementation before making product changes.

## AUD-01 — Repository Architecture Audit

**Priority:** P0  
**Effort:** M  
**Dependencies:** None

### Objective

Create an accurate technical map of the current application.

### Tasks

1. Inspect the entire repository structure.
2. Identify frontend and backend frameworks.
3. Identify API endpoints and major service boundaries.
4. Identify database access patterns and models.
5. Locate background jobs and scheduled processing.
6. Identify external flight, accommodation, event, and affiliate integrations.
7. Identify environment-specific configuration.
8. Inspect deployment and build processes.
9. Identify existing test frameworks.

### Deliverables

Document:

- Project architecture.
- Main application modules.
- Data flow between components.
- Important external dependencies.
- Existing tests.
- Potential architectural risks.

### Acceptance criteria

- The documented architecture matches the repository.
- Important services and dependencies are identified.
- No production configuration or data is modified.

---

## AUD-02 — Existing Feature Inventory

**Priority:** P0  
**Effort:** M  
**Dependencies:** AUD-01

### Objective

Determine what is already implemented and avoid recreating features.

### Inspect

- Homepage.
- Flight search.
- Airport selection.
- Filters and sorting.
- Flight offer cards.
- Flight detail pages.
- Historical price comparison.
- Weekend deals.
- City break pages.
- Accommodation links.
- Budget calculator.
- Events and attractions.
- Saved trips.
- Sharing.
- Alerts and notifications.
- SEO pages and guides.
- Analytics.
- Consent management.
- Localization.

### Deliverables

For each feature document:

- Implemented behavior.
- Relevant files.
- Data source.
- Known limitations.
- Duplicated implementation.
- Missing tests.
- Recommended action.

### Acceptance criteria

All major features are inventoried and mapped to existing code.

---

## AUD-03 — Current UX and UI Audit

**Priority:** P0  
**Effort:** M  
**Dependencies:** AUD-02

### Objective

Identify verified usability and visual consistency problems.

### Tasks

- Review primary user journeys.
- Identify duplicated controls.
- Identify confusing labels.
- Identify unnecessary explanatory text.
- Review loading and empty states.
- Review card consistency.
- Review mobile layouts.
- Review visual hierarchy.
- Review accessibility issues.
- Review navigation complexity.

### Important

Distinguish:

- Verified problems.
- Potential problems.
- Product hypotheses requiring testing.

Do not describe an issue as confirmed unless it was actually reproduced or verified.

### Deliverables

An evidence-based UX findings report with severity and affected pages.

---

## AUD-04 — Baseline Performance and SEO Audit

**Priority:** P0  
**Effort:** M  
**Dependencies:** AUD-01

### Objective

Create measurable baselines before changes.

### Tasks

Measure, when suitable tools are available:

- Lighthouse performance.
- Accessibility.
- SEO.
- Best practices.
- LCP.
- INP.
- CLS.
- JavaScript bundle size.
- Network requests.
- API latency.
- Image transfer size.

Inspect:

- Robots rules.
- XML sitemap.
- Canonical tags.
- Hreflang.
- Metadata.
- Structured data.
- Indexable routes.
- Client-side rendering behavior.

### Acceptance criteria

Actual measurements are recorded with device, environment, date, and method.

Missing access or unavailable measurements are explicitly reported, not guessed.

---

## AUD-05 — Test Coverage and Regression Baseline

**Priority:** P0  
**Effort:** M  
**Dependencies:** AUD-01, AUD-02

### Objective

Establish minimum regression protection.

### Tasks

- Identify existing unit, integration, and E2E tests.
- Run applicable tests.
- Document failures that existed before changes.
- Identify critical untested user journeys.
- Add focused baseline tests where practical.
- Avoid changing unrelated production logic.

### Acceptance criteria

Important existing behavior has a documented test strategy.

---

# 5. PHASE 1 — Homepage and Navigation Redesign

**Priority:** P0  
**Objective:** Make the homepage simpler, clearer, and more engaging.

## UX-01 — Redesign Homepage Hero

**Priority:** P0  
**Effort:** M  
**Dependencies:** AUD-03

### Problem

The homepage must explain the value of HopTrip immediately and provide one obvious next action.

### Desired behavior

Users should understand within a few seconds that HopTrip helps them find inexpensive trips.

### Requirements

Create a clear hero containing:

- Concise headline.
- Short supporting description.
- Origin airport.
- Destination selection, including an "Anywhere" option.
- Flexible date selection.
- Optional price budget.
- Primary search button.

Example Polish copy:

Headline: `Tanie podróże zaczynają się tutaj.`

Description: `Znajdź tani lot, odkryj ciekawe wydarzenia i zaplanuj wyjazd w jednym miejscu.`

CTA: `Znajdź tani lot`

These texts are suggestions and may be improved while maintaining clarity.

### Acceptance criteria

- One dominant search action.
- User can search without specifying a destination.
- Existing backend search behavior is preserved.
- Search parameters survive navigation.
- Mobile layout is usable.
- All translations exist.
- No duplicated search widgets appear in the hero.

### Tests

- Search with origin only.
- Search with origin and destination.
- Search with optional budget.
- Flexible dates.
- Invalid input handling.
- URL parameter preservation.

---

## UX-02 — Unify Airport Selection

**Priority:** P0  
**Effort:** M  
**Dependencies:** UX-01

### Problem

Multiple airport selectors may create confusing or inconsistent state.

### Requirements

- Inspect existing airport preference persistence.
- Identify all airport selectors.
- Establish one authoritative selected-origin state.
- Synchronize dependent sections.
- Preserve the existing persistence behavior where appropriate.
- Make selected airport visible in relevant sections.

### Acceptance criteria

Changing the origin airport updates relevant search and recommendation components consistently.

No unexpected resets occur.

### Tests

- Airport selection persistence.
- Page navigation.
- Reload behavior.
- Changing preferences.
- Localization.

---

## UX-03 — Reorganize Homepage Content

**Priority:** P0  
**Effort:** M  
**Dependencies:** UX-01

### Objective

Provide a clear visual hierarchy.

### Recommended order

1. Main search.
2. Current attractive flight offers.
3. Weekend and short-trip collections.
4. Popular destinations.
5. Trip planning capabilities.
6. Short explanation of how HopTrip works.
7. Guides and useful travel content.

### Requirements

- Reduce repeated explanatory text.
- Avoid multiple sections presenting nearly identical offers without clear distinctions.
- Reuse shared components.
- Preserve existing useful content.
- Preserve internal SEO links.
- Load lower-page content efficiently.

### Acceptance criteria

Users can distinguish search, recommendations, and educational content immediately.

---

## UX-04 — Simplify Navigation

**Priority:** P0  
**Effort:** M  
**Dependencies:** AUD-03

### Objective

Reduce navigation complexity.

### Suggested primary navigation

- Tanie loty
- Na weekend
- Kierunki
- Zapisane
- Planer podróży

Actual labels and grouping must be validated against existing routes.

### Requirements

- Keep existing indexed routes working.
- Separate primary navigation from secondary information.
- Keep legal pages accessible.
- Support desktop and mobile navigation.
- Maintain active-state indicators.
- Avoid unnecessary nested menus.

### Acceptance criteria

Major destinations are accessible through intuitive navigation.

No existing public route is silently removed.

---

# 6. PHASE 2 — Flight Offers and Search Experience

**Priority:** P0  
**Objective:** Make flight discovery fast, accurate, and easy to understand.

## DEAL-01 — Unified Flight Offer Card

**Priority:** P0  
**Effort:** L  
**Dependencies:** AUD-02, UX-03

### Problem

Flight cards contain substantial technical information and repeated explanations.

### Requirements

Create or improve a reusable flight card component.

The default card must prioritize:

- Destination.
- Origin airport.
- Departure and return dates.
- Trip duration.
- Price.
- Currency.
- Clear indication of price basis, such as per person and round trip.
- Direct flight or connection information when known.
- Meaningful historical price comparison.
- Important route warnings.
- Data freshness.
- Primary CTA.

Move less essential technical information into expandable details or dedicated methodology content.

### Important warnings

Keep visibly accessible:

- Different departure/arrival airports.
- Unknown or estimated flight times.
- Unconfirmed live prices.
- Incomplete itineraries.
- Other material restrictions.

### Acceptance criteria

- One shared card design.
- Compact and readable.
- Full and partial data states supported.
- No fabricated missing information.
- Mobile responsive.
- Accessible actions.
- Existing detail links continue working.

### Tests

- Complete flight data.
- Missing optional data.
- Missing critical data.
- Different airports.
- Long destination names.
- Multiple currencies if supported.
- Expired offers.
- Missing historical comparison.

---

## DEAL-02 — Simplify Flight Filters

**Priority:** P0  
**Effort:** L  
**Dependencies:** UX-02, DEAL-01

### Problem

Filter controls and interactions may be difficult for casual users to understand.

### Requirements

Primary filters:

- Origin.
- Destination.
- Dates.
- Budget.
- Trip duration.
- Sorting.

Advanced filters, when supported:

- Direct flights.
- Maximum connections.
- Departure and arrival times.
- Maximum travel duration.
- Airport constraints.

Retain or improve quick presets:

- Weekend.
- 2–3 nights.
- Under 300 PLN.
- Direct flights.

### Functional rules

- Display active filters clearly.
- Provide individual filter removal.
- Provide Reset All.
- Preserve intended manual selections.
- Make preset replacement behavior explicit.
- Synchronize URL state.
- Handle invalid combinations.
- Avoid unexpected filter resets.

### Acceptance criteria

The selected filter state is always visible and predictable.

### Tests

- Single and combined filters.
- Preset activation and deactivation.
- Manual override behavior.
- URL reload.
- Browser back/forward navigation.
- Reset.
- Empty results.

---

## DEAL-03 — Improve Sorting

**Priority:** P1  
**Effort:** M  
**Dependencies:** DEAL-01, DATA-01

### Requirements

Inspect existing sorting before adding options.

Suggested options:

- Lowest price.
- Nearest departure.
- Best historical price comparison.
- Shortest journey.
- Most usable time at destination.

### Rules

- Never treat missing duration as zero.
- Never favor unknown flight details.
- Sorting must be stable.
- Any composite ranking must be documented.

### Acceptance criteria

Sorting matches the displayed criteria and handles incomplete values correctly.

---

## DEAL-04 — Flight Data Quality Classification

**Priority:** P0  
**Effort:** L  
**Dependencies:** AUD-02

### Objective

Prevent incomplete or misleading flight offers from being presented as fully reliable.

### Requirements

Inspect existing flight data models and validation logic.

Introduce a centralized quality classification if one does not already exist.

Suggested categories:

**COMPLETE**

Required routing and timing details are available and internally consistent.

**PARTIAL**

The offer is usable but some noncritical information is missing.

**CRITICAL_INCOMPLETE**

Important itinerary information is missing, contradictory, or cannot be trusted.

### Behavior

- Complete offers: normal presentation.
- Partial offers: visible warning.
- Critical incomplete offers: exclude from high-confidence recommendations and optionally from standard listings according to documented policy.

### Important

Do not automatically delete incomplete records.

Do not silently mutate source data.

Separate source-data completeness from booking availability.

### Tests

- Missing origin.
- Missing destination.
- Missing return airport.
- Estimated times.
- Invalid dates.
- Airport mismatch.
- Unreasonable duration.
- Expired data.
- Conflicting provider metadata.

---

## DEAL-05 — Improve Search States

**Priority:** P0  
**Effort:** M  
**Dependencies:** DEAL-02

### Requirements

Provide consistent states for:

- Initial page load.
- Loading results.
- Updating filters.
- No results.
- API error.
- Expired offer.
- Temporary upstream unavailability.

### UX rules

For empty results, suggest realistic recovery actions:

- Clear restrictive filters.
- Extend date range.
- Raise budget.
- Explore other destinations.

Do not invent matching offers.

### Acceptance criteria

Every major state gives the user a clear next action.

---

## DEAL-06 — Simplify Price Score Presentation

**Priority:** P0  
**Effort:** M  
**Dependencies:** AUD-02, DATA-02

### Problem

A numerical score may be mistaken for an overall trip quality rating.

### Requirements

Preserve the existing scoring logic unless the audit identifies a verified defect.

Evaluate replacing prominent numeric score displays with understandable labels:

- Significantly below the sample median.
- Below the sample median.
- Near the sample median.
- Above the sample median.
- Insufficient comparison data.

### Rules

- Define thresholds from actual data distributions.
- Distinguish sample statistics from market-wide claims.
- Consider sample size.
- Preserve detailed methodology.
- Avoid unsupported discount claims.

### Acceptance criteria

Users understand what the comparison means and its limitations.

---

# 7. PHASE 3 — Trip Details and Planning

**Priority:** P0 / P1  
**Objective:** Turn a selected flight into a practical trip plan.

## TRIP-01 — Reorganize Flight Detail Page

**Priority:** P0  
**Effort:** L  
**Dependencies:** DEAL-01

### Objective

Make the selected flight immediately understandable.

### Proposed information hierarchy

1. Destination, dates, and price.
2. Flight details.
3. Important warnings.
4. Booking partner CTA.
5. Accommodation.
6. Events and attractions.
7. Budget.
8. Save and share.
9. Detailed price methodology.

### Requirements

- Reduce visual and textual overload.
- Use section headings and concise summaries.
- Keep important warnings prominent.
- Avoid repeating the same disclaimer unnecessarily.
- Preserve all existing functionality.
- Provide clear navigation between sections.

### Acceptance criteria

The user can understand the flight and proceed to the booking partner without reading the full page.

---

## TRIP-02 — Improve Accommodation Integration

**Priority:** P1  
**Effort:** M  
**Dependencies:** TRIP-01

### Requirements

Inspect existing accommodation integration.

Preserve:

- Destination.
- Check-in date.
- Check-out date.
- Adult/guest count where supported.

Improvements:

- Show the selected date range clearly.
- Avoid unnecessary repeated input.
- Make the accommodation CTA understandable.
- Handle timezone and overnight-flight cases.
- Clearly distinguish actual quoted accommodation prices from estimates.

### Acceptance criteria

Accommodation search uses the correct travel context.

---

## TRIP-03 — Simplify Budget Calculator

**Priority:** P1  
**Effort:** L  
**Dependencies:** TRIP-01

### Objective

Improve the existing calculator rather than rebuilding it.

### Requirements

Introduce two presentation modes if compatible with existing functionality.

**Quick Budget**

- Flight.
- Accommodation.
- Transportation.
- Food.
- Estimated total.

**Detailed Budget**

- Baggage.
- Transfers.
- Local transport.
- Attractions.
- Events.
- Taxes and fees.
- Miscellaneous spending.
- Emergency buffer.

### Rules

- Automatically reuse known flight information.
- Avoid double-counting flight costs.
- Distinguish per-person and group totals.
- Distinguish actual, estimated, and unknown values.
- Missing cost must not silently become zero.
- Maintain currency consistency.
- Preserve calculator state during navigation where practical.

### Acceptance criteria

Users can obtain a basic budget quickly and expand it for more detail.

---

## TRIP-04 — Improve Events and Attractions

**Priority:** P1  
**Effort:** L  
**Dependencies:** TRIP-01

### Context

Existing event integrations and date synchronization should be preserved.

### Requirements

- Display events relevant to trip dates.
- Show category.
- Show event date and time.
- Show venue and city.
- Provide source information.
- Provide official or partner link.
- Handle missing images.
- Handle sold-out or unavailable status if known.

Suggested filters:

- Concerts.
- Sports.
- Exhibitions.
- Other events.

Add a way to include selected events in the trip plan if compatible with the current data model.

### Rules

- Do not invent event availability.
- Do not present outdated events.
- Clearly identify approximate or missing data.
- Do not calculate venue travel times without valid location data.

### Acceptance criteria

Events are contextually relevant to the selected destination and dates.

---

## TRIP-05 — Improve Saved Trips and Sharing

**Priority:** P1  
**Effort:** M  
**Dependencies:** TRIP-01

### Requirements

Inspect existing browser storage and sharing behavior.

Improve:

- Save feedback.
- Remove from saved.
- Saved item retrieval.
- Returning to a trip.
- Sharing links.
- Restoring relevant settings.
- Handling stale saved offers.

### Important

Do not introduce mandatory user registration.

Do not add cloud synchronization unless explicitly approved.

If saved information is device-local, explain it clearly.

### Acceptance criteria

A user can save a trip, leave the site, and later find it again without confusion.

---

# 8. PHASE 4 — Visual Design and Mobile Experience

**Priority:** P1  
**Objective:** Create a polished, consistent, accessible travel interface.

## UI-01 — Design System

**Priority:** P1  
**Effort:** L  
**Dependencies:** AUD-03, UX-01, DEAL-01

### Requirements

Audit existing design tokens and components.

Define consistent:

- Colors.
- Typography.
- Spacing.
- Border radius.
- Shadows.
- Buttons.
- Form controls.
- Cards.
- Badges.
- Alerts.
- Modals.
- Loading states.
- Empty states.
- Focus states.

Suggested starting palette, subject to existing branding:

- Primary: `#2563EB`
- Text: `#14263D`
- Background: `#F6F8FC`
- Success: `#10B981`
- Warning: `#F59E0B`

Verify accessibility contrast rather than accepting colors blindly.

### Acceptance criteria

Shared visual elements behave consistently across the application.

---

## UI-02 — Destination Imagery

**Priority:** P1  
**Effort:** M  
**Dependencies:** UX-03, UI-01

### Requirements

Improve visual presentation of destinations.

Potential locations:

- Popular destinations.
- Weekend recommendations.
- Destination pages.
- Editorial collections.

### Technical requirements

- Properly licensed images.
- Responsive image sizes.
- Lazy loading.
- WebP/AVIF where appropriate.
- Fallback images.
- Descriptive alt text.
- Stable aspect ratio.

Avoid adding heavy images to every dense flight listing card.

### Acceptance criteria

Imagery enhances destination discovery without degrading page performance.

---

## UI-03 — Mobile UX Optimization

**Priority:** P1  
**Effort:** L  
**Dependencies:** UX-01, DEAL-01, DEAL-02, TRIP-01

### Requirements

Review at:

- 320px.
- 375px.
- 390px.
- 768px.
- 1440px.

Improve:

- Navigation.
- Airport selection.
- Date selection.
- Search form.
- Filter panel.
- Cards.
- Detail pages.
- Budget calculator.
- Dialogs.
- Keyboard interactions.

### Acceptance criteria

- No unintended horizontal scrolling.
- Interactive controls remain usable.
- Important actions are accessible.
- Forms work with the mobile keyboard.
- Layout is stable.
- Return navigation preserves expected context.

---

## UI-04 — Accessibility Audit and Fixes

**Priority:** P1  
**Effort:** M  
**Dependencies:** UI-01

### Objective

Work toward WCAG 2.2 AA.

### Requirements

Check:

- Color contrast.
- Input labels.
- Keyboard navigation.
- Focus management.
- Accessible dialog behavior.
- Error messages.
- Icon button labels.
- Touch target sizing.
- Screen-reader semantics.
- Reduced-motion preferences.

### Acceptance criteria

Automated checks pass where applicable, with manual verification of important flows.

---

## UI-05 — Feedback and Microinteractions

**Priority:** P2  
**Effort:** S/M  
**Dependencies:** UI-01

### Requirements

Provide consistent feedback after:

- Saving a trip.
- Removing a saved trip.
- Applying filters.
- Copying a link.
- Starting a search.
- Receiving an error.
- Resetting fields.

### Rules

Avoid distracting animations.

Respect reduced-motion settings.

### Acceptance criteria

Important user actions produce clear and appropriate feedback.

---

# 9. PHASE 5 — SEO and Discoverability

**Priority:** P1  
**Objective:** Increase useful organic traffic without creating low-value pages.

## SEO-01 — Technical SEO Improvements

**Priority:** P1  
**Effort:** L  
**Dependencies:** AUD-04

### Requirements

Inspect and fix verified issues involving:

- XML sitemap.
- Robots rules.
- Canonical URLs.
- Hreflang.
- Title tags.
- Meta descriptions.
- Heading hierarchy.
- Structured data.
- Internal linking.
- Redirects.
- Rendering.
- Pagination and query parameters.

### Important

Preserve valuable existing indexed URLs.

Do not mass-apply `noindex` without evidence.

Do not invent structured data values or ratings.

### Acceptance criteria

SEO implementation is technically consistent and validated against actual rendered pages.

---

## SEO-02 — Airport Landing Pages

**Priority:** P1  
**Effort:** M  
**Dependencies:** SEO-01

### Objective

Improve existing pages for searches such as:

- `tanie loty z Wrocławia`
- `tanie loty z Krakowa`
- `tanie loty z Warszawy`

### Requirements

Relevant pages should contain:

- Airport information.
- Actual available flight offers.
- Useful destination links.
- Contextual weekend recommendations.
- Related guides.
- Clear search CTA.

### Acceptance criteria

Pages provide unique practical value and link naturally to flight results.

---

## SEO-03 — Destination Landing Pages

**Priority:** P1  
**Effort:** L  
**Dependencies:** SEO-01

### Problem

Some destinations may not currently have flight offers.

### Requirements

Improve useful destination pages with:

- Destination overview.
- Relevant travel advice.
- Seasonal considerations.
- Verified available offers.
- Nearby alternatives where supported.
- Related guides.
- Events where relevant and available.

### Empty state

If no flight offers are currently available:

- Explain clearly.
- Suggest meaningful alternative searches.
- Avoid fabricated deals.
- Avoid empty pages containing only generic text.

### SEO requirements

Evaluate page quality and indexation policy using actual content and Search Console data when available.

### Acceptance criteria

Destination pages remain useful even without active deals.

---

## SEO-04 — Existing Guide Optimization

**Priority:** P1  
**Effort:** M  
**Dependencies:** SEO-01

### Requirements

Inventory existing guides.

Identify:

- Outdated information.
- Missing internal links.
- Weak introductions.
- Duplicate material.
- Poor search-intent alignment.
- Thin content.
- Unclear calls to action.

Prioritize pages with evidence of search demand.

### Acceptance criteria

Improved guides provide useful information and contextual links to HopTrip features.

---

## SEO-05 — Search Demand and Content Strategy

**Priority:** P2  
**Effort:** M  
**Dependencies:** SEO-02, SEO-03, SEO-04

### Objective

Use Google Search Console, Google Trends, and Keyword Planner data where available.

### Requirements

Build a prioritized content opportunity table with:

- Search query.
- Country and language.
- Search intent.
- Available demand indicators.
- Seasonality.
- Competition indicators where available.
- Existing page coverage.
- Proposed target URL.
- Content improvement or creation recommendation.
- Expected business relevance.

### Focus areas

- Cheap flights from Polish cities.
- Weekend city breaks.
- Trips under specific budgets.
- Seasonal destinations.
- Event-based trips.

### Rules

Do not invent search volumes.

Do not generate large collections of near-identical landing pages.

### Acceptance criteria

Content priorities are supported by available evidence and linked to the product.

---

# 10. PHASE 6 — Alerts, Retention, and Monetization

**Priority:** P1 / P2

## GROW-01 — Complete Flight Alerts

**Priority:** P1  
**Effort:** L  
**Dependencies:** AUD-02, DATA-01, SEC-01

### Context

The public alert registration workflow may currently be unavailable.

Inspect the actual implementation before making changes.

### Requirements

- Audit current alert backend.
- Identify existing subscription models.
- Validate subscription creation.
- Support confirmation where required.
- Support unsubscribe.
- Support subscription preferences.
- Prevent duplicate notifications.
- Control notification frequency.
- Handle stale flight data.
- Add operational logging.

### Rules

Do not enable production delivery before end-to-end testing and privacy review.

### Acceptance criteria

A verified user can create, manage, and cancel alerts through a functioning and compliant workflow.

---

## GROW-02 — Telegram Flight Notifications

**Priority:** P2  
**Effort:** L  
**Dependencies:** GROW-01

### Objective

Allow users to receive personalized flight notifications via Telegram.

### Example filters

- Origin airport.
- Destination or anywhere.
- Maximum price.
- Maximum connections.
- Date flexibility.
- Notification frequency.

### Requirements

- Telegram subscription flow.
- Chat/user association.
- Explicit user opt-in.
- Subscription management.
- Deduplication.
- Rate limiting.
- Failure handling.
- Unsubscribe or disable option.
- Logging without exposing sensitive tokens.

### Acceptance criteria

Notifications match configured preferences and are delivered only to opted-in users.

---

## GROW-03 — Affiliate Conversion Improvements

**Priority:** P1  
**Effort:** M  
**Dependencies:** TRIP-01, ANALYTICS-01

### Objective

Improve the journey from a relevant offer to an external booking partner.

### Requirements

- Audit affiliate destinations.
- Verify URL parameters.
- Validate date propagation.
- Verify destination and passenger information.
- Clearly communicate external redirects.
- Disclose affiliate relationships.
- Track outbound clicks only under an appropriate analytics/privacy setup.
- Handle unavailable or expired partner URLs.

### Important

Do not introduce misleading urgency, fake discounts, or unsupported price guarantees.

### Acceptance criteria

Partner redirects preserve valid travel context and users understand that final prices must be verified.

---

## GROW-04 — Trust and Conversion Improvements

**Priority:** P1  
**Effort:** M  
**Dependencies:** TRIP-01, SEC-01

### Requirements

Review:

- About page.
- How HopTrip works.
- Price source explanations.
- Price freshness.
- External booking disclosures.
- Privacy information.
- Contact information.
- Error handling.
- Consistency of claims.

### Acceptance criteria

Users can understand where information comes from, what HopTrip guarantees, and what must be verified with partners.

---

# 11. PHASE 7 — Data Reliability, Performance, Security, and Analytics

These tasks support the other phases and should be completed before related functionality is launched.

## DATA-01 — Flight Freshness and Expiration

**Priority:** P0  
**Effort:** L  
**Dependencies:** AUD-01, AUD-02

### Requirements

Inspect:

- Offer ingestion.
- Refresh intervals.
- Observation timestamps.
- Expiration logic.
- Duplicate handling.
- Provider availability.
- Cache invalidation.
- Historical versus current records.

Define explicit handling of stale data.

### Acceptance criteria

Expired offers are not presented as fresh bookable opportunities.

Historical records remain available where required for statistics.

---

## DATA-02 — Historical Price and Scoring Validation

**Priority:** P0  
**Effort:** L  
**Dependencies:** AUD-02

### Requirements

Inspect and test:

- Median calculation.
- Comparable route grouping.
- Date and itinerary comparability.
- Sample size.
- Missing data.
- Percentage differences.
- Freshness contribution.
- Existing ranking formulas.

### Acceptance criteria

Displayed comparisons reflect the implemented methodology accurately and do not exaggerate savings.

---

## DATA-03 — Flight Date, Airport, and Timezone Validation

**Priority:** P0  
**Effort:** M  
**Dependencies:** AUD-02

### Requirements

Validate:

- Airport IATA codes.
- Origin and destination consistency.
- Return route correctness.
- Local departure and arrival times.
- Timezone conversions.
- Overnight flights.
- Daylight saving changes.
- Negative or implausible durations.
- Date-only versus timestamp semantics.

### Acceptance criteria

Known edge cases are covered by automated tests.

---

## TECH-01 — Shared Component Refactoring

**Priority:** P1  
**Effort:** M/L  
**Dependencies:** AUD-02

### Requirements

Identify duplicated:

- Flight cards.
- Airport selectors.
- Date selectors.
- Filter controls.
- Pricing labels.
- Warning messages.
- Empty states.
- Loading states.

Consolidate where appropriate.

### Rules

Do not create an overly generic component framework.

Favor components reused in actual application flows.

### Acceptance criteria

Shared behavior is consistent, with no regression in existing pages.

---

## TECH-02 — API Contract and Error Handling Audit

**Priority:** P1  
**Effort:** M  
**Dependencies:** AUD-01

### Requirements

- Inspect request and response validation.
- Verify error response consistency.
- Handle missing optional fields.
- Validate pagination.
- Identify redundant requests.
- Prevent unhandled failures.
- Review retries and timeouts.

### Acceptance criteria

Frontend consumers handle API failures predictably.

---

## TECH-03 — Performance Optimization

**Priority:** P1  
**Effort:** L  
**Dependencies:** AUD-04

### Requirements

Optimize based on measurements:

- Critical rendering.
- Bundle size.
- Image loading.
- Caching.
- API call patterns.
- Component re-rendering.
- Route loading.
- Layout stability.

### Core Web Vitals targets

At the 75th percentile of applicable real-user measurements:

- LCP ≤ 2.5 seconds.
- INP ≤ 200 milliseconds.
- CLS ≤ 0.1.

Laboratory measurements should be reported separately from field data.

### Acceptance criteria

Changes produce documented improvements or solve clearly measured bottlenecks.

---

## SEC-01 — Security and Privacy Review

**Priority:** P0  
**Effort:** M/L  
**Dependencies:** AUD-01

### Requirements

Review:

- Secrets handling.
- API input validation.
- External URL handling.
- Content Security Policy.
- Rate limiting.
- Dependency vulnerabilities.
- User-controlled content.
- Analytics consent.
- Storage of personal information.
- Email subscription consent.
- Third-party trackers.
- Data deletion and retention practices where applicable.

### Important

Identify legal or compliance questions requiring professional review.

Do not claim legal compliance based only on a code inspection.

### Acceptance criteria

Critical technical issues are resolved or explicitly blocked with documented risk.

---

## ANALYTICS-01 — Product Analytics Event Taxonomy

**Priority:** P1  
**Effort:** M  
**Dependencies:** AUD-02, SEC-01

### Objective

Measure the most important user journeys.

### Proposed events

- `search_submitted`
- `search_results_viewed`
- `filter_applied`
- `filter_reset`
- `offer_viewed`
- `offer_details_opened`
- `affiliate_clicked`
- `trip_saved`
- `trip_removed`
- `budget_calculated`
- `event_clicked`
- `alert_subscription_started`
- `alert_subscription_completed`

### Requirements

- Reuse existing analytics provider if suitable.
- Respect analytics consent.
- Avoid capturing personal information unnecessarily.
- Prevent duplicate event recording.
- Define consistent event properties.
- Document measurement limitations.

### Acceptance criteria

Events support reliable funnel analysis without violating consent settings.

---

## ANALYTICS-02 — Conversion and Usage Dashboard

**Priority:** P2  
**Effort:** M  
**Dependencies:** ANALYTICS-01

### Objective

Monitor how visitors use HopTrip.

### Recommended metrics

- Search initiation rate.
- Search success rate.
- Empty-result rate.
- Offer detail opening rate.
- Affiliate click-through rate.
- Save-trip rate.
- Budget calculator usage.
- Event engagement.
- Returning visitor rate.
- Mobile versus desktop funnel performance.
- Landing page conversion.

### Requirements

Use actual analytics data.

Do not invent baseline values.

Define metrics clearly before comparing trends.

### Acceptance criteria

Core user journeys are measurable and documented.

---

# 12. Testing Strategy

Every implementation task must consider the relevant tests below.

## 12.1 Critical E2E scenarios

Create or maintain tests for:

**E2E-01:** Search flights using an origin airport only.

**E2E-02:** Search with origin, destination, dates, and budget.

**E2E-03:** Apply multiple filters.

**E2E-04:** Reset filters.

**E2E-05:** Activate and deactivate quick presets.

**E2E-06:** Navigate to an offer and return to results without unexpected state loss.

**E2E-07:** Display a complete flight offer.

**E2E-08:** Display a partially complete flight offer.

**E2E-09:** Handle a critically incomplete itinerary.

**E2E-10:** Handle different arrival and return airports.

**E2E-11:** Handle no matching results.

**E2E-12:** Handle API failure.

**E2E-13:** Open accommodation search with correct dates.

**E2E-14:** Calculate budget for one traveler.

**E2E-15:** Calculate budget for multiple travelers.

**E2E-16:** Save and restore a trip.

**E2E-17:** Display matching events for selected trip dates.

**E2E-18:** Switch supported languages.

**E2E-19:** Validate analytics consent behavior.

**E2E-20:** Validate outbound affiliate links.

**E2E-21:** Handle expired flight offers.

**E2E-22:** Test mobile search, filters, and navigation.

**E2E-23:** Validate correct behavior across timezone and daylight-saving boundaries.

**E2E-24:** Validate subscription and unsubscribe flows when alerts are enabled.

Use deterministic test fixtures.

Do not rely on unpredictable live third-party prices in CI tests.

## 12.2 Visual regression testing

Capture and compare critical pages at relevant desktop and mobile sizes.

Important pages:

- Homepage.
- Search results.
- Flight detail.
- Weekend deals.
- Destination page.
- Saved trips.
- Budget calculator.
- Alerts.

Account for dynamic content and nondeterministic timestamps.

## 12.3 Accessibility testing

Use suitable automated accessibility checks together with manual testing of:

- Keyboard navigation.
- Focus management.
- Input validation.
- Dialogs.
- Screen-reader announcements.
- Error messages.

## 12.4 Regression policy

Before marking a task `DONE`:

- Run related unit tests.
- Run relevant integration tests.
- Run affected E2E tests where supported.
- Run lint and type checking.
- Build the application.
- Review browser behavior where possible.

Report skipped or unavailable checks.

---

# 13. Recommended Execution Order

Task dependencies take precedence over the sequence below.

## Milestone M0 — Understand and Protect

1. AUD-01 — Architecture audit.
2. AUD-02 — Feature inventory.
3. AUD-03 — UX audit.
4. AUD-04 — Performance and SEO baseline.
5. AUD-05 — Regression baseline.
6. SEC-01 — Initial security/privacy assessment.

**Exit criteria:** Verified architecture, current behavior, and key risks are documented.

## Milestone M1 — Improve Core Search Experience

7. DATA-03 — Dates, airports, and timezone correctness.
8. DATA-01 — Freshness and expiration.
9. DATA-02 — Historical price comparison validation.
10. DEAL-04 — Data completeness classification.
11. UX-01 — Homepage hero.
12. UX-02 — Unified airport selection.
13. UX-03 — Homepage hierarchy.
14. UX-04 — Navigation.
15. DEAL-01 — Unified offer card.
16. DEAL-02 — Filters.
17. DEAL-05 — Empty, loading, and error states.
18. DEAL-06 — Price score presentation.
19. DEAL-03 — Sorting.

**Exit criteria:** Users can find and understand accurate flight opportunities with predictable interactions.

## Milestone M2 — Improve Trip Planning

20. TRIP-01 — Flight detail layout.
21. TRIP-02 — Accommodation.
22. TRIP-03 — Budget calculator.
23. TRIP-04 — Events and attractions.
24. TRIP-05 — Saved trips and sharing.

**Exit criteria:** A user can plan the key elements of a trip without repeatedly entering information.

## Milestone M3 — Polish the Interface

25. UI-01 — Design system.
26. UI-03 — Mobile experience.
27. UI-04 — Accessibility.
28. UI-02 — Destination imagery.
29. UI-05 — Interaction feedback.

**Exit criteria:** Consistent and usable interface across target devices.

## Milestone M4 — Technical Quality and SEO

30. TECH-01 — Shared component consolidation.
31. TECH-02 — API contracts.
32. TECH-03 — Performance.
33. SEO-01 — Technical SEO.
34. SEO-02 — Airport pages.
35. SEO-03 — Destination pages.
36. SEO-04 — Existing guides.
37. SEO-05 — Search demand strategy.

**Exit criteria:** Better technical foundation and more useful search landing pages.

## Milestone M5 — Growth and Monetization

38. ANALYTICS-01 — Product analytics.
39. GROW-03 — Affiliate conversion.
40. GROW-04 — Trust improvements.
41. GROW-01 — Email flight alerts.
42. GROW-02 — Telegram notifications.
43. ANALYTICS-02 — Conversion dashboard.

**Exit criteria:** Measurable conversion and functioning user retention flows.

### Scheduling guidance

The sequence is a default planning order, not a requirement to postpone all SEO, analytics, security, or performance work until the end.

In particular:

- Address critical security and data correctness problems immediately.
- Preserve SEO during route or navigation changes.
- Add analytics instrumentation before evaluating UX changes where possible.
- Introduce design-system foundations before large-scale visual component duplication.
- Run tests continuously.

---

# 14. Execution Protocol for Every Codex Session

When the user asks:

`Continue HopTrip roadmap`

or:

`Execute next task from docs/HOPTRIP_MASTER_PLAN.md`

follow this exact protocol.

## Step 1 — Read state

Read:

- `docs/HOPTRIP_MASTER_PLAN.md`
- `docs/HOPTRIP_PROGRESS.md`
- `docs/HOPTRIP_DECISIONS.md`, if present

Identify the first eligible incomplete task, considering dependencies and blockers.

Do not reinterpret completed tasks as unfinished without evidence.

## Step 2 — Inspect code

Before making changes:

- Locate affected modules.
- Read relevant implementation.
- Read existing tests.
- Check whether the requested functionality already exists.
- Determine the minimal safe change.

## Step 3 — Define task scope

Produce a short implementation plan internally or in the task summary.

Include:

- Current behavior.
- Desired behavior.
- Affected files.
- Dependencies.
- Risks.
- Tests to execute.

## Step 4 — Implement

Implement the selected task only.

Do not perform unrelated cleanup.

Do not rewrite the application.

Use existing patterns.

If a new dependency is necessary, justify it.

## Step 5 — Validate

Run relevant:

- Formatting.
- Linting.
- Type checks.
- Unit tests.
- Integration tests.
- E2E tests.
- Build.
- Accessibility or visual checks where appropriate.

Do not mark validation as complete if tools were unavailable.

## Step 6 — Review

Inspect the final diff.

Check for:

- Accidental unrelated changes.
- Untranslated strings.
- Broken routes.
- Missing null handling.
- Incorrect date/time behavior.
- Misleading flight prices.
- Unintended SEO changes.
- Unsafe logging.
- Privacy regressions.

## Step 7 — Update progress

Update `docs/HOPTRIP_PROGRESS.md`.

Record:

- Status.
- Files changed.
- Tests run.
- Important decisions.
- Remaining limitations.
- Follow-up tasks.

If requirements were modified during implementation, record the decision.

## Step 8 — Report and stop

Provide a short Russian report using:

### Completed task
Task ID and title.

### Changes
What was implemented.

### Files
List of changed files.

### Validation
Tests executed and results.

### Risks
Known limitations or unresolved questions.

### Next task
Next eligible task and ID.

Do not begin the next task automatically.

---

# 15. Handling Problems and Blockers

If a task cannot be completed safely:

1. Stop implementation of the unsafe part.
2. Document the exact blocker.
3. Mark the task `BLOCKED`.
4. Describe the prerequisite.
5. Suggest the smallest safe next action.
6. Do not claim completion.

If the codebase already satisfies the task:

1. Verify behavior.
2. Add missing tests if necessary.
3. Document findings.
4. Mark `DONE` or `NOT_APPLICABLE` with justification.
5. Do not implement a duplicate.

If the task is larger than expected:

1. Split it into numbered subtasks.
2. Preserve the original parent task.
3. Update dependencies.
4. Implement only one manageable subtask in the current session.

---

# 16. UX Quality Principles

Apply these continuously.

## 16.1 Information hierarchy

Users should primarily see:

1. Destination.
2. Dates.
3. Price.
4. Important restrictions.
5. Next action.

Technical methodology should be accessible but secondary.

## 16.2 User trust

Avoid:

- Fake discounts.
- False urgency.
- Unsupported "best price" claims.
- Artificial scarcity.
- Hidden booking restrictions.
- Ambiguous prices.
- Misleading score presentation.

## 16.3 Predictable interaction

Avoid:

- Unexpected filter resets.
- Duplicate search controls.
- Losing context during navigation.
- Hidden state changes.
- Actions without feedback.
- Dead-end empty states.

## 16.4 Keep the user in control

Allow users to:

- Change their origin airport.
- Adjust budgets.
- Explore flexible dates.
- Reset filters.
- Compare offers.
- Inspect important details.
- Save and remove trips.
- Opt in or out of notifications.

## 16.5 Mobile-first decisions

Prioritize touch usability, readable information, stable layouts, and efficient browsing.

Do not reduce mobile usability simply to make desktop layouts visually impressive.

---

# 17. Product Success Metrics

Use measured values, not fabricated targets.

## Core funnel

Visitor → Search → Results → Offer detail → Affiliate click.

Track:

- Search initiation rate.
- Search success rate.
- Empty-result rate.
- Offer detail click-through rate.
- Affiliate click-through rate.
- Return visitor rate.
- Save-trip rate.
- Budget engagement.
- Event engagement.

## Technical quality

Track:

- Page performance.
- Core Web Vitals.
- API error rates.
- Failed ingestion jobs.
- Stale offer counts.
- Incomplete offer counts.
- Broken outbound links.
- Client-side errors.

## SEO

Track:

- Organic clicks.
- Impressions.
- CTR.
- Average search position.
- Indexed pages.
- Non-indexed pages and reasons.
- Landing page engagement.
- Conversion from organic traffic.

## Evaluation

Collect a baseline first.

Then evaluate changes by comparing equivalent periods and segments.

Do not claim causality based solely on simple before/after comparisons when traffic composition or seasonality may have changed.

---

# 18. Scope Control

Avoid introducing these features without a specific decision:

- Mandatory user accounts.
- Complex booking systems.
- Payments processed directly by HopTrip.
- Full social networking features.
- AI chatbots with no proven use case.
- Large-scale personalized recommendation infrastructure.
- Expensive proprietary travel APIs.
- Large-scale autogenerated SEO pages.
- Complete frontend rewrites.
- Unnecessary microservices.
- Major infrastructure migrations unrelated to the task.

The objective is to improve and monetize the existing product, not replace it with an unrelated platform.

---

# 19. Final Product Acceptance Criteria

The roadmap is considered successfully implemented when:

1. Users immediately understand what HopTrip offers.
2. Flight search is simple and predictable.
3. Airport and date selection work consistently.
4. Flight cards are compact, clear, and accurate.
5. Incomplete data cannot silently mislead users.
6. Historical price comparisons are understandable.
7. Flight detail pages prioritize useful information.
8. Trip budgeting works without unnecessary manual input.
9. Accommodation and events use appropriate trip context.
10. Saving and sharing trips is reliable.
11. Mobile usability is strong.
12. Accessibility is meaningfully improved.
13. SEO changes preserve valuable existing routes.
14. Performance changes are supported by measurements.
15. Privacy and consent controls behave as documented.
16. Product analytics can measure the primary funnel.
17. Affiliate transitions are clear and technically correct.
18. Alert subscriptions work reliably when enabled.
19. Critical regression tests pass.
20. The product remains maintainable and safe to develop.

---

# 20. Immediate First Action

**The first Codex execution must start with AUD-01.**

Perform a read-only repository architecture audit.

Then:

1. Create the initial progress tracker.
2. Document actual architecture and important services.
3. Identify the next task.
4. Report findings in Russian.
5. Stop.

Do not begin the homepage redesign during the initial audit.

The long-term objective is to improve HopTrip through small, reviewable, tested changes while preserving the functionality that already exists.