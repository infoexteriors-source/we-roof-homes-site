import assert from "node:assert/strict";
import test from "node:test";
import { propertyFromGoogleAddress, type GoogleAddressComponent } from "../lib/google-address";

const component = (type: string, longText: string, shortText = longText): GoogleAddressComponent => ({ types: [type], longText, shortText });
const maryland = [component("street_number", "14837"), component("route", "Fireside Drive"), component("locality", "Silver Spring"), component("postal_code", "20905"), component("administrative_area_level_1", "Maryland", "MD"), component("country", "United States", "US")];

test("selected Maryland address populates city and five-digit ZIP", () => {
  assert.deepEqual(propertyFromGoogleAddress(maryland), { address: "14837 Fireside Drive, Silver Spring", zip: "20905" });
});
test("autocomplete does not accept an out-of-state or incomplete selection", () => {
  assert.throws(() => propertyFromGoogleAddress(maryland.map((c) => c.types.includes("administrative_area_level_1") ? component("administrative_area_level_1", "Virginia", "VA") : c)), /Maryland/);
  assert.throws(() => propertyFromGoogleAddress(maryland.filter((c) => !c.types.includes("street_number"))), /full street address/);
  assert.throws(() => propertyFromGoogleAddress(maryland.filter((c) => !c.types.includes("postal_code"))), /full street address/);
});
