import { expect, it } from 'vitest';
import { validateChildRegistration, validateTextOptIn } from '@/lib/parent-consent';

it('requires a valid parent phone to opt into overdue texts', () => {
  expect(validateTextOptIn(true, '+256776886279')).toBe(true);
  expect(() => validateTextOptIn(true, '')).toThrow();
  expect(() => validateTextOptIn(true, '123')).toThrow();
});
it('lets a parent withdraw consent even without a phone', () => {
  expect(validateTextOptIn(false, '')).toBe(false);
});
it('requires a real nonfuture birth date when registering a child', () => {
  expect(() => validateChildRegistration('Child', '2026-10-28', '2026-10-28')).not.toThrow();
  expect(() => validateChildRegistration('Child', '2026-10-29', '2026-10-28')).toThrow();
  expect(() => validateChildRegistration('Child', '2026-02-30', '2026-10-28')).toThrow();
  expect(() => validateChildRegistration('', '2025-01-01', '2026-10-28')).toThrow();
});