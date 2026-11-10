import { isPossiblePhoneNumber } from 'libphonenumber-js';

export function validateTextOptIn(enabled: boolean, phone: string) {
  if (enabled && (!phone.startsWith('+') || !isPossiblePhoneNumber(phone))) {
    throw new Error('Add a valid mobile number to your profile before enabling texts');
  }
  return enabled;
}

export function validateChildRegistration(name: string, dob: string, today: string) {
  if (!name.trim()) throw new Error('Enter your child’s name');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || Number.isNaN(Date.parse(dob)) || new Date(dob).toISOString().slice(0, 10) !== dob || dob > today) {
    throw new Error('Enter a valid birth date that is not in the future');
  }
}