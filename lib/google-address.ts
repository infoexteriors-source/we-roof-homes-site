import type { RoofProperty } from "./roof-view";

export type GoogleAddressComponent = { longText: string; shortText: string; types: string[] };

export function propertyFromGoogleAddress(components: GoogleAddressComponent[]): RoofProperty {
  const component = (type: string) => components.find((value) => value.types.includes(type));
  if (component("country")?.shortText !== "US" || component("administrative_area_level_1")?.shortText !== "MD") {
    throw new Error("Please select a Maryland property. We confirm service availability before scheduling.");
  }
  const number = component("street_number")?.longText;
  const street = component("route")?.longText;
  const city = component("locality")?.longText || component("sublocality_level_1")?.longText || component("postal_town")?.longText;
  const zip = component("postal_code")?.longText;
  if (!number || !street || !city || !zip || !/^\d{5}$/.test(zip)) {
    throw new Error("Choose a full street address, or enter your street, city and ZIP below.");
  }
  return { address: `${number} ${street}, ${city}`, zip };
}
