import { expect, it } from 'vitest';
import { overdueSmsEligible } from '@/lib/overdue-sms';
const dose = { id: 'd', vaccine: 'MR2', dueDate: '2026-10-20', confirmedBy: 'Nurse', confirmedAt: '2026-10-01', textApprovedBy: 'Dr Okello', textApprovedFor: '2026-10-20' };
it('sends texts for an opted-in overdue confirmed dose', () => { expect(overdueSmsEligible(dose, '2026-10-28', true, '+256754094458', 'Clinic')).toBe(true); });
it('requires parent opt-in', () => { expect(overdueSmsEligible(dose, '2026-10-28', false, '+256754094458', 'Clinic')).toBe(false); });
it('stops overdue texts when a dose is given', () => { expect(overdueSmsEligible({ ...dose, givenOn: '2026-10-21' }, '2026-10-28', true, '+256754094458', 'Clinic')).toBe(false); });
it('does not text unconfirmed doses', () => { expect(overdueSmsEligible({ ...dose, confirmedBy: '' }, '2026-10-28', true, '+256754094458', 'Clinic')).toBe(false); });it('does not text without clinician approval', () => { const { textApprovedBy: _a, ...rest } = dose; expect(overdueSmsEligible(rest, '2026-10-28', true, '+256754094458', 'Clinic')).toBe(false); });
it('needs fresh approval after the due date changes', () => { expect(overdueSmsEligible({ ...dose, dueDate: '2026-10-22' }, '2026-10-28', true, '+256754094458', 'Clinic')).toBe(false); });
