import { z } from 'zod';

export const staffOccupations = ['doctor', 'nurse', 'lab_assistant', 'pharmacist', 'other'] as const;
export const staffOccupationLabels: Record<string, string> = { doctor: 'Doctor', nurse: 'Nurse', lab_assistant: 'Lab assistant', pharmacist: 'Pharmacist', other: 'Other staff' };
export const staffInviteSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254), occupation: z.enum(staffOccupations) });