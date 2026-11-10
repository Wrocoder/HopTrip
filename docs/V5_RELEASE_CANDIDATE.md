# V5 release candidate — 2026-11-10

Based on current published main `6d37538767893003bcf0f3dad503c3fdf9e01fb6`. Prepared in an isolated checkout; the original workspace, IDE files, private environment and unrelated historical changes are preserved.

The candidate separates itinerary suitability/confidence from the numeric model score, applies the same recommendation policy to collections, improves the first screen of a trip, clarifies partner airport/date limitations, completes destination localization and image fallback, and adds reviewed Berlin/Ålesund planning content. The existing budget architecture is preserved.

Subscriptions and their settings/activation remain unchanged. Human research and the dependent V5-09 budget work are deferred by the owner. No new migrations or dependency versions; the optional pip CA build secret complements the existing npm CA mechanism without persisting certificates or disabling TLS validation.

Local candidate checks: 1402 API tests including 20 isolated PostgreSQL tests; 423 Node tests; Ruff/mypy/ESLint/types; clean native and Linux production builds. Six Linux deploy/rollback command-double scenarios pass. The production-origin image passes 8 desktop/mobile journeys in PL/EN/RU/UK and 240 catalog SSR requests, first with the fixture and again with the normal production API on migrated PostgreSQL. Two additional consented journeys verify the received ordered funnel and duplicate-event handling. These are synthetic tests, not human sessions or commercial metrics.

SEO: 248/248 published pages, 62 per language, no failures. Lighthouse: 12 measurements, median of three per route/device for home and catalog; Performance 96–100, Accessibility 100, LCP 291–959 ms, CLS 0. These are local lab results, not field CWV/INP.

An actual local application rollback to the base source and return to V5 pass 20 pages and 304 old/current static resources per phase; hashes and immutable headers match. A disposable database dump is restored to a separate database with 15 fixture deals and schema revision 0021. No database downgrade is needed because migrations did not change. Production backups and postflight must still be captured during an authorized rollout.

Known limits: the earlier Windows Node24/Python fixture timeout has no established root cause; it was not reproduced on this clean diagnostic run or the Linux Node22/Python/PostgreSQL target. Successful repeats are not a claimed root-cause fix. Interactive keyboard QA remains unavailable because both computer-use runtimes fail to start; scripted keyboard/axe checks pass. Real partner merchant/ticket acceptance, production analytics baseline, real-user metrics and the deferred study remain outside the completed local scope. Seven moderate npm advisories concern the development ESLint/minimatch chain; production audit reports zero advisories.

Local preparation does not publish or deploy this branch. Before production: review/accept these explicit limitations, publish the exact reviewed SHA through the normal main/CI path, check the actual current production revision and privileged deployer, then use its image/static/database backup and rollback procedure. Never claim full V5 external acceptance from these local results.
