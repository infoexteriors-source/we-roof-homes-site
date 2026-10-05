import assert from "node:assert/strict";
import test from "node:test";
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFString } from "pdf-lib";
import { googleRoofUrls, readRoofProperty, roofReportUrl } from "../lib/roof-view";
import { calculatorLeadSchema } from "../lib/calculator-leads";
import { createCalculatorReport } from "../lib/calculator-report";

const property = { address: "123 Example Street, Bethesda", zip: "20814" };

test("property address round-trips in a fragment, without being sent in the URL path or query", () => {
  const url = new URL(roofReportUrl("https://www.weroofhomes.com", property));
  assert.equal(url.pathname, "/roof-report");
  assert.equal(url.search, "");
  assert.deepEqual(readRoofProperty(url.hash), property);
  assert.equal(readRoofProperty("#address=test&zip=bad"), null);
  assert.equal(readRoofProperty("#"), null);
});

test("maps remain on Google and satellite embeds require a configured key", () => {
  assert.equal(googleRoofUrls(property).embed, null);
  const map = new URL(googleRoofUrls(property, "test-key").embed!);
  assert.equal(map.hostname, "www.google.com");
  assert.equal(map.searchParams.get("maptype"), "satellite");
  assert.match(map.searchParams.get("q")!, /20814/);
});

test("PDF includes a clickable online roof view with the correct property", async () => {
  const lead = calculatorLeadSchema.parse({ ...property, firstName: "Alex", email: "alex@example.test", calculation: { service: "roof", size: "1750-2500", stories: 2, shape: "gable", pitch: "moderate", material: "architectural" } });
  const pdf = await PDFDocument.load(await createCalculatorReport(lead));
  const annotations = pdf.getPage(0).node.lookup(PDFName.of("Annots"), PDFArray);
  const action = annotations.lookup(0, PDFDict).lookup(PDFName.of("A"), PDFDict);
  const link = action.lookup(PDFName.of("URI"), PDFString).decodeText();
  assert.deepEqual(readRoofProperty(new URL(link).hash), property);
});
