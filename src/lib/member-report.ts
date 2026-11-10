import { bmi, bmiLabel, type Member } from "./data";

export type ReportSection = { title: string; rows: [string, string][] };
const value = (text?: string) => text?.trim() || "Not recorded";

export function memberReportSections(member: Member): ReportSection[] {
  const score = bmi(member.weight, member.height);
  const sections: ReportSection[] = [
    { title: "Personal details", rows: [
      ["Name", value(member.name)], ["Relationship", value(member.relationship)],
      ["Date of birth", value(member.dob)], ["Gender", value(member.gender)],
      ["Country", value(member.country)], ["State / Province", value(member.state)],
    ] },
    { title: "Health details", rows: [
      ["Hospital / Clinic", value(member.hospital)], ["Doctor / Nurse", value(member.doctor)],
      ["Doctor / Nurse phone", value(member.doctorPhone)], ["Vaccination center", value(member.center)],
      ["Blood type", value(member.blood)], ["Weight (kg)", value(member.weight)],
      ["Height (cm)", value(member.height)], ["BMI", score ? `${score} (${bmiLabel(score)})` : "Not recorded"],
    ] },
  ];
  if (member.id !== "self" && member.student) sections.push({ title: "School details", rows: [
    ["School", value(member.school)], ["School code", value(member.schoolCode)], ["Student ID / No.", value(member.studentId)],
  ] });
  return sections;
}

export function memberReportFilename(name: string) {
  return `${name.normalize("NFKC").replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "family-member"}-clinic-details.pdf`;
}