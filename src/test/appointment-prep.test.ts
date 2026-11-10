import { describe, expect, it } from "vitest";
import { appointmentPrepInput, prepMemberContext } from "@/lib/appointment-prep";

describe("appointment preparation", () => {
  it("requires consent before sending health information to AI", () => {
    expect(appointmentPrepInput.safeParse({ memberId: "self", concern: "A persistent cough for three days", consent: false }).success).toBe(false);
    expect(appointmentPrepInput.safeParse({ memberId: "self", concern: "A persistent cough for three days", consent: true }).success).toBe(true);
  });
  it("sends relevant body details without names, phone or school identifiers", () => {
    const member = { name: "Amina", doctorPhone: "+256772123456", school: "Kampala School", dob: "2025-01-28", gender: "Female", blood: "O+", weight: "12" };
    expect(prepMemberContext(member, new Date("2026-10-28T12:00:00Z"))).toEqual({ ageMonths: 21, gender: "Female", bloodType: "O+", weightKg: "12", heightCm: null });
  });
});