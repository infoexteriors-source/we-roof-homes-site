import Link from "next/link";
import { CostCalculator, type CalculatorService } from "@/components/CostCalculator";
import { FAQs, JsonLd, faqSchema } from "@/components/Shared";
import {
  estimateGutters, estimateRoof, estimateSiding, formatUsd, gutterRates, homeSizes, ratesAreDraft,
  roofRates, sidingRates, type HomeSize,
} from "@/lib/estimator";

type Row = { label: string; value: string };
type Copy = {
  eyebrow: string; title: string; intro: string;
  tableTitle: string; tableNote: string; materialRows: Row[];
  sizeTitle: string; sizeRows: Row[];
  factors: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
  servicePath: string; serviceLabel: string;
};

const typical = { size: "1750-2500", stories: 2 } as const;
const span = (e: { low: number; high: number }) => `${formatUsd(e.low)} – ${formatUsd(e.high)}`;
const sizes = Object.keys(homeSizes) as HomeSize[];

function copyFor(service: CalculatorService): Copy {
  if (service === "roof") return {
    eyebrow: "Roof cost calculator",
    title: "What will a new roof cost?",
    intro: "Answer five quick questions. We’ll email a personalized PDF with your Maryland roof planning range, project assumptions and clear next steps. A free inspection confirms the final price.",
    tableTitle: "Roof replacement cost by material",
    tableNote: "Typical 2-story home, 1,750–2,500 sq ft, gable roof, moderate pitch.",
    materialRows: (Object.keys(roofRates.materials) as (keyof typeof roofRates.materials)[]).map((m) => ({ label: roofRates.materials[m].label, value: span(estimateRoof({ ...typical, shape: "gable", pitch: "moderate", material: m })) })),
    sizeTitle: "Architectural shingle roof cost by home size",
    sizeRows: sizes.map((s) => ({ label: homeSizes[s].label, value: span(estimateRoof({ size: s, stories: 2, shape: "gable", pitch: "moderate", material: "architectural" })) })),
    factors: [
      { title: "Roof size and pitch", text: "Steeper roofs have more surface area and need extra safety setup, so both material and labor go up." },
      { title: "Shape and details", text: "Valleys, dormers, skylights and chimneys all need extra flashing and cutting time." },
      { title: "What’s underneath", text: "Soft or rotted decking is replaced as needed. More than one old layer of shingles adds tear-off time." },
      { title: "Material and ventilation", text: "Designer shingles, metal and synthetic slate cost more up front and last longer. Balanced intake and ridge ventilation protects the new roof." },
    ],
    faqs: [
      { question: "How accurate is the roof cost calculator?", answer: "It gives a planning range from your home size, stories, roof shape, pitch and material. Decking condition, the number of old layers and roof details can only be confirmed on site, so your written estimate may land above or below this range." },
      { question: "Does the range include tear-off and disposal?", answer: "Yes. The range assumes removal of one existing layer, disposal, underlayment, ice and water barrier at the eaves, drip edge, flashing and ridge ventilation." },
      { question: "Can I finance a new roof?", answer: "Financing is available for qualified homeowners, subject to credit approval and lender terms. See our financing page for details." },
    ],
    servicePath: "/services/roof-replacement", serviceLabel: "Roof replacement",
  };
  if (service === "siding") return {
    eyebrow: "Siding cost calculator",
    title: "What will new siding cost?",
    intro: "Tell us about your home and siding preferences. We’ll email a personalized PDF with a planning range and the assumptions behind it. A free inspection confirms the final price.",
    tableTitle: "Siding replacement cost by material",
    tableNote: "Typical 2-story home, 1,750–2,500 sq ft, no upgrades.",
    materialRows: (Object.keys(sidingRates.materials) as (keyof typeof sidingRates.materials)[]).map((m) => ({ label: sidingRates.materials[m].label, value: span(estimateSiding({ ...typical, material: m, trim: false, shutters: false })) })),
    sizeTitle: "Vinyl siding cost by home size",
    sizeRows: sizes.map((s) => ({ label: homeSizes[s].label, value: span(estimateSiding({ size: s, stories: 2, material: "vinyl", trim: false, shutters: false })) })),
    factors: [
      { title: "Wall area and height", text: "More wall means more material. Second and third stories need staging or lifts." },
      { title: "Material and profile", text: "Insulated vinyl and fiber cement cost more but add rigidity, impact resistance or a painted-wood look." },
      { title: "Trim, soffit and fascia", text: "Wrapping trim and replacing soffit and fascia at the same time finishes the whole exterior." },
      { title: "What’s behind the old siding", text: "Damaged sheathing is only visible once old siding comes off. Your estimate should say how that will be handled." },
    ],
    faqs: [
      { question: "What does the siding range include?", answer: "Removal and disposal of existing siding, house wrap, flashing at windows and doors, new siding with trim accessories, and cleanup. Trim wrap and shutters are optional upgrades in the calculator." },
      { question: "Which siding brands do you install?", answer: "We install CertainTeed siding, including the Mainstreet vinyl line, along with other quality vinyl and fiber cement products. We’ll walk you through colors and profiles during your estimate." },
      { question: "Can I replace siding and gutters together?", answer: "Yes. Coordinating siding, trim and gutters in one project keeps the transitions clean and means one schedule and one crew." },
    ],
    servicePath: "/services/siding", serviceLabel: "Siding replacement",
  };
  return {
    eyebrow: "Gutter cost calculator",
    title: "What will new gutters cost?",
    intro: "Tell us about your home and gutter preferences. We’ll email a personalized PDF with a planning range and useful next steps. A free inspection confirms the final price.",
    tableTitle: "Seamless gutter cost by size",
    tableNote: "Typical 2-story home, 1,750–2,500 sq ft, hip roof, no guards.",
    materialRows: [
      ...(Object.keys(gutterRates.sizes) as (keyof typeof gutterRates.sizes)[]).map((g) => ({ label: gutterRates.sizes[g].label, value: span(estimateGutters({ ...typical, shape: "hip", gutter: g, guards: false, removeOld: false })) })),
      { label: `5" seamless with ${gutterRates.guards.label.toLowerCase()}`, value: span(estimateGutters({ ...typical, shape: "hip", gutter: "5in", guards: true, removeOld: false })) },
    ],
    sizeTitle: "5″ seamless gutter cost by home size",
    sizeRows: sizes.map((s) => ({ label: homeSizes[s].label, value: span(estimateGutters({ size: s, stories: 2, shape: "hip", gutter: "5in", guards: false, removeOld: false })) })),
    factors: [
      { title: "Length of the eaves", text: "Hip roofs have eaves on every side. Gable roofs usually need gutters on two sides." },
      { title: "Height and access", text: "Second- and third-story runs need taller ladders and more setup time." },
      { title: "Size and guards", text: "6″ gutters handle more water from large or steep roofs. Micro-mesh guards keep debris out." },
      { title: "Fascia condition", text: "Rotted fascia boards must be replaced before new gutters can be hung securely." },
    ],
    faqs: [
      { question: "What does the gutter range include?", answer: "Seamless aluminum gutters formed on site, downspouts and elbows, hidden hangers, sealed end caps and outlets, and discharge away from the foundation." },
      { question: "Should I choose 5-inch or 6-inch gutters?", answer: "5-inch K-style gutters suit most homes. 6-inch gutters carry more water and are a good fit for large, steep or complex roofs, or where overflow has been a problem." },
      { question: "Do I need gutter guards?", answer: "Guards help if trees drop leaves, needles or seeds on your roof. They reduce cleaning but still need an occasional check." },
    ],
    servicePath: "/services/gutters", serviceLabel: "Gutter installation",
  };
}

export function CalculatorPage({ service }: { service: CalculatorService }) {
  const copy = copyFor(service);
  return (
    <main id="main" className="calc-page">
      <section className="calc-page-heading">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link> / <Link href="/services">Services</Link> / <span aria-current="page">{copy.eyebrow}</span>
          </nav>
          <div className="calc-heading-row">
            <div>
              <h1>{copy.title}</h1>
              <p>Tell us about your home. Get your personalized planning report by email.</p>
            </div>
            <nav className="calc-service-switch" aria-label="Choose a cost calculator">
              {(["roof", "siding", "gutters"] as const).map((item) => <Link key={item} href={`/${item === "gutters" ? "gutter" : item}-cost-calculator`} aria-current={item === service ? "page" : undefined}>{item === "roof" ? "Roofing" : item === "siding" ? "Siding" : "Gutters"}</Link>)}
            </nav>
          </div>
        </div>
      </section>
      <section className="wrap calc-layout" id="calculator">
        <div>
          <CostCalculator service={service} />
          {ratesAreDraft && <p className="calc-draft-notice" role="note"><strong>About your range:</strong> This planning tool uses draft pricing assumptions. A free inspection and written estimate confirm your final price.</p>}
        </div>
        <aside className="calc-aside" aria-label="About your report">
          <div className="calc-report-aside">
            <span className="eyebrow">INCLUDED WITH YOUR ESTIMATE</span>
            <h2>Your project.<br />Clearly laid out.</h2>
            <p>A free PDF you can save, compare and discuss at home.</p>
            <ol><li><span>01</span><strong>Tell us about your home</strong><small>A few quick selections - no measurements needed.</small></li><li><span>02</span><strong>Receive the PDF by email</strong><small>See the range and the assumptions in writing.</small></li><li><span>03</span><strong>Confirm on site</strong><small>Get a free inspection and written final estimate.</small></li></ol>
            <p className="calc-aside-note">No obligation. No SMS enrollment. Questions? <a href="tel:+12407959365">(240) 795-9365</a></p>
          </div>
        </aside>
      </section>
      <section className="calc-tables">
        <div className="wrap">
          {ratesAreDraft && <p className="calc-tables-disclaimer">Illustrative price ranges only. Final materials, scope and pricing are confirmed in your written estimate.</p>}
          <div>
            <h2>{copy.tableTitle}</h2>
            <p className="calc-table-note">{copy.tableNote}</p>
            <table>
              <tbody>{copy.materialRows.map((r) => <tr key={r.label}><th scope="row">{r.label}</th><td>{r.value}</td></tr>)}</tbody>
            </table>
          </div>
          <div>
            <h2>{copy.sizeTitle}</h2>
            <p className="calc-table-note">Estimated installed price ranges{ratesAreDraft ? " (rates being finalized)" : ""}.</p>
            <table>
              <tbody>{copy.sizeRows.map((r) => <tr key={r.label}><th scope="row">{r.label}</th><td>{r.value}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="wrap section calc-factors">
        <p className="eyebrow">WHAT MOVES THE PRICE</p>
        <h2>Four things that shape your estimate.</h2>
        <div className="estimate-details">
          {copy.factors.map((f, i) => <div key={f.title}><span>0{i + 1}</span><h3>{f.title}</h3><p>{f.text}</p></div>)}
        </div>
      </section>
      <section className="wrap section faq-section">
        <div>
          <p className="eyebrow">COST QUESTIONS</p>
          <h2>Good questions.<br />Straight answers.</h2>
          <Link className="text-link" href={copy.servicePath}>{copy.serviceLabel} details</Link>
        </div>
        <FAQs items={copy.faqs} />
      </section>
      <JsonLd data={faqSchema(copy.faqs)} />
    </main>
  );
}
