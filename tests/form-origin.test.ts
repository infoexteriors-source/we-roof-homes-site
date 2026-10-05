import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedFormOrigin } from "../lib/form-origin";

test("form origin check permits local aliases only on the same development listener", () => {
  const old = process.env.NODE_ENV;
  Object.assign(process.env, { NODE_ENV: "development" });
  const req = (origin: string) => new Request("http://0.0.0.0:3000/api/calculator-leads", { headers: { origin } });
  try {
    assert.equal(isAllowedFormOrigin(req("http://127.0.0.1:3000")), true);
    assert.equal(isAllowedFormOrigin(req("http://localhost:3000")), true);
    for (const origin of ["http://127.0.0.1:4000", "https://127.0.0.1:3000", "https://unrelated.example", "http://localhost.attacker.example:3000", "null", ""]) assert.equal(isAllowedFormOrigin(req(origin)), false);
    Object.assign(process.env, { NODE_ENV: "production" });
    assert.equal(isAllowedFormOrigin(req("http://127.0.0.1:3000")), false);
  } finally { if (old === undefined) delete (process.env as Record<string, string | undefined>).NODE_ENV; else Object.assign(process.env, { NODE_ENV: old }); }
});

test("trusted deployment origins are exact and forwarded hosts do not grant access", () => {
  const old = process.env.FORM_ALLOWED_ORIGINS;
  process.env.FORM_ALLOWED_ORIGINS = "https://preview.example.com";
  try {
    const request = (origin: string) => new Request("https://www.weroofhomes.com/api/leads", { headers: { origin, "x-forwarded-host": "unrelated.example" } });
    assert.equal(isAllowedFormOrigin(request("https://preview.example.com")), true);
    assert.equal(isAllowedFormOrigin(request("https://unrelated.example")), false);
    assert.equal(isAllowedFormOrigin(request("https://preview.example.com.evil.test")), false);
    assert.equal(isAllowedFormOrigin(request("https://preview.example.com/path")), false);
  } finally { if (old === undefined) delete process.env.FORM_ALLOWED_ORIGINS; else process.env.FORM_ALLOWED_ORIGINS = old; }
});
