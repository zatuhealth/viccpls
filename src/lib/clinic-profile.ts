import { z } from 'zod';
import { isPossiblePhoneNumber } from 'libphonenumber-js';

export const clinicProfileSchema = z.object({
  name: z.string().trim().min(2).max(150),
  address: z.string().trim().min(2).max(300),
  phone: z.string().trim().refine((phone) => /^\+\d+$/.test(phone) && isPossiblePhoneNumber(phone), 'Enter a valid international clinic phone number'),
  hours: z.string().trim().min(2).max(1000),
});
export type ClinicProfile = z.infer<typeof clinicProfileSchema>;
export function requireClinicOwner(role: string | null) {
  if (role !== 'admin') throw new Error('Only the clinic owner can change clinic details or invite staff');
}
export function clinicEmailDetails(clinic?: Partial<ClinicProfile>) {
  return { clinic: clinic?.name ?? '', clinicPhone: clinic?.phone ?? '', clinicAddress: clinic?.address ?? '' };
}