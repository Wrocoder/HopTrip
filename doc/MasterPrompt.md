You are a senior product engineer, software architect, data engineer, UX engineer, technical product owner, and growth-oriented product developer.

Your task is to design and implement a production-ready travel deal discovery platform for Poland.

This is intended to become a real commercial affiliate business.

Do NOT build:

* a demo;
* a static prototype;
* a fake-data dashboard;
* a portfolio project;
* a mock travel search engine.

Build the foundation of a real product that can:

* discover travel deals;
* accumulate historical pricing data;
* attract organic and direct traffic;
* redirect users through affiliate links;
* measure affiliate clicks and conversions;
* progressively integrate more commercial partners;
* later be deployed to an Oracle Cloud VM.

The project currently starts with ZERO traffic.

This is an important product constraint.

The architecture and implementation roadmap must therefore allow us to launch before having significant traffic or access to every desired affiliate API.

---

# 1. PRODUCT VISION

We are building a consumer travel discovery platform for people living in Poland.

The core product question is:

> Where can I travel cheaply from Poland right now, and how much will the whole trip actually cost?

The platform should discover attractive travel opportunities and present them as complete, understandable trip deals.

Instead of showing only:

> Wrocław → Barcelona, 129 PLN

show:

> Weekend in Barcelona
> 18–21 October
>
> Flight: 179 PLN
> Hotel: 426 PLN
> Airport transport: 52 PLN
>
> Estimated total:
> 657 PLN/person
>
> 34% cheaper than typical
> Deal Score: 91/100

Each commercial component may lead to an external provider through an affiliate link.

The platform itself does NOT sell flights, hotels, cars, activities or travel packages.

It:

DISCOVERS
→ ANALYZES
→ COMPARES
→ EXPLAINS
→ REDIRECTS

---

# 2. BUSINESS MODEL

Primary monetization:

AFFILIATE COMMISSIONS.

Potential monetizable categories:

* flights;
* hotels;
* trains;
* buses;
* car rental;
* airport transfers;
* activities;
* tours;
* travel insurance;
* eSIM;
* package holidays.

Possible providers include:

* Trip.com;
* Travelpayouts programs;
* DiscoverCars;
* Omio;
* GetYourGuide;
* eSky;
* hotel affiliate networks;
* additional European affiliate platforms.

IMPORTANT:

Provider names above are candidates, not permanent architectural dependencies.

Do not hardcode the product around a single affiliate company.

---

# 3. ZERO-TRAFFIC BOOTSTRAP STRATEGY

The project starts without meaningful traffic.

Do NOT treat this as a blocker.

Affiliate programs have different entry requirements.

Some providers can work with new or low-traffic projects.

Others may require:

* an existing website;
* content;
* minimum traffic;
* manual approval;
* minimum monthly visitors;
* an established audience;
* separate approval for API access.

Therefore affiliate integrations must be progressive.

The product must be able to launch even if only one provider is initially approved.

---

# 4. AFFILIATE INTEGRATION LEVELS

Very important:

Do NOT assume that:

# affiliate account

# affiliate links

# deeplink generator

# search API

booking API.

These are different capabilities.

Model provider capabilities explicitly.

Example:

ProviderCapability:

* AFFILIATE_LINK
* DEEP_LINK
* SEARCH_API
* PRICE_API
* BOOKING_API
* CONVERSION_API
* WEBHOOK
* PRODUCT_FEED

A provider may support:

Trip.com:

AFFILIATE_LINK = true
SEARCH_API = maybe/pending

while another provider may expose only redirects initially.

Business logic must not assume API availability merely because an affiliate account exists.

---

# 5. AFFILIATE PROVIDER STATUS

Create explicit provider onboarding states.

For example:

NOT_CONFIGURED

APPLICATION_PLANNED

APPLICATION_SUBMITTED

UNDER_REVIEW

APPROVED

REJECTED

SUSPENDED

DISABLED

A provider can exist in our system before it becomes commercially available.

Store relevant metadata:

* application date;
* approval status;
* supported capabilities;
* notes;
* account configuration state.

Never store credentials in source code.

---

# 6. INITIAL AFFILIATE STRATEGY

For the first production version prioritize providers that are accessible to a new project.

Potential initial candidates:

## Trip.com

Candidate for:

* flights;
* hotels;
* possibly other travel products.

Use affiliate/deep links if approved.

Do not block launch waiting for advanced API access.

## Travelpayouts

Use programs available to our project.

Different programs inside the network may have different approval requirements.

Treat each program independently.

## DiscoverCars

Potential early monetization for car rental.

## Later integrations

As traffic grows, apply to additional programs such as:

* Omio;
* additional Travelpayouts brands;
* advanced GetYourGuide integrations;
* additional hotel partners;
* other providers requiring minimum traffic.

Provider eligibility must be configuration, not application logic.

---

# 7. AFFILIATE BOOTSTRAP GOAL

We should be able to launch with:

ONE real monetizable provider.

We should NOT wait until every travel category is monetized.

Example first production configuration:

Flights:
Trip.com

Hotels:
Trip.com

Cars:
DiscoverCars

Activities:
not monetized yet

Rail:
not monetized yet

This is acceptable.

Missing affiliate partnerships must not prevent useful deals from being shown.

---

# 8. PRODUCT BEFORE TRAFFIC

Before applying to more selective affiliate programs, create a legitimate, useful website.

The initial live site should not be:

> Coming Soon

It should contain real useful product pages.

Target initial content footprint:

approximately 20–30 useful pages before aggressive partner onboarding.

Examples:

Homepage

Departure pages:

* Wrocław
* Warszawa
* Kraków
* Katowice
* Gdańsk
* Poznań

Destination pages:

* Barcelona
* Rome
* Milan
* Malaga
* Lisbon
* Paris
* Athens
* Valencia
* Alicante

Discovery pages:

* Weekend do 500 zł
* Weekend do 1000 zł
* Ciepło zimą
* City break
* Tanie podróże z Wrocławia

And essential company/legal pages:

* About
* Contact
* Privacy
* Affiliate Disclosure

Pages must provide useful information.

Do not create thin SEO spam.

---

# 9. INITIAL MARKET

MVP market:

POLAND.

Initial departure airports:

* Wrocław WRO
* Warszawa WAW
* Warszawa Modlin WMI
* Kraków KRK
* Katowice KTW
* Gdańsk GDN
* Poznań POZ

Do not hardcode these permanently.

Store airports in the database.

Architecture must allow later expansion to:

Germany

France

and other European countries.

---

# 10. TARGET USERS

Primary users:

* people living in Poland;
* price-sensitive travelers;
* people looking for spontaneous trips;
* city-break travelers;
* couples;
* solo travelers;
* families;
* users who know their budget but not their destination.

Typical intentions:

> I have 1000 PLN. Where can I go?

> Where can I fly cheaply from Wrocław next month?

> Show me somewhere warm for a weekend.

> Where can two people travel for under 2000 PLN?

> What are the best cheap trips during a long weekend?

> Show me good deals from Kraków.

---

# 11. PRODUCT PRINCIPLES

The website must NOT feel like:

* an airline booking engine;
* an enterprise dashboard;
* a generic affiliate blog;
* a spreadsheet;
* a Skyscanner clone.

The product hierarchy:

DISCOVERY
→ DEAL
→ WHY IT IS GOOD
→ TOTAL COST
→ EVIDENCE
→ BOOK

Users should immediately understand:

1. Where can I travel?
2. When?
3. From where?
4. What is the actual estimated trip cost?
5. Why is this a good price?
6. Where can I book it?

Priorities:

1. Useful real data
2. Trust
3. Simplicity
4. Deal quality
5. Explainability
6. Conversion
7. Speed
8. SEO
9. Retention
10. Visual quality
11. Feature quantity

---

# 12. PRODUCT LANGUAGE

Initial interface:

Polish.

Architecture must support future:

* English;
* German;
* French.

Use proper i18n.

Do not scatter Polish strings across React components.

---

# 13. CORE DOMAIN MODEL

Create normalized domain entities.

At minimum consider:

## Airport

* id
* iata_code
* name
* city
* country_code
* latitude
* longitude
* timezone
* is_active

## Destination

* id
* city
* country
* country_code
* slug
* latitude
* longitude
* timezone
* destination_type
* is_active

## Route

Logical relation:

departure airport
→ destination.

## TravelOffer

Normalized provider offer.

Possible types:

FLIGHT
HOTEL
TRAIN
BUS
CAR
ACTIVITY
TRANSFER
INSURANCE
ESIM

Fields should support:

* provider
* provider external ID
* product type
* source
* destination
* travel dates
* original price
* original currency
* normalized PLN price
* raw/provider-specific metadata
* fetched_at
* last_verified_at
* expires_at

Important searchable fields should remain relational.

Provider-specific information may use JSONB.

---

# 14. DEAL

A Deal is a consumer-facing travel opportunity assembled from offers.

Example:

FLIGHT + HOTEL

Fields may include:

* id
* slug
* origin airport
* destination
* trip start
* trip end
* nights
* travelers
* flight price
* hotel price
* other estimated costs
* total estimated cost
* price per person
* historical baseline
* discount percentage
* deal score
* confidence score
* status
* generated_at
* last_verified_at
* expires_at
* is_featured
* is_visible

---

# 15. PRICE HISTORY

Price history is a strategic asset.

Store historical observations.

Support:

* route;
* destination;
* provider;
* product type;
* departure period;
* trip duration;
* observed price;
* observed_at.

Every ingestion cycle should improve our ability to answer:

> Is this actually cheap?

Do not treat PriceHistory as temporary operational data.

---

# 16. AFFILIATE PROVIDER

Create an AffiliateProvider domain.

Fields may include:

* id
* code
* name
* onboarding_status
* is_active
* priority
* configuration reference
* website URL
* supported product categories
* supported capabilities
* last_health_check
* notes

Provider-specific secrets must come from environment/secrets management.

---

# 17. AFFILIATE PROGRAM

Consider separating commercial programs from provider companies.

Example:

Travelpayouts
├── Program A
├── Program B
└── Program C

Programs may independently be:

approved;
pending;
rejected;
disabled.

Model that where useful.

---

# 18. AFFILIATE CLICK

Track all monetizable outbound clicks.

Store:

* id
* anonymous session ID
* deal ID
* deal component
* provider
* affiliate program
* source
* campaign
* referrer
* clicked_at

Avoid unnecessary personal information.

---

# 19. CONVERSION

Design conversion storage from the start.

Fields:

* provider conversion ID
* click/sub ID if available
* provider
* program
* booking category
* deal
* booking value
* commission
* currency
* status
* created_at
* confirmed_at

Not every provider will provide conversion APIs initially.

Support:

API import;
CSV/manual import;
webhook;

depending on provider capabilities.

---

# 20. AFFILIATE SUB-ID TRACKING

Whenever supported, include our own tracking identifier in affiliate URLs.

Example:

sub_id:

dealId.component.source

or another compact identifier.

Goal:

connect:

Deal
→ Click
→ Provider
→ Booking
→ Revenue

without exposing personal information.

---

# 21. AFFILIATE REDIRECT SERVICE

Never scatter affiliate URLs through frontend components.

Create:

/go/{deal_id}/{component}

Example:

/go/812/flight

Flow:

Browser
→ our backend
→ validate deal
→ determine provider
→ record AffiliateClick
→ generate affiliate deep link
→ attach tracking/sub ID
→ HTTP 302 redirect

Benefits:

* centralized tracking;
* providers can change;
* campaign attribution;
* broken links can be disabled;
* monetization can be optimized later.

---

# 22. SAFE REDIRECTS

Prevent open redirect vulnerabilities.

Frontend must never send arbitrary external URL such as:

/go?url=https://anything.example

The server resolves allowed targets from trusted provider configuration.

---

# 23. DEAL DISCOVERY ENGINE

This is the core intellectual value.

Do not create a meaningless Deal Score.

Use explainable components.

Potential signals:

## Flight Price Advantage

Example:

current:

179 PLN

historical median:

420 PLN

discount:

57%.

## Accommodation Value

Cheap flights alone are not enough.

A destination with:

179 PLN flight

but

1800 PLN hotel

may be worse than another trip with:

300 PLN flight

400 PLN hotel.

## Total Trip Cost

Primary ranking should eventually use:

flight
+
hotel
+
major unavoidable costs.

## Practical dates

Examples:

Friday evening → Sunday

Thursday → Sunday

long weekends

holidays.

## Trip Duration

Different expectations for:

city break;

beach holiday;

week-long holiday.

## Travel inconvenience

Potential penalties:

* terrible flight times;
* overnight travel;
* excessive connections;
* airports very far from city;
* impractical trip duration.

## Data confidence

Price comparisons based on 100 observations are more trustworthy than comparisons based on 3 observations.

---

# 24. DEAL SCORE

Score:

0–100.

Keep individual components.

For example:

* flight_price_score
* hotel_price_score
* total_value_score
* historical_discount_score
* convenience_score
* confidence_score

Final:

deal_score

The exact weights should be configurable centrally.

Do not scatter coefficients throughout code.

Consumer explanation example:

> Dlaczego warto?
>
> Lot jest 46% tańszy niż zwykle.
> Noclegi są obecnie poniżej średniej.
> Cały wyjazd kosztuje około 31% mniej niż podobne terminy.

The score should be understandable without exposing mathematical clutter.

---

# 25. REAL DATA POLICY

Production must never fabricate travel prices.

Allowed:

test fixtures;
local development fixtures;
provider sandbox responses.

Not allowed:

random production offers;
invented hotel prices;
fake "normal price";
fake discounts.

If integration credentials are missing:

show configuration state;

do NOT silently use fake data.

---

# 26. DATA SOURCES WITHOUT AFFILIATE ACCESS

Important architectural distinction:

Travel data source and affiliate monetization source do not necessarily have to be the same provider.

Potential architecture:

PriceProvider
→ discovers/validates price

AffiliateProvider
→ generates monetizable booking link

Only do this where terms and data licensing permit it.

Do not assume we must receive both information and monetization from one API.

---

# 27. PROVIDER ADAPTERS

Create provider abstractions.

Conceptually:

TravelProvider

methods may include:

search()
get_offer()
normalize()
health_check()

AffiliateProviderAdapter

methods may include:

build_deep_link()
build_tracking_id()
parse_conversion()
get_capabilities()

Providers must not leak provider-specific schemas into core business logic.

---

# 28. PROVIDER EVALUATION

Before implementing a provider, investigate current requirements.

Document:

* affiliate availability;
* acceptance requirements;
* whether zero/low traffic is accepted;
* website requirement;
* API eligibility;
* deeplink capability;
* search API;
* rate limits;
* allowed markets;
* allowed promotional channels;
* prohibited marketing methods;
* cookie attribution window;
* conversion reporting;
* payout threshold;
* payout methods;
* commission model;
* API terms.

Never assume documentation from old blog posts is current.

If internet access is available, use official provider documentation.

---

# 29. PROVIDER REGISTRY

Maintain a provider matrix in documentation.

Example:

| Provider        | Affiliate | Deep link | Search API | Conversion API | Approval         |
| --------------- | --------- | --------- | ---------- | -------------- | ---------------- |
| Trip.com        | yes       | yes       | unknown    | unknown        | approved/pending |
| Travelpayouts X | yes       | yes       | ...        | ...            | ...              |
| DiscoverCars    | yes       | yes       | ...        | ...            | ...              |
| Omio            | pending   | pending   | later      | later          | requires review  |

Do not hardcode this exact example.

Generate it from actual investigation.

---

# 30. BACKGROUND JOBS

We need recurring processing.

Potential jobs:

* fetch flight offers;
* fetch hotel offers;
* expire stale offers;
* update historical prices;
* calculate route statistics;
* create deals;
* recalculate deal scores;
* verify top deals;
* publish featured deals;
* reconcile affiliate conversions.

Jobs must be:

idempotent;
retryable;
observable;
protected from duplicate execution.

Track:

status;
attempt;
started_at;
finished_at;
error;
next_retry_at.

---

# 31. MVP INFRASTRUCTURE

The initial deployment is expected to run on one Oracle Cloud VM.

Avoid premature distributed architecture.

Potential worker options:

PostgreSQL-backed queue;

lightweight Python worker;

Redis queue if justified.

Do NOT introduce:

Kafka;
Kubernetes;
service mesh;

for the first version.

Humanity can survive without them for a little while longer.

---

# 32. HOME PAGE

The home page must communicate value immediately.

Example hero:

> Znajdź tani wyjazd z Polski, nie tylko tani lot.

or similar polished Polish copy.

Main selector:

> Skąd lecisz?

Departure options.

Main filters:

* budget;
* dates;
* duration;
* weekend;
* warm destination;
* city break;
* beach;
* family.

Then:

> Najlepsze okazje teraz

Deal cards.

---

# 33. DEAL CARD

Show only useful information.

Potential structure:

Barcelona

Wrocław → Barcelona

18–21 Oct

3 nights

Flight:
179 zł

Hotel:
426 zł

Trip:
~657 zł/os.

-31% vs typical

Deal Score:
91

CTA:

Zobacz okazję

Avoid dashboard density.

---

# 34. DEAL PAGE

SEO-friendly URL.

Example:

/okazje/wroclaw-barcelona-18-21-pazdziernika

Sections:

## Summary

Destination

Dates

Origin

Total estimated cost

Price/person

Deal Score

## Why this is a good deal

Explain.

## Price breakdown

Flights

Accommodation

Transport

Optional activities

Clearly distinguish mandatory and optional costs.

## Flights

Real itinerary.

CTA:

Sprawdź lot

## Hotels

One or several useful options.

CTA:

Sprawdź hotel

## Extras

Activities
Car
Transfer

when applicable.

## Historical comparison

Simple.

Typical:

950 zł

Current:

657 zł

Difference:

-31%.

## Affiliate disclosure

Explain that:

booking occurs on partner sites;

prices can change;

the platform may earn commission;

affiliate commission does not imply we are the seller.

---

# 35. SEARCH AND EXPLORATION

Support:

departure airport;
budget;
month;
date range;
trip duration;
country;
destination;
trip category;
weekend;
warm weather later.

Create useful discovery routes such as:

/z/wroclaw

/z/krakow

/weekend-do-500

/weekend-do-1000

/city-break

/cieplo-zima

Do not automatically index every possible filter combination.

---

# 36. SEO IS PART OF THE MVP

Because the product starts with no traffic, SEO is not a later cosmetic feature.

It is one of the primary distribution channels.

Implement from the beginning:

SSR or equivalent indexable rendering;

title;

description;

canonical tags;

OpenGraph;

sitemap;

robots;

structured data where appropriate;

internal linking.

---

# 37. SEO PAGE QUALITY

Do not generate thousands of nearly identical pages.

Only index pages providing genuine value.

A useful origin page could contain:

* active deals;
* typical route prices;
* popular destinations;
* cheapest upcoming trips;
* useful airport information.

A useful destination page could contain:

* available deals;
* historical price ranges;
* best departure airports;
* typical trip cost;
* useful travel information.

---

# 38. INITIAL CONTENT STRATEGY

Before expecting affiliate approvals or SEO traffic, populate useful landing pages.

Initial target:

20–30 quality pages.

These may combine:

dynamic deal data

*

carefully structured editorial content.

Do not generate meaningless AI filler purely for SEO.

---

# 39. DISTRIBUTION ARCHITECTURE

Future traffic sources:

Google SEO

Telegram

Email

Web Push

Social media

Possibly WhatsApp.

Architecture should allow a deal to be distributed through multiple channels.

---

# 40. TELEGRAM

Design a publisher abstraction.

Example output:

🔥 Barcelona z Wrocławia

18–21.10

✈️ Lot: 179 zł
🏨 Nocleg: 426 zł

💰 Całość: ~657 zł/os.

📉 31% taniej niż zwykle

⭐ Deal Score: 91/100

[Zobacz ofertę]

Do not couple Telegram code to the scoring engine.

Concept:

Deal
→ Publication
→ Channel Adapter.

---

# 41. ALERTS

Future alerts:

> Notify me when a weekend trip from Wrocław under 700 PLN appears.

Criteria:

origin;
destination;
country;
budget;
date;
month;
duration;
deal score;
trip category.

Notification channels:

email;
Telegram;
web push.

Keep alerts out of the first critical path if they delay launch.

---

# 42. ANALYTICS

This is essential because we need to prove the business works.

Track:

sessions;
page views;
deal impressions;
deal views;
filter usage;
affiliate outbound clicks;
click source;
provider;
component;
affiliate conversions;
revenue.

Core funnel:

VISITOR
↓
DEAL VIEW
↓
AFFILIATE CLICK
↓
BOOKING
↓
COMMISSION

---

# 43. CORE BUSINESS METRICS

Calculate when data allows:

Deal CTR

Affiliate CTR

Booking conversion

Revenue/session

Revenue/affiliate click

Revenue/1000 sessions

Revenue/provider

Revenue/category

Revenue/deal

These matter more than vanity metrics.

---

# 44. INITIAL VALIDATION TARGET

Do not optimize for millions of visitors.

First business validation should answer:

Can we attract users?

Do they open deals?

Do they click booking links?

Do some affiliate clicks convert?

How much revenue does traffic generate?

For example:

1000 sessions

→ X deal views

→ Y affiliate clicks

→ Z bookings

→ N PLN commission.

This is the first meaningful proof of the model.

---

# 45. ADMIN

Create a protected lightweight admin area.

## Deals

list;
search;
status;
visibility;
featured;
score;
price components.

## Providers

approval status;
enabled;
capabilities;
last successful integration check;
latest error.

## Affiliate Programs

pending;
approved;
rejected;
disabled.

## Jobs

type;
status;
duration;
attempts;
errors.

## Analytics

top deals;
top outbound links;
provider CTR;
basic revenue reporting.

Do not waste excessive development effort on admin visuals.

---

# 46. CURRENCY

Display:

PLN.

Providers may return:

EUR;
USD;
GBP;
PLN;
etc.

Store:

original amount;
original currency;
normalized PLN amount;
exchange rate;
conversion timestamp.

Centralize currency conversion.

---

# 47. TIME ZONES

Do not use naive datetimes.

Preserve:

UTC timestamp

and relevant airport/destination timezone semantics.

Travel time bugs are impressively boring and still manage to destroy systems, so handle them correctly from the start.

---

# 48. TECH STACK

Unless repository reality dictates otherwise:

Backend:

Python 3.12+
FastAPI
SQLAlchemy 2
Alembic
Pydantic
PostgreSQL

Frontend:

Next.js
TypeScript
React

Database:

PostgreSQL 16+

Infrastructure:

Docker
Docker Compose

Add Redis only if justified.

---

# 49. REPOSITORY

Preferred:

/apps
/api
/web

/libs

/infrastructure

/docs

/scripts

Respect existing repository conventions if they are already sensible.

---

# 50. BACKEND ARCHITECTURE

Separate:

API

application services

domain

repositories

provider integrations

affiliate adapters

jobs/workers

Do not put business logic in HTTP route handlers.

Deal scoring must be independently testable.

---

# 51. API

Potential endpoints:

GET /api/v1/deals

GET /api/v1/deals/{slug}

GET /api/v1/airports

GET /api/v1/destinations

GET /api/v1/search

GET /api/v1/departures/{airport}/deals

GET /go/{deal_id}/{component}

Admin endpoints separately protected.

Later:

POST /api/v1/alerts

Use pagination.

---

# 52. SECURITY

Implement:

environment secrets;
input validation;
safe redirects;
explicit CORS;
secure admin authentication;
secure cookies;
rate limiting where appropriate;
SQL injection protection;
security headers.

Never commit real credentials.

Provide:

.env.example

---

# 53. GDPR AND AFFILIATE DISCLOSURE

The service targets EU users.

Implement privacy-first architecture.

Minimize personal data.

Prepare:

Privacy Policy

Cookie Policy

Terms

Affiliate Disclosure

Affiliate relationships must be visible and understandable.

Do not hide commercial relationships.

---

# 54. OBSERVABILITY

Structured logging.

Useful fields:

request ID;
job ID;
provider;
deal ID;
execution time.

Health endpoints:

/health

/health/ready

Provider problems must not crash the entire site.

---

# 55. PROVIDER FAILURE

If Trip.com is temporarily unavailable:

existing fresh-enough deals from other sources should remain usable.

If an affiliate link cannot be generated:

do not show a broken booking CTA.

If provider credentials expire:

admin should make the problem visible.

Graceful degradation is required.

---

# 56. DEAL FRESHNESS

Travel prices expire rapidly.

Track:

fetched_at

last_verified_at

expires_at

A stale deal should be:

revalidated;

hidden;

or clearly marked.

Never present an old price as current without qualification.

---

# 57. HISTORICAL PRICE MODEL

Initial baseline may be relatively simple.

But architecture must support future segmentation by:

route;
destination;
trip duration;
season;
weekday;
booking lead time;
travel month.

Document algorithm limitations.

Do not pretend statistical confidence that does not exist.

---

# 58. TESTING

Unit tests:

deal score;
price calculations;
currency;
normalization;
affiliate URLs;
redirect security.

Integration tests:

deal API;
database operations;
provider adapters;
job lifecycle;
click tracking.

Critical E2E:

Homepage
→ select Wrocław
→ open deal
→ inspect total
→ click flight
→ AffiliateClick saved
→ redirected to approved provider.

---

# 59. ORACLE CLOUD VM

Production must initially run on a single Oracle Cloud VM.

Proposed architecture:

Internet
↓
Caddy
↓
Next.js
↓
FastAPI

plus:

worker

PostgreSQL

optional Redis.

Use Docker Compose.

Do not expose PostgreSQL to the public Internet.

Externally expose:

80
443

SSH separately controlled through OCI network/security configuration.

---

# 60. HTTPS

Prepare:

domain
→ Oracle VM
→ Caddy
→ automatic TLS.

Do not hardcode production IPs.

---

# 61. DATABASE BACKUP

Provide:

scheduled pg_dump;

compression;

retention;

restore instructions.

Later support upload to OCI Object Storage or another backup target.

Document restoration.

A backup script nobody has tested is merely an emotional-support shell script.

---

# 62. CI

Prepare CI for:

lint;
type checks;
tests;
build.

Later deployment:

GitHub
→ CI
→ Oracle VM
→ pull/update
→ migrations
→ restart
→ health check.

Do not introduce automated production deployment before basic production stability.

---

# 63. MVP PHASE 0 — REPOSITORY AND BUSINESS DISCOVERY

Before writing code:

inspect repository.

Investigate:

current architecture;

existing code;

existing infrastructure;

candidate affiliate providers;

candidate data providers.

Deliver:

architecture proposal;

provider matrix;

database design;

implementation plan.

DO NOT modify files during this phase.

---

# 64. MVP PHASE 1 — PRODUCT FOUNDATION

Implement:

backend foundation;

frontend foundation;

PostgreSQL;

migrations;

Airport;

Destination;

Provider;

AffiliateProgram;

basic admin/provider status;

Docker Compose.

Result:

system boots correctly from a clean environment.

---

# 65. MVP PHASE 2 — FIRST REAL DATA SOURCE

Integrate ONE legitimate source of real travel data.

Prefer flight data because it is central to discovery.

Do not wait for every desired provider.

Store:

offers;

price observations;

freshness metadata.

Result:

real prices exist in PostgreSQL.

---

# 66. MVP PHASE 3 — PRICE HISTORY

Implement:

PriceHistory;

route statistics;

basic baseline price;

historical median;

sample count;

confidence.

Result:

system can distinguish:

cheap

from

merely available.

---

# 67. MVP PHASE 4 — DEAL ENGINE

Create:

Deal;

total trip calculation;

initial Deal Score;

deal explanation;

expiration.

At first, if hotel data is not available, distinguish:

flight deal

from

full trip deal.

Do NOT invent hotel costs.

---

# 68. MVP PHASE 5 — PUBLIC WEBSITE

Build:

homepage;

origin pages;

deal list;

deal page;

filters;

destination pages;

mobile layout.

Use real database data.

Result:

a useful website exists even before meaningful traffic.

---

# 69. MVP PHASE 6 — AFFILIATE BOOTSTRAP

Integrate the FIRST approved affiliate provider.

Do NOT block this phase waiting for all partners.

Implement:

provider config;

affiliate deeplink generation;

/go redirect;

AffiliateClick;

sub-ID tracking.

Potential initial provider:

Trip.com or another actually approved partner.

Result:

real visitors can generate monetizable clicks.

---

# 70. MVP PHASE 7 — SECOND MONETIZATION SOURCE

Add the next approved provider.

Potential candidates:

Travelpayouts program;

DiscoverCars;

another hotel/travel provider.

Result:

one trip can potentially have several monetizable components.

---

# 71. MVP PHASE 8 — ACCOMMODATION

Integrate real accommodation data.

Then evolve:

flight deal

into:

trip deal.

Calculate:

flight

*

hotel

=

core trip cost.

Result:

the product differentiates itself from simple cheap-flight feeds.

---

# 72. MVP PHASE 9 — SEO FOUNDATION

Implement:

metadata;

sitemap;

origin pages;

destination pages;

internal links;

index controls;

structured data where appropriate.

Populate at least 20–30 genuinely useful URLs/pages.

Result:

site is credible enough for:

users;

search engines;

affiliate partner reviews.

---

# 73. MVP PHASE 10 — ANALYTICS

Implement:

sessions;

deal views;

outbound clicks;

provider metrics;

conversion model;

revenue model.

Result:

we can measure the business funnel.

---

# 74. MVP PHASE 11 — AFFILIATE EXPANSION

After site launch and initial traffic:

apply to providers requiring stronger projects.

Examples:

additional Travelpayouts programs;

Omio;

advanced GetYourGuide integration;

other hotel networks.

Record:

application;

review;

approval/rejection.

Rejected programs should remain easy to retry later.

---

# 75. MVP PHASE 12 — DISTRIBUTION

Add:

Telegram publication.

Potential next:

email;

web push.

Automatically identify high-quality deals that are candidates for publication.

Human approval may remain initially.

---

# 76. MVP PHASE 13 — ORACLE VM DEPLOYMENT

Deploy:

Caddy;

web;

API;

worker;

PostgreSQL;

persistent volumes;

backup;

health monitoring.

Document the complete deployment.

---

# 77. WHAT NOT TO BUILD YET

Do NOT build:

mobile apps;

microservices;

Kafka;

Kubernetes;

complex machine learning;

LLM recommendations everywhere;

social networking;

full travel booking;

full CMS;

Germany;

France;

complex loyalty program.

Validate Poland first.

---

# 78. FUTURE: GERMANY AND FRANCE

The domain model must support additional markets.

Do not encode:

Poland

PLN

Polish airports

Polish text

inside core business logic.

Future expansion may include:

Germany

France.

But market expansion happens only after:

product usage;

traffic;

affiliate clicks;

and monetization

are proven.

---

# 79. FUTURE PERSONALIZATION

Design for later:

preferred airport;

budget;

travelers;

children;

trip duration;

destination types;

notification preferences.

Authentication should not be required for browsing.

---

# 80. FUTURE DEAL SEARCH

Eventually support queries conceptually like:

> Mam 800 zł. Gdzie mogę polecieć?

> Dowolny weekend w listopadzie.

> Chcę minimum 20°C.

> 2 dorosłych + 2 dzieci.

Do not implement all of this in initial MVP.

---

# 81. STRATEGIC MOAT

Affiliate links are NOT our moat.

Long-term advantage should be:

PRICE HISTORY

*

DEAL DISCOVERY

*

AUTOMATION

*

TOTAL TRIP COST

*

DATA

*

DISTRIBUTION

*

USER TRUST.

Any competitor can create a referral link.

Our product must become better because every day it collects more useful historical pricing information.

---

# 82. DEFINITION OF BUSINESS MVP

The first business MVP is ready when:

I can open the real deployed website.

I can select Wrocław.

I can see real current travel data.

I can open a deal.

I can understand:

where;
when;
flight price;
trip cost where available;
why it is cheap.

I can click:

Sprawdź lot

and be routed through:

our tracked redirect

→ real approved affiliate provider.

The database records the click.

Background ingestion updates prices.

Deals expire correctly.

The website has useful indexable pages.

Provider approval status is visible in admin.

The same application can run on Oracle Cloud VM.

No fake production travel prices are involved.

---

# 83. DEFINITION OF BUSINESS VALIDATION

After deployment we want to measure:

Sessions

→ Deal views

→ Affiliate clicks

→ Conversions

→ Revenue.

The key business question is not:

> Does the application work?

It is:

> Does user traffic create profitable affiliate conversions?

Eventually calculate:

Revenue per 1000 sessions.

This will determine whether to:

increase SEO investment;

build Telegram distribution;

run paid acquisition;

add providers;

expand to Germany/France.

---

# 84. IMPLEMENTATION RULES FOR THE CODING AGENT

Do not generate hundreds of files immediately.

Do not blindly implement the entire specification.

First inspect.

Then propose.

Then implement in phases.

For each phase:

1. inspect relevant code;
2. explain intended change;
3. implement the smallest coherent scope;
4. run tests;
5. run lint;
6. run type checks;
7. inspect failures;
8. fix them;
9. verify behavior;
10. summarize implementation.

Do not rewrite unrelated working code.

---

# 85. EXTERNAL INTEGRATION RULE

Never pretend an external integration works.

If credentials or approval are missing:

implement:

adapter;
interfaces;
configuration;
tests using fixtures;

and mark:

PENDING_EXTERNAL_CONFIGURATION.

Never substitute fake production responses.

---

# 86. FIRST PROVIDER RULE

Do not spend weeks searching for the perfect travel provider.

We need the first technically and commercially viable provider.

Optimize initially for:

ability to launch;

real pricing data;

affiliate access;

Polish market relevance;

reasonable integration quality.

Provider diversification comes later.

---

# 87. DESIGN

Consumer travel product.

Mobile-first.

Friendly.

Clear.

Trustworthy.

Avoid:

enterprise dashboards;

huge gradients;

meaningless charts;

fake social proof;

fake counters;

information overload.

Use imagery effectively but legally.

Destination photography should make deals emotionally understandable without overwhelming pricing information.

---

# 88. DEAL TRUST

Clearly display:

last checked time;

price volatility warning;

estimated vs exact price;

affiliate disclosure.

Example:

> Cena sprawdzona 18 min temu.
> Może ulec zmianie u partnera.

Trust is more important than pretending prices never move.

---

# 89. DOCUMENTATION

Maintain:

README.md

docs/architecture.md

docs/data-model.md

docs/providers.md

docs/provider-capabilities.md

docs/affiliate-onboarding.md

docs/deal-scoring.md

docs/price-history.md

docs/affiliate-tracking.md

docs/seo.md

docs/local-development.md

docs/oracle-vm-deployment.md

docs/operations.md

Documentation must reflect reality.

---

# 90. FIRST ACTION

Do not modify files yet.

Inspect the complete repository.

Then return:

1. Current repository analysis.
2. Existing reusable components.
3. Missing components.
4. Recommended system architecture.
5. Proposed database schema and relationships.
6. Provider abstraction design.
7. Affiliate provider/program/capability model.
8. Current provider candidates for a zero-traffic project.
9. Which integrations can reasonably be attempted immediately.
10. Which integrations should wait for traffic/approval.
11. Data acquisition strategy.
12. Deal scoring strategy.
13. SEO/bootstrap strategy for the first 20–30 useful pages.
14. Analytics/conversion architecture.
15. Phased implementation roadmap.
16. Expected files/modules to add or modify.
17. External credentials/accounts eventually required.
18. Risks and unknowns.
19. Definition of the first deployable MVP.
20. Oracle Cloud VM production architecture.

The plan must explicitly distinguish:

DATA PROVIDER

from

AFFILIATE PROVIDER

and distinguish:

AFFILIATE LINK ACCESS

from

API ACCESS.

Do not make implementation dependent on affiliate programs that we are not yet approved for.

The first objective is:

BUILD A REAL USEFUL PRODUCT
→ CONNECT THE FIRST AVAILABLE AFFILIATE PROVIDER
→ DEPLOY
→ GET FIRST TRAFFIC
→ MEASURE CLICKS
→ MEASURE BOOKINGS
→ MEASURE REVENUE
→ ITERATE.

Only after presenting this analysis and plan should implementation begin.
