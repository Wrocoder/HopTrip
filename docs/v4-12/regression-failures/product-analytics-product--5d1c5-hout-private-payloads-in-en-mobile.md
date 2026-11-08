# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product-analytics.spec.ts >> product taxonomy follows real actions without private payloads in en
- Location: tests\product-analytics.spec.ts:40:56

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f5e1]:
  - link "Skip to content" [ref=f5e2] [cursor=pointer]:
    - /url: "#content"
  - banner [ref=f5e3]:
    - link "HopTrip — home" [ref=f5e4] [cursor=pointer]:
      - /url: /en
      - generic [aria-hidden] [ref=f5e5]: ↗
      - text: HopTrip
      - generic [aria-hidden] [ref=f5e6]: .
    - navigation "Main navigation" [ref=f5e7]:
      - link "Cheap flights" [ref=f5e8] [cursor=pointer]:
        - /url: /en/deals
      - link "Weekends" [ref=f5e9] [cursor=pointer]:
        - /url: /en/tanie-loty-na-weekend
      - link "Destinations" [ref=f5e10] [cursor=pointer]:
        - /url: /en/destinations
      - link "Saved" [ref=f5e11] [cursor=pointer]:
        - /url: /en/saved
      - link "Budget calculator" [ref=f5e12] [cursor=pointer]:
        - /url: /en/info/trip-budget
    - navigation "Language" [ref=f5e13]:
      - link "Polski" [ref=f5e14] [cursor=pointer]:
        - /url: /deals/browser-13
      - link "Русский" [ref=f5e15] [cursor=pointer]:
        - /url: /ru/deals/browser-13
      - link "English" [ref=f5e16] [cursor=pointer]:
        - /url: /en/deals/browser-13
      - link "Українська" [ref=f5e17] [cursor=pointer]:
        - /url: /uk/deals/browser-13
  - main [ref=f5e19]:
    - link "← Current deals" [ref=f5e20] [cursor=pointer]:
      - /url: /en/deals
    - article [ref=f5e21]:
      - generic [ref=f5e22]:
        - paragraph [ref=f5e23]: Return flight
        - heading [level=1] [ref=f5e24]:
          - text: Wrocław (WRO) → Barcelona
          - img "Spain" [ref=f5e25]
        - paragraph [ref=f5e26]: "Departure dates: Tue, 8 Dec 2026 – Fri, 11 Dec 2026"
        - paragraph [ref=f5e27]: "Nights at destination: 3 (estimated) of planned stay — check accommodation dates separately."
      - navigation "Trip plan sections" [ref=f5e28]:
        - link "Flight and booking" [ref=f5e29] [cursor=pointer]:
          - /url: "#trip-flight"
        - link "Accommodation and activities" [ref=f5e30] [cursor=pointer]:
          - /url: "#trip-stay"
        - link "Total trip budget" [ref=f5e31] [cursor=pointer]:
          - /url: "#calculator"
        - link "Save and share" [ref=f5e32] [cursor=pointer]:
          - /url: "#trip-save"
      - region "Flight and booking" [ref=f5e33]:
        - generic [ref=f5e34]:
          - region "Flight price" [ref=f5e35]:
            - paragraph [ref=f5e36]: per person · PLN
            - paragraph [ref=f5e37]:
              - text: PLN 213.00
              - 'generic "Approximately €48. NBP average rate on Fri, 6 Nov 2026: EUR 1 = PLN 4.3925. The payment exchange rate may differ." [ref=f5e38]':
                - generic [aria-hidden] [ref=f5e39]: ≈ €48
              - generic [ref=f5e41]: per person · return
            - generic [ref=f5e42]:
              - paragraph [ref=f5e43]:
                - text: "Recorded observation time:"
                - time [ref=f5e44]: Sun, 8 Nov 2026, 18:25
                - text: (Poland time).
              - paragraph [ref=f5e45]: Check availability and the final price with the partner. Not verified live.
              - group [ref=f5e46]:
                - generic "Price origin and catalogue expiry" [ref=f5e47] [cursor=pointer]
            - paragraph [ref=f5e48]:
              - strong [ref=f5e49]: No reliable historical comparison for this price.
            - heading "Flight details" [level=2] [ref=f5e50]
            - generic [ref=f5e51]:
              - note [ref=f5e52]:
                - strong [ref=f5e53]: Partial flight details
                - paragraph [ref=f5e54]: Some flight times are unknown.
                - group [ref=f5e55]:
                  - generic "Which details need checking?" [ref=f5e56]
                - paragraph [ref=f5e57]: Data completeness does not confirm availability with the seller.
              - paragraph [ref=f5e58]:
                - strong [ref=f5e59]: Departure
                - text: "· 8 Dec: WRO 11:00 → BCN 13:00 · est."
                - generic [ref=f5e60]: Non-stop
              - paragraph [ref=f5e61]:
                - strong [ref=f5e62]: Return
                - text: "· 11 Dec: BCN 11:00 → WRO time unknown"
                - generic [ref=f5e63]: "Connections: 1"
              - paragraph [ref=f5e64]:
                - strong [ref=f5e65]: Return arrival day and time need confirmation.
              - paragraph [ref=f5e66]: "Leave requirements: to be confirmed"
              - paragraph [ref=f5e67]: "Trip convenience index (model): 17/100 · incomplete data"
              - generic [ref=f5e69]:
                - paragraph [ref=f5e70]:
                  - strong [ref=f5e71]: Return connection
                - list [ref=f5e72]:
                  - listitem [ref=f5e73]: Connection details are not confirmed. Check times, airports and transfer conditions with the partner.
              - paragraph [ref=f5e74]: "Between arrival and return departure: 70 h 0 min (estimate) · BCN → BCN. City time unknown."
              - paragraph [ref=f5e75]: Local times · Estimated arrival
              - paragraph [ref=f5e77]: Transfer time and cost unknown — check transport for your travel date.
              - paragraph [ref=f5e78]: "Departure: Ryanair (FR) · Return: Check the return airline"
            - paragraph [ref=f5e79]: The price covers the flight. Accommodation is not included. Check baggage allowance
            - group [ref=f5e80]:
              - generic "Full flight details and baggage" [ref=f5e81] [cursor=pointer]
          - region [ref=f5e82]:
            - heading "Continue to partner" [level=2] [ref=f5e83]
            - generic [ref=f5e84]: Affiliate partnerships
            - generic [ref=f5e85]:
              - paragraph [ref=f5e86]:
                - text: PLN 213.00
                - 'generic "Approximately €48. NBP average rate on Fri, 6 Nov 2026: EUR 1 = PLN 4.3925. The payment exchange rate may differ." [ref=f5e87]':
                  - generic [aria-hidden] [ref=f5e88]: ≈ €48
                - generic [ref=f5e90]: per person · return
              - status [ref=f5e91]:
                - paragraph [ref=f5e92]: A booking link is not available yet.
                - link "Back to the flight catalog" [ref=f5e93] [cursor=pointer]:
                  - /url: /en/deals
            - paragraph [ref=f5e94]: "Affiliate link: we may earn a commission after a booking. We do not sell tickets."
        - generic [ref=f5e95]:
          - heading "Price compared with history" [level=2] [ref=f5e96]
          - generic [ref=f5e97]:
            - group "Price compared with history" [ref=f5e98]:
              - paragraph [ref=f5e99]:
                - strong [ref=f5e100]: No reliable historical comparison for this price.
              - paragraph [ref=f5e101]: Observation count unknown. No sufficient, comparable reference data.
              - paragraph [ref=f5e102]:
                - text: "Recorded observation time:"
                - time [ref=f5e103]: Sun, 8 Nov 2026, 18:25
                - text: (time in Poland). Time source unknown.
              - paragraph [ref=f5e104]: Check availability and the final price with the partner. Not verified live.
            - paragraph [ref=f5e105]: We score the price offer using recorded data. The score does not rate the airline, comfort or purchase probability.
            - paragraph [ref=f5e106]: Complete data consistent with the displayed price are missing. We cannot reliably reconstruct the comparison or points. The offer needs recalculation.
            - link "Full price comparison methodology →" [ref=f5e107] [cursor=pointer]:
              - /url: /en/info/price-comparison
      - region [ref=f5e108]:
        - heading "Accommodation and activities" [level=2] [ref=f5e109]
        - region [ref=f5e110]:
          - heading "Find accommodation — Barcelona" [level=2] [ref=f5e111]
          - paragraph [ref=f5e112]: Book accommodation separately from the flight. Stay dates and adults are shared with the budget; flight dates stay unchanged.
          - paragraph [ref=f5e113]: Choose stay dates separately from flight dates. Check the local arrival and return departure dates.
          - complementary "Local dates from the schedule:" [ref=f5e114]:
            - paragraph [ref=f5e115]:
              - strong [ref=f5e116]: "Local dates from the schedule:"
              - text: arrival
              - time [ref=f5e117]: Tue, 8 Dec 2026
              - text: · return departure
              - time [ref=f5e118]: Fri, 11 Dec 2026
            - paragraph [ref=f5e119]: Arrival was calculated from flight duration. Confirm the date and schedule with the partner.
            - paragraph [ref=f5e120]: You can edit the dates; check transfers and check-in times.
          - group [ref=f5e121]:
            - generic "How to match accommodation dates to flights?" [ref=f5e122] [cursor=pointer]
          - group "Stay dates and adults" [ref=f5e123]:
            - generic [ref=f5e125]:
              - generic [ref=f5e126]:
                - generic [ref=f5e127]: Check-in
                - textbox "Check-in" [ref=f5e128]: 2026-12-08
              - generic [ref=f5e129]:
                - generic [ref=f5e130]: Check-out
                - textbox "Check-out" [ref=f5e131]: 2026-12-11
              - generic [ref=f5e132]:
                - generic [ref=f5e133]: Adults
                - spinbutton "Adults" [ref=f5e134]: "1"
          - generic [ref=f5e135]:
            - paragraph [ref=f5e136]:
              - strong [ref=f5e137]: Barcelona
              - text: ": Tue, 8 Dec 2026 – Fri, 11 Dec 2026 · 3 nights · adults: 1."
            - link "Find accommodation via Stay22 (new tab)" [ref=f5e138] [cursor=pointer]:
              - /url: https://www.stay22.com/allez/roam?aid=hoptrip&address=Barcelona&checkin=2026-12-08&checkout=2026-12-11&adults=1&campaign=hoptrip_accommodation&lang=pl&currency=PLN
          - paragraph [ref=f5e139]: Check accommodation prices and availability in Stay22. HopTrip does not retrieve a quote; budget amounts are entered manually.
          - paragraph [ref=f5e140]: Affiliate link — we may earn a commission. We send adults only; set children and their ages with the partner. Check dates, guests, price and cancellation terms.
          - group [ref=f5e141]:
            - generic "How to add accommodation costs to the plan?" [ref=f5e142] [cursor=pointer]
          - link "Add accommodation costs to the trip budget" [ref=f5e143] [cursor=pointer]:
            - /url: "#budget-hotel-basis"
        - region [ref=f5e144]:
          - paragraph [ref=f5e145]: Ideas for your stay · Barcelona
          - heading "Museums and attractions" [level=2] [ref=f5e146]
          - paragraph [ref=f5e147]: Tickets are purchased separately. Check availability for your travel dates with the seller or on the attraction’s official website.
          - list [ref=f5e148]:
            - listitem [ref=f5e149]:
              - generic [ref=f5e150]: Architecture
              - heading "Casa Batlló — Blue Ticket" [level=3] [ref=f5e151]
              - paragraph [ref=f5e152]: Interiors of the house designed by Gaudí, an audio guide and the Gaudí Cube space.
              - paragraph [ref=f5e153]:
                - strong [ref=f5e154]: "Who it suits:"
                - text: For those interested in Gaudí architecture and sightseeing with an audio guide.
              - paragraph [ref=f5e155]:
                - strong [ref=f5e156]: "Visit duration:"
                - text: About 1 hour for the Blue option, excluding travel and waiting for entry.
              - paragraph [ref=f5e157]: The Blue variant does not include a rooftop terrace, VR tablet or entry without queue. Check the time of entry and the audio guide language.
              - generic [ref=f5e158]:
                - paragraph [ref=f5e159]: Check the price at Tiqets
                - paragraph [ref=f5e160]: Affiliate link — we may receive a commission for a purchase.
                - 'link "Check dates and price at Tiqets: Casa Batlló — Blue Ticket (new tab)" [ref=f5e161] [cursor=pointer]':
                  - /url: https://tiqets.tpx.gr/JikjB3NX
                  - text: Check dates and price
                - paragraph [ref=f5e162]:
                  - link "Source for visit duration (new tab)" [ref=f5e163] [cursor=pointer]:
                    - /url: https://www.casabatllo.es/en/visit/faqs/
            - listitem [ref=f5e164]:
              - generic [ref=f5e165]: Aquarium
              - heading "Aquarium Barcelona — admission ticket" [level=3] [ref=f5e166]
              - paragraph [ref=f5e167]: "The marine world in Port Vell: aquariums and exhibitions dedicated to underwater life."
              - paragraph [ref=f5e168]:
                - strong [ref=f5e169]: "Who it suits:"
                - text: For families and anyone interested in marine wildlife; an indoor visit option.
              - paragraph [ref=f5e170]:
                - strong [ref=f5e171]: "Visit duration:"
                - text: Approximately 1.5–2 hours for the visit, excluding travel and queues.
              - paragraph [ref=f5e172]: Check the date of the visit, the opening hours and the rules for children's tickets.
              - generic [ref=f5e173]:
                - paragraph [ref=f5e174]: Check the price at Tiqets
                - paragraph [ref=f5e175]: Affiliate link — we may receive a commission for a purchase.
                - 'link "Check dates and price at Tiqets: Aquarium Barcelona — admission ticket (new tab)" [ref=f5e176] [cursor=pointer]':
                  - /url: https://tiqets.tpx.gr/ALlisode
                  - text: Check dates and price
                - paragraph [ref=f5e177]:
                  - link "Source for visit duration (new tab)" [ref=f5e178] [cursor=pointer]:
                    - /url: https://thisisbarcelona.com/tickets/barcelona-aquarium
            - listitem [ref=f5e179]:
              - generic [ref=f5e180]: Nature · free admission
              - heading "Hivernacle — orangery in Ciutadella Park" [level=3] [ref=f5e181]
              - paragraph [ref=f5e182]: Historic orangery with plant collections in Ciutadella Park.
              - paragraph [ref=f5e183]:
                - strong [ref=f5e184]: "Who it suits:"
                - text: For plant lovers and a peaceful walk among greenery.
              - paragraph [ref=f5e185]: Free admission covers an independent visit. Check opening hours and closures; guided tours have separate rules and bookings.
              - generic [ref=f5e186]:
                - paragraph [ref=f5e187]: "Independent visit: free admission according to the official website."
                - 'link "Check visiting rules: Hivernacle — orangery in Ciutadella Park (new tab)" [ref=f5e188] [cursor=pointer]':
                  - /url: https://museuciencies.cat/en/the-nat/venues/hivernacle/useful-information/
                  - text: Check visiting rules
          - paragraph [ref=f5e189]: Attraction costs are not included in the flight price. Before buying, check ticket inclusions, discounts and cancellation terms. Allow for flights and transfers on travel days.
          - paragraph [ref=f5e190]: Changes to dates and travellers in your plan are not automatically passed through this link. Check the date, participants and price with the partner.
          - paragraph [ref=f5e191]: Descriptions and rules checked on Mon, 12 Oct 2026. This is a source review, not confirmation of ticket availability for your travel dates.
          - paragraph [ref=f5e192]: Enter the total cost of selected attractions in PLN per person for the whole stay. If ticket prices differ, use the average per person. Free admission alone does not mean transport costs are zero.
          - link "Include attractions in your budget" [ref=f5e193] [cursor=pointer]:
            - /url: "#calculator"
        - region [ref=f5e194]:
          - generic [ref=f5e195]:
            - generic [ref=f5e196]:
              - heading "Events during your trip" [level=2] [ref=f5e197]
              - paragraph [ref=f5e198]: Concerts, sport and culture in your destination. Event tickets are purchased separately.
            - generic [ref=f5e199]: Ticketmaster
          - paragraph [ref=f5e200]:
            - generic [ref=f5e201]: Your stay · Barcelona
            - strong [ref=f5e202]: 8 Dec 2026 – 11 Dec 2026
          - generic [ref=f5e203]:
            - strong [ref=f5e204]: Trip dates
            - button "Other dates" [ref=f5e205] [cursor=pointer]
          - paragraph [ref=f5e206]: Dates are shared with accommodation and your budget. Changes refresh events automatically. These are plan dates; check them against your flight schedule.
          - generic [ref=f5e207]:
            - generic [ref=f5e208]:
              - text: From
              - textbox "From" [ref=f5e209]: 2026-12-08
            - generic [ref=f5e210]:
              - text: To
              - textbox "To" [ref=f5e211]: 2026-12-11
            - generic [ref=f5e212]:
              - text: Category
              - combobox "Category" [ref=f5e213]:
                - option "All" [selected]
                - option "Music"
                - option "Sport"
                - option "Culture"
                - option "Other"
            - button "Find events" [ref=f5e214] [cursor=pointer]
          - generic [ref=f5e216]:
            - text: Flight compatibility
            - combobox "Flight compatibility" [ref=f5e217]:
              - option "All events" [selected]
              - option "May fit the flight"
          - paragraph [ref=f5e218]: May fit hides only definite flight conflicts. Events with little margin or missing information remain visible. Airport procedures and travel to the venue need checking; attendance is not guaranteed.
          - generic [ref=f5e219]:
            - generic [ref=f5e220]:
              - text: Browse days
              - combobox "Browse days" [ref=f5e221]:
                - option "All days" [selected]
                - option "Tue 8 Dec"
                - option "Wed 9 Dec"
                - option "Thu 10 Dec"
                - option "Fri 11 Dec"
            - button "Previous day" [disabled] [ref=f5e222]: ←
            - button "Next day" [ref=f5e223] [cursor=pointer]: →
          - status [ref=f5e224]:
            - paragraph [ref=f5e225]:
              - text: "Events shown:"
              - strong [ref=f5e226]: "3"
              - text: · All days · Local time
          - group [ref=f5e227]:
            - generic "Flight schedule compatibility" [ref=f5e228] [cursor=pointer]
          - list [ref=f5e229]:
            - listitem [ref=f5e230]:
              - generic [ref=f5e231]:
                - generic [ref=f5e232]: Music
                - generic [aria-hidden] [ref=f5e233]: 8 Dec
              - heading "Synthetic concert" [level=3] [ref=f5e234]
              - paragraph [ref=f5e235]: Synthetic venue · Barcelona
              - paragraph [ref=f5e236]:
                - time [ref=f5e237]: 8 Dec 2026
                - text: · 20:00
              - paragraph [ref=f5e238]: "Event time zone: Europe/Madrid"
              - paragraph [ref=f5e239]: Source lists tickets on sale — check availability
              - note "Flight schedule compatibility" [ref=f5e240]:
                - paragraph [ref=f5e241]:
                  - strong [ref=f5e242]: Flight compatibility has not been checked
                - paragraph [ref=f5e243]: Duration is unknown.
              - paragraph [ref=f5e244]: Check price with the seller
              - 'link "Check dates and price: Synthetic concert. Opens in a new tab" [active] [ref=f5e245] [cursor=pointer]':
                - /url: https://ticketmaster.evyy.net/synthetic?private=private-ticket-secret
                - text: Check dates and price
                - generic [aria-hidden] [ref=f5e246]: ↗
              - generic [ref=f5e247]:
                - 'button "Add to plan: Synthetic concert" [disabled] [ref=f5e248]': Add to plan
                - paragraph [ref=f5e249]: "This ticket cannot be saved: details are incomplete or its link needs checking."
            - listitem [ref=f5e250]:
              - generic [ref=f5e251]:
                - generic [ref=f5e252]: Music
                - generic [aria-hidden] [ref=f5e253]: 8 Dec
              - heading "Synthetic variants" [level=3] [ref=f5e254]
              - paragraph [ref=f5e255]: Synthetic venue · Barcelona
              - paragraph [ref=f5e256]:
                - time [ref=f5e257]: 8 Dec 2026
                - text: · 20:00
              - paragraph [ref=f5e258]: "Event time zone: Europe/Madrid"
              - paragraph [ref=f5e259]: Source lists tickets on sale — check availability
              - paragraph [ref=f5e260]: Same date and start time. Flight assessment considers all options; check what your chosen ticket includes.
              - note "Flight schedule compatibility" [ref=f5e261]:
                - paragraph [ref=f5e262]:
                  - strong [ref=f5e263]: Flight compatibility has not been checked
                - paragraph [ref=f5e264]: Duration is unknown.
              - generic [ref=f5e265]:
                - heading "Ticket options" [level=4] [ref=f5e266]
                - list [ref=f5e267]:
                  - listitem [ref=f5e268]:
                    - paragraph [ref=f5e269]:
                      - strong [ref=f5e270]: Main offer
                    - paragraph [ref=f5e271]: Synthetic standard
                    - paragraph [ref=f5e272]: Check price with the seller
                    - 'link "Check dates and price: Synthetic standard (Main offer). Opens in a new tab" [ref=f5e273] [cursor=pointer]':
                      - /url: https://ticketmaster.evyy.net/synthetic?private=private-ticket-secret
                      - text: Check dates and price
                      - generic [aria-hidden] [ref=f5e274]: ↗
                    - generic [ref=f5e275]:
                      - 'button "Add to plan: Synthetic standard" [disabled] [ref=f5e276]': Add to plan
                      - paragraph [ref=f5e277]: "This ticket cannot be saved: details are incomplete or its link needs checking."
            - listitem [ref=f5e278]:
              - generic [ref=f5e279]:
                - generic [ref=f5e280]: Music
                - generic [aria-hidden] [ref=f5e281]: 8 Dec
              - heading "Synthetic cancelled" [level=3] [ref=f5e282]
              - paragraph [ref=f5e283]: Synthetic venue · Barcelona
              - paragraph [ref=f5e284]:
                - time [ref=f5e285]: 8 Dec 2026
                - text: · 20:00
              - paragraph [ref=f5e286]: "Event time zone: Europe/Madrid"
              - paragraph [ref=f5e287]: Sales status unknown
              - note "Flight schedule compatibility" [ref=f5e288]:
                - paragraph [ref=f5e289]:
                  - strong [ref=f5e290]: Flight compatibility has not been checked
                - paragraph [ref=f5e291]: Duration is unknown.
              - paragraph [ref=f5e292]: Check price with the seller
          - paragraph [ref=f5e293]: "Source: Ticketmaster · Check time unknown"
          - paragraph [ref=f5e294]: Catalogue data, not live availability. Sales status and a starting price do not guarantee tickets; confirm with the seller. Inactive or unknown sales cannot be added from the list to the plan.
          - group [ref=f5e295]:
            - generic "Before booking" [ref=f5e296] [cursor=pointer]
          - paragraph [ref=f5e297]: "Affiliate links: HopTrip may earn a commission from a purchase. Confirm ticket availability and entry conditions with the seller."
          - paragraph [ref=f5e298]: Changes to dates and travellers in your plan are not automatically passed through this link. Check the date, participants and price with the partner.
        - navigation "Plan your stay" [ref=f5e299]:
          - heading "Plan your stay" [level=2] [ref=f5e300]
          - list [ref=f5e301]:
            - listitem [ref=f5e302]:
              - 'link "Barcelona: BCN, Girona or Reus" [ref=f5e303] [cursor=pointer]':
                - /url: /en/info/barcelona-airports
            - listitem [ref=f5e304]:
              - 'link "Barcelona in 3 days: sightseeing and a trip budget" [ref=f5e305] [cursor=pointer]':
                - /url: /en/info/barcelona-3-days
      - region [ref=f5e306]:
        - heading "Trip budget calculator" [level=2] [ref=f5e307]
        - paragraph [ref=f5e308]: Enter your own amounts in PLN. An empty field means an unknown cost; enter 0 if there is no expense or it is already included elsewhere.
        - paragraph [ref=f5e309]: A known flight price is copied from the offer per person and covers only its legs. Add a missing return to the flight amount if it is absent from the offer; do not count it again if already included. This is an observed price, not a booking confirmation. Other amounts are your estimates or manually entered prices; we do not verify them with sellers.
        - group "Calculator mode" [ref=f5e310]:
          - button "Quick budget" [pressed] [ref=f5e311] [cursor=pointer]
          - button "Detailed budget" [ref=f5e312] [cursor=pointer]
        - paragraph [ref=f5e313]: Both modes include all entered costs and events. Switching modes keeps your amounts. Expand the details to fill in missing costs.
        - group [ref=f5e314]:
          - generic "How are costs calculated?" [ref=f5e315] [cursor=pointer]
        - paragraph [ref=f5e316]: Saved draft restored. Further changes are saved automatically.
        - group "Your trip plan" [ref=f5e317]:
          - generic [ref=f5e319]:
            - heading "Start with the main costs" [level=3] [ref=f5e320]
            - paragraph [ref=f5e321]: Set travellers and stay length, then flights, accommodation, food and transfers. Profiles and reference fares are below.
            - paragraph [ref=f5e322]: "Main costs entered: 2/4. This is not yet a complete budget."
            - generic [ref=f5e323]:
              - 'button "Fill in: Food and daily expenses" [ref=f5e324] [cursor=pointer]'
              - 'button "Fill in: Transfers and transport" [ref=f5e325] [cursor=pointer]'
          - generic [ref=f5e326]:
            - generic [ref=f5e327]:
              - generic [ref=f5e328]: Stay starts (optional)
              - textbox "Stay starts (optional)" [ref=f5e329]: 2026-12-08
            - generic [ref=f5e330]:
              - generic [ref=f5e331]: Stay ends (optional)
              - textbox "Stay ends (optional)" [ref=f5e332]: 2026-12-11
          - paragraph [ref=f5e333]: Dates update the nights and spending days. You can adjust these counts manually. Stay dates are shared with accommodation search. They do not change the flight offer dates.
          - generic [ref=f5e334]:
            - generic [ref=f5e335]:
              - generic [ref=f5e336]: Number of adults
              - generic [ref=f5e337]: 1 to 50 people
              - textbox "Number of adults" [ref=f5e338]: "1"
            - generic [ref=f5e339]:
              - generic [ref=f5e340]: Number of nights
              - generic [ref=f5e341]: 0 to 365 nights
              - textbox "Number of nights" [ref=f5e342]: "3"
            - generic [ref=f5e343]:
              - generic [ref=f5e344]: Number of spending days
              - generic [ref=f5e345]: 1 to 365 days, including arrival and departure days
              - textbox "Number of spending days" [ref=f5e346]: "4"
          - paragraph [ref=f5e347]:
            - generic [ref=f5e348]:
              - checkbox "All travellers are adults" [checked] [ref=f5e349]
              - text: All travellers are adults
          - heading "Main costs" [level=3] [ref=f5e350]
          - generic [ref=f5e351]:
            - generic [ref=f5e352]:
              - generic [ref=f5e353]: Flights (PLN)
              - generic [ref=f5e354]: Per person, for all planned legs
              - textbox "Flights (PLN)" [ref=f5e355]:
                - /placeholder: Unknown
                - text: "213.00"
              - generic [ref=f5e356]:
                - text: Copied flight price observation — not a live price
                - group [ref=f5e357]:
                  - generic "Amount origin" [ref=f5e358] [cursor=pointer]
            - generic [ref=f5e359]:
              - generic [ref=f5e360]: How is accommodation priced?
              - combobox "How is accommodation priced?" [ref=f5e361]:
                - option "Per night — whole group" [selected]
                - option "For the whole stay — whole group"
              - generic [ref=f5e362]:
                - generic [ref=f5e363]: Accommodation (PLN)
                - generic [ref=f5e364]: Per night for the whole group (all rooms)
                - textbox "Accommodation (PLN)" [ref=f5e365]:
                  - /placeholder: Unknown
                  - text: "200"
                - generic [ref=f5e366]: Your amount — verify it
              - generic [ref=f5e367]: Each field keeps its own amount. Only the selected option contributes to the total; recheck the price after changing dates or guest numbers.
            - generic [ref=f5e368]:
              - generic [ref=f5e369]: Transfers and transport (PLN)
              - generic [ref=f5e370]: "Group total: both airports, return transfers and journeys not entered separately"
              - textbox "Transfers and transport (PLN)" [ref=f5e371]:
                - /placeholder: Unknown
              - generic [ref=f5e372]: Unknown
            - generic [ref=f5e373]:
              - generic [ref=f5e374]: Food and daily expenses (PLN)
              - generic [ref=f5e375]: Per person per day
              - textbox "Food and daily expenses (PLN)" [ref=f5e376]:
                - /placeholder: Unknown
              - generic [ref=f5e377]: Unknown
          - group [ref=f5e378]:
            - 'generic "Extra costs: baggage, local transport, activities and contingency" [ref=f5e379] [cursor=pointer]'
        - status [ref=f5e380]:
          - heading "Total known costs · PLN" [level=3] [ref=f5e381]
          - paragraph [ref=f5e382]:
            - strong [ref=f5e383]: PLN 813.00
          - paragraph [ref=f5e384]:
            - text: "Per person when split equally (rounded):"
            - strong [ref=f5e385]: PLN 813.00
          - paragraph [ref=f5e386]: "Budget incomplete. Still needed: Baggage and flight extras, Transfers and transport, Local transport, Food and daily expenses, Activities and entry tickets, Other costs and contingency, Taxes and fees, Emergency buffer."
        - group "Compare personal profiles" [ref=f5e387]:
          - region [ref=f5e388]:
            - heading "Personal budget profiles" [level=3] [ref=f5e389]
            - paragraph [ref=f5e390]: These are your assumptions in PLN, not average city prices. Profiles have no preset prices. Enter ranges or copy your own amounts. Entered costs, including 0, take priority.
            - group "Personal budget profiles" [ref=f5e391]:
              - button "Budget" [ref=f5e392] [cursor=pointer]
              - button "Standard" [ref=f5e393] [cursor=pointer]
              - button "Comfort" [ref=f5e394] [cursor=pointer]
              - button "No profile" [pressed] [ref=f5e395] [cursor=pointer]
          - group [ref=f5e396]:
            - generic "Check reference costs at your destination" [ref=f5e397] [cursor=pointer]
            - 'option "Barcelona: T-casual, 10 journeys, 1 zone — 13.00 EUR" [selected]'
          - paragraph [ref=f5e398]:
            - link "Full trip budget guide" [ref=f5e399] [cursor=pointer]:
              - /url: /en/info/trip-budget
        - group [ref=f5e400]:
          - generic "Cost breakdown for the whole group" [ref=f5e401] [cursor=pointer]
        - paragraph [ref=f5e402]: This is your cost plan, not an offer or booking. Check final prices with sellers. The draft is only available in this browser; clearing site data also deletes drafts.
        - button "Clear calculator" [ref=f5e403] [cursor=pointer]
      - region "Save and share the trip" [ref=f5e404]:
        - heading "Keep your trip plan" [level=2] [ref=f5e405]
        - paragraph [ref=f5e406]: Saved only in this browser profile on this device. Clearing site data removes your plans. Keep a share link to open a copy elsewhere.
        - paragraph [ref=f5e407]: Saving opens a plan from your list. Choose Update plan to keep later edits in that plan. Share creates an independent copy.
        - paragraph [ref=f5e408]: The link contains the route, dates, traveller count and entered budget. Anyone with it can view these details. It is a plan snapshot, not a current seller offer.
        - paragraph [ref=f5e409]: "New links keep the plan after # in the address, outside the request sent to the site. The link is not encrypted: anyone who receives it can read the plan. Your browser and the service you paste it into may retain the full link."
        - paragraph [ref=f5e410]: This plan is saved.
        - generic [ref=f5e411]:
          - button "Save trip" [ref=f5e412] [cursor=pointer]
          - button "Share" [ref=f5e413] [cursor=pointer]
          - link "Saved trips" [ref=f5e414] [cursor=pointer]:
            - /url: /en/saved
        - paragraph
  - contentinfo [ref=f5e415]:
    - generic [ref=f5e416]:
      - generic [ref=f5e417]: HopTrip.
      - paragraph [ref=f5e418]: "Affiliate link: we may earn a commission after a booking. We do not sell tickets."
    - navigation "About the service" [ref=f5e419]:
      - link "How HopTrip works" [ref=f5e420] [cursor=pointer]:
        - /url: /en/info
      - link "City break" [ref=f5e421] [cursor=pointer]:
        - /url: /en/city-break
      - link "Weekend flights" [ref=f5e422] [cursor=pointer]:
        - /url: /en/tanie-loty-na-weekend
      - link "Flights from Warsaw" [ref=f5e423] [cursor=pointer]:
        - /url: /en/from/warszawa
      - link "Saved trips" [ref=f5e424] [cursor=pointer]:
        - /url: /en/saved
      - link "Flight alerts" [ref=f5e425] [cursor=pointer]:
        - /url: /en/alerts
      - link "About HopTrip" [ref=f5e426] [cursor=pointer]:
        - /url: /en/info/about
      - link "Contact" [ref=f5e427] [cursor=pointer]:
        - /url: /en/info/contact
      - link "Privacy" [ref=f5e428] [cursor=pointer]:
        - /url: /en/info/privacy
      - link "Terms of use" [ref=f5e429] [cursor=pointer]:
        - /url: /en/info/terms
      - link "Affiliate partnerships" [ref=f5e430] [cursor=pointer]:
        - /url: /en/info/partners
    - button "Privacy settings" [ref=f5e432] [cursor=pointer]
  - alert [ref=f5e433]
```

# Test source

```ts
  1   | import {localOutbound} from './local-outbound';
  2   | import {test,expect,type Page,type BrowserContext} from '@playwright/test';
  3   | import {localizedHref} from '../src/lib/i18n/routing';
  4   | import {tripText} from '../src/lib/i18n/trip-copy';
  5   | import {alertText} from '../src/lib/i18n/alert-copy';
  6   | import type {Locale} from '../src/lib/i18n/config';
  7   | import type {AnalyticsEventName} from '../src/lib/analytics-context';
  8   | 
  9   | type Event={event_name:AnalyticsEventName;deal_slug?:string;filter?:{action:string};metadata:Record<string,string>};
  10  | const ticket='https://ticketmaster.evyy.net/synthetic?private=private-ticket-secret';
  11  | async function setup(page:Page,context:BrowserContext,allowed=true){
  12  |  await page.addInitScript(allowed=>{if(!localStorage.getItem('hoptrip.consent.v1'))localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:allowed,marketing:false,at:Date.now()}));},allowed);
  13  |  // All external traffic is fulfilled locally, including popup ticket destinations.
  14  |  await context.route('https://**',route=>route.fulfill({body:'Synthetic local destination',contentType:'text/html'}));
  15  |  await page.route('**/api/v1/deals/*/events?**',route=>{
  16  |   const item={id:'private-event-id',name:'Synthetic concert',category:'MUSIC',venue:'Synthetic venue',city:'Barcelona',start_date:new URL(route.request().url()).searchParams.get('start_date'),end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',url:ticket,price_from:null,currency:null};
  17  |   return route.fulfill({json:{status:'READY',events:[item,{...item,id:'variant-fixture',name:'Synthetic variants',ticket_options:[{id:'private-option',name:'Synthetic standard',ticket_kind:'STANDARD',url:ticket,price_from:null,currency:null}]},{...item,id:'cancelled-fixture',name:'Synthetic cancelled',status:'cancelled'}],partial:false,checked_at:null}});
  18  |  });
  19  |  const events:Event[]=[],statuses:{name:AnalyticsEventName;status:number}[]=[],externalTrackers:string[]=[];
  20  |  page.on('request',request=>{
  21  |   if(request.url().endsWith('/analytics/events')&&request.method()==='POST')events.push(request.postDataJSON());
  22  |   if(/emrld\.ltd|api\.telegram\.org/.test(request.url()))externalTrackers.push(request.url());
  23  |  });
  24  |  page.on('response',response=>{if(response.url().endsWith('/analytics/events')&&response.request().method()==='POST')statuses.push({name:response.request().postDataJSON().event_name,status:response.status()});});
  25  |  return {events,statuses,externalTrackers};
  26  | }
  27  | const count=(events:Event[],name:AnalyticsEventName)=>events.filter(e=>e.event_name===name).length;
  28  | async function clickTicket(page:Page,variant=false){
  29  |  const card=page.locator('#trip-events li').filter({has:page.getByRole('heading',{level:3,name:variant?'Synthetic variants':'Synthetic concert',exact:true})});
  30  |  const link=card.locator('a[target="_blank"]');
  31  |  await expect(link).toHaveAttribute('rel','sponsored noopener noreferrer');
  32  |  const restore=await localOutbound(link);const opened=page.waitForEvent('popup');await link.click();const popup=await opened;await popup.waitForLoadState();await popup.close();await restore();
  33  | }
  34  | async function signup(page:Page,locale:Locale,email:string){
  35  |  await page.getByLabel('Email',{exact:true}).fill(email);
  36  |  await page.locator('input[name="consent"]').check();
  37  |  await page.getByRole('button',{name:alertText(locale,'Wyślij link potwierdzający'),exact:true}).click();
  38  | }
  39  | 
  40  | for(const locale of ['pl','en','ru','uk'] as const)test(`product taxonomy follows real actions without private payloads in ${locale}`,async({page,context,request})=>{
  41  |  test.setTimeout(120000);
  42  |  const {events,statuses,externalTrackers}=await setup(page,context);
  43  |  const flush=async()=>{
  44  |   // Navigation can enqueue more events while earlier responses are still in flight.
  45  |   // Sample both counters together instead of freezing the expected request count.
  46  |   // Save opens a new document; its keepalive response may not remain observable.
> 47  |   await expect.poll(()=>events.length>0&&statuses.filter(s=>s.name!=='TRIP_SAVE').length===events.filter(e=>e.event_name!=='TRIP_SAVE').length).toBe(true);
      |                                                                                                                                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  48  |   expect(statuses.every(s=>s.status===202)).toBe(true);
  49  |  };
  50  |  await page.goto(localizedHref('/deals?origin=WRO&budget=300&sort=price',locale));
  51  |  await page.locator('.filter-chip').last().click();
  52  |  await expect.poll(()=>events.some(e=>e.filter?.action==='remove')).toBe(true);
  53  |  await page.locator('.filter-reset').click();
  54  |  await expect.poll(()=>events.some(e=>e.filter?.action==='reset')).toBe(true);
  55  |  await expect(page).toHaveURL(/sort=price/);
  56  |  await page.locator('input[name="budget"]').fill('1');
  57  |  await page.locator('.filters button[type="submit"]').click();
  58  |  await expect.poll(()=>events.some(e=>e.filter?.action==='apply')).toBe(true);
  59  |  await expect.poll(()=>count(events,'SEARCH')).toBe(1);
  60  |  expect(events.filter(e=>e.event_name==='FILTER_USE').map(e=>e.filter?.action)).toEqual(['remove','reset','apply']);
  61  |  await flush();
  62  |  await page.goto(localizedHref('/deals/browser-13',locale));
  63  |  await page.locator('#budget-hotel').fill('200');
  64  |  await expect.poll(()=>count(events,'BUDGET_USE')).toBe(1);
  65  |  const save=page.getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true});
  66  |  await save.click();await expect(page).toHaveURL(/\/trip#local=/);await expect.poll(()=>count(events,'TRIP_SAVE')).toBe(1);
  67  |  await page.goto(localizedHref('/deals/browser-13',locale));await page.locator('#budget-hotel').fill('200');
  68  |  await save.click();await expect(page).toHaveURL(/\/trip#local=/);expect(count(events,'TRIP_SAVE')).toBe(1);
  69  |  await page.goto(localizedHref('/deals/browser-13',locale));
  70  |  await clickTicket(page);
  71  |  await expect.poll(()=>count(events,'EVENT_CLICK')).toBe(1);
  72  |  expect(events.find(e=>e.event_name==='EVENT_CLICK')?.deal_slug).toBe('browser-13');
  73  |  await expect(page.locator('#trip-events li').filter({has:page.getByRole('heading',{name:'Synthetic cancelled',exact:true})}).locator('a')).toHaveCount(0);
  74  |  await flush();
  75  |  await page.goto(localizedHref('/saved',locale));
  76  |  await page.locator('main ul li button').click();
  77  |  await expect.poll(()=>count(events,'TRIP_REMOVE')).toBe(1);
  78  |  expect(events.find(e=>e.event_name==='TRIP_REMOVE')?.metadata.page_type).toBe('saved');
  79  |  expect(count(events,'TRIP_SAVE')).toBe(1);
  80  |  await flush();
  81  |  await page.goto(localizedHref('/alerts?origin=WRO',locale));
  82  |  await page.getByRole('button',{name:alertText(locale,'Wyślij link potwierdzający'),exact:true}).click();
  83  |  expect(count(events,'ALERT_STARTED')).toBe(0);
  84  |  const email=`taxonomy-${crypto.randomUUID()}@example.test`;
  85  |  await signup(page,locale,email);
  86  |  await expect(page.getByRole('status')).toContainText(alertText(locale,'Sprawdź skrzynkę i spam. Jeśli adres może otrzymywać alerty, dostaniesz link do potwierdzenia lub zarządzania. Prośba o zapis nie oznacza potwierdzonej subskrypcji. Link wysyłamy najwyżej raz na dobę.'));
  87  |  expect(count(events,'ALERT_STARTED')).toBe(1);expect(count(events,'ALERT_CONFIRMED')).toBe(0);
  88  |  await flush();
  89  |  const api=process.env.HOPTRIP_API_URL??'http://127.0.0.1:8100';
  90  |  const response=await request.get(`${api}/__test__/mail?email=${encodeURIComponent(email)}`);expect(response.ok()).toBe(true);
  91  |  const mail=await response.json(),confirm=mail[0].body.match(/http[^\s]+\/alerts\/confirm#token=[^\s]+/)[0];
  92  |  expect(new URL(confirm).origin).toBe(new URL(page.url()).origin);
  93  |  await page.goto(confirm);
  94  |  await page.getByRole('button',{name:alertText('pl','Potwierdzam zapis'),exact:true}).click();
  95  |  await expect.poll(()=>count(events,'ALERT_CONFIRMED')).toBe(1);
  96  |  await flush();
  97  |  expect(JSON.stringify(events)).not.toMatch(/private|taxonomy-|example\.test|email|token|plan=|Synthetic/);
  98  |  expect(externalTrackers).toEqual([]);
  99  |  // Withdrawal persists over a full navigation, including an explicit signup attempt.
  100 |  await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();
  101 |  await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
  102 |  const before=events.length;
  103 |  await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
  104 |  await page.goto('/alerts?origin=WRO');await signup(page,'pl','withdrawn@example.test');
  105 |  await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
  106 |  expect(events).toHaveLength(before);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
  107 | });
  108 | 
  109 | test('ticket variants emit the same minimal click and failures never block navigation',async({page,context})=>{
  110 |  const {events}=await setup(page,context);
  111 |  await page.route('**/analytics/events',route=>route.abort('failed'));
  112 |  await page.goto('/deals/browser-13');await clickTicket(page,true);
  113 |  expect(count(events,'EVENT_CLICK')).toBe(1);
  114 |  expect(events.find(e=>e.event_name==='EVENT_CLICK')?.deal_slug).toBe('browser-13');
  115 |  expect(JSON.stringify(events)).not.toMatch(/private|Synthetic|ticketmaster/);
  116 | });
  117 | 
  118 | test('denied consent suppresses filter, ticket, save, remove and signup analytics',async({page,context})=>{
  119 |  const {events}=await setup(page,context,false);
  120 |  await page.goto('/deals?budget=300');await page.locator('.filter-reset').click();
  121 |  await page.goto('/deals/browser-13');await clickTicket(page);
  122 |  await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
  123 |  await expect(page).toHaveURL(/\/trip#local=/);
  124 |  await page.goto('/saved');await page.locator('main ul li button').click();
  125 |  await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
  126 |  await page.goto('/alerts?origin=WRO');await signup(page,'pl','denied@example.test');
  127 |  await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
  128 |  expect(events).toEqual([]);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
  129 | });
  130 | 
  131 | test('failed saved-trip write emits no remove and leaves the plan available',async({page,context})=>{
  132 |  const {events}=await setup(page,context);
  133 |  await page.goto('/deals/browser-13');await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
  134 |  await expect(page).toHaveURL(/\/trip#local=/);
  135 |  await page.goto('/saved');await expect(page.locator('main ul li button')).toHaveCount(1);
  136 |  await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key.includes('saved'))throw Error('Synthetic storage failure');return original.call(this,key,value);};});
  137 |  await page.locator('main ul li button').click();
  138 |  await expect(page.getByRole('status')).toContainText('Nie udało się usunąć planu');
  139 |  expect(count(events,'TRIP_REMOVE')).toBe(0);await expect(page.locator('main ul li button')).toHaveCount(1);
  140 | });
  141 | 
  142 | test('a failed signup counts one start per visit and never reports completion',async({page,context})=>{
  143 |  const {events}=await setup(page,context);
  144 |  await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
  145 |  await page.goto('/alerts?origin=WRO');await signup(page,'pl','failed@example.test');
  146 |  await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
  147 |  await signup(page,'pl','failed@example.test');await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
```