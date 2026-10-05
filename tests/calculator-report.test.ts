import assert from "node:assert/strict";
import test from "node:test";
import { calculatorLeadSchema, calculateEstimate } from "../lib/calculator-leads";
import { createCalculatorReport } from "../lib/calculator-report";
import { emailCalculatorReport } from "../lib/calculator-email";
import { initialProject } from "../lib/calculator-project";
import { PDFDocument } from "pdf-lib";

test("inspection requests require phone, email-only reports do not", () => {
  assert.ok(calculatorLeadSchema.safeParse({ ...input, project: initialProject }).success);
  assert.equal(calculatorLeadSchema.safeParse({ ...input, project: { ...initialProject, inspectionRequested: true } }).success, false);
  assert.ok(calculatorLeadSchema.safeParse({ ...input, phone: "2405550100", project: { ...initialProject, inspectionRequested: true } }).success);
});

test("qualified roof report includes comparison and project page", async () => {
  const bytes = await createCalculatorReport({ ...input, project: { ...initialProject, unknowns: ["shape", "pitch"], structures: ["Attached garage"] } });
  assert.equal((await PDFDocument.load(bytes)).getPageCount(), 2);
});

const input = calculatorLeadSchema.parse({
  firstName: "Alex", email: "alex@example.com", address: "123 Example Street, Bethesda", zip: "20814",
  calculation: { service: "roof", size: "1750-2500", stories: 2, shape: "gable", pitch: "moderate", material: "architectural" },
});

test("calculator lead validation accepts complete projects and rejects invalid fields", () => {
  assert.equal(input.calculation.service, "roof");
  assert.ok(calculateEstimate(input.calculation).low > 0);
  assert.equal(calculatorLeadSchema.safeParse({ ...input, zip: "bad" }).success, false);
  assert.equal(calculatorLeadSchema.safeParse({ ...input, calculation: { ...input.calculation, material: "unapproved" } }).success, false);
});

test("creates a branded, single-page PDF report", async () => {
  const bytes = await createCalculatorReport(input);
  assert.equal(Buffer.from(bytes).subarray(0, 5).toString(), "%PDF-");
  assert.ok(bytes.length > 10_000);
});

test("emails the PDF attachment only when the provider accepts it", async () => {
  const oldKey = process.env.RESEND_API_KEY;
  const oldFrom = process.env.ESTIMATE_EMAIL_FROM;
  process.env.RESEND_API_KEY = "test-key";
  process.env.ESTIMATE_EMAIL_FROM = "WeRoof <estimates@example.com>";
  try {
    let sent: Record<string, unknown> = {};
    const accepted = async (_url: string | URL | Request, init?: RequestInit) => {
      sent = JSON.parse(String(init?.body));
      assert.match((init?.headers as Record<string, string>)["Idempotency-Key"], /^weroof-calculator-request-123456789-[a-f0-9]{20}$/);
      return new Response(JSON.stringify({ id: "email-1" }), { status: 200 });
    };
    await emailCalculatorReport(input, "request-123456789", accepted as typeof fetch);
    assert.deepEqual(sent.to, ["alex@example.com"]);
    const attachment = (sent.attachments as { content: string }[])[0];
    assert.equal(Buffer.from(attachment.content, "base64").subarray(0, 5).toString(), "%PDF-");
    await assert.rejects(emailCalculatorReport(input, "request-123456789", (async () => new Response("failed", { status: 503 })) as typeof fetch));
  } finally {
    if (oldKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = oldKey;
    if (oldFrom === undefined) delete process.env.ESTIMATE_EMAIL_FROM; else process.env.ESTIMATE_EMAIL_FROM = oldFrom;
  }
});
