"use client";

import { useState } from "react";
import Link from "next/link";

type Place = { id: string; name: string; href?: string };
const normalize = (value: string) => value.toLocaleLowerCase("en-US").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

export function ServiceAreaDirectory({ places }: { places: Place[] }) {
  const [query, setQuery] = useState("");
  const search = normalize(query);
  const matches = places.filter(place => normalize(place.name).includes(search));
  const letters = [...new Set(matches.map(place => place.name[0].toUpperCase()))];

  return <section className="area-directory wrap section" aria-labelledby="area-directory-title">
    <div className="area-directory-heading">
      <div><p className="eyebrow">MARYLAND TOWNS & COMMUNITIES</p><h2 id="area-directory-title">Find your town.</h2><p>Browse Maryland communities within an estimated one-hour drive of downtown Bethesda. Open a town for roofing services and an inspection request.</p></div>
      <div className="area-policy"><span className="eyebrow">THE SERVICE-AREA BOUNDARY</span><p>Maryland only.<br />Up to an estimated one-hour drive.<br />Exact address confirmed before scheduling.</p></div>
    </div>
    <div className="area-search-controls">
      <label htmlFor="town-search">Search your town or community</label>
      <div className="area-search-field"><input id="town-search" type="search" placeholder="Try Bethesda, Rockville, or Columbia" value={query} onChange={event => setQuery(event.target.value)} autoComplete="off" aria-controls="town-results" />{query && <button type="button" onClick={() => { setQuery(""); document.getElementById("town-search")?.focus(); }}>Clear</button>}</div>
    </div>
    <p className="area-result-count" role="status" aria-live="polite">{search ? `${matches.length} matching ${matches.length === 1 ? "community" : "communities"}` : `${places.length} listed towns and communities. Browse alphabetically below.`}</p>
    <noscript><style>{`.area-search-controls{display:none}`}</style><p>Open a letter below to browse. The complete directory is available without JavaScript.</p></noscript>
    <div id="town-results">
      {letters.map(letter => <details className="area-letter" key={`${letter}-${search ? "search" : "browse"}`} open={Boolean(search)}>
        <summary><span>{letter}</span><span className="area-letter-count">{matches.filter(place => place.name[0].toUpperCase() === letter).length} communities <span aria-hidden="true">+</span></span></summary>
        <ul role="list">{matches.filter(place => place.name[0].toUpperCase() === letter).map(place => <li key={place.id}>{place.href ? <Link href={place.href}>{place.name}</Link> : <span>{place.name}</span>}</li>)}</ul>
      </details>)}
      {matches.length === 0 && <div className="area-empty"><h3>No matching community in the directory.</h3><p>Some neighborhood and mailing names differ from Census place names. Send us your property address and we’ll check it against the one-hour service limit.</p><Link href="/contact#request-inspection" className="text-link">Check my address</Link></div>}
    </div>
    <div className="area-method"><h3>How we define the area</h3><p>This directory uses Census-recognized Maryland cities, towns, villages, and unincorporated communities, screened by estimated road travel from downtown Bethesda. It is not a mileage circle or a promise to serve an entire county. Estimates do not include live traffic, delays, or the route to your exact property. Addresses near the boundary are checked before an appointment is arranged. Military installations and gated properties also require access approval.</p><p>Place names: <a href="https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html">U.S. Census Bureau</a>. Routing: <a href="https://project-osrm.org/">OSRM</a>, powered by <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>. <a href="https://www.openstreetmap.org/fixthemap">Report a map issue</a>.</p></div>
  </section>;
}
