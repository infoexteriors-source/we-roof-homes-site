import Image from "next/image";
import Link from "next/link";
import { getContent } from "@/lib/cms";
import { photos, pagePhotos, business } from "@/lib/content";
import { LeadForm } from "@/components/LeadForm";
import { RoofSystem } from "@/components/RoofSystem";
import { HeroRoofBuild } from "@/components/HeroRoofBuild";
import { ManufacturerLogos } from "@/components/ManufacturerLogos";
import { GoogleReviews } from "@/components/GoogleReviews";
import { ArrowLink, FAQs, JsonLd, faqSchema } from "@/components/Shared";

export const revalidate = 3600;
export const metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "Maryland Roofing Contractor | WeRoof",
    description: "Free roof inspections and written estimates from a locally owned Silver Spring roofer. New roofs from $2,999 for qualifying projects; $0 down financing for qualified homeowners.",
    url: "/",
  },
};
const mainServices = [
  { title: "Roofing", href: "/services/roof-replacement", description: "Replacement, repair and storm damage", photo: photos.homeServices },
  { title: "Siding", href: "/services/siding", description: "New siding and trim", photo: pagePhotos.services },
  { title: "Gutters", href: "/services/gutters", description: "Seamless gutters and drainage", photo: pagePhotos.gutters },
];
export default async function Home() {
  const c = await getContent();
  return (
    <main id="main" className="brand-home">
      <section className="landing-hero" aria-labelledby="home-title">
        <div className="landing-photo">
          <Image src={photos.hero} alt="Roofers working on a standing-seam metal roof" fill loading="eager" fetchPriority="high" sizes="100vw" quality={80} />
          <video autoPlay muted loop playsInline preload="none" poster={photos.hero} aria-hidden="true" tabIndex={-1} disablePictureInPicture>
            <source src="/assets/video/weroof-roof-hero.mp4" type="video/mp4" media="(min-width: 761px) and (prefers-reduced-motion: no-preference)" />
          </video>
        </div>
        <div className="landing-intro">
          <p className="eyebrow">MARYLAND ROOFING, SIDING &amp; GUTTERS</p>
          <h1 id="home-title">Strong roofs.<br /><span>Straight answers.</span></h1>
          <p className="landing-description">Maryland roofing with a clear plan from inspection to installation.<span>We inspect, document and explain before we quote.</span></p>
          <div className="landing-actions">
            <a className="button" href="#inspection">Get my free inspection <span aria-hidden="true">→</span></a>
            <a className="button landing-call" href={`tel:${business.tel}`}>Call {business.phone}</a>
          </div>
          <div className="landing-offer" aria-label="Current roofing offers">
            <p className="landing-offer-kicker">MORE ROOF. LESS UPFRONT.</p>
            <div className="landing-prices">
              <div><span>NEW ROOFS STARTING AT</span><strong>$2,999<sup>*</sup></strong></div>
              <div><span>FINANCING AVAILABLE</span><strong>$0 <small>DOWN*</small></strong></div>
            </div>
            <p className="landing-terms">*Qualifying projects and applicants. <a href="#offer-details">See offer details.</a></p>
          </div>
        </div>
        <div className="landing-trust" aria-label="WeRoof at a glance">
          <span><b aria-hidden="true">⌂</b> Locally owned in Maryland</span>
          <span><b aria-hidden="true">✓</b> {business.license}</span>
          <span><b aria-hidden="true">▤</b> Clear, written estimates</span>
          <span><b aria-hidden="true">◎</b> Free, no-obligation inspections</span>
        </div>
        <div className="landing-form" id="inspection"><LeadForm /></div>
      </section>
      <HeroRoofBuild />
      <section className="landing-services wrap section" aria-labelledby="services-title">
        <div className="section-head">
          <div><p className="eyebrow">WHAT WE DO</p><h2 id="services-title">Roofing, siding and<br />gutters, done right.</h2></div>
          <ArrowLink href="/services">Explore all services</ArrowLink>
        </div>
        <div className="landing-service-grid">
          {mainServices.map(service => <Link className="landing-service" href={service.href} key={service.title}>
            <Image src={service.photo.src} alt={service.photo.alt} width={720} height={480} sizes="(max-width: 760px) 96px, 30vw" />
            <div><h3>{service.title}</h3><p>{service.description}</p></div><span aria-hidden="true">→</span>
          </Link>)}
        </div>
        <p className="landing-photo-note">Illustrative photography.</p>
      </section>
      <section className="landing-process" id="how-it-works">
        <div className="wrap section">
          <p className="eyebrow">HOW IT WORKS</p><h2>Three steps. No surprises.</h2>
          <ol>{[
            ["Request your free inspection", "Tell us about your home. It takes about 60 seconds."],
            ["We inspect and document", "We assess your roof, take photos and explain what we find."],
            ["Get a clear, written estimate", "Straight numbers, no pressure. You decide when you’re ready."],
          ].map(([title, description], index) => <li key={title}><span className="process-number">{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
          <a href="#inspection" className="button">Get my free inspection <span aria-hidden="true">→</span></a>
        </div>
      </section>
      <ManufacturerLogos />
      <RoofSystem parts={c.roofParts} />
      <div className="diagram-cta wrap"><p>Not sure what your roof needs? That’s what we’re here for.</p><a href="#inspection" className="button">Get my free inspection &amp; estimate</a></div>
      <section className="landing-assurance wrap section">
        <div className="landing-reviews"><p className="eyebrow">REVIEWS</p><h2>What homeowners say.</h2>
          {c.testimonials.length ? c.testimonials.slice(0, 2).map(t => <blockquote key={t.name}><p>“{t.quote}”</p><cite>{t.name} · <a href={t.sourceUrl} rel="noopener noreferrer">{t.source}</a></cite></blockquote>) : <GoogleReviews compact />}
          <ArrowLink href="/reviews">Explore homeowner reviews</ArrowLink>
        </div>
        <div><p className="eyebrow">QUESTIONS</p><h2>Straight answers.</h2><FAQs items={c.faqs} /><JsonLd data={faqSchema(c.faqs)} /></div>
      </section>
      <section className="landing-finance" id="offer-details"><div className="wrap section">
        <div><p className="eyebrow">A STRONG ROOF. A REALISTIC PLAN.</p><h2>Your roof shouldn’t<br />have to wait.</h2><p>Explore financing for qualified homeowners through Pure Finance.</p><ArrowLink href="/financing">Explore financing options</ArrowLink></div>
        <div className="landing-finance-detail"><span>NEW ROOFS STARTING AT</span><strong>$2,999<sup>*</sup></strong><p>$0 down financing available for qualified homeowners.</p><p className="offer-terms">{c.offer.terms}</p></div>
      </div></section>
      {c.projects.length > 0 && <section className="wrap section"><p className="eyebrow">OUR WORK</p><h2>A home you’re proud of.</h2><div className="project-grid">{c.projects.slice(0, 3).map(p => <article key={p.title}><Image src={p.image} alt={p.alt || p.title} width={900} height={600} /><p className="eyebrow">{p.city} · {p.service}</p><h3>{p.title}</h3><p>{p.description}</p></article>)}</div><ArrowLink href="/projects">More of our work</ArrowLink></section>}
      <section className="areas-section wrap section">
        <div><p className="eyebrow">LOCAL ROOTS. MARYLAND REACH.</p><h2>Right here.<br />Ready to help.</h2><p>Based in Silver Spring. Serving Maryland communities within approximately a one-hour drive of downtown Bethesda.</p><ArrowLink href="/service-areas">Find your service area</ArrowLink></div>
        <div className="area-list">{c.locations.map(l => <Link href={`/service-areas/${l.slug}`} key={l.slug}>{l.title.replace("Roofing & Exterior Services in ", "").replace(", MD", "")}</Link>)}</div>
      </section>
      <section className="landing-closing"><div className="wrap section"><p className="eyebrow">YOUR NEXT CHAPTER STARTS UP TOP</p><h2>Let’s put a better roof<br />over your head.</h2><p>Start with a conversation. We’ll take it from there.</p><div className="landing-actions"><a className="button landing-call" href="#inspection">Get my free inspection <span aria-hidden="true">→</span></a><a className="landing-closing-phone" href={`tel:${business.tel}`}>{business.phone}</a></div></div></section>
    </main>
  );
}
