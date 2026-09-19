# Provider registry

Provider capabilities are tracked in the database and must not be inferred from the
existence of an affiliate account.

| Candidate | Role | Link/deep link | Data/search API | Current state |
| --- | --- | --- | --- | --- |
| Trip.com | Affiliate provider | Affiliate links and platform tools | No assumed search API | Onboarding pending |
| Travelpayouts | Affiliate network and data candidate | Program-dependent | Data API requires partner token and is cache-based | Evaluate per program |
| DiscoverCars | Car-rental affiliate provider | Links, deep links, widgets, XML API | Car inventory API available under its terms | Later phase |
| Amadeus | Travel data provider | Not an affiliate source in Self-Service | Flight, hotel and destination APIs | Technical data candidate |

Trip.com generated links must be treated as trusted provider output and not modified unless
the provider explicitly permits the change. Travelpayouts programs are approved independently.
Amadeus Self-Service is a data source and does not replace affiliate onboarding.

