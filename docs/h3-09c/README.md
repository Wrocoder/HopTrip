# H3-09c: destination photographs

2026-11-07. User-authorized production publication of the photo fix.

The collection cards previously resolved photographs for only Barcelona, Rome and Budapest. Reuse 16 reviewed local city photographs from article-photo-data.json, including Stockholm, Copenhagen and Milan. Preserve localized alt text, author/source/licence, additional attribution and ShareAlike disclosure. Unknown cities retain the existing fallback. No new assets, dependencies, API or schema changes.

Validation before publication: 333 Node unit tests PASS; targeted ESLint PASS; TypeScript PASS; production Next build PASS; 3 desktop Chrome Playwright scenarios PASS (all 19 local assets and responsive responses, PL collection including axe, image failure preserving the action). The initial Playwright attempt lacked bundled Chromium; the installed Chrome channel completed successfully.

Release baseline: d95fcab5cb5addee90f93868ece9a1e1b5224cda. Publish this small change on top of that deployed release using the existing root-owned production deployer. It preserves previous source/images, database backup and retained static assets and runs health/static/monitor checks with automatic image rollback on failure. No notification activation.

Post-deploy result is recorded separately after exact-SHA CI and production checks.
