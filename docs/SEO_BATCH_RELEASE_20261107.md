# SEO stages 4–6 — one final deployment batch

The user requested completing the remaining implementable work before deploying, instead of separate deployments. Baseline: d20fd0019cdc9b8c2126427295beb4394c66472c. No intermediate deployment was performed for this batch.

## Changes

- Guide → itinerary → catalogue → budget: direct localized budget links in the three airport summaries; reuse the existing routes navigation earlier in four itinerary guides and include the budget link for those guides and Rome airports. No duplicate routes block. Existing official/affiliate links and locale fallback remain intact.
- Commercial pages: show weekend planning links before the filter/results, add an explicit no-leave-mode shortcut and preserve origin, destination, dates, budget and other applicable manual filters. Existing legacy weekend semantics are unchanged. KRK and weekend receive localized practical content, without invented fares or guaranteed flight availability.
- Bound the initial KRK preview to 12 observations and visibly offer the full city-origin search. Other origin pages retain their previous limits. There is no claim that this is all market inventory.
- Defer the below-fold cover photo only for the three airport guides with long answer blocks. Other covers retain preload; reserved dimensions/credits/error fallbacks are unchanged.
- Sitemap lastmod uses explicit dates for actually edited pages, separately from source-review dates. Unrelated content is not refreshed by the clock. Index/noindex, canonicals and URL inventory are preserved, including intentionally noindex Rome destination and filtered searches.
- Add a PowerShell tool for future GSC ZIP comparisons. It distinguishes property/page/query aggregates and flags unequal or overlapping windows. It cannot verify Google-selected canonicals or prove causal ranking uplift.

## Validation and limits

336 Node tests PASS, including selective sitemap date behavior. Targeted ESLint/TypeScript and fresh production build PASS. The initial 48-case browser run had 46 passes and two stale global-empty-catalogue assertions; corrected scope checks the empty primary city catalogue while allowing existing alternative cities. A production-build follow-up passed 14 cases, including both corrected cases, the guide/landing/filter journeys and a 15-URL indexability policy sample. Two earlier technical-test assumptions were corrected: normalize root trailing slash, and preserve intentionally noindex Rome destination. These were test-contract corrections, not production changes to indexing policy. Latest unique functional coverage: 50 cases across dev/production, not one claimed all-green initial run.

Mobile production Lighthouse 13.6.0 before this batch, one simulated run per URL: Alicante 98, KRK 92, weekend 99; LCP ~1.15/1.37/1.19 s, CLS ~0. Lab values are not field CWV or evidence of SEO uplift. Repeat on the deployed candidate after rollout and record actual differences/variability. Public PageSpeed field-data request returned HTTP 429; no paid service or key was used.

Analytics contract reviewed: consent-gated PAGE_VIEW/page_type and SEARCH_RESULT/destination already exist. No new identifiers, tracking events or claimed per-guide click attribution are introduced. Exact GSC indexing data and post-recrawl growth are still external follow-ups, not completed by this release.

Publish this batch once after exact-SHA CI success, using the existing root-owned deployer and its source/image/database/static backup, automatic rollback and health/static/monitor checks. Verify the live journeys, scoped lastmod/noindex, lazy photo loading and production Lighthouse after deployment. Roll back only this bounded delta, preserving prior H3/airport releases. No DB/API/dependency/notification changes.
