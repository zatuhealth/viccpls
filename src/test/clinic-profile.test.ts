import { expect, it } from 'vitest';
import { clinicProfileSchema, clinicEmailDetails, requireClinicOwner } from '@/lib/clinic-profile';
it('only lets clinic owners manage clinic details and staff invites', () => {
  expect(() => requireClinicOwner('admin')).not.toThrow();
  expect(() => requireClinicOwner('staff')).toThrow();
  expect(() => requireClinicOwner('parent')).toThrow();
  expect(() => requireClinicOwner('user')).toThrow();
  expect(() => requireClinicOwner(null)).toThrow();
});
it('validates clinic international phone numbers', () => {
  const profile = { name: 'Clinic', address: 'Kampala', phone: '+256776886279', hours: '24 hours, 7 days a week' };
  expect(clinicProfileSchema.safeParse(profile).success).toBe(true);
  expect(clinicProfileSchema.safeParse({ ...profile, phone: '123' }).success).toBe(false);
});
it('passes saved name address and phone into overdue emails', () => {
  expect(clinicEmailDetails({ name: 'Clinic', address: 'Kampala', phone: '+256776886279' })).toEqual({ clinic: 'Clinic', clinicAddress: 'Kampala', clinicPhone: '+256776886279' });
});