export type RoofProperty = { address: string; zip: string };

export function validRoofProperty(value: RoofProperty) {
  return value.address.trim().length >= 5 && value.address.length <= 240 && /^\d{5}$/.test(value.zip);
}

export function roofReportUrl(baseUrl: string, property: RoofProperty) {
  if (!validRoofProperty(property)) throw new Error("A property address and ZIP are required");
  const url = new URL("/roof-report", baseUrl);
  // The address stays in the fragment, which browsers do not send to our server.
  url.hash = new URLSearchParams({ address: property.address.trim(), zip: property.zip }).toString();
  return url.toString();
}

export function readRoofProperty(hash: string): RoofProperty | null {
  if (hash.length > 4000) return null;
  const values = new URLSearchParams(hash.replace(/^#/, ""));
  const property = { address: (values.get("address") || "").trim(), zip: values.get("zip") || "" };
  return validRoofProperty(property) ? property : null;
}

export function googleRoofUrls(property: RoofProperty, key?: string) {
  const query = `${property.address}, Maryland ${property.zip}, USA`;
  const open = new URL("https://www.google.com/maps/search/");
  open.search = new URLSearchParams({ api: "1", query }).toString();
  const embed = new URL("https://www.google.com/maps/embed/v1/place");
  embed.search = new URLSearchParams({ key: key || "", q: query, maptype: "satellite", zoom: "20" }).toString();
  return { open: open.toString(), embed: key ? embed.toString() : null };
}
