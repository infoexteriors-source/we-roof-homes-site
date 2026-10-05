// One-time editorial snapshot, never called by the website or on builds.
// Source: US Census Gazetteer. Road estimates: FOSSGIS OSRM / OpenStreetMap.
// Maximum one request per second, one connection, cached responses.
import fs from 'node:fs/promises';
import path from 'node:path';

const dir = 'assets/service-area-research';
const origin = { label: 'Downtown Bethesda (Bethesda Metro area)', lat: 38.9842769, lon: -77.0944225 };
const maxDriveSeconds = 3600;
const lines = (await fs.readFile(path.join(dir, 'maryland-places-2026.txt'), 'utf8')).trim().split(/\r?\n/);
const headers = lines.shift().split('|');
const places = lines.map(line => Object.fromEntries(line.split('|').map((v, i) => [headers[i], v])));
const results = [];
// APG's Census internal point is 1.16 km from a mapped road. Its ~99-minute
// route was manually reviewed, but military access is not promised.
const reviewedSnaps = new Set(['2400175']);
const displayNames = {
  '2416620': 'Chevy Chase (town)', '2416625': 'Chevy Chase (community)',
  '2464495': 'Queen Anne (community)', '2464500': 'Queen Anne (town)',
  '2486475': 'Woodlawn (Baltimore County)', '2486525': "Woodlawn (Prince George’s County)",
};
const slugFor = name => `${name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-md`;
for (let i = 0; i < places.length; i += 75) {
  const batch = places.slice(i, i + 75);
  const cache = path.join(dir, `routes-${i}.json`);
  let data;
  try { data = JSON.parse(await fs.readFile(cache, 'utf8')); }
  catch {
    const coordinates = [`${origin.lon},${origin.lat}`, ...batch.map(p => `${p.INTPTLONG},${p.INTPTLAT}`)].join(';');
    const destinations = batch.map((_, j) => j + 1).join(';');
    const url = `https://routing.openstreetmap.de/routed-car/table/v1/driving/${coordinates}?sources=0&destinations=${destinations}&annotations=duration,distance&generate_hints=false`;
    const response = await fetch(url, { headers: { 'User-Agent': 'WeRoof-ServiceAreaResearch/1.0 (one-time coverage planning; weroofhomes.com)', Referer: 'https://www.weroofhomes.com/' }, signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw Error(`Routing ${response.status}`);
    data = await response.json();
    if (data.code !== 'Ok') throw Error(JSON.stringify(data));
    await fs.writeFile(cache, JSON.stringify(data, null, 2));
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  batch.forEach((p, j) => {
    const seconds = data.durations[0][j];
    const snappedDistance = data.destinations[j].distance;
    const validRoute = typeof seconds === 'number' && Number.isFinite(seconds) && (snappedDistance <= 1000 || reviewedSnaps.has(p.GEOID));
    results.push({ id: p.GEOID, name: p.NAME.replace(/ (CDP|city|town|village)$/, ''), type: p.NAME.endsWith('CDP') ? 'community' : 'municipality', lat: Number(p.INTPTLAT), lon: Number(p.INTPTLONG), seconds, meters: data.distances[0][j], snappedDistance, included: validRoute && seconds <= maxDriveSeconds, reason: !validRoute ? 'Route requires manual review' : seconds <= maxDriveSeconds ? 'Within modeled one-hour drive' : 'Beyond modeled one-hour drive' });
  });
  console.log(`Checked ${Math.min(i + 75, places.length)} / ${places.length}`);
}
const snapshot = { source: '2026 US Census Maryland Places Gazetteer', sourceUrl: 'https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_gaz_place_24.txt', checkedAt: new Date().toISOString(), origin, maxDriveSeconds, method: 'OSRM car-route estimates without live or predicted traffic; representative Census points, not address-level eligibility.', places: results };
await fs.writeFile(path.join(dir, 'coverage-audit.json'), JSON.stringify(snapshot, null, 2));
const included = results.filter(p => p.included).sort((a, b) => a.name.localeCompare(b.name));
await fs.writeFile('lib/service-area-data.json', JSON.stringify({ checkedAt: snapshot.checkedAt, origin, maxDriveSeconds, totalChecked: results.length, places: included.map(({ id, name, type, seconds, lat, lon }) => ({ id, name: displayNames[id] || name, slug: slugFor(displayNames[id] || name), type, estimatedMinutes: Math.round(seconds / 60), seconds: Math.round(seconds), lat, lon })) }, null, 2));
console.log(JSON.stringify({ included: included.length, excluded: results.length - included.length, edge: included.filter(p => p.seconds >= 3300).map(p => [p.name, Math.round(p.seconds/60)]), review: results.filter(p => p.reason === 'Route requires manual review').map(p => p.name) }, null, 2));
