import { PDFDocument, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Member } from "./data";
import { memberReportSections } from "./member-report";
import { nutritionSections } from "@/components/nutrition-guide";

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const character of text.replace(/[\r\n\t]+/g, " ")) {
    if (line && font.widthOfTextAtSize(line + character, size) > width) {
      const space = line.lastIndexOf(" ");
      if (space > 0) { lines.push(line.slice(0, space)); line = line.slice(space + 1); }
      else { lines.push(line); line = ""; }
    }
    line += character;
  }
  if (line) lines.push(line);
  return lines;
}

export async function createMemberPdf(member: Member, fonts: { regular: Uint8Array; bold: Uint8Array }, now = new Date()) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(fonts.regular, { subset: true });
  const bold = await doc.embedFont(fonts.bold, { subset: true });
  doc.setTitle(`${member.name} – Health and school details`);
  doc.setAuthor("ZatuHealth");
  let page = doc.addPage([595.28, 841.89]);
  let y = 790;
  const newPage = () => { page = doc.addPage([595.28, 841.89]); y = 790; };
  const text = (content: string, size = 10, font = regular, x = 48, width = 499) => {
    for (const line of wrap(content, font, size, width)) {
      if (y < 65) newPage();
      page.drawText(line, { x, y, size, font });
      y -= size + 5;
    }
  };
  text("ZatuHealth", 22, bold);
  text("Health & school details • Clinic visit", 12);
  text(`Exported ${now.toISOString().slice(0, 10)} (UTC)`, 9);
  y -= 14;
  text(member.name || "Family member", 18, bold);
  y -= 12;
  for (const section of memberReportSections(member)) {
    if (y < 125) newPage();
    text(section.title, 12, bold);
    y -= 5;
    for (const [label, content] of section.rows) {
      const lines = wrap(content, regular, 10, 327);
      if (y - lines.length * 15 < 65) newPage();
      const top = y;
      page.drawText(label, { x: 48, y: top, size: 9, font: bold });
      for (const line of lines) { page.drawText(line, { x: 220, y, size: 10, font: regular }); y -= 15; }
      y -= 5;
    }
    y -= 15;
  }
  text("Caregiver-reported details; not a verified medical record. Confirm details with your clinician.", 8);
  text("BMI labels are general adult categories, not a clinical assessment for children or pregnancy.", 8);
  for (const [index, sheet] of doc.getPages().entries()) {
    sheet.drawText(`Private health information • ${index + 1} / ${doc.getPageCount()}`, { x: 48, y: 32, size: 8, font: regular });
  }
  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

export async function loadReportFonts() {
  const results = await Promise.all(["DejaVuSans.ttf", "DejaVuSans-Bold.ttf"].map(async (file) => {
    const response = await fetch(`/fonts/${file}`);
    if (!response.ok) throw new Error("Unable to load PDF fonts. Please try again.");
    return new Uint8Array(await response.arrayBuffer());
  }));
  const [regular, bold] = results;
  if (!regular || !bold) throw new Error("PDF fonts unavailable");
  return { regular, bold };
}

export async function createVisitPdf(member: Member, note: { summary: string; questions: string[]; safetyNote: string }, fonts: { regular: Uint8Array; bold: Uint8Array }) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(fonts.regular, { subset: true });
  const bold = await doc.embedFont(fonts.bold, { subset: true });
  doc.setTitle(`${member.name} – Appointment preparation`);
  let page = doc.addPage([595.28, 841.89]);
  let y = 790;
  const text = (value: string, size = 11, font = regular) => {
    for (const line of wrap(value, font, size, 499)) {
      if (y < 70) { page = doc.addPage([595.28, 841.89]); y = 790; }
      page.drawText(line, { x: 48, y, size, font }); y -= size + 7;
    }
    y -= 10;
  };
  text("ZatuHealth", 22, bold);
  text("Appointment preparation", 15, bold);
  text(member.name, 14, bold);
  text("Appointment summary", 12, bold); text(note.summary);
  text("Questions for your clinician", 12, bold);
  note.questions.forEach((question, i) => text(`${i + 1}. ${question}`));
  text(note.safetyNote);
  text("AI-prepared, caregiver-reviewed notes. Not a diagnosis or a verified medical record.", 9);
  doc.getPages().forEach((sheet, i) => sheet.drawText(`Private health information • ${i + 1} / ${doc.getPageCount()}`, { x: 48, y: 32, size: 8, font: regular }));
  return new Blob([new Uint8Array(await doc.save())], { type: "application/pdf" });
}

export async function createNutritionPdf(fonts: { regular: Uint8Array; bold: Uint8Array }, now = new Date()) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const regular = await doc.embedFont(fonts.regular, { subset: true });
  const bold = await doc.embedFont(fonts.bold, { subset: true });
  doc.setTitle("ZatuHealth – Family nutrition guide");
  doc.setAuthor("ZatuHealth");
  let page = doc.addPage([595.28, 841.89]);
  let y = 790;
  const newPage = () => { page = doc.addPage([595.28, 841.89]); y = 790; };
  const text = (content: string, size = 10, font = regular, indent = 0) => {
    for (const line of wrap(content, font, size, 499 - indent)) {
      if (y < 65) newPage();
      page.drawText(line, { x: 48 + indent, y, size, font });
      y -= size + 5;
    }
  };
  text("ZatuHealth", 22, bold);
  text("Family nutrition guide", 16, bold);
  text(`Downloaded ${now.toISOString().slice(0, 10)} (UTC)`, 9);
  y -= 14;
  for (const section of nutritionSections) {
    if (y < 140) newPage();
    text(section.title, 14, bold);
    y -= 4;
    text(section.intro, 10);
    y -= 8;
    for (const topic of section.topics) {
      if (y < 130) newPage();
      text(topic.name, 11, bold);
      text(topic.sub, 9, regular, 10);
      y -= 2;
      text(topic.body, 10, regular, 10);
      y -= 10;
    }
    y -= 8;
  }
  if (y < 120) newPage();
  text("Not medical advice", 12, bold);
  text("This is general guidance. For your own situation — anaemia, allergies, twin pregnancy or a special diet — ask your doctor or clinic nurse.", 9);
  for (const [index, sheet] of doc.getPages().entries()) {
    sheet.drawText(`ZatuHealth family nutrition guide • ${index + 1} / ${doc.getPageCount()}`, { x: 48, y: 32, size: 8, font: regular });
  }
  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

export async function deliverReport(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}