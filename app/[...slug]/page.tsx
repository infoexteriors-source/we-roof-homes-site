import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getContent, type SiteContent } from "@/lib/cms";
import { business, pagePhotos, siteUrl, type ContentPage } from "@/lib/content";
import { LeadForm } from "@/components/LeadForm";
import { ArrowLink, FAQs, JsonLd, PageSchema, faqSchema } from "@/components/Shared";
import { RoofReference } from "@/components/RoofReference";
import { ServiceDirectory } from "@/components/ServiceDirectory";
import { ManufacturerLogos } from "@/components/ManufacturerLogos";
import { ServiceAreaDirectory } from "@/components/ServiceAreaDirectory";
import { GoogleReviews } from "@/components/GoogleReviews";
import { getServiceArea, nearbyServiceAreas, serviceAreaPage, serviceAreas } from "@/lib/service-areas";
export const revalidate = 3600;
const dedicatedServicePages = ["siding", "gutters"];
const core: Record<
  string,
  { seoTitle: string; title: string; description: string; eyebrow: string }
> = {
  about: {
    seoTitle: "About Us: Silver Spring, MD Roofing Company",
    title: "Good roofs start with good people.",
    description:
      "Get to know WeRoof, a locally owned Maryland roofing and exterior services company based in Silver Spring.",
    eyebrow: "ABOUT WEROOF",
  },
  services: {
    seoTitle: "Roofing, Siding & Gutter Services in Maryland",
    title: "Your home. Covered from the outside in.",
    description:
      "Explore WeRoof roof inspections, repairs, replacements, storm damage, siding and gutter services in Maryland.",
    eyebrow: "ROOFING & EXTERIOR SERVICES",
  },
  "commercial-roofing": {
    seoTitle: "Commercial Roofing Contractor in Maryland",
    title: "Commercial roofing with a clear plan.",
    description: "Explore TPO, EPDM, metal, asphalt and flat roofing services for Maryland commercial properties. Request a site-specific WeRoof assessment.",
    eyebrow: "COMMERCIAL ROOFING IN MARYLAND",
  },
  financing: {
    seoTitle: "Roof Financing in Maryland: $0 Down Options",
    title: "A better roof. A payment plan that fits.",
    description:
      "Explore $0 down roof financing for qualified Maryland homeowners and new roofs starting at $2,999 for qualifying projects.",
    eyebrow: "ROOF FINANCING IN MARYLAND",
  },
  contact: {
    seoTitle: "Contact Us: Free Roof Inspection & Estimate",
    title: "Let’s take a look at your roof.",
    description:
      "Request a free roof inspection and estimate from WeRoof. Call (240) 795-9365 or tell us about your Maryland home.",
    eyebrow: "YOUR NEXT STEP STARTS HERE",
  },
  "service-areas": {
    seoTitle: "Roofing Service Areas Near Bethesda & Silver Spring, MD",
    title: "Roofing close to home.",
    description:
      "Find Maryland roofing service areas within approximately one hour of downtown Bethesda. Browse local communities for inspections, roof repairs, replacement, siding and gutters.",
    eyebrow: "ONE HOUR FROM DOWNTOWN BETHESDA",
  },
  projects: {
    seoTitle: "Roofing Projects & Our Approach",
    title: "The details make the difference.",
    description:
      "Learn how WeRoof documents roofing and exterior projects, and request examples relevant to your Maryland home.",
    eyebrow: "OUR WORK & APPROACH",
  },
  reviews: {
    seoTitle: "WeRoof Customer Reviews & References",
    title: "Hear it from homeowners.",
    description:
      "Read current WeRoof customer reviews from Google Maps and request references for roofing and exterior work in Maryland.",
    eyebrow: "THE HOMEOWNER EXPERIENCE",
  },
  resources: {
    seoTitle: "Maryland Roofing Guides for Homeowners",
    title: "Your roof. Better understood.",
    description:
      "Straightforward Maryland roofing guides covering cost, financing, storm damage and repair versus replacement.",
    eyebrow: "THE HOMEOWNER’S FIELD GUIDE",
  },
  "privacy-policy": {
    seoTitle: "Privacy Policy",
    title: "Privacy Policy",
    description:
      "Learn how WeRoof handles inspection requests, contact details, SMS preferences and optional website analytics.",
    eyebrow: "YOUR INFORMATION",
  },
  terms: {
    seoTitle: "Website & Offer Terms",
    title: "Website & Offer Terms",
    description:
      "Read WeRoof website, inspection, promotional pricing and financing terms.",
    eyebrow: "CLEAR EXPECTATIONS",
  },
  "thank-you": {
    seoTitle: "Thank You",
    title: "Your request is with our team.",
    description:
      "What happens after requesting a WeRoof inspection and estimate.",
    eyebrow: "THANK YOU",
  },
  "roof-system": {
    seoTitle: "How a Roofing System Works: Every Layer Explained",
    title: "Every layer has a job.",
    description:
      "Explore the framing, insulation, membranes, shingles and ventilation in a complete residential roofing system.",
    eyebrow: "THE WEROOF SYSTEM",
  },
};
const sectionLabels: Record<string, string> = {
  services: "Services",
  "commercial-roofing": "Commercial roofing",
  "service-areas": "Service areas",
  resources: "Homeowner guides",
};
function searchTitle(item: { title: string; seoTitle?: string; kind?: string }, section?: string) {
  if (item.seoTitle) return item.seoTitle;
  if (item.kind === "service" && section === "services" && !/free/i.test(item.title)) return `${item.title}: Free Estimates`;
  return item.title;
}
function CommercialRoofIllustration() {
  return <figure className="commercial-hero-illustration">
    <svg viewBox="0 0 640 420" role="img" aria-labelledby="commercial-roof-art-title">
      <title id="commercial-roof-art-title">Illustration of a commercial low-slope roof and its building structure</title>
      <defs><linearGradient id="commercial-roof-plane" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#565d5a"/><stop offset="1" stopColor="#262c2a"/></linearGradient></defs>
      <path d="M64 157 422 66 578 155 218 247Z" fill="url(#commercial-roof-plane)" stroke="#a7aeaa" strokeWidth="3"/>
      <path d="M64 157 218 247 218 358 64 269Z" fill="#2e3633"/>
      <path d="M218 247 578 155 578 270 218 358Z" fill="#1d2422"/>
      <path d="M90 162 429 78M114 178 453 91M138 194 476 104M163 209 502 120M189 226 527 135" stroke="#969f9a" strokeOpacity=".58" strokeWidth="2"/>
      <path d="M64 157 422 66 578 155" fill="none" stroke="#e44a4c" strokeWidth="5"/>
      <path d="M218 247 578 155" fill="none" stroke="#e44a4c" strokeWidth="4"/>
      <path d="M270 269V335M331 254V320M392 238V304M453 222V288M514 206V272" stroke="#68716c" strokeWidth="3"/>
      <circle cx="432" cy="148" r="10" fill="#171d1b" stroke="#bbc4bd" strokeWidth="3"/>
      <path d="M432 148v55l-22 11" fill="none" stroke="#e44a4c" strokeWidth="3" strokeDasharray="5 6"/>
    </svg>
    <figcaption>Roof planning begins with the assembly and drainage.</figcaption>
  </figure>;
}
function findPage(c: SiteContent, parts: string[]) {
  const [group, slug] = parts;
  const area = group === "service-areas" ? getServiceArea(slug) : undefined;
  if (group === "service-areas" && !area) return undefined;
  return parts.length === 2
    ? (group === "services"
        ? c.services
        : group === "commercial-roofing"
          ? c.commercialServices
        : group === "service-areas"
          ? c.locations
          : group === "resources"
            ? c.articles
            : []
      ).find((p) => p.slug === slug) || (area ? serviceAreaPage(area) : undefined)
    : undefined;
}
export async function generateStaticParams() {
  const c = await getContent();
  return [
    ...Object.keys(core).map((x) => ({ slug: [x] })),
    // Siding and gutters have dedicated pages under app/services.
    ...c.services.filter((x) => !dedicatedServicePages.includes(x.slug)).map((x) => ({ slug: ["services", x.slug] })),
    ...c.commercialServices.map((x) => ({ slug: ["commercial-roofing", x.slug] })),
    ...serviceAreas.map((x) => ({ slug: ["service-areas", x.slug] })),
    ...c.articles.map((x) => ({ slug: ["resources", x.slug] })),
  ];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await getContent();
  const page = findPage(c, slug);
  const item = page || (slug.length === 1 ? core[slug[0]] : null);
  if (!item) return {};
  const path = "/" + slug.join("/");
  const title = searchTitle(item, slug[0]);
  return {
    title,
    description: item.description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | WeRoof`, description: item.description, url: path, type: page?.kind === "article" ? "article" : "website" },
    twitter: { card: "summary_large_image", title: `${title} | WeRoof`, description: item.description },
    robots: {
      index:
        process.env.SITE_LAUNCH_READY === "true" &&
        slug[0] !== "thank-you",
      follow: true,
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const c = await getContent();
  const page = findPage(c, slug);
  const key = slug[0];
  const localArea = key === "service-areas" && slug.length === 2 ? getServiceArea(slug[1]) : undefined;
  const item = page || (slug.length === 1 ? core[key] : null);
  if (!item) notFound();
  const path = "/" + slug.join("/");
  const visualHero = ((["services", "about", "financing"].includes(key) && !page) || page?.kind === "service" || page?.kind === "location") && key !== "commercial-roofing";
  const legalPage = key === "terms" || key === "privacy-policy";
  const heroPhoto = key === "about" ? undefined : pagePhotos[page ? page.slug : key];
  const areaName = page?.kind === "location" || localArea ? (localArea?.name || page?.title.replace(/^.* in /, "").replace(/, (MD|Maryland)$/, "")) : undefined;
  const tone = legalPage || key === "thank-you" ? undefined
    : key === "commercial-roofing" || key === "projects" || key === "roof-system" ? "slate"
    : key === "service-areas" || key === "about" || key === "reviews" ? "sand"
    : key === "financing" ? "red"
    : page?.kind === "article" || key === "resources" || key === "contact" ? "sage"
    : "dark";
  const title = (
    <section data-tone={tone} className={`page-hero ${visualHero ? "page-hero-visual" : ""} ${key === "contact" ? "page-hero-contact" : ""} ${key === "about" ? "page-hero-about" : ""} ${key === "commercial-roofing" ? "page-hero-commercial" : ""}`}>
      <div className={`wrap ${visualHero || key === "commercial-roofing" ? "page-hero-grid" : ""}`}>
        <div className="page-hero-copy">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> /{" "}
          {page ? (
            <>
              <Link href={`/${key}`}>{sectionLabels[key] || key}</Link> /{" "}
            </>
          ) : null}
          <span aria-current="page">{page?.title || sectionLabels[key] || searchTitle(item).split(":")[0]}</span>
        </nav>
        {page ? <><p className="eyebrow">{item.eyebrow}</p><h1>{item.title}</h1></> : <h1><span className="eyebrow page-kicker">{item.eyebrow}</span>{" "}{item.title}</h1>}
        <p className="intro">{page?.intro || item.description}</p>
        {(visualHero || key === "commercial-roofing") && key !== "about" && <div className="page-hero-actions"><Link className="button" href={key === "commercial-roofing" ? `${page ? "#request-inspection" : "/contact?service=Commercial%20roofing#request-inspection"}` : "/contact#request-inspection"}>Get my free estimate</Link>{page?.slug === "roof-replacement" && <Link className="text-link" href="/roof-cost-calculator">Estimate my cost</Link>}<a className="text-link" href={key === "services" && !page ? "#explore-services" : "#page-content"}>{key === "services" && !page ? "Explore services" : "Learn what to expect"}</a></div>}
        {page?.kind === "article" && (
          <p className="article-meta">
            By {page.author || "WeRoof"}
            {page.updated
              ? ` · Updated ${new Date(page.updated).toLocaleDateString("en-US", { month: "long", year: "numeric", day: "numeric" })}`
              : ""}
          </p>
        )}
        </div>
        {key === "about" && <aside className="page-hero-form" id="request-inspection"><LeadForm source={path} /></aside>}
        {key === "commercial-roofing" && <CommercialRoofIllustration />}
        {visualHero && heroPhoto && <figure className="page-hero-image"><Image src={heroPhoto.src} alt={heroPhoto.alt} fill sizes="(max-width: 700px) 100vw, 45vw" loading="eager" />{heroPhoto.caption && <figcaption>{heroPhoto.caption}</figcaption>}</figure>}
        {visualHero && !heroPhoto && key !== "about" && <div className="page-hero-panel" aria-hidden="true"><span>{areaName ? "SERVICE AREA" : "WEROOF"}</span><strong>{areaName || "Maryland"}</strong><em>{areaName ? "Maryland" : "Roofing · Siding · Gutters"}</em></div>}
      </div>
    </section>
  );
  const coreSchema = !page && (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: sectionLabels[key] || searchTitle(item).split(":")[0], item: `${siteUrl}${path}` },
        ],
      }}
    />
  );
  if (page)
    return (
      <main id="main">
        {title}
        <div className="wrap content-layout" id="page-content">
          <article className="prose">
            <nav className="article-contents" aria-label="On this page"><p className="eyebrow">IN THIS GUIDE</p>{page.sections.map((s, i) => <a key={s.heading} href={`#section-${i + 1}`}>{s.heading}</a>)}</nav>
            {page.sections.map((s, i) => (
              <section key={s.heading} id={`section-${i + 1}`}>
                <h2>{s.heading}</h2>
                <p>{s.text}</p>
                {s.bullets && (
                  <ul>
                    {s.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
            {page.sources && (
              <section>
                <h2>Further reading</h2>
                {page.sources.map((s) => (
                  <p key={s.url}>
                    <a
                      href={s.url}
                      className="text-link"
                      rel="noopener noreferrer"
                    >
                      {s.label}
                    </a>
                  </p>
                ))}
              </section>
            )}
            {localArea && (
              <section className="local-area-nearby">
                <h2>Nearby Maryland communities</h2>
                <p>These listed communities are closest to {localArea.name} by Census reference point. Each address still needs its own route check.</p>
                <div className="other-services">
                  {nearbyServiceAreas(localArea).map((neighbor) => (
                    <Link key={neighbor.id} href={`/service-areas/${neighbor.slug}`}>{neighbor.name}</Link>
                  ))}
                </div>
                <p className="local-area-source">Coverage is based on <a href="https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html">U.S. Census place data</a> and <a href="https://project-osrm.org/">OSRM</a> road estimates using <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>. Estimates exclude traffic and are not appointment confirmations.</p>
              </section>
            )}
            <section className="plan-cta">
              <h2>{key === "commercial-roofing" ? "Your building deserves a clear plan." : "Your home deserves a clear plan."}</h2>
              <p>
                {key === "commercial-roofing" ? "We’ll help you understand the roof assembly and the work your property needs. Request a site assessment and written estimate to get started." : "We’ll help you understand your roof and the work it needs. Request your free inspection and estimate to get started."}
              </p>
              <ArrowLink href={key === "commercial-roofing" ? "#request-inspection" : "/contact"}>
                {key === "commercial-roofing" ? "Request a commercial roof assessment" : "Get My Free Inspection & Estimate"}
              </ArrowLink>
            </section>
            <section className="related-block">
              <h2>Related services & guides</h2>
              <div className="other-services">
                {(key === "commercial-roofing" ? c.commercialServices : c.services)
                  .filter((s) => s.slug !== page.slug)
                  .slice(0, 3)
                  .map((s) => (
                    <Link key={s.slug} href={`/${key === "commercial-roofing" ? "commercial-roofing" : "services"}/${s.slug}`}>
                      {s.title.replace(" in Maryland", "")}
                    </Link>
                  ))}
                <Link href="/resources">Homeowner guides</Link>
              </div>
            </section>
          </article>
          <aside className="content-aside" id="request-inspection">
            <LeadForm source={path} />
          </aside>
        </div>
        <PageSchema page={page} path={path} />
      </main>
    );
  if (key === "thank-you")
    return (
      <main id="main" className="thanks">
        <p className="eyebrow">YOUR HOME IS THE NEXT CONVERSATION</p>
        <h1>Thanks for reaching out.</h1>
        <p>
          If you just submitted the inspection form successfully, our team has
          received your request and will contact you to arrange a time. Your
          appointment is confirmed after we speak with you.
        </p>
        <p>
          Need to reach us sooner?{" "}
          <a className="text-link" href={`tel:${business.tel}`}>
            {business.phone}
          </a>
        </p>
        <Link className="button" href="/">
          Back to home
        </Link>
      </main>
    );
  const directory =
    key === "services"
      ? c.services
      : key === "commercial-roofing"
        ? c.commercialServices
      : key === "service-areas"
        ? c.locations
        : key === "resources"
          ? c.articles
          : null;
  if (directory)
    return (
      <main id="main">
        {title}
        {key === "services" ? <><ManufacturerLogos /><ServiceDirectory services={c.services} /><section className="commercial-teaser wrap"><div><p className="eyebrow">FOR COMMERCIAL PROPERTIES</p><h2>Every building has its own roof story.</h2><p>Explore low-slope membranes, metal and asphalt systems with a site-specific plan.</p></div><Link className="button" href="/commercial-roofing">Explore commercial roofing</Link></section></> : key === "service-areas" ? <ServiceAreaDirectory places={serviceAreas.map(place => ({ id: place.id, name: place.name, href: `/service-areas/${place.slug}` }))} /> : <section id="page-content" className={`wrap section link-directory directory-${key}`}>
          {directory.map((p) => (
            <Link key={p.slug} href={`/${key}/${p.slug}`}>
              <h2>
                {key === "service-areas" ? p.title.replace("Roofing & Exterior Services in ", "") : p.title}
              </h2>
              <p>{p.description}</p>
            </Link>
          ))}
        </section>}
        <section className="directory-close">
          <div className="wrap"><div><p className="eyebrow">LET’S MAKE A PLAN</p><h2>{key === "commercial-roofing" ? "Your property deserves clear answers." : "Your home deserves clear answers."}</h2><p>{key === "commercial-roofing" ? "Start with a site assessment and a written roof estimate." : "Start with a free inspection and a written estimate."}</p></div><Link className="button" href={key === "commercial-roofing" ? "/contact?service=Commercial%20roofing#request-inspection" : "/contact#request-inspection"}>{key === "commercial-roofing" ? "Request a commercial assessment" : "Get my free inspection"}</Link></div>
        </section>
        {coreSchema}
      </main>
    );
  return (
    <main id="main">
      {title}
      {key === "financing" && <section className="finance-programs" aria-labelledby="finance-programs-title">
        <div className="wrap">
          <div className="finance-programs-head"><p className="eyebrow">ROOF FINANCING</p><h2 id="finance-programs-title">A way forward, with the terms in front of you.</h2><p>WeRoof offers financing through Pure Finance. Available loan offers depend on the applicant and the project, so we discuss current options after we understand your roofing scope.</p></div>
          <div className="finance-programs-grid">
            <article className="finance-program-primary"><span>01 / PROJECT PLAN</span><h3>Start with a written roof estimate.</h3><p>Know the work and the cash project price before comparing payment options. Qualified homeowners can ask about $0 down financing.</p><Link className="button" href="#request-inspection">Request financing details</Link></article>
            <article className="finance-program-checklist"><span>02 / FINANCING REVIEW</span><h3>Compare the complete loan offer.</h3><ul><li>APR and any fees</li><li>Monthly payment and total repayment</li><li>Loan term and payment start date</li><li>Any promotional conditions</li></ul><p>Credit approval and the financing provider’s written disclosures govern the offer. This inspection form is not a credit application.</p></article>
          </div>
        </div>
      </section>}
      <div className={`wrap content-layout ${key === "contact" ? "contact-layout" : ""} ${legalPage ? "legal-layout" : ""}`} id="page-content">
        {key === "contact" && <aside className="content-aside contact-form" id="request-inspection"><LeadForm source={path} /></aside>}
        <article className="prose">
          {key === "about" && (
            <>
              <section>
                <h2>Local roots. Personal responsibility.</h2>
                <p>
                  WeRoof LLC is a locally owned roofing and exterior services
                  company based in Silver Spring, Maryland. We work with
                  homeowners who want clear answers, an organized project and
                  dependable workmanship.
                </p>
              </section>
              <section>
                <h2>We begin by listening.</h2>
                <p>
                  A roof project is a meaningful decision. We take time to
                  understand your concerns, inspect the visible conditions and
                  explain your options. You receive a written scope before
                  deciding how to proceed.
                </p>
              </section>
              <section>
                <h2>Our approach to your home</h2>
                <ul>
                  <li>Inspect before recommending work.</li>
                  <li>Explain scope, pricing and material choices.</li>
                  <li>Coordinate access, scheduling and installation.</li>
                  <li>Communicate changes and finish with care.</li>
                </ul>
              </section>
              <section>
                <h2>Find us in Maryland</h2>
                <p>
                  {business.legalName}
                  <br />
                  {business.address}
                  <br />
                  {business.city}, MD {business.zip}
                  <br />
                  {business.license}
                </p>
                <p>
                  Contact us for current licensing, insurance and project
                  documentation.
                </p>
              </section>
            </>
          )}
          {key === "contact" && (
            <>
              <section>
                <h2>Tell us about your home.</h2>
                <p>
                  Share your property ZIP code and the service you need. Our
                  team will contact you to discuss your project and arrange the
                  inspection. There is no obligation to move forward.
                </p>
                <p>
                  <a className="text-link" href={`tel:${business.tel}`}>
                    {business.phone}
                  </a>
                </p>
                <p>
                  <a className="text-link" href={`mailto:${business.email}`}>
                    {business.email}
                  </a>
                </p>
              </section>
              <section>
                <h2>What happens next?</h2>
                <ol>
                  <li>We review your request.</li>
                  <li>We contact you to agree on a suitable time.</li>
                  <li>We inspect and explain the findings.</li>
                  <li>You receive a clear recommendation and estimate.</li>
                </ol>
              </section>
              <section>
                <h2>Based in Silver Spring</h2>
                <p>
                  {business.address}
                  <br />
                  {business.city}, MD {business.zip}
                </p>
                <p>
                  Please contact us before visiting. Inspections take place at
                  your property by arrangement.
                </p>
              </section>
            </>
          )}
          {key === "financing" && (
            <>
              <section>
                <h2>{c.offer.headline}*</h2>
                <p>
                  A qualifying replacement project can start at $2,999. An
                  inspection determines the actual roof size, condition and
                  scope. We explain what is included in your written estimate.
                </p>
              </section>
              <section>
                <h2>{c.offer.finance}*</h2>
                <p>
                  Financing is available for qualified homeowners, subject to
                  credit approval and lender terms. Zero down describes the
                  initial down payment. It does not mean zero interest or
                  guaranteed approval.
                </p>
                <ul>
                  <li>Ask for the APR and all fees.</li>
                  <li>
                    Compare the term, monthly payment and total repayment.
                  </li>
                  <li>
                    Confirm any promotional or deferred-interest conditions.
                  </li>
                  <li>Review the cash project price alongside financing.</li>
                </ul>
              </section>
              <section>
                <h2>Start with your project.</h2>
                <p>
                  The inspection form is a request for roofing information, not
                  a credit application. Do not send Social Security numbers or
                  financial account details. Any application is completed with
                  the financing provider.
                </p>
                <div className="notice">{c.offer.terms}</div>
              </section>
              <ArrowLink href="/resources/roof-financing">
                Read the financing guide
              </ArrowLink>
            </>
          )}
          {key === "projects" && (
            <>
              {c.projects.length ? (
                c.projects.map((p) => (
                  <section key={p.title}>
                    <Image
                      src={p.image}
                      alt={p.alt || p.title}
                      width={1000}
                      height={700}
                    />
                    <p className="eyebrow">
                      {p.city} · {p.service}
                    </p>
                    <h2>{p.title}</h2>
                    <p>{p.description}</p>
                  </section>
                ))
              ) : (
                <>
                  <section>
                    <h2>Ask for work relevant to your home.</h2>
                    <p>
                      Roof shapes, materials and installation details differ
                      from property to property. Contact our team for available
                      examples and references relevant to your planned project.
                    </p>
                  </section>
                  <section>
                    <h2>What to look for in a roofing project</h2>
                    <p>
                      Look beyond a finished photograph. Ask about the scope,
                      underlying repairs, flashing, ventilation, cleanup and how
                      changes were handled.
                    </p>
                  </section>
                </>
              )}
              <section>
                <h2>See what goes into the system.</h2>
                <div className="standalone-roof">
                  <RoofReference />
                </div>
                <ArrowLink href="/roof-system">
                  Explore the roof layers
                </ArrowLink>
              </section>
            </>
          )}
          {key === "reviews" && (
            <>
              <GoogleReviews />
              {c.testimonials.length ? (<section><h2>More verified feedback</h2>
                {c.testimonials.map((t) => (
                    <blockquote key={t.name}>
                      <p>“{t.quote}”</p>
                      <cite>
                        {t.name} · <a href={t.sourceUrl}>{t.source}</a>
                      </cite>
                    </blockquote>
                ))}
              </section>) : (
                <section>
                  <h2>Make an informed choice.</h2>
                  <p>
                    Ask our team for available customer references and examples
                    relevant to your project. We want you to feel comfortable
                    with the people working on your home.
                  </p>
                  <p>
                    During your estimate, ask about communication, site
                    protection, installation scope and the final walkthrough.
                  </p>
                </section>
              )}
              <ArrowLink href="/contact">Talk with the team</ArrowLink>
            </>
          )}
          {key === "roof-system" && (
            <>
              <div className="standalone-roof">
                <RoofReference />
              </div>
              {c.roofParts.map((p) => (
                <section key={p.name}>
                  <h2>
                    {p.name}
                  </h2>
                  <p>{p.text}</p>
                </section>
              ))}
              <p>
                The diagram is an overview. Your written scope identifies the
                materials and components included in your project.
              </p>
            </>
          )}
          {key === "privacy-policy" && (
            <>
              <section>
                <h2>Information you share</h2>
                <p>
                  WeRoof LLC receives the name, email, phone, property details
                  and service selection you provide when requesting an
                  inspection or calculator report. Calculator answers and an
                  illustrative price range are used to email the requested PDF
                  and discuss your project. We also use information to respond
                  and arrange access.
                </p>
                <p>In the roofing calculator, “Send details &amp; continue” sends your contact and property details for project follow-up even if you do not finish the estimate. You can skip this early submission. It does not enroll you in SMS or marketing. If you choose browser saving, details are stored in this tab for up to 24 hours, can be cleared in the calculator, and are removed after successful submission.</p>
              </section>
              <section>
                <h2>Service providers</h2>
                <p>
                  Requests are processed through our hosting, spam-prevention,
                  customer-management and email-delivery providers. These services help deliver
                  and manage your inquiry and calculator report. Do not include sensitive financial or
                  identity information in a request.
                </p>
              </section>
              <section>
                <h2>Texts and contact preferences</h2>
                <p>
                  SMS consent is optional and is not a condition of purchase.
                  Message frequency varies, and message and data rates may
                  apply. Reply STOP to stop texts or HELP for assistance. You
                  may also contact us to update your communication preferences.
                </p>
              </section>
              <section>
                <h2>Analytics and website storage</h2>
                <p>
                  When enabled and accepted, optional analytics and call
                  attribution help us understand website use. The website stores
                  your analytics choice locally. Form details are not included
                  in analytics events. Essential spam-prevention and request
                  processing operate independently of optional analytics.
                </p>
              </section>
              <section>
                <h2>Google Maps reviews</h2>
                <p>
                  When available, our Reviews page requests current public
                  business ratings and reviews from Google Maps. Reviewer names,
                  profile images and review links are displayed with their
                  comments. Google may receive information about your visit
                  when review profile images load or you follow a Google link.
                  See the <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.
                </p>
              </section>
              <section>
                <h2>Property satellite views</h2>
                <p>When you preview your property or open the online roof view, the address is shared with Google Maps to display the location and satellite imagery. The report link contains the property address; anyone you share it with can view that address. Google imagery appears online and is not included in the PDF attachment. Google Maps use is subject to the <a href="https://www.google.com/help/terms_maps/">Google Maps terms</a> and <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.</p>
              </section>
              <section>
                <h2>Your questions and choices</h2>
                <p>
                  Contact {business.email} to request access, correction or
                  deletion of information associated with your inquiry, or to
                  change contact preferences. We retain information as needed
                  for project administration and applicable recordkeeping
                  obligations.
                </p>
              </section>
            </>
          )}
          {key === "terms" && (
            <>
              <section>
                <h2>Google Maps content</h2>
                <p>
                  Ratings and reviews credited to Google Maps come from Google,
                  not WeRoof. Their availability and ordering may change, and
                  Google returns only a limited selection here. Google Maps
                  content is subject to the <a href="https://www.google.com/help/terms_maps/">Google Maps terms</a>.
                </p>
              </section>
              <section>
                <h2>Inspection requests</h2>
                <p>
                  Submitting a request does not create a construction contract
                  or confirm an appointment. Our team contacts you to arrange
                  timing and discuss the property. Inspections are subject to
                  safe access and conditions.
                </p>
              </section>
              <section>
                <h2>Pricing and financing</h2>
                <p>{c.offer.terms}</p>
                <p>
                  The $2,999 starting price is not a quote for every roof. $0
                  down financing does not imply zero interest, universal
                  eligibility or approval. Your signed project documents and
                  lender disclosures govern the work and financing.
                </p>
              </section>
              <section>
                <h2>Roofing information</h2>
                <p>
                  Website guides and diagrams provide general information.
                  Actual materials, methods, warranties, exclusions and included
                  components are defined in the written project scope. The
                  diagram does not mean all illustrated layers are included in
                  every offer.
                </p>
              </section>
              <section>
                <h2>Insurance assistance</h2>
                <p>
                  WeRoof may provide inspection documentation and estimates. We
                  do not determine insurance coverage or guarantee claim
                  approval. Your policy and insurer govern any insurance claim.
                </p>
              </section>
              <section>
                <h2>Contact and communications</h2>
                <p>
                  By requesting an inspection, you request phone and email
                  follow-up about your project. Optional text-message consent
                  can be withdrawn by replying STOP. Message frequency varies;
                  message and data rates may apply. Reply HELP for assistance or
                  contact {business.email}.
                </p>
              </section>
            </>
          )}
        </article>
        {key === "about" && <aside className="content-aside"><figure className="page-hero-image"><Image src={pagePhotos.about.src} alt={pagePhotos.about.alt} fill sizes="(max-width: 700px) 100vw, 35vw" /><figcaption>{pagePhotos.about.caption}</figcaption></figure></aside>}
        {!legalPage && key !== "contact" && key !== "about" && <aside className="content-aside" id="request-inspection">
          <LeadForm source={path} />
        </aside>}
      </div>
      {key === "financing" && (
        <section className="wrap section">
          <h2>Your financing questions, answered.</h2>
          <FAQs items={c.faqs.filter((x) => /\$/.test(x.question))} />
          <JsonLd data={faqSchema(c.faqs.filter((x) => /\$/.test(x.question)))} />
        </section>
      )}
      {coreSchema}
    </main>
  );
}
