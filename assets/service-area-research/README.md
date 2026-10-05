# Bethesda-based Maryland coverage snapshot

Current user rule: downtown Bethesda, normal traffic, maximum one-hour drive, Maryland only. This snapshot is a planning estimate, not address-level or traffic-aware verification.

## Sources and method

- [2026 Census Maryland Places Gazetteer](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_gaz_place_24.txt): all 536 records, incorporated cities/towns/villages plus Census-designated communities. This is comprehensive for that dataset, not every informal neighborhood or historic settlement name.
- Origin: Bethesda Metro area, 38.9842769, -77.0944225. This represents downtown, not the broader Bethesda Census centroid.
- [OSRM table service](https://project-osrm.org/docs/v26.4.0/http) via FOSSGIS routed-car, OpenStreetMap road data. Eight one-time batches, one connection, at least 1.2 seconds between requests, identifying user-agent and referrer. Responses cached here; website visitors make no routing requests.
- [FOSSGIS current usage terms](https://www.fossgis.de/arbeitsgruppen/osm-server/nutzungsbedingungen/) allow incidental commercial usage that is not a substantial part of an online offering, with at most one routing request per second. This is a one-time coverage-planning snapshot, not a hosted routing service. Attribution and map-correction link are displayed on the page.
- Duration ≤3,600 seconds to the Census representative point is included. No straight-line distance fallback was used. Live/predicted traffic is unavailable; OSRM estimates do not establish a normal-traffic guarantee.

## Result

189 place records included; 347 excluded. Duplicate names in the included set are disambiguated: Chevy Chase town/community and Woodlawn in Baltimore/Prince George’s counties. Unique Census GEOIDs remain the primary keys.

Aberdeen Proving Ground was manually reviewed in the earlier two-hour snapshot but is now excluded by travel time. Andrews AFB, Fort Meade and Naval Academy are within the one-hour model, although actual property access to military facilities requires approval and may affect travel time. Military gate/visitor requirements are documented by the [U.S. Army](https://home.army.mil/apg/about/visitor-information). Smith Island is not a valid mainland car destination and is excluded.

Near-edge included examples: Arden on the Severn, Mayo, Middletown, Severna Park and Sykesville; their unrounded modeled durations are at or below 3,600 seconds. Exact addresses must be checked before scheduling. Easton and Hancock are outside the one-hour model.

## Site behavior

- Searchable A–Z list with native expandable groups; all 189 names and links appear in initial HTML.
- One statically generated page for each listed place. The original eight pages retain their editorial details. New pages include factual route estimates, neighboring Maryland communities, service links, a form and source notes. They make no claims about completed work or customer reviews in a given town.
- Homepage copy, FAQ and structured service-area description reflect the one-hour Maryland-only limit.
- No claimed eligibility for every address inside a listed Census place or entire county.
- Full routing evidence is in `coverage-audit.json`; published names, URLs and route data are in `lib/service-area-data.json`.
- `node scripts/build-service-area-data.mjs` reproduces from cache. Do not clear caches or make this a recurring/build-time job without rechecking provider policy.
- `node scripts/verify-service-areas.mjs` checks inclusion/exclusion, duplicates, search, keyboard, no-JavaScript, mobile overflow and accessibility.

Before production, review edge-town addresses against a traffic-aware route provider if a strict normal-traffic cutoff is required. These non-traffic estimates are not a substitute for that operational check.
