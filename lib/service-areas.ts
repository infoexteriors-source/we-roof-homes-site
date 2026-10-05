import data from "@/lib/service-area-data.json";
import type { ContentPage } from "@/lib/content";

export type ServiceArea = (typeof data.places)[number];
export const serviceAreas: ServiceArea[] = data.places;
const bySlug = new Map(serviceAreas.map((area) => [area.slug, area]));

export function getServiceArea(slug: string) {
  return bySlug.get(slug);
}

function squareDistance(a: ServiceArea, b: ServiceArea) {
  const latitude = ((a.lat + b.lat) / 2) * Math.PI / 180;
  const northSouth = (a.lat - b.lat) * 111;
  const eastWest = (a.lon - b.lon) * 111 * Math.cos(latitude);
  return northSouth * northSouth + eastWest * eastWest;
}

export function nearbyServiceAreas(area: ServiceArea, count = 5) {
  return serviceAreas
    .filter((candidate) => candidate.id !== area.id)
    .sort((a, b) => squareDistance(area, a) - squareDistance(area, b))
    .slice(0, count);
}

export function serviceAreaPage(area: ServiceArea): ContentPage {
  const place = area.name;
  const classification = area.type === "municipality" ? "municipality" : "Census-recognized community";
  const accessNote = ["Andrews AFB", "Fort Meade", "Naval Academy"].includes(place)
    ? " Properties within a controlled-access installation also require permission to enter and may have additional gate travel time."
    : "";
  return {
    slug: area.slug,
    title: `Roofing & Exterior Services in ${place}, MD`,
    seoTitle: `Roofer in ${place}, MD: Roof Repair & Replacement`,
    description: `Explore WeRoof roof inspections, repairs and replacements for ${place}, Maryland. Check local coverage, nearby communities and request a free estimate.`,
    eyebrow: "MARYLAND ROOFING SERVICE AREA",
    intro: `Planning roof or exterior work in ${place}? Start with a free inspection request. We’ll confirm your exact address, discuss the concern and prepare a written estimate for any proposed work.`,
    kind: "location",
    sections: [
      {
        heading: `Coverage for ${place}`,
        text: `${place} is a Maryland ${classification.toLowerCase()} included in our one-hour coverage directory. Our road model estimates about ${area.estimatedMinutes} minutes from downtown Bethesda to the Census reference point for ${place}. The estimate does not include traffic or the route to your house, so we confirm the address before arranging a visit.${accessNote}`,
      },
      {
        heading: `Choose the right roof work in ${place}`,
        text: "A stain, lifted shingles or worn flashing may call for a targeted repair. Repeated leaks or widespread wear can make replacement more practical. A roof inspection helps establish the condition of the surface, drainage, flashing and accessible ventilation before a recommendation is made.",
      },
      {
        heading: "Know the scope before you decide",
        text: "Your written estimate should explain materials, removal, decking allowances, site access and cleanup. New roofs start at $2,999 for qualifying projects, while $0 down financing is available to qualified homeowners. Actual project price and financing terms depend on eligibility and the inspected property.",
      },
    ],
  };
}
