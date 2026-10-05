import Image from "next/image";
import Link from "next/link";
import { getContent } from "@/lib/cms";
import { photos, business } from "@/lib/content";
import { LeadForm } from "@/components/LeadForm";
import { RoofSystem } from "@/components/RoofSystem";
import { HeroRoofMotion } from "@/components/HeroRoofMotion";
import { HeroRoofBuild } from "@/components/HeroRoofBuild";
import { ManufacturerLogos } from "@/components/ManufacturerLogos";
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
export default async function Home() {
  const c = await getContent();
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-photo">
          <Image
            src={photos.hero}
            alt="Two roofers inspecting a dark standing-seam metal roof"
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            quality={75}
          />
          <video
            className="hero-background-video"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={photos.hero}
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
          >
            <source
              src="/assets/video/weroof-roof-hero.mp4"
              type="video/mp4"
              media="(min-width: 651px) and (prefers-reduced-motion: no-preference)"
            />
          </video>
        </div>
        <div className="hero-shape" />
        <HeroRoofMotion />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1>
              <span className="eyebrow hero-kicker">
                <span className="live-dot" aria-hidden="true" /> Maryland roofing contractor
              </span>{" "}
              Strong roofs.
              <br /><span>Straight answers.</span>
            </h1>
            <p className="hero-description">
              Maryland roofing with a clear plan
              <br />from inspection to installation.
            </p>
            <div className="hero-offer-panel" aria-label="Current roofing offers">
              <p className="hero-offer-kicker">MORE ROOF. LESS UPFRONT.</p>
              <div className="hero-offers">
                <div>
                  <span>NEW ROOFS STARTING AT</span>
                  <strong>
                    $2,999<span>*</span>
                  </strong>
                </div>
                <div>
                  <span>FINANCING AVAILABLE</span>
                  <strong>
                    $0 <small>DOWN*</small>
                  </strong>
                </div>
              </div>
              <p className="hero-fine">
                *Qualifying projects and applicants.{" "}
                <a href="#offer-details">See offer details.</a>
              </p>
            </div>
            <p className="hero-urgent">
              Leak or storm damage right now?{" "}
              <a href={`tel:${business.tel}`}>
                Call {business.phone}
              </a>
            </p>
          </div>
          <div className="hero-form" id="inspection">
            <LeadForm />
          </div>
        </div>
        <div className="hero-caption">
          BUILT FOR MARYLAND. BUILT AROUND YOU.
        </div>
      </section>
      <HeroRoofBuild />
      <section className="trust-strip" aria-label="WeRoof at a glance">
        <div className="wrap">
          <span>
            <b aria-hidden="true">⌂</b> Locally owned in Maryland
          </span>
          <span>
            <b aria-hidden="true">✓</b> {business.license}
          </span>
          <span>
            <b aria-hidden="true">✎</b> Clear, written estimates
          </span>
          <span>
            <b aria-hidden="true">♡</b> Free, no-obligation inspections
          </span>
        </div>
      </section>
      <ManufacturerLogos />
      <RoofSystem parts={c.roofParts} />
      <div className="diagram-cta wrap">
        <p>Not sure what your roof needs? That’s what we’re here for.</p>
        <Link href="/contact" className="button">
          Get My Free Inspection & Estimate
        </Link>
      </div>
      <section className="services-section wrap section">
        <div className="section-head">
          <div>
            <p className="eyebrow">ONE TEAM. YOUR WHOLE EXTERIOR.</p>
            <h2>
              Whatever your home needs,
              <br />
              we’ve got you covered.
            </h2>
          </div>
          <ArrowLink href="/services">Explore all services</ArrowLink>
        </div>
        <div className="service-feature">
          <div className="service-photo">
            <Image
              src={photos.homeServices.src}
              alt={photos.homeServices.alt}
              fill
              sizes="(max-width:800px) 100vw, 45vw"
            />
            <div className="photo-label">PROTECTION STARTS AT THE TOP.</div>
          </div>
          <div className="service-list">
            {c.services.slice(0, 4).map((s, i) => (
              <Link href={`/services/${s.slug}`} key={s.slug}>
                <span className="list-number">0{i + 1}</span>
                <div>
                  <h3>
                    {s.title.replace(" in Maryland", "").replace("Free ", "")}
                  </h3>
                  <p>
                    {
                      [
                        "A fresh start. A complete roofing system.",
                        "Find the problem. Make it right.",
                        "Know your roof. Know your options.",
                        "Clear next steps after rough weather.",
                      ][i]
                    }
                  </p>
                </div>
              </Link>
            ))}
            <div className="other-services">
              <Link href="/services/siding">Siding</Link>
              <Link href="/services/gutters">Gutters</Link>
              <Link href="/services/insurance-assistance">
                Insurance help
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="process-section">
        <div className="wrap process-grid">
          <div>
            <p className="eyebrow">LESS GUESSWORK. MORE PEACE OF MIND.</p>
            <h2>
              A clear plan.
              <br />
              From the first hello
              <br />
              to the final nail.
            </h2>
            <ArrowLink href="/about">Meet WeRoof</ArrowLink>
          </div>
          <div className="process-steps">
            {[
              [
                "We listen. Then we look.",
                "Tell us what’s happening. We inspect your roof and explain what we find.",
              ],
              [
                "You get the full picture.",
                "A written scope, clear pricing and payment options. You decide what’s right for your home.",
              ],
              [
                "We get to work.",
                "We coordinate your installation, keep you informed and care for your property.",
              ],
              [
                "We finish with care.",
                "A final walkthrough and cleanup. We answer your questions before calling it complete.",
              ],
            ].map(([title, text], i) => (
              <article key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="financing-section wrap section" id="offer-details">
        <div className="finance-title">
          <p className="eyebrow">A STRONG ROOF. A REALISTIC PLAN.</p>
          <h2>
            Your roof shouldn’t
            <br />
            have to wait.
          </h2>
          <p>
            Explore payment options that help you take the next step with
            confidence.
          </p>
          <ArrowLink href="/financing">Let’s talk financing</ArrowLink>
        </div>
        <div className="finance-offer">
          <span>NEW ROOFS STARTING AT</span>
          <strong>
            $2,999<sup>*</sup>
          </strong>
          <div>
            <b>$0 down</b>
            <span>
              financing for
              <br />
              qualified homeowners
            </span>
          </div>
          <Link href="/contact" className="button">
            See what works for your home
          </Link>
        </div>
        <p className="offer-terms">{c.offer.terms}</p>
      </section>
      <section className="proof-section section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">{c.projects.length ? "THE WORK SHOULD SPEAK FOR ITSELF" : "KNOW WHAT YOU’RE SAYING YES TO"}</p>
              <h2>{c.projects.length ? "A home you’re proud to come home to." : "A clear estimate. No guesswork."}</h2>
            </div>
            <ArrowLink href="/projects">Our work & approach</ArrowLink>
          </div>
          {c.projects.length ? (
            <div className="project-grid">
              {c.projects.slice(0, 3).map((p) => (
                <article key={p.title}>
                  <Image
                    src={p.image}
                    width={900}
                    height={600}
                    alt={p.alt || p.title}
                  />
                  <p className="eyebrow">
                    {p.city} · {p.service}
                  </p>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="estimate-details">
              <div><span>01</span><h3>The condition.</h3><p>Understand what we found, where the concerns are, and which work is recommended.</p></div>
              <div><span>02</span><h3>The scope.</h3><p>Review the proposed materials, installation details, and work included in your project.</p></div>
              <div><span>03</span><h3>The investment.</h3><p>See the project price and discuss payment options before deciding how to proceed.</p></div>
            </div>
          )}
          {c.testimonials.length > 0 && (
            <div className="testimonials">
              {c.testimonials.slice(0, 3).map((t) => (
                <blockquote key={t.name}>
                  <p>“{t.quote}”</p>
                  <cite>
                    {t.name} ·{" "}
                    <a href={t.sourceUrl} rel="noopener noreferrer">
                      {t.source}
                    </a>
                  </cite>
                </blockquote>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="areas-section wrap section">
        <div>
          <p className="eyebrow">LOCAL ROOTS. MARYLAND REACH.</p>
          <h2>
            Right here.
            <br />
            Ready to help.
          </h2>
          <p>
            Based in Silver Spring. Serving Maryland communities within
            approximately a one-hour drive of downtown Bethesda with roofing,
            siding and gutter solutions.
          </p>
          <ArrowLink href="/service-areas">Find your service area</ArrowLink>
        </div>
        <div className="area-list">
          {c.locations.map((l) => (
            <Link href={`/service-areas/${l.slug}`} key={l.slug}>
              {l.title
                .replace("Roofing & Exterior Services in ", "")
                .replace(", MD", "")}
            </Link>
          ))}
        </div>
      </section>
      <section className="faq-section wrap section">
        <div>
          <p className="eyebrow">A FEW THINGS YOU MAY BE WONDERING</p>
          <h2>
            Good questions.
            <br />
            Straight answers.
          </h2>
          <ArrowLink href="/resources">More homeowner guides</ArrowLink>
        </div>
        <FAQs items={c.faqs} />
        <JsonLd data={faqSchema(c.faqs)} />
      </section>
      <section className="closing-section">
        <div className="wrap closing-grid">
          <div>
            <p className="eyebrow">YOUR NEXT CHAPTER STARTS UP TOP</p>
            <h2>
              Let’s put a<br />better roof<br />over your head.
            </h2>
            <p>
              Start with a conversation.
              <br />
              We’ll take it from there.
            </p>
            <a className="closing-phone" href={`tel:${business.tel}`}>
              {business.phone}
            </a>
          </div>
          <LeadForm compact source="homepage-footer" />
        </div>
      </section>
    </main>
  );
}
