import { expect, it } from 'vitest';
import { staffInviteSchema } from '@/lib/clinic-staff-roles';
it('accepts each administrator-assigned staff occupation', () => {
  for (const occupation of ['doctor', 'nurse', 'lab_assistant', 'pharmacist', 'other']) expect(staffInviteSchema.safeParse({ email: 'staff@example.com', occupation }).success).toBe(true);
});
it('cannot grant administrator access through a staff occupation', () => {
  expect(staffInviteSchema.safeParse({ email: 'staff@example.com', occupation: 'admin' }).success).toBe(false);
});