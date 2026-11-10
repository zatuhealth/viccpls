import { z } from "zod";

export const appointmentPrepInput = z.object({
  memberId: z.string().trim().min(1).max(100),
  concern: z.string().trim().min(10, "Please describe the concern in a little more detail.").max(4000),
  consent: z.literal(true),
});
export const appointmentPrepOutput = z.object({
  summary: z.string(),
  questions: z.array(z.string()),
  safetyNote: z.string(),
});
export type AppointmentPrep = z.infer<typeof appointmentPrepOutput>;

export function prepMemberContext(member: { dob?: string; gender?: string; weight?: string; height?: string; blood?: string }, now = new Date()) {
  const birth = member.dob ? new Date(`${member.dob}T00:00:00Z`) : null;
  const months = birth && Number.isFinite(birth.getTime()) ? Math.max(0, (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 + now.getUTCMonth() - birth.getUTCMonth() - (now.getUTCDate() < birth.getUTCDate() ? 1 : 0)) : null;
  return { ageMonths: months, gender: member.gender || null, weightKg: member.weight || null, heightCm: member.height || null, bloodType: member.blood || null };
}