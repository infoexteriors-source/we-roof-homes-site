import Link from "next/link";
import type { ContentPage } from "@/lib/content";

const groups = [
  { id: "repair", number: "01", title: "Fix what’s happening now.", text: "A leak, missing shingles, or damage after a storm? Start with an inspection and understand your options.", slugs: ["roof-repair", "storm-damage", "insurance-assistance"] },
  { id: "replace", number: "02", title: "Plan what comes next.", text: "A new roof or an exterior refresh starts with a clear scope, material choices, and a written estimate.", slugs: ["roof-replacement", "siding", "gutters"] },
];

const calculators = [
  { title: "Roof cost calculator", text: "Explore roof size, pitch and material choices.", href: "/roof-cost-calculator" },
  { title: "Siding cost calculator", text: "Compare siding materials and optional upgrades.", href: "/siding-cost-calculator" },
  { title: "Gutter cost calculator", text: "Plan gutter size, guards and removal.", href: "/gutter-cost-calculator" },
];

export function ServiceDirectory({ services }: { services: ContentPage[] }) {
  const inspection = services.find((service) => service.slug === "roof-inspection");
  return (
    <section className="service-directory wrap section" id="explore-services" aria-labelledby="service-directory-title">
      <div className="section-head">
        <div><p className="eyebrow">START WITH WHAT YOUR HOME NEEDS</p><h2 id="service-directory-title">One home. The right solution.</h2></div>
        <p>You don’t need to know the repair.<br />Just tell us what you’re noticing.</p>
      </div>
      {groups.map((group) => (
        <div className="service-lane" key={group.id}>
          <div className="service-lane-intro">
            <span className="service-index" aria-hidden="true">{group.number}</span>
            <h3>{group.title}</h3><p>{group.text}</p>
          </div>
          <div className="service-lane-links">
            {group.slugs.map((slug) => services.find((service) => service.slug === slug)).filter((service): service is ContentPage => Boolean(service)).map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <div><h3>{service.title.replace(" in Maryland", "")}</h3><p>{service.description}</p></div>
              </Link>
            ))}
          </div>
        </div>
      ))}
      <div className="service-lane" aria-labelledby="service-calculators-title">
        <div className="service-lane-intro">
          <span className="service-index" aria-hidden="true">03</span>
          <h3 id="service-calculators-title">Explore the cost before we visit.</h3>
          <p>Use a planning calculator, then get a free inspection and written estimate for your actual project.</p>
        </div>
        <div className="service-lane-links">
          {calculators.map((calculator) => (
            <Link key={calculator.href} href={calculator.href}>
              <div><h3>{calculator.title}</h3><p>{calculator.text}</p></div>
            </Link>
          ))}
        </div>
      </div>
      {inspection && <div className="inspection-callout"><div><p className="eyebrow">NOT SURE WHERE TO START?</p><h3>A free inspection is a good first step.</h3><p>Understand the condition of your roof before deciding what to do.</p></div><Link className="button" href={`/services/${inspection.slug}`}>Explore free inspections</Link></div>}
    </section>
  );
}
