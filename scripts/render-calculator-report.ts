import { mkdir, writeFile } from "node:fs/promises";
import { createCalculatorReport } from "../lib/calculator-report";
import { calculatorLeadSchema } from "../lib/calculator-leads";
import { initialProject } from "../lib/calculator-project";

async function main() {
  await mkdir("output/pdf", { recursive: true });
  const calculations = [
    { service: "roof", size: "1750-2500", stories: 2, shape: "gable", pitch: "moderate", material: "architectural" },
    { service: "siding", size: "2500-3500", stories: 2, material: "fiber-cement", trim: true, shutters: true },
    { service: "gutters", size: "1000-1750", stories: 2, shape: "hip", gutter: "6in", guards: true, removeOld: true },
  ];
  for (const calculation of calculations) {
    const sample = calculatorLeadSchema.parse({ firstName: "Alex", email: "alex@example.com", address: "123 Example Street, Bethesda", zip: "20814", submittedAt: "2026-10-05T12:00:00.000Z", calculation, ...(calculation.service === "roof" ? { project: { ...initialProject, propertyConfirmed: true, structures: ["Attached garage"], unknowns: ["pitch"], interests: ["Gutters"] } } : {}) });
    const destination = `output/pdf/weroof-sample-${calculation.service}-report.pdf`;
    await writeFile(destination, await createCalculatorReport(sample));
    process.stdout.write(`${destination}\n`);
  }
}
main().catch((error) => { process.stderr.write(`${error}\n`); process.exitCode = 1; });
