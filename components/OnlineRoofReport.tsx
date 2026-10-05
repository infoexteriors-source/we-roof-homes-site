"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readRoofProperty, type RoofProperty } from "@/lib/roof-view";
import { RoofPropertyView } from "./RoofPropertyView";

export function OnlineRoofReport() {
  const [property, setProperty] = useState<RoofProperty | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const update = () => { setProperty(readRoofProperty(location.hash)); setReady(true); };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  if (!ready) return <p role="status">Opening your property view…</p>;
  if (!property) return <div><h2>Open the link in your report.</h2><p>Your emailed PDF includes a property-specific link. You can also start a new estimate below.</p><Link className="button" href="/roof-cost-calculator">Start my estimate</Link></div>;
  return <>
    <RoofPropertyView property={property} />
    <div className="roof-report-next"><div><p className="eyebrow">FROM OVERVIEW TO ANSWERS</p><h2>Let’s take a closer look.</h2><p>Your emailed PDF contains your planning range and project selections. A free inspection confirms measurements, materials and condition.</p></div><Link className="button" href="/contact#request-inspection">Request my free inspection ↗</Link></div>
    <p className="calc-fine">This link contains the property address. Share it only with people you want to see this property view. Map content is supplied by Google, subject to the <a href="https://www.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer">Google Maps terms</a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
  </>;
}
