import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
await mkdir("artifacts/calculator-verification", { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--disable-gpu"] });
try {
  for (const service of ["roof", "siding", "gutter"]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    const path = `${base}/${service}-cost-calculator`;
    await page.goto(path, { waitUntil: "networkidle" });
    await page.locator(".calc").screenshot({ path: `artifacts/calculator-verification/${service}-opening.png` });
    await page.getByLabel("Street address and city").fill("123 Example Street, Bethesda");
    await page.getByLabel("Property ZIP").fill("20814");
    await page.getByRole("button", { name: /Preview my property/ }).click();
    await page.getByRole("checkbox", { name: /This is my project address/ }).check();
    await page.getByRole("button", { name: "Continue ↗", exact: true }).click();
    if (service === "roof") {
      await page.getByRole("button", { name: "Continue without sending yet" }).click();
      await page.getByRole("button", { name: /Continue to roof details/ }).click();
    }
    const steps = service === "siding" ? 4 : 5;
    for (let index = 0; index < steps; index++) {
      await page.locator(".calc-step .calc-option").first().click();
      const continueButton = page.locator(".calc-step .calc-nav .button");
      if (await continueButton.isVisible()) await continueButton.click();
      if (index === 0) {
        await page.getByRole("button", { name: "Back", exact: true }).click();
        assert.equal(await page.locator('.calc-step input:checked').count(), 1);
        await page.locator(".calc-step .calc-nav .button").click();
      }
    }
    await page.locator(".calc-capture").waitFor();
    await page.locator(".calc").screenshot({ path: `artifacts/calculator-verification/${service}-capture.png` });
    await page.getByLabel("First name").fill("Alex");
    await page.getByLabel("Email for your PDF").fill("alex@example.com");
    await page.route("**/api/calculator-leads", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Test email failure" }) }));
    await page.getByRole("button", { name: /Email my planning report/ }).click();
    await page.getByText("Test email failure", { exact: true }).waitFor();
    assert.equal(await page.getByLabel("Email for your PDF").inputValue(), "alex@example.com");
    await page.unroute("**/api/calculator-leads");
    await page.route("**/api/calculator-leads", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, emailAccepted: true, id: "test-only" }) }));
    await page.getByRole("button", { name: /Email my planning report/ }).click();
    await page.getByText("Check your inbox, Alex.").waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.close();
  }
  for (const width of [390, 360]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: "reduce" });
    await page.goto(`${base}/roof-cost-calculator`, { waitUntil: "networkidle" });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.locator(".calc").screenshot({ path: `artifacts/calculator-verification/roof-${width}.png` });
    await page.close();
  }
  console.log("Calculator desktop, mobile, failure/retry and success flows passed.");
} finally { await browser.close(); }
