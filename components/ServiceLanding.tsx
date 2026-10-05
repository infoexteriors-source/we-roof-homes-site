import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { FAQs, JsonLd, faqSchema } from "@/components/Shared";
import { business, pagePhotos } from "@/lib/content";
import { estimateGutters, estimateSiding, formatUsd, gutterRates, ratesAreDraft, sidingRates } from "@/lib/estimator";

type Option = { tag: string; title: string; text: string; points: string[]; price: string; featured?: boolean };
type Landing = {
  slug: "siding" | "gutters";
  eyebrow: string; title: string; intro: string;
  optionsTitle: string; optionsIntro: string; options: Option[];
  calcTitle: string; calcText: string; calcHref: string;
  signsTitle: string; signs: string[];
  process: { title: string; text: string }[];
  bundleTitle: string; bundleText: string; bundleLinks: [string, string][];
  faqs: { question: string; answer: string }[];
};

const typical = { size: "1750-2500", stories: 2 } as const;
const from = (e: { low: number; high: number }) => `${formatUsd(e.low)} – ${formatUsd(e.high)}`;

export const landings: Record<"siding" | "gutters", Landing> = {
  siding: {
    slug: "siding",
    eyebrow: "Siding replacement in Maryland",
    title: "New siding that protects and turns heads.",
    intro: "We replace worn, cracked and faded siding with low-maintenance systems built to shed Maryland weather, and we handle the trim, wrap and flashing details that keep moisture out of your walls.",
    optionsTitle: "Siding options for your home.",
    optionsIntro: "Every option is installed over new house wrap with flashed windows and doors. Price ranges are for a typical 2-story home, 1,750–2,500 sq ft.",
    options: [
      { tag: "MOST POPULAR", featured: true, title: "CertainTeed Mainstreet vinyl", text: "Classic lap siding with a natural wood-grain texture and a wide range of colors.", points: ["Double 4″ clapboard and Dutch lap profiles", "Never needs painting", "Easy to clean with a garden hose"], price: from(estimateSiding({ ...typical, material: "vinyl", trim: false, shutters: false })) },
      { tag: "EXTRA RIGIDITY", title: "Insulated / premium vinyl", text: "Thicker panels with a contoured foam backing for straighter walls and better impact resistance.", points: ["Flatter, more solid look", "Adds a layer of insulation", "Deeper color options"], price: from(estimateSiding({ ...typical, material: "insulated-vinyl", trim: false, shutters: false })) },
      { tag: "PAINTED-WOOD LOOK", title: "Fiber cement", text: "A dense, non-combustible board that holds crisp lines and painted color.", points: ["Resists fire, pests and rot", "Available pre-finished", "A premium, traditional look"], price: from(estimateSiding({ ...typical, material: "fiber-cement", trim: false, shutters: false })) },
    ],
    calcTitle: "See your siding price in under a minute.",
    calcText: "Answer four quick questions for an instant, no-obligation price range.",
    calcHref: "/siding-cost-calculator",
    signsTitle: "Signs it’s time for new siding",
    signs: ["Cracked, warped or loose panels after storms", "Faded color that no longer cleans up", "Soft spots, rot or peeling paint on the wall behind", "Mold, mildew or water stains inside exterior walls", "Rising energy bills and drafty rooms", "Getting the house ready to sell"],
    process: [
      { title: "Free inspection", text: "We check the walls, trim and transitions and talk through colors and profiles." },
      { title: "Written estimate", text: "You get the material, trim, removal and moisture details in writing." },
      { title: "Clean installation", text: "Old siding comes off, house wrap and flashing go on, then the new siding and trim." },
      { title: "Final walkthrough", text: "We walk the property with you and leave the site clean." },
    ],
    bundleTitle: "Plan the whole exterior once.",
    bundleText: "Siding, roof edges and gutters meet at the same corners. Doing them together keeps the transitions clean and puts one crew on one schedule.",
    bundleLinks: [["Roof replacement", "/services/roof-replacement"], ["Seamless gutters", "/services/gutters"], ["Roof cost calculator", "/roof-cost-calculator"]],
    faqs: [
      { question: "How long does siding replacement take?", answer: "Most single-family homes take a few working days once materials arrive. Your estimate includes a schedule based on the size of the home and the scope." },
      { question: "Can new siding go over the old siding?", answer: "We recommend removing old siding so we can see and repair the sheathing and install proper house wrap and flashing. Covering over hides problems." },
      { question: "Do you replace soffit, fascia and trim too?", answer: "Yes. We can wrap trim and replace soffit and fascia as part of the same project for a finished, low-maintenance exterior." },
      { question: "Is financing available for siding?", answer: "Financing is available for qualified homeowners, subject to credit approval and lender terms." },
    ],
  },
  gutters: {
    slug: "gutters",
    eyebrow: "Seamless gutters in Maryland",
    title: "Seamless gutters that move water away.",
    intro: "We form seamless aluminum gutters on site to fit your home, then plan every downspout so rainwater leaves the roof and clears the foundation.",
    optionsTitle: "Gutter options for your home.",
    optionsIntro: "All gutters are formed on site with no seams along the run. Price ranges are for a typical 2-story home, 1,750–2,500 sq ft, hip roof.",
    options: [
      { tag: "MOST HOMES", featured: true, title: "5″ seamless K-style", text: "The standard for Maryland homes, sized for typical roof areas and slopes.", points: ["Formed on site to exact length", "Hidden hangers", "Many colors to match trim"], price: from(estimateGutters({ ...typical, shape: "hip", gutter: "5in", guards: false, removeOld: false })) },
      { tag: "MORE CAPACITY", title: "6″ seamless K-style", text: "Carries roughly 40% more water for large, steep or complex roofs.", points: ["Fewer overflow problems", "Larger 3×4 downspouts", "Good for long runs"], price: from(estimateGutters({ ...typical, shape: "hip", gutter: "6in", guards: false, removeOld: false })) },
      { tag: "LESS CLEANING", title: `${gutterRates.guards.label}`, text: "Fine stainless mesh keeps leaves, needles and seeds out of the gutter.", points: ["Fits new or existing gutters", "Lets water in, keeps debris out", "Fewer trips up the ladder"], price: `Adds ${formatUsd(gutterRates.guards.low)}–${formatUsd(gutterRates.guards.high)} per foot` },
    ],
    calcTitle: "See your gutter price in under a minute.",
    calcText: "Answer five quick questions for an instant, no-obligation price range.",
    calcHref: "/gutter-cost-calculator",
    signsTitle: "Signs it’s time for new gutters",
    signs: ["Water spilling over the edge during rain", "Sagging runs or gutters pulling off the fascia", "Leaking seams, rust or peeling paint", "Pooling water or erosion near the foundation", "Stains on siding below the gutters", "A damp basement after storms"],
    process: [
      { title: "Free inspection", text: "We check the fascia, roof edge, runs and where every downspout discharges." },
      { title: "Written estimate", text: "You get gutter size, downspout layout, guards and removal in writing." },
      { title: "Formed on site", text: "Each run is formed on site to length, so there are no seams along it to leak." },
      { title: "Water test", text: "We check the pitch and flow and clean up before we leave." },
    ],
    bundleTitle: "Roof, siding and gutters, together.",
    bundleText: "Gutters hang on the same roof edge and fascia as your roof and siding. Replacing them together gets the drip edge, flashing and trim right the first time.",
    bundleLinks: [["Roof replacement", "/services/roof-replacement"], ["Siding replacement", "/services/siding"], ["Siding cost calculator", "/siding-cost-calculator"]],
    faqs: [
      { question: "What are seamless gutters?", answer: "Seamless gutters are formed from a continuous coil of aluminum at your home, so each run is one piece with joints only at corners and outlets. Fewer seams means fewer leaks." },
      { question: "How many downspouts will I need?", answer: "Usually one for every 30 to 40 feet of gutter, depending on roof area and layout. We plan placement so water discharges away from walkways and the foundation." },
      { question: "Can you replace rotted fascia?", answer: "Yes. Damaged fascia boards need to be replaced before new gutters are hung. We’ll note any fascia repair in your written estimate." },
      { question: `Why is there a ${formatUsd(gutterRates.minimum)} minimum?`, answer: "Every gutter project has setup, equipment and forming time no matter how short the runs are. Small projects are priced to cover that." },
    ],
  },
};

export function ServiceLanding({ slug }: { slug: "siding" | "gutters" }) {
  const l = landings[slug];
  const photo = pagePhotos[slug];
  const path = `/services/${slug}`;
  return (
    <main id="main" className="svc-page">
      <section className="page-hero page-hero-visual" data-tone="dark">
        <div className="wrap page-hero-grid">
          <div className="page-hero-copy">
            <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/services">Services</Link> / <span aria-current="page">{slug === "siding" ? "Siding" : "Gutters"}</span></nav>
            <p className="eyebrow">{l.eyebrow.toUpperCase()}</p>
            <h1>{l.title}</h1>
            <p className="intro">{l.intro}</p>
            <div className="page-hero-actions">
              <Link className="button" href="#request-inspection">Get my free estimate</Link>
              <Link className="text-link" href={l.calcHref}>Estimate my cost</Link>
            </div>
            <ul className="svc-trust">
              <li>Free, no-obligation inspections</li>
              <li>Clear, written estimates</li>
              <li>Locally owned in {business.city}</li>
              <li>{business.license}</li>
            </ul>
          </div>
          {photo && <figure className="page-hero-image"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 100vw, 45vw" loading="eager" style={slug === "siding" ? { objectPosition: "left center" } : undefined} />{photo.caption && <figcaption>{photo.caption}</figcaption>}</figure>}
        </div>
      </section>
      <section className="wrap section">
        <p className="eyebrow">MATERIALS</p>
        <h2>{l.optionsTitle}</h2>
        <p className="calc-table-note">{l.optionsIntro}</p>
        {ratesAreDraft && <p className="calc-draft-notice" role="note"><strong>Preview pricing:</strong> The ranges below use draft planning assumptions, not approved WeRoof prices. Your free inspection and written estimate establish the actual scope and cost.</p>}
        <div className="svc-options">
          {l.options.map((o) => (
            <article key={o.title} className={o.featured ? "is-featured" : undefined}>
              <span>{o.tag}</span>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
              <ul>{o.points.map((p) => <li key={p}>{p}</li>)}</ul>
              <p className="svc-price">{ratesAreDraft ? "Illustrative planning range" : "Estimated installed price"}<strong>{o.price}</strong></p>
            </article>
          ))}
        </div>
      </section>
      <section className="svc-calc-band">
        <div className="wrap">
          <div><h2>{l.calcTitle}</h2><p>{l.calcText}</p></div>
          <Link className="button" href={l.calcHref}>Open the calculator</Link>
        </div>
      </section>
      <section className="wrap section svc-signs">
        <div><p className="eyebrow">WHEN TO REPLACE</p><h2>{l.signsTitle}</h2></div>
        <ul>{l.signs.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>
      <section className="svc-process">
        <div className="wrap">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>Four clear steps, start to finish.</h2>
          <div className="estimate-details">{l.process.map((p, i) => <div key={p.title}><span>0{i + 1}</span><h3>{p.title}</h3><p>{p.text}</p></div>)}</div>
        </div>
      </section>
      <section className="svc-bundle">
        <div className="wrap">
          <div><p className="eyebrow">ONE CREW, ONE SCHEDULE</p><h2>{l.bundleTitle}</h2><p>{l.bundleText}</p></div>
          <div className="other-services">{l.bundleLinks.map(([t, h]) => <Link key={h} href={h}>{t}</Link>)}</div>
        </div>
      </section>
      <section className="wrap section faq-section">
        <div><p className="eyebrow">{slug.toUpperCase()} QUESTIONS</p><h2>Good questions.<br />Straight answers.</h2></div>
        <FAQs items={l.faqs} />
      </section>
      <section className="wrap section svc-form" id="request-inspection">
        <div><p className="eyebrow">LET’S START WITH YOUR HOME</p><h2>Get your free {slug} estimate.</h2><p className="calc-table-note">Tell us about your project and we’ll arrange a time to inspect and give you a written price.</p></div>
        <LeadForm source={path} />
      </section>
      <JsonLd data={faqSchema(l.faqs)} />
    </main>
  );
}
