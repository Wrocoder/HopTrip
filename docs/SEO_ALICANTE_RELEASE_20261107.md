# SEO-01 — Alicante pilot

2026-11-07. Continue the user-requested seven-stage SEO plan with one bounded pilot. Baseline: deployed photo release 2b70f609ff1a5ddef740b25f6b9ba010ecba923f.

Update Alicante metadata in PL/EN/RU/UK and insert a server-rendered answer before the photograph. Include C6/taxi/prebooked-transfer comparison, a four-link contents list, late/return journey advice and links to the existing weekend guide and city-filtered catalogue. Other guides retain their existing rendering. Canonical, hreflang, public paths, affiliate disclosure, consent and existing photograph credits are preserved.

The official municipal tourism page lists the ordinary C6 single fare as EUR 4.70, tickets sold on the bus, with exact cash recommended. Show the per-person scope, verification date 2026-11-07 and source. Discount eligibility and card acceptance are not inferred. Sources:

- https://alicanteturismo.com/como-llegar-a-alicante/
- https://www.aena.es/en/alicante-elche-miguel-hernandez/how-to-get-there/bus.html
- https://www.aena.es/es/alicante-elche-miguel-hernandez/como-llegar/tren-tram.html
- https://www.aena.es/en/alicante-elche-miguel-hernandez/how-to-get-there/taxi.html

The indexed operator notice dated 24 July 2026 independently agrees on the ordinary fare, but direct requests to Vectalia returned 403. The full municipal page was accessible. Conflicting historic PDFs were excluded. No universal journey duration, night interval or boarding floor is asserted; use the official current route/stop notices and allow for traffic and waiting.

Validation: 333 Node unit tests, targeted ESLint and production Next build including TypeScript PASS. Ten Chrome desktop/mobile cases PASS, covering four locales, source/fare/date, SSR ordering, canonical/hreflang, contents targets, keyboard, axe, 320px overflow, no-JavaScript and a non-pilot guide. Local fixtures have no inventory for some destination requests; the guide remains available. No paid APIs, DB migrations, dependency changes or notification activation.

Production rollout uses the existing root-owned deployer only after exact-SHA CI success; it preserves source/images/static/database backup and checks health/static/monitor with rollback on failure. Before successful rollout this document does not claim publication or ranking improvement. Roll back this bounded delta without reverting previous H3/photo work. Search Console indexing evidence and later growth evaluation remain separate stages.
