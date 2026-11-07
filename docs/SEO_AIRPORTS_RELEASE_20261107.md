# SEO-02 — Málaga and Lisbon airport guides

2026-11-07. Stage 3 of the user's seven-stage SEO plan. Based on deployed Alicante pilot c1ab791f03a64142239dd28cdecacbf501634342. Complete one bounded change: improve these two existing guides in PL/EN/RU/UK without changing public paths or indexing policy.

Both guides gain an SSR answer before the photograph, reviewed transport conditions, source links/date, comparison table, four working contents anchors and links to an existing short-stay guide and city-filtered catalogue. Titles/descriptions and only the corresponding translation records are updated. The existing Alicante component, photos/credits, affiliate widgets and all other guides remain compatible. A typed allowlist limits the new component to Malaga/Lisbon.

Málaga: Aena's approximately 12 minutes to the centre and 8 to María Zambrano are train running times, not door-to-door transfer times. Renfe's EUR 1.80 ordinary single is explicitly for 1–2 zones, not every coastal destination. Cronos requires entry/exit validation. EMT Express is EUR 4 per single journey, with onboard cash or VISA/MASTERCARD. Source links:

- https://www.aena.es/en/malaga-costa-del-sol/getting-there/trains.html
- https://www.renfe.com/es/es/cercanias/cercanias-malaga/tarifas/billetes
- https://www.emtmalaga.es/linea-express-aeropuerto

Lisbon: EUR 1.92 is the Metro bank-card contactless product, with a separate supported card/device per passenger and the same medium at entry/exit. It is not presented as the fare for every ticket type. T1–T2 shuttle is free; the approximately 3 minutes covers driving only. T2 closure 00:30–03:30 is dated and linked to ANA's current information. Sources:

- https://www.metrolisboa.pt/en/ride-on-metro-lisboa-with-contactless-payment-card/
- https://www.metrolisboa.pt/en/buy/
- https://www.lisbonairport.pt/en/lis/access-parking/getting-to-and-from-the-airport/terminal-2
- https://www.lisbonairport.pt/en/lis/access-parking/getting-to-and-from-the-airport/public-transportation

No fixed hotel-transfer taxi quote, universal late-night interval or unsupported terminal platform is invented. Original article review dates remain unchanged; new answer verification date is shown separately. No DB/API/dependency/notification/consent changes.

Validation: 335 Node unit tests PASS, including numeric parity and fare-product scope across languages; targeted ESLint and TypeScript PASS; production Next build PASS. 28 Chrome desktop/mobile scenarios PASS: 18 new-guide cases and 10 Alicante regression cases. Covers SSR ordering, canonical/hreflang/robots, source/date/conditions, table/anchors, keyboard, photograph decoding, axe, 320px overflow and no-JavaScript. Candidate parity 10/10 changed code/test files. Fixtures have no inventory for some destinations; guide availability is preserved.

Publish only after exact-SHA GitHub CI succeeds, using the existing root-owned deployer with source/image/database/static backup and health/static/monitor postflight. Roll back only this delta if needed. A production result and ranking improvement are not claimed before verification; Google indexing/effect evaluation remain separate stages.
