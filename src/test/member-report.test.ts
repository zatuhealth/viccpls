import { describe, expect, it } from "vitest";
import { memberReportSections } from "@/lib/member-report";
import type { Member } from "@/lib/data";

const member: Member = { id: "child", name: "Amina", relationship: "Daughter", kind: "human", gender: "Female", dob: "2015-02-03", country: "Uganda", state: "Kampala", center: "Clinic", hospital: "Mulago", doctor: "Dr Grace", doctorPhone: "+256772123456", blood: "O+", weight: "70", height: "175", student: true, school: "Kampala School", schoolCode: "KS", studentId: "123" };
describe("member report data", () => {
  it("exports the selected member's health and school details", () => {
    const sections = memberReportSections(member);
    expect(sections[0]?.rows).toContainEqual(["Name", "Amina"]);
    expect(sections[1]?.rows).toContainEqual(["Doctor / Nurse phone", "+256772123456"]);
    expect(sections[1]?.rows).toContainEqual(["BMI", "22.9 (Healthy)"]);
    expect(sections[2]?.rows).toContainEqual(["Student ID / No.", "123"]);
  });
  it("does not export school details for a non-student", () => {
    expect(memberReportSections({ ...member, student: false }).some((section) => section.title === "School details")).toBe(false);
  });
});