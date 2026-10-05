import { RoofReference } from "./RoofReference";
import { roofParts } from "@/lib/content";
export function RoofSystem({ parts = roofParts }: { parts?: typeof roofParts }) {
  return (
    <section className="roof-system roof-reference-section" id="roof-system" aria-labelledby="roof-heading">
      <div className="section-head wrap">
        <div><p className="eyebrow">GOOD ROOFING GOES DEEPER</p><h2 id="roof-heading">More than shingles.<br /><span className="muted">A system that protects.</span></h2></div>
        <p>Every layer has a job.<br />See what’s working above your head.</p>
      </div>
      <div className="roof-reference-layout wrap">
        <RoofReference />
        <div className="roof-reference-explanations">
          <h3>Understand your roof, layer by layer.</h3>
          <p>Shingles, moisture protection and ventilation work together. Explore the components below, then ask us what your home needs.</p>
          {parts.map(part => <details key={part.name}><summary>{part.name}</summary><p>{part.text}</p></details>)}
        </div>
      </div>
    </section>
  );
}
