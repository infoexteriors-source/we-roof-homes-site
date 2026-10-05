import type { CalculatorLead } from "./calculator-leads";
import { createCalculatorReport } from "./calculator-report";
import { roofReportUrl } from "./roof-view";
import { siteUrl } from "./content";
import { createHash } from "node:crypto";

export async function emailCalculatorReport(input: CalculatorLead, id: string, fetcher: typeof fetch = fetch) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ESTIMATE_EMAIL_FROM;
  if (!apiKey || !from) throw new Error("Report email is not configured");
  const pdf = await createCalculatorReport(input);
  const propertyUrl = roofReportUrl(siteUrl, input);
  const service = input.calculation.service === "roof" ? "roof" : input.calculation.service === "siding" ? "siding" : "gutter";
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `weroof-calculator-${id}-${createHash("sha256").update(JSON.stringify(input)).digest("hex").slice(0, 20)}`,
    },
    body: JSON.stringify({
      from,
      to: [input.email.toLowerCase()],
      subject: `Your WeRoof ${service} planning report`,
      text: `Hi ${input.firstName},\n\nYour ${service} planning report is attached as a PDF.\n\nView your roof online:\n${propertyUrl}\n\nThe range is illustrative, not a quote: current calculator rates are draft assumptions. A free inspection and written estimate will confirm your actual scope and price.\n\nQuestions? Call (240) 795-9365.\n\nWeRoof Homes`,
      attachments: [{ filename: `weroof-${service}-planning-report.pdf`, content: Buffer.from(pdf).toString("base64"), content_type: "application/pdf" }],
    }),
    signal: AbortSignal.timeout(15000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("Report email was not accepted");
  return { accepted: true };
}
