"use client";

import { googleRoofUrls, type RoofProperty } from "@/lib/roof-view";

export function RoofPropertyView({ property }: { property: RoofProperty }) {
  const urls = googleRoofUrls(property, process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY);
  return <section className="roof-property-view" aria-label="Property satellite view">
    {urls.embed ? <iframe
      key={urls.embed}
      src={urls.embed}
      title={`Google satellite view of ${property.address}`}
      width="800" height="450" loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
    /> : <div className="roof-map-fallback"><strong>Explore your property on Google Maps</strong><p>Open the map below and select Satellite to see the aerial view.</p></div>}
    <div className="roof-map-caption"><span>{property.address}, MD {property.zip}</span><a href={urls.open} target="_blank" rel="noopener noreferrer">Open in Google Maps ↗</a></div>
    <p className="calc-fine">Check that the map shows your home. Imagery may be older or obscured by trees; it does not confirm roof size or condition.</p>
  </section>;
}
