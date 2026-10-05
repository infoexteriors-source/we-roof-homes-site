import Link from "next/link";
import Image from "next/image";
import { business, services, siteUrl, type ContentPage } from "@/lib/content";
export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="text-link" href={href}>
      {children}
    </Link>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-top">
        <div>
          <Link href="/" className="footer-logo">
            <Image
              src="/assets/weroof-logo.png"
              width={90}
              height={97}
              alt="WeRoof"
            />
          </Link>
          <h2>
            Good roofs.
            <br />
            Good people.
          </h2>
          <a className="footer-phone" href={`tel:${business.tel}`}>
            {business.phone}
          </a>
        </div>
        <div>
          <h3>For your home</h3>
          {services.map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`}>
              {s.title.replace(" in Maryland", "").replace("Free ", "")}
            </Link>
          ))}
        </div>
        <div>
          <h3>Get to know WeRoof</h3>
          {[
            ["About us", "/about"],
            ["Commercial roofing", "/commercial-roofing"],
            ["Financing", "/financing"],
            ["Our work", "/projects"],
            ["Reviews", "/reviews"],
            ["Homeowner guides", "/resources"],
            ["Service areas", "/service-areas"],
            ["Roof cost calculator", "/roof-cost-calculator"],
            ["Siding cost calculator", "/siding-cost-calculator"],
            ["Gutter cost calculator", "/gutter-cost-calculator"],
            ["Contact", "/contact"],
          ].map(([t, h]) => (
            <Link key={h} href={h}>
              {t}
            </Link>
          ))}
        </div>
        <div>
          <h3>Based in Silver Spring</h3>
          <p>
            {business.address}
            <br />
            {business.city}, {business.state} {business.zip}
          </p>
          <a href={`mailto:${business.email}`}>{business.email}</a>
          <p>{business.license}</p>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} WeRoof LLC. All rights reserved.
        </span>
        <div>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="/sitemap.xml">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
export function FAQs({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <div className="faq-list">
      {items.map((x) => (
        <details key={x.question}>
          <summary>
            {x.question}
            <span aria-hidden="true">+</span>
          </summary>
          <p>{x.answer}</p>
        </details>
      ))}
    </div>
  );
}
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\u003c"),
      }}
    />
  );
}
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((x) => ({
      "@type": "Question",
      name: x.question,
      acceptedAnswer: { "@type": "Answer", text: x.answer },
    })),
  };
}
const schemaSections: Record<string, string> = {
  services: "Services",
  "commercial-roofing": "Commercial roofing",
  "service-areas": "Service areas",
  resources: "Homeowner guides",
};
export function PageSchema({
  page,
  path,
}: {
  page: ContentPage;
  path: string;
}) {
  const section = path.split("/")[1];
  const place = page.title.replace("Roofing & Exterior Services in ", "").replace(", MD", "");
  const image = `${siteUrl}/opengraph-image`;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
              { "@type": "ListItem", position: 2, name: schemaSections[section] || section, item: `${siteUrl}/${section}` },
              { "@type": "ListItem", position: 3, name: page.title, item: `${siteUrl}${path}` },
            ],
          },
          page.kind === "article"
            ? {
                "@type": "Article",
                headline: page.title,
                description: page.description,
                image,
                author: {
                  "@type": "Organization",
                  name: page.author || "WeRoof",
                  url: siteUrl,
                },
                publisher: { "@id": `${siteUrl}/#business` },
                ...(page.updated ? { datePublished: page.updated, dateModified: page.updated } : {}),
                mainEntityOfPage: `${siteUrl}${path}`,
              }
            : {
                "@type": "Service",
                name: page.title,
                serviceType: page.kind === "location" ? "Residential roofing, siding and gutter services" : page.title.replace(" in Maryland", ""),
                description: page.description,
                provider: { "@id": `${siteUrl}/#business` },
                areaServed:
                  page.kind === "location"
                    ? { "@type": "City", name: place, containedInPlace: { "@type": "State", name: "Maryland" } }
                    : { "@type": "State", name: "Maryland" },
                ...(section === "commercial-roofing" ? {} : { offers: { "@type": "Offer", name: "Free inspection and written estimate", price: "0", priceCurrency: "USD" } }),
                url: `${siteUrl}${path}`,
              },
        ],
      }}
    />
  );
}
