import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { estimateRoof, formatUsd, gutterRates, homeSizes, pitches, roofRates, roofShapes, sidingRates } from "./estimator";
import type { CalculatorLead } from "./calculator-leads";
import { calculateEstimate } from "./calculator-leads";
import { roofReportUrl } from "./roof-view";
import { siteUrl } from "./content";

const ink = rgb(0.105, 0.11, 0.12);
const muted = rgb(0.38, 0.4, 0.41);
const red = rgb(0.78, 0.075, 0.14);
const paper = rgb(0.985, 0.982, 0.974);
const line = rgb(0.86, 0.87, 0.86);
const serviceLabel = { roof: "Roof replacement", siding: "Siding replacement", gutters: "Gutter installation" } as const;

function text(page: PDFPage, value: string, x: number, y: number, size: number, font: PDFFont, color = ink) {
  page.drawText(value.normalize("NFKD").replace(/[^\x20-\x7E]/g, "-"), { x, y, size, font, color });
}

function wrap(value: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of value.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function details(input: CalculatorLead) {
  const a = input.calculation;
  const rows: [string, string][] = [
    ["Home size", a.service === "roof" && a.livingSqft ? `${a.livingSqft.toLocaleString("en-US")} sq ft (provided)` : homeSizes[a.size].label],
    ["Stories", String(a.stories)],
  ];
  if (a.service === "roof") rows.push(["Roof shape", input.project?.unknowns.includes("shape") ? "Unknown - gable assumed" : roofShapes[a.shape].label], ["Pitch", input.project?.unknowns.includes("pitch") ? "Unknown - moderate assumed" : pitches[a.pitch].label], ["Material", roofRates.materials[a.material].label]);
  if (a.service === "siding") rows.push(["Material", sidingRates.materials[a.material].label], ["Upgrades", [a.trim && "Trim wrap", a.shutters && "Shutters"].filter(Boolean).join(", ") || "None selected"]);
  if (a.service === "gutters") rows.push(["Roof shape", roofShapes[a.shape].label], ["Gutter size", gutterRates.sizes[a.gutter].label], ["Options", [a.guards && "Micro-mesh guards", a.removeOld && "Old gutter removal"].filter(Boolean).join(", ") || "None selected"]);
  return rows;
}

export async function createCalculatorReport(input: CalculatorLead): Promise<Uint8Array> {
  const estimate = calculateEstimate(input.calculation);
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const left = 46;
  const right = 566;
  const width = right - left;
  page.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: paper });
  page.drawRectangle({ x: 0, y: 776, width: 612, height: 16, color: red });
  try {
    const logo = await pdf.embedPng(await readFile(path.join(process.cwd(), "public/assets/weroof-logo.png")));
    page.drawImage(logo, { x: left, y: 691, width: 58, height: 63 });
  } catch {
    text(page, "WeRoof", left, 720, 20, bold, red);
  }
  text(page, "MARYLAND HOMES. COVERED.", right - 186, 735, 9, bold, muted);
  text(page, "(240) 795-9365", right - 100, 714, 10, regular, ink);
  page.drawLine({ start: { x: left, y: 679 }, end: { x: right, y: 679 }, thickness: 1, color: line });

  text(page, "YOUR PROJECT PLANNING REPORT", left, 650, 9, bold, red);
  text(page, `${serviceLabel[input.calculation.service]} estimate`, left, 619, 23, bold);
  text(page, `Prepared for ${input.firstName}  |  Maryland ZIP ${input.zip}`, left, 597, 10, regular, muted);

  page.drawRectangle({ x: left, y: 444, width, height: 128, color: ink });
  page.drawRectangle({ x: left, y: 444, width: 6, height: 128, color: red });
  text(page, "ILLUSTRATIVE INSTALLED COST RANGE", left + 24, 540, 10, bold, rgb(0.8, 0.82, 0.82));
  text(page, `${formatUsd(estimate.low)} - ${formatUsd(estimate.high)}`, left + 24, 497, 31, bold, rgb(1, 1, 1));
  text(page, `Based on about ${estimate.quantity.toLocaleString("en-US")} ${estimate.unit}`, left + 24, 466, 11, regular, rgb(0.84, 0.85, 0.85));

  text(page, "What you told us", left, 409, 16, bold);
  const rows = details(input);
  let y = 382;
  for (const [label, value] of rows) {
    page.drawLine({ start: { x: left, y: y - 10 }, end: { x: right, y: y - 10 }, thickness: 0.65, color: line });
    text(page, label, left, y, 10, regular, muted);
    text(page, value, 270, y, 10, bold);
    y -= 27;
  }

  const nextTop = Math.min(y - 8, 230);
  text(page, "What happens next", left, nextTop, 16, bold);
  const next = [
    "Use this range to plan your project budget.",
    "Ask WeRoof for a free inspection to confirm measurements and condition.",
    "Review a written scope and final price before authorizing work.",
  ];
  let nextY = nextTop - 24;
  next.forEach((item, index) => {
    text(page, `0${index + 1}`, left, nextY, 10, bold, red);
    for (const part of wrap(item, regular, 10, width - 36)) { text(page, part, left + 34, nextY, 10, regular); nextY -= 14; }
    nextY -= 7;
  });

  const propertyUrl = roofReportUrl(siteUrl, input);
  page.drawRectangle({ x: left, y: 104, width: 190, height: 26, color: red });
  text(page, "View your roof online", left + 14, 112, 11, bold, rgb(1, 1, 1));
  const link = pdf.context.register(pdf.context.obj({
    Type: "Annot", Subtype: "Link", Rect: [left, 104, left + 190, 130], Border: [0, 0, 0],
    A: { Type: "Action", S: "URI", URI: PDFString.of(propertyUrl) },
  }));
  page.node.set(PDFName.of("Annots"), pdf.context.obj([link]));

  page.drawLine({ start: { x: left, y: 89 }, end: { x: right, y: 89 }, thickness: 1, color: line });
  const caveat = "Planning range only - not a quote or offer. Based on draft calculator assumptions and the information supplied; actual scope, materials, site conditions and price require a free inspection and written estimate.";
  let caveatY = 73;
  for (const part of wrap(caveat, regular, 8.4, width)) { text(page, part, left, caveatY, 8.4, regular, muted); caveatY -= 11; }
  text(page, "W E R O O F H O M E S . C O M", left, 24, 8, bold, red);
  text(page, "Your home comes first.", right - 93, 24, 8, regular, muted);
  if (input.project && input.calculation.service === "roof") {
    const project = input.project;
    const roof = input.calculation;
    const detailPage = pdf.addPage([612, 792]);
    detailPage.drawRectangle({ x: 0, y: 0, width: 612, height: 792, color: paper });
    detailPage.drawRectangle({ x: 0, y: 776, width: 612, height: 16, color: red });
    text(detailPage, "W E R O O F  /  YOUR PROJECT", left, 738, 10, bold, red);
    text(detailPage, "A clearer path forward.", left, 703, 25, bold);
    let cursor = 677;
    const paragraph = (value: string, size = 10, color = muted) => {
      for (const part of wrap(value.normalize("NFKD").replace(/[^\x20-\x7E]/g, "-"), regular, size, width)) {
        text(detailPage, part, left, cursor, size, regular, color); cursor -= size + 5;
      }
      cursor -= 7;
    };
    paragraph(`${input.address}, MD ${input.zip}`);
    paragraph(`Project: ${project.need}. Timing: ${project.timeline}. Roof age: ${project.age}.`);
    paragraph(`Your priority: ${project.priority}. Financing: ${project.financing}.`);
    paragraph(`Additional roof areas to inspect: ${project.structures.join(", ") || "None selected"}. These areas are not separately measured or added to the range.`);
    if (project.interests.length) paragraph(`Also interested in: ${project.interests.join(" and ")}. Not included in this roof range.`);
    cursor -= 6;
    text(detailPage, "Compare your material options", left, cursor, 16, bold); cursor -= 25;
    for (const material of Object.keys(roofRates.materials) as (keyof typeof roofRates.materials)[]) {
      const alternative = estimateRoof({ ...roof, material });
      text(detailPage, roofRates.materials[material].label, left, cursor, 10, regular);
      text(detailPage, `${formatUsd(alternative.low)} - ${formatUsd(alternative.high)}`, 385, cursor, 10, bold);
      detailPage.drawLine({ start: { x: left, y: cursor - 10 }, end: { x: right, y: cursor - 10 }, thickness: 0.65, color: line });
      cursor -= 30;
    }
    cursor -= 8;
    paragraph("Illustrative draft ranges for the same estimated main-roof area, not bids. No aerial measurements were used. Living space, story count, shape and slope approximate roof area; garages, additions, damage and hidden conditions require inspection.", 9);
    if (project.unknowns.length) paragraph(`Assumptions to confirm: ${project.unknowns.map((key) => key === "shape" ? "gable roof shape" : "moderate roof slope").join("; ")}.`, 9);
    cursor -= 5;
    text(detailPage, "Your next step", left, cursor, 16, bold); cursor -= 24;
    paragraph(project.inspectionRequested ? "You requested a free inspection. WeRoof will contact you to arrange a time. This is not a booked appointment." : "Call (240) 795-9365 for a free inspection and a written scope with confirmed pricing.");
    paragraph(`Preferred follow-up: ${project.contactMethod}, ${project.contactTime.toLowerCase()}. No SMS enrollment.`, 9);
    text(detailPage, "PLANNING REPORT / NOT A CONTRACT OR MEASUREMENT REPORT", left, 42, 8, bold, red);
    text(detailPage, "2 / 2", right - 20, 24, 8, regular, muted);
  }
  pdf.setTitle(`WeRoof ${serviceLabel[input.calculation.service]} planning report`);
  pdf.setAuthor("WeRoof Homes");
  const createdAt = new Date(input.submittedAt || "2026-01-01T00:00:00.000Z");
  pdf.setCreationDate(createdAt);
  pdf.setModificationDate(createdAt);
  return pdf.save();
}
