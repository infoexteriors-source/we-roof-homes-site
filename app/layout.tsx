import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer, JsonLd } from "@/components/Shared";
import { Analytics } from "@/components/Analytics";
import { MobileActions } from "@/components/MobileActions";
import { business, commercialServices, services, siteUrl } from "@/lib/content";
import "./globals.css";
import "./typography.css";
import "./hero-motion.css";
import "./ui-refinements.css";
import "./service-areas.css";
import "./seo-conversion.css";
import "./calculator.css";
import "./header.css";
import "./reviews.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Maryland Roofing Contractor | Roof Replacement & Repair | WeRoof",
    template: "%s | WeRoof",
  },
  description:
    "Locally owned Silver Spring roofer (MHIC #164924). Roof replacement, repair, siding and gutters across Maryland. Free inspection and written estimate.",
  robots: { index: process.env.SITE_LAUNCH_READY === "true", follow: true },
  applicationName: "WeRoof",
  formatDetection: { telephone: true },
  openGraph: {
    siteName: "WeRoof",
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/assets/weroof-logo.png", apple: "/assets/weroof-logo.png" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <Analytics />
        <MobileActions />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "RoofingContractor",
                "@id": `${siteUrl}/#business`,
                name: business.name,
                legalName: business.legalName,
                url: siteUrl,
                telephone: business.tel,
                email: business.email,
                logo: `${siteUrl}/assets/weroof-logo.png`,
                image: `${siteUrl}/opengraph-image`,
                priceRange: "$$",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: business.address,
                  addressLocality: business.city,
                  addressRegion: "MD",
                  postalCode: business.zip,
                  addressCountry: "US",
                },
                areaServed: [
                  { "@type": "State", name: "Maryland" },
                  { "@type": "Place", name: "Maryland communities within approximately a one-hour drive of downtown Bethesda", description: "Service eligibility is confirmed for the exact property address before scheduling." },
                ],
                hasCredential: {
                  "@type": "EducationalOccupationalCredential",
                  credentialCategory: "license",
                  name: `Maryland Home Improvement Commission license ${business.license.replace("MHIC ", "")}`,
                  recognizedBy: { "@type": "GovernmentOrganization", name: "Maryland Home Improvement Commission" },
                },
                knowsAbout: ["Roof replacement", "Roof repair", "Roof inspection", "Storm damage roofing", "Siding", "Gutters", "Commercial roofing"],
                hasOfferCatalog: {
                  "@type": "OfferCatalog",
                  name: "Roofing and exterior services",
                  itemListElement: [...services, ...commercialServices].map((s) => ({
                    "@type": "Offer",
                    itemOffered: { "@type": "Service", name: s.title, url: `${siteUrl}/${commercialServices.includes(s) ? "commercial-roofing" : "services"}/${s.slug}` },
                  })),
                },
              },
              {
                "@type": "WebSite",
                "@id": `${siteUrl}/#website`,
                name: "WeRoof",
                url: siteUrl,
                publisher: { "@id": `${siteUrl}/#business` },
                inLanguage: "en-US",
              },
            ],
          }}
        />
      </body>
    </html>
  );
}
