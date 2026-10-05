import { test } from "node:test";
import assert from "node:assert/strict";
import {
  leadSchema,
  normalizeLead,
  signature,
  deliverLead,
  secureEqual,
} from "../lib/leads";
const valid = {
  firstName: "Alex",
  lastName: "Test",
  email: "alex@example.test",
  phone: "(240) 555-0100",
  address: "10 Example Street",
  zip: "20905",
  service: "Roof inspection",
  smsConsent: false,
  sourcePage: "/contact?private=value",
  submissionId: "test-request-12345678",
};
test("requires valid contact, ZIP and offered service", () => {
  assert.equal(leadSchema.safeParse(valid).success, true);
  assert.equal(leadSchema.safeParse({ ...valid, service: "Commercial roofing" }).success, true);
  for (const patch of [
    { email: "bad" },
    { zip: "209" },
    { phone: "abc1234567890" },
    { firstName: "" },
    { service: "Windows" },
  ])
    assert.equal(leadSchema.safeParse({ ...valid, ...patch }).success, false);
});
test("normalizes phone, excludes bot fields, preserves explicit SMS choice", () => {
  const data = normalizeLead(leadSchema.parse(valid));
  assert.equal(data.phone, "+12405550100");
  assert.equal(data.consent.sms, false);
  assert.equal(data.sourcePage, "/contact");
  assert.ok(!("turnstileToken" in data));
  assert.equal(data.id, valid.submissionId);
});
test("signed webhook returns success only on CRM acceptance", async () => {
  process.env.CRM_WEBHOOK_URL = "https://crm.example.test/leads";
  process.env.CRM_WEBHOOK_SECRET = "test-secret";
  let body = "";
  const fetcher = (async (_url, init) => {
    body = String(init?.body);
    const headers = init?.headers as Record<string, string>;
    assert.equal(headers["Idempotency-Key"], valid.submissionId);
    assert.equal(
      headers["X-WeRoof-Signature"],
      signature(body, "test-secret", headers["X-WeRoof-Timestamp"]),
    );
    return new Response("{}", { status: 202 });
  }) as typeof fetch;
  assert.equal(
    await deliverLead(leadSchema.parse(valid), fetcher),
    valid.submissionId,
  );
  assert.ok(body.includes("alex@example.test"));
  await assert.rejects(
    deliverLead(
      leadSchema.parse(valid),
      (async () => new Response("bad", { status: 500 })) as typeof fetch,
    ),
  );
  delete process.env.CRM_WEBHOOK_URL;
  delete process.env.CRM_WEBHOOK_SECRET;
  await assert.rejects(deliverLead(leadSchema.parse(valid), fetcher));
});
test("constant-time credential comparison checks length and content", () => {
  assert.ok(secureEqual("secret", "secret"));
  assert.ok(!secureEqual("secret", "secrets"));
  assert.ok(!secureEqual("secret", "wrong!"));
});
